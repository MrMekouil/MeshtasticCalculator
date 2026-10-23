const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../web/app.js'),'utf8');
const start=source.indexOf(' const DRAG_THRESHOLD_PX=6;');
const end=source.indexOf(" map.addEventListener('wheel'",start);
assert(start>=0&&end>start,'pointer state machine not found');
const handlers={},original={lat:43.7,lon:2.38};
const node={id:'relay',lat:original.lat,lon:original.lon};
const map={
 addEventListener(name,handler){handlers[name]=handler;},
 setPointerCapture(){},releasePointerCapture(){},hasPointerCapture(){return true;},
 getBoundingClientRect(){return {width:1000,height:800};}
};
const state={drag:null,terrain:null,selected:'pradel',token:0,view:{x:0,y:0,w:1000,h:800}};
const ctx={map,state,site:id=>id==='relay'?node:null,
 renderSites(){},renderEditor(){},renderMarkers(){},setView(){},mapBase(){},
 localXY:e=>({x:e.clientX,y:e.clientY}),
 unproject:(x,y)=>({lat:y/1000,lon:x/1000}),
 clearTimeout(){},invalidate(){},calculate(){},previewTimer:null,
 setTimeout:()=>0};
vm.createContext(ctx);
vm.runInContext(source.slice(start,end),ctx,{timeout:1000});
function e(type,props={}){
 return {pointerId:1,pointerType:'mouse',button:0,buttons:1,
 clientX:100,clientY:100,preventDefault(){},target:{closest:()=>null},...props};
}
handlers.pointermove(e('move',{buttons:0,clientX:400}));
assert.equal(state.drag,null,'hover must not start pan');
handlers.pointerdown(e('down',{button:2}));
assert.equal(state.drag,null,'right-click must not start pan');
handlers.pointerdown(e('down'));
handlers.pointermove(e('move',{clientX:104,clientY:100}));
assert.equal(state.view.x,0,'small movement stays a click');
handlers.pointermove(e('move',{clientX:121}));
assert(state.view.x<0,'drag should pan only after threshold');
handlers.pointerup(e('up',{clientX:121,buttons:0}));
assert.equal(state.drag,null,'pointerup clears capture state');
handlers.pointerdown(e('down',{target:{closest:()=>({dataset:{id:'relay'}})}}));
handlers.pointerup(e('up',{buttons:0}));
assert.equal(node.lat,original.lat,'clicking node must not move it');
handlers.pointerdown(e('down',{target:{closest:()=>({dataset:{id:'relay'}})}}));
handlers.pointermove(e('move',{clientX:150,clientY:150}));
assert.notEqual(node.lat,original.lat,'active node drag moves it');
handlers.pointercancel(e('cancel',{buttons:0}));
assert.equal(node.lat,original.lat,'pointercancel restores node position');
assert.equal(state.drag,null,'pointercancel clears drag state');
handlers.pointerdown(e('down'));
handlers.lostpointercapture(e('lost',{buttons:0}));
assert.equal(state.drag,null,'lost pointer capture clears drag state');
console.log('PASS map interactions: hover, right click, click threshold, pan, node drag, cancel, lost capture');
