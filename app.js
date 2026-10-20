// 맞혀봐 — 화면 3개(목록 · 풀기 · 결과)를 그리는 앱 본체.
'use strict';

const app = document.getElementById('app');
const CATEGORIES = ['전체', ...new Set(QUIZZES.map((q) => q.category))];

/* ───────── 공통 도구 ───────── */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// '일석이조' → 'ㅇㅅㅇㅈ'. 한글이 아닌 글자는 그대로 둔다.
function chosung(text) {
  return [...String(text)]
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00;
      return code >= 0 && code <= 11171 ? CHO[Math.floor(code / 588)] : ch;
    })
    .join('');
}

// 비교용으로 다듬기: 띄어쓰기·문장부호 제거, 영문 소문자.
const normalize = (s) =>
  String(s ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎ]/g, '');

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

// 채점 결과: 'exact'(정답) · 'close'(오타 인정: 5글자 이상은 1글자, 12글자 이상은 2글자) · null(오답)
function judge(input, q) {
  const mine = normalize(input);
  if (!mine) return null;
  const answers = [q.answer, ...(q.alias || [])].map(normalize);
  if (answers.includes(mine)) return 'exact';
  if (q.exact) return null;
  if (answers.some((a) => a.length >= 5 && editDistance(a, mine) <= (a.length >= 12 ? 2 : 1))) return 'close';
  // 4글자 이상 한글 답은 한 글자를 빼거나 더한 것도 인정 (예: 동명성왕 → 동명왕). 글자를 바꾼 건 인정 안 함
  if (answers.some((a) => a.length >= 4 && /[가-힣]/.test(a) && Math.abs(a.length - mine.length) === 1 && editDistance(a, mine) === 1)) return 'close';
  return null;
}

function hintOf(q) {
  if (q.hint) return q.hint;
  if (q.by) return `${q.by}의 작품 · 초성: ${chosung(q.answer)}`;
  if (q.chosung) return `첫 글자는 '${[...q.answer][0]}'`;
  if (!/[가-힣]/.test(q.answer)) return `'${q.answer[0]}'(으)로 시작하는 ${q.answer.length}글자`;
  return `초성: ${chosung(q.answer)}`;
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 기록 저장(이 기기에만). 사생활 보호 모드 등에서 막혀도 앱은 그대로 돌아가게.
const store = {
  get() {
    try { return JSON.parse(localStorage.getItem('quiz-stats') || '{}'); } catch { return {}; }
  },
  save(stats) {
    try { localStorage.setItem('quiz-stats', JSON.stringify(stats)); } catch { /* 무시 */ }
  },
};

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

const quizUrl = (id) => `${location.origin}/q/${id}/`;

/* ───────── 참여 수 (익명 집계) ───────── */
// 퀴즈를 끝까지 풀면 퀴즈 id만 보낸다. 같은 기기에서 같은 퀴즈는 하루 한 번만 센다.

const countOn = () => typeof CONFIG !== 'undefined' && !!CONFIG.COUNT_API;

const counts = {
  get() {
    try { return JSON.parse(localStorage.getItem('quiz-counts') || '{}').data || {}; } catch { return {}; }
  },
  save(data) {
    try { localStorage.setItem('quiz-counts', JSON.stringify({ at: Date.now(), data })); } catch { /* 무시 */ }
  },
  async refresh() {
    if (!countOn()) return null;
    try {
      const res = await fetch(`${CONFIG.COUNT_API}?action=counts`);
      const json = await res.json();
      if (json.ok) {
        this.save(json.counts);
        return json.counts;
      }
    } catch { /* 네트워크 실패 시 지난 값 사용 */ }
    return null;
  },
};

function reportPlay(quizId) {
  if (!countOn()) return;
  const today = new Date().toISOString().slice(0, 10);
  let done = {};
  try { done = JSON.parse(localStorage.getItem('quiz-counted') || '{}'); } catch { /* 무시 */ }
  if (done[quizId] === today) return;
  done[quizId] = today;
  try { localStorage.setItem('quiz-counted', JSON.stringify(done)); } catch { /* 무시 */ }
  fetch(`${CONFIG.COUNT_API}?action=play&quiz=${encodeURIComponent(quizId)}`, { method: 'POST', body: '', keepalive: true }).catch(() => {});
  // 화면에도 바로 반영
  const c = counts.get();
  c[quizId] = (c[quizId] || 0) + 1;
  counts.save(c);
}

const fmtCount = (n) => (n >= 10000 ? `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}만` : n.toLocaleString('ko-KR'));

/* ───────── 광고 영역 ───────── */
// 애드센스 승인 전에는 자리 표시만, 승인 후 config.js에 코드를 넣으면 실제 광고.

const adsOn = () => typeof CONFIG !== 'undefined' && CONFIG.ADS && !!CONFIG.ADS.client;

function adHtml(name) {
  const ads = typeof CONFIG !== 'undefined' ? CONFIG.ADS : null;
  if (!ads) return '';
  if (adsOn() && ads.slots[name]) {
    return `<div class="ad-slot"><span class="ad-label">광고</span><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ads.client)}" data-ad-slot="${esc(ads.slots[name])}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
  }
  return ads.placeholder ? `<div class="ad-slot ad-placeholder"><span>광고 영역</span></div>` : '';
}

function fillAds() {
  if (!adsOn()) return;
  if (!document.getElementById('adsense-js')) {
    const sc = document.createElement('script');
    sc.id = 'adsense-js';
    sc.async = true;
    sc.crossOrigin = 'anonymous';
    sc.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CONFIG.ADS.client)}`;
    document.head.appendChild(sc);
  }
  document.querySelectorAll('ins.adsbygoogle:not([data-filled])').forEach((el) => {
    el.dataset.filled = '1';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* 무시 */ }
  });
}

