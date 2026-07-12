'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, setError } from '@/store/authSlice';
import { isAuthenticated } from '@/lib/auth';
import { authAPI } from '@/api/auth';
import { Sidebar, Header } from '@/components';
import toast from 'react-hot-toast';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated: authState, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // In demo mode, auto-login
    if (DEMO_MODE && !user) {
      fetchCurrentUser();
    } 
    // In production mode, redirect if not authenticated
    else if (!DEMO_MODE && !isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
  }, [router, user, authState]);

  const fetchCurrentUser = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      dispatch(setUser(user));
    } catch (error: any) {
      console.error('Failed to fetch current user:', error);
      if (!DEMO_MODE) {
        dispatch(setError('Failed to load user information'));
        router.push('/auth/login');
      }
    }
  };

  // Don't block rendering in demo mode
  if (!DEMO_MODE && !isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
