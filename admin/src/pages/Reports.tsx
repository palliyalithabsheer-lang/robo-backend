import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, 
} from 'recharts';
import { useAdmin } from '../context/AdminContext';
import { studentGrowthData, topicCompletionData, quizScoreData } from '../data/mockData';
import Table from '../components/ui/Table';
import './Reports.css';

const Reports = () => {
  const { students, subscriptionPlans, subscriptions, topics } = useAdmin();
  const [activeReportTab, setActiveReportTab] = useState<'student_progress' | 'topic_performance' | 'subscription_report'>('student_progress');

  const handleExport = (format: 'PDF' | 'Excel') => {
    // Mock export functionality
    alert(`Successfully exported ${activeReportTab.replace('_', ' ')} as ${format}.`);
  };

  // Prepare table data for Student Progress
  const studentProgressColumns = [
    { key: 'name', title: 'Student Name' },
    { key: 'gradeTitle', title: 'Grade' },
    { key: 'completedTopicsCount', title: 'Topics Completed' },
    { key: 'quizzesDone', title: 'Quizzes Taken' },
    { key: 'avgScore', title: 'Avg Score', render: (s: any) => `${s.avgScore}%` },
    { key: 'progressPercentage', title: 'Overall Progress', render: (s: any) => `${s.progressPercentage}%` }
  ];

  // Prepare table data for Topic Performance
  // We'll map the mock topicCompletionData and join it with actual topics for a realistic look
  const topicPerformanceData = topicCompletionData.map(tc => {
    const actualTopic = topics.find(t => t.title === tc.topic);
    return {
      topicName: tc.topic,
      gradeTitle: actualTopic?.gradeTitle || 'Multiple',
      completionRate: tc.completionRate,
      avgScore: Math.floor(Math.random() * 20) + 75, // mock avg score
      totalAttempts: Math.floor(Math.random() * 500) + 50 // mock attempts
    };
  });

  const topicPerformanceColumns = [
    { key: 'topicName', title: 'Topic Name' },
    { key: 'gradeTitle', title: 'Grade' },
    { key: 'totalAttempts', title: 'Total Attempts' },
    { key: 'avgScore', title: 'Avg Score', render: (t: any) => `${t.avgScore}%` },
    { key: 'completionRate', title: 'Completion Rate', render: (t: any) => `${t.completionRate}%` }
  ];

  // Prepare table data for Subscription Report
  const subscriptionReportData = subscriptionPlans.map(plan => {
    const activeUsersOnPlan = subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length;
    return {
      planName: plan.name,
      monthlyPrice: plan.monthlyPrice,
      activeUsers: activeUsersOnPlan,
      estimatedMRR: activeUsersOnPlan * plan.monthlyPrice,
      growthRate: `+${(Math.random() * 10).toFixed(1)}%` // mock growth
    };
  });

  const subscriptionReportColumns = [
    { key: 'planName', title: 'Plan Name' },
    { key: 'monthlyPrice', title: 'Monthly Price', render: (p: any) => `$${p.monthlyPrice.toFixed(2)}` },
    { key: 'activeUsers', title: 'Active Subscribers' },
    { key: 'estimatedMRR', title: 'Estimated MRR', render: (p: any) => `$${p.estimatedMRR.toFixed(2)}` },
    { key: 'growthRate', title: 'MoM Growth', render: (p: any) => <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>{p.growthRate}</span> }
  ];

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Analytics Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Monitor platform growth, engagement, and content performance.</p>
        </div>
        <div className="reports-actions">
          <button className="btn-export btn-export-pdf" onClick={() => handleExport('PDF')}>
            📄 Export PDF
          </button>
          <button className="btn-export btn-export-excel" onClick={() => handleExport('Excel')}>
            📊 Export Excel
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Growth Chart */}
        <div className="chart-card chart-card-full">
          <div className="chart-title">Platform Growth (6 Months)</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={studentGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" name="Total Students" dataKey="students" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Active Subscriptions" dataKey="subscriptions" stroke="var(--color-purple)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Completion Chart */}
        <div className="chart-card">
          <div className="chart-title">Topic Completion Rates (%)</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={topicCompletionData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} width={100} style={{ fontSize: '0.75rem' }} />
                <RechartsTooltip cursor={{ fill: 'var(--color-primary-soft)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-sm)' }} />
                <Bar dataKey="completionRate" name="Completion %" fill="var(--color-blue)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Quiz Scores */}
        <div className="chart-card">
          <div className="chart-title">Average Quiz Scores by Grade</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={quizScoreData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: 'var(--color-primary-soft)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-sm)' }} />
                <Bar dataKey="avgScore" name="Avg Score (%)" fill="var(--color-green)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabular Reports Section */}
      <div className="reports-tabs">
        <button 
          className={`reports-tab ${activeReportTab === 'student_progress' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('student_progress')}
        >
          Student Progress
        </button>
        <button 
          className={`reports-tab ${activeReportTab === 'topic_performance' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('topic_performance')}
        >
          Topic Performance
        </button>
        <button 
          className={`reports-tab ${activeReportTab === 'subscription_report' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('subscription_report')}
        >
          Subscription Revenue
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        {activeReportTab === 'student_progress' && (
          <Table 
            title="Detailed Student Progress"
            data={students}
            columns={studentProgressColumns}
          />
        )}
        
        {activeReportTab === 'topic_performance' && (
          <Table 
            title="Content Performance Metrics"
            data={topicPerformanceData}
            columns={topicPerformanceColumns}
          />
        )}

        {activeReportTab === 'subscription_report' && (
          <Table 
            title="Subscription & MRR Breakdown"
            data={subscriptionReportData}
            columns={subscriptionReportColumns}
          />
        )}
      </div>

    </div>
  );
};

export default Reports;
