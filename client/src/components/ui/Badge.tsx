import { ReactNode } from 'react';
import { SubmissionStatus } from '../../types';

interface BadgeProps {
  children: ReactNode;
  variant?: SubmissionStatus | 'default';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variantClasses = {
    New: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    default: 'bg-neutral-100 text-neutral-800',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
}
