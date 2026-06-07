import { useMemo } from 'react';
import type { Grade } from '../../types/content';
import type { ProgressData } from '../../types/progress';
import './ParentDashboard.css';


interface ParentDashboardProps {
  progress: ProgressData;
  unlockedGrades: string[];
  onUnlock: (gradeId: string) => void;
  onClose: () => void;
  content: Grade[];
}

const ParentDashboard = ({ progress, unlockedGrades, onUnlock, onClose, content }: ParentDashboardProps) => {
  const stats = useMemo(() => {
    let totalTopics = 0, completedVideos = 0, completedQuizzes = 0;
    content.forEach(g => g.subjects.forEach(s => s.topics.forEach(t => {
      totalTopics++;
      const p = progress[t.id];
      if (p?.videoCompleted) completedVideos++;
      if (p?.quizScore !== null && p?.quizScore !== undefined) completedQuizzes++;
    })));
    return { totalTopics, completedVideos, completedQuizzes };
  }, [progress, content]);

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>👨‍👩‍👧 Parent Dashboard</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-number">{stats.completedVideos}</span>
            <span className="stat-label">Videos Watched</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats.completedQuizzes}</span>
            <span className="stat-label">Quizzes Done</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats.totalTopics}</span>
            <span className="stat-label">Total Topics</span>
          </div>
        </div>

        {/* Grade Subscriptions */}
        <div className="subscription-section">
          <h3>Grade Access</h3>
          <div className="grade-list">
            {content.map(grade => {
              const isUnlocked = !grade.isPremium || unlockedGrades.includes(grade.id);
              return (
                <div key={grade.id} className="grade-row">
                  <div className="grade-info">
                    <span className="grade-name">{grade.title}</span>
                    <span className={`grade-badge ${isUnlocked ? 'badge-free' : 'badge-premium'}`}>
                      {isUnlocked ? (grade.isPremium ? '✅ Unlocked' : 'Free') : '🔒 Premium'}
                    </span>
                  </div>
                  {!isUnlocked && (
                    <button
                      className="unlock-btn"
                      onClick={() => onUnlock(grade.id)}
                    >
                      Unlock Grade
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Progress Detail */}
        <div className="progress-detail">
          <h3>Topic Progress</h3>
          {content.map(grade => grade.subjects.map(subject => (
            <div key={subject.id} className="subject-block">
              <p className="subject-block-title">{grade.title} › {subject.title}</p>
              {subject.topics.length === 0 && <p className="no-content">No topics yet</p>}
              {subject.topics.map(topic => {
                const p = progress[topic.id];
                return (
                  <div key={topic.id} className="topic-row">
                    <span className="topic-row-name">{topic.title}</span>
                    <span className="topic-row-stat">
                      {p?.videoCompleted ? '📹 ✅' : '📹 ⚪'} &nbsp;
                      {topic.questions.length > 0
                        ? (p?.quizScore !== null && p?.quizScore !== undefined
                          ? `📝 ${p.quizScore}/${topic.questions.length}`
                          : '📝 ⚪')
                        : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )))}
        </div>

        <div className="dashboard-footer">
          <p>Tutor Robot MVP · Parent Portal</p>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
