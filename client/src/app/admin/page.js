'use client';
import AdminStats from '@/components/admin/dashboard/AdminStats';
import SystemOverview from '@/components/admin/dashboard/SystemOverview';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-black to-primary-orange-600 dark:from-white dark:to-primary-orange-400 rounded-2xl p-6 md:p-8 text-white dark:text-black">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-primary-orange-100 dark:text-primary-orange-900 text-sm md:text-base">
          System overview and platform management
        </p>
      </div>

      <AdminStats />
      <SystemOverview />

      {/* Quick System Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-black dark:text-white mb-2">User Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage all platform users</p>
        </div>
        
        <div className="card text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-black dark:text-white mb-2">Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View platform statistics</p>
        </div>
        
        <div className="card text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-semibold text-black dark:text-white mb-2">System Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure platform settings</p>
        </div>
      </div>
    </div>
  );
}