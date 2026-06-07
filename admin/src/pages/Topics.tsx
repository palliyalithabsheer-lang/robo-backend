import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Topic } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

const Topics = () => {
  const { grades, subjects, topics, addTopic, updateTopic, deleteTopic } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const handleOpenAdd = () => {
    setCurrentTopic(null);
    setTitle('');
    setVideoUrl('');
    setSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic: Topic) => {
    setCurrentTopic(topic);
    setTitle(topic.title);
    setVideoUrl(topic.videoUrl);
    setSubjectId(topic.subjectId);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (topic: Topic) => {
    setCurrentTopic(topic);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !subjectId) return;

    if (currentTopic) {
      updateTopic(currentTopic.id, { title, videoUrl, subjectId });
    } else {
      addTopic({ title, videoUrl, subjectId });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (currentTopic) {
      deleteTopic(currentTopic.id);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { key: 'title', title: 'Topic Name' },
    { 
      key: 'subjectTitle', 
      title: 'Subject / Grade',
      render: (topic: Topic) => (
        <div>
          <span style={{ fontWeight: 600 }}>{topic.subjectTitle}</span>
          <br/>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {topic.gradeTitle}
          </span>
        </div>
      )
    },
    { key: 'questionCount', title: 'Questions' },
    { key: 'createdAt', title: 'Created At' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        title="Topic Management"
        data={topics}
        columns={columns}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        addButtonLabel="Add Topic"
      />

      <Modal
        isOpen={isModalOpen}
        title={currentTopic ? "Edit Topic" : "Add New Topic"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <div className="modal-form-group">
          <label>Topic Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Photosynthesis"
          />
        </div>
        
        <div className="modal-form-group">
          <label>Video URL</label>
          <input 
            type="url" 
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="modal-form-group">
          <label>Assign to Subject</label>
          <select 
            value={subjectId} 
            onChange={e => setSubjectId(e.target.value)}
          >
            <option value="" disabled>Select a subject</option>
            {grades.map(grade => {
              const gradeSubjects = subjects.filter(s => s.gradeId === grade.id);
              if (gradeSubjects.length === 0) return null;
              
              return (
                <optgroup key={grade.id} label={grade.title}>
                  {gradeSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Topic"
        onClose={() => setIsDeleteModalOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete <strong>{currentTopic?.title}</strong>?</p>
        <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', marginTop: '10px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Topics;
