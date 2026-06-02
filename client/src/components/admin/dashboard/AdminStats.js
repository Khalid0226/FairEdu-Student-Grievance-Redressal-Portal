'use client';
import { FiUsers, FiFileText, FiTrendingUp, FiShield } from 'react-icons/fi';

const adminStats = [
  {
    title: 'Total Users',
    value: '1,234',
    description: 'Across all modules',
    icon: FiUsers,
    color: 'bg-orange-500',
    change: '+12%'
  },
  {
    title: 'Active Reports',
    value: '89',
    description: 'Requiring attention',
    icon: FiFileText,
    color: 'bg-gray-900',
    change: '+5%'
  },
  {
    title: 'Colleges',
    value: '45',
    description: 'Registered institutions',
    icon: FiShield,
    color: 'bg-orange-500',
    change: '+3'
  },
  {
    title: 'Resolution Rate',
    value: '92%',
    description: 'Cases resolved',
    icon: FiTrendingUp,
    color: 'bg-gray-900',
    change: '+2%'
  }
];

export default function AdminStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {adminStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-gray-600 truncate">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-xl md:text-2xl font-bold text-black mt-1 truncate">
                    {stat.value}
                  </p>
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stat.description}
                </p>
              </div>
              <div className={`p-2 md:p-3 rounded-full ${stat.color} flex-shrink-0 ml-2`}>
                <IconComponent className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}