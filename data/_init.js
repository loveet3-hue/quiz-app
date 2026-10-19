// 문제 데이터 공통 준비. data/ 폴더의 다른 파일보다 먼저 불러와야 한다.
// 각 data/<퀴즈id>.js 파일은 QUESTIONS['퀴즈id'] = [ ...문제 ] 모양으로 문제를 넣는다.

const QUESTIONS = {};
const FLAG = (code) => `https://flagcdn.com/w640/${code}.png`;
// 위키미디어 공용 파일 (퍼블릭 도메인/CC0, 또는 CC BY·BY-SA + credit 표시)
const WM = (file) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=640`;
const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
