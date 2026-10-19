// 문제 데이터 검사: 문법, 개수, 정답 중복, 자기 채점(정답·alias가 정답 처리되는지), 초성 문제 정답이 한글인지.
// 사용: ~/.local/node-v22.11.0-darwin-arm64/bin/node tools/check_data.js [퀴즈id ...]   (생략하면 data/ 전체)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'data');
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_')).map((f) => f.slice(0, -3));

const normalize = (s) => String(s ?? '').normalize('NFC').toLowerCase().replace(/[^0-9a-z가-힣ㄱ-ㅎ]/g, '');

let bad = 0;
for (const id of ids) {
  const ctx = {};
  vm.createContext(ctx);
  try {
    vm.runInContext(
      fs.readFileSync(path.join(dir, '_init.js'), 'utf8') + '\n' + fs.readFileSync(path.join(dir, id + '.js'), 'utf8') + '\n;this.Q = QUESTIONS;',
      ctx
    );
  } catch (e) {
    console.log(`✗ ${id}: 문법 오류 — ${e.message}`);
    bad++;
    continue;
  }
  const qs = ctx.Q[id];
  if (!Array.isArray(qs)) {
    console.log(`✗ ${id}: QUESTIONS['${id}'] 배열이 없음`);
    bad++;
    continue;
  }
  const problems = [];
  const seen = new Map();
  qs.forEach((q, i) => {
    if (!q.answer) problems.push(`#${i + 1} 정답 없음`);
    const key = normalize(q.answer);
    if (seen.has(key)) problems.push(`#${i + 1} 정답 중복: ${q.answer} (#${seen.get(key) + 1})`);
    seen.set(key, i);
    if (q.chosung && !/^[가-힣\s]+$/.test(q.answer)) problems.push(`#${i + 1} 초성 문제인데 정답에 한글 외 글자: ${q.answer}`);
    if (!q.image && !q.big && !q.text && !q.chosung) problems.push(`#${i + 1} 보여줄 내용 없음: ${q.answer}`);
    for (const a of q.alias || []) if (!normalize(a)) problems.push(`#${i + 1} 빈 alias`);
    if (q.image && q.image.includes('wikimedia') && !q.credit && !q.by) problems.push(`#${i + 1} 위키미디어 사진인데 credit 없음 (퍼블릭 도메인이면 무시): ${q.answer}`);
  });
  console.log(`${problems.length ? '!' : '✓'} ${id}: ${qs.length}문제${problems.length ? '\n   ' + problems.join('\n   ') : ''}`);
  if (problems.length) bad++;
}
process.exitCode = bad ? 1 : 0;