/* ───────── 목록 화면 ───────── */

const home = { category: '전체', query: '' };

// 카테고리별 표지 바탕색 (사진 표지도 그림 표지와 같은 틀로 보이게)
const CAT_COLORS = {
  지리: ['#dfe9ff', '#b9ccff'],
  음악: ['#ffe6f7', '#d9b8ff'],
  언어: ['#efe7ff', '#c8b4ff'],
  재미: ['#fff6cf', '#ffd68f'],
  음식: ['#ffe3df', '#ffb4a2'],
  수학: ['#e8ebf3', '#c2cde2'],
  과학: ['#e6e3ff', '#b9b0f5'],
  역사: ['#f7ead9', '#e2c49f'],
  예술: ['#fff1d6', '#ffc98f'],
  동물: ['#d9fbea', '#9eefcf'],
  연예: ['#ffe2f1', '#ffb0d6'],
  탈것: ['#d8edff', '#9ccfff'],
  자연: ['#e3f7ec', '#a8e6c5'],
  '게임·만화': ['#e0f2ff', '#9fd4ff'],
};
const catBg = (cat) => {
  const [a, b] = CAT_COLORS[cat] || ['#ece9f7', '#cfc8ec'];
  return `background:linear-gradient(160deg,${a},${b})`;
};

function coverHtml(quiz) {
  if (quiz.cover.flags) {
    return `<div class="flag-grid${quiz.cover.vs ? ' vs' : ''}" style="${catBg(quiz.category)}">${quiz.cover.flags
      .map((c) => `<img src="${esc(FLAG(c))}" alt="" loading="lazy">`)
      .join(quiz.cover.vs ? '<span class="vs-mark">?</span>' : '')}</div>`;
  }
  const src = quiz.cover.image || '';
  if (src.startsWith('data:')) return `<img class="full" src="${esc(src)}" alt="" loading="lazy">`;
  return `<div class="framed" style="${catBg(quiz.category)}"><img class="inset" src="${esc(src)}" alt="" loading="lazy"></div>`;
}

