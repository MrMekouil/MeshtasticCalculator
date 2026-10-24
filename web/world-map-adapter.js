/* Unified MapLibre adapter for MeshtasticCalculator.
 * One project, one site list, one radio engine. SVG is retained as a transparent
 * overlay only for existing RF vector paths. MapLibre owns pan and zoom.
 * Fallback to legacy SVG canvas if external MapLibre is unavailable.
 */
'use strict';
(async function startWorldMap(){
 const root=$('worldMap'),overlay=$('map');
 if(!root||!overlay)return;
 const STYLE={
  positron:'https://tiles.openfreemap.org/styles/positron',
  liberty:'https://tiles.openfreemap.org/styles/liberty',
  bright:'https://tiles.openfreemap.org/styles/bright',
  white:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#f8fafb'}}]}
 };
 let GL;
 try{GL=await import('https://unpkg.com/maplibre-gl@6.15.0/dist/maplibre-gl.mjs');}
 catch(error){
  root.hidden=true;
  updateStatus('Moteur de carte indisponible : ancienne vue locale temporairement utilisée ('+String(error.message||error).slice(0,85)+').');
  return;
 }
 let map;
 try{
  map=new GL.Map({
   container:'worldMap',
   style:STYLE[state.base]||STYLE.positron,
   center:[2.32339,43.61918],
   zoom:10.5,maxZoom:20,
   attributionControl:true,
   dragRotate:false,pitchWithRotate:false,
   touchPitch:false
  });
 }catch(error){
  root.hidden=true;
  updateStatus('Impossible de démarrer la carte mondiale : '+String(error.message||error).slice(0,150));
  return;
 }
 let activeStyle=state.base,styleError=0;
 const world={
  map,lib:GL,
  switchStyle(id){
   if(!Object.hasOwn(STYLE,id))return;
   activeStyle=id;styleError=0;
   try{map.setStyle(STYLE[id]);}catch(err){updateStatus('Fond refusé : '+err.message);}
  },
  sync:refreshOverlay,
  setIntensity(value){
   const amount=Math.max(0,Math.min(1,Number(value)||0));
   // Fade *only* the basemap canvas against white, not RF polygons or controls.
   const canvas=map.getCanvas();
   if(canvas)canvas.style.opacity=String(amount);
  }
 };
 globalThis.MeshtasticWorldMap=world;
 world.setIntensity(state.baseOpacity);
 document.body.classList.add('world-active');
 // MapLibre may otherwise interpret double clicks as both zoom and add-relay.
 map.doubleClickZoom.disable();
 map.addControl(new GL.NavigationControl({showCompass:false}),'top-right');

 function setOverlayDimensions(){
  const rect=root.getBoundingClientRect();
  const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
  overlay.setAttribute('viewBox','0 0 '+w+' '+h);
  overlay.setAttribute('width',String(w));
  overlay.setAttribute('height',String(h));
 }
 function projectCoveragePaths(){
  // Imported polygons retain their original world coordinates; redraw only on moveend.
  drawImported();
  // Geographic cell corners are stored in WGS84; redraw for the new viewport.
  drawEstimate();
  for(const node of state.sites){
   const cv=RADIO.coverage.get(node.id);
   if(!cv||!Array.isArray(cv.signals))continue;
   const levels=[-130,-117,-109],paths=Object.fromEntries(levels.map(x=>[x,[]]));
   const step=cv.step,rays=cv.rays;
   for(let a=0;a<rays;a++){
    const signals=cv.signals[a];
    if(!signals)continue;
    const runs=Object.fromEntries(levels.map(x=>[x,-1]));
    const theta=a*2*Math.PI/rays,half=Math.PI/rays;
    function close(level,j){
     if(runs[level]<0)return;
     const inner=Math.max(0,(runs[level]-1)*step);
     const outer=Math.min(RADIO.settings.maxKm,j*step);
     paths[level].push(rfWedge(node,inner,outer,theta-half,theta+half));
     runs[level]=-1;
    }
    for(let j=1;j<signals.length;j++){
     const val=signals[j];
     for(const level of levels){
      if(Number.isFinite(val)&&val>=level){if(runs[level]<0)runs[level]=j;}
      else close(level,j-1);
     }
    }
    for(const level of levels)close(level,signals.length-1);
   }
   cv.paths=Object.fromEntries(levels.map(t=>[t,paths[t].join('')]));
  }
  rfDraw();
 }
 function toggleCoverage(show){
  for(const id of ['coveragePradel','coverageLabru','estimatedLayer','radioLayer']){
   const el=$(id);
   if(el)el.style.visibility=show?'visible':'hidden';
  }
 }
 function refreshOverlay(){
  setOverlayDimensions();
  renderMarkers();
  projectCoveragePaths();
  toggleCoverage(true);
 }
 let raf=0;
 map.on('move',()=>{
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;renderMarkers();});
 });
 map.on('movestart',()=>toggleCoverage(false));
 map.on('moveend',refreshOverlay);
 map.on('resize',refreshOverlay);
 map.on('load',()=>{
  wipe('gridLayer');wipe('baseLayer');
  fitSites();
  refreshOverlay();
  updateStatus('Carte mondiale active : toutes les fonctions restent dans cette application.');
 });
 map.on('error',e=>{
  const message=String(e?.error?.message||'tuiles indisponibles');
  if(activeStyle==='white'){updateStatus('Carte mondiale : '+message.slice(0,110));return;}
  if(++styleError<3)return;
  const next=activeStyle==='positron'?'liberty':'white';
  world.switchStyle(next);
  $('base').value=next;state.base=next;
  updateStatus('Fond externe inaccessible ; changement vers '+next+'. Tu peux réessayer depuis Carte.');
 });
 map.on('dblclick',e=>{
  e.preventDefault();
  const c=e.lngLat;
  addRelay({lat:+c.lat.toFixed(8),lon:+c.lng.toFixed(8)});
  rfRefreshVisibility();
 });
 // Deliberately do not bind pointer events to map for SVG overlay points;
 // the legacy point-drag state machine keeps the coordinate editor synchronized.
 map.on('click',()=>{}); 
 refreshOverlay();
})();
