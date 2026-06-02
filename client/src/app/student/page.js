'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import QuickActions from '@/components/student/dashboard/QuickActions';
import RecentActivity from '@/components/student/dashboard/RecentActivity';
import StudentStats from '@/components/student/dashboard/StudentStats';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ 
    total_reports: 0, 
    active_reports: 0, 
    resolved_reports: 0, 
    unread_messages: 0 
  });
  const [activities, setActivities] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.replace('/login');
    }
  }, [user, authLoading]);

  // 2. Data Fetching Logic (Stats & Real Activity Mapping)
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      try {
        setDataLoading(true);
        const headers = {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };

        const [statsRes, reportsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/student/stats/', { headers }),
          fetch('http://127.0.0.1:8000/api/student/reports/', { headers })
        ]);

        // --- Process Reports for Recent Activity ---
        let fetchedReports = [];
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          const rawReports = reportsData.reports || (Array.isArray(reportsData) ? reportsData : []);
          
          fetchedReports = rawReports.map(report => ({
            id: report.id,
            title: report.status === 'resolved' ? 'Case Resolved' : 'Report Logged',
            description: report.title || report.description || `Case #${report.id || 'N/A'}`,
            time: report.created_at ? new Date(report.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short'
            }) : "Recently",
            status: report.status || 'Pending',
            normalized_status: (report.status || 'pending').toLowerCase().trim()
          }));

          setActivities(fetchedReports.slice(0, 5));
        }

        // --- Process Stats ---
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            total_reports: Number(statsData.total_reports || 0),
            active_reports: Number(statsData.active_reports || 0),
            resolved_reports: Number(statsData.resolved_reports || 0),
            unread_messages: Number(statsData.unread_messages || 0)
          });
        } else {
          const total = fetchedReports.length;
          const resolved = fetchedReports.filter(r => 
            r.normalized_status === 'resolved' || r.normalized_status === 'closed'
          ).length;
          
          setStats({
            total_reports: total,
            active_reports: total - resolved,
            resolved_reports: resolved,
            unread_messages: 0
          });
        }

      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Accessing Vault...</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user?.full_name?.split(' ')[0] || user?.username || 'Student';

  // --- Dynamic Resolution Rate Calculation ---
  const resolutionRate = stats.total_reports > 0 
    ? Math.round((stats.resolved_reports / stats.total_reports) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              Security Node: Active
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            Welcome, <span className="text-orange-500">{displayName}</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-sm md:text-lg font-medium leading-relaxed italic opacity-90">
            Monitoring your safety logs. All {stats.total_reports} reports are currently encrypted.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 text-white/5 text-[12rem] font-black italic select-none pointer-events-none">
          VAULT
        </div>
      </div>

      {/* Yahan StudentStats component ko 'stats' prop bheja ja raha hai. 
          Aapko StudentStats.jsx file ke andar 'Unread Messages' card ko 
          'Resolution Rate' card se badalna hoga (jaisa maine pichle response me bataya tha).
      */}
      <StudentStats stats={stats} resolutionRate={resolutionRate} loading={dataLoading} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <QuickActions />
        <RecentActivity activities={activities} loading={dataLoading} />
      </div>

    </div>
  );
}