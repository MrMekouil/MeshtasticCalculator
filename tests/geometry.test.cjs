const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../web/app.js'), 'utf8');
const bootstrap = 'grid();wire();render();updateStatus(';
assert(source.includes(bootstrap), 'Application bootstrap marker missing');
const core = source.slice(0, source.lastIndexOf(bootstrap));
const ctx = { structuredClone: x => JSON.parse(JSON.stringify(x)), setTimeout, console };
vm.runInNewContext(core + '\nthis.api={project,unproject,geometryData,heightAt,clearLOS,state,QUALITY};',ctx,{timeout:5000});
const {project,unproject,geometryData,clearLOS,state,QUALITY}=ctx.api;
const point=project(2.384259,43.69992),back=unproject(point.x,point.y);
assert(Math.abs(back.lon-2.384259)<1e-10);
assert(Math.abs(back.lat-43.69992)<1e-10);
assert(QUALITY.fine.rays>QUALITY.normal.rays&&QUALITY.normal.rays>QUALITY.quick.rays);
const n=1201,buf=new ArrayBuffer(n*n*2),dv=new DataView(buf);
for(let i=0;i<n*n;i++)dv.setInt16(i*2,100,false);
state.terrain=geometryData(buf,'N43E002.hgt');
const a={lat:43.7,lon:2.38,height:10},b={lat:43.68,lon:2.39,height:8};
assert.equal(clearLOS(a,b),true,'flat terrain open');
assert.equal(clearLOS(a,{lat:42.9,lon:2.3}),null,'missing DEM stays unknown');
for(let r=0;r<n;r++){
 const lat=44-r/(n-1);if(Math.abs(lat-43.69)>.001)continue;
 for(let c=0;c<n;c++){const lon=2+c/(n-1);if(Math.abs(lon-2.385)<.002)dv.setInt16((r*n+c)*2,300,false);}
}
assert.equal(clearLOS(a,b),false,'ridge blocks');
assert.throws(()=>geometryData(new ArrayBuffer(12),'N43E002.hgt'));
console.log('PASS geometry synthetic: projection, precision, LOS, ridge, missing DEM, malformed HGT');
