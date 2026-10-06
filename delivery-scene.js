/* A hand-drawn pixel theatre. All motion follows the order's clock. */
(() => {
  'use strict';
  const art = document.createElement('canvas');
  art.width = 320; art.height = 160;
  const c = art.getContext('2d');
  const P = {ink:'#244b45', green:'#467b55', leaf:'#79a85d', mint:'#dcebd5', sky:'#edf4dd', cream:'#fff8df', wood:'#b98051', soil:'#987254', red:'#e76e49', gold:'#efba5f', teal:'#54867a', dark:'#385951'};
  const clamp = v => Math.max(0,Math.min(1,v));
  const span = (p,a,b) => clamp((p-a)/(b-a));
  const lerp = (a,b,p) => a+(b-a)*clamp(p);
  const ease = t => t*t*(3-2*t);
  function rect(x,y,w,h,color) { c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))); }
  function line(x1,y1,x2,y2,color,width=1) {
    const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
    for(let i=0;i<=n;i++) rect(lerp(x1,x2,i/(n||1)),lerp(y1,y2,i/(n||1)),width,width,color);
  }
  function poly(points,color) { c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill(); }
  function dot(x,y,col=P.cream) {rect(x,y,2,2,col);}
  function cloud(x,y) {rect(x,y,26,5,'#fff9e7');rect(x+5,y-4,14,5,'#fff9e7');rect(x+11,y-7,7,6,'#fff9e7');}
  function tree(x,y,s=1) {rect(x-2*s,y,4*s,20*s,P.wood);rect(x-13*s,y-12*s,26*s,16*s,'#a5be83');rect(x-9*s,y-20*s,18*s,24*s,'#a5be83');rect(x-8*s,y-16*s,9*s,13*s,'#b9ca91');}
  function background(t) {
    rect(0,0,320,160,P.sky);rect(0,68,320,42,'#d9e5c3');
    rect(265,13,15,15,'#f3d986');rect(262,17,21,7,'#f3d986');
    cloud(18+Math.sin(t*.04)*6,24);cloud(202+Math.sin(t*.05)*6,34);
    for(let i=0;i<8;i++){const x=i*46;rect(x,58-(i%3)*7,17,23+(i%3)*7,'#c4d8b3');rect(x+4,54-(i%3)*7,9,28,'#c4d8b3');}
    tree(25,69,.8);tree(285,67,.8);rect(0,101,320,59,'#e0d6ad');
    for(let i=0;i<44;i++) rect((i*47)%320,106+(i*23)%52,2,1,i%2?'#cabc92':'#f1e5c8');
  }
  function greenhouse(t) {
    background(t);
    rect(43,40,232,72,'#d8e7cf');poly([[41,40],[64,17],[256,17],[278,40]],'#e9efda');
    for(let x=48;x<273;x+=38){rect(x,42,32,55,'#e7eed8');rect(x+2,44,3,48,'#f1f3df');}
    line(42,40,64,16,'#8bad92',3);line(64,16,255,16,'#8bad92',3);line(255,16,277,40,'#8bad92',3);
    rect(42,38,237,3,'#8bad92');rect(43,41,3,66,'#8bad92');rect(275,41,3,66,'#8bad92');
    for(let x=84;x<=238;x+=38) rect(x,41,2,61,'#acc7a5');
    rect(42,96,237,4,'#8bad92');rect(65,25,44,7,'#f9f5d9');rect(68,27,3,3,P.green);rect(74,28,29,1,'#aec191');
    // Overhead drip irrigation, with a working reservoir.
    rect(36,63,13,30,'#96b8a5');rect(35,61,15,4,P.teal);rect(38,67,9,11,'#bfd8c5');line(47,68,269,68,'#85a695',2);
    for(let x=125;x<258;x+=25){rect(x,68,1,7,'#85a695');if(Math.floor(t*3+x)%4===0)dot(x,78+(t*7+x)%9,'#7baea5');}
    // Raised planting bed and a low fence.
    rect(105,112,165,16,'#a77c52');rect(109,110,157,9,'#775d42');rect(108,121,160,3,'#c79c65');
    for(let x=117;x<268;x+=18){rect(x,113,10,1,'#a08254');dot(x+6,116,'#b09562');}
    rect(9,101,28,22,'#c8975b');rect(12,104,22,4,'#e7bc75');rect(12,112,22,3,'#ac794c');rect(14,101,3,23,'#af7d47');rect(29,101,3,23,'#af7d47');
    rect(284,94,20,27,'#e3bc7b');rect(286,97,16,3,'#c59354');rect(286,105,16,3,'#c59354');
    // A small bird hops along the frame.
    const bx=230+Math.floor(t/2)%3*3;rect(bx,31,5,4,'#9d8872');rect(bx+3,29,3,3,'#9d8872');rect(bx+6,31,2,1,P.gold);dot(bx+4,30,P.ink);
  }
  function produce(x,y,kind='tomato',scale=1) {
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    if(kind==='wheat'){line(0,2,0,-9,'#a28645');for(let i=0;i<3;i++){rect(-3,-8+i*3,3,2,P.gold);rect(1,-9+i*3,3,2,'#e7b657');}}
    else if(kind==='corn'){rect(-3,-7,6,10,'#ebbb54');rect(-1,-8,3,12,'#f7d877');poly([[-5,-2],[-1,4],[0,4],[-3,-7]],'#78a05a');poly([[5,-4],[2,4],[0,4],[2,-8]],P.green);}
    else if(kind==='mushroom'){rect(-1,-2,3,6,'#f5e6c4');rect(-5,-5,11,4,'#ba936e');rect(-3,-7,7,3,'#caa681');rect(-3,-5,2,1,'#eee0b7');}
    else if(kind==='fruit'){rect(-4,-5,8,8,'#e9bd61');rect(-5,-3,10,4,'#edca73');rect(-1,-7,2,3,P.green);rect(1,-7,3,2,P.leaf);rect(-3,-4,2,2,'#fff0b0');}
    else {rect(-4,-4,8,7,P.red);rect(-5,-2,10,3,P.red);rect(-2,-5,5,2,P.green);rect(0,-7,1,4,P.green);rect(-3,-3,2,2,'#f5a278');}
    c.restore();
  }
  function plant(x,growth,kind,fruit=true) {
    if(growth<=0){rect(x-2,113,4,2,'#e8c28a');return;}
    const h=3+growth*25;
    line(x,112,x,112-h,P.green,2);
    for(let i=0;i<3;i++){const y=106-i*h/3;const l=(i%2?-1:1);poly([[x,y],[x+l*(5+growth*4),y-5],[x+l*8,y-1],[x,y+2]],i%2?P.leaf:'#8ab46e');}
    if(growth>.74&&fruit){produce(x+5,105-h*.62,kind);if(kind==='tomato'||kind==='fruit')produce(x-5,111-h*.4,kind);}
  }
  function basket(x,y,filled=0,kind='tomato') {
    if(filled)for(let i=0;i<Math.min(filled,4);i++)produce(x+5+i*4,y-1-(i%2)*2,kind,.7);
    rect(x,y,24,3,'#ddb576');poly([[x+1,y+3],[x+23,y+3],[x+20,y+14],[x+4,y+14]],'#b98a51');
    rect(x+4,y+4,16,2,'#d8ad6c');rect(x+5,y+9,15,2,'#d8ad6c');rect(x+8,y+2,2,11,'#a87d4a');rect(x+16,y+2,2,11,'#a87d4a');
  }
  function limb(a,b,color,width=4,bend=1) {
    const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;
    const elbow=[(a[0]+b[0])/2-dy/d*3*bend,(a[1]+b[1])/2+dx/d*3*bend];
    line(a[0],a[1],elbow[0],elbow[1],color,width);line(elbow[0],elbow[1],b[0],b[1],color,width);rect(b[0]-1,b[1],4,4,'#edbc8e');
  }
  function person(x,y,options={}) {
    const f=options.facing||1,b=options.bend||0,walk=options.walk||0;
    const role=options.role||'farmer';const shirt=role==='chef'?'#eaf0db':role==='rider'?'#eab85b':'#608b65';
    const hipY=y-16+b*3,shoulderY=y-33+b*8,neckX=x+b*8*f;
    const handR=options.handR||[neckX+10*f+walk*3,shoulderY+15];
    const handL=options.handL||[neckX-5*f-walk*3,shoulderY+14];
    rect(x-10,y+1,24,3,'#c8c69e');
    limb([neckX-4,shoulderY+2],handL,shirt,4,-f);
    // Knees flex independently, while shoes stay on the floor during a kneel.
    const feet=options.kneel?[[x-6,y],[x+12,y]]:[[x-5+walk*5,y-Math.max(0,walk)*3],[x+5-walk*5,y-Math.max(0,-walk)*3]];
    line(x-3,hipY,x-6-walk*2,y-9,'#48645b',5);line(x-6-walk*2,y-9,feet[0][0],feet[0][1]-2,'#48645b',4);
    line(x+4,hipY,x+7+walk*2,y-8,'#38564f',5);line(x+7+walk*2,y-8,feet[1][0],feet[1][1]-2,'#38564f',4);
    feet.forEach(pt=>rect(pt[0]-2,pt[1]-2,7,3,'#43514a'));
    poly([[neckX-6,shoulderY],[neckX+8,shoulderY],[x+8,hipY+2],[x-5,hipY+2]],shirt);
    if(role!=='rider'){rect(neckX,shoulderY+5,7,15-b*4,role==='chef'?'#5f9985':'#c5ae72');rect(neckX+1,shoulderY+10,4,3,role==='chef'?'#aac9a5':'#8d925e');}
    rect(neckX-2,shoulderY-5,6,7,'#dda57c');rect(neckX-5,shoulderY-15,13,13,'#edbc8e');rect(neckX-6,shoulderY-14,3,7,'#75563e');rect(neckX+6*f,shoulderY-8,3,4,'#edbc8e');
    dot(neckX+(f===1?4:-3),shoulderY-10,P.ink);rect(neckX+(f===1?4:-4),shoulderY-4,3,1,'#a8735b');
    if(role==='chef'){rect(neckX-7,shoulderY-20,16,7,'#fff9e7');rect(neckX-4,shoulderY-24,10,6,'#fff9e7');rect(neckX-7,shoulderY-14,16,2,'#ccd9c0');}
    else if(role==='rider'){rect(neckX-7,shoulderY-18,17,8,'#f2bd5c');rect(neckX-4,shoulderY-21,11,4,'#f2bd5c');rect(neckX+(f===1?3:-7),shoulderY-12,7,2,'#527d72');}
    else {rect(neckX-7,shoulderY-18,15,5,'#8ea267');rect(neckX-10,shoulderY-14,23,3,'#b7b478');}
    limb([neckX+5,shoulderY+2],handR,shirt,4,f);
    return {handR,handL};
  }
  function wateringCan(x,y,tilt,t) {
    rect(x-7,y-4,11,10,'#80b0a1');rect(x-5,y-7,6,3,P.teal);rect(x-10,y-3,3,7,P.teal);rect(x-11,y-1,2,3,P.sky);
    line(x+3,y,x+12,y+tilt*6,'#62998c',3);rect(x+10,y+tilt*6-2,4,5,'#62998c');
    if(tilt>0)for(let i=0;i<6;i++){const fall=(t*24+i*5)%22;rect(x+13+i%3*3+fall*.25,y+4+fall,1,3,'#80b7b8');}
  }
  function farm(p,t,kind,harvest) {
    greenhouse(t);
    const spots=[143,172,202,232,255];
    if(!harvest){
      const grow=span(p,.52,.96);spots.forEach((x,i)=>plant(x,clamp(grow*1.3-i*.08),kind));
      let x=lerp(62,122,ease(span(p,0,.2))),bend=0,walk=p<.2?Math.sin(t*10):0;
      let hand=[x+13,111];
      if(p>=.2&&p<.43){bend=.85;hand=[141,105+Math.sin(t*8)*5];}
      if(p>=.43&&p<.61){bend=.8;hand=[145+Math.sin(t*4)*4,103];}
      if(p>=.61){x=lerp(122,221,span(p,.61,1));walk=Math.sin(t*8)*.5;hand=[x+12,100];}
      person(x,133,{bend,kneel:bend>.5,walk,handR:hand});
      if(p>=.2&&p<.43){line(hand[0],hand[1],153,118,P.wood,2);rect(149,117,10,3,'#748379');for(let i=0;i<4;i++)rect(149+i*4,114-Math.abs(Math.sin(t*8))*i,2,2,P.soil);}
      else if(p>=.43&&p<.61){rect(129,107,6,8,'#e6c691');for(let i=0;i<4;i++)rect(hand[0]+i*2,hand[1]+(t*15+i*3)%13,2,1,P.gold);}
      else if(p>=.61)wateringCan(hand[0]+3,hand[1]+2,1,t);
      basket(76,118,0,kind);
    }else{
      const picking=span(p,.2,.74)*3,completed=Math.floor(picking),carry=p>=.74;
      const removed=completed+(!carry&&p>=.2&&picking%1>.35?1:0);
      spots.forEach((x,i)=>plant(x,1,kind,i>=removed));
      let x=lerp(68,124,ease(span(p,0,.2)));let hand=[x+12,111],walk=p<.2?Math.sin(t*10):0,bend=0;
      let transfer=null;let bx=130,by=125;
      if(p>=.2&&!carry){
        const cycle=picking%1,target=143+Math.min(2,completed)*29;
        x=lerp(124,target-20,span(cycle,0,.28));
        if(cycle<.35){hand=[lerp(x+10,target+5,cycle/.35),lerp(104,89,cycle/.35)];bend=.15;walk=Math.sin(t*10)*.55;}
        else{const q=span(cycle,.35,.92);x=lerp(target-20,124,q);hand=[lerp(target+5,141,q),lerp(89,120,q)-Math.sin(q*Math.PI)*10];transfer=[hand[0]+2,hand[1]+3];bend=q*.45;walk=Math.sin(t*10)*.5;}
      }
      if(carry){x=lerp(124,296,ease(span(p,.74,1)));walk=Math.sin(t*10);hand=[x+10,111];bx=x+6;by=112;}
      person(x,133,{bend,walk,handR:hand,handL:carry?[x+21,113]:undefined});
      basket(bx,by,carry?3:completed,kind);
      if(transfer)produce(transfer[0],transfer[1],kind,.8);
    }
  }
  function jar(x,y,col){rect(x,y,9,13,'#aec9b5');rect(x+1,y+4,7,8,col);rect(x-1,y-2,11,3,P.wood);rect(x+2,y+6,5,4,P.cream);}
  function kitchen(t,packing=false) {
    rect(0,0,320,160,'#f1edda');rect(0,103,320,57,'#ddd5b8');
    for(let x=0;x<320;x+=24)for(let y=106;y<160;y+=16){rect(x,y,23,15,((x/24+y/16)|0)%2?'#e8dfc4':'#e0d8bd');}
    rect(18,18,75,58,'#8aab99');rect(21,21,69,52,'#dcebd5');rect(23,23,65,27,'#eaf1da');
    rect(23,54,65,17,'#c2d7ad');tree(40,59,.5);tree(73,54,.6);rect(54,20,3,54,'#a1b8a0');rect(21,47,68,3,'#a1b8a0');rect(15,75,80,4,'#a6805c');
    rect(114,22,132,4,'#d3c5a5');rect(114,51,132,4,P.wood);[123,142,164,186,210,229].forEach((x,i)=>jar(x,37,[P.red,P.gold,P.leaf,'#dab590'][i%4]));
    for(let y=62;y<103;y+=13){rect(100,y,150,1,'#dedeca');for(let x=100+(y%2)*12;x<251;x+=24)rect(x,y,1,13,'#dedeca');}
    rect(164,58,68,4,'#aab8a0');line(178,28,169,59,'#bcc8b0',4);line(220,28,230,59,'#bcc8b0',4);rect(181,27,36,14,'#bcc8b0');
    rect(26,101,223,5,'#f8f0d9');rect(29,106,217,27,'#93ac8b');rect(31,109,60,22,'#a6bd9a');rect(97,109,65,22,'#a6bd9a');rect(169,109,73,22,'#a6bd9a');
    rect(49,114,20,2,'#648875');rect(115,114,20,2,'#648875');rect(191,114,20,2,'#648875');rect(33,133,5,6,'#6a866e');rect(235,133,5,6,'#6a866e');
    rect(267,30,42,106,'#b1bba1');rect(270,33,36,93,packing?'#d7e4c6':'#e1e1c9');rect(268,130,44,5,'#ac9572');rect(285,33,2,94,'#a0b19b');
    if(packing){rect(271,61,33,34,'#cbdcb8');rect(271,89,33,5,'#b6c89f');rect(276,44,24,6,'#f6edcc');}
    else{rect(274,39,26,23,'#c7d7bf');rect(276,42,10,3,'#f5edd5');rect(276,48,15,2,'#9bae95');rect(293,85,3,12,'#8f9c83');}
    // Hanging utensils and a plant on the windowsill.
    rect(105,66,50,2,'#9ba991');[111,124,140].forEach((x,i)=>{rect(x,68,1,17,'#7e8d7b');rect(x-2,80,5,i===1?8:4,'#7e8d7b');});
    rect(28,64,11,10,'#cb9d76');line(34,65,34,50,P.green,2);poly([[34,58],[27,53],[27,59],[34,62]],P.leaf);poly([[34,56],[41,50],[41,56],[34,60]],P.green);
  }
  function steam(x,y,t,count=5){for(let i=0;i<count;i++){const q=(t*.55+i*.19)%1;rect(x+i*5+Math.sin(q*8+i)*3,y-q*24,2+q*2,4,'#fbf8e5');}}
  function flame(x,y,t){for(let i=0;i<5;i++){const h=5+Math.abs(Math.sin(t*11+i))*6;rect(x+i*4,y-h,3,h,'#e9a24c');rect(x+i*4,y-h/2,2,h/2,'#f5d172');}}
  function foodBits(x,y,q,kind){for(let i=0;i<6;i++){const a=i*.86;rect(x+Math.cos(a)*q*15,y-Math.sin(q*Math.PI)*20-i%2*3,3,3,i%3===0?P.leaf:kind==='tomato'?P.red:P.gold);}}
  function pan(x,y,tilt=0){line(x-17,y+4,x-29,y+2-tilt*4,P.wood,3);poly([[x-18,y],[x+19,y],[x+13,y+9],[x-10,y+9]],'#455e55');rect(x-16,y,32,2,'#718174');rect(x-10,y+3,21,2,'#9eae84');}
  function bowl(x,y,dish){if(dish==='drink'){rect(x-7,y-13,14,18,'#d8e6c5');rect(x-5,y-7,10,10,'#e8be67');rect(x-8,y-14,16,3,'#f5efd6');rect(x+3,y-23,2,11,'#739e88');}else{poly([[x-13,y-4],[x+13,y-4],[x+9,y+6],[x-8,y+6]],'#f6edce');rect(x-11,y-5,22,3,dish==='soup'?'#dda959':'#d9ba78');rect(x-6,y-6,4,3,P.red);rect(x+4,y-5,3,2,P.leaf);}}
  function cooking(p,t,kind,dish) {
    kitchen(t);
    rect(94,97,44,4,'#c99b66');rect(171,99,56,3,'#697b6b');rect(177,102,9,2,'#eec27a');rect(211,102,9,2,'#eec27a');
    let x=lerp(53,94,ease(span(p,0,.18))),walk=p<.18?Math.sin(t*10):0;
    let hand=[x+12,100],other=[x+22,99];
    if(p<.18){person(x,134,{role:'chef',walk,handR:hand,handL:other});basket(x+6,100,3,kind);}
    else if(p<.42){
      x=99;const chop=Math.max(0,Math.sin(t*14));hand=[119,90-chop*9];other=[109,94];
      person(x,134,{role:'chef',handR:hand,handL:other,bend:.13});
      produce(111,93,kind,.8);rect(118,hand[1]+3,8,5,'#b3c0af');rect(119,hand[1],3,4,P.wood);
      for(let i=0;i<7;i++)rect(123+i%3*4,93+Math.floor(i/3)*2,3,2,i%2?P.leaf:P.red);
      basket(53,88,1,kind);
    }else if(p<.53){
      const q=span(p,.42,.53);x=lerp(100,161,q);hand=[x+18,92];person(x,134,{role:'chef',handR:hand,handL:[x+11,94],walk:Math.sin(t*10)});
      rect(hand[0]-8,96,24,2,'#c99b66');foodBits(hand[0]+3,93,q,kind);pan(199,94);
    }else{
      x=170;const toss=(t*1.15)%1,tossH=Math.sin(toss*Math.PI)*5;hand=[179,97-tossH];
      person(x,134,{role:'chef',handR:hand,handL:[184,82+Math.sin(t*7)*3]});
      if(dish==='drink'){
        rect(198,77,17,22,'#c4d9bf');rect(199,84,15,12,'#e7bb6a');rect(195,99,23,4,'#628c77');rect(201,72,13,4,'#dfe6cc');
        line(193,81,207,92+Math.sin(t*10)*2,P.wood,2);for(let i=0;i<5;i++)rect(202+(i*3+Math.floor(t*13))%11,85+i%3*3,2,2,'#f4d997');
        if(p>.82){
          const q=span(p,.82,1);bowl(237,96,'drink');
          rect(216,73,16,13,'#c4d9bf');rect(218,77,12,6,'#e7bb6a');
          line(231,82,237,92,'#e7bb6a',2);rect(231,94-q*9,12,Math.max(1,q*9),'#e7bb6a');
          line(181,87,218,79,'#eaf0db',4);rect(216,77,4,4,'#edbc8e');
        }
      }else if(dish==='sweet'){
        rect(215,67,35,35,'#55796a');rect(218,71,29,23,'#324c42');rect(220,73,25,18,p>.68&&p<.9?'#ba7845':'#697c66');
        rect(224,96,6,3,'#e4dabb');rect(236,96,6,3,'#e4dabb');
        if(p<.7){bowl(201,94,dish);line(186,85,204,93+Math.sin(t*9)*2,P.wood,2);}
        else if(p<.9){
          rect(222,85,21,4,'#d4ac73');rect(225,80,15,5,'#efcd8c');
          if(p<.76){line(180,90,223,84,'#eaf0db',4);rect(220,82,4,4,'#edbc8e');rect(216,94,34,3,'#b6bda6');}
          steam(228,67,t,2);
        }else{
          const q=span(p,.9,1);rect(190,91,19,10,'#e9bc7c');rect(190,88,19,5,'#fff4d5');
          const dx=190+q*16;line(183,85,dx,84,'#eaf0db',4);poly([[dx-3,78],[dx+3,78],[dx,87]],'#fff8e4');
          if(q>.5)produce(200,86,'fruit',.45);steam(199,81,t,2);
        }
      }else{
        flame(184,102,t);pan(201,92-tossH,tossH/5);foodBits(201,89-tossH,toss,kind);line(186,84,206,89-tossH,'#ac8961',2);steam(194,85-tossH,t);
      }
    }
    if(p>.9&&dish!=='sweet'&&dish!=='drink'){bowl(235,93,dish);steam(231,85,t,3);}
  }
  function mealBox(x,y,closed=0,dish='main',label=false) {
    if(dish==='drink') {bowl(x+12,y+8,'drink');if(label)rect(x+8,y+2,8,5,'#f9f5df');return;}
    rect(x,y,28,11,'#dbc390');rect(x+2,y+2,24,7,'#f5dfaa');
    rect(x+4,y+3,20,4,dish==='soup'?'#dda95f':'#e4c275');rect(x+7,y+2,5,3,P.red);rect(x+18,y+3,4,2,P.green);
    if(closed>0){rect(x,y-9+closed*9,28,Math.max(2,closed*4),'#efe0b9');rect(x,y+closed*3,28,2,'#d5bd88');}
    if(label){rect(x+10,y-1,8,13,'#f9f4dd');rect(x+12,y+3,4,3,P.green);}
  }
  function scooter(x,y,t,moving=false) {
    [x+3,x+33].forEach(wx=>{rect(wx-5,y-5,10,10,P.dark);rect(wx-3,y-3,6,6,'#b2bfa4');rect(wx-1,y-1,2,2,P.cream);if(moving)line(wx,y,wx+Math.cos(t*15)*3,y+Math.sin(t*15)*3,P.cream);});
    rect(x+2,y-9,29,6,'#c19d53');rect(x+15,y-17,18,9,'#e9bd62');rect(x+12,y-20,13,4,P.dark);line(x+31,y-7,x+35,y-24,'#c7a051',3);rect(x+30,y-25,8,3,P.dark);rect(x-3,y-30,17,17,'#d9a655');rect(x-1,y-28,13,13,'#f1c875');rect(x+2,y-25,7,7,P.cream);
  }
  function packing(p,t,kind,dish,finished) {
    kitchen(t,true);
    rect(44,96,35,5,'#d0b180');bowl(60,90,dish);steam(54,80,t,3);
    rect(194,92,13,10,'#dcb275');rect(196,90,9,4,'#f5e7bc');rect(222,91,12,10,'#e8d9b3');rect(224,93,8,2,'#688f78');
    const leaving=finished?clamp((t-40)*.25):0;const riderX=281+leaving*58;
    scooter(riderX-8,146,t,leaving>0);person(riderX,126,{role:'rider',facing:-1,handR:[riderX-12,109],handL:[riderX+14,113],bend:.1});
    if(finished){person(236,134,{role:'chef',handR:[253,96],handL:[232,108]});rect(riderX-12,95,25,20,'#e8bc78');rect(riderX-1,95,4,20,P.cream);rect(riderX-5,101,12,5,P.green);return;}
    let x=106,hand=[121,95],other=[121,99],bend=0;
    if(p<.23){const q=(p/.23)%1;hand=[lerp(64,141,q),90-Math.sin(q*Math.PI)*14];x=105;}
    else if(p<.46){hand=[141,88+Math.sin(t*6)*3];other=[129,96];bend=.18;}
    else if(p<.68){hand=[lerp(133,155,span(p,.46,.68)),94];other=[130,98];bend=.23;}
    else{x=lerp(108,236,ease(span(p,.68,.96)));hand=[x+18,102];other=[x+30,105];}
    person(x,134,{role:'chef',bend,handR:hand,handL:other,walk:p>.68?Math.sin(t*10):0});
    if(p<.23){mealBox(132,97,0,dish);line(hand[0]-6,hand[1]-3,hand[0]+4,hand[1]+4,P.wood,2);rect(hand[0]+3,hand[1]+4,7,3,'#b1b8a0');rect(hand[0]+4,hand[1]+3,4,2,P.gold);}
    else if(p<.46){mealBox(132,97,span(p,.23,.46),dish);rect(hand[0]-4,hand[1]+5,17,2,'#efe0b9');}
    else if(p<.68){mealBox(132,97,1,dish,p>.59);rect(hand[0],hand[1],5,4,P.cream);}
    else{rect(x+14,105,27,21,'#dfb777');rect(x+16,106,23,3,'#eac994');rect(x+24,105,4,21,P.cream);rect(x+21,112,13,7,'#f8edcd');rect(x+25,114,5,3,P.green);line(x+20,104,x+20,99,P.wood);line(x+20,99,x+34,99,P.wood);line(x+34,99,x+34,105,P.wood);}
  }
  function render(stage=0,progress=.55,options={}) {
    const target=document.getElementById('kitchen-canvas');if(!target)return;
    const ctx=target.getContext('2d');if(!ctx)return;
    const p=clamp(progress),t=Number.isFinite(options.time)?options.time:stage*10+p*10;
    const kind=options.ingredient||'tomato',dish=options.dish||'main';
    c.clearRect(0,0,320,160);c.imageSmoothingEnabled=false;
    if(stage<2)farm(p,t,kind,stage===1);else if(stage===2)cooking(p,t,kind,dish);else packing(p,t,kind,dish,!!options.finished);
    // Quiet foreground framing keeps the scene legible at phone size.
    rect(0,157,320,3,'#bec2a0');
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,target.width,target.height);ctx.drawImage(art,0,0,target.width,target.height);
  }
  window.ChiriKitchen={render};
})();
