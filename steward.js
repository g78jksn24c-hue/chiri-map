(() => {
  const panel = document.getElementById('steward-panel');
  const fab = document.getElementById('steward-fab');
  const close = document.getElementById('steward-close');
  const aiView = document.getElementById('steward-ai-view');
  const guideView = document.getElementById('steward-guide-view');
  const tabs = [...document.querySelectorAll('[data-steward-tab]')];
  const messages = document.getElementById('steward-messages');
  const form = document.getElementById('steward-form');
  const input = document.getElementById('steward-input');
  const cozeUrl = 'https://www.coze.cn/store/agent/7692635031994564644?bot_id=true';
  let returnFocus = fab;

  function setMode(mode) {
    const next = mode === 'guide' ? 'guide' : 'ai';
    aiView.hidden = next !== 'ai';
    guideView.hidden = next !== 'guide';
    tabs.forEach(tab => {
      const active = tab.dataset.stewardTab === next;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  }
  function showPanel(mode = 'ai') {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : fab;
    setMode(mode);
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if (mode === 'guide') input.focus();
  }
  function hidePanel() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    returnFocus.focus();
  }
  function addMessage(text, who, action) {
    const bubble = document.createElement('div');
    bubble.className = 'steward-bubble ' + who;
    bubble.append(document.createTextNode(text));
    if (action) {
      const link = document.createElement('a');
      link.href = action.href;
      link.textContent = action.label;
      if (action.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else if (action.href.startsWith('#')) {
        link.addEventListener('click', hidePanel);
      }
      bubble.append(link);
    }
    messages.append(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
  function answer(question) {
    if (/你好|早安|晚上好|嗨|hello/i.test(question)) return ['你好呀，我是猫羽雫喵。今天想去八环散步，还是看看高铁？', {href:'#rings', label:'一起认识八环 ↗'}];
    if (/谢谢|谢啦/.test(question)) return ['不客气喵！找到方向就好，下一站也可以来问我。', {href:'atlas.html', label:'继续逛地图 ↗'}];
    if (/你是谁|你的名字/.test(question)) return ['我是猫羽雫，你在炽日的角色导览伙伴喵。这里使用本站导览内容，更多话题可以到扣子找我。', {href:cozeUrl, label:'去扣子找猫羽雫 ↗', external:true}];
    if (/高铁|列车|路线|车次|交通|地图|怎么走|站点|换乘/.test(question)) {
      return ['想坐高铁出发吗？炽日有六条概念线路喵。点开地图，列车位置、站点和路线都在那里。', {href:'atlas.html', label:'打开高铁地图 ↗'}];
    }
    if (/八环|八区|分区|城区|介绍|认识炽日|是什么/.test(question)) {
      return ['炽日以城市中枢为心，外围是铁壁保障、启明科研、望乡旅游、星港、安栖居民、薪火大学、绿野农业和熔炉工业八区。', {href:'#rings', label:'查看一心八区 ↗'}];
    }
    if (/太空电梯|抵达|怎么来|入口|星港/.test(question)) {
      return ['概念设定中，太空电梯连接地面与炽日中枢。抵达后，就能换乘城市交通。', {href:'#arrival', label:'看看抵达章节 ↗'}];
    }
    if (/铁壁|防护|保障/.test(question)) return ['铁壁保障区负责安全防卫与物流保障。', {href:'pixel-city.html?zone=shield', label:'打开铁壁保障区 ↗'}];
    if (/启明|科研|实验/.test(question)) return ['启明科研区集合实验室、天文观测与创新空间。', {href:'pixel-city.html?zone=safety', label:'打开启明科研区 ↗'}];
    if (/望乡|旅游|度假/.test(question)) return ['望乡旅游区拥有湖湾、文化广场和滨水长廊。', {href:'pixel-city.html?zone=forge', label:'打开望乡旅游区 ↗'}];
    if (/星港|交通|换乘/.test(question)) return ['星港特区连接星际交通、换乘和商业服务。', {href:'pixel-city.html?zone=culture', label:'打开星港特区 ↗'}];
    if (/安栖|居住|住在哪里|家/.test(question)) return ['安栖居民区有住宅、街角商业和邻里公园。', {href:'pixel-city.html?zone=energy', label:'打开安栖居民区 ↗'}];
    if (/薪火|大学|学习/.test(question)) return ['薪火大学区集合高等教育、公共课堂和人才社区。', {href:'pixel-city.html?zone=harvest', label:'打开薪火大学区 ↗'}];
    if (/绿野|农业|种植|食物|吃/.test(question)) return ['绿野农业区的温室与循环水渠提供城市日常食物。', {href:'pixel-city.html?zone=home', label:'打开绿野农业区 ↗'}];
    if (/熔炉|工业|制造/.test(question)) return ['熔炉工业区负责制造、维修与能源加工。', {href:'pixel-city.html?zone=care', label:'打开熔炉工业区 ↗'}];
    if (/绘梨衣|陪伴|小本子/.test(question)) return ['绘梨衣在她的小本子里等你喵。一起去打个招呼吧。', {href:'erii.html', label:'去找绘梨衣 ↗'}];
    if (/猫羽雫|扣子|智能|聊天|深入/.test(question)) {
      return ['想继续开放式对话，可以进入猫羽雫的扣子智能体页面。', {href:cozeUrl, label:'与猫羽雫对话 ↗', external:true}];
    }
    return ['这道题超出本站导览内容了喵。可以到扣子和猫羽雫继续聊，也可以问我八环、高铁或绘梨衣在哪里。', {href:cozeUrl, label:'进入扣子继续提问 ↗', external:true}];
  }
  function ask(question) {
    const text = question.trim();
    if (!text) return;
    if (panel.hidden) showPanel('guide');
    else setMode('guide');
    addMessage(text, 'me');
    const [reply, action] = answer(text);
    addMessage(reply, 'bot', action);
    input.value = '';
  }
  document.querySelectorAll('[data-steward-open]').forEach(button => button.addEventListener('click', () => showPanel(button.dataset.stewardMode || 'ai')));
  fab.addEventListener('click', showPanel);
  close.addEventListener('click', hidePanel);
  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.stewardTab)));
  document.querySelectorAll('[data-steward-ask]').forEach(button => button.addEventListener('click', () => ask(button.dataset.stewardAsk)));
  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) hidePanel();
  });
})();
