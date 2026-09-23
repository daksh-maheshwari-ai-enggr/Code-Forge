import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ModerationQueuePage from './pages/ModerationQueuePage';
import ReportsPage from './pages/ReportsPage';
import AppealsPage from './pages/AppealsPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PlaygroundPage from './pages/PlaygroundPage';
import { getDashboardStats } from './services/api';

type Page =
  | 'dashboard'
  | 'moderation'
  | 'reports'
  | 'appeals'
  | 'users'
  | 'audit'
  | 'analytics'
  | 'playground';

const PAGE_COMPONENTS: Record<Page, React.FC> = {
  dashboard: DashboardPage,
  moderation: ModerationQueuePage,
  reports: ReportsPage,
  appeals: AppealsPage,
  users: UsersPage,
  audit: AuditLogsPage,
  analytics: AnalyticsPage,
  playground: PlaygroundPage,
};

const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated, refreshKey]);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data?.kpis);
    } catch {}
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const PageComponent = PAGE_COMPONENTS[currentPage];

  return (
    <div className="gradient-bg">
      {/* Fixed background orbs */}
      <div className="gradient-orb-1" />
      <div className="gradient-orb-2" />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        stats={stats}
      />

      {/* Navbar */}
      <Navbar onRefresh={handleRefresh} />

      {/* Main Content */}
      <main className="page-content" key={`${currentPage}-${refreshKey}`}>
        <PageComponent />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
