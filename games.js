// 뽑기 게임 9종: 구슬 추첨 · 경주마 · 사다리 타기 · 돌림판 · 제비뽑기 · 폭탄 돌리기 · 팀 나누기 · 롤 내전 팀 짜기 · 주사위·동전.
// 주소: /games/ (목록), /game/<게임 id>/
// 모든 게임에 '다시 시작' 버튼, 구슬·경주마는 3·2·1 카운트다운 + 중계 문구 + 막판 슬로모션.
'use strict';

const GAMES = [
  { id: 'marble', title: '구슬 추첨', desc: '구슬이 굴러 내려가는 순서로 뽑기', cover: () => COVERS['game-marble'] },
  { id: 'horse', title: '경주마', desc: '1등할 말을 골라 맞혀 보세요', cover: () => COVERS['game-horse'] },
  { id: 'ladder', title: '사다리 타기', desc: '누가 당첨일까? 길을 따라가 보세요', cover: () => COVERS['game-ladder'] },
  { id: 'wheel', title: '돌림판 · 복불복 룰렛', desc: '이름·메뉴·벌칙을 넣고 돌려서 뽑기', cover: () => COVERS['game-wheel'] },
  { id: 'lots', title: '제비뽑기', desc: '종이를 하나씩 펼쳐서 당첨 찾기', cover: () => COVERS['game-lots'] },
  { id: 'bomb', title: '폭탄 돌리기', desc: '폰을 돌리다 터지면 벌칙!', cover: () => COVERS['game-bomb'] },
  { id: 'teams', title: '팀 나누기', desc: '이름만 넣으면 공평하게 팀 배정', cover: () => COVERS['game-teams'] },
  { id: 'memory', title: '카드 짝 맞추기', desc: '같은 그림 두 장을 찾아 뒤집기, 혼자 또는 2인 대결', cover: () => COVERS['game-memory'] },
  { id: 'apple', title: '사과 게임', desc: '숫자 합이 10이 되게 묶어서 사과 지우기', cover: () => COVERS['game-apple'] },
  { id: 'balance', title: '균형 잡기', desc: '황새가 외나무다리를 오래 걷게 균형을 잡아요', cover: () => COVERS['game-balance'] },
  { id: 'liar', title: '라이어 게임', desc: '한 명만 제시어를 몰라요. 라이어를 찾아라!', cover: () => COVERS['game-liar'] },
  { id: 'mini', title: '10초 미니게임 대결', desc: '연타·반응속도·10초 맞히기, 꼴찌는 벌칙', cover: () => COVERS['game-mini'] },
  { id: 'croc', title: '악어 룰렛', desc: '이빨을 번갈아 누르다 물리면 당첨!', cover: () => COVERS['game-croc'] },
  { id: 'lol', title: '롤 내전 팀 짜기', desc: '블루·레드 팀을 라인별로 섞기', cover: () => COVERS['game-lol'] },
  { id: 'dice', title: '주사위·동전', desc: '주사위 굴리기와 동전 던지기', cover: () => COVERS['game-dice'] },
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

// 휴대폰: 게임을 시작하면 판이 메뉴 바로 아래에 오게 화면을 내려 줌 (시작 버튼이 판 아래에 있어도 판이 보이게)
function focusBoard(el) {
  if (!el || window.innerWidth > 760) return;
  const y = el.getBoundingClientRect().top + window.scrollY - (document.querySelector('.topbar')?.offsetHeight || 56) - 8;
  if (Math.abs(window.scrollY - y) > 24) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

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

// 새로 나온 게임 (홈 '새로 나온 게임' 줄과 NEW 표시)
const NEW_GAMES = ['memory', 'apple', 'balance', 'liar', 'mini', 'croc'];

// 게임 참여 수는 퀴즈와 같은 집계 서버에 'game-<id>'로 셈 (하루 한 번, 익명)
const gamePlays = (plays, g) => plays['game-' + g.id] || 0;
function popularGames(plays, n) {
  const order = new Map(GAMES.map((g, i) => [g.id, i]));
  return [...GAMES].sort((a, b) => gamePlays(plays, b) - gamePlays(plays, a) || order.get(a.id) - order.get(b.id)).slice(0, n);
}

function gameCardHtml(g, { rank, plays = {} } = {}) {
  const n = gamePlays(plays, g);
  return `
    <a class="card" href="/game/${g.id}/">
      <div class="cover"><img class="full" src="${g.cover()}" alt="">${NEW_GAMES.includes(g.id) ? '<span class="new-tag">NEW</span>' : ''}${
        rank ? `<span class="rank-no">${rank}</span>` : ''
      }</div>
      <div class="card-body">
        <h2 class="card-title">${esc(g.title)}</h2>
        <div class="card-meta">${esc(g.desc)}${n ? ` · 참여 ${fmtCount(n)}` : ''}</div>
      </div>
    </a>`;
}

function renderGamesHome() {
  document.title = '게임 · 맞혀봐';
  const draw = () => {
    const grid = app.querySelector('.games-grid');
    if (grid) grid.innerHTML = GAMES.map((g) => gameCardHtml(g, { plays: counts.get() })).join('');
  };
  app.innerHTML = `
    <div class="games-home">
      <section class="hero">
        <h1>모일 때 꼭 필요한<br>뽑기 게임</h1>
        <p>누가 쏠지, 누가 갈지 공정하게 정해 보세요</p>
      </section>
      <div class="games-grid"></div>
    </div>
    ${SITE_FOOT}`;
  draw();
  counts.refresh().then((fresh) => fresh && draw());
}

function renderGame(id) {
  stopGame();
  const game = GAMES.find((g) => g.id === id);
  if (!game) {
    nav('/games/');
    return;
  }
  document.title = `${game.title} · 맞혀봐`;
  reportPlay('game-' + game.id);
  app.innerHTML = `
    <div class="play-head">
      <button class="icon-btn" data-act="home" aria-label="게임 목록으로">←</button>
      <h1 class="page-title">${esc(game.title)}</h1>
    </div>
    <div class="game-body"></div>`;
  app.querySelector('[data-act="home"]').addEventListener('click', () => nav('/games/'));
  const body = app.querySelector('.game-body');
  ({ wheel: renderWheel, ladder: renderLadder, marble: renderMarble, horse: renderHorse, lots: renderLots, bomb: renderBomb, teams: renderTeams, lol: renderLol, dice: renderDice, liar: renderLiar, croc: renderCroc, mini: renderMini, memory: renderMemory, apple: renderApple, balance: renderBalance })[id](body);
}

/* ═════════════════════ 돌림판 ═════════════════════ */

// 돌림판 항목 모음 (누르면 항목 칸이 바뀜)
const WHEEL_PRESETS = {
  '🍱 점심 메뉴': ['치킨', '피자', '짜장면', '떡볶이', '햄버거', '초밥', '김치찌개', '돈가스', '국밥', '마라탕'],
  '😈 복불복 벌칙': ['노래 한 소절', '애교 3종 세트', '성대모사', '커피 쏘기', '아이스크림 쏘기', '칭찬 3개 하기', '엉덩이로 이름 쓰기', '통과!', '꽝 (벌칙 없음)', '옆 사람이 정해 주기'],
  '💸 계산 몰아주기': ['내가 쏜다', '반반', '1/N', '가위바위보 진 사람', '막내가 쏜다', '제일 늦게 온 사람'],
  '🧹 당번 정하기': ['설거지', '청소기', '분리수거', '빨래', '장보기', '쉬는 날'],
};
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
    <div class="opt-row" role="group" aria-label="항목 모음">
      ${Object.keys(WHEEL_PRESETS).map((k) => `<button class="chip" data-preset="${k}">${k}</button>`).join('')}
    </div>
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
    focusBoard(root.querySelector('.wheel-wrap'));
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
  root.querySelectorAll('[data-preset]').forEach((b) =>
    b.addEventListener('click', () => {
      if (spinning) return;
      ta.value = WHEEL_PRESETS[b.dataset.preset].join('\n');
      gameStore.save('wheel', { items: ta.value });
      reset();
    })
  );
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
    focusBoard(box);
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
    }
    // 이름: 흰 글씨 + 진한 테두리. 앞서가는 구슬부터 쓰고, 다른 이름과 겹치면 그 이름은 잠시 생략 (빽빽할 때 글자가 뭉개지지 않게)
    const placed = [];
    const live = marbles.filter((m) => !m.done && m.y >= top && m.y <= bottom).sort((a, b) => b.y - a.y);
    ctx.lineJoin = 'round';
    for (const m of live) {
      const label = m.name.length > 4 ? m.name.slice(0, 4) : m.name;
      const w = ctx.measureText(label).width + 4;
      const box = { l: m.x - w / 2, r: m.x + w / 2, t: m.y - R - 14, b: m.y - R - 1 };
      if (placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) continue;
      placed.push(box);
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
    focusBoard(root.querySelector('.marble-stage'));
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
    focusBoard(root.querySelector('.track-wrap'));
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

/* ═════════════════════ 공통: 효과음 ═════════════════════ */

// 소리는 사용자가 버튼을 누른 뒤에만 켤 수 있어서(휴대폰 정책), 누를 때 unlock() 호출
const gameAudio = {
  ctx: null,
  unlock() {
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      this.ctx.resume();
    } catch { /* 소리 없이 진행 */ }
  },
  beep(freq, dur = 0.05, vol = 0.12) {
    const c = this.ctx;
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  },
  boom() {
    const c = this.ctx;
    if (!c) return;
    const len = Math.floor(c.sampleRate * 0.9);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    src.buffer = buf;
    f.type = 'lowpass';
    f.frequency.value = 900;
    g.gain.value = 0.7;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  },
};
const buzz = (p) => { try { navigator.vibrate?.(p); } catch { /* 진동 없는 기기 */ } };

/* ═════════════════════ 제비뽑기 ═════════════════════ */

function renderLots(root) {
  const saved = gameStore.get('lots') || { count: 6, wins: 1, label: '당첨' };
  root.innerHTML = `
    <p class="game-result" role="status"></p>
    <div class="lots-grid"></div>
    <div class="game-actions">
      <button class="btn block" data-act="all">남은 종이 다 펼치기</button>
      <button class="btn ghost block" data-act="reset">새로 섞기 (다시 시작)</button>
    </div>
    <div class="num-row">
      <label class="field"><span>종이 수 (2~30)</span><input type="number" inputmode="numeric" min="2" max="30" value="${saved.count}" data-k="count"></label>
      <label class="field"><span>당첨 수</span><input type="number" inputmode="numeric" min="1" max="29" value="${saved.wins}" data-k="wins"></label>
      <label class="field"><span>당첨 문구</span><input type="text" maxlength="10" value="${esc(saved.label)}" data-k="label"></label>
    </div>`;
  const grid = root.querySelector('.lots-grid');
  const resultEl = root.querySelector('.game-result');
  const input = (k) => root.querySelector(`[data-k="${k}"]`);
  let lots = [];
  let cur = saved;
  let found = 0;
  let timers = [];
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  function status(msg) {
    const left = grid.querySelectorAll('.lot:not(.open)').length;
    const remain = cur.wins - found;
    const sub = remain > 0 ? `남은 ${esc(cur.label)} ${remain}개 · 종이 ${left}장` : `${esc(cur.label)} 다 나왔어요!`;
    resultEl.innerHTML = `${msg ? msg + '<br>' : ''}<small class="sub">${sub}</small>`;
  }

  function make() {
    clear();
    const count = Math.min(30, Math.max(2, parseInt(input('count').value, 10) || 6));
    const wins = Math.min(count - 1, Math.max(1, parseInt(input('wins').value, 10) || 1));
    const label = input('label').value.trim().slice(0, 10) || '당첨';
    input('count').value = count;
    input('wins').value = wins;
    cur = { count, wins, label };
    gameStore.save('lots', cur);
    lots = shuffle(Array.from({ length: count }, (_, i) => i < wins));
    found = 0;
    grid.innerHTML = lots.map((_, i) => `<button class="lot" data-i="${i}" aria-label="${i + 1}번 종이"><b>${i + 1}</b></button>`).join('');
    status('종이를 하나 골라 펼쳐 보세요');
  }

  function open(btn, quick) {
    if (btn.classList.contains('open') || btn.classList.contains('busy')) return;
    btn.classList.add('busy');
    const i = +btn.dataset.i;
    const win = lots[i];
    const reveal = () => {
      btn.classList.remove('shake');
      btn.classList.add('flip');
      timers.push(
        setTimeout(() => {
          btn.classList.remove('busy');
          btn.classList.add('open', win ? 'win' : 'lose');
          btn.innerHTML = win ? `<small>${i + 1}</small><span>🎉</span><b>${esc(cur.label)}</b>` : `<small>${i + 1}</small><b>꽝</b>`;
          if (win) {
            found++;
            buzz(80);
          }
          if (!quick) status(win ? `🎉 <b>${i + 1}번</b> 종이 ${esc(cur.label)}!` : `${i + 1}번은 꽝… 😅`);
          else status(found >= cur.wins ? '모두 펼쳤어요' : '');
        }, 180)
      );
    };
    if (quick) reveal();
    else {
      btn.classList.add('shake');
      timers.push(setTimeout(reveal, 700));
    }
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.lot');
    if (btn) open(btn);
  });
  root.querySelector('[data-act="all"]').addEventListener('click', () => {
    [...grid.querySelectorAll('.lot:not(.open):not(.busy)')].forEach((b, k) => timers.push(setTimeout(() => open(b, true), k * 120)));
  });
  root.querySelector('[data-act="reset"]').addEventListener('click', make);
  root.querySelectorAll('[data-k]').forEach((el) => el.addEventListener('change', make));
  make();
  gameCleanup = clear;
}

