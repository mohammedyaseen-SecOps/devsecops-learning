'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser, setTokens, setError, setLoading } from '@/store/authSlice';
import { authAPI } from '@/api/auth';
import { setTokensToStorage, isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const { user, accessToken, refreshToken, expiresIn } = response.data;
        
        // Update Redux store
        dispatch(setUser(user));
        dispatch(setTokens({ accessToken, refreshToken, expiresIn }));
        
        // Save tokens to storage
        setTokensToStorage(accessToken, refreshToken);
        
        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Login failed';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-900 dark:text-white mb-2">
            GRC Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enterprise Governance, Risk & Compliance
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                disabled={isLoading}
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400">
              Email: <code>admin@demo.com</code>
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400">
              Password: <code>Demo@1234</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          © 2026 GRC Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
