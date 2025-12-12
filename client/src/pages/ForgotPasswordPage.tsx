import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, Copy, Check } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/request-reset', data);

      if (response.data.success) {
        setResetToken(response.data.data.resetToken);
        showSuccess('Reset code generated successfully');
      }
    } catch (error: any) {
      showError(error.response?.data?.error?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken);
      setCopied(true);
      showSuccess('Reset code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (resetToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Password Reset Code</h1>
            <p className="text-neutral-600 text-sm">
              Copy the code below and use it to reset your password
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reset Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={resetToken}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg font-mono text-sm"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyToken}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Code expires in 1 hour
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/admin/reset-password">
              <Button fullWidth>
                Continue to Reset Password
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="ghost" fullWidth>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <p className="text-xs text-neutral-600">
              <strong>Note:</strong> In production, this code would be emailed to you. For now, copy it and use it on the next page to reset your password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password?</h1>
          <p className="text-neutral-600 text-sm">
            Enter your email address to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Button type="submit" fullWidth isLoading={loading}>
            Send Reset Instructions
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
