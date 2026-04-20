import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import LoginPage from './features/auth/components/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import VendorsPage from './features/vendors/components/VendorsPage'
import InventoryPage from './features/inventory/components/InventoryPage'
import InventoryTransactionsPage from './features/inventory/components/InventoryTransactionsPage'
import MenusPage from './features/menus/components/MenusPage'
import OrdersPage from './features/orders/components/OrdersPage'
import ReservationsPage from './features/orders/components/ReservationsPage'
import InvoicesPage from './features/invoices/components/InvoicesPage'
import InvoiceHistoryPage from './features/invoices/components/InvoiceHistoryPage'
import PurchasesPage from './features/purchases/components/PurchasesPage'
import CreatePurchasePage from './features/purchases/components/CreatePurchasePage'
import AdministrationPage from './features/administration/components/AdministrationPage'
import FinancesPage from './features/finances/components/FinancesPage'
import TenantRegistrationPage from './features/tenants/components/TenantRegistrationPage'
import BusinessDetailPage from './features/business-details/components/BusinessDetailPage'
import { BusinessDetailGuard } from './components/auth/BusinessDetailGuard'
import { useAuthStore } from './features/auth/store/authStore'
import { WebSocketProvider } from './providers/WebSocketProvider'



function App() {
  const { role } = useAuthStore() // I need to import this

  return (
    <WebSocketProvider>
      <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={
                role === "SUPER_ADMIN" 
                  ? <Navigate to="/tenants" replace /> 
                  : <Navigate to="/vendors" replace />
              } />

              {/* Regular Tenant Admin/User Routes */}
              <Route element={<ProtectedRoute excludeRole="SUPER_ADMIN" />}>
                <Route element={<BusinessDetailGuard />}>
                  <Route path="vendors" element={<VendorsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="inventory/transactions/:variantId?" element={<InventoryTransactionsPage />} />
                  <Route path="menus" element={<MenusPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="reservations" element={<ReservationsPage />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="invoices/history" element={<InvoiceHistoryPage />} />
                  <Route path="purchases" element={<PurchasesPage />} />
                  <Route path="purchases/new" element={<CreatePurchasePage />} />
                  <Route path="finances" element={<FinancesPage />} />
                  <Route path="administration" element={<AdministrationPage />} />
                  <Route path="business-details" element={<BusinessDetailPage />} />
                </Route>
              </Route>
              
              {/* Super Admin Only Routes */}
              <Route element={<ProtectedRoute requiredRole="SUPER_ADMIN" />}>
                <Route path="tenants" element={<TenantRegistrationPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  )
}

export default App
