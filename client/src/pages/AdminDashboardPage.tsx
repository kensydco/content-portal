import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubmissions } from '../hooks/useSubmissions';
import AdminLayout from '../components/layout/AdminLayout';
import FilterBar from '../components/admin/FilterBar';
import SubmissionGrid from '../components/admin/SubmissionGrid';
import SubmissionDetailPanel from '../components/admin/SubmissionDetailPanel';
import BulkActionsBar from '../components/admin/BulkActionsBar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Submission } from '../types';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    submissions,
    loading,
    pagination,
    updateFilters,
    changePage,
    refresh,
  } = useSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSelectSubmission = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map((s) => s.submissionId));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Content Submissions</h1>
          <p className="text-neutral-600">
            Review and manage user-submitted content
          </p>
        </div>

        <FilterBar onFilterChange={updateFilters} />

        {/* Select All */}
        {submissions.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === submissions.length && submissions.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700">
                Select All ({submissions.length})
              </span>
            </label>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <SubmissionGrid
              submissions={submissions}
              onSubmissionClick={setSelectedSubmission}
              selectedIds={selectedIds}
              onSelectSubmission={handleSelectSubmission}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <span className="text-sm text-neutral-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Detail Panel */}
        {selectedSubmission && (
          <SubmissionDetailPanel
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onUpdate={() => {
              refresh();
              setSelectedSubmission(null);
            }}
          />
        )}

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onActionComplete={() => {
            refresh();
            setSelectedIds([]);
          }}
        />
      </div>
    </AdminLayout>
  );
}