/* ═════════════════════ 폭탄 돌리기 ═════════════════════ */

const BOMB_SVG = `<svg class="bomb-svg" viewBox="0 0 200 200" aria-hidden="true">
  <path d="M132 56q16-30 40-24" fill="none" stroke="#8a6a3f" stroke-width="6" stroke-linecap="round"/>
  <g class="spark"><path d="M174 14l5 12 13 2-10 9 3 13-11-7-11 7 3-13-10-9 13-2z" fill="#ffd93d"/><circle cx="174" cy="32" r="5" fill="#fff"/></g>
  <rect x="106" y="46" width="34" height="24" rx="6" fill="#5f5b70" transform="rotate(38 123 58)"/>
  <circle cx="92" cy="124" r="64" fill="#2d3142"/>
  <ellipse cx="66" cy="96" rx="17" ry="10" fill="#fff" opacity=".25" transform="rotate(-35 66 96)"/>
</svg>`;
const BOMB_RANGES = { short: [5, 15], mid: [10, 30], long: [20, 60] };
// 폭탄 제시어: 주제 또는 초성 → 조건에 맞는 말을 하고 폰을 넘김
const BOMB_TOPICS = ['과자 이름', '라면 이름', '아이돌 그룹', '나라 이름', '동물', '과일', '채소', '음식', '지하철역', '직업', '색깔', '운동 종목', '영화 제목', '드라마 제목', '가수 이름', '브랜드', '수도 이름', '바다 동물', '꽃 이름', '곤충', '악기', '탈것', '게임 이름', '만화 캐릭터', '치킨 브랜드', '편의점 음식', '학교 과목', '스마트폰 앱', '세 글자 단어', '받침 없는 단어'];
const BOMB_CHOSUNG = ['ㄱㅅ', 'ㅅㄱ', 'ㄱㄴ', 'ㅂㄹ', 'ㅅㅈ', 'ㄷㄹ', 'ㅈㄱ', 'ㅁㄹ', 'ㄱㅂ', 'ㅅㅁ', 'ㅂㅅ', 'ㅇㅅ', 'ㄱㄹ', 'ㅈㅅ', 'ㅎㄱ', 'ㄴㄹ', 'ㅅㄹ', 'ㄱㅈ', 'ㅂㄱ', 'ㅁㅅ', 'ㅇㄱ', 'ㅊㄱ', 'ㅍㄷ', 'ㅌㄹ', 'ㄷㄱ'];
const bombWord = (mode) => {
  const list = mode === 'chosung' ? BOMB_CHOSUNG : BOMB_TOPICS;
  return list[Math.floor(Math.random() * list.length)];
};

function renderBomb(root) {
  const saved = gameStore.get('bomb') || {
    len: 'mid',
    sound: true,
    penalties: '노래 한 소절 부르기\n애교 3종 세트\n성대모사 하나\n옆 사람 칭찬 3개\n엉덩이로 이름 쓰기\n다음 판 술래',
  };
  let len = saved.len;
  let mode = saved.mode || 'topic';
  root.innerHTML = `
    <div class="bomb-stage">
      <div class="bomb">${BOMB_SVG}</div>
      <p class="bomb-msg">시작을 누르고 폰을 옆 사람에게 넘기세요!</p>
    </div>
    <p class="game-result" role="status">언제 터질지는 아무도 몰라요.</p>
    <div class="game-actions">
      <button class="btn block" data-act="start">시작</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <div class="opt-row" role="group" aria-label="터지는 시간">
      ${Object.entries({ short: '짧게 5~15초', mid: '보통 10~30초', long: '길게 20~60초' })
        .map(([k, t]) => `<button class="chip" data-len="${k}" aria-pressed="${k === len}">${t}</button>`)
        .join('')}
    </div>
    <div class="opt-row" role="group" aria-label="제시어">
      ${Object.entries({ none: '제시어 없음', topic: '주제 (예: 과자 이름)', chosung: '초성 (예: ㄱㅅ)' })
        .map(([k, t]) => `<button class="chip" data-mode="${k}" aria-pressed="${k === mode}">${t}</button>`)
        .join('')}
    </div>
    <p class="lol-hint">주제·초성을 고르면 시작할 때 제시어가 나와요. 조건에 맞는 말을 하고 옆 사람에게 넘기세요!</p>
    <label class="check"><input type="checkbox" data-k="sound" ${saved.sound ? 'checked' : ''}> 째깍 소리 켜기</label>
    <label class="field">
      <span>벌칙 (터지면 하나 뽑아 줘요 · 비워도 돼요)</span>
      <textarea class="names" rows="5">${esc(saved.penalties)}</textarea>
    </label>`;
  const stage = root.querySelector('.bomb-stage');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  const soundEl = root.querySelector('[data-k="sound"]');
  const ta = root.querySelector('.names');
  let timer = 0;

  const save = () => gameStore.save('bomb', { len, mode, sound: soundEl.checked, penalties: ta.value });
  const idle = (msg = '시작을 누르고 폰을 옆 사람에게 넘기세요!') => {
    stage.className = 'bomb-stage';
    stage.innerHTML = `<div class="bomb">${BOMB_SVG}</div><p class="bomb-msg">${msg}</p>`;
  };

  function start() {
    clearTimeout(timer);
    save();
    if (soundEl.checked) gameAudio.unlock();
    const [a, b] = BOMB_RANGES[len];
    const total = (a + Math.random() * (b - a)) * 1000;
    const t0 = performance.now();
    if (mode === 'none') idle('째깍째깍… 빨리 옆 사람에게 넘겨요!');
    else {
      idle('');
      stage.querySelector('.bomb-msg').outerHTML = `<p class="bomb-word" title="눌러서 제시어 바꾸기">${esc(bombWord(mode))}</p><p class="bomb-msg">${mode === 'chosung' ? '이 초성으로 된 말' : '이 주제에 맞는 말'}을 하고 넘기세요! <small>(제시어를 누르면 바뀌어요)</small></p>`;
      stage.querySelector('.bomb-word').addEventListener('click', (e) => {
        e.currentTarget.textContent = bombWord(mode);
      });
    }
    const bomb = stage.querySelector('.bomb');
    bomb.classList.add('lit');
    startBtn.disabled = true;
    startBtn.textContent = '째깍째깍…';
    resultEl.textContent = '폭탄을 들고 있으면 안 돼요!';
    let even = false;
    const tick = () => {
      const el = performance.now() - t0;
      const p = el / total;
      if (p >= 1) return explode(el);
      bomb.classList.remove('pulse');
      void bomb.offsetWidth;
      bomb.classList.add('pulse');
      if (soundEl.checked) gameAudio.beep(even ? 1000 : 1400);
      even = !even;
      stage.classList.toggle('hot', p > 0.65);
      // 끝으로 갈수록 째깍 소리가 빨라짐
      timer = setTimeout(tick, Math.min(650 - 480 * p * p, total - el + 5));
    };
    tick();
  }

  function explode(ms) {
    stage.className = 'bomb-stage boom';
    stage.innerHTML = `<div class="boom-text">펑!</div><p class="bomb-msg">💥 지금 폰 든 사람 걸렸어요!</p>`;
    if (soundEl.checked) gameAudio.boom();
    buzz([300, 80, 300]);
    const list = parseNames(ta.value, 50);
    const sec = (ms / 1000).toFixed(1);
    resultEl.innerHTML = list.length
      ? `벌칙: <b>${esc(list[Math.floor(Math.random() * list.length)])}</b><br><small class="sub">${sec}초 만에 터졌어요</small>`
      : `${sec}초 만에 터졌어요!`;
    startBtn.disabled = false;
    startBtn.textContent = '한 판 더';
  }

  function reset() {
    clearTimeout(timer);
    idle();
    startBtn.disabled = false;
    startBtn.textContent = '시작';
    resultEl.textContent = '언제 터질지는 아무도 몰라요.';
  }

  startBtn.addEventListener('click', start);
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
  root.querySelectorAll('[data-len]').forEach((b) =>
    b.addEventListener('click', () => {
      len = b.dataset.len;
      root.querySelectorAll('[data-len]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      save();
    })
  );
  root.querySelectorAll('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      save();
    })
  );
  soundEl.addEventListener('change', save);
  ta.addEventListener('change', save);
  gameCleanup = () => clearTimeout(timer);
}

