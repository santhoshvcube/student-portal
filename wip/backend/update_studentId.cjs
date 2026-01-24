const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const updatesPath = path.resolve(__dirname, '..', 'scripts', 'student_id_updates.json');
if (!fs.existsSync(updatesPath)) {
  console.error('Updates file not found:', updatesPath);
  console.error('Create a scripts/student_id_updates.json with an array of updates:');
  console.error('[{"match":"<id|email>","studentId":"MCD-B30-001"}, ...]');
  process.exit(1);
}

const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  let changed = 0;
  for (const u of updates) {
    if (!u.match || !u.studentId) continue;
    // try to match by id first, then by email, then by mobile
    const params = [u.studentId, u.match, u.match, u.match];
    const sql = `UPDATE students SET studentId = ? WHERE id = ? OR email = ? OR mobile = ?`;
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Failed to update for', u.match, err.message);
      } else {
        if (this.changes) changed += this.changes;
        console.log(`Updated ${this.changes} rows for match=${u.match} -> ${u.studentId}`);
      }
    });
  }
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Commit failed:', err.message);
    } else {
      console.log('Done. Total rows changed (approx):', changed);
    }
    db.close();
  });
});