function cardHtml(quiz, { rank, stats, plays } = {}) {
  const s = stats?.[quiz.id];
  const n = quiz.generate ? quiz.perPlay : Math.min(quiz.perPlay, quiz.questions.length);
  const pool = quiz.generate ? '매번 새 문제' : `전체 ${quiz.questions.length}문제`;
  const played = plays?.[quiz.id];
  return `
    <a class="card" href="/q/${esc(quiz.id)}/">
      <div class="cover">${coverHtml(quiz)}<span class="badge">${esc(quiz.category)}</span>${
        quiz.isNew ? '<span class="new-tag">NEW</span>' : ''
      }${rank ? `<span class="rank-no">${rank}</span>` : ''}</div>
      <div class="card-body">
        <h2 class="card-title">${esc(quiz.title)}</h2>
        <div class="card-meta">${pool}${played ? ` · 참여 ${fmtCount(played)}` : ` · 한 판 ${n}문제`}${
          s?.bestTime ? ` · 만점 <b>${formatTime(s.bestTime)}</b>` : s ? ` · 최고 <b>${s.best}/${s.total}</b>` : ''
        }</div>
      </div>
    </a>`;
}

// 날짜마다 바뀌는 '오늘의 퀴즈' (같은 날엔 누구에게나 같은 퀴즈)
function todaysQuiz() {
  const day = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pool = QUIZZES.filter((q) => !q.noAds);
  return pool[h % pool.length];
}

function popularQuizzes(plays, n) {
  const order = new Map(QUIZZES.map((quiz, i) => [quiz.id, i]));
  return [...QUIZZES].sort((a, b) => (plays[b.id] || 0) - (plays[a.id] || 0) || order.get(a.id) - order.get(b.id)).slice(0, n);
}

const SITE_FOOT = `
    <footer class="site-foot">
      <a href="/about.html">소개</a> · <a href="/privacy.html">개인정보 처리방침</a> · <a href="/credits.html">사진 출처</a>
    </footer>`;

// 홈: 오늘의 퀴즈 · 인기 퀴즈 · 새로 나온 퀴즈 · 인기 게임 · 새로 나온 게임
function renderHome() {
  document.title = '맞혀봐';
  app.innerHTML = `
    <section class="hero">
      <h1>보고, 떠올리고,<br>직접 써서 맞혀 보세요</h1>
      <p>객관식 없이 정답을 직접 입력하는 퀴즈 ${QUIZZES.length}가지 · 뽑기 게임 ${GAMES.length}가지</p>
    </section>
    <section class="home-sec" data-sec="today"></section>
    <section class="home-sec">
      <div class="sec-head"><h2 class="sec-title">🔥 인기 퀴즈</h2><a class="sec-more" href="/quizzes/">전체 보기 ›</a></div>
      <div class="row" data-row="popular"></div>
    </section>
    <section class="home-sec">
      <div class="sec-head"><h2 class="sec-title">✨ 새로 나온 퀴즈</h2><a class="sec-more" href="/quizzes/">전체 보기 ›</a></div>
      <div class="row" data-row="new"></div>
    </section>
    <section class="home-sec">
      <div class="sec-head"><h2 class="sec-title">🎲 인기 게임</h2><a class="sec-more" href="/games/">전체 보기 ›</a></div>
      <div class="row" data-row="popular-games"></div>
    </section>
    <section class="home-sec">
      <div class="sec-head"><h2 class="sec-title">🆕 새로 나온 게임</h2><a class="sec-more" href="/games/">전체 보기 ›</a></div>
      <div class="row" data-row="new-games"></div>
    </section>
    ${adHtml('homeBottom')}
    ${SITE_FOOT}
  `;
  renderSections();
  fillAds();
  counts.refresh().then((fresh) => {
    if (fresh && app.querySelector('[data-row="popular"]') && !play) renderSections();
  });
}

