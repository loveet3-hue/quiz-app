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

// 채점 결과: 'exact'(정답) · 'close'(오타 인정: 4글자 이상은 1글자, 12글자 이상은 2글자) · null(오답)
function judge(input, q) {
  const mine = normalize(input);
  if (!mine) return null;
  const answers = [q.answer, ...(q.alias || [])].map(normalize);
  if (answers.includes(mine)) return 'exact';
  if (q.exact) return null;
  if (answers.some((a) => a.length >= 4 && editDistance(a, mine) <= (a.length >= 12 ? 2 : 1))) return 'close';
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

const quizUrl = (id) => `${location.origin}${location.pathname}#/q/${id}`;

/* ───────── 목록 화면 ───────── */

const home = { category: '전체', query: '' };

function renderHome() {
  document.title = '맞혀봐';
  app.innerHTML = `
    <section class="hero">
      <h1>보고, 떠올리고,<br>직접 써서 맞혀 보세요</h1>
      <p>객관식 없이 정답을 직접 입력하는 퀴즈예요</p>
    </section>
    <input class="search" type="search" placeholder="퀴즈 찾기" value="${esc(home.query)}" aria-label="퀴즈 찾기">
    <div class="chips" role="group" aria-label="카테고리">
      ${CATEGORIES.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === home.category}">${esc(c)}</button>`).join('')}
    </div>
    <div class="grid"></div>
    <footer class="site-foot">
      <a href="privacy.html">개인정보 처리방침</a>
    </footer>
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
}

function renderGrid() {
  const stats = store.get();
  const q = normalize(home.query);
  const list = QUIZZES.filter(
    (quiz) =>
      (home.category === '전체' || quiz.category === home.category) &&
      (!q || normalize(quiz.title + quiz.desc).includes(q))
  );
  const grid = app.querySelector('.grid');
  if (!list.length) {
    grid.outerHTML = `<div class="grid"></div><p class="empty">찾는 퀴즈가 없어요</p>`;
    return;
  }
  app.querySelector('.empty')?.remove();
  grid.innerHTML = list
    .map((quiz) => {
      const n = quiz.generate ? quiz.perPlay : Math.min(quiz.perPlay, quiz.questions.length);
      const s = stats[quiz.id];
      const cover = quiz.cover.flags
        ? `<div class="flag-grid${quiz.cover.vs ? ' vs' : ''}">${quiz.cover.flags
            .map((c) => `<img src="${esc(FLAG(c))}" alt="" loading="lazy">`)
            .join(quiz.cover.vs ? '<span class="vs-mark">?</span>' : '')}</div>`
        : `<img src="${esc(quiz.cover.image)}" alt="" loading="lazy">`;
      const bg = '';
      return `
        <a class="card" href="#/q/${esc(quiz.id)}">
          <div class="cover" ${bg}>${cover}<span class="badge">${esc(quiz.category)}</span></div>
          <div class="card-body">
            <h2 class="card-title">${esc(quiz.title)}</h2>
            <div class="card-meta">${n}문제 · 주관식${s ? ` · 최고 <b>${s.best}/${s.total}</b>` : ''}</div>
          </div>
        </a>`;
    })
    .join('');
}

/* ───────── 풀기 화면 ───────── */

let play = null;
let autoNextTimer;

function startQuiz(id) {
  const quiz = QUIZZES.find((q) => q.id === id);
  if (!quiz) {
    location.hash = '#/';
    return;
  }
  const picked = quiz.generate
    ? quiz.generate(quiz.perPlay)
    : shuffle(quiz.questions).slice(0, Math.min(quiz.perPlay, quiz.questions.length));
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

function mediaHtml(q) {
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
      location.hash = '#/';
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
  play.phase = 'feedback';
  play.feedbackAt = Date.now();

  const input = app.querySelector('.answer-input');
  input.readOnly = true;
  app.querySelector('[data-act="submit"]').disabled = true;

  const last = play.idx === play.items.length - 1;
  const good = !!result;
  const msg = good ? (result === 'close' ? '정답! (오타는 봐줄게요)' : '정답!') : item.passed ? '정답은' : '아쉬워요, 정답은';

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
  stats[quiz.id] = {
    plays: (prev?.plays || 0) + 1,
    best: isBest ? score : prev.best,
    total,
  };
  store.save(stats);

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
      <p class="best">걸린 시간 ${formatTime(timeMs)}</p>
    </section>
    <div class="result-actions">
      <button class="btn" data-act="retry">다시 풀기</button>
      <button class="btn ghost" data-act="share">친구에게 공유</button>
      <button class="btn ghost" data-act="home">다른 퀴즈</button>
    </div>
    <h3 class="section-title">문제 다시 보기</h3>
    <ul class="review">
      ${items
        .map(({ q, input, result }) => {
          const thumb = q.image
            ? `<img src="${esc(q.image)}" alt="">`
            : esc(q.chosung ? chosung(q.answer) : (q.big || 'Q'));
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
      location.hash = '#/';
    })
  );
  app.querySelector('[data-act="share"]').addEventListener('click', () => share(quiz, score, total));
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

function route() {
  window.scrollTo(0, 0);
  const q = location.hash.match(/^#\/q\/([\w-]+)/);
  if (q) startQuiz(q[1]);
  else {
    play = null;
    renderHome();
  }
}

window.addEventListener('hashchange', route);
route();
