import { FileImage, FileVideo, ExternalLink } from 'lucide-react';
import { Submission } from '../../types';
import Badge from '../ui/Badge';
import { formatDateTime, getRelativeTime, truncateText } from '../../utils/formatters';

interface SubmissionCardProps {
  submission: Submission;
  onClick: () => void;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export default function SubmissionCard({
  submission,
  onClick,
  isSelected,
  onSelect,
}: SubmissionCardProps) {
  const isVideo = submission.fileDriveUrl.includes('video') || submission.fileId.includes('mp4');

  return (
    <div
      className={`
        bg-white rounded-lg border-2 transition-all cursor-pointer
        ${isSelected ? 'border-primary-500 shadow-lg' : 'border-neutral-200 hover:border-primary-300 hover:shadow-md'}
      `}
    >
      <div className="p-4">
        {/* Header with checkbox and status */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <Badge variant={submission.status}>{submission.status}</Badge>
        </div>

        {/* Preview */}
        <div
          onClick={onClick}
          className="mb-3 bg-neutral-100 rounded-lg h-40 flex items-center justify-center"
        >
          {isVideo ? (
            <FileVideo className="w-12 h-12 text-neutral-400" />
          ) : (
            <FileImage className="w-12 h-12 text-neutral-400" />
          )}
        </div>

        {/* Info */}
        <div onClick={onClick} className="space-y-2">
          <div>
            <p className="font-semibold text-neutral-900">{submission.uploaderName}</p>
            <p className="text-sm text-neutral-600">{submission.uploaderEmail}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">{submission.category}</Badge>
            <span className="text-xs text-neutral-500">{submission.fileSizeMb.toFixed(1)} MB</span>
          </div>

          {submission.description && (
            <p className="text-sm text-neutral-600">{truncateText(submission.description, 100)}</p>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{getRelativeTime(submission.timestamp)}</span>
            <a
              href={submission.fileDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
