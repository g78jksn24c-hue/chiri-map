(() => {
  const world=window.CHIRI_WORLD,{zones,spots,streets,findZone,findSpot}=world;
  const svg=document.getElementById('pixel-map'),camera=document.getElementById('map-camera');
  const search=document.getElementById('place-search'),list=document.getElementById('location-list'),panel=document.getElementById('place-panel');
  const start=document.getElementById('route-start'),end=document.getElementById('route-end'),summary=document.getElementById('route-summary');
  const state={x:0,y:0,w:960,h:640,filter:'all',query:'',selected:null,drag:null,moved:false};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  function zoneDrawing(z,i){
    let out=`<g class="zone-shape" data-zone="${z.id}">${rect(z.x+4,z.y+5,z.w,z.h,'#9ba99b66')}${rect(z.x,z.y,z.w,z.h,z.color,`stroke="${z.dark}" stroke-width="3"`)}`;
    for(let a=0;a<4;a++)for(let b=0;b<2;b++){
      const xx=z.x+21+a*59,yy=z.y+20+b*58;
      out+=rect(xx+4,yy+5,38,34,'#6e8d7a55')+rect(xx,yy,38,34,(['#f7fff3','#edf7f5','#fff3e4'][((a+b+i)%3)]),`stroke="${z.dark}" stroke-width="2"`);
      if(z.id==='harvest'||z.id==='care')out+=rect(xx+7,yy+8,24,18,'#85b886');
      else out+=rect(xx+6,yy+7,26,4,'#c8ebe8');
    }
    for(let k=0;k<4;k++){const tx=z.x+25+k*62,ty=z.y+145;out+=rect(tx,ty,9,9,'#66a375')+rect(tx+2,ty-3,5,7,'#a5c974');}
    out+=`<text x="${z.x+14}" y="${z.y+z.h-30}" class="zone-name">${z.name}</text><text x="${z.x+14}" y="${z.y+z.h-12}" class="zone-sub">${z.type} · ${String(i+1).padStart(2,'0')}</text></g>`;
    return out;
  }
  function drawBase(){
    let html=rect(0,0,960,640,'url(#pixel-grid)');
    html+=`<path d="M14 13H946V628H14Z" class="rail-track"/>`;
    for(const x of [313,628]){html+=rect(x,0,30,640,'#f9e9c3')+rect(x+12,0,6,640,'#d2bd8c');for(let y=16;y<640;y+=32)html+=rect(x+13,y,4,12,'#fff8e6');}
    for(const y of [205,415]){html+=rect(0,y,960,30,'#f9e9c3')+rect(0,y+12,960,6,'#d2bd8c');for(let x=16;x<960;x+=32)html+=rect(x,y+13,12,4,'#fff8e6');}
    html+=zones.map(zoneDrawing).join('');
    for(const st of streets){
      if(st.x1===st.x2)html+=`<text class="street-label" x="${st.x1-8}" y="${Math.max(100,(st.y1+st.y2)/2)}" transform="rotate(-90 ${st.x1-8} ${Math.max(100,(st.y1+st.y2)/2)})">${st.name}</text>`;
      else html+=`<text class="street-label" x="${(st.x1+st.x2)/2-26}" y="${st.y1+4}">${st.name}</text>`;
    }
    html+=spots.map(s=>`<g class="poi-marker" data-spot="${s.id}"><circle cx="${s.x}" cy="${s.y}" r="8"/><circle cx="${s.x}" cy="${s.y}" r="3" fill="#3b8f66" stroke="none"/><text x="${s.x+11}" y="${s.y-6}" class="poi-text">${s.name}</text></g>`).join('');
    html+='<g id="route-layer"></g><rect id="moving-vehicle" class="map-vehicle" width="20" height="11" rx="2" x="10" y="9"/>';
    camera.innerHTML=html;updateView();
  }
  function updateView(){svg.setAttribute('viewBox',`${state.x} ${state.y} ${state.w} ${state.h}`);}
  function clamp(){state.x=Math.max(0,Math.min(960-state.w,state.x));state.y=Math.max(0,Math.min(640-state.h,state.y));updateView();}
  function zoom(factor){const cx=state.x+state.w/2,cy=state.y+state.h/2;state.w=Math.max(360,Math.min(960,state.w*factor));state.h=state.w*2/3;state.x=cx-state.w/2;state.y=cy-state.h/2;clamp();}
  function centerOn(x,y,level=600){state.w=level;state.h=level*2/3;state.x=x-state.w/2;state.y=y-state.h/2;clamp();}
  function coordinate(e){const r=svg.getBoundingClientRect();return{x:state.x+(e.clientX-r.left)/r.width*state.w,y:state.y+(e.clientY-r.top)/r.height*state.h};}
  function nearestSpot(zone){return spots.find(s=>s.zone===zone.id);}
  function selectPlace(id,focus=true){
    const spot=findSpot(id),zone=spot?findZone(spot.zone):findZone(id);if(!zone)return;
    state.selected=spot?.id||zone.id;
    const title=spot?.name||zone.name;
    panel.innerHTML=`<span class="info-kicker">${spot?'城市地点':'功能街区'}</span><div class="detail-icon">${zone.icon}</div><h2>${esc(title)}</h2><div class="detail-meta">${esc(zone.name)} · ${esc(spot?.category||zone.type)}</div><p>${esc(spot?.detail||zone.summary)}</p><div class="nearby">附近：${zone.spots.map(s=>esc(s[0])).join(' · ')}</div><button class="solid-button" id="navigate-selected" type="button">导航到这里 ↗</button>`;
    panel.querySelector('#navigate-selected').onclick=()=>{end.value=spot?.id||nearestSpot(zone).id;planRoute();};
    if(focus)centerOn(spot?.x??zone.x+zone.w/2,spot?.y??zone.y+zone.h/2,600);
    document.querySelectorAll('.poi-marker circle:first-child').forEach(n=>n.setAttribute('fill','#f9fff9'));
    if(spot)camera.querySelector(`[data-spot="${spot.id}"] circle`)?.setAttribute('fill','#ffe0a9');
  }
  function items(){let data=[];if(state.filter==='all'||state.filter==='area')data.push(...zones.map(z=>({id:z.id,name:z.name,kind:'街区',find:z.name+' '+z.type})));if(state.filter==='all'||state.filter==='place')data.push(...spots.map(s=>({id:s.id,name:s.name,kind:findZone(s.zone).name,find:s.name+' '+s.category+' '+findZone(s.zone).name})));if(state.filter==='all'||state.filter==='street')data.push(...streets.map((s,i)=>({id:'street-'+i,name:s.name,kind:'街道',find:s.name})));return data.filter(v=>v.find.toLowerCase().includes(state.query.toLowerCase()));}
  function renderList(){const data=items();document.getElementById('result-count').textContent=`${data.length} 处`;list.innerHTML=data.slice(0,40).map(v=>`<button type="button" data-id="${v.id}"><span>${esc(v.name)}</span><small>${esc(v.kind)} ↗</small></button>`).join('')||'<p class="concept-note">没有找到这个地名，试试“万象”或“星光大道”。</p>';}
  function selectItem(id){if(id.startsWith('street-')){const s=streets[Number(id.slice(7))];panel.innerHTML=`<span class="info-kicker">城市街道</span><div class="detail-icon">▰</div><h2>${esc(s.name)}</h2><p>这条街连接附近的城市设施与步行空间。点击周围街区，继续寻找目的地。</p>`;centerOn((s.x1+s.x2)/2,(s.y1+s.y2)/2,620);}else selectPlace(id);}
  function roadPoint(s){const zone=findZone(s.zone);const cx=zone.x+zone.w/2,cy=zone.y+zone.h/2;return{x:[323,638].reduce((a,b)=>Math.abs(a-s.x)<Math.abs(b-s.x)?a:b),y:[215,425].reduce((a,b)=>Math.abs(a-s.y)<Math.abs(b-s.y)?a:b),cx,cy};}
  function planRoute(){const a=findSpot(start.value),b=findSpot(end.value);if(!a||!b)return;if(a.id===b.id){summary.textContent='起点和终点相同，换一个目的地吧。';document.getElementById('route-layer').innerHTML='';return;}
    const pa=roadPoint(a),pb=roadPoint(b);const points=[[a.x,a.y],[pa.x,a.y],[pa.x,pa.y],[pb.x,pa.y],[pb.x,pb.y],[pb.x,b.y],[b.x,b.y]];
    const distinct=points.filter((p,i)=>i===0||p[0]!==points[i-1][0]||p[1]!==points[i-1][1]);
    const distance=Math.round(distinct.reduce((sum,p,i)=>i?sum+Math.abs(p[0]-distinct[i-1][0])+Math.abs(p[1]-distinct[i-1][1]):0,0)*.72);
    document.getElementById('route-layer').innerHTML=`<path class="route-line" d="M${distinct.map(p=>p.join(' ')).join(' L')}"/><circle cx="${a.x}" cy="${a.y}" r="11" fill="#f5fff6" stroke="#2a9e6e" stroke-width="4"/><circle cx="${b.x}" cy="${b.y}" r="11" fill="#fff8e7" stroke="#e57960" stroke-width="4"/>`;
    summary.innerHTML=`<strong>${esc(a.name)} → ${esc(b.name)}</strong><br>步行约 ${distance} 米 · 约 ${Math.max(2,Math.round(distance/70))} 分钟<br>经由 ${pa.x===323?'云梯街':'晨曦街'}、${pa.y===215?'星光大道':'花园路'}。`;centerOn((a.x+b.x)/2,(a.y+b.y)/2,Math.min(960,Math.max(510,Math.abs(a.x-b.x)+280)));}
  const options=spots.map(s=>`<option value="${s.id}">${esc(s.name)} · ${esc(findZone(s.zone).name)}</option>`).join('');start.innerHTML=options;end.innerHTML=options;start.value='heart-0';end.value='culture-0';
  document.querySelectorAll('.map-filter button').forEach(btn=>btn.onclick=()=>{state.filter=btn.dataset.filter;document.querySelectorAll('.map-filter button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderList();});
  search.addEventListener('input',()=>{state.query=search.value.trim();renderList();});list.onclick=e=>{const btn=e.target.closest('[data-id]');if(btn)selectItem(btn.dataset.id);};document.getElementById('plan-route').onclick=planRoute;
  svg.addEventListener('pointerdown',e=>{state.drag={x:e.clientX,y:e.clientY,px:state.x,py:state.y};state.moved=false;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!state.drag)return;const r=svg.getBoundingClientRect(),dx=(e.clientX-state.drag.x)/r.width*state.w,dy=(e.clientY-state.drag.y)/r.height*state.h;if(Math.abs(dx)+Math.abs(dy)>6)state.moved=true;if(state.moved){state.x=state.drag.px-dx;state.y=state.drag.py-dy;clamp();}});
  svg.addEventListener('pointerup',e=>{if(!state.moved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-spot],[data-zone]');if(target)selectPlace(target.dataset.spot||target.dataset.zone);}state.drag=null;});
  svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.85:1.15);},{passive:false});
  document.getElementById('map-zoom-in').onclick=()=>zoom(.8);document.getElementById('map-zoom-out').onclick=()=>zoom(1.25);document.getElementById('map-reset').onclick=()=>{state.x=0;state.y=0;state.w=960;state.h=640;updateView();};
  function animate(now){const t=now/1000,perimeter=2*(932+615),p=(t*35)%perimeter;let x=14,y=13;if(p<932)x+=p;else if(p<1547){x=946;y+=p-932;}else if(p<2479){x=946-(p-1547);y=628;}else y=628-(p-2479);const car=document.getElementById('moving-vehicle');car?.setAttribute('x',String(x));car?.setAttribute('y',String(y));requestAnimationFrame(animate);}
  function clock(){document.getElementById('map-clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}clock();setInterval(clock,10000);
  drawBase();renderList();requestAnimationFrame(animate);const initial=new URLSearchParams(location.search).get('place');if(initial&&(findSpot(initial)||findZone(initial)))selectPlace(initial);
})();
