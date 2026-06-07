import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Sidebar, { type NavPage } from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Grades from './pages/Grades';
import Subjects from './pages/Subjects';
import Topics from './pages/Topics';
import Videos from './pages/Videos';
import QuizBank from './pages/QuizBank';
import StudyMaterials from './pages/StudyMaterials';
import Subscriptions from './pages/Subscriptions';
import Students from './pages/Students';
import Reports from './pages/Reports';
import RoleGuard from './guards/RoleGuard';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<NavPage>('dashboard');

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      
      // Content Management (requires manage_content)
      case 'grades': 
        return <RoleGuard requirePermission="manage_content" fallback={<div>Access Denied</div>}><Grades /></RoleGuard>;
      case 'subjects': 
        return <RoleGuard requirePermission="manage_content" fallback={<div>Access Denied</div>}><Subjects /></RoleGuard>;
      case 'topics': 
        return <RoleGuard requirePermission="manage_content" fallback={<div>Access Denied</div>}><Topics /></RoleGuard>;
      case 'videos': 
        return <RoleGuard requirePermission="manage_content" fallback={<div>Access Denied</div>}><Videos /></RoleGuard>;
      case 'quiz-bank': 
        return <RoleGuard requirePermission="manage_content" fallback={<div>Access Denied</div>}><QuizBank /></RoleGuard>;
      case 'study-materials': 
        return <RoleGuard requirePermission="manage_content" fallback={<div>Access Denied</div>}><StudyMaterials /></RoleGuard>;
      
      // Subscriptions (requires manage_subscriptions)
      case 'subscriptions': 
        return <RoleGuard requirePermission="manage_subscriptions" fallback={<div>Access Denied</div>}><Subscriptions /></RoleGuard>;
      
      // Students (requires manage_students)
      case 'students': 
        return <RoleGuard requirePermission="manage_students" fallback={<div>Access Denied</div>}><Students /></RoleGuard>;
      
      // Reports (requires view_reports)
      case 'reports': 
        return <RoleGuard requirePermission="view_reports" fallback={<div>Access Denied</div>}><Reports /></RoleGuard>;
      
      default:
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h2>{activePage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
            <p style={{ marginTop: '10px' }}>This section is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <TopBar activePage={activePage} />
      
      <main 
        style={{
          marginLeft: 'var(--sidebar-w)',
          marginTop: 'var(--topbar-h)',
          minHeight: 'calc(100vh - var(--topbar-h))',
          position: 'relative'
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
