(() => {
'use strict';
const $ = id => document.getElementById(id);
const districts = [
 {id:'heart',name:'炽日之心',short:'之心',code:'C0',kind:'中央综合服务',color:'#ffc27a',description:'城市的中央枢纽。政务、公共服务与放射线在此汇合，连接八个分区以及天梯换乘口。',facilities:[['中央政务厅','政务','综合办事与城市管理'],['市民服务中心','服务','公共服务、访客咨询与社区事务'],['中央医疗中心','医疗','综合诊疗与各区医疗转接'],['天梯换乘口','交通','概念天梯接口与轨道交通换乘']],x:600,y:520},
 {id:'research',name:'启明科研区',short:'启明',code:'N1',kind:'科研创新',color:'#ad9aef',description:'实验室与研究设施集中布局，以科学创新、技术试验和学术交流为主。通过放射线直接连接中央服务区。',facilities:[['启明实验中心','科研','材料与生命科学概念实验设施'],['轨道观测台','科研','太空观测与科研参观节点'],['技术交流馆','文化','研究成果展示与学术交流'],['科研服务站','服务','科研人员与访客服务']]},
 {id:'tourism',name:'望乡旅游区',short:'望乡',code:'N2',kind:'旅游度假',color:'#57d4d5',description:'面向地球的观景与休闲片区。观景长廊、滨水步道和文化广场组成连续游览线，度假酒店靠近换乘站。',facilities:[['观景长廊','观光','环形观景平台，地球与轨道景观'],['度假酒店','住宿','游客住宿与换乘接待'],['文化广场','文化','展演、集会与公共休闲'],['滨水步道','观光','水景游览与无障碍步行接驳']]},
 {id:'port',name:'星港特区',short:'星港',code:'N3',kind:'星际交通',color:'#6d9ff3',description:'航天器停靠、乘客转运与商贸服务片区。环城线衔接望乡旅游区与安栖居民区，放射线通往中央换乘枢纽。',facilities:[['星港客运厅','交通','到港、离港与旅客接待'],['轨道接驳平台','交通','航天器与城市运输系统衔接'],['星港商贸中心','商业','旅客购物与商业服务'],['访客服务台','服务','导览咨询与换乘信息']]},
 {id:'residential',name:'安栖居民区',short:'安栖',code:'N4',kind:'居住生活',color:'#ffa65d',description:'住宅与社区公共服务组成紧凑的生活片区。社区学校、医院和邻里公园通过步行网络与安栖站相连。',facilities:[['住宅组团','居住','住宅、社区活动与生活配套'],['社区医院','医疗','日常诊疗、健康管理与急救转接'],['社区学校','教育','基础教育与社区学习空间'],['邻里公园','休闲','家庭活动、运动与公共绿地']]},
 {id:'university',name:'薪火大学区',short:'薪火',code:'N5',kind:'高等教育',color:'#ef8fbb',description:'高等教育与人才培养片区。教学楼、图书馆和学生生活区围绕校园步行轴组织，与科研区共享城市交通网络。',facilities:[['薪火教学中心','教育','课堂、教学实验与公共学习'],['大学图书馆','教育','阅读、自习与数字知识服务'],['学生生活区','居住','学生住宿与日常生活配套'],['校园运动场','运动','校园运动与公共健身']]},
 {id:'agriculture',name:'绿野农业区',short:'绿野',code:'N6',kind:'农业生产',color:'#9bce79',description:'农业舱、水循环与生态景观结合的生产片区。生产设施和参观节点独立接驳，连接环城运输与城市供应系统。',facilities:[['生态温室','农业','受控环境种植与农业参观'],['垂直农场','农业','分层作物生产概念设施'],['水循环中心','设施','灌溉与循环水处理示意'],['农业展示馆','文化','农业科普与生产展示']]},
 {id:'industrial',name:'熔炉工业区',short:'熔炉',code:'N7',kind:'工业制造',color:'#a2b1c2',description:'制造、维修与能源加工片区。工业设施集中设置，客运交通与生产物流采用分开的概念组织方式。',facilities:[['制造工坊','工业','制造与材料加工概念设施'],['设备维修中心','工业','城市设备与航天部件维护'],['能源加工站','设施','能源加工与供应接口示意'],['工业物流站','物流','生产物资的集中装卸与转运']]},
 {id:'security',name:'铁壁保障区',short:'铁壁',code:'N8',kind:'安全与保障',color:'#8da5df',description:'安全、应急与物资保障片区。应急协调、救援与储备设施通过环城线和放射线服务全城。',facilities:[['应急指挥中心','应急','城市应急协调与公共响应'],['物资储备库','物流','食品、医疗与维护物资概念储备'],['救援保障站','应急','救援装备与人员接驳'],['安全教育馆','文化','公共安全教育与演练空间']]}
];
const drawingData=[['overview','城市总览','整体结构与轨道环境'],['birdseye','垂直鸟瞰','中央环城与卫星舱布局'],['section','结构剖面','居住舱、防护与水循环'],['navigation','交通导航','安栖经星港前往望乡'],['transit','交通实景','车站、磁悬浮与换乘'],['planning','分区规划','一心八区与重点区详图']];
const angles = districts.slice(1).map((d,i)=>-Math.PI/2+i*Math.PI/4);
const pt=(a,r)=>({x:600+Math.cos(a)*r,y:520+Math.sin(a)*r});
districts.slice(1).forEach((d,i)=>Object.assign(d,pt(angles[i],430),{angle:angles[i],index:i}));
const nodes=new Map(),edges=[];
const addNode=n=>nodes.set(n.id,n);
const edge=(a,b,time,line)=>edges.push({a,b,time,line});
addNode({id:'hub',name:'中央站',x:600,y:520,district:'heart',type:'station'});
districts.slice(1).forEach(d=>{
 const p=pt(d.angle,285);d.station='s'+d.index;
 addNode({id:d.station,name:d.short+'站',...p,district:d.id,type:'station'});
 edge('hub',d.station,4,'放射线');
});
for(let i=0;i<8;i++)edge('s'+i,'s'+((i+1)%8),3,'环城线');
districts.forEach(d=>{
 d.facilities=d.facilities.map((f,i)=>{
   const offset=d.id==='heart'?[[0,-52],[-50,25],[50,25],[0,125]][i]:[[-45,35],[45,35],[-45,72],[45,72]][i];
   const n={id:d.id+'-p'+i,name:f[0],category:f[1],description:f[2],x:d.x+offset[0],y:d.y+offset[1],district:d.id,type:'facility'};
   addNode(n);edge(d.id==='heart'?'hub':d.station,n.id,d.id==='heart'?2:3,'步行接驳');return n;
 });
});
const state={selected:'residential',facility:null,mode:'schematic',layers:{zones:true,transit:true,pois:true},route:null,zoom:1,pan:{x:0,y:0}};
const svg=$('city-map');const NS='http://www.w3.org/2000/svg';
function el(type,attrs,parent){const n=document.createElementNS(NS,type);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(parent)parent.appendChild(n);return n;}
function path(points){return points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ');}
function svgButton(parent,p,w,h,label,cls,callback,aria){
 const fo=el('foreignObject',{x:p.x-w/2,y:p.y-h/2,width:w,height:h},parent);const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.setAttribute('aria-label',aria||label);b.addEventListener('click',e=>{e.stopPropagation();callback();});fo.appendChild(b);return {fo,b};
}
const mapDistrictButtons=new Map(),mapFacilityButtons=new Map(),stationButtons=new Map();
function draw(){
 const zones=$('zone-shapes'),transit=$('transit-lines'),fac=$('facility-shapes'),labels=$('map-labels');
 districts.forEach(d=>{
  d.shape=el('circle',{cx:d.x,cy:d.y,r:d.id==='heart'?96:105,fill:d.color,'fill-opacity':'.1',stroke:d.color,'stroke-opacity':'.6',class:'district-shape','data-district':d.id},zones);
  const y=d.id==='heart'?d.y-8:d.y-40;const label=svgButton(labels,{x:d.x,y},190,d.id==='heart'?55:65,d.name,'map-place'+(d.id==='heart'?' center-label':''),()=>selectDistrict(d.id),d.name+'：查看区域详情');
  label.fo.dataset.zoneLabel=d.id;mapDistrictButtons.set(d.id,label.b);
  if(d.id!=='heart'){const code=document.createElement('small');code.textContent=d.code+' / '+d.kind;label.b.appendChild(code);}
 });
 el('circle',{cx:600,cy:520,r:285,class:'ring-path'},transit);
 el('circle',{cx:600,cy:520,r:296,fill:'none',stroke:'#64d8cb','stroke-width':'1','stroke-opacity':'.25'},transit);
 districts.slice(1).forEach(d=>el('path',{d:path([nodes.get('hub'),nodes.get(d.station),d]),class:'radial-path'},transit));
 districts.forEach(d=>d.facilities.forEach((n,i)=>{
  const gp=el('g',{'data-facility':n.id},fac);const station=nodes.get(d.id==='heart'?'hub':d.station);
  el('path',{d:path([station,n]),class:'local-path'},gp);
  el('rect',{x:n.x-18,y:n.y-12,width:36,height:24,rx:3,fill:d.color,stroke:d.color,class:'poi-footprint'},gp);
  const b=svgButton(gp,{x:n.x,y:n.y},108,34,n.name,'facility-button',()=>selectFacility(n.id),n.name+'，'+n.category+'，查看设施详情');mapFacilityButtons.set(n.id,b.b);
 }));
 for(const n of nodes.values())if(n.type==='station'){
  if(n.id==='hub')continue;
  const b=svgButton(labels,n,42,42,nodes.get(n.id).id.slice(1)*1+1+'','station-button',()=>{selectDistrict(n.district);openPanel('route');$('route-to').value=n.id;planRoute();},n.name+'：规划到站路线');
  b.fo.dataset.stationLabel=n.id;stationButtons.set(n.id,b.b);
 }
 updateLayers();updateSelection();
}
function updateLayers(){
 $('zone-shapes').style.display=state.layers.zones?'':'none';
 $('transit-lines').style.display=state.layers.transit?'':'none';
 $('facility-shapes').style.display=state.layers.pois?'':'none';
 svg.querySelectorAll('[data-zone-label]').forEach(n=>n.style.display=state.layers.zones?'':'none');
 svg.querySelectorAll('[data-station-label]').forEach(n=>n.style.display=state.layers.transit?'':'none');
}
function updateSelection(){
 districts.forEach(d=>{d.shape.classList.toggle('selected',state.selected===d.id);mapDistrictButtons.get(d.id).classList.toggle('selected',state.selected===d.id);});
 for(const[id,b]of mapFacilityButtons)b.classList.toggle('selected',state.facility===id);
 document.querySelectorAll('.district-item').forEach(b=>{b.classList.toggle('selected',b.dataset.id===state.selected);b.setAttribute('aria-pressed',String(b.dataset.id===state.selected));});
}
function selectDistrict(id){if(!districts.some(d=>d.id===id))throw new Error('未知分区');state.selected=id;state.facility=null;renderDetail();updateSelection();openPanel('detail');return districts.find(d=>d.id===id);}
function selectFacility(id){const n=nodes.get(id);if(!n||n.type!=='facility')throw new Error('未知设施');state.selected=n.district;state.facility=id;renderDetail();updateSelection();openPanel('detail');return n;}
function renderDetail(){
 const d=districts.find(d=>d.id===state.selected);const selected=nodes.get(state.facility);const panel=$('district-detail');
 panel.innerHTML=`<div class="detail-title"><div><span class="eyebrow">${d.id==='heart'?'城市中心':'城市分区'}</span><h2>${d.name}</h2><span class="district-type">${d.kind}</span></div><span class="district-code">${d.code}</span></div><p class="detail-copy">${d.description}</p><div class="station-info"><i class="mini-dot"></i>${d.id==='heart'?'中央站 · 八条放射线汇合':d.short+'站 · 环城线 / 放射线换乘'}</div><div class="facility-heading"><h3>区域设施</h3><span>04 个节点</span></div><div class="facility-list">${d.facilities.map((n,i)=>`<button class="facility-row ${n.id===state.facility?'selected':''}" data-id="${n.id}" aria-pressed="${n.id===state.facility}"><span class="facility-symbol">0${i+1}</span><span><strong>${n.name}</strong><small>${n.category}</small></span></button>`).join('')}</div>${selected?`<p class="facility-extra">${selected.name} · ${selected.description}</p>`:''}<div class="detail-actions"><button class="primary-btn" id="navigate-selected">到${selected?'这里':'此区域'}</button><button class="secondary-btn" id="view-planning">查看规划原图</button></div>`;
 panel.querySelectorAll('.facility-row').forEach(b=>b.onclick=()=>selectFacility(b.dataset.id));
 $('navigate-selected').onclick=()=>{openPanel('route');$('route-to').value=state.facility||(d.id==='heart'?'hub':d.station);planRoute();};
 $('view-planning').onclick=()=>openDrawing('planning');
}
function openPanel(name){for(const p of ['detail','route']){$(p+'-panel').hidden=p!==name;$(p+'-tab').classList.toggle('active',p===name);$(p+'-tab').setAttribute('aria-selected',String(p===name));}}
function shortest(from,to,policy){
 if(!nodes.has(from)||!nodes.has(to))throw new Error('起终点不存在');
 const dist=new Map(Array.from(nodes.keys(),k=>[k,Infinity])),prev=new Map(),todo=new Set(nodes.keys());dist.set(from,0);
 while(todo.size){let u=null;for(const k of todo)if(u===null||dist.get(k)<dist.get(u))u=k;if(dist.get(u)===Infinity)break;todo.delete(u);if(u===to)break;
  for(const e of edges){const v=e.a===u?e.b:e.b===u?e.a:null;if(v===null||!todo.has(v))continue;const penalty=policy==='ring'&&e.line==='放射线'?20:policy==='radial'&&e.line==='环城线'?20:0;const next=dist.get(u)+e.time+penalty;if(next<dist.get(v)){dist.set(v,next);prev.set(v,{u,e});}}
 }
 if(!Number.isFinite(dist.get(to)))throw new Error('无法找到路线');
 const steps=[],ids=[to];let cursor=to;while(cursor!==from){const item=prev.get(cursor);steps.unshift({...item.e,from:item.u,to:cursor});cursor=item.u;ids.unshift(cursor);}return {ids,steps,time:steps.reduce((sum,s)=>sum+s.time,0)};
}
function renderRoute(result){
 const container=$('route-lines');container.replaceChildren();
 result.steps.forEach(e=>{
  const a=nodes.get(e.from),b=nodes.get(e.to);let d=path([a,b]);
  if(e.line==='环城线'){const ia=Number(a.id.slice(1)),ib=Number(b.id.slice(1)),sweep=(ib-ia+8)%8===1?1:0;d=`M${a.x},${a.y} A285,285 0 0,${sweep} ${b.x},${b.y}`;}
  el('path',{d,class:'route-underlay'},container);el('path',{d,class:'route-path'},container);
 });
 if(result.ids.length>1){for(const[id,index]of [[result.ids[0],0],[result.ids.at(-1),1]]){const p=nodes.get(id);el('circle',{cx:p.x,cy:p.y,r:18,fill:index?'#fbb66f':'#64d8cb',stroke:'#111e28','stroke-width':3},container);const t=el('text',{x:p.x,y:p.y+5,'text-anchor':'middle',fill:'#111e28','font-size':14,'font-weight':600},container);t.textContent=index?'终':'起';}}
 let transfers=0,last=null;for(const s of result.steps)if(s.line!=='步行接驳'){if(last&&last!==s.line)transfers++;last=s.line;}
 $('route-result').innerHTML=result.steps.length?`<div class="route-summary"><strong>${result.time}<span> 分钟</span></strong><span>估算 · ${result.steps.length} 段 · ${transfers} 次线路换乘</span></div><ol class="route-steps">${result.ids.map((id,i)=>`<li><i></i><div>${nodes.get(id).name}${i<result.steps.length?`<small>${result.steps[i].line} · 约 ${result.steps[i].time} 分钟</small>`:'<small>到达目的地</small>'}</div></li>`).join('')}</ol><p class="route-note">时间按概念网络计算：环城相邻站 3 分钟，中央放射线 4 分钟，分区设施接驳 3 分钟。未包含候车与管制时间。</p><button id="clear-route" class="secondary-btn" style="margin-top:12px">清除路线</button>`:'<p class="route-warning">起点与终点相同，你已经在目的地。</p>';
 const clear=$('clear-route');if(clear)clear.onclick=()=>{state.route=null;container.replaceChildren();$('route-result').innerHTML='<p class="route-note">路线已清除。选择起终点可以重新规划。</p>';};
}
function planRoute(){const from=$('route-from').value,to=$('route-to').value,policy=$('route-policy').value;try{const r=shortest(from,to,policy);state.route={from,to,policy,...r};renderRoute(r);return {from:nodes.get(from).name,to:nodes.get(to).name,minutes:r.time,stations:r.ids.map(id=>nodes.get(id).name)};}catch(e){$('route-result').textContent=e.message;$('route-lines').replaceChildren();state.route=null;throw e;}}
function fillSelects(){
 for(const select of [$('route-from'),$('route-to')]){
  const group=document.createElement('optgroup');group.label='交通站点';
  for(const n of nodes.values())if(n.type==='station')group.appendChild(new Option(n.name,n.id));select.appendChild(group);
  districts.forEach(d=>{const g=document.createElement('optgroup');g.label=d.name;d.facilities.forEach(n=>g.appendChild(new Option(n.name,n.id)));select.appendChild(g);});
 }
 $('route-from').value='s3';$('route-to').value='s1';
}
function openDrawing(id){const item=drawingData.find(d=>d[0]===id);if(!item)throw new Error('图纸不存在');$('drawing-title').textContent=item[1];$('drawing-large').src='assets/'+id+'.png';$('drawing-large').alt=item[1]+'：'+item[2];$('drawing-large').classList.remove('actual-size');$('drawing-download').href='assets/'+id+'.png';$('drawing-download').download='炽日-'+item[1]+'.png';$('drawing-dialog').showModal();}
function setMode(mode){state.mode=mode;$('schematic-background').style.display=mode==='schematic'?'':'none';$('birdseye-background').removeAttribute('hidden');$('birdseye-background').style.display=mode==='image'?'':'none';for(const id of ['schematic-view','image-view']){$(id).classList.toggle('active',(id==='image-view')===(mode==='image'));$(id).setAttribute('aria-pressed',String((id==='image-view')===(mode==='image')));}$('map-mode-note').textContent=mode==='image'?'原始鸟瞰 · 叠加为示意定位':'示意布局 · 非比例地图';}
function updateView(){const w=1200/state.zoom,h=1040/state.zoom;svg.setAttribute('viewBox',`${600-w/2+state.pan.x} ${520-h/2+state.pan.y} ${w} ${h}`);$('zoom-value').textContent=Math.round(state.zoom*100)+'%';}
function zoomTo(value){state.zoom=Math.min(3.5,Math.max(.65,value));updateView();}
function resetView(){state.zoom=1;state.pan={x:0,y:0};updateView();}
function showPage(name){for(const id of ['intercity','map','archive'])$(id+'-page').hidden=name!==id;document.querySelectorAll('[data-page]').forEach(b=>{b.classList.toggle('active',b.dataset.page===name);b.setAttribute('aria-pressed',String(b.dataset.page===name));});window.dispatchEvent(new Event('chiri:viewchange'));}
draw();fillSelects();renderDetail();
districts.forEach(d=>{const b=document.createElement('button');b.className='district-item';b.dataset.id=d.id;b.innerHTML=`<i style="background:${d.color}"></i>${d.name}`;b.onclick=()=>selectDistrict(d.id);$('district-list').appendChild(b);});updateSelection();
drawingData.forEach(([id,title,description],i)=>{const b=document.createElement('button');b.className='drawing-card';b.setAttribute('aria-label','打开'+title);b.innerHTML=`<img loading="lazy" src="assets/${id}.png" alt="${title}：${description}"><div><strong>${title}</strong><small>0${i+1} / PNG</small></div>`;b.onclick=()=>openDrawing(id);$('drawing-grid').appendChild(b);});
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));document.querySelector('.brand').onclick=e=>{e.preventDefault();showPage('intercity');};
$('detail-tab').onclick=()=>openPanel('detail');$('route-tab').onclick=()=>{openPanel('route');if(!state.route)planRoute();};
$('detail-tab').onkeydown=$('route-tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const id=e.currentTarget.id==='detail-tab'?'route':'detail';openPanel(id);$(id+'-tab').focus();}};
$('route-form').onsubmit=e=>{e.preventDefault();planRoute();resetView();};$('swap-route').onclick=()=>{const a=$('route-from').value;$('route-from').value=$('route-to').value;$('route-to').value=a;planRoute();};
for(const key of ['zones','transit','pois'])$('layer-'+key).onchange=e=>{state.layers[key]=e.target.checked;updateLayers();};
$('schematic-view').onclick=()=>setMode('schematic');$('image-view').onclick=()=>setMode('image');
$('zoom-in').onclick=()=>zoomTo(state.zoom*1.25);$('zoom-out').onclick=()=>zoomTo(state.zoom/1.25);$('reset-view').onclick=resetView;
svg.addEventListener('wheel',e=>{e.preventDefault();zoomTo(state.zoom*(e.deltaY<0?1.12:1/1.12));},{passive:false});
const pointers=new Map();let drag=null,pinch=null,moved=false;
function gestureSnapshot(){const ps=[...pointers.values()];if(ps.length===2){pinch={distance:Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),zoom:state.zoom};drag=null;}else if(ps.length===1){drag={x:ps[0].x,y:ps[0].y,pan:{...state.pan}};pinch=null;}else{drag=pinch=null;}}
svg.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);moved=false;gestureSnapshot();});
svg.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&pointers.size===2){const ps=[...pointers.values()];zoomTo(pinch.zoom*Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y)/Math.max(1,pinch.distance));moved=true;}else if(drag){const rect=svg.getBoundingClientRect();const scale=Math.min(rect.width/(1200/state.zoom),rect.height/(1040/state.zoom));const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;state.pan={x:drag.pan.x-dx/scale,y:drag.pan.y-dy/scale};updateView();}});
for(const event of ['pointerup','pointercancel'])svg.addEventListener(event,e=>{pointers.delete(e.pointerId);if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);gestureSnapshot();});
$('zone-shapes').addEventListener('click',e=>{if(!moved&&e.target.dataset.district)selectDistrict(e.target.dataset.district);});
$('map-search').addEventListener('input',e=>{
 const query=e.target.value.trim().toLowerCase(),box=$('search-results');box.replaceChildren();box.hidden=!query;if(!query)return;
 const results=[...districts.map(d=>({id:d.id,name:d.name,category:'区域',type:'district'})),...nodes.values()].filter(n=>(n.name+(n.category||'')).toLowerCase().includes(query)).slice(0,12);
 if(!results.length){const p=document.createElement('p');p.textContent='未找到匹配区域或设施';box.appendChild(p);}
 for(const n of results){const b=document.createElement('button');b.textContent=n.name;const small=document.createElement('small');small.textContent=n.category||(n.type==='station'?'交通站点':'设施');b.appendChild(small);b.onclick=()=>{if(n.type==='district')selectDistrict(n.id);else if(n.type==='facility')selectFacility(n.id);else{selectDistrict(n.district);openPanel('route');$('route-to').value=n.id;planRoute();}box.hidden=true;$('map-search').value='';};box.appendChild(b);}
});
$('map-search').onkeydown=e=>{if(e.key==='Escape')$('search-results').hidden=true;if(e.key==='Enter'){e.preventDefault();$('search-results').querySelector('button')?.click();}};
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))$('search-results').hidden=true;});
$('close-drawing').onclick=()=>$('drawing-dialog').close();$('drawing-large').onclick=()=> $('drawing-large').classList.toggle('actual-size');$('drawing-dialog').onclick=e=>{if(e.target===$('drawing-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
// Optional browser-agent tools share the same visible interactions.
if(document.modelContext?.registerTool){
 const lifetime=new AbortController();
 const tools=[{name:'select_city_district',title:'查看炽日分区',description:'选择城市分区并显示设施详情。',inputSchema:{type:'object',properties:{district:{type:'string',enum:districts.map(d=>d.id)}},required:['district'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input.district!=='string')throw new Error('需要有效的分区');const d=selectDistrict(input.district);showPage('map');return {name:d.name,facilities:d.facilities.map(n=>n.name)};}},{name:'plan_city_route',title:'规划炽日路线',description:'使用概念交通网络规划起终点路线，并在地图上显示。节点名称需完整匹配。时间仅为概念估算。',inputSchema:{type:'object',properties:{from:{type:'string'},to:{type:'string'},policy:{type:'string',enum:['fastest','ring','radial']}},required:['from','to'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const a=[...nodes.values()].find(n=>n.name===input?.from),b=[...nodes.values()].find(n=>n.name===input?.to),policy=input.policy||'fastest';if(!a||!b||!['fastest','ring','radial'].includes(policy))throw new Error('请使用有效站点或设施名称以及路线偏好');$('route-from').value=a.id;$('route-to').value=b.id;$('route-policy').value=policy;showPage('map');openPanel('route');resetView();return planRoute();}}];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
}
})();
