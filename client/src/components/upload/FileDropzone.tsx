import { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileVideo } from 'lucide-react';
import { formatFileSize } from '../../utils/validation';

interface FileDropzoneProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onFileRemove: (index: number) => void;
  allowedTypes: string[];
  maxSizeMb: number;
}

export default function FileDropzone({
  onFileSelect,
  selectedFiles,
  onFileRemove,
  allowedTypes,
  maxSizeMb,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILES = 5;

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

    return null;
  };

  const validateFiles = (newFiles: File[]): string | null => {
    // Check file count
    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      return `Maximum ${MAX_FILES} files allowed. You have ${selectedFiles.length} file(s) already selected.`;
    }

    // Validate each file type
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) return error;
    }

    // Check total size
    const totalSize = [...selectedFiles, ...newFiles].reduce((sum, f) => sum + f.size, 0);
    const maxTotalSize = maxSizeMb * 1024 * 1024;
    if (totalSize > maxTotalSize) {
      return `Total file size exceeds ${maxSizeMb}MB limit`;
    }

    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setError(null);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        const validationError = validateFiles(droppedFiles);
        if (validationError) {
          setError(validationError);
        } else {
          onFileSelect([...selectedFiles, ...droppedFiles]);
        }
      }
    },
    [onFileSelect, selectedFiles, allowedTypes, maxSizeMb]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setError(null);

      if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
          const validationError = validateFiles(newFiles);
          if (validationError) {
            setError(validationError);
          } else {
            onFileSelect([...selectedFiles, ...newFiles]);
          }
        }
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [onFileSelect, selectedFiles, allowedTypes, maxSizeMb]
  );

  if (selectedFiles.length > 0) {
    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

    return (
      <div className="space-y-3">
        <div className="border-2 border-primary-300 bg-primary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-neutral-700">
              {selectedFiles.length} file(s) selected
            </p>
            <p className="text-sm text-neutral-600">Total: {formatFileSize(totalSize)}</p>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const isVideo = file.type.startsWith('video/');
              return (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {isVideo ? (
                      <FileVideo className="w-6 h-6 text-primary-600" />
                    ) : (
                      <FileImage className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate text-sm">{file.name}</p>
                    <p className="text-xs text-neutral-600">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => onFileRemove(index)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {selectedFiles.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => document.getElementById('file-input')?.click()}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
          >
            + Add more files (up to {MAX_FILES} total)
          </button>
        )}
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
          id="file-input"
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={allowedTypes.join(',')}
        />

        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-lg font-medium text-neutral-900 mb-2">
            Drop your files here, or <span className="text-primary-600">browse</span>
          </p>
          <p className="text-sm text-neutral-600 mb-1">
            <strong>Select up to {MAX_FILES} files at once</strong> (or add them one by one)
          </p>
          <p className="text-sm text-neutral-600">
            Supported formats: {allowedTypes.join(', ')}
          </p>
          <p className="text-sm text-neutral-600">Maximum total size: {maxSizeMb}MB</p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
