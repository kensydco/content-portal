import { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileVideo } from 'lucide-react';
import { formatFileSize } from '../../utils/validation';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileRemove: () => void;
  allowedTypes: string[];
  maxSizeMb: number;
}

export default function FileDropzone({
  onFileSelect,
  selectedFile,
  onFileRemove,
  allowedTypes,
  maxSizeMb,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.some((type) => type.toLowerCase() === fileExt)) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }

    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSizeMb}MB`;
    }

    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setError(null);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const validationError = validateFile(files[0]);
        if (validationError) {
          setError(validationError);
        } else {
          onFileSelect(files[0]);
        }
      }
    },
    [onFileSelect, allowedTypes, maxSizeMb]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setError(null);

      const files = e.target.files;
      if (files && files[0]) {
        const validationError = validateFile(files[0]);
        if (validationError) {
          setError(validationError);
        } else {
          onFileSelect(files[0]);
        }
      }
    },
    [onFileSelect, allowedTypes, maxSizeMb]
  );

  if (selectedFile) {
    const isVideo = selectedFile.type.startsWith('video/');

    return (
      <div className="border-2 border-primary-300 bg-primary-50 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            {isVideo ? (
              <FileVideo className="w-8 h-8 text-primary-600" />
            ) : (
              <FileImage className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-900 truncate">{selectedFile.name}</p>
            <p className="text-sm text-neutral-600">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={onFileRemove}
            className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 bg-neutral-50'}
          ${error ? 'border-danger bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={allowedTypes.join(',')}
        />

        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-lg font-medium text-neutral-900 mb-2">
            Drop your file here, or <span className="text-primary-600">browse</span>
          </p>
          <p className="text-sm text-neutral-600">
            Supported formats: {allowedTypes.join(', ')}
          </p>
          <p className="text-sm text-neutral-600">Maximum size: {maxSizeMb}MB</p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
