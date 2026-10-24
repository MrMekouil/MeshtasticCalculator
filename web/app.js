'use strict';
/* MeshtasticCalculator V0.1 — deliberately separates provenance: imported RF vs local geometric visibility. */
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const BASE={lon:2.04,lat:43.87,s:21};
const HOME=[
 {id:'pradel',type:'home',name:'Le Pradel',lat:43.69992,lon:2.384259,height:10},
 {id:'labru',type:'home',name:'Labruguière',lat:43.538435,lon:2.262519,height:8}
];
// Optional local-only JS sidecar: load through a normal <script>, not fetch(), so file:// works.
function bundledLayer(key){
 const val=globalThis.MESHTASTIC_LOCAL_COVERAGES?.[key];
 return val?.type==='FeatureCollection' && Array.isArray(val.features)
   && val.features.every(f=>['MultiPolygon','Polygon'].includes(f?.geometry?.type)&&Number.isFinite(Number(f?.properties?.dbm)))?val:null;
}
const preloaded={pradel:bundledLayer('pradel'),labru:bundledLayer('labru')};
const state={sites:structuredClone(HOME),selected:'pradel',threshold:-117,layer:preloaded,quality:'normal',opacity:.38,
 terrain:null,terrains:[],estimate:null,base:'positron',baseOpacity:.36,view:{x:0,y:0,w:1130,h:930},drag:null,token:0};
const status=(s)=>{$('status').textContent=s;};
const rad=Math.PI/180;
const project=(lon,lat)=>globalThis.MeshtasticWorldMap?.map
 ?globalThis.MeshtasticWorldMap.map.project([lon,lat])
 :({x:(lon-BASE.lon)*Math.cos(43.7*rad)*111*BASE.s,y:(BASE.lat-lat)*111*BASE.s});
const unproject=(x,y)=>globalThis.MeshtasticWorldMap?.map
 ?(()=>{const p=globalThis.MeshtasticWorldMap.map.unproject([x,y]);return {lon:p.lng,lat:p.lat};})()
 :({lon:BASE.lon+x/(Math.cos(43.7*rad)*111*BASE.s),lat:BASE.lat-y/(111*BASE.s)});
