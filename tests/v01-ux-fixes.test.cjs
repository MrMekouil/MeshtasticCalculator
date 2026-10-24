const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'../web/',n),'utf8');
const app=read('app.js'),radio=read('radio.js'),world=read('world-map-adapter.js'),html=read('index.html');
for(const code of [app,radio,world])new Function(code);

// A and B must not be deleted; cancelling must not change anything.
const deletion=app.slice(app.indexOf('function removeRelay(id){'),app.indexOf('function renderSites(){'));
assert(deletion.startsWith('function removeRelay'));
let allow=false,renderCount=0,invalidations=0;
const state={sites:[{id:'pradel',type:'home',name:'A'},{id:'r1',type:'relay',name:'R1'},
 {id:'labru',type:'home',name:'B'}],selected:'r1',coverageOpacities:{r1:.3}};
const coverage=new Map([['r1',{}]]),imports=new Map([['r1',{}]]),hidden=new Set(['r1']);
const RADIO={versions:new Map(),coverage,imports,hidden,optimToken:0,suggestion:{id:'r1'}};
const els={rfApply:{disabled:false},rfCandidate:{textContent:''}};
const site=id=>state.sites.find(x=>x.id===id);
const remove=new Function('state','site','confirm','clearTimeout','preciseRecomputeTimer','RADIO',
 '$','invalidate','render','rfDraw','rfSummary','rfRefreshVisibility','updateStatus',
 deletion+'return removeRelay;')(
 state,site,()=>allow,()=>{},null,RADIO,id=>els[id]||null,()=>invalidations++,
 ()=>renderCount++,()=>{},()=>{},()=>{},()=>{});
assert.equal(remove('pradel'),false);
assert.equal(remove('r1'),false);
assert.equal(state.sites.length,3);
allow=true;
assert.equal(remove('r1'),true);
assert.deepEqual(state.sites.map(x=>x.id),['pradel','labru']);
assert.equal(state.selected,'pradel');
assert(!coverage.has('r1')&&!imports.has('r1')&&!hidden.has('r1'));
assert.equal(state.coverageOpacities.r1,undefined);
assert.equal(RADIO.suggestion,null);
assert(els.rfApply.disabled);
assert.equal(renderCount,1);assert.equal(invalidations,1);

// Candidate remains separate from active node and is discarded when source position changes.
const candidate=app.slice(app.indexOf('function renderCandidatePreview(){'),app.indexOf('function renderLinks(){'));
assert(candidate.startsWith('function renderCandidatePreview'));
const nodes=[{id:'r2',lat:43.6,lon:2.4}];
const proposed={suggestion:{id:'r2',original:{lat:43.6,lon:2.4},best:{lat:43.7,lon:2.5}}};
let drawn=[];
const svg=(tag,attributes)=>{const x={tag,attributes,textContent:''};drawn.push(x);return x;};
const preview=new Function('state','RADIO','site','project','svg','$',
 candidate+'return renderCandidatePreview;')(
 {sites:nodes},proposed,id=>nodes.find(n=>n.id===id),
 (lon,lat)=>({x:lon*100,y:lat*100}),svg,id=>id);
preview();
assert(drawn.some(x=>x.tag==='line')&&drawn.some(x=>x.tag==='text'));
assert.equal(nodes[0].lat,43.6);
nodes[0].lat=43.61;const count=drawn.length;preview();assert.equal(drawn.length,count);

// Parse invalid project BEFORE mutating anything.
const wrapper=radio.slice(radio.indexOf('const oldRestore=restore;'),
 radio.indexOf(' rfSummary();rfRefreshVisibility();\n rfRestoreTiles();'));
assert(wrapper.startsWith('const oldRestore=restore;'));
let calls=0,status='';
const restore=new Function('restore','updateStatus','RADIO','$','site','rfDraw',
 'rfSummary','rfRefreshVisibility','renderMarkers',wrapper+'return restore;')(
 async()=>{calls++;return true;},msg=>status=msg,RADIO,()=>null,site,
 ()=>{},()=>{},()=>{},()=>{});
async function run(){
 assert.equal(await restore({text:async()=>'{bad json'}),false);
 assert.equal(calls,0);
 assert(status.startsWith('Projet refusé'));
 assert.equal(await restore({text:async()=>JSON.stringify({format:'MeshtasticCalculator',sites:[]})}),true);
 assert.equal(calls,1);

 // The map intensity must apply to the MapLibre canvas, not the overlaid RF polygons.
 assert(world.includes('map.getCanvas()')&&world.includes('canvas.style.opacity'));
 assert(app.includes('world.setIntensity(state.baseOpacity)'));
 assert(html.includes('id="baseOpacity" type="range" min="0" max="100" value="100"'));

 // LOS is kept in lat/lon and is reprojected; it must not disappear on pan.
 assert(app.includes('state.estimate={id:p.id,path,cells'));
 assert(world.includes('drawEstimate();'));
 assert(!world.includes('if(state.estimate)state.estimate=null'));

 // A new relay can trigger RF using existing DEM; without DEM don't invent data.
 assert(app.includes("if(state.terrain&&typeof rfCalculateSite==='function')"));
 assert(radio.includes('hidden:new Set(),enabled:true'));
 assert(radio.includes('id="rfShow" type="checkbox" checked'));
 console.log('PASS V0.1 checkpoint: relay deletion/cancel, candidate, bad JSON, map intensity, LOS and RF states');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
