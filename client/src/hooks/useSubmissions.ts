import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Submission, SubmissionFilters } from '../types';
import { useToast } from './useToast';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<SubmissionFilters>({
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });
  const { showError } = useToast();

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add pagination params
      params.append('page', String(pagination.page));
      params.append('limit', String(pagination.limit));

      // Add filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`/api/admin/submissions?${params.toString()}`);

      if (response.data.success) {
        setSubmissions(response.data.data.submissions);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load submissions';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, showError]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const updateFilters = useCallback((newFilters: Partial<SubmissionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const changePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    pagination,
    filters,
    updateFilters,
    changePage,
    refresh,
  };
}
