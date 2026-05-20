import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import BranchesPage from './pages/BranchesPage';
import RolesPage from './pages/RolesPage';
import StaffPage from './pages/StaffPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryTransactionsPage from './pages/inventory/InventoryTransactionsPage';
import InventorySettingsPage from './pages/inventory/InventorySettingsPage';
import InventoryCategoriesPage from './pages/inventory/InventoryCategoriesPage';
import MenuPage from './pages/MenuPage';
import TablesPage from './pages/TablesPage';
import OrdersPage from './pages/OrdersPage';
import InvoicesPage from './pages/InvoicesPage';
import CreateOrderPage from './pages/CreateOrderPage';
import TakeOrderPage from './pages/TakeOrderPage';
import VendorsPage from './pages/VendorsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="branches" element={<BranchesPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/transactions" element={<InventoryTransactionsPage />} />
              <Route path="inventory/settings" element={<InventorySettingsPage />} />
              <Route path="inventory/categories" element={<InventoryCategoriesPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="orders/new" element={<CreateOrderPage />} />
              <Route path="take-order" element={<TakeOrderPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="account-settings" element={<AccountSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
