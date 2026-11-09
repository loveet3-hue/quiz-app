// 퀴즈·게임마다 실제 페이지 파일을 만든다 (# 없는 주소 + 카톡·검색 미리보기).
//   /quizzes/index.html, /rankings/index.html, /ranking/<id>/index.html, /q/<퀴즈>/index.html, /games/index.html, /game/<게임>/index.html, 404.html, sitemap.xml, robots.txt
// index.html의 <!--META-->…<!--/META-->, <!--STATIC-->…<!--/STATIC--> 부분만 페이지마다 바꿔 끼운다.
// 사용: node tools/build_pages.js   (python3 tools/bump_version.py 다음에 실행)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://quizbwa.co.kr';
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// 퀴즈·게임 목록 불러오기 (index.html이 불러오는 순서 그대로)
const tpl = read('index.html');
const scripts = [...tpl.matchAll(/<script src="\/([^"?]+\.js)/g)].map((m) => m[1]).filter((f) => f !== 'app.js');
const ctx = { localStorage: { getItem: () => null, setItem() {} }, console };
vm.createContext(ctx);
vm.runInContext(scripts.map((f) => read(f)).join('\n;\n') + '\n;this.Q = QUIZZES; this.QF = QUIZ_FORMATS; this.G = GAMES; this.R = RANKINGS; this.RG = RANK_GROUPS; this.RL = rankLink; this.RT = rankSeoTitle; this.QA = quizAboutHtml; this.GA = gameAboutHtml; this.QS = QUESTIONS; this.SP = STUDY_PAGES; this.FT = { ANIMALS, SIGNS, animalYears, signRange, TAROT, LOTTO_RANKS, LOTTO_TOTAL, animalAboutHtml, signAboutHtml, SAJU_ABOUT, LOTTO_ABOUT }; this.RI = rankInsightHtml; this.RN = RANK_NOTES;', ctx);
const QUIZZES = ctx.Q;
const GAMES = ctx.G;
const QUIZ_FORMATS = ctx.QF;
const RANKINGS = ctx.R;
const RANK_GROUPS = ctx.RG;
const rankLink = ctx.RL;
const quizAboutHtml = ctx.QA; // 화면 아래 소개 글과 같은 내용 (guides.js)
const gameAboutHtml = ctx.GA;
const { buildStudy } = require('./study');
const { buildArticles } = require('./articles');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
ctx.esc = esc; // ranking.js·fortune.js 의 설명 글 함수가 씀 (화면에선 app.js 의 esc)

