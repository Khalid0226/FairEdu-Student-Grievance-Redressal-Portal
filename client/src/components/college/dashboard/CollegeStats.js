'use client';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaUsers } from 'react-icons/fa';

export default function CollegeStats({ stats, loading }) {
  // Mapping logic based on parent state data (total, pending, resolved, committee_count)
  const dynamicStats = [
    {
      title: 'Pending Cases',
      value: stats?.pending ?? '0', 
      change: 'Needs Review',
      trend: 'up',
      icon: FaClock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      title: 'Resolved Cases',
      value: stats?.resolved ?? '0',
      change: 'Closed Safely',
      trend: 'neutral',
      icon: FaCheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Total Reports',
      value: stats?.total ?? '0',
      change: 'Overall Filings',
      trend: 'neutral',
      icon: FaExclamationTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      title: 'Committee',
      // 🟢 Static '7' ko badal kar dynamic kar diya hai
      value: stats?.committee_count ?? '0', 
      change: 'Active Members',
      trend: 'neutral',
      icon: FaUsers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dynamicStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm transition-all duration-300 ${
              loading ? 'animate-pulse opacity-70' : 'hover:shadow-md hover:-translate-y-1'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">
                  {stat.title}
                </p>
                <h2 className="text-3xl font-black text-black dark:text-white truncate leading-none italic">
                  {loading ? '...' : stat.value}
                </h2>
                <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${
                  stat.trend === 'up' ? 'text-orange-500' : 
                  stat.trend === 'down' ? 'text-red-500' : 
                  'text-blue-500'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bgColor} flex-shrink-0 ml-3 shadow-inner`}>
                <Icon className={`text-2xl ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}