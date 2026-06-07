import StatCard from '../components/ui/StatCard';
import { dashboardStats, recentActivity } from '../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <div className="dashboard-actions">
          <button>
            <span>➕</span> Add New Content
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="👥"
          label="Total Students"
          value={dashboardStats.totalStudents}
          trend={dashboardStats.studentGrowth}
          accentColor="var(--color-blue)"
          iconBg="var(--color-blue-soft)"
        />
        <StatCard
          icon="⭐"
          label="Active Subscriptions"
          value={dashboardStats.totalSubscriptions}
          trend={dashboardStats.subscriptionGrowth}
          accentColor="var(--color-amber)"
          iconBg="var(--color-amber-soft)"
        />
        <StatCard
          icon="🎓"
          label="Total Grades"
          value={dashboardStats.totalGrades}
          accentColor="var(--color-purple)"
          iconBg="var(--color-purple-soft)"
        />
        <StatCard
          icon="📚"
          label="Total Subjects"
          value={dashboardStats.totalSubjects}
          accentColor="var(--color-teal)"
          iconBg="var(--color-teal-soft)"
        />
        <StatCard
          icon="📖"
          label="Total Topics"
          value={dashboardStats.totalTopics}
          accentColor="var(--color-green)"
          iconBg="var(--color-green-soft)"
        />
      </div>

      <div className="content-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Platform Engagement</h2>
            <button className="view-all">View Report</button>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            [ Chart Placeholder ]
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p className="activity-text">{activity.message}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