function meta({ title, desc, url, image, ld, noindex }) {
  return `<!--META-->
  <title>${esc(title)}</title>${noindex ? '\n  <meta name="robots" content="noindex, follow">' : ''}
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="맞혀봐">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">${ld ? `\n  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
  <!--/META-->`;
}

// noindex: 글이 거의 없는 페이지(랭킹 문제·띠별 운세·로또·사주)는 검색·애드센스 심사에서 뺌 — 쓰는 데는 그대로 (2026-11 애드센스 '가치가 별로 없는 콘텐츠' 거절)
function page({ title, desc, url, image, body, noAds, ld, noindex }) {
  // 광고 없는 퀴즈(실존 인물 사진)는 애드센스 스크립트를 빼고 계정 확인용 meta만 남김
  const t = noAds ? tpl.replace(/<script async id="adsense-js"[^>]*><\/script>\n\s*/, '') : tpl;
  return t
    .replace(/<!--META-->[\s\S]*?<!--\/META-->/, meta({ title, desc, url, image, ld, noindex }))
    .replace(/<!--STATIC-->[\s\S]*?<!--\/STATIC-->/, `<!--STATIC--><div class="seo-static">${body}</div><!--/STATIC-->`);
}

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const ogFile = (name) => (fs.existsSync(path.join(ROOT, 'og', name + '.jpg')) ? `${SITE}/og/${name}.jpg` : `${SITE}/og/home.jpg`);
const urls = [];

// 홈 (검색엔진용으로 퀴즈 목록을 글로도 넣어 둠 — 화면은 앱이 다시 그림)
const homeBody = `<h1>맞혀봐 - 직접 써서 맞히는 퀴즈</h1><p>맞혀봐는 사진·초성·설명·멜로디를 보고 정답을 직접 써서 맞히는 주관식 퀴즈 사이트예요. 상식, 지리, 언어, 영화·음악, 동물·자연 등 50가지가 넘는 주제에 수천 개의 문제가 있고, 모임에서 쓰는 뽑기·파티 게임과 1위를 맞히는 랭킹 퀴즈도 있어요.</p><ul>${QUIZZES.map((q) => `<li><a href="/q/${q.id}/">${esc(q.title)}</a> - ${esc(q.desc)}</li>`).join('')}</ul><p><a href="/games/">뽑기 게임</a> · <a href="/study/">공부하기</a> · <a href="/about.html">소개</a> · <a href="/terms.html">이용약관</a> · <a href="/privacy.html">개인정보 처리방침</a></p>`;
const homeHtml = page({
  title: '맞혀봐 - 상식 퀴즈 · 그림 퀴즈 · 뽑기 게임 · 랭킹',
  desc: `맞혀봐(맞춰봐)는 사진·초성·그림을 보고 정답을 직접 써서 맞히는 무료 주관식 퀴즈 사이트예요. 상식 퀴즈, 국기 퀴즈, 초성 퀴즈, 노래·영화 퀴즈와 라이어 게임·돌림판·사다리 같은 뽑기 게임, 1위 맞히기 랭킹까지`,
  url: `${SITE}/`,
  image: ogFile('home'),
  body: homeBody,
  ld: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '맞혀봐',
    alternateName: ['맞춰봐', '맞혀봐 퀴즈', 'quizbwa'],
    url: `${SITE}/`,
    inLanguage: 'ko',
    description: '사진·초성·그림을 보고 정답을 직접 써서 맞히는 무료 주관식 퀴즈와 뽑기 게임',
    publisher: { '@type': 'Organization', name: '맞혀봐', logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` } },
  },
});
write('index.html', homeHtml);
write('404.html', homeHtml); // 모르는 주소는 앱이 홈을 보여줌
urls.push('/');

// 퀴즈
for (const q of QUIZZES) {
  const n = q.generate ? '매번 새 문제' : `${q.questions.length}문제`;
  write(
    `q/${q.id}/index.html`,
    page({
      title: `${/퀴즈/.test(q.title) ? q.title : `${q.title} 퀴즈`} - 맞혀봐`,
      desc: `${q.desc} · ${n}, 정답을 직접 입력하는 주관식 퀴즈`,
      url: `${SITE}/q/${q.id}/`,
      image: ogFile(q.id),
      body: `<h1>${esc(q.title)}</h1><p>${esc(q.desc)} · ${n}</p>${quizAboutHtml(q, QUIZZES)}<p><a href="/">다른 퀴즈 보기</a></p>`,
      ld: { '@context': 'https://schema.org', '@type': 'Quiz', name: q.title, description: q.desc, about: q.category, inLanguage: 'ko', url: `${SITE}/q/${q.id}/`, isAccessibleForFree: true },
      noAds: q.noAds,
    })
  );
  urls.push(`/q/${q.id}/`);
}

// 퀴즈 탭 (전체 퀴즈 목록)
write(
  'quizzes/index.html',
  page({
    title: `퀴즈 - 맞혀봐`,
    desc: `사진·초성·설명·멜로디를 보고 정답을 직접 써서 맞히는 주관식 퀴즈 모음`,
    url: `${SITE}/quizzes/`,
    image: ogFile('home'),
    body: `<h1>퀴즈</h1><ul>${QUIZZES.map((q) => `<li><a href="/q/${q.id}/">${esc(q.title)}</a> - ${esc(q.desc)}</li>`).join('')}</ul>`,
  })
);
urls.push('/quizzes/');
for (const f of QUIZ_FORMATS) {
  const list = QUIZZES.filter((q) => q.format === f.id);
  if (!list.length) continue;
  write(
    `quizzes/${f.id}/index.html`,
    page({
      title: `${f.title} - 맞혀봐`,
      desc: `${f.desc}. ${list.slice(0, 6).map((q) => q.title).join(', ')} 등`,
      url: `${SITE}/quizzes/${f.id}/`,
      image: ogFile('home'),
      noindex: list.length < 2, // 퀴즈가 하나뿐인 목록은 검색에서 뺌
      body: `<h1>${esc(f.title)}</h1><p>${esc(f.desc)}</p><p>${esc(f.about)}</p><ul>${list.map((q) => `<li><a href="/q/${q.id}/">${esc(q.title)}</a> - ${esc(q.desc)}</li>`).join('')}</ul>`,
    })
  );
  if (list.length >= 2) urls.push(`/quizzes/${f.id}/`);
}

