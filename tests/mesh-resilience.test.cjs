const assert=require('node:assert/strict');
const {bestPath,assessSingleRelayFailure}=require('../web/mesh-resilience.js');
const nodes=['A','R1','R2','R3','B'].map(id=>({id,name:id}));
const link=(from,to,m=16)=>({from,to,marginForwardDb:m,marginReverseDb:m,verified:true});
const mesh=[
 link('A','R1'),link('R1','B'),
 link('A','R2'),link('R2','B'),
 link('A','R3',6),link('R3','B',6)
];
const result=assessSingleRelayFailure({nodes,links:mesh,source:'A',target:'B',minMarginDb:10,maxLinks:3});
assert(result.baseline&&result.baseline.links===2);
assert.deepEqual(result.criticalRelays,[]);
assert.equal(result.tolerantToOneRelayFailure,true);
assert(result.cases.every(c=>c.remainsConnected));
const serial=[link('A','R1'),link('R1','R2'),link('R2','B')];
const broken=assessSingleRelayFailure({nodes,links:serial,source:'A',target:'B',minMarginDb:10,maxLinks:4});
assert.deepEqual(broken.criticalRelays,['R1','R2']);
assert.equal(broken.tolerantToOneRelayFailure,false);
const low=[link('A','R1',9),link('R1','B',16)];
assert.equal(bestPath(nodes,low,{source:'A',target:'B',minMarginDb:10,maxLinks:3}),null);
const oneWay=[{from:'A',to:'R1',marginForwardDb:20,marginReverseDb:-5},link('R1','B')];
assert.equal(bestPath(nodes,oneWay,{source:'A',target:'B',minMarginDb:10,maxLinks:3}),null);
const missing=[{from:'A',to:'R1',marginForwardDb:20},link('R1','B')];
assert.equal(bestPath(nodes,missing,{source:'A',target:'B',minMarginDb:10,maxLinks:3}),null);
assert.equal(bestPath(nodes,serial,{source:'A',target:'B',minMarginDb:10,maxLinks:2}),null);
const copy=JSON.stringify({nodes,links:mesh});
assessSingleRelayFailure({nodes,links:mesh,source:'A',target:'B',minMarginDb:10,maxLinks:3});
assert.equal(JSON.stringify({nodes,links:mesh}),copy,'analysis must not mutate project input');
console.log('PASS single-relay resilience: redundant, serial, weak, asymmetric, missing, hops, immutability');
