import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { SubmissionStatus, Category } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { api } from '../../utils/api';

interface FilterBarProps {
  onFilterChange: (filters: {
    status?: SubmissionStatus;
    category?: string;
    search?: string;
  }) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/api/admin/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data.categories.filter((c: Category) => c.isActive));
      }
    });
  }, []);

  const handleApplyFilters = () => {
    onFilterChange({
      status: status || undefined,
      category: category || undefined,
      search: search || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-neutral-600" />
        <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus | '')}
          options={[
            { value: 'New', label: 'New' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
          ]}
        />

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categories.map((c) => ({ value: c.name, label: c.name }))}
        />

        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply
          </Button>
          <Button onClick={handleClearFilters} variant="secondary">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
