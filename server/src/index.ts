import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db/db';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { schema } from './db/schema';

// ─── Cloudinary Configuration ─────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — files are uploaded directly to Cloudinary via stream
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Initialize Database on startup ──────────────────────────────────────────
async function initDb() {
  const db = getDb();
  // Execute schema statements one by one (Turso requires individual statements)
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
}

// ─── Helper: convert Turso ResultSet rows to plain objects ───────────────────
function toRows(result: any): any[] {
  return result.rows.map((row: any) => {
    const obj: any = {};
    result.columns.forEach((col: string, i: number) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tutor Robot API is running' });
});

// ─── File Uploads (Cloudinary via stream) ────────────────────────────────────
app.post('/api/v1/admin/upload', upload.single('file'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ data: null, status: 400, error: 'No file uploaded' });
  }
  const isVideo = req.file.mimetype.startsWith('video/');
  const folder = isVideo ? 'robo/videos' : 'robo/images';
  const resourceType = isVideo ? 'video' : 'image';

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder, resource_type: resourceType },
    (error: any, result: any) => {
      if (error || !result) {
        return res.status(500).json({ data: null, status: 500, error: error?.message || 'Upload failed' });
      }
      res.json({ data: { url: result.secure_url }, status: 200, error: null });
    }
  );
  uploadStream.end(req.file.buffer);
});

