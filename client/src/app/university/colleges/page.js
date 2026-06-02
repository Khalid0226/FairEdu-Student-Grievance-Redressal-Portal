'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSearch, FaEye, FaEnvelope, FaMapMarkerAlt, FaSync, 
  FaPlus, FaPhone, FaUserTie, FaClock, FaExclamationTriangle, FaDownload, FaLock, FaUniversity, FaComments, FaTrashAlt
} from 'react-icons/fa';

const collegeTypes = ['Engineering', 'Medical', 'Arts & Science', 'Law', 'Pharmacy', 'Commerce', 'General'];
const complianceStatus = ['All', 'Compliant', 'Pending', 'Non-Compliant'];

export default function UniversityColleges() {
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCompliance, setSelectedCompliance] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('--:--');

  // --- REGISTRATION STATES ---
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0); 
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    college_name: '',
    college_code: '',
    email: '',
    password: '',
    type: 'General',
    contact_person: '',
    alternate_contact: '',
    location: ''
  });

  // --- DELETE COLLEGE HANDLER ---
  const handleDelete = async (collegeId, collegeName) => {
    const confirmDelete = window.confirm(`DANGER: Are you sure you want to delete ${collegeName.toUpperCase()}? This action will permanently remove the node and all associated data from the database.`);
    
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/university/colleges/${collegeId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // UI se turant remove karne ke liye
        setColleges(prev => prev.filter(c => c.id !== collegeId));
        alert("SUCCESS: College Node Decommissioned.");
      } else {
        const data = await response.json();
        alert("DELETE FAILED: " + (data.error || "Server error"));
      }
    } catch (err) {
      alert("NETWORK ERROR: Backend unreachable.");
    } finally {
      setLoading(false);
    }
  };

  // --- REDIRECT TO CHAT ---
  const handleGoToChat = (collegeName) => {
    router.push(`/university/message?select=${encodeURIComponent(collegeName)}`);
  };

  // --- FETCH COLLEGES ---
  const fetchColleges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token'); 
      const response = await fetch('http://127.0.0.1:8000/api/university/colleges/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('BACKEND CONNECTION ERROR');

      const data = await response.json();
      setColleges(Array.isArray(data) ? data : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const openRegisterModal = () => {
    setFormData({ 
      college_name: '', college_code: '', email: '', password: '', 
      type: 'General', contact_person: '', alternate_contact: '', location: '' 
    });
    setModalKey(prev => prev + 1); 
    setIsRegisterModalOpen(true);
  };

  // --- REGISTER NODE HANDLER ---
  const handleRegisterNode = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/university/register-node/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsRegisterModalOpen(false);
        fetchColleges(); 
      } else {
        const resData = await response.json();
        alert("Registration Failed: " + (resData.message || "Invalid Data"));
      }
    } catch (err) {
      alert("Network Error: Backend not reachable");
    } finally {
      setSubmitting(false);
    }
  };

  // --- PDF GENERATION ---
  const downloadCollegePDF = async (college) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      const cName = college.college_name || college.name || 'N/A';
      doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
      doc.text("COLLEGE ANALYSIS REPORT", 15, 25);
      doc.setFontSize(10); doc.text(`DATE: ${new Date().toLocaleString()}`, 15, 35);
      doc.setTextColor(255, 90, 0); doc.setFontSize(16); doc.text(cName.toUpperCase(), 15, 60);
      const tableData = [
        ["COLLEGE CODE", college.college_code || 'N/A'],
        ["CATEGORY", college.type || 'General'],
        ["STATUS", (college.status || 'ACTIVE').toUpperCase()],
        ["COMPLIANCE", (college.compliance || 'N/A').toUpperCase()],
        ["TOTAL STUDENTS", college.students?.toString() || '0'],
        ["CONTACT PERSON", college.contact_person || 'N/A'],
        ["LOCATION", college.location || college.address || 'N/A']
      ];
      autoTable(doc, {
        startY: 70, head: [['SPECIFICATION', 'DETAILS']], body: tableData, theme: 'grid',
        headStyles: { fillColor: [255, 90, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      doc.save(`${cName.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) { alert("Failed to export PDF."); }
  };

  const filteredColleges = colleges.filter(college => {
    const name = (college.college_name || college.name || '').toLowerCase();
    const code = (college.college_code || '').toString().toLowerCase();
    const type = (college.type || 'General').toLowerCase(); 
    const compliance = (college.compliance || 'Non-Compliant').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || type === selectedType.toLowerCase();
    const matchesCompliance = selectedCompliance === 'All' || compliance === selectedCompliance.toLowerCase();
    return matchesSearch && matchesType && matchesCompliance;
  });

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffcf9] p-6 text-center">
      <FaExclamationTriangle className="text-red-500 text-7xl mb-6 animate-pulse" />
      <h2 className="text-4xl font-black italic uppercase text-gray-900 tracking-tighter mb-2">Sync Error</h2>
      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">{error}</p>
      <button onClick={fetchColleges} className="bg-black text-white px-12 py-4 rounded-2xl font-black uppercase text-[11px] hover:bg-orange-600 transition-all shadow-xl">Retry Connection</button>
    </div>
  );

  if (loading && !submitting && colleges.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <FaSync className="animate-spin text-orange-500 text-5xl mb-4" />
      <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Live Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-8 p-6 bg-[#fffcf9] min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black italic uppercase text-gray-900 tracking-tighter">Affiliated Colleges</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            <FaClock className="text-orange-500" /> LAST SYNC: {lastUpdated}
          </div>
        </div>
        <button 
          onClick={openRegisterModal}
          className="bg-orange-600 hover:bg-black text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase transition-all shadow-xl flex items-center gap-3"
        >
          <FaPlus /> REGISTER NEW NODE
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Nodes', val: colleges.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Compliant', val: colleges.filter(c => (c.compliance || '').toUpperCase() === 'COMPLIANT').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Students', val: colleges.reduce((sum, c) => sum + (Number(c.students) || 0), 0), color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Cases', val: colleges.reduce((sum, c) => sum + (Number(c.pending_cases) || 0), 0), color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-[2.5rem] p-8 border-2 border-white shadow-sm`}>
            <div className={`text-4xl font-black italic ${stat.color}`}>{stat.val}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-5 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow min-w-[300px]">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="SEARCH BY NAME OR CODE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 border-2 border-orange-50 rounded-3xl bg-orange-50/20 text-[11px] font-bold uppercase outline-none"
          />
        </div>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-8 py-5 border-2 border-orange-50 rounded-3xl bg-white text-[10px] font-black uppercase outline-none cursor-pointer">
          <option value="All">All Types</option>
          {collegeTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selectedCompliance} onChange={(e) => setSelectedCompliance(e.target.value)} className="px-8 py-5 border-2 border-orange-50 rounded-3xl bg-white text-[10px] font-black uppercase outline-none cursor-pointer">
          {complianceStatus.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-orange-50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-orange-50/30 text-[10px] font-black uppercase text-gray-400 border-b border-orange-100">
              <th className="py-8 px-10">College Node</th>
              <th className="py-8 px-6">Location</th>
              <th className="py-8 px-6 text-center">Students</th>
              <th className="py-8 px-6 text-center">Compliance</th>
              <th className="py-8 px-6 text-center">Type</th> 
              <th className="py-8 px-10 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-orange-50/40 transition-all group">
                  <td className="py-8 px-10">
                    <div className="font-black italic uppercase text-gray-800 text-xl tracking-tighter">
                      {college.college_name || college.name}
                    </div>
                    <div className="text-[10px] font-black text-orange-500 mt-1 uppercase">
                      CODE: {college.college_code}
                    </div>
                  </td>
                  <td className="py-8 px-6">
                    <div className="flex items-start gap-2 text-[11px] font-bold text-gray-500 italic uppercase">
                      <FaMapMarkerAlt className="mt-1 text-orange-400 shrink-0" />
                      {college.location || college.address || 'Location N/A'}
                    </div>
                  </td>
                  <td className="py-8 px-6 text-center font-black italic text-gray-700 text-lg">
                    {college.students || 0}
                  </td>
                  <td className="py-8 px-6 text-center">
                    <div className="flex justify-center">
                      <span className={`min-w-[120px] px-4 py-2 rounded-xl text-[9px] font-black uppercase border tracking-tighter whitespace-nowrap shadow-sm ${
                        (college.compliance || '').toUpperCase() === 'COMPLIANT' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {college.compliance || 'Non-Compliant'}
                      </span>
                    </div>
                  </td>
                  <td className="py-8 px-6 text-center">
                      <span className="bg-zinc-100 text-zinc-800 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase italic border border-zinc-200">
                        {college.type && college.type !== "N/A" ? college.type : 'General'}
                      </span>
                  </td>
                  <td className="py-8 px-10 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleGoToChat(college.college_name || college.name)} 
                        title="Open Chat"
                        className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-black shadow-lg transition-all"
                      >
                        <FaComments size={18} />
                      </button>

                      <button onClick={() => setSelectedCollege(college)} title="View Node Details" className="bg-black text-white p-4 rounded-2xl hover:bg-orange-600 shadow-lg transition-all"><FaEye size={18} /></button>
                      <button onClick={() => downloadCollegePDF(college)} title="Download Report" className="bg-orange-50 text-orange-600 p-4 rounded-2xl hover:bg-orange-600 hover:text-white shadow-lg border border-orange-100 transition-all"><FaDownload size={18} /></button>
                      
                      {/* 🔴 NEW DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(college.id, college.college_name || college.name)} 
                        title="Delete College Node"
                        className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white shadow-lg border border-red-100 transition-all"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-20 text-center text-gray-400 font-black uppercase tracking-widest italic">No colleges found matching these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS REMAIN THE SAME... */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] max-w-3xl w-full p-8 md:p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[92vh] overflow-y-auto overflow-x-hidden scrollbar-hide"
               style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            
            <div className="flex items-center gap-5 mb-6">
               <div className="bg-orange-600 p-4 rounded-2xl text-white shadow-xl">
                 <FaUniversity size={24} />
               </div>
               <h2 className="text-3xl md:text-4xl font-black italic uppercase text-gray-900 tracking-tighter">Deploy New Node</h2>
            </div>
            
            <form onSubmit={handleRegisterNode} className="space-y-4" autoComplete="new-password">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">College Full Name</label>
                <div className="relative">
                  <FaUniversity className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                  <input 
                    required 
                    type="text" 
                    name="new-college-node-name"
                    autoComplete="off"
                    value={formData.college_name}
                    placeholder="E.G. RBIMS AHMEDABAD" 
                    className="w-full pl-14 p-4 bg-gray-50 rounded-[1.2rem] border-2 border-transparent focus:border-orange-500 outline-none font-bold uppercase text-[11px] transition-all" 
                    onChange={(e) => setFormData({...formData, college_name: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">College Type</label>
                  <select 
                    required
                    className="w-full p-4 bg-gray-50 rounded-[1.2rem] outline-none font-bold uppercase text-[11px] border-2 border-transparent focus:border-orange-500 cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    {collegeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">Node ID (College Code)</label>
                  <div className="relative">
                    <FaUserTie className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input 
                      required 
                      type="text" 
                      name="new-node-code-id"
                      autoComplete="off"
                      value={formData.college_code}
                      placeholder="CODE549" 
                      className="w-full pl-14 p-4 bg-[#E8F0FE] rounded-[1.2rem] outline-none font-bold uppercase text-[11px]"
                      onChange={(e) => setFormData({...formData, college_code: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">Node Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input 
                      required 
                      type="email" 
                      name="node-unique-email"
                      autoComplete="off"
                      value={formData.email}
                      placeholder="ADMIN@COLLEGE.EDU" 
                      className="w-full pl-14 p-4 bg-white border-2 border-orange-500/30 rounded-[1.2rem] outline-none font-bold uppercase text-[11px]"
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">Node Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input 
                      required 
                      type="password" 
                      name="node-unique-password"
                      autoComplete="new-password"
                      value={formData.password}
                      placeholder="••••••••" 
                      className="w-full pl-14 p-4 bg-[#E8F0FE] rounded-[1.2rem] outline-none font-bold text-[11px]"
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-100">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">Contact Person</label>
                  <div className="relative">
                    <FaUserTie className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required type="text" value={formData.contact_person}
                      placeholder="E.G. PROF. BHAVESH" 
                      className="w-full pl-14 p-4 bg-gray-50 rounded-[1.2rem] outline-none font-bold uppercase text-[11px]"
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required type="text" value={formData.alternate_contact}
                      placeholder="990XXXXXXX" 
                      className="w-full pl-14 p-4 bg-gray-50 rounded-[1.2rem] outline-none font-bold uppercase text-[11px]"
                      onChange={(e) => setFormData({...formData, alternate_contact: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-2 tracking-widest">Campus Location (Address)</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required type="text" value={formData.location}
                    placeholder="E.G. NAVRANGPURA, AHMEDABAD" 
                    className="w-full pl-14 p-4 bg-gray-50 rounded-[1.2rem] outline-none font-bold uppercase text-[11px]"
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button disabled={submitting} type="submit" className="flex-1 bg-orange-600 text-white py-4 rounded-[1.2rem] font-black uppercase text-[11px] hover:bg-black transition-all shadow-xl disabled:bg-gray-400">
                  {submitting ? 'DEPLOYING...' : 'CONFIRM REGISTRATION'}
                </button>
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-8 bg-gray-100 text-gray-400 py-4 rounded-[1.2rem] font-black uppercase text-[11px] hover:bg-gray-200 transition-all">CANCEL</button>
              </div>
            </form>

            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>
      )}

      {selectedCollege && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[92vh] overflow-y-auto scrollbar-hide"
               style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <div className="p-8 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center text-gray-900 font-black italic uppercase">
                <div className="flex gap-4 items-center">
                   <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl tracking-tighter italic">
                     {(selectedCollege.college_name || selectedCollege.name).charAt(0)}
                   </div>
                   <div>
                     <h2 className="text-2xl tracking-tighter leading-none">{selectedCollege.college_name || selectedCollege.name}</h2>
                     <span className="text-orange-600 text-[10px] tracking-widest">{selectedCollege.college_code}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedCollege(null)} className="text-gray-300 hover:text-red-500 text-3xl leading-none">×</button>
            </div>
            <div className="p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-orange-500 pl-4">College Information</h4>
                  <div className="space-y-3 text-[12px] font-bold uppercase italic text-gray-600">
                    <div className="flex justify-between border-b pb-2"><span>Type:</span> <span className="text-black font-black">{selectedCollege.type || 'General'}</span></div>
                    <div className="flex justify-between border-b pb-2"><span>Status:</span> <span className="text-green-600">{selectedCollege.status || 'ACTIVE'}</span></div>
                    <div className="flex justify-between"><span>Compliance:</span> <span className="text-orange-600">{selectedCollege.compliance || 'N/A'}</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-orange-500 pl-4">Contact Point</h4>
                  <div className="space-y-3 text-[12px] font-bold uppercase italic text-gray-600">
                    <div className="flex items-center gap-3 truncate"><FaUserTie className="text-orange-500 shrink-0"/> {selectedCollege.contact_person || 'Not Assigned'}</div>
                    <div className="flex items-center gap-3 truncate"><FaEnvelope className="text-orange-500 shrink-0"/> {selectedCollege.email || selectedCollege.user_email || 'No Email Registered'}</div>
                    <div className="flex items-center gap-3 truncate"><FaPhone className="text-orange-500 shrink-0"/> {selectedCollege.alternate_contact || selectedCollege.phone_number || 'No Contact Number'}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50/50 p-6 rounded-[2rem] text-center border-2 border-white shadow-sm">
                  <div className="text-2xl font-black italic text-blue-600">{selectedCollege.students || 0}</div>
                  <div className="text-[8px] font-black uppercase text-gray-400 mt-1">Students</div>
                </div>
                <div className="bg-green-50/50 p-6 rounded-[2rem] text-center border-2 border-white shadow-sm">
                  <div className="text-2xl font-black italic text-green-600">{selectedCollege.reports_count || 0}</div>
                  <div className="text-[8px] font-black uppercase text-gray-400 mt-1">Reports</div>
                </div>
                <div className="bg-red-50/50 p-6 rounded-[2rem] text-center border-2 border-white shadow-sm">
                  <div className="text-2xl font-black italic text-red-600">{selectedCollege.pending_cases || 0}</div>
                  <div className="text-[8px] font-black uppercase text-gray-400 mt-1">Pending</div>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-[1.5rem] flex items-center gap-4">
                <FaMapMarkerAlt className="text-orange-500 text-lg shrink-0" />
                <p className="text-[11px] font-bold uppercase text-gray-500 italic">{selectedCollege.location || selectedCollege.address || 'Address not listed'}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                   onClick={() => handleGoToChat(selectedCollege.college_name || selectedCollege.name)} 
                   className="flex-1 bg-orange-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  <FaComments className="text-lg" /> Chat with College
                </button>
                <button onClick={() => downloadCollegePDF(selectedCollege)} className="flex-1 bg-black text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl">
                  <FaDownload className="text-lg" /> Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}