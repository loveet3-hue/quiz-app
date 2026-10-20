// 뽑기 게임 4종: 구슬 추첨 · 경주마 · 사다리 타기 · 돌림판.
// 주소: /games/ (목록), /game/marble/ · /game/horse/ · /game/ladder/ · /game/wheel/
// 모든 게임에 '다시 시작' 버튼, 구슬·경주마는 3·2·1 카운트다운 + 중계 문구 + 막판 슬로모션.
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

// 3 · 2 · 1 · 출발! (끝나면 done 호출). 돌려주는 함수를 부르면 취소
function countdown(overlay, done) {
  const steps = ['3', '2', '1', '출발!'];
  let i = 0;
  let timer = 0;
  overlay.hidden = false;
  const show = () => {
    overlay.innerHTML = `<span class="count-num">${steps[i]}</span>`;
    i++;
    if (i < steps.length) timer = setTimeout(show, 750);
    else
      timer = setTimeout(() => {
        overlay.hidden = true;
        done();
      }, 500);
  };
  show();
  return () => {
    clearTimeout(timer);
    overlay.hidden = true;
  };
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
          <a class="card" href="/game/${g.id}/">
            <div class="cover"><img class="full" src="${g.cover()}" alt=""></div>
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
    nav('/games/');
    return;
  }
  document.title = `${game.title} · 맞혀봐`;
  app.innerHTML = `
    <div class="play-head">
      <button class="icon-btn" data-act="home" aria-label="게임 목록으로">←</button>
      <h1 class="page-title">${esc(game.title)}</h1>
    </div>
    <div class="game-body"></div>`;
  app.querySelector('[data-act="home"]').addEventListener('click', () => nav('/games/'));
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
    <p class="wheel-live" aria-hidden="true"></p>
    <p class="game-result" role="status">항목을 넣고 돌려 보세요.</p>
    <div class="game-actions">
      <button class="btn block" data-act="spin">돌리기</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <button class="btn ghost block" data-act="remove" hidden>당첨 항목 빼고 다시 돌리기</button>
    <label class="field">
      <span>항목 (한 줄에 하나, 또는 쉼표로 구분 · 최대 30개)</span>
      <textarea class="names" rows="6">${esc(saved.items)}</textarea>
    </label>`;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const ta = root.querySelector('.names');
  const resultEl = root.querySelector('.game-result');
  const liveEl = root.querySelector('.wheel-live');
  const pointer = root.querySelector('.wheel-pointer');
  const removeBtn = root.querySelector('[data-act="remove"]');
  const spinBtn = root.querySelector('[data-act="spin"]');
  let angle = 0;
  let spinning = false;
  let raf = 0;
  let lastWinner = -1;

  const items = () => parseNames(ta.value, 30);

  function draw(highlight = -1) {
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
      if (i === highlight) {
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fill();
      }
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
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#7c5cff';
    ctx.stroke();
  }

  // 위쪽 바늘이 가리키는 칸 번호
  function pointed() {
    const n = items().length;
    let a = (-Math.PI / 2 - angle) % (Math.PI * 2);
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
    // 7~9초 동안 6~9바퀴. 끝으로 갈수록 아주 천천히 (마지막 2초는 거의 멈출 듯 말 듯)
    const total = Math.PI * 2 * (6 + Math.random() * 3) + Math.random() * Math.PI * 2;
    const dur = 7000 + Math.random() * 2000;
    const t0 = performance.now();
    let lastIdx = pointed();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 5);
      angle = start + total * ease;
      const idx = pointed();
      if (idx !== lastIdx) {
        lastIdx = idx;
        pointer.classList.remove('tick');
        void pointer.offsetWidth;
        pointer.classList.add('tick');
      }
      liveEl.textContent = list[idx] || '';
      draw(idx);
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        spinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = '다시 돌리기';
        lastWinner = idx;
        liveEl.textContent = '';
        resultEl.innerHTML = `🎉 <b>${esc(list[lastWinner])}</b> 당첨!`;
        removeBtn.hidden = list.length <= 2;
      }
    };
    raf = requestAnimationFrame(step);
  }

  function reset() {
    cancelAnimationFrame(raf);
    spinning = false;
    angle = 0;
    lastWinner = -1;
    spinBtn.disabled = false;
    spinBtn.textContent = '돌리기';
    removeBtn.hidden = true;
    liveEl.textContent = '';
    resultEl.textContent = '항목을 넣고 돌려 보세요.';
    draw();
  }

  spinBtn.addEventListener('click', spin);
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
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
    if (!spinning) reset();
  });
  draw();
  gameCleanup = () => cancelAnimationFrame(raf);
}

/* ═════════════════════ 사다리 타기 ═════════════════════ */

function renderLadder(root) {
  const saved = gameStore.get('ladder') || { names: '철수\n영희\n민수\n지은', results: '당첨\n꽝\n꽝\n꽝' };
  root.innerHTML = `
    <div class="ladder-box"></div>
    <p class="game-result" role="status"></p>
    <div class="game-actions">
      <button class="btn block" data-act="all">모두 한 번에 타기</button>
      <button class="btn ghost block" data-act="make">새 사다리 (다시 시작)</button>
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
  let rafs = [];

  const clearAll = () => {
    timers.forEach(clearTimeout);
    rafs.forEach(cancelAnimationFrame);
    timers = [];
    rafs = [];
  };

  function make() {
    clearAll();
    const names = parseNames(root.querySelector('.names').value, 20);
    if (names.length < 2) {
      box.innerHTML = '';
      resultEl.textContent = '참가자를 2명 이상 넣어 주세요.';
      return;
    }
    let results = parseNames(root.querySelector('.results').value, 20);
    if (!results.length) results = ['당첨'];
    while (results.length < names.length) results.push('꽝');
    results = results.slice(0, names.length);
    // 결과 순서도 섞어서, 어디가 당첨 자리인지 미리 알 수 없게
    for (let i = results.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [results[i], results[j]] = [results[j], results[i]];
    }
    gameStore.save('ladder', { names: root.querySelector('.names').value, results: root.querySelector('.results').value });

    const n = names.length;
    const ROWS = 10 + n;
    const rungs = Array.from({ length: ROWS }, () => Array(n - 1).fill(false));
    for (let r = 0; r < ROWS; r++) {
      for (let i = 0; i < n - 1; i++) {
        if (!(i > 0 && rungs[r][i - 1]) && Math.random() < 0.45) rungs[r][i] = true;
      }
    }
    for (let i = 0; i < n - 1; i++) {
      if (!rungs.some((row) => row[i])) {
        const r = Math.floor(Math.random() * ROWS);
        rungs[r][i] = true;
        if (i > 0) rungs[r][i - 1] = false;
        if (i < n - 2) rungs[r][i + 1] = false;
      }
    }
    ladder = { names, results, rungs, n, ROWS, done: new Set(), busy: new Set() };
    drawLadder();
    resultEl.textContent = '이름을 누르면 사다리를 타요. 가운데는 가려져 있어요!';
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
    // 가운데를 가리는 막 (첫 출발 때 걷힘)
    svg += `<g class="lad-veil"><rect x="0" y="${y(0) - 14}" width="${W}" height="${y(ROWS - 1) - y(0) + 28}" rx="10"/>
      <text x="${W / 2}" y="${(y(0) + y(ROWS - 1)) / 2 + 8}" text-anchor="middle">? ? ?</text></g>`;
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

  // 점이 사다리를 따라 천천히 내려가고, 도착하면 결과가 열림
  function ride(start, quiet) {
    if (!ladder || ladder.done.has(start) || ladder.busy.has(start)) return;
    ladder.busy.add(start);
    box.querySelector('.lad-veil')?.classList.add('gone');
    const { steps, end } = pathOf(start);
    const { x, y } = ladder.geom;
    const pts = steps.map((s) => `${x(s.c)},${s.r < 0 ? 40 : y(s.r)}`).join(' ');
    const g = box.querySelector('.lad-paths');
    const color = gameColor(start, ladder.n);
    g.insertAdjacentHTML(
      'beforeend',
      `<polyline points="${pts}" class="lad-path" style="stroke:${color}"/><circle r="9" class="lad-dot" style="fill:${color}"/>`
    );
    const line = g.querySelector('polyline:last-of-type');
    const dot = g.querySelector('circle:last-of-type');
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    const dur = 3200;
    const t0 = performance.now();
    if (!quiet) resultEl.innerHTML = `<b>${esc(ladder.names[start])}</b> 출발! 어디로 갈까…`;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // 천천히 출발 → 빨라졌다 → 천천히 도착
      line.style.strokeDashoffset = len * (1 - e);
      const p = line.getPointAtLength(len * e);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      if (t < 1) rafs.push(requestAnimationFrame(step));
      else {
        const res = box.querySelector(`.lad-res[data-c="${end}"]`);
        res.classList.add('open');
        res.querySelector('rect').style.fill = color;
        const label = ladder.results[end];
        res.querySelector('text').textContent = label.length > 5 ? label.slice(0, 4) + '…' : label;
        ladder.done.add(start);
        ladder.busy.delete(start);
        if (!quiet) resultEl.innerHTML = `<b>${esc(ladder.names[start])}</b> → <b>${esc(label)}</b>${/당첨|win/i.test(label) ? ' 🎉' : ''}`;
        if (ladder.done.size === ladder.n) showAll();
      }
    };
    rafs.push(requestAnimationFrame(step));
  }

  function showAll() {
    const lines = ladder.names.map((name, c) => {
      const r = ladder.results[pathOf(c).end];
      return `${esc(name)} → <b>${esc(r)}</b>${/당첨/.test(r) ? ' 🎉' : ''}`;
    });
    resultEl.innerHTML = lines.join('<br>');
  }

  root.querySelector('[data-act="make"]').addEventListener('click', make);
  allBtn.addEventListener('click', () => {
    if (!ladder) return;
    allBtn.disabled = true;
    resultEl.textContent = '다 같이 출발!';
    ladder.names.forEach((_, c) => timers.push(setTimeout(() => ride(c, true), c * 500)));
  });
  make();
  gameCleanup = clearAll;
}

