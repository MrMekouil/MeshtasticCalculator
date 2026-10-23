const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'../web/',name),'utf8');
const html=read('index.html'),app=read('app.js'),radio=read('radio.js'),adapter=read('world-map-adapter.js');
const scriptOrder=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(scriptOrder,[
 'data/coverages.local.js','app.js','mesh-resilience.js','radio.js','world-map-adapter.js'
]);
assert(html.includes('id="worldMap"'),'Single unified world map exists in main entrypoint');
assert(!html.includes('href="world-map-beta.html"'),'No separate beta navigation');
assert(html.includes('id="coveragePradel"')&&html.includes('id="coverageLabru"'),'Original imports remain');
assert(html.includes('id="importDem"'),'SRTM import retained');
assert(html.includes('id="precisionStep"'),'Precision editor retained');
assert(radio.includes('<input type="checkbox" id="rfRedundancy">'),'Redundancy is opt-in');
assert(!radio.includes('id="rfRedundancy" checked'),'Redundancy must never be on by default');
new Function(app);new Function(radio);new Function(adapter);
const bootstrap=app.indexOf('grid();wire();render();updateStatus(');
assert(bootstrap>0);
const ctx={structuredClone:x=>JSON.parse(JSON.stringify(x)),Math,console};
vm.createContext(ctx);vm.runInContext(app.slice(0,bootstrap),ctx,{timeout:5000});
const p0=vm.runInContext('project(2.3,43.6)',ctx);
assert(Number.isFinite(p0.x)&&Number.isFinite(p0.y));
const calls=[];
class Bounds{constructor(){this.coords=[]}extend(p){this.coords.push(p)}}
ctx.MeshtasticWorldMap={
 lib:{LngLatBounds:Bounds},
 map:{
  project([lon,lat]){return{x:lon*300,y:lat*300}},
  unproject([x,y]){return{lng:x/300,lat:y/300}},
  fitBounds(b,o){calls.push(['fit',b.coords,o])},
  getZoom(){return 11},
  zoomTo(z,o){calls.push(['zoom',z])},
  easeTo(o){calls.push(['focus',o])},
  getCenter(){return{lng:2.31,lat:43.65}}
 }
};
const p1=vm.runInContext('project(2.3,43.6)',ctx);
assert.equal(p1.x,690);assert.equal(p1.y,13080);
const inverse=vm.runInContext('unproject(690,13080)',ctx);
assert(Math.abs(inverse.lon-2.3)<1e-10&&Math.abs(inverse.lat-43.6)<1e-10);
vm.runInContext('fitSites();zoom(.5);',ctx);
assert.equal(calls[0][0],'fit');assert.equal(calls[1][0],'zoom');
assert.deepEqual(calls[0][1],[[2.384259,43.69992],[2.262519,43.538435]]);
assert.equal(calls[1][1],12);
console.log('PASS unified app structure and world projected coordinates');
