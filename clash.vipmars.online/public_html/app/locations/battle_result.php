<?php
require_once __DIR__ . '/../../system/function.php';
if (!isLoggedIn()) { header('Location: /login.php'); exit; }

$stars = isset($_GET['s']) ? (int)$_GET['s'] : 0;
$percent = isset($_GET['p']) ? (int)$_GET['p'] : 0;
$gold = isset($_GET['g']) ? (int)$_GET['g'] : 0;
$elixir = isset($_GET['e']) ? (int)$_GET['e'] : 0;

$isWin = $stars > 0;
$title = $isWin ? "ПОБЕДА!" : "ПОРАЖЕНИЕ";
$titleColor = $isWin ? "#fff" : "#ffaaaa";
?>
<style>
#result-root {
  position: fixed !important; inset: 0 !important; z-index: 999999 !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  width: 100vw !important; height: 100vh !important; margin: 0; padding: 18px; box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif; color: #fff;
  background: radial-gradient(circle at 50% 28%, rgba(61,87,116,.28), transparent 24%),
             radial-gradient(circle at 50% 50%, rgba(17,31,50,.45), rgba(1,5,12,.98)) !important;
}
#result-root .viewport {
  position: relative; width: 820px; height: 560px; flex-shrink: 0;
  overflow: hidden; border-radius: 16px; box-shadow: 0 24px 70px rgba(0,0,0,.55);
}
@media (max-width: 860px) {
  #result-root { padding: 0 !important; }
  #result-root .viewport { width: 100% !important; height: 100% !important; border-radius: 0 !important; }
}

#result-root .field {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.08), transparent 30%),
             linear-gradient(180deg, #bfe179 0%, #9fcb5d 62%, #89b74c 100%);
}
#result-root .field::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at 6% 14%, rgba(67,112,35,.18) 0 22%, transparent 23%),
              radial-gradient(circle at 9% 33%, rgba(67,112,35,.16) 0 18%, transparent 19%),
              radial-gradient(circle at 91% 15%, rgba(67,112,35,.18) 0 18%, transparent 19%),
              radial-gradient(circle at 95% 35%, rgba(67,112,35,.16) 0 17%, transparent 18%),
              radial-gradient(circle at 7% 81%, rgba(67,112,35,.18) 0 20%, transparent 21%),
              radial-gradient(circle at 93% 83%, rgba(67,112,35,.18) 0 20%, transparent 21%);
}

#result-root .overlay {
  position: absolute; inset: 0; z-index: 2;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,.85) 100%);
  display: flex; flex-direction: column; align-items: center;
}
.res-title {
  margin-top: 40px; font-size: 54px; font-weight: 900; letter-spacing: 2px;
  color: <?= $titleColor ?>; text-shadow: 0 4px 0 rgba(0,0,0,.8), 0 0 30px rgba(0,0,0,.9); z-index: 10;
}
.canvas-wrap { position: relative; width: 400px; height: 180px; margin-top: -20px; z-index: 5; }
.canvas-wrap canvas { width: 100%; height: 100%; display: block; }
.pct-text {
  position: absolute; bottom: 0; width: 100%; text-align: center;
  font-size: 24px; font-weight: 900; text-shadow: 0 2px 0 #000; color: #fff29e;
}
.loot-panel { display: flex; gap: 40px; margin-top: 20px; z-index: 10; }
.l-item {
  display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,.4); padding: 8px 24px;
  border-radius: 99px; border: 1px solid rgba(255,255,255,.1);
}
.l-icon {
  width: 32px; height: 32px; border-radius: 50%;
  box-shadow: inset 0 2px 2px rgba(255,255,255,.45), inset 0 -2px 2px rgba(0,0,0,.32), 0 2px 4px rgba(0,0,0,.5);
}
.gold { background: radial-gradient(circle at 35% 30%, #fff3a8, #f3c324 58%, #bc8500); }
.elix { background: radial-gradient(circle at 35% 30%, #ffd7ff, #d848ff 58%, #6a128a); }
.l-val { font-size: 28px; font-weight: 900; text-shadow: 0 2px 0 #000; }
.btn-home {
  margin-top: auto; margin-bottom: 40px; z-index: 10; padding: 18px 60px; border-radius: 12px; border: none;
  background: linear-gradient(180deg, #7cc0ff, #347fc7); box-shadow: 0 6px 0 #1b4b82, 0 10px 20px rgba(0,0,0,.5);
  color: #fff; font-size: 22px; font-weight: 900; cursor: pointer; text-shadow: 0 2px 0 rgba(0,0,0,.5);
}

@media (max-width: 540px) {
  .res-title { font-size: 38px; }
  .canvas-wrap { width: 320px; height: 150px; }
  .loot-panel { flex-direction: column; gap: 10px; }
  .btn-home { padding: 14px 40px; font-size: 18px; }
}
</style>

<div id="result-root">
  <div class="viewport">
    <div class="field"></div>
    <div class="overlay">
      <div class="res-title"><?= $title ?></div>
      <div class="canvas-wrap">
        <canvas id="cvs"></canvas>
        <div class="pct-text">РАЗРУШЕНО: <?= $percent ?>%</div>
      </div>
      <div class="loot-panel">
        <div class="l-item"><div class="l-icon gold"></div><div class="l-val"><?= number_format($gold, 0, '', ' ') ?></div></div>
        <div class="l-item"><div class="l-icon elix"></div><div class="l-val"><?= number_format($elixir, 0, '', ' ') ?></div></div>
      </div>
      <button class="btn-home" id="btnGoHome">ДОМОЙ</button>
    </div>
  </div>
</div>

<script>
window.initBattleUI = function(container) {
    const cvs = container.querySelector('#cvs');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let cw, ch;
    
    function resize() {
        cw = cvs.offsetWidth * 2; ch = cvs.offsetHeight * 2;
        cvs.width = cw; cvs.height = ch;
        drawStars();
    }
    window.addEventListener('resize', resize);

    const earnedStars = <?= $stars ?>;

    function starPath(ctx, cx, cy, r, inset) {
        ctx.beginPath();
        for(let i=0; i<5; i++){
            let a1 = Math.PI*1.5 + (Math.PI*2/5)*i, a2 = a1 + Math.PI/5;
            ctx.lineTo(cx+Math.cos(a1)*r, cy+Math.sin(a1)*r);
            ctx.lineTo(cx+Math.cos(a2)*inset, cy+Math.sin(a2)*inset);
        }
        ctx.closePath();
    }

    function drawStars() {
        ctx.clearRect(0,0,cw,ch);
        const cx = cw/2, stCY = ch/2 - 15, cR = 55, cI = 26, sR = 40, sI = 18, sX = 90, sY = 20, sc = (cw<700) ? 0.8 : 1.2;
        
        [[-sX, sY, sR, sI, 2], [0, 0, cR, cI, 1], [sX, sY, sR, sI, 3]].forEach(s => {
            ctx.save(); starPath(ctx, cx+s[0], stCY+s[1], s[2]*sc, s[3]*sc);
            ctx.fillStyle = earnedStars >= s[4] || (s[4]==1 && earnedStars>=1) ? '#ffcc00' : '#444';
            ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
        });
    }

    container.querySelector('#btnGoHome').addEventListener('click', () => {
        window.spaRedirect('home');
    });

    setTimeout(resize, 50);
};
</script>