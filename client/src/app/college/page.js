'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CollegeStats from "@/components/college/dashboard/CollegeStats";
import CollegeReports from "@/components/college/dashboard/CollegeReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trash2 } from 'lucide-react'; // Delete icon ke liye

export default function CollegeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    resolved: 0, 
    messages: 0,
    committee_count: 0 
  });
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'college') {
        router.replace(`/${user.role}`);
      }
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const statsRes = await fetch('http://127.0.0.1:8000/api/student/dashboard/stats/', { 
        headers: { 'Authorization': `Token ${token}` }
      });
      const statsData = await statsRes.json();
      
      const memberRes = await fetch('http://127.0.0.1:8000/api/college/committee/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      let currentMembers = [];
      if (memberRes.ok) {
        currentMembers = await memberRes.json();
        setMembers(currentMembers);
      }

      if (statsData.status === 'success') {
        setStats({
          total: statsData.total_reports || 0,
          pending: statsData.active_reports || 0,
          resolved: statsData.resolved_reports || 0, 
          messages: statsData.unread_messages || 0,
          committee_count: currentMembers.length 
        });
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'college') {
      fetchData();
    }
  }, [user]);

  // --- NEW: DELETE MEMBER LOGIC ---
  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this committee member?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/college/committee/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (res.ok) {
        // UI se turant remove karne ke liye state update
        setMembers(members.filter(m => m.id !== id));
        // Stats update karne ke liye refresh
        fetchData();
      } else {
        alert("Failed to delete member.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/college/committee/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMember)
      });

      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
        setNewMember({ name: '', role: '' });
      } else {
        const errorData = await res.json();
        alert("Error: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user || user.role !== 'college') return null;

  const graphData = [
    { name: 'Total', value: stats.total, color: '#f97316' },
    { name: 'Pending', value: stats.pending, color: '#3f3f46' },
    { name: 'Resolved', value: stats.resolved, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-orange-600 dark:from-white dark:to-orange-400 rounded-[2.5rem] p-8 text-white dark:text-black shadow-xl">
        <h1 className="text-3xl font-black italic uppercase mb-2 leading-none">
          College <span className="opacity-70 text-orange-200 dark:text-orange-700">Control Room</span>
        </h1>
        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">
          Institutional Safety & Discipline Management
        </p>
      </div>

      <CollegeStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic uppercase dark:text-white leading-none">
                Incident <span className="text-orange-500">Analytics</span>
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
                <span className="flex items-center gap-1 text-orange-500 underline decoration-2 underline-offset-4">Total: {stats.total}</span>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={45}>
                  {graphData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-xl font-black italic uppercase mb-6 dark:text-white leading-none">
            <span className="text-orange-500">Anti-Ragging</span> Committee
          </h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {members.length > 0 ? members.map((member, index) => (
              <div key={member.id || index} className="group flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:scale-[1.02] transition-transform">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-950 text-white rounded-full flex items-center justify-center font-black text-sm uppercase">
                    {member.name ? member.name.charAt(0) : '?'}
                    </div>
                    <div>
                    <p className="text-sm font-bold dark:text-white uppercase">{member.name}</p>
                    <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">{member.role || member.designation}</p>
                    </div>
                </div>
                {/* DELETE BUTTON ICON */}
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-600 transition-all"
                  title="Remove Member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )) : (
              <p className="text-[10px] text-zinc-400 font-bold uppercase text-center py-10">No members assigned yet.</p>
            )}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-6 text-center text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-[10px] font-black uppercase py-4 border-2 border-dashed border-orange-200 dark:border-zinc-800 rounded-2xl transition-all"
          >
            + Assign New Member
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden p-8">
        <CollegeReports />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-8 rounded-[3rem] shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase italic">Assign <span className="text-orange-600">Member</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black">✕</button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase ml-2 text-zinc-400 tracking-widest">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Prof. Arvind Swamy"
                  className="w-full p-4 mt-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase ml-2 text-zinc-400 tracking-widest">Role / Designation</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Chief Coordinator"
                  className="w-full p-4 mt-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest text-zinc-400">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Assigning...' : 'Confirm Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}