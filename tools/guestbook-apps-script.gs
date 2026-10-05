/**
 * Thank-you notes for symphonykoss.com
 * ------------------------------------
 * Stores visitors' notes in a Google Sheet that only Symphony can edit.
 *
 * One-time setup (about 5 minutes):
 *   1. Make a new Google Sheet (sheets.new), name it "Website notes".
 *   2. Extensions → Apps Script. Delete what's there, paste this whole file, click Save.
 *   3. Deploy → New deployment → gear icon → "Web app".
 *        Execute as: Me      Who has access: Anyone
 *      Click Deploy and allow access (Advanced → "Go to … (unsafe)" is expected for your own script).
 *   4. Copy the "Web app URL" (ends in /exec) and paste it into NOTES_URL at the top of js/guestbook.js.
 *
 * Email alerts: pick "testEmail" in the function menu at the top and click Run once to allow it.
 *
 * Taking a note down: delete its row in the "Notes" tab, or type x in its "Hide" column.
 * If you change this code later: Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy
 * (that keeps the same URL).
 */

const MAX_NOTE = 140;
const MAX_NAME = 24;
const MAX_NOTES_PER_HOUR = 40; // simple brake against spam floods

function doGet() {
  const sh = sheet_();
  const last = sh.getLastRow();
  const rows = last < 2 ? [] : sh.getRange(2, 1, last - 1, 4).getValues();
  const notes = rows
    .filter((r) => String(r[1]).trim() && !String(r[3]).trim())
    .map((r) => ({
      note: String(r[1]),
      name: String(r[2]),
      t: r[0] instanceof Date ? r[0].getTime() : 0,
    }))
    .reverse()
    .slice(0, 300);
  return json_({ notes });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad' });
  }
  if (data.website) return json_({ ok: true }); // a bot filled the hidden field

  const note = clean_(data.note, MAX_NOTE);
  const name = clean_(data.name, MAX_NAME);
  if (note.length < 2) return json_({ ok: false, error: 'empty' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cache = CacheService.getScriptCache();
    const count = Number(cache.get('hourly') || 0);
    if (count >= MAX_NOTES_PER_HOUR) return json_({ ok: false, error: 'busy' });
    cache.put('hourly', String(count + 1), 3600);
    sheet_().appendRow([new Date(), plain_(note), plain_(name), '']);
  } finally {
    lock.releaseLock();
  }
  notify_(note, name);
  return json_({ ok: true, note: { note, name, t: Date.now() } });
}

// Emails Symphony (the Google account that owns this script) about each new note.
function notify_(note, name) {
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: '✎ New note on symphonykoss.com from ' + (name || 'a friend'),
      body: '"' + note + '"\n\n– ' + (name || 'a friend') +
        '\n\nTo take it down, delete its row (or type x in the Hide column) here:\n' +
        SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    });
  } catch (err) {
    // the note is already saved; a failed email shouldn't stop it
  }
}

// Run this once from the editor (select it, click Run) to allow email and get a test message.
function testEmail() {
  notify_('This is a test. New notes will show up like this!', 'Your website');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Notes');
  if (!sh) {
    sh = ss.insertSheet('Notes');
    sh.appendRow(['When', 'Note', 'Name', 'Hide (type x)']);
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 420);
  }
  return sh;
}

function clean_(value, max) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

// keep the sheet from treating a note like "=SUM(...)" as a formula
function plain_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
