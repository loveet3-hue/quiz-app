// 뽑기 게임 3종: 돌림판 · 사다리 타기 · 구슬 추첨.
// 주소: #/game/wheel · #/game/ladder · #/game/marble
'use strict';

const GAMES = [
  { id: 'marble', title: '구슬 추첨', desc: '구슬이 굴러 내려가는 순서로 뽑기', cover: () => COVERS['game-marble'] },
  { id: 'horse', title: '경주마', desc: '1등할 말을 골라 맞혀 보세요', cover: () => COVERS['game-horse'] },
  { id: 'ladder', title: '사다리 타기', desc: '누가 당첨일까? 길을 따라가 보세요', cover: () => COVERS['game-ladder'] },
  { id: 'wheel', title: '돌림판', desc: '항목을 넣고 돌려서 하나 뽑기', cover: () => COVERS['game-wheel'] },
];

// 공통: 입력값 기억 (게임마다)
const gameStore = {
  get(id) {
    try { return JSON.parse(localStorage.getItem('game-' + id) || 'null'); } catch { return null; }
  },
  save(id, v) {
    try { localStorage.setItem('game-' + id, JSON.stringify(v)); } catch { /* 무시 */ }
  },
};

// '철수, 영희' 또는 줄바꿈으로 나눈 목록
const parseNames = (text, max) =>
  String(text || '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);

// 보기 좋은 색 (이름 순서대로)
const gameColor = (i, n) => `hsl(${Math.round((i * 360) / Math.max(n, 1) + 8) % 360} 72% 62%)`;

let gameCleanup = null;
function stopGame() {
  if (gameCleanup) gameCleanup();
  gameCleanup = null;
}

function renderGamesHome() {
  document.title = '게임 · 맞혀봐';
  app.innerHTML = `
    <div class="games-home">
      <section class="hero">
        <h1>모일 때 꼭 필요한<br>뽑기 게임</h1>
        <p>누가 쏠지, 누가 갈지 공정하게 정해 보세요</p>
      </section>
      <div class="games-grid">
        ${GAMES.map(
          (g) => `
          <a class="card" href="#/game/${g.id}">
            <div class="cover"><img src="${g.cover()}" alt=""></div>
            <div class="card-body">
              <h2 class="card-title">${esc(g.title)}</h2>
              <div class="card-meta">${esc(g.desc)}</div>
            </div>
          </a>`
        ).join('')}
      </div>
    </div>`;
}

function renderGame(id) {
  stopGame();
  const game = GAMES.find((g) => g.id === id);
  if (!game) {
    location.hash = '#/';
    return;
  }
  document.title = `${game.title} · 맞혀봐`;
  app.innerHTML = `
    <div class="play-head">
      <button class="icon-btn" data-act="home" aria-label="게임 목록으로">←</button>
      <h1 class="page-title">${esc(game.title)}</h1>
    </div>
    <div class="game-body"></div>`;
  app.querySelector('[data-act="home"]').addEventListener('click', () => (location.hash = '#/games'));
  const body = app.querySelector('.game-body');
  ({ wheel: renderWheel, ladder: renderLadder, marble: renderMarble, horse: renderHorse })[id](body);
}

/* ═════════════════════ 돌림판 ═════════════════════ */

function renderWheel(root) {
  const saved = gameStore.get('wheel') || { items: '치킨\n피자\n짜장면\n떡볶이\n햄버거\n초밥' };
  root.innerHTML = `
    <div class="wheel-wrap">
      <div class="wheel-pointer" aria-hidden="true"></div>
      <canvas class="wheel-canvas" width="400" height="400" aria-label="돌림판"></canvas>
    </div>
    <p class="game-result" role="status"></p>
    <div class="game-actions">
      <button class="btn block" data-act="spin">돌리기</button>
      <button class="btn ghost block" data-act="remove" hidden>당첨 항목 빼고 다시</button>
    </div>
    <label class="field">
      <span>항목 (한 줄에 하나, 또는 쉼표로 구분 · 최대 30개)</span>
      <textarea class="names" rows="6">${esc(saved.items)}</textarea>
    </label>`;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const ta = root.querySelector('.names');
  const resultEl = root.querySelector('.game-result');
  const removeBtn = root.querySelector('[data-act="remove"]');
  const spinBtn = root.querySelector('[data-act="spin"]');
  let angle = 0; // 돌림판이 돌아간 각도 (라디안)
  let spinning = false;
  let raf = 0;
  let lastWinner = -1;

  const items = () => parseNames(ta.value, 30);

  function draw() {
    const list = items();
    const n = Math.max(list.length, 1);
    const size = canvas.width;
    const r = size / 2 - 6;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(angle);
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = list.length ? gameColor(i, n) : '#ddd';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (list[i]) {
        ctx.save();
        ctx.rotate((a0 + a1) / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1d1b26';
        const fs = Math.max(12, Math.min(22, 260 / n + 6));
        ctx.font = `700 ${fs}px Pretendard, -apple-system, sans-serif`;
        const label = list[i].length > 10 ? list[i].slice(0, 9) + '…' : list[i];
        ctx.fillText(label, r - 14, 0);
        ctx.restore();
      }
    }
    ctx.restore();
    // 가운데 원
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#7c5cff';
    ctx.stroke();
  }

  // 위쪽 화살표가 가리키는 칸 번호
  function pointed() {
    const n = items().length;
    const top = -Math.PI / 2;
    let a = (top - angle) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return Math.floor((a / (Math.PI * 2)) * n);
  }

  function spin() {
    const list = items();
    if (list.length < 2) {
      resultEl.textContent = '항목을 2개 이상 넣어 주세요.';
      return;
    }
    gameStore.save('wheel', { items: ta.value });
    spinning = true;
    spinBtn.disabled = true;
    removeBtn.hidden = true;
    resultEl.textContent = '두근두근…';
    const start = angle;
    const total = Math.PI * 2 * (5 + Math.random() * 3) + Math.random() * Math.PI * 2;
    const dur = 4200 + Math.random() * 800;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 4);
      angle = start + total * ease;
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        spinning = false;
        spinBtn.disabled = false;
        lastWinner = pointed();
        resultEl.innerHTML = `🎉 <b>${esc(list[lastWinner])}</b> 당첨!`;
        removeBtn.hidden = list.length <= 2;
      }
    };
    raf = requestAnimationFrame(step);
  }

  spinBtn.addEventListener('click', spin);
  removeBtn.addEventListener('click', () => {
    const list = items();
    if (lastWinner < 0 || !list[lastWinner]) return;
    list.splice(lastWinner, 1);
    ta.value = list.join('\n');
    lastWinner = -1;
    draw();
    spin();
  });
  ta.addEventListener('input', () => {
    if (!spinning) {
      resultEl.textContent = '';
      removeBtn.hidden = true;
      draw();
    }
  });
  draw();
  gameCleanup = () => cancelAnimationFrame(raf);
}

