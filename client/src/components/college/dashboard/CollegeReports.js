'use client';
import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaEye, FaArrowRight, FaSearch } from 'react-icons/fa';
import Link from 'next/link';

// Backend status choices ke saath sync
const statusConfig = {
  pending: { color: 'bg-orange-500', text: 'Pending', icon: FaClock },
  investigating: { color: 'bg-blue-500', text: 'Investigating', icon: FaSearch },
  under_review: { color: 'bg-blue-500', text: 'Under Review', icon: FaEye },
  resolved: { color: 'bg-green-500', text: 'Resolved', icon: FaCheckCircle },
  rejected: { color: 'bg-red-500', text: 'Rejected', icon: FaExclamationTriangle },
};

const priorityConfig = {
  low: { color: 'text-green-600 bg-green-100 dark:bg-green-900' },
  medium: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900' },
  high: { color: 'text-orange-600 bg-orange-100 dark:bg-orange-900' },
  critical: { color: 'text-red-600 bg-red-100 dark:bg-red-900' },
};

export default function CollegeReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollegeReports = async () => {
      // Browser environment check
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:8000/api/student/reports/', {
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        
        // Handling both array and object responses
        const reportsList = Array.isArray(data) ? data : (data.reports || []);
        
        const formattedReports = reportsList.map(r => ({
          id: r.id,
          title: r.description ? (r.description.substring(0, 45) + '...') : `Incident Report #${r.id}`,
          student: r.student_name || 'Anonymous Student',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : 'Date N/A',
          status: r.status?.toLowerCase() || 'pending',
          priority: r.severity?.toLowerCase() || 'medium', 
          type: r.incident_type || 'General'
        }));
        
        // Show only latest 4 for dashboard scannability
        setReports(formattedReports.slice(0, 4)); 
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeReports();
  }, []);

  if (loading) return (
    <div className="p-12 text-center space-y-4">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
      <p className="text-zinc-400 animate-pulse font-black uppercase text-[10px] tracking-[0.2em]">Synchronizing Data...</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-zinc-900">
      {/* Header Section */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-50 dark:border-zinc-800">
        <h3 className="font-black italic uppercase text-black dark:text-white text-lg tracking-tight">
          Recent Anti-Ragging <span className="text-orange-500">Cases</span>
        </h3>
        <Link href="/college/reports" className="group flex items-center space-x-2 text-orange-500 hover:text-orange-600 text-[10px] font-black uppercase transition-all">
          <span>View All Analytics</span>
          <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* List Section */}
      <div className="p-6 space-y-3">
        {reports.length > 0 ? reports.map((report) => {
          const status = statusConfig[report.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          
          return (
            <div
              key={report.id}
              className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-orange-200 dark:hover:border-orange-900/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/10 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-colors ${
                  report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30' : 
                  (report.status === 'investigating' || report.status === 'under_review') ? 'bg-blue-100 dark:bg-blue-900/30' : 
                  'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <FaExclamationTriangle className={
                    report.status === 'resolved' ? 'text-green-600' : 
                    (report.status === 'investigating' || report.status === 'under_review') ? 'text-blue-600' : 
                    'text-orange-600'
                  } />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black dark:text-white group-hover:text-orange-600 transition-colors">
                    {report.title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {report.type}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold">
                      {report.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${priorityConfig[report.priority]?.color || priorityConfig.medium.color}`}>
                      {report.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-auto mt-3 md:mt-0">
                <span className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight shadow-sm ${
                  report.status === 'resolved' ? 'bg-green-50 text-green-700 dark:bg-green-900/40' : 
                  (report.status === 'investigating' || report.status === 'under_review') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40' : 
                  'bg-orange-50 text-orange-700 dark:bg-orange-900/40'
                }`}>
                  <StatusIcon className="text-[9px]" />
                  <span>{status.text}</span>
                </span>
                
                {/* Fixed Eye Icon Link to use Query Params */}
                <Link 
                  href={`/college/reports?id=${report.id}`} 
                  className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-all"
                  title="View Details"
                >
                  <FaEye />
                </Link>
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm mb-4">
               <FaCheckCircle className="text-zinc-200 dark:text-zinc-700 text-3xl" />
            </div>
            <p className="text-zinc-400 italic text-xs uppercase font-black tracking-[0.2em]">Clear Radar: No Pending Incidents</p>
          </div>
        )}
      </div>
    </div>
  );
}