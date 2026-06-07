import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Student } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import './Students.css';

const Students = () => {
  const { 
    grades, 
    subscriptionPlans,
    students, 
    addStudent, 
    updateStudent,
    updateStudentStatus
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(0);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [subscriptionPlanId, setSubscriptionPlanId] = useState('');

  // Profile View State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  const resetForm = () => {
    setCurrentStudent(null);
    setName('');
    setEmail('');
    setAge(0);
    setParentName('');
    setParentEmail('');
    setGradeId('');
    setSubscriptionPlanId('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setCurrentStudent(student);
    setName(student.name);
    setEmail(student.email);
    setAge(student.age);
    setParentName(student.parentName);
    setParentEmail(student.parentEmail);
    setGradeId(student.gradeId);
    setSubscriptionPlanId(student.subscriptionPlanId);
    setIsFormOpen(true);
  };

  const handleOpenProfile = (student: Student) => {
    setProfileStudent(student);
    setIsProfileOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !gradeId || !subscriptionPlanId) return;

    const data = {
      name,
      email,
      age,
      parentName,
      parentEmail,
      gradeId,
      subscriptionPlanId,
      status: currentStudent?.status || 'active' as const
    };

    if (currentStudent) {
      updateStudent(currentStudent.id, data);
    } else {
      addStudent(data);
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateStudentStatus(id, currentStatus === 'active' ? 'inactive' : 'active');
  };

  const displayedStudents = students.filter(s => s.status === activeTab);

  const columns = [
    { key: 'name', title: 'Student Name' },
    { key: 'gradeTitle', title: 'Grade' },
    { 
      key: 'subscriptionPlanId', 
      title: 'Plan',
      render: (s: Student) => {
        const plan = subscriptionPlans.find(p => p.id === s.subscriptionPlanId);
        return plan ? plan.name : 'Unknown';
      }
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (s: Student) => (
        <span className={`status-badge status-${s.status}`}>
          {s.status}
        </span>
      )
    },
    {
      key: 'actions',
      title: '',
      render: (s: Student) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-action-suspend" 
            style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
            onClick={() => handleOpenProfile(s)}
          >
            Profile
          </button>
          <button 
            className="btn-action-suspend" 
            style={{ background: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            onClick={() => handleOpenEdit(s)}
          >
            Edit
          </button>
          {s.status === 'active' ? (
            <button className="btn-action-suspend" onClick={() => handleToggleStatus(s.id, s.status)}>Suspend</button>
          ) : (
            <button className="btn-action-activate" onClick={() => handleToggleStatus(s.id, s.status)}>Activate</button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="students-page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Student Management</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Manage accounts, track progress, and update enrollments.</p>
      </div>

      <div className="students-tabs">
        <button 
          className={`students-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Students ({students.filter(s => s.status === 'active').length})
        </button>
        <button 
          className={`students-tab ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          Suspended / Inactive ({students.filter(s => s.status === 'inactive').length})
        </button>
      </div>

      <Table
        title={`${activeTab === 'active' ? 'Active' : 'Inactive'} Accounts`}
        data={displayedStudents}
        columns={columns}
        onAdd={handleOpenAdd}
        addButtonLabel="Enroll Student"
      />

      {/* Profile Details Modal */}
      {profileStudent && (
        <Modal
          isOpen={isProfileOpen}
          title="Student Profile"
          onClose={() => setIsProfileOpen(false)}
          onSubmit={() => setIsProfileOpen(false)}
          submitLabel="Close"
        >
          <div>
            <div className="profile-header">
              <div className="profile-avatar">
                {profileStudent.name.charAt(0)}
              </div>
              <div className="profile-info">
                <h2>{profileStudent.name}</h2>
                <p>{profileStudent.email} | Age {profileStudent.age}</p>
                <p>Parent: {profileStudent.parentName} ({profileStudent.parentEmail})</p>
                <div style={{ marginTop: '8px' }}>
                  <span className="badge" style={{ background: 'var(--color-blue-soft)', color: 'var(--color-blue)', marginRight: '8px' }}>
                    {profileStudent.gradeTitle}
                  </span>
                  <span className="badge" style={{ background: 'var(--color-purple-soft)', color: 'var(--color-purple)' }}>
                    {subscriptionPlans.find(p => p.id === profileStudent.subscriptionPlanId)?.name || 'No Plan'}
                  </span>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Performance Overview</h3>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{profileStudent.completedTopicsCount}</div>
                <div className="metric-label">Topics Finished</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{profileStudent.quizzesDone}</div>
                <div className="metric-label">Quizzes Taken</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{profileStudent.avgScore}%</div>
                <div className="metric-label">Avg Quiz Score</div>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-title">Overall Grade Progress</span>
                <span className="progress-percent">{profileStudent.progressPercentage}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${profileStudent.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit / Create Form Modal */}
      <Modal
        isOpen={isFormOpen}
        title={currentStudent ? "Edit Student" : "Enroll Student"}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="modal-form-group">
            <label>Student Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="modal-form-group">
            <label>Student Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="modal-form-group">
            <label>Age</label>
            <input type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)} />
          </div>
          <div className="modal-form-group">
            <label>Subscription Plan</label>
            <select value={subscriptionPlanId} onChange={e => setSubscriptionPlanId(e.target.value)}>
              <option value="" disabled>Select Plan</option>
              {subscriptionPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
        
        <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Parent Details</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="modal-form-group">
            <label>Parent Name</label>
            <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} />
          </div>
          <div className="modal-form-group">
            <label>Parent Email</label>
            <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
        
        <div className="modal-form-group">
          <label>Enrolled Grade</label>
          <select value={gradeId} onChange={e => setGradeId(e.target.value)}>
            <option value="" disabled>Select Grade</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>
      </Modal>

    </div>
  );
};

export default Students;
