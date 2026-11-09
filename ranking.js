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
// 검색용 제목: 검색어가 '○○ 우승 횟수 순위'·'○○ 순위' 꼴로 들어와서 거기에 맞춤 (정적 페이지 build_pages.js 도 이걸 씀)
//   '롤드컵 최다 우승 팀 (2025)' → '롤드컵 팀별 우승 횟수 순위 TOP 9 (2025)'
function rankSeoTitle(b) {
  const m = b.title.match(/^(.*?)\s*\(([^)]*)\)$/);
  let [base, when] = m ? [m[1], m[2]] : [b.title, ''];
  base = base
    .replace(/ 최다 우승 (팀|선수|국가|감독|리그)$/, (_, who) => ` ${who}별 우승 횟수`)
    .replace(/ 최다 우승국?$/, ' 우승 횟수')
    .replace(/네이션스컵 최다$/, '네이션스컵 우승 횟수')
    .replace(/^남아메리카/, '남미(남아메리카)'); // 검색어는 대부분 '남미'
  return `${base}${/순위/.test(base) ? '' : ' 순위'} TOP ${b.items.length}${when ? ` (${when})` : ''}`;
}

// 검색 상위 랭킹의 배경 설명 (1위 이름은 쓰지 않음 — 맞히기 전에 보이는 글)
const RANK_NOTES = {
  'sports-46': '일본시리즈는 센트럴리그와 퍼시픽리그 우승팀이 맞붙는 일본 프로야구 결승전이에요. 1950년에 시작했고 7전 4선승제로 열려요. 1965년부터 1973년까지 9년 연속 우승한 팀도 있었어요.',
  'web-4': '휴대폰에 기본으로 깔린 브라우저가 상위권에 많은 게 한국 시장의 특징이에요. 삼성 인터넷은 갤럭시의 기본 브라우저이고, 웨일은 네이버가 만든 브라우저예요.',
  'world-41': '태어나면서 처음 배운 말(모국어) 기준 순위예요. 외국어로 쓰는 사람까지 더하면 순위가 크게 달라져서, 영어가 1위로 올라가요.',
  'web-15': '서버를 직접 사지 않고 인터넷으로 빌려 쓰는 클라우드 시장의 점유율이에요. 아마존·마이크로소프트·구글 세 회사를 흔히 빅3라고 불러요.',
  'speed-3': '200m는 곡선 주로를 달린 뒤 직선으로 들어오는 종목이라 코너를 도는 기술이 중요해요. 뒷바람이 초속 2m를 넘으면 공식 기록으로 인정되지 않아요.',
  'speed-2': '1988년에 세워진 기록이 40년 가까이 깨지지 않고 있어요. 단거리 기록은 뒷바람이 초속 2m 이하일 때만 공식으로 인정돼요.',
  'sports-2': '롤드컵은 매년 가을 열리는 리그 오브 레전드 세계 대회예요. 선수의 우승 횟수는 우승 팀 명단에 이름을 올린 횟수로 세요.',
  'sports-1': '롤드컵은 2011년에 시작했어요. 표의 젠지 2회는 팀의 전신인 삼성 시절 우승(2014년 삼성 화이트, 2017년 삼성 갤럭시)을 합친 숫자예요.',
  'sales-50': '본사(가맹본부)의 매출 기준이에요. 가맹점이 손님에게 판 금액 전체가 아니라 본사가 가맹점에 재료를 공급하고 받은 돈이 중심이에요. 마리 수 기준 판매량은 대부분의 브랜드가 공개하지 않아서 매출로 비교해요.',
  'world-10': '남아메리카는 12개 독립국과 프랑스령 기아나로 이루어져 있어요. 1·2위 두 나라만 합쳐도 대륙 면적의 60%가 넘어요.',
  'web-2': '웹사이트로 들어오는 검색 유입을 집계한 StatCounter 수치예요. 바이두·얀덱스·네이버처럼 자기 나라에서 강한 검색엔진은 세계 순위로 보면 낮게 나와요.',
  'sports-35': 'K리그는 1983년 슈퍼리그로 시작했어요. 2위 성남 FC의 우승 7회는 성남 일화 천마 시절 기록이에요.',
  'sports-38': '정규 시즌 전체에서 가장 뛰어난 선수에게 주는 상이에요. 챔피언 결정전에서 뽑는 파이널 MVP와는 다른 상이에요.',
  'sales-16': '제조사가 밝힌 누적 출하 대수 기준이에요. 공장에서 나간 수량이라 소비자가 실제로 산 수와는 조금 달라요. 아직 팔리고 있는 기종은 순위가 바뀔 수 있어요.',
  'world-14': '유럽에서 가장 넓은 러시아는 뺀 순위예요. 프랑스는 해외 영토를 뺀 본토 면적으로 계산했어요.',
  'sports-49': 'KBO 리그는 1982년에 출범했고, 정규 시즌 MVP는 기자단 투표로 뽑아요.',
  'world-11': '러시아는 국토 상당 부분이 아시아에 있지만 유럽 나라로 분류하는 경우가 많아 뺐어요.',
  'world-4': '땅이 아주 작은 도시국가가 상위권에 몰려요. 인구를 면적으로 나눈 값이라 땅이 좁을수록 숫자가 크게 나와요.',
  'sports-21': 'A매치는 FIFA가 인정한 국가대표 공식 경기예요. 친선 경기라도 양국 대표팀이 치르면 기록에 들어가요.',
  'sports-50': '스탠리컵은 북미 프로 아이스하키 NHL의 우승 트로피예요. 1893년에 처음 수여됐고, 우승 팀 선수의 이름을 트로피에 새겨요.',
};

