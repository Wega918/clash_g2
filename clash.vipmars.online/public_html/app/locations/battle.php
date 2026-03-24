<?php if (session_status() === PHP_SESSION_NONE) session_start(); ?>

<link rel="stylesheet" href="/css/battle.css">

<div class="battle-root-wrap">
  <div class="screen">
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
          <div class="search-label">Поиск противника…</div>
          <div class="search-dots">
            <div class="sdot"></div><div class="sdot"></div><div class="sdot"></div>
          </div>
        </div>
      </div>

      <div id="scoutUI">
        <div class="hud">
          <div class="top-left">
            <div class="player">
              <div class="badge">4</div>
              <div>
                <div class="player-name" id="scName">terserahlah</div>
                <div class="player-sub" id="scClan">Penjahat Malam</div>
              </div>
            </div>
            <div class="loot-title">Доступная добыча:</div>
            <div class="loot-item"><span class="loot-dot gold"></span><span id="scGold">64 462</span></div>
            <div class="loot-item"><span class="loot-dot elixir"></span><span id="scElixir">101 372</span></div>
            <div class="loot-item"><span class="loot-dot dark"></span><span id="scDark">2 122</span></div>
          </div>

          <div class="top-center">
            <div class="count-label">Начало сражения через</div>
            <div class="count-value" id="timerVal">22с.</div>
            <div class="attack-line"></div>
          </div>
        </div>

        <div class="def-map" id="defMap">
          <div class="dm-field" id="dmField"></div>
        </div>

        <div class="bottom-fade"></div>

        <div class="units-strip"><div class="units-scroll" id="unitsScroll"></div></div>

        <div class="troop-panel">
          <div class="troop-bar" id="troopBar"></div>
        </div>
      </div>
    </div>
  </div>
</div>