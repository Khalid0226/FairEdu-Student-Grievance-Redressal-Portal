'use client';
import Link from 'next/link';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  investigating: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  escalated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const severityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

// 🆕 added displayId prop to fix numbering gap
export default function ReportCard({ report, displayId }) {

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB');
  };

  const displayDate = formatDate(report.incident_date);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {report.incident_type}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {report.location} • {displayDate}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status?.toLowerCase()] || statusColors.pending}`}>
              {report.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[report.severity?.toLowerCase()] || severityColors.medium}`}>
              {report.severity?.toUpperCase()} SEVERITY
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {/* 🆕 Using displayId for continuous numbering without gaps */}
          <span className="text-xs text-gray-500 dark:text-gray-400 font-bold font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            CASE #{displayId}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>📅 Submitted {displayDate}</span>
        </div>
        
        <div className="flex space-x-2">
          {/* 🛑 RESOLVE BUTTON REMOVED: Students shouldn't resolve their own cases */}

          <Link
            href={`/student/reports/${report.id}`}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-600 rounded-md transition-all"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </div>
  );
}