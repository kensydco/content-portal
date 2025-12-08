import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import StudioManager from '../components/admin/StudioManager';
import Spinner from '../components/ui/Spinner';

export default function AdminStudiosPage() {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Studio Management</h1>
          <p className="text-neutral-600">
            Manage studio locations and their social media handles
          </p>
        </div>

        <StudioManager />
      </div>
    </AdminLayout>
  );
}