// 퀴즈 탭: 전체 퀴즈 (검색 + 분류)
function renderQuizList() {
  document.title = '퀴즈 · 맞혀봐';
  app.innerHTML = `
    <section class="hero">
      <h1>퀴즈 ${QUIZZES.length}가지</h1>
      <p>사진·초성·설명·멜로디를 보고 정답을 직접 써 보세요</p>
    </section>
    <section class="home-sec" id="all">
      <input class="search" type="search" placeholder="퀴즈 찾기" value="${esc(home.query)}" aria-label="퀴즈 찾기">
      <div class="chips" role="group" aria-label="카테고리">
        ${CATEGORIES.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === home.category}">${esc(c)}</button>`).join('')}
      </div>
      <div class="grid"></div>
    </section>
    ${adHtml('homeBottom')}
    ${SITE_FOOT}
  `;
  app.querySelector('.search').addEventListener('input', (e) => {
    home.query = e.target.value;
    renderGrid();
  });
  app.querySelectorAll('.chip').forEach((btn) =>
    btn.addEventListener('click', () => {
      home.category = btn.dataset.cat;
      app.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', b === btn));
      renderGrid();
    })
  );
  renderGrid();
  fillAds();
  counts.refresh().then((fresh) => {
    if (fresh && app.querySelector('.grid') && !play) renderGrid();
  });
}

function renderSections() {
  const stats = store.get();
  const plays = counts.get();
  const t = todaysQuiz();
  const today = app.querySelector('[data-sec="today"]');
  if (today && t) {
    today.innerHTML = `
      <a class="today-card" href="/q/${esc(t.id)}/">
        <div class="cover">${coverHtml(t)}</div>
        <div class="today-body">
          <span class="today-tag">오늘의 퀴즈</span>
          <h2>${esc(t.title)}</h2>
          <p>${esc(t.desc)}</p>
          <span class="btn today-btn">바로 풀기</span>
        </div>
      </a>`;
  }
  const pop = app.querySelector('[data-row="popular"]');
  if (pop) pop.innerHTML = popularQuizzes(plays, 8).map((q, i) => cardHtml(q, { rank: i + 1, stats, plays })).join('');
  const fresh = app.querySelector('[data-row="new"]');
  if (fresh) {
    const list = (typeof NEW_QUIZZES !== 'undefined' ? NEW_QUIZZES : []).map((id) => QUIZZES.find((q) => q.id === id)).filter(Boolean);
    fresh.innerHTML = list.slice(0, 8).map((q) => cardHtml(q, { stats, plays })).join('');
  }
  const popG = app.querySelector('[data-row="popular-games"]');
  if (popG) popG.innerHTML = popularGames(plays, 8).map((g, i) => gameCardHtml(g, { rank: i + 1, plays })).join('');
  const newG = app.querySelector('[data-row="new-games"]');
  if (newG) newG.innerHTML = NEW_GAMES.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean).map((g) => gameCardHtml(g, { plays })).join('');
}

function renderGrid() {
  const stats = store.get();
  const q = normalize(home.query);
  const plays = counts.get();
  // 전체 목록은 분류 순서대로 (같은 분류끼리 모아서)
  const catOrder = new Map(CATEGORIES.map((c, i) => [c, i]));
  const order = new Map(QUIZZES.map((quiz, i) => [quiz.id, i]));
  const list = QUIZZES.filter(
    (quiz) =>
      (home.category === '전체' || quiz.category === home.category) &&
      (!q || normalize(quiz.title + quiz.desc + quiz.category).includes(q))
  ).sort((a, b) => catOrder.get(a.category) - catOrder.get(b.category) || order.get(a.id) - order.get(b.id));
  const grid = app.querySelector('.grid');
  if (!list.length) {
    grid.innerHTML = '';
    if (!app.querySelector('.empty')) grid.insertAdjacentHTML('afterend', '<p class="empty">찾는 퀴즈가 없어요</p>');
    return;
  }
  app.querySelector('.empty')?.remove();
  grid.innerHTML = list
    .map((quiz, idx) => cardHtml(quiz, { stats, plays }) + (idx === 5 && list.length > 6 ? `<div class="ad-row">${adHtml('homeFeed')}</div>` : ''))
    .join('');
  fillAds();
}

/* ───────── 문제 고르기: 안 본 문제 먼저 ───────── */
// 이 기기에서 이미 나온 문제(정답 기준)를 기억해 두고, 안 본 문제부터 낸다.
// 전부 한 번씩 보면 기억을 비우고 처음부터 다시 섞는다.

const qKey = (q) => normalize(q.answer) + '|' + normalize(q.text || q.big || '');

const seen = {
  all() {
    try { return JSON.parse(localStorage.getItem('quiz-seen') || '{}'); } catch { return {}; }
  },
  get(id) {
    return new Set(this.all()[id] || []);
  },
  set(id, set) {
    const all = this.all();
    all[id] = [...set];
    try { localStorage.setItem('quiz-seen', JSON.stringify(all)); } catch { /* 무시 */ }
  },
  add(id, q) {
    const s = this.get(id);
    s.add(qKey(q));
    this.set(id, s);
  },
};

function pickFresh(quiz) {
  const n = Math.min(quiz.perPlay, quiz.questions.length);
  let used = seen.get(quiz.id);
  let fresh = quiz.questions.filter((q) => !used.has(qKey(q)));
  if (fresh.length === 0) {
    // 한 바퀴 다 돌았으면 처음부터
    used = new Set();
    seen.set(quiz.id, used);
    fresh = quiz.questions;
  }
  const picked = shuffle(fresh).slice(0, n);
  if (picked.length < n) {
    // 안 본 문제가 모자라면 본 문제 중에서 채움
    const rest = shuffle(quiz.questions.filter((q) => !picked.includes(q)));
    picked.push(...rest.slice(0, n - picked.length));
  }
  return picked;
}

/* ───────── 풀기 화면 ───────── */

let play = null;
let autoNextTimer;

function startQuiz(id) {
  const quiz = QUIZZES.find((q) => q.id === id);
  if (!quiz) {
    nav('/');
    return;
  }
  const picked = quiz.generate ? quiz.generate(quiz.perPlay) : pickFresh(quiz);
  play = {
    quiz,
    items: picked.map((q) => ({ q: quiz.exact ? { ...q, exact: true } : q, input: '', result: null, hinted: false, passed: false })),
    idx: 0,
    phase: 'ask',
    feedbackAt: 0,
    startedAt: Date.now(),
  };
  document.title = `${quiz.title} · 맞혀봐`;
  renderQuestion();
}

// 멜로디 문제: 'C4 D4:0.5 R:1' 처럼 음이름+옥타브(:박자, 기본 1박), R은 쉼표. 사이트에서 직접 연주 (음원 파일 없음)
const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(n) {
  const m = n.match(/^([A-G])([#b]?)(\d)$/);
  if (!m) return 0;
  const semi = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (m[3] - 4) * 12 - 9;
  return 440 * Math.pow(2, semi / 12);
}
let melodyStop = null;
function stopMelody() {
  if (melodyStop) melodyStop();
  melodyStop = null;
}
function playMelody(spec, bpm, btn) {
  stopMelody();
  gameAudio.unlock();
  const c = gameAudio.ctx;
  if (!c) return;
  const beat = 60 / (bpm || 110);
  let t = c.currentTime + 0.08;
  const start = t;
  const oscs = [];
  for (const tok of spec.trim().split(/\s+/)) {
    const [n, d = '1'] = tok.split(':');
    const dur = parseFloat(d) * beat;
    const f = n === 'R' ? 0 : noteFreq(n);
    if (f) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.02);
      g.gain.setValueAtTime(0.3, t + dur * 0.75);
      g.gain.linearRampToValueAtTime(0, t + dur * 0.97);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur);
      oscs.push(o);
    }
    t += dur;
  }
  btn?.classList.add('playing');
  const timer = setTimeout(stopMelody, (t - start) * 1000 + 150);
  melodyStop = () => {
    clearTimeout(timer);
    oscs.forEach((o) => { try { o.stop(); } catch { /* 이미 끝남 */ } });
    btn?.classList.remove('playing');
  };
}

function mediaHtml(q) {
  if (q.melody) return `<div class="qmedia melody"><button class="melody-btn" data-act="melody" type="button"><span class="melody-ico" aria-hidden="true">▶</span> 멜로디 듣기</button><div class="melody-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>`;
  if (q.image) {
    const drawn = q.image.startsWith('data:') ? ' class="drawn"' : '';
    return `<div class="qmedia photo"><img${drawn} src="${esc(q.image)}" alt="문제 사진" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'사진을 불러오지 못했어요',className:'qhint'}))"></div>`;
  }
  const big = q.chosung ? chosung(q.answer) : q.big;
  if (big) return `<div class="qmedia"><span class="qbig">${esc(big)}</span></div>`;
  return '';
}

