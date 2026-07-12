'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components';
import toast from 'react-hot-toast';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      // In production, call: await authAPI.verifyEmail({ email, token: code })
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Email verified successfully!');
      router.push('/auth/login?verified=true');
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. Please try again.');
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setResendLoading(true);

    try {
      // In production, call: await authAPI.resendVerificationCode({ email })
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResendSent(true);
      toast.success('Verification code sent to your email');

      setTimeout(() => setResendSent(false), 3000);
    } catch (err: any) {
      toast.error('Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
              Verify Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a verification code to{' '}
              <span className="font-semibold text-dark-900 dark:text-white">
                {email}
              </span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {resendSent && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Verification code sent! Check your email inbox.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            {/* Verification Code */}
            <div>
              <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
                disabled={loading}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Check your email for the 6-digit code (check spam folder if not found)
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Back to Login */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-700 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
