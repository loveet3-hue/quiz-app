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
vm.runInContext(scripts.map((f) => read(f)).join('\n;\n') + '\n;this.Q = QUIZZES; this.QF = QUIZ_FORMATS; this.G = GAMES; this.R = RANKINGS; this.RG = RANK_GROUPS; this.RL = rankLink; this.QA = quizAboutHtml; this.GA = gameAboutHtml;', ctx);
const QUIZZES = ctx.Q;
const GAMES = ctx.G;
const QUIZ_FORMATS = ctx.QF;
const RANKINGS = ctx.R;
const RANK_GROUPS = ctx.RG;
const rankLink = ctx.RL;
const quizAboutHtml = ctx.QA; // 화면 아래 소개 글과 같은 내용 (guides.js)
const gameAboutHtml = ctx.GA;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function meta({ title, desc, url, image, ld }) {
  return `<!--META-->
  <title>${esc(title)}</title>
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

function page({ title, desc, url, image, body, noAds, ld }) {
  // 광고 없는 퀴즈(실존 인물 사진)는 애드센스 스크립트를 빼고 계정 확인용 meta만 남김
  const t = noAds ? tpl.replace(/<script async id="adsense-js"[^>]*><\/script>\n\s*/, '') : tpl;
  return t
    .replace(/<!--META-->[\s\S]*?<!--\/META-->/, meta({ title, desc, url, image, ld }))
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
const homeBody = `<h1>맞혀봐 - 직접 써서 맞히는 퀴즈</h1><p>맞혀봐는 사진·초성·설명·멜로디를 보고 정답을 직접 써서 맞히는 주관식 퀴즈 사이트예요. 상식, 지리, 언어, 영화·음악, 동물·자연 등 50가지가 넘는 주제에 수천 개의 문제가 있고, 모임에서 쓰는 뽑기·파티 게임과 1위를 맞히는 랭킹 퀴즈도 있어요.</p><ul>${QUIZZES.map((q) => `<li><a href="/q/${q.id}/">${esc(q.title)}</a> - ${esc(q.desc)}</li>`).join('')}</ul><p><a href="/games/">뽑기 게임</a> · <a href="/about.html">소개</a> · <a href="/privacy.html">개인정보 처리방침</a></p>`;
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
      body: `<h1>${esc(f.title)}</h1><p>${esc(f.desc)}</p><ul>${list.map((q) => `<li><a href="/q/${q.id}/">${esc(q.title)}</a> - ${esc(q.desc)}</li>`).join('')}</ul>`,
    })
  );
  urls.push(`/quizzes/${f.id}/`);
}

// 게임
write(
  'games/index.html',
  page({
    title: '뽑기 게임 - 맞혀봐',
    desc: '구슬 추첨, 경주마, 사다리 타기, 돌림판. 모일 때 공정하게 정하는 뽑기 게임',
    url: `${SITE}/games/`,
    image: ogFile('games'),
    body: `<h1>뽑기 게임</h1><ul>${GAMES.map((g) => `<li><a href="/game/${g.id}/">${esc(g.title)}</a> - ${esc(g.desc)}</li>`).join('')}</ul>`,
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
for (const b of RANKINGS) {
  write(
    `ranking/${b.id}/index.html`,
    page({
      title: `${b.title} 1위는? - 맞혀봐 랭킹`,
      desc: `${b.items.slice(1, 4).map((it, k) => `${k + 2}위 ${it[0]}`).join(', ')}… 그럼 1위는? ${b.q}`,
      url: `${SITE}/ranking/${b.id}/`,
      image: ogFile('rank-' + b.group),
      body: `<h1>${esc(b.title)}</h1><p>${esc(b.q)}</p><ol>${b.items.map((it) => `<li><a href="${esc(it[2] || rankLink(it[0], b))}" rel="noopener">${esc(it[0])}</a>${it[1] ? ` (${esc(it[1])})` : ''}</li>`).join('')}</ol><p><a href="/rankings/">다른 랭킹 보기</a></p>`,
    })
  );
  urls.push(`/ranking/${b.id}/`);
}

// 사이트맵 · robots
const today = new Date().toISOString().slice(0, 10);
urls.push('/about.html', '/privacy.html', '/credits.html');
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
  ...RANKINGS.map((b) => ({ t: `${b.title} 1위는?`, d: b.q, u: `${SITE}/ranking/${b.id}/` })),
];
const xesc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
write(
  'rss.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>맞혀봐</title><link>${SITE}/</link><description>직접 써서 맞히는 주관식 퀴즈, 뽑기 게임, 1위 맞히기 랭킹</description><language>ko</language>\n${rssItems
    .map((it) => `<item><title>${xesc(it.t)}</title><link>${it.u}</link><guid>${it.u}</guid><description>${xesc(it.d)}</description></item>`)
    .join('\n')}\n</channel></rss>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /tools/\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`페이지 ${urls.length}개 만듦 (퀴즈 ${QUIZZES.length}, 게임 ${GAMES.length}, 랭킹 ${RANKINGS.length}) + 404.html, sitemap.xml, robots.txt`);
