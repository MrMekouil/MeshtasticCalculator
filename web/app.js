'use strict';
/* MeshtasticCalculator V0.1 — deliberately separates provenance: imported RF vs local geometric visibility. */
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const BASE={lon:2.04,lat:43.87,s:21};
const HOME=[
 {id:'pradel',type:'home',name:'Le Pradel',lat:43.69992,lon:2.384259,height:10},
 {id:'labru',type:'home',name:'Labruguière',lat:43.538435,lon:2.262519,height:8}
];
const state={sites:structuredClone(HOME),selected:'pradel',threshold:-118,layer:{pradel:null,labru:null},quality:'normal',opacity:.38,
 terrain:null,estimate:null,base:'white',baseOpacity:.36,view:{x:0,y:0,w:1130,h:930},drag:null,token:0};
const status=(s)=>{$('status').textContent=s;};
const rad=Math.PI/180;
const project=(lon,lat)=>({x:(lon-BASE.lon)*Math.cos(43.7*rad)*111*BASE.s,y:(BASE.lat-lat)*111*BASE.s});
const unproject=(x,y)=>({lon:BASE.lon+x/(Math.cos(43.7*rad)*111*BASE.s),lat:BASE.lat-y/(111*BASE.s)});
const site=id=>state.sites.find(s=>s.id===id);
const relayList=()=>state.sites.filter(s=>s.type==='relay');
const dist=(a,b)=>{const dlat=(a.lat-b.lat)*rad,dlon=(a.lon-b.lon)*rad,k=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(k)));};
function svg(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v)); if(parent)parent.append(e);return e;}
function wipe(id){$(id).replaceChildren();}
function range(v,a,b){return Math.max(a,Math.min(b,v));}
function updateStatus(s){status(s);$('mapHint').textContent=s;}
function setView(){const v=state.view;$('map').setAttribute('viewBox',[v.x,v.y,v.w,v.h].join(' '));}
function localXY(event){const p=$('map').createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform($('map').getScreenCTM().inverse());}
function renderSites(){
 const list=$('sites');list.replaceChildren();
 state.sites.forEach(p=>{
   const b=document.createElement('button');b.className='site'+(state.selected===p.id?' active':'');
   const name=document.createElement('span');name.textContent=(p.type==='home'?'⌂ ':'⌁ ')+p.name;
   const info=document.createElement('em');info.textContent=p.type==='home'?'Station fixe':p.height+' m · relais';
   b.append(name,info);b.onclick=()=>{state.selected=p.id;renderSites();renderMarkers();renderEditor();};list.append(b);
 });
 $('relayCount').textContent='· '+relayList().length+' relais';
}
function renderEditor(){
 const p=site(state.selected);
 $('editor').hidden=!p;$('editorEmpty').hidden=!!p;if(!p)return;
 $('pointName').value=p.name;$('pointLat').value=p.lat;$('pointLon').value=p.lon;$('pointHeight').value=p.height;
 $('delete').hidden=p.type!=='relay';$('pointNote').textContent=p.type==='home'?'Station fixe : ne peut pas être supprimée. Coordonnées ajustables.':'Relais libre : position modifiable par glisser-déposer.';
}
function renderMarkers(){
 wipe('markersLayer');
 state.sites.forEach(p=>{
 const v=project(p.lon,p.lat);
 const g=svg('g',{class:'point '+p.type+(p.id===state.selected?' selected':''),transform:'translate('+v.x+' '+v.y+')','data-id':p.id},$('markersLayer'));
 svg('circle',{r:12,class:'point-ring'},g);svg('circle',{r:7,class:'point-core'},g);
 const t=svg('text',{x:16,y:5},g);t.textContent=p.name;
 });
 renderLinks();
}
function renderLinks(){
 wipe('linksLayer');
 const a=[site('pradel'),...relayList(),site('labru')].filter(Boolean);
 for(let i=1;i<a.length;i++){
 const p=project(a[i-1].lon,a[i-1].lat),q=project(a[i].lon,a[i].lat);
 svg('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:'link'},$('linksLayer'));
 const m=svg('text',{x:(p.x+q.x)/2+6,y:(p.y+q.y)/2-8,fill:'#006176','font-size':11,'paint-order':'stroke',stroke:'white','stroke-width':3},$('linksLayer'));
 m.textContent=dist(a[i-1],a[i]).toFixed(1)+' km';
 }
}
function grid(){
 wipe('gridLayer');
 for(let x=0;x<1130;x+=120)svg('line',{x1:x,y1:0,x2:x,y2:930},$('gridLayer'));
 for(let y=0;y<930;y+=120)svg('line',{x1:0,y1:y,x2:1130,y2:y},$('gridLayer'));
}
function mapBase(){
 wipe('baseLayer');
 if(state.base!=='topo'){ $('baseInfo').textContent='Fond blanc local : disponible hors ligne.';return; }
 $('baseInfo').textContent='OpenTopoMap atténué. Si les tuiles sont bloquées, le fond blanc reste visible.';
 const z=11,n=2**z,tileX=l=>Math.floor((l+180)/360*n),tileY=l=>Math.floor((1-Math.asinh(Math.tan(l*rad))/Math.PI)/2*n);
 const lonTile=x=>x/n*360-180,latTile=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/n)))/rad;
 let failures=0;
 for(let x=tileX(2.0);x<=tileX(2.75);x++)for(let y=tileY(43.9);y<=tileY(43.45);y++){
  const a=project(lonTile(x),latTile(y)),b=project(lonTile(x+1),latTile(y+1));
  const im=svg('image',{x:a.x,y:a.y,width:b.x-a.x,height:b.y-a.y,opacity:state.baseOpacity,preserveAspectRatio:'none'},$('baseLayer'));
  im.setAttribute('href','https://tile.opentopomap.org/'+z+'/'+x+'/'+y+'.png');
  im.addEventListener('error',()=>{if(++failures===1)$('baseInfo').textContent='Tuiles OpenTopoMap refusées dans ce navigateur ; fond blanc toujours disponible.';});
 }
 const credit=svg('text',{x:12,y:913,'font-size':10,fill:'#566c76'},$('baseLayer'));credit.textContent='© OpenStreetMap contributors · © OpenTopoMap (CC BY-SA)';
}
function rings(g,geometry){
 let d='';
 const polys=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
 for(const poly of polys)for(const ring of poly){
  if(!Array.isArray(ring)||ring.length<3)continue;
  for(let i=0;i<ring.length;i++){const p=project(ring[i][0],ring[i][1]);d+=(i===0?'M':'L')+p.x.toFixed(1)+' '+p.y.toFixed(1);}
  d+='Z';
 }
 return d;
}
function drawImported(){
 for(const id of ['pradel','labru']){
  const dest=id==='pradel'?'coveragePradel':'coverageLabru';wipe(dest);
  if(!state.layer[id]||!$(id==='pradel'?'showPradel':'showLabru').checked)continue;
  const features=state.layer[id].features.filter(f=>Number.isFinite(Number(f.properties?.dbm)));
  const levels=[...new Set(features.map(f=>Number(f.properties.dbm)))];
  if(!levels.length)continue;
  const chosen=levels.reduce((best,x)=>Math.abs(x-state.threshold)<Math.abs(best-state.threshold)?x:best,levels[0]);
  for(const f of features.filter(f=>Number(f.properties.dbm)===chosen)){
    const d=rings(dest,f.geometry);if(d)svg('path',{d,class:'coverage '+(id==='pradel'?'pradel':'labru'),opacity:state.opacity,'fill-rule':'evenodd'},$(dest));
  }
 }
}
function drawEstimate(){
 wipe('estimatedLayer');
 if(!state.estimate||!$('showEstimate').checked||!site(state.estimate.id))return;
 const path=svg('path',{d:state.estimate.path,class:'estimate',opacity:Math.max(.2,state.opacity)},$('estimatedLayer'));
 path.setAttribute('data-model','geometric-LOS-Fresnel-NOT-RF');
}
function render(){renderSites();renderEditor();renderMarkers();drawImported();drawEstimate();mapBase();setView();}
function addRelay(pos){
 const idx=relayList().length+1;
 const p={id:'r'+Date.now().toString(36)+'_'+idx,type:'relay',name:'Relais '+idx,lat:pos?.lat??43.64,lon:pos?.lon??2.36,height:8};
 state.sites.splice(state.sites.length-1,0,p);state.selected=p.id;invalidate();render();
}
function invalidate(){state.estimate=null;wipe('estimatedLayer');}
function updateField(field,value){
 const p=site(state.selected);if(!p)return;
 p[field]=field==='name'?String(value).slice(0,80):Number(value);
 if(field!=='name'){invalidate();}renderSites();renderMarkers();
}
function geometryData(buf,name){
 const hit=name.match(/([NS])(\d{1,2})([EW])(\d{1,3})/i);
 if(!hit)throw Error('Nom attendu de tuile : N43E002.hgt ou N43E002.hgt.gz');
 const n=Math.round(Math.sqrt(buf.byteLength/2));
 if(n*n*2!==buf.byteLength||![1201,3601].includes(n))throw Error('Tuile HGT non reconnue : dimensions incorrectes');
 return {view:new DataView(buf),n,lat0:Number(hit[2])*(hit[1].toUpperCase()==='S'?-1:1),lon0:Number(hit[4])*(hit[3].toUpperCase()==='W'?-1:1),name};
}
function heightAt(lat,lon){
 const t=state.terrain;if(!t)return null;
 const row=(t.lat0+1-lat)*(t.n-1),col=(lon-t.lon0)*(t.n-1);
 if(row<0||col<0||row>=t.n-1||col>=t.n-1)return null;
 const r=Math.floor(row),c=Math.floor(col),dr=row-r,dc=col-c;
 function value(y,x){const a=t.view.getInt16((y*t.n+x)*2,false);return a<=-32768?null:a;}
 const v=[value(r,c),value(r,c+1),value(r+1,c),value(r+1,c+1)];
 if(v.some(x=>x===null))return null;
 return (v[0]*(1-dc)+v[1]*dc)*(1-dr)+(v[2]*(1-dc)+v[3]*dc)*dr;
}
/* A terrain-only feasibility filter, NEVER a radio link budget.
   Uses 4/3 earth curvature and 60% first Fresnel at 869.525 MHz.
   All points must have DEM coverage; unknown is not clear. */