function renderQuestion() {
  clearTimeout(autoNextTimer);
  stopMelody();
  const { quiz, items, idx } = play;
  const item = items[idx];
  const q = item.q;
  const total = items.length;

  app.innerHTML = `
    <div class="play-head">
      <button class="icon-btn" data-act="quit" aria-label="그만하기">✕</button>
      <div class="progress" aria-hidden="true"><span style="width:${(idx / total) * 100}%"></span></div>
      <span class="counter">${idx + 1} / ${total}</span>
    </div>
    <div class="qcard">
      ${
        mediaHtml(q)
          ? `${mediaHtml(q)}<p class="qtext">${esc(q.text || '정답은?')}</p>`
          : `<div class="qmedia lead"><p class="qlead">${esc(q.text || '정답은?')}</p></div><p class="qtext sub">${esc(q.ask || '정답은?')}</p>`
      }
      ${quiz.guide ? `<p class="qguide">${esc(quiz.guide)}</p>` : ''}
      <p class="qhint" data-role="hint"></p>
      <div class="answer-form">
        <input class="answer-input" type="text" placeholder="정답 입력" autocomplete="off" autocapitalize="off"
               autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="정답 입력"
               ${q.numeric ? 'inputmode="numeric"' : ''}>
        <button class="btn" data-act="submit">확인</button>
      </div>
      <div data-role="after">
        <div class="sub-actions">
          <button class="link-btn" data-act="hint">힌트 보기</button>
          <button class="link-btn" data-act="pass">모르겠어요</button>
        </div>
      </div>
      ${q.credit || quiz.credit ? `<p class="credit">${esc(q.credit || quiz.credit)}</p>` : ''}
    </div>
  `;

  // 다음 문제 사진 미리 받아두기
  const next = items[idx + 1]?.q;
  if (next?.image) new Image().src = next.image;

  const input = app.querySelector('.answer-input');
  input.focus();

  const melodyBtn = app.querySelector('[data-act="melody"]');
  if (melodyBtn) {
    melodyBtn.addEventListener('click', () => {
      playMelody(q.melody, q.bpm, melodyBtn);
      input.focus();
    });
    // 소리가 이미 켜진 상태(앞 문제에서 한 번 눌렀음)면 자동으로 들려줌
    if (gameAudio.ctx?.state === 'running') playMelody(q.melody, q.bpm, melodyBtn);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    if (play.phase === 'ask') submit();
    else if (Date.now() - play.feedbackAt > 250) goNext();
  });

  app.querySelector('[data-act="submit"]').addEventListener('click', () => {
    if (play.phase === 'ask') submit();
  });
  app.querySelector('[data-act="hint"]').addEventListener('click', (e) => {
    item.hinted = true;
    app.querySelector('[data-role="hint"]').textContent = hintOf(q);
    e.currentTarget.disabled = true;
    input.focus();
  });
  app.querySelector('[data-act="pass"]').addEventListener('click', () => {
    item.passed = true;
    showFeedback(null);
  });
  app.querySelector('[data-act="quit"]').addEventListener('click', () => {
    if (play.idx === 0 || confirm('퀴즈를 그만할까요? 지금까지 푼 기록은 남지 않아요.')) {
      play = null;
      nav('/quizzes/');
    }
  });
}

