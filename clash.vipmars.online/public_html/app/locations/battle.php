<?php if (session_status() === PHP_SESSION_NONE) session_start(); ?>
<style>
/* Обёртка, защищающая макет от стилей SPA */
.battle-root-wrap {
    --frame-w: 820px;
    --frame-h: 560px;
    --ui-font: Arial, Helvetica, sans-serif;
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --panel-h: 90px;
    --units-h: 60px;
    
    --map-w: 79%; --map-h: 345px; --map-top: 56px; --map-scale: 0.94;
    
    width: 100%; height: 100%; display: grid; place-items: center; 
    font-family: var(--ui-font); color: #fff;
    background: radial-gradient(circle at 50% 28%, rgba(61,87,116,.28), transparent 24%),
                radial-gradient(circle at 50% 50%, rgba(17,31,50,.45), rgba(1,5,12,.98));
}

/* Для мобильного приложения убираем фон, чтобы он сливался, и делаем на 100vh */
#app .battle-root-wrap { background: none; min-height: calc(100vh - 120px); padding: 0; }
#pc-battle-content .battle-root-wrap { padding: 0; background: none; }

/* Медиа-запросы из 1_v22.html */
@media (max-width: 860px) { .battle-root-wrap { --map-top: 56px; --map-scale: 0.9; } }
@media (max-width: 540px) { .battle-root-wrap { --map-w: calc(103% - 8px); --map-h: 64%; --map-top: 17%; --map-scale: 0.95; } }
@media (max-width: 530px) { .battle-root-wrap { --map-w: calc(100% - 8px); --map-h: 59%; --map-top: 19%; --map-scale: 1; } }

.battle-root-wrap .viewport {
    position: relative; width: var(--frame-w); height: var(--frame-h);
    overflow: hidden; border-radius: 16px; box-shadow: 0 24px 70px rgba(0,0,0,.55); background-color: #000;
}
/* В модалке и на мобилке адаптируем viewport */
#pc-battle-content .viewport { border-radius: 0; box-shadow: none; width: 100%; height: 100%; }
@media (max-width: 540px) { .battle-root-wrap .viewport { width: 100%; height: 100%; border-radius: 0; box-shadow: none; } }

.battle-root-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
.battle-root-wrap .field { position: absolute; inset: 0; background: url('images/diz/glade.jpg') center center / cover no-repeat; opacity: 0.8;}