/* ═════════════════════ 사다리 타기 ═════════════════════ */

function renderLadder(root) {
  const saved = gameStore.get('ladder') || { names: '철수\n영희\n민수\n지은', results: '당첨\n꽝\n꽝\n꽝' };
  root.innerHTML = `
    <div class="ladder-box"><p class="empty">참가자를 넣고 '사다리 만들기'를 눌러 주세요.</p></div>
    <p class="game-result" role="status"></p>
    <div class="game-actions">
      <button class="btn block" data-act="make">사다리 만들기</button>
      <button class="btn ghost block" data-act="all" disabled>결과 한 번에 보기</button>
    </div>
    <div class="two-col">
      <label class="field">
        <span>참가자 (2~20명)</span>
        <textarea class="names" rows="6">${esc(saved.names)}</textarea>
      </label>
      <label class="field">
        <span>결과 (비우면 당첨 1개 + 꽝)</span>
        <textarea class="results" rows="6">${esc(saved.results)}</textarea>
      </label>
    </div>`;
  const box = root.querySelector('.ladder-box');
  const resultEl = root.querySelector('.game-result');
  const allBtn = root.querySelector('[data-act="all"]');
  let ladder = null;
  let timers = [];

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  function make() {
    clearTimers();
    const names = parseNames(root.querySelector('.names').value, 20);
    if (names.length < 2) {
      resultEl.textContent = '참가자를 2명 이상 넣어 주세요.';
      return;
    }
    let results = parseNames(root.querySelector('.results').value, 20);
    if (!results.length) results = ['당첨'];
    while (results.length < names.length) results.push('꽝');
    results = results.slice(0, names.length);
    gameStore.save('ladder', { names: root.querySelector('.names').value, results: root.querySelector('.results').value });

    const n = names.length;
    const ROWS = 10 + n;
    // rungs[r][i] = i번째 줄과 i+1번째 줄 사이에 가로대가 있는지 (이웃 가로대는 붙지 않게)
    const rungs = Array.from({ length: ROWS }, () => Array(n - 1).fill(false));
    for (let r = 0; r < ROWS; r++) {
      for (let i = 0; i < n - 1; i++) {
        if (!(i > 0 && rungs[r][i - 1]) && Math.random() < 0.45) rungs[r][i] = true;
      }
    }
    // 모든 이웃 줄 사이에 가로대가 최소 1개는 있게
    for (let i = 0; i < n - 1; i++) {
      if (!rungs.some((row) => row[i])) {
        const r = Math.floor(Math.random() * ROWS);
        rungs[r][i] = true;
        if (i > 0) rungs[r][i - 1] = false;
        if (i < n - 2) rungs[r][i + 1] = false;
      }
    }
    ladder = { names, results, rungs, n, ROWS, done: new Set() };
    drawLadder();
    resultEl.textContent = '이름을 누르면 사다리를 타요.';
    allBtn.disabled = false;
  }

  function pathOf(start) {
    const { rungs, ROWS, n } = ladder;
    let c = start;
    const steps = [{ r: -1, c }];
    for (let r = 0; r < ROWS; r++) {
      if (c < n - 1 && rungs[r][c]) {
        steps.push({ r, c }, { r, c: c + 1 });
        c += 1;
      } else if (c > 0 && rungs[r][c - 1]) {
        steps.push({ r, c }, { r, c: c - 1 });
        c -= 1;
      }
    }
    steps.push({ r: ROWS, c });
    return { steps, end: c };
  }

  function drawLadder() {
    const { names, results, rungs, n, ROWS } = ladder;
    const COL = 64;
    const W = n * COL;
    const TOP = 46;
    const ROW_H = 26;
    const H = TOP + (ROWS + 1) * ROW_H + 46;
    const x = (c) => c * COL + COL / 2;
    const y = (r) => TOP + (r + 1) * ROW_H;
    let svg = `<svg class="ladder-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    for (let c = 0; c < n; c++) svg += `<line x1="${x(c)}" y1="${TOP}" x2="${x(c)}" y2="${y(ROWS)}" class="lad-line"/>`;
    for (let r = 0; r < ROWS; r++)
      for (let i = 0; i < n - 1; i++)
        if (rungs[r][i]) svg += `<line x1="${x(i)}" y1="${y(r)}" x2="${x(i + 1)}" y2="${y(r)}" class="lad-line"/>`;
    svg += `<g class="lad-paths"></g>`;
    names.forEach((name, c) => {
      svg += `<g class="lad-name" data-c="${c}" role="button" tabindex="0" aria-label="${esc(name)} 사다리 타기">
        <rect x="${x(c) - COL / 2 + 4}" y="4" width="${COL - 8}" height="32" rx="10" fill="${gameColor(c, n)}"/>
        <text x="${x(c)}" y="25" text-anchor="middle">${esc(name.length > 5 ? name.slice(0, 4) + '…' : name)}</text></g>`;
    });
    results.forEach((res, c) => {
      svg += `<g class="lad-res" data-c="${c}"><rect x="${x(c) - COL / 2 + 4}" y="${y(ROWS) + 8}" width="${COL - 8}" height="32" rx="10"/>
        <text x="${x(c)}" y="${y(ROWS) + 29}" text-anchor="middle">?</text></g>`;
    });
    svg += '</svg>';
    box.innerHTML = svg;
    box.querySelectorAll('.lad-name').forEach((g) => {
      const go = () => ride(Number(g.dataset.c));
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && go());
    });
    ladder.geom = { x, y, COL };
  }

  function ride(start, quiet) {
    if (!ladder) return;
    const { steps, end } = pathOf(start);
    const { x, y } = ladder.geom;
    const pts = steps.map((s) => `${x(s.c)},${s.r < 0 ? 40 : y(s.r)}`).join(' ');
    const g = box.querySelector('.lad-paths');
    const color = gameColor(start, ladder.n);
    g.insertAdjacentHTML('beforeend', `<polyline points="${pts}" class="lad-path" style="stroke:${color}"/>`);
    const line = g.lastElementChild;
    const len = line.getTotalLength ? line.getTotalLength() : 1000;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      line.style.transition = 'stroke-dashoffset 1.6s ease-in-out';
      line.style.strokeDashoffset = 0;
    });
    timers.push(
      setTimeout(() => {
        const res = box.querySelector(`.lad-res[data-c="${end}"]`);
        res.classList.add('open');
        res.querySelector('rect').style.fill = color;
        res.querySelector('text').textContent = ladder.results[end].length > 5 ? ladder.results[end].slice(0, 4) + '…' : ladder.results[end];
        ladder.done.add(start);
        if (!quiet) resultEl.innerHTML = `<b>${esc(ladder.names[start])}</b> → <b>${esc(ladder.results[end])}</b>`;
        if (ladder.done.size === ladder.n) showAll();
      }, 1650)
    );
  }

  function showAll() {
    const lines = ladder.names.map((name, c) => `${esc(name)} → <b>${esc(ladder.results[pathOf(c).end])}</b>`);
    resultEl.innerHTML = lines.join('<br>');
  }

  root.querySelector('[data-act="make"]').addEventListener('click', make);
  allBtn.addEventListener('click', () => {
    if (!ladder) return;
    ladder.names.forEach((_, c) => {
      if (!ladder.done.has(c)) timers.push(setTimeout(() => ride(c, true), c * 350));
    });
    timers.push(setTimeout(showAll, ladder.n * 350 + 1800));
  });
  make();
  gameCleanup = clearTimers;
}

/* ═════════════════════ 구슬 추첨 ═════════════════════ */

function renderMarble(root) {
  const saved = gameStore.get('marble') || { names: '철수\n영희\n민수\n지은\n현우\n서연', rule: 'first' };
  root.innerHTML = `
    <div class="marble-stage">
      <canvas class="marble-canvas" aria-label="구슬 추첨 화면"></canvas>
      <ol class="marble-rank" aria-label="도착 순서"></ol>
    </div>
    <p class="game-result" role="status"></p>
    <div class="game-actions">
      <button class="btn block" data-act="start">시작</button>
      <button class="btn ghost block" data-act="shuffle">구슬 섞기</button>
    </div>
    <div class="rule-row" role="radiogroup" aria-label="당첨 기준">
      <label><input type="radio" name="rule" value="first" ${saved.rule !== 'last' ? 'checked' : ''}> 1등으로 도착하면 당첨</label>
      <label><input type="radio" name="rule" value="last" ${saved.rule === 'last' ? 'checked' : ''}> 꼴등이 당첨</label>
    </div>
    <label class="field">
      <span>참가자 (한 줄에 하나, 또는 쉼표로 구분 · 최대 50명)</span>
      <textarea class="names" rows="6">${esc(saved.names)}</textarea>
    </label>`;

  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const rankEl = root.querySelector('.marble-rank');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  const ta = root.querySelector('.names');

  // ── 맵 (월드 좌표: 폭 360) ──
  const W = 360;
  const R = 8.5; // 구슬 반지름
  const FINISH = 2140;
  const H = FINISH + 120;
  const pegs = []; // {x,y,r,bounce}
  const segs = []; // 고정 벽 {x1,y1,x2,y2}
  const spinners = []; // 회전 막대 {cx,cy,len,w,a}
  // 양쪽 벽 (깔때기 시작까지)
  const FUNNEL = FINISH - 280;
  segs.push({ x1: 0, y1: -400, x2: 0, y2: FUNNEL }, { x1: W, y1: -400, x2: W, y2: FUNNEL });
  // 핀 밭
  for (let row = 0, y = 230; y < FUNNEL - 60; row++, y += 44) {
    const off = row % 2 ? 22 : 0;
    for (let x = 40 + off; x <= W - 40; x += 44) { // 벽과 핀 사이에 구슬이 끼지 않게 벽 가까이는 비움
      if (spinners.some((s) => Math.abs(s.cy - y) < 50 && Math.abs(s.cx - x) < s.len / 2 + 14)) continue;
      pegs.push({ x, y, r: 4.5, bounce: 0.55 });
    }
    // 가끔 회전 막대
    if (row % 7 === 3) {
      spinners.push({ cx: 95, cy: y + 22, len: 84, a: Math.random() * 3, w: 2.4 }, { cx: 265, cy: y + 22, len: 84, a: Math.random() * 3, w: -2.4 });
    }
    // 가끔 튕기는 범퍼
    if (row % 9 === 6) pegs.push({ x: W / 2 + (row % 2 ? 40 : -40), y: y + 22, r: 15, bounce: 1.05, bumper: true });
  }
  // 범퍼 바로 옆 핀은 치움 (범퍼와 핀 사이에 구슬이 끼지 않게)
  for (let i = pegs.length - 1; i >= 0; i--) {
    const p = pegs[i];
    if (!p.bumper && pegs.some((b) => b.bumper && Math.hypot(b.x - p.x, b.y - p.y) < 44)) pegs.splice(i, 1);
  }
  // 깔때기 → 좁은 통로 → 골인. 통로 한가운데서 막대가 빙빙 돌며 막았다 열었다 함
  const GATE = 34; // 통로 반폭
  segs.push(
    { x1: 0, y1: FUNNEL, x2: W / 2 - GATE, y2: FINISH - 150 },
    { x1: W, y1: FUNNEL, x2: W / 2 + GATE, y2: FINISH - 150 },
    { x1: W / 2 - GATE, y1: FINISH - 150, x2: W / 2 - GATE, y2: FINISH + 20 },
    { x1: W / 2 + GATE, y1: FINISH - 150, x2: W / 2 + GATE, y2: FINISH + 20 }
  );
  spinners.push({ cx: W / 2, cy: FINISH - 70, len: GATE * 2 - 6, a: 0, w: 3.2, gate: true });

  let marbles = [];
  let finished = [];
  let running = false;
  let raf = 0;
  let camY = 0;
  let view = { scale: 1, w: 360, h: 480 };
  let lastT = 0;
  let order = []; // 시작 위치 섞기용

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    view = { scale: (rect.width / W) * dpr, w: rect.width * dpr, h: rect.height * dpr, dpr };
    render();
  }

  function setup() {
    const names = parseNames(ta.value, 50);
    if (!order.length || order.length !== names.length) order = shuffleArr(names.map((_, i) => i));
    const cols = Math.min(names.length, 10);
    marbles = names.map((name, i) => {
      const slot = order[i];
      const cx = W / 2 + ((slot % cols) - (cols - 1) / 2) * 24 + (Math.random() - 0.5) * 4;
      const cy = 60 + Math.floor(slot / cols) * 22;
      return { name, x: cx, y: cy, vx: 0, vy: 0, color: gameColor(i, names.length), done: false, still: 0 };
    });
    finished = [];
    rankEl.innerHTML = '';
    resultEl.textContent = '';
    camY = 0;
    render();
  }

  function shuffleArr(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── 물리 ──
  const G = 900;
  function collideCircle(m, cx, cy, cr, bounce, vx = 0, vy = 0) {
    const dx = m.x - cx;
    const dy = m.y - cy;
    const min = cr + R;
    const d2 = dx * dx + dy * dy;
    if (d2 >= min * min || d2 === 0) return;
    const d = Math.sqrt(d2);
    const nx = dx / d;
    const ny = dy / d;
    m.x = cx + nx * min;
    m.y = cy + ny * min;
    const rvx = m.vx - vx;
    const rvy = m.vy - vy;
    const vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      m.vx -= (1 + bounce) * vn * nx;
      m.vy -= (1 + bounce) * vn * ny;
      m.vx += (Math.random() - 0.5) * 18; // 약간의 무작위
    }
  }
  function collideSeg(m, s, bounce, svx = 0, svy = 0) {
    const ex = s.x2 - s.x1;
    const ey = s.y2 - s.y1;
    const l2 = ex * ex + ey * ey;
    let t = ((m.x - s.x1) * ex + (m.y - s.y1) * ey) / l2;
    t = Math.max(0, Math.min(1, t));
    const px = s.x1 + ex * t;
    const py = s.y1 + ey * t;
    collideCircle(m, px, py, 2, bounce, svx, svy);
  }

  function step(dt) {
    spinners.forEach((s) => (s.a += s.w * dt));
    for (const m of marbles) {
      if (m.done) continue;
      m.vy += G * dt;
      const sp = Math.hypot(m.vx, m.vy);
      if (sp > 900) {
        m.vx *= 900 / sp;
        m.vy *= 900 / sp;
      }
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      for (const p of pegs) if (Math.abs(p.y - m.y) < 30 && Math.abs(p.x - m.x) < 30) collideCircle(m, p.x, p.y, p.r, p.bounce);
      for (const s of segs) {
        if (m.y < Math.min(s.y1, s.y2) - 20 || m.y > Math.max(s.y1, s.y2) + 20) continue;
        collideSeg(m, s, 0.35);
      }
      for (const s of spinners) {
        if (Math.abs(s.cy - m.y) > s.len / 2 + 20) continue;
        const dx = (Math.cos(s.a) * s.len) / 2;
        const dy = (Math.sin(s.a) * s.len) / 2;
        // 막대 위 접점의 회전 속도를 더해 줌
        const tx = m.x - s.cx;
        const ty = m.y - s.cy;
        collideSeg(m, { x1: s.cx - dx, y1: s.cy - dy, x2: s.cx + dx, y2: s.cy + dy }, 0.4, -ty * s.w, tx * s.w);
      }
      if (m.x < R) m.x = R;
      if (m.x > W - R) m.x = W - R;
      // 오래 멈춰 있으면 살짝 흔들기
      if (sp < 12) m.still += dt;
      else m.still = 0;
      if (m.still > 1.2) {
        // 벽 쪽에 있으면 가운데로, 아니면 아무 쪽으로 살짝 튕김
        const toCenter = m.x < 60 ? 1 : m.x > W - 60 ? -1 : Math.random() < 0.5 ? -1 : 1;
        m.vx += toCenter * (120 + Math.random() * 160);
        m.vy -= 140;
        m.still = 0;
        m.kicks = (m.kicks || 0) + 1;
        // 같은 곳에서 계속 끼면 살짝 아래로 옮겨 줌
        if (m.kicks >= 3) {
          m.y += 16;
          m.x += toCenter * 10;
          m.vy = 60;
          m.kicks = 0;
        }
      } else if (sp > 80) m.kicks = 0;
      if (m.y > FINISH) {
        m.done = true;
        finished.push(m);
        rankEl.insertAdjacentHTML('beforeend', `<li style="--c:${m.color}">${esc(m.name)}</li>`);
        rankEl.scrollTop = rankEl.scrollHeight;
      }
    }
    // 구슬끼리 부딪힘
    for (let i = 0; i < marbles.length; i++) {
      const a = marbles[i];
      if (a.done) continue;
      for (let j = i + 1; j < marbles.length; j++) {
        const b = marbles[j];
        if (b.done) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= 4 * R * R || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const nx = dx / d;
        const ny = dy / d;
        const push = (2 * R - d) / 2;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) {
          const imp = -vn * 0.9;
          a.vx -= imp * nx;
          a.vy -= imp * ny;
          b.vx += imp * nx;
          b.vy += imp * ny;
        }
      }
    }
  }

  // ── 그리기 ──
  function render() {
    const { scale, w, h } = view;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-2') || '#f0eef8';
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(scale, 0, 0, scale, 0, -camY * scale);
    const top = camY - 20;
    const bottom = camY + h / scale + 20;
    // 결승선
    ctx.fillStyle = '#7c5cff';
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, FINISH, W, 60);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#7c5cff';
    ctx.font = '700 14px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('도착', W / 2, FINISH + 32);
    // 핀·범퍼
    for (const p of pegs) {
      if (p.y < top || p.y > bottom) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.bumper ? '#ff8c42' : '#8f8aa3';
      ctx.fill();
    }
    // 벽
    ctx.strokeStyle = '#5f5b70';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const s of segs) {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    // 회전 막대 (골인 막대는 빨갛고 굵게)
    for (const s of spinners) {
      if (s.cy < top - 60 || s.cy > bottom + 60) continue;
      ctx.strokeStyle = s.gate ? '#ff4f5e' : '#7c5cff';
      ctx.lineWidth = s.gate ? 8 : 5;
      const dx = (Math.cos(s.a) * s.len) / 2;
      const dy = (Math.sin(s.a) * s.len) / 2;
      ctx.beginPath();
      ctx.moveTo(s.cx - dx, s.cy - dy);
      ctx.lineTo(s.cx + dx, s.cy + dy);
      ctx.stroke();
    }
    // 구슬
    ctx.font = '700 10px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    for (const m of marbles) {
      if (m.done || m.y < top || m.y > bottom) continue;
      ctx.beginPath();
      ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0,0,0,.25)';
      ctx.stroke();
      ctx.fillStyle = '#1d1b26';
      ctx.fillText(m.name.length > 4 ? m.name.slice(0, 4) : m.name, m.x, m.y - R - 3);
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0);
    lastT = now;
    const sub = 4;
    for (let i = 0; i < sub; i++) step(dt / sub);
    // 카메라: 아직 도착 안 한 구슬 중 가장 앞선 구슬을 따라감
    const live = marbles.filter((m) => !m.done);
    const rule = root.querySelector('input[name="rule"]:checked').value;
    const target = live.length
      ? (rule === 'last' && finished.length ? Math.min(...live.map((m) => m.y)) : Math.max(...live.map((m) => m.y)))
      : FINISH;
    const viewH = view.h / view.scale;
    const want = Math.max(0, Math.min(H - viewH, target - viewH * 0.45));
    camY += (want - camY) * Math.min(1, dt * 4);
    render();
    const winnerReady = rule === 'first' ? finished.length >= 1 : finished.length >= marbles.length - 1;
    if (winnerReady && !resultEl.dataset.shown) {
      const w = rule === 'first' ? finished[0] : live.length ? live[0] : finished[finished.length - 1];
      resultEl.dataset.shown = '1';
      resultEl.innerHTML = `🎉 <b>${esc(w.name)}</b> 당첨! ${rule === 'last' ? '(꼴등)' : '(1등 도착)'}`;
    }
    if (live.length === 0 || (Date.now() - startedAt > 90000)) {
      running = false;
      startBtn.disabled = false;
      startBtn.textContent = '다시 하기';
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  let startedAt = 0;
  function start() {
    const names = parseNames(ta.value, 50);
    if (names.length < 2) {
      resultEl.textContent = '참가자를 2명 이상 넣어 주세요.';
      return;
    }
    gameStore.save('marble', { names: ta.value, rule: root.querySelector('input[name="rule"]:checked').value });
    cancelAnimationFrame(raf);
    setup();
    delete resultEl.dataset.shown;
    running = true;
    startBtn.disabled = true;
    startedAt = Date.now();
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
  }

  // 점검용: 상태 보기, 시간을 빨리 돌리기 (화면 프레임과 상관없이 물리만 진행)
  canvas._state = () => ({ marbles, finished });
  canvas._advance = (sec) => {
    for (let t = 0; t < sec; t += 1 / 240) step(1 / 240);
    render();
  };
  startBtn.addEventListener('click', start);
  root.querySelector('[data-act="shuffle"]').addEventListener('click', () => {
    if (running) return;
    order = [];
    setup();
  });
  ta.addEventListener('input', () => {
    if (!running) {
      order = [];
      setup();
    }
  });
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  setup();
  resize();
  gameCleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
  };
}

/* ═════════════════════ 경주마 ═════════════════════ */

function renderHorse(root) {
  const saved = gameStore.get('horse') || { names: '번개\n질풍\n천둥\n바람\n별빛\n달빛' };
  root.innerHTML = `
    <div class="track" aria-label="경주로"></div>
    <p class="game-result" role="status">1등할 것 같은 말을 골라 주세요.</p>
    <div class="pick-row" role="radiogroup" aria-label="내 말 고르기"></div>
    <div class="game-actions">
      <button class="btn block" data-act="start" disabled>출발!</button>
      <button class="btn ghost block" data-act="reset">처음으로</button>
    </div>
    <label class="field">
      <span>말 이름 (2~10마리, 한 줄에 하나 또는 쉼표)</span>
      <textarea class="names" rows="5">${esc(saved.names)}</textarea>
    </label>`;
  const track = root.querySelector('.track');
  const picks = root.querySelector('.pick-row');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  const ta = root.querySelector('.names');
  let horses = [];
  let pick = -1;
  let raf = 0;
  let running = false;

  function setup() {
    cancelAnimationFrame(raf);
    running = false;
    const names = parseNames(ta.value, 10);
    horses = names.map((name, i) => ({ name, i, p: 0, v: 0.07, target: 0.07, next: 0, burst: 0, place: 0, color: gameColor(i, names.length) }));
    if (pick >= horses.length) pick = -1;
    track.innerHTML = horses
      .map(
        (h) => `
        <div class="lane">
          <span class="lane-no" style="background:${h.color}">${h.i + 1}</span>
          <div class="lane-run">
            <div class="horse" style="--x:0">
              <span class="horse-emoji" aria-hidden="true">🏇</span>
              <span class="horse-name">${esc(h.name)}</span>
            </div>
          </div>
          <span class="lane-place"></span>
        </div>`
      )
      .join('');
    picks.innerHTML = horses
      .map((h) => `<button class="chip" data-i="${h.i}" aria-pressed="${h.i === pick}" style="--c:${h.color}">${h.i + 1}. ${esc(h.name)}</button>`)
      .join('');
    picks.querySelectorAll('.chip').forEach((b) =>
      b.addEventListener('click', () => {
        if (running) return;
        pick = Number(b.dataset.i);
        picks.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
        resultEl.innerHTML = `<b>${esc(horses[pick].name)}</b>에게 걸었어요. 출발!을 눌러 주세요.`;
        startBtn.disabled = false;
      })
    );
    startBtn.disabled = pick < 0 || horses.length < 2;
    startBtn.textContent = '출발!';
    if (horses.length < 2) resultEl.textContent = '말을 2마리 이상 넣어 주세요.';
    else if (pick < 0) resultEl.textContent = '1등할 것 같은 말을 골라 주세요.';
  }

  function start() {
    if (pick < 0) return;
    gameStore.save('horse', { names: ta.value });
    horses.forEach((h) => {
      h.p = 0;
      h.v = 0.05 + Math.random() * 0.02;
      h.target = h.v;
      h.next = 0;
      h.burst = 0;
      h.place = 0;
    });
    track.querySelectorAll('.lane-place').forEach((el) => (el.textContent = ''));
    running = true;
    startBtn.disabled = true;
    resultEl.textContent = '두근두근…';
    let finished = 0;
    let last = performance.now();
    let t = 0;
    const els = [...track.querySelectorAll('.horse')];
    const places = [...track.querySelectorAll('.lane-place')];
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const lead = Math.max(...horses.map((h) => h.p));
      for (const h of horses) {
        if (h.place) continue;
        // 가끔 목표 속도를 바꾸고, 가끔 질주. 앞선 말은 아주 조금 느려져서 끝까지 엎치락뒤치락
        if (t >= h.next) {
          h.target = 0.045 + Math.random() * 0.075;
          if (Math.random() < 0.18) h.burst = 0.8 + Math.random() * 0.6;
          h.next = t + 0.35 + Math.random() * 0.7;
        }
        const catchUp = h.p < lead - 0.08 ? 1.12 : h.p >= lead ? 0.96 : 1;
        const want = h.target * catchUp * (h.burst > 0 ? 1.6 : 1);
        h.burst -= dt;
        h.v += (want - h.v) * Math.min(1, dt * 3);
        h.p += h.v * dt;
        if (h.p >= 1) {
          h.p = 1;
          h.place = ++finished;
          places[h.i].textContent = `${h.place}등`;
        }
        els[h.i].style.setProperty('--x', h.p.toFixed(4));
      }
      if (finished < horses.length) raf = requestAnimationFrame(loop);
      else end();
    };
    raf = requestAnimationFrame(loop);
  }

  function end() {
    running = false;
    const winner = horses.find((h) => h.place === 1);
    const mine = horses[pick];
    resultEl.innerHTML =
      mine.place === 1
        ? `🎉 적중! <b>${esc(mine.name)}</b>가 1등이에요!`
        : `아쉬워요! 1등은 <b>${esc(winner.name)}</b>, 내 말 ${esc(mine.name)}는 ${mine.place}등`;
    startBtn.disabled = false;
    startBtn.textContent = '한 번 더';
  }

  startBtn.addEventListener('click', start);
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    pick = -1;
    setup();
  });
  ta.addEventListener('input', () => {
    if (!running) setup();
  });
  setup();
  gameCleanup = () => cancelAnimationFrame(raf);
}