/* ═════════════════════ 구슬 추첨 ═════════════════════ */

function renderMarble(root) {
  const saved = gameStore.get('marble') || { names: '철수\n영희\n민수\n지은\n현우\n서연', rule: 'first' };
  root.innerHTML = `
    <div class="marble-stage">
      <canvas class="marble-canvas" aria-label="구슬 추첨 화면"></canvas>
      <ol class="marble-rank" aria-label="현재 순위"></ol>
      <div class="count-overlay" hidden></div>
      <div class="slowmo" hidden>슬로모션</div>
    </div>
    <p class="game-result" role="status">참가자를 넣고 시작을 눌러 주세요.</p>
    <div class="game-actions">
      <button class="btn block" data-act="start">시작</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <div class="rule-row" role="radiogroup" aria-label="당첨 기준">
      <label><input type="radio" name="rule" value="first" ${saved.rule !== 'last' ? 'checked' : ''}> 1등으로 도착하면 당첨</label>
      <label><input type="radio" name="rule" value="last" ${saved.rule === 'last' ? 'checked' : ''}> 꼴등이 당첨</label>
      <button class="link-btn" data-act="shuffle">출발 자리 섞기</button>
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
  const overlay = root.querySelector('.count-overlay');
  const slowEl = root.querySelector('.slowmo');
  const ta = root.querySelector('.names');
  const rule = () => root.querySelector('input[name="rule"]:checked').value;

  // ── 맵 (월드 좌표: 폭 360) ──
  // 핀 밭은 적당히 빠르게 내려오고, 마지막 '허우적 방'에서 큰 막대에 휘둘리다 좁은 구멍으로 빠져나감
  const W = 360;
  const R = 8.5;
  const FINISH = 1750;
  const H = FINISH + 120;
  const FUNNEL = FINISH - 420; // 깔때기 시작
  const ROOM_TOP = FINISH - 230; // 허우적 방 위쪽
  const FLOOR = FINISH - 60; // 방 바닥 (가운데 구멍)
  const ROOM = 92; // 방 반폭
  const pegs = [];
  const segs = [];
  const spinners = [];
  const bumps = []; // 벽 턱 위치 (그 근처엔 핀을 두지 않음)
  segs.push({ x1: 0, y1: -400, x2: 0, y2: FUNNEL }, { x1: W, y1: -400, x2: W, y2: FUNNEL });
  // 벽 턱: 벽에 붙어 미끄러지는 구슬을 안쪽으로 튕김 (왼쪽·오른쪽 번갈아)
  for (let y = 260, k = 0; y < FUNNEL - 120; y += 170, k++) {
    const left = k % 2 === 0;
    const x0 = left ? 0 : W;
    const tip = left ? 34 : W - 34;
    segs.push({ x1: x0, y1: y, x2: tip, y2: y + 26 }, { x1: tip, y1: y + 26, x2: x0, y2: y + 52 });
    bumps.push({ y: y + 26, left });
  }
  for (let row = 0, y = 230; y < FUNNEL - 50; row++, y += 44) {
    const off = row % 2 ? 22 : 0;
    for (let x = 40 + off; x <= W - 40; x += 44) {
      if (spinners.some((s) => Math.abs(s.cy - y) < 50 && Math.abs(s.cx - x) < s.len / 2 + 14)) continue;
      if (bumps.some((b) => Math.abs(b.y - y) < 60 && (b.left ? x < 84 : x > W - 84))) continue;
      pegs.push({ x, y, r: 4.5, bounce: 0.6 });
    }
    if (row % 8 === 4) {
      spinners.push({ cx: 100, cy: y + 22, len: 84, a: Math.random() * 3, w: 2.6 }, { cx: 260, cy: y + 22, len: 84, a: Math.random() * 3, w: -2.6 });
    }
    if (row % 8 === 0 && row > 0) {
      pegs.push({ x: W / 2, y: y + 22, r: 15, bounce: 1.1, bumper: true });
    }
  }
  for (let i = pegs.length - 1; i >= 0; i--) {
    const p = pegs[i];
    if (!p.bumper && pegs.some((b) => b.bumper && Math.hypot(b.x - p.x, b.y - p.y) < 44)) pegs.splice(i, 1);
  }
  // 깔때기 → 허우적 방
  segs.push(
    { x1: 0, y1: FUNNEL, x2: W / 2 - ROOM, y2: ROOM_TOP },
    { x1: W, y1: FUNNEL, x2: W / 2 + ROOM, y2: ROOM_TOP },
    { x1: W / 2 - ROOM, y1: ROOM_TOP, x2: W / 2 - ROOM, y2: FLOOR - 34 },
    { x1: W / 2 + ROOM, y1: ROOM_TOP, x2: W / 2 + ROOM, y2: FLOOR - 34 }
  );
  // 방 바닥: 가운데로 살짝 기울고 구멍이 뚫림. 구멍 폭은 hole(반폭)로 조절 — 첫 구슬이 나간 뒤 점점 넓어짐
  const HOLE_MIN = 13;
  let hole = HOLE_MIN;
  const floorL = { x1: W / 2 - ROOM, y1: FLOOR - 34, x2: W / 2 - hole, y2: FLOOR };
  const floorR = { x1: W / 2 + ROOM, y1: FLOOR - 34, x2: W / 2 + hole, y2: FLOOR };
  segs.push(floorL, floorR);
  const setHole = (h) => {
    hole = h;
    floorL.x2 = W / 2 - h;
    floorR.x2 = W / 2 + h;
  };
  // 방을 휘젓는 큰 막대 (구멍 바로 위)
  spinners.push({ cx: W / 2, cy: FLOOR - 62, len: ROOM * 2 - 22, a: 0, w: 1.9, gate: true });
  // 구멍 아래 짧은 통로
  segs.push({ x1: W / 2 - 22, y1: FLOOR + 6, x2: W / 2 - 22, y2: FINISH + 20 }, { x1: W / 2 + 22, y1: FLOOR + 6, x2: W / 2 + 22, y2: FINISH + 20 });

  let marbles = [];
  let finished = [];
  let running = false;
  let raf = 0;
  let camY = 0;
  let view = { scale: 1, w: 360, h: 480 };
  let lastT = 0;
  let order = [];
  let cancelCount = null;
  let leaderName = '';
  let lastCall = 0;
  let timeScale = 1;
  let rankTick = 0;
  let startedAt = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    view = { scale: (rect.width / W) * dpr, w: rect.width * dpr, h: rect.height * dpr, dpr };
    render();
  }

  function shuffleArr(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
    sinceFirst = -1;
    setHole(HOLE_MIN);
    rankEl.innerHTML = '';
    camY = 0;
    leaderName = '';
    timeScale = 1;
    slowEl.hidden = true;
    render();
  }

  // ── 물리 ──
  const G = 950;
  const MAXV = 700;
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
      m.vx += (Math.random() - 0.5) * 18;
    }
  }
  function collideSeg(m, s, bounce, svx = 0, svy = 0) {
    const ex = s.x2 - s.x1;
    const ey = s.y2 - s.y1;
    const l2 = ex * ex + ey * ey;
    let t = ((m.x - s.x1) * ex + (m.y - s.y1) * ey) / l2;
    t = Math.max(0, Math.min(1, t));
    collideCircle(m, s.x1 + ex * t, s.y1 + ey * t, 2, bounce, svx, svy);
  }

  let sinceFirst = -1; // 첫 구슬이 나간 뒤 흐른 시간
  function step(dt) {
    spinners.forEach((s) => (s.a += s.w * dt));
    if (finished.length && sinceFirst < 0) sinceFirst = 0;
    if (sinceFirst >= 0) {
      sinceFirst += dt;
      // 첫 구슬이 나가고 3초 뒤부터 4초마다 조금씩 넓어짐 (꼴찌 정할 때 너무 오래 걸리지 않게)
      setHole(Math.min(40, HOLE_MIN + Math.max(0, Math.floor((sinceFirst - 3) / 4) + 1) * 5 * (sinceFirst > 3 ? 1 : 0)));
    }
    for (const m of marbles) {
      if (m.done) continue;
      m.vy += G * dt;
      const sp = Math.hypot(m.vx, m.vy);
      if (sp > MAXV) {
        m.vx *= MAXV / sp;
        m.vy *= MAXV / sp;
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
        const tx = m.x - s.cx;
        const ty = m.y - s.cy;
        collideSeg(m, { x1: s.cx - dx, y1: s.cy - dy, x2: s.cx + dx, y2: s.cy + dy }, 0.4, -ty * s.w, tx * s.w);
      }
      if (m.x < R) m.x = R;
      if (m.x > W - R) m.x = W - R;
      if (sp < 12) m.still += dt;
      else m.still = 0;
      if (m.still > 1.2) {
        const toCenter = m.x < 60 ? 1 : m.x > W - 60 ? -1 : Math.random() < 0.5 ? -1 : 1;
        m.vx += toCenter * (120 + Math.random() * 160);
        m.vy -= 140;
        m.still = 0;
        m.kicks = (m.kicks || 0) + 1;
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
      }
    }
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

  // 지금 순위: 도착한 순서 → 아직 달리는 구슬은 앞선 순
  function standings() {
    const live = marbles.filter((m) => !m.done).sort((a, b) => b.y - a.y);
    return [...finished, ...live];
  }

  function updateRank() {
    const list = standings();
    const show = list.slice(0, 8);
    rankEl.innerHTML =
      show.map((m) => `<li class="${m.done ? 'done' : ''}" style="--c:${m.color}">${esc(m.name)}</li>`).join('') +
      (list.length > 8 ? `<li class="more">외 ${list.length - 8}명</li>` : '');
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
    ctx.fillStyle = '#7c5cff';
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, FINISH, W, 60);
    ctx.globalAlpha = 1;
    ctx.font = '700 14px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('도착', W / 2, FINISH + 32);
    for (const p of pegs) {
      if (p.y < top || p.y > bottom) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.bumper ? '#ff8c42' : '#8f8aa3';
      ctx.fill();
    }
    ctx.strokeStyle = '#5f5b70';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const s of segs) {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    for (const s of spinners) {
      if (s.cy < top - 80 || s.cy > bottom + 80) continue;
      ctx.strokeStyle = s.gate ? '#ff4f5e' : '#7c5cff';
      ctx.lineWidth = s.gate ? 8 : 5;
      const dx = (Math.cos(s.a) * s.len) / 2;
      const dy = (Math.sin(s.a) * s.len) / 2;
      ctx.beginPath();
      ctx.moveTo(s.cx - dx, s.cy - dy);
      ctx.lineTo(s.cx + dx, s.cy + dy);
      ctx.stroke();
    }
    ctx.font = '700 10px Pretendard, sans-serif';
    for (const m of marbles) {
      if (m.done || m.y < top || m.y > bottom) continue;
      ctx.beginPath();
      ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0,0,0,.25)';
      ctx.stroke();
      // 이름: 흰 글씨 + 진한 테두리 (밝은·어두운 화면 모두 잘 보이게)
      const label = m.name.length > 4 ? m.name.slice(0, 4) : m.name;
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(20,16,36,.85)';
      ctx.strokeText(label, m.x, m.y - R - 3);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, m.x, m.y - R - 3);
    }
  }

  // 중계 문구 + 슬로모션 판단
  function commentate(now) {
    const live = marbles.filter((m) => !m.done).sort((a, b) => b.y - a.y);
    const r = rule();
    timeScale = 1;
    if (r === 'first' && finished.length === 0 && live.length > 1) {
      const [a, b] = live;
      if (a.y > FLOOR - 40 && b.y > ROOM_TOP) timeScale = 0.45; // 방에서 구멍 직전, 둘 이상 남았을 때
      if (a.name !== leaderName && now - lastCall > 900) {
        resultEl.innerHTML = leaderName ? `🔥 역전! <b>${esc(a.name)}</b> 선두!` : `<b>${esc(a.name)}</b> 앞서 나가요!`;
        leaderName = a.name;
        lastCall = now;
      } else if (a.y > ROOM_TOP && now - lastCall > 1600) {
        const inRoom = live.filter((m) => m.y > ROOM_TOP).length;
        resultEl.innerHTML = `마지막 방! ${inRoom}개가 허우적… <b>${esc(a.name)}</b>${live[1] ? ` vs <b>${esc(live[1].name)}</b>` : ''}`;
        lastCall = now;
      }
    } else if (r === 'last' && live.length > 0) {
      const lastOne = live[live.length - 1];
      if (live.length <= 2 && live[0].y > FLOOR - 40) timeScale = 0.45;
      if (now - lastCall > 1200) {
        resultEl.innerHTML =
          live.length <= 3 ? `남은 구슬 ${live.length}개… 꼴찌는 누구? (지금 꼴찌 <b>${esc(lastOne.name)}</b>)` : `지금 꼴찌는 <b>${esc(lastOne.name)}</b>`;
        lastCall = now;
      }
    }
    slowEl.hidden = timeScale === 1;
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0) * timeScale;
    lastT = now;
    for (let i = 0; i < 4; i++) step(dt / 4);
    commentate(now);
    const live = marbles.filter((m) => !m.done);
    const r = rule();
    const target = live.length
      ? r === 'last' && finished.length
        ? Math.min(...live.map((m) => m.y))
        : Math.max(...live.map((m) => m.y))
      : FINISH;
    const viewH = view.h / view.scale;
    const want = Math.max(0, Math.min(H - viewH, target - viewH * 0.45));
    camY += (want - camY) * Math.min(1, ((now - (loop.prev || now)) / 1000) * 4 || 0.06);
    loop.prev = now;
    render();
    if (now - rankTick > 300) {
      updateRank();
      rankTick = now;
    }
    const winnerReady = r === 'first' ? finished.length >= 1 : finished.length >= marbles.length - 1;
    if (winnerReady && !resultEl.dataset.shown) {
      const w = r === 'first' ? finished[0] : live.length ? live[0] : finished[finished.length - 1];
      resultEl.dataset.shown = '1';
      resultEl.innerHTML = `🎉 <b>${esc(w.name)}</b> 당첨! ${r === 'last' ? '(꼴찌)' : '(1등 도착)'}`;
      slowEl.hidden = true;
    }
    if (live.length === 0 || Date.now() - startedAt > 180000) {
      running = false;
      updateRank();
      startBtn.disabled = false;
      startBtn.textContent = '한 번 더';
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    const names = parseNames(ta.value, 50);
    if (names.length < 2) {
      resultEl.textContent = '참가자를 2명 이상 넣어 주세요.';
      return;
    }
    gameStore.save('marble', { names: ta.value, rule: rule() });
    stop();
    setup();
    delete resultEl.dataset.shown;
    startBtn.disabled = true;
    resultEl.textContent = '준비…';
    cancelCount = countdown(overlay, () => {
      cancelCount = null;
      running = true;
      startedAt = Date.now();
      lastT = performance.now();
      loop.prev = 0;
      resultEl.textContent = '출발!';
      raf = requestAnimationFrame(loop);
    });
  }

  function stop() {
    cancelAnimationFrame(raf);
    if (cancelCount) cancelCount();
    cancelCount = null;
    running = false;
  }

  function reset() {
    stop();
    setup();
    delete resultEl.dataset.shown;
    startBtn.disabled = false;
    startBtn.textContent = '시작';
    resultEl.textContent = '참가자를 넣고 시작을 눌러 주세요.';
  }

  startBtn.addEventListener('click', start);
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
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
  // 점검용: 상태 보기, 시간을 빨리 돌리기 (화면 프레임과 상관없이 물리만 진행)
  canvas._state = () => ({ marbles, finished });
  canvas._advance = (sec) => {
    for (let t = 0; t < sec; t += 1 / 240) step(1 / 240);
    render();
  };
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  setup();
  resize();
  gameCleanup = () => {
    stop();
    window.removeEventListener('resize', onResize);
  };
}

/* ═════════════════════ 경주마 ═════════════════════ */

// 말마다 한눈에 구분되는 몸 색 / 갈기 색
const HORSE_COLORS = [
  { color: '#ff8a7a', mane: '#c2413a' },
  { color: '#ffd166', mane: '#c98a00' },
  { color: '#7ad98f', mane: '#2f9a55' },
  { color: '#6fc8ff', mane: '#2a7fc4' },
  { color: '#b79bff', mane: '#6c4bd8' },
  { color: '#ff9ad5', mane: '#c4458f' },
  { color: '#f4f1ea', mane: '#8a7a66' },
  { color: '#a87b5a', mane: '#5a3a24' },
  { color: '#9aa3b5', mane: '#4a5266' },
  { color: '#ffb36b', mane: '#c4661a' },
];

// 귀여운 말 (오른쪽을 봄). 다리는 달릴 때 움직임
function horseSvg(h) {
  return `<svg class="pony" viewBox="0 0 66 52" width="58" height="46" aria-hidden="true" style="--c:${h.color};--m:${h.mane}">
    <path class="tail" d="M13 22c-7-2-11 4-9 11 1-4 4-6 8-5" fill="var(--m)"/>
    <g class="leg-b"><rect x="15" y="31" width="6" height="15" rx="3" fill="var(--c)"/><rect x="15" y="42" width="6" height="5" rx="2" fill="#4a3b33"/></g>
    <g class="leg-b2"><rect x="23" y="31" width="6" height="14" rx="3" fill="var(--c)" opacity=".8"/><rect x="23" y="41" width="6" height="5" rx="2" fill="#4a3b33" opacity=".8"/></g>
    <g class="leg-f"><rect x="36" y="31" width="6" height="15" rx="3" fill="var(--c)"/><rect x="36" y="42" width="6" height="5" rx="2" fill="#4a3b33"/></g>
    <g class="leg-f2"><rect x="43" y="31" width="6" height="14" rx="3" fill="var(--c)" opacity=".8"/><rect x="43" y="41" width="6" height="5" rx="2" fill="#4a3b33" opacity=".8"/></g>
    <ellipse cx="31" cy="27" rx="20" ry="12" fill="var(--c)"/>
    <path d="M42 20c2-8 6-12 12-12l2 13-12 6z" fill="var(--c)"/>
    <ellipse cx="53" cy="15" rx="10" ry="9" fill="var(--c)"/>
    <ellipse cx="60" cy="19" rx="5.5" ry="4.5" fill="#fff" opacity=".55"/>
    <circle cx="61" cy="18.5" r="0.9" fill="#4a3b33"/>
    <path d="M47 8l2-7 4 6z" fill="var(--c)"/>
    <path d="M44 9c-4 3-5 8-4 13l4-2c-1-4 0-8 3-10z" fill="var(--m)"/>
    <path d="M47 6c2-2 5-2 7 0-2 1-5 1-7 0z" fill="var(--m)"/>
    <circle cx="53.5" cy="13" r="2.4" fill="#2d2440"/>
    <circle cx="54.3" cy="12.2" r="0.8" fill="#fff"/>
    <ellipse cx="56" cy="18" rx="2.2" ry="1.4" fill="#ff7aa8" opacity=".7"/>
    <rect x="23" y="17" width="14" height="11" rx="3" fill="#fff"/>
    <text x="30" y="25.5" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="9" font-weight="700" fill="#2d2440">${h.i + 1}</text>
  </svg>`;
}

function renderHorse(root) {
  const saved = gameStore.get('horse') || { names: '번개\n질풍\n천둥\n바람\n별빛\n달빛' };
  root.innerHTML = `
    <div class="track-wrap">
      <div class="track" aria-label="경주로"></div>
      <div class="count-overlay" hidden></div>
      <div class="slowmo" hidden>슬로모션</div>
    </div>
    <p class="game-result" role="status">1등할 것 같은 말을 골라 주세요.</p>
    <div class="pick-row" role="radiogroup" aria-label="내 말 고르기"></div>
    <div class="game-actions">
      <button class="btn block" data-act="start" disabled>출발!</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <label class="field">
      <span>말 이름 (2~10마리, 한 줄에 하나 또는 쉼표)</span>
      <textarea class="names" rows="5">${esc(saved.names)}</textarea>
    </label>`;
  const track = root.querySelector('.track');
  const picks = root.querySelector('.pick-row');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  const overlay = root.querySelector('.count-overlay');
  const slowEl = root.querySelector('.slowmo');
  const ta = root.querySelector('.names');
  let horses = [];
  let pick = -1;
  let raf = 0;
  let running = false;
  let cancelCount = null;

  function setup() {
    stop();
    const names = parseNames(ta.value, 10);
    horses = names.map((name, i) => ({ name, i, p: 0, v: 0, target: 0, next: 0, burst: 0, place: 0, ...HORSE_COLORS[i % HORSE_COLORS.length] }));
    if (pick >= horses.length) pick = -1;
    track.innerHTML = horses
      .map(
        (h) => `
        <div class="lane${h.i === pick ? ' mine' : ''}">
          <span class="lane-no" style="background:${h.color}">${h.i + 1}</span>
          <div class="lane-run">
            <div class="horse" style="--x:0">
              ${horseSvg(h)}
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
        if (running || cancelCount) return;
        pick = Number(b.dataset.i);
        picks.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
        track.querySelectorAll('.lane').forEach((l, i) => l.classList.toggle('mine', i === pick));
        resultEl.innerHTML = `<b>${pick + 1}번 ${esc(horses[pick].name)}</b>에게 걸었어요. 출발!을 눌러 주세요.`;
        startBtn.disabled = false;
      })
    );
    startBtn.disabled = pick < 0 || horses.length < 2;
    startBtn.textContent = '출발!';
    slowEl.hidden = true;
    if (horses.length < 2) resultEl.textContent = '말을 2마리 이상 넣어 주세요.';
    else if (pick < 0) resultEl.textContent = '1등할 것 같은 말을 골라 주세요.';
    else resultEl.innerHTML = `<b>${pick + 1}번 ${esc(horses[pick].name)}</b>에게 걸었어요. 출발!을 눌러 주세요.`;
  }

  function stop() {
    cancelAnimationFrame(raf);
    if (cancelCount) cancelCount();
    cancelCount = null;
    running = false;
    track.classList.remove('running');
  }

  function start() {
    if (pick < 0) return;
    gameStore.save('horse', { names: ta.value });
    stop();
    horses.forEach((h) => {
      h.p = 0;
      h.v = 0;
      h.target = 0.085 + Math.random() * 0.01;
      h.next = 0;
      h.burst = 0;
      h.place = 0;
    });
    track.querySelectorAll('.horse').forEach((el) => el.style.setProperty('--x', 0));
    track.querySelectorAll('.lane-place').forEach((el) => (el.textContent = ''));
    startBtn.disabled = true;
    resultEl.textContent = '준비…';
    cancelCount = countdown(overlay, () => {
      cancelCount = null;
      race();
    });
  }

  function race() {
    running = true;
    track.classList.add('running');
    let finished = 0;
    let last = performance.now();
    let t = 0;
    let leader = -1;
    let lastCall = 0;
    let said = { half: false, stretch: false };
    const els = [...track.querySelectorAll('.horse')];
    const places = [...track.querySelectorAll('.lane-place')];
    resultEl.textContent = '출발!';
    const loop = (now) => {
      const sorted = horses.filter((h) => !h.place).sort((a, b) => b.p - a.p);
      const lead = sorted.length ? sorted[0].p : 1;
      // 막판 접전이면 슬로모션
      const close = sorted.length > 1 && lead > 0.9 && sorted[0].p - sorted[1].p < 0.03 && finished === 0;
      const scale = close ? 0.35 : 1;
      slowEl.hidden = !close;
      const dt = Math.min(0.05, (now - last) / 1000) * scale;
      last = now;
      t += dt;
      for (const h of horses) {
        if (h.place) continue;
        // 목표 속도를 자주 바꾸고 가끔 질주. 앞선 말은 조금 느려지고 뒤처진 말은 따라붙어서 끝까지 엎치락뒤치락
        if (t >= h.next) {
          h.target = 0.06 + Math.random() * 0.06; // 약 10~12초 경주
          if (Math.random() < 0.2) h.burst = 0.7 + Math.random() * 0.7;
          h.next = t + 0.3 + Math.random() * 0.6;
        }
        const catchUp = h.p < lead - 0.08 ? 1.15 : h.p >= lead ? 0.95 : 1;
        const want = h.target * catchUp * (h.burst > 0 ? 1.55 : 1);
        h.burst -= dt;
        h.v += (want - h.v) * Math.min(1, dt * 3.5);
        h.p += h.v * dt;
        if (h.p >= 1) {
          h.p = 1;
          h.place = ++finished;
          places[h.i].textContent = `${h.place}등`;
        }
        els[h.i].style.setProperty('--x', h.p.toFixed(4));
      }
      // 중계
      if (finished === 0 && sorted.length) {
        const top = sorted[0];
        if (top.i !== leader && now - lastCall > 1300) {
          resultEl.innerHTML = leader < 0 ? `<b>${top.i + 1}번 ${esc(top.name)}</b> 먼저 치고 나가요!` : `🔥 역전! <b>${top.i + 1}번 ${esc(top.name)}</b> 선두!`;
          leader = top.i;
          lastCall = now;
        } else if (!said.half && lead > 0.5) {
          resultEl.innerHTML = `반환점 통과! 선두는 <b>${top.i + 1}번 ${esc(top.name)}</b>`;
          said.half = true;
          lastCall = now;
        } else if (!said.stretch && lead > 0.82) {
          resultEl.innerHTML = `마지막 직선! <b>${top.i + 1}번</b> vs <b>${sorted[1] ? sorted[1].i + 1 + '번' : ''}</b>`;
          said.stretch = true;
          lastCall = now;
        }
      }
      if (finished < horses.length) raf = requestAnimationFrame(loop);
      else end();
    };
    raf = requestAnimationFrame(loop);
  }

  function end() {
    running = false;
    track.classList.remove('running');
    slowEl.hidden = true;
    const winner = horses.find((h) => h.place === 1);
    const mine = horses[pick];
    resultEl.innerHTML =
      mine.place === 1
        ? `🎉 적중! <b>${mine.i + 1}번 ${esc(mine.name)}</b> 1등!`
        : `아쉬워요! 1등은 <b>${winner.i + 1}번 ${esc(winner.name)}</b>, 내 말은 ${mine.place}등`;
    startBtn.disabled = false;
    startBtn.textContent = '한 번 더';
  }

  startBtn.addEventListener('click', start);
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    pick = -1;
    setup();
  });
  ta.addEventListener('input', () => {
    if (!running && !cancelCount) setup();
  });
  setup();
  gameCleanup = stop;
}
