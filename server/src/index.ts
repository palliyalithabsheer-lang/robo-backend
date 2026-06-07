import express from 'express';
import cors from 'cors';
import { getDb } from './db/db';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads';
    if (file.mimetype.startsWith('video/')) {
      uploadPath = 'uploads/videos';
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = 'uploads/images';
    }
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Initialize Database on startup ──────────────────────────────────────────
async function initDb() {
  const db = await getDb();
  const schemaPath = path.resolve(__dirname, 'db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await db.exec(schema);
}

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tutor Robot API is running' });
});

// ─── File Uploads ─────────────────────────────────────────────────────────────
app.post('/api/v1/admin/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ data: null, status: 400, error: 'No file uploaded' });
  }
  
  let urlPath = `/uploads/${req.file.filename}`;
  if (req.file.mimetype.startsWith('video/')) {
    urlPath = `/uploads/videos/${req.file.filename}`;
  } else if (req.file.mimetype.startsWith('image/')) {
    urlPath = `/uploads/images/${req.file.filename}`;
  }
  
  res.json({ data: { url: `http://localhost:3000${urlPath}` }, status: 200, error: null });
});

// ─── GET Unified Content Tree (Student Portal) ────────────────────────────────
app.get('/api/v1/content', async (req, res) => {
  try {
    const db = await getDb();
    const statusFilter = req.query.status as string | undefined;

    const grades = await db.all('SELECT * FROM grades ORDER BY id ASC');
    const subjects = await db.all('SELECT * FROM subjects');
    const topics = await db.all('SELECT * FROM topics');

    const videoQuery = statusFilter
      ? 'SELECT * FROM videos WHERE status = ?'
      : 'SELECT * FROM videos';
    const quizQuery = statusFilter
      ? 'SELECT * FROM quizzes WHERE status = ?'
      : 'SELECT * FROM quizzes';
    const materialQuery = statusFilter
      ? 'SELECT * FROM materials WHERE status = ?'
      : 'SELECT * FROM materials';

    const params = statusFilter ? [statusFilter] : [];
    const videos = await db.all(videoQuery, params);
    const quizzes = await db.all(quizQuery, params);
    const materials = await db.all(materialQuery, params);

    const result = grades.map((g: any) => ({
      ...g,
      subjects: subjects
        .filter((s: any) => s.gradeId === g.id)
        .map((s: any) => ({
          ...s,
          topics: topics
            .filter((t: any) => t.subjectId === s.id)
            .map((t: any) => ({
              ...t,
              videos: videos.filter((v: any) => v.topicId === t.id),
              questions: quizzes
                .filter((q: any) => q.topicId === t.id)
                .map((q: any) => ({
                  ...q,
                  options: q.options ? JSON.parse(q.options) : undefined,
                  acceptedAnswers: q.acceptedAnswers ? JSON.parse(q.acceptedAnswers) : undefined,
                })),
              materials: materials.filter((m: any) => m.topicId === t.id),
            })),
        })),
    }));

    res.json({ data: result, status: 200, error: null });
  } catch (error: any) {
    res.status(500).json({ data: null, status: 500, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ─── GRADES ──────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/grades', async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM grades ORDER BY id ASC');
  res.json({ data: rows, status: 200, error: null });
});

app.post('/api/v1/admin/grades', async (req, res) => {
  try {
    const { id, title, isPremium } = req.body;
    const db = await getDb();
    const gradeId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.run('INSERT INTO grades (id, title, isPremium, createdAt) VALUES (?, ?, ?, ?)',
      gradeId, title, isPremium ? 1 : 0, createdAt);
    res.json({ data: { id: gradeId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/grades/:id', async (req, res) => {
  try {
    const { title, isPremium } = req.body;
    const db = await getDb();
    await db.run('UPDATE grades SET title = ?, isPremium = ? WHERE id = ?',
      title, isPremium ? 1 : 0, req.params.id);
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/grades/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM grades WHERE id = ?', req.params.id);
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── SUBJECTS ────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/subjects', async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT s.*, g.title as gradeTitle FROM subjects s JOIN grades g ON s.gradeId = g.id');
  res.json({ data: rows, status: 200, error: null });
});

app.post('/api/v1/admin/subjects', async (req, res) => {
  try {
    const { id, gradeId, title } = req.body;
    const db = await getDb();
    const subjectId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.run('INSERT INTO subjects (id, gradeId, title, createdAt) VALUES (?, ?, ?, ?)',
      subjectId, gradeId, title, createdAt);
    res.json({ data: { id: subjectId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/subjects/:id', async (req, res) => {
  try {
    const { title, gradeId } = req.body;
    const db = await getDb();
    await db.run('UPDATE subjects SET title = ?, gradeId = ? WHERE id = ?', title, gradeId, req.params.id);
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/subjects/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM subjects WHERE id = ?', req.params.id);
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── TOPICS ──────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/topics', async (req, res) => {
  const db = await getDb();
  const rows = await db.all(`
    SELECT t.*, s.title as subjectTitle, g.title as gradeTitle
    FROM topics t
    JOIN subjects s ON t.subjectId = s.id
    JOIN grades g ON s.gradeId = g.id
  `);
  res.json({ data: rows, status: 200, error: null });
});

app.post('/api/v1/admin/topics', async (req, res) => {
  try {
    const { id, subjectId, title } = req.body;
    const db = await getDb();
    const topicId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.run('INSERT INTO topics (id, subjectId, title, createdAt) VALUES (?, ?, ?, ?)',
      topicId, subjectId, title, createdAt);
    res.json({ data: { id: topicId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/topics/:id', async (req, res) => {
  try {
    const { title, subjectId } = req.body;
    const db = await getDb();
    await db.run('UPDATE topics SET title = ?, subjectId = ? WHERE id = ?', title, subjectId, req.params.id);
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/topics/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM topics WHERE id = ?', req.params.id);
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── VIDEOS ──────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/videos', async (req, res) => {
  const db = await getDb();
  const rows = await db.all(`
    SELECT v.*, t.title as topicTitle, s.title as subjectTitle, g.title as gradeTitle,
           s.id as subjectId, g.id as gradeId
    FROM videos v
    JOIN topics t ON v.topicId = t.id
    JOIN subjects s ON t.subjectId = s.id
    JOIN grades g ON s.gradeId = g.id
  `);
  res.json({ data: rows, status: 200, error: null });
});

app.post('/api/v1/admin/videos', async (req, res) => {
  try {
    const { id, topicId, title, description, videoUrl, thumbnailUrl, duration, status } = req.body;
    const db = await getDb();
    const videoId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.run(
      'INSERT INTO videos (id, topicId, title, description, videoUrl, thumbnailUrl, duration, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      videoId, topicId, title, description, videoUrl, thumbnailUrl, duration, status || 'draft', createdAt
    );
    res.json({ data: { id: videoId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/videos/:id', async (req, res) => {
  try {
    const { topicId, title, description, videoUrl, thumbnailUrl, duration } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE videos SET topicId = ?, title = ?, description = ?, videoUrl = ?, thumbnailUrl = ?, duration = ? WHERE id = ?',
      topicId, title, description, videoUrl, thumbnailUrl, duration, req.params.id
    );
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.patch('/api/v1/admin/videos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDb();
    await db.run('UPDATE videos SET status = ? WHERE id = ?', status, req.params.id);
    res.json({ data: { id: req.params.id, status }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/videos/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM videos WHERE id = ?', req.params.id);
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── QUIZZES ─────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/quizzes', async (req, res) => {
  const db = await getDb();
  const rows = await db.all(`
    SELECT q.*, t.title as topicTitle, s.id as subjectId, g.id as gradeId
    FROM quizzes q
    JOIN topics t ON q.topicId = t.id
    JOIN subjects s ON t.subjectId = s.id
    JOIN grades g ON s.gradeId = g.id
  `);
  res.json({ data: rows.map((r: any) => ({
    ...r,
    options: r.options ? JSON.parse(r.options) : undefined,
    acceptedAnswers: r.acceptedAnswers ? JSON.parse(r.acceptedAnswers) : undefined,
  })), status: 200, error: null });
});

app.post('/api/v1/admin/quizzes', async (req, res) => {
  try {
    const { id, topicId, questionType, question, options, correctAnswer, acceptedAnswers, status } = req.body;
    const db = await getDb();
    const quizId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.run(
      'INSERT INTO quizzes (id, topicId, questionType, question, options, correctAnswer, acceptedAnswers, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      quizId, topicId, questionType, question,
      options ? JSON.stringify(options) : null,
      correctAnswer || null,
      acceptedAnswers ? JSON.stringify(acceptedAnswers) : null,
      status || 'draft', createdAt
    );
    res.json({ data: { id: quizId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.patch('/api/v1/admin/quizzes/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDb();
    await db.run('UPDATE quizzes SET status = ? WHERE id = ?', status, req.params.id);
    res.json({ data: { id: req.params.id, status }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/quizzes/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM quizzes WHERE id = ?', req.params.id);
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── MATERIALS ────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/materials', async (req, res) => {
  const db = await getDb();
  const rows = await db.all(`
    SELECT m.*, t.title as topicTitle, s.id as subjectId, g.id as gradeId
    FROM materials m
    JOIN topics t ON m.topicId = t.id
    JOIN subjects s ON t.subjectId = s.id
    JOIN grades g ON s.gradeId = g.id
  `);
  res.json({ data: rows, status: 200, error: null });
});

app.post('/api/v1/admin/materials', async (req, res) => {
  try {
    const { id, topicId, title, description, fileType, fileUrl, status } = req.body;
    const db = await getDb();
    const materialId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.run(
      'INSERT INTO materials (id, topicId, title, description, fileType, fileUrl, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      materialId, topicId, title, description, fileType, fileUrl, status || 'draft', createdAt
    );
    res.json({ data: { id: materialId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.patch('/api/v1/admin/materials/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDb();
    await db.run('UPDATE materials SET status = ? WHERE id = ?', status, req.params.id);
    res.json({ data: { id: req.params.id, status }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/materials/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM materials WHERE id = ?', req.params.id);
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Tutor Robot API running on http://localhost:${PORT}`);
    console.log(`   Student App:  http://localhost:5173`);
    console.log(`   Admin Portal: http://localhost:5174`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