// 값 문자열 → 숫자와 단위 ('5,278억 원' → 527800000000, '원')
function rankValue(v) {
  const m = String(v || '').replace(/^약\s*/, '').match(/^([\d,.]+)\s*(억|만)?\s*(.*)$/);
  if (!m) return null;
  return { n: parseFloat(m[1].replace(/,/g, '')) * (m[2] === '억' ? 1e8 : m[2] === '만' ? 1e4 : 1), unit: m[3].trim() };
}
function rankNum(n, unit) {
  const t = n >= 1e8 ? `${+(n / 1e8).toFixed(2)}억` : n >= 1e4 ? `${+(n / 1e4).toFixed(1)}만` : `${+n.toFixed(2)}`;
  return `${t}${/[억만]$/.test(t) ? ' ' : ''}${unit}`;
}

// 순위표 아래 설명: 화면과 정적 페이지가 같은 글을 씀. 1위는 접어 둔 칸 안에만
function rankInsightHtml(b) {
  const m = b.title.match(/^(.*?)\s*\(([^)]*)\)$/);
  const [base, when] = m ? [m[1], m[2]] : [b.title, ''];
  const its = b.items;
  const label = (it) => `${esc(it[0])}${it[1] ? `(${esc(it[1])})` : ''}`;
  const lines = [`${esc(base)} 상위 ${its.length}개를 ${when ? `${esc(when)} 기준으로 ` : ''}정리했어요.`];
  if (its[1]) lines.push(`2위 ${label(its[1])}${its[2] ? `, 3위 ${label(its[2])}` : ''}${its.length > 3 ? `, ${its.length}위 ${label(its[its.length - 1])}` : ''} 순이에요.`);
  const a = its[1] && rankValue(its[1][1]);
  const c = its[2] && rankValue(its[2][1]);
  if (a && c && a.unit === c.unit) {
    const d = Math.abs(a.n - c.n);
    lines.push(d === 0 ? '2위와 3위는 기록이 같아요.' : `2위와 3위의 차이: ${esc(rankNum(d, a.unit))}.`);
  }
  const same = RANKINGS.filter((x) => x.group === b.group && x.id !== b.id);
  const at = RANKINGS.filter((x) => x.group === b.group).findIndex((x) => x.id === b.id);
  const rel = [0, 1, 2, 3].map((k) => same[(at + k) % same.length]);
  return `<section class="about rank-about">
    <h2>${esc(base)} 순위 알아보기</h2>
    ${RANK_NOTES[b.id] ? `<p>${esc(RANK_NOTES[b.id])}</p>` : ''}
    <p>${lines.join(' ')}</p>
    <p>${esc(b.q)} (힌트: ${esc(b.hint)}) 순위는 제목에 적힌 시점의 공개 자료로 정리했고, 시간이 지나면 달라질 수 있어요.</p>
    <details><summary>정답과 전체 순위 보기</summary><ol>${its.map((it) => `<li>${label(it)}</li>`).join('')}</ol></details>
    <h3>함께 보면 좋은 랭킹</h3>
    <ul>${rel.map((x) => `<li><a href="/ranking/${x.id}/">${esc(x.title)}</a></li>`).join('')}</ul>
  </section>`;
}

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
  // 인기순(참여 수 많은 순, 같으면 원래 순서). 참여 수는 퀴즈와 같은 집계 서버에 'rank-<id>'로 셈
  const rankPlays = (plays, b) => plays['rank-' + b.id] || 0;
  const draw = () => {
    const plays = counts.get();
    const q = normalize(rankList.query);
    const all = rankList.group === '전체' && !q;
    const groups = RANK_GROUPS.filter((g) => rankList.group === '전체' || rankList.group === g.id);
    const html = groups
      .map((g) => {
        const list = RANKINGS.filter((b) => b.group === g.id && (!q || normalize(b.title + b.q + b.items.slice(1).map((i) => i[0]).join('')).includes(q)))
          .sort((a, b) => rankPlays(plays, b) - rankPlays(plays, a));
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
  counts.refresh().then((fresh) => fresh && app.querySelector('.rank-sections') && draw());
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
  document.title = `${rankSeoTitle(b)} - 1위는? | 맞혀봐`;
  reportPlay('rank-' + b.id);
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
    ${rankInsightHtml(b)}
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
    sfx(ok ? 'win' : 'bad');
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
  if (!matchMedia('(pointer: coarse)').matches) input.focus(); // 휴대폰은 순위표부터 보이게 키보드를 바로 안 띄움
  fillAds();
}
