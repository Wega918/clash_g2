window.initBattleUI = function(container) {
    if (!container) return;
    
    const $ = id => container.querySelector('#' + id);
    const vp = $('vp');
    if (!vp) return;

    let PHASE = 'idle';
    let animFrameId = null;

    // --- ОБЛАКА (100% ИЗ 1_V22.HTML) ---
    const cloudContainer = $('searchClouds');
    let domClouds = [];
    let cloudPhase = 'idle';
    let cloudOutProgress = 0;
    let W = 820, H = 560;

    class DOMCloud {
      constructor(i, total) {
        this.el = document.createElement('div');
        this.el.className = 'cloud-element';
        this.r = 100 + Math.random() * 150;
        this.el.style.width = (this.r * 2) + 'px';
        this.el.style.height = (this.r * 2) + 'px';
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 60;
        this.vy = (Math.random() - 0.5) * 30;
        this.baseOpacity = 0.4 + Math.random() * 0.5;
        cloudContainer.appendChild(this.el);
      }
      update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < -this.r*2) this.x = W + this.r;
        if (this.x > W + this.r*2) this.x = -this.r;
        if (this.y < -this.r*2) this.y = H + this.r;
        if (this.y > H + this.r*2) this.y = -this.r;
        
        let scale = 1;
        let opacity = this.baseOpacity;

        if (cloudPhase === 'in') {
          let cx = W/2; let cy = H/2;
          let dx = cx - this.x; let dy = cy - this.y;
          this.x += dx * dt * 2.5; this.y += dy * dt * 2.5;
          scale = 1.5; opacity = 1;
        } else if (cloudPhase === 'out') {
          let cx = W/2; let cy = H/2;
          let dx = this.x - cx; let dy = this.y - cy;
          this.x += dx * dt * 6; this.y += dy * dt * 6;
        }
        
        this.el.style.transform = `translate(${this.x - this.r}px, ${this.y - this.r}px) scale(${scale})`;
        this.el.style.opacity = opacity;
      }
      destroy() { this.el.remove(); }
    }

    function initDOMClouds() {
      W = vp.offsetWidth || 820; H = vp.offsetHeight || 560;
      cloudContainer.innerHTML = '';
      domClouds = [];
      const numClouds = (window.innerWidth < 600) ? 15 : 25;
      for(let i=0; i<numClouds; i++) domClouds.push(new DOMCloud(i, numClouds));
    }

    let lastT = 0;
    function domLoop(ts) {
      if (PHASE === 'scout' && domClouds.length === 0) { animFrameId = null; return; }
      const dt = Math.min((ts - lastT) / 1000, 0.05);
      lastT = ts;
      domClouds.forEach(c => c.update(dt));
      
      if (cloudPhase === 'out') {
        cloudOutProgress += dt;
        cloudContainer.style.opacity = Math.max(0, 1 - cloudOutProgress * 2.5);
        if (cloudOutProgress > 0.4) onRevealDone();
      }
      animFrameId = requestAnimationFrame(domLoop);
    }

    // --- МОКОВЫЕ ДАННЫЕ (ИЗ 1_V22.HTML) ---
    const ENEMY_POOL = [
      {
        name: "DarkSlayer", clan: "The Elites", lvl: 11, gold: 450000, elixir: 420000, dark: 3500, trophies: 28,
        phases: [
          [
            {id:'c1', icon:'images/building/Cannon/Cannon11B.png', lvl:11, name:'Cannon'},
            {id:'c2', icon:'images/building/Archer_Tower/Archer_Tower11.png', lvl:11, name:'Archer Tower'},
            {id:'c3', icon:'images/building/Gold_Storage/Gold_Storage11.png', lvl:11, name:'Gold Storage'},
            {id:'c4', icon:'images/building/Elixir_Storage/Elixir_Storage11.png', lvl:11, name:'Elixir Storage'},
            {id:'c5', icon:'images/building/Cannon/Cannon11B.png', lvl:11, name:'Cannon'}
          ],
          [
            {id:'m1', icon:'images/building/Mortar/Mortar8B.png', lvl:8, name:'Mortar'},
            {id:'w1', icon:'images/building/Wizard_Tower/Wizard_Tower8.png', lvl:8, name:'Wizard Tower'},
            {id:'a1', icon:'images/building/Air_Defense/Air_Defense8.png', lvl:8, name:'Air Defense'},
            {id:'m2', icon:'images/building/Mortar/Mortar8B.png', lvl:8, name:'Mortar'}
          ],
          [
            {id:'x1', icon:'images/building/X-Bow_Ground/X-Bow4_Ground.png', lvl:4, name:'X-Bow'},
            {id:'i1', icon:'images/building/Inferno_Tower_Single/Inferno_Tower4_Single.png', lvl:4, name:'Inferno Tower'},
            {id:'x2', icon:'images/building/X-Bow_Ground/X-Bow4_Ground.png', lvl:4, name:'X-Bow'}
          ],
          [
            {id:'e1', icon:'images/building/Eagle_Artillery/Eagle_Artillery2.png', lvl:2, name:'Eagle Artillery'},
            {id:'th', icon:'images/building/Town_Hall/Town_Hall11.png', lvl:11, name:'Town Hall'}
          ]
        ]
      }
    ];

    const ARMY = [
      {id:'b1', icon:'images/warriors/Barbarian/Avatar_Barbarian.png', lvl:7, count:60},
      {id:'a1', icon:'images/warriors/Archer/Avatar_Archer.png', lvl:7, count:40},
      {id:'g1', icon:'images/warriors/Giant/Avatar_Giant.png', lvl:7, count:12},
      {id:'w1', icon:'images/warriors/Wizard/Avatar_Wizard.png', lvl:7, count:8},
      {id:'p1', icon:'images/warriors/P.E.K.K.A/Avatar_P.E.K.K.A.png', lvl:5, count:3},
      {id:'h1', icon:'images/heroes/Avatar_Hero_Barbarian_King.png', lvl:40, count:1},
      {id:'h2', icon:'images/heroes/Avatar_Hero_Archer_Queen.png', lvl:40, count:1}
    ];

    let currentEnemy = ENEMY_POOL[0];

    // --- ЛОГИКА ---
    function doSearch() {
      setTimeout(() => {
        cloudPhase = 'out';
        cloudOutProgress = 0;
      }, 1000); // Имитация задержки поиска
    }

    $('btnSearch').addEventListener('click', () => {
      if (PHASE !== 'idle') return;
      W = vp.offsetWidth || 820; H = vp.offsetHeight || 560;
      initDOMClouds();
      PHASE = 'searching';
      cloudPhase = 'in';
      $('stateIdle').style.display = 'none';
      $('stateSearching').style.display = 'flex';
      lastT = performance.now();
      if (!animFrameId) animFrameId = requestAnimationFrame(domLoop);
      doSearch();
    });

    $('btnNext').addEventListener('click', () => {
      if (PHASE !== 'scout') return;
      $('scoutUI').style.display = 'none';
      $('searchUI').style.display = 'flex';
      $('stateIdle').style.display = 'none';
      $('stateSearching').style.display = 'flex';
      
      cloudContainer.style.opacity = '1';
      initDOMClouds();
      cloudPhase = 'in';
      doSearch();
    });

    function onRevealDone() {
      domClouds.forEach(c => c.destroy());
      domClouds = [];
      cloudContainer.style.opacity = '0';
      $('searchUI').style.display = 'none';
      $('scoutUI').style.display = 'block';
      PHASE = 'scout';
      renderScout();
    }

    function renderScout() {
      $('scName').textContent = currentEnemy.name;
      $('scClan').textContent = currentEnemy.clan;
      $('scLvl').textContent = currentEnemy.lvl;
      $('scGold').textContent = currentEnemy.gold.toLocaleString('ru-RU');
      $('scElixir').textContent = currentEnemy.elixir.toLocaleString('ru-RU');
      $('scDark').textContent = currentEnemy.dark.toLocaleString('ru-RU');
      $('scTrophies').textContent = currentEnemy.trophies;

      const map = $('mapField');
      map.innerHTML = '';
      
      const phaseNames = ['Внешний пояс', 'Кольцо обороны', 'Внутренний слой', 'Ядро базы'];
      const phaseClasses = ['ph-outer', 'ph-main', 'ph-decoy', 'ph-core'];
      
      for(let i = 3; i >= 0; i--) {
        const p = currentEnemy.phases[i];
        if(!p || p.length === 0) continue;
        
        let row = document.createElement('div');
        row.className = `ph-row ${phaseClasses[i]}`;
        row.innerHTML = `
          <div class="ph-label">
            <div class="ph-num">ФАЗА ${i+1}</div>
            <div class="ph-name">${phaseNames[i]}</div>
          </div>
          <div class="ph-cards"><div class="ph-inner"></div></div>
        `;
        
        p.forEach(b => {
          let card = document.createElement('div');
          card.className = 'bcard';
          card.innerHTML = `
            <div class="bc-img">
              <img src="${b.icon}" alt="${b.name}">
              <div class="bc-lvl">${b.lvl}</div>
            </div>
            <div class="phase-hp-wrapper">
              <div class="phase-hp-fill" style="width: 100%;"></div>
            </div>
            <div class="bn-tip">${b.name}<div class="bn-tip-sub">Ур. ${b.lvl}</div></div>
          `;
          row.querySelector('.ph-inner').appendChild(card);
        });
        
        map.appendChild(row);
        
        let wallClass = i === 3 ? 'pw-core' : (i === 0 ? 'pw-outer' : '');
        let wall = document.createElement('div');
        wall.className = `ph-wall ${wallClass}`;
        wall.innerHTML = `
          <div class="phase-hp-wrapper wall-hp">
            <div class="phase-hp-fill" style="width: 100%;"></div>
          </div>
        `;
        map.appendChild(wall);
      }

      // Армия
      const bar = $('myArmyBar');
      bar.innerHTML = '';
      ARMY.forEach(u => {
        let c = document.createElement('div');
        c.className = 'troop-card';
        c.innerHTML = `
          <div class="unit-icon" style="background-image:url('${u.icon}')"></div>
          <div class="tc-lvl">${u.lvl}</div>
          <div class="tc-cnt">x${u.count}</div>
        `;
        bar.appendChild(c);
      });
    }

    // Драг скролл (из макета)
    function makeDragScrollable(el) {
      let isDown = false;
      let startX;
      let scrollLeft;

      el.addEventListener('mousedown', (e) => {
        isDown = true;
        el.classList.add('active');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      });
      el.addEventListener('mouseleave', () => { isDown = false; });
      el.addEventListener('mouseup', () => { isDown = false; });
      el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2;
        el.scrollLeft = scrollLeft - walk;
      });
    }

    const scrolls = container.querySelectorAll('.ph-cards');
    scrolls.forEach(s => makeDragScrollable(s));
    makeDragScrollable($('myArmyBar'));

    // Глобальная очистка
    window.cleanupBattleUI = function() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
    };
};