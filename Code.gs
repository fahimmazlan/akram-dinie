/**
 * Akram & Dinie — Ucapan (wishes) backend for Google Sheets
 * --------------------------------------------------------
 * 1. Paste this whole file into Extensions → Apps Script (replace everything).
 * 2. Project Settings (gear icon) → Script properties → Add:
 *      ADMIN_PIN = your secret PIN for the #pengantin page (e.g. 6 digits)
 * 3. Deploy → New deployment → type "Web app"
 *      Execute as: Me      Who has access: Anyone
 * 4. Copy the Web app URL (ends with /exec) into SHEET_API in index.html.
 *
 * Sheet columns: Masa | Nama | Ucapan | Kehadiran | Papar
 * To hide a wish from the public list, change its "Papar" cell from YA to TIDAK.
 */

const SHEET_NAME = 'Ucapan';
const ATTENDANCE = ['Hadir', 'Tidak hadir', 'Belum pasti'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Masa', 'Nama', 'Ucapan', 'Kehadiran', 'Papar']);
    sh.setFrozenRows(1);
    sh.getRange('A1:E1').setFontWeight('bold');
    sh.setColumnWidth(3, 420);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function rows_() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 5).getValues()
    .filter(r => r[1] || r[2])
    .map(r => ({
      time: r[0] instanceof Date ? r[0].getTime() : new Date(r[0]).getTime(),
      name: String(r[1]),
      message: String(r[2]),
      attendance: String(r[3]),
      show: String(r[4]).trim().toUpperCase() !== 'TIDAK'
    }));
}

// Stop spreadsheet formula injection (text starting with = + - @)
function clean_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// Public list: name + wish only (attendance stays private)
function doGet(e) {
  const list = rows_().filter(w => w.show).reverse().slice(0, 300)
    .map(w => ({ time: w.time, name: w.name, message: w.message }));
  return json_({ ok: true, wishes: list });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }

  if (d.action === 'admin') {
    const pin = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
    if (!pin || String(d.pin || '') !== pin) { Utilities.sleep(1000); return json_({ ok: false, error: 'pin' }); }
    const all = rows_().reverse();
    const counts = { 'Hadir': 0, 'Tidak hadir': 0, 'Belum pasti': 0, 'Tiada jawapan': 0 };
    all.forEach(w => { if (counts.hasOwnProperty(w.attendance) && w.attendance !== 'Tiada jawapan') counts[w.attendance]++; else counts['Tiada jawapan']++; });
    return json_({ ok: true, counts: counts, total: all.length, wishes: all });
  }

  // add a wish
  if (d.website) return json_({ ok: true });            // spam-bot trap
  const name = String(d.name || '').trim().slice(0, 60);
  const message = String(d.message || '').trim().slice(0, 500);
  const attendance = ATTENDANCE.indexOf(d.attendance) >= 0 ? d.attendance : '';
  if (!name || !message) return json_({ ok: false, error: 'empty' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), clean_(name), clean_(message), attendance, 'YA']);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Run once from the editor to create the sheet tab and grant permissions.
function setup() { sheet_(); }