/* ВЕСЬ ОРИГИНАЛЬНЫЙ CSS ИЗ 1_V22.HTML НИЖЕ */
#searchClouds{position:absolute;inset:0;z-index:15;pointer-events:none;transition:opacity 0.3s ease;}
.cloud-element{position:absolute;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='white' stop-opacity='0.9'/%3E%3Cstop offset='50%25' stop-color='%23e0f0ff' stop-opacity='0.6'/%3E%3Cstop offset='100%25' stop-color='white' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='50' fill='url(%23g)'/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;will-change:transform;}
#searchUI{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;}
#stateIdle{display:flex;flex-direction:column;align-items:center;gap:20px}
.idle-title{font-size:28px;font-weight:900;text-shadow:0 3px 0 rgba(0,0,0,.9),0 0 24px rgba(0,0,0,.7);letter-spacing:.04em;}
.idle-sub{font-size:14px;color:rgba(255,255,200,.85);font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.8)}
.btn-attack{position:relative;border:none;cursor:pointer;width:180px;height:62px;border-radius:999px;background:linear-gradient(180deg,#ff7a45,#e03000);box-shadow:0 6px 0 #8a1800,0 10px 28px rgba(200,50,0,.55),inset 0 2px 0 rgba(255,255,255,.28);font-family:var(--ui-font);font-size:22px;font-weight:900;color:#fff;text-shadow:0 2px 0 rgba(100,0,0,.7);letter-spacing:.06em;transition:transform .1s,box-shadow .1s;}
.btn-attack:hover{transform:translateY(-2px);box-shadow:0 8px 0 #8a1800,0 14px 32px rgba(200,50,0,.6),inset 0 2px 0 rgba(255,255,255,.28)}
.btn-attack:active{transform:translateY(4px);box-shadow:0 2px 0 #8a1800,inset 0 2px 0 rgba(255,255,255,.28)}
.btn-attack::after{content:"";position:absolute;inset:-8px;border-radius:inherit;border:3px solid rgba(255,120,60,.5);animation:search-pulse 2s ease-in-out infinite;}
@keyframes search-pulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:0;transform:scale(1.13)}}
#stateSearching{display:none;flex-direction:column;align-items:center;gap:14px}
.search-label{font-size:20px;font-weight:900;text-shadow:0 2px 0 rgba(0,0,0,.9);animation:spulse 1s ease-in-out infinite alternate;}
@keyframes spulse{from{opacity:.65}to{opacity:1}}
.search-dots{display:flex;gap:8px;margin-top:2px}
.sdot{width:10px;height:10px;border-radius:50%;background:#ffe060;animation:dbounce .9s ease-in-out infinite}
.sdot:nth-child(2){animation-delay:.15s} .sdot:nth-child(3){animation-delay:.30s}
@keyframes dbounce{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(-7px);opacity:1}}
#scoutUI{position:absolute;inset:0;z-index:12;display:none;pointer-events:none;}
#scoutUI > *{pointer-events:all}
.hud{position:absolute;inset:0;pointer-events:none;font-weight:700;text-shadow:0 2px 0 rgba(56,29,7,.95),0 0 2px rgba(0,0,0,.55);z-index:3;}
.top-left{position:absolute;top:16px;left:20px;width:190px;}
.player{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.badge{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-size:22px;color:#fff4ad;background:linear-gradient(180deg,#f1d55d,#b68616);border:2px solid rgba(120,73,9,.9);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 5px rgba(0,0,0,.3);}
.player-name{font-size:17px;line-height:1} .player-sub{font-size:12px;margin-top:2px}
.loot-title{font-size:12px;margin:10px 0 6px}
.loot-item{display:flex;align-items:center;gap:9px;font-size:19px;margin:5px 0}
.loot-dot{width:18px;height:18px;border-radius:50%;flex-shrink:0;box-shadow:inset 0 2px 2px rgba(255,255,255,.45),inset 0 -2px 2px rgba(0,0,0,.32),0 1px 3px rgba(0,0,0,.4)}
.gold{background:radial-gradient(circle at 35% 30%,#fff3a8,#f3c324 58%,#bc8500);} .elixir{background:radial-gradient(circle at 35% 30%,#ffd7ff,#d848ff 58%,#6a128a);} .dark{background:radial-gradient(circle at 35% 30%,#c9c7e6,#4c466a 58%,#181325);}
.top-center{position:absolute;left:50%;top:12px;transform:translateX(-50%);width:260px;text-align:center;}
.count-label{font-size:13px} .count-value{font-size:32px;line-height:1}
.attack-line{width:100%;height:2px;margin-top:5px;background:linear-gradient(90deg,transparent,#ff6a35 12%,#ff7d43 50%,#ff6a35 88%,transparent);box-shadow:0 0 5px rgba(255,120,60,.5);}
.btn-next{position:absolute;top:20px;right:20px;border:none;background:linear-gradient(180deg,#ffca45,#e08800);border-radius:8px;font-family:var(--ui-font);font-weight:900;font-size:16px;color:#fff;padding:12px 24px;cursor:pointer;text-shadow:0 2px 0 rgba(100,50,0,.7);box-shadow:0 4px 0 #8a4800,0 6px 14px rgba(0,0,0,.4);transition:transform .1s,box-shadow .1s;pointer-events:all;}
.btn-next:active{transform:translateY(4px);box-shadow:0 0 0 #8a4800;}
.def-map{position:absolute;left:50%;background:rgb(9 73 0 / 35%);border-radius:12px;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.05);box-shadow:0 8px 32px rgba(0,0,0,0.4);overflow:visible;pointer-events:all;z-index:10;width:var(--map-w);height:var(--map-h);top:var(--map-top);transform:translateX(-50%) scale(var(--map-scale));}
.dm-field{position:relative;width:100%;height:100%;display:flex;flex-direction:column;gap:0;overflow:visible;}
.phase-hp-wrapper{width:100%;height:3px;background:rgba(0,0,0,0.6);position:relative;z-index:4;overflow:hidden;margin-top:2px;}
.phase-hp-fill{height:100%;background:linear-gradient(90deg,#ff3300,#ffaa00);box-shadow:inset 0 0 2px rgba(255,255,255,0.3);position:relative;}
.phase-hp-fill::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent);animation:hp-shine 2.5s infinite;}
@keyframes hp-shine{0%{left:-100%;}40%,100%{left:200%;}}
.wall-hp{height:2px;background:rgba(0,0,0,0.4);} .wall-hp .phase-hp-fill{background:linear-gradient(90deg,#aaa,#fff);box-shadow:inset 0 0 1px rgba(255,255,255,0.4);}
.ph-row{flex:1;min-height:0;display:flex;align-items:stretch;position:relative;overflow:visible;border-top:1px solid rgba(255,255,255,.06);}
.ph-wall{width:100%;height:24px;flex-shrink:0;position:relative;z-index:4;background-image:url('images/building/Wall/Wall8.png');background-size:24px 24px;background-repeat:repeat-x;}
.ph-wall.pw-outer{background-image:url('images/building/Wall/Wall3.png');} .ph-wall.pw-core{background-image:url('images/building/Wall/Wall12.png');}
.ph-label{flex-shrink:0;width:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px 3px;text-align:center;gap:2px;position:relative;z-index:2;border-right:1px solid rgba(255,255,255,.06);background:linear-gradient(90deg,rgba(0,0,0,.3),rgba(0,0,0,.12));}
.ph-num{font-size:9px;font-weight:900;letter-spacing:.06em;text-shadow:0 1px 3px rgba(0,0,0,.9);}
.ph-row.ph-core .ph-num{color:#ff9940;} .ph-row.ph-main .ph-num{color:#ffcc55;} .ph-row.ph-outer .ph-num{color:#ddaa44;} .ph-row.ph-decoy .ph-num{color:#bb8833;}
.ph-name{font-size:6px;font-weight:700;color:rgba(255,255,200,.58);line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,.9);}
.ph-label::before{content:'';position:absolute;left:0;top:10%;bottom:10%;width:3px;border-radius:0 2px 2px 0;}
.ph-row.ph-core .ph-label::before{background:linear-gradient(180deg,#ff6020,#cc3000);box-shadow:0 0 6px #ff6020;} .ph-row.ph-main .ph-label::before{background:linear-gradient(180deg,#ffcc00,#cc8800);box-shadow:0 0 5px #ffcc00;} .ph-row.ph-outer .ph-label::before{background:linear-gradient(180deg,#88cc44,#448800);box-shadow:0 0 4px #88cc44;} .ph-row.ph-decoy .ph-label::before{background:linear-gradient(180deg,#6688aa,#334466);box-shadow:0 0 3px #6688aa;}
.ph-cards{flex:1;min-width:0;display:block;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none !important;height:auto;min-height:100%;padding-top:150px;margin-top:-150px;padding-bottom:20px;margin-bottom:-20px;cursor:grab;user-select:none;box-sizing:border-box;pointer-events:none;position:relative;z-index:5;}
.ph-cards:active{cursor:grabbing;} .ph-cards::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important;-webkit-appearance:none;}
.ph-inner{display:inline-flex;align-items:flex-end;justify-content:space-around;gap:8px;height:100%;padding:2px 6px 4px 6px;min-width:100%;pointer-events:auto;}
@media(max-width:540px){.ph-inner{align-items:center;padding-bottom:2px;}}
.ph-cards::before{content:'';position:absolute;top:150px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent);pointer-events:none;}
.bcard{flex-shrink:0;position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform .12s,filter .3s;z-index:2;}
.bcard:hover{transform:scale(1.15);z-index:30;}
.bc-img{position:relative;width:76px;height:68px;display:flex;align-items:flex-end;justify-content:center;}
.bc-img img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 3px 7px rgba(0,0,0,.75));display:block;position:relative;z-index:1;pointer-events:none;}
.bc-fb{position:absolute;inset:2px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:17px;z-index:0;}
.bc-cnt{position:absolute;top:-5px;right:-6px;background:linear-gradient(135deg,#ff6a00,#cc2000);color:#fff;font-size:8px;font-weight:900;padding:1px 4px;border-radius:8px;border:1.5px solid rgba(255,255,255,.45);box-shadow:0 1px 4px rgba(0,0,0,.6);z-index:5;pointer-events:none;}
.bc-lvl{position:absolute;bottom:-4px;right:-5px;width:15px;height:15px;border-radius:50%;background:#0d1521;font-size:8px;font-weight:900;display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.28);box-shadow:0 1px 3px rgba(0,0,0,.7);z-index:5;}
.bn-tip{display:none;position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);background:rgba(8,10,20,.97);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:6px 10px;white-space:nowrap;font-size:11px;font-weight:700;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.8);z-index:1000;pointer-events:none;}
.bn-tip-sub{font-size:9px;color:rgba(255,220,150,.75);font-weight:600;margin-top:2px;}
.bn-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:rgba(8,10,20,.97);}
.bcard:first-child .bn-tip{left:0;transform:translateX(0);} .bcard:first-child .bn-tip::after{left:30px;transform:translateX(-50%);}
.bcard:last-child .bn-tip{left:auto;right:0;transform:translateX(0);} .bcard:last-child .bn-tip::after{left:auto;right:30px;transform:translateX(50%);}
.bcard.tip-open .bn-tip,.bcard:hover .bn-tip{display:block;}
.bottom-fade{position:absolute;left:0;right:0;bottom:var(--panel-h);height:70px;background:linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 100%);pointer-events:none;z-index:1}
.troop-panel{position:absolute;left:0;right:0;bottom:0;height:var(--panel-h);background:rgba(0,0,0,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-top:1px solid rgba(255,255,255,.09);z-index:2}
.troop-bar{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 12px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
.troop-card{flex:0 0 auto;width:52px;height:72px;border-radius:10px;background:linear-gradient(180deg,#7cc0ff,#347fc7);border:2px solid rgba(197,230,255,.35);box-shadow:0 4px 12px rgba(0,0,0,.3),inset 0 2px 0 rgba(255,255,255,.2);overflow:hidden;cursor:pointer;position:relative;user-select:none;transition:transform .15s;}
.troop-card:active{transform:scale(0.92);}
.unit-icon{width:100%;height:100%;background-size:cover;background-position:center top;}
.tc-lvl{position:absolute;top:2px;left:2px;background:#e6b422;color:#000;font-size:9px;font-weight:900;padding:1px 3px;border-radius:3px;border:1px solid rgba(255,255,255,.6);box-shadow:0 1px 2px rgba(0,0,0,.5);}
.tc-cnt{position:absolute;bottom:2px;right:3px;font-size:13px;font-weight:900;text-shadow:0 1px 2px #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;}
@media(max-width:540px){
  .badge{width:28px;height:28px;font-size:18px} .player-sub,.loot-title{font-size:10px} .loot-item{font-size:14px;margin:2px 0} .loot-dot{width:14px;height:14px}
  .top-center{top:10px;width:150px} .count-label{font-size:10px} .count-value{font-size:22px}
  .troop-panel{padding-bottom:var(--safe-bottom)} .troop-bar{justify-content:flex-start;padding:6px 8px calc(var(--safe-bottom)+4px);}
  .troop-card{width:48px;height:66px;flex:0 0 48px} .unit-icon{height:48px;}
  .bc-img{width:61px;height:58px;} .ph-label{width:36px;} .ph-num{font-size:7.5px;} .ph-name{font-size:5px;}
  .ph-wall,.ph-wall.pw-outer,.ph-wall.pw-core{height:20px;background-size:20px 20px;}
}
</style>

<div class="battle-root-wrap">
  <div class="viewport" id="vp">
    <div class="field"></div>
    <div id="searchClouds"></div>
    <div id="searchUI">
      <div id="stateIdle">
        <div class="idle-title">Найди противника</div>
        <div class="idle-sub">Атакуй и забирай ресурсы</div>
        <button class="btn-attack" id="btnSearch">В БОЙ</button>
      </div>
      <div id="stateSearching">
        <div class="search-label">Поиск противника</div>
        <div class="search-dots"><div class="sdot"></div><div class="sdot"></div><div class="sdot"></div></div>
      </div>
    </div>

    <div id="scoutUI">
      <div class="hud">
        <div class="top-left">
          <div class="player">
            <div class="badge" id="scLvl">10</div>
            <div>
              <div class="player-name" id="scName">DarkSlayer</div>
              <div class="player-sub" id="scClan">The Elites</div>
            </div>
          </div>
          <div class="loot-title">ДОСТУПНАЯ ДОБЫЧА</div>
          <div class="loot-item"><div class="loot-dot gold"></div><span id="scGold">450 000</span></div>
          <div class="loot-item"><div class="loot-dot elixir"></div><span id="scElixir">420 000</span></div>
          <div class="loot-item"><div class="loot-dot dark"></div><span id="scDark">3 500</span></div>
        </div>
        
        <div class="top-center">
          <div class="count-label">НАГРАДА ЗА ПОБЕДУ</div>
          <div class="count-value" id="scTrophies">28</div>
          <div class="attack-line"></div>
        </div>

        <button class="btn-next" id="btnNext">СЛЕДУЮЩИЙ</button>
      </div>

      <div class="def-map">
        <div class="dm-field" id="mapField"></div>
      </div>

      <div class="bottom-fade"></div>
      <div class="troop-panel">
        <div class="troop-bar" id="myArmyBar"></div>
      </div>
    </div>
  </div>
</div>