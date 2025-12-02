import { useState } from 'react';
import { Check, X, Calendar, Archive } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export default function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onActionComplete,
}: BulkActionsBarProps) {
  const { showSuccess, showError } = useToast();
  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBulkAction = async (action: 'approve' | 'reject' | 'archive') => {
    try {
      setLoading(true);

      await api.post('/api/admin/submissions/bulk', {
        submissionIds: selectedIds,
        action,
      });

      showSuccess(`${selectedIds.length} submissions ${action}d successfully`);
      onActionComplete();
      onClearSelection();
    } catch (error) {
      showError('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDates = async () => {
    try {
      setLoading(true);

      await api.post('/api/admin/submissions/bulk', {
        submissionIds: selectedIds,
        action: 'setDates',
        data: {
          adminStartDate: startDate,
          adminEndDate: endDate,
        },
      });

      showSuccess(`Dates set for ${selectedIds.length} submissions`);
      setShowDateModal(false);
      setStartDate('');
      setEndDate('');
      onActionComplete();
      onClearSelection();
    } catch (error) {
      showError('Failed to set dates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl border-2 border-primary-500 p-4 z-30">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-neutral-900">
            {selectedIds.length} selected
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleBulkAction('approve')}
              disabled={loading}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => handleBulkAction('reject')}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDateModal(true)}
              disabled={loading}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Set Dates
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkAction('archive')}
              disabled={loading}
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive
            </Button>
          </div>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        title="Set Dates for Selected Submissions"
      >
        <div className="space-y-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <div className="flex gap-2">
            <Button onClick={handleSetDates} fullWidth isLoading={loading}>
              Apply
            </Button>
            <Button variant="secondary" onClick={() => setShowDateModal(false)} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
