import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Subject } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

const Subjects = () => {
  const { grades, subjects, addSubject, updateSubject, deleteSubject } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [gradeId, setGradeId] = useState('');

  const handleOpenAdd = () => {
    setCurrentSubject(null);
    setTitle('');
    setGradeId(grades.length > 0 ? grades[0].id : '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setCurrentSubject(subject);
    setTitle(subject.title);
    setGradeId(subject.gradeId);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (subject: Subject) => {
    setCurrentSubject(subject);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !gradeId) return;

    if (currentSubject) {
      updateSubject(currentSubject.id, { title, gradeId });
    } else {
      addSubject({ title, gradeId });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (currentSubject) {
      deleteSubject(currentSubject.id);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { key: 'title', title: 'Subject Name' },
    { 
      key: 'gradeTitle', 
      title: 'Assigned Grade',
      render: (subject: Subject) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
          {subject.gradeTitle}
        </span>
      )
    },
    { key: 'topicCount', title: 'Topics' },
    { key: 'createdAt', title: 'Created At' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        title="Subject Management"
        data={subjects}
        columns={columns}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        addButtonLabel="Add Subject"
      />

      <Modal
        isOpen={isModalOpen}
        title={currentSubject ? "Edit Subject" : "Add New Subject"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <div className="modal-form-group">
          <label>Subject Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Science"
          />
        </div>
        
        <div className="modal-form-group">
          <label>Assign to Grade</label>
          <select 
            value={gradeId} 
            onChange={e => setGradeId(e.target.value)}
          >
            <option value="" disabled>Select a grade</option>
            {grades.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Subject"
        onClose={() => setIsDeleteModalOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete <strong>{currentSubject?.title}</strong>?</p>
        <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', marginTop: '10px' }}>
          Warning: This will also delete all topics associated with this subject!
        </p>
      </Modal>
    </div>
  );
};

export default Subjects;
