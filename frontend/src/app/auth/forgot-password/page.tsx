'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // In production, call: await authAPI.forgotPassword({ email })
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
      toast.success('Password reset link sent to your email');

      // In a real app, you might redirect after a delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a password reset link to{' '}
              <span className="font-semibold text-dark-900 dark:text-white">
                {email}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The link will expire in 24 hours. If you don't see the email, check your spam folder.
            </p>
            <Link href="/auth/login">
              <Button fullWidth>Back to Login</Button>
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
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              error={error}
              fullWidth
              disabled={loading}
            />

            {/* Submit Button */}
            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign In
            </Link>
          </div>

          {/* Signup Link */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-700 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