// 게임
write(
  'games/index.html',
  page({
    title: '뽑기 게임 - 맞혀봐',
    desc: '구슬 추첨, 경주마, 사다리 타기, 돌림판. 모일 때 공정하게 정하는 뽑기 게임',
    url: `${SITE}/games/`,
    image: ogFile('games'),
    body: `<h1>뽑기 게임</h1><p>순서·당번·벌칙을 공정하게 정하는 뽑기 게임과, 휴대폰 하나로 여럿이 즐기는 파티 게임, 혼자 기록에 도전하는 게임을 모았어요. 설치나 회원가입 없이 바로 쓸 수 있고, 입력한 이름과 설정은 내 기기에만 저장돼요. <a href="/guide/fair-picks/">사다리 타기는 정말 공평할까?</a> 같은 글도 함께 읽어 보세요.</p><ul>${GAMES.map((g) => `<li><a href="/game/${g.id}/">${esc(g.title)}</a> - ${esc(g.desc)}</li>`).join('')}</ul>`,
  })
);
urls.push('/games/');
for (const g of GAMES) {
  write(
    `game/${g.id}/index.html`,
    page({
      title: `${g.title} - 맞혀봐`,
      desc: `${g.desc}. 이름만 넣으면 바로 시작하는 무료 뽑기 게임`,
      url: `${SITE}/game/${g.id}/`,
      image: ogFile('game-' + g.id),
      body: `<h1>${esc(g.title)}</h1><p>${esc(g.desc)}</p>${gameAboutHtml(g)}`,
    })
  );
  urls.push(`/game/${g.id}/`);
}

