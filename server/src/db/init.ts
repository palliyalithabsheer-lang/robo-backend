import 'dotenv/config';
import { getDb } from './db';
import { schema } from './schema';

async function init() {
  console.log('Initializing database...');
  const db = getDb();

  // Execute schema statements one by one
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
  console.log('Schema created.');

  // Check if there is data
  const result = await db.execute('SELECT COUNT(*) as count FROM grades');
  const count = Number(result.rows[0][0]);
  if (count > 0) {
    console.log('Database already seeded. Skipping seed.');
    return;
  }

  console.log('Seeding data...');

  const grades = [
    { id: 'g1', title: 'Grade 1', isPremium: 0, createdAt: '2025-01-10' },
    { id: 'g5', title: 'Grade 5', isPremium: 0, createdAt: '2025-02-10' },
  ];

  const subjects = [
    { id: 's1', gradeId: 'g5', title: 'Science', createdAt: '2025-02-10' },
  ];

  const topics = [
    { id: 't1', subjectId: 's1', title: 'Photosynthesis', createdAt: '2025-02-15' },
    { id: 't2', subjectId: 's1', title: 'Plant Parts', createdAt: '2025-02-20' },
  ];

  const videos = [
    { id: 'v1', topicId: 't1', title: 'Introduction to Photosynthesis', description: 'Learn how plants make their own food using sunlight.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80', duration: '04:30', status: 'published', createdAt: '2025-02-15' }
  ];

  const quizzes = [
    { id: 'q1', topicId: 't1', questionType: 'MULTIPLE_CHOICE', question: 'Which gas do plants absorb during photosynthesis?', options: JSON.stringify(['Oxygen', 'Carbon Dioxide', 'Nitrogen']), correctAnswer: 'Carbon Dioxide', acceptedAnswers: null, status: 'published', createdAt: '2025-02-15' }
  ];

  for (const g of grades) {
    await db.execute({ sql: 'INSERT INTO grades (id, title, isPremium, createdAt) VALUES (?, ?, ?, ?)', args: [g.id, g.title, g.isPremium, g.createdAt] });
  }
  for (const s of subjects) {
    await db.execute({ sql: 'INSERT INTO subjects (id, gradeId, title, createdAt) VALUES (?, ?, ?, ?)', args: [s.id, s.gradeId, s.title, s.createdAt] });
  }
  for (const t of topics) {
    await db.execute({ sql: 'INSERT INTO topics (id, subjectId, title, createdAt) VALUES (?, ?, ?, ?)', args: [t.id, t.subjectId, t.title, t.createdAt] });
  }
  for (const v of videos) {
    await db.execute({ sql: 'INSERT INTO videos (id, topicId, title, description, videoUrl, thumbnailUrl, duration, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [v.id, v.topicId, v.title, v.description, v.videoUrl, v.thumbnailUrl, v.duration, v.status, v.createdAt] });
  }
  for (const q of quizzes) {
    await db.execute({ sql: 'INSERT INTO quizzes (id, topicId, questionType, question, options, correctAnswer, acceptedAnswers, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [q.id, q.topicId, q.questionType, q.question, q.options, q.correctAnswer, q.acceptedAnswers, q.status, q.createdAt] });
  }

  console.log('Database seeded successfully.');
}

init().catch(console.error);
