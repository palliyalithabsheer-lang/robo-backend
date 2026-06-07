import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export type NavPage =
  | 'dashboard' | 'grades' | 'subjects' | 'topics'
  | 'videos' | 'quiz-bank' | 'study-materials'
  | 'students' | 'subscriptions' | 'reports' | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const navGroups = [
  {
    label: 'Overview',
    permission: undefined,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    label: 'Content',
    permission: 'manage_content',
    items: [
      { id: 'grades', label: 'Grades', icon: '🎓' },
      { id: 'subjects', label: 'Subjects', icon: '📚' },
      { id: 'topics', label: 'Topics', icon: '📖' },
      { id: 'videos', label: 'Videos', icon: '🎬' },
      { id: 'quiz-bank', label: 'Quiz Bank', icon: '✅' },
      { id: 'study-materials', label: 'Study Materials', icon: '📎' },
    ],
  },
  {
    label: 'People',
    permission: 'manage_students', // simplified, we check items individually below
    items: [
      { id: 'students', label: 'Students', icon: '👥', permission: 'manage_students' },
      { id: 'subscriptions', label: 'Subscriptions', icon: '⭐', permission: 'manage_subscriptions' },
    ],
  },
  {
    label: 'Analytics',
    permission: 'view_reports',
    items: [
      { id: 'reports', label: 'Reports', icon: '📈' },
    ],
  },
  {
    label: 'System',
    permission: 'manage_settings',
    items: [
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ],
  },
] as const;

const roleLabel = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  content_manager: 'Content Manager',
};

const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const { user, hasPermission, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🤖</div>
        <div className="logo-text">
          <span className="logo-name">Tutor Robot</span>
          <span className="logo-sub">Admin Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map(group => {
          if (group.permission && !hasPermission(group.permission as any)) return null;

          const visibleItems = group.items.filter(item => 
            !("permission" in item) || hasPermission((item as any).permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {visibleItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id as NavPage)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-role">{roleLabel[user.role as keyof typeof roleLabel] || user.role}</p>
          </div>
          <button 
            onClick={logout} 
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginLeft: 'auto', fontSize: '1.2rem' }}
            title="Log out"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
