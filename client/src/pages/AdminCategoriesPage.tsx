import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import CategoryManager from '../components/admin/CategoryManager';
import Spinner from '../components/ui/Spinner';

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

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
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Categories</h1>
          <p className="text-neutral-600">
            Manage content categories available for upload
          </p>
        </div>

        <CategoryManager />
      </div>
    </AdminLayout>
  );
}
