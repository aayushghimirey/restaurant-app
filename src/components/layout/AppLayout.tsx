import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import BranchSelectionScreen from '../../pages/BranchSelectionScreen';

export default function AppLayout() {
  const { isAuthenticated, isTenant, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isTenant && !user?.branchId) {
    return <BranchSelectionScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900 text-white">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 animate-fade-in relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
