const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const code=fs.readFileSync(path.resolve(__dirname,'../web/radio.js'),'utf8');
const core=code.replace(/\brfPanel\(\);\s*$/,'');
assert(core!==code,'Radio UI bootstrap marker absent');
const rad=Math.PI/180;
const dist=(a,b)=>{const dlat=(a.lat-b.lat)*rad,dlon=(a.lon-b.lon)*rad;const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(h)));};
const conf={terrain:{},sites:[]};
function setup(heightAt){
 const ctx={state:conf,dist,rad,heightAt,project:(lon,lat)=>({x:lon*1e3,y:lat*1e3}),svg:()=>{},$:()=>{},site:()=>{},relayList:()=>{},range:(v,a,b)=>Math.max(a,Math.min(b,v)),setTimeout,console};
 vm.createContext(ctx);vm.runInContext(core+'\nthis.api={RADIO,rfTerrainLink,rfBuildWedges,rfWedge,rfPoint};',ctx,{timeout:5000});
 return ctx.api;
}
const a={lat:43.7,lon:2.38,height:10},b={lat:43.68,lon:2.39,height:8};
const plain=setup(()=>100),flat=plain.rfTerrainLink(a,b);
assert(flat.dbm>-130,'flat synthetic example should exceed default sensitivity');
const ridge=setup((lat)=>Math.abs(lat-43.69)<.001?500:100).rfTerrainLink(a,b);
assert(ridge.dbm<flat.dbm-20,'terrain ridge must attenuate');
const unknown=setup(()=>null).rfTerrainLink(a,b);
assert.equal(unknown,null,'missing terrain must never become coverage');
const q=plain.rfBuildWedges(a,Array.from({length:4},()=>Array(4).fill(100)),{rays:4,step:1});
assert.equal(q.valid,4);
assert(q.paths[-130].startsWith('M'));
const missing=plain.rfBuildWedges(a,Array.from({length:4},()=>Array(4).fill(null)),{rays:4,step:1});
assert.equal(missing.valid,0);
assert.equal(missing.paths[-130].length,0);
console.log('PASS experimental RF on synthetic terrain: FSPL, ridge attenuation, unknown DEM, coverage thresholds');
