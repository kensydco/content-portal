import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import ConfigForm from '../components/admin/ConfigForm';
import Spinner from '../components/ui/Spinner';

export default function AdminConfigPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    } else if (!isLoading && user?.role !== 'SuperAdmin') {
      navigate('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <ConfigForm />
      </div>
    </AdminLayout>
  );
}
