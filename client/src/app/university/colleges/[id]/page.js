'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaUniversity, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFileAlt } from 'react-icons/fa';

export default function CollegeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [collegeData, setCollegeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/university/college/${id}/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        const json = await response.json();
        if (json.status === 'success') {
          setCollegeData(json.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollegeDetails();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-zinc-400 animate-pulse">Accessing Node {id}...</div>;

  return (
    <div className="p-6 md:p-12 bg-[#FCFCFC] min-h-screen space-y-8">
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-orange-600 transition-colors">
        <FaArrowLeft /> Return to Command Center
      </button>

      {/* College Profile Header */}
      <div className="bg-[#0A0A0A] rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-orange-600 text-[10px] font-black px-4 py-1 rounded-full uppercase italic">Active Node</span>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">ID: {id}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">
            {collegeData?.name || "Institution Node"}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-zinc-800 pt-8 mt-4">
             <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold uppercase italic"><FaMapMarkerAlt className="text-orange-600"/> {collegeData?.address || "Gujarat, India"}</div>
             <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold uppercase italic"><FaPhone className="text-orange-600"/> {collegeData?.contact || "+91-XXXXXXXXXX"}</div>
             <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold uppercase italic"><FaEnvelope className="text-orange-600"/> {collegeData?.email || "node@gtu.ac.in"}</div>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Compliance Score</p>
              <p className="text-5xl font-black italic text-zinc-900">98%</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Reports</p>
              <p className="text-5xl font-black italic text-orange-600">{collegeData?.reports_count || 0}</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Status</p>
              <p className="text-5xl font-black italic text-green-600 uppercase">Clear</p>
          </div>
      </div>

      {/* Placeholder for Reports List */}
      <div className="bg-white rounded-[3.5rem] p-10 border border-zinc-100 shadow-sm">
          <h3 className="font-black text-2xl italic uppercase tracking-tighter mb-8">Recent Incident Logs</h3>
          <div className="p-20 border-2 border-dashed border-zinc-100 rounded-[2rem] text-center">
              <FaFileAlt className="text-zinc-100 text-5xl mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">No active critical incidents found for this node</p>
          </div>
      </div>
    </div>
  );
}