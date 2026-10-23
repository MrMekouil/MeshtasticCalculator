/* Experimental RF estimate, distinct from imported Meshtastic Longley-Rice outputs.
 * Input: local SRTM HGT. ITU single dominant knife-edge approximation, NOT ITM.
 * All unknown terrain remains UNKNOWN, never treated as received.
 */
'use strict';
const RADIO={
  settings:{freq:869.525,eirp:20,rxGain:0,extraLoss:12,sensitivity:-130,rxHeight:2,maxKm:25,quality:'normal',threshold:-117},
  coverage:new Map(),versions:new Map(),enabled:true,active:true,dragPreview:null,demPersistent:false
};
const RADIO_QUALITY={preview:{rays:72,step:.35,profileStep:180},normal:{rays:180,step:.15,profileStep:100},fine:{rays:360,step:.10,profileStep:70}};
function rfPoint(lat,lon,theta,km){
 return {lat:lat+km/111.195*Math.cos(theta),lon:lon+km/(111.195*Math.cos(lat*rad))*Math.sin(theta)};
}
function rfTerrainLink(tx,rx){
 if(!state.terrain)return null;
 const km=dist(tx,rx),d=km*1000;
 if(km>.001&&km>0.01){
  const n=Math.max(3,Math.ceil(d/90)),row=new Array(n+1);
  for(let i=0;i<=n;i++){
   const f=i/n;
   row[i]=heightAt(tx.lat+(rx.lat-tx.lat)*f,tx.lon+(rx.lon-tx.lon)*f);
   if(row[i]===null)return null;
  }
  const signal=rfLevel(row,n,d,tx.height||8,rx.height||RADIO.settings.rxHeight);
  return {km,dbm:signal.dbm,margin:signal.dbm-RADIO.settings.sensitivity,los:signal.knife<3,knife:signal.knife,model:'knife-edge/SRTM (expérimental)'};
 }
 return {km,dbm:RADIO.settings.eirp-25,margin:RADIO.settings.eirp-25-RADIO.settings.sensitivity,los:true,knife:0,model:'proximité'};
}
function rfLevel(row,j,dMeters,txHeight,rxHeight){
 const cfg=RADIO.settings,lambda=299792458/(cfg.freq*1e6);
 const d=Math.max(dMeters,20),h0=row[0]+txHeight,h1=row[j]+rxHeight;
 let v=-100;
 const skip=Math.max(1,Math.floor(j/110));
 for(let k=1;k<j;k+=skip){
   const t=k/j,d1=d*t,d2=d-d1;
   const z=row[k]+d1*d2/(2*(4/3)*6371000);
   const line=h0+(h1-h0)*t;
   const vk=(z-line)*Math.sqrt(2*d/(lambda*d1*d2));
   if(vk>v)v=vk;
 }
 const knife=v<=-.78?0:Math.max(0,6.9+20*Math.log10(Math.sqrt((v-.1)**2+1)+v-.1));
 const fspl=32.44+20*Math.log10(d/1000)+20*Math.log10(cfg.freq);
 return {dbm:cfg.eirp+cfg.rxGain-fspl-knife-cfg.extraLoss,knife};
}
function rfWedge(site,km0,km1,ang0,ang1){
 const pts=[
  rfPoint(site.lat,site.lon,ang0,km0),rfPoint(site.lat,site.lon,ang0,km1),
  rfPoint(site.lat,site.lon,ang1,km1),rfPoint(site.lat,site.lon,ang1,km0)];
 return 'M'+pts.map((pt,i)=>{const p=project(pt.lon,pt.lat);return (i?'L':'')+p.x.toFixed(1)+' '+p.y.toFixed(1)}).join('')+'Z';
}
function rfBuildWedges(site,rows,preset){
 const tiers=[-130,-117,-109],paths=Object.fromEntries(tiers.map(x=>[x,[]])),signals=[],valid=0;
 const n=preset.rays,step=preset.step,count=Math.ceil(RADIO.settings.maxKm/step);
 for(let a=0;a<n;a++){
  const elevations=rows[a];
  if(!elevations){signals.push(null);continue;}
  valid++;
  const signal=new Float32Array(count+1);
  const opens=Object.fromEntries(tiers.map(t=>[t,-1]));
  function close(t,j){
   if(opens[t]<0)return;
   const inner=Math.max(0,(opens[t]-1)*step),outer=Math.min(RADIO.settings.maxKm,j*step);
   const theta=a*2*Math.PI/n,half=Math.PI/n;
   paths[t].push(rfWedge(site,inner,outer,theta-half,theta+half));
   opens[t]=-1;
  }
  for(let j=1;j<=count;j++){
   if(elevations[j]===null){for(const t of tiers)close(t,j-1);signal[j]=NaN;continue;}
   const d=j*step*1000;
   const value=rfLevel(elevations,j,d,site.height||8,RADIO.settings.rxHeight).dbm;
   signal[j]=value;
   for(const t of tiers){if(value>=t){if(opens[t]<0)opens[t]=j;}else close(t,j-1);}
  }
  for(const t of tiers)close(t,count);
  signals.push(signal);
 }
 return {id:site.id,kind:'srtm-knife-edge',lat:site.lat,lon:site.lon,height:site.height,rays:n,step,signals,valid,paths:Object.fromEntries(tiers.map(t=>[t,paths[t].join('')])),created:new Date().toISOString()};
}
async function rfCalculateSite(id,mode){
 const node=site(id);if(!node)return false;
 const q=RADIO_QUALITY[mode||RADIO.settings.quality];
 const version=(RADIO.versions.get(id)||0)+1;RADIO.versions.set(id,version);
 if(!state.terrain){rfStatus('Terrain SRTM absent : charge un fichier .hgt(.gz) pour calculer les nouvelles couvertures.');return false;}
 const count=Math.ceil(RADIO.settings.maxKm/q.step),rows=[];
 rfStatus('Calcul '+node.name+' : '+q.rays+' directions en cours…');
 for(let a=0;a<q.rays;a++){
  if(RADIO.versions.get(id)!==version||!site(id))return false;
  const theta=a*2*Math.PI/q.rays;
  const elev=new Array(count+1),length=q.step*1000;
  for(let j=0;j<=count;j++){
    const p=rfPoint(node.lat,node.lon,theta,j*q.step);
    elev[j]=heightAt(p.lat,p.lon);
  }
  // Incomplete rays must not be discarded wholesale: later samples may still be valid.
  // Preserve a null for missing samples; prevent any propagation beyond the first gap.
  let cutoff=elev.indexOf(null);
  if(cutoff>=0)for(let j=cutoff;j<=count;j++)elev[j]=null;
  rows.push(elev);
  if(a%6===5){
    if(mode!=='preview')rfStatus('Calcul '+node.name+' : '+Math.round((a+1)/q.rays*100)+' %');
    await new Promise(r=>setTimeout(r,0));
  }
 }
 if(RADIO.versions.get(id)!==version||!site(id))return false;
 const result=rfBuildWedges(node,rows,q);
 RADIO.coverage.set(id,result);
 rfDraw();rfSummary();
 rfStatus(node.name+' : '+result.valid+'/'+q.rays+' directions, modèle de diffraction simplifié (PAS Longley-Rice).');
 return true;
}
function rfStatus(t){if($('rfStatus'))$('rfStatus').textContent=t;}
function rfInvalidate(id){
 RADIO.versions.set(id,(RADIO.versions.get(id)||0)+1);
 RADIO.coverage.delete(id);rfDraw();rfSummary();
}
function rfDraw(){
 const group=$('radioLayer');if(!group)return;group.replaceChildren();
 if(!RADIO.enabled)return;
 const t=RADIO.settings.threshold;const opacity=+($('rfOpacity')?.value||35)/100;
 for(const node of state.sites){
  const cv=RADIO.coverage.get(node.id);if(!cv||!site(node.id))continue;
  const path=cv.paths[t];if(!path)continue;
  const selected=node.id===state.selected;
  svg('path',{d:path,'fill-rule':'evenodd',fill:node.type==='home'?'#7c78dc':'#0ea875',
    'fill-opacity':selected?opacity:opacity*.52,stroke:selected?'#0d876b':'none',
    'stroke-width':'.4','vector-effect':'non-scaling-stroke','data-model':cv.kind},group);
 }
}
function rfSummary(){
 const el=$('rfLinks');if(!el)return;el.replaceChildren();
 const nodes=[site('pradel'),...relayList(),site('labru')].filter(Boolean);
 if(!state.terrain){el.textContent='Aucune liaison évaluée. Charge le relief SRTM.';return;}
 let worst=Infinity,unavailable=false;
 for(let i=1;i<nodes.length;i++){
  const a=nodes[i-1],b=nodes[i],res=rfTerrainLink(a,b);
  const row=document.createElement('div');row.className='rf-link';
  if(!res){row.textContent=a.name+' → '+b.name+' : inconnu (terrain manquant)';unavailable=true;}
  else{
    worst=Math.min(worst,res.margin);
    row.textContent=a.name+' → '+b.name+' · '+res.km.toFixed(1)+' km · ≈ '+res.dbm.toFixed(1)+' dBm · marge '+res.margin.toFixed(1)+' dB';
    if(res.margin<10)row.classList.add('rf-low');
  }
  el.append(row);
 }
 const p=document.createElement('p');p.className='hint';
 p.textContent=unavailable?'Un ou plusieurs sauts sont hors du relief chargé.':
   'Marge minimale estimée : '+worst.toFixed(1)+' dB. Modèle simplifié : ne garantit pas la liaison réelle.';
 el.append(p);
}
function rfReadSettings(){
 const num=(id,lo,hi)=>range(Number($(id).value),lo,hi);
 const s=RADIO.settings;
 s.freq=num('rfFreq',400,1000);s.eirp=num('rfEirp',-10,28);s.rxGain=num('rfRxGain',-6,16);
 s.extraLoss=num('rfLoss',0,45);s.sensitivity=num('rfSens',-155,-80);
 s.rxHeight=num('rfRxHeight',1,100);s.maxKm=num('rfRange',1,60);
 s.quality=$('rfPrecision').value;s.threshold=Number($('rfThreshold').value);
}
async function rfComputeAll(){
 if(!state.terrain){rfStatus('Charge d’abord une tuile SRTM.');return;}
 const ids=state.sites.map(s=>s.id);
 $('rfAll').disabled=true;
 try{for(const id of ids)await rfCalculateSite(id);}
 finally{$('rfAll').disabled=false;}
}
function rfImportSite(file,id){
 file.text().then(s=>{
  const obj=JSON.parse(s);
  if(obj.type!=='FeatureCollection'||!Array.isArray(obj.features))throw Error('GeoJSON invalide');
  const groups={};
  for(const ft of obj.features){
   const d=Number(ft?.properties?.dbm);
   if(!Number.isFinite(d)||!['Polygon','MultiPolygon'].includes(ft?.geometry?.type))continue;
   groups[d]=(groups[d]||[]).concat(ft);
  }
  const ok=Object.keys(groups).length>0;
  if(!ok)throw Error('Aucun polygone avec properties.dbm');
  RADIO.imports ||=new Map();RADIO.imports.set(id,{file:file.name,obj,groups});
  rfStatus('GeoJSON Site Planner importé pour '+site(id)?.name+'. Il reste distinct du modèle local.');
 }).catch(e=>rfStatus('Import impossible : '+e.message));
}
function rfPanel(){
 const prior=$('importDem').closest('section');
 const sect=document.createElement('section');sect.id='radioSection';
 sect.innerHTML=
  '<h2>Couverture des relais <small>estimation radio</small></h2>'+
  '<p class="muted">Avec le terrain SRTM : chaque station peut produire sa propre couverture. Les résultats restent exploratoires.</p>'+
  '<div class="actions"><button id="rfSelected" class="primary">Calculer ce nœud</button><button id="rfAll">Calculer tous les nœuds</button></div>'+
  '<p id="rfStatus" class="hint">Charge un relief pour lancer le calcul.</p>'+
  '<div class="toggles"><label><input id="rfShow" type="checkbox" checked> Afficher les estimations radio</label></div>'+
  '<label>Seuil du signal<select id="rfThreshold"><option value="-130">≥ −130 dBm · limite</option><option value="-117" selected>≥ −117 dBm · meilleure marge</option><option value="-109">≥ −109 dBm · signal plus fort</option></select></label>'+
  '<label>Résolution<select id="rfPrecision"><option value="preview">Rapide (72 directions)</option><option value="normal" selected>Standard (180 directions)</option><option value="fine">Fine (360 directions)</option></select></label>'+
  '<label>Transparence du résultat<input id="rfOpacity" type="range" min="10" max="80" value="35"></label>'+
  '<details><summary>Paramètres radio avancés</summary>'+
  '<label>Fréquence MHz<input id="rfFreq" type="number" value="869.525" step=".001"></label>'+
  '<label>Puissance rayonnée EIRP dBm<input id="rfEirp" type="number" value="20" step="1"></label>'+
  '<label>Gain réception dBi<input id="rfRxGain" type="number" value="0" step="1"></label>'+
  '<label>Pertes supplémentaires (clutter + réserve), dB<input id="rfLoss" type="number" value="12" step="1"></label>'+
  '<label>Sensibilité radio dBm<input id="rfSens" type="number" value="-130" step="1"></label>'+
  '<label>Hauteur du récepteur m<input id="rfRxHeight" type="number" value="2" min="1" step="1"></label>'+
  '<label>Rayon de calcul km<input id="rfRange" type="number" value="25" min="1" max="60" step="1"></label>'+
  '<p class="hint">Les paramètres ne sont pas propres à la réglementation d’un pays. Respecte la puissance rayonnée autorisée.</p></details>'+
  '<details><summary>Bilan des sauts entre les stations</summary><div id="rfLinks" class="rfLinks"></div></details>'+
  '<p class="caution">SRTM + perte libre + diffraction d’un obstacle dominant + réserve, pas Longley-Rice. Les surfaces colorées ne sont pas une garantie de réception.</p>';
 prior.parentNode.insertBefore(sect,prior);
 const group=svg('g',{id:'radioLayer'},null);
 $('estimatedLayer').parentNode.insertBefore(group,$('estimatedLayer'));
 $('rfSelected').onclick=()=>{rfReadSettings();rfCalculateSite(state.selected);};
 $('rfAll').onclick=()=>{rfReadSettings();rfComputeAll();};
 $('rfShow').onchange=e=>{RADIO.enabled=e.target.checked;rfDraw();};
 $('rfThreshold').onchange=e=>{RADIO.settings.threshold=Number(e.target.value);rfDraw();};
 $('rfOpacity').oninput=rfDraw;
 $('rfPrecision').onchange=e=>{RADIO.settings.quality=e.target.value;if(state.terrain&&site(state.selected))rfCalculateSite(state.selected);};
 for(const id of ['rfFreq','rfEirp','rfRxGain','rfLoss','rfSens','rfRxHeight','rfRange']){
  $(id).addEventListener('change',()=>{rfReadSettings();RADIO.coverage.clear();rfDraw();rfSummary();rfStatus('Paramètres modifiés : recalcule les couvertures.');});
 }
 $('map').addEventListener('pointermove',()=>{
   const drag=state.drag;
   if(!drag||drag.kind!=='site'||!state.terrain)return;
   clearTimeout(RADIO.dragPreview);
   const id=drag.id;RADIO.dragPreview=setTimeout(()=>{rfInvalidate(id);rfCalculateSite(id,'preview');},500);
 });
 $('map').addEventListener('pointerup',()=>{
   clearTimeout(RADIO.dragPreview);
   if(!state.terrain)return;
   const id=state.selected;
   rfInvalidate(id);
   setTimeout(()=>{if(site(id))rfCalculateSite(id);},0);
 });
 for(const id of ['pointLat','pointLon','pointHeight']){
  $(id).addEventListener('change',()=>{
    const which=state.selected;rfInvalidate(which);
    if(state.terrain)rfCalculateSite(which);
  });
 }
 $('delete').addEventListener('click',()=>{for(const id of [...RADIO.coverage.keys()])if(!site(id))RADIO.coverage.delete(id);rfDraw();rfSummary();});
 $('add').addEventListener('click',()=>{
   if(state.terrain)setTimeout(()=>rfCalculateSite(state.selected),0);
   rfSummary();
 });
 const oldLoadDem=loadDem;
 loadDem=async(file)=>{
  await oldLoadDem(file);
  if(state.terrain){rfStatus('Terrain chargé. Calcul du relais sélectionné…');await rfCalculateSite(state.selected);rfSummary();}
 };
 const oldRestore=restore;
 restore=async(file)=>{await oldRestore(file);RADIO.coverage.clear();rfDraw();rfSummary();};
 rfSummary();
}
rfPanel();
