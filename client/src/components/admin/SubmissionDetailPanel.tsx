import { useState } from 'react';
import { X, ExternalLink, Save } from 'lucide-react';
import { Submission } from '../../types';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatDateTime } from '../../utils/formatters';

interface SubmissionDetailPanelProps {
  submission: Submission;
  onClose: () => void;
  onUpdate: () => void;
}

export default function SubmissionDetailPanel({
  submission,
  onClose,
  onUpdate,
}: SubmissionDetailPanelProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [status, setStatus] = useState(submission.status);
  const [adminStartDate, setAdminStartDate] = useState(submission.adminStartDate || '');
  const [adminEndDate, setAdminEndDate] = useState(submission.adminEndDate || '');
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role === 'Editor' || user?.role === 'SuperAdmin';

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.patch(`/api/admin/submissions/${submission.submissionId}`, {
        status,
        adminStartDate: adminStartDate || null,
        adminEndDate: adminEndDate || null,
        adminNotes: adminNotes || null,
      });

      showSuccess('Submission updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      showError('Failed to update submission');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl overflow-auto z-40">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Submission Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Status</span>
            <Badge variant={submission.status}>{submission.status}</Badge>
          </div>
        </div>

        {/* File Preview */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">File</label>
          <a
            href={submission.fileDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            View in Google Drive <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-sm text-neutral-600 mt-1">Size: {submission.fileSizeMb.toFixed(2)} MB</p>
        </div>

        {/* Uploader Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-neutral-900">Uploader Information</h3>
          <div className="space-y-1">
            <p className="text-sm"><span className="font-medium">Name:</span> {submission.uploaderName}</p>
            <p className="text-sm"><span className="font-medium">Email:</span> {submission.uploaderEmail}</p>
            {submission.uploaderPhone && (
              <p className="text-sm"><span className="font-medium">Phone:</span> {submission.uploaderPhone}</p>
            )}
            <p className="text-sm"><span className="font-medium">Device:</span> {submission.uploadDevice}</p>
          </div>
        </div>

        {/* Content Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-neutral-900">Content Information</h3>
          <div className="space-y-1">
            <p className="text-sm"><span className="font-medium">Category:</span> {submission.category}</p>
            {submission.description && (
              <p className="text-sm"><span className="font-medium">Description:</span> {submission.description}</p>
            )}
            {submission.sourceQrId && (
              <p className="text-sm"><span className="font-medium">Source QR:</span> {submission.sourceQrId}</p>
            )}
            <p className="text-sm"><span className="font-medium">Uploaded:</span> {formatDateTime(submission.timestamp)}</p>
          </div>
        </div>

        {/* Waiver */}
        <div>
          <h3 className="font-semibold text-neutral-900 mb-2">Waiver</h3>
          <p className="text-sm">
            <span className="font-medium">Agreed:</span> {submission.waiverAgreed ? 'Yes' : 'No'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Timestamp:</span> {formatDateTime(submission.waiverTimestamp)}
          </p>
        </div>

        {/* Admin Controls */}
        {canEdit && (
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <h3 className="font-semibold text-neutral-900">Admin Controls</h3>

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
            />

            <Input
              label="Start Date"
              type="date"
              value={adminStartDate}
              onChange={(e) => setAdminStartDate(e.target.value)}
            />

            <Input
              label="End Date"
              type="date"
              value={adminEndDate}
              onChange={(e) => setAdminEndDate(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                maxLength={1000}
              />
            </div>

            <Button
              onClick={handleSave}
              fullWidth
              isLoading={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
