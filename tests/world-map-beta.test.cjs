const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../web/world-map-beta.html'),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
assert(script,'world beta ES module must exist');
class Elem{
 constructor(){this.children=[];this.style={};this.classList={toggle(){}};this.files=[];this.textContent='';this.value='';this.handlers={};}
 replaceChildren(){this.children=[]}
 append(...x){this.children.push(...x)}
 addEventListener(k,fn){this.handlers[k]=fn}
 setAttribute(k,v){this[k]=v}
 click(){}
}
const els=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(x=>[x[1],new Elem()]));
const document={getElementById:id=>els[id],createElement:()=>new Elem()};
class Bounds{constructor(){this.coords=[];}extend(coords){this.coords.push(coords);return this;}}
class Map{
 constructor(opts){this.opts=opts;this.events={};this.styles=[opts.style];this.zoom=10;}
 addControl(){}
 on(event,handler){this.events[event]=handler}
 fitBounds(bounds,options){this.bounds=bounds.coords;this.options=options}
 getZoom(){return this.zoom}
 flyTo(){}
 setStyle(style){this.styles.push(style)}
}
class Marker{
 constructor(opts){this.element=opts.element;this.events={};}
 setLngLat(coords){this.coords=coords;return this}
 addTo(){return this}
 on(n,cb){this.events[n]=cb;return this}
 getElement(){return this.element}
 getLngLat(){return{lng:this.coords[0],lat:this.coords[1]}}
 remove(){}
}
const fakeGL={Map,Marker,NavigationControl:class{},LngLatBounds:Bounds};
async function main(){
 const source=script.replace(
   "await import('https://unpkg.com/maplibre-gl@6.15.0/dist/maplibre-gl.mjs')",
   "await Promise.resolve(fakeGL)");
 assert.notEqual(source,script,'MapLibre import stub found');
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 const evalScript=new AsyncFunction('document','fakeGL','structuredClone','setTimeout','Blob','URL','confirm',source+
   '\nreturn {getProject:()=>project,map,markers,STYLES};');
 const model=await evalScript(document,fakeGL,x=>JSON.parse(JSON.stringify(x)),setTimeout,Blob,
   {createObjectURL(){return 'blob:unit'},revokeObjectURL(){}},()=>true);
 model.map.events.load();
 const before=model.getProject().sites;
 assert.equal(before[0].name,'Le Pradel');
 assert.equal(before[1].name,'Labruguière');
 assert.equal(before[0].lat,43.69992);
 assert.equal(before[1].lat,43.538435);
 assert.equal(model.markers.size,2);
 assert.deepEqual(model.map.bounds,[[2.384259,43.69992],[2.262519,43.538435]]);
 assert(model.map.styles[0].includes('openfreemap.org/styles/positron'));
 const original=JSON.stringify(model.getProject().sites);
 els.basemap.onchange({target:{value:'liberty'}});
 assert.equal(model.map.styles.at(-1),model.STYLES.liberty);
 assert.equal(JSON.stringify(model.getProject().sites),original,'switching basemap must not edit site positions');
 els.addRelay.onclick();model.map.events.click({lngLat:{lat:43.66,lng:2.34}});
 assert.equal(model.getProject().sites.length,3);
 els.resetDemo.onclick();
 assert.equal(model.getProject().sites.length,2);
 assert.equal(model.getProject().sites[0].lat,43.69992);
 els.basemap.onchange({target:{value:'bright'}});
 for(let i=0;i<3;i++)model.map.events.error({error:{message:'Failed to fetch'}});
 assert.equal(els.basemap.value,'white','offline fallback after repeated errors');
 console.log('PASS world-map beta: Tarn defaults, fit, markers, basemap switching, relay, reset, offline fallback');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
