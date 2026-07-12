'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!token) {
      newErrors.token = 'Invalid reset link. Please request a new password reset.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // In production, call: await authAPI.resetPassword({ token, newPassword: formData.password })
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      toast.success('Password reset successfully!');

      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password. Please try again.';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
              Password Reset Successful
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link href="/auth/login">
              <Button fullWidth>Return to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below.
            </p>
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          {errors.token && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.token}
              </p>
              <Link href="/auth/forgot-password" className="text-sm text-red-600 dark:text-red-400 hover:underline mt-2 inline-block">
                Request a new reset link
              </Link>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <Input
              label="New Password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="Enter new password"
              error={errors.password}
              helperText="Min 8 chars, 1 uppercase, 1 number, 1 special char (!@#$%^&*)"
              fullWidth
              disabled={loading}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              fullWidth
              disabled={loading}
            />

            {/* Submit Button */}
            <Button type="submit" fullWidth loading={loading} disabled={loading || !token}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/auth/login"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
