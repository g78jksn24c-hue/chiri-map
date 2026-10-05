const menu=document.querySelector('.menu-btn');
const links=document.querySelector('.nav-links');
menu.addEventListener('click',()=>{
  const open=links.classList.toggle('open');
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'关闭导航':'打开导航');
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
}));
const ringData=[
  ['玄甲环 · 防护','城市的第一道拥抱。外层屏障与监测系统守护每一次日出，也让生活有安心的边界。'],
  ['镇岳环 · 安全','应急、巡护与公共安全在此协同。面对宇宙的不确定，城市始终保持从容。'],
  ['锻火环 · 工业','制造与维修中心。城市的每一次更新，都从这里扎实地开始。'],
  ['长生环 · 医疗','医疗、康复与健康研究相互连接，让关怀跟得上每个人的生活。'],
  ['万象环 · 公共','集会、学习、艺术与商业交汇的公共客厅。不同的人，在这里彼此看见。'],
  ['栖云环 · 居住','有窗、有树、有邻居的家。轨道上的生活，也有熟悉而温暖的日常。'],
  ['金穗环 · 农业','温室、循环水与城市菜园，让新鲜食物和自然气息来到身边。'],
  ['日冕环 · 能源','太阳能采集与城市能源系统相连，为每个环区带来持续的光。']
];
const ringAssets=['shield','safety','forge','care','culture','home','harvest','energy'];
const ringImage=document.querySelector('.ring-visual img');
ringImage.src='assets/ring-shield.jpg';
ringImage.alt='玄甲环防护街区场景图';
const ringVisit=document.createElement('a');
ringVisit.className='ring-visit';
ringVisit.href='pixel-city.html?zone=shield';
ringVisit.textContent='走进这个街区 ↗';
document.querySelector('.ring-detail').append(ringVisit);
document.querySelectorAll('.ring-btn').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.ring-btn').forEach(b=>b.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed','true');
  const item=ringData[Number(btn.dataset.ring)];
  document.querySelector('#ring-title').textContent=item[0];
  document.querySelector('#ring-desc').textContent=item[1];
  const key=ringAssets[Number(btn.dataset.ring)];
  ringImage.src=`assets/ring-${key}.jpg`;
  ringImage.alt=`${item[0]}街区场景图`;
  ringVisit.href=`pixel-city.html?zone=${key}`;
}));
document.querySelectorAll('.ring-btn').forEach((btn,index)=>{
  const thumb=document.createElement('img');
  thumb.src=`assets/ring-${ringAssets[index]}.jpg`;
  thumb.alt='';
  thumb.loading='lazy';
  btn.prepend(thumb);
});
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target);}
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else{
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}