const site=id=>state.sites.find(s=>s.id===id);
const relayList=()=>state.sites.filter(s=>s.type==='relay');
const dist=(a,b)=>{const dlat=(a.lat-b.lat)*rad,dlon=(a.lon-b.lon)*rad,k=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(k)));};
function svg(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v)); if(parent)parent.append(e);return e;}
function wipe(id){$(id).replaceChildren();}
function range(v,a,b){return Math.max(a,Math.min(b,v));}
let previewTimer=null;
function updateStatus(s){status(s);$('mapHint').textContent=s;}
function setView(){
 const world=globalThis.MeshtasticWorldMap?.map;
 if(world){renderMarkers();return;}
 const v=state.view;$('map').setAttribute('viewBox',[v.x,v.y,v.w,v.h].join(' '));renderMarkers();
}
function localXY(event){const p=$('map').createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform($('map').getScreenCTM().inverse());}
function renderSites(){
 const list=$('sites');list.replaceChildren();
 state.sites.forEach(p=>{
   const b=document.createElement('button');b.className='site'+(state.selected===p.id?' active':'');
   const name=document.createElement('span');name.textContent=(p.type==='home'?'⌂ ':'⌁ ')+p.name;
   const info=document.createElement('em');info.textContent=p.type==='home'?'Station fixe':p.height+' m · relais';
   b.append(name,info);b.onclick=()=>{state.selected=p.id;renderSites();renderMarkers();renderEditor();};
   const line=document.createElement('div');line.className='site-line';
   const eye=document.createElement('button');eye.type='button';eye.className='coverage-eye';
   const legacy=p.id==='pradel'?$('showPradel'):p.id==='labru'?$('showLabru'):null;
   const visible=!(typeof RADIO!=='undefined'&&RADIO.hidden.has(p.id))&&(!legacy||legacy.checked);
   eye.textContent=visible?'◉':'◌';
   eye.title=(visible?'Masquer':'Afficher')+' les couvertures de '+p.name;
   eye.setAttribute('aria-label',eye.title);eye.setAttribute('aria-pressed',String(visible));
   eye.onclick=event=>{
    event.preventDefault();event.stopPropagation();
    const next=!visible;
    if(typeof RADIO!=='undefined'){
      if(next)RADIO.hidden.delete(p.id);else RADIO.hidden.add(p.id);
      rfDraw();
    }
    if(legacy)legacy.checked=next;
    drawImported();renderSites();
   };
   line.append(b,eye);list.append(line);
 });
 $('relayCount').textContent='· '+relayList().length+' relais';
 if(typeof rfRefreshVisibility==='function')rfRefreshVisibility();
 if($('projectTitle'))$('projectTitle').textContent=(site('pradel')?.name||'Station 1')+' ↔ '+(site('labru')?.name||'Station 2');
}
function renderEditor(){
 const p=site(state.selected);
 $('editor').hidden=!p;$('editorEmpty').hidden=!!p;if(!p)return;
 $('pointName').value=p.name;$('pointLat').value=p.lat;$('pointLon').value=p.lon;$('pointHeight').value=p.height;
 $('delete').hidden=p.type!=='relay';$('pointNote').textContent=p.type==='home'?'Station d’extrémité : modifiable mais non supprimable.':'Relais déplaçable et ajustable au mètre.';
 $('precisionCoords').textContent=p.lat.toFixed(8)+', '+p.lon.toFixed(8);
}
function renderMarkers(){
 wipe('markersLayer');
 state.sites.forEach(p=>{
 const v=project(p.lon,p.lat);
 const rect=$('map').getBoundingClientRect();
 const pixelsPerUnit=globalThis.MeshtasticWorldMap?.map?1:(rect.width||1130)/state.view.w;
 const visualScale=globalThis.MeshtasticWorldMap?.map?1:Math.min(6,Math.max(.001,11/(12*pixelsPerUnit)));
 const g=svg('g',{class:'point '+p.type+(p.id===state.selected?' selected':''),transform:'translate('+v.x+' '+v.y+') scale('+visualScale+')','data-id':p.id},$('markersLayer'));
 svg('circle',{r:12,class:'point-ring'},g);svg('circle',{r:7,class:'point-core'},g);
 if(p.id===state.selected){
   for(const [x1,y1,x2,y2] of [[-21,0,-13,0],[13,0,21,0],[0,-21,0,-13],[0,13,0,21]])
     svg('line',{x1,y1,x2,y2,class:'precise-crosshair'},g);
   svg('circle',{r:2.1,fill:'#fff',stroke:'#002c32','stroke-width':'.75'},g);
 }
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
 if(globalThis.MeshtasticWorldMap?.map)return;
 for(let x=0;x<1130;x+=120)svg('line',{x1:x,y1:0,x2:x,y2:930},$('gridLayer'));
 for(let y=0;y<930;y+=120)svg('line',{x1:0,y1:y,x2:1130,y2:y},$('gridLayer'));
}
function mapBase(){
 if(globalThis.MeshtasticWorldMap?.map){
  wipe('baseLayer');
  $('baseInfo').textContent='Carte mondiale vectorielle : styles routiers et zoom adaptatif. Le fond blanc reste disponible.';
  return;
 }
 wipe('baseLayer');
 if(state.base!=='topo'){ $('baseInfo').textContent='Fond blanc local : disponible hors ligne.';return; }
 $('baseInfo').textContent='OpenTopoMap atténué. Si les tuiles sont bloquées, le fond blanc reste visible.';
 const z=11,n=2**z,tileX=l=>Math.floor((l+180)/360*n),tileY=l=>Math.floor((1-Math.asinh(Math.tan(l*rad))/Math.PI)/2*n);
 const lonTile=x=>x/n*360-180,latTile=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/n)))/rad;
 let failures=0;
 const v=state.view,nw=unproject(v.x,v.y),se=unproject(v.x+v.w,v.y+v.h);
 const x0=Math.max(0,tileX(Math.min(nw.lon,se.lon)))-1,x1=Math.min(n-1,tileX(Math.max(nw.lon,se.lon))+1);
 const y0=Math.max(0,tileY(Math.max(nw.lat,se.lat)))-1,y1=Math.min(n-1,tileY(Math.min(nw.lat,se.lat))+1);
 const count=(x1-x0+1)*(y1-y0+1);
 if(count>80){$('baseInfo').textContent='Vue trop large pour le fond OpenTopoMap (limite 80 tuiles) : zoome sur le secteur.';return;}
 for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
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
function showCoverageSource(){
 const ready=['pradel','labru'].filter(id=>state.layer[id]);
 const label={pradel:'Le Pradel',labru:'Labruguière'};
 $('coverageSource').textContent=ready.length
   ? 'Couverture'+(ready.length>1?'s':'')+' chargée'+(ready.length>1?'s':'')+' : '+ready.map(id=>label[id]).join(' et ')+'. Tu peux remplacer ces données par un nouvel import.'
   : 'Aucune couverture chargée. Un fichier privé facultatif peut les charger automatiquement.';
}
function render(){renderSites();renderEditor();renderMarkers();drawImported();drawEstimate();mapBase();setView();showCoverageSource();}
function addRelay(pos){
 const idx=relayList().length+1;
 const a=site('pradel'),b=site('labru'),center=globalThis.MeshtasticWorldMap?.map?.getCenter();
 const lat=pos?.lat??(center?.lat??(a.lat+b.lat)/2);
 const lon=pos?.lon??(center?.lng??(a.lon+b.lon)/2);
 const p={id:'r'+Date.now().toString(36)+'_'+idx,type:'relay',name:'Relais '+idx,lat,lon,height:8};
 state.sites.splice(state.sites.length-1,0,p);state.selected=p.id;invalidate();render();
}
let preciseRecomputeTimer=null;
function adjustPointByMeters(direction,metres){
 const p=site(state.selected);if(!p)return;
 const latFactor=111320,lonFactor=latFactor*Math.cos(p.lat*rad);
 const m=Math.max(.1,Math.min(10000,Number(metres)||1));
 if(direction==='n'||direction==='s')
   p.lat=range(p.lat+(direction==='n'?1:-1)*m/latFactor,-89.999999,89.999999);
 if((direction==='e'||direction==='w')&&lonFactor>1)
   p.lon=range(p.lon+(direction==='e'?1:-1)*m/lonFactor,-180,180);
 p.lat=+p.lat.toFixed(8);p.lon=+p.lon.toFixed(8);
 invalidate();
 if(typeof rfInvalidate==='function')rfInvalidate(p.id);
 renderEditor();renderMarkers();renderSites();
 if(state.terrain&&typeof rfCalculateSite==='function'){
   clearTimeout(preciseRecomputeTimer);
   preciseRecomputeTimer=setTimeout(()=>rfCalculateSite(p.id),350);
 }
}
function centerOnSelectedPoint(){
 const p=site(state.selected);if(!p)return;
 const world=globalThis.MeshtasticWorldMap?.map;
 if(world){world.easeTo({center:[p.lon,p.lat],zoom:Math.max(15,world.getZoom()),duration:400});return;}
 const center=project(p.lon,p.lat),map=$('map'),rect=map.getBoundingClientRect();
 const ratio=(rect.width||1130)/(rect.height||930);
 const w=Math.min(state.view.w,42),h=w/ratio;
 state.view={x:center.x-w/2,y:center.y-h/2,w,h};
 setView();mapBase();
 updateStatus('Placement fin : cible centrée. Utilise les flèches pour ajuster de 1, 10 ou 100 mètres.');
}
function invalidate(){state.estimate=null;wipe('estimatedLayer');}
function updateField(field,value){
 const p=site(state.selected);if(!p)return;
 p[field]=field==='name'?String(value).slice(0,80):Number(value);
 if(field!=='name'){
   invalidate();
   if(typeof rfInvalidate==='function')rfInvalidate(p.id);
 }
 renderSites();renderMarkers();renderEditor();
 if(field!=='name'&&state.terrain&&typeof rfCalculateSite==='function'){
   clearTimeout(preciseRecomputeTimer);
   preciseRecomputeTimer=setTimeout(()=>rfCalculateSite(p.id),350);
 }
}
function geometryData(buf,name){
 const hit=name.match(/([NS])(\d{1,2})([EW])(\d{1,3})/i);
 if(!hit)throw Error('Nom attendu de tuile : N43E002.hgt ou N43E002.hgt.gz');
 const n=Math.round(Math.sqrt(buf.byteLength/2));
 if(n*n*2!==buf.byteLength||![1201,3601].includes(n))throw Error('Tuile HGT non reconnue : dimensions incorrectes');
 return {view:new DataView(buf),n,lat0:Number(hit[2])*(hit[1].toUpperCase()==='S'?-1:1),lon0:Number(hit[4])*(hit[3].toUpperCase()==='W'?-1:1),name};
}
function heightAt(lat,lon){
 const tiles=state.terrains?.length?state.terrains:state.terrain?[state.terrain]:[];
 for(const t of tiles){
  const row=(t.lat0+1-lat)*(t.n-1),col=(lon-t.lon0)*(t.n-1);
  if(row<0||col<0||row>=t.n-1||col>=t.n-1)continue;
  const r=Math.floor(row),c=Math.floor(col),dr=row-r,dc=col-c;
  function value(y,x){const a=t.view.getInt16((y*t.n+x)*2,false);return a<=-32768?null:a;}
  const v=[value(r,c),value(r,c+1),value(r+1,c),value(r+1,c+1)];
  if(v.some(x=>x===null))return null;
  return (v[0]*(1-dc)+v[1]*dc)*(1-dr)+(v[2]*(1-dc)+v[3]*dc)*dr;
 }
 return null;
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
async function calculate(qualityOverride){
 const p=site(state.selected);if(!p||!state.terrain){updateStatus('Charge un terrain SRTM et sélectionne un point.');return;}
 const myToken=++state.token;
 const q=QUALITY[qualityOverride||state.quality],maxKm=25, dAngle=2*Math.PI/q.rays,step=q.step;
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
  const tile=geometryData(data,file.name);
  state.terrains||=[];
  state.terrains=state.terrains.filter(t=>!(t.lat0===tile.lat0&&t.lon0===tile.lon0));
  state.terrains.push(tile);state.terrain=tile;
  $('demInfo').textContent='Relief chargé : '+state.terrains.length+' tuile(s) SRTM en mémoire · dernière : '+file.name+'.';
  invalidate();updateStatus('Terrain chargé : '+state.terrain.n+' points par côté.');
 }catch(e){updateStatus('Erreur de relief : '+e.message);}
}
async function loadCoverage(file,key){
 try{
  if(file.size>20_000_000)throw Error('GeoJSON trop volumineux (> 20 Mo)');
  const obj=JSON.parse(await file.text());
  if(obj.type!=='FeatureCollection'||!Array.isArray(obj.features))throw Error('FeatureCollection GeoJSON attendue');
  if(!obj.features.some(f=>f.geometry&&Number.isFinite(Number(f.properties?.dbm))))throw Error('Aucun polygone de puissance (dbm) reconnu');
  state.layer[key]=obj;drawImported();showCoverageSource();updateStatus('Couverture importée : '+file.name+' ('+key+').');
 }catch(e){updateStatus('Import refusé : '+e.message);}
}
function save(){
 const data={format:'MeshtasticCalculator',version:2,saved:new Date().toISOString(),sites:state.sites,layer:state.layer,threshold:state.threshold,radioImports:typeof RADIO!=='undefined'?Object.fromEntries([...RADIO.imports].map(([id,value])=>[id,value.obj])):{},hiddenCoverages:typeof RADIO!=='undefined'?[...RADIO.hidden]:[]};
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
  state.sites=obj.sites;state.layer={pradel:obj.layer?.pradel||preloaded.pradel||null,labru:obj.layer?.labru||preloaded.labru||null};state.selected='pradel';
  const stored=Number(obj.threshold);
  state.threshold=[-130,-117,-109].reduce((a,b)=>Math.abs(b-stored)<Math.abs(a-stored)?b:a,-117);
  $('threshold').value=String(state.threshold);
  if(typeof RADIO!=='undefined'){$('rfThreshold').value=String(state.threshold);RADIO.settings.threshold=state.threshold;}
  invalidate();render();
  if(globalThis.MeshtasticSidebar?.updateThreshold)globalThis.MeshtasticSidebar.updateThreshold();
  updateStatus('Projet restauré.');
 }catch(e){updateStatus('Projet refusé : '+e.message);}
}
function wire(){
 $('add').onclick=()=>addRelay();
 $('centerPrecise').onclick=centerOnSelectedPoint;
 for(const button of document.querySelectorAll('[data-nudge]')){
  button.onclick=()=>adjustPointByMeters(button.dataset.nudge,Number($('precisionStep').value));
 }
 $('delete').onclick=()=>{const p=site(state.selected);if(!p||p.type!=='relay')return;state.sites=state.sites.filter(x=>x.id!==p.id);state.selected='pradel';invalidate();render();};
 for(const[field,id]of[['name','pointName'],['lat','pointLat'],['lon','pointLon'],['height','pointHeight']]){
  $(id).addEventListener('change',e=>{updateField(field,e.target.value);if(field!=='name')render();});
 }
 $('threshold').onchange=e=>{
   const t=Number(e.target.value);state.threshold=t;
   if(typeof RADIO!=='undefined'){RADIO.settings.threshold=t;$('rfThreshold').value=String(t);rfDraw();}
   drawImported();
   if(globalThis.MeshtasticSidebar?.updateThreshold)globalThis.MeshtasticSidebar.updateThreshold();
 };
 for(const id of ['showPradel','showLabru'])$(id).onchange=drawImported;
 $('showEstimate').onchange=drawEstimate;
 $('coverageOpacity').oninput=e=>{state.opacity=Number(e.target.value)/100;drawImported();drawEstimate();};
 $('base').onchange=e=>{
  state.base=e.target.value;
  const world=globalThis.MeshtasticWorldMap;
  if(world?.map)world.switchStyle(state.base);
  else mapBase();
 };
 $('baseOpacity').oninput=e=>{state.baseOpacity=Number(e.target.value)/100;mapBase();};
 $('quality').onchange=e=>{state.quality=e.target.value;if(state.terrain&&site(state.selected)){calculate();}else updateStatus('Mode '+e.target.value+' sélectionné. Charge un terrain pour calculer.');};
 $('calculate').onclick=calculate;
 $('fit').onclick=$('resetView').onclick=fitSites;
 $('newProject').onclick=()=>{
  if(!confirm('Créer un nouveau projet ? Pense à exporter le projet actuel si tu veux conserver ses points et couvertures.'))return;
  state.sites=structuredClone(HOME).map((p,i)=>({...p,name:'Station '+(i+1)}));
  state.layer={pradel:null,labru:null};state.selected='pradel';invalidate();
  if(typeof RADIO!=='undefined'){RADIO.coverage.clear();RADIO.imports.clear();RADIO.hidden.clear();rfDraw();rfSummary();}
  render();fitSites();updateStatus('Nouveau projet : déplace les deux stations et ajoute tes relais.');
 };
 $('zoomIn').onclick=()=>zoom(.8);$('zoomOut').onclick=()=>zoom(1.25);
 $('importPradel').onchange=e=>e.target.files[0]&&loadCoverage(e.target.files[0],'pradel');
 $('importLabru').onchange=e=>e.target.files[0]&&loadCoverage(e.target.files[0],'labru');
 $('importDem').onchange=async e=>{for(const f of [...e.target.files])await loadDem(f);};
 $('save').onclick=save;$('openProject').onchange=e=>e.target.files[0]&&restore(e.target.files[0]);
 const map=$('map');
 map.addEventListener('dblclick',e=>{e.preventDefault();const p=localXY(e);addRelay(unproject(p.x,p.y));});
 const DRAG_THRESHOLD_PX=6;
 function endMapPointer(e,cancelled=false){
  const d=state.drag;
  if(!d||e.pointerId!==d.pointerId)return;
  state.drag=null;
  try{if(map.hasPointerCapture?.(e.pointerId))map.releasePointerCapture(e.pointerId);}catch(_){}
  if(d.kind==='site'){
   const p=site(d.id);
   if(cancelled&&p&&d.original){p.lat=d.original.lat;p.lon=d.original.lon;}
   if(d.active||cancelled){
    clearTimeout(previewTimer);state.token++;invalidate();renderSites();renderEditor();renderMarkers();
    if(state.terrain&&!cancelled)calculate();
   }
  }else if(d.active)mapBase();
 }
 map.addEventListener('pointerdown',e=>{
  // Ignore secondary clicks: a map must never start moving just because the pointer is hovering.
  if(e.button!==0||state.drag)return;
  const node=e.target.closest?.('.point');
  const id=node?.dataset?.id;
  const p=id?site(id):null;
  if(id&&!p)return;
  if(id){state.selected=id;renderSites();renderEditor();renderMarkers();}
  state.drag={pointerId:e.pointerId,kind:p?'site':'pan',id,
   startX:e.clientX,startY:e.clientY,active:false,
   view:{...state.view},original:p?{lat:p.lat,lon:p.lon}:null};
  try{map.setPointerCapture(e.pointerId);}catch(_){state.drag=null;}
 });
 map.addEventListener('pointermove',e=>{
  const d=state.drag;
  if(!d||e.pointerId!==d.pointerId)return;
  // Recover from a missed pointerup; do not keep dragging with no primary button pressed.
  if(e.pointerType==='mouse'&&!(e.buttons&1)){endMapPointer(e,true);return;}
  const dx=e.clientX-d.startX,dy=e.clientY-d.startY;
  if(!d.active&&dx*dx+dy*dy<DRAG_THRESHOLD_PX*DRAG_THRESHOLD_PX)return;
  d.active=true;
  e.preventDefault();
  if(d.kind==='site'){
   const p=site(d.id);if(!p)return;
   const v=localXY(e),geo=unproject(v.x,v.y);
   p.lat=+geo.lat.toFixed(6);p.lon=+geo.lon.toFixed(6);renderMarkers();
   if(state.terrain){clearTimeout(previewTimer);previewTimer=setTimeout(()=>calculate('quick'),450);}
  }else{
   const rect=map.getBoundingClientRect();
   state.view.x=d.view.x-dx*d.view.w/rect.width;
   state.view.y=d.view.y-dy*d.view.h/rect.height;
   setView();
  }
 });
 map.addEventListener('pointerup',e=>endMapPointer(e,false));
 map.addEventListener('pointercancel',e=>endMapPointer(e,true));
 map.addEventListener('lostpointercapture',e=>endMapPointer(e,true));
 map.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.12:.89);},{passive:false});
}
function fitSites(){
 if(!state.sites.length)return;
 const world=globalThis.MeshtasticWorldMap?.map,GL=globalThis.MeshtasticWorldMap?.lib;
 if(world&&GL){
  const bounds=new GL.LngLatBounds();
  for(const n of state.sites)bounds.extend([n.lon,n.lat]);
  world.fitBounds(bounds,{padding:65,maxZoom:15,duration:400});
  return;
 }
 const pts=state.sites.map(n=>project(n.lon,n.lat));
 const minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x));
 const minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));
 const w=Math.max(190,(maxX-minX)*1.35),h=Math.max(155,(maxY-minY)*1.35);
 const ratio=1130/930;state.view={x:(minX+maxX)/2-Math.max(w,h*ratio)/2,
  y:(minY+maxY)/2-Math.max(h,w/ratio)/2,w:Math.max(w,h*ratio),h:Math.max(h,w/ratio)};
 setView();mapBase();
}
function zoom(scale){
 const world=globalThis.MeshtasticWorldMap?.map;
 if(world){world.zoomTo(world.getZoom()-Math.log2(scale),{duration:200});return;}
 const v=state.view;v.x+=(v.w-v.w*scale)/2;v.y+=(v.h-v.h*scale)/2;v.w*=scale;v.h*=scale;setView();mapBase();}
grid();wire();render();updateStatus(preloaded.pradel&&preloaded.labru
 ? 'Couvertures du Pradel et de Labruguière chargées automatiquement (fichier privé local).'
 : 'Prêt : charge un fichier privé local ou importe les GeoJSON Site Planner.');
