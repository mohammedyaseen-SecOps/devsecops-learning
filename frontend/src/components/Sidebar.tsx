'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleSidebar, setSidebarCollapsed } from '@/store/uiSlice';
import clsx from 'clsx';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const menuItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Risks', href: '/dashboard/risks', icon: '⚠️', badge: 4 },
  { label: 'Compliance', href: '/dashboard/compliance', icon: '✅', badge: 5 },
  { label: 'Incidents', href: '/dashboard/incidents', icon: '🚨', badge: 5 },
  { label: 'Users', href: '/dashboard/users', icon: '👥', badge: 3 },
  { label: 'Roles', href: '/dashboard/roles', icon: '🔐', badge: 3 },
  { label: 'Tenants', href: '/dashboard/tenants', icon: '🏢', badge: 3 },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={clsx(
        'bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700',
        'flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo / Brand */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              GRC
            </h1>
          )}
          <button
            onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition-colors"
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              className={clsx(
                'w-5 h-5 text-gray-600 dark:text-gray-400',
                'transition-transform duration-200',
                sidebarCollapsed ? 'rotate-180' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700">
        {!sidebarCollapsed && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Version 1.0.0
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              SaaS GRC Platform
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
