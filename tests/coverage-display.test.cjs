'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'../web',n),'utf8');
const app=read('app.js'),radio=read('radio.js'),sidebar=read('sidebar.js'),html=read('index.html');
for(const code of [app,radio,sidebar])new Function(code);
assert(html.includes('id="coverageMode"')&&html.includes('value="threshold"')&&html.includes('value="bands"'));
const helperCode=app.slice(app.indexOf('function coverageMode(){'),app.indexOf('let previewTimer='));
const state={coverageMode:'threshold',threshold:-117,opacity:.38,sites:[{id:'pradel'},{id:'labru'},{id:'r1'}],selected:'pradel',
 layer:{pradel:{features:[-130,-117,-109].map(dbm=>({properties:{dbm},geometry:{type:'Polygon'}}))},
        labru:{features:[-130,-118,-109].map(dbm=>({properties:{dbm},geometry:{type:'Polygon'}}))}}};
const {coverageMode,displayTiers,bandOpacity}=new Function('state',helperCode+'return {coverageMode,displayTiers,bandOpacity};')(state);
assert.deepEqual(displayTiers([-130,-117,-109]),[-117]);
assert.deepEqual(displayTiers([-130,-118,-109]),[-118]);
assert.deepEqual(displayTiers([]),[]);
assert.equal(bandOpacity(0,2),1);
state.coverageMode='bands';
assert.deepEqual(displayTiers([-109,-130,-117,-117]),[-117,-109]);
assert.deepEqual(displayTiers([-130,-118,-109]),[-118,-109]);
assert(bandOpacity(0,2)<bandOpacity(1,2));
let drawn=[];
const controls={showPradel:{checked:true},showLabru:{checked:true}};
const drawCode=app.slice(app.indexOf('function drawImported(){'),app.indexOf('function drawEstimate(){'));
const drawImported=new Function('state','$','wipe','nodeOpacity','rings','svg','displayTiers','bandOpacity','coverageMode','globalThis',drawCode+'return drawImported;')(
 state,id=>controls[id]||{},()=>{},()=>.38,()=>'M0Z',(_tag,attr)=>drawn.push(attr),
 displayTiers,bandOpacity,coverageMode,{});
drawImported();
assert.deepEqual(drawn.map(x=>x['data-dbm']),[-117,-109,-118,-109]);
assert(drawn.every(x=>x['data-display']==='bands'));
controls.showPradel.checked=false;drawn=[];drawImported();
assert.equal(drawn.length,2,'The legacy Pradel eye still hides only the Pradel layer');
controls.showPradel.checked=true;state.coverageMode='threshold';drawn=[];drawImported();
assert.deepEqual(drawn.map(x=>x['data-dbm']),[-117,-118]);
state.coverageMode='bands';
const RADIO={enabled:true,hidden:new Set(),imports:new Map([['labru',{groups:{'-130':[{}],'-118':[{}],'-109':[{}]}}]]),
 coverage:new Map([['r1',{kind:'srtm-knife-edge',paths:{'-130':'M0','-117':'M1','-109':'M2'}}]]),settings:{threshold:-117}};
let displayed=[];
const group={replaceChildren:()=>{displayed=[];}};
const radioCode=radio.slice(radio.indexOf('function rfDraw(){'),radio.indexOf('function rfRefreshVisibility(){'));
const rfDraw=new Function('state','RADIO','$','site','displayTiers','bandOpacity','coverageMode','nodeOpacity','rings','svg',radioCode+'return rfDraw;')(
 state,RADIO,id=>id==='radioLayer'?group:null,id=>state.sites.find(n=>n.id===id),
 displayTiers,bandOpacity,coverageMode,()=>.38,()=>'M0Z',(_tag,attr)=>displayed.push(attr));
rfDraw();
assert.deepEqual(displayed.map(x=>x['data-dbm']),[-118,-109,-117,-109]);
RADIO.hidden.add('r1');rfDraw();
assert.deepEqual(displayed.map(x=>x['data-dbm']),[-118,-109]);
RADIO.enabled=false;rfDraw();assert.equal(displayed.length,0);
RADIO.enabled=true;RADIO.hidden.clear();state.coverageMode='threshold';rfDraw();
assert.deepEqual(displayed.map(x=>x['data-dbm']),[-118,-117]);
// Project schema migration: optional coverageMode, fallback for invalid and legacy values.
const restoreCode=app.slice(app.indexOf('async function restore(file){'),app.indexOf('function wire(){'));
const elements=Object.fromEntries(['threshold','coverageMode','coverageOpacity','networkOpacity','rfThreshold','rfOpacity'].map(id=>[id,{value:''}]));
const projectRadio={settings:{}};
let restores=0,status='';
const restore=new Function('state','$','RADIO','preloaded','invalidate','render','globalThis','updateStatus',restoreCode+'return restore;')(
 state,id=>elements[id],projectRadio,{pradel:null,labru:null},()=>{},()=>{restores++;},{},message=>{status=message;});
(async()=>{
 const sites=[{id:'pradel',lat:43,lon:2},{id:'labru',lat:43.1,lon:2.1}];
 assert.equal(await restore({text:async()=>JSON.stringify({format:'MeshtasticCalculator',sites,coverageMode:'bands',threshold:-117})}),true);
 assert.equal(state.coverageMode,'bands');
 assert.equal(elements.coverageMode.value,'bands');
 assert.equal(await restore({text:async()=>JSON.stringify({format:'MeshtasticCalculator',sites,coverageMode:'bogus',threshold:-117})}),true);
 assert.equal(state.coverageMode,'threshold');
 assert.equal(await restore({text:async()=>JSON.stringify({format:'MeshtasticCalculator',sites,threshold:-117})}),true);
 assert.equal(state.coverageMode,'threshold');
 const before=JSON.stringify(state.sites);
 assert.equal(await restore({text:async()=>'{bad JSON'}),false);
 assert.equal(JSON.stringify(state.sites),before);
 assert(status.startsWith('Projet refusé'));
 console.log('PASS CP-UX-DISPLAY-A: existing dBm tiers, render, masks, legacy restore and malformed JSON rejection (simulated DOM)');
})().catch(err=>{console.error(err);process.exitCode=1});
