const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..','web',file),'utf8');
const app=read('app.js'),radio=read('radio.js'),html=read('index.html');
const begin=app.indexOf('function adjustPointByMeters('),end=app.indexOf('function centerOnSelectedPoint',begin);
assert(begin>=0&&end>begin,'fine placement function exists');
const point={id:'r1',lat:43.7,lon:2.38,height:8};
const ui={getElementById:()=>({textContent:''})};
const ctx={site:()=>point,state:{selected:'r1',terrain:null},rad:Math.PI/180,
range:(x,a,b)=>Math.max(a,Math.min(b,x)),invalidate(){},
renderEditor(){},renderMarkers(){},renderSites(){},setTimeout,clearTimeout,document:ui};
vm.createContext(ctx);vm.runInContext(app.slice(begin,end),ctx);
ctx.adjustPointByMeters('n',100);ctx.adjustPointByMeters('e',10);
assert(Math.abs((point.lat-43.7)*111320-100)<0.002);
assert(Math.abs((point.lon-2.38)*111320*Math.cos(point.lat*Math.PI/180)-10)<0.002);
assert(!Number.isNaN(point.lat)&&!Number.isNaN(point.lon));
const rb=radio.indexOf('function rfRefreshVisibility(){'),re=radio.indexOf('function rfSummary(){',rb);
assert(rb>=0&&re>rb);
const area={children:[],replaceChildren(){this.children=[]},append(x){this.children.push(x)}};
const d={createElement(tag){return {tag,children:[],append(...a){this.children.push(...a)},type:'',checked:false,onchange:null,textContent:''}}};
const opts={hidden:new Set()},ctx2={state:{sites:[{id:'r1',name:'Relais 1'},{id:'r2',name:'Relais 2'}]},
RADIO:opts,$:()=>area,document:d,rfDraw(){}};
vm.createContext(ctx2);vm.runInContext(radio.slice(rb,re),ctx2);ctx2.rfRefreshVisibility();
assert.equal(area.children.length,2);
area.children[1].children[0].checked=false;area.children[1].children[0].onchange();
assert(opts.hidden.has('r2')&&!opts.hidden.has('r1'));
assert.equal((html.match(/class="precision-panel"/g)||[]).length,1);
assert.equal((html.match(/data-nudge="/g)||[]).length,4);
assert(app.includes('hiddenCoverages:')&&radio.includes('data.hiddenCoverages'),'save and restore visible layers');
console.log('PASS fine placement and independent coverage visibility');