function submit() {
  const input = app.querySelector('.answer-input');
  if (!normalize(input.value)) {
    input.classList.remove('shake');
    void input.offsetWidth; // 애니메이션 다시 시작
    input.classList.add('shake');
    input.focus();
    return;
  }
  const item = play.items[play.idx];
  item.input = input.value.trim();
  showFeedback(judge(item.input, item.q));
}

function showFeedback(result) {
  const item = play.items[play.idx];
  item.result = result;
  if (!play.quiz.generate) seen.add(play.quiz.id, item.q);
  play.phase = 'feedback';
  play.feedbackAt = Date.now();

  const input = app.querySelector('.answer-input');
  input.readOnly = true;
  app.querySelector('[data-act="submit"]').disabled = true;

  const last = play.idx === play.items.length - 1;
  const good = !!result;
  const msg = good ? (result === 'close' ? '정답! (비슷하게 써도 인정)' : '정답!') : item.passed ? '정답은' : '아쉬워요, 정답은';

  app.querySelector('[data-role="after"]').innerHTML = `
    <div class="feedback ${good ? 'good' : 'bad'}">
      <span class="mark">${good ? '○' : '✕'}</span>
      <div>
        <div class="msg">${esc(msg)}${good && result !== 'close' ? '' : ` <span>${esc(item.q.answer)}</span>`}</div>
        ${!good && item.input ? `<div class="sub">내 답: ${esc(item.input)}</div>` : ''}
      </div>
    </div>
    <div class="next-wrap">
      <button class="btn block" data-act="next">${last ? '결과 보기' : '다음 문제'}</button>
    </div>
  `;
  app.querySelector('.progress > span').style.width = `${((play.idx + 1) / play.items.length) * 100}%`;
  app.querySelector('[data-act="next"]').addEventListener('click', goNext);
  input.focus(); // 휴대폰 키보드가 내려가지 않게 입력칸에 그대로 둔다 (엔터로 다음 문제)

  // 맞히면 잠깐 보여주고 자동으로 넘어감
  if (good) autoNextTimer = setTimeout(goNext, 900);
}

