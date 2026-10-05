// The city is a local, continuously animated concept model. Coordinates are shared with the street map.
(() => {
  const {zones,spots,findZone}=window.CHIRI_WORLD;
  const canvas=document.getElementById('city-canvas');
  const ctx=canvas.getContext('2d');
  const info=document.getElementById('city-info-content');
  const directory=document.getElementById('city-zone-list');
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const camera={x:480,y:320,zoom:1};
  let selected=null,hovered=null,drag=null,dragged=false;
  const palette={road:'#acc2b8',roadDark:'#91b0a5',walk:'#ecedcf',rail:'#62cbb1',ink:'#294d3f',tree:'#4a9c6c',treeLight:'#88bd78'};
  function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function line(x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function hash(n){return ((n*1103515245+12345)>>>0)/4294967295;}
  function drawRoads(){
    rect(0,0,960,640,'#dbe9d7');
    for(const x of [313,628]){rect(x,0,29,640,palette.walk);rect(x+4,0,21,640,palette.road);for(let y=0;y<640;y+=28)rect(x+13,y+7,3,11,'#f8f1cf');}
    for(const y of [205,415]){rect(0,y,960,30,palette.walk);rect(0,y+4,960,22,palette.road);for(let x=0;x<960;x+=30)rect(x+5,y+13,12,3,'#f8f1cf');}
    for(const x of [313,628])for(const y of [205,415]){rect(x-2,y-2,33,34,palette.roadDark);for(let i=0;i<3;i++){rect(x-1+i*10,y+1,5,4,'#faf3dc');rect(x-1+i*10,y+25,5,4,'#faf3dc');}}
    ctx.strokeStyle=palette.rail;ctx.lineWidth=4;ctx.setLineDash([12,7]);ctx.strokeRect(14,11,932,618);ctx.setLineDash([]);
    for(let x=70;x<900;x+=78){rect(x,210,3,18,'#f7efd8');rect(x,420,3,18,'#f7efd8');}
  }
  function tree(x,y,scale=1){rect(x-2*scale,y+2*scale,4*scale,9*scale,'#785a44');rect(x-8*scale,y-6*scale,16*scale,10*scale,palette.tree);rect(x-5*scale,y-9*scale,10*scale,7*scale,palette.treeLight);}
  function building(x,y,w,h,base,variant){
    rect(x+5,y+7,w,h,'#47695c50');rect(x,y,w,h,base);rect(x+3,y+3,w-6,h-6,variant);
    rect(x+6,y+7,Math.max(5,w-12),3,'#ffffff90');
    for(let wy=y+17;wy<y+h-5;wy+=13)for(let wx=x+7;wx<x+w-5;wx+=12)rect(wx,wy,5,4,'#c8f1ef');
  }
  function drawZone(zone,index){
    const {x,y,w,h}=zone;rect(x+4,y+6,w,h,'#698c7860');rect(x,y,w,h,zone.color);
    rect(x+8,y+8,w-16,h-16,'#ffffff44');
    for(let i=0;i<6;i++){const xx=x+23+i*43;rect(xx,y+14,4,h-28,'#ffffff3d');}
    for(let j=0;j<4;j++){const yy=y+28+j*38;rect(x+11,yy,w-22,3,'#ffffff49');}
    if(zone.id==='heart'){
      rect(x+29,y+36,w-58,h-68,'#f7e8b7');rect(x+47,y+50,w-94,h-96,'#e6ca84');
      ctx.fillStyle='#fff3cc';ctx.beginPath();ctx.arc(x+w/2,y+83,50,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#cb9c51';ctx.beginPath();ctx.arc(x+w/2,y+83,30,0,Math.PI*2);ctx.fill();
      rect(x+w/2-9,y+65,18,34,'#fff5d8');rect(x+w/2-4,y+48,8,18,'#fff');
      for(let i=0;i<5;i++){tree(x+25+i*52,y+143,.75);}
    }else if(zone.id==='harvest'){
      for(let j=0;j<4;j++)for(let i=0;i<6;i++){rect(x+18+i*41,y+19+j*28,32,19,j%2?'#8fb568':'#bad580');rect(x+22+i*41,y+22+j*28,2,13,'#f2e8a4');rect(x+29+i*41,y+22+j*28,2,13,'#f2e8a4');}
      building(x+189,y+116,54,30,'#7b9a86','#d9f1dc');
    }else if(zone.id==='care'){
      building(x+20,y+26,88,66,zone.dark,'#effaf4');building(x+141,y+28,96,56,zone.dark,'#f4fff8');
      rect(x+117,y+35,16,5,'#5fae92');rect(x+122,y+30,5,16,'#5fae92');
      for(let i=0;i<6;i++)tree(x+22+i*42,y+134,.8);
    }else if(zone.id==='home'){
      for(let j=0;j<2;j++)for(let i=0;i<4;i++)building(x+17+i*62,y+17+j*59,43,35,zone.dark,i%2?'#eee0d3':'#fff0de');
      for(let i=0;i<5;i++)tree(x+22+i*51,y+151,.7);
    }else if(zone.id==='energy'){
      for(let j=0;j<3;j++)for(let i=0;i<5;i++){rect(x+21+i*47,y+20+j*40,36,23,'#4d8aa6');rect(x+24+i*47,y+23+j*40,30,17,'#90c4cf');line(x+39+i*47,y+23+j*40,x+39+i*47,y+40+j*40,'#f4df9b',2);}
      building(x+212,y+122,34,26,zone.dark,'#ffe6a9');
    }else if(zone.id==='forge'){
      for(let i=0;i<3;i++)building(x+20+i*81,y+24,60,93,zone.dark,'#f4d9c3');
      for(let i=0;i<5;i++)rect(x+25+i*47,y+136,31,12,'#718b9c');
    }else if(zone.id==='culture'){
      building(x+25,y+24,103,75,zone.dark,'#eee6f5');building(x+151,y+27,93,68,zone.dark,'#fbecfb');
      rect(x+95,y+119,87,31,'#f8eada');for(let i=0;i<4;i++)tree(x+30+i*67,y+145,.7);
    }else if(zone.id==='shield'){
      building(x+20,y+36,97,75,zone.dark,'#d8edf0');building(x+151,y+26,80,82,zone.dark,'#ecf9fa');
      line(x+15,y+132,x+w-15,y+132,'#73bed2',8);for(let i=0;i<6;i++)rect(x+24+i*42,y+125,12,14,'#c9f2f4');
    }else{
      building(x+20,y+30,89,65,zone.dark,'#e6eaf4');building(x+145,y+25,92,76,zone.dark,'#f4f5fc');
      for(let i=0;i<4;i++)rect(x+32+i*55,y+127,37,18,'#859db0');
    }
    if(selected===zone.id||hovered===zone.id){ctx.strokeStyle=selected===zone.id?'#fff5bd':'#f9fff6';ctx.lineWidth=5;ctx.strokeRect(x+2,y+2,w-4,h-4);}
    rect(x+8,y+h-29,118,23,'#f8fff3e8');ctx.fillStyle=palette.ink;ctx.font='bold 16px "Microsoft YaHei",sans-serif';ctx.fillText(zone.name,x+15,y+h-12);
    zone.spots.forEach(([name,sx,sy])=>{rect(sx-5,sy-5,10,10,'#fff8d9');rect(sx-3,sy-3,6,6,zone.dark);});
  }
  const pedestrians=Array.from({length:24},(_,i)=>({axis:i%2,road:i%4<2?323:638,offset:hash(i+4)*960,speed:7+hash(i+31)*14,shirt:['#e27975','#5c8db3','#f2cb73','#7b9a78','#b777aa'][i%5],side:i%3===0?-11:11}));
  function drawPeople(t){
    pedestrians.forEach((p,i)=>{let x,y;if(p.axis){x=(p.offset+t*p.speed)%(960+40)-20;y=(i%4<2?215:425)+p.side;}else{x=p.road+p.side;y=(p.offset+t*p.speed)%(640+40)-20;}rect(x-2,y-2,4,4,'#413d3d');rect(x-3,y+2,6,5,p.shirt);rect(x-2,y+7,2,3,'#4a5c5a');rect(x+1,y+7,2,3,'#4a5c5a');});
    const trainX=26+((t*24)%910);rect(trainX,8,28,10,'#f9f7e8');rect(trainX+5,10,18,4,'#5bb2c1');rect(trainX,622,28,10,'#f9f7e8');rect(trainX+5,624,18,4,'#5bb2c1');
  }
  function draw(time){
    ctx.imageSmoothingEnabled=false;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,480,320);
    ctx.setTransform(.5*camera.zoom,0,0,.5*camera.zoom,240-camera.x*.5*camera.zoom,160-camera.y*.5*camera.zoom);
    drawRoads();zones.forEach(drawZone);if(!reduceMotion)drawPeople(time/1000);else drawPeople(0);
    requestAnimationFrame(draw);
  }
  function screenToWorld(e){const r=canvas.getBoundingClientRect();const px=(e.clientX-r.left)/r.width*960,py=(e.clientY-r.top)/r.height*640;return{x:camera.x+(px-480)/camera.zoom,y:camera.y+(py-320)/camera.zoom};}
  function locate(p){const zone=zones.find(z=>p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h);if(!zone)return null;const spot=spots.filter(s=>s.zone===zone.id).find(s=>Math.hypot(s.x-p.x,s.y-p.y)<48);return{zone,spot};}
  function selectZone(id,spot){const zone=findZone(id);if(!zone)return;selected=id;document.querySelectorAll('#city-zone-list button').forEach(b=>b.classList.toggle('active',b.dataset.zone===id));info.replaceChildren();const tag=document.createElement('span');tag.className='info-tag';tag.textContent=zone.type+' · '+(spot?'城市地点':'功能街区');const title=document.createElement('h2');title.textContent=spot?spot.name:zone.name;const p=document.createElement('p');p.textContent=spot?.detail||zone.summary;const list=document.createElement('ul');list.className='info-place-list';zone.spots.forEach(([name,, ,type])=>{const li=document.createElement('li');li.textContent=name;const sm=document.createElement('small');sm.textContent=type;li.append(sm);list.append(li);});const link=document.createElement('a');link.className='solid-button';link.href='pixel-map.html?place='+(spot?spot.id:zone.id);link.textContent='在动态地图中查看 ↗';info.append(tag,title,p,list,link);}
  function setZoom(value){camera.zoom=Math.max(1,Math.min(2.25,value));clampCamera();}
  function clampCamera(){const halfW=480/camera.zoom,halfH=320/camera.zoom;camera.x=Math.max(halfW,Math.min(960-halfW,camera.x));camera.y=Math.max(halfH,Math.min(640-halfH,camera.y));}
  directory.innerHTML=zones.map(z=>`<button type="button" data-zone="${z.id}">${z.name}</button>`).join('');directory.addEventListener('click',e=>{const btn=e.target.closest('button[data-zone]');if(!btn)return;const zone=findZone(btn.dataset.zone);selectZone(zone.id);setZoom(1.4);camera.x=zone.x+zone.w/2;camera.y=zone.y+zone.h/2;clampCamera();});
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};dragged=false;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(drag){const r=canvas.getBoundingClientRect();const dx=(e.clientX-drag.x)/r.width*960/camera.zoom,dy=(e.clientY-drag.y)/r.height*640/camera.zoom;if(Math.abs(dx)+Math.abs(dy)>7)dragged=true;if(dragged){camera.x=drag.cx-dx;camera.y=drag.cy-dy;clampCamera();}}else hovered=locate(screenToWorld(e))?.zone.id||null;});
  canvas.addEventListener('pointerup',e=>{if(!dragged){const item=locate(screenToWorld(e));if(item)selectZone(item.zone.id,item.spot);}drag=null;});canvas.addEventListener('pointerleave',()=>{hovered=null;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(camera.zoom+(e.deltaY<0?.15:-.15));},{passive:false});
  document.getElementById('city-zoom-in').onclick=()=>setZoom(camera.zoom+.25);document.getElementById('city-zoom-out').onclick=()=>setZoom(camera.zoom-.25);document.getElementById('city-reset').onclick=()=>{camera.x=480;camera.y=320;camera.zoom=1;};
  function clock(){const d=new Date();document.getElementById('city-clock').textContent=d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}clock();setInterval(clock,10000);requestAnimationFrame(draw);
  const initialZone=new URLSearchParams(location.search).get('zone');
  if(initialZone&&findZone(initialZone)){const zone=findZone(initialZone);selectZone(initialZone);setZoom(1.4);camera.x=zone.x+zone.w/2;camera.y=zone.y+zone.h/2;clampCamera();}
})();
