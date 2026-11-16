// 뽑기 게임 9종: 구슬 추첨 · 경주마 · 사다리 타기 · 돌림판 · 제비뽑기 · 폭탄 돌리기 · 팀 나누기 · 롤 내전 팀 짜기 · 주사위·동전.
// 주소: /games/ (목록), /game/<게임 id>/
// 모든 게임에 '다시 시작' 버튼, 구슬·경주마는 3·2·1 카운트다운 + 중계 문구 + 막판 슬로모션.
'use strict';

const GAMES = [
  { id: 'reaction', title: '반응속도 테스트', desc: '초록색으로 바뀌는 순간 톡! 5번 평균으로 내 반응속도 등급 확인', cover: () => COVERS['game-reaction'] },
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
  { id: 'mini', title: '10초 미니게임 대결', desc: '연타·10초 맞히기·풍선 등 10종, 판마다 점수 쌓아 종합 순위', cover: () => COVERS['game-mini'] },
  { id: 'aim', title: '풍선 터뜨리기', desc: '떠다니는 풍선 10개를 누가 더 빨리 터뜨릴까', cover: () => COVERS['game-aim'] },
  { id: 'track', title: '꿀벌 따라가기', desc: '6초 동안 꿀벌에서 손가락을 떼지 마세요', cover: () => COVERS['game-track'] },
  { id: 'rhythm', title: '박자 맞추기', desc: '내려오는 북을 선에 맞춰 톡톡, 리듬 게임', cover: () => COVERS['game-rhythm'] },
  { id: 'last', title: '마지막 한 방', desc: '용 체력 900 이하에서 딱 한 번에 처치', cover: () => COVERS['game-last'] },
  { id: 'gauge', title: '초록 칸에 멈춰', desc: '왔다 갔다 하는 막대를 초록 칸 한가운데에', cover: () => COVERS['game-gauge'] },
  { id: 'combo', title: '글자 콤보', desc: '나오는 글자 8개를 순서대로 빠르게', cover: () => COVERS['game-combo'] },
  { id: 'stroop', title: '색깔 헷갈림', desc: '글자 말고 글자 색을 골라요, 은근 어려움', cover: () => COVERS['game-stroop'] },
  { id: 'simon', title: '순서 기억하기', desc: '깜빡이는 순서를 기억해서 그대로 누르기', cover: () => COVERS['game-simon'] },
  { id: 'dodge', title: '별똥별 피하기', desc: '우주선을 끌어서 별똥별을 피해 오래 버티기', cover: () => COVERS['game-dodge'] },
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
// 게임판 한가운데에 띄우는 큰 시작 버튼. show(라벨)로 다시 띄우고, 누르면 hidden 처리는 각 게임이 함
function boardStart(label, sub, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'board-start';
  b.show = (l) => {
    if (l) label = l;
    b.innerHTML = `<b>▶ ${label}</b><small>${sub()}</small>`;
    b.hidden = false;
  };
  b.show();
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

function focusBoard(el) {
  if (!el || window.innerWidth > 760) return;
  const y = el.getBoundingClientRect().top + window.scrollY - (document.querySelector('.topbar')?.offsetHeight || 56) - 8;
  if (Math.abs(window.scrollY - y) > 24) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

// 게임 결과 자랑: 내 기록이 담긴 링크(/game/<id>/?vs=기록)를 만들어 준다 — 받은 친구는 그 기록에 도전
function shareGame(g, text, score, host) {
  const url = `${location.origin}/game/${g.id}/?vs=${Math.round(score * 100) / 100}`;
  shareBox(host, text, url);
}
// 자랑 링크로 들어왔을 때 친구 기록 (없거나 이상한 값이면 null)
function challengeScore(g) {
  if (location.pathname.replace(/\/+$/, '') !== `/game/${g.id}`) return null;
  const raw = new URLSearchParams(location.search).get('vs');
  const v = Number(raw);
  return raw && Number.isFinite(v) && v >= 0 && v < FAIL_LOW ? v : null;
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
    sfx(i < steps.length - 1 ? 'tick' : 'ok');
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
const NEW_GAMES = ['reaction', 'aim', 'track', 'rhythm', 'last', 'gauge', 'combo', 'stroop', 'simon', 'dodge'];

// 게임 참여 수는 퀴즈와 같은 집계 서버에 'game-<id>'로 셈 (하루 한 번, 익명) — 순서 정할 때만 쓰고 화면엔 안 보여 줌
const gamePlays = (plays, g) => plays['game-' + g.id] || 0;
// 참여 수와 상관없이 목록 맨 앞에 두는 게임
const PINNED_GAMES = ['reaction'];
function popularGames(plays, n) {
  const order = new Map(GAMES.map((g, i) => [g.id, i]));
  const pin = (g) => (PINNED_GAMES.includes(g.id) ? PINNED_GAMES.length - PINNED_GAMES.indexOf(g.id) : 0);
  return [...GAMES].sort((a, b) => pin(b) - pin(a) || gamePlays(plays, b) - gamePlays(plays, a) || order.get(a.id) - order.get(b.id)).slice(0, n);
}

function gameCardHtml(g, { rank } = {}) {
  return `
    <a class="card" href="/game/${g.id}/">
      <div class="cover"><img class="full" src="${g.cover()}" alt="">${NEW_GAMES.includes(g.id) ? '<span class="new-tag">NEW</span>' : ''}${
        rank ? `<span class="rank-no">${rank}</span>` : ''
      }</div>
      <div class="card-body">
        <h2 class="card-title">${esc(g.title)}</h2>
        <div class="card-meta">${esc(g.desc)}</div>
      </div>
    </a>`;
}

function renderGamesHome() {
  document.title = '게임 · 맞혀봐';
  const draw = () => {
    const grid = app.querySelector('.games-grid');
    const plays = counts.get();
    if (grid) grid.innerHTML = popularGames(plays, GAMES.length).map((g) => gameCardHtml(g)).join('');
  };
  app.innerHTML = `
    <div class="games-home">
      <section class="hero">
        <h1>모일 때 꼭 필요한<br>뽑기 게임</h1>
        <p>누가 쏠지, 누가 갈지 공정하게 정해 보세요</p>
      </section>
      <div class="games-grid"></div>
      <section class="about">
        <h2>모임을 더 재밌게 만드는 무료 게임</h2>
        <p>내 손이 얼마나 빠른지 재 보는 반응속도 테스트와, 순서·당번·벌칙을 공정하게 정하는 구슬 추첨, 경주마, 사다리 타기, 돌림판, 제비뽑기와, 여럿이 휴대폰 하나로 즐기는 라이어 게임, 폭탄 돌리기, 10초 미니게임 대결, 악어 룰렛이 있어요. 풍선 터뜨리기·꿀벌 따라가기·박자 맞추기·마지막 한 방·초록 칸에 멈춰·글자 콤보·색깔 헷갈림·순서 기억하기·별똥별 피하기는 혼자 기록에 도전해도 되고, 여럿이 돌아가며 꼴찌 벌칙을 정해도 돼요. 혼자 기록에 도전하는 사과 게임, 카드 짝 맞추기, 균형 잡기도 있어요.</p>
        <p>설치나 회원가입 없이 바로 쓸 수 있고, 입력한 이름과 설정은 다음에 다시 쓸 수 있게 내 기기에만 저장돼요. 게임마다 하는 방법과 활용 팁을 아래에 적어 두었어요.</p>
      </section>
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
    <div class="game-body"></div>
    ${gameAboutHtml(game)}`;
  app.querySelector('[data-act="home"]').addEventListener('click', () => nav('/games/'));
  const body = app.querySelector('.game-body');
  ({ wheel: renderWheel, ladder: renderLadder, marble: renderMarble, horse: renderHorse, lots: renderLots, bomb: renderBomb, teams: renderTeams, lol: renderLol, dice: renderDice, liar: renderLiar, croc: renderCroc, mini: renderMini, memory: renderMemory, apple: renderApple, balance: renderBalance, ...SOLO_RENDER })[id](body);
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
      <canvas class="wheel-canvas" width="400" height="400" aria-label="돌림판 (끌어서 휙 돌려도 돼요)"></canvas>
    </div>
    <p class="wheel-live" aria-hidden="true"></p>
    <p class="game-result" role="status">항목을 넣고 돌려 보세요. 판을 손가락으로 휙 돌려도 돼요!</p>
    <div class="game-actions">
      <button class="btn block" data-act="spin">돌리기</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <button class="btn ghost block" data-act="remove" hidden>당첨 항목 빼고 다시 돌리기</button>
    <div class="wheel-hist" hidden></div>
    <div class="opt-row" role="group" aria-label="항목 모음">
      ${Object.keys(WHEEL_PRESETS).map((k) => `<button class="chip" data-preset="${k}">${k}</button>`).join('')}
    </div>
    <label class="field">
      <span>항목 (한 줄에 하나, 또는 쉼표 · '치킨*3'처럼 쓰면 칸이 3배로 커져요 · 최대 30개)</span>
      <textarea class="names" rows="6">${esc(saved.items)}</textarea>
    </label>`;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  // 레티나에서도 선명하게 (그리는 좌표는 400×400)
  const DPR = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = 400 * DPR;
  canvas.height = 400 * DPR;
  const SIZE = 400;
  const ta = root.querySelector('.names');
  const resultEl = root.querySelector('.game-result');
  const liveEl = root.querySelector('.wheel-live');
  const pointer = root.querySelector('.wheel-pointer');
  const removeBtn = root.querySelector('[data-act="remove"]');
  const spinBtn = root.querySelector('[data-act="spin"]');
  const histEl = root.querySelector('.wheel-hist');
  let angle = 0;
  let spinning = false;
  let raf = 0;
  let lastWinner = -1;
  let glow = 0; // 당첨 칸 반짝임 (0~1)
  let bulbs = 0; // 테두리 전구 깜빡임 단계
  let confetti = [];
  let history = [];

  // 항목: '치킨*3' → 칸 비율 3
  const items = () =>
    parseNames(ta.value, 30).map((raw) => {
      const m = raw.match(/^(.+?)\s*[*×xX]\s*(\d{1,2})$/);
      return { label: m ? m[1].trim() : raw, w: m ? Math.max(1, Math.min(20, +m[2])) : 1, raw };
    });
  function slices(list) {
    const sum = list.reduce((a, b) => a + b.w, 0) || 1;
    let acc = 0;
    return list.map((it, i) => {
      const a0 = (acc / sum) * Math.PI * 2;
      acc += it.w;
      return { ...it, i, a0, a1: (acc / sum) * Math.PI * 2, pct: Math.round((it.w / sum) * 100) };
    });
  }

  function draw(highlight = -1) {
    const list = items();
    const sl = list.length ? slices(list) : [{ label: '', a0: 0, a1: Math.PI * 2, i: 0, w: 1 }];
    const r = SIZE / 2 - 18;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    // 바깥 테두리 + 그림자
    ctx.save();
    ctx.shadowColor = 'rgba(30,20,60,.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, r + 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3b2f6b';
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(SIZE / 2, SIZE / 2);
    ctx.rotate(angle);
    const n = sl.length;
    for (const s of sl) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, s.a0, s.a1);
      ctx.closePath();
      const base = list.length ? gameColor(s.i, n) : '#ddd';
      const gr = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      gr.addColorStop(0, '#ffffff');
      gr.addColorStop(0.25, base);
      gr.addColorStop(1, base);
      ctx.fillStyle = gr;
      ctx.fill();
      if (s.i === highlight) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + glow * 0.4})`;
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,.95)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      if (s.label) {
        ctx.save();
        const mid = (s.a0 + s.a1) / 2;
        ctx.rotate(mid);
        // 왼쪽 반에 온 글자는 뒤집어서 거꾸로 보이지 않게
        const flip = Math.cos(mid + angle) < 0;
        if (flip) ctx.rotate(Math.PI);
        const tx = flip ? -(r - 16) : r - 16;
        ctx.textAlign = flip ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        const span = s.a1 - s.a0;
        const fs = Math.max(11, Math.min(22, span * r * 0.42));
        ctx.font = `800 ${fs}px Pretendard, -apple-system, sans-serif`;
        const label = s.label.length > 10 ? s.label.slice(0, 9) + '…' : s.label;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.strokeText(label, tx, 0);
        ctx.fillStyle = '#1d1b26';
        ctx.fillText(label, tx, 0);
        if (s.w > 1 && span > 0.35) {
          ctx.font = `700 ${Math.max(10, fs * 0.6)}px Pretendard, sans-serif`;
          ctx.fillStyle = 'rgba(29,27,38,.65)';
          ctx.fillText(`${s.pct}%`, tx, fs * 0.85);
        }
        ctx.restore();
      }
    }
    ctx.restore();
    // 테두리 전구 (돌 때 번갈아 깜빡)
    const NB = 24;
    for (let k = 0; k < NB; k++) {
      const a = (k / NB) * Math.PI * 2;
      const on = (k + bulbs) % 2 === 0;
      ctx.beginPath();
      ctx.arc(SIZE / 2 + Math.cos(a) * (r + 6), SIZE / 2 + Math.sin(a) * (r + 6), 4, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#ffe066' : '#8a7fc0';
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = on ? 8 : 0;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    // 가운데 손잡이
    const hub = ctx.createRadialGradient(SIZE / 2 - 8, SIZE / 2 - 8, 2, SIZE / 2, SIZE / 2, 30);
    hub.addColorStop(0, '#ffffff');
    hub.addColorStop(1, '#d9d2ff');
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 28, 0, Math.PI * 2);
    ctx.fillStyle = hub;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#7c5cff';
    ctx.stroke();
    ctx.font = '900 13px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7c5cff';
    ctx.fillText(spinning ? '…' : 'GO', SIZE / 2, SIZE / 2 + 1);
    // 당첨 꽃가루
    for (const c of confetti) {
      ctx.globalAlpha = Math.max(0, c.life);
      ctx.fillStyle = c.c;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // 위쪽 바늘이 가리키는 칸 번호
  function pointed() {
    const sl = slices(items());
    let a = (-Math.PI / 2 - angle) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    const s = sl.find((x) => a >= x.a0 && a < x.a1);
    return s ? s.i : sl.length - 1;
  }

  // 당첨 뒤 1.6초: 칸 반짝임 + 꽃가루
  function celebrate(idx) {
    const cols = ['#ff4f5e', '#ffd166', '#06d6a0', '#7c5cff', '#4cc9f0', '#ff8fab'];
    confetti = Array.from({ length: 70 }, (_, k) => {
      const a = Math.random() * Math.PI * 2;
      const v = 120 + Math.random() * 260;
      return { x: SIZE / 2, y: SIZE / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, life: 1, c: cols[k % cols.length] };
    });
    let prev = performance.now();
    const t0 = prev;
    const fx = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      glow = 0.5 + 0.5 * Math.sin((now - t0) / 90);
      bulbs = Math.floor((now - t0) / 140);
      for (const c of confetti) {
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.vy += 420 * dt;
        c.rot += c.vr * dt;
        c.life -= dt * 0.65;
      }
      draw(idx);
      if (now - t0 < 1600) raf = requestAnimationFrame(fx);
      else {
        confetti = [];
        glow = 0.6;
        draw(idx);
      }
    };
    raf = requestAnimationFrame(fx);
  }

  function showHistory() {
    if (!history.length) {
      histEl.hidden = true;
      return;
    }
    const cnt = {};
    history.forEach((h) => (cnt[h] = (cnt[h] || 0) + 1));
    histEl.innerHTML = `<p class="hist-title">최근 결과 ${history.length}번</p><div>${history
      .slice()
      .reverse()
      .map((h, k) => `<span class="chip${k === 0 ? ' now' : ''}">${esc(h)}</span>`)
      .join('')}</div><p class="hist-note">${Object.entries(cnt)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${esc(k)} ${v}번`)
      .join(' · ')}</p>`;
    histEl.hidden = false;
  }

  // power: 손으로 휙 돌린 세기 (없으면 보통)
  function spin(power = 0) {
    const list = items();
    focusBoard(root.querySelector('.wheel-wrap'));
    if (list.length < 2) {
      resultEl.textContent = '항목을 2개 이상 넣어 주세요.';
      return;
    }
    cancelAnimationFrame(raf);
    gameStore.save('wheel', { items: ta.value });
    spinning = true;
    spinBtn.disabled = true;
    removeBtn.hidden = true;
    confetti = [];
    glow = 0;
    resultEl.textContent = '두근두근…';
    const start = angle;
    // 7~9초 동안 6~9바퀴 (세게 돌리면 더 많이). 끝으로 갈수록 아주 천천히. 멈추는 칸은 무작위라 공정함
    const turns = 6 + Math.random() * 3 + Math.min(4, power * 2);
    const total = Math.PI * 2 * turns + Math.random() * Math.PI * 2;
    const dur = 7000 + Math.random() * 2000;
    const t0 = performance.now();
    let lastIdx = pointed();
    let lastTick = 0;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 5);
      angle = start + total * ease;
      bulbs = Math.floor((now - t0) / (t < 0.7 ? 90 : 220));
      const idx = pointed();
      if (idx !== lastIdx) {
        lastIdx = idx;
        pointer.classList.remove('tick');
        void pointer.offsetWidth;
        pointer.classList.add('tick');
        if (now - lastTick > 60) {
          sfx('tick');
          lastTick = now;
        }
      }
      liveEl.textContent = list[idx]?.label || '';
      draw(idx);
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        spinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = '다시 돌리기';
        lastWinner = idx;
        liveEl.textContent = '';
        resultEl.innerHTML = `🎉 <b>${esc(list[lastWinner].label)}</b> 당첨!`;
        sfx('win');
        buzz([60, 40, 120]);
        removeBtn.hidden = list.length <= 2;
        history = [...history, list[lastWinner].label].slice(-10);
        showHistory();
        celebrate(idx);
      }
    };
    raf = requestAnimationFrame(step);
  }

  function reset() {
    cancelAnimationFrame(raf);
    spinning = false;
    angle = 0;
    lastWinner = -1;
    glow = 0;
    confetti = [];
    spinBtn.disabled = false;
    spinBtn.textContent = '돌리기';
    removeBtn.hidden = true;
    liveEl.textContent = '';
    resultEl.textContent = '항목을 넣고 돌려 보세요. 판을 손가락으로 휙 돌려도 돼요!';
    draw();
  }

  // 판을 손가락(마우스)으로 끌었다 놓으면 그 세기로 돌아감
  let drag = null;
  const angAt = (e) => {
    const rc = canvas.getBoundingClientRect();
    return Math.atan2(e.clientY - rc.top - rc.height / 2, e.clientX - rc.left - rc.width / 2);
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (spinning) return;
    drag = { a: angAt(e), base: angle, t: performance.now(), last: angAt(e), lt: performance.now(), v: 0 };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const a = angAt(e);
    let d = a - drag.last;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    const now = performance.now();
    drag.v = d / Math.max(0.008, (now - drag.lt) / 1000);
    drag.last = a;
    drag.lt = now;
    angle += d;
    draw();
  });
  const release = () => {
    if (!drag) return;
    const v = Math.abs(drag.v);
    drag = null;
    if (v > 4) spin(Math.min(2, v / 12));
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  spinBtn.addEventListener('click', () => spin());
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
  removeBtn.addEventListener('click', () => {
    const list = items();
    if (lastWinner < 0 || !list[lastWinner]) return;
    list.splice(lastWinner, 1);
    ta.value = list.map((x) => x.raw).join('\n');
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
      history = [];
      showHistory();
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
    <div class="lad-table" hidden></div>
    <div class="game-actions">
      <button class="btn block" data-act="all">모두 한 번에 타기</button>
      <button class="btn ghost block" data-act="make">새 사다리 (다시 시작)</button>
    </div>
    <div class="opt-row" role="group" aria-label="결과 빨리 채우기">
      <button class="chip" data-fill="win">🎯 당첨 1개</button>
      <button class="chip" data-fill="rank">🥇 순서 정하기</button>
      <button class="chip" data-fill="money">💸 금액 나누기</button>
      <button class="chip" data-fill="job">🧹 역할 나누기</button>
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
  const tableEl = root.querySelector('.lad-table');
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
    tableEl.hidden = true;
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

  // 다 타면 결과표 (당첨은 금색) + 단톡방에 붙여 넣을 수 있게 복사
  function showAll() {
    const rows = ladder.names.map((name, c) => ({ name, c, r: ladder.results[pathOf(c).end] }));
    const hot = (r) => /당첨|1등|🎉/.test(r);
    resultEl.innerHTML = `🎉 모두 도착! ${rows.filter((x) => hot(x.r)).map((x) => `<b>${esc(x.name)}</b>`).join(', ') || ''}${rows.some((x) => hot(x.r)) ? ' 당첨!' : ''}`;
    tableEl.innerHTML = `<p class="hist-title">사다리 결과</p><ol>${rows
      .map((x) => `<li class="${hot(x.r) ? 'win' : ''}"><i style="background:${gameColor(x.c, ladder.n)}"></i><b>${esc(x.name)}</b><em>${esc(x.r)}</em></li>`)
      .join('')}</ol><button class="btn ghost block" data-act="copy">📋 결과 복사하기</button>`;
    tableEl.hidden = false;
    sfx('win');
    tableEl.querySelector('[data-act="copy"]').addEventListener('click', async () => {
      const text = `🪜 사다리 결과\n${rows.map((x) => `${x.name} → ${x.r}`).join('\n')}\n${location.origin}/game/ladder/`;
      toast((await copyText(text)) ? '결과를 복사했어요' : '복사가 막혀 있어요. 화면을 캡처해 주세요');
    });
  }

  root.querySelector('[data-act="make"]').addEventListener('click', make);
  // 결과 빨리 채우기 (참가자 수에 맞춰)
  root.querySelectorAll('[data-fill]').forEach((b) =>
    b.addEventListener('click', () => {
      const n = Math.max(2, parseNames(root.querySelector('.names').value, 20).length);
      const fill = {
        win: () => ['당첨', ...Array(n - 1).fill('꽝')],
        rank: () => Array.from({ length: n }, (_, i) => `${i + 1}등`),
        money: () => ['0원', '1000원', '2000원', '3000원', '5000원', '10000원', '전액', '반값'].slice(0, n),
        job: () => ['설거지', '청소', '분리수거', '장보기', '요리', '쉬기', '빨래', '정리'].slice(0, n),
      }[b.dataset.fill]();
      root.querySelector('.results').value = fill.join('\n');
      make();
    })
  );
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
  const MAPS = { pins: '🌲 핀볼 숲', zigzag: '⛰️ 지그재그 계곡', mill: '⚙️ 톱니 공장' };
  root.innerHTML = `
    <div class="marble-stage">
      <canvas class="marble-canvas" aria-label="구슬 추첨 화면"></canvas>
      <canvas class="marble-mini" aria-hidden="true"></canvas>
      <ol class="marble-rank" aria-label="현재 순위"></ol>
      <div class="count-overlay" hidden></div>
      <div class="slowmo" hidden>슬로모션</div>
      <div class="marble-win" hidden></div>
    </div>
    <p class="game-result" role="status">참가자를 넣고 시작을 눌러 주세요.</p>
    <div class="game-actions">
      <button class="btn block" data-act="start">시작</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <div class="marble-opts">
      <label><span>맵</span><select class="marble-map">
        ${Object.entries(MAPS).map(([k, v]) => `<option value="${k}"${saved.map === k ? ' selected' : ''}>${v}</option>`).join('')}
        <option value="random"${saved.map === 'random' ? ' selected' : ''}>🎲 매번 무작위</option>
      </select></label>
      <label><span>당첨</span><select class="marble-rule">
        <option value="first"${saved.rule === 'first' || !saved.rule ? ' selected' : ''}>1등으로 도착</option>
        <option value="last"${saved.rule === 'last' ? ' selected' : ''}>꼴찌</option>
        <option value="nth"${saved.rule === 'nth' ? ' selected' : ''}>N번째로 도착</option>
      </select></label>
      <label class="marble-nth-wrap"${saved.rule === 'nth' ? '' : ' hidden'}><span>몇 번째</span><input type="number" class="marble-nth" min="1" max="50" value="${saved.nth || 2}"></label>
    </div>
    <div class="rule-row">
      <label><input type="checkbox" class="marble-quake"${saved.quake === false ? '' : ' checked'}> 🌋 지진 이벤트 (가끔 판이 흔들려요)</label>
      <button class="link-btn" data-act="shuffle">출발 자리 섞기</button>
    </div>
    <label class="field">
      <span>참가자 (한 줄에 하나, 또는 쉼표 · '철수*3'처럼 쓰면 구슬 3개 · 최대 50개)</span>
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
  const mini = root.querySelector('.marble-mini');
  const mctx = mini.getContext('2d');
  const winEl = root.querySelector('.marble-win');
  const mapSel = root.querySelector('.marble-map');
  const ruleSel = root.querySelector('.marble-rule');
  const nthWrap = root.querySelector('.marble-nth-wrap');
  const nthEl = root.querySelector('.marble-nth');
  const quakeEl = root.querySelector('.marble-quake');
  const rule = () => ruleSel.value;
  const nth = () => Math.max(1, Math.min(marbles.length || 50, Math.round(+nthEl.value) || 1));
  // '철수*3' → 철수1·철수2·철수3 (같은 사람 구슬 여러 개). who 는 당첨 발표용 원래 이름
  const marbleNames = () => {
    const out = [];
    for (const raw of parseNames(ta.value, 50)) {
      const mt = raw.match(/^(.+?)\s*[*×xX]\s*(\d{1,2})$/);
      const who = mt ? mt[1].trim() : raw;
      const n = mt ? Math.max(1, Math.min(20, +mt[2])) : 1;
      for (let k = 0; k < n && out.length < 50; k++) out.push({ who, label: n > 1 ? `${who}${k + 1}` : who });
    }
    return out;
  };

  // ── 맵 (월드 좌표: 폭 360) ──
  // 핀 밭은 적당히 빠르게 내려오고, 마지막 '허우적 방'에서 큰 막대에 휘둘리다 좁은 구멍으로 빠져나감
  const W = 360;
  const R = 8.5;
  const FINISH = 3600; // 코스 길이 (11/16 '너무 빨리 끝난다'고 해서 약 2배로)
  const H = FINISH + 120;
  const FUNNEL = FINISH - 420; // 깔때기 시작
  const ROOM_TOP = FINISH - 230; // 허우적 방 위쪽
  const FLOOR = FINISH - 60; // 방 바닥 (가운데 구멍)
  const ROOM = 92; // 방 반폭
  const pegs = [];
  const segs = [];
  const spinners = [];
  let mapKind = 'pins';
  // 벽 턱: 벽에 붙어 미끄러지는 구슬을 안쪽으로 튕김 (왼쪽·오른쪽 번갈아). 그 근처엔 핀을 두지 않음
  function wallBumps(bumps) {
    for (let y = 260, k = 0; y < FUNNEL - 120; y += 170, k++) {
      const left = k % 2 === 0;
      const x0 = left ? 0 : W;
      const tip = left ? 34 : W - 34;
      segs.push({ x1: x0, y1: y, x2: tip, y2: y + 26 }, { x1: tip, y1: y + 26, x2: x0, y2: y + 52 });
      bumps.push({ y: y + 26, left });
    }
  }
  const nearSpinner = (x, y, pad) => spinners.some((s) => Math.abs(s.cy - y) < s.len / 2 + pad && Math.abs(s.cx - x) < s.len / 2 + pad);
  const MIDDLE = {
    // 🌲 핀 밭 + 회전 막대 + 가운데 범퍼
    pins() {
      const bumps = [];
      wallBumps(bumps);
      for (let row = 0, y = 230; y < FUNNEL - 50; row++, y += 44) {
        const off = row % 2 ? 22 : 0;
        for (let x = 40 + off; x <= W - 40; x += 44) {
          if (nearSpinner(x, y, 14)) continue;
          if (bumps.some((b) => Math.abs(b.y - y) < 60 && (b.left ? x < 84 : x > W - 84))) continue;
          pegs.push({ x, y, r: 4.5, bounce: 0.6 });
        }
        if (row % 8 === 4) {
          spinners.push({ cx: 100, cy: y + 22, len: 84, a: Math.random() * 3, w: 2.6 }, { cx: 260, cy: y + 22, len: 84, a: Math.random() * 3, w: -2.6 });
        }
        if (row % 8 === 0 && row > 0) pegs.push({ x: W / 2, y: y + 22, r: 15, bounce: 1.1, bumper: true });
      }
    },
    // ⛰️ 좌우로 번갈아 기운 비탈길을 타고 내려옴. 비탈 끝 구멍 아래에 범퍼
    zigzag() {
      for (let y = 250, k = 0; y < FUNNEL - 170; y += 175, k++) {
        const left = k % 2 === 0;
        segs.push(left ? { x1: 0, y1: y, x2: W - 80, y2: y + 72 } : { x1: W, y1: y, x2: 80, y2: y + 72 });
        pegs.push({ x: left ? W - 40 : 40, y: y + 108, r: 11, bounce: 1.05, bumper: true });
        for (let x = 64 + (k % 2) * 26; x <= W - 64; x += 52) {
          if (Math.abs(x - (left ? W - 40 : 40)) < 40) continue;
          pegs.push({ x, y: y + 140, r: 4.5, bounce: 0.6 });
        }
        if (k % 3 === 2) spinners.push({ cx: W / 2, cy: y - 30, len: 70, a: Math.random() * 3, w: k % 2 ? 3 : -3 });
      }
    },
    // ⚙️ 회전 막대가 빽빽한 공장. 막대 사이로 핀이 흩어져 있음
    mill() {
      const bumps = [];
      wallBumps(bumps);
      for (let y = 250, k = 0; y < FUNNEL - 90; y += 140, k++) {
        if (k % 2 === 0) {
          spinners.push({ cx: 92, cy: y, len: 92, a: Math.random() * 3, w: 2.2 + Math.random() }, { cx: W - 92, cy: y, len: 92, a: Math.random() * 3, w: -2.2 - Math.random() });
        } else {
          spinners.push({ cx: W / 2, cy: y, len: 104, a: Math.random() * 3, w: (Math.random() < 0.5 ? -1 : 1) * 2.8 });
          // 벽 턱과 범퍼 사이에 구슬이 끼지 않게 벽에서 충분히 띄움
          pegs.push({ x: 86, y, r: 12, bounce: 1.05, bumper: true }, { x: W - 86, y, r: 12, bounce: 1.05, bumper: true });
        }
      }
      for (let row = 0, y = 230; y < FUNNEL - 50; row++, y += 46) {
        for (let x = 46 + (row % 2) * 23; x <= W - 46; x += 46) {
          if (nearSpinner(x, y, 24)) continue;
          if (pegs.some((b) => b.bumper && Math.hypot(b.x - x, b.y - y) < 40)) continue;
          if (bumps.some((b) => Math.abs(b.y - y) < 60 && (b.left ? x < 84 : x > W - 84))) continue;
          if (row % 3 === 1) continue; // 듬성듬성
          pegs.push({ x, y, r: 4.5, bounce: 0.6 });
        }
      }
    },
  };
  function buildMap(kind) {
    pegs.length = 0;
    segs.length = 0;
    spinners.length = 0;
    mapKind = kind;
    segs.push({ x1: 0, y1: -400, x2: 0, y2: FUNNEL }, { x1: W, y1: -400, x2: W, y2: FUNNEL });
    MIDDLE[kind]();
    for (let i = pegs.length - 1; i >= 0; i--) {
      const p = pegs[i];
      if (!p.bumper && pegs.some((b) => b.bumper && Math.hypot(b.x - p.x, b.y - p.y) < 44)) pegs.splice(i, 1);
    }
    buildRoom();
  }
  // 깔때기 → 허우적 방 (모든 맵 공통)
  const HOLE_MIN = 13;
  let hole = HOLE_MIN;
  let floorL = null;
  let floorR = null;
  function buildRoom() {
  segs.push(
    { x1: 0, y1: FUNNEL, x2: W / 2 - ROOM, y2: ROOM_TOP },
    { x1: W, y1: FUNNEL, x2: W / 2 + ROOM, y2: ROOM_TOP },
    { x1: W / 2 - ROOM, y1: ROOM_TOP, x2: W / 2 - ROOM, y2: FLOOR - 34 },
    { x1: W / 2 + ROOM, y1: ROOM_TOP, x2: W / 2 + ROOM, y2: FLOOR - 34 }
  );
  // 방 바닥: 가운데로 살짝 기울고 구멍이 뚫림. 구멍 폭은 hole(반폭)로 조절 — 첫 구슬이 나간 뒤 점점 넓어짐
  floorL = { x1: W / 2 - ROOM, y1: FLOOR - 34, x2: W / 2 - hole, y2: FLOOR };
  floorR = { x1: W / 2 + ROOM, y1: FLOOR - 34, x2: W / 2 + hole, y2: FLOOR };
  segs.push(floorL, floorR);
  // 방을 휘젓는 큰 막대 (구멍 바로 위)
  spinners.push({ cx: W / 2, cy: FLOOR - 62, len: ROOM * 2 - 22, a: 0, w: 1.9, gate: true });
  // 구멍 아래 짧은 통로
  segs.push({ x1: W / 2 - 22, y1: FLOOR + 6, x2: W / 2 - 22, y2: FINISH + 20 }, { x1: W / 2 + 22, y1: FLOOR + 6, x2: W / 2 + 22, y2: FINISH + 20 });
  }
  const setHole = (h) => {
    hole = h;
    floorL.x2 = W / 2 - h;
    floorR.x2 = W / 2 + h;
  };

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
  let parts = []; // 불꽃·꽃가루 조각
  let shake = 0; // 화면 흔들림 (초)
  let nextQuake = 0;
  let raceT = 0;
  let lastPop = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    view = { scale: (rect.width / W) * dpr, w: rect.width * dpr, h: rect.height * dpr, dpr };
    const mr = mini.getBoundingClientRect();
    mini.width = Math.round(mr.width * dpr);
    mini.height = Math.round(mr.height * dpr);
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
    const names = marbleNames();
    // 무작위 맵은 시작할 때만 새로 고름 (이름 고치는 중에 맵이 바뀌지 않게)
    const want = mapSel.value !== 'random' ? mapSel.value : mapKind && segs.length ? mapKind : Object.keys(MAPS)[Math.floor(Math.random() * 3)];
    if (want !== mapKind || !segs.length) buildMap(want);
    if (!order.length || order.length !== names.length) order = shuffleArr(names.map((_, i) => i));
    const cols = Math.min(names.length, 10);
    marbles = names.map(({ who, label }, i) => {
      const slot = order[i];
      const cx = W / 2 + ((slot % cols) - (cols - 1) / 2) * 24 + (Math.random() - 0.5) * 4;
      const cy = 60 + Math.floor(slot / cols) * 22;
      return { name: label, who, x: cx, y: cy, vx: 0, vy: 0, color: gameColor(i, names.length), done: false, still: 0, trail: [] };
    });
    parts = [];
    shake = 0;
    raceT = 0;
    nextQuake = 6 + Math.random() * 3;
    winEl.hidden = true;
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
  const G = 760;
  const MAXV = 560;
  function collideCircle(m, cx, cy, cr, bounce, vx = 0, vy = 0) {
    const dx = m.x - cx;
    const dy = m.y - cy;
    const min = cr + R;
    const d2 = dx * dx + dy * dy;
    if (d2 >= min * min || d2 === 0) return false;
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
    return vn < -60;
  }
  function bumperHit(p, m) {
    p.flash = 1;
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      parts.push({ x: m.x, y: m.y, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, life: 0.4, max: 0.4, c: '#ffb020', s: 2.5 });
    }
    const now = performance.now();
    if (running && now - lastPop > 120) {
      sfx('pop');
      lastPop = now;
    }
  }
  // 지진: 달리는 구슬 전부를 무작위로 튕김 (모두에게 똑같이 무작위라 공정함) + 화면 흔들림
  function quake() {
    for (const m of marbles) {
      if (m.done) continue;
      m.vx += (Math.random() - 0.5) * 460;
      m.vy -= 120 + Math.random() * 220;
    }
    shake = 0.6;
    buzz([60, 40, 60]);
    sfx('boost');
    resultEl.innerHTML = '🌋 <b>지진!</b> 판이 흔들려요';
    lastCall = performance.now();
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
    raceT += dt;
    if (shake > 0) shake -= dt;
    for (const p of pegs) if (p.flash > 0) p.flash = Math.max(0, p.flash - dt * 4);
    for (const q of parts) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += (q.g ?? 300) * dt;
      q.life -= dt;
    }
    if (parts.length) parts = parts.filter((q) => q.life > 0);
    if (running && quakeEl.checked && !resultEl.dataset.shown && raceT > nextQuake) {
      if (marbles.some((m) => !m.done && m.y > 200 && m.y < FUNNEL)) quake();
      nextQuake = raceT + 9 + Math.random() * 5;
    }
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
      for (const p of pegs) {
        if (Math.abs(p.y - m.y) >= 30 || Math.abs(p.x - m.x) >= 30) continue;
        if (collideCircle(m, p.x, p.y, p.r, p.bounce) && p.bumper) bumperHit(p, m);
      }
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
  const dark = () => matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.dataset.theme === 'dark';
  const MAP_TINT = { pins: ['#1f3b2c', '#e8f5ec'], zigzag: ['#3a2a1c', '#f7efe4'], mill: ['#1d2639', '#e9eef8'] };
  function render() {
    const { scale, w, h } = view;
    const dk = dark();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 배경: 맵마다 다른 색 + 아래로 갈수록 진해짐
    const [dc, lc] = MAP_TINT[mapKind] || MAP_TINT.pins;
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, dk ? '#15131c' : '#fbfaff');
    bg.addColorStop(1, dk ? dc : lc);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const sx = shake > 0 ? (Math.random() - 0.5) * 10 * shake : 0;
    const sy = shake > 0 ? (Math.random() - 0.5) * 10 * shake : 0;
    ctx.setTransform(scale, 0, 0, scale, sx * scale, (-camY + sy) * scale);
    const top = camY - 20;
    const bottom = camY + h / scale + 20;
    // 도착선: 체크무늬
    for (let x = 0, k = 0; x < W; x += 12, k++) {
      for (let r = 0; r < 2; r++) {
        ctx.fillStyle = (k + r) % 2 ? (dk ? '#2b2838' : '#ffffff') : (dk ? '#e9e6f5' : '#1d1b26');
        ctx.fillRect(x, FINISH + r * 12, 12, 12);
      }
    }
    ctx.font = '800 14px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7c5cff';
    ctx.fillText('🏁 도착', W / 2, FINISH + 48);
    for (const p of pegs) {
      if (p.y < top || p.y > bottom) continue;
      ctx.beginPath();
      if (p.bumper) {
        const r = p.r * (1 + (p.flash || 0) * 0.25);
        ctx.shadowColor = '#ff8c42';
        ctx.shadowBlur = 10 + (p.flash || 0) * 14;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.flash > 0.3 ? '#ffd166' : '#ff8c42';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.fill();
      } else {
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dk ? '#8f8aa3' : '#a29dba';
        ctx.fill();
      }
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = dk ? '#b9a8ff' : '#5f5b70';
    ctx.lineWidth = 4;
    if (dk) {
      ctx.shadowColor = '#7c5cff';
      ctx.shadowBlur = 8;
    }
    for (const s of segs) {
      if (Math.max(s.y1, s.y2) < top || Math.min(s.y1, s.y2) > bottom) continue;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    for (const s of spinners) {
      if (s.cy < top - 80 || s.cy > bottom + 80) continue;
      ctx.strokeStyle = s.gate ? '#ff4f5e' : '#7c5cff';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = dk ? 12 : 4;
      ctx.lineWidth = s.gate ? 8 : 6;
      const dx = (Math.cos(s.a) * s.len) / 2;
      const dy = (Math.sin(s.a) * s.len) / 2;
      ctx.beginPath();
      ctx.moveTo(s.cx - dx, s.cy - dy);
      ctx.lineTo(s.cx + dx, s.cy + dy);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    // 앞선 3개는 꼬리를 그림
    const live = marbles.filter((m) => !m.done).sort((a, b) => b.y - a.y);
    const lead = live[0];
    for (const m of live.slice(0, 3)) {
      if (m.trail.length < 4) continue;
      ctx.beginPath();
      ctx.moveTo(m.trail[0], m.trail[1]);
      for (let i = 2; i < m.trail.length; i += 2) ctx.lineTo(m.trail[i], m.trail[i + 1]);
      ctx.strokeStyle = m.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = R * 1.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (const m of marbles) {
      if (m.done || m.y < top || m.y > bottom) continue;
      if (m === lead && running) {
        ctx.beginPath();
        ctx.arc(m.x, m.y, R + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 209, 102, .45)';
        ctx.fill();
      }
      const gr = ctx.createRadialGradient(m.x - R * 0.35, m.y - R * 0.4, 1, m.x, m.y, R);
      gr.addColorStop(0, '#ffffff');
      gr.addColorStop(0.35, m.color);
      gr.addColorStop(1, m.color);
      ctx.beginPath();
      ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0,0,0,.35)';
      ctx.stroke();
    }
    for (const q of parts) {
      if (q.y < top || q.y > bottom) continue;
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.c;
      ctx.fillRect(q.x - q.s / 2, q.y - q.s / 2, q.s, q.s * (q.rect ? 1.8 : 1));
    }
    ctx.globalAlpha = 1;
    // 이름: 흰 글씨 + 진한 테두리. 앞서가는 구슬부터 쓰고, 다른 이름과 겹치면 그 이름은 잠시 생략 (빽빽할 때 글자가 뭉개지지 않게)
    ctx.font = '700 10px Pretendard, sans-serif';
    const placed = [];
    ctx.lineJoin = 'round';
    for (const m of live) {
      if (m.y < top || m.y > bottom) continue;
      const label = (m === lead && running ? '👑' : '') + (m.name.length > 4 ? m.name.slice(0, 4) : m.name);
      const tw = ctx.measureText(label).width + 4;
      const box = { l: m.x - tw / 2, r: m.x + tw / 2, t: m.y - R - 14, b: m.y - R - 1 };
      if (placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) continue;
      placed.push(box);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(20,16,36,.85)';
      ctx.strokeText(label, m.x, m.y - R - 3);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, m.x, m.y - R - 3);
    }
    renderMini();
  }

  // 미니맵: 맵 전체 + 구슬 점 + 지금 보이는 곳
  function renderMini() {
    const mw = mini.width;
    const mh = mini.height;
    if (!mw || !mh) return;
    const k = Math.min(mw / W, mh / (H + 60));
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.clearRect(0, 0, mw, mh);
    mctx.fillStyle = dark() ? 'rgba(20,18,28,.78)' : 'rgba(255,255,255,.82)';
    mctx.fillRect(0, 0, mw, mh);
    mctx.setTransform(k, 0, 0, k, (mw - W * k) / 2, 20 * k);
    mctx.strokeStyle = '#8f8aa3';
    mctx.lineWidth = 3 / k / 2;
    for (const s of segs) {
      mctx.beginPath();
      mctx.moveTo(s.x1, Math.max(0, s.y1));
      mctx.lineTo(s.x2, Math.max(0, s.y2));
      mctx.stroke();
    }
    mctx.fillStyle = '#7c5cff';
    for (const s of spinners) mctx.fillRect(s.cx - s.len / 2, s.cy - 4, s.len, 8);
    mctx.fillStyle = '#1d1b26';
    mctx.fillRect(0, FINISH, W, 14);
    const viewH = view.h / view.scale;
    mctx.strokeStyle = '#ff4f5e';
    mctx.lineWidth = 2 / k;
    mctx.strokeRect(2, camY, W - 4, viewH);
    for (const m of marbles) {
      if (m.done) continue;
      mctx.beginPath();
      mctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
      mctx.fillStyle = m.color;
      mctx.fill();
    }
  }

  // 당첨 축하: 도착선에서 꽃가루 + 큰 당첨 카드
  function celebrate(wm, sub) {
    const cols = ['#ff4f5e', '#ffd166', '#06d6a0', '#7c5cff', '#4cc9f0', '#ff8fab'];
    const cy = Math.min(FINISH, camY + view.h / view.scale * 0.35);
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 220 + Math.random() * 380;
      parts.push({ x: W / 2 + (Math.random() - 0.5) * 120, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 2.2, max: 2.2, c: cols[i % cols.length], s: 4, rect: true, g: 420 });
    }
    winEl.innerHTML = `<span class="mw-ball" style="--c:${wm.color}"></span><b>${esc(wm.who)}</b><small>${sub}${wm.who !== wm.name ? ` · ${esc(wm.name)} 구슬` : ''}</small>`;
    winEl.hidden = false;
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
    } else if (r === 'nth' && live.length > 0 && finished.length < nth()) {
      const need = nth() - finished.length; // 앞으로 몇 개 더 나가야 당첨인지
      const cand = live[need - 1];
      if (need === 1 && live[0].y > FLOOR - 40 && live.length > 1 && live[1].y > ROOM_TOP) timeScale = 0.45;
      if (cand && now - lastCall > 1300) {
        resultEl.innerHTML = finished.length
          ? `${finished.length}개 도착 · 당첨까지 ${need}개 남음 (지금 후보 <b>${esc(cand.name)}</b>)`
          : `${nth()}번째로 도착하면 당첨! 지금 ${nth()}위 <b>${esc(cand.name)}</b>`;
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
    for (const m of marbles) {
      if (m.done) continue;
      if (m.trail.length >= 16) m.trail.splice(0, 2);
      m.trail.push(m.x, m.y);
    }
    commentate(now);
    const live = marbles.filter((m) => !m.done);
    const r = rule();
    const ys = live.map((m) => m.y).sort((a, b) => b - a);
    const target = live.length
      ? r === 'last' && finished.length
        ? ys[ys.length - 1]
        : r === 'nth' && finished.length < nth()
          ? ys[Math.min(ys.length - 1, nth() - finished.length - 1)]
          : ys[0]
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
    const winnerReady = r === 'first' ? finished.length >= 1 : r === 'nth' ? finished.length >= nth() : finished.length >= marbles.length - 1;
    if (winnerReady && !resultEl.dataset.shown) {
      const w = r === 'first' ? finished[0] : r === 'nth' ? finished[nth() - 1] : live.length ? live[0] : finished[finished.length - 1];
      const sub = r === 'last' ? '꼴찌 당첨' : r === 'nth' ? `${nth()}번째 도착` : '1등 도착';
      resultEl.dataset.shown = '1';
      resultEl.innerHTML = `🎉 <b>${esc(w.who)}</b> 당첨! (${sub})`;
      sfx('win');
      buzz([80, 40, 80, 40, 160]);
      slowEl.hidden = true;
      timeScale = 1;
      celebrate(w, sub);
    }
    if ((live.length === 0 && !parts.length) || Date.now() - startedAt > 300000) {
      running = false;
      updateRank();
      startBtn.disabled = false;
      startBtn.textContent = '한 번 더';
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    const names = marbleNames();
    focusBoard(root.querySelector('.marble-stage'));
    if (names.length < 2) {
      resultEl.textContent = '구슬이 2개 이상 있어야 해요.';
      return;
    }
    if (rule() === 'nth' && +nthEl.value > names.length) nthEl.value = names.length;
    gameStore.save('marble', { names: ta.value, rule: rule(), nth: +nthEl.value || 2, map: mapSel.value, quake: quakeEl.checked });
    if (mapSel.value === 'random') mapKind = '';
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
  winEl.addEventListener('click', () => (winEl.hidden = true));
  ruleSel.addEventListener('change', () => {
    nthWrap.hidden = rule() !== 'nth';
  });
  mapSel.addEventListener('change', () => {
    if (running) return;
    mapKind = '';
    setup();
  });

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
    <div class="horse-board" hidden></div>
    <p class="horse-coins"></p>
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
  const boardEl = root.querySelector('.horse-board');
  const coinEl = root.querySelector('.horse-coins');
  // 놀이용 코인 (돈 아님): 한 판에 10개 걸고, 맞히면 말 수 × 10개
  const BET = 10;
  const coins = () => gameStore.get('horse-coins') ?? 100;
  const showCoins = (msg = '') => {
    const s = gameStore.get('horse-stat') || { play: 0, hit: 0 };
    coinEl.innerHTML = `🪙 내 코인 <b>${coins()}</b>개 · 한 판에 ${BET}개 걸고, 맞히면 ${BET}×말 수만큼 받아요${s.play ? ` · 적중 ${s.hit}/${s.play}` : ''}${msg}`;
  };
  let horses = [];
  let pick = -1;
  let raf = 0;
  let running = false;
  let cancelCount = null;

  function setup() {
    stop();
    const names = parseNames(ta.value, 10);
    horses = names.map((name, i) => ({ name, i, p: 0, v: 0, target: 0, next: 0, burst: 0, rocket: 0, trip: 0, place: 0, ...HORSE_COLORS[i % HORSE_COLORS.length] }));
    if (pick >= horses.length) pick = -1;
    track.innerHTML = horses
      .map(
        (h) => `
        <div class="lane${h.i === pick ? ' mine' : ''}">
          <span class="lane-no" style="background:${h.color}">${h.i + 1}</span>
          <div class="lane-run">
            <div class="horse" style="--x:0">
              ${horseSvg(h)}
              <span class="horse-fx" aria-hidden="true"></span>
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
    showCoins();
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
    if (coins() < BET) {
      gameStore.save('horse-coins', 100);
      toast('코인이 떨어져서 100개를 다시 드렸어요');
    }
    gameStore.save('horse-coins', coins() - BET);
    showCoins();
    boardEl.hidden = true;
    horses.forEach((h) => {
      h.time = 0;
      h.p = 0;
      h.v = 0;
      h.target = 0.085 + Math.random() * 0.01;
      h.next = 0;
      h.burst = 0;
      h.rocket = 0;
      h.trip = 0;
      h.place = 0;
    });
    track.querySelectorAll('.horse').forEach((el) => el.classList.remove('rocket', 'trip'));
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
    // 역전 이벤트 2번: 선두가 이 지점을 지나면 뒤처진 말이 폭주하거나 선두가 휘청
    const events = [0.3 + Math.random() * 0.15, 0.6 + Math.random() * 0.15];
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
      if (events.length && lead >= events[0] && sorted.length > 2) {
        events.shift();
        const back = sorted.slice(Math.ceil(sorted.length / 2));
        const top = sorted[0];
        if (Math.random() < 0.6 || !back.length) {
          // 뒤에서 폭주 (가끔은 선두도 같이 휘청)
          const h = back.length ? back[Math.floor(Math.random() * back.length)] : sorted[sorted.length - 1];
          h.rocket = 1.6;
          if (Math.random() < 0.35) top.trip = 0.9;
          resultEl.innerHTML = `🚀 <b>${h.i + 1}번 ${esc(h.name)}</b> 폭주! 무섭게 따라붙어요!`;
          sfx('boost');
        } else {
          top.trip = 1.1;
          resultEl.innerHTML = `😵 선두 <b>${top.i + 1}번 ${esc(top.name)}</b> 휘청! 기회예요!`;
          sfx('bad');
        }
        buzz(40);
        lastCall = now;
      }
      for (const h of horses) {
        if (h.place) continue;
        // 목표 속도를 자주 바꾸고 가끔 질주. 앞선 말은 조금 느려지고 뒤처진 말은 따라붙어서 끝까지 엎치락뒤치락
        if (t >= h.next) {
          h.target = 0.06 + Math.random() * 0.06; // 약 10~12초 경주
          if (Math.random() < 0.2) h.burst = 0.7 + Math.random() * 0.7;
          h.next = t + 0.3 + Math.random() * 0.6;
        }
        const catchUp = h.p < lead - 0.08 ? 1.15 : h.p >= lead ? 0.95 : 1;
        const want = h.target * catchUp * (h.burst > 0 ? 1.55 : 1) * (h.rocket > 0 ? 2.1 : 1) * (h.trip > 0 ? 0.35 : 1);
        h.burst -= dt;
        h.rocket -= dt;
        h.trip -= dt;
        els[h.i].classList.toggle('rocket', h.rocket > 0);
        els[h.i].classList.toggle('trip', h.trip > 0);
        h.v += (want - h.v) * Math.min(1, dt * 3.5);
        h.p += h.v * dt;
        if (h.p >= 1) {
          h.p = 1;
          h.place = ++finished;
          h.time = t;
          places[h.i].textContent = `${h.place}등`;
          els[h.i].classList.remove('rocket', 'trip');
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
    const second = horses.find((h) => h.place === 2);
    const mine = horses[pick];
    const hit = mine.place === 1;
    const prize = BET * horses.length;
    if (hit) gameStore.save('horse-coins', coins() + prize);
    const stat = gameStore.get('horse-stat') || { play: 0, hit: 0 };
    gameStore.save('horse-stat', { play: stat.play + 1, hit: stat.hit + (hit ? 1 : 0) });
    showCoins(hit ? ` · <b class="plus">+${prize}</b>` : '');
    sfx(hit ? 'win' : 'lose');
    const gap = second ? second.time - winner.time : 1;
    const photo = gap < 0.12;
    resultEl.innerHTML =
      (photo ? `📸 사진 판정! ${gap.toFixed(2)}초 차이 · ` : '') +
      (hit ? `🎉 적중! <b>${mine.i + 1}번 ${esc(mine.name)}</b> 1등!` : `아쉬워요! 1등은 <b>${winner.i + 1}번 ${esc(winner.name)}</b>, 내 말은 ${mine.place}등`);
    const order = [...horses].sort((a, b) => a.place - b.place);
    boardEl.innerHTML = `<p class="hist-title">경주 결과</p><ol>${order
      .map(
        (h) => `<li class="${h.i === pick ? 'mine' : ''}"><span>${['🥇', '🥈', '🥉'][h.place - 1] || h.place + '등'}</span><i style="background:${h.color}">${h.i + 1}</i><b>${esc(h.name)}</b><em>${h.time.toFixed(2)}초${h.place > 1 ? ` (+${(h.time - winner.time).toFixed(2)})` : ''}</em></li>`
      )
      .join('')}</ol>`;
    boardEl.hidden = false;
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
  // 짧은 음 하나 (at: 지금부터 몇 초 뒤, slide: 끝 주파수)
  tone(freq, dur, { type = 'sine', vol = 0.15, at = 0, slide = 0 } = {}) {
    const c = this.ctx;
    const t = c.currentTime + at;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  },
  // 이름으로 부르는 효과음: ok 정답 · bad 오답 · pop 지우기 · flip 뒤집기 · match 짝 · win 성공 · lose 실패 · boost 질주 · roll 굴리기
  sfx(name) {
    this.unlock();
    if (!this.ctx) return;
    const T = (f, d, o) => this.tone(f, d, o);
    switch (name) {
      case 'ok': T(880, 0.12, { type: 'triangle' }); T(1318, 0.22, { type: 'triangle', at: 0.09 }); break;
      case 'bad': T(330, 0.16, { type: 'square', vol: 0.07 }); T(220, 0.28, { type: 'square', vol: 0.07, at: 0.13 }); break;
      case 'pop': T(600, 0.09, { type: 'sine', vol: 0.2, slide: 1500 }); break;
      case 'flip': T(1200, 0.04, { type: 'triangle', vol: 0.06 }); break;
      case 'match': T(1046, 0.1, { type: 'sine' }); T(1568, 0.25, { type: 'sine', at: 0.08 }); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => T(f, i === 3 ? 0.45 : 0.14, { type: 'triangle', at: i * 0.1 })); break;
      case 'lose': [392, 349, 311, 262].forEach((f, i) => T(f, i === 3 ? 0.5 : 0.18, { type: 'triangle', vol: 0.12, at: i * 0.16 })); break;
      case 'boost': T(300, 0.45, { type: 'sawtooth', vol: 0.06, slide: 1200 }); break;
      case 'roll': for (let i = 0; i < 6; i++) T(500 + Math.random() * 500, 0.03, { type: 'square', vol: 0.05, at: i * 0.07 }); break;
      case 'tick': T(1500, 0.03, { type: 'square', vol: 0.05 }); break;
    }
  },
};
const sfx = (name) => { try { gameAudio.sfx(name); } catch { /* 소리 없이 진행 */ } };
// 첫 터치 때 소리 준비 (휴대폰은 사용자가 건드려야 소리가 남)
if (typeof document !== 'undefined') ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => gameAudio.unlock(), { once: true, capture: true }));
const buzz = (p) => { try { navigator.vibrate?.(p); } catch { /* 진동 없는 기기 */ } };

/* ═════════════════════ 제비뽑기 ═════════════════════ */

function renderLots(root) {
  const saved = gameStore.get('lots') || { count: 6, wins: 1, label: '당첨' };
  root.innerHTML = `
    <p class="game-result" role="status"></p>
    <div class="lots-grid"></div>
    <div class="lots-log" hidden></div>
    <div class="game-actions">
      <button class="btn block" data-act="all">남은 종이 다 펼치기</button>
      <button class="btn ghost block" data-act="reset">새로 섞기 (다시 시작)</button>
    </div>
    <div class="num-row">
      <label class="field"><span>종이 수 (2~30)</span><input type="number" inputmode="numeric" min="2" max="30" value="${saved.count}" data-k="count"></label>
      <label class="field"><span>당첨 수</span><input type="number" inputmode="numeric" min="1" max="29" value="${saved.wins}" data-k="wins"></label>
      <label class="field"><span>당첨 문구</span><input type="text" maxlength="10" value="${esc(saved.label)}" data-k="label"></label>
    </div>
    <details class="lots-more"${saved.people || saved.texts ? ' open' : ''}>
      <summary>더 하기: 뽑는 순서 · 종이에 쓸 내용</summary>
      <label class="field"><span>뽑는 사람 (선택 · 한 줄에 하나) — 넣으면 차례와 누가 뭘 뽑았는지 알려 줘요</span><textarea rows="3" data-k="people" placeholder="철수&#10;영희&#10;민수">${esc(saved.people || '')}</textarea></label>
      <label class="field"><span>종이 내용 직접 쓰기 (선택 · 한 줄에 한 장) — 쓰면 종이 수·당첨 대신 이 내용으로</span><textarea rows="3" data-k="texts" placeholder="커피 쏘기&#10;설거지&#10;꽝&#10;꽝">${esc(saved.texts || '')}</textarea></label>
    </details>`;
  const grid = root.querySelector('.lots-grid');
  const resultEl = root.querySelector('.game-result');
  const logEl = root.querySelector('.lots-log');
  const input = (k) => root.querySelector(`[data-k="${k}"]`);
  let lots = []; // 종이마다 { text, win }
  let cur = saved;
  let found = 0;
  let people = [];
  let turn = 0;
  let log = [];
  let timers = [];
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const isLose = (t) => /^(꽝|통과|패스|없음)$/.test(t.trim());

  function status(msg) {
    const left = grid.querySelectorAll('.lot:not(.open)').length;
    const winsTotal = lots.filter((l) => l.win).length;
    const remain = winsTotal - found;
    const next = people.length && turn < people.length && left ? ` · 👉 <b>${esc(people[turn])}</b> 차례` : '';
    const sub = cur.texts ? `남은 종이 ${left}장` : remain > 0 ? `남은 ${esc(cur.label)} ${remain}개 · 종이 ${left}장` : `${esc(cur.label)} 다 나왔어요!`;
    resultEl.innerHTML = `${msg ? msg + '<br>' : ''}<small class="sub">${sub}${next}</small>`;
  }
  function showLog() {
    if (!log.length) {
      logEl.hidden = true;
      return;
    }
    logEl.innerHTML = `<p class="hist-title">${people.length ? '누가 뭘 뽑았나' : '펼친 순서'}</p><ol>${log
      .map((r) => `<li class="${r.win ? 'win' : ''}">${r.who ? `<b>${esc(r.who)}</b>` : ''}<span>${r.i + 1}번</span><em>${esc(r.text)}</em></li>`)
      .join('')}</ol>`;
    logEl.hidden = false;
  }

  function make() {
    clear();
    const texts = input('texts')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
    people = parseNames(input('people').value, 30);
    const label = input('label').value.trim().slice(0, 10) || '당첨';
    let count = Math.min(30, Math.max(2, parseInt(input('count').value, 10) || 6));
    let wins = Math.min(count - 1, Math.max(1, parseInt(input('wins').value, 10) || 1));
    if (texts.length >= 2) {
      lots = shuffle(texts.map((t) => ({ text: t, win: !isLose(t) })));
      count = texts.length;
    } else lots = shuffle(Array.from({ length: count }, (_, i) => ({ text: i < wins ? label : '꽝', win: i < wins })));
    input('count').value = count;
    input('wins').value = wins;
    cur = { count, wins, label, people: input('people').value, texts: texts.length >= 2 ? input('texts').value : '' };
    gameStore.save('lots', cur);
    root.querySelectorAll('.num-row [data-k="count"], .num-row [data-k="wins"]').forEach((el) => (el.disabled = !!cur.texts));
    found = 0;
    turn = 0;
    log = [];
    showLog();
    grid.innerHTML = lots.map((_, i) => `<button class="lot" data-i="${i}" aria-label="${i + 1}번 종이"><b>${i + 1}</b></button>`).join('');
    status(people.length ? `${esc(people[0])}부터 종이를 하나 골라 펼쳐 보세요` : '종이를 하나 골라 펼쳐 보세요');
  }

  function open(btn, quick) {
    if (btn.classList.contains('open') || btn.classList.contains('busy')) return;
    btn.classList.add('busy');
    const i = +btn.dataset.i;
    const { text, win } = lots[i];
    const who = !quick && people.length && turn < people.length ? people[turn++] : '';
    const reveal = () => {
      btn.classList.remove('shake');
      btn.classList.add('flip');
      timers.push(
        setTimeout(() => {
          btn.classList.remove('busy');
          btn.classList.add('open', win ? 'win' : 'lose');
          btn.innerHTML = win ? `<small>${i + 1}</small><span>🎉</span><b>${esc(text)}</b>` : `<small>${i + 1}</small><b>${esc(text)}</b>`;
          if (who) btn.insertAdjacentHTML('beforeend', `<em class="lot-who">${esc(who)}</em>`);
          if (win) {
            found++;
            buzz(80);
            sfx('win');
            btn.insertAdjacentHTML('beforeend', '<i class="lot-burst" aria-hidden="true"></i>');
          } else sfx('tick');
          log.push({ who, i, text, win });
          showLog();
          const whoTxt = who ? `${esc(who)} → ` : '';
          if (!quick) status(win ? `🎉 ${whoTxt}<b>${i + 1}번</b> ${esc(text)}!` : `${whoTxt}${i + 1}번은 ${esc(text)}… 😅`);
          else status(grid.querySelectorAll('.lot:not(.open)').length ? '' : '모두 펼쳤어요');
        }, 180)
      );
    };
    if (quick) reveal();
    else {
      // 펼치기 전에 두근두근 흔들림 (당첨 종이는 조금 더 오래)
      btn.classList.add('shake');
      timers.push(setTimeout(reveal, win ? 1000 : 700));
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
    <div class="bomb-tally" hidden></div>
    <label class="field">
      <span>참가자 (선택 · 넣으면 폭탄을 눌러 넘기고, 누가 걸렸는지 세어 줘요)</span>
      <textarea class="people" rows="3" placeholder="철수&#10;영희&#10;민수">${esc(saved.people || '')}</textarea>
    </label>
    <label class="field">
      <span>벌칙 (터지면 하나 뽑아 줘요 · 비워도 돼요)</span>
      <textarea class="names" rows="5">${esc(saved.penalties)}</textarea>
    </label>`;
  const stage = root.querySelector('.bomb-stage');
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  const soundEl = root.querySelector('[data-k="sound"]');
  const ta = root.querySelector('.names');
  const peopleEl = root.querySelector('.people');
  const tallyEl = root.querySelector('.bomb-tally');
  let timer = 0;
  let people = [];
  let holder = 0;
  let passes = 0;
  let live = false;
  const tally = {}; // 이번에 걸린 횟수

  const save = () => gameStore.save('bomb', { len, mode, sound: soundEl.checked, penalties: ta.value, people: peopleEl.value });
  const showTally = () => {
    const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    tallyEl.hidden = !rows.length;
    tallyEl.innerHTML = `<p class="hist-title">걸린 횟수</p><div>${rows.map(([k, v]) => `<span class="chip">${esc(k)} <b>${v}</b></span>`).join('')}</div>`;
  };
  // 참가자가 있으면 폭탄(판)을 누를 때마다 다음 사람에게 넘어감
  const showHolder = () => {
    let el = stage.querySelector('.bomb-holder');
    if (!el) {
      el = document.createElement('p');
      el.className = 'bomb-holder';
      stage.prepend(el);
    }
    el.innerHTML = `💣 <b>${esc(people[holder])}</b> 손에! <small>폭탄을 눌러 넘기기 · ${passes}번 넘김</small>`;
  };
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
    people = parseNames(peopleEl.value, 20);
    live = true;
    passes = 0;
    if (people.length >= 2) {
      holder = Math.floor(Math.random() * people.length);
      showHolder();
    }
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
    live = false;
    const who = people.length >= 2 ? people[holder] : '';
    stage.className = 'bomb-stage boom';
    stage.innerHTML = `<div class="boom-fx" aria-hidden="true">${'<i></i>'.repeat(14)}</div><div class="boom-text">펑!</div><p class="bomb-msg">💥 ${who ? `<b>${esc(who)}</b> 걸렸어요!` : '지금 폰 든 사람 걸렸어요!'}</p>`;
    if (soundEl.checked) gameAudio.boom();
    buzz([300, 80, 300]);
    if (who) {
      tally[who] = (tally[who] || 0) + 1;
      showTally();
    }
    const list = parseNames(ta.value, 50);
    const sec = (ms / 1000).toFixed(1);
    const info = `${sec}초 만에 터졌어요${passes ? ` · ${passes}번 넘김` : ''}`;
    resultEl.innerHTML = list.length
      ? `${who ? `<b>${esc(who)}</b> ` : ''}벌칙: <b>${esc(list[Math.floor(Math.random() * list.length)])}</b><br><small class="sub">${info}</small>`
      : `${who ? `<b>${esc(who)}</b> 걸림! ` : ''}${info}!`;
    startBtn.disabled = false;
    startBtn.textContent = '한 판 더';
  }

  // 폭탄(판)을 누르면 다음 사람에게 넘김
  stage.addEventListener('pointerdown', (e) => {
    if (!live || people.length < 2 || e.target.closest('.bomb-word')) return;
    holder = (holder + 1) % people.length;
    passes++;
    showHolder();
    buzz(15);
    const b = stage.querySelector('.bomb');
    b?.classList.remove('pass');
    void b?.offsetWidth;
    b?.classList.add('pass');
  });

  function reset() {
    clearTimeout(timer);
    live = false;
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
  peopleEl.addEventListener('change', save);
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
            sfx('win');
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

// 3D 주사위: 정육면체 6면. 값 v가 앞을 보게 하는 회전 (x, y)
const DIE_FACE_ROT = { 1: [0, 0], 6: [0, 180], 2: [0, -90], 5: [0, 90], 3: [-90, 0], 4: [90, 0] };
const DIE_FACES = [
  [1, 'translateZ(var(--hz))'],
  [6, 'rotateY(180deg) translateZ(var(--hz))'],
  [2, 'rotateY(90deg) translateZ(var(--hz))'],
  [5, 'rotateY(-90deg) translateZ(var(--hz))'],
  [3, 'rotateX(90deg) translateZ(var(--hz))'],
  [4, 'rotateX(-90deg) translateZ(var(--hz))'],
];
const cubeHtml = () => `<div class="cube">${DIE_FACES.map(([v, t]) => `<div class="cube-face" style="transform:${t}">${dieSvg(v)}</div>`).join('')}</div>`;

function renderDice(root) {
  const saved = gameStore.get('dice') || { mode: 'dice', n: 2 };
  let mode = saved.mode;
  let n = Math.min(6, saved.n || 2);
  let coinDeg = 0;
  let timers = [];
  const hist = { dice: [], coin: [] };
  let vals = [];
  let turns = [];
  let rolled = false;
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
      ${[1, 2, 3, 4, 5, 6].map((c) => `<button class="chip" data-n="${c}">${c}개</button>`).join('')}
    </div>
    <div class="dice-stats"></div>`;
  const stage = root.querySelector('.dice-stage');
  const resultEl = root.querySelector('.game-result');
  const rollBtn = root.querySelector('[data-act="roll"]');
  const statsEl = root.querySelector('.dice-stats');
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  // 기록: 주사위는 합계 분포 막대, 동전은 앞·뒤 비율과 최다 연속
  function showStats() {
    const h = hist[mode];
    if (!h.length) {
      statsEl.innerHTML = '';
      return;
    }
    if (mode === 'dice') {
      const lo = n;
      const hi = n * 6;
      const cnt = {};
      h.forEach((s) => (cnt[s] = (cnt[s] || 0) + 1));
      const top = Math.max(...Object.values(cnt));
      const avg = h.reduce((a, b) => a + b, 0) / h.length;
      const bars = [];
      for (let s = lo; s <= hi; s++) bars.push(`<div title="${s}: ${cnt[s] || 0}번"><i style="--h:${Math.round(((cnt[s] || 0) / top) * 100)}%"></i><small>${s}</small></div>`);
      statsEl.innerHTML = `<p class="hist-title">${h.length}번 굴림 · 평균 ${avg.toFixed(1)} (이론상 ${(n * 3.5).toFixed(1)})</p><div class="dist">${bars.join('')}</div><p class="hist-note">최근: ${h.slice(-12).reverse().join(' · ')}</p>`;
    } else {
      const heads = h.filter((x) => x === '앞').length;
      let best = { v: '', k: 0 };
      let cur = { v: '', k: 0 };
      for (const x of h) {
        cur = x === cur.v ? { v: x, k: cur.k + 1 } : { v: x, k: 1 };
        if (cur.k > best.k) best = cur;
      }
      const pct = Math.round((heads / h.length) * 100);
      statsEl.innerHTML = `<p class="hist-title">${h.length}번 던짐 · 앞 ${heads} · 뒤 ${h.length - heads}${best.k >= 2 ? ` · 최다 연속 ${best.v} ${best.k}번` : ''}</p><div class="coin-ratio"><i style="width:${pct}%">앞 ${pct}%</i><span>뒤 ${100 - pct}%</span></div><p class="hist-note">최근: ${h.slice(-15).reverse().join(' ')}</p>`;
    }
  }

  const setCube = (el, v, k) => {
    const [x, y] = DIE_FACE_ROT[v];
    el.querySelector('.cube').style.transform = `rotateX(${360 * k + x}deg) rotateY(${360 * k + y}deg)`;
  };

  function setup() {
    clear();
    gameStore.save('dice', { mode, n });
    root.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === mode));
    root.querySelectorAll('[data-n]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.n === n));
    root.querySelector('.dice-count').hidden = mode !== 'dice';
    coinDeg = 0;
    rolled = false;
    vals = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6));
    turns = vals.map(() => 0);
    stage.innerHTML =
      mode === 'dice'
        ? vals.map((v, i) => `<button class="die3" data-i="${i}" aria-label="주사위 ${i + 1}">${cubeHtml()}<span class="die-hold">고정</span></button>`).join('')
        : `<div class="coin-wrap"><div class="coin"><div class="coin-face front">앞</div><div class="coin-face back">뒤</div></div></div>`;
    if (mode === 'dice') {
      stage.querySelectorAll('.die3').forEach((el, i) => {
        setCube(el, vals[i], 0);
        // 굴린 뒤 주사위를 누르면 고정 (다음에 그 주사위만 빼고 굴림)
        el.addEventListener('click', () => {
          if (!rolled || rollBtn.disabled) return;
          el.classList.toggle('held');
          const held = stage.querySelectorAll('.die3.held').length;
          rollBtn.textContent = held ? `${n - held}개 다시 굴리기` : '다시 굴리기';
        });
      });
    }
    rollBtn.disabled = false;
    rollBtn.textContent = mode === 'dice' ? '굴리기' : '던지기';
    resultEl.textContent = mode === 'dice' ? '굴리기를 눌러 보세요. 굴린 뒤 주사위를 누르면 고정할 수 있어요.' : '앞일까 뒤일까?';
    showStats();
  }

  function rollDice() {
    const dice = [...stage.querySelectorAll('.die3')];
    const free = dice.filter((d) => !d.classList.contains('held'));
    if (!free.length) {
      resultEl.textContent = '고정을 하나 이상 풀어 주세요.';
      rollBtn.disabled = false;
      return;
    }
    free.forEach((d) => {
      const i = +d.dataset.i;
      vals[i] = 1 + Math.floor(Math.random() * 6);
      turns[i] += 2 + Math.floor(Math.random() * 3);
      d.classList.remove('hop');
      void d.offsetWidth;
      d.classList.add('hop');
      d.style.setProperty('--dur', `${1.1 + Math.random() * 0.4}s`);
      setCube(d, vals[i], turns[i]);
    });
    resultEl.textContent = '데굴데굴…';
    sfx('tick');
    timers.push(
      setTimeout(() => {
        const sum = vals.reduce((a, b) => a + b, 0);
        const same = vals.length > 1 && vals.every((v) => v === vals[0]);
        const sorted = [...vals].sort((a, b) => a - b);
        const straight = vals.length >= 4 && sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
        resultEl.innerHTML =
          vals.length === 1
            ? `🎲 <b>${sum}</b>`
            : `${vals.join(' + ')} = <b>${sum}</b>${same ? ' · 🎉 모두 같은 숫자!' : straight ? ' · 🌈 연속 숫자!' : ''}`;
        hist.dice = [...hist.dice, sum].slice(-200);
        rolled = true;
        showStats();
        buzz(30);
        sfx(same ? 'win' : 'pop');
        rollBtn.disabled = false;
      }, 1650)
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
        hist.coin = [...hist.coin, head ? '앞' : '뒤'].slice(-200);
        showStats();
        buzz(30);
        sfx('pop');
        rollBtn.disabled = false;
      }, 1650)
    );
  }

  rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    if (mode === 'dice') {
      rollDice();
      if (!stage.querySelector('.die3.held')) rollBtn.textContent = '다시 굴리기';
    } else {
      rollBtn.textContent = '다시 던지기';
      flipCoin();
    }
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
      if (+b.dataset.n !== n) hist.dice = [];
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
        sfx('win');
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
      <div class="field"><span>설명 시간</span>
        <div class="opt-row">${[60, 120, 180].map((s) => `<button class="chip" data-sec="${s}" aria-pressed="${s === (saved.sec || 180)}">${s / 60}분</button>`).join('')}</div>
      </div>
      <label class="field"><span>이름 (선택 · 한 줄에 하나) — 넣으면 번호 대신 이름으로 부르고 판마다 점수를 쌓아요</span><textarea class="liar-names" rows="3" placeholder="철수&#10;영희&#10;민수&#10;지은">${esc(saved.names || '')}</textarea></label>
      <label class="check"><input type="checkbox" data-k="fool" ${saved.fool ? 'checked' : ''}> 바보 모드 (라이어도 자기가 라이어인 줄 모르고 비슷한 단어를 받아요)</label>
      <button class="btn block" data-act="start">게임 시작</button>
    </div>
    <div class="liar-score" hidden></div>`;
  const stage = root.querySelector('.liar-stage');
  const setup = root.querySelector('.liar-setup');
  const foolEl = root.querySelector('[data-k="fool"]');
  const namesEl = root.querySelector('.liar-names');
  const scoreEl = root.querySelector('.liar-score');
  let sec = saved.sec || 180;
  let game = null;
  let timer = 0;
  let names = [];
  const score = {}; // 이름별 누적 점수 (시민 승리: 시민 +1, 라이어 승리: 라이어 +3)
  const save = () => gameStore.save('liar', { n, cat, fool: foolEl.checked, sec, names: namesEl.value });
  const who = (i) => (names[i] ? esc(names[i]) : `${i + 1}번`);
  function award(liarWin) {
    if (!names.length) return;
    for (let i = 0; i < n; i++) {
      const k = names[i];
      score[k] = (score[k] || 0) + (i === game.liar ? (liarWin ? 3 : 0) : liarWin ? 0 : 1);
    }
    const rows = Object.entries(score).sort((a, b) => b[1] - a[1]);
    scoreEl.innerHTML = `<p class="hist-title">누적 점수 (시민 승리 +1 · 라이어 승리 +3)</p><div>${rows.map(([k, v], r) => `<span class="chip${r === 0 ? ' now' : ''}">${r === 0 ? '👑 ' : ''}${esc(k)} <b>${v}</b></span>`).join('')}</div>`;
    scoreEl.hidden = false;
  }

  function start() {
    names = parseNames(namesEl.value, 10);
    if (names.length >= 3) {
      n = names.length;
      root.querySelectorAll('[data-n]').forEach((x) => x.setAttribute('aria-pressed', +x.dataset.n === n));
    } else names = [];
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
        <p class="liar-who">${who(i)} 차례</p>
        <p>폰을 받았으면 아래 카드를 눌러<br>제시어를 혼자 확인하세요</p>
        <button class="btn block" data-act="peek">🔍 내 제시어 보기</button>
      </div>
      <p class="game-result">주제: <b>${esc(game.topic)}</b> · ${i + 1} / ${n}</p>`;
    stage.querySelector('[data-act="peek"]').addEventListener('click', () => {
      const isLiar = i === game.liar;
      const text = isLiar && !game.fool ? '당신은 <b class="liar-red">라이어</b>예요' : `제시어: <b>${esc(isLiar ? game.other : game.word)}</b>`;
      stage.innerHTML = `
        <div class="liar-card flipin">
          <p class="liar-who">${who(i)}</p>
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
    let left = sec;
    const first = Math.floor(Math.random() * n);
    // 발언 순서: 무작위 첫 사람부터 한 바퀴. '다음 사람'을 누르면 차례가 넘어감
    const order = Array.from({ length: n }, (_, k) => (first + k) % n);
    let speak = 0;
    stage.innerHTML = `
      <div class="liar-card">
        <p class="liar-who">모두 확인 완료!</p>
        <p>순서대로 제시어를 한마디씩 설명하세요.<br>너무 쉽게 말하면 라이어가 눈치채요 😏</p>
        <div class="liar-order">${order.map((k, j) => `<span class="chip${j === 0 ? ' now' : ''}">${who(k)}</span>`).join('')}</div>
        <div class="liar-ring" style="--p:1"><p class="liar-timer">${Math.floor(sec / 60)}:00</p></div>
        <div class="game-actions"><button class="btn ghost block" data-act="speak">다음 사람 ▶</button><button class="btn block" data-act="vote">투표하러 가기</button></div>
      </div>`;
    const t = stage.querySelector('.liar-timer');
    const ring = stage.querySelector('.liar-ring');
    stage.querySelector('[data-act="speak"]').addEventListener('click', () => {
      const chips = stage.querySelectorAll('.liar-order .chip');
      chips[speak % n].classList.remove('now');
      chips[speak % n].classList.add('done');
      speak++;
      chips[speak % n].classList.add('now');
      sfx('tick');
    });
    timer = setInterval(() => {
      left--;
      t.textContent = `${Math.floor(Math.max(left, 0) / 60)}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`;
      ring.style.setProperty('--p', Math.max(0, left / sec));
      ring.classList.toggle('low', left <= 10);
      if (left > 0 && left <= 5) sfx('tick');
      if (left <= 0) {
        clearInterval(timer);
        t.textContent = '시간 끝!';
        buzz(200);
        sfx('lose');
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
        <div class="liar-votes">${Array.from({ length: n }, (_, k) => `<button class="chip" data-pick="${k}">${who(k)}</button>`).join('')}</div>
      </div>`;
    stage.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => reveal(+b.dataset.pick)));
  }

  function reveal(pick) {
    const caught = pick === game.liar;
    stage.innerHTML = `
      <div class="liar-card ${caught ? 'ok' : 'bad'}">
        <p class="liar-who">${caught ? '🎯 라이어를 잡았어요!' : '😈 라이어가 숨어 있었어요!'}</p>
        <p class="liar-word">라이어는 <b>${who(game.liar)}</b> · 제시어는 <b>${esc(game.word)}</b>${game.fool ? ` <small>(라이어 단어: ${esc(game.other)})</small>` : ''}</p>
        ${caught && !game.fool ? '<p>라이어에게 마지막 기회! 제시어를 맞히면 라이어 승리예요.</p><div class="game-actions"><button class="btn ghost block" data-end="liar">라이어가 맞혔어요</button><button class="btn ghost block" data-end="citizen">못 맞혔어요</button></div>' : ''}
        <p class="game-result" data-role="final">${caught ? (game.fool ? '시민 승리! 🎉' : '') : '라이어 승리! 시민 모두 벌칙 😆'}</p>
        <button class="btn block" data-act="again">한 판 더</button>
      </div>`;
    // 승패가 바로 정해지면 점수 반영, 라이어가 제시어 맞히기 단계면 고른 뒤 반영
    if (!caught) award(true);
    else if (game.fool) award(false);
    sfx(caught ? 'win' : 'lose');
    stage.querySelectorAll('[data-end]').forEach((b) =>
      b.addEventListener('click', () => {
        stage.querySelector('[data-role="final"]').textContent = b.dataset.end === 'liar' ? '라이어 역전승! 😈' : '시민 승리! 🎉';
        stage.querySelectorAll('[data-end]').forEach((x) => (x.disabled = true));
        award(b.dataset.end === 'liar');
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
  root.querySelectorAll('[data-sec]').forEach((b) =>
    b.addEventListener('click', () => {
      sec = +b.dataset.sec;
      root.querySelectorAll('[data-sec]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      save();
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
    <p class="croc-odds"></p>
    <div class="game-actions">
      <button class="btn block" data-act="reset">새 판 (다시 시작)</button>
    </div>
    <div class="opt-row" role="group" aria-label="이빨 수">${[6, 8, 10, 12, 14].map((k) => `<button class="chip" data-teeth="${k}" aria-pressed="${k === teeth}">이빨 ${k}개</button>`).join('')}</div>
    <div class="bomb-tally croc-tally" hidden></div>
    <label class="field"><span>참가자 (선택 · 넣으면 차례를 알려 주고 물린 횟수를 세요)</span><textarea class="croc-names" rows="3" placeholder="철수&#10;영희&#10;민수">${esc((gameStore.get('croc') || {}).names || '')}</textarea></label>`;
  const croc = root.querySelector('.croc');
  const box = root.querySelector('.croc-teeth');
  const resultEl = root.querySelector('.game-result');
  const oddsEl = root.querySelector('.croc-odds');
  const namesEl = root.querySelector('.croc-names');
  const tallyEl = root.querySelector('.croc-tally');
  let people = [];
  let turn = 0;
  let busy = false;
  const bitten = {};
  const turnTxt = () => (people.length ? ` · 👉 <b>${esc(people[turn % people.length])}</b> 차례` : '');
  const odds = () => {
    const left = box.querySelectorAll('.tooth:not(.down)').length;
    oddsEl.textContent = over ? '' : `이번에 물릴 확률 1/${left} (${Math.round(100 / left)}%)`;
  };

  function setup() {
    over = false;
    busy = false;
    people = parseNames(namesEl.value, 20);
    gameStore.save('croc', { names: namesEl.value });
    bite = Math.floor(Math.random() * teeth);
    croc.classList.remove('snap', 'twitch');
    box.style.setProperty('--n', teeth);
    box.innerHTML = Array.from({ length: teeth }, (_, i) => `<button class="tooth" data-i="${i}" aria-label="${i + 1}번 이빨"></button>`).join('');
    resultEl.innerHTML = `이빨 ${teeth}개 중 하나가 물어요! 번갈아 눌러 보세요 🐊${turnTxt()}`;
    odds();
  }
  box.addEventListener('click', (e) => {
    const t = e.target.closest('.tooth');
    if (!t || over || busy || t.classList.contains('down')) return;
    // 누르면 악어가 움찔하고 0.5초 뒤에 결과 (두근두근)
    busy = true;
    croc.classList.remove('twitch');
    void croc.offsetWidth;
    croc.classList.add('twitch');
    t.classList.add('press');
    sfx('tick');
    const who = people.length ? people[turn % people.length] : '';
    setTimeout(() => {
      busy = false;
      t.classList.remove('press');
      if (+t.dataset.i === bite) {
        over = true;
        croc.classList.add('snap');
        t.classList.add('hit');
        buzz([250, 60, 250]);
        gameAudio.unlock();
        gameAudio.boom();
        resultEl.innerHTML = `꽉! 🐊 ${who ? `<b>${esc(who)}</b> ` : ''}<b>당첨!</b> 벌칙 받으세요`;
        if (who) {
          bitten[who] = (bitten[who] || 0) + 1;
          const rows = Object.entries(bitten).sort((a, b) => b[1] - a[1]);
          tallyEl.innerHTML = `<p class="hist-title">물린 횟수</p><div>${rows.map(([k, v]) => `<span class="chip">${esc(k)} <b>${v}</b></span>`).join('')}</div>`;
          tallyEl.hidden = false;
        }
        turn = 0;
      } else {
        t.classList.add('down');
        buzz(15);
        sfx('pop');
        turn++;
        const left = box.querySelectorAll('.tooth:not(.down)').length;
        resultEl.innerHTML = `휴~ ${who ? `${esc(who)} ` : ''}살았다! 남은 이빨 ${left}개${turnTxt()}`;
      }
      odds();
    }, 500);
  });
  root.querySelector('[data-act="reset"]').addEventListener('click', setup);
  root.querySelectorAll('[data-teeth]').forEach((b) =>
    b.addEventListener('click', () => {
      teeth = +b.dataset.teeth;
      root.querySelectorAll('[data-teeth]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      setup();
    })
  );
  namesEl.addEventListener('change', setup);
  setup();
}

/* ═════════════════════ 미니게임 대결 (13종) ═════════════════════ */

// 폰 하나를 돌려 가며 한 명씩 도전 → 라운드마다 꼴찌가 벌칙. 혼자 넣으면 연습 모드(내 최고 기록과 비교)
// better: 'high' = 클수록 잘함, 'low' = 작을수록 잘함. 실격은 high → -1, low → 99999
const FAIL_HIGH = -1;
// 반응속도 테스트 등급 (5번 평균 ms 기준, 사람 평균은 보통 250ms 안팎)
const RX_GRADES = [
  [180, '⚡', '번개 손 · 프로게이머급'],
  [220, '🔥', '아주 빨라요 · 상위권'],
  [260, '😎', '평균보다 빨라요'],
  [310, '🙂', '딱 보통 사람 평균'],
  [380, '🐢', '조금 느긋한 편'],
  [Infinity, '😴', '혹시 졸려요?'],
];
const rxGrade = (ms) => RX_GRADES.find(([max]) => ms < max);
const rxWord = (ms) => (ms < 200 ? '번개!' : ms < 250 ? '빨라요' : ms < 300 ? '좋아요' : ms < 400 ? '보통' : '느긋~');
const FAIL_LOW = 99999;
const MINI_GAMES = [
  { id: 'tap', icon: '👆', title: '5초 연타', desc: '5초 동안 화면을 최대한 많이 누르세요!', better: 'high', fmt: (s) => `${s}번` },
  { id: 'ten', icon: '⏱️', title: '10초 맞히기', desc: '정확히 10.00초에 멈추세요! (3초 뒤 시계가 사라져요)', better: 'low', fmt: (s) => `${s.toFixed(2)}초 차이` },
  { id: 'react', icon: '🚦', title: '반응 속도', desc: '화면이 초록색으로 바뀌는 순간 누르세요! (먼저 누르면 실격)', better: 'low', fmt: (s) => `${s}ms` },
  { id: 'order', icon: '🔢', title: '1→16 순서대로', desc: '숫자를 1부터 16까지 순서대로 빠르게 누르세요!', better: 'low', fmt: (s) => `${s.toFixed(2)}초` },
];
// 따로 하나씩 있는 게임 (게임 목록에 각각 카드로 나옴). 플레이 방식은 미니게임 대결과 같음: 혼자면 기록 도전, 여럿이면 꼴찌 벌칙
const SOLO_GAMES = [
  { id: 'reaction', icon: '⚡', title: '반응속도 테스트', desc: '빨간 화면이 초록색으로 바뀌는 순간 눌러요! 5번 재서 평균으로 등급이 나와요 (키보드 스페이스바도 돼요)', better: 'low', fmt: (s) => `평균 ${s}ms` },
  { id: 'aim', icon: '🎯', title: '풍선 터뜨리기', desc: '이리저리 떠다니는 풍선 10개를 빨리 터뜨려요! 헛손질은 0.5초 추가', better: 'low', fmt: (s) => `${s.toFixed(2)}초` },
  { id: 'track', icon: '🐝', title: '꿀벌 따라가기', desc: '6초 동안 손가락(마우스)을 꿀벌 위에 꾹 대고 따라다니세요!', better: 'high', fmt: (s) => `${s}% 붙어 있음` },
  { id: 'rhythm', icon: '🥁', title: '박자 맞추기', desc: '내려오는 노트가 빛나는 선에 닿을 때 그 칸을 눌러요! 콤보가 이어질수록 점수가 커져요 (키보드 D·F·J·K)', better: 'high', fmt: (s) => `${s}점` },
  { id: 'last', icon: '🐉', title: '마지막 한 방', desc: '용 체력이 900 이하일 때만 한 방에 쓰러져요. 너무 일찍 치면 헛방, 0이 되면 놓침!', better: 'high', fmt: (s) => `체력 ${s}에서 처치` },
  { id: 'gauge', icon: '🎚️', title: '초록 칸에 멈춰', desc: '왔다 갔다 하는 막대를 초록 칸 한가운데서 멈춰요 (3번)', better: 'low', fmt: (s) => `가운데서 평균 ${s.toFixed(1)}칸` },
  { id: 'combo', icon: '🔤', title: '글자 콤보', desc: '위에 나온 글자 8개를 순서대로 빨리 눌러요! 틀리면 1초 추가', better: 'low', fmt: (s) => `${s.toFixed(2)}초` },
  { id: 'stroop', icon: '🎨', title: '색깔 헷갈림', desc: '글자가 아니라 글자의 "색깔"을 골라요! 10문제, 틀리면 1초 추가', better: 'low', fmt: (s) => `${s.toFixed(2)}초` },
  { id: 'simon', icon: '🧠', title: '순서 기억하기', desc: '깜빡이는 순서를 기억해서 그대로 눌러요. 한 번 틀리면 끝!', better: 'high', fmt: (s) => `${s}개 기억` },
  { id: 'dodge', icon: '☄️', title: '별똥별 피하기', desc: '내 우주선을 끌어서 떨어지는 별똥별을 피해요. 오래 버틸수록 1등!', better: 'high', fmt: (s) => `${s.toFixed(1)}초 버팀` },
];

// 따로 있는 게임: 게임 id → 화면
const SOLO_RENDER = Object.fromEntries(SOLO_GAMES.map((g) => [g.id, (root) => renderMini(root, { key: g.id, list: [g] })]));

// 10초 미니게임 대결에서 돌아가며 나오는 게임: 기본 4종 + 금방 끝나는 개인 게임 6종
const MINI_POOL = [...MINI_GAMES, ...SOLO_GAMES.filter((g) => ['aim', 'gauge', 'combo', 'stroop', 'last', 'track'].includes(g.id))];

// 개인 기록: 최근 10판 막대 그래프 (가장 좋은 판은 금색)
function histChart(g, list) {
  if (list.length < 2) return '';
  const max = Math.max(...list.map(Math.abs)) || 1;
  const best = g.better === 'high' ? Math.max(...list) : Math.min(...list);
  return `<div class="hist"><p class="hist-title">최근 ${list.length}판</p><div class="hist-bars">${list
    .map((v, i) => `<i class="${v === best ? 'best' : ''}${i === list.length - 1 ? ' now' : ''}" style="--h:${Math.max(6, Math.round((Math.abs(v) / max) * 100))}%" title="${esc(g.fmt(v))}"></i>`)
    .join('')}</div><p class="hist-note">${g.better === 'high' ? '막대가 길수록 좋아요' : '막대가 짧을수록 좋아요'} · 금색이 최고 기록</p></div>`;
}
// 반응속도: 등급 띠 위에 내 평균 표시 + 회차별 막대
function rxBands(avg, times) {
  const lo = 120;
  const hi = 450;
  const pos = (ms) => Math.max(0, Math.min(100, ((ms - lo) / (hi - lo)) * 100));
  let prev = lo;
  const bands = RX_GRADES.map(([max, icon, name], i) => {
    const end = Math.min(max, hi);
    const w = pos(end) - pos(prev);
    prev = end;
    return `<span style="width:${w}%;--i:${i}" title="${name}">${icon}</span>`;
  }).join('');
  const maxT = Math.max(...times);
  return `<div class="rx-band"><div class="rx-band-bar">${bands}<b style="left:${pos(avg)}%">▼ ${avg}</b></div><div class="rx-band-axis"><span>${lo}ms 빠름</span><span>느림 ${hi}ms</span></div></div>
    <div class="rx-tries">${times.map((t, i) => `<div><i style="--h:${Math.round((t / maxT) * 100)}%" class="${t === Math.min(...times) ? 'best' : ''}"></i><small>${i + 1}회<br>${t}</small></div>`).join('')}</div>`;
}

function renderMini(root, cfg = { key: 'mini', list: MINI_POOL }) {
  const single = cfg.list.length === 1;
  const saved = gameStore.get(cfg.key) || { names: single ? '나' : '철수\n영희\n민수\n지은', pick: 'all' };
  const vs = single ? challengeScore(cfg.list[0]) : null;
  const vsText = (g, v) => g.fmt(v) + (g.id === 'reaction' ? ` (${rxGrade(v)[2]})` : '');
  root.innerHTML = `
    <div class="mini-stage"></div>
    <div class="mini-setup">
      ${vs != null ? `<p class="vs-banner">📣 친구 기록 <b>${esc(vsText(cfg.list[0], vs))}</b> · 이겨 볼래요?</p>` : ''}
      ${single ? `<p class="mini-lead">${cfg.list[0].icon} ${esc(cfg.list[0].desc)}</p>` : ''}
      <label class="field"><span>참가자 (1~8명 · 혼자면 기록 도전)</span><textarea class="names" rows="${single ? 2 : 4}">${esc(saved.names)}</textarea></label>
      ${single ? '' : `<label class="field"><span>미니게임</span><select class="mini-pick">
        <option value="all">🎲 돌아가며 (무작위 순서)</option>
        ${cfg.list.map((g) => `<option value="${g.id}"${saved.pick === g.id ? ' selected' : ''}>${g.icon} ${esc(g.title)}</option>`).join('')}
      </select></label>`}
      <button class="btn block" data-act="start">${single ? '시작' : '대결 시작'}</button>
      <p class="lol-hint">${single ? '혼자 하면 내 최고 기록에 도전하고, 이름을 여러 명 넣으면 폰을 돌려 가며 겨뤄서 꼴찌가 벌칙!' : '라운드마다 미니게임이 하나씩 나와요. 폰을 돌려 가며 한 명씩 도전하고, 꼴찌는 벌칙!'}</p>
    </div>`;
  const stage = root.querySelector('.mini-stage');
  const setupEl = root.querySelector('.mini-setup');
  const ta = root.querySelector('.names');
  const pickEl = root.querySelector('.mini-pick');
  if (pickEl && saved.pick === 'all') pickEl.value = 'all';
  const pick = () => (pickEl ? pickEl.value : cfg.list[0].id);
  let names = [];
  let round = 0;
  let order = shuffle(cfg.list);
  let scores = [];
  let totals = []; // 여럿이 할 때 라운드 누적 점수 (1등 = 참가자 수만큼, 실격 0점)
  let turn = 0;
  let cleanup = () => {};
  const stop = () => { cleanup(); cleanup = () => {}; };
  const solo = () => names.length === 1;

  function start() {
    names = parseNames(ta.value, 8);
    if (!names.length) {
      stage.innerHTML = '<p class="game-result">참가자 이름을 1명 이상 넣어 주세요.</p>';
      return;
    }
    gameStore.save(cfg.key, { names: ta.value, pick: pick() });
    setupEl.hidden = true;
    round = 0;
    totals = names.map(() => 0);
    order = pick() === 'all' ? shuffle(cfg.list) : [cfg.list.find((g) => g.id === pick())];
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
        <p class="sub">${solo() ? `연습 ${round + 1}판` : `라운드 ${round + 1} · ${turn + 1} / ${names.length}`}</p>
        <p class="liar-who">${g.icon} ${esc(g.title)}</p>
        <p>${esc(g.desc)}</p>
        <p class="liar-word"><b>${esc(names[turn])}</b> 차례!</p>
        <button class="btn block" data-act="go">준비됐으면 시작</button>
      </div>`;
    stage.querySelector('[data-act="go"]').addEventListener('click', () => {
      play(g);
      focusBoard(stage);
    });
  }

  let lastLabel = '';
  function done(score, label) {
    stop();
    scores[turn] = score;
    lastLabel = label;
    if (solo()) {
      result();
      return;
    }
    stage.innerHTML = `<div class="liar-card"><p class="liar-who">${esc(names[turn])}</p><p class="liar-word">${label}</p><button class="btn block" data-act="next">${turn + 1 < names.length ? '다음 사람에게 넘기기' : '결과 보기'}</button></div>`;
    stage.querySelector('[data-act="next"]').addEventListener('click', () => {
      turn++;
      if (turn < names.length) ready();
      else result();
    });
  }

  // 게임마다 쓰는 넓은 판 (위에 안내 한 줄)
  function arena(info, extra = '') {
    stage.innerHTML = `<p class="game-result mini-info">${info}</p><div class="mini-arena">${extra}</div>`;
    return { arena: stage.querySelector('.mini-arena'), info: stage.querySelector('.mini-info') };
  }
  // 쉬지 않고 올라가는 큰 시계. add(초)는 벌칙: 숫자가 바로 뛰고 '+1초'가 튀어나옴
  function stopwatch(host) {
    const el = document.createElement('div');
    el.className = 'mini-timer';
    el.innerHTML = '<b>0.00</b><small>초</small>';
    host.prepend(el);
    const num = el.querySelector('b');
    const t0 = performance.now();
    let pen = 0;
    const sec = () => (performance.now() - t0) / 1000 + pen;
    const iv = setInterval(() => { num.textContent = sec().toFixed(2); }, 31);
    return {
      sec,
      pen: () => pen,
      add(s) {
        pen += s;
        num.textContent = sec().toFixed(2);
        const pop = document.createElement('span');
        pop.className = 'mini-pen';
        pop.textContent = `+${s}초`;
        el.appendChild(pop);
        setTimeout(() => pop.remove(), 800);
        el.classList.remove('hurt');
        void el.offsetWidth;
        el.classList.add('hurt');
      },
      stop() {
        clearInterval(iv);
        num.textContent = sec().toFixed(2);
      },
    };
  }

  // 반복 그리기 (cleanup 때 멈춤)
  function loop(fn) {
    let raf = 0;
    let alive = true;
    const step = (t) => {
      if (!alive) return;
      if (fn(t) !== false) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { alive = false; cancelAnimationFrame(raf); };
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
          sfx('ok');
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
    } else if (g.id === 'reaction') {
      // 5번 재서 평균. 초록색 전에 누르면 그 회차만 다시 (성급하게 누른 횟수는 결과에 표시)
      const TRIES = 5;
      const times = [];
      let early = 0;
      let state = '';
      let goAt = 0;
      let to = 0;
      let iv = 0;
      stage.innerHTML = `<div class="rx"><div class="rx-dots">${'<i></i>'.repeat(TRIES)}</div><button type="button" class="rx-pad"></button><p class="rx-log"></p></div>`;
      const pad = stage.querySelector('.rx-pad');
      const dots = stage.querySelectorAll('.rx-dots i');
      const logEl = stage.querySelector('.rx-log');
      const show = (cls, html) => {
        state = cls;
        pad.className = 'rx-pad ' + cls;
        pad.innerHTML = html;
      };
      const arm = () => {
        show('wait', '<b>기다리세요…</b><small>초록색이 되면 바로 누르기</small>');
        to = setTimeout(() => {
          goAt = performance.now();
          show('go', '<b class="rx-ms">0</b><small>ms · 지금 눌러요!</small>');
          const num = pad.querySelector('.rx-ms');
          iv = setInterval(() => { num.textContent = Math.round(performance.now() - goAt); }, 16);
        }, 1200 + Math.random() * 3300);
      };
      const finish = () => {
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const [, icon, name] = rxGrade(avg);
        setTimeout(() => done(avg, `<span class="rx-grade">${icon}</span><b>평균 ${avg}ms</b><br>${name}<small class="rx-sub">가장 빠름 ${Math.min(...times)}ms${early ? ` · 성급하게 누름 ${early}번` : ''}</small>${rxBands(avg, times)}`), 400);
      };
      const hit = () => {
        if (state === 'wait') {
          clearTimeout(to);
          early++;
          buzz(60);
          sfx('bad');
          show('early', '<b>너무 빨라요!</b><small>초록색을 기다렸다 눌러요 · 눌러서 다시</small>');
        } else if (state === 'go') {
          const ms = Math.round(performance.now() - goAt);
          clearInterval(iv);
          times.push(ms);
          dots[times.length - 1].classList.add('on');
          buzz(20);
          sfx('pop');
          logEl.innerHTML = times.map((t, i) => `<span>${i + 1}회 <b>${t}ms</b></span>`).join('');
          if (times.length >= TRIES) {
            show('done', `<b>${ms}<em>ms</em></b><small>${rxWord(ms)} · 결과 계산 중…</small>`);
            finish();
          } else show('shown', `<b>${ms}<em>ms</em></b><small>${rxWord(ms)} · 눌러서 다음 (${times.length}/${TRIES})</small>`);
        } else if (state === 'early' || state === 'shown') arm();
      };
      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        hit();
      });
      const onKey = (e) => {
        if (e.code !== 'Space' && e.key !== 'Enter') return;
        e.preventDefault();
        if (!e.repeat) hit();
      };
      document.addEventListener('keydown', onKey);
      cleanup = () => {
        clearTimeout(to);
        clearInterval(iv);
        document.removeEventListener('keydown', onKey);
      };
      arm();
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
          done(FAIL_LOW, '<b>너무 빨랐어요!</b> 실격 😅');
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
      const sw = stopwatch(stage);
      cleanup = () => sw.stop();
      stage.querySelector('.mini-grid').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-v]');
        if (!b) return;
        e.preventDefault();
        if (+b.dataset.v !== want) {
          b.classList.remove('miss');
          void b.offsetWidth;
          b.classList.add('miss');
          buzz(30);
          sfx('bad');
          return;
        }
        b.classList.add('hit');
        want++;
        if (want > 16) {
          sw.stop();
          const sec = sw.sec();
          done(sec, `<b>${sec.toFixed(2)}초</b> 걸렸어요!`);
        } else stage.querySelector('[data-role="want"]').textContent = want;
      });
    } else if (g.id === 'aim') {
      // 풍선이 벽에 튕기며 떠다님. 하나 터뜨리면 다음 풍선이 더 빨리 나옴
      const { arena: box, info } = arena('남은 풍선 <b>10</b>개');
      const W = box.clientWidth;
      const H = box.clientHeight;
      const R = 30;
      let left = 10;
      const sw = stopwatch(stage);
      const ball = document.createElement('button');
      ball.className = 'mini-balloon';
      ball.textContent = '🎈';
      box.appendChild(ball);
      let x, y, vx, vy;
      const spawn = () => {
        x = R + Math.random() * (W - 2 * R);
        y = R + Math.random() * (H - 2 * R);
        const sp = 90 + (10 - left) * 22; // 점점 빨라짐 (px/초)
        const a = Math.random() * Math.PI * 2;
        vx = Math.cos(a) * sp;
        vy = Math.sin(a) * sp;
      };
      spawn();
      let last = performance.now();
      const stopLoop = loop((t) => {
        const dt = Math.min(0.1, (t - last) / 1000);
        last = t;
        x += vx * dt;
        y += vy * dt;
        if (x < R || x > W - R) { vx = -vx; x = Math.max(R, Math.min(W - R, x)); }
        if (y < R || y > H - R) { vy = -vy; y = Math.max(R, Math.min(H - R, y)); }
        ball.style.transform = `translate(${x - R}px, ${y - R}px)`;
      });
      cleanup = () => { stopLoop(); sw.stop(); };
      box.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (e.target === ball) {
          left--;
          sfx('ok');
          buzz(15);
          if (!left) {
            sw.stop();
            const sec = sw.sec();
            done(sec, `<b>${sec.toFixed(2)}초</b>${sw.pen() ? ` (헛손질 +${sw.pen().toFixed(1)}초 포함)` : ''}`);
            return;
          }
          info.innerHTML = `남은 풍선 <b>${left}</b>개`;
          spawn();
        } else {
          sw.add(0.5);
          sfx('bad');
        }
      });
    } else if (g.id === 'track') {
      // 꿀벌이 부드럽게 날아다님. 누르고 있는 손가락이 꿀벌 근처에 있는 시간 비율
      const { arena: box, info } = arena('꿀벌 위에 꾹 누르고 따라가세요 · <b>6.0</b>초');
      const W = box.clientWidth;
      const H = box.clientHeight;
      const bee = document.createElement('div');
      bee.className = 'mini-bee';
      bee.textContent = '🐝';
      box.appendChild(bee);
      let bx = W / 2;
      let by = H / 2;
      let tx = bx;
      let ty = by;
      let px = -999;
      let py = -999;
      let down = false;
      let started = 0;
      let onMs = 0;
      let last = performance.now();
      const pick = () => { tx = 30 + Math.random() * (W - 60); ty = 30 + Math.random() * (H - 60); };
      pick();
      const pos = (e) => { const r = box.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
      box.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        box.setPointerCapture?.(e.pointerId);
        down = true;
        pos(e);
        if (!started) started = performance.now();
      });
      box.addEventListener('pointermove', (e) => { if (down) pos(e); });
      box.addEventListener('pointerup', () => { down = false; });
      box.addEventListener('pointercancel', () => { down = false; });
      cleanup = loop((t) => {
        const dt = Math.min(0.1, (t - last) / 1000);
        last = t;
        const dx = tx - bx;
        const dy = ty - by;
        const d = Math.hypot(dx, dy);
        const sp = 170; // px/초
        if (d < 8) pick();
        else { bx += (dx / d) * sp * dt; by += (dy / d) * sp * dt; }
        bee.style.transform = `translate(${bx - 22}px, ${by - 22}px)`;
        if (!started) return;
        const on = down && Math.hypot(px - bx, py - by) < 40;
        bee.classList.toggle('on', on);
        if (on) onMs += dt * 1000;
        const left = 6 - (t - started) / 1000;
        info.innerHTML = `꿀벌 위에 꾹 누르고 따라가세요 · <b>${Math.max(0, left).toFixed(1)}</b>초`;
        if (left <= 0) {
          const pct = Math.round((onMs / 6000) * 100);
          sfx('ok');
          setTimeout(() => done(pct, `꿀벌에 <b>${pct}%</b> 붙어 있었어요!`), 50);
          return false;
        }
      });
    } else if (g.id === 'rhythm') {
      // 리듬 게임: 4칸(색 다름)으로 노트가 내려오고, 판정선에 닿을 때 그 칸을 누름. 완벽 100 · 좋아 50 + 콤보 보너스
      const KEYS = ['d', 'f', 'j', 'k'];
      const COLORS = ['#ff6b9a', '#4dabf7', '#51cf66', '#ffd43b'];
      stage.innerHTML = `
        <div class="rg-top"><span>점수 <b data-role="score">0</b></span><span><b data-role="combo">0</b> 콤보</span></div>
        <div class="rg">
          <div class="rg-field">
            ${KEYS.map((k, i) => `<div class="rg-lane" data-lane="${i}" style="--c:${COLORS[i]}"></div>`).join('')}
            <div class="rg-line">${KEYS.map((k, i) => `<i style="--c:${COLORS[i]}"></i>`).join('')}</div>
            <div class="rg-judge" data-role="judge"></div>
          </div>
          <div class="rg-btns">${KEYS.map((k, i) => `<button data-lane="${i}" style="--c:${COLORS[i]}">${k.toUpperCase()}</button>`).join('')}</div>
        </div>`;
      const field = stage.querySelector('.rg-field');
      const lanes = [...stage.querySelectorAll('.rg-lane')];
      const btns = [...stage.querySelectorAll('.rg-btns button')];
      const rings = [...stage.querySelectorAll('.rg-line i')];
      const scoreEl = stage.querySelector('[data-role="score"]');
      const comboEl = stage.querySelector('[data-role="combo"]');
      const judgeEl = stage.querySelector('[data-role="judge"]');
      const FH = field.clientHeight;
      const lineY = FH - 46; // 판정선 높이 (rg-line 과 맞춤)
      const SPEED = 320; // px/초
      // 박자: 0.35~0.7초 간격, 가끔 빠른 연타(0.2초)
      const notes = [];
      let at = 1400;
      for (let i = 0; i < 26; i++) {
        notes.push({ lane: Math.floor(Math.random() * 4), time: at, el: null, done: false });
        at += Math.random() < 0.18 ? 200 : 350 + Math.floor(Math.random() * 3) * 175;
      }
      notes.forEach((n) => {
        n.el = document.createElement('div');
        n.el.className = 'rg-note';
        n.el.style.setProperty('--c', COLORS[n.lane]);
        n.el.style.transform = 'translateY(-40px)';
        lanes[n.lane].appendChild(n.el);
      });
      const end = notes[notes.length - 1].time + 900;
      let score = 0;
      let combo = 0;
      let maxCombo = 0;
      let perfect = 0;
      let good = 0;
      const t0 = performance.now();
      const now = () => performance.now() - t0;
      const judge = (text, cls) => {
        judgeEl.className = 'rg-judge ' + cls;
        judgeEl.innerHTML = `${text}${combo > 1 ? `<small>${combo} 콤보</small>` : ''}`;
        void judgeEl.offsetWidth;
        judgeEl.classList.add('show');
      };
      const setCombo = () => { comboEl.textContent = combo; comboEl.parentElement.classList.toggle('hot', combo >= 10); };
      const miss = () => { combo = 0; setCombo(); judge('놓침', 'miss'); };
      const flash = (lane) => {
        for (const el of [lanes[lane], btns[lane], rings[lane]]) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
      };
      const hit = (lane) => {
        flash(lane);
        const t = now();
        const n = notes.filter((x) => !x.done && x.lane === lane).sort((a, b) => Math.abs(a.time - t) - Math.abs(b.time - t))[0];
        if (!n || Math.abs(n.time - t) > 150) return; // 아무것도 없을 때 누른 건 그냥 넘어감
        const d = Math.abs(n.time - t);
        n.done = true;
        n.el.classList.add('pop');
        setTimeout(() => n.el.remove(), 180);
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        if (d <= 55) { perfect++; score += 100 + Math.min(combo, 30) * 5; judge('완벽!', 'perfect'); }
        else { good++; score += 50 + Math.min(combo, 30) * 2; judge('좋아', 'good'); }
        scoreEl.textContent = score;
        setCombo();
        sfx('tick');
      };
      stage.querySelector('.rg-btns').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-lane]');
        if (!b) return;
        e.preventDefault();
        hit(+b.dataset.lane);
      });
      const onKey = (e) => { if (e.repeat) return; const i = KEYS.indexOf(e.key.toLowerCase()); if (i >= 0) hit(i); };
      window.addEventListener('keydown', onKey);
      const stopLoop = loop(() => {
        const t = now();
        for (const n of notes) {
          if (n.done) continue;
          if (t - n.time > 150) { n.done = true; n.el.classList.add('gone'); setTimeout(() => n.el.remove(), 200); miss(); continue; }
          const y = lineY - ((n.time - t) / 1000) * SPEED;
          if (y > -40) n.el.style.transform = `translateY(${y - 9}px)`;
        }
        if (t > end) {
          setTimeout(() => done(score, `<b>${score}점</b> · 완벽 ${perfect} · 좋아 ${good} · 놓침 ${notes.length - perfect - good} · 최대 ${maxCombo}콤보`), 300);
          return false;
        }
      });
      cleanup = () => { stopLoop(); window.removeEventListener('keydown', onKey); };
    } else if (g.id === 'last') {
      // 용 체력이 들쭉날쭉 깎임. 900 이하에서 치면 처치(체력이 높을수록 과감 = 고득점), 900 넘을 때 치면 헛방, 0 되면 놓침
      const MAXHP = 3000;
      let hp = MAXHP;
      stage.innerHTML = `<div class="mini-boss"><div class="mini-dragon">🐉</div><div class="mini-hp"><i></i><b>${MAXHP}</b><span class="mini-hp-mark" style="left:${(900 / MAXHP) * 100}%"></span></div><button class="btn block mini-big" data-act="hit">⚡ 한 방!</button><p class="lol-hint">빨간 선(900) 왼쪽으로 내려왔을 때 치세요</p></div>`;
      const bar = stage.querySelector('.mini-hp i');
      const num = stage.querySelector('.mini-hp b');
      let to = 0;
      const tick = () => {
        hp -= 40 + Math.random() * (hp > 1500 ? 260 : 150);
        if (hp <= 0) {
          hp = 0;
          draw();
          sfx('lose');
          done(FAIL_HIGH, '<b>놓쳤어요!</b> 용이 먼저 쓰러졌어요 😱');
          return;
        }
        draw();
        to = setTimeout(tick, 110 + Math.random() * 260);
      };
      const draw = () => { bar.style.width = `${(hp / MAXHP) * 100}%`; bar.classList.toggle('low', hp <= 900); num.textContent = Math.round(hp); };
      to = setTimeout(tick, 600);
      stage.querySelector('[data-act="hit"]').addEventListener('click', () => {
        clearTimeout(to);
        const h = Math.round(hp);
        if (h > 900) { sfx('bad'); done(FAIL_HIGH, `<b>헛방!</b> 체력 ${h}에서 쳐서 못 잡았어요`); }
        else { sfx('ok'); buzz(60); done(h, `체력 <b>${h}</b>에서 한 방에 처치!`); }
      });
      cleanup = () => clearTimeout(to);
    } else if (g.id === 'gauge') {
      // 막대가 좌우로 오감(점점 빨라짐). 초록 칸 가운데와의 거리(100칸 기준) 평균
      let tries = 0;
      const diffs = [];
      stage.innerHTML = `<div class="mini-gauge-wrap"><p class="game-result" data-role="tries">1 / 3번째</p><div class="mini-gauge"><span class="zone"></span><i class="needle"></i></div><button class="btn block mini-big" data-act="stop">멈춰!</button></div>`;
      const zone = stage.querySelector('.zone');
      const needle = stage.querySelector('.needle');
      const triesEl = stage.querySelector('[data-role="tries"]');
      let center = 0;
      let p = 0;
      let dir = 1;
      let speed = 0;
      let paused = false;
      const setup = () => {
        center = 15 + Math.random() * 70;
        zone.style.left = `${center - 5}%`;
        speed = 70 + tries * 35; // 칸/초
        p = Math.random() < 0.5 ? 0 : 100;
        dir = p ? -1 : 1;
        paused = false;
      };
      setup();
      let last = performance.now();
      cleanup = loop((t) => {
        const dt = Math.min(0.1, (t - last) / 1000);
        last = t;
        if (paused) return;
        p += dir * speed * dt;
        if (p > 100) { p = 100; dir = -1; }
        if (p < 0) { p = 0; dir = 1; }
        needle.style.left = `${p}%`;
      });
      stage.querySelector('[data-act="stop"]').addEventListener('click', () => {
        if (paused) return;
        paused = true;
        const d = Math.abs(p - center);
        diffs.push(d);
        tries++;
        sfx(d <= 5 ? 'ok' : 'bad');
        if (tries >= 3) {
          const avg = diffs.reduce((a, b) => a + b, 0) / 3;
          setTimeout(() => done(avg, `가운데서 평균 <b>${avg.toFixed(1)}칸</b> (${diffs.map((x) => x.toFixed(1)).join(' · ')})`), 500);
          return;
        }
        triesEl.textContent = `가운데서 ${d.toFixed(1)}칸 → ${tries + 1} / 3번째`;
        setTimeout(setup, 700);
      });
    } else if (g.id === 'combo') {
      const KEYS = ['Q', 'W', 'E', 'R'];
      const seq = Array.from({ length: 8 }, () => KEYS[Math.floor(Math.random() * 4)]);
      let idx = 0;
      stage.innerHTML = `<div class="mini-combo"><div class="mini-seq">${seq.map((k, i) => `<span data-i="${i}">${k}</span>`).join('')}</div><div class="mini-keys">${KEYS.map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div><p class="lol-hint">키보드 Q·W·E·R 도 돼요</p></div>`;
      const spans = [...stage.querySelectorAll('.mini-seq span')];
      spans[0].classList.add('now');
      const sw = stopwatch(stage.querySelector('.mini-combo'));
      const press = (k) => {
        if (idx >= seq.length) return;
        if (k !== seq[idx]) {
          sw.add(1);
          sfx('bad');
          buzz(30);
          const s = spans[idx];
          s.classList.remove('miss');
          void s.offsetWidth;
          s.classList.add('miss');
          return;
        }
        spans[idx].className = 'ok';
        idx++;
        sfx('tick');
        if (idx >= seq.length) {
          sw.stop();
          const sec = sw.sec();
          done(sec, `<b>${sec.toFixed(2)}초</b>${sw.pen() ? ` (틀림 +${sw.pen()}초 포함)` : ''}`);
        } else spans[idx].classList.add('now');
      };
      stage.querySelector('.mini-keys').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-k]');
        if (!b) return;
        e.preventDefault();
        press(b.dataset.k);
      });
      const onKey = (e) => { const k = e.key.toUpperCase(); if (KEYS.includes(k)) press(k); };
      window.addEventListener('keydown', onKey);
      cleanup = () => { window.removeEventListener('keydown', onKey); sw.stop(); };
    } else if (g.id === 'stroop') {
      const COLORS = [['빨강', '#e5383b'], ['파랑', '#3a86ff'], ['초록', '#2bb24c'], ['노랑', '#f4b400']];
      let q = 0;
      let ink = 0;
      stage.innerHTML = `<div class="mini-stroop"><p class="sub" data-role="q">1 / 10</p><p class="mini-word"></p><div class="mini-colors">${COLORS.map(([n], i) => `<button data-c="${i}">${n}</button>`).join('')}</div></div>`;
      const word = stage.querySelector('.mini-word');
      const qEl = stage.querySelector('[data-role="q"]');
      const next = () => {
        const w = Math.floor(Math.random() * 4);
        do ink = Math.floor(Math.random() * 4); while (ink === w); // 글자와 색이 항상 다르게
        word.textContent = COLORS[w][0];
        word.style.color = COLORS[ink][1];
        qEl.textContent = `${q + 1} / 10`;
      };
      next();
      const sw = stopwatch(stage.querySelector('.mini-stroop'));
      cleanup = () => sw.stop();
      stage.querySelector('.mini-colors').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-c]');
        if (!b) return;
        e.preventDefault();
        if (+b.dataset.c !== ink) {
          sw.add(1);
          sfx('bad');
          buzz(30);
          word.classList.remove('miss');
          void word.offsetWidth;
          word.classList.add('miss');
        } else sfx('tick');
        q++;
        if (q >= 10) {
          sw.stop();
          const sec = sw.sec();
          done(sec, `<b>${sec.toFixed(2)}초</b>${sw.pen() ? ` (틀림 ${sw.pen()}개 +${sw.pen()}초 포함)` : ' · 다 맞혔어요!'}`);
        } else next();
      });
    } else if (g.id === 'simon') {
      const PADS = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b'];
      const seq = [];
      let input = 0;
      let showing = true;
      let best = 0;
      const timers = [];
      stage.innerHTML = `<div class="mini-simon-wrap"><p class="game-result" data-role="msg">잘 보세요…</p><div class="mini-simon">${PADS.map((c, i) => `<button data-p="${i}" style="--c:${c}"></button>`).join('')}</div></div>`;
      const pads = [...stage.querySelectorAll('.mini-simon button')];
      const msg = stage.querySelector('[data-role="msg"]');
      const light = (i, ms) => {
        pads[i].classList.add('lit');
        timers.push(setTimeout(() => pads[i].classList.remove('lit'), ms));
      };
      const show = () => {
        showing = true;
        input = 0;
        while (seq.length < Math.max(3, best + 1)) seq.push(Math.floor(Math.random() * 4));
        msg.textContent = `${seq.length}개 · 잘 보세요…`;
        const gap = Math.max(320, 620 - seq.length * 25);
        seq.forEach((p, k) => timers.push(setTimeout(() => { light(p, gap * 0.6); sfx('tick'); }, 500 + k * gap)));
        timers.push(setTimeout(() => { showing = false; msg.textContent = '이제 똑같이 눌러요!'; }, 500 + seq.length * gap));
      };
      show();
      stage.querySelector('.mini-simon').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-p]');
        if (!b || showing) return;
        e.preventDefault();
        const i = +b.dataset.p;
        light(i, 180);
        if (i !== seq[input]) {
          sfx('bad');
          buzz([60, 40, 60]);
          showing = true;
          setTimeout(() => done(best, best ? `<b>${best}개</b>까지 기억했어요!` : '<b>0개</b>… 다음엔 할 수 있어요!'), 400);
          return;
        }
        input++;
        if (input >= seq.length) {
          best = seq.length;
          sfx('ok');
          showing = true;
          if (best >= 15) { setTimeout(() => done(best, '<b>15개</b> 전부 기억! 천재예요 🧠'), 400); return; }
          msg.textContent = '좋아요! 하나 더…';
          timers.push(setTimeout(show, 700));
        }
      });
      cleanup = () => timers.forEach(clearTimeout);
    } else if (g.id === 'dodge') {
      // 우주선을 끌어서 별똥별을 피함. 시간이 갈수록 더 많이·빨리 떨어짐 (최대 30초)
      const { arena: box, info } = arena('우주선을 끌어서 피하세요');
      const tEl = document.createElement('div');
      tEl.className = 'mini-timer';
      tEl.innerHTML = '<b>0.0</b><small>초</small>';
      stage.prepend(tEl);
      const tNum = tEl.querySelector('b');
      const W = box.clientWidth;
      const H = box.clientHeight;
      const ship = document.createElement('div');
      ship.className = 'mini-ship';
      ship.textContent = '🚀';
      box.appendChild(ship);
      let sx = W / 2;
      let sy = H - 40;
      let dragging = false;
      const rocks = [];
      const move = (e) => {
        const r = box.getBoundingClientRect();
        sx = Math.max(18, Math.min(W - 18, e.clientX - r.left));
        sy = Math.max(18, Math.min(H - 18, e.clientY - r.top));
      };
      box.addEventListener('pointerdown', (e) => { e.preventDefault(); box.setPointerCapture?.(e.pointerId); dragging = true; move(e); });
      box.addEventListener('pointermove', (e) => { if (dragging) move(e); });
      box.addEventListener('pointerup', () => { dragging = false; });
      box.addEventListener('pointercancel', () => { dragging = false; });
      let last = performance.now();
      let el = 0; // 게임 시간 (화면이 느려져도 공정하게)
      let nextRock = 0.4;
      cleanup = loop((t) => {
        const dt = Math.min(0.1, (t - last) / 1000);
        last = t;
        el += dt;
        ship.style.transform = `translate(${sx - 18}px, ${sy - 18}px)`;
        if (el >= nextRock) {
          const r = document.createElement('div');
          r.className = 'mini-rock';
          r.textContent = '☄️';
          box.appendChild(r);
          rocks.push({ x: 14 + Math.random() * (W - 28), y: -20, v: 160 + el * 14 + Math.random() * 90, el: r });
          nextRock = el + Math.max(0.14, 0.65 - el * 0.022);
        }
        for (let i = rocks.length - 1; i >= 0; i--) {
          const k = rocks[i];
          k.y += k.v * dt;
          k.el.style.transform = `translate(${k.x - 14}px, ${k.y - 14}px)`;
          if (Math.hypot(k.x - sx, k.y - sy) < 26) {
            ship.textContent = '💥';
            sfx('lose');
            buzz([100, 50, 100]);
            setTimeout(() => done(el, `<b>${el.toFixed(1)}초</b> 버텼어요!`), 500);
            return false;
          }
          if (k.y > H + 30) { k.el.remove(); rocks.splice(i, 1); }
        }
        tNum.textContent = el.toFixed(1);
        if (el >= 30) {
          sfx('ok');
          setTimeout(() => done(30, '<b>30초</b> 끝까지 버텼어요! 🏆'), 300);
          return false;
        }
      });
    }
  }

  const isFail = (g, s) => (g.better === 'high' ? s === FAIL_HIGH : s >= FAIL_LOW);
  const fmt = (g, s) => (isFail(g, s) ? '실격' : g.fmt(s));
  const better = (g, a, b) => (g.better === 'high' ? a > b : a < b);

  function result() {
    const g = mg();
    const shareBtn = solo() && order.length === 1 && !isFail(g, scores[0]) ? '<button class="btn ghost block" data-act="share">📣 친구한테 자랑하기</button>' : '';
    const again = `<div class="game-actions"><button class="btn block" data-act="next">${solo() ? (order.length > 1 ? '다음 게임' : '한 번 더') : '다음 라운드'}</button>${shareBtn}<button class="btn ghost block" data-act="end">그만하기</button></div>`;
    if (solo()) {
      const s = scores[0];
      const key = 'mini-best-' + g.id;
      const prev = gameStore.get(key);
      const record = !isFail(g, s) && (prev == null || better(g, s, prev));
      if (record) gameStore.save(key, s);
      const hist = (gameStore.get('mini-hist-' + g.id) || []).concat(isFail(g, s) ? [] : [s]).slice(-10);
      if (!isFail(g, s)) gameStore.save('mini-hist-' + g.id, hist);
      stage.innerHTML = `
        <div class="liar-card">
          <p class="liar-who">${g.icon} ${esc(g.title)}</p>
          <p class="liar-word">${lastLabel || `<b>${fmt(g, s)}</b>`}</p>
          <p class="sub">${record ? (prev == null ? '첫 기록이에요!' : `🎉 최고 기록 경신! (전에는 ${fmt(g, prev)})`) : prev != null ? `내 최고 기록: ${fmt(g, prev)}` : ''}</p>
          ${histChart(g, hist)}
          ${vs == null || isFail(g, s) ? '' : `<p class="vs-result">${better(g, s, vs) ? `🏆 친구 기록(${g.fmt(vs)})을 이겼어요! 이번엔 내가 자랑할 차례` : s === vs ? `🤝 친구 기록(${g.fmt(vs)})이랑 똑같아요!` : `😅 친구 기록(${g.fmt(vs)})에 못 미쳤어요. 한 번 더!`}</p>`}
          ${again}
        </div>`;
      sfx(record ? 'ok' : 'tick');
    } else {
      const rank = names.map((nm, i) => ({ nm, i, s: scores[i] })).sort((a, b) => {
        const fa = isFail(g, a.s);
        const fb = isFail(g, b.s);
        if (fa !== fb) return fa ? 1 : -1;
        return g.better === 'high' ? b.s - a.s : a.s - b.s;
      });
      const last = rank[rank.length - 1];
      const pts = new Map(rank.map((r, i) => [r.i, isFail(g, r.s) ? 0 : names.length - i]));
      for (const [i, v] of pts) totals[i] += v;
      stage.innerHTML = `
        <div class="liar-card">
          <p class="liar-who">라운드 ${round + 1} 결과 · ${g.icon} ${esc(g.title)}</p>
          <ol class="mini-rank">${rank.map((r, i) => `<li class="${i === rank.length - 1 ? 'last' : ''}"><span>${['🥇', '🥈', '🥉'][i] || i + 1}</span><b>${esc(r.nm)}</b><em>${fmt(g, r.s)} · +${pts.get(r.i)}점</em></li>`).join('')}</ol>
          <p class="game-result">😈 꼴찌 <b>${esc(last.nm)}</b> 벌칙 당첨!</p>
          ${round > 0 ? totalBoard(`누적 점수 (${round + 1}판)`) : ''}
          ${again}
        </div>`;
      buzz([120, 60, 120]);
      sfx('lose');
    }
    stage.querySelector('[data-act="next"]').addEventListener('click', () => {
      round++;
      nextRound();
    });
    stage.querySelector('[data-act="end"]').addEventListener('click', () => {
      // 여럿이 2판 이상 했으면 종합 순위를 보여 주고 끝냄
      if (!solo() && round > 0) return finalBoard();
      stage.innerHTML = '';
      setupEl.hidden = false;
    });
    stage.querySelector('[data-act="share"]')?.addEventListener('click', () => {
      const s = scores[0];
      const extra = g.id === 'reaction' ? ` (${rxGrade(s)[2]})` : '';
      shareGame(g, `${g.icon} ${g.title} ${fmt(g, s)}${extra}! 내 기록 이겨 볼래? 링크 누르면 바로 도전`, s, stage.querySelector('.game-actions'));
    });
  }

  function standings() {
    return names.map((nm, i) => ({ nm, t: totals[i] })).sort((a, b) => b.t - a.t);
  }
  function totalBoard(title) {
    const st = standings();
    const top = st[0].t || 1;
    return `<div class="total-board"><p class="hist-title">${title}</p>${st
      .map((r) => `<div class="tb-row"><b>${esc(r.nm)}</b><span><i style="width:${Math.round((r.t / top) * 100)}%"></i></span><em>${r.t}</em></div>`)
      .join('')}</div>`;
  }
  function finalBoard() {
    stop();
    const st = standings();
    const podium = st.slice(0, 3);
    const lastOne = st[st.length - 1];
    stage.innerHTML = `
      <div class="liar-card">
        <p class="liar-who">🏆 종합 순위 · ${round + 1}판</p>
        <div class="podium">${[1, 0, 2]
          .filter((k) => podium[k])
          .map((k) => `<div class="pd pd-${k + 1}"><span>${['🥇', '🥈', '🥉'][k]}</span><b>${esc(podium[k].nm)}</b><em>${podium[k].t}점</em><i></i></div>`)
          .join('')}</div>
        ${totalBoard('전체 점수')}
        <p class="game-result">😈 종합 꼴찌 <b>${esc(lastOne.nm)}</b> 최종 벌칙!</p>
        <div class="game-actions"><button class="btn block" data-act="again">같은 사람들로 다시</button><button class="btn ghost block" data-act="close">처음으로</button></div>
      </div>`;
    sfx('win');
    stage.querySelector('[data-act="again"]').addEventListener('click', start);
    stage.querySelector('[data-act="close"]').addEventListener('click', () => {
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
  바다: ['🐳', '🐬', '🐙', '🦀', '🐠', '🦈', '🐢', '🦑', '🐚', '🦞', '🐡', '🪼', '🦭', '🐋'],
  스포츠: ['⚽', '🏀', '⚾', '🎾', '🏐', '🏈', '🎱', '🏓', '🏸', '🥊', '⛳', '🎳', '🏒', '🥏'],
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
  let streak = 0; // 틀리지 않고 연달아 맞힌 수
  let timers = [];
  let clock = 0;
  const clear = () => { timers.forEach(clearTimeout); timers = []; clearInterval(clock); };
  const best = () => gameStore.get('memory-best-' + pairs);
  const secNow = () => (t0 ? Math.floor((performance.now() - t0) / 1000) : 0);
  // 별점: 짝 수에 비해 적게 뒤집을수록 (힌트 쓰면 하나 깎임)
  const stars = () => Math.max(1, (moves <= pairs * 1.4 ? 3 : moves <= pairs * 2 ? 2 : 1) - (hints ? 1 : 0));
  const startBtn = boardStart('시작', () => `${pairs * 2}장 · ${pairs <= 6 ? 3 : pairs <= 8 ? 4 : 5}초 동안 외우기`, () => {
    if (found === pairs) setup();
    start();
  });

  function status(msg) {
    if (two) resultEl.innerHTML = `${msg ? msg + '<br>' : ''}<small class="sub">${turn === 0 ? '👉 ' : ''}1번 ${score[0]}점 · ${turn === 1 ? '👉 ' : ''}2번 ${score[1]}점</small>`;
    else {
      const b = best();
      resultEl.innerHTML = `${msg ? msg + '<br>' : ''}<small class="sub">⏱ ${secNow()}초 · ${moves}번 뒤집음 · 찾은 짝 ${found}/${pairs}${b ? ` · 최고 ${b.moves}번(${b.sec}초)` : ''}</small>`;
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
    streak = 0;
    score = [0, 0];
    const cols = pairs <= 8 ? 4 : pairs <= 10 ? 5 : 6;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--rows', Math.ceil((pairs * 2) / cols));
    grid.style.setProperty('--grid-top', `${(document.querySelector('.topbar')?.offsetHeight || 56) + resultEl.offsetHeight + 24}px`);
    grid.innerHTML = cards
      .map((f, i) => {
        const [c1, c2] = MEMORY_GRADS[f % MEMORY_GRADS.length];
        return `<button class="mem-card" data-i="${i}" aria-label="카드"><span class="mem-in"><span class="mem-back"><img src="/icons/logo.svg" alt=""></span><span class="mem-front" style="--c1:${c1};--c2:${c2}"><i>${faces[f]}</i></span></span></button>`;
      })
      .join('');
    grid.append(startBtn);
    startBtn.show();
    lock = true;
    status(two ? '2명이 번갈아 뒤집어요. 시작을 누르세요' : '시작을 누르면 카드를 잠깐 보여 줘요');
  }

  // 시작: 전체를 한 번 보여 줬다가 덮음 (카드가 많을수록 조금 더 길게)
  function start() {
    startBtn.hidden = true;
    // 안내 문구가 맨 위에 오게 내려서 카드가 한 화면에 다 보이게
    focusBoard(resultEl);
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
    if (!t0) {
      t0 = performance.now();
      // 혼자 할 때는 시계가 1초마다 올라감
      if (!two) clock = setInterval(() => found < pairs && status(resultEl.dataset.msg || ''), 1000);
    }
    c.classList.add('open');
    sfx('flip');
    open.push(c);
    if (open.length < 2) return;
    moves++;
    const [a, b] = open;
    if (cards[a.dataset.i] === cards[b.dataset.i]) {
      open = [];
      found++;
      buzz(30);
      sfx('match');
      if (two) score[turn]++;
      streak++;
      // 다 뒤집힌 뒤에 '찾음' 표시 (뒤집는 중 끊겨 보이지 않게)
      timers.push(setTimeout(() => { a.classList.add('done', 'pop'); b.classList.add('done', 'pop'); }, 380));
      if (found === pairs) {
        timers.push(setTimeout(() => sfx('win'), 350));
        timers.push(setTimeout(() => startBtn.show('한 판 더'), 1200));
        const sec = Math.round((performance.now() - t0) / 1000);
        if (two) {
          status(score[0] === score[1] ? '무승부!' : `🏆 ${score[0] > score[1] ? 1 : 2}번 승리!`);
        } else {
          clearInterval(clock);
          const b0 = best();
          const isBest = !hints && (!b0 || moves < b0.moves || (moves === b0.moves && sec < b0.sec));
          if (isBest) gameStore.save('memory-best-' + pairs, { moves, sec });
          resultEl.dataset.msg = '';
          status(`🎉 다 찾았어요! <span class="mem-stars">${'⭐'.repeat(stars())}${'☆'.repeat(3 - stars())}</span><br>${moves}번 만에 ${sec}초${isBest ? ' · 최고 기록!' : hints ? ' (힌트 사용)' : ''}`);
        }
      } else {
        const msg = two ? `짝 찾기! ${turn + 1}번 한 번 더` : streak >= 2 ? `🔥 ${streak}연속 성공!` : '짝을 찾았어요! 👏';
        resultEl.dataset.msg = msg;
        status(msg);
      }
    } else {
      lock = true;
      streak = 0;
      resultEl.dataset.msg = '';
      timers.push(setTimeout(() => { a.classList.add('miss'); b.classList.add('miss'); }, 380));
      timers.push(
        setTimeout(() => {
          a.classList.remove('open', 'miss');
          b.classList.remove('open', 'miss');
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
    if (lock || found === pairs || !startBtn.hidden) return;
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
  let LIMIT = (gameStore.get('apple') || {}).limit || 60;
  root.innerHTML = `
    <div class="opt-row" role="group" aria-label="제한 시간">
      ${[60, 120].map((t) => `<button class="chip" data-limit="${t}" aria-pressed="${t === LIMIT}">${t}초</button>`).join('')}
    </div>
    <div class="apple-bar"><span class="apple-score">0개</span><span class="apple-time"><i></i></span><span class="apple-best"></span></div>
    <div class="apple-board" style="--cols:${COLS};--rows:${ROWS}"><span class="apple-sum" hidden></span></div>
    <p class="game-result" role="status">손가락(마우스)으로 네모를 그려서 숫자 합이 <b>10</b>이 되게 묶으세요!</p>
    <div class="game-actions">
      <button class="btn block" data-act="hint" disabled>💡 힌트 (3)</button>
      <button class="btn ghost block" data-act="reset">다시 시작</button>
    </div>
    <div class="apple-hist"></div>`;
  const board = root.querySelector('.apple-board');
  const scoreEl = root.querySelector('.apple-score');
  const bar = root.querySelector('.apple-time i');
  const bestEl = root.querySelector('.apple-best');
  const resultEl = root.querySelector('.game-result');
  const hintBtn = root.querySelector('[data-act="hint"]');
  const histEl = root.querySelector('.apple-hist');
  let sumEl = board.querySelector('.apple-sum');
  let hints = 3;
  let combo = 0;
  let lastClear = 0;
  let warned = 0;
  // 시작 버튼은 판 한가운데에 띄움 (들어오자마자 보이게)
  const startBtn = boardStart('시작', () => `${LIMIT}초 · 합이 10이 되게 묶기`);
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
    board.append(startBtn);
    sumEl = document.createElement('span');
    sumEl.className = 'apple-sum';
    sumEl.hidden = true;
    board.append(sumEl);
    hints = 3;
    combo = 0;
    hintBtn.textContent = '💡 힌트 (3)';
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
    // 지금 묶은 합을 네모 옆에 크게 보여 줌
    const cellW = board.clientWidth / COLS;
    const cellH = board.clientHeight / ROWS;
    sumEl.hidden = !sum;
    sumEl.textContent = sum > 10 ? `${sum} 넘침` : sum === 10 ? '10 ✓' : `${sum}`;
    sumEl.className = 'apple-sum' + (sum === 10 ? ' ok' : sum > 10 ? ' over' : '');
    sumEl.style.left = `${(Math.max(c1, c2) + 1) * cellW}px`;
    sumEl.style.top = `${Math.min(r1, r2) * cellH}px`;
    return sum;
  }
  // 아직 묶을 수 있는 네모 하나 찾기 (없으면 null) — 힌트와 '더 이상 없음' 판단에 씀
  function findMove() {
    const P = Array.from({ length: ROWS + 1 }, () => new Array(COLS + 1).fill(0));
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) P[r + 1][c + 1] = nums[r * COLS + c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    const found = [];
    for (let r1 = 0; r1 < ROWS; r1++)
      for (let r2 = r1; r2 < ROWS; r2++)
        for (let c1 = 0; c1 < COLS; c1++)
          for (let c2 = c1; c2 < COLS; c2++) {
            const s = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
            if (s > 10) break;
            if (s === 10) {
              found.push([c1, r1, c2, r2]);
              if (found.length > 40) return found[Math.floor(Math.random() * found.length)];
            }
          }
    return found.length ? found[Math.floor(Math.random() * found.length)] : null;
  }
  // 사과가 사라진 자리에 '+4' 같은 글자가 떠오름
  function floatText(text, c, r, cls = '') {
    const el = document.createElement('span');
    el.className = 'apple-float ' + cls;
    el.textContent = text;
    el.style.left = `${((c + 0.5) / COLS) * 100}%`;
    el.style.top = `${((r + 0.5) / ROWS) * 100}%`;
    board.append(el);
    setTimeout(() => el.remove(), 900);
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
      sfx('pop');
      // 3초 안에 연달아 지우면 콤보
      const now = performance.now();
      combo = now - lastClear < 3000 ? combo + 1 : 1;
      lastClear = now;
      const [c1, r1] = sel.a;
      const [c2, r2] = sel.b;
      floatText(`+${gone.length}`, (c1 + c2) / 2, (r1 + r2) / 2);
      if (combo >= 2) floatText(`${combo} 콤보!`, (c1 + c2) / 2, Math.max(0, Math.min(r1, r2) - 1), 'combo');
      board.querySelectorAll('.apple.hint').forEach((a) => a.classList.remove('hint'));
      if (!findMove()) {
        sel = null;
        paintSel();
        return end(true);
      }
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
    // 마지막 5초는 째깍 소리
    if (left < 5 && Math.ceil(left) !== warned) {
      warned = Math.ceil(left);
      sfx('tick');
    }
    if (left <= 0) return end();
    raf = requestAnimationFrame(tick);
  }
  function start() {
    make();
    playing = true;
    t0 = performance.now();
    warned = 0;
    hintBtn.disabled = false;
    startBtn.hidden = true;
    // 시간 막대가 맨 위에 오게 내려서 판 전체가 한 화면에 보이게
    fit();
    focusBoard(root.querySelector('.apple-bar'));
    resultEl.innerHTML = `합이 <b>10</b>이 되게 네모로 묶으세요! ${LIMIT}초!`;
    raf = requestAnimationFrame(tick);
  }
  function end(stuck = false) {
    cancelAnimationFrame(raf);
    playing = false;
    sel = null;
    paintSel();
    hintBtn.disabled = true;
    startBtn.show('한 판 더');
    const b = gameStore.get('apple-best-' + LIMIT) || 0;
    if (score > b) gameStore.save('apple-best-' + LIMIT, score);
    const hist = (gameStore.get('apple-hist-' + LIMIT) || []).concat([score]).slice(-10);
    gameStore.save('apple-hist-' + LIMIT, hist);
    histEl.innerHTML = histChart({ better: 'high', fmt: (v) => `${v}개` }, hist);
    resultEl.innerHTML = `${stuck ? '🧺 더 묶을 수 있는 사과가 없어요!' : '⏰ 끝!'} 사과 <b>${score}개</b>${score > b ? ' · 최고 기록! 🎉' : ''}`;
    showBest();
    buzz([100, 50, 100]);
    sfx('win');
  }
  startBtn.addEventListener('click', start);
  hintBtn.addEventListener('click', () => {
    if (!playing || hints <= 0) return;
    const m = findMove();
    if (!m) return end(true);
    hints--;
    hintBtn.textContent = `💡 힌트 (${hints})`;
    hintBtn.disabled = hints <= 0;
    const [c1, r1, c2, r2] = m;
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) if (nums[r * COLS + c]) board.children[r * COLS + c].classList.add('hint');
  });
  root.querySelectorAll('[data-limit]').forEach((b) =>
    b.addEventListener('click', () => {
      if (playing) return;
      LIMIT = +b.dataset.limit;
      gameStore.save('apple', { limit: LIMIT });
      root.querySelectorAll('[data-limit]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      showBest();
      if (!startBtn.hidden) startBtn.show();
    })
  );
  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    cancelAnimationFrame(raf);
    playing = false;
    hintBtn.disabled = true;
    make();
    startBtn.show('시작');
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
  // 레티나 화면에서도 선명하게 (그리는 좌표는 360×420 그대로)
  const DPR = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = 360 * DPR;
  canvas.height = 420 * DPR;
  const resultEl = root.querySelector('.game-result');
  const startBtn = root.querySelector('[data-act="start"]');
  let st = null;
  let raf = 0;
  const press = { l: false, r: false };
  const best0 = () => gameStore.get('balance-best') || 0;

  const reset = () => {
    st = { a: 0, w: 0, dist: 0, t: 0, alive: false, gust: 0, step: 0, speed: 1.2, mile: 0, banner: 0, bannerText: '', fall: 0, drops: [] };
    draw();
  };

  // 색 섞기 (#rrggbb 두 개, 0~1)
  const mix = (a, b, k) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
  };
  // 걸을수록 낮 → 노을 → 밤
  function skyColors(d) {
    const day = ['#bfe3ff', '#eaf6ff', '#8cc59a', '#5aa9e6'];
    const dusk = ['#ff9f7a', '#ffe0b3', '#b0835a', '#e08a6a'];
    const night = ['#141a3d', '#3b3f74', '#2b3350', '#24305e'];
    const k1 = Math.min(1, d / 80);
    const k2 = Math.max(0, Math.min(1, (d - 80) / 80));
    return day.map((c, i) => (k2 > 0 ? mix(dusk[i], night[i], k2) : mix(c, dusk[i], k1)));
  }

  function draw() {
    const W = 360;
    const H = 420;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const [skyTop, skyLow, hill, water] = skyColors(st.dist);
    const night = Math.max(0, Math.min(1, (st.dist - 90) / 60));
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(1, skyLow);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    const off = (st.dist * 40) % W;
    // 밤하늘 별
    if (night > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.8 * night})`;
      for (let i = 0; i < 40; i++) ctx.fillRect((i * 97 + 13) % W, (i * 53) % 210, 1.6, 1.6);
    }
    // 해·달
    ctx.beginPath();
    ctx.arc(290, 70 + Math.min(1, st.dist / 160) * 40, 22, 0, Math.PI * 2);
    ctx.fillStyle = night > 0.5 ? '#f4f1d0' : mix('#ffe066', '#ff7b54', Math.min(1, st.dist / 90));
    ctx.fill();
    // 먼 산 (천천히 흘러감)
    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.moveTo(0, H - 90);
    for (let x = 0; x <= W + 20; x += 20) {
      const wx = x + st.dist * 6;
      ctx.lineTo(x, H - 150 - Math.sin(wx / 60) * 22 - Math.sin(wx / 23) * 8);
    }
    ctx.lineTo(W, H - 90);
    ctx.fill();
    // 흘러가는 구름·물
    ctx.fillStyle = `rgba(255,255,255,${0.9 - night * 0.6})`;
    [[60, 70], [250, 110], [160, 40]].forEach(([x, y]) => {
      const cx = ((x - off * 0.3) % (W + 80) + W + 80) % (W + 80) - 40;
      ctx.beginPath();
      ctx.ellipse(cx, y, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = water;
    ctx.fillRect(0, H - 90, W, 90);
    // 물결
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H - 70 + r * 24 + Math.sin((x + off * (1 + r * 0.4)) / 18) * 3);
      ctx.stroke();
    }
    // 외나무다리
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, H - 104, W, 16);
    ctx.fillStyle = '#6b4220';
    for (let x = -off; x < W; x += 40) ctx.fillRect(x, H - 104, 3, 16);
    // 25m마다 깃발, 내 최고 기록 자리엔 금색 깃발
    const flag = (m, color, label) => {
      const x = W / 2 + (m - st.dist) * 40;
      if (x < -30 || x > W + 30) return;
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(x - 1.5, H - 150, 3, 46);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + 1.5, H - 150);
      ctx.lineTo(x + 30, H - 142);
      ctx.lineTo(x + 1.5, H - 134);
      ctx.fill();
      ctx.font = '800 11px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = night > 0.5 ? '#fff' : '#1d1b26';
      ctx.fillText(label, x + 2, H - 156);
    };
    for (let m = 25; m < st.dist + 12; m += 25) flag(m, '#ff4f5e', `${m}m`);
    const bst = best0();
    if (bst > 0) flag(bst, '#f5b301', `🏆 ${bst}m`);
    // 황새 (발을 축으로 기울어짐). 넘어지면 물로 떨어짐
    const fx = W / 2;
    const fy = H - 104 + (st.fall > 0 ? Math.min(1, st.fall / 0.6) ** 2 * 80 : 0);
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
    // 첨벙 물방울
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (const d of st.drops) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // 바람 경고: 바람 부는 쪽 화살표
    if (st.alive && Math.abs(st.gust) > 0.25) {
      ctx.globalAlpha = Math.min(1, Math.abs(st.gust) * 1.2);
      ctx.font = '900 22px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = night > 0.5 ? '#fff' : '#2d3142';
      ctx.fillText(st.gust > 0 ? '💨 ➡︎➡︎' : '⬅︎⬅︎ 💨', W / 2, 118);
      ctx.globalAlpha = 1;
    }
    // 넘어지기 직전: 화면 가장자리가 붉어짐
    const danger = Math.max(0, (Math.abs(st.a) - 0.7) / 0.45);
    if (st.alive && danger > 0) {
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, 'rgba(224,49,43,0)');
      vg.addColorStop(1, `rgba(224,49,43,${0.45 * danger})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }
    // 이정표 통과 알림
    if (st.banner > 0) {
      ctx.globalAlpha = Math.min(1, st.banner * 2);
      ctx.font = '900 24px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd166';
      ctx.strokeStyle = 'rgba(29,27,38,.8)';
      ctx.lineWidth = 5;
      ctx.strokeText(st.bannerText, W / 2, 160);
      ctx.fillText(st.bannerText, W / 2, 160);
      ctx.globalAlpha = 1;
    }
    // 기울기 막대 + 거리
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(W / 2 - 100, 18, 200, 10);
    const lim = 1.15;
    ctx.fillStyle = Math.abs(st.a) > lim * 0.7 ? '#e0312b' : '#2bb24c';
    ctx.fillRect(W / 2 - 3 + (st.a / lim) * 100, 14, 6, 18);
    ctx.fillStyle = night > 0.5 ? '#fff' : '#1d1b26';
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
      st.speed = Math.min(7, 1.2 + st.t * 0.35);
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
      st.banner = Math.max(0, st.banner - dt);
      const mile = Math.floor(st.dist / 25);
      if (mile > st.mile) {
        st.mile = mile;
        const b = best0();
        st.bannerText = b && st.dist > b && b > (mile - 1) * 25 ? '🏆 최고 기록 돌파!' : `✨ ${mile * 25}m 돌파!`;
        st.banner = 1.4;
        sfx('ok');
      }
      draw();
      if (Math.abs(st.a) > 1.15) return fall();
      loop(now);
    });
  }
  function start() {
    cancelAnimationFrame(raf);
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
    sfx('lose');
    // 물에 빠지는 장면 (0.9초) 뒤에 결과
    const side = Math.sign(st.a) || 1;
    let prev = performance.now();
    const anim = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      st.fall += dt;
      st.a += side * dt * 1.6;
      if (st.fall > 0.55 && !st.drops.length) {
        for (let i = 0; i < 18; i++) st.drops.push({ x: 180 + side * 40 + (Math.random() - 0.5) * 40, y: 330, vx: (Math.random() - 0.5) * 160, vy: -120 - Math.random() * 160, r: 2 + Math.random() * 3 });
      }
      for (const d of st.drops) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 520 * dt;
      }
      draw();
      if (st.fall < 1.1) raf = requestAnimationFrame(anim);
    };
    raf = requestAnimationFrame(anim);
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
