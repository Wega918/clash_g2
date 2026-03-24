window.initBattleUI = function() {
    function $(id) {
        let el = document.getElementById(id);
        if (!el) el = document.querySelector('#pc-battle-content #' + id) || document.querySelector('#app #' + id);
        return el;
    }

    if (!$('vp')) return; // Защита от дублей

    function makeDragScrollable(container) {
      if (!container) return;
      let isDown = false, startX, startScrollLeft, isDragging = false;
      container.addEventListener('mousedown', (e) => {
        isDown = true; isDragging = false; startX = e.pageX; startScrollLeft = container.scrollLeft; container.style.cursor = 'grabbing';
      });
      window.addEventListener('mouseup', () => { isDown = false; container.style.cursor = 'grab'; setTimeout(() => { isDragging = false; }, 0); });
      window.addEventListener('mouseleave', () => { isDown = false; container.style.cursor = 'grab'; });
      window.addEventListener('mousemove', (e) => {
        if (!isDown) return; e.preventDefault(); const walk = (e.pageX - startX); if (Math.abs(walk) > 3) isDragging = true; container.scrollLeft = startScrollLeft - walk;
      });
      container.addEventListener('touchstart', (e) => { isDown = true; isDragging = false; startX = e.touches[0].pageX; startScrollLeft = container.scrollLeft; }, {passive: true});
      container.addEventListener('touchend', () => { isDown = false; setTimeout(() => { isDragging = false; }, 0); });
      container.addEventListener('touchcancel', () => { isDown = false; });
      container.addEventListener('touchmove', (e) => {
        if (!isDown) return; const walk = (e.touches[0].pageX - startX); if (Math.abs(walk) > 3) isDragging = true; container.scrollLeft = startScrollLeft - walk;
      }, {passive: true});
      container.addEventListener('click', (e) => { if (isDragging) { e.preventDefault(); e.stopPropagation(); } }, true);
      container.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { container.scrollLeft += e.deltaY; e.preventDefault(); } }, {passive: false});
    }

    const ENEMY_POOL = [
      { name:'Karan', clan:'League Legacy', th:10, trophies:3184, gold:66786, elixir:62833, dark:2257 },
      { name:'DragonSlyr', clan:'Dark Empire', th:9, trophies:2890, gold:44200, elixir:38900, dark:1820 },
      { name:'IronFist', clan:'Steel Wolves', th:11, trophies:3620, gold:88000, elixir:91000, dark:3100 },
      { name:'SilentWar', clan:'Ghost Legion', th:8, trophies:2410, gold:31000, elixir:29000, dark:980 },
      { name:'VegaBlaze', clan:'Dark Phoenix', th:12, trophies:4210, gold:140000,elixir:135000,dark:5600 }
    ];

    const ARMY = [
      {count:'x4', level:5, type:'unit'}, {count:'x1', level:7, type:'unit'},
      {count:'x1', level:6, type:'unit'}, {count:'x1', level:1, type:'unit'},
      {count:'x1', level:7, type:'unit'}, {count:'x1', level:8, type:'unit'},
      {count:'x5', level:7, type:'unit'}, {count:'x8', level:4, type:'unit'},
      {count:'x1', level:7, type:'unit'}, {count:'x1', level:26, type:'hero'},
      {count:'x1', level:44, type:'hero'}, {count:'x5', level:5, type:'spell'},
      {count:'x1', level:7, type:'spell'}
    ];

    const IMG = {
      wall:'/images/building/Wall/Wall10.png', bomb:'/images/building/Bomb/Bomb6.png', spring:'/images/building/Spring_Trap/Spring_Trap5.png',
      cannon:'/images/building/Cannon/Cannon8.png', archer:'/images/building/Archer_Tower/Archer_Tower9.png', builder_hut:'/images/building/Builders_Hut/Builders_Hut2.png',
      army_camp:'/images/building/Army_Camp/Army_Camp8.png', laboratory:'/images/building/Laboratory/Laboratory9.png', barracks:'/images/building/Barracks/Barracks12.png',
      spell_factory:'/images/building/Spell_Factory/Spell_Factory6.png', gold_mine:'/images/building/Gold_Mine/Gold_Mine10.png', elixir_col:'/images/building/Elixir_Collector/Elixir_Collector10.png',
      dark_drill:'/images/building/Dark_Elixir_Drill/Dark_Elixir_Drill5.png', mortar:'/images/building/Mortar/Mortar7.png', wizard:'/images/building/Wizard_Tower/Wizard_Tower7.png',
      air_defense:'/images/building/Air_Defense/Air_Defense7.png', air_sweeper:'/images/building/Air_Sweeper/Air_Sweeper2.png', tesla:'/images/building/Hidden_Tesla/Hidden_Tesla7.png',
      gold_storage:'/images/building/Gold_Storage/Gold_Storage12.png', elixir_st:'/images/building/Elixir_Storage/Elixir_Storage16.png', clan_castle:'/images/building/Clan_Castle/Clan_Castle6.png',
      townhall:'/images/building/Town_Hall/Town_Hall10.png', xbow:'/images/building/X-Bow_Ground/X-Bow_Ground4.png', inferno:'/images/building/Inferno_Tower_Single/Inferno_Tower_Single2.png',
      eagle:'/images/building/Eagle_Artillery/Eagle_Artillery1.png', bomb_tower:'/images/building/Bomb_Tower/Bomb_Tower3.png', dark_storage:'/images/building/Dark_Elixir/Dark_Elixir_Storage9.png'
    };

    const FB = { wall:'', bomb:'', spring:'', cannon:'', archer:'', builder_hut:'', army_camp:'', laboratory:'', barracks:'', spell_factory:'', gold_mine:'', elixir_col:'', dark_drill:'', mortar:'', wizard:'', air_defense:'', air_sweeper:'', tesla:'', gold_storage:'', elixir_st:'', clan_castle:'', townhall:'', xbow:'', inferno:'', eagle:'', bomb_tower:'', dark_storage:'' };
    const FBBG = { wall:'#5a5040', bomb:'#3a1800', spring:'#184030', cannon:'#2a2a2a', archer:'#4a2200', builder_hut:'#4a2a00', army_camp:'#1a3300', laboratory:'#003344', barracks:'#2a1400', spell_factory:'#1a0044', gold_mine:'#5a4000', elixir_col:'#440066', dark_drill:'#220044', mortar:'#333', wizard:'#3a0066', air_defense:'#001844', air_sweeper:'#003366', tesla:'#334400', gold_storage:'#5a3800', elixir_st:'#440077', clan_castle:'#222266', townhall:'#664400', xbow:'#002266', inferno:'#550000', eagle:'#443300', bomb_tower:'#552200', dark_storage:'#110022' };

    function getZones(th) {
      const d=Math.max(1, th-3), d2=Math.max(1, th-2), e=Math.max(1, th-5), r=Math.max(1, th-4), s=Math.max(1, th-1);
      return [
        { label:'Ф4', sub:'Ядро', cls:'ph-core', wallCls:'pw-core', blds:[
            {key:'townhall', name:'Ратуша', cat:'th', lvl:th, cnt:null, large:true},
            {key:'clan_castle', name:'Кл.Крепость', cat:'both', lvl:Math.max(1,th-4), cnt:null},
            ...(th>=11?[{key:'eagle', name:'Орёл.Арт.', cat:'strong', lvl:Math.max(1,th-6), cnt:null}]:[]),
            ...(th>=10?[{key:'inferno', name:'Инферно', cat:'strong', lvl:e, cnt:2}]:[]),
            {key:'gold_storage', name:'Хр.Золота', cat:'res', lvl:s, cnt:Math.ceil((2+Math.floor(th/5))/2)},
            {key:'elixir_st', name:'Хр.Элик.', cat:'res', lvl:s, cnt:Math.ceil((2+Math.floor(th/5))/2)},
            {key:'dark_storage', name:'Тёмн.Хран.', cat:'res', lvl:Math.max(1,th-1), cnt:null},
          ]},
        { label:'Ф3', sub:'Оборона', cls:'ph-main', wallCls:'', blds:[
            {key:'xbow', name:'X-Bow', cat:'ground', lvl:e, cnt:th>=9?Math.min(4,th-7):null},
            {key:'wizard', name:'Маг.Башни', cat:'both', lvl:d2, cnt:Math.min(4,2+Math.floor(th/5))},
            {key:'air_defense', name:'ПВО', cat:'air', lvl:d2, cnt:Math.min(5,2+Math.floor(th/4))},
            {key:'bomb_tower', name:'Бомб.Башня', cat:'ground', lvl:Math.max(1,th-6),cnt:Math.min(3,th>=9?2:1)},
            {key:'mortar', name:'Мортиры', cat:'ground', lvl:d2, cnt:Math.min(4,2+Math.floor(th/5))},
          ]},
        { label:'Ф2', sub:'Контроль', cls:'ph-outer', wallCls:'', blds:[
            {key:'cannon', name:'Пушки', cat:'ground', lvl:d, cnt:Math.min(6,2+Math.floor(th/3))},
            {key:'archer', name:'Баш.Лучниц', cat:'both', lvl:d, cnt:Math.min(7,2+Math.floor(th/3))},
            {key:'tesla', name:'Тесла', cat:'both', lvl:d2, cnt:Math.min(4,2+Math.floor(th/4))},
            {key:'air_sweeper', name:'Продувалка', cat:'air', lvl:Math.max(1,th-6),cnt:2},
            {key:'bomb', name:'Гиг.Бомбы', cat:'trap', lvl:Math.max(1,th-4),cnt:Math.min(6,3+Math.floor(th/4))},
            {key:'spring', name:'Пружины', cat:'trap', lvl:Math.max(1,th-3),cnt:Math.min(6,3+Math.floor(th/4))},
          ]},
        { label:'Ф1', sub:'Обманка', cls:'ph-decoy', wallCls:'pw-outer', blds:[
            {key:'barracks', name:'Казармы', cat:'res', lvl:r, cnt:Math.min(5,3+Math.floor(th/5))},
            {key:'laboratory', name:'Лаборатория', cat:'res', lvl:Math.max(1,th-2),cnt:null},
            {key:'spell_factory',name:'Фаб.Закл.', cat:'res', lvl:Math.max(1,th-5),cnt:null},
            {key:'army_camp', name:'Лагери', cat:'res', lvl:r, cnt:4},
            {key:'gold_mine', name:'Шахты', cat:'res', lvl:d, cnt:Math.min(7,3+Math.floor(th/3))},
            {key:'elixir_col', name:'Сборщики', cat:'res', lvl:d, cnt:Math.min(7,3+Math.floor(th/3))},
            {key:'dark_drill', name:'Буровые', cat:'res', lvl:Math.max(1,th-5),cnt:Math.min(3,Math.floor(th/4))},
            {key:'builder_hut', name:'Хижины', cat:'res', lvl:3, cnt:Math.min(6,4+Math.floor(th/5))},
          ]}
      ];
    }

    let PHASE = 'idle';
    let currentEnemy = null;
    let timerSecs = 30;
    let timerInt  = null;
    let searchTmr = null;
    let animFrameId = null;
    let W, H;
    let domClouds = [];
    let cloudPhase = 'idle'; 
    let cloudOutProgress = 0;

    function showSearch(s){
      if($('stateIdle')) $('stateIdle').style.display = s==='idle' ? 'flex':'none';
      if($('stateSearching')) $('stateSearching').style.display = s==='searching' ? 'flex':'none';
    }
    function fmtN(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ')}

    class DOMCloud {
      constructor(index, total) {
        this.r = 150 + Math.random() * 200; 
        this.targetX = Math.random() * W;
        this.targetY = Math.random() * H;
        const side = index < total / 2 ? 'left' : 'right';
        this.x = side === 'left' ? -this.r - 200 : W + this.r + 200;
        this.y = this.targetY;
        this.vx = 0;
        this.time = Math.random() * 100;
        
        this.el = document.createElement('div');
        this.el.className = 'cloud-element';
        this.el.style.width = `${this.r * 2}px`;
        this.el.style.height = `${this.r * 2}px`;
        this.el.style.transform = `translate(${this.x - this.r}px, ${this.y - this.r}px)`;

        if($('searchClouds')) $('searchClouds').appendChild(this.el);
      }
      
      update(dt) {
        this.time += dt;
        if (cloudPhase === 'in') { this.x += (this.targetX - this.x) * dt * 5; } 
        else if (cloudPhase === 'out') { const dir = (this.targetX > W / 2) ? 1 : -1; this.vx += dir * dt * 8000; this.x += this.vx * dt; }
        const floatY = Math.sin(this.time) * 15;
        this.el.style.transform = `translate(${this.x - this.r}px, ${this.y - this.r + floatY}px)`;
      }
      destroy() { if(this.el.parentNode) this.el.parentNode.removeChild(this.el); }
    }

    function initDOMClouds() {
      domClouds.forEach(c => c.destroy()); domClouds = [];
      const numClouds = 24; 
      for(let i=0; i<numClouds; i++) domClouds.push(new DOMCloud(i, numClouds));
    }

    let lastT = 0;
    function domLoop(ts) {
      if (PHASE === 'scout' && domClouds.length === 0) { animFrameId = null; return; }
      const dt = Math.min((ts - lastT) / 1000, 0.05); lastT = ts;
      domClouds.forEach(c => c.update(dt));
      if (cloudPhase === 'out') {
        cloudOutProgress += dt;
        if($('searchClouds')) $('searchClouds').style.opacity = Math.max(0, 1 - cloudOutProgress * 2.5); 
        if (cloudOutProgress > 0.4) onRevealDone();
      }
      animFrameId = requestAnimationFrame(domLoop);
    }

    function doSearch(){
      if($('searchClouds')) $('searchClouds').style.opacity='1';
      if($('scoutUI')) $('scoutUI').style.display='none';
      if($('searchUI')) $('searchUI').style.display='flex';
      showSearch('searching');
      
      clearTimeout(searchTmr);
      searchTmr=setTimeout(()=>{
        currentEnemy=ENEMY_POOL[Math.floor(Math.random()*ENEMY_POOL.length)];
        cloudPhase = 'out'; cloudOutProgress = 0;
      },1800);
    }

    function onRevealDone(){
      domClouds.forEach(c => c.destroy()); domClouds = [];
      if($('searchClouds')) $('searchClouds').style.opacity='0';
      if($('searchUI')) $('searchUI').style.display='none';
      if($('scoutUI')) $('scoutUI').style.display='block';
      PHASE='scout'; renderScout(currentEnemy);
    }

    function renderScout(e){
      if($('scName')) $('scName').textContent   = e.name;
      if($('scClan')) $('scClan').textContent   = e.clan;
      if($('scGold')) $('scGold').textContent   = fmtN(e.gold);
      if($('scElixir')) $('scElixir').textContent = fmtN(e.elixir);
      if($('scDark')) $('scDark').textContent   = fmtN(e.dark);

      buildDefenseMap(e.th);
      const dm = $('defMap');
      if(dm){ dm.classList.remove('show'); void dm.offsetWidth; dm.classList.add('show'); }
      buildTroopBar(); startTimer(30);
    }

    function buildDefenseMap(thLevel){
      const field = $('dmField');
      if(!field) return; field.innerHTML='';
      const zones = getZones(thLevel);

      zones.forEach((zone, zi)=>{
        const row = document.createElement('div'); row.className = 'ph-row '+zone.cls;
        const lbl = document.createElement('div'); lbl.className = 'ph-label';
        lbl.innerHTML = `<div class="ph-num">${zone.label}</div><div class="ph-name">${zone.sub}</div>`;
        row.appendChild(lbl);

        const strip = document.createElement('div'); strip.className = 'ph-cards';
        const inner = document.createElement('div'); inner.className = 'ph-inner';
        zone.blds.forEach(b => inner.appendChild(makeBCard(b)));
        strip.appendChild(inner);

        makeDragScrollable(strip); row.appendChild(strip); field.appendChild(row);

        const hpBar = document.createElement('div'); hpBar.className = 'phase-hp-wrapper';
        hpBar.innerHTML = `<div class="phase-hp-fill" style="width: ${40 + Math.random()*60}%;"></div>`; field.appendChild(hpBar);

        if(zi < zones.length - 1){
          const wall = document.createElement('div'); wall.className = 'ph-wall'+(zone.wallCls?' '+zone.wallCls:''); field.appendChild(wall);
          const wallHp = document.createElement('div'); wallHp.className = 'phase-hp-wrapper wall-hp';
          wallHp.innerHTML = `<div class="phase-hp-fill" style="width: ${40 + Math.random()*60}%;"></div>`; field.appendChild(wallHp);
        }
      });
      const botOuter = document.createElement('div'); botOuter.className = 'ph-wall pw-outer'; field.appendChild(botOuter);
      const botHp = document.createElement('div'); botHp.className = 'phase-hp-wrapper wall-hp';
      botHp.innerHTML = `<div class="phase-hp-fill" style="width: ${40 + Math.random()*60}%;"></div>`; field.appendChild(botHp);
    }

    function makeBCard(b){
      const wrap = document.createElement('div'); wrap.className = 'bcard'+(b.large?' bcard-lg':'');
      const imgBox = document.createElement('div'); imgBox.className = 'bc-img';
      const fb = document.createElement('div'); fb.className = 'bc-fb'; fb.style.background = FBBG[b.key]||'#333'; fb.textContent = FB[b.key]||''; imgBox.appendChild(fb);
      const img = document.createElement('img'); img.alt = b.name; img.draggable = false;
      img.onload = ()=>{ fb.style.opacity='0'; }; img.onerror = ()=>{ img.style.display='none'; fb.style.opacity='1'; };
      if(IMG[b.key]) img.src = IMG[b.key];
      imgBox.appendChild(img);

      if(b.cnt && b.cnt>1){ const cnt = document.createElement('div'); cnt.className = 'bc-cnt'; cnt.textContent = '×'+b.cnt; imgBox.appendChild(cnt); }
      const lvl = document.createElement('div'); lvl.className = 'bc-lvl'; lvl.textContent = b.lvl; imgBox.appendChild(lvl);
      wrap.appendChild(imgBox);

      const tip = document.createElement('div'); tip.className = 'bn-tip';
      const catRu={ground:' земля',air:' воздух',both:'⊕ земля+воздух',strong:' всё',th:' главная цель',res:' ресурс',trap:' ловушка'}[b.cat]||'';
      tip.innerHTML=`<div>${b.name}${b.cnt>1?' <span style="color:#ffaa44">×'+b.cnt+'</span>':''} Lv${b.lvl}</div><div class="bn-tip-sub">${catRu}</div>`;
      wrap.appendChild(tip);

      wrap.addEventListener('click', e=>{
        e.stopPropagation(); const open = wrap.classList.toggle('tip-open');
        if(open) document.querySelectorAll('.bcard.tip-open').forEach(el=>{ if(el!==wrap) el.classList.remove('tip-open'); });
      });
      return wrap;
    }

    function startTimer(secs){
      if(timerInt) clearInterval(timerInt); timerSecs=secs; updateTimer();
      timerInt=setInterval(()=>{ timerSecs--; updateTimer(); if(timerSecs<=0){clearInterval(timerInt);onTimerEnd();} },1000);
    }
    function updateTimer(){ if($('timerVal')) $('timerVal').textContent=timerSecs+'с.'; }
    function onTimerEnd(){ setTimeout(()=>alert(' Время разведки вышло!\n Атака начинается!'),200); }

    function buildTroopBar(){
      const bar = $('troopBar');
      if(bar){
          bar.innerHTML = ARMY.map(t=>`
            <div class="troop-card ${t.type==='hero'?'hero':t.type==='spell'?'spell':''}">
              <div class="troop-count">${t.count}</div><div class="troop-icon"></div><div class="troop-level">${t.level}</div>
            </div>`).join('');
          makeDragScrollable(bar);
      }
      const scroll = $('unitsScroll'); if(!scroll) return; scroll.innerHTML='';
      const wrap = document.createElement('div'); wrap.className = 'units-wrap';

      ARMY.forEach((t, i) => {
        const icon = document.createElement('div'); icon.className = 'unit-icon' + (t.type==='hero'?' hero':t.type==='spell'?' spell':''); icon.style.zIndex = i;
        const face = document.createElement('div'); face.className = 'ui-face'; icon.appendChild(face);
        const cnt = document.createElement('div'); cnt.className = 'ui-cnt'; cnt.textContent = t.count; icon.appendChild(cnt);
        const lvl = document.createElement('div'); lvl.className = 'ui-lvl'; lvl.textContent = t.level; icon.appendChild(lvl);

        icon.addEventListener('click', (e) => {
          e.stopPropagation(); const isActive = icon.classList.contains('active');
          document.querySelectorAll('.unit-icon').forEach(u => u.classList.remove('active'));
          document.querySelectorAll('.target-popup').forEach(p => p.remove());
          document.querySelectorAll('.bcard.targeted').forEach(b => b.classList.remove('targeted'));

          if (!isActive) {
            icon.classList.add('active'); const allCards = Array.from(document.querySelectorAll('.bcard'));
            if (allCards.length > 0) {
                const targetCard = allCards[Math.floor(Math.random() * allCards.length)]; targetCard.classList.add('targeted');
                const imgEl = targetCard.querySelector('img'); const fbEl = targetCard.querySelector('.bc-fb');
                const imgSrc = (imgEl && imgEl.style.display !== 'none') ? imgEl.src : null;
                const popup = document.createElement('div'); popup.className = 'target-popup';
                if (imgSrc) popup.innerHTML = `<img src="${imgSrc}"><div class="target-hp-bar"><div class="target-hp-fill" style="width:${20+Math.random()*80}%"></div></div>`;
                else popup.innerHTML = `<div style="font-size:16px; line-height:30px;">${fbEl ? fbEl.textContent : ''}</div><div class="target-hp-bar"><div class="target-hp-fill" style="width:${20+Math.random()*80}%"></div></div>`;
                icon.appendChild(popup);
            }
          }
        });
        wrap.appendChild(icon);
      });
      scroll.appendChild(wrap); makeDragScrollable(scroll);
    }

    if($('btnSearch')){
        const oldBtn = $('btnSearch'); const newBtn = oldBtn.cloneNode(true); oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click',()=>{
          if(PHASE!=='idle') return; W = $('vp').offsetWidth; H = $('vp').offsetHeight; initDOMClouds();
          PHASE='searching'; cloudPhase='in'; showSearch('searching'); lastT = performance.now();
          if(!animFrameId) animFrameId = requestAnimationFrame(domLoop);
          setTimeout(()=>doSearch(), 500);
        });
    }

    document.addEventListener('click', (e)=>{
      if(!e.target.closest('.unit-icon')) { document.querySelectorAll('.unit-icon.active').forEach(u => u.classList.remove('active')); document.querySelectorAll('.bcard.targeted').forEach(b => b.classList.remove('targeted')); document.querySelectorAll('.target-popup').forEach(p => p.remove()); }
      if(!e.target.closest('.bcard')) document.querySelectorAll('.bcard.tip-open').forEach(el=>el.classList.remove('tip-open'));
    });

    W = $('vp').offsetWidth; H = $('vp').offsetHeight;
    showSearch('idle'); 
    if($('searchUI')) $('searchUI').style.display='flex'; 
    if($('scoutUI')) $('scoutUI').style.display='none';
};