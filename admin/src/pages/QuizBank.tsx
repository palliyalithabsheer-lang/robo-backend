import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { QuizQuestion } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ContentStatusBadge from '../components/ui/ContentStatusBadge';
import PublishActions from '../components/ui/PublishActions';
import './QuizBank.css';

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  VOICE_RESPONSE: 'Voice Response'
};

const QuizBank = () => {
  const { grades, subjects, topics, quizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion, updateQuizQuestionStatus } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);

  // Form State
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'VOICE_RESPONSE'>('MULTIPLE_CHOICE');

  // Dynamic Type State
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>(['']);

  const resetForm = () => {
    setCurrentQuestion(null);
    setGradeId('');
    setSubjectId('');
    setTopicId('');
    setQuestionText('');
    setQuestionType('MULTIPLE_CHOICE');
    setOptions(['', '']);
    setCorrectAnswer('');
    setAcceptedAnswers(['']);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (q: QuizQuestion) => {
    setCurrentQuestion(q);
    setGradeId(q.gradeId || '');
    setSubjectId(q.subjectId || '');
    setTopicId(q.topicId);
    setQuestionText(q.question);
    setQuestionType(q.questionType);
    setOptions(q.options || ['', '']);
    setCorrectAnswer(q.correctAnswer || '');
    setAcceptedAnswers(q.acceptedAnswers || ['']);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (q: QuizQuestion) => {
    setCurrentQuestion(q);
    setIsDeleteOpen(true);
  };

  const handleSubmit = () => {
    if (!questionText.trim() || !topicId) return;

    // Build the data object based on type
    const data: Partial<Omit<QuizQuestion, 'id' | 'createdAt' | 'topicTitle'>> = {
      gradeId,
      subjectId,
      topicId,
      question: questionText,
      questionType
    };

    if (questionType === 'MULTIPLE_CHOICE') {
      const validOptions = options.filter(o => o.trim() !== '');
      if (validOptions.length < 2) return; // Need at least 2 options
      data.options = validOptions;
      data.correctAnswer = correctAnswer || validOptions[0]; // Default to first if not set
    } else if (questionType === 'TRUE_FALSE') {
      data.correctAnswer = correctAnswer || 'True';
    } else if (questionType === 'VOICE_RESPONSE') {
      const validAnswers = acceptedAnswers.filter(a => a.trim() !== '');
      if (validAnswers.length === 0) return;
      data.acceptedAnswers = validAnswers;
    }

    if (currentQuestion) {
      updateQuizQuestion(currentQuestion.id, data);
    } else {
      // Cast is safe here because we guarantee topicId is present, which satisfies Omit requirements
      addQuizQuestion({ ...data, status: 'draft' } as Omit<QuizQuestion, 'id' | 'createdAt' | 'topicTitle'>);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (currentQuestion) {
      deleteQuizQuestion(currentQuestion.id);
      setIsDeleteOpen(false);
    }
  };

  // Multiple Choice Helpers
  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };
  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Enforce minimum 2 options
    setOptions(options.filter((_, i) => i !== index));
  };

  // Voice Response Helpers
  const handleAnswerChange = (index: number, val: string) => {
    const newAnswers = [...acceptedAnswers];
    newAnswers[index] = val;
    setAcceptedAnswers(newAnswers);
  };
  const addAnswer = () => setAcceptedAnswers([...acceptedAnswers, '']);
  const removeAnswer = (index: number) => {
    if (acceptedAnswers.length <= 1) return;
    setAcceptedAnswers(acceptedAnswers.filter((_, i) => i !== index));
  };

  const filteredSubjects = subjects.filter(s => s.gradeId === gradeId);
  const filteredTopics = topics.filter(t => t.subjectId === subjectId);

  const columns = [
    { key: 'question', title: 'Question Text', render: (q: QuizQuestion) => <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question}</div> },
    { 
      key: 'questionType', 
      title: 'Type',
      render: (q: QuizQuestion) => {
        let badgeClass = 'badge-type-mc';
        if (q.questionType === 'TRUE_FALSE') badgeClass = 'badge-type-tf';
        if (q.questionType === 'VOICE_RESPONSE') badgeClass = 'badge-type-vr';
        
        return <span className={`badge badge-type ${badgeClass}`}>{QUESTION_TYPES[q.questionType]}</span>;
      }
    },
    { key: 'topicTitle', title: 'Topic' },
    {
      key: 'status',
      title: 'Status',
      render: (q: QuizQuestion) => <ContentStatusBadge status={q.status} />
    },
    {
      key: 'publish',
      title: 'Publishing',
      render: (q: QuizQuestion) => (
        <PublishActions
          status={q.status}
          onPublish={() => updateQuizQuestionStatus(q.id, 'published')}
          onUnpublish={() => updateQuizQuestionStatus(q.id, 'draft')}
          onArchive={() => updateQuizQuestionStatus(q.id, 'archived')}
        />
      )
    },
    { key: 'createdAt', title: 'Created At' }
  ];

  return (
    <div className="quiz-bank-page">
      <Table
        title="Quiz Question Bank"
        data={quizQuestions}
        columns={columns}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        addButtonLabel="Create Question"
      />

      <Modal
        isOpen={isFormOpen}
        title={currentQuestion ? "Edit Question" : "Create New Question"}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          {/* ASSIGNMENT SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="modal-form-group">
              <label>Grade</label>
              <select value={gradeId} onChange={e => { setGradeId(e.target.value); setSubjectId(''); setTopicId(''); }}>
                <option value="" disabled>Select Grade</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Subject</label>
              <select value={subjectId} onChange={e => { setSubjectId(e.target.value); setTopicId(''); }} disabled={!gradeId}>
                <option value="" disabled>Select Subject</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Topic</label>
              <select value={topicId} onChange={e => setTopicId(e.target.value)} disabled={!subjectId}>
                <option value="" disabled>Select Topic</option>
                {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

          {/* CORE QUESTION SECTION */}
          <div className="modal-form-group">
            <label>Question Type</label>
            <select value={questionType} onChange={e => setQuestionType(e.target.value as any)}>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="VOICE_RESPONSE">Voice Response</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>Question Text</label>
            <textarea 
              value={questionText} 
              onChange={e => setQuestionText(e.target.value)} 
              placeholder="e.g. Which of the following is..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--color-border)', resize: 'vertical', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* DYNAMIC SECTION */}
          <div className="dynamic-form-section">
            <div className="dynamic-form-title">
              {questionType === 'MULTIPLE_CHOICE' && 'Multiple Choice Options'}
              {questionType === 'TRUE_FALSE' && 'True / False Settings'}
              {questionType === 'VOICE_RESPONSE' && 'Accepted Voice Answers'}
            </div>

            {/* MULTIPLE CHOICE */}
            {questionType === 'MULTIPLE_CHOICE' && (
              <div className="option-list">
                {options.map((opt, i) => (
                  <div key={i} className="option-item">
                    <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                    {options.length > 2 && (
                      <button className="btn-remove-option" onClick={() => removeOption(i)}>×</button>
                    )}
                  </div>
                ))}
                <button className="btn-add-option" onClick={addOption}>+ Add Option</button>
                
                <div className="modal-form-group" style={{ marginTop: '16px' }}>
                  <label>Select Correct Answer</label>
                  <select value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
                    <option value="" disabled>Choose the correct option</option>
                    {options.filter(o => o.trim() !== '').map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TRUE / FALSE */}
            {questionType === 'TRUE_FALSE' && (
              <div className="modal-form-group">
                <label>Correct Answer is:</label>
                <select value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}

            {/* VOICE RESPONSE */}
            {questionType === 'VOICE_RESPONSE' && (
              <div className="option-list">
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  Provide all acceptable variations (e.g. "Carbon Dioxide", "CO2"). Not case sensitive.
                </p>
                {acceptedAnswers.map((ans, i) => (
                  <div key={i} className="option-item">
                    <input type="text" value={ans} onChange={e => handleAnswerChange(i, e.target.value)} placeholder={`Variation ${i + 1}`} />
                    {acceptedAnswers.length > 1 && (
                      <button className="btn-remove-option" onClick={() => removeAnswer(i)}>×</button>
                    )}
                  </div>
                ))}
                <button className="btn-add-option" onClick={addAnswer}>+ Add Accepted Variation</button>
              </div>
            )}
          </div>

        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        title="Delete Question"
        onClose={() => setIsDeleteOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete this question?</p>
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
          <em>"{currentQuestion?.question}"</em>
        </div>
        <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', marginTop: '12px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default QuizBank;
