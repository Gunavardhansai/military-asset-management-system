import { useState } from 'react';
import { Header } from './components/Header.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PurchasesPage } from './pages/PurchasesPage.jsx';
import { TransfersPage } from './pages/TransfersPage.jsx';
import { AssignmentsPage } from './pages/AssignmentsPage.jsx';
import { ExpendituresPage } from './pages/ExpendituresPage.jsx';
import { InventoryPage } from './pages/InventoryPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PurchasesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/transfers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TransfersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AssignmentsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/expenditures"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ExpendituresPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InventoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AuditLogsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UsersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
