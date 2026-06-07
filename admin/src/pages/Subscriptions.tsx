import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { SubscriptionPlan, Subscription } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import './Subscriptions.css';

const Subscriptions = () => {
  const { 
    grades, 
    subjects, 
    subscriptionPlans, 
    subscriptions, 
    addSubscriptionPlan, 
    updateSubscriptionPlan, 
    deleteSubscriptionPlan 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'plans' | 'active_subs'>('plans');

  // Plan Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);

  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [yearlyPrice, setYearlyPrice] = useState<number>(0);
  const [accessibleGrades, setAccessibleGrades] = useState<string[]>([]);
  const [accessibleSubjects, setAccessibleSubjects] = useState<string[]>([]);

  const resetForm = () => {
    setCurrentPlan(null);
    setName('');
    setMonthlyPrice(0);
    setYearlyPrice(0);
    setAccessibleGrades([]);
    setAccessibleSubjects([]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setName(plan.name);
    setMonthlyPrice(plan.monthlyPrice);
    setYearlyPrice(plan.yearlyPrice);
    setAccessibleGrades(plan.accessibleGrades || []);
    setAccessibleSubjects(plan.accessibleSubjects || []);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDeleteOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const data = {
      name,
      monthlyPrice,
      yearlyPrice,
      accessibleGrades,
      accessibleSubjects
    };

    if (currentPlan) {
      updateSubscriptionPlan(currentPlan.id, data);
    } else {
      addSubscriptionPlan(data);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (currentPlan) {
      deleteSubscriptionPlan(currentPlan.id);
      setIsDeleteOpen(false);
    }
  };

  // Checkbox Handlers
  const toggleGrade = (gradeId: string) => {
    setAccessibleGrades(prev => 
      prev.includes(gradeId) ? prev.filter(g => g !== gradeId) : [...prev, gradeId]
    );
  };

  const toggleSubject = (subjectId: string) => {
    setAccessibleSubjects(prev => 
      prev.includes(subjectId) ? prev.filter(s => s !== subjectId) : [...prev, subjectId]
    );
  };

  // Display specific subjects only if their parent grade is selected
  const availableSubjects = subjects.filter(s => accessibleGrades.includes(s.gradeId));

  const planColumns = [
    { key: 'name', title: 'Plan Name' },
    { key: 'monthlyPrice', title: 'Monthly Price', render: (p: SubscriptionPlan) => `$${p.monthlyPrice.toFixed(2)}` },
    { key: 'yearlyPrice', title: 'Yearly Price', render: (p: SubscriptionPlan) => `$${p.yearlyPrice.toFixed(2)}` },
    { key: 'accessibleGrades', title: 'Grades Access', render: (p: SubscriptionPlan) => `${p.accessibleGrades.length} Grades` },
    { key: 'createdAt', title: 'Created At' }
  ];

  const subColumns = [
    { key: 'studentName', title: 'Student Name' },
    { key: 'planName', title: 'Plan' },
    { key: 'startDate', title: 'Start Date' },
    { key: 'endDate', title: 'Expiry Date' },
    { 
      key: 'status', 
      title: 'Status',
      render: (s: Subscription) => (
        <span className={`status-badge status-${s.status}`}>
          {s.status}
        </span>
      )
    }
  ];

  return (
    <div className="subscriptions-page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Subscription Management</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Manage pricing plans and view active subscribers.</p>
      </div>

      <div className="subs-tabs">
        <button 
          className={`subs-tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Subscription Plans
        </button>
        <button 
          className={`subs-tab ${activeTab === 'active_subs' ? 'active' : ''}`}
          onClick={() => setActiveTab('active_subs')}
        >
          Active Subscriptions
        </button>
      </div>

      {activeTab === 'plans' && (
        <Table
          title="Pricing Plans"
          data={subscriptionPlans}
          columns={planColumns}
          onAdd={handleOpenAdd}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          addButtonLabel="Create Plan"
        />
      )}

      {activeTab === 'active_subs' && (
        <Table
          title="Student Subscriptions"
          data={subscriptions}
          columns={subColumns}
          // Read-only, no actions
        />
      )}

      {/* Plan Modal */}
      <Modal
        isOpen={isFormOpen}
        title={currentPlan ? "Edit Plan" : "Create New Plan"}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          
          <div className="modal-form-group">
            <label>Plan Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="modal-form-group">
              <label>Monthly Price ($)</label>
              <input type="number" step="0.01" value={monthlyPrice} onChange={e => setMonthlyPrice(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="modal-form-group">
              <label>Yearly Price ($)</label>
              <input type="number" step="0.01" value={yearlyPrice} onChange={e => setYearlyPrice(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Grade Access */}
            <div className="modal-form-group">
              <label>Accessible Grades</label>
              <div className="checklist-container">
                {grades.map(g => (
                  <label key={g.id} className="checklist-item">
                    <input 
                      type="checkbox" 
                      checked={accessibleGrades.includes(g.id)}
                      onChange={() => toggleGrade(g.id)}
                    />
                    <span>{g.title}</span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Select the grades unlocked by this plan.
              </p>
            </div>

            {/* Subject Access */}
            <div className="modal-form-group">
              <label>Specific Subjects (Optional)</label>
              <div className="checklist-container">
                {availableSubjects.length === 0 && (
                  <div style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Select grades first to see subjects.
                  </div>
                )}
                {availableSubjects.map(s => (
                  <label key={s.id} className="checklist-item">
                    <input 
                      type="checkbox" 
                      checked={accessibleSubjects.includes(s.id)}
                      onChange={() => toggleSubject(s.id)}
                    />
                    <span>{s.title} ({s.gradeTitle})</span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                If empty, grants access to ALL subjects in the selected grades.
              </p>
            </div>

          </div>

        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        title="Delete Plan"
        onClose={() => setIsDeleteOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete the <strong>{currentPlan?.name}</strong> plan?</p>
        <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', marginTop: '10px' }}>
          This may affect active subscribers currently on this plan.
        </p>
      </Modal>
    </div>
  );
};

export default Subscriptions;
