'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'../web',n),'utf8');
const app=read('app.js'),radio=read('radio.js'),world=read('world-map-adapter.js'),html=read('index.html');
for(const script of [app,radio,world])new Function(script);
assert(html.includes('<select id="threshold">')&&html.includes('<option value="-117" selected>'));
assert(world.includes('RADIO.projectionVersion=(RADIO.projectionVersion||0)+1;'));
const state={threshold:-117,coverageMode:'threshold'};
const core=app.slice(app.indexOf('function coverageMode(){'),app.indexOf('let previewTimer='));
const {parseThreshold,coverageMode,displayTiers}=new Function('state',core+'return {parseThreshold,coverageMode,displayTiers};')(state);
for(const v of [-160,-148,-140,-130,-117,-109,-80,-40,-20,0])assert.equal(parseThreshold(v),v);
for(const v of [-170,5,'',null,'-114.5','invalid'])assert.equal(parseThreshold(v),null);
assert.deepEqual(displayTiers([-130,-118,-109],-117),[-118]);
assert.deepEqual(displayTiers([-130,-118,-109],-70),[],'No extrapolation of imported source');
assert.deepEqual(displayTiers([-118],-117),[-118],'Nearest exported tier within 1 dB remains labeled');
assert.deepEqual(displayTiers([-118],-114),[],'Do not extrapolate beyond 2 dB');
const radioCore=radio.slice(radio.indexOf('function rfLocalLevels('),radio.indexOf('function rfWedge('));
const {rfLocalLevels,rfPathsFromSignals}=new Function('parseThreshold','coverageMode','rfWedge',radioCore+'return {rfLocalLevels,rfPathsFromSignals};')(
 parseThreshold,coverageMode,(_site,start,end)=>'W'+start+':'+end+';');
assert.deepEqual(rfLocalLevels(-140),[-140]);
state.coverageMode='bands';assert.deepEqual(rfLocalLevels(-140),[-140,-130,-120,-110,-100]);
const result=rfPathsFromSignals({lat:43.7,lon:2.3,height:8},{rays:2,step:1,signals:[
 new Float32Array([0,-145,-135,-125,NaN,-90]),null]},[-140,-130,-120]);
assert(result[-140].includes('W')&&result[-130].includes('W'));
assert.equal(result[-120],'','NoData may not reconnect a coverage run');
// Preset selector, including old -117/-109 dBm choices and -125 dBm.
const presetCode=app.slice(app.indexOf('function coverageMode(){'),app.indexOf('function displayTiers('));
const presets=new Function('state','$','document',presetCode+'return thresholdPresets;')({coverageMode:'gradient'},()=>({}),{});
assert.equal(presets().length,35);
assert(presets().includes(-125)&&presets().includes(-117)&&presets().includes(-109));
// Five classes over the actually computed strongest value (not artificial 0 dBm).
const gc=radio.slice(radio.indexOf('const RF_GRADIENT_COLORS='),radio.indexOf('// Display-only geometry from saved RSSI samples;'));
const grad=new Function('rfWedge','$','document',gc+
 'return {rfGradientLevels,rfGradientScale,rfGradientClass,rfGradientTicks,rfGradientPaths,rfGradientColor};')(
 (_node,a,b)=>'W'+a+':'+b+';',()=>null,{createElement:()=>({})});
assert.deepEqual(grad.rfGradientLevels(),[0,1,2,3,4]);
const samples={rays:2,step:1,signals:[new Float32Array([0,-125,-110,-95,-80,-65,NaN,-20]),null]};
const scale=grad.rfGradientScale(-130,[samples]);
assert.deepEqual(scale,{min:-130,max:-65},'NoData must not raise the maximum');
assert.equal(grad.rfGradientTicks(scale).length,5);
assert.equal(grad.rfGradientTicks(scale)[0],-130);
assert.equal(grad.rfGradientTicks(scale)[4],-65);
const classes=grad.rfGradientPaths({},samples,-130,scale);
for(let k=0;k<5;k++)assert(classes[k].includes('W'),'Class '+k+' should have real data');
assert.notEqual(grad.rfGradientColor(0),grad.rfGradientColor(4));
assert.equal(grad.rfGradientClass(-145,scale),null);
const filteredScale=grad.rfGradientScale(-90,[samples]);
assert.deepEqual(filteredScale,{min:-90,max:-65});
const filtered=grad.rfGradientPaths({},samples,-90,filteredScale);
assert.equal(filtered[0],''===filtered[0]?'':'','Expected one class may be empty');
// NoData is not reconnected even when a strong finite RSSI follows it.
const noData=grad.rfGradientPaths({},samples,-130,scale);
assert.equal((noData[4].match(/W/g)||[]).length,1);
console.log('PASS fixed presets and five real-RSSI classes, NoData ceiling and threshold filter');
