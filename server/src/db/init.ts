import fs from 'fs';
import path from 'path';
import { getDb } from './db';
import { schema } from './schema';

const mockDataPath = path.resolve(__dirname, '../../../admin/src/data/mockData.ts');

async function init() {
  console.log('Initializing database...');
  const db = await getDb();
  
  // Read and execute schema

  await db.exec(schema);
  console.log('Schema created.');

  // Check if there is data
  const row = await db.get('SELECT COUNT(*) as count FROM grades');
  if (row.count > 0) {
    console.log('Database already seeded. Skipping seed.');
    return;
  }

  console.log('Seeding data from admin mockData.ts...');
  // Since we can't easily import a TS file from another frontend project directly in this script,
  // we will just insert some basic seed data manually or read it via eval if needed.
  // For simplicity, let's insert a couple of grades and subjects directly here.

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
    await db.run('INSERT INTO grades (id, title, isPremium, createdAt) VALUES (?, ?, ?, ?)', g.id, g.title, g.isPremium, g.createdAt);
  }
  for (const s of subjects) {
    await db.run('INSERT INTO subjects (id, gradeId, title, createdAt) VALUES (?, ?, ?, ?)', s.id, s.gradeId, s.title, s.createdAt);
  }
  for (const t of topics) {
    await db.run('INSERT INTO topics (id, subjectId, title, createdAt) VALUES (?, ?, ?, ?)', t.id, t.subjectId, t.title, t.createdAt);
  }
  for (const v of videos) {
    await db.run('INSERT INTO videos (id, topicId, title, description, videoUrl, thumbnailUrl, duration, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', v.id, v.topicId, v.title, v.description, v.videoUrl, v.thumbnailUrl, v.duration, v.status, v.createdAt);
  }
  for (const q of quizzes) {
    await db.run('INSERT INTO quizzes (id, topicId, questionType, question, options, correctAnswer, acceptedAnswers, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', q.id, q.topicId, q.questionType, q.question, q.options, q.correctAnswer, q.acceptedAnswers, q.status, q.createdAt);
  }

  console.log('Database seeded successfully.');
}

init().catch(console.error);
