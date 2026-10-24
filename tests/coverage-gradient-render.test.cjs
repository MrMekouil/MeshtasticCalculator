'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.resolve(__dirname,'../web/app.js'),'utf8');
const radio=fs.readFileSync(path.resolve(__dirname,'../web/radio.js'),'utf8');
const state={coverageMode:'gradient',plannerVisible:true,threshold:-130,selected:'r1',opacity:.38,
 sites:[{id:'r1',lat:43.7,lon:2.3,height:8}]};
const appHelpers=app.slice(app.indexOf('function coverageMode(){'),app.indexOf('let previewTimer='));
const {coverageMode,parseThreshold,displayTiers,bandOpacity}=new Function('state',appHelpers+'return {coverageMode,parseThreshold,displayTiers,bandOpacity};')(state);
const gradCode=radio.slice(radio.indexOf('const RF_GRADIENT_COLORS='),radio.indexOf('// Display-only geometry from saved RSSI samples;'));
const grad=new Function('rfWedge','$','document',gradCode+
 'return {rfGradientLevels,rfGradientColor,rfGradientPaths,rfGradientScale,rfUpdateGradientLegend};')(
 (_node,a,b)=>'W'+a+':'+b+';',()=>null,{createElement:()=>({})});
const coverage={kind:'srtm-knife-edge',rays:1,step:1,
 paths:{'-130':'Mlegacy'},signals:[new Float32Array([0,-125,-110,-95,-80,-65,NaN,-35])]};
const RADIO={enabled:true,projectionVersion:0,hidden:new Set(),settings:{threshold:-130},
 coverage:new Map([['r1',coverage]]),imports:new Map([['r1',{groups:{'-117':[{}]}}]])};
let rendered=[];const group={replaceChildren:()=>{rendered=[]}};
const src=radio.slice(radio.indexOf('function rfDraw(){'),radio.indexOf('function rfRefreshVisibility(){'));
const draw=new Function('state','RADIO','$','site','rings','nodeOpacity','svg','displayTiers','rfGradientLevels',
 'rfGradientPaths','rfGradientColor','rfGradientScale','rfUpdateGradientLegend','rfLocalLevels','rfPathsFromSignals','coverageMode','bandOpacity',src+'return rfDraw;')(
 state,RADIO,id=>id==='radioLayer'?group:null,id=>state.sites.find(x=>x.id===id),
 ()=> 'Mimport',()=>.38,(_tag,attrs)=>rendered.push(attrs),displayTiers,
 grad.rfGradientLevels,grad.rfGradientPaths,grad.rfGradientColor,grad.rfGradientScale,grad.rfUpdateGradientLegend,
 ()=>[-117],()=>({}),coverageMode,bandOpacity);
const models=()=>rendered.reduce((out,x)=>{(out[x['data-model']]??=[]).push(x);return out;},{});
draw();let found=models();
assert.equal(found['Meshtastic-import'].length,1);
assert.equal(found['Meshtastic-import'][0].fill,'#426cab','Imported coverage retains provenance color');
assert.equal(found['srtm-knife-edge'].length,5);
assert.equal(new Set(found['srtm-knife-edge'].map(x=>x.fill)).size,5);
assert(found['srtm-knife-edge'].every(x=>x.stroke==='none'&&String(x['stroke-width'])==='0'),'No visible spider-web strokes');
assert(found['srtm-knife-edge'].every(x=>x['data-display']==='gradient'));
assert.equal(grad.rfGradientScale(-130,[coverage]).max,-65,'NoData cannot raise RF upper bound');
RADIO.enabled=false;draw();found=models();
assert.equal(found['Meshtastic-import'].length,1);assert.equal(found['srtm-knife-edge'],undefined);
RADIO.enabled=true;state.plannerVisible=false;draw();found=models();
assert.equal(found['Meshtastic-import'],undefined);assert.equal(found['srtm-knife-edge'].length,5);
RADIO.hidden.add('r1');draw();assert.equal(rendered.length,0);
console.log('PASS 5 RSSI colors and no cell strokes; Planner import & controls isolated; NoData-safe scale');
