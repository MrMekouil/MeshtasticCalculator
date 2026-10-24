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
for(const v of [-160,-148,-140,-130,-117,-109,-80,-40])assert.equal(parseThreshold(v),v);
for(const v of [-170,-20,'',null,'-114.5','invalid'])assert.equal(parseThreshold(v),null);
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
assert.equal(presets().length,27);
assert(presets().includes(-125)&&presets().includes(-117)&&presets().includes(-109));
// Full 13-bin RSSI scale is rendered only from existing samples.
const gc=radio.slice(radio.indexOf('const RF_GRADIENT_COLORS='),radio.indexOf('// Display-only geometry from saved RSSI samples;'));
const gradient=new Function('rfWedge',gc+'return {rfGradientLevels,rfGradientPaths,rfGradientColor};')((_node,a,b)=>'W'+a+':'+b+';');
assert.equal(gradient.rfGradientLevels().length,13);
assert.equal(gradient.rfGradientLevels()[0],-160);
assert.equal(gradient.rfGradientLevels().at(-1),-40);
assert.notEqual(gradient.rfGradientColor(-140),gradient.rfGradientColor(-70));
const samples={rays:2,step:1,signals:[new Float32Array([0,-145,-135,-115,-95,-49,NaN,-80]),null]};
const colors=gradient.rfGradientPaths({},samples,-150);
for(const v of [-150,-140,-120,-100,-50])assert(colors[v].includes('W'));
assert.equal(colors[-80],'','NoData must not turn into a received-signal polygon');
const filtered=gradient.rfGradientPaths({},samples,-90);
assert.equal(filtered[-150],'');assert(filtered[-50].includes('W'));
console.log('PASS fixed dBm presets, full RSSI color scale from sampled terrain, imports and NoData');
