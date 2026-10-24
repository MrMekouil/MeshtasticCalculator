const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.resolve(__dirname,'../web/app.js'),'utf8');
const a=app.indexOf('function renderSites(){'),b=app.indexOf('function renderEditor(){',a);
assert(a>=0&&b>a);
class El{constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.checked=true;}append(...x){this.children.push(...x)}setAttribute(k,v){this.attributes[k]=v}}
const registry={
 sites:{children:[],replaceChildren(){this.children=[]},append(x){this.children.push(x)}},
 relayCount:{textContent:''},projectTitle:{textContent:''},
 showPradel:{checked:true},showLabru:{checked:true}
};
const state={sites:[{id:'pradel',type:'home',name:'Le Pradel',height:10},
 {id:'r1',type:'relay',name:'Relais 1',height:8},
 {id:'labru',type:'home',name:'Labruguière',height:8}],selected:'pradel'};
const RADIO={hidden:new Set()};
let drawImported=0,drawLocal=0;
const site=id=>state.sites.find(x=>x.id===id);
const run=new Function('state','$','document','RADIO','site','relayList','drawImported',
 'rfDraw','renderMarkers','renderEditor',app.slice(a,b)+'\nreturn renderSites;')(
  state,id=>registry[id],{createElement:tag=>new El(tag)},RADIO,site,
  ()=>state.sites.filter(x=>x.type==='relay'),()=>drawImported++,
  ()=>drawLocal++,()=>{},()=>{});
run();
assert.equal(registry.sites.children.length,3);
const relayEye=registry.sites.children[1].children[1];
relayEye.onclick({preventDefault(){},stopPropagation(){}});
assert(RADIO.hidden.has('r1'));
assert.equal(drawLocal,1);assert.equal(drawImported,1);
const pradelEye=registry.sites.children[0].children[1];
pradelEye.onclick({preventDefault(){},stopPropagation(){}});
assert.equal(registry.showPradel.checked,false);
assert(RADIO.hidden.has('pradel'));
const labruEye=registry.sites.children[2].children[1];
labruEye.onclick({preventDefault(){},stopPropagation(){}});
assert.equal(registry.showLabru.checked,false);
assert(RADIO.hidden.has('labru'));
assert.equal(state.sites.length,3,'Visibility changes must never remove nodes');
console.log('PASS independent eyes: legacy and RF layers, no site deletion');
