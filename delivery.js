(() => {
  'use strict';
  const products = [
    {id:'tomato-rice', name:'星港番茄焗饭', category:'main', price:28, desc:'星光番茄、云米和融化芝士', ingredient:'tomato', color:'#e97954', tag:'本日推荐'},
    {id:'green-noodle', name:'绿野春笋面', category:'main', price:24, desc:'春笋、青豆与手擀麦面', ingredient:'wheat', color:'#7ba66a', tag:'清爽一餐'},
    {id:'fire-pot', name:'熔炉香辣锅', category:'main', price:36, desc:'三种时蔬、豆腐和炽火酱', ingredient:'tomato', color:'#d9674c', tag:'热辣现炒'},
    {id:'moon-soup', name:'月湾菌菇汤', category:'soup', price:18, desc:'穹顶菌菇、玉米和白胡椒', ingredient:'mushroom', color:'#c49a6b', tag:'温暖鲜汤'},
    {id:'crispy-corn', name:'金穗脆玉米', category:'soup', price:12, desc:'现剥玉米配一小撮海盐', ingredient:'corn', color:'#e5bb57', tag:'农场小食'},
    {id:'nebula-tea', name:'云海柚子茶', category:'drink', price:15, desc:'柚子、薄荷和冷萃茶', ingredient:'fruit', color:'#d7a74a', tag:'鲜果冷萃'},
    {id:'sun-milk', name:'日冕燕麦奶', category:'drink', price:16, desc:'燕麦奶、蜂蜜与肉桂', ingredient:'wheat', color:'#dec594', tag:'谷物香气'},
    {id:'star-cake', name:'星环奶油方糕', category:'sweet', price:22, desc:'轻奶油、莓果和脆米', ingredient:'fruit', color:'#d68b91', tag:'一点甜蜜'},
  ];
  const STAGE_MS = 10000, TOTAL_MS = STAGE_MS * 4, STORAGE = 'chiri-bite-order-v1';
  const state = {category:'all', cart:new Map(), order:null, stage:-1, frame:0, lastPaint:0, finished:false};
  const $ = id => document.getElementById(id);
  const scene = $('pixel-scene');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const money = value => '¥ ' + value;
  const productById = id => products.find(product => product.id === id);

  // Each dish is drawn on the same tiny pixel grid, so the menu and kitchen share a visual language.
  function dishArt(product) {
    const c = product.color;
    let art = '';
    if (product.category === 'drink') {
      art = '<path fill="#365b4b" d="M30 27h38v6H30zM33 33h4v41h-4zM61 33h4v41h-4zM37 74h24v5H37z"/><path fill="#fff7dd" d="M37 33h24v41H37z"/><path fill="'+c+'" d="M37 44h24v27H37z"/><path fill="#fff" opacity=".55" d="M41 48h5v5h-5zm10 10h5v5h-5z"/><path fill="#365b4b" d="M53 17h4v28h-4zM53 17h15v4H53z"/><path fill="#7c9d66" d="M25 26h8v5h-8zM26 22h4v4h-4z"/>';
    } else if (product.category === 'sweet') {
      art = '<path fill="#466353" d="M19 70h58v5H19z"/><path fill="#c58659" d="M26 41h44v29H26z"/><path fill="#f5d594" d="M26 52h44v9H26z"/><path fill="#fff7e7" d="M26 35h44v13H26zM31 29h34v6H31z"/><path fill="'+c+'" d="M36 24h9v9h-9zM54 27h9v8h-9z"/><path fill="#72935c" d="M39 20h5v5h-5z"/>';
    } else if (product.id === 'crispy-corn') {
      art = '<path fill="#e7efdf" d="M18 64h60v11H18z"/><path fill="#466353" d="M18 75h60v4H18z"/><path fill="#70955b" d="M22 61h14v-9H22zM65 37h13v-8H65z"/><path fill="#d29d38" d="M30 52h10v14H30zM38 44h10v20H38zM46 36h10v23H46zM54 31h10v20H54zM62 28h9v17h-9z"/><path fill="#f2cd64" d="M32 52h5v5h-5zM40 46h5v5h-5zM48 40h5v5h-5zM56 34h5v5h-5zM45 54h5v5h-5zM54 47h5v5h-5zM63 34h5v5h-5z"/>';
    } else {
      art = '<path fill="#3d5d4b" d="M18 43h60v14h-5v11h-7v8H30v-8h-7V57h-5z"/><path fill="#fff4dc" d="M22 48h52v9h-5v10H30V57h-8z"/><path fill="'+c+'" d="M23 40h49v12H23z"/><path fill="#f4d589" d="M29 35h37v7H29z"/><path fill="#64916b" d="M30 39h9v6h-9zM57 35h8v8h-8z"/>';
      if (product.id === 'green-noodle') art += '<path fill="none" stroke="#ffe3a5" stroke-width="3" d="M30 47h31v-4H38v-5h20M32 52h29"/><path fill="#739353" d="M42 31h5v11h-5zM48 28h5v12h-5z"/>';
      else if (product.id === 'moon-soup') art += '<path fill="#8f795a" d="M41 35h14v5H41zM45 30h6v5h-6z"/><path fill="#e9d2aa" d="M46 39h5v9h-5z"/>';
      else art += '<path fill="#c85e45" d="M42 35h10v10H42zM61 43h8v7h-8z"/><path fill="#efad77" d="M44 36h4v4h-4z"/>';
      art += '<path fill="#fff" opacity=".7" d="M34 22h3v8h-3zM48 17h3v10h-3zM61 23h3v7h-3z"/>';
    }
    return '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shape-rendering="crispEdges"><ellipse cx="48" cy="82" rx="31" ry="5" fill="#35503c" opacity=".09"/>'+art+'</svg>';
  }
  function showToast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('is-show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => $('toast').classList.remove('is-show'), 2200);
  }
  function renderMenu() {
    $('food-grid').innerHTML = products.filter(p => state.category === 'all' || p.category === state.category).map(p =>
      '<article class="food-card"><div class="food-art '+p.category+'" aria-hidden="true">'+dishArt(p)+'</div><div class="food-copy"><small class="food-tag">'+p.tag+'</small><h3>'+p.name+'</h3><p>'+p.desc+'</p><div class="food-meta"><span class="food-price">'+money(p.price)+'</span><button class="add-food" type="button" data-add="'+p.id+'" aria-label="加入'+p.name+'">＋</button></div></div></article>'
    ).join('');
  }
  function cartRows() {
    return [...state.cart].map(([id, quantity]) => ({...productById(id), quantity}));
  }
  function renderCart() {
    const rows = cartRows();
    const count = rows.reduce((n, row) => n + row.quantity, 0);
    const total = rows.reduce((n, row) => n + row.price * row.quantity, 0);
    $('cart-count').textContent = count;
    $('cart-total').textContent = money(total);
    $('mobile-count').textContent = count;
    $('mobile-total').textContent = money(total);
    $('mobile-basket').hidden = !count;
    $('checkout-btn').disabled = !count || (!!state.order && !state.finished);
    $('checkout-btn').innerHTML = state.order && !state.finished ? '厨房正在制作中…' : '模拟下单 <span>→</span>';
    $('cart-items').innerHTML = rows.length ? rows.map(row =>
      '<div class="cart-line"><strong>'+row.name+'</strong><span>'+money(row.price * row.quantity)+'</span><div class="quantity"><button type="button" data-remove="'+row.id+'" aria-label="减少一份'+row.name+'">−</button><output>'+row.quantity+'</output><button type="button" data-add="'+row.id+'" aria-label="再加一份'+row.name+'">＋</button></div></div>'
    ).join('') : '<div class="empty-cart"><span>⌁</span><p>还没有选择味道<br><small>挑一份喜欢的，交给炽日厨房。</small></p></div>';
  }
  function changeQuantity(id, delta) {
    if (!productById(id)) return;
    const value = Math.max(0, Math.min(20, (state.cart.get(id) || 0) + delta));
    if (value) state.cart.set(id, value); else state.cart.delete(id);
    renderCart();
    if (delta > 0) showToast(productById(id).name + ' 已放进餐篮');
  }
  function stageData() {
    const lead = productById(state.order.leadId);
    const crop = {tomato:'番茄',wheat:'谷物',corn:'玉米',mushroom:'菌菇',fruit:'鲜果'}[lead.ingredient];
    const kind = lead.category === 'drink' ? 'drink' : lead.category === 'sweet' ? 'sweet' : 'hot';
    return [
      {title:'从一颗种子开始',label:'绿野农业区 · 城市温室',copy:'翻松土壤，播下'+crop+'的希望，再浇一壶水。生长时间在这里被浓缩成十秒。',actions:['走向菜畦','翻土播种','浇水育苗','等待新芽长大']},
      {title:'收下刚刚好的新鲜',label:'绿野农业区 · 采收田',copy:'农人弯腰采下'+crop+'，把收成放进藤篮，再送到厨房的备料台。',actions:['走向成熟的作物','弯腰采收','把收成装进篮子','提篮送往厨房']},
      {title:kind === 'drink' ? '把清新调进这一杯' : kind === 'sweet' ? '让甜蜜慢慢烤出来' : '热锅一翻，香气就来了',label:'星港厨房 · '+(kind === 'drink'?'饮品台':kind === 'sweet'?'烘焙台':'现炒档口'),copy:kind === 'drink'?'处理新鲜原料、搅拌调制，再倒入你的杯子。':kind === 'sweet'?'把原料搅匀送进烤箱，再点上奶油与莓果。':'切配食材、倒入热锅，再用锅铲翻炒。火苗和热气都跟着节奏动起来。',actions:kind === 'drink'?['清洗切配','调配饮品','搅拌融合','准备出杯']:kind === 'sweet'?['称料搅拌','送进烤箱','等待烘焙','奶油点缀']:['切配食材','倒入热锅','翻锅现炒','出锅盛装']},
      {title:'认真装好你的这一餐',label:'星港厨房 · 打包出餐口',copy:'装入餐盒、合上盖子、贴好订单签。骑手已经来到门口，等这份新鲜出发。',actions:['摆好餐盒','盛入餐食','合盖贴签','交给配送员']},
    ];
  }
  function saveOrder() {
    try { sessionStorage.setItem(STORAGE, JSON.stringify(state.order)); } catch (_) {}
  }
  function elapsed() {
    return Math.min(TOTAL_MS, Math.max(0, (state.order.pausedAt || Date.now()) - state.order.startedAt));
  }
  function setStage(stage) {
    state.stage = stage;
    const data = stageData()[stage];
    $('trace-title').textContent = data.title;
    $('scene-label').textContent = data.label;
    $('trace-caption-title').textContent = data.title;
    $('trace-caption-copy').textContent = data.copy;
    $('kitchen-canvas').setAttribute('aria-label', data.title+'。'+data.copy);
    scene.className = 'pixel-scene scene-' + ['plant','harvest','cook','pack'][stage];
    document.querySelectorAll('.trace-step').forEach((step, index) => {
      step.classList.toggle('is-current', index === stage);
      step.classList.toggle('is-done', index < stage);
      if (index === stage) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    });
    document.querySelectorAll('.trace-steps>i').forEach((line, index) => line.classList.toggle('is-done', index < stage));
  }
  function paint(ms, force = false) {
    const stage = Math.min(3, Math.floor(ms / STAGE_MS));
    const progress = Math.min(1, (ms - stage * STAGE_MS) / STAGE_MS);
    if (state.stage !== stage) setStage(stage);
    const percent = Math.floor(ms / TOTAL_MS * 100);
    $('trace-progress').style.width = percent + '%';
    $('trace-progress').parentElement.setAttribute('aria-valuenow', percent);
    $('trace-time').textContent = Math.max(0, Math.ceil((TOTAL_MS - ms) / 1000));
    $('scene-action').textContent = stageData()[stage].actions[Math.min(3, Math.floor(progress * 4))];
    // Reduced motion keeps the four scenes and status changes, but uses quiet stills.
    if (window.ChiriKitchen && (force || !motion.matches || Math.floor(ms / 2500) !== state.lastPaint)) {
      const lead = productById(state.order.leadId);
      window.ChiriKitchen.render(stage, motion.matches ? .6 : progress, {finished:ms >= TOTAL_MS, ingredient:lead.ingredient, dish:lead.category, time:ms / 1000});
      state.lastPaint = Math.floor(ms / 2500);
    }
  }
  function finishOrder() {
    state.finished = true;
    $('trace-title').textContent = '这一餐，打包好了！';
    $('trace-caption-title').textContent = '下一站：日心广场';
    $('trace-caption-copy').textContent = '骑手接过餐袋，城市里又多了一份热乎乎的期待。';
    $('trace-time').textContent = '✓';
    $('trace-time-label').textContent = '制作完成';
    $('scene-action').textContent = '餐食已交给骑手';
    $('pause-order').hidden = true;
    $('replay-order').hidden = false;
    $('receipt').hidden = false;
    $('receipt').textContent = '模拟订单完成 · 取餐码 ' + state.order.code + ' · 共 '+state.order.count+' 份 · '+money(state.order.total)+' · 无需付款';
    scene.classList.add('is-finished');
    document.querySelectorAll('.trace-step').forEach(step => {
      step.classList.remove('is-current'); step.classList.add('is-done'); step.removeAttribute('aria-current');
    });
    document.querySelectorAll('.trace-steps>i').forEach(line => line.classList.add('is-done'));
    renderCart();
    saveOrder();
    if (!motion.matches && window.ChiriKitchen) {
      const start = performance.now();
      const lead = productById(state.order.leadId);
      const depart = now => {
        if (!state.finished) return;
        const seconds = Math.min(4, (now - start) / 1000);
        window.ChiriKitchen.render(3, 1, {finished:true, ingredient:lead.ingredient, dish:lead.category, time:40 + seconds});
        if (seconds < 4) state.frame = requestAnimationFrame(depart);
      };
      state.frame = requestAnimationFrame(depart);
    }
  }
  function tick() {
    if (!state.order || state.finished || state.order.pausedAt) return;
    const ms = elapsed();
    paint(ms);
    if (ms >= TOTAL_MS) finishOrder(); else state.frame = requestAnimationFrame(tick);
  }
  function presentOrder(scroll = true) {
    cancelAnimationFrame(state.frame);
    state.stage = -1;
    state.finished = false;
    $('trace-empty').hidden = true;
    $('trace-live').hidden = false;
    $('order-id').textContent = '#CH-' + state.order.code;
    $('trace-order-name').textContent = state.order.rows.map(row => productById(row.id).name+' × '+row.quantity).join(' / ');
    $('trace-order-price').textContent = money(state.order.total);
    const lead = productById(state.order.leadId);
    $('cook-step-name').textContent = (lead.category === 'drink' ? '调制' : lead.category === 'sweet' ? '烘焙' : '现炒')+' · 10s';
    $('trace-time-label').textContent = state.order.pausedAt ? '已暂停' : '秒后完成';
    $('pause-order').hidden = false;
    $('pause-order').textContent = state.order.pausedAt ? '继续观看 ▶' : '暂停观看 Ⅱ';
    $('replay-order').hidden = true;
    $('receipt').hidden = true;
    paint(elapsed(), true);
    scene.classList.toggle('is-paused', !!state.order.pausedAt);
    if (elapsed() >= TOTAL_MS) finishOrder(); else if (!state.order.pausedAt) state.frame = requestAnimationFrame(tick);
    renderCart();
    if (scroll) $('trace').scrollIntoView({behavior:motion.matches?'auto':'smooth', block:'start'});
  }
  function startOrder() {
    if (!state.cart.size || (state.order && !state.finished)) return;
    const rows = cartRows();
    const lead = rows.find(row => row.category === 'main') || rows[0];
    state.order = {
      rows:rows.map(({id, quantity}) => ({id, quantity})),
      leadId:lead.id, count:rows.reduce((n, row) => n + row.quantity, 0),
      total:rows.reduce((n, row) => n + row.quantity * row.price, 0),
      code:String(Math.floor(1000 + Math.random() * 9000)), startedAt:Date.now(), pausedAt:null,
    };
    state.cart.clear();
    saveOrder();
    presentOrder();
    showToast('模拟下单成功！来看看你的餐食怎样诞生。');
  }
  $('pause-order').addEventListener('click', () => {
    if (!state.order || state.finished) return;
    if (state.order.pausedAt) {
      state.order.startedAt += Date.now() - state.order.pausedAt;
      state.order.pausedAt = null;
      $('pause-order').textContent = '暂停观看 Ⅱ';
      $('trace-time-label').textContent = '秒后完成';
      scene.classList.remove('is-paused');
      state.frame = requestAnimationFrame(tick);
    } else {
      state.order.pausedAt = Date.now();
      cancelAnimationFrame(state.frame);
      $('pause-order').textContent = '继续观看 ▶';
      $('trace-time-label').textContent = '已暂停';
      scene.classList.add('is-paused');
    }
    saveOrder();
  });
  $('replay-order').addEventListener('click', () => {
    if (!state.order) return;
    state.order.startedAt = Date.now();
    state.order.pausedAt = null;
    saveOrder();
    presentOrder(false);
  });
  document.querySelectorAll('.category-tab').forEach(tab => tab.addEventListener('click', () => {
    state.category = tab.dataset.category;
    document.querySelectorAll('.category-tab').forEach(item => {
      item.classList.toggle('is-active', item === tab);
      item.setAttribute('aria-pressed', String(item === tab));
    });
    renderMenu();
  }));
  [$('food-grid'), $('cart-items')].forEach(container => container.addEventListener('click', event => {
    const add = event.target.closest('[data-add]'), remove = event.target.closest('[data-remove]');
    if (add) changeQuantity(add.dataset.add, 1);
    if (remove) changeQuantity(remove.dataset.remove, -1);
  }));
  $('checkout-btn').addEventListener('click', startOrder);
  $('hero-dish').innerHTML = dishArt(products[0]);
  renderMenu();
  renderCart();
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE));
    if (saved && typeof saved.startedAt === 'number' && saved.startedAt <= Date.now() &&
        Date.now() - saved.startedAt < 86400000 && productById(saved.leadId) &&
        Array.isArray(saved.rows) && saved.rows.length > 0 &&
        saved.rows.every(row => productById(row.id) && Number.isInteger(row.quantity) && row.quantity > 0 && row.quantity <= 20) &&
        (saved.pausedAt === null || (Number.isFinite(saved.pausedAt) && saved.pausedAt >= saved.startedAt && saved.pausedAt <= Date.now()))) {
      saved.count = saved.rows.reduce((n, row) => n + row.quantity, 0);
      saved.total = saved.rows.reduce((n, row) => n + row.quantity * productById(row.id).price, 0);
      saved.code = String(saved.code).replace(/[^0-9]/g, '').slice(0,4);
      state.order = saved;
      presentOrder(false);
    }
  } catch (_) { /* A disabled or stale session store never prevents a fresh order. */ }
})();
