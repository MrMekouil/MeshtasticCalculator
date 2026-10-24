const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.resolve(__dirname,'../web/',file),'utf8');
const html=read('index.html'),sidebar=read('sidebar.js'),app=read('app.js'),radio=read('radio.js');
new Function(sidebar);new Function(app);new Function(radio);
assert(html.includes('src="sidebar.js"'));
assert(html.includes('value="-117" selected'));
assert(!html.includes('value="-118" selected'));
assert(radio.includes('hidden:new Set(),enabled:false'),'unvalidated local model off by default');
assert(!radio.includes('<input id="rfShow" type="checkbox" checked>'));
class Node{
 constructor(id='',tag='div'){
  this.id=id;this.tag=tag;this.children=[];this.hidden=false;this.className='';
  this.value='';this.checked=true;this.dataset={};this.attributes={};
  this.firstChild={textContent:''};this.classList={add(){},toggle(){}};
 }
 append(...x){this.children.push(...x)}
 prepend(...x){this.children.unshift(...x)}
 setAttribute(k,v){this.attributes[k]=String(v)}
 addEventListener(k,fn){this['on'+k]=fn}
 querySelectorAll(sel){return sel==='[data-tab]'?this.children.filter(x=>x.dataset?.tab):[]}
 querySelector(sel){const m=sel.match(/data-tab="([^"]+)"/);return this.children.find(x=>x.dataset?.tab===m?.[1]);}
 closest(tag){return tag==='section'?this.section:tag==='label'?this.label:null}
 insertAdjacentElement(_,x){this.inserted=x}
 replaceChildren(...x){this.children=[...x]}
 focus(){}
}
const aside=new Node('aside');
const mapStack=new Node('mapStack');
const sections=Object.fromEntries(['network','editor','coverage','radio','terrain','map'].map(k=>[k,new Node(k,'section')]));
const findSection={sites:'network',pointName:'editor',coverageSource:'coverage',radioSection:'radio',importDem:'terrain',base:'map'};
const els={};
for(const [id,key] of Object.entries(findSection)){els[id]=new Node(id);els[id].section=sections[key];}
for(const id of ['rfOptimize','coverageOpacity','rfOpacity','threshold','showPradel','showLabru','rfVisibility']){
 els[id]=new Node(id);
}
els.rfOptimize.closest=tag=>tag==='details'?new Node('opt','details'):null;
for(const id of ['coverageOpacity','rfOpacity','threshold','showPradel','showLabru'])els[id].label=new Node(id+'label','label');
els.mapStack=mapStack;
const get=id=>els[id]||null;
const document={querySelector:query=>query==='main > aside'?aside:null,createElement:tag=>new Node('',tag)};
const data=dbm=>({type:'FeatureCollection',features:[{properties:{dbm}}]});
const state={threshold:-117,opacity:.38,layer:{pradel:data(-118),labru:data(-110)}};
const global={};let redraws=0;
new Function('document','$','state','site','globalThis','drawImported','drawEstimate','rfDraw',sidebar)(
 document,get,state,id=>({name:id==='pradel'?'Le Pradel':'Labruguière'}),global,
 ()=>redraws++,()=>{},()=>redraws++);
const panes=aside.children.filter(c=>c.className==='sidebar-pane');
assert.equal(panes.length,4);
assert.equal(panes.filter(x=>!x.hidden).length,1);
assert.equal(panes[0].id,'sidebar-pane-network');
assert.equal(panes[0].children.length,1,'Point tab keeps only node editor');
global.MeshtasticSidebar.activate('coverage');
assert.equal(panes.filter(x=>!x.hidden)[0].id,'sidebar-pane-coverage');
const legend=els.threshold.label.inserted.children.map(x=>x.textContent);
assert(legend.some(s=>s?.includes('Le Pradel : -118 dBm')));
assert(legend.some(s=>s?.includes('Labruguière : -110 dBm')));
assert.equal(mapStack.children.length,2,'network dock and map corner selectors');
assert.equal(mapStack.children[0].id,'networkDock');
assert.equal(mapStack.children[1].id,'mapQuick');
const slider=els.sites.inserted.children[1].children[0];
slider.value='64';slider.oninput();
assert.equal(state.opacity,.64);
assert.equal(els.coverageOpacity.value,'64');
assert.equal(els.rfOpacity.value,'64');
assert.equal(redraws,2);
assert.equal(els.showPradel.label.hidden,true);
assert.equal(els.showLabru.label.hidden,true);
assert.equal(els.rfVisibility.hidden,true);
console.log('PASS compact sidebar: four tabs, provenance, opacity sync, no redundant toggles');
