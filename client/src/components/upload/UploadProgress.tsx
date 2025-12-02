interface UploadProgressProps {
  percentage: number;
}

export default function UploadProgress({ percentage }: UploadProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700">Uploading...</span>
        <span className="text-sm font-medium text-primary-600">{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
