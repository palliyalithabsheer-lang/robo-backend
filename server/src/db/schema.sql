CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  isPremium INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  gradeId TEXT NOT NULL,
  title TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (gradeId) REFERENCES grades (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  subjectId TEXT NOT NULL,
  title TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (subjectId) REFERENCES subjects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  topicId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  videoUrl TEXT,
  thumbnailUrl TEXT,
  duration TEXT,
  status TEXT DEFAULT 'draft',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  topicId TEXT NOT NULL,
  questionType TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT, -- JSON string
  correctAnswer TEXT,
  acceptedAnswers TEXT, -- JSON string
  status TEXT DEFAULT 'draft',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  topicId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  fileType TEXT NOT NULL,
  fileUrl TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE
);
