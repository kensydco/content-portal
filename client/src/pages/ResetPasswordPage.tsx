import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Check } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

interface ResetPasswordForm {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/reset-password', {
        resetToken: data.resetToken,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        showSuccess('Password reset successfully!');
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      }
    } catch (error: any) {
      showError(error.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Password Reset Successful!</h1>
          <p className="text-neutral-600 mb-6">
            Your password has been reset successfully. Redirecting to login...
          </p>
          <Link to="/admin/login">
            <Button fullWidth>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Reset Password</h1>
          <p className="text-neutral-600 text-sm">
            Enter your reset token and new password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            placeholder="Paste your reset token here"
            error={errors.resetToken?.message}
            {...register('resetToken', {
              required: 'Reset token is required',
            })}
            helperText="Copy the token from the previous page or from your email"
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === newPassword || 'Passwords do not match',
            })}
          />

          <Button type="submit" fullWidth isLoading={loading}>
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/admin/login"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
