'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Demo user for UI preview
  const firstName = user?.firstName || 'Demo User';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-blue-600 dark:from-primary-700 dark:to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-white/80">
          Here's what's happening in your GRC platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Risks', value: '24', icon: '📊', color: 'from-red-500' },
          { label: 'Active Compliances', value: '12', icon: '✅', color: 'from-green-500' },
          { label: 'Open Incidents', value: '5', icon: '⚠️', color: 'from-yellow-500' },
          { label: 'Audit Items', value: '18', icon: '📋', color: 'from-blue-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} to-transparent rounded-xl p-6 text-white shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              action: 'New Risk Created',
              description: 'High severity risk in IT Infrastructure',
              time: '2 hours ago',
            },
            {
              action: 'Compliance Update',
              description: 'SOC 2 Type II assessment completed',
              time: '4 hours ago',
            },
            {
              action: 'Incident Resolved',
              description: 'Security incident INC-2024-001',
              time: '1 day ago',
            },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-dark-700 last:border-b-0"
            >
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap ml-4">
                {activity.time}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
          <p className="text-2xl mb-2">📊</p>
          <h3 className="font-semibold text-dark-900 dark:text-white">View Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">See all analytics</p>
        </button>
        <button className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
          <p className="text-2xl mb-2">➕</p>
          <h3 className="font-semibold text-dark-900 dark:text-white">Create Risk</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Add new risk item</p>
        </button>
        <button className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
          <p className="text-2xl mb-2">⚙️</p>
          <h3 className="font-semibold text-dark-900 dark:text-white">Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage preferences</p>
        </button>
      </div>
    </div>
  );
}
