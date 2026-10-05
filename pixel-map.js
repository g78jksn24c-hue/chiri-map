(() => {
  const {zones,spots,streets,findZone,findSpot}=window.CHIRI_WORLD;
  const svg=document.getElementById('pixel-map'),camera=document.getElementById('map-camera');
  const search=document.getElementById('place-search'),list=document.getElementById('location-list'),panel=document.getElementById('place-panel');
  const start=document.getElementById('route-start'),end=document.getElementById('route-end'),summary=document.getElementById('route-summary');
  const state={x:0,y:0,w:960,h:640,filter:'all',query:'',drag:null,moved:false};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const circle=(cx,cy,r,fill,extra='')=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
  const radialNames={shield:'铁壁星桥',safety:'启明大道',forge:'望乡星桥',care:'熔炉大道',culture:'星港中轴',home:'绿野星桥',harvest:'薪火大道',energy:'安栖星桥',heart:'日心环路'};

  function drawBase(){
    let html='<image href="assets/pixel-city-map-v2.png" x="0" y="0" width="960" height="640" preserveAspectRatio="none"/>';
    html+='<circle cx="480" cy="320" r="255" fill="none" stroke="#4fc4b1" stroke-width="5" stroke-dasharray="12 8" opacity=".9"/><circle cx="480" cy="320" r="126" fill="none" stroke="#f4c16e" stroke-width="4" stroke-dasharray="8 7" opacity=".85"/>';
    streets.filter(s=>s.kind==='radial').forEach(s=>{html+=`<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#fff7d7" stroke-width="12" opacity=".85"/><line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ceaa61" stroke-width="3" stroke-dasharray="7 6"/>`;});
    zones.forEach(zone=>{
      html+=`<g class="zone-shape" data-zone="${zone.id}">${circle(zone.cx,zone.cy,zone.r,'#ffffff08',`stroke="${zone.dark}" stroke-width="3" stroke-dasharray="9 6"`)}<rect x="${zone.cx-52}" y="${zone.cy+zone.r-23}" width="104" height="22" rx="4" fill="#fffffff0"/><text x="${zone.cx}" y="${zone.cy+zone.r-8}" text-anchor="middle" class="zone-name">${zone.name}</text><text x="${zone.cx}" y="${zone.cy+zone.r+10}" text-anchor="middle" class="zone-sub">${zone.type}</text></g>`;
    });
    const streetLabels=[['星环大道',480,52,0],['日心环路',480,203,0],['启明大道',495,198,-90],['星港中轴',637,306,0],['薪火大道',495,446,-90],['熔炉大道',325,306,0]];
    streetLabels.forEach(([name,x,y,rot])=>{html+=`<text class="street-label" x="${x}" y="${y}" text-anchor="middle" transform="rotate(${rot} ${x} ${y})">${name}</text>`;});
    html+=spots.map(s=>`<g class="poi-marker" data-spot="${s.id}">${circle(s.x,s.y,10,'#fafff8',`stroke="#257c58" stroke-width="3"`)}${circle(s.x,s.y,4,'#e99a65')}<text x="${s.x+13}" y="${s.y-9}" class="poi-text">${s.name}</text></g>`).join('');
    html+='<g id="route-layer"></g><g id="moving-vehicle"><rect class="map-vehicle" width="24" height="12" rx="3" x="-12" y="-6"/><rect width="14" height="4" x="-7" y="-3" rx="1" fill="#52b8c6"/></g>';
    camera.innerHTML=html;updateView();
  }
  function updateView(){svg.setAttribute('viewBox',`${state.x} ${state.y} ${state.w} ${state.h}`);}
  function clamp(){state.x=Math.max(0,Math.min(960-state.w,state.x));state.y=Math.max(0,Math.min(640-state.h,state.y));updateView();}
  function zoom(factor){const cx=state.x+state.w/2,cy=state.y+state.h/2;state.w=Math.max(360,Math.min(960,state.w*factor));state.h=state.w*2/3;state.x=cx-state.w/2;state.y=cy-state.h/2;clamp();}
  function centerOn(x,y,level=600){state.w=level;state.h=level*2/3;state.x=x-state.w/2;state.y=y-state.h/2;clamp();}
  function selectPlace(id,focus=true){
    const spot=findSpot(id),zone=spot?findZone(spot.zone):findZone(id);if(!zone)return;
    const title=spot?.name||zone.name;
    panel.innerHTML=`<span class="info-kicker">${spot?'城市地点':'功能分区'}</span><div class="detail-icon">${zone.icon}</div><h2>${esc(title)}</h2><div class="detail-meta">${esc(zone.name)} · ${esc(spot?.category||zone.type)}</div><p>${esc(spot?.detail||zone.summary)}</p><div class="nearby">附近：${zone.spots.map(s=>esc(s[0])).join(' · ')}</div><button class="solid-button" id="navigate-selected" type="button">导航到这里 ↗</button>`;
    panel.querySelector('#navigate-selected').onclick=()=>{end.value=spot?.id||spots.find(s=>s.zone===zone.id).id;planRoute();};
    if(focus)centerOn(spot?.x??zone.cx,spot?.y??zone.cy,560);
    camera.querySelectorAll('.poi-marker circle:first-child').forEach(n=>n.setAttribute('fill','#fafff8'));
    if(spot)camera.querySelector(`[data-spot="${spot.id}"] circle`)?.setAttribute('fill','#ffe2a8');
  }
  function entries(){
    let data=[];
    if(state.filter==='all'||state.filter==='area')data.push(...zones.map(z=>({id:z.id,name:z.name,kind:'分区',find:z.name+' '+z.type})));
    if(state.filter==='all'||state.filter==='place')data.push(...spots.map(s=>({id:s.id,name:s.name,kind:findZone(s.zone).name,find:s.name+' '+s.category+' '+findZone(s.zone).name})));
    if(state.filter==='all'||state.filter==='street')data.push(...streets.map((s,i)=>({id:'street-'+i,name:s.name,kind:'街道',find:s.name})));
    return data.filter(v=>v.find.toLowerCase().includes(state.query.toLowerCase()));
  }
  function renderList(){const data=entries();document.getElementById('result-count').textContent=`${data.length} 处`;list.innerHTML=data.slice(0,45).map(v=>`<button type="button" data-id="${v.id}"><span>${esc(v.name)}</span><small>${esc(v.kind)} ↗</small></button>`).join('')||'<p class="concept-note">没有找到这个地名，试试“星港”或“星环大道”。</p>';}
  function selectItem(id){
    if(!id.startsWith('street-')){selectPlace(id);return;}
    const s=streets[Number(id.slice(7))];panel.innerHTML=`<span class="info-kicker">城市街道</span><div class="detail-icon">▰</div><h2>${esc(s.name)}</h2><p>${s.kind==='ring'?'围绕城市中枢连接八个功能区，是跨区出行的主要道路。':s.kind==='radial'?'从功能区直达炽日之心的放射通道。':'服务分区内部设施的步行街道。'}</p>`;
    if(s.kind==='ring')centerOn(s.cx,s.cy,690);else centerOn((s.x1+s.x2)/2,(s.y1+s.y2)/2,520);
  }
  function planRoute(){
    const a=findSpot(start.value),b=findSpot(end.value);if(!a||!b)return;
    if(a.id===b.id){summary.textContent='起点和终点相同，换一个目的地吧。';document.getElementById('route-layer').innerHTML='';return;}
    const za=findZone(a.zone),zb=findZone(b.zone),points=[[a.x,a.y]];
    if(za.id===zb.id)points.push([b.x,b.y]);else{
      points.push([za.cx,za.cy]);if(za.id!=='heart')points.push([480,320]);if(zb.id!=='heart')points.push([zb.cx,zb.cy]);points.push([b.x,b.y]);
    }
    const clean=points.filter((p,i)=>!i||p[0]!==points[i-1][0]||p[1]!==points[i-1][1]);
    const distance=Math.round(clean.reduce((sum,p,i)=>i?sum+Math.hypot(p[0]-clean[i-1][0],p[1]-clean[i-1][1]):0,0)*1.35);
    document.getElementById('route-layer').innerHTML=`<path class="route-line" d="M${clean.map(p=>p.join(' ')).join(' L')}"/><circle cx="${a.x}" cy="${a.y}" r="12" fill="#f5fff6" stroke="#2a9e6e" stroke-width="4"/><circle cx="${b.x}" cy="${b.y}" r="12" fill="#fff8e7" stroke="#e57960" stroke-width="4"/>`;
    const via=za.id===zb.id?`${za.name}内部道路`:[za.id!=='heart'?radialNames[za.id]:null,za.id!=='heart'&&zb.id!=='heart'?'日心环路':null,zb.id!=='heart'?radialNames[zb.id]:null].filter(Boolean).join('、');
    summary.innerHTML=`<strong>${esc(a.name)} → ${esc(b.name)}</strong><br>约 ${distance} 米 · 约 ${Math.max(2,Math.round(distance/75))} 分钟<br>经由 ${esc(via)}。`;
    centerOn((a.x+b.x)/2,(a.y+b.y)/2,Math.min(960,Math.max(520,Math.abs(a.x-b.x)+330)));
  }
  const options=spots.map(s=>`<option value="${s.id}">${esc(s.name)} · ${esc(findZone(s.zone).name)}</option>`).join('');start.innerHTML=options;end.innerHTML=options;start.value='heart-0';end.value='culture-0';
  document.querySelectorAll('.map-filter button').forEach(btn=>btn.onclick=()=>{state.filter=btn.dataset.filter;document.querySelectorAll('.map-filter button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderList();});
  search.addEventListener('input',()=>{state.query=search.value.trim();renderList();});list.onclick=e=>{const btn=e.target.closest('[data-id]');if(btn)selectItem(btn.dataset.id);};document.getElementById('plan-route').onclick=planRoute;
  svg.addEventListener('pointerdown',e=>{state.drag={x:e.clientX,y:e.clientY,px:state.x,py:state.y};state.moved=false;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!state.drag)return;const r=svg.getBoundingClientRect(),dx=(e.clientX-state.drag.x)/r.width*state.w,dy=(e.clientY-state.drag.y)/r.height*state.h;if(Math.abs(dx)+Math.abs(dy)>6)state.moved=true;if(state.moved){state.x=state.drag.px-dx;state.y=state.drag.py-dy;clamp();}});
  svg.addEventListener('pointerup',e=>{if(!state.moved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-spot],[data-zone]');if(target)selectPlace(target.dataset.spot||target.dataset.zone);}state.drag=null;});
  svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.85:1.15);},{passive:false});document.getElementById('map-zoom-in').onclick=()=>zoom(.8);document.getElementById('map-zoom-out').onclick=()=>zoom(1.25);document.getElementById('map-reset').onclick=()=>{state.x=0;state.y=0;state.w=960;state.h=640;updateView();};
  function animate(now){const a=now/4200,x=480+Math.cos(a)*255,y=320+Math.sin(a)*255;document.getElementById('moving-vehicle')?.setAttribute('transform',`translate(${x} ${y}) rotate(${a*180/Math.PI+90})`);requestAnimationFrame(animate);}
  function clock(){document.getElementById('map-clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}clock();setInterval(clock,10000);
  drawBase();renderList();requestAnimationFrame(animate);const initial=new URLSearchParams(location.search).get('place');if(initial&&(findSpot(initial)||findZone(initial)))selectPlace(initial);
})();
