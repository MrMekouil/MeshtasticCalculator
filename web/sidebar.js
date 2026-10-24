/* Compact sidebar navigation. All original form fields and listeners stay mounted;
 * we only move their sections into tab panels. Nothing is recreated or discarded.
 */
(function initSidebar(){
 const aside=document.querySelector('main > aside');
 const network=$('sites')?.closest('section'),editor=$('pointName')?.closest('section');
 const coverage=$('coverageSource')?.closest('section'),radio=$('radioSection');
 const terrain=$('importDem')?.closest('section'),mapOptions=$('base')?.closest('section');
 if(!aside||![network,editor,coverage,radio,terrain,mapOptions].every(Boolean))return;

 // Move only the optimization panel: a separate tab, but the exact same controls.
 const optimization=$('rfOptimize')?.closest('details');
 const optimizeSection=document.createElement('section');
 optimizeSection.className='sidebar-section';
 const heading=document.createElement('h2');
 heading.textContent='Optimisation des relais';
 optimizeSection.append(heading);
 if(optimization){optimization.open=true;optimizeSection.append(optimization);}

 const nav=document.createElement('nav');
 nav.id='sidebarTabs';nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Sections de MeshtasticCalculator');
 const groups=[
  ['network','Point',[editor]],
  ['coverage','Couvertures',[coverage,radio]],
  ['optimization','Optimisation',[optimizeSection]],
  ['settings','Réglages',[terrain,mapOptions]]
 ];
 const panels=new Map();
 for(const [id,label,sections] of groups){
  const button=document.createElement('button');button.type='button';button.textContent=label;
  button.dataset.tab=id;button.id='sidebar-tab-'+id;
  button.setAttribute('role','tab');
  const pane=document.createElement('div');pane.className='sidebar-pane';pane.id='sidebar-pane-'+id;
  pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',button.id);
  for(const section of sections){section.classList.add('sidebar-section');pane.append(section);}
  button.onclick=()=>activate(id);
  nav.append(button);aside.append(pane);panels.set(id,pane);
 }
 aside.prepend(nav);
 // The network site list is now a small floating card over the map, not a
 // second very long tab in the left sidebar. Keep its original DOM/events.
 const mapStack=$('mapStack');
 if(mapStack){
  const dock=document.createElement('div');dock.id='networkDock';
  dock.setAttribute('aria-label','Réseau et visibilité des nœuds');
  const toggle=document.createElement('button');toggle.type='button';
  toggle.id='networkDockToggle';toggle.textContent='Réseau · Points ▾';
  toggle.setAttribute('aria-controls','networkDockBody');
  toggle.setAttribute('aria-expanded','true');
  const body=document.createElement('div');body.id='networkDockBody';
  body.append(network);dock.append(toggle,body);mapStack.append(dock);
  toggle.onclick=()=>{
   const isOpen=!body.hidden;body.hidden=isOpen;
   toggle.setAttribute('aria-expanded',String(!isOpen));
   toggle.textContent=isOpen?'Réseau · Points ▸':'Réseau · Points ▾';
  };
 }
 function activate(id){
  for(const button of nav.querySelectorAll('[data-tab]')){
   const selected=button.dataset.tab===id;button.setAttribute('aria-selected',String(selected));
   button.tabIndex=selected?0:-1;button.classList.toggle('active',selected);
  }
  for(const [key,pane] of panels){pane.hidden=key!==id;if(key===id)pane.scrollTop=0;}
 }
 nav.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();const ids=groups.map(g=>g[0]);
  const current=ids.findIndex(id=>panels.get(id)&&!panels.get(id).hidden);
  const next=ids[(current+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length];
  activate(next);nav.querySelector('[data-tab="'+next+'"]').focus();
 });

 // User-visible opacity lives next to the network list, used by both data sources.
 const opacityLabel=document.createElement('label');
 opacityLabel.className='network-opacity';
 opacityLabel.textContent='Opacité des couvertures';
 const opacity=document.createElement('input');opacity.id='networkOpacity';
 opacity.type='range';opacity.min='10';opacity.max='90';opacity.value='38';
 opacity.setAttribute('aria-label','Opacité commune des couvertures');
 opacityLabel.append(opacity);
 const globalOptions=document.createElement('details');
 globalOptions.className='network-global-options';
 const summary=document.createElement('summary');summary.textContent='Opacité générale';
 globalOptions.append(summary,opacityLabel);
 $('sites').insertAdjacentElement('afterend',globalOptions);
 const oldOpacity=$('coverageOpacity'),localOpacity=$('rfOpacity');
 if(oldOpacity?.closest('label'))oldOpacity.closest('label').hidden=true;
 if(localOpacity?.closest('label'))localOpacity.closest('label').hidden=true;
 opacity.oninput=()=>{
  const value=Number(opacity.value);
  state.opacity=value/100;
  if(oldOpacity)oldOpacity.value=String(value);
  if(localOpacity)localOpacity.value=String(value);
  drawImported();drawEstimate();if(typeof rfDraw==='function')rfDraw();
 };
 // Single display cutoff drives both layers. Imported contours use their closest
 // exported dBm level (visible in this provenance panel), never an invented level.
 const cutLabel=$('threshold')?.closest('label');
 if(cutLabel)cutLabel.firstChild.textContent='Seuil d’affichage souhaité (dBm)';
 const note=document.createElement('div');
 note.id='thresholdProvenance';note.className='threshold-provenance';note.setAttribute('aria-live','polite');
 if(cutLabel)cutLabel.insertAdjacentElement('afterend',note);
 function levelsFor(layer){
  if(layer?.type!=='FeatureCollection'||!Array.isArray(layer.features))return [];
  return [...new Set(layer.features.map(f=>Number(f?.properties?.dbm)).filter(Number.isFinite))];
 }
 function updateThreshold(){
  const t=state.threshold;
  const lines=[];
  for(const [id,name] of [['pradel',site('pradel')?.name||'Station A'],['labru',site('labru')?.name||'Station B']]){
   const lv=levelsFor(state.layer[id]);if(!lv.length)continue;
   const applied=lv.reduce((best,x)=>Math.abs(x-t)<Math.abs(best-t)?x:best,lv[0]);
   lines.push('Site Planner · '+name+' : '+applied+' dBm'+(applied===t?'':' (palier disponible le plus proche)'));
  }
  const computed=typeof RADIO!=='undefined'&&RADIO.coverage.size;
  lines.push('Modèle local expérimental : seuil '+t+' dBm'+(computed?' · données calculées':' · non calculé'));
  note.replaceChildren();
  const heading=document.createElement('strong');heading.textContent='Seuil réellement appliqué par source';note.append(heading);
  for(const line of lines){const p=document.createElement('p');p.textContent=line;note.append(p);}
  const caveat=document.createElement('p');
  caveat.textContent='Un même seuil dBm ne rend pas les deux moteurs équivalents. Les zones locales ne sont pas validées sur le terrain.';
  note.append(caveat);
 }
 $('threshold').addEventListener('change',updateThreshold);
 // Legacy layers can be toggled from each point in Réseau; keep the underlying
 // input controls mounted for backwards compatibility but avoid duplicate UI.
 for(const id of ['showPradel','showLabru']){
  const el=$(id);
  if(el?.closest('label'))el.closest('label').hidden=true;
 }
 // The redundant per-node radio list was superseded by the eye in the Network tab.
 const olderList=$('rfVisibility');if(olderList)olderList.hidden=true;
 activate('network');updateThreshold();
 globalThis.MeshtasticSidebar={activate,updateThreshold};
})();
