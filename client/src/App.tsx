import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import UploadPage from './pages/UploadPage';
import UploadSuccessPage from './pages/UploadSuccessPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminConfigPage from './pages/AdminConfigPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminStudiosPage from './pages/AdminStudiosPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Member Routes */}
            <Route path="/" element={<UploadPage />} />
            <Route path="/success" element={<UploadSuccessPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/studios" element={<AdminStudiosPage />} />
            <Route path="/admin/config" element={<AdminConfigPage />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