// 운세 탭 (/fortune/, 띠·별자리별 /fortune/<id>/, /saju/, /tarot/, /lotto/) — 운세 문장은 날마다 화면에서 만들고, 검색엔진용으론 설명을 글로 넣음
const FT = ctx.FT;
write(
  'fortune/index.html',
  page({
    title: '오늘의 운세 - 띠별 운세·별자리 운세·사주·타로 무료 | 맞혀봐',
    desc: '오늘의 띠별 운세와 별자리 운세를 총운·금전·애정·건강으로 확인하세요. 생년월일로 보는 무료 사주팔자, 타로 카드 뽑기, 로또 번호 생성기까지.',
    url: `${SITE}/fortune/`,
    image: ogFile('fortune'),
    body: `<h1>오늘의 운세</h1><h2>띠별 오늘의 운세</h2><ul>${FT.ANIMALS.map((a) => `<li><a href="/fortune/${a.id}/">${a.name}띠 오늘의 운세</a> - ${esc(a.trait)}</li>`).join('')}</ul><h2>별자리 운세</h2><ul>${FT.SIGNS.map((s) => `<li><a href="/fortune/${s.id}/">${s.name} 오늘의 운세</a> (${FT.signRange(s)})</li>`).join('')}</ul><p><a href="/saju/">무료 사주팔자 보기</a> · <a href="/tarot/">타로 카드 뽑기</a> · <a href="/lotto/">로또 번호 생성기</a></p>`,
  })
);
urls.push('/fortune/');
for (const a of FT.ANIMALS) {
  const years = FT.animalYears(a).filter((y) => y >= 1948 && y <= 2020);
  write(
    `fortune/${a.id}/index.html`,
    page({
      title: `${a.name}띠 오늘의 운세 - ${years.slice(-4).map((y) => String(y).slice(2) + '년생').join('·')} 무료 띠 운세 | 맞혀봐`,
      desc: `${a.name}띠(${years.join('·')}년생) 오늘의 운세. 총운·금전운·애정운·일·건강운과 나이별 한 줄 운세, 행운의 색·숫자를 매일 확인하세요.`,
      url: `${SITE}/fortune/${a.id}/`,
      image: ogFile('fortune'),
      noindex: true, // 설명은 보강했지만 운세 문장이 자동 생성이라 애드센스 승인 전까진 검색에서 뺌
      body: `<h1>${a.name}띠 오늘의 운세</h1><p>총운·금전운·애정운·일·공부운·건강운을 별점과 함께 보여 주고, 나이별 한 줄 운세와 행운의 색·숫자·방향·물건도 알려 드려요. 운세는 매일 자정에 바뀌어요.</p>${FT.animalAboutHtml(a)}<p><a href="/fortune/">다른 띠 운세 보기</a></p>`,
    })
  );

}
for (const s of FT.SIGNS) {
  write(
    `fortune/${s.id}/index.html`,
    page({
      title: `${s.name} 오늘의 운세 (${FT.signRange(s)}) - 무료 별자리 운세 | 맞혀봐`,
      desc: `${s.name}(${FT.signRange(s)}) 오늘의 별자리 운세. 총운·금전·애정·일·건강운과 행운의 색·숫자를 매일 확인하세요.`,
      url: `${SITE}/fortune/${s.id}/`,
      image: ogFile('fortune'),
      noindex: true, // 설명은 보강했지만 운세 문장이 자동 생성이라 애드센스 승인 전까진 검색에서 뺌
      body: `<h1>${s.name} 오늘의 운세</h1>${FT.signAboutHtml(s)}<p><a href="/fortune/">다른 별자리 운세 보기</a></p>`,
    })
  );

}
write(
  'saju/index.html',
  page({
    title: '무료 사주팔자 보기 - 생년월일시로 보는 내 사주·오행 | 맞혀봐',
    desc: '생년월일과 태어난 시간을 넣으면 사주팔자 여덟 글자와 오행 균형, 타고난 성향, 오늘의 기운을 무료로 알려 드려요. 입력한 정보는 저장·전송하지 않아요.',
    url: `${SITE}/saju/`,
    image: ogFile('fortune'),
    body: `<h1>무료 사주팔자 보기</h1>${FT.SAJU_ABOUT}`,
  })
);
urls.push('/saju/');
write(
  'tarot/index.html',
  page({
    title: '무료 타로 카드 뽑기 - 오늘의 타로·과거 현재 미래 | 맞혀봐',
    desc: '질문을 떠올리고 타로 카드를 뽑아 보세요. 오늘의 타로 한 장, 과거·현재·미래 세 장 뽑기로 메이저 아르카나 22장의 정방향·역방향 풀이를 무료로 알려 드려요.',
    url: `${SITE}/tarot/`,
    image: ogFile('fortune'),
    body: `<h1>무료 타로 카드 뽑기</h1><ul>${FT.TAROT.map((c) => `<li>${c[0]} (${c[1]}) - 정방향: ${c[3]}. ${c[4]} 역방향: ${c[5]}. ${c[6]}</li>`).join('')}</ul>`,
  })
);
urls.push('/tarot/');
write(
  'lotto/index.html',
  page({
    title: '로또 번호 생성기 - 무료 자동 번호 + 실제 당첨 확률 분석 | 맞혀봐',
    desc: '로또 6/45 번호를 무작위로 뽑고, 1등 814만 5,060분의 1 등 등수별 실제 당첨 확률과 그 번호로 100년 동안 샀을 때 결과를 모의실험해 드려요.',
    url: `${SITE}/lotto/`,
    noAds: true, // 복권 관련 페이지는 광고 정책상 애매하니 광고를 붙이지 않음
    image: ogFile('fortune'),
    body: `<h1>로또 번호 생성기와 당첨 확률</h1><ul>${FT.LOTTO_RANKS.map((r) => `<li>${r.label} (${r.rule}): ${Math.round(FT.LOTTO_TOTAL / r.ways).toLocaleString('ko-KR')}분의 1</li>`).join('')}</ul>${FT.LOTTO_ABOUT}`,
  })
);
urls.push('/lotto/');