// ─── GET Unified Content Tree (Student Portal) ────────────────────────────────
app.get('/api/v1/content', async (req, res) => {
  try {
    const db = getDb();
    const statusFilter = req.query.status as string | undefined;

    const grades = toRows(await db.execute('SELECT * FROM grades ORDER BY id ASC'));
    const subjects = toRows(await db.execute('SELECT * FROM subjects'));
    const topics = toRows(await db.execute('SELECT * FROM topics'));

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
    const videos = toRows(await db.execute({ sql: videoQuery, args: params }));
    const quizzes = toRows(await db.execute({ sql: quizQuery, args: params }));
    const materials = toRows(await db.execute({ sql: materialQuery, args: params }));

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
                  options: q.options ? JSON.parse(q.options as string) : undefined,
                  acceptedAnswers: q.acceptedAnswers ? JSON.parse(q.acceptedAnswers as string) : undefined,
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
  try {
    const db = getDb();
    const rows = toRows(await db.execute('SELECT * FROM grades ORDER BY id ASC'));
    res.json({ data: rows, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.post('/api/v1/admin/grades', async (req, res) => {
  try {
    const { id, title, isPremium } = req.body;
    const db = getDb();
    const gradeId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'INSERT INTO grades (id, title, isPremium, createdAt) VALUES (?, ?, ?, ?)',
      args: [gradeId, title, isPremium ? 1 : 0, createdAt],
    });
    res.json({ data: { id: gradeId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/grades/:id', async (req, res) => {
  try {
    const { title, isPremium } = req.body;
    const db = getDb();
    await db.execute({
      sql: 'UPDATE grades SET title = ?, isPremium = ? WHERE id = ?',
      args: [title, isPremium ? 1 : 0, req.params.id],
    });
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/grades/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute({ sql: 'DELETE FROM grades WHERE id = ?', args: [req.params.id] });
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── SUBJECTS ────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/subjects', async (req, res) => {
  try {
    const db = getDb();
    const rows = toRows(await db.execute('SELECT s.*, g.title as gradeTitle FROM subjects s JOIN grades g ON s.gradeId = g.id'));
    res.json({ data: rows, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.post('/api/v1/admin/subjects', async (req, res) => {
  try {
    const { id, gradeId, title } = req.body;
    const db = getDb();
    const subjectId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'INSERT INTO subjects (id, gradeId, title, createdAt) VALUES (?, ?, ?, ?)',
      args: [subjectId, gradeId, title, createdAt],
    });
    res.json({ data: { id: subjectId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/subjects/:id', async (req, res) => {
  try {
    const { title, gradeId } = req.body;
    const db = getDb();
    await db.execute({
      sql: 'UPDATE subjects SET title = ?, gradeId = ? WHERE id = ?',
      args: [title, gradeId, req.params.id],
    });
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/subjects/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute({ sql: 'DELETE FROM subjects WHERE id = ?', args: [req.params.id] });
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── TOPICS ──────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/topics', async (req, res) => {
  try {
    const db = getDb();
    const rows = toRows(await db.execute(`
      SELECT t.*, s.title as subjectTitle, g.title as gradeTitle
      FROM topics t
      JOIN subjects s ON t.subjectId = s.id
      JOIN grades g ON s.gradeId = g.id
    `));
    res.json({ data: rows, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.post('/api/v1/admin/topics', async (req, res) => {
  try {
    const { id, subjectId, title } = req.body;
    const db = getDb();
    const topicId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'INSERT INTO topics (id, subjectId, title, createdAt) VALUES (?, ?, ?, ?)',
      args: [topicId, subjectId, title, createdAt],
    });
    res.json({ data: { id: topicId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/topics/:id', async (req, res) => {
  try {
    const { title, subjectId } = req.body;
    const db = getDb();
    await db.execute({
      sql: 'UPDATE topics SET title = ?, subjectId = ? WHERE id = ?',
      args: [title, subjectId, req.params.id],
    });
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/topics/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute({ sql: 'DELETE FROM topics WHERE id = ?', args: [req.params.id] });
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── VIDEOS ──────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/videos', async (req, res) => {
  try {
    const db = getDb();
    const rows = toRows(await db.execute(`
      SELECT v.*, t.title as topicTitle, s.title as subjectTitle, g.title as gradeTitle,
             s.id as subjectId, g.id as gradeId
      FROM videos v
      JOIN topics t ON v.topicId = t.id
      JOIN subjects s ON t.subjectId = s.id
      JOIN grades g ON s.gradeId = g.id
    `));
    res.json({ data: rows, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.post('/api/v1/admin/videos', async (req, res) => {
  try {
    const { id, topicId, title, description, videoUrl, thumbnailUrl, duration, status } = req.body;
    const db = getDb();
    const videoId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'INSERT INTO videos (id, topicId, title, description, videoUrl, thumbnailUrl, duration, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [videoId, topicId, title, description ?? null, videoUrl ?? null, thumbnailUrl ?? null, duration ?? null, status || 'draft', createdAt],
    });
    res.json({ data: { id: videoId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.put('/api/v1/admin/videos/:id', async (req, res) => {
  try {
    const { topicId, title, description, videoUrl, thumbnailUrl, duration } = req.body;
    const db = getDb();
    await db.execute({
      sql: 'UPDATE videos SET topicId = ?, title = ?, description = ?, videoUrl = ?, thumbnailUrl = ?, duration = ? WHERE id = ?',
      args: [topicId, title, description ?? null, videoUrl ?? null, thumbnailUrl ?? null, duration ?? null, req.params.id],
    });
    res.json({ data: { id: req.params.id }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.patch('/api/v1/admin/videos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    await db.execute({ sql: 'UPDATE videos SET status = ? WHERE id = ?', args: [status, req.params.id] });
    res.json({ data: { id: req.params.id, status }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/videos/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute({ sql: 'DELETE FROM videos WHERE id = ?', args: [req.params.id] });
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── QUIZZES ─────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/quizzes', async (req, res) => {
  try {
    const db = getDb();
    const rows = toRows(await db.execute(`
      SELECT q.*, t.title as topicTitle, s.id as subjectId, g.id as gradeId
      FROM quizzes q
      JOIN topics t ON q.topicId = t.id
      JOIN subjects s ON t.subjectId = s.id
      JOIN grades g ON s.gradeId = g.id
    `));
    res.json({
      data: rows.map((r: any) => ({
        ...r,
        options: r.options ? JSON.parse(r.options as string) : undefined,
        acceptedAnswers: r.acceptedAnswers ? JSON.parse(r.acceptedAnswers as string) : undefined,
      })),
      status: 200,
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.post('/api/v1/admin/quizzes', async (req, res) => {
  try {
    const { id, topicId, questionType, question, options, correctAnswer, acceptedAnswers, status } = req.body;
    const db = getDb();
    const quizId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'INSERT INTO quizzes (id, topicId, questionType, question, options, correctAnswer, acceptedAnswers, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        quizId, topicId, questionType, question,
        options ? JSON.stringify(options) : null,
        correctAnswer || null,
        acceptedAnswers ? JSON.stringify(acceptedAnswers) : null,
        status || 'draft', createdAt,
      ],
    });
    res.json({ data: { id: quizId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.patch('/api/v1/admin/quizzes/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    await db.execute({ sql: 'UPDATE quizzes SET status = ? WHERE id = ?', args: [status, req.params.id] });
    res.json({ data: { id: req.params.id, status }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/quizzes/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute({ sql: 'DELETE FROM quizzes WHERE id = ?', args: [req.params.id] });
    res.json({ data: null, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

// ─── MATERIALS ────────────────────────────────────────────────────────────────
app.get('/api/v1/admin/materials', async (req, res) => {
  try {
    const db = getDb();
    const rows = toRows(await db.execute(`
      SELECT m.*, t.title as topicTitle, s.id as subjectId, g.id as gradeId
      FROM materials m
      JOIN topics t ON m.topicId = t.id
      JOIN subjects s ON t.subjectId = s.id
      JOIN grades g ON s.gradeId = g.id
    `));
    res.json({ data: rows, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.post('/api/v1/admin/materials', async (req, res) => {
  try {
    const { id, topicId, title, description, fileType, fileUrl, status } = req.body;
    const db = getDb();
    const materialId = id || uuidv4();
    const createdAt = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'INSERT INTO materials (id, topicId, title, description, fileType, fileUrl, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [materialId, topicId, title, description ?? null, fileType, fileUrl, status || 'draft', createdAt],
    });
    res.json({ data: { id: materialId }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.patch('/api/v1/admin/materials/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    await db.execute({ sql: 'UPDATE materials SET status = ? WHERE id = ?', args: [status, req.params.id] });
    res.json({ data: { id: req.params.id, status }, status: 200, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, status: 500, error: err.message });
  }
});

app.delete('/api/v1/admin/materials/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute({ sql: 'DELETE FROM materials WHERE id = ?', args: [req.params.id] });
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
