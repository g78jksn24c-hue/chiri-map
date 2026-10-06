(() => {
  const {zones,spots,findZone}=window.CHIRI_WORLD;
  const canvas=document.getElementById('city-canvas'),ctx=canvas.getContext('2d');
  const info=document.getElementById('city-info-content'),directory=document.getElementById('city-zone-list');
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const camera={x:480,y:320,zoom:1};
  const mapImage=new Image(); mapImage.src='assets/pixel-city-map-v2.png';
  let selected=null,hovered=null,drag=null,dragged=false;
  const people=Array.from({length:24},(_,i)=>({angle:i/24*Math.PI*2,speed:.025+(i%5)*.004,color:['#ea6e68','#367d9d','#f4c25e','#5f9c72','#a66aa2'][i%5],radius:i%3===0?235:255}));

  function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function drawPerson(x,y,color){rect(x-2,y-3,4,4,'#4f443e');rect(x-3,y+1,6,6,color);rect(x-2,y+7,2,3,'#37534b');rect(x+1,y+7,2,3,'#37534b');}
  function drawLabels(){
    zones.forEach(zone=>{
      if(selected===zone.id||hovered===zone.id){ctx.beginPath();ctx.arc(zone.cx,zone.cy,zone.r+5,0,Math.PI*2);ctx.fillStyle=selected===zone.id?'#fff4ad40':'#ffffff24';ctx.fill();ctx.strokeStyle=selected===zone.id?'#fff2a8':'#f7ffff';ctx.lineWidth=4;ctx.stroke();}
      const labelWidth=zone.id==='heart'?104:92;
      rect(zone.cx-labelWidth/2,zone.cy+zone.r-24,labelWidth,22,'#ffffffe8');
      ctx.fillStyle='#173f34';ctx.font='bold 14px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText(zone.name,zone.cx,zone.cy+zone.r-8);
      zone.spots.forEach(([,x,y])=>{ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle='#fff7cf';ctx.fill();ctx.strokeStyle=zone.dark;ctx.lineWidth=3;ctx.stroke();});
    });
  }
  function drawMovement(t){
    people.forEach((p,i)=>{const a=p.angle+t*p.speed*(i%2?1:-1);drawPerson(480+Math.cos(a)*p.radius,320+Math.sin(a)*p.radius,p.color);});
    for(let i=0;i<8;i++){const zone=zones.filter(z=>z.id!=='heart')[i];const phase=(t*.11+i*.13)%1;drawPerson(480+(zone.cx-480)*phase,320+(zone.cy-320)*phase,['#4e8a9e','#d6806d','#7f9b55'][i%3]);}
    const a=(t*.18)%(Math.PI*2),x=480+Math.cos(a)*267,y=320+Math.sin(a)*267;
    ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);rect(-12,-6,24,12,'#fff8df');rect(-8,-3,16,5,'#52b9c6');ctx.restore();
  }
  function draw(time){
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,960,640);ctx.imageSmoothingEnabled=false;
    ctx.setTransform(camera.zoom,0,0,camera.zoom,480-camera.x*camera.zoom,320-camera.y*camera.zoom);
    if(mapImage.complete)ctx.drawImage(mapImage,0,0,960,640);else rect(0,0,960,640,'#d9edf0');
    drawLabels();drawMovement(reduceMotion?0:time/1000);requestAnimationFrame(draw);
  }
  function screenToWorld(e){const r=canvas.getBoundingClientRect();const px=(e.clientX-r.left)/r.width*960,py=(e.clientY-r.top)/r.height*640;return{x:camera.x+(px-480)/camera.zoom,y:camera.y+(py-320)/camera.zoom};}
  function locate(p){const spot=spots.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<18/camera.zoom);if(spot)return{zone:findZone(spot.zone),spot};const zone=[...zones].sort((a,b)=>a.r-b.r).find(z=>Math.hypot(z.cx-p.x,z.cy-p.y)<=z.r);return zone?{zone}:null;}
  function selectZone(id,spot){
    const zone=findZone(id);if(!zone)return;selected=id;
    document.querySelectorAll('#city-zone-list button').forEach(b=>b.classList.toggle('active',b.dataset.zone===id));
    info.replaceChildren();
    const tag=document.createElement('span');tag.className='info-tag';tag.textContent=zone.type+' · '+(spot?'城市地点':'功能分区');
    const title=document.createElement('h2');title.textContent=spot?spot.name:zone.name;
    const p=document.createElement('p');p.textContent=spot?.detail||zone.summary;
    const list=document.createElement('ul');list.className='info-place-list';
    zone.spots.forEach(([name,,,type])=>{const li=document.createElement('li');li.textContent=name;const sm=document.createElement('small');sm.textContent=type;li.append(sm);list.append(li);});
    const link=document.createElement('a');link.className='solid-button';link.href='pixel-map.html?place='+(spot?spot.id:zone.id);link.textContent='在详细地图中查看 ↗';
    info.append(tag,title,p,list,link);
    if (zone.type === '农业') {
      const meal = document.createElement('p');
      meal.textContent = '从这里的温室出发，跟着像素小人看看一份热饭如何种植、采摘、现炒与打包。';
      const deliveryLink = document.createElement('a');
      deliveryLink.className = 'solid-button';
      deliveryLink.href = 'delivery.html';
      deliveryLink.textContent = '去丰收市集点一份外卖 ↗';
      info.append(meal, deliveryLink);
    }
  }
  function clamp(){const halfW=480/camera.zoom,halfH=320/camera.zoom;camera.x=Math.max(halfW,Math.min(960-halfW,camera.x));camera.y=Math.max(halfH,Math.min(640-halfH,camera.y));}
  function setZoom(value){camera.zoom=Math.max(1,Math.min(2.4,value));clamp();}
  directory.innerHTML=zones.map(z=>`<button type="button" data-zone="${z.id}">${z.name.replace('区','')}</button>`).join('');
  directory.addEventListener('click',e=>{const btn=e.target.closest('button[data-zone]');if(!btn)return;const z=findZone(btn.dataset.zone);selectZone(z.id);setZoom(1.55);camera.x=z.cx;camera.y=z.cy;clamp();});
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};dragged=false;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(drag){const r=canvas.getBoundingClientRect(),dx=(e.clientX-drag.x)/r.width*960/camera.zoom,dy=(e.clientY-drag.y)/r.height*640/camera.zoom;if(Math.abs(dx)+Math.abs(dy)>7)dragged=true;if(dragged){camera.x=drag.cx-dx;camera.y=drag.cy-dy;clamp();}}else hovered=locate(screenToWorld(e))?.zone.id||null;});
  canvas.addEventListener('pointerup',e=>{if(!dragged){const item=locate(screenToWorld(e));if(item)selectZone(item.zone.id,item.spot);}drag=null;});
  canvas.addEventListener('pointerleave',()=>{hovered=null;});canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.zoom+(e.deltaY<0?.15:-.15));},{passive:false});
  document.getElementById('city-zoom-in').onclick=()=>setZoom(camera.zoom+.25);document.getElementById('city-zoom-out').onclick=()=>setZoom(camera.zoom-.25);document.getElementById('city-reset').onclick=()=>{camera.x=480;camera.y=320;camera.zoom=1;};
  function clock(){document.getElementById('city-clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}clock();setInterval(clock,10000);
  const initial=new URLSearchParams(location.search).get('zone');if(initial&&findZone(initial)){const z=findZone(initial);selectZone(initial);setZoom(1.55);camera.x=z.cx;camera.y=z.cy;clamp();}
  requestAnimationFrame(draw);
})();