// 랭킹 탭 (/rankings/) · 순위표마다 한 페이지 (/ranking/<id>/) — 검색엔진용으로 전체 순위와 링크를 글로 넣어 둠
write(
  'rankings/index.html',
  page({
    title: `랭킹 · 1위를 맞혀 보세요 - 맞혀봐`,
    desc: `사이트·앱, 판매·흥행, 우승 횟수, 세계·자연, 가장 빠른 것까지 여러 랭킹. 2·3위를 보고 1위를 맞혀 보세요`,
    url: `${SITE}/rankings/`,
    image: ogFile('rank-web'),
    body: `<h1>랭킹</h1>${RANK_GROUPS.map((g) => `<h2>${esc(g.title)}</h2><ul>${RANKINGS.filter((b) => b.group === g.id).map((b) => `<li><a href="/ranking/${b.id}/">${esc(b.title)}</a></li>`).join('')}</ul>`).join('')}`,
  })
);
urls.push('/rankings/');
// 검색어가 '치킨 판매량 순위'·'롤드컵 우승 횟수'처럼 들어와서 제목에 '순위 TOP n'을 넣고, 설명에 값까지 보여 줌
const rankTitle = ctx.RT; // ranking.js rankSeoTitle (화면 제목과 같은 규칙)
// 직접 쓴 배경 설명(ranking.js RANK_NOTES)이 있는 랭킹만 색인·광고 대상. 나머지는 화면엔 그대로 있고 검색·광고에서만 뺌
// tools/rank_keep.json = 검색 노출이 있었던 랭킹 목록 (애드센스 승인 뒤 설명을 쓰고 다시 넣을 후보)
for (const b of RANKINGS) {
  const keep = !!ctx.RN[b.id];
  write(
    `ranking/${b.id}/index.html`,
    page({
      title: `${rankTitle(b)} - 1위는? | 맞혀봐`,
      desc: `${b.items.slice(1, 5).map((it, k) => `${k + 2}위 ${it[0]}${it[1] ? `(${it[1]})` : ''}`).join(' · ')}… 그럼 1위는? ${b.q}`,
      url: `${SITE}/ranking/${b.id}/`,
      image: ogFile('rank-' + b.group),
      noindex: !keep,
      noAds: !keep,
      body: `<h1>${esc(rankTitle(b))}</h1><p>${esc(b.q)}</p><ol>${b.items.map((it) => `<li><a href="${esc(it[2] || rankLink(it[0], b))}" rel="noopener">${esc(it[0])}</a>${it[1] ? ` (${esc(it[1])})` : ''}</li>`).join('')}</ol>${ctx.RI(b)}<p><a href="/rankings/">다른 랭킹 보기</a></p>`,
    })
  );
  if (keep) urls.push(`/ranking/${b.id}/`);
}

// 사이트맵 · robots
const today = new Date().toISOString().slice(0, 10);
urls.push('/about.html', '/terms.html', '/privacy.html'); // 사진 출처(credits)는 목록을 화면에서 불러오는 페이지라 검색에서 뺌

// 공부용 정리 페이지 (/study/)
buildStudy({ read, write, esc, SITE, QUIZZES, QUESTIONS: ctx.QS, STUDY_PAGES: ctx.SP, urls });
buildArticles({ read, write, esc, SITE, urls });
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
);
// RSS (네이버 서치어드바이저에 제출) — 퀴즈·게임·랭킹 페이지 목록
const rssItems = [
  ...QUIZZES.map((q) => ({ t: `${q.title}`, d: q.desc, u: `${SITE}/q/${q.id}/` })),
  ...GAMES.map((g) => ({ t: `${g.title} - 뽑기 게임`, d: g.desc, u: `${SITE}/game/${g.id}/` })),
];
const xesc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
write(
  'rss.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>맞혀봐</title><link>${SITE}/</link><description>직접 써서 맞히는 주관식 퀴즈, 뽑기 게임, 1위 맞히기 랭킹</description><language>ko</language>\n${rssItems
    .map((it) => `<item><title>${xesc(it.t)}</title><link>${it.u}</link><guid>${it.u}</guid><description>${xesc(it.d)}</description></item>`)
    .join('\n')}\n</channel></rss>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /tools/\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`페이지 ${urls.length}개 만듦 (퀴즈 ${QUIZZES.length}, 게임 ${GAMES.length}, 랭킹 ${RANKINGS.length}) + 404.html, sitemap.xml, robots.txt`);
