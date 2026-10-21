// 기념일·공휴일 로고: 그날이 되면 상단 로고에 소품(경찰 모자, 산타 모자 …)을 씌운다. (기념일 이름은 로고에 마우스를 올렸을 때만)
// 소품은 로고와 같은 100×100 판 위에 그림 (위로 삐져나가도 됨). 시험: 주소 뒤에 ?logo=10-21 처럼 붙이면 그날 로고로 보임.
'use strict';

(() => {
  if (typeof document === 'undefined') return; // 페이지 만들기 도구(node)에서 불릴 때는 건너뜀
  // 소품 그림 (로고 좌표 0~100, 모자는 y<0 으로 올라가도 됨)
  const PARTS = {
    police: `<path d="M6 20 Q50 -26 94 20 L88 30 H12 Z" fill="#1f3a6e"/><rect x="12" y="24" width="76" height="8" fill="#e8b923"/><path d="M14 31 H86 Q84 44 50 44 Q16 44 14 31 Z" fill="#111827"/><path d="M50 4 l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffd93d" stroke="#b8860b" stroke-width="1.5"/>`,
    fire: `<path d="M8 30 Q10 -14 50 -14 Q90 -14 92 30 Z" fill="#e0312b"/><path d="M2 30 H98 Q98 38 50 38 Q2 38 2 30 Z" fill="#b71c1c"/><path d="M50 -14 V30" stroke="#ffd93d" stroke-width="5"/><circle cx="50" cy="12" r="9" fill="#ffd93d"/><path d="M50 6 l2.5 5 5.5.8-4 3.8 1 5.4-5-2.6-5 2.6 1-5.4-4-3.8 5.5-.8z" fill="#e0312b"/>`,
    army: `<path d="M8 28 Q10 -16 50 -16 Q90 -16 92 28 Z" fill="#4b5d3a"/><path d="M4 28 H96 Q96 36 50 36 Q4 36 4 28 Z" fill="#3a4a2c"/><path d="M24 2 q10 6 18 0 M58 -6 q8 6 16 2 M30 16 q12 4 20 -2 M60 14 q8 4 16 0" stroke="#6b7f4f" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    santa: `<path d="M8 26 Q18 -22 60 -22 Q90 -20 100 14 L86 18 Q80 4 72 6 L92 26 Z" fill="#e0312b"/><path d="M30 -8 Q46 -16 62 -14" stroke="#ff6b6b" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="2" y="20" width="92" height="15" rx="7.5" fill="#fff"/><circle cx="100" cy="16" r="10" fill="#fff"/>`,
    party: `<path d="M50 -34 L72 20 H28 Z" fill="#7c5cff"/><path d="M42 -14 L58 -14 M36 2 L64 2" stroke="#ffd93d" stroke-width="5"/><circle cx="50" cy="-34" r="7" fill="#ff6b9a"/><path d="M14 0 l4 -8 M86 -2 l6 -6 M20 -18 l-6 -4 M84 -20 l6 -4" stroke="#ffd93d" stroke-width="4" stroke-linecap="round"/>`,
    flag: `<line x1="86" y1="-30" x2="86" y2="28" stroke="#6b5b3e" stroke-width="4" stroke-linecap="round"/><rect x="40" y="-28" width="46" height="31" fill="#fff" stroke="#ccc" stroke-width="1.5"/><path d="M63 -12.5 m-8 0 a8 8 0 0 1 16 0 a4 4 0 0 1 -8 0 a4 4 0 0 0 -8 0 z" fill="#cd2e3a"/><path d="M55 -12.5 a8 8 0 0 0 16 0 a4 4 0 0 0 -8 0 a4 4 0 0 1 -8 0 z" fill="#0047a0"/><g stroke="#000" stroke-width="2"><path d="M44 -24 l5 4 M45 -26 l5 4 M46 -28 l5 4"/><path d="M76 -6 l5 4 M75 -4 l5 4 M74 -2 l5 4"/><path d="M76 -19 l5 -4 M75 -21 l5 -4 M74 -23 l5 -4"/><path d="M44 -1 l5 -4 M45 1 l5 -4 M46 3 l5 -4"/></g>`,
    flower: `<path d="M18 30 Q22 10 20 -4" stroke="#4a8a3a" stroke-width="4" fill="none"/>${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="20" cy="-10" rx="6" ry="11" transform="rotate(${a} 20 -6)" fill="#fff" stroke="#d8d8d8" stroke-width="1"/>`).join('')}<circle cx="20" cy="-6" r="5" fill="#ffd93d"/>`,
    gat: `<ellipse cx="50" cy="20" rx="52" ry="9" fill="#1d1b26" opacity=".92"/><path d="M30 20 V-8 Q30 -16 50 -16 Q70 -16 70 -8 V20 Z" fill="#1d1b26"/><rect x="30" y="10" width="40" height="5" fill="#3a3550"/><path d="M28 22 Q26 60 20 84 M72 22 Q74 60 80 84" stroke="#1d1b26" stroke-width="2" fill="none" stroke-dasharray="3 3"/>`,
    bokjumeoni: `<path d="M74 66 Q66 100 86 104 Q106 100 98 66 Z" fill="#e0312b" stroke="#a51a14" stroke-width="2"/><path d="M76 66 Q86 58 96 66" fill="none" stroke="#ffd93d" stroke-width="4"/><circle cx="86" cy="64" r="4" fill="#ffd93d"/><text x="86" y="92" font-size="14" font-weight="900" fill="#ffd93d" text-anchor="middle" font-family="sans-serif">福</text>`,
    rabbit: `<path d="M26 22 Q14 -26 30 -30 Q42 -30 40 20 Z" fill="#fff" stroke="#e4dff0" stroke-width="2"/><path d="M28 18 Q22 -18 30 -22 Q36 -22 35 18 Z" fill="#ffb3c7"/><path d="M60 20 Q58 -30 70 -30 Q86 -26 74 22 Z" fill="#fff" stroke="#e4dff0" stroke-width="2"/><path d="M65 18 Q64 -22 70 -22 Q78 -18 72 18 Z" fill="#ffb3c7"/><circle cx="98" cy="-14" r="13" fill="#ffe08a"/>`,
    pinwheel: `<line x1="90" y1="-4" x2="90" y2="40" stroke="#8a6a3f" stroke-width="4" stroke-linecap="round"/><g transform="translate(90 -4)"><path d="M0 0 L0 -20 L14 -8 Z" fill="#ff6b6b"/><path d="M0 0 L20 0 L8 14 Z" fill="#4f8cff"/><path d="M0 0 L0 20 L-14 8 Z" fill="#ffd93d"/><path d="M0 0 L-20 0 L-8 -14 Z" fill="#4fd18b"/><circle r="3" fill="#fff"/></g>`,
    carnation: `<path d="M16 34 Q20 14 18 -2" stroke="#3f8a3a" stroke-width="4" fill="none"/><path d="M18 14 q-10 -2 -12 6 q8 2 12 -6" fill="#4fae4a"/><path d="M4 -6 q4 -14 14 -8 q6 -12 16 -2 q10 0 6 12 q-4 6 -18 6 q-14 0 -18 -8z" fill="#e0314b"/><path d="M8 -4 q8 -6 10 2 q4 -8 12 -2" stroke="#ff8aa0" stroke-width="2.5" fill="none"/>`,
    lantern: `<line x1="84" y1="-36" x2="84" y2="-16" stroke="#8a6a3f" stroke-width="2.5"/><path d="M70 -16 Q84 -26 98 -16 Q104 0 84 10 Q64 0 70 -16 Z" fill="#ff8aa0"/><path d="M74 -12 Q84 -20 94 -12 M72 -2 Q84 -10 96 -2" stroke="#e0314b" stroke-width="2" fill="none"/><path d="M84 10 v8" stroke="#ffd93d" stroke-width="3"/>`,
    sprout: `<path d="M50 22 V-6" stroke="#3f8a3a" stroke-width="5" stroke-linecap="round"/><path d="M50 2 Q30 4 26 -14 Q46 -16 50 2 Z" fill="#5cc35a"/><path d="M50 -6 Q70 -6 76 -24 Q54 -26 50 -6 Z" fill="#7ad98f"/>`,
    hearts: `<path d="M18 -6 c-6 -10 -20 -2 -12 8 l12 12 l12 -12 c8 -10 -6 -18 -12 -8z" fill="#ff5a7a"/><path d="M86 -18 c-4 -7 -14 -1 -8 6 l8 8 l8 -8 c6 -7 -4 -13 -8 -6z" fill="#ff8aa0"/>`,
    candy: `<line x1="88" y1="-2" x2="88" y2="40" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="88" cy="-12" r="14" fill="#ff8aa0"/><path d="M88 -12 m0 -9 a9 9 0 1 1 -9 9 a6 6 0 1 1 6 -6 a3 3 0 1 1 -3 3" fill="none" stroke="#fff" stroke-width="3"/>`,
    pepero: `${[[70, -26, -14], [80, -30, -4], [90, -26, 8]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} 10)"><rect x="${x - 3}" y="${y}" width="6" height="40" rx="3" fill="#e8c38a"/><rect x="${x - 3.5}" y="${y}" width="7" height="26" rx="3.5" fill="#5a3a22"/></g>`).join('')}`,
    witch: `<path d="M2 26 Q50 12 98 26 Q50 36 2 26 Z" fill="#2d1b4e"/><path d="M24 24 L50 -36 Q58 -30 66 -26 L74 24 Z" fill="#3b2566"/><rect x="26" y="14" width="48" height="8" fill="#ff9f1c"/><circle cx="90" cy="-10" r="12" fill="#ff9f1c"/><path d="M90 -22 v-4" stroke="#3f8a3a" stroke-width="3"/>`,
    birthday: `<rect x="22" y="-6" width="56" height="26" rx="5" fill="#ffe0ea"/><path d="M22 2 q7 6 14 0 t14 0 t14 0 t14 0" fill="none" stroke="#ff8aa0" stroke-width="5"/><rect x="18" y="16" width="64" height="8" rx="4" fill="#fff"/>${[34, 50, 66].map((x, i) => `<rect x="${x - 2.5}" y="-22" width="5" height="16" rx="2" fill="${['#4f8cff', '#ffd93d', '#4fd18b'][i]}"/><path d="M${x} -32 q5 6 0 10 q-5 -4 0 -10z" fill="#ff9f1c"/>`).join('')}`,
    suneung: `<path d="M2 18 Q50 4 98 18 L98 32 Q50 18 2 32 Z" fill="#fff" stroke="#e0312b" stroke-width="2.5"/><text x="50" y="26" font-size="15" font-weight="900" fill="#e0312b" text-anchor="middle" font-family="sans-serif">필승</text><circle cx="18" cy="24" r="4" fill="#e0312b"/><circle cx="82" cy="24" r="4" fill="#e0312b"/><path d="M98 24 l10 8 l-4 10 M98 26 l12 0 l2 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    sailor: `<path d="M6 24 Q50 4 94 24 L90 32 Q50 18 10 32 Z" fill="#1f3a6e"/><path d="M14 22 Q14 -10 50 -12 Q86 -10 86 22 Q50 10 14 22 Z" fill="#fff" stroke="#d8deea" stroke-width="2"/><path d="M42 4 q8 -6 16 0 M40 10 l4 -4 M60 10 l-4 -4" stroke="#1f3a6e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 -2 v12 M44 6 q6 6 12 0" stroke="#1f3a6e" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    cat: `<path d="M8 26 L14 -18 L40 12 Z" fill="#ffad5a" stroke="#e8893a" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 14 L18 -6 L31 10 Z" fill="#ffc9d6"/><path d="M92 26 L86 -18 L60 12 Z" fill="#ffad5a" stroke="#e8893a" stroke-width="2.5" stroke-linejoin="round"/><path d="M84 14 L82 -6 L69 10 Z" fill="#ffc9d6"/><g stroke="#5a3a22" stroke-width="2.5" stroke-linecap="round"><path d="M2 62 l16 2 M2 70 l16 -1 M98 62 l-16 2 M98 70 l-16 -1"/></g>`,
    dog: `<path d="M10 6 Q-12 10 -6 50 Q-2 70 12 60 Q20 40 22 18 Z" fill="#a0673c"/><path d="M90 6 Q112 10 106 50 Q102 70 88 60 Q80 40 78 18 Z" fill="#a0673c"/><ellipse cx="50" cy="90" rx="9" ry="6" fill="#2d1b10"/><path d="M50 96 v6 q8 6 12 -2" stroke="#ff7a90" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    earth: `<circle cx="84" cy="-12" r="18" fill="#4f8cff"/><path d="M72 -20 q6 -4 10 2 t8 6 q-4 8 -10 4 t-8 -12z M90 -2 q4 -2 8 2 q-2 6 -8 4z M76 -28 q6 -2 8 2" fill="#5cc35a"/><circle cx="84" cy="-12" r="18" fill="none" stroke="#2a5bd7" stroke-width="2"/>`,
    groucho: `<circle cx="32" cy="46" r="14" fill="rgba(255,255,255,.25)" stroke="#1d1b26" stroke-width="5"/><circle cx="66" cy="46" r="14" fill="rgba(255,255,255,.25)" stroke="#1d1b26" stroke-width="5"/><path d="M46 44 h6" stroke="#1d1b26" stroke-width="5"/><path d="M18 34 q14 -10 26 0 M54 34 q14 -10 26 0" stroke="#1d1b26" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M49 52 q4 12 -2 16 q6 4 8 -2" fill="#ffc9a8" stroke="#c98a6a" stroke-width="2"/><path d="M30 74 q10 -8 19 -2 q9 -6 19 2 q-9 6 -19 0 q-10 6 -19 0z" fill="#1d1b26"/>`,
  };

  window.HOLIDAY_PARTS = PARTS; // 시험 화면(tools/)에서 소품을 크게 보려고

  // 날짜(MM-DD) → [소품, 이름, 이모지]. 음력 공휴일은 해마다 날짜를 적어 둠 (해가 바뀌면 추가할 것)
  const FIXED = {
    '01-01': ['party', '새해 첫날', '🎉'],
    '02-14': ['hearts', '밸런타인데이', '💝'],
    '03-01': ['flag', '삼일절', '🇰🇷'],
    '03-14': ['candy', '화이트데이', '🍭'],
    '04-01': ['groucho', '만우절', '🤡'],
    '04-22': ['earth', '지구의 날', '🌍'],
    '05-31': ['sailor', '바다의 날', '🌊'],
    '08-08': ['cat', '세계 고양이의 날', '🐱'],
    '08-26': ['dog', '세계 개의 날', '🐶'],
    '10-19': ['birthday', '맞혀봐 생일', '🎂'],
    '04-05': ['sprout', '식목일', '🌱'],
    '05-05': ['pinwheel', '어린이날', '🎈'],
    '05-08': ['carnation', '어버이날', '💐'],
    '05-15': ['carnation', '스승의 날', '💐'],
    '06-06': ['flower', '현충일', '🤍'],
    '08-15': ['flag', '광복절', '🇰🇷'],
    '10-01': ['army', '국군의 날', '🪖'],
    '10-03': ['flag', '개천절', '🇰🇷'],
    '10-09': ['gat', '한글날', '📜'],
    '10-21': ['police', '경찰의 날', '👮'],
    '10-31': ['witch', '핼러윈', '🎃'],
    '11-09': ['fire', '소방의 날', '🚒'],
    '11-11': ['pepero', '빼빼로데이', '🍫'],
    '12-24': ['santa', '크리스마스이브', '🎄'],
    '12-25': ['santa', '크리스마스', '🎄'],
    '12-31': ['party', '한 해 마지막 날', '🎉'],
  };
  const LUNAR = {
    // 설날 연휴(앞뒤 하루 포함) · 부처님오신날 · 추석 연휴
    '2026-02-16': ['bokjumeoni', '설날 연휴', '🧧'], '2026-02-17': ['bokjumeoni', '설날', '🧧'], '2026-02-18': ['bokjumeoni', '설날 연휴', '🧧'],
    '2026-05-24': ['lantern', '부처님오신날', '🏮'],
    '2026-11-19': ['suneung', '수능 날', '📝'], // 수능은 해마다 날짜가 정해짐 (11월 셋째 목요일 무렵)
    '2026-09-24': ['rabbit', '추석 연휴', '🌕'], '2026-09-25': ['rabbit', '추석', '🌕'], '2026-09-26': ['rabbit', '추석 연휴', '🌕'],
    '2027-02-06': ['bokjumeoni', '설날 연휴', '🧧'], '2027-02-07': ['bokjumeoni', '설날', '🧧'], '2027-02-08': ['bokjumeoni', '설날 연휴', '🧧'],
    '2027-05-13': ['lantern', '부처님오신날', '🏮'],
    '2027-09-14': ['rabbit', '추석 연휴', '🌕'], '2027-09-15': ['rabbit', '추석', '🌕'], '2027-09-16': ['rabbit', '추석 연휴', '🌕'],
    '2028-01-26': ['bokjumeoni', '설날 연휴', '🧧'], '2028-01-27': ['bokjumeoni', '설날', '🧧'], '2028-01-28': ['bokjumeoni', '설날 연휴', '🧧'],
    '2028-10-02': ['rabbit', '추석 연휴', '🌕'], '2028-10-03': ['rabbit', '추석', '🌕'], '2028-10-04': ['rabbit', '추석 연휴', '🌕'],
  };

  // 오늘 날짜 (한국 시간 기준). 시험용 ?logo=MM-DD 또는 YYYY-MM-DD
  let today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  try {
    const t = new URLSearchParams(location.search).get('logo');
    if (t && /^(\d{4}-)?\d{2}-\d{2}$/.test(t)) today = t.length === 5 ? `${today.slice(0, 4)}-${t}` : t;
  } catch (e) { /* 무시 */ }
  const day = LUNAR[today] || FIXED[today.slice(5)];
  if (!day) return;
  const [part, name, emoji] = day;

  const apply = () => {
    document.querySelectorAll('.logo').forEach((logo) => {
      if (logo.classList.contains('festive')) return;
      const img = logo.querySelector('img');
      if (!img) return;
      logo.classList.add('festive');
      logo.title = `오늘은 ${name}이에요`;
      logo.setAttribute('aria-label', `맞혀봐 홈 · 오늘은 ${name}`);
      const wrap = document.createElement('span');
      wrap.className = 'logo-mark';
      img.replaceWith(wrap);
      wrap.appendChild(img);
      wrap.insertAdjacentHTML('beforeend', `<svg class="logo-deco" viewBox="0 0 100 100" aria-hidden="true">${PARTS[part]}</svg>`);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
