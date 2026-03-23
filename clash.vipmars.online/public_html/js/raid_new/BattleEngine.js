window.cleanupBattleUI = function() {
    if (window.battleTimer) clearInterval(window.battleTimer);
    if (window.cloudAnimFrameId) cancelAnimationFrame(window.cloudAnimFrameId);
    window.battleActive = false;
};

window.initBattleUI = function(container) {
    if (!container) return;
    const root = container.querySelector('#battle-root');
    if (!root) return;

    const $ = selector => root.querySelector(selector);
    const vp = $('#vp');
    let PHASE = 'idle', currentTarget = null, myArmy = null, deployedUnits = {}, deployInterval = null;

    $('#btnExitRaid').addEventListener('click', () => {
        window.cleanupBattleUI();
        window.spaRedirect('home');
    });

    // 100% Оригинальный алгоритм облаков
    const cloudContainer = $('#searchClouds');
    let domClouds = [];
    let cloudPhase = 'idle';
    let cloudOutProgress = 0;
    let W = 0, H = 0;
    
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
        this.x += this.vx * dt; this.y += this.vy * dt;
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
      if (PHASE === 'scout' && domClouds.length === 0) { window.cloudAnimFrameId = null; return; }
      const dt = Math.min((ts - lastT) / 1000, 0.05); lastT = ts;
      domClouds.forEach(c => c.update(dt));
      
      if (cloudPhase === 'out') {
        cloudOutProgress += dt;
        cloudContainer.style.opacity = Math.max(0, 1 - cloudOutProgress * 2.5);
        if (cloudOutProgress > 0.4) onRevealDone();
      }
      window.cloudAnimFrameId = requestAnimationFrame(domLoop);
    }

    async function fetchMatchmaking() {
        let fd = new FormData(); fd.append('action', 'search_opponent');
        try {
            let res = await fetch('app/battle_api.php', { method: 'POST', body: fd });
            let data = await res.json();
            if (data.ok) { currentTarget = data.target; myArmy = data.army; return true; }
        } catch(e) { console.error(e); }
        return false;
    }

    $('#btnSearch').addEventListener('click', async () => {
        if (PHASE !== 'idle') return;
        initDOMClouds(); PHASE = 'searching'; cloudPhase = 'in';
        $('#stateIdle').style.display = 'none'; $('#stateSearching').style.display = 'flex';
        lastT = performance.now(); window.cloudAnimFrameId = requestAnimationFrame(domLoop);
        
        setTimeout(async () => {
            if (await fetchMatchmaking()) { cloudPhase = 'out'; cloudOutProgress = 0; }
            else { 
                PHASE = 'idle'; $('#stateIdle').style.display = 'flex'; $('#stateSearching').style.display = 'none'; cloudContainer.style.opacity = '0'; 
            }
        }, 1500); 
    });

    function onRevealDone() {
        domClouds.forEach(c => c.destroy()); domClouds = []; cloudContainer.style.opacity = '0';
        $('#searchUI').style.display = 'none'; $('#scoutUI').style.display = 'block'; PHASE = 'scout';
        renderBase(); renderArmy();
    }

    function renderBase() {
        $('#scName').textContent = currentTarget.login; $('#scLvl').textContent = currentTarget.townhall_level;
        $('#scGold').textContent = currentTarget.resources.gold.toLocaleString('ru-RU');
        $('#scElixir').textContent = currentTarget.resources.elixir.toLocaleString('ru-RU');
        $('#scDark').textContent = currentTarget.resources.dark_elixir.toLocaleString('ru-RU');

        const map = $('#mapField'); map.innerHTML = '';
        const phaseNames = ['Внешний пояс', 'Кольцо обороны', 'Внутренний слой', 'Ядро базы'];
        const phaseClasses = ['ph-outer', 'ph-main', 'ph-decoy', 'ph-core'];
        let phases = [[], [], [], []];
        currentTarget.base.buildings.forEach(b => phases[Math.min(3, b.segment || 0)].push(b));
        
        for (let i = 3; i >= 0; i--) {
            if (phases[i].length === 0 && i !== 3) continue;
            let row = document.createElement('div'); row.className = `ph-row ${phaseClasses[i]}`;
            row.innerHTML = `<div class="ph-label"><div class="ph-num">ФАЗА ${i+1}</div><div class="ph-name">${phaseNames[i]}</div></div><div class="ph-cards"><div class="ph-inner"></div></div>`;
            map.appendChild(row);
            
            phases[i].forEach(b => {
                let card = document.createElement('div'); card.className = 'bcard'; card.dataset.id = b.id;
                card.innerHTML = `<div class="bc-img"><img src="${b.icon}"><div class="bc-lvl">${b.level}</div></div><div class="phase-hp-wrapper"><div class="phase-hp-fill" style="width:100%;"></div></div>`;
                row.querySelector('.ph-inner').appendChild(card);
            });
            let wall = document.createElement('div'); wall.className = 'ph-wall ' + (i===3 ? 'pw-core' : (i===0 ? 'pw-outer' : ''));
            wall.innerHTML = `<div class="phase-hp-wrapper wall-hp"><div class="phase-hp-fill" style="width: 100%;"></div></div>`;
            map.appendChild(wall);
        }
    }

    function renderArmy() {
        const bar = $('#myArmyBar'); bar.innerHTML = '';
        if (!myArmy || !myArmy.troops) return;
        myArmy.troops.forEach(unit => {
            if (unit.count <= 0) return;
            let c = document.createElement('div'); c.className = 'troop-card';
            c.innerHTML = `<div class="unit-icon" style="background-image:url('${unit.icon}')"></div><div class="tc-lvl">${unit.level}</div><div class="tc-cnt">x<span class="cnt-val">${unit.count}</span></div>`;
            let isDown = false;
            const act = (e) => {
                e.preventDefault(); if (unit.count <= 0 || PHASE !== 'scout') return;
                isDown = true; deployUnit(unit, c); startEngine();
                deployInterval = setInterval(() => { if (isDown && unit.count > 0) deployUnit(unit, c); else clearInterval(deployInterval); }, 100);
            };
            const stop = () => { isDown = false; clearInterval(deployInterval); };
            c.addEventListener('mousedown', act); c.addEventListener('mouseup', stop); c.addEventListener('mouseleave', stop);
            c.addEventListener('touchstart', act, {passive: false}); c.addEventListener('touchend', stop);
            bar.appendChild(c);
        });
    }

    function deployUnit(data, cardEl) {
        data.count--; cardEl.querySelector('.cnt-val').textContent = data.count;
        if (data.count === 0) cardEl.style.filter = 'grayscale(1)';
        $('#units-strip').style.display = 'flex';
        
        let tIcon = currentTarget.base.buildings[0]?.icon || 'images/building/Wall/Wall8.png';
        if (!deployedUnits[data.id]) {
            let wrap = document.createElement('div'); wrap.className = 'deployed-unit';
            wrap.innerHTML = `<div class="du-avatar" style="background-image:url('${data.icon}')"><svg class="du-hp-svg" viewBox="0 0 60 60"><circle class="du-hp-bg" cx="30" cy="30" r="27"></circle><circle class="du-hp-bar" cx="30" cy="30" r="27"></circle></svg><div class="du-count">x1</div><div class="du-target" style="background-image:url('${tIcon}')"></div></div>`;
            $('#units-wrap').appendChild(wrap);
            deployedUnits[data.id] = { count: 1, maxHp: data.hp, hp: data.hp, el: wrap, bar: wrap.querySelector('.du-hp-bar'), cntText: wrap.querySelector('.du-count') };
        } else {
            let du = deployedUnits[data.id]; du.count++; du.maxHp += data.hp; du.hp += data.hp;
            du.cntText.textContent = 'x' + du.count; updateHp(du);
        }
    }

    function updateHp(du) {
        const pct = Math.max(0, du.hp / du.maxHp);
        du.bar.style.strokeDashoffset = 170 - (170 * pct);
        du.bar.style.stroke = pct < 0.3 ? '#ff3300' : pct < 0.6 ? '#ffaa00' : '#4caf50';
    }

    function startEngine() {
        if (window.battleActive) return;
        window.battleActive = true;
        window.battleTimer = setInterval(battleTick, 1000);
    }

    function battleTick() {
        let allUnitsDead = Object.values(deployedUnits).every(u => u.hp <= 0);
        let noMoreTroops = myArmy.troops.every(t => t.count === 0);
        let allBldDead = currentTarget.base.buildings.every(b => b.hp <= 0);
        
        if (allBldDead || (allUnitsDead && noMoreTroops)) {
            endBattle(allBldDead ? 100 : Math.floor((currentTarget.base.buildings.filter(b=>b.hp<=0).length / currentTarget.base.buildings.length)*100));
            return;
        }

        let aliveUnits = Object.values(deployedUnits).filter(u => u.hp > 0);
        let atkDps = aliveUnits.reduce((sum, u) => sum + (u.count * 10), 0);
        let targetBld = currentTarget.base.buildings.find(b=>b.hp>0);
        
        if (atkDps > 0 && targetBld) {
            targetBld.hp -= atkDps;
            let card = root.querySelector(`.bcard[data-id='${targetBld.id}']`);
            if (card) card.querySelector('.phase-hp-fill').style.width = Math.max(0, targetBld.hp / 1500 * 100) + '%';
        }
    }

    function endBattle(percent) {
        window.cleanupBattleUI();
        let fd = new FormData();
        fd.append('action', 'save_result'); fd.append('stars', percent >= 50 ? 1 : 0); fd.append('percent', percent);
        fd.append('gold', currentTarget.resources.gold); fd.append('elixir', currentTarget.resources.elixir);

        fetch('app/battle_api.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => { if(data.redirect_spa) window.spaRedirect(data.redirect_spa); });
    }
};