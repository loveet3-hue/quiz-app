/**
 * 맞혀봐 참여 수 집계 서버 (Google Apps Script 웹 앱)
 *
 * - 퀴즈를 끝까지 푼 횟수를 퀴즈별로 센다. 개인정보는 받지도 저장하지도 않는다. (퀴즈 id만)
 * - 'Plays' 탭: quizId | count | updatedAt
 * - GET  ?action=counts            → { ok, counts: { 퀴즈id: 횟수 } }
 * - POST ?action=play&quiz=퀴즈id   → { ok }
 */

const SHEET = 'Plays';

function doGet(e) {
  try {
    const p = e.parameter || {};
    if (p.action === 'counts') return json_({ ok: true, counts: counts_() });
    return json_({ ok: true, service: 'quiz-count' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const p = e.parameter || {};
    if (p.action !== 'play') throw new Error('잘못된 요청');
    const id = String(p.quiz || '');
    if (!/^[\w-]{1,40}$/.test(id)) throw new Error('퀴즈 정보가 올바르지 않아요');
    add_(id);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function add_(id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const values = sh.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sh.getRange(i + 1, 2, 1, 2).setValues([[Number(values[i][1]) + 1, new Date()]]);
        CacheService.getScriptCache().remove('counts');
        return;
      }
    }
    if (values.length > 500) throw new Error('퀴즈가 너무 많아요'); // 이상한 id로 시트가 커지는 것 막기
    sh.appendRow([id, 1, new Date()]);
    CacheService.getScriptCache().remove('counts');
  } finally {
    lock.releaseLock();
  }
}

function counts_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('counts');
  if (hit) return JSON.parse(hit);
  const out = {};
  sheet_().getDataRange().getValues().slice(1).forEach((v) => { out[v[0]] = Number(v[1]) || 0; });
  cache.put('counts', JSON.stringify(out), 60);
  return out;
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.getRange(1, 1, 1, 3).setValues([['quizId', 'count', 'updatedAt']]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
