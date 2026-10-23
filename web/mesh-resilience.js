/* Predicted topology connectivity, not a Meshtastic routing implementation.
 * Only supplied, bidirectionally eligible links with numeric two-way margins
 * can be used. Never derive RF quality from geographic distance here.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.MeshtasticResilience=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 function bestPath(nodes,links,options={}){
  const idSet=new Set(nodes.map(n=>n.id));
  const source=options.source,target=options.target;
  const removed=new Set(options.removed||[]);
  const minMargin=Number.isFinite(options.minMarginDb)?options.minMarginDb:10;
  const maxLinks=Number.isInteger(options.maxLinks)?Math.max(1,Math.min(64,options.maxLinks)):7;
  if(!idSet.has(source)||!idSet.has(target)||removed.has(source)||removed.has(target))return null;
  if(source===target)return {nodes:[source],minMarginDb:Infinity,links:0};
  // Bidirectional usability is required because delivery acknowledgements may need a return path.
  const adjacency=new Map([...idSet].filter(id=>!removed.has(id)).map(id=>[id,[]]));
  for(const l of links){
   if(!adjacency.has(l.from)||!adjacency.has(l.to)||l.from===l.to)continue;
   const ab=Number(l.marginForwardDb),ba=Number(l.marginReverseDb);
   if(!Number.isFinite(ab)||!Number.isFinite(ba)||l.verified===false)continue;
   const m=Math.min(ab,ba);
   if(m<minMargin)continue;
   adjacency.get(l.from).push({id:l.to,margin:m});
   adjacency.get(l.to).push({id:l.from,margin:m});
  }
  // DP: maximum bottleneck margin for each node at each bounded number of hops.
  const best=Array.from({length:maxLinks+1},()=>new Map());
  best[0].set(source,{score:Infinity,path:[source]});
  let candidate=null;
  for(let k=1;k<=maxLinks;k++){
   for(const [id,state] of best[k-1]){
    for(const next of adjacency.get(id)||[]){
     // Use walks in the bounded dynamic program: a maximum-bottleneck
     // feasible walk always has a cycle-free counterpart with <= hops.
     // Pruning by one stored path would otherwise hide viable continuations.
     const score=Math.min(state.score,next.margin);
     const existing=best[k].get(next.id);
     if(!existing||score>existing.score)best[k].set(next.id,{score,path:[...state.path,next.id]});
    }
   }
   const found=best[k].get(target);
   if(found&&(!candidate||found.score>candidate.minMarginDb||(found.score===candidate.minMarginDb&&k<candidate.links))){
    candidate={nodes:found.path,minMarginDb:found.score,links:k};
   }
  }
  return candidate;
 }
 function assessSingleRelayFailure({nodes,links,source,target,minMarginDb=10,maxLinks=7}){
  if(!Array.isArray(nodes)||!Array.isArray(links))throw Error('nodes and links arrays are required');
  const allIds=nodes.map(n=>n.id);
  if(allIds.some(id=>typeof id!=='string'||!id)||new Set(allIds).size!==allIds.length)
    throw Error('Node IDs must be unique non-empty strings');
  if(!allIds.includes(source)||!allIds.includes(target)||source===target)throw Error('Distinct endpoints required');
  const opts={source,target,minMarginDb,maxLinks};
  const base=bestPath(nodes,links,opts);
  const failureCases=[];
  for(const node of nodes){
   if(node.id===source||node.id===target)continue;
   const alternative=bestPath(nodes,links,{...opts,removed:[node.id]});
   failureCases.push({nodeId:node.id,nodeName:node.name||node.id,
    remainsConnected:!!alternative,alternatePath:alternative});
  }
  return {
   model:'predicted-bidirectional-link-graph',
   baseline:base,
   cases:failureCases,
   criticalRelays:failureCases.filter(x=>!x.remainsConnected).map(x=>x.nodeId),
   tolerantToOneRelayFailure:!!base&&failureCases.every(x=>x.remainsConnected),
   minMarginDb,maxLinks,
   warning:'Connectivity only under the supplied link matrix. Not a real-world or firmware failover guarantee.'
  };
 }
 return {bestPath,assessSingleRelayFailure};
});
