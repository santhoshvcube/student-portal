const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const csv = (s) => s.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => l.split(',').map(x => x.trim()));

const csvPath = path.resolve(__dirname, '..', 'scripts', 'student_id_mapping.csv');
if (!fs.existsSync(csvPath)) {
  console.error('CSV mapping file not found:', csvPath);
  process.exit(1);
}

const rows = csv(fs.readFileSync(csvPath, 'utf8'));
if (rows.length < 2) {
  console.error('CSV has no mappings. Expect header + rows.');
  process.exit(1);
}

const header = rows[0];
const mappings = rows.slice(1).map(r => ({ match: r[0], studentId: r[1] }));

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  let totalChanged = 0;
  mappings.forEach(m => {
    if (!m.match || !m.studentId) return;
    const sql = `UPDATE students SET studentId = ? WHERE id = ? OR email = ? OR mobile = ?`;
    db.run(sql, [m.studentId, m.match, m.match, m.match], function(err) {
      if (err) {
        console.error('Update failed for', m.match, err.message);
      } else {
        if (this.changes) {
          totalChanged += this.changes;
          console.log(`Updated ${this.changes} row(s) for match=${m.match} -> ${m.studentId}`);
        } else {
          console.log(`No rows matched for match=${m.match}`);
        }
      }
    });
  });
  db.run('COMMIT', (err) => {
    if (err) console.error('Commit failed:', err.message);
    console.log('Done. Total rows changed (approx):', totalChanged);
    db.close();
  });
});
