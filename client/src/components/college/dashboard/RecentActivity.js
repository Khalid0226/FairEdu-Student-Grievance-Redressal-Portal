'use client';
import { FaUserPlus, FaBook, FaGraduationCap, FaBell } from 'react-icons/fa';

const activities = [
  {
    id: 1,
    type: 'new_student',
    message: 'New student registration: John Doe',
    time: '2 hours ago',
    icon: FaUserPlus,
    color: 'text-green-500',
  },
  {
    id: 2,
    type: 'course_update',
    message: 'Course "Advanced Mathematics" updated',
    time: '4 hours ago',
    icon: FaBook,
    color: 'text-blue-500',
  },
  {
    id: 3,
    type: 'graduation',
    message: '15 students eligible for graduation',
    time: '1 day ago',
    icon: FaGraduationCap,
    color: 'text-purple-500',
  },
  {
    id: 4,
    type: 'announcement',
    message: 'New college announcement published',
    time: '2 days ago',
    icon: FaBell,
    color: 'text-orange-500',
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}>
                <Icon className={`${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        View All Activity
      </button>
    </div>
  );
}