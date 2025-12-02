import { useState } from 'react';
import { api } from '../utils/api';
import { useToast } from './useToast';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const { showError, showSuccess } = useToast();

  const uploadFile = async (formData: FormData) => {
    try {
      setUploading(true);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || 0;
          const percentage = total > 0 ? Math.round((loaded * 100) / total) : 0;
          setProgress({ loaded, total, percentage });
        },
      });

      if (response.data.success) {
        showSuccess('Upload successful!');
        return response.data.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Upload failed';
      showError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress };
}
