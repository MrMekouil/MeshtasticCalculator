/* Experimental RF estimate, distinct from imported Meshtastic Longley-Rice outputs.
 * Input: local SRTM HGT. ITU single dominant knife-edge approximation, NOT ITM.
 * All unknown terrain remains UNKNOWN, never treated as received.
 */
'use strict';
const RADIO={
  settings:{freq:869.525,eirp:20,rxGain:0,extraLoss:12,sensitivity:-130,rxHeight:2,maxKm:25,quality:'normal',threshold:-117},
  coverage:new Map(),imports:new Map(),versions:new Map(),hidden:new Set(),enabled:true,active:true,projectionVersion:0,dragPreview:null,dragged:null,suggestion:null,optimToken:0,demPersistent:false
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
// Display-only geometry from saved RSSI samples; never infer signal through NoData.
function rfLocalLevels(threshold,mode=coverageMode()){
 const t=parseThreshold(threshold);
 return t===null?[]:mode==='bands'?Array.from({length:5},(_,i)=>t+10*i).filter(x=>x<=-40):[t];
}
function rfPathsFromSignals(node,coverage,levels){
 const paths=Object.fromEntries(levels.map(t=>[t,[]]));
 if(!Array.isArray(coverage?.signals)||!coverage.rays||!coverage.step)return Object.fromEntries(levels.map(t=>[t,'']));
 for(let a=0;a<coverage.rays;a++){
  const row=coverage.signals[a];if(!row||row.length<2)continue;
  const starts=Object.fromEntries(levels.map(t=>[t,-1]));
  const theta=a*2*Math.PI/coverage.rays,half=Math.PI/coverage.rays;
  function close(t,j){
   if(starts[t]<0)return;
   const inner=Math.max(0,(starts[t]-1)*coverage.step);
   const outer=j*coverage.step;
   if(outer>inner)paths[t].push(rfWedge(node,inner,outer,theta-half,theta+half));
   starts[t]=-1;
  }
  let unknown=false;
  for(let j=1;j<row.length;j++){
   const value=row[j];if(!Number.isFinite(value))unknown=true;
   for(const t of levels){
    if(!unknown&&value>=t){if(starts[t]<0)starts[t]=j;}
    else close(t,j-1);
   }
  }
  for(const t of levels)close(t,row.length-1);
 }
 return Object.fromEntries(levels.map(t=>[t,paths[t].join('')]));
}
function rfWedge(site,km0,km1,ang0,ang1){
 const pts=[
  rfPoint(site.lat,site.lon,ang0,km0),rfPoint(site.lat,site.lon,ang0,km1),
  rfPoint(site.lat,site.lon,ang1,km1),rfPoint(site.lat,site.lon,ang1,km0)];
 return 'M'+pts.map((pt,i)=>{const p=project(pt.lon,pt.lat);return (i?'L':'')+p.x.toFixed(1)+' '+p.y.toFixed(1)}).join('')+'Z';
}
function rfBuildWedges(site,rows,preset){
 const tiers=[-130,-117,-109],paths=Object.fromEntries(tiers.map(x=>[x,[]])),signals=[];let valid=0;
 const n=preset.rays,step=preset.step,count=Math.ceil(RADIO.settings.maxKm/step);
 for(let a=0;a<n;a++){
  const elevations=rows[a];
  if(!elevations||elevations[0]===null){signals.push(null);continue;}
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
  const elev=new Array(count+1);
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
 if(globalThis.MeshtasticSidebar?.updateThreshold)globalThis.MeshtasticSidebar.updateThreshold();
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
 const t=RADIO.settings.threshold;
 for(const node of state.sites){
  if(!site(node.id)||RADIO.hidden.has(node.id))continue;
  const imported=RADIO.imports.get(node.id),calculated=RADIO.coverage.get(node.id);
  const sources=[];
  if(state.plannerVisible!==false&&imported)
   sources.push({data:imported.groups,isImport:true,fill:'#426cab',model:'Meshtastic-import'});
  if(RADIO.enabled&&calculated){
   let paths=calculated.paths,levels=displayTiers(Object.keys(paths),t);
   if(Array.isArray(calculated.signals)){
    levels=rfLocalLevels(t);
    const key=[RADIO.projectionVersion,t,coverageMode(),node.lat,node.lon,node.height].join('|');
    if(calculated.displayKey!==key){
     calculated.displayPaths=rfPathsFromSignals(node,calculated,levels);
     calculated.displayKey=key;
    }
    paths=calculated.displayPaths;
   }
   sources.push({data:paths,isImport:false,fill:'#0ea875',model:calculated.kind,levels});
  }
  for(const source of sources){
   const tiers=source.levels||displayTiers(Object.keys(source.data),t);
   for(let i=0;i<tiers.length;i++){
    const dbm=tiers[i];
    const path=source.isImport?(source.data[dbm]||[]).map(f=>rings(null,f.geometry)).join(''):source.data[dbm];
    if(!path)continue;
    const selected=node.id===state.selected;
    svg('path',{d:path,'fill-rule':'evenodd',fill:source.fill,
     'fill-opacity':nodeOpacity(node.id)*bandOpacity(i,tiers.length),
     stroke:selected?'#0d876b':'none','stroke-width':'.4',
     'vector-effect':'non-scaling-stroke','data-model':source.model,
     'data-dbm':dbm,'data-display':coverageMode()},group);
   }
  }
 }
}
function rfRefreshVisibility(){
 const parent=$('rfVisibility');if(!parent)return;parent.replaceChildren();
 for(const node of state.sites){
  const label=document.createElement('label');
  const cb=document.createElement('input');cb.type='checkbox';cb.checked=!RADIO.hidden.has(node.id);
  cb.onchange=()=>{if(cb.checked)RADIO.hidden.delete(node.id);else RADIO.hidden.add(node.id);rfDraw();};
  const name=document.createElement('span');name.textContent=' '+node.name;
  label.append(cb,name);parent.append(label);
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
 s.quality=$('rfPrecision').value;s.threshold=state.threshold;
}
async function rfComputeAll(){
 if(!state.terrain){rfStatus('Charge d’abord une tuile SRTM.');return;}
 const ids=state.sites.map(s=>s.id);
 $('rfAll').disabled=true;
 try{for(const id of ids)await rfCalculateSite(id);}
 finally{$('rfAll').disabled=false;}
}
function rfImportSite(file,id){
 if(!id||!site(id))return;
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
  RADIO.imports.set(id,{file:file.name,obj,groups});rfDraw();
  rfStatus('GeoJSON Site Planner importé pour '+site(id)?.name+'. Il reste distinct du modèle local.');
 }).catch(e=>rfStatus('Import impossible : '+e.message));
}
function rfFailureReport(override={}){
 if(!state.terrain||!globalThis.MeshtasticResilience)return null;
 const nodes=state.sites.map(n=>override[n.id]?{...n,...override[n.id]}:n);
 const links=[];let unknown=0;
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const ab=rfTerrainLink(nodes[i],nodes[j]),ba=rfTerrainLink(nodes[j],nodes[i]);
  if(!ab||!ba){unknown++;continue;}
  links.push({from:nodes[i].id,to:nodes[j].id,marginForwardDb:ab.margin,marginReverseDb:ba.margin});
 }
 const minMarginDb=Number($('rfMinMargin').value);
 const maxLinks=Number($('rfMaxHops').value);
 return {...globalThis.MeshtasticResilience.assessSingleRelayFailure({
  nodes,links,source:'pradel',target:'labru',minMarginDb,maxLinks
 }),unknown,known:links.length,links};
}
function rfCheckRedundancy(overrides={},preview=false){
 const target=$('rfRedundancyResult');if(!target)return null;
 target.replaceChildren();
 if(!$('rfRedundancy').checked){target.textContent='Redondance désactivée.';return null;}
 const report=rfFailureReport(overrides);
 if(!report){target.textContent='Charge le terrain SRTM pour analyser les chemins alternatifs.';return null;}
 const headline=document.createElement('p');
 headline.textContent=!report.baseline
  ?'Aucun trajet nominal démontré avec les marges exigées.'
  :report.tolerantToOneRelayFailure
   ?(report.cases.length?'Tous les scénarios de panne simple étudiés conservent un trajet estimé.':'Liaison directe estimée : aucun relais à tester.')
   :'Réseau non redondant selon le modèle : '+report.criticalRelays.length+' relais critique(s).';
 target.append(headline);
 const details=document.createElement('p');details.className='hint';
 details.textContent=(preview?'Position proposée (pas encore appliquée). ':'')+
   report.known+' liaisons évaluées, '+report.unknown+' inconnues. Modèle radio simplifié non validé.';
 target.append(details);
 const detailsLinks=document.createElement('details');detailsLinks.className='rf-link-audit';
 const head=document.createElement('summary');
 head.textContent='Voir les marges des '+report.known+' liaisons radio estimées';
 detailsLinks.append(head);
 const required=Number($('rfMinMargin').value);
 for(const l of report.links.slice().sort((a,b)=>
  Math.min(a.marginForwardDb,a.marginReverseDb)-Math.min(b.marginForwardDb,b.marginReverseDb))){
  const min=Math.min(l.marginForwardDb,l.marginReverseDb);
  const line=document.createElement('p');line.className='hint';
  const first=site(l.from)?.name||l.from,second=site(l.to)?.name||l.to;
  line.textContent=first+' ↔ '+second+' : '+min.toFixed(1)+
    ' dB de marge minimale ('+(min>=required?'admissible':'insuffisante')+
    ', seuil '+required.toFixed(1)+' dB)';
  detailsLinks.append(line);
 }
 const warning=document.createElement('p');warning.className='hint';
 warning.textContent='Une liaison évaluée n’est pas forcément admissible. Liens pointillés sur la carte = ordre géographique, pas preuve de réception radio.';
 detailsLinks.append(warning);target.append(detailsLinks);
 for(const c of report.cases){
  const row=document.createElement('p');row.className='hint';
  row.textContent=c.nodeName+' hors ligne : '+(c.remainsConnected
   ?'itinéraire '+c.alternatePath.nodes.join(' → ')+', marge minimale '+c.alternatePath.minMarginDb.toFixed(1)+' dB'
   :'pas de chemin alternatif démontré');
  target.append(row);
 }
 return report;
}
async function rfSuggestPosition(){
 if(!state.terrain){
  rfStatus('Impossible : charge le terrain SRTM.');
  $('rfCandidate').textContent='Aucune proposition : relief SRTM non chargé.';
  return;
 }
 const id=state.selected,node=site(id);
 const route=[site('pradel'),...relayList(),site('labru')].filter(Boolean);
 const idx=route.findIndex(x=>x.id===id);
 if(!node||node.type!=='relay'||idx<1||idx>=route.length-1){rfStatus('Sélectionne un relais intermédiaire.');return;}
 const p=route[idx-1],n=route[idx+1],version=++RADIO.optimToken;
 RADIO.suggestion=null;
 $('rfApply').disabled=true;
 $('rfCandidate').textContent='Recherche en cours : le relais actuel reste à sa place.';
 renderMarkers();
 const center={lat:node.lat,lon:node.lon};
 const latitudeDegrees=1/111.195;
 const longitudeDegrees=1/(111.195*Math.cos(center.lat*rad));
 let best=null,checked=0;
 const evaluate=(lat,lon)=>{
  const elevation=heightAt(lat,lon);if(elevation===null)return null;
  const cand={...node,lat,lon};
  const inbound=rfTerrainLink(p,cand),outbound=rfTerrainLink(cand,n);
  if(!inbound||!outbound)return null;
  return {lat,lon,score:Math.min(inbound.margin,outbound.margin),links:[inbound,outbound]};
 };
 let original=evaluate(node.lat,node.lon);
 best=original?{...original}:null;
 const coarseKm=12,stepKm=1.5;
 $('rfOptimize').disabled=true;
 rfStatus('Recherche de positions SRTM dans un rayon de 12 km…');
 try{
  for(let x=-coarseKm;x<=coarseKm;x+=stepKm){
   if(version!==RADIO.optimToken||!site(id))return;
   for(let y=-coarseKm;y<=coarseKm;y+=stepKm){
     if(x*x+y*y>coarseKm*coarseKm)continue;
     const candidate=evaluate(center.lat+y*latitudeDegrees,center.lon+x*longitudeDegrees);
     checked++;
     if(candidate&&(!best||candidate.score>best.score))best=candidate;
   }
   await new Promise(r=>setTimeout(r,0));
  }
  if(best){
   const seed={lat:best.lat,lon:best.lon};
   for(let x=-1.5;x<=1.5001;x+=.3){
    if(version!==RADIO.optimToken||!site(id))return;
    for(let y=-1.5;y<=1.5001;y+=.3){
     const candidate=evaluate(seed.lat+y*latitudeDegrees,seed.lon+x*longitudeDegrees);
     checked++;
     if(candidate&&candidate.score>best.score)best=candidate;
    }
    await new Promise(r=>setTimeout(r,0));
   }
  }
  if(!best){
   rfStatus('Aucun emplacement candidat entièrement couvert par les données SRTM.');
   $('rfCandidate').textContent='Aucune position proposée dans les zones SRTM évaluées.';
   return;
  }
  RADIO.suggestion={id,original,best};
  $('rfApply').disabled=false;
  renderMarkers();
  const delta=original?(best.score-original.score).toFixed(1):'inconnu';
  $('rfCandidate').textContent='Position proposée, non appliquée : '+
    best.lat.toFixed(6)+', '+best.lon.toFixed(6)+
    ' · marge minimale estimée '+best.score.toFixed(1)+' dB' +
    ' · gain '+delta+' dB · '+checked+' positions testées. '+
    'Marqueur orange sur la carte ; accès au terrain non vérifié.';
  if($('rfRedundancy').checked)rfCheckRedundancy({[id]:{lat:best.lat,lon:best.lon}},true);
  rfStatus('Candidat : '+best.lat.toFixed(5)+', '+best.lon.toFixed(5)+
    ' · marge minimale ≈ '+best.score.toFixed(1)+' dB (gain '+delta+' dB), sur '+checked+
    ' positions explorées. Accès au terrain NON vérifié. Clique « Appliquer » uniquement pour essayer.');
 }finally{$('rfOptimize').disabled=false;}
}
function rfApplySuggestion(){
 const rec=RADIO.suggestion,node=rec&&site(rec.id);
 if(!node){rfStatus('Aucune proposition disponible.');return;}
 const {lat,lon}=rec.best;
 node.lat=+lat.toFixed(6);node.lon=+lon.toFixed(6);
 RADIO.suggestion=null;$('rfApply').disabled=true;
 $('rfCandidate').textContent='Proposition appliquée à '+node.name+'. Nouveau calcul radio expérimental à vérifier.';
 rfInvalidate(node.id);
 state.selected=node.id;render();fitSites();
 rfStatus('Point déplacé vers la proposition géométrique. Vérifie l’accès réel et valide les liaisons dans Site Planner.');
 if(state.terrain)rfCalculateSite(node.id);
 if($('rfRedundancy').checked)rfCheckRedundancy();
}
async function rfDb(){
 if(!('indexedDB' in window))throw Error('Cache navigateur indisponible');
 return await new Promise((resolve,reject)=>{
  const req=indexedDB.open('MeshtasticCalculatorTerrain',1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('tiles'))req.result.createObjectStore('tiles',{keyPath:'name'});};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('IndexedDB refusé'));
 });
}
async function rfStoreTile(file){
 try{
  const db=await rfDb();
  await new Promise((resolve,reject)=>{
   const tx=db.transaction('tiles','readwrite');
   tx.objectStore('tiles').put({name:file.name,blob:file,updated:Date.now()});
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  });db.close();
  RADIO.demPersistent=true;
  $('demInfo').textContent+=' Terrain mémorisé localement dans ce navigateur.';
 }catch(_){/* Storage is optional on file://, never block imported terrain. */}
}
async function rfRestoreTiles(){
 try{
  if(state.terrain)return;
  const db=await rfDb();
  const items=await new Promise((resolve,reject)=>{
   const tx=db.transaction('tiles','readonly'),req=tx.objectStore('tiles').getAll();
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });db.close();
  if(state.terrain)return; // user selected a different file while storage opened
  for(const item of items.slice(0,12)){
   const blob=item.blob;
   if(!blob)continue;
   await loadDem(new File([blob],item.name,{type:'application/octet-stream'}));
  }
  if(items.length)rfStatus(items.length+' tuile(s) SRTM réutilisée(s) depuis le navigateur.');
 }catch(_){/* Firefox file:// can block storage. Manual HGT remains available. */}
}
function rfPanel(){
 const prior=$('importDem').closest('section');
 const sect=document.createElement('section');sect.id='radioSection';
 sect.innerHTML=
  '<h2>Couverture des relais <small>estimation radio</small></h2>'+
  '<p class="muted">Avec le terrain SRTM : chaque station peut produire sa propre couverture. Les résultats restent exploratoires.</p>'+
  '<div class="actions"><button id="rfSelected" class="primary">Calculer ce nœud</button><button id="rfAll">Calculer tous les nœuds</button></div>'+
  '<details open><summary>Optimisation du trajet et des relais</summary><p class="hint">Recherche indicative du relais avec la meilleure marge minimale vers ses deux voisins. Les terrains privés, routes et obstacles locaux ne sont pas vérifiés.</p>'+
  '<label><input type="checkbox" id="rfRedundancy"> Étudier aussi la redondance (optionnel)</label>'+
  '<label>Marge minimale exigée (dB)<input id="rfMinMargin" type="number" value="10" min="-20" max="35"></label>'+
  '<label>Nombre maximal de sauts<input id="rfMaxHops" type="number" value="7" min="1" max="7"></label>'+
  '<div class="actions"><button id="rfOptimize">Chercher un emplacement</button><button id="rfApply" disabled>Appliquer</button></div>'+
  '<p id="rfCandidate" class="hint" role="status" aria-live="polite">Aucune position proposée. La recherche ne déplacera pas le relais avant « Appliquer ».</p>'+
  '<button id="rfTestFailure" class="block" disabled>Tester les pannes des relais</button>'+
  '<div id="rfRedundancyResult" class="hint">Redondance désactivée par défaut.</div>'+
  '<p class="hint">L’option vérifie les chemins alternatifs pour le placement proposé ; elle ne recherche pas encore automatiquement des relais supplémentaires.</p></details>'+
  '<p id="rfStatus" class="hint">Pour calculer la couverture d’un nouveau point, charge d’abord son relief SRTM (si non mémorisé).</p>'+
  '<button id="rfChooseTerrain" class="block">Charger un terrain SRTM (HGT)</button>'+
  '<div class="actions"><label class="btn">Importer GeoJSON du point sélectionné<input id="rfImport" type="file" accept=".geojson,.json" hidden></label><button id="rfClearImport">Retirer import</button></div>'+
  '<fieldset class="coverage-source-switches"><legend>Sources de couverture</legend>'+
  '<label><input id="plannerShow" type="checkbox" checked> Site Planner · couvertures importées (bleu/orange)</label>'+
  '<label><input id="rfShow" type="checkbox" checked> Estimations expérimentales locales (vert)</label>'+
  '<p class="hint">Les deux sources se masquent sans effacer les données. L’œil dans « Réseau » agit sur un seul nœud.</p></fieldset>'+
  '<label hidden>Seuil interne synchronisé<input id="rfThreshold" type="number" min="-160" max="-40" step="1" value="-117"></label>'+
  '<label>Résolution<select id="rfPrecision"><option value="preview">Rapide (72 directions)</option><option value="normal" selected>Standard (180 directions)</option><option value="fine">Fine (360 directions)</option></select></label>'+
  '<label hidden>Opacité interne<input id="rfOpacity" type="range" min="10" max="90" value="38"></label>'+
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
 $('rfChooseTerrain').onclick=()=>$('importDem').click();
 $('rfSelected').onclick=()=>{rfReadSettings();rfCalculateSite(state.selected);};
 $('rfImport').onchange=e=>{if(e.target.files[0])rfImportSite(e.target.files[0],state.selected);e.target.value='';};
 $('rfClearImport').onclick=()=>{RADIO.imports.delete(state.selected);rfDraw();rfStatus('Couverture importée retirée du nœud sélectionné.');};
 $('rfAll').onclick=()=>{rfReadSettings();rfComputeAll();};
 $('rfOptimize').onclick=()=>{rfReadSettings();rfSuggestPosition();};
 $('rfRedundancy').onchange=e=>{
  $('rfTestFailure').disabled=!e.target.checked;
  if(e.target.checked)rfCheckRedundancy();
  else $('rfRedundancyResult').textContent='Redondance désactivée.';
 };
 $('rfTestFailure').onclick=()=>rfCheckRedundancy();
 $('rfApply').onclick=rfApplySuggestion;
 $('plannerShow').onchange=e=>{state.plannerVisible=e.target.checked;drawImported();rfDraw();};
  $('rfShow').onchange=e=>{RADIO.enabled=e.target.checked;rfDraw();};
 $('rfThreshold').onchange=e=>{
   const t=parseThreshold(e.target.value);
   if(t===null){e.target.value=String(state.threshold);return;}
   RADIO.settings.threshold=state.threshold=t;$('threshold').value=String(t);
   rfDraw();drawImported();
  };
  $('rfOpacity').oninput=rfDraw;
 $('rfPrecision').onchange=e=>{RADIO.settings.quality=e.target.value;if(state.terrain&&site(state.selected))rfCalculateSite(state.selected);};
 for(const id of ['rfFreq','rfEirp','rfRxGain','rfLoss','rfSens','rfRxHeight','rfRange']){
  $(id).addEventListener('change',()=>{rfReadSettings();RADIO.coverage.clear();rfDraw();rfSummary();rfStatus('Paramètres modifiés : recalcule les couvertures.');});
 }
 $('map').addEventListener('pointermove',()=>{
   const drag=state.drag;
   if(!drag||drag.kind!=='site'||!state.terrain)return;
   clearTimeout(RADIO.dragPreview);
   const id=drag.id;RADIO.dragged=id;RADIO.dragPreview=setTimeout(()=>{rfInvalidate(id);rfCalculateSite(id,'preview');},500);
 });
 $('map').addEventListener('pointerup',()=>{
   clearTimeout(RADIO.dragPreview);
   if(!state.terrain||!RADIO.dragged)return;
   const id=RADIO.dragged;RADIO.dragged=null;
   rfInvalidate(id);
   setTimeout(()=>{if(site(id))rfCalculateSite(id);},0);
 });
 for(const id of ['pointLat','pointLon','pointHeight']){
  $(id).addEventListener('change',()=>{
    const which=state.selected;rfInvalidate(which);
    if(state.terrain)rfCalculateSite(which);
  });
 }
 $('delete').addEventListener('click',()=>{for(const id of [...RADIO.coverage.keys()])if(!site(id))RADIO.coverage.delete(id);for(const id of [...RADIO.imports.keys()])if(!site(id))RADIO.imports.delete(id);rfDraw();rfSummary();});
 $('add').addEventListener('click',()=>{
   if(state.terrain)setTimeout(()=>rfCalculateSite(state.selected),0);
   rfSummary();
 });
 $('map').addEventListener('dblclick',()=>{if(state.terrain)setTimeout(()=>rfCalculateSite(state.selected),0);});
 const oldLoadDem=loadDem;
 loadDem=async(file)=>{
  const before=state.terrains?.length||0;
  await oldLoadDem(file);
  if(state.terrain){
    void rfStoreTile(file); // cache best-effort; never delay RF simulation
    rfStatus('Terrain chargé. Calcul du relais sélectionné…');
    await rfCalculateSite(state.selected);rfSummary();
  }
 };
 const oldRestore=restore;
 restore=async(file)=>{
  let raw,data;
  // Parse and validate *before* invoking any mutating restore logic.
  try{
   raw=await file.text();
   data=JSON.parse(raw);
  }catch(e){
   updateStatus('Projet refusé : JSON illisible ou mal formé ('+e.message+').');
   return false;
  }
  const accepted=await oldRestore({text:async()=>raw});
  if(!accepted)return false;
  try{
   RADIO.optimToken++;
   RADIO.suggestion=null;
   const apply=$('rfApply');if(apply)apply.disabled=true;
   const candidate=$('rfCandidate');if(candidate)candidate.textContent='Aucune position proposée.';
   RADIO.coverage.clear();RADIO.imports.clear();
   RADIO.hidden=new Set((Array.isArray(data.hiddenCoverages)?data.hiddenCoverages:[])
     .filter(id=>typeof id==='string'&&!!site(id)));
   const imports=data.radioImports&&typeof data.radioImports==='object'&&!Array.isArray(data.radioImports)
      ?data.radioImports:{};
   for(const [id,obj] of Object.entries(imports)){
    if(!site(id)||!obj||obj.type!=='FeatureCollection'||!Array.isArray(obj.features))continue;
    const groups={};
    for(const f of obj.features){
     const dbm=Number(f?.properties?.dbm);
     if(Number.isFinite(dbm)&&['Polygon','MultiPolygon'].includes(f?.geometry?.type))
       (groups[dbm]??=[]).push(f);
    }
    if(Object.keys(groups).length)RADIO.imports.set(id,{file:'Projet importé',obj,groups});
   }
   rfDraw();rfSummary();rfRefreshVisibility();renderMarkers();
   return true;
  }catch(e){
   updateStatus('Projet restauré, certaines couvertures supplémentaires sont invalides : '+e.message);
   RADIO.imports.clear();rfDraw();rfSummary();rfRefreshVisibility();
   return true;
  }
};
 rfSummary();rfRefreshVisibility();
 rfRestoreTiles();
}
rfPanel();
