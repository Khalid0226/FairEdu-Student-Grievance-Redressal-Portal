'use client';

export default function StudentStats({ stats, loading }) {
  // Calculation for Resolution Rate
  const total = Number(stats?.total_reports || 0);
  const resolved = Number(stats?.resolved_reports || 0);
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const dynamicStats = [
    {
      title: 'Total Reports',
      value: stats?.total_reports ?? '0', 
      description: 'Your total filings',
      icon: '📊',
      color: 'bg-orange-500',
      trend: stats?.total_reports > 0 ? `+${stats.total_reports}` : '0'
    },
    {
      title: 'Active Reports',
      value: stats?.active_reports ?? '0',
      description: 'Cases in progress',
      icon: '📋',
      color: 'bg-gray-900 dark:bg-gray-100',
      trend: stats?.active_reports > 0 ? `+${stats.active_reports}` : '0'
    },
    {
      title: 'Resolved',
      value: stats?.resolved_reports ?? '0',
      description: 'Cases closed',
      icon: '✅',
      color: 'bg-orange-500',
      trend: stats?.resolved_reports > 0 ? `+${stats.resolved_reports}` : '0'
    },
    {
      // Theme matched with 'Resolved' and 'Total Reports'
      title: 'Resolution Rate',
      value: `${resolutionRate}%`,
      description: 'Efficiency based on resolved cases',
      icon: '📈',
      color: 'bg-gray-900 dark:bg-gray-100', // Changed to match theme
      trend: `${resolutionRate}%`
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {dynamicStats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-sm transition-all duration-300 ${
            loading ? 'animate-pulse opacity-70' : 'hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate">
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mt-1 truncate tracking-tighter">
                  {loading ? '...' : stat.value}
                </p>
                {!loading && (
                  <span className="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-1 rounded">
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate italic font-medium">
                {stat.description}
              </p>
            </div>
            
            {/* Yahan icon box ki styling bilkul baki cards jaisi kar di hai */}
            <div className={`p-2 md:p-3 rounded-2xl ${stat.color} flex-shrink-0 ml-2 shadow-lg shadow-orange-500/20`}>
              <span className="text-lg md:text-2xl text-white dark:text-gray-900">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}