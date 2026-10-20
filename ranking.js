// 랭킹 탭: 순위표마다 1위만 가려 두고 맞혀 본 뒤, 전체 순위를 링크와 함께 보여준다.
// 주소: /rankings/ (목록), /ranking/<id>/ (순위표). 데이터는 data/rankings.js
'use strict';

// 사이트·앱·서비스는 공식 주소로 연결 (없으면 위키백과 검색)
const RANK_LINKS = {
  구글: 'https://www.google.com', 유튜브: 'https://www.youtube.com', 페이스북: 'https://www.facebook.com',
  인스타그램: 'https://www.instagram.com', 챗GPT: 'https://chatgpt.com', 빙: 'https://www.bing.com',
  야후: 'https://www.yahoo.com', 얀덱스: 'https://yandex.com', 덕덕고: 'https://duckduckgo.com',
  크롬: 'https://www.google.com/chrome/', 사파리: 'https://www.apple.com/safari/', 엣지: 'https://www.microsoft.com/edge',
  파이어폭스: 'https://www.mozilla.org/firefox/', '삼성 인터넷': 'https://www.samsung.com/sec/apps/samsung-internet/',
  웨일: 'https://whale.naver.com', 윈도우: 'https://www.microsoft.com/windows', macOS: 'https://www.apple.com/macos/',
  '크롬 OS': 'https://www.google.com/chromebook/', 'X(트위터)': 'https://x.com', 핀터레스트: 'https://www.pinterest.com',
  제미나이: 'https://gemini.google.com', 클로드: 'https://claude.ai', 딥시크: 'https://www.deepseek.com', 그록: 'https://grok.com',
  아마존: 'https://www.amazon.com', 테무: 'https://www.temu.com', 이베이: 'https://www.ebay.com', 월마트: 'https://www.walmart.com',
  트위치: 'https://www.twitch.tv', 로블록스: 'https://www.roblox.com', 스팀: 'https://store.steampowered.com',
  체스닷컴: 'https://www.chess.com', 포키: 'https://poki.com', 삼성: 'https://www.samsung.com', 애플: 'https://www.apple.com',
  샤오미: 'https://www.mi.com', LG: 'https://www.lg.com', AWS: 'https://aws.amazon.com', 마이크로소프트: 'https://www.microsoft.com',
  넷플릭스: 'https://www.netflix.com', 카카오톡: 'https://www.kakaocorp.com/page/service/service/KakaoTalk',
  네이버: 'https://www.naver.com', 티빙: 'https://www.tving.com', 쿠팡플레이: 'https://www.coupangplay.com',
  웨이브: 'https://www.wavve.com', '디즈니+': 'https://www.disneyplus.com', 밴드: 'https://band.us', 틱톡: 'https://www.tiktok.com',
  '네이버 카페': 'https://section.cafe.naver.com', 배달의민족: 'https://www.baemin.com', 쿠팡이츠: 'https://www.coupangeats.com',
  요기요: 'https://www.yogiyo.co.kr', '유튜브 뮤직': 'https://music.youtube.com', 스포티파이: 'https://www.spotify.com',
  멜론: 'https://www.melon.com', 지니뮤직: 'https://www.genie.co.kr', 쿠팡: 'https://www.coupang.com',
  알리익스프레스: 'https://www.aliexpress.com', 파이썬: 'https://www.python.org',
  '비주얼 스튜디오 코드': 'https://code.visualstudio.com', 타입스크립트: 'https://www.typescriptlang.org',
};

function rankLink(name, board) {
  if (RANK_LINKS[name]) return RANK_LINKS[name];
  const t = board.title;
  if (/유튜브|MV|좋아요 영상/.test(t) && !/국가/.test(t)) return `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`;
  if (/스포티파이/.test(t)) return `https://open.spotify.com/search/${encodeURIComponent(name)}`;
  return `https://ko.wikipedia.org/w/index.php?search=${encodeURIComponent(name.replace(/\s*\(.*?\)\s*/g, ' ').trim())}`;
}

// 내가 맞힌/못 맞힌 랭킹 (이 기기에만 저장)
const rankStore = {
  get() {
    try { return JSON.parse(localStorage.getItem('rank-solved') || '{}'); } catch { return {}; }
  },
  set(id, ok) {
    const s = this.get();
    s[id] = ok ? 1 : 0;
    try { localStorage.setItem('rank-solved', JSON.stringify(s)); } catch { /* 무시 */ }
  },
};

const rankList = { group: '전체', query: '' };
const groupOf = (id) => RANK_GROUPS.find((g) => g.id === id);

// 오늘의 랭킹 (날짜마다 바뀜, 같은 날엔 누구에게나 같음)
function todaysRankings(n) {
  const day = new Date().toISOString().slice(0, 10);
  let h = 7;
  for (const ch of day) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  const out = [];
  for (let i = 0; out.length < n && i < RANKINGS.length * 2; i++) {
    const b = RANKINGS[(h + i * 37) % RANKINGS.length];
    if (!out.includes(b) && !out.some((o) => o.group === b.group)) out.push(b);
  }
  return out;
}

// 홈·목록에 쓰는 순위표 카드 (1위는 ???)
function rankCardHtml(b) {
  const done = rankStore.get()[b.id];
  return `
    <a class="rank-card" href="/ranking/${b.id}/">
      <div class="rank-card-head"><span>${groupOf(b.group).emoji} ${esc(groupOf(b.group).title)}</span>${
        done === undefined ? '' : `<b class="${done ? 'ok' : 'no'}">${done ? '맞힘' : '못 맞힘'}</b>`
      }</div>
      <h3>${esc(b.title)}</h3>
      <ol>
        <li class="q"><i>1</i>${done === undefined ? '???' : esc(b.answer)}</li>
        ${b.items.slice(1, 3).map((it, k) => `<li><i>${k + 2}</i>${esc(it[0])}</li>`).join('')}
      </ol>
    </a>`;
}

// 제목 "세계 방문자 사이트 (2026.9)" → ['세계 방문자 사이트', '2026.9']
const splitTitle = (t) => {
  const m = t.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  return m ? [m[1], m[2]] : [t, ''];
};

// 목록 한 줄: 제목 · 기준 시점 · 2·3위 미리보기 · 맞힘 표시
function rankRowHtml(b) {
  const done = rankStore.get()[b.id];
  const [name, when] = splitTitle(b.title);
  const preview = b.items.slice(1, 3).map((it, k) => `${k + 2}위 ${esc(it[0])}`).join(' · ');
  return `
    <li><a class="rk-item" href="/ranking/${b.id}/">
      <span class="rk-badge${done === 1 ? ' ok' : done === 0 ? ' no' : ''}">${done === 1 ? '✓' : done === 0 ? '✕' : '1'}</span>
      <span class="rk-main">
        <b>${esc(name)}</b>
        <small>${when ? `<em>${esc(when)}</em>` : ''}${preview}</small>
      </span>
      <span class="rk-go" aria-hidden="true">›</span>
    </a></li>`;
}

function renderRankings() {
  document.title = '랭킹 · 맞혀봐';
  const solved = rankStore.get();
  const nSolved = Object.values(solved).filter((v) => v === 1).length;
  app.innerHTML = `
    <section class="hero">
      <h1>1위를 맞혀 보세요</h1>
      <p>2·3위를 보고 1위를 떠올려 보세요${nSolved ? ` · 지금까지 <b>${nSolved}개</b> 맞힘` : ''}</p>
    </section>
    <input class="search" type="search" placeholder="랭킹 찾기 (예: 유튜브, 롤드컵)" value="${esc(rankList.query)}" aria-label="랭킹 찾기">
    <div class="chips" role="group" aria-label="분류">
      ${['전체', ...RANK_GROUPS.map((g) => g.id)]
        .map((id) => {
          const g = groupOf(id);
          return `<button class="chip" data-g="${id}" aria-pressed="${id === rankList.group}">${g ? esc(g.title) : '전체'}</button>`;
        })
        .join('')}
    </div>
    <div class="rank-sections"></div>
    ${adHtml('homeBottom')}
    ${SITE_FOOT}`;
  const PREVIEW = 6; // '전체'에서는 분류마다 6개만 보여 주고 '모두 보기'
  const draw = () => {
    const q = normalize(rankList.query);
    const all = rankList.group === '전체' && !q;
    const groups = RANK_GROUPS.filter((g) => rankList.group === '전체' || rankList.group === g.id);
    const html = groups
      .map((g) => {
        const list = RANKINGS.filter((b) => b.group === g.id && (!q || normalize(b.title + b.q + b.items.slice(1).map((i) => i[0]).join('')).includes(q)));
        if (!list.length) return '';
        const shown = all ? list.slice(0, PREVIEW) : list;
        return `<section class="rk-sec">
          <div class="rk-sec-head">
            <span class="rk-emoji" aria-hidden="true">${g.emoji}</span>
            <div><h2>${esc(g.title)}</h2><p>${esc(g.desc)}</p></div>
            <span class="rk-count">${list.length}개</span>
          </div>
          <ul class="rk-list">${shown.map(rankRowHtml).join('')}</ul>
          ${all && list.length > PREVIEW ? `<button class="rk-more" data-more="${g.id}">${esc(g.title)} ${list.length}개 모두 보기 ›</button>` : ''}
        </section>`;
      })
      .join('');
    const box = app.querySelector('.rank-sections');
    box.innerHTML = html || '<p class="empty">찾는 랭킹이 없어요</p>';
    box.querySelectorAll('[data-more]').forEach((btn) =>
      btn.addEventListener('click', () => {
        rankList.group = btn.dataset.more;
        app.querySelectorAll('[data-g]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.g === rankList.group));
        draw();
        window.scrollTo({ top: app.querySelector('.chips').offsetTop - 70 });
      })
    );
  };
  app.querySelector('.search').addEventListener('input', (e) => {
    rankList.query = e.target.value;
    draw();
  });
  app.querySelectorAll('[data-g]').forEach((b) =>
    b.addEventListener('click', () => {
      rankList.group = b.dataset.g;
      app.querySelectorAll('[data-g]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      draw();
    })
  );
  draw();
  fillAds();
}

// 받침에 따라 조사 고르기 (숫자·영어로 끝나면 읽는 소리로: 1=일, L=엘 …)
function josa(word, withBatchim, without) {
  const c = String(word).trim().slice(-1);
  const code = c.charCodeAt(0) - 0xac00;
  let has;
  if (code >= 0 && code <= 11171) has = code % 28 !== 0;
  else if (/[0-9]/.test(c)) has = '013678'.includes(c);
  else has = /[lmnr]/i.test(c);
  return has ? withBatchim : without;
}

function renderRanking(id) {
  const b = RANKINGS.find((x) => x.id === id);
  if (!b) {
    nav('/rankings/');
    return;
  }
  const g = groupOf(b.group);
  document.title = `${b.title} 1위는? · 맞혀봐 랭킹`;
  const row = (it, i, reveal) => {
    const [name, val, url] = it;
    const hidden = i === 0 && !reveal;
    return `<li class="rank-row${i === 0 ? ' first' : ''}${hidden ? ' hidden' : ''}">
      <span class="rk-no">${i + 1}</span>
      ${hidden ? '<span class="rank-name">???</span>' : `<a class="rank-name" href="${esc(url || rankLink(name, b))}" target="_blank" rel="noopener">${esc(name)} <span aria-hidden="true">↗</span></a>`}
      ${val && !hidden ? `<span class="rank-val">${esc(val)}</span>` : ''}
    </li>`;
  };
  app.innerHTML = `
    <div class="play-head">
      <button class="icon-btn" data-act="back" aria-label="랭킹 목록으로">←</button>
      <h1 class="page-title">${g.emoji} ${esc(g.title)} 랭킹</h1>
    </div>
    <div class="rank-board">
      <h2>🏆 ${esc(b.title)}</h2>
      <p class="rank-q">${esc(b.q)}</p>
      <ol class="rank-list">${b.items.map((it, i) => row(it, i, false)).join('')}</ol>
    </div>
    <div class="rank-guess">
      <p class="qhint" data-role="hint"></p>
      <div class="answer-form">
        <input class="answer-input" type="text" placeholder="1위는?" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="1위 입력">
        <button class="btn" data-act="submit">확인</button>
      </div>
      <div class="sub-actions">
        <button class="link-btn" data-act="hint">힌트 보기</button>
        <button class="link-btn" data-act="pass">모르겠어요</button>
      </div>
    </div>
    <p class="game-result" role="status"></p>
    <div class="game-actions" hidden>
      <button class="btn block" data-act="next">다음 랭킹</button>
      <button class="btn ghost block" data-act="back">랭킹 목록</button>
    </div>
    <p class="rank-src">이름을 누르면 해당 사이트·자료로 이동해요 · 순위는 제목에 적힌 시점 기준</p>
    ${adHtml('result')}`;
  const input = app.querySelector('.answer-input');
  const resultEl = app.querySelector('.game-result');
  let done = false;

  function reveal(ok, mine) {
    done = true;
    rankStore.set(b.id, ok);
    app.querySelector('.rank-list').innerHTML = b.items.map((it, i) => row(it, i, true)).join('');
    app.querySelector('.rank-row.first').classList.add(ok ? 'ok' : 'no');
    app.querySelector('.rank-guess').hidden = true;
    app.querySelector('.game-actions').hidden = false;
    resultEl.innerHTML = ok
      ? `🎉 정답! 1위는 <b>${esc(b.answer)}</b>`
      : `${mine ? `'${esc(mine)}'${josa(mine, '은', '는')} 아니에요. ` : ''}1위는 <b>${esc(b.answer)}</b>${josa(b.answer, '이었어요', '였어요')}`;
  }
  function submit() {
    const v = input.value.trim();
    if (!normalize(v)) {
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
      return;
    }
    reveal(!!judge(v, b), v);
  }
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    if (!done) submit();
  });
  app.querySelector('[data-act="submit"]').addEventListener('click', submit);
  app.querySelector('[data-act="hint"]').addEventListener('click', (e) => {
    app.querySelector('[data-role="hint"]').textContent = `힌트: ${b.hint} · 초성 ${chosung(b.answer)}`;
    e.currentTarget.disabled = true;
    input.focus();
  });
  app.querySelector('[data-act="pass"]').addEventListener('click', () => reveal(false, ''));
  app.querySelectorAll('[data-act="back"]').forEach((x) => x.addEventListener('click', () => nav('/rankings/')));
  app.querySelector('[data-act="next"]').addEventListener('click', () => {
    const solved = rankStore.get();
    const pool = RANKINGS.filter((x) => x.group === b.group && x.id !== b.id && solved[x.id] === undefined);
    const rest = pool.length ? pool : RANKINGS.filter((x) => x.id !== b.id && solved[x.id] === undefined);
    const list = rest.length ? rest : RANKINGS.filter((x) => x.id !== b.id);
    const next = list[Math.floor(Math.random() * list.length)];
    nav(`/ranking/${next.id}/`);
  });
  input.focus();
  fillAds();
}
