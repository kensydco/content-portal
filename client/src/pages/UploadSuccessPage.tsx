import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload } from 'lucide-react';
import MemberLayout from '../components/layout/MemberLayout';
import Button from '../components/ui/Button';

export default function UploadSuccessPage() {
  const navigate = useNavigate();

  return (
    <MemberLayout>
      <div className="text-center py-8">
        <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />

        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Thank You!</h2>

        <p className="text-neutral-600 mb-6">
          Your content has been successfully uploaded. Our team will review it shortly.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/')} fullWidth>
            <Upload className="w-4 h-4 mr-2" />
            Upload Another
          </Button>
        </div>
      </div>
    </MemberLayout>
  );
}