function clearLOS(a,b,rxHeight=8){
 const z1=heightAt(a.lat,a.lon),z2=heightAt(b.lat,b.lon);
 if(z1===null||z2===null)return null;
 const D=dist(a,b)*1000;
 if(D<60)return true;
 const count=Math.max(2,Math.ceil(D/150));
 const tx=z1+(a.height||8),rx=z2+rxHeight;
 for(let i=1;i<count;i++){
  const t=i/count,d1=D*t,d2=D-d1;
  const latitude=a.lat+(b.lat-a.lat)*t,longitude=a.lon+(b.lon-a.lon)*t;
  const z=heightAt(latitude,longitude);if(z===null)return null;
  const curve=d1*d2/(2*(4/3)*6371000);
  const fresnel=.6*Math.sqrt((299792458/869525000)*d1*d2/D);
  if(z+curve+fresnel>tx+(rx-tx)*t)return false;
 }
 return true;
}
const QUALITY={quick:{rays:90,step:0.7},normal:{rays:180,step:0.5},fine:{rays:360,step:0.35}};
async function calculate(){
 const p=site(state.selected);if(!p||!state.terrain){updateStatus('Charge un terrain SRTM et sélectionne un point.');return;}
 const myToken=++state.token;
 const q=QUALITY[state.quality],maxKm=25, dAngle=2*Math.PI/q.rays,step=q.step;
 updateStatus('Visibilité du terrain : calcul en cours…');
 let path='',tested=0,pass=0;
 for(let i=0;i<q.rays;i++){
  if(myToken!==state.token)return;
  const theta=i*dAngle;
  for(let km=step;km<=maxKm;km+=step){
   const lat=p.lat+(km/111)*Math.cos(theta);
   const lon=p.lon+(km/(111*Math.cos(p.lat*rad)))*Math.sin(theta);
   const target={lat,lon};
   const ok=clearLOS(p,target,8);
   if(ok===null)continue;
   tested++;
   if(!ok)continue;
   pass++;
   const k0=km-step,k1=km+.035;
   const pt=(r,t)=>project(p.lon+(r/(111*Math.cos(p.lat*rad)))*Math.sin(t),p.lat+(r/111)*Math.cos(t));
   const a=pt(k0,theta-dAngle*.48),b=pt(k1,theta-dAngle*.48),c=pt(k1,theta+dAngle*.48),d=pt(k0,theta+dAngle*.48);
   path+='M'+[a.x,a.y].join(' ')+'L'+[b.x,b.y].join(' ')+'L'+[c.x,c.y].join(' ')+'L'+[d.x,d.y].join(' ')+'Z';
  }
  if(i%6===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 if(myToken!==state.token)return;
 state.estimate={id:p.id,path,meta:{rays:q.rays,step:q.step,model:'terrain-LOS-Fresnel'}};
 drawEstimate();
 updateStatus('Visibilité calculée : '+pass+'/'+tested+' cellules géométriquement dégagées (pas une couverture radio).');
}
async function loadDem(file){
 try{
  let data=await file.arrayBuffer();
  if(file.name.endsWith('.gz')){
   if(!('DecompressionStream'in window))throw Error('Décompression gzip indisponible dans ce navigateur : décompresse le fichier .hgt.');
   const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
   data=await new Response(stream).arrayBuffer();
  }
  state.terrain=geometryData(data,file.name);
  $('demInfo').textContent='Relief chargé : '+file.name+' · '+state.terrain.n+'×'+state.terrain.n+'. Une seule tuile en mémoire.';
  invalidate();updateStatus('Terrain chargé : '+state.terrain.n+' points par côté.');
 }catch(e){updateStatus('Erreur de relief : '+e.message);}
}
async function loadCoverage(file,key){
 try{
  const obj=JSON.parse(await file.text());
  if(obj.type!=='FeatureCollection'||!Array.isArray(obj.features))throw Error('FeatureCollection GeoJSON attendue');
  if(!obj.features.some(f=>f.geometry&&Number.isFinite(Number(f.properties?.dbm))))throw Error('Aucun polygone de puissance (dbm) reconnu');
  state.layer[key]=obj;drawImported();updateStatus('Couverture importée : '+file.name+' ('+key+').');
 }catch(e){updateStatus('Import refusé : '+e.message);}
}
function save(){
 const data={format:'MeshtasticCalculator',version:1,saved:new Date().toISOString(),sites:state.sites,layer:state.layer,threshold:state.threshold};
 const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
 a.href=url;a.download='meshtasticcalculator-projet.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),300);
}
async function restore(file){
 try{
  const obj=JSON.parse(await file.text());
  if(obj.format!=='MeshtasticCalculator'||!Array.isArray(obj.sites))throw Error('Fichier projet invalide');
  const ids=obj.sites.map(p=>p.id);
  if(!ids.includes('pradel')||!ids.includes('labru')||new Set(ids).size!==ids.length||obj.sites.length>100)throw Error('Stations de base manquantes ou doublons');
  if(obj.sites.some(p=>!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180))throw Error('Coordonnées invalides');
  state.sites=obj.sites;state.layer={pradel:obj.layer?.pradel||null,labru:obj.layer?.labru||null};state.selected='pradel';state.threshold=Number(obj.threshold)||-118;
  $('threshold').value=String(state.threshold);invalidate();render();updateStatus('Projet restauré.');
 }catch(e){updateStatus('Projet refusé : '+e.message);}
}
function wire(){
 $('add').onclick=()=>addRelay();
 $('delete').onclick=()=>{const p=site(state.selected);if(!p||p.type!=='relay')return;state.sites=state.sites.filter(x=>x.id!==p.id);state.selected='pradel';invalidate();render();};
 for(const[field,id]of[['name','pointName'],['lat','pointLat'],['lon','pointLon'],['height','pointHeight']]){
  $(id).addEventListener('change',e=>{updateField(field,e.target.value);if(field!=='name')render();});
 }
 $('threshold').onchange=e=>{state.threshold=Number(e.target.value);drawImported();};
 for(const id of ['showPradel','showLabru'])$(id).onchange=drawImported;
 $('showEstimate').onchange=drawEstimate;
 $('coverageOpacity').oninput=e=>{state.opacity=Number(e.target.value)/100;drawImported();drawEstimate();};
 $('base').onchange=e=>{state.base=e.target.value;mapBase();};
 $('baseOpacity').oninput=e=>{state.baseOpacity=Number(e.target.value)/100;mapBase();};
 $('quality').onchange=e=>{state.quality=e.target.value;updateStatus('Mode '+e.target.value+' sélectionné : relance le calcul pour appliquer la nouvelle précision.');};
 $('calculate').onclick=calculate;
 $('fit').onclick=$('resetView').onclick=()=>{state.view={x:0,y:0,w:1130,h:930};setView();};
 $('zoomIn').onclick=()=>zoom(.8);$('zoomOut').onclick=()=>zoom(1.25);
 $('importPradel').onchange=e=>e.target.files[0]&&loadCoverage(e.target.files[0],'pradel');
 $('importLabru').onchange=e=>e.target.files[0]&&loadCoverage(e.target.files[0],'labru');
 $('importDem').onchange=e=>e.target.files[0]&&loadDem(e.target.files[0]);
 $('save').onclick=save;$('openProject').onchange=e=>e.target.files[0]&&restore(e.target.files[0]);
 const map=$('map');
 map.addEventListener('dblclick',e=>{e.preventDefault();const p=localXY(e);addRelay(unproject(p.x,p.y));});
 map.addEventListener('pointerdown',e=>{
  const node=e.target.closest('.point');const p=localXY(e);
  if(node){state.selected=node.dataset.id;state.drag={kind:'site',id:state.selected};renderSites();renderEditor();renderMarkers();}
  else state.drag={kind:'pan',x:p.x,y:p.y,view:{...state.view}};
  map.setPointerCapture(e.pointerId);
 });
 map.addEventListener('pointermove',e=>{
  if(!state.drag)return;
  const v=localXY(e);
  if(state.drag.kind==='site'){
   const p=site(state.drag.id);if(!p)return;const geo=unproject(v.x,v.y);p.lat=+geo.lat.toFixed(6);p.lon=+geo.lon.toFixed(6);renderMarkers();
  }else{
   const dx=v.x-state.drag.x,dy=v.y-state.drag.y;
   state.view.x-=dx;state.view.y-=dy;setView();
  }
 });
 map.addEventListener('pointerup',()=>{
  if(!state.drag)return;
  const moved=state.drag.kind==='site';state.drag=null;
  if(moved){invalidate();renderSites();renderEditor();renderMarkers();if(state.terrain)calculate();}
 });
 map.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.12:.89);},{passive:false});
}
function zoom(scale){const v=state.view;v.x+=(v.w-v.w*scale)/2;v.y+=(v.h-v.h*scale)/2;v.w*=scale;v.h*=scale;setView();}
grid();wire();render();updateStatus('Prêt : importe les couvertures Site Planner et ajoute des relais.');