function goNext() {
  clearTimeout(autoNextTimer);
  if (!play || play.phase !== 'feedback') return;
  if (play.idx < play.items.length - 1) {
    play.idx += 1;
    play.phase = 'ask';
    renderQuestion();
  } else {
    renderResult();
  }
}

/* ───────── 결과 화면 ───────── */

function gradeOf(ratio) {
  if (ratio === 1) return '만점이에요! 🎉';
  if (ratio >= 0.8) return '거의 다 맞혔어요!';
  if (ratio >= 0.5) return '괜찮아요, 한 번 더 해볼까요?';
  return '다시 도전해 봐요!';
}

function renderResult() {
  const { quiz, items } = play;
  const total = items.length;
  const score = items.filter((i) => i.result).length;
  const timeMs = Date.now() - play.startedAt;

  const stats = store.get();
  const prev = stats[quiz.id];
  const isBest = !prev || score > prev.best;
  // 전부 맞혔을 때만 시간 기록 (가장 빠른 기록 하나 보관)
  const perfect = score === total;
  const prevTime = prev?.bestTime;
  const newTimeRecord = perfect && (!prevTime || timeMs < prevTime);
  stats[quiz.id] = {
    plays: (prev?.plays || 0) + 1,
    best: isBest ? score : prev.best,
    total,
    bestTime: newTimeRecord ? timeMs : prevTime,
  };
  store.save(stats);
  reportPlay(quiz.id);
  const timeLine = perfect
    ? `<div class="clear-time">
        <span>전부 맞히는 데 걸린 시간</span>
        <b>${formatTime(timeMs)}</b>
        <small class="${newTimeRecord && prevTime ? 'new' : ''}">${
          !prevTime ? '첫 만점 기록이에요!' : newTimeRecord ? `최단 기록 갱신! (이전 ${formatTime(prevTime)})` : `내 최단 기록 ${formatTime(prevTime)}`
        }</small>
      </div>`
    : `<p class="best">걸린 시간 ${formatTime(timeMs)}${prevTime ? ` · 내 만점 최단 ${formatTime(prevTime)}` : ''}</p>`;

  app.innerHTML = `
    <div class="play-head">
      <button class="icon-btn" data-act="home" aria-label="목록으로">←</button>
      <span class="counter">${esc(quiz.title)}</span>
    </div>
    <section class="result-top">
      <p class="result-title">내 점수</p>
      <p class="score">${score}<small> / ${total}</small></p>
      <p class="grade">${esc(gradeOf(score / total))}</p>
      <p class="best ${isBest && prev ? 'new' : ''}">${
        !prev ? '첫 기록이에요' : isBest ? `최고 기록 갱신! (이전 ${prev.best}개)` : `내 최고 기록 ${prev.best} / ${prev.total}`
      }</p>
      ${timeLine}
    </section>
    <div class="result-actions">
      <button class="btn" data-act="retry">다시 풀기</button>
      <button class="btn ghost" data-act="share">친구에게 공유</button>
      <button class="btn ghost" data-act="home">다른 퀴즈</button>
    </div>
    ${quiz.noAds ? '' : adHtml('result')}
    <h3 class="section-title">문제 다시 보기</h3>
    <ul class="review">
      ${items
        .map(({ q, input, result }) => {
          const thumb = q.image
            ? `<img src="${esc(q.image)}" alt="">`
            : esc(q.chosung ? chosung(q.answer) : (q.big || (q.melody ? '🎵' : 'Q')));
          return `
          <li>
            <span class="thumb">${thumb}</span>
            <div class="info">
              <div class="q">${esc(q.text || '정답은?')}</div>
              <div class="a">${esc(q.answer)}</div>
              ${!result ? `<div class="mine">${input ? `내 답: ${esc(input)}` : '넘어감'}</div>` : ''}
            </div>
            <span class="ok ${result ? 'good' : 'bad'}">${result ? '○' : '✕'}</span>
          </li>`;
        })
        .join('')}
    </ul>
  `;

  app.querySelector('[data-act="retry"]').addEventListener('click', () => startQuiz(quiz.id));
  app.querySelectorAll('[data-act="home"]').forEach((b) =>
    b.addEventListener('click', () => {
      play = null;
      nav('/quizzes/');
    })
  );
  app.querySelector('[data-act="share"]').addEventListener('click', () => share(quiz, score, total));
  fillAds();
  window.scrollTo(0, 0);
}

