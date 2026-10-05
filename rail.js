(() => {
'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',fmt=n=>Math.round(n).toLocaleString('zh-CN');
const cities=[
 {id:'chiri',name:'炽日主城',residents:428600,x:.205,y:.47,description:'中央居住环与八个分区组成的轨道主城。'},
 {id:'moon',name:'月港城',residents:192400,x:.29,y:.19,description:'月轨客运、贸易与航天接驳城市。'},
 {id:'dawn',name:'晨曦城',residents:276000,x:.715,y:.19,description:'教育、研究与生态居住复合城市。'},
 {id:'nova',name:'新穹城',residents:214500,x:.80,y:.47,description:'城际铁路东端的综合交通与生活枢纽。'},
 {id:'sail',name:'远帆城',residents:168800,x:.70,y:.79,description:'面向深空航线的补给、制造与居住城市。'},
 {id:'star',name:'逐星城',residents:236300,x:.29,y:.79,description:'轨道农业、物流与公共服务城市。'}
];
const byCity=new Map(cities.map(c=>[c.id,c]));
const lines=[
 {id:'H1',name:'曙光线',color:'#1aada0',route:['chiri','moon','dawn','nova'],durations:[6,7,6],interval:12,capacity:960},
 {id:'H2',name:'远航线',color:'#ebac43',route:['chiri','star','sail','nova'],durations:[5,8,7],interval:15,capacity:800},
 {id:'H3',name:'环轨线',color:'#8e7ccd',route:['moon','star','dawn','sail'],durations:[9,6,8],interval:20,capacity:640},
 {id:'H4',name:'日心快线',color:'#e07966',route:['chiri','nova'],durations:[10],interval:18,capacity:720},
 {id:'H5',name:'云海线',color:'#529ee3',route:['moon','sail'],durations:[11],interval:16,capacity:600},
 {id:'H6',name:'星桥线',color:'#91aa52',route:['star','nova'],durations:[12],interval:22,capacity:720}
];
const byLine=new Map(lines.map(l=>[l.id,l]));
const totalPeople=cities.reduce((s,c)=>s+c.residents,0);
const clock=t=>{const sec=8*3600+Math.max(0,Math.floor(t));return [Math.floor(sec/3600),Math.floor(sec/60)%60,sec%60].map(n=>String(n).padStart(2,'0')).join(':');};
const time=t=>clock(t).slice(0,5);
let simTime=600,paused=false,speed=60,lastFrame=performance.now(),lastText=0,selectedCity='chiri',selectedTrain=null,visibleRows=12,visibleLines=new Set(lines.map(l=>l.id)),trips=[],events=[],eventCursor=0,mapWidth=900,mapHeight=530,tracks=new Map(),previousTableKey='';
const cityButtons=new Map(),cityTiles=new Map(),trainMarkers=new Map();
function s(type,attrs,parent){const e=document.createElementNS(NS,type);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(parent)parent.appendChild(e);return e;}
function seed(id,index,phase){let n=(id*73856093+index*19349663+phase*83492791)>>>0;n=(n^(n>>>13))*1274126177;return (n>>>0)%1000/1000;}
function buildSchedule(){
 trips=[];events=[];let number=1;
 for(const line of lines){for(let depart=0;depart<=14*3600;depart+=line.interval*60){for(let direction=0;direction<2;direction++){
  const route=direction?[...line.route].reverse():[...line.route],durations=direction?[...line.durations].reverse():[...line.durations];
  const trip={number,id:'G'+String(number).padStart(3,'0'),line:line.id,capacity:line.capacity,route,depart,arrive:0,legs:[],onboard:0,boarded:0,alighted:0,activity:null,status:'future'};let t=depart;
  route.forEach((city,index)=>{
   if(index){events.push({time:t,type:'arrive',trip,index,city});}
   if(index<route.length-1){events.push({time:t+(index?60:0),type:'depart',trip,index,city});const start=t+(index?60:0),end=start+durations[index]*60;trip.legs.push({from:city,to:route[index+1],start,end});t=end;}
  });trip.arrive=t;trips.push(trip);number++;
 }}}
 events.sort((a,b)=>a.time-b.time||((a.type==='arrive'?0:1)-(b.type==='arrive'?0:1))||a.trip.number-b.trip.number);
}
function processEvent(event){const {trip,index,city,type}=event,c=byCity.get(city);
 if(type==='arrive'){
  const amount=index===trip.route.length-1?trip.onboard:Math.floor(trip.onboard*(.22+.22*seed(trip.number,index,0)));
  trip.onboard-=amount;trip.alighted+=amount;c.present+=amount;c.inflow+=amount;
  trip.activity={city,time:event.time,boarded:0,alighted:amount};trip.status=index===trip.route.length-1?'complete':'dwell';
 }else{
  const target=Math.round(trip.capacity*(index===0?.46+.35*seed(trip.number,index,1):.45+.43*seed(trip.number,index,1)));
  const amount=Math.min(c.present,Math.max(0,target-trip.onboard));
  trip.onboard+=amount;trip.boarded+=amount;c.present-=amount;c.outflow+=amount;
  trip.activity={city,time:event.time,boarded:amount,alighted:trip.activity?.city===city?trip.activity.alighted:0};trip.status='moving';
 }
}
function advanceTo(target){while(eventCursor<events.length&&events[eventCursor].time<=target)processEvent(events[eventCursor++]);simTime=target;}
function initialize(){cities.forEach(c=>Object.assign(c,{present:c.residents,inflow:0,outflow:0}));buildSchedule();eventCursor=0;simTime=0;advanceTo(600);selectedTrain=trips.find(t=>isActive(t))?.id||null;previousTableKey='';trainMarkers.forEach(g=>g.remove());trainMarkers.clear();renderAll();}
function isActive(trip){return trip.depart<=simTime&&trip.arrive>simTime;}
function activeTrips(){return trips.filter(isActive);}
function trainState(trip){if(trip.depart>simTime)return {status:'待发车',city:trip.route[0],next:trip.route[0],eta:trip.depart};if(trip.arrive<=simTime)return {status:'已到达',city:trip.route.at(-1),next:null,eta:trip.arrive};const leg=trip.legs.find(l=>l.start<=simTime&&l.end>simTime);if(leg)return {status:'运行中',leg,next:leg.to,eta:leg.end};const nextLeg=trip.legs.find(l=>l.start>simTime);return {status:'停站上下客',city:nextLeg.from,next:nextLeg.to,eta:nextLeg.start};}
function point(id){const c=byCity.get(id);return {x:c.x*mapWidth,y:c.y*mapHeight};}
// Trace the image's radial viaducts and central ring in normalized coordinates.
function measuredPath(points){const distances=[0];for(let i=1;i<points.length;i++)distances.push(distances.at(-1)+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));return {points,distances,length:distances.at(-1)};}
function cubic(a,b){const cx=.5*mapWidth,cy=.457*mapHeight,rx=.143*mapWidth,ry=.244*mapHeight;const angle=p=>Math.round(Math.atan2((p.y-cy)/ry,(p.x-cx)/rx)/(Math.PI/4))*Math.PI/4;const aa=angle(a),bb=angle(b),ring=t=>({x:cx+rx*Math.cos(t),y:cy+ry*Math.sin(t)});let delta=bb-aa;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;const points=[a,ring(aa)];if(Math.abs(Math.abs(delta)-Math.PI)<.01){points.push({x:cx,y:cy},ring(bb));}else{const steps=Math.max(2,Math.ceil(Math.abs(delta)*32));for(let i=1;i<=steps;i++)points.push(ring(aa+delta*i/steps));}points.push(b);return measuredPath(points);}
function curvePoint(curve,t){const distance=Math.max(0,Math.min(1,t))*curve.length;let i=1;while(i<curve.distances.length-1&&curve.distances[i]<distance)i++;const a=curve.points[i-1],b=curve.points[i],span=curve.distances[i]-curve.distances[i-1],f=span?(distance-curve.distances[i-1])/span:0;return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}
function curveD(c){return c.points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ');}
function resizeMap(){const r=$('rail-map-wrap').getBoundingClientRect();if(!r.width)return;mapWidth=r.width;mapHeight=r.height;$('rail-map').setAttribute('viewBox',`0 0 ${mapWidth} ${mapHeight}`);$('rail-tracks').replaceChildren();$('rail-stations').replaceChildren();tracks.clear();
 for(const line of lines)for(let i=0;i<line.route.length-1;i++){const from=line.route[i],to=line.route[i+1],curve=cubic(point(from),point(to));tracks.set(from+'>'+to,curve);tracks.set(to+'>'+from,measuredPath([...curve.points].reverse()));const g=s('g',{'data-line':line.id},$('rail-tracks'));s('path',{d:curveD(curve),stroke:line.color,class:'rail-track-shadow'},g);s('path',{d:curveD(curve),stroke:line.color,class:'rail-track'},g);}
 for(const c of cities){const p=point(c.id);s('circle',{cx:p.x,cy:p.y,r:10,fill:'#0b1722',stroke:selectedCity===c.id?'#ffce8b':'#aec2cf','stroke-width':2.5},$('rail-stations'));const b=cityButtons.get(c.id);b.style.left=(c.x*100)+'%';b.style.top=(c.y*100)+'%';}
 applyLineVisibility();renderTrainMap();
}
function renderTrainMap(){const active=activeTrips(),ids=new Set(active.map(t=>t.id));for(const[id,g]of trainMarkers)if(!ids.has(id)){g.remove();trainMarkers.delete(id);}
 for(const trip of active){const line=byLine.get(trip.line);let g=trainMarkers.get(trip.id);if(!g){g=s('g',{class:'train-marker','data-train':trip.id},$('rail-trains'));s('rect',{x:-30,y:-13,width:60,height:26,rx:10,fill:'transparent',class:'train-hit'},g);const body=s('g',{class:'train-body'},g);s('image',{href:'assets/cyber-single-train.png',x:-25,y:-15,width:50,height:30,preserveAspectRatio:'xMidYMid meet'},body);s('text',{x:0,y:-16,'text-anchor':'middle'},g).textContent=trip.id;s('title',{},g);g.setAttribute('tabindex','0');g.setAttribute('role','button');g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTrain(trip.id);}});g.addEventListener('click',()=>selectTrain(trip.id));trainMarkers.set(trip.id,g);}
  const info=trainState(trip);let p;if(info.leg){const curve=tracks.get(info.leg.from+'>'+info.leg.to);p=curvePoint(curve,(simTime-info.leg.start)/(info.leg.end-info.leg.start));}else p=point(info.city);
  // Opposite services use a small lane offset for legibility.
  let angle=0;if(info.leg){const curve=tracks.get(info.leg.from+'>'+info.leg.to),t=(simTime-info.leg.start)/(info.leg.end-info.leg.start),q=curvePoint(curve,Math.min(1,t+.001)),r=curvePoint(curve,Math.max(0,t-.001));angle=Math.atan2(q.y-r.y,q.x-r.x);}else{const next=trip.legs.find(l=>l.start>simTime);if(next){const a=point(next.from),b=point(next.to);angle=Math.atan2(b.y-a.y,b.x-a.x);}}const offset=0;g.setAttribute('transform',`translate(${p.x-Math.sin(angle)*offset},${p.y+Math.cos(angle)*offset})`);g.querySelector('.train-body').setAttribute('transform',`rotate(${angle*180/Math.PI})`);g.classList.toggle('selected',trip.id===selectedTrain);g.style.display=visibleLines.has(trip.line)?'':'none';g.setAttribute('aria-label',trip.id+' '+line.name+' '+info.status+'，载客 '+trip.onboard+' 人');g.querySelector('title').textContent=`${trip.id} ${line.name}，${info.status}，${trip.onboard} / ${trip.capacity} 人`;
 }
}
function applyLineVisibility(){for(const g of $('rail-tracks').children)g.style.display=visibleLines.has(g.dataset.line)?'':'none';for(const b of $('rail-line-legend').children)b.setAttribute('aria-pressed',String(visibleLines.has(b.dataset.id)));}
function selectCity(id){if(!byCity.has(id))throw new Error('未知城市');selectedCity=id;renderCities();resizeMap();return byCity.get(id);}
function selectTrain(id){const trip=trips.find(t=>t.id===id);if(!trip)throw new Error('未知车次');selectedTrain=id;visibleLines.add(trip.line);applyLineVisibility();renderTrainDetail();renderTrainMap();previousTableKey='';renderTimetable();return trip;}
function renderCities(){
 for(const c of cities){const selected=c.id===selectedCity,net=c.inflow-c.outflow;cityButtons.get(c.id).classList.toggle('selected',selected);cityButtons.get(c.id).setAttribute('aria-pressed',String(selected));cityButtons.get(c.id).querySelector('small').textContent=fmt(c.present)+' 人';const tile=cityTiles.get(c.id);tile.classList.toggle('selected',selected);tile.setAttribute('aria-pressed',String(selected));tile.querySelector('b').textContent=fmt(c.present);tile.querySelector('small').textContent='净流动 '+(net>=0?'+':'')+fmt(net);tile.querySelector('small').className=net>=0?'flow-positive':'flow-negative';}
 const c=byCity.get(selectedCity);const next=trips.flatMap(t=>t.legs.filter(l=>l.to===c.id&&l.end>simTime).map(l=>({trip:t,eta:l.end}))).sort((a,b)=>a.eta-b.eta)[0];
 $('rail-city-detail').innerHTML=`<span class="eyebrow">城市人口 / 实时仿真</span><h2>${c.name}</h2><p>${c.description}</p><div class="population-number">${fmt(c.present)}</div><span class="population-label">当前在城人数 · 常住人口 ${fmt(c.residents)}</span><div class="population-flow"><div><span>今日流入</span><b class="flow-positive">+${fmt(c.inflow)}</b></div><div><span>今日流出</span><b class="flow-negative">−${fmt(c.outflow)}</b></div></div><div class="city-next">${next?`下一班到站 <span>${next.trip.id}</span><br>${time(next.eta)} · ${byLine.get(next.trip.line).name}`:'今日运营已结束'}</div>`;
}
function renderTrainDetail(){const trip=trips.find(t=>t.id===selectedTrain);if(!trip){$('rail-train-detail').innerHTML='<span class="eyebrow">列车载客</span><p>点击运行列车或排班表里的“查看”，显示车厢载客量与运行信息。</p>';return;}
 const info=trainState(trip),line=byLine.get(trip.line),percent=Math.round(trip.onboard/trip.capacity*100),load=info.status==='待发车'?'—':fmt(trip.onboard),a=trip.activity;
 $('rail-train-detail').innerHTML=`<span class="eyebrow">列车载客 / ${info.status}</span><img class="train-portrait" src="assets/high-speed-train.png" alt="炽日高铁，单节赛博朋克高铁，青蓝与品红霓虹灯带"><h2 class="selected-train-id">${trip.id}</h2><div class="train-line">${line.id} ${line.name} · ${trip.capacity} 座</div><div class="train-route">${byCity.get(trip.route[0]).name} → ${byCity.get(trip.route.at(-1)).name}</div><div class="train-load"><strong>${load}</strong><span>/ ${trip.capacity} 人 · 当前乘车</span></div><div class="occupancy-track" role="progressbar" aria-label="列车座位使用率" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div style="width:${percent}%"></div></div><div class="train-meta"><div><span>上座率</span><b>${info.status==='待发车'?'—':percent+'%'}</b></div><div><span>下一站 / 到站</span><b>${info.next?byCity.get(info.next).name:'终点已到达'}</b></div><div><span>始发时间</span><b>${time(trip.depart)}</b></div><div><span>终到时间</span><b>${time(trip.arrive)}</b></div></div><p>${a?`最近停站：${byCity.get(a.city).name}<br>上车 ${fmt(a.boarded)} 人 · 下车 ${fmt(a.alighted)} 人`:'尚未始发，载客量将于发车时更新。'}</p>`;
}
function filteredSchedule(){const line=$('schedule-line').value,status=$('schedule-status').value;return trips.filter(t=>(line==='all'||t.line===line)&&(status==='all'||status==='active'&&isActive(t)||status==='upcoming'&&t.depart>simTime||status==='complete'&&t.arrive<=simTime)).sort((a,b)=>status==='complete'?b.arrive-a.arrive:a.depart-b.depart);}
function renderTimetable(){const schedule=filteredSchedule(),visible=schedule.slice(0,visibleRows);const key=visible.map(t=>t.id+'-'+t.onboard+'-'+trainState(t).status+'-'+trainState(t).next).join('|')+'|'+selectedTrain+'|'+schedule.length;if(key===previousTableKey)return;previousTableKey=key;
 $('timetable-body').innerHTML=visible.length?visible.map(t=>{const info=trainState(t),line=byLine.get(t.line);return `<tr class="${selectedTrain===t.id?'selected':''}"><td><strong>${t.id}</strong><small>${line.id} ${line.name}</small></td><td>${byCity.get(t.route[0]).name} → ${byCity.get(t.route.at(-1)).name}<small>${t.route.map(c=>byCity.get(c).name).join(' · ')}</small></td><td>${time(t.depart)} / ${time(t.arrive)}</td><td><span class="train-status ${info.status==='待发车'?'future':info.status==='已到达'?'done':''}">${info.status}</span></td><td>${info.status==='待发车'?'—':fmt(t.onboard)} / ${t.capacity}<small>${info.status==='待发车'?'尚未上客':Math.round(t.onboard/t.capacity*100)+'% 上座率'}</small></td><td>${info.next?byCity.get(info.next).name:'终点已到达'}<small>${info.next?time(info.eta):'—'}</small></td><td><button data-id="${t.id}" aria-label="查看 ${t.id} 列车详情">查看</button></td></tr>`;}).join(''):'<tr><td colspan="7" class="rail-empty">此筛选下暂无车次</td></tr>';
 $('timetable-body').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectTrain(b.dataset.id);$('rail-train-detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});});
 $('schedule-count').textContent=`共 ${schedule.length} 班 · 已显示 ${visible.length} 班`;$('schedule-more').hidden=visibleRows>=schedule.length;
}
function renderAll(){const active=activeTrips(),onboard=trips.reduce((sum,t)=>sum+t.onboard,0),inCity=cities.reduce((sum,c)=>sum+c.present,0);if(inCity+onboard!==totalPeople)throw new Error('客流人口守恒异常');$('sim-clock').textContent=clock(simTime);$('population-total').textContent=fmt(inCity);$('passenger-total').textContent=fmt(onboard);$('active-total').textContent=active.length+' 班';renderCities();renderTrainDetail();renderTimetable();renderTrainMap();}
for(const c of cities){const b=document.createElement('button');b.className='rail-city-label';b.innerHTML=`<strong>${c.name}</strong><small>${fmt(c.residents)} 人</small>`;b.onclick=()=>selectCity(c.id);b.setAttribute('aria-label','查看'+c.name+'人口与流动');$('rail-city-labels').appendChild(b);cityButtons.set(c.id,b);const tile=document.createElement('button');tile.className='population-city';tile.innerHTML=`<strong>${c.name}</strong><b>${fmt(c.residents)}</b><small>净流动 0</small>`;tile.onclick=()=>selectCity(c.id);tile.setAttribute('aria-label','查看'+c.name+'人口明细');$('rail-city-grid').appendChild(tile);cityTiles.set(c.id,tile);}
for(const line of lines){if(![...$('schedule-line').options].some(o=>o.value===line.id)){const option=document.createElement('option');option.value=line.id;option.textContent=line.id+' '+line.name;$('schedule-line').appendChild(option);}const b=document.createElement('button');b.dataset.id=line.id;b.setAttribute('aria-pressed','true');b.innerHTML=`<i style="background:${line.color}"></i>${line.id} ${line.name}<small>每 ${line.interval} 分钟</small>`;b.onclick=()=>{if(visibleLines.has(line.id))visibleLines.delete(line.id);else visibleLines.add(line.id);applyLineVisibility();renderTrainMap();};$('rail-line-legend').appendChild(b);}
function renderRunState(){const ended=simTime>=15*3600;$('sim-pause').textContent=ended?'重新运行':paused?'继续':'暂停';$('sim-pause').setAttribute('aria-pressed',String(paused));$('sim-state').textContent=ended?'运营结束':paused?'已暂停':$('sim-loop').checked?'运行中 · 循环演示':'运行中';$('sim-state').dataset.state=paused?'paused':'running';}
$('sim-pause').onclick=()=>{if(simTime>=15*3600){initialize();paused=false;}else paused=!paused;lastFrame=performance.now();renderRunState();};$('sim-speed').onchange=()=>{speed=Number($('sim-speed').value);lastFrame=performance.now();};$('sim-reset').onclick=()=>{paused=false;initialize();lastFrame=performance.now();renderRunState();};$('sim-loop').onchange=renderRunState;
for(const id of ['schedule-line','schedule-status'])$(id).onchange=()=>{visibleRows=12;previousTableKey='';renderTimetable();};$('schedule-more').onclick=()=>{visibleRows+=12;previousTableKey='';renderTimetable();};
$('city-drilldown').onclick=()=>document.querySelector('[data-page="map"]').click();
resizeMap();initialize();new ResizeObserver(resizeMap).observe($('rail-map-wrap'));window.addEventListener('chiri:viewchange',()=>{if(!$('intercity-page').hidden)resizeMap();});
// A timer advances the simulation even when the host suppresses animation frames.
function tick(now){const dt=Math.max(0,Math.min(2,(now-lastFrame)/1000));lastFrame=now;if(!paused){advanceTo(Math.min(15*3600,simTime+dt*speed));if(simTime>=15*3600){if($('sim-loop').checked)initialize();else paused=true;}renderRunState();}if(!$('intercity-page').hidden){if(now-lastText>=500){renderAll();lastText=now;}else renderTrainMap();}}
let tickTimer=setInterval(()=>tick(performance.now()),100);renderRunState();
function frame(){if(!$('intercity-page').hidden)renderTrainMap();requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.addEventListener('pagehide',()=>clearInterval(tickTimer));window.addEventListener('pageshow',e=>{if(e.persisted){lastFrame=performance.now();clearInterval(tickTimer);tickTimer=setInterval(()=>tick(performance.now()),100);}});
// Concept-data diagnostics are also the read-back used by browser-agent tools.
function snapshot(){return {simulation:true,time:clock(simTime),paused,speed,totalPeople,inCity:cities.reduce((s,c)=>s+c.present,0),onboard:trips.reduce((s,t)=>s+t.onboard,0),cities:cities.map(({id,name,residents,present,inflow,outflow})=>({id,name,residents,present,inflow,outflow})),activeTrains:activeTrips().map(t=>({id:t.id,line:t.line,onboard:t.onboard,capacity:t.capacity,status:trainState(t).status})),scheduleCount:trips.length};}
window.chiriRail={snapshot,verifyFullDay(){const original=simTime;cities.forEach(c=>Object.assign(c,{present:c.residents,inflow:0,outflow:0}));buildSchedule();eventCursor=0;simTime=0;let count=0;for(const e of events){processEvent(e);count++;const sum=cities.reduce((s,c)=>s+c.present,0)+trips.reduce((s,t)=>s+t.onboard,0);if(sum!==totalPeople||cities.some(c=>c.present<0)||trips.some(t=>t.onboard<0||t.onboard>t.capacity))throw new Error('全日客流校验失败');}const finalOnboard=trips.reduce((s,t)=>s+t.onboard,0);cities.forEach(c=>Object.assign(c,{present:c.residents,inflow:0,outflow:0}));buildSchedule();eventCursor=0;simTime=0;advanceTo(original);previousTableKey='';renderAll();return {events:count,populationConserved:true,capacityRespected:true,finalOnboard};}};
if(document.modelContext?.registerTool){const lifetime=new AbortController();const defs=[{name:'read_rail_simulation',title:'读取高铁沙盘',description:'读取仿真时钟、六城人数及运行列车载客量。全部为概念仿真数据。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>snapshot()},{name:'select_rail_train',title:'查看高铁载客',description:'选择排班表中的高铁车次并显示当前载客与运行详情。',inputSchema:{type:'object',properties:{train:{type:'string'}},required:['train'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const t=selectTrain(input?.train);document.querySelector('[data-page="intercity"]').click();return {id:t.id,onboard:t.onboard,capacity:t.capacity,status:trainState(t).status};}}];for(const def of defs){try{Promise.resolve(document.modelContext.registerTool(def,{signal:lifetime.signal})).catch(()=>{});}catch{}}window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});}
})();




