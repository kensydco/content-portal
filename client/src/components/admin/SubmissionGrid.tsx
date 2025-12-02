import { Submission } from '../../types';
import SubmissionCard from './SubmissionCard';

interface SubmissionGridProps {
  submissions: Submission[];
  onSubmissionClick: (submission: Submission) => void;
  selectedIds: string[];
  onSelectSubmission: (id: string, selected: boolean) => void;
}

export default function SubmissionGrid({
  submissions,
  onSubmissionClick,
  selectedIds,
  onSelectSubmission,
}: SubmissionGridProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">No submissions found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.submissionId}
          submission={submission}
          onClick={() => onSubmissionClick(submission)}
          isSelected={selectedIds.includes(submission.submissionId)}
          onSelect={(selected) => onSelectSubmission(submission.submissionId, selected)}
        />
      ))}
    </div>
  );
}
