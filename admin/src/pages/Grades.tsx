import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Grade } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

const Grades = () => {
  const { grades, addGrade, updateGrade, deleteGrade } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const handleOpenAdd = () => {
    setCurrentGrade(null);
    setTitle('');
    setIsPremium(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grade: Grade) => {
    setCurrentGrade(grade);
    setTitle(grade.title);
    setIsPremium(grade.isPremium);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (grade: Grade) => {
    setCurrentGrade(grade);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (currentGrade) {
      updateGrade(currentGrade.id, { title, isPremium });
    } else {
      addGrade({ title, isPremium });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (currentGrade) {
      deleteGrade(currentGrade.id);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { key: 'title', title: 'Grade Name' },
    { 
      key: 'isPremium', 
      title: 'Access Level',
      render: (grade: Grade) => (
        <span className={`badge ${grade.isPremium ? 'badge-premium' : 'badge-free'}`}>
          {grade.isPremium ? 'Premium' : 'Free'}
        </span>
      )
    },
    { key: 'subjectCount', title: 'Subjects' },
    { key: 'createdAt', title: 'Created At' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        title="Grade Management"
        data={grades}
        columns={columns}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        addButtonLabel="Add Grade"
      />

      <Modal
        isOpen={isModalOpen}
        title={currentGrade ? "Edit Grade" : "Add New Grade"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <div className="modal-form-group">
          <label>Grade Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Grade 1"
          />
        </div>
        <label className="modal-form-checkbox">
          <input 
            type="checkbox"
            checked={isPremium}
            onChange={e => setIsPremium(e.target.checked)}
          />
          <span>Premium Content (Requires Subscription)</span>
        </label>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Grade"
        onClose={() => setIsDeleteModalOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete <strong>{currentGrade?.title}</strong>?</p>
        <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', marginTop: '10px' }}>
          Warning: This will also delete all subjects and topics associated with this grade!
        </p>
      </Modal>
    </div>
  );
};

export default Grades;
