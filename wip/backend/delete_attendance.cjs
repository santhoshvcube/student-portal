const sqlite3 = require('sqlite3').verbose();
const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('No student IDs provided');
  process.exit(1);
}
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('DB open error:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  ids.forEach((id) => {
    db.run("DELETE FROM attendance WHERE studentId = ?", [id], function (err) {
      if (err) {
        console.error('ERR_DELETE_ATTENDANCE', id, err.message);
      } else {
        console.log('DELETED_ATTENDANCE_' + id);
      }
    });
    db.run("DELETE FROM marks WHERE studentId = ?", [id], function (err) {
      if (err) {
        console.error('ERR_DELETE_MARKS', id, err.message);
      } else {
        console.log('DELETED_MARKS_' + id);
      }
    });
  });
});

db.close();
