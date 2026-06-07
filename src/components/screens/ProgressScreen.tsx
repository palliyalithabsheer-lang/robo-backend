import { useMemo } from 'react';
import type { ProgressData } from '../../types/progress';
import type { Grade } from '../../types/content';
import './ProgressScreen.css';

interface ProgressScreenProps {
  progress: ProgressData;
  content: Grade[];
}

const ProgressScreen = ({ progress, content }: ProgressScreenProps) => {
  // Calculate total stats
  const { totalTopics, completedVideos, totalQuizzes, completedQuizzes } = useMemo(() => {
    let tTopics = 0;
    let cVideos = 0;
    let tQuizzes = 0;
    let cQuizzes = 0;

    content.forEach(grade => {
      grade.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          tTopics++;
          if (topic.questions.length > 0) {
            tQuizzes++;
          }
          
          const p = progress[topic.id];
          if (p) {
            if (p.videoCompleted) cVideos++;
            if (p.quizScore !== null) cQuizzes++;
          }
        });
      });
    });

    return { 
      totalTopics: tTopics, 
      completedVideos: cVideos, 
      totalQuizzes: tQuizzes, 
      completedQuizzes: cQuizzes 
    };
  }, [progress, content]);

  const completionPercentage = totalTopics > 0 
    ? Math.round(((completedVideos + completedQuizzes) / (totalTopics + totalQuizzes)) * 100) 
    : 0;

  return (
    <div className="progress-screen">
      <h2 className="progress-title">My Progress</h2>
      
      <div className="overall-progress">
        <div className="percentage">{completionPercentage}%</div>
        <div className="progress-label">Total Completion</div>
      </div>

      <div className="progress-list">
        {content.map(grade => (
          <div key={grade.id} className="grade-section">
            {grade.subjects.map(subject => (
              <div key={subject.id} className="subject-section">
                <h3 className="subject-title">{subject.title}</h3>
                {subject.topics.map(topic => {
                  const p = progress[topic.id];
                  const videoDone = p?.videoCompleted;
                  const quizDone = p?.quizScore !== null;
                  
                  return (
                    <div key={topic.id} className="topic-progress-item">
                      <div className="topic-name">{topic.title}</div>
                      <div className="topic-stats">
                        <span className="stat-badge" title="Video">
                          {videoDone ? '✅' : '⚪'}
                        </span>
                        {topic.questions.length > 0 && (
                          <span className="stat-badge quiz-badge" title="Quiz">
                            {quizDone ? `⭐ ${p.quizScore}/${topic.questions.length}` : '⚪'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressScreen;
