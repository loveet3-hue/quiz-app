/**
 * 맞혀봐 랭킹 서버 (Google Apps Script 웹 앱)
 *
 * - 기록은 이 스크립트에 연결된 스프레드시트의 'Records' 탭에 저장한다. (없으면 자동 생성)
 * - 퀴즈마다 이메일 한 개당 가장 좋은 기록 한 줄만 남긴다. (점수 높은 순 → 시간 짧은 순)
 * - 랭킹 조회에는 이메일을 가려서(lo***@g***.com) 돌려준다. 원래 이메일은 절대 밖으로 나가지 않는다.
 * - 등록일로부터 1년 지난 기록은 하루 한 번 자동 삭제한다. (개인정보 처리방침의 보유 기간)
 *
 * 배포: 배포 → 새 배포 → 유형 '웹 앱', 실행 사용자 '나', 액세스 '모든 사용자'.
 */

const SHEET = 'Records';
const HEAD = ['updatedAt', 'quizId', 'nickname', 'email', 'score', 'total', 'timeMs', 'createdAt'];
const KEEP_DAYS = 365;
const TOP_N = 50;

function doGet(e) {
  try {
    const p = e.parameter || {};
    if (p.action === 'top') return json_({ ok: true, rows: top_(String(p.quiz || '')) });
    return json_({ ok: true, service: 'quiz-rank' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const p = e.parameter || {};
    if (p.action !== 'submit') throw new Error('잘못된 요청');
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    return json_(submit_(body));
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

/* ───────── 등록 ───────── */

function submit_(b) {
  const quizId = String(b.quizId || '');
  const nickname = cleanNick_(b.nickname);
  const email = String(b.email || '').trim().toLowerCase();
  const score = Number(b.score);
  const total = Number(b.total);
  const timeMs = Math.round(Number(b.timeMs));

  if (b.agree !== true) throw new Error('개인정보 수집·이용 동의가 필요해요');
  if (!/^[\w-]{1,40}$/.test(quizId)) throw new Error('퀴즈 정보가 올바르지 않아요');
  if (nickname.length < 2 || nickname.length > 12) throw new Error('닉네임은 2~12자로 써 주세요');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) throw new Error('이메일 주소를 확인해 주세요');
  if (!Number.isInteger(total) || total < 1 || total > 30) throw new Error('기록이 올바르지 않아요');
  if (!Number.isInteger(score) || score < 0 || score > total) throw new Error('기록이 올바르지 않아요');
  if (!(timeMs >= total * 500 && timeMs <= 3600000)) throw new Error('기록이 올바르지 않아요');

  // 같은 이메일로 너무 자주 보내는 것 막기 (10초)
  const cache = CacheService.getScriptCache();
  const key = 'rl_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email));
  if (cache.get(key)) throw new Error('잠시 후 다시 시도해 주세요');
  cache.put(key, '1', 10);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    purgeOldDaily_();
    const sh = sheet_();
    const now = new Date();
    const values = sh.getDataRange().getValues();
    let row = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === quizId && values[i][3] === email) { row = i; break; }
    }
    let improved = true;
    if (row === -1) {
      sh.appendRow([now, quizId, nickname, email, score, total, timeMs, now]);
    } else {
      const old = values[row];
      improved = better_({ score, total, timeMs }, { score: old[4], total: old[5], timeMs: old[6] });
      const r = row + 1;
      if (improved) sh.getRange(r, 1, 1, 7).setValues([[now, quizId, nickname, email, score, total, timeMs]]);
      else sh.getRange(r, 3).setValue(nickname); // 닉네임만 최신으로
    }
    CacheService.getScriptCache().remove('top_' + quizId);
    const ranked = rankedRows_(quizId);
    const rank = ranked.findIndex((x) => x.email === email) + 1;
    return { ok: true, rank, count: ranked.length, improved };
  } finally {
    lock.releaseLock();
  }
}

// 점수 비율이 높을수록, 같으면 시간이 짧을수록 좋은 기록
function better_(a, b) {
  const ra = a.score / a.total, rb = b.score / b.total;
  if (ra !== rb) return ra > rb;
  return a.timeMs < b.timeMs;
}

function cleanNick_(s) {
  return String(s || '').replace(/[<>"'`\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim();
}

/* ───────── 조회 ───────── */

function rankedRows_(quizId) {
  const values = sheet_().getDataRange().getValues().slice(1);
  return values
    .filter((v) => v[1] === quizId)
    .map((v) => ({ nickname: String(v[2]), email: String(v[3]), score: Number(v[4]), total: Number(v[5]), timeMs: Number(v[6]) }))
    .sort((a, b) => (better_(a, b) ? -1 : better_(b, a) ? 1 : 0));
}

function top_(quizId) {
  if (!/^[\w-]{1,40}$/.test(quizId)) throw new Error('퀴즈 정보가 올바르지 않아요');
  const cache = CacheService.getScriptCache();
  const hit = cache.get('top_' + quizId);
  if (hit) return JSON.parse(hit);
  const rows = rankedRows_(quizId)
    .slice(0, TOP_N)
    .map((r, i) => ({ rank: i + 1, nickname: r.nickname, email: mask_(r.email), score: r.score, total: r.total, timeMs: r.timeMs }));
  cache.put('top_' + quizId, JSON.stringify(rows), 30);
  return rows;
}

// loveet3@gmail.com → lo***@g***.com
function mask_(email) {
  const at = email.indexOf('@');
  if (at < 1) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  const head = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  const dName = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : '';
  return `${head}***@${dName.slice(0, 1)}***${tld}`;
}

/* ───────── 보관 기간 지난 기록 삭제 ───────── */

function purgeOldDaily_() {
  const props = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  if (props.getProperty('LAST_PURGE') === today) return;
  purgeOld();
  props.setProperty('LAST_PURGE', today);
}

// 편집기에서 직접 실행해도 됨
function purgeOld() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  const limit = Date.now() - KEEP_DAYS * 86400000;
  for (let i = values.length - 1; i >= 1; i--) {
    const created = values[i][7] instanceof Date ? values[i][7].getTime() : new Date(values[i][7]).getTime();
    if (created && created < limit) sh.deleteRow(i + 1);
  }
}

// 삭제 요청이 오면 편집기에서 deleteByEmail('주소')로 실행
function deleteByEmail(email) {
  const target = String(email || '').trim().toLowerCase();
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  let n = 0;
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][3] === target) { sh.deleteRow(i + 1); n++; }
  }
  CacheService.getScriptCache().removeAll(values.slice(1).map((v) => 'top_' + v[1]));
  Logger.log(`${target}: ${n}건 삭제`);
}

/* ───────── 처음 한 번 ───────── */

// 배포 후 편집기에서 한 번 실행해 권한을 허용한다. (기록 탭도 이때 만들어짐)
function setup() {
  const sh = sheet_();
  Logger.log('준비 완료: ' + sh.getParent().getUrl());
}

/* ───────── 공통 ───────── */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange('C:D').setNumberFormat('@'); // 닉네임·이메일이 숫자/날짜로 바뀌지 않게
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
