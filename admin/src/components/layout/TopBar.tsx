import type { NavPage } from './Sidebar';
import { currentAdmin } from '../../data/mockData';
import './TopBar.css';

const PAGE_TITLES: Record<NavPage, string> = {
  dashboard: 'Dashboard',
  grades: 'Grades',
  subjects: 'Subjects',
  topics: 'Topics',
  videos: 'Videos',
  'quiz-bank': 'Quiz Bank',
  'study-materials': 'Study Materials',
  students: 'Students',
  subscriptions: 'Subscriptions',
  reports: 'Reports',
  settings: 'Settings',
};

interface TopBarProps {
  activePage: NavPage;
}

const TopBar = ({ activePage }: TopBarProps) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>Tutor Robot</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-active">{PAGE_TITLES[activePage]}</span>
      </div>

      <div className="topbar-spacer" />

      <span className="topbar-date">{today}</span>

      {/* Search */}
      <div className="topbar-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search..." />
      </div>

      {/* Action buttons */}
      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications" title="Notifications">
          🔔
          <span className="notif-dot" />
        </button>
        <button className="topbar-icon-btn" aria-label="Help" title="Help">
          ❓
        </button>
        <div className="topbar-avatar" title={currentAdmin.name}>
          {currentAdmin.avatar}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