/* ═════════════════════ 팀 나누기 ═════════════════════ */

const TEAM_COLORS = ['#ff8a7a', '#6fc8ff', '#7ad98f', '#ffd166', '#c9a2ff', '#ffa8d2'];

function renderTeams(root) {
  const saved = gameStore.get('teams') || { names: '철수\n영희\n민수\n지은\n현우\n서연\n지훈\n하은', teams: 2 };
  let k = saved.teams;
  root.innerHTML = `
    <div class="teams-box"></div>
    <p class="game-result" role="status">이름을 넣고 팀을 나눠 보세요.</p>
    <div class="game-actions">
      <button class="btn block" data-act="split">팀 나누기</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <button class="btn ghost block" data-act="copy" hidden>결과 복사하기 (단톡방에 붙여 넣기)</button>
    <div class="opt-row" role="group" aria-label="팀 수">
      ${[2, 3, 4, 5, 6].map((n) => `<button class="chip" data-n="${n}" aria-pressed="${n === k}">${n}팀</button>`).join('')}
    </div>
    <label class="field">
      <span>참가자 (한 줄에 하나, 또는 쉼표로 구분 · 최대 60명)</span>
      <textarea class="names" rows="7">${esc(saved.names)}</textarea>
    </label>`;
  const box = root.querySelector('.teams-box');
  const resultEl = root.querySelector('.game-result');
  const splitBtn = root.querySelector('[data-act="split"]');
  const copyBtn = root.querySelector('[data-act="copy"]');
  const ta = root.querySelector('.names');
  let timers = [];
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const teamName = (t) => 'ABCDEF'[t] + '팀';

  function split() {
    clear();
    const names = parseNames(ta.value, 60);
    if (names.length < 2) {
      resultEl.textContent = '참가자를 2명 이상 넣어 주세요.';
      return;
    }
    const teams = Math.min(k, names.length);
    gameStore.save('teams', { names: ta.value, teams: k });
    const order = shuffle(names);
    // 팀 자리도 섞어서, 사람이 남을 때 늘 A팀이 한 명 더 많지 않게
    const slots = shuffle([...Array(teams).keys()]);
    box.innerHTML = Array.from(
      { length: teams },
      (_, t) => `<div class="team" style="--c:${TEAM_COLORS[t]}"><h3>${teamName(t)} <small>0명</small></h3><ul></ul></div>`
    ).join('');
    const cards = [...box.querySelectorAll('.team')];
    splitBtn.disabled = true;
    copyBtn.hidden = true;
    resultEl.textContent = '두근두근… 누구랑 같은 팀일까?';
    const gap = Math.max(60, Math.min(280, 2600 / order.length));
    order.forEach((name, i) => {
      timers.push(
        setTimeout(() => {
          const card = cards[slots[i % teams]];
          const li = document.createElement('li');
          li.textContent = name;
          card.querySelector('ul').appendChild(li);
          card.querySelector('small').textContent = `${card.querySelectorAll('li').length}명`;
          if (i === order.length - 1) {
            splitBtn.disabled = false;
            splitBtn.textContent = '다시 나누기';
            copyBtn.hidden = false;
            resultEl.textContent = '🎉 팀이 정해졌어요!';
          }
        }, 300 + i * gap)
      );
    });
  }

  function reset() {
    clear();
    box.innerHTML = '';
    splitBtn.disabled = false;
    splitBtn.textContent = '팀 나누기';
    copyBtn.hidden = true;
    resultEl.textContent = '이름을 넣고 팀을 나눠 보세요.';
  }

  splitBtn.addEventListener('click', split);
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
  copyBtn.addEventListener('click', () => {
    const text = [...box.querySelectorAll('.team')]
      .map((c, t) => `${teamName(t)}: ${[...c.querySelectorAll('li')].map((l) => l.textContent).join(', ')}`)
      .join('\n');
    navigator.clipboard?.writeText(text).then(
      () => (resultEl.textContent = '복사했어요! 단톡방에 붙여 넣어 보세요.'),
      () => (resultEl.textContent = '복사가 안 돼요. 화면을 캡처해 주세요.')
    );
  });
  root.querySelectorAll('[data-n]').forEach((b) =>
    b.addEventListener('click', () => {
      k = +b.dataset.n;
      root.querySelectorAll('[data-n]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      gameStore.save('teams', { names: ta.value, teams: k });
    })
  );
  gameCleanup = clear;
}

/* ═════════════════════ 주사위·동전 ═════════════════════ */

const DIE_PIPS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};
const dieSvg = (v) =>
  `<svg viewBox="0 0 100 100" aria-label="${v}"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#d9d4ea" stroke-width="3"/>${DIE_PIPS[v]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${v === 1 ? 13 : 9}" fill="${v === 1 ? '#ff4f5e' : '#2d3142'}"/>`)
    .join('')}</svg>`;

function renderDice(root) {
  const saved = gameStore.get('dice') || { mode: 'dice', n: 2 };
  let mode = saved.mode;
  let n = saved.n;
  let coinDeg = 0;
  let timers = [];
  const hist = { dice: [], coin: [] };
  root.innerHTML = `
    <div class="opt-row" role="group" aria-label="종류">
      <button class="chip" data-mode="dice">🎲 주사위</button>
      <button class="chip" data-mode="coin">🪙 동전</button>
    </div>
    <div class="dice-stage"></div>
    <p class="game-result" role="status"></p>
    <div class="game-actions">
      <button class="btn block" data-act="roll">던지기</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <div class="opt-row dice-count" role="group" aria-label="주사위 개수">
      ${[1, 2, 3, 4].map((c) => `<button class="chip" data-n="${c}">주사위 ${c}개</button>`).join('')}
    </div>
    <p class="dice-history"></p>`;
  const stage = root.querySelector('.dice-stage');
  const resultEl = root.querySelector('.game-result');
  const rollBtn = root.querySelector('[data-act="roll"]');
  const histEl = root.querySelector('.dice-history');
  const clear = () => {
    timers.forEach(clearTimeout);
    timers.forEach(clearInterval);
    timers = [];
  };

  function showHist() {
    const h = hist[mode];
    histEl.textContent = h.length ? `기록: ${h.join(' · ')}` : '';
  }

  function setup() {
    clear();
    gameStore.save('dice', { mode, n });
    root.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === mode));
    root.querySelectorAll('[data-n]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.n === n));
    root.querySelector('.dice-count').hidden = mode !== 'dice';
    coinDeg = 0;
    stage.innerHTML =
      mode === 'dice'
        ? Array.from({ length: n }, () => `<div class="die">${dieSvg(1 + Math.floor(Math.random() * 6))}</div>`).join('')
        : `<div class="coin-wrap"><div class="coin"><div class="coin-face front">앞</div><div class="coin-face back">뒤</div></div></div>`;
    rollBtn.disabled = false;
    rollBtn.textContent = mode === 'dice' ? '굴리기' : '던지기';
    resultEl.textContent = mode === 'dice' ? '굴리기를 눌러 보세요.' : '앞일까 뒤일까?';
    showHist();
  }

  function rollDice() {
    const dice = [...stage.querySelectorAll('.die')];
    const final = dice.map(() => 1 + Math.floor(Math.random() * 6));
    dice.forEach((d, i) => {
      d.classList.remove('rolling');
      void d.offsetWidth;
      d.style.animationDuration = `${0.9 + i * 0.1}s`;
      d.classList.add('rolling');
    });
    const iv = setInterval(() => dice.forEach((d) => (d.innerHTML = dieSvg(1 + Math.floor(Math.random() * 6)))), 80);
    timers.push(iv);
    resultEl.textContent = '데굴데굴…';
    timers.push(
      setTimeout(() => {
        clearInterval(iv);
        dice.forEach((d, i) => (d.innerHTML = dieSvg(final[i])));
        const sum = final.reduce((a, b) => a + b, 0);
        const same = final.length > 1 && final.every((v) => v === final[0]);
        resultEl.innerHTML = final.length === 1 ? `🎲 <b>${sum}</b>` : `${final.join(' + ')} = <b>${sum}</b>${same ? ' · 🎉 모두 같은 숫자!' : ''}`;
        hist.dice = [sum, ...hist.dice].slice(0, 15);
        showHist();
        buzz(30);
        rollBtn.disabled = false;
      }, 900 + dice.length * 100)
    );
  }

  function flipCoin() {
    const coin = stage.querySelector('.coin');
    const wrap = stage.querySelector('.coin-wrap');
    const head = Math.random() < 0.5;
    // 지금 각도에서 6바퀴 더 돌고 앞(0°)/뒤(180°)에 멈춤
    coinDeg = Math.ceil(coinDeg / 360) * 360 + 360 * 6 + (head ? 0 : 180);
    coin.style.transform = `rotateY(${coinDeg}deg)`;
    wrap.classList.remove('toss');
    void wrap.offsetWidth;
    wrap.classList.add('toss');
    resultEl.textContent = '휘리릭…';
    timers.push(
      setTimeout(() => {
        resultEl.innerHTML = head ? '🪙 <b>앞면!</b>' : '🪙 <b>뒷면!</b>';
        hist.coin = [head ? '앞' : '뒤', ...hist.coin].slice(0, 15);
        showHist();
        buzz(30);
        rollBtn.disabled = false;
      }, 1650)
    );
  }

  rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    rollBtn.textContent = mode === 'dice' ? '다시 굴리기' : '다시 던지기';
    if (mode === 'dice') rollDice();
    else flipCoin();
  });
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    hist[mode] = [];
    setup();
  });
  root.querySelectorAll('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.mode;
      setup();
    })
  );
  root.querySelectorAll('[data-n]').forEach((b) =>
    b.addEventListener('click', () => {
      n = +b.dataset.n;
      setup();
    })
  );
  setup();
  gameCleanup = clear;
}

/* ═════════════════════ 롤 내전 팀 짜기 ═════════════════════ */

const LOL_LANES = ['탑', '정글', '미드', '원딜', '서폿'];
// 사람별 고정: 자유 → 라인 고정 → 블루 고정 → 레드 고정 순서로 바뀜
const LOL_PINS = [
  { k: '', label: '자유' },
  { k: 'lane', label: '라인' },
  { k: 'blue', label: '블루' },
  { k: 'red', label: '레드' },
];

// 라인마다 2명씩 입력.
//   라인 이름 버튼 = 그 라인 두 사람 모두 그 라인 그대로 (블루·레드만 나눔)
//   사람 옆 버튼 = 그 사람만 라인 고정 / 블루팀 고정 / 레드팀 고정
//   나머지는 모두 무작위. 조건에 맞는 배치를 무작위로 찾는다.
function renderLol(root) {
  const saved = gameStore.get('lol') || {};
  const names = (saved.names || []).slice(0, 10);
  while (names.length < 10) names.push('');
  // 예전 저장값(fixed: true/false)도 이어서 씀
  let locked = Array.isArray(saved.locked) ? saved.locked.slice(0, 5) : Array(5).fill(saved.fixed !== false);
  let pins = Array.isArray(saved.pins) ? saved.pins.slice(0, 10) : Array(10).fill('');
  root.innerHTML = `
    <div class="lol-board" hidden>
      <div class="lol-team blue"><h3>블루팀</h3><ol></ol></div>
      <div class="lol-team red"><h3>레드팀</h3><ol></ol></div>
    </div>
    <p class="game-result" role="status"></p>
    <div class="game-actions">
      <button class="btn block" data-act="shuffle">섞기</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <button class="btn ghost block" data-act="copy" hidden>결과 복사하기 (단톡방에 붙여 넣기)</button>
    <div class="opt-row" role="group" aria-label="고정 한 번에 바꾸기">
      <button class="chip" data-all="lock">🔒 모든 라인 고정</button>
      <button class="chip" data-all="free">🔀 고정 전부 풀기</button>
    </div>
    <p class="lol-hint"><b>라인 이름</b>을 누르면 그 라인 두 명이 라인 고정,
      이름 옆 <b>작은 버튼</b>을 누르면 그 사람만 <b>라인 → 블루 → 레드</b> 고정이에요. 나머지는 다 섞여요.</p>
    <div class="lol-inputs">
      ${LOL_LANES.map(
        (lane, l) => `
        <div class="lol-row">
          <button class="lol-lock" data-l="${l}"></button>
          ${[0, 1]
            .map((k) => {
              const i = l * 2 + k;
              return `<div class="lol-person"><input type="text" maxlength="12" data-i="${i}" placeholder="${lane} ${k + 1}" value="${esc(names[i])}"><button class="lol-pin" data-p="${i}"></button></div>`;
            })
            .join('')}
        </div>`
      ).join('')}
    </div>`;
  const board = root.querySelector('.lol-board');
  const resultEl = root.querySelector('.game-result');
  const shuffleBtn = root.querySelector('[data-act="shuffle"]');
  const copyBtn = root.querySelector('[data-act="copy"]');
  const inputsEl = root.querySelector('.lol-inputs');
  let timers = [];
  let last = null;
  const clear = () => {
    timers.forEach(clearTimeout);
    timers.forEach(clearInterval);
    timers = [];
  };

  const save = () => gameStore.save('lol', { names, locked, pins });
  const nameOf = (i) => names[i].trim() || inputsEl.querySelector(`[data-i="${i}"]`).placeholder;

  function drawLocks() {
    root.querySelectorAll('.lol-lock').forEach((b) => {
      const l = +b.dataset.l;
      b.setAttribute('aria-pressed', locked[l]);
      b.innerHTML = `<b>${LOL_LANES[l]}</b><small>${locked[l] ? '🔒 고정' : '🔀 섞기'}</small>`;
      b.setAttribute('aria-label', `${LOL_LANES[l]} 라인 ${locked[l] ? '고정됨' : '섞기'} (눌러서 바꾸기)`);
    });
    root.querySelectorAll('.lol-pin').forEach((b) => {
      const i = +b.dataset.p;
      const laneLocked = locked[Math.floor(i / 2)];
      // 라인 전체가 고정이면 '라인' 상태는 의미가 없어서 건너뜀
      if (laneLocked && pins[i] === 'lane') pins[i] = '';
      const pin = LOL_PINS.find((p) => p.k === pins[i]) || LOL_PINS[0];
      b.dataset.k = pin.k;
      b.textContent = pin.label;
      b.setAttribute('aria-label', `${nameOf(i)} 고정: ${pin.label} (눌러서 바꾸기)`);
    });
    const v = check();
    if (v) resultEl.textContent = v;
    else {
      const parts = [];
      const nl = locked.filter(Boolean).length;
      if (nl === 5) parts.push('모든 라인 고정');
      else if (nl) parts.push(`${LOL_LANES.filter((_, l) => locked[l]).join('·')} 라인 고정`);
      const np = pins.filter(Boolean).length;
      if (np) parts.push(`개인 고정 ${np}명`);
      resultEl.textContent = parts.length ? `${parts.join(' · ')}, 나머지는 섞어요.` : '고정 없이 팀도 라인도 전부 무작위예요.';
    }
  }

  // 사람마다 갈 수 있는 자리(팀×라인 10칸) 목록
  function allowedSlots(i) {
    const row = Math.floor(i / 2);
    const laneFixed = locked[row] || pins[i] === 'lane';
    const team = pins[i] === 'blue' ? 0 : pins[i] === 'red' ? 1 : -1;
    const out = [];
    for (let t = 0; t < 2; t++) for (let l = 0; l < 5; l++) if ((!laneFixed || l === row) && (team < 0 || t === team)) out.push(t * 5 + l);
    return out;
  }

  // 조건에 맞는 배치를 무작위로 하나 찾음 (없으면 null). 칸 번호: 블루 0~4, 레드 5~9
  function solve() {
    const people = shuffle([...Array(10).keys()]).map((i) => ({ i, slots: shuffle(allowedSlots(i)) }));
    people.sort((a, b) => a.slots.length - b.slots.length);
    const seat = Array(10).fill(-1);
    const go = (k) => {
      if (k === people.length) return true;
      for (const s of people[k].slots) {
        if (seat[s] !== -1) continue;
        seat[s] = people[k].i;
        if (go(k + 1)) return true;
        seat[s] = -1;
      }
      return false;
    };
    return go(0) ? { blue: seat.slice(0, 5), red: seat.slice(5) } : null;
  }

  // 조건이 서로 안 맞으면 이유를 돌려줌
  function check() {
    if (pins.filter((p) => p === 'blue').length > 5) return '⚠️ 블루 고정이 5명을 넘었어요.';
    if (pins.filter((p) => p === 'red').length > 5) return '⚠️ 레드 고정이 5명을 넘었어요.';
    if (!solve()) return '⚠️ 고정 조건이 서로 안 맞아요. (예: 같은 라인 두 명을 같은 팀에 고정)';
    return '';
  }

  function paint(t, final) {
    const row = (i, l) =>
      `<li${final ? ` style="animation-delay:${l * 90}ms"` : ''} class="${final ? 'pop' : 'spin'}"><span class="lol-lane">${LOL_LANES[l]}</span><b>${esc(nameOf(i))}</b>${
        locked[Math.floor(i / 2)] || pins[i] ? '<i aria-label="고정">🔒</i>' : ''
      }</li>`;
    board.querySelector('.blue ol').innerHTML = t.blue.map(row).join('');
    board.querySelector('.red ol').innerHTML = t.red.map(row).join('');
  }

  function doShuffle() {
    clear();
    save();
    const problem = check();
    if (problem) {
      resultEl.textContent = problem;
      return;
    }
    board.hidden = false;
    copyBtn.hidden = true;
    shuffleBtn.disabled = true;
    resultEl.textContent = '섞는 중…';
    const iv = setInterval(() => paint(solve(), false), 70);
    timers.push(iv);
    timers.push(
      setTimeout(() => {
        clearInterval(iv);
        last = solve();
        paint(last, true);
        shuffleBtn.disabled = false;
        shuffleBtn.textContent = '다시 섞기';
        copyBtn.hidden = false;
        resultEl.textContent = '⚔️ 팀이 정해졌어요!';
        buzz(40);
      }, 1100)
    );
  }

  function reset() {
    clear();
    board.hidden = true;
    copyBtn.hidden = true;
    shuffleBtn.disabled = false;
    shuffleBtn.textContent = '섞기';
    last = null;
    drawLocks();
  }

  inputsEl.addEventListener('input', (e) => {
    const i = e.target.dataset.i;
    if (i === undefined) return;
    names[+i] = e.target.value;
    save();
  });
  inputsEl.addEventListener('click', (e) => {
    const lock = e.target.closest('.lol-lock');
    const pin = e.target.closest('.lol-pin');
    if (lock) locked[+lock.dataset.l] = !locked[+lock.dataset.l];
    else if (pin) {
      const i = +pin.dataset.p;
      const order = LOL_PINS.map((p) => p.k).filter((k) => !(k === 'lane' && locked[Math.floor(i / 2)]));
      pins[i] = order[(order.indexOf(pins[i]) + 1) % order.length];
    } else return;
    save();
    reset();
  });
  root.querySelectorAll('[data-all]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.all === 'lock') locked = Array(5).fill(true);
      else {
        locked = Array(5).fill(false);
        pins = Array(10).fill('');
      }
      save();
      reset();
    })
  );
  shuffleBtn.addEventListener('click', doShuffle);
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
  copyBtn.addEventListener('click', () => {
    if (!last) return;
    const line = (team, list) => `[${team}] ` + list.map((i, l) => `${LOL_LANES[l]} ${nameOf(i)}`).join(' / ');
    navigator.clipboard?.writeText(`${line('블루', last.blue)}\n${line('레드', last.red)}`).then(
      () => (resultEl.textContent = '복사했어요! 단톡방에 붙여 넣어 보세요.'),
      () => (resultEl.textContent = '복사가 안 돼요. 화면을 캡처해 주세요.')
    );
  });
  drawLocks();
  gameCleanup = clear;
}

/* ═════════════════════ 라이어 게임 ═════════════════════ */

// 폰 하나를 돌려 보며 하는 심리전: 라이어만 제시어를 모름 (바보 모드: 라이어는 비슷한 다른 단어를 받음)
const LIAR_WORDS = {
  음식: ['김치찌개', '떡볶이', '짜장면', '삼겹살', '치킨', '피자', '햄버거', '초밥', '라면', '비빔밥', '냉면', '김밥', '돈가스', '마라탕', '파스타', '순대', '만두', '불고기', '팥빙수', '붕어빵'],
  동물: ['강아지', '고양이', '호랑이', '사자', '코끼리', '기린', '펭귄', '판다', '토끼', '거북이', '원숭이', '돌고래', '상어', '독수리', '하마', '캥거루', '다람쥐', '여우', '부엉이', '고래'],
  장소: ['학교', '병원', '공항', '도서관', '영화관', '놀이공원', '편의점', '찜질방', '수영장', '해수욕장', '지하철', '캠핑장', '노래방', 'PC방', '백화점', '경찰서', '동물원', '카페', '헬스장', '미용실'],
  직업: ['의사', '소방관', '경찰관', '선생님', '요리사', '가수', '배우', '유튜버', '프로게이머', '변호사', '간호사', '파일럿', '택배 기사', '미용사', '농부', '과학자', '운동선수', '개발자', '아나운서', '군인'],
  물건: ['우산', '냉장고', '스마트폰', '안경', '칫솔', '시계', '가위', '거울', '베개', '이어폰', '선풍기', '지갑', '열쇠', '노트북', '전자레인지', '자전거', '텀블러', '마스크', '리모컨', '헤어드라이어'],
  스포츠: ['축구', '야구', '농구', '배구', '테니스', '탁구', '골프', '수영', '스키', '태권도', '복싱', '볼링', '마라톤', '양궁', '배드민턴', '스케이트', '씨름', '유도', '펜싱', '당구'],
  나라: ['미국', '일본', '중국', '프랑스', '영국', '이탈리아', '브라질', '호주', '캐나다', '독일', '스페인', '태국', '베트남', '이집트', '인도', '멕시코', '러시아', '스위스', '그리스', '튀르키예'],
};

function renderLiar(root) {
  const saved = gameStore.get('liar') || { n: 4, cat: '음식', fool: false };
  let n = saved.n;
  let cat = saved.cat;
  root.innerHTML = `
    <div class="liar-stage"></div>
    <div class="liar-setup">
      <div class="field"><span>인원</span>
        <div class="opt-row">${[3, 4, 5, 6, 7, 8, 9, 10].map((k) => `<button class="chip" data-n="${k}" aria-pressed="${k === n}">${k}명</button>`).join('')}</div>
      </div>
      <div class="field"><span>주제</span>
        <div class="opt-row">${['랜덤', ...Object.keys(LIAR_WORDS)].map((k) => `<button class="chip" data-cat="${k}" aria-pressed="${k === cat}">${k}</button>`).join('')}</div>
      </div>
      <label class="check"><input type="checkbox" data-k="fool" ${saved.fool ? 'checked' : ''}> 바보 모드 (라이어도 자기가 라이어인 줄 모르고 비슷한 단어를 받아요)</label>
      <button class="btn block" data-act="start">게임 시작</button>
    </div>`;
  const stage = root.querySelector('.liar-stage');
  const setup = root.querySelector('.liar-setup');
  const foolEl = root.querySelector('[data-k="fool"]');
  let game = null;
  let timer = 0;
  const save = () => gameStore.save('liar', { n, cat, fool: foolEl.checked });

  function start() {
    save();
    const topic = cat === '랜덤' ? Object.keys(LIAR_WORDS)[Math.floor(Math.random() * Object.keys(LIAR_WORDS).length)] : cat;
    const [word, other] = shuffle(LIAR_WORDS[topic]);
    game = { topic, word, other, liar: Math.floor(Math.random() * n), fool: foolEl.checked, turn: 0 };
    setup.hidden = true;
    showTurn();
  }

  // 한 사람씩: 폰 받기 → 눌러서 확인 → 가리고 넘기기
  function showTurn() {
    const i = game.turn;
    stage.innerHTML = `
      <div class="liar-card cover">
        <p class="liar-who">${i + 1}번 플레이어</p>
        <p>폰을 받았으면 아래 카드를 눌러<br>제시어를 혼자 확인하세요</p>
        <button class="btn block" data-act="peek">🔍 내 제시어 보기</button>
      </div>
      <p class="game-result">주제: <b>${esc(game.topic)}</b> · ${i + 1} / ${n}</p>`;
    stage.querySelector('[data-act="peek"]').addEventListener('click', () => {
      const isLiar = i === game.liar;
      const text = isLiar && !game.fool ? '당신은 <b class="liar-red">라이어</b>예요' : `제시어: <b>${esc(isLiar ? game.other : game.word)}</b>`;
      stage.innerHTML = `
        <div class="liar-card">
          <p class="liar-who">${i + 1}번 플레이어</p>
          <p class="liar-word">${text}</p>
          ${isLiar && !game.fool ? '<p class="sub">들키지 않게 다른 사람 설명을 듣고 눈치껏 말하세요!</p>' : ''}
          <button class="btn block" data-act="next">${i + 1 < n ? '확인했어요 · 가리고 다음 사람에게' : '확인했어요 · 모두 확인 끝'}</button>
        </div>`;
      stage.querySelector('[data-act="next"]').addEventListener('click', () => {
        game.turn++;
        if (game.turn < n) showTurn();
        else talk();
      });
    });
  }

  // 설명 시간 (타이머) → 투표
  function talk() {
    let left = 180;
    const first = Math.floor(Math.random() * n) + 1;
    stage.innerHTML = `
      <div class="liar-card">
        <p class="liar-who">모두 확인 완료!</p>
        <p><b>${first}번</b>부터 돌아가며 제시어를 한마디씩 설명하세요.<br>너무 쉽게 말하면 라이어가 눈치채요 😏</p>
        <p class="liar-timer">3:00</p>
        <button class="btn block" data-act="vote">투표하러 가기</button>
      </div>`;
    const t = stage.querySelector('.liar-timer');
    timer = setInterval(() => {
      left--;
      t.textContent = `${Math.floor(Math.max(left, 0) / 60)}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`;
      if (left <= 0) {
        clearInterval(timer);
        t.textContent = '시간 끝!';
        buzz(200);
      }
    }, 1000);
    stage.querySelector('[data-act="vote"]').addEventListener('click', () => {
      clearInterval(timer);
      vote();
    });
  }

  function vote() {
    stage.innerHTML = `
      <div class="liar-card">
        <p class="liar-who">하나, 둘, 셋 하면 동시에 라이어를 가리키세요!</p>
        <p>가장 많이 지목된 사람을 고르세요</p>
        <div class="liar-votes">${Array.from({ length: n }, (_, k) => `<button class="chip" data-pick="${k}">${k + 1}번</button>`).join('')}</div>
      </div>`;
    stage.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => reveal(+b.dataset.pick)));
  }

  function reveal(pick) {
    const caught = pick === game.liar;
    stage.innerHTML = `
      <div class="liar-card ${caught ? 'ok' : 'bad'}">
        <p class="liar-who">${caught ? '🎯 라이어를 잡았어요!' : '😈 라이어가 숨어 있었어요!'}</p>
        <p class="liar-word">라이어는 <b>${game.liar + 1}번</b> · 제시어는 <b>${esc(game.word)}</b>${game.fool ? ` <small>(라이어 단어: ${esc(game.other)})</small>` : ''}</p>
        ${caught && !game.fool ? '<p>라이어에게 마지막 기회! 제시어를 맞히면 라이어 승리예요.</p><div class="game-actions"><button class="btn ghost block" data-end="liar">라이어가 맞혔어요</button><button class="btn ghost block" data-end="citizen">못 맞혔어요</button></div>' : ''}
        <p class="game-result" data-role="final">${caught ? (game.fool ? '시민 승리! 🎉' : '') : '라이어 승리! 시민 모두 벌칙 😆'}</p>
        <button class="btn block" data-act="again">한 판 더</button>
      </div>`;
    stage.querySelectorAll('[data-end]').forEach((b) =>
      b.addEventListener('click', () => {
        stage.querySelector('[data-role="final"]').textContent = b.dataset.end === 'liar' ? '라이어 역전승! 😈' : '시민 승리! 🎉';
        stage.querySelectorAll('[data-end]').forEach((x) => (x.disabled = true));
      })
    );
    stage.querySelector('[data-act="again"]').addEventListener('click', start);
  }

  root.querySelectorAll('[data-n]').forEach((b) =>
    b.addEventListener('click', () => {
      n = +b.dataset.n;
      root.querySelectorAll('[data-n]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    })
  );
  root.querySelectorAll('[data-cat]').forEach((b) =>
    b.addEventListener('click', () => {
      cat = b.dataset.cat;
      root.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    })
  );
  root.querySelector('[data-act="start"]').addEventListener('click', start);
  stage.innerHTML = `<div class="liar-card"><p class="liar-who">🕵️ 라이어 게임</p><p>한 명만 제시어를 몰라요. 돌아가며 제시어를 설명하고,<br>거짓말하는 라이어를 투표로 찾아내세요!</p></div>`;
  gameCleanup = () => clearInterval(timer);
}

/* ═════════════════════ 악어 룰렛 ═════════════════════ */

function renderCroc(root) {
  let teeth = 10;
  let bite = -1;
  let over = false;
  root.innerHTML = `
    <div class="croc">
      <div class="croc-top">
        <svg viewBox="0 0 320 110" aria-hidden="true"><path d="M10 100 Q20 20 120 18 L250 26 Q312 32 312 70 L312 100 Z" fill="#4fbf6a"/><circle cx="110" cy="40" r="15" fill="#fff"/><circle cx="114" cy="40" r="7" fill="#1d1b26"/><circle cx="200" cy="40" r="15" fill="#fff"/><circle cx="204" cy="40" r="7" fill="#1d1b26"/><circle cx="285" cy="52" r="4" fill="#2e8a44"/><circle cx="297" cy="60" r="4" fill="#2e8a44"/><path d="M10 100 L312 100" stroke="#2e8a44" stroke-width="6"/></svg>
      </div>
      <div class="croc-teeth"></div>
      <div class="croc-jaw"></div>
    </div>
    <p class="game-result" role="status">이빨을 하나씩 번갈아 눌러 보세요. 하나는 물어요! 🐊</p>
    <div class="game-actions">
      <button class="btn block" data-act="reset">새 판 (다시 시작)</button>
      <button class="btn ghost block" data-act="more">이빨 수 바꾸기</button>
    </div>`;
  const croc = root.querySelector('.croc');
  const box = root.querySelector('.croc-teeth');
  const resultEl = root.querySelector('.game-result');

  function setup() {
    over = false;
    bite = Math.floor(Math.random() * teeth);
    croc.classList.remove('snap');
    box.style.setProperty('--n', teeth);
    box.innerHTML = Array.from({ length: teeth }, (_, i) => `<button class="tooth" data-i="${i}" aria-label="${i + 1}번 이빨"></button>`).join('');
    resultEl.textContent = `이빨 ${teeth}개 중 하나가 물어요! 번갈아 눌러 보세요 🐊`;
  }
  box.addEventListener('click', (e) => {
    const t = e.target.closest('.tooth');
    if (!t || over || t.classList.contains('down')) return;
    if (+t.dataset.i === bite) {
      over = true;
      croc.classList.add('snap');
      t.classList.add('hit');
      buzz([250, 60, 250]);
      gameAudio.unlock();
      gameAudio.boom();
      resultEl.innerHTML = '꽉! 🐊 <b>당첨!</b> 벌칙 받으세요';
    } else {
      t.classList.add('down');
      buzz(15);
      const left = box.querySelectorAll('.tooth:not(.down)').length;
      resultEl.textContent = `휴~ 살았다! 남은 이빨 ${left}개`;
    }
  });
  root.querySelector('[data-act="reset"]').addEventListener('click', setup);
  root.querySelector('[data-act="more"]').addEventListener('click', () => {
    teeth = teeth >= 14 ? 6 : teeth + 2;
    setup();
  });
  setup();
}

/* ═════════════════════ 10초 미니게임 대결 ═════════════════════ */

// 폰 하나를 돌려 가며 한 명씩 도전 → 라운드마다 꼴찌가 벌칙. (여러 폰 동시 접속은 서버가 필요해서 한 폰으로 진행)
const MINI_GAMES = [
  { id: 'tap', title: '5초 연타', desc: '5초 동안 화면을 최대한 많이 누르세요!', better: 'high', unit: '번' },
  { id: 'ten', title: '10초 맞히기', desc: '정확히 10.00초에 멈추세요! (3초 뒤 시계가 사라져요)', better: 'low', unit: '초 차이' },
  { id: 'react', title: '반응 속도', desc: '화면이 초록색으로 바뀌는 순간 누르세요! (먼저 누르면 실격)', better: 'low', unit: 'ms' },
  { id: 'order', title: '1→16 순서대로', desc: '숫자를 1부터 16까지 순서대로 빠르게 누르세요!', better: 'low', unit: '초' },
];

function renderMini(root) {
  const saved = gameStore.get('mini') || { names: '철수\n영희\n민수\n지은' };
  root.innerHTML = `
    <div class="mini-stage"></div>
    <div class="mini-setup">
      <label class="field"><span>참가자 (2~8명)</span><textarea class="names" rows="4">${esc(saved.names)}</textarea></label>
      <button class="btn block" data-act="start">대결 시작</button>
      <p class="lol-hint">한 라운드마다 미니게임이 하나씩 나와요. 폰을 돌려 가며 한 명씩 도전하고, 꼴찌는 벌칙!</p>
    </div>`;
  const stage = root.querySelector('.mini-stage');
  const setupEl = root.querySelector('.mini-setup');
  const ta = root.querySelector('.names');
  let names = [];
  let round = 0;
  let order = shuffle(MINI_GAMES);
  let scores = [];
  let turn = 0;
  let cleanup = () => {};
  const stop = () => { cleanup(); cleanup = () => {}; };

  function start() {
    names = parseNames(ta.value, 8);
    if (names.length < 2) {
      stage.innerHTML = '<p class="game-result">참가자를 2명 이상 넣어 주세요.</p>';
      return;
    }
    gameStore.save('mini', { names: ta.value });
    setupEl.hidden = true;
    round = 0;
    order = shuffle(MINI_GAMES);
    nextRound();
  }
  const mg = () => order[round % order.length];

  function nextRound() {
    scores = [];
    turn = 0;
    ready();
  }

  function ready() {
    stop();
    const g = mg();
    stage.innerHTML = `
      <div class="liar-card">
        <p class="sub">라운드 ${round + 1} · ${turn + 1} / ${names.length}</p>
        <p class="liar-who">🎮 ${esc(g.title)}</p>
        <p>${esc(g.desc)}</p>
        <p class="liar-word"><b>${esc(names[turn])}</b> 차례!</p>
        <button class="btn block" data-act="go">준비됐으면 시작</button>
      </div>`;
    stage.querySelector('[data-act="go"]').addEventListener('click', () => play(g));
  }

  function done(score, label) {
    stop();
    scores[turn] = score;
    stage.innerHTML = `<div class="liar-card"><p class="liar-who">${esc(names[turn])}</p><p class="liar-word">${label}</p><button class="btn block" data-act="next">${turn + 1 < names.length ? '다음 사람에게 넘기기' : '결과 보기'}</button></div>`;
    stage.querySelector('[data-act="next"]').addEventListener('click', () => {
      turn++;
      if (turn < names.length) ready();
      else result();
    });
  }

  function play(g) {
    if (g.id === 'tap') {
      let n = 0;
      let left = 5;
      stage.innerHTML = `<button class="mini-pad">누르세요!<br><b>0</b><small>5.0초</small></button>`;
      const pad = stage.querySelector('.mini-pad');
      const t0 = performance.now();
      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (left <= 0) return;
        n++;
        pad.querySelector('b').textContent = n;
      });
      const iv = setInterval(() => {
        left = 5 - (performance.now() - t0) / 1000;
        pad.querySelector('small').textContent = `${Math.max(left, 0).toFixed(1)}초`;
        if (left <= 0) {
          clearInterval(iv);
          buzz(80);
          setTimeout(() => done(n, `<b>${n}번</b> 눌렀어요!`), 400);
        }
      }, 50);
      cleanup = () => clearInterval(iv);
    } else if (g.id === 'ten') {
      stage.innerHTML = `<div class="mini-ten"><p class="mini-clock">0.00</p><button class="btn block mini-big" data-act="stop">멈춰!</button></div>`;
      const clock = stage.querySelector('.mini-clock');
      const t0 = performance.now();
      const iv = setInterval(() => {
        const t = (performance.now() - t0) / 1000;
        clock.textContent = t < 3 ? t.toFixed(2) : '? ? ?';
      }, 30);
      stage.querySelector('[data-act="stop"]').addEventListener('click', () => {
        clearInterval(iv);
        const t = (performance.now() - t0) / 1000;
        const diff = Math.abs(t - 10);
        done(diff, `<b>${t.toFixed(2)}초</b>에 멈췄어요 (차이 ${diff.toFixed(2)}초)`);
      });
      cleanup = () => clearInterval(iv);
    } else if (g.id === 'react') {
      stage.innerHTML = `<button class="mini-pad wait">기다리세요…<br><small>초록색이 되면 누르기</small></button>`;
      const pad = stage.querySelector('.mini-pad');
      let goAt = 0;
      const to = setTimeout(() => {
        goAt = performance.now();
        pad.className = 'mini-pad go';
        pad.innerHTML = '지금!';
      }, 1500 + Math.random() * 3000);
      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!goAt) {
          clearTimeout(to);
          done(99999, '<b>너무 빨랐어요!</b> 실격 😅');
        } else {
          const ms = Math.round(performance.now() - goAt);
          done(ms, `<b>${ms}ms</b> 만에 눌렀어요!`);
        }
      });
      cleanup = () => clearTimeout(to);
    } else if (g.id === 'order') {
      const nums = shuffle(Array.from({ length: 16 }, (_, i) => i + 1));
      stage.innerHTML = `<p class="game-result">다음: <b data-role="want">1</b></p><div class="mini-grid">${nums.map((v) => `<button data-v="${v}">${v}</button>`).join('')}</div>`;
      let want = 1;
      const t0 = performance.now();
      stage.querySelector('.mini-grid').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-v]');
        if (!b) return;
        e.preventDefault();
        if (+b.dataset.v !== want) {
          b.classList.remove('miss');
          void b.offsetWidth;
          b.classList.add('miss');
          buzz(30);
          return;
        }
        b.classList.add('hit');
        want++;
        if (want > 16) {
          const sec = (performance.now() - t0) / 1000;
          done(sec, `<b>${sec.toFixed(2)}초</b> 걸렸어요!`);
        } else stage.querySelector('[data-role="want"]').textContent = want;
      });
    }
  }

  function result() {
    const g = mg();
    const rank = names.map((nm, i) => ({ nm, s: scores[i] })).sort((a, b) => (g.better === 'high' ? b.s - a.s : a.s - b.s));
    const fmt = (s) => (s >= 99999 ? '실격' : g.id === 'tap' ? `${s}번` : g.id === 'react' ? `${s}ms` : `${s.toFixed(2)}초${g.id === 'ten' ? ' 차이' : ''}`);
    const last = rank[rank.length - 1];
    stage.innerHTML = `
      <div class="liar-card">
        <p class="liar-who">라운드 ${round + 1} 결과 · ${esc(g.title)}</p>
        <ol class="mini-rank">${rank.map((r, i) => `<li class="${i === rank.length - 1 ? 'last' : ''}"><span>${i + 1}</span><b>${esc(r.nm)}</b><em>${fmt(r.s)}</em></li>`).join('')}</ol>
        <p class="game-result">😈 꼴찌 <b>${esc(last.nm)}</b> 벌칙 당첨!</p>
        <div class="game-actions"><button class="btn block" data-act="next">다음 라운드</button><button class="btn ghost block" data-act="end">그만하기</button></div>
      </div>`;
    buzz([120, 60, 120]);
    stage.querySelector('[data-act="next"]').addEventListener('click', () => {
      round++;
      nextRound();
    });
    stage.querySelector('[data-act="end"]').addEventListener('click', () => {
      stage.innerHTML = '';
      setupEl.hidden = false;
    });
  }

  root.querySelector('[data-act="start"]').addEventListener('click', start);
  gameCleanup = stop;
}

/* ═════════════════════ 카드 짝 맞추기 ═════════════════════ */

// 테마별 그림 (한 판에 같은 테마로만 나와서 더 예쁘게)
const MEMORY_SETS = {
  동물: ['🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🐧', '🐯', '🦁', '🐨', '🐷', '🐹', '🐻', '🐮'],
  과일: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🍋', '🍉', '🥥', '🫐', '🍊', '🍐'],
  간식: ['🍩', '🍪', '🧁', '🍰', '🍦', '🍭', '🍫', '🍿', '🥨', '🧇', '🍬', '🥐', '🍮', '🍡'],
  우주: ['🚀', '🪐', '🌙', '⭐', '☄️', '🛸', '🌍', '☀️', '👽', '🌈', '⚡', '🌟', '🔭', '🌠'],
};
// 짝마다 서로 다른 그라데이션 (한 판 안에서 색이 겹치지 않게 짝 순서대로 나눠 줌)
const MEMORY_GRADS = [
  ['#ff9a9e', '#fecfef'], ['#a1c4fd', '#c2e9fb'], ['#84fab0', '#8fd3f4'], ['#fbc2eb', '#a6c1ee'],
  ['#fddb92', '#f6a96b'], ['#c3a6ff', '#8ec5fc'], ['#ffecd2', '#fcb69f'], ['#a8edea', '#7ed6c1'],
  ['#f6d365', '#fda085'], ['#d4fc79', '#96e6a1'], ['#ff8fb1', '#ffc3a0'], ['#b8c6ff', '#e0c3fc'],
];

function renderMemory(root) {
  const saved = gameStore.get('memory') || { pairs: 8, two: false, theme: '동물' };
  let pairs = saved.pairs;
  let two = saved.two;
  let theme = MEMORY_SETS[saved.theme] ? saved.theme : '동물';
  root.innerHTML = `
    <div class="opt-row" role="group" aria-label="테마">
      ${Object.keys(MEMORY_SETS).map((t) => `<button class="chip" data-theme="${t}" aria-pressed="${t === theme}">${MEMORY_SETS[t][0]} ${t}</button>`).join('')}
    </div>
    <div class="opt-row" role="group" aria-label="카드 수">
      ${[6, 8, 10, 12].map((p) => `<button class="chip" data-p="${p}" aria-pressed="${p === pairs}">${p * 2}장</button>`).join('')}
      <button class="chip" data-two aria-pressed="${two}">👥 2인 대결</button>
    </div>
    <p class="game-result" role="status"></p>
    <div class="mem-grid"></div>
    <div class="game-actions">
      <button class="btn block" data-act="reset">새 게임</button>
      <button class="btn ghost block" data-act="hint">힌트 (1초 다시 보기)</button>
    </div>`;
  const grid = root.querySelector('.mem-grid');
  const resultEl = root.querySelector('.game-result');
  let cards = [];
  let open = [];
  let lock = true;
  let moves = 0;
  let found = 0;
  let t0 = 0;
  let turn = 0;
  let score = [0, 0];
  let hints = 0;
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const best = () => gameStore.get('memory-best-' + pairs);

  function status(msg) {
    if (two) resultEl.innerHTML = `${msg ? msg + '<br>' : ''}<small class="sub">${turn === 0 ? '👉 ' : ''}1번 ${score[0]}점 · ${turn === 1 ? '👉 ' : ''}2번 ${score[1]}점</small>`;
    else {
      const b = best();
      resultEl.innerHTML = `${msg ? msg + '<br>' : ''}<small class="sub">${moves}번 뒤집음 · 찾은 짝 ${found}/${pairs}${b ? ` · 최고 ${b.moves}번(${b.sec}초)` : ''}</small>`;
    }
  }

  // 모든 카드를 잠깐 보여 줬다가 덮음 (시작할 때 외우기, 힌트)
  function peek(ms, msg, after) {
    lock = true;
    grid.querySelectorAll('.mem-card:not(.done)').forEach((c) => c.classList.add('open'));
    status(msg);
    timers.push(
      setTimeout(() => {
        grid.querySelectorAll('.mem-card:not(.done)').forEach((c) => c.classList.remove('open'));
        timers.push(setTimeout(() => { lock = false; after && after(); }, 420));
      }, ms)
    );
  }

  function setup() {
    clear();
    gameStore.save('memory', { pairs, two, theme });
    const faces = shuffle(MEMORY_SETS[theme]).slice(0, pairs);
    const pick = faces.map((_, i) => i); // 짝 번호 0..pairs-1 → 그림·색
    cards = shuffle([...pick, ...pick]);
    open = [];
    moves = 0;
    found = 0;
    t0 = 0;
    turn = 0;
    hints = 0;
    score = [0, 0];
    const cols = pairs <= 8 ? 4 : pairs <= 10 ? 5 : 6;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--rows', Math.ceil((pairs * 2) / cols));
    grid.style.setProperty('--grid-top', `${(document.querySelector('.topbar')?.offsetHeight || 56) + resultEl.offsetHeight + 24}px`);
    focusBoard(resultEl);
    grid.innerHTML = cards
      .map((f, i) => {
        const [c1, c2] = MEMORY_GRADS[f % MEMORY_GRADS.length];
        return `<button class="mem-card" data-i="${i}" aria-label="카드"><span class="mem-in"><span class="mem-back"><img src="/icons/logo.svg" alt=""></span><span class="mem-front" style="--c1:${c1};--c2:${c2}"><i>${faces[f]}</i></span></span></button>`;
      })
      .join('');
    // 시작할 때 전체를 한 번 보여 줌 (카드가 많을수록 조금 더 길게)
    let n = 3;
    const sec = pairs <= 6 ? 3 : pairs <= 8 ? 4 : 5;
    n = sec;
    peek(sec * 1000, `👀 외우세요! ${n}`, () => status(two ? '1번부터 카드 두 장을 뒤집어 보세요' : '같은 그림 두 장을 찾아보세요'));
    const cd = () => {
      n--;
      if (n > 0) {
        status(`👀 외우세요! ${n}`);
        timers.push(setTimeout(cd, 1000));
      }
    };
    timers.push(setTimeout(cd, 1000));
  }

  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.mem-card');
    if (!c || lock || c.classList.contains('open') || c.classList.contains('done')) return;
    if (!t0) t0 = performance.now();
    c.classList.add('open');
    open.push(c);
    if (open.length < 2) return;
    moves++;
    const [a, b] = open;
    if (cards[a.dataset.i] === cards[b.dataset.i]) {
      open = [];
      found++;
      buzz(30);
      if (two) score[turn]++;
      // 다 뒤집힌 뒤에 '찾음' 표시 (뒤집는 중 끊겨 보이지 않게)
      timers.push(setTimeout(() => { a.classList.add('done'); b.classList.add('done'); }, 380));
      if (found === pairs) {
        const sec = Math.round((performance.now() - t0) / 1000);
        if (two) {
          status(score[0] === score[1] ? '무승부!' : `🏆 ${score[0] > score[1] ? 1 : 2}번 승리!`);
        } else {
          const b0 = best();
          const isBest = !hints && (!b0 || moves < b0.moves || (moves === b0.moves && sec < b0.sec));
          if (isBest) gameStore.save('memory-best-' + pairs, { moves, sec });
          status(`🎉 다 찾았어요! ${moves}번 만에 ${sec}초${isBest ? ' · 최고 기록!' : hints ? ' (힌트 사용)' : ''}`);
        }
      } else status(two ? `짝 찾기! ${turn + 1}번 한 번 더` : '짝을 찾았어요! 👏');
    } else {
      lock = true;
      timers.push(
        setTimeout(() => {
          a.classList.remove('open');
          b.classList.remove('open');
          open = [];
          timers.push(setTimeout(() => { lock = false; }, 300));
          if (two) turn = 1 - turn;
          status(two ? `${turn + 1}번 차례` : '');
        }, 750)
      );
    }
  });
  root.querySelectorAll('[data-p]').forEach((b) =>
    b.addEventListener('click', () => {
      pairs = +b.dataset.p;
      root.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      setup();
    })
  );
  root.querySelectorAll('[data-theme]').forEach((b) =>
    b.addEventListener('click', () => {
      theme = b.dataset.theme;
      root.querySelectorAll('[data-theme]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      setup();
    })
  );
  root.querySelector('[data-two]').addEventListener('click', (e) => {
    two = !two;
    e.currentTarget.setAttribute('aria-pressed', two);
    setup();
  });
  root.querySelector('[data-act="reset"]').addEventListener('click', setup);
  root.querySelector('[data-act="hint"]').addEventListener('click', () => {
    if (lock || found === pairs) return;
    open.forEach((c) => c.classList.remove('open'));
    open = [];
    hints++;
    peek(1000, '👀 힌트!', () => status(''));
  });
  setup();
  gameCleanup = clear;
}

/* ═════════════════════ 사과 게임 (합이 10) ═════════════════════ */

// 숫자 사과판에서 네모로 드래그해 묶은 숫자의 합이 10이면 사과가 사라짐. 60초·120초 중 골라서 최대한 많이!
function renderApple(root) {
  const wide = window.innerWidth >= 720;
  const COLS = wide ? 17 : 10;
  const ROWS = wide ? 10 : 15;
  let LIMIT = (gameStore.get('apple') || {}).limit || 120;
  root.innerHTML = `
    <div class="opt-row" role="group" aria-label="제한 시간">
      ${[60, 120].map((t) => `<button class="chip" data-limit="${t}" aria-pressed="${t === LIMIT}">${t}초</button>`).join('')}
    </div>
    <div class="apple-bar"><span class="apple-score">0개</span><span class="apple-time"><i></i></span><span class="apple-best"></span></div>
    <div class="apple-board" style="--cols:${COLS};--rows:${ROWS}"></div>
    <p class="game-result" role="status">손가락(마우스)으로 네모를 그려서 숫자 합이 <b>10</b>이 되게 묶으세요!</p>
    <div class="game-actions">
      <button class="btn block" data-act="start">시작</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>`;
  const board = root.querySelector('.apple-board');
  const scoreEl = root.querySelector('.apple-score');
  const bar = root.querySelector('.apple-time i');
  const bestEl = root.querySelector('.apple-best');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  let nums = [];
  let score = 0;
  let playing = false;
  let t0 = 0;
  let raf = 0;
  let sel = null;
  // 판 크기를 화면 높이에 맞춤: 위쪽 메뉴·시간 막대를 뺀 높이 안에 판 전체가 들어가게
  const fit = () => {
    const top = (document.querySelector('.topbar')?.offsetHeight || 60) + root.querySelector('.apple-bar').offsetHeight + 28;
    board.style.setProperty('--apple-top', `${top}px`);
  };
  fit();
  window.addEventListener('resize', fit);
  const showBest = () => {
    const b = gameStore.get('apple-best-' + LIMIT);
    bestEl.textContent = b ? `${LIMIT}초 최고 ${b}개` : '';
  };

  function make() {
    // 전체 합이 10의 배수가 되게 만들어 끝까지 지울 여지를 남김
    nums = Array.from({ length: COLS * ROWS }, () => 1 + Math.floor(Math.random() * 9));
    const r = nums.reduce((a, b) => a + b, 0) % 10;
    if (r) nums[nums.length - 1] = ((nums[nums.length - 1] - 1 + (10 - r)) % 9) + 1;
    board.innerHTML = nums.map((n, i) => `<span class="apple" data-i="${i}">${n}</span>`).join('');
    score = 0;
    scoreEl.textContent = '0개';
    bar.style.width = '100%';
    showBest();
  }
  const cellAt = (x, y) => {
    const r = board.getBoundingClientRect();
    const c = Math.min(COLS - 1, Math.max(0, Math.floor(((x - r.left) / r.width) * COLS)));
    const w = Math.min(ROWS - 1, Math.max(0, Math.floor(((y - r.top) / r.height) * ROWS)));
    return [c, w];
  };
  function paintSel() {
    board.querySelectorAll('.apple.sel').forEach((a) => a.classList.remove('sel'));
    if (!sel) return 0;
    const [c1, r1] = sel.a;
    const [c2, r2] = sel.b;
    let sum = 0;
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
        const i = r * COLS + c;
        if (nums[i]) {
          sum += nums[i];
          board.children[i].classList.add('sel');
        }
      }
    board.classList.toggle('ten', sum === 10);
    return sum;
  }
  board.addEventListener('pointerdown', (e) => {
    if (!playing) return;
    e.preventDefault();
    board.setPointerCapture(e.pointerId);
    const p = cellAt(e.clientX, e.clientY);
    sel = { a: p, b: p };
    paintSel();
  });
  board.addEventListener('pointermove', (e) => {
    if (!sel) return;
    sel.b = cellAt(e.clientX, e.clientY);
    paintSel();
  });
  const finishSel = () => {
    if (!sel) return;
    const sum = paintSel();
    if (sum === 10) {
      const gone = [...board.querySelectorAll('.apple.sel')];
      gone.forEach((a) => {
        nums[a.dataset.i] = 0;
        a.classList.add('gone');
        a.textContent = '';
      });
      score += gone.length;
      scoreEl.textContent = `${score}개`;
      buzz(20);
    }
    sel = null;
    paintSel();
    board.classList.remove('ten');
  };
  board.addEventListener('pointerup', finishSel);
  board.addEventListener('pointercancel', finishSel);

  function tick() {
    const left = LIMIT - (performance.now() - t0) / 1000;
    bar.style.width = `${Math.max(0, (left / LIMIT) * 100)}%`;
    bar.classList.toggle('low', left < 15);
    if (left <= 0) return end();
    raf = requestAnimationFrame(tick);
  }
  function start() {
    make();
    playing = true;
    t0 = performance.now();
    startBtn.disabled = true;
    // 시간 막대가 맨 위에 오게 내려서 판 전체가 한 화면에 보이게
    fit();
    focusBoard(root.querySelector('.apple-bar'));
    resultEl.innerHTML = `합이 <b>10</b>이 되게 네모로 묶으세요! ${LIMIT}초!`;
    raf = requestAnimationFrame(tick);
  }
  function end() {
    playing = false;
    sel = null;
    paintSel();
    startBtn.disabled = false;
    startBtn.textContent = '한 판 더';
    const b = gameStore.get('apple-best-' + LIMIT) || 0;
    if (score > b) gameStore.save('apple-best-' + LIMIT, score);
    resultEl.innerHTML = `⏰ 끝! 사과 <b>${score}개</b>${score > b ? ' · 최고 기록! 🎉' : ''}`;
    showBest();
    buzz([100, 50, 100]);
  }
  startBtn.addEventListener('click', start);
  root.querySelectorAll('[data-limit]').forEach((b) =>
    b.addEventListener('click', () => {
      if (playing) return;
      LIMIT = +b.dataset.limit;
      gameStore.save('apple', { limit: LIMIT });
      root.querySelectorAll('[data-limit]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      showBest();
    })
  );
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    cancelAnimationFrame(raf);
    playing = false;
    startBtn.disabled = false;
    startBtn.textContent = '시작';
    make();
    resultEl.innerHTML = '손가락(마우스)으로 네모를 그려서 숫자 합이 <b>10</b>이 되게 묶으세요!';
  });
  make();
  gameCleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', fit);
  };
}

/* ═════════════════════ 균형 잡기 (황새 오래 걷기) ═════════════════════ */

// 황새가 외나무다리를 걸어가요. 몸이 기울면 반대쪽을 눌러 균형을 잡으세요. 넘어지면 끝!
function renderBalance(root) {
  root.innerHTML = `
    <div class="bal-wrap">
      <canvas class="bal-canvas" width="360" height="420" aria-label="균형 잡기"></canvas>
      <button class="bal-btn left" aria-label="왼쪽으로">◀</button>
      <button class="bal-btn right" aria-label="오른쪽으로">▶</button>
    </div>
    <p class="game-result" role="status">기울어지는 반대쪽 버튼을 꾹 눌러 균형을 잡으세요! (키보드 ← →)</p>
    <div class="game-actions">
      <button class="btn block" data-act="start">출발</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>`;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  let st = null;
  let raf = 0;
  const press = { l: false, r: false };

  const reset = () => {
    st = { a: 0, w: 0, dist: 0, t: 0, alive: false, gust: 0, step: 0, speed: 1.2 };
    draw();
  };

  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#bfe3ff');
    sky.addColorStop(1, '#eaf6ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    // 흘러가는 구름·물
    const off = (st.dist * 40) % W;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    [[60, 70], [250, 110], [160, 40]].forEach(([x, y]) => {
      const cx = ((x - off * 0.3) % (W + 80) + W + 80) % (W + 80) - 40;
      ctx.beginPath();
      ctx.ellipse(cx, y, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#5aa9e6';
    ctx.fillRect(0, H - 90, W, 90);
    // 외나무다리
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, H - 104, W, 16);
    ctx.fillStyle = '#6b4220';
    for (let x = -off; x < W; x += 40) ctx.fillRect(x, H - 104, 3, 16);
    // 황새 (발을 축으로 기울어짐)
    const fx = W / 2;
    const fy = H - 104;
    ctx.save();
    ctx.translate(fx, fy);
    // 발을 축으로 다리·몸통이 한 덩어리로 기울어짐
    ctx.rotate(st.a);
    // 다리 (걸음)
    const s = Math.sin(st.step) * 10;
    ctx.strokeStyle = '#e8623a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6 + s, 0);
    ctx.lineTo(-2, -70);
    ctx.moveTo(6 - s, 0);
    ctx.lineTo(2, -70);
    ctx.stroke();
    // 몸통
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#2d3142';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -100, 34, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2d3142';
    ctx.beginPath();
    ctx.ellipse(-22, -98, 18, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // 목·머리
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(16, -116);
    ctx.quadraticCurveTo(30, -150, 22, -176);
    ctx.stroke();
    ctx.strokeStyle = '#2d3142';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(22, -182, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e0312b';
    ctx.beginPath();
    ctx.arc(22, -188, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3142';
    ctx.beginPath();
    ctx.arc(26, -184, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a33a';
    ctx.beginPath();
    ctx.moveTo(32, -184);
    ctx.lineTo(58, -178);
    ctx.lineTo(32, -176);
    ctx.fill();
    // 날개 (누르는 쪽으로 펼침)
    ctx.fillStyle = '#2d3142';
    if (press.l) {
      ctx.beginPath();
      ctx.moveTo(-10, -110);
      ctx.lineTo(-70, -130);
      ctx.lineTo(-30, -96);
      ctx.fill();
    }
    if (press.r) {
      ctx.beginPath();
      ctx.moveTo(10, -110);
      ctx.lineTo(70, -130);
      ctx.lineTo(30, -96);
      ctx.fill();
    }
    ctx.restore();
    // 기울기 막대 + 거리
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(W / 2 - 100, 18, 200, 10);
    const lim = 1.15;
    ctx.fillStyle = Math.abs(st.a) > lim * 0.7 ? '#e0312b' : '#2bb24c';
    ctx.fillRect(W / 2 - 3 + (st.a / lim) * 100, 14, 6, 18);
    ctx.fillStyle = '#1d1b26';
    ctx.font = '900 26px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${st.dist.toFixed(1)} m`, W / 2, 62);
    if (st.speed > 1.3) {
      ctx.font = '800 15px Pretendard, sans-serif';
      ctx.fillStyle = st.speed > 4 ? '#e0312b' : '#4a4560';
      ctx.fillText(`${st.speed > 4 ? '🔥 ' : '🏃 '}초속 ${st.speed.toFixed(1)}m`, W / 2, 84);
    }
  }

  function loop(prev) {
    raf = requestAnimationFrame((now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      st.t += dt;
      // 시간이 갈수록 걸음이 빨라지고(최대 초속 6m), 빨라질수록 몸이 더 흔들려 균형 잡기가 어려워짐
      st.speed = Math.min(6, 1.2 + st.t * 0.08);
      const level = 1 + (st.speed - 1.2) * 0.35;
      // 바람: 빨라질수록 더 자주, 더 세게
      if (Math.random() < dt * (0.6 + st.t * 0.03)) st.gust = (Math.random() - 0.5) * 1.4 * level;
      const push = (press.r ? 1 : 0) - (press.l ? 1 : 0);
      // 기울수록 더 넘어지려 함 + 바람 + 걸음마다 흔들림 + ◀(뒤)·▶(앞) 버튼 힘
      const wobble = Math.sin(st.step) * 0.25 * st.speed;
      st.w += (Math.sin(st.a) * 2.2 * level + st.gust + wobble + push * 4.0) * dt;
      st.w *= 1 - 1.6 * dt;
      st.a += st.w * dt;
      st.dist += dt * st.speed;
      st.step += dt * (4 + st.speed * 2.2);
      draw();
      if (Math.abs(st.a) > 1.15) return fall();
      loop(now);
    });
  }
  function start() {
    reset();
    focusBoard(root.querySelector('.bal-wrap'));
    st.alive = true;
    st.a = (Math.random() - 0.5) * 0.1;
    startBtn.disabled = true;
    resultEl.textContent = '균형을 잡으세요!';
    loop(performance.now());
  }
  function fall() {
    st.alive = false;
    buzz([200, 60, 200]);
    const best = gameStore.get('balance-best') || 0;
    if (st.dist > best) gameStore.save('balance-best', +st.dist.toFixed(1));
    resultEl.innerHTML = `💦 풍덩! <b>${st.dist.toFixed(1)} m</b> 걸었어요${st.dist > best ? ' · 최고 기록! 🎉' : best ? ` (최고 ${best} m)` : ''}`;
    startBtn.disabled = false;
    startBtn.textContent = '다시 도전';
  }
  const bind = (el, k) => {
    const on = (e) => { e.preventDefault(); press[k] = true; };
    const off = () => { press[k] = false; };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  };
  bind(root.querySelector('.bal-btn.left'), 'l');
  bind(root.querySelector('.bal-btn.right'), 'r');
  const key = (e) => {
    if (e.key === 'ArrowLeft') press.l = e.type === 'keydown';
    if (e.key === 'ArrowRight') press.r = e.type === 'keydown';
  };
  window.addEventListener('keydown', key);
  window.addEventListener('keyup', key);
  startBtn.addEventListener('click', start);
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    cancelAnimationFrame(raf);
    startBtn.disabled = false;
    startBtn.textContent = '출발';
    reset();
    resultEl.textContent = '기울어지는 반대쪽 버튼을 꾹 눌러 균형을 잡으세요! (키보드 ← →)';
  });
  reset();
  gameCleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', key);
    window.removeEventListener('keyup', key);
  };
}
