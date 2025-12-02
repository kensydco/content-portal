import { forwardRef } from 'react';

interface WaiverCheckboxProps {
  waiverUrl: string;
  error?: string;
}

const WaiverCheckbox = forwardRef<HTMLInputElement, WaiverCheckboxProps>(
  ({ waiverUrl, error }, ref) => {
    return (
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">
            I agree to the{' '}
            <a
              href={waiverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              content waiver and terms
            </a>
            <span className="text-danger ml-1">*</span>
          </span>
        </label>
        {error && <p className="text-sm text-danger ml-7">{error}</p>}
      </div>
    );
  }
);

WaiverCheckbox.displayName = 'WaiverCheckbox';

export default WaiverCheckbox;
