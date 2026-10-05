(() => {
  const panel = document.getElementById('steward-panel');
  const fab = document.getElementById('steward-fab');
  const close = document.getElementById('steward-close');
  const messages = document.getElementById('steward-messages');
  const form = document.getElementById('steward-form');
  const input = document.getElementById('steward-input');
  const cozeUrl = 'https://www.coze.cn/store/agent/7692635031994564644?bot_id=true&bid=6lgqsh4mk6012';
  let returnFocus = fab;

  function showPanel() {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : fab;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    input.focus();
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
    if (/八环|分区|城区|介绍|认识炽日|是什么/.test(question)) {
      return ['我带你认识这座城喵：以中枢为心，八环分别负责防护、安全、工业、医疗、公共、居住、农业和能源。', {href:'#rings', label:'查看一心八环 ↗'}];
    }
    if (/太空电梯|抵达|怎么来|入口|星港/.test(question)) {
      return ['概念设定中，太空电梯连接地面与炽日中枢。抵达后，就能换乘城市交通。', {href:'#arrival', label:'看看抵达章节 ↗'}];
    }
    if (/玄甲|防护/.test(question)) return ['玄甲环负责外层防护与环境监测，是城市的守护屏障。', {href:'#rings', label:'查看八环 ↗'}];
    if (/镇岳|安全|应急/.test(question)) return ['镇岳环负责应急和公共安全，让城市运行更安心。', {href:'#rings', label:'查看八环 ↗'}];
    if (/锻火|工业|制造/.test(question)) return ['锻火环是制造与维修中心，承担城市工程设施的更新。', {href:'#rings', label:'查看八环 ↗'}];
    if (/长生|医疗|医院|健康/.test(question)) return ['长生环集合医疗、康复与健康研究。', {href:'#rings', label:'查看八环 ↗'}];
    if (/万象|公共|商业|艺术|学习/.test(question)) return ['万象环是公共客厅，连接学习、艺术和商业生活。', {href:'#rings', label:'查看八环 ↗'}];
    if (/栖云|居住|住在哪里|家/.test(question)) return ['栖云环是居住区，有街道、绿地与邻里生活。', {href:'#rings', label:'查看八环 ↗'}];
    if (/金穗|农业|种植|食物|吃/.test(question)) return ['金穗环的温室和城市菜园提供食物，也把绿色带进轨道城市。', {href:'#rings', label:'查看八环 ↗'}];
    if (/日冕|能源|太阳/.test(question)) return ['日冕环采集太阳能，连接整座城市的能源系统。', {href:'#rings', label:'查看八环 ↗'}];
    if (/绘梨衣|陪伴|小本子/.test(question)) return ['绘梨衣在她的小本子里等你喵。一起去打个招呼吧。', {href:'erii.html', label:'去找绘梨衣 ↗'}];
    if (/猫羽雫|扣子|智能|聊天|深入/.test(question)) {
      return ['想继续开放式对话，可以进入猫羽雫的扣子智能体页面。', {href:cozeUrl, label:'与猫羽雫对话 ↗', external:true}];
    }
    return ['这道题超出本站导览内容了喵。可以到扣子和猫羽雫继续聊，也可以问我八环、高铁或绘梨衣在哪里。', {href:cozeUrl, label:'进入扣子继续提问 ↗', external:true}];
  }
  function ask(question) {
    const text = question.trim();
    if (!text) return;
    if (panel.hidden) showPanel();
    addMessage(text, 'me');
    const [reply, action] = answer(text);
    addMessage(reply, 'bot', action);
    input.value = '';
  }
  document.querySelectorAll('[data-steward-open]').forEach(button => button.addEventListener('click', showPanel));
  fab.addEventListener('click', showPanel);
  close.addEventListener('click', hidePanel);
  document.querySelectorAll('[data-steward-ask]').forEach(button => button.addEventListener('click', () => ask(button.dataset.stewardAsk)));
  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) hidePanel();
  });
})();