async function share(quiz, score, total) {
  const url = quizUrl(quiz.id);
  const text = `'${quiz.title}' ${total}문제 중 ${score}개 맞혔어요! 너도 해볼래?`;
  if (navigator.share) {
    try {
      await navigator.share({ title: '맞혀봐', text, url });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('링크를 복사했어요');
  } catch {
    prompt('아래 링크를 복사해서 보내세요', url);
  }
}

/* ───────── 공통 표시 ───────── */

function formatTime(ms) {
  const s = ms / 1000;
  return s < 60 ? `${s.toFixed(1)}초` : `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초`;
}

/* ───────── 주소 따라 화면 바꾸기 ───────── */
// 주소: /  ·  /q/<퀴즈>/  ·  /games/  ·  /game/<게임>/   (예전 #/… 주소는 자동으로 바꿔 줌)

function nav(path) {
  if (path !== location.pathname) history.pushState(null, '', path);
  route();
}

function legacyHashToPath(hash) {
  const h = hash.replace(/^#/, '');
  if (/^\/q\/[\w-]+/.test(h) || /^\/game\/[\w-]+/.test(h)) return h.replace(/\/?$/, '/');
  if (h.startsWith('/games')) return '/games/';
  if (h.startsWith('/quizzes')) return '/quizzes/';
  return '/';
}

function route() {
  if (location.hash.startsWith('#/')) history.replaceState(null, '', legacyHashToPath(location.hash));
  window.scrollTo(0, 0);
  if (typeof stopGame === 'function') stopGame();
  stopMelody();
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const q = path.match(/^\/q\/([\w-]+)$/);
  const g = path.match(/^\/game\/([\w-]+)$/);
  const tab = g || path === '/games' ? 'games' : q || path === '/quizzes' ? 'quiz' : 'home';
  document.querySelectorAll('.top-tabs a').forEach((el) => {
    if (el.dataset.tab === tab) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
  if (q) startQuiz(q[1]);
  else if (g) {
    play = null;
    renderGame(g[1]);
  } else if (path === '/games') {
    play = null;
    renderGamesHome();
  } else if (path === '/quizzes') {
    play = null;
    renderQuizList();
  } else {
    play = null;
    renderHome();
  }
}

// 사이트 안 링크는 새로고침 없이 화면만 바꿈
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href.startsWith('/') || href.startsWith('//') || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (/\.(html|xml|txt|png|jpg|svg)$/.test(href)) return;
  e.preventDefault();
  nav(href);
});
window.addEventListener('popstate', route);
route();
