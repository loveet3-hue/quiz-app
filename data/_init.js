// 문제 데이터 공통 준비. data/ 폴더의 다른 파일보다 먼저 불러와야 한다.
// 각 data/<퀴즈id>.js 파일은 QUESTIONS['퀴즈id'] = [ ...문제 ] 모양으로 문제를 넣는다.

const QUESTIONS = {};
const FLAG = (code) => `https://flagcdn.com/w640/${code}.png`;
// 위키미디어 공용 파일 (퍼블릭 도메인/CC0, 또는 CC BY·BY-SA + credit 표시)
const WM = (file) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=640`;
const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
// 색 조합 그림: PALETTE(['#ffd400', ['#e3350d', 1], '#000']) → 가로 색 띠 그림 (숫자는 띠 굵기 비율, 기본 2)
const PALETTE = (colors) => {
  const list = colors.map((c) => (Array.isArray(c) ? c : [c, 2]));
  const total = list.reduce((s, [, w]) => s + w, 0);
  let x = 20;
  const bars = list
    .map(([c, w]) => {
      const bw = (360 * w) / total;
      const r = `<rect x="${x.toFixed(1)}" y="40" width="${bw.toFixed(1)}" height="220" fill="${c}"/>`;
      x += bw;
      return r;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f4f2fa"/><clipPath id="r"><rect x="20" y="40" width="360" height="220" rx="22"/></clipPath><g clip-path="url(#r)">${bars}</g><rect x="20" y="40" width="360" height="220" rx="22" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
// 순위표 그림: RANK('2024 국내 승용차 판매량', [['기아 쏘렌토', '9.4만 대'], '현대 그랜저', ...])
//   → 1위 칸은 '???'로 가리고, 2위부터 주어진 순서대로 보여줌 (최대 4개, 값은 선택)
const RANK = (title, rows) => {
  const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KO = "'Apple SD Gothic Neo','Noto Sans KR','Noto Sans CJK KR','Malgun Gothic',sans-serif";
  const list = [['???', ''], ...rows.slice(0, 4).map((r) => (Array.isArray(r) ? r : [r, '']))];
  const n = list.length;
  const top = 64;
  const h = Math.min(46, (290 - top) / n);
  const fs = (s, base) => (s.length > 16 ? base - 5 : s.length > 12 ? base - 3 : base);
  const medal = ['#f5b301', '#a7b0c0', '#cd8a4f', '#8f8aa3', '#8f8aa3'];
  const body = list
    .map(([name, val], i) => {
      const y = top + i * h;
      const first = i === 0;
      return `<rect x="18" y="${y}" width="364" height="${h - 8}" rx="12" fill="${first ? '#7c5cff' : '#ffffff'}" stroke="${first ? '#7c5cff' : '#e4e1ee'}" stroke-width="2"/>
        <circle cx="44" cy="${y + (h - 8) / 2}" r="15" fill="${first ? '#ffd93d' : medal[i]}"/>
        <text x="44" y="${y + (h - 8) / 2 + 5}" font-family="${KO}" font-size="14" font-weight="800" fill="${first ? '#5a3300' : '#fff'}" text-anchor="middle">${i + 1}위</text>
        <text x="70" y="${y + (h - 8) / 2 + 6}" font-family="${KO}" font-size="${first ? 22 : fs(name, 17)}" font-weight="800" fill="${first ? '#fff' : '#1d1b26'}">${x(name)}</text>
        ${val ? `<text x="366" y="${y + (h - 8) / 2 + 5}" font-family="${KO}" font-size="13" font-weight="600" fill="${first ? '#e9e3ff' : '#6b6680'}" text-anchor="end">${x(val)}</text>` : ''}`;
    })
    .join('');
  const tfs = title.length > 22 ? 16 : title.length > 17 ? 18 : 20;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" rx="0" fill="#f4f2fa"/>
    <text x="200" y="40" font-family="${KO}" font-size="${tfs}" font-weight="900" fill="#1d1b26" text-anchor="middle">🏆 ${x(title)}</text>${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
// 캐치마인드식 그림: SKETCH(['M10 10 L50 50', ['M…', '#e74c3c'], …]) → 선이 한 획씩 그려지는 그림 (400×300 판)
//   획마다 [경로, 색(선택), 굵기(선택)] · 순서대로 그려짐 · 전체 약 7초
const SKETCH = (strokes, total = 7) => {
  const list = strokes.map((s) => (Array.isArray(s) ? s : [s]));
  const n = list.length;
  const per = total / n;
  const paths = list
    .map(([d, color = '#2d3142', w = 6], i) =>
      `<path d="${d}" pathLength="1" stroke="${color}" stroke-width="${w}" style="animation-delay:${(i * per).toFixed(2)}s;animation-duration:${Math.max(per, 0.35).toFixed(2)}s"/>`
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><style>path{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation-name:d;animation-timing-function:ease-in-out;animation-fill-mode:forwards}@keyframes d{to{stroke-dashoffset:0}}</style><rect width="400" height="300" fill="#fffef8"/>${paths}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
