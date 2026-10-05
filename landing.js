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
  ['铁壁保障区','安全防卫、物流保障与外层屏障共同守护整座城市。'],
  ['启明科研区','科研实验室、天文观测与城市创新空间汇聚于此。'],
  ['望乡旅游区','湖湾、文化展景与度假设施组成炽日最轻松的区域。'],
  ['星港特区','星际交通、商业服务与旅客换乘构成城市门户。'],
  ['安栖居民区','住宅、街角商业和邻里公园让轨道生活保持温度。'],
  ['薪火大学区','大学、公共课堂和人才社区让城市知识不断延续。'],
  ['绿野农业区','温室农场、循环水渠和生态景观提供城市日常食物。'],
  ['熔炉工业区','制造、维修与能源加工维持城市设备稳定运行。']
];
const ringAssets=['shield','safety','culture','energy','home','care','harvest','forge'];
const ringZones=['shield','safety','forge','culture','energy','harvest','home','care'];
const ringImage=document.querySelector('.ring-visual img');
ringImage.src='assets/ring-shield.jpg';
ringImage.alt='铁壁保障区场景图';
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
  ringVisit.href=`pixel-city.html?zone=${ringZones[Number(btn.dataset.ring)]}`;
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
