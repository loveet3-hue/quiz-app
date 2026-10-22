// 오프라인에서도 열리도록 앱 파일을 저장해 두는 서비스 워커.
// 파일을 고치면 VERSION 숫자를 올려야 사용자 기기에 새 버전이 반영된다.
const VERSION = 'v79';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'games.js',
  'ranking.js',
  'data/rankings.js',
  'app.js',
  'config.js',
  'holiday.js',
  'covers.js',
  'data/_init.js',
  'data/flags.js',
  'data/flags-hard.js',
  'data/capitals.js',
  'data/idioms.js',
  'data/proverbs.js',
  'data/spelling.js',
  'data/antonyms.js',
  'data/nonsense.js',
  'data/slang.js',
  'data/english.js',
  'data/foods.js',
  'data/history.js',
  'data/celebs.js',
  'data/movies.js',
  'data/celeb-photos.js',
  'data/game-chars.js',
  'data/anime-chars.js',
  'data/mbti.js',
  'data/lol-champs.js',
  'data/melody.js',
  'data/songs.js',
  'data/char-colors.js',
  'data/plots.js',
  'data/movie-ratings.js',
  'data/dialect.js',
  'data/memes.js',
  'data/catchmind.js',
  'data/trivia-easy.js',
  'data/trivia.js',
  'data/trivia-hard.js',
  'data/life-trivia.js',
  'data/cities.js',
  'data/animals.js',
  'data/landmarks.js',
  'data/paintings.js',
  'data/space.js',
  'data/elements.js',
  'data/baby-animals.js',
  'data/cars.js',
  'data/vehicles.js',
  'data/dogs.js',
  'data/cats.js',
  'data/birds.js',
  'data/insects.js',
  'data/sea.js',
  'data/flowers.js',
  'data/fruits-veg.js',
  'data/food-photos.js',
  'data/instruments.js',
  'privacy.html',
  'about.html',
  'credits.html',
  'quizzes.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  // 파일 하나가 없어도 설치가 멈추지 않게 하나씩 저장
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.all(SHELL.map((f) => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 앱 파일은 네트워크 우선(새 버전 바로 반영), 실패하면 저장본.
// 그 밖의 파일(국기 이미지·글꼴)은 저장본 우선.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // no-cache: 브라우저 캐시의 옛 파일이 섞이지 않게 항상 서버에 새 버전인지 확인
    const fresh = e.request.mode === 'navigate' ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request, { cache: 'no-cache' });
    e.respondWith(
      fresh
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('/index.html') : undefined)))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copy));
          }
          return res;
        })
    )
  );
});
