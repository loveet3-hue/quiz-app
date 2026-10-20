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
