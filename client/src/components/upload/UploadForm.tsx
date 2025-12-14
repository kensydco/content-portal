import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { useUpload } from '../../hooks/useUpload';
import { Category } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import FileDropzone from './FileDropzone';
import UploadProgress from './UploadProgress';
import WaiverCheckbox from './WaiverCheckbox';

interface UploadFormData {
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone?: string;
  studio: string;
  category: string;
  description?: string;
  adminStartDate: string;
  adminEndDate: string;
  waiverAgreed: boolean;
}

export default function UploadForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { uploadFile, uploading, progress } = useUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [studios, setStudios] = useState<Array<{ id: string; name: string }>>([]);
  const [config, setConfig] = useState({ waiverUrl: '', maxFileSizeMb: 500, allowedFileTypes: [] as string[] });

  // Calculate default dates: today and 90 days from today
  const today = new Date().toISOString().split('T')[0];
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormData>({
    defaultValues: {
      adminStartDate: today,
      adminEndDate: ninetyDaysFromNow,
    },
  });

  useEffect(() => {
    // Load public config
    api.get('/api/config/public').then((res) => {
      if (res.data.success) {
        setConfig(res.data.data);
      }
    });

    // Load categories from Google Sheets
    api.get('/api/config/public/categories').then((res) => {
      if (res.data.success && res.data.data.categories) {
        setCategories(res.data.data.categories);
      }
    }).catch((err) => {
      console.error('Failed to load categories:', err);
      // Fallback to default categories
      setCategories([
        { id: '1', name: 'Workout', description: null, isActive: true, createdAt: '' },
        { id: '2', name: 'Event', description: null, isActive: true, createdAt: '' },
        { id: '3', name: 'Testimonial', description: null, isActive: true, createdAt: '' },
      ]);
    });

    // Load studios from Google Sheets
    api.get('/api/config/public/studios').then((res) => {
      if (res.data.success && res.data.data.studios) {
        setStudios(res.data.data.studios);
      }
    }).catch((err) => {
      console.error('Failed to load studios:', err);
      // Fallback to default studios
      setStudios([
        { id: 'TN0045', name: 'Collierville' },
        { id: 'NY0017', name: 'Ithaca' },
      ]);
    });
  }, []);

  const onSubmit = async (data: UploadFormData) => {
    if (selectedFiles.length === 0) {
      return;
    }

    if (!data.waiverAgreed) {
      return;
    }

    const formData = new FormData();

    // Append all files
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('uploaderName', data.uploaderName);
    formData.append('uploaderEmail', data.uploaderEmail);
    if (data.uploaderPhone) formData.append('uploaderPhone', data.uploaderPhone);
    formData.append('studio', data.studio);
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    formData.append('adminStartDate', data.adminStartDate);
    formData.append('adminEndDate', data.adminEndDate);
    formData.append('waiverAgreed', 'true');
    formData.append('waiverTimestamp', new Date().toISOString());

    const sourceQrId = searchParams.get('qr_id');
    if (sourceQrId) formData.append('sourceQrId', sourceQrId);

    try {
      await uploadFile(formData);
      navigate('/success');
    } catch (error) {
      // Error handled by useUpload hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FileDropzone
        selectedFiles={selectedFiles}
        onFileSelect={setSelectedFiles}
        onFileRemove={(index) => {
          setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        }}
        allowedTypes={config.allowedFileTypes}
        maxSizeMb={config.maxFileSizeMb}
      />

      {uploading && <UploadProgress percentage={progress.percentage} />}

      <Input
        label="Your Name"
        {...register('uploaderName', { required: 'Name is required', minLength: 2, maxLength: 100 })}
        error={errors.uploaderName?.message}
        disabled={uploading}
      />

      <Input
        label="Email Address"
        type="email"
        {...register('uploaderEmail', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email address',
          },
        })}
        error={errors.uploaderEmail?.message}
        disabled={uploading}
      />

      <Input
        label="Phone Number"
        type="tel"
        {...register('uploaderPhone')}
        error={errors.uploaderPhone?.message}
        helperText="Optional"
        disabled={uploading}
      />

      <Select
        label="Studio Location"
        {...register('studio', { required: 'Studio is required' })}
        options={studios.map((s) => ({ value: s.id, label: s.name + ' - ' + s.id }))}
        error={errors.studio?.message}
        disabled={uploading}
      />

      <Select
        label="Category"
        {...register('category', { required: 'Category is required' })}
        options={categories.map((c) => ({ value: c.name, label: c.name }))}
        error={errors.category?.message}
        disabled={uploading}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description', { maxLength: 280 })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          maxLength={280}
          placeholder="Tell us about this content (optional)"
          disabled={uploading}
        />
        <p className="mt-1 text-xs text-neutral-500">Max 280 characters</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          {...register('adminStartDate', { required: 'Start date is required' })}
          error={errors.adminStartDate?.message}
          disabled={uploading}
          helperText="When content can start being used"
        />
        <Input
          label="End Date"
          type="date"
          {...register('adminEndDate', { required: 'End date is required' })}
          error={errors.adminEndDate?.message}
          disabled={uploading}
          helperText="When content should stop being used"
        />
      </div>

      <WaiverCheckbox
        waiverUrl={config.waiverUrl}
        {...register('waiverAgreed', {
          validate: (value) => value === true || 'You must agree to the waiver'
        })}
        error={errors.waiverAgreed?.message}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={selectedFiles.length === 0 || uploading}
        isLoading={uploading}
      >
        Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : 'Content'}
      </Button>
    </form>
  );
}
