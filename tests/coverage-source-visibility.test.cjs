'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../web/app.js'),'utf8');
const radio=fs.readFileSync(path.join(__dirname,'../web/radio.js'),'utf8');
new Function(app);new Function(radio);
const state={plannerVisible:true,coverageMode:'threshold',threshold:-117,opacity:.38,selected:'pradel',
 sites:[{id:'pradel'},{id:'labru'},{id:'r1'}],
 layer:{pradel:{features:[{properties:{dbm:-117},geometry:{type:'Polygon'}}]},
        labru:{features:[{properties:{dbm:-117},geometry:{type:'Polygon'}}]}}};
const helper=app.slice(app.indexOf('function coverageMode(){'),app.indexOf('let previewTimer='));
const {coverageMode,displayTiers,bandOpacity}=new Function('state',helper+'return {coverageMode,displayTiers,bandOpacity};')(state);
const RADIO={enabled:true,hidden:new Set(),imports:new Map([['pradel',{groups:{'-117':[{}]}}]]),
 coverage:new Map([['pradel',{kind:'srtm-knife-edge',paths:{'-117':'M1'}}],['r1',{kind:'srtm-knife-edge',paths:{'-117':'M2'}}]]),
 settings:{threshold:-117}};
const cp={id:'coveragePradel'},cl={id:'coverageLabru'};
const controls={coveragePradel:cp,coverageLabru:cl,showPradel:{checked:true},showLabru:{checked:true}};
const legacy={coveragePradel:[],coverageLabru:[]};let drawn=[];
const drawLegacyCode=app.slice(app.indexOf('function drawImported(){'),app.indexOf('function drawEstimate(){'));
const drawImported=new Function('state','$','wipe','nodeOpacity','rings','svg','displayTiers','bandOpacity','coverageMode','globalThis','RADIO',
 drawLegacyCode+'return drawImported;')(state,id=>controls[id],id=>{legacy[id]=[]},()=>.38,()=>'M',
 (_tag,attrs,group)=>legacy[group.id].push(attrs),displayTiers,bandOpacity,coverageMode,{},RADIO);
const group={replaceChildren:()=>{drawn=[]}};
const rfCode=radio.slice(radio.indexOf('function rfDraw(){'),radio.indexOf('function rfRefreshVisibility(){'));
const rfDraw=new Function('state','RADIO','$','site','nodeOpacity','rings','svg','displayTiers','bandOpacity','coverageMode',
 rfCode+'return rfDraw;')(state,RADIO,id=>id==='radioLayer'?group:null,id=>state.sites.find(x=>x.id===id),
 ()=>.38,()=>'M',(_tag,attrs)=>drawn.push(attrs),displayTiers,bandOpacity,coverageMode);
const snapshot=()=>{drawImported();rfDraw();return [
 legacy.coveragePradel.length+legacy.coverageLabru.length,
 drawn.filter(x=>x['data-model']==='Meshtastic-import').length,
 drawn.filter(x=>x['data-model']==='srtm-knife-edge').length];};
const cases=[
 [()=>{},[2,1,2]],
 [()=>{state.plannerVisible=false},[0,0,2]],
 [()=>{RADIO.enabled=false},[0,0,0]],
 [()=>{state.plannerVisible=true},[2,1,0]],
 [()=>{RADIO.enabled=true;RADIO.hidden.add('pradel')},[1,0,1]],
 [()=>{RADIO.hidden.clear()},[2,1,2]]];
for(const [apply,expected] of cases){apply();assert.deepEqual(snapshot(),expected);}
assert.equal(RADIO.imports.size,1);assert.equal(RADIO.coverage.size,2);
const save=app.slice(app.indexOf('function save(){'),app.indexOf('async function restore(file){'));
assert(save.includes('plannerVisible:state.plannerVisible!==false'));
assert(save.includes("experimentalVisible:typeof RADIO!=='undefined'?RADIO.enabled:true"));
const restoreSource=app.slice(app.indexOf('async function restore(file){'),app.indexOf('function wire(){'));
const inputs=Object.fromEntries(['plannerShow','rfShow','rfThreshold','rfOpacity','threshold','coverageOpacity','coverageMode','networkOpacity'].map(id=>[id,{checked:true,value:''}]));
const restorer=new Function('state','$','RADIO','preloaded','invalidate','render','globalThis','updateStatus',
 restoreSource+'return restore;')(state,id=>inputs[id],RADIO,{pradel:null,labru:null},()=>{},()=>{},{},()=>{});
(async()=>{
 const sites=[{id:'pradel',lat:43,lon:2},{id:'labru',lat:44,lon:3}];
 for(const [flags,a,b] of [[{plannerVisible:false,experimentalVisible:true},false,true],
 [{plannerVisible:true,experimentalVisible:false},true,false],[{plannerVisible:false,experimentalVisible:false},false,false],[{},true,true]]){
  assert.equal(await restorer({text:async()=>JSON.stringify({format:'MeshtasticCalculator',sites,...flags})}),true);
  assert.equal(state.plannerVisible,a);assert.equal(RADIO.enabled,b);
  assert.equal(inputs.plannerShow.checked,a);assert.equal(inputs.rfShow.checked,b);
 }
 const before=JSON.stringify(state.sites);
 assert.equal(await restorer({text:async()=>'{bad JSON'}),false);
 assert.equal(JSON.stringify(state.sites),before);
 console.log('PASS independent Planner / local RF toggles, per-node visibility, data retention and legacy JSON migration');
})().catch(e=>{console.error(e);process.exitCode=1});
