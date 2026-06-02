'use client';
import { FaUserPlus, FaBook, FaChartBar, FaCog, FaBell, FaUsers } from 'react-icons/fa';

const actions = [
  {
    title: 'Add Student',
    icon: FaUserPlus,
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/college/students/add',
  },
  {
    title: 'Create Course',
    icon: FaBook,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/college/courses/create',
  },
  {
    title: 'Generate Report',
    icon: FaChartBar,
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/college/reports',
  },
  {
    title: 'Manage Faculty',
    icon: FaUsers,
    color: 'bg-orange-500 hover:bg-orange-600',
    href: '/college/faculty',
  },
  {
    title: 'Announcements',
    icon: FaBell,
    color: 'bg-red-500 hover:bg-red-600',
    href: '/college/announcements',
  },
  {
    title: 'Settings',
    icon: FaCog,
    color: 'bg-gray-500 hover:bg-gray-600',
    href: '/college/settings',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg transition-colors flex flex-col items-center justify-center space-y-2`}
            >
              <Icon className="text-xl" />
              <span className="text-sm font-medium text-center">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}