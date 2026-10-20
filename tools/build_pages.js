// 퀴즈·게임마다 실제 페이지 파일을 만든다 (# 없는 주소 + 카톡·검색 미리보기).
//   /q/<퀴즈>/index.html, /games/index.html, /game/<게임>/index.html, 404.html, sitemap.xml, robots.txt
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
vm.runInContext(scripts.map((f) => read(f)).join('\n;\n') + '\n;this.Q = QUIZZES; this.G = GAMES;', ctx);
const QUIZZES = ctx.Q;
const GAMES = ctx.G;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function meta({ title, desc, url, image }) {
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
  <meta name="twitter:card" content="summary_large_image">
  <!--/META-->`;
}

function page({ title, desc, url, image, body }) {
  return tpl
    .replace(/<!--META-->[\s\S]*?<!--\/META-->/, meta({ title, desc, url, image }))
    .replace(/<!--STATIC-->[\s\S]*?<!--\/STATIC-->/, `<!--STATIC-->${body}<!--/STATIC-->`);
}

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const ogFile = (name) => (fs.existsSync(path.join(ROOT, 'og', name + '.jpg')) ? `${SITE}/og/${name}.jpg` : `${SITE}/og/home.jpg`);
const urls = [];

// 홈 (검색엔진용으로 퀴즈 목록을 글로도 넣어 둠 — 화면은 앱이 다시 그림)
const homeBody = `<h1>맞혀봐 - 직접 써서 맞히는 퀴즈</h1><ul>${QUIZZES.map((q) => `<li><a href="/q/${q.id}/">${esc(q.title)}</a> - ${esc(q.desc)}</li>`).join('')}</ul><p><a href="/games/">뽑기 게임</a></p>`;
const homeHtml = page({
  title: '맞혀봐 - 직접 써서 맞히는 퀴즈',
  desc: `사진 보고, 초성 보고, 정답을 직접 입력하는 주관식 퀴즈 ${QUIZZES.length}가지와 뽑기 게임. 국기·명화·자동차·연예인·MBTI 등`,
  url: `${SITE}/`,
  image: ogFile('home'),
  body: homeBody,
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
      title: `${q.title} - 맞혀봐`,
      desc: `${q.desc} · ${n}, 정답을 직접 입력하는 주관식 퀴즈`,
      url: `${SITE}/q/${q.id}/`,
      image: ogFile(q.id),
      body: `<h1>${esc(q.title)}</h1><p>${esc(q.desc)} · ${n}</p><p><a href="/">다른 퀴즈 보기</a></p>`,
    })
  );
  urls.push(`/q/${q.id}/`);
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
      body: `<h1>${esc(g.title)}</h1><p>${esc(g.desc)}</p>`,
    })
  );
  urls.push(`/game/${g.id}/`);
}

// 사이트맵 · robots
const today = new Date().toISOString().slice(0, 10);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /tools/\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`페이지 ${urls.length}개 만듦 (퀴즈 ${QUIZZES.length}, 게임 ${GAMES.length}) + 404.html, sitemap.xml, robots.txt`);
