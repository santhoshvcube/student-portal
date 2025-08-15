import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  mobile: string;
  batchId: string;
  active: number;
  photo: string;
  password: string;
  profileComplete: number;
  education?: any;
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  const addColumnIfNotExists = (tableName: string, columnName: string, columnType: string) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns: any[]) => {
      if (err) {
        console.error(`Error checking table info for ${tableName}:`, err.message);
        return;
      }
      const columnExists = columns.some((column: any) => column.name === columnName);
      if (!columnExists) {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, (err) => {
          if (err) {
            console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
          } else {
            console.log(`Column ${columnName} added to ${tableName}.`);
          }
        });
      }
    });
  };

  addColumnIfNotExists('batches', 'startDate', 'TEXT');
  addColumnIfNotExists('batches', 'endDate', 'TEXT');
  addColumnIfNotExists('batches', 'batchType', 'TEXT');
addColumnIfNotExists('batches', 'qrCode', 'TEXT');
  addColumnIfNotExists('batches', 'attendanceTypes', 'TEXT');
  addColumnIfNotExists('batches', 'monthlyData', 'TEXT');
addColumnIfNotExists('students', 'education', 'TEXT');
  db.run(`
    CREATE TABLE IF NOT EXISTS marks (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      exam TEXT,
      score REAL,
      type TEXT,
      date TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      batchId TEXT,
      task TEXT,
      assignedDate TEXT,
      submissionDate TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT,
      interviewMode TEXT,
      focusArea TEXT,
      questions TEXT,
      answers TEXT,
      scores TEXT,
      feedback TEXT,
      date TEXT
    )
  `);
});
db.get('SELECT * FROM students WHERE email = ?', ['student@example.com'], (err, row) => {
    if (!row) {
      const insert = `INSERT INTO students (id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete, education)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(insert, [uuidv4(), 'STU002', 'Test Student', 'student@example.com', '1234567890', '1', 1, '', 'password', 1, '[]']);
    }
  });
// The database schema is now managed via migrations.
// This block is removed to prevent re-initializing the database on every server start.
const port = parseInt(process.env.PORT || '3003', 10);

app.use(cors());
app.use(express.json());

// Student routes
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/students', (req, res) => {
  const { id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete } = req.body;
  const sql = `INSERT INTO students (id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/students/:id', (req, res) => {
  const { studentId, name, email, mobile, batchId, active, photo, password, profileComplete } = req.body;
  const sql = `UPDATE students SET
               studentId = ?, name = ?, email = ?, mobile = ?, batchId = ?, active = ?, photo = ?, password = ?, profileComplete = ?
               WHERE id = ?`;
  db.run(sql, [studentId, name, email, mobile, batchId, active, photo, password, profileComplete, req.params.id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

app.delete('/api/students/:id', (req, res) => {
  const sql = 'DELETE FROM students WHERE id = ?';
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

app.post('/api/students/bulk', (req, res) => {
  const students = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Expected an array of students.' });
  }

  const sql = `INSERT INTO students (id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete, education)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to start transaction.' });
      }
    });

    let hadError = false;
    let responseSent = false;
    students.forEach(student => {
      if (hadError) return;
      const { id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete, education } = student;
      db.run(sql, [id, studentId, name, email, mobile, batchId, active, photo, password, profileComplete, JSON.stringify(education)], (err) => {
        if (err && !responseSent) {
          hadError = true;
          console.error('Failed to insert student:', err);
          db.run('ROLLBACK', () => {
            if (!responseSent) {
              res.status(400).json({ error: `Failed to insert student ${name}: ${err.message}` });
              responseSent = true;
            }
          });
        }
      });
    });

    db.run('COMMIT', (err) => {
      if (hadError) return; // Error already handled
      if (err && !responseSent) {
        res.status(500).json({ error: 'Failed to commit transaction.' });
        responseSent = true;
        return;
      }
      if (!responseSent) {
        io.emit('data_changed');
        res.status(201).json({ message: 'Bulk upload successful.' });
      }
    });
  });
});

app.get('/api/batches', (req, res) => {
  db.all('SELECT * FROM batches', [], (err, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const batches = rows.map((batch: any) => ({
      ...batch,
      attendanceTypes: batch.attendanceTypes ? JSON.parse(batch.attendanceTypes) : [],
      monthlyData: batch.monthlyData ? JSON.parse(batch.monthlyData) : {},
    }));
    res.json(batches);
  });
});

app.post('/api/batches', (req, res) => {
  const { batchNumber, startDate, endDate, qrCode, batchType, attendanceTypes, monthlyData } = req.body;
  const id = uuidv4();
  const sql = `INSERT INTO batches (id, batchNumber, startDate, endDate, qrCode, batchType, attendanceTypes, monthlyData)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id,
    batchNumber,
    startDate,
    endDate,
    qrCode,
    batchType,
    JSON.stringify(attendanceTypes),
    JSON.stringify(monthlyData || {})
  ];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.status(201).json({ id });
  });
});

app.put('/api/batches/:id', (req, res) => {
  const { batchNumber, startDate, endDate, qrCode, batchType, attendanceTypes, monthlyData } = req.body;
  const sql = `UPDATE batches SET
               batchNumber = ?,
               startDate = ?,
               endDate = ?,
               qrCode = ?,
               batchType = ?,
               attendanceTypes = ?,
               monthlyData = ?
               WHERE id = ?`;
  const params = [
    batchNumber,
    startDate,
    endDate,
    qrCode,
    batchType,
    JSON.stringify(attendanceTypes),
    JSON.stringify(monthlyData || {}),
    req.params.id
  ];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

app.delete('/api/batches/:id', (req, res) => {
  const sql = 'DELETE FROM batches WHERE id = ?';
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

// Schedule routes
app.get('/api/schedules', (req, res) => {
  db.all('SELECT * FROM schedules', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/schedules', (req, res) => {
  const { id, batchId, task, assignedDate, submissionDate } = req.body;
  const sql = 'INSERT INTO schedules (id, batchId, task, assignedDate, submissionDate) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [id, batchId, task, assignedDate, submissionDate], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/schedules/:id', (req, res) => {
  const { batchId, task, assignedDate, submissionDate } = req.body;
  const sql = 'UPDATE schedules SET batchId = ?, task = ?, assignedDate = ?, submissionDate = ? WHERE id = ?';
  db.run(sql, [batchId, task, assignedDate, submissionDate, req.params.id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

app.delete('/api/schedules/:id', (req, res) => {
  const sql = 'DELETE FROM schedules WHERE id = ?';
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

// Marks routes
app.get('/api/marks', async (req, res) => {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM marks', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/marks', (req, res) => {
  const { id, studentId, exam, score, type, date } = req.body;
  const checkSql = 'SELECT id FROM marks WHERE studentId = ? AND exam = ? AND date = ? AND type = ?';
  db.get(checkSql, [studentId, exam, date, type], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(409).json({ message: 'Mark for this exam, date and type already exists for this student.' });
    }
    const sql = 'INSERT INTO marks (id, studentId, exam, score, type, date) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [id, studentId, exam, score, type, date], function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      io.emit('data_changed');
      res.status(201).json({ id: this.lastID });
    });
  });
});

app.put('/api/marks/:id', (req, res) => {
  const { studentId, exam, score, type, date } = req.body;
  const sql = 'UPDATE marks SET studentId = ?, exam = ?, score = ?, type = ?, date = ? WHERE id = ?';
  db.run(sql, [studentId, exam, score, type, date, req.params.id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

app.delete('/api/marks/:id', (req, res) => {
  const sql = 'DELETE FROM marks WHERE id = ?';
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.json({ changes: this.changes });
  });
});

app.post('/api/marks/bulk', async (req, res) => {
  const marks = req.body;
  if (!Array.isArray(marks)) {
    return res.status(400).json({ message: 'Expected an array of marks.' });
  }

  const studentQuery = 'SELECT batchId FROM students WHERE id = ?';
  const insertSql = 'INSERT INTO marks (id, studentId, exam, score, type, date) VALUES (?, ?, ?, ?, ?, ?)';
  const checkSql = 'SELECT id FROM marks WHERE studentId = ? AND exam = ? AND date = ? AND type = ?';

  const run = (query: string, params: any[] = []) =>
    new Promise<void>((resolve, reject) =>
      db.run(query, params, (err) => (err ? reject(err) : resolve()))
    );

  const get = (query: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) =>
      db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)))
    );

  try {
    await run('BEGIN TRANSACTION');

    for (const mark of marks) {
      const { id, studentId, batchId, exam, score, type, date } = mark;
      
      if (!studentId || !batchId) {
        throw new Error('Missing studentId or batchId for one of the records.');
      }

      const student = await get(studentQuery, [studentId]);
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found.`);
      }
      if (student.batchId !== batchId) {
        throw new Error(`Student with ID ${studentId} is not in the correct batch. The file specifies batch ${batchId}, but the student belongs to batch ${student.batchId}.`);
      }
      
      const existingMark = await get(checkSql, [studentId, exam, date, type]);
      if (!existingMark) {
        await run(insertSql, [id, studentId, exam, score, type, date]);
      }
    }

    await run('COMMIT');
    io.emit('data_changed');
    res.status(201).json({ message: 'Bulk marks uploaded successfully.' });
  } catch (error: any) {
    console.error('Error in /api/marks/bulk:', error); // Add logging
    try {
      await run('ROLLBACK');
    } catch (rollbackError: any) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(400).json({ message });
  }
});

// Attendance routes
app.get('/api/attendance', (req, res) => {
  db.all('SELECT * FROM attendance', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/attendance', (req, res) => {
  const { studentId, date, type, present, inTime, outTime } = req.body;
  const sql = 'INSERT INTO attendance (studentId, date, type, present, inTime, outTime) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [studentId, date, type, present, inTime, outTime], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.status(201).json({ id: this.lastID });
  });
});

app.post('/api/attendance/bulk', async (req, res) => {
  const { batchId, month, attendanceData } = req.body;

  if (!batchId || !month || !Array.isArray(attendanceData)) {
    return res.status(400).json({ message: 'Missing batchId, month, or attendanceData.' });
  }

  const run = (query: string, params: any[] = []) =>
    new Promise<void>((resolve, reject) =>
      db.run(query, params, (err) => (err ? reject(err) : resolve()))
    );

  const get = (query: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) =>
      db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)))
    );

  const insertSql = 'INSERT INTO attendance (studentId, date, type, present, inTime, outTime) VALUES (?, ?, ?, ?, ?, ?)';
  const checkSql = 'SELECT 1 FROM attendance WHERE studentId = ? AND date = ? AND type = ?';

  try {
    await run('BEGIN TRANSACTION');

    for (const record of attendanceData) {
      const { studentId, date, type, present, inTime, outTime } = record;
      
      const existing = await get(checkSql, [studentId, date, type]);
      if (!existing) {
        await run(insertSql, [studentId, date, type, present, inTime, outTime]);
      }
    }

    await run('COMMIT');
    io.emit('data_changed');
    res.status(201).json({ message: 'Bulk attendance uploaded successfully.' });
  } catch (error: any) {
    console.error('Error in /api/attendance/bulk:', error);
    try {
      await run('ROLLBACK');
    } catch (rollbackError: any) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ message });
  }
});

// Resume reviews routes
app.get('/api/resume-reviews', (req, res) => {
  db.all('SELECT * FROM resume_reviews', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/resume-reviews', (req, res) => {
  const { studentId, batchId, date, matchScore, resumeText, jobDescription } = req.body;
  const sql = 'INSERT INTO resume_reviews (studentId, batchId, date, matchScore, resumeText, jobDescription) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [studentId, batchId, date, matchScore, resumeText, jobDescription], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.status(201).json({ id: this.lastID });
  });
});

// Interview routes
app.post('/api/interviews', (req, res) => {
  const { studentId, interviewMode, focusArea, questions, answers, scores, feedback, date } = req.body;
  const sql = 'INSERT INTO interviews (studentId, interviewMode, focusArea, questions, answers, scores, feedback, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.run(sql, [studentId, interviewMode, focusArea, JSON.stringify(questions), JSON.stringify(answers), JSON.stringify(scores), JSON.stringify(feedback), date], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    io.emit('data_changed');
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/api/interviews/:studentId', (req, res) => {
  db.all('SELECT * FROM interviews WHERE studentId = ?', [req.params.studentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/login', (req, res) => {
  const { identifier, credential, role } = req.body;

  if (role === 'admin') {
    if (identifier === 'admin@vcube.com' && credential === 'admin@1234') {
      res.json({
        id: 'admin',
        role: 'admin',
        name: 'Admin User',
        profileComplete: true,
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
    return;
  }

  // Student login
  const sql = 'SELECT * FROM students WHERE email = ? AND mobile = ?';
  db.get<Student>(sql, [identifier, credential], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({
        id: row.id,
        role: 'student',
        name: row.name,
        profileComplete: row.profileComplete,
      });
    } else {
      res.status(401).json({ message: 'Invalid student credentials' });
    }
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});