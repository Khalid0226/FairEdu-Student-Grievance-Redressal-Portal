'use client';
import Link from 'next/link';

export default function RecentActivity({ activities = [], loading }) {
  
  const getStatusColor = (status) => {
    const s = status?.toLowerCase().trim();
    switch (s) {
      case 'under_review':
      case 'pending': 
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'unread': 
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'updated': 
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'resolved':
      case 'closed': 
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: 
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    const s = status?.toLowerCase().trim();
    switch (s) {
      case 'under_review': return 'Under Review';
      case 'unread': return 'Unread';
      case 'updated': return 'Updated';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[3rem] border border-gray-100 dark:border-zinc-800 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded-full mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/40 p-6 md:p-8 rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
      <h2 className="text-xl font-black uppercase italic text-black dark:text-white mb-6 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>
        Recent Activity
      </h2>
      
      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            /* Yahan Link wrap kiya hai navigation ke liye */
            <Link
              key={activity.id}
              href={`/student/reports/${activity.id}`}
              className="flex items-start space-x-4 p-5 rounded-[2rem] border border-gray-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/20 transition-all duration-300 group block"
            >
              {/* Status Indicator Dot */}
              <div className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full shadow-sm transition-transform group-hover:scale-150 ${
                activity.normalized_status === 'resolved' ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight text-[11px] truncate pr-4 group-hover:text-orange-600 transition-colors">
                    {activity.title}
                  </h3>
                  <span className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
                
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 font-medium truncate italic">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-transparent ${getStatusColor(activity.status)}`}>
                    {getStatusText(activity.status)}
                  </span>
                  
                  {/* Ek chota indicator jo hover par dikhega */}
                  <span className="text-[9px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    VIEW DETAILS →
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
               No Activity Logged
             </p>
          </div>
        )}
      </div>
    </div>
  );
}