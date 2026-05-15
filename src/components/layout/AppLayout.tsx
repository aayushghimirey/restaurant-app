import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import BranchSelectionScreen from '../../pages/BranchSelectionScreen';

export default function AppLayout() {
  const { isAuthenticated, isTenant, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Force branch selection for tenants if not selected
  if (isTenant && !user?.branchId) {
    return <BranchSelectionScreen />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-surface-900)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
