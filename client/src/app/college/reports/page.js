'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // URL se ID nikalne ke liye
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FaDownload, FaEye, FaSearch, FaShieldAlt, 
  FaCheckCircle, FaFilePdf, FaFilter, FaTimes, 
  FaCheckDouble, FaCalendarAlt, FaFingerprint, 
  FaMapMarkerAlt, FaUsers, FaInfoCircle, FaClock,
  FaChevronDown, FaUserCircle, FaVideo, FaMicrophone 
} from 'react-icons/fa';

export default function CollegeReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const searchParams = useSearchParams();
  const reportIdFromUrl = searchParams.get('id'); // Dashboard se aane wali ID

  // --- FETCH DATA ---
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/college/reports/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      const data = await response.json();
      const rawData = data.reports || data || [];
      const sortedData = Array.isArray(rawData) ? rawData.sort((a, b) => b.id - a.id) : [];
      setReports(sortedData);

      // --- AUTO-OPEN LOGIC ---
      // Agar URL mein ID hai, toh usey dhoond kar modal kholo
      if (reportIdFromUrl && sortedData.length > 0) {
        const foundIndex = sortedData.findIndex(r => r.id.toString() === reportIdFromUrl);
        if (foundIndex !== -1) {
          const report = sortedData[foundIndex];
          const serialNo = sortedData.length - foundIndex;
          setSelectedReport({ ...report, serialNo });
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportIdFromUrl]); // Re-run if ID in URL changes

  // Modal close karne par URL saaf karne ka function
  const closeReportModal = () => {
    setSelectedReport(null);
    window.history.replaceState(null, '', '/college/reports');
  };

  // --- UPDATE STATUS LOGIC ---
  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/college/reports/${reportId}/resolve/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
        setShowStatusDropdown(false);
        alert(`Success: Report marked as ${newStatus}`);
      }
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // --- PDF LOGIC ---
  const handleDownloadPDF = (report, serialNo) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("OFFICIAL INCIDENT AUDIT REPORT", 20, 25);
    doc.setFontSize(9);
    doc.text(`VERIFIED DOCUMENT | CASE NO: #${serialNo}`, 20, 35);

    const isActuallyAnon = report.is_anonymous === true;
    const displayName = isActuallyAnon ? "ANONYMOUS (PROTECTED)" : (report.student_name || 'N/A');
    const displayEnroll = isActuallyAnon ? "HIDDEN" : (report.student_details?.student_id || 'N/A');

    autoTable(doc, {
      startY: 55,
      head: [['Metric Category', 'Verified Information']],
      body: [
        ['Display Serial Number', `#${serialNo}`],
        ['Complainant Name', displayName],
        ['Enrollment ID', displayEnroll],
        ['Incident Type', report.incident_type || 'N/A'],
        ['Location', report.location || 'Campus'],
        ['Involved Parties', report.involved_parties || 'N/A'],
        ['Incident Date', report.incident_date || 'N/A'],
        ['Current Status', report.status || 'Pending'],
        ['Full Description', report.description || 'No detailed description available.'],
      ],
      headStyles: { fillColor: [249, 115, 22], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      theme: 'grid'
    });

    doc.save(`Report_${serialNo}.pdf`);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 font-black text-orange-600 tracking-widest animate-pulse">
      SYNCHRONIZING SECURE REPOSITORY...
    </div>
  );

  const filteredData = reports.filter(r => 
    r.incident_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans selection:bg-orange-100">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full text-orange-600 font-black text-[9px] tracking-widest uppercase mb-4 border border-orange-100">
          <FaCheckDouble className="animate-pulse" /> Compliance Network Active
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-950 mb-2 italic">
          Records Vault<span className="text-orange-500">.</span>
        </h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="w-8 h-[1px] bg-slate-200"></span> Institutional Audit Repository
        </p>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-[4rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search records..."
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl outline-none font-bold text-slate-600 shadow-sm focus:border-orange-500 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <FaFilter className="text-slate-300 hover:text-orange-600 cursor-pointer text-xl transition-colors" />
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <th className="px-10 py-8">Audit Identification</th>
                <th className="px-10 py-8">Identity & Enrollment</th>
                <th className="px-10 py-8 text-center">Status</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((report, index) => {
                const serialNo = filteredData.length - index;
                const isAnon = report.is_anonymous === true;
                
                return (
                  <tr key={report.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.8rem] bg-slate-950 flex items-center justify-center text-2xl text-white group-hover:bg-orange-600 transition-all shadow-xl">
                          <FaFilePdf />
                        </div>
                        <div>
                          <p className="font-black text-slate-950 text-lg tracking-tight">Report #{serialNo}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic line-clamp-1 max-w-[200px]">
                            {report.incident_type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-4">
                        {isAnon ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-orange-500 flex items-center justify-center text-xs shadow-inner">
                              <FaShieldAlt />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm tracking-tight uppercase">Anonymous</p>
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Protected</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs shadow-inner">
                              <FaUsers />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm tracking-tight uppercase max-w-[200px] truncate">
                                {report.student_name}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Enroll: {report.student_details?.student_id || 'N/A'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        report.status?.toLowerCase() === 'resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {report.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setSelectedReport({...report, serialNo}); setShowStatusDropdown(false); }} className="w-12 h-12 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 shadow-sm flex items-center justify-center transition-all">
                          <FaEye />
                        </button>
                        <button onClick={() => handleDownloadPDF(report, serialNo)} className="w-12 h-12 bg-slate-950 text-white rounded-xl hover:bg-orange-600 shadow-xl flex items-center justify-center transition-all">
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="h-2 bg-orange-600 w-full sticky top-0"></div>
            <button onClick={closeReportModal} className="absolute top-8 right-8 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 z-10 transition-colors">
              <FaTimes />
            </button>

            <div className="p-10">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center text-3xl border border-orange-100/50">
                  <FaFingerprint />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight italic">Case #{selectedReport.serialNo}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <FaShieldAlt className="text-orange-500" /> Official Security Record Entry
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-8 border border-slate-100">
                <div className="flex items-center gap-6">
                  {selectedReport.is_anonymous === true ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 text-orange-500 flex items-center justify-center text-2xl">
                        <FaShieldAlt />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Source Identity</p>
                        <h3 className="text-2xl font-black text-slate-950 italic">ANONYMOUS SOURCE</h3>
                        <p className="text-xs font-bold text-emerald-600 italic">No personal data transmitted</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-2xl shadow-lg">
                        <FaUserCircle />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Verified Complainant</p>
                        <h3 className="text-2xl font-black text-slate-950 italic break-all uppercase">{selectedReport.student_name}</h3>
                        <p className="text-sm font-bold text-orange-600 mt-1">
                          Enroll: <span className="text-slate-900 font-black">{selectedReport.student_details?.student_id || 'N/A'}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2"><FaCalendarAlt/> Date</p>
                  <p className="font-bold text-slate-900">{selectedReport.incident_date}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2"><FaClock/> Time</p>
                  <p className="font-bold text-slate-900">{selectedReport.incident_time || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2"><FaInfoCircle/> Status</p>
                  <p className={`font-black uppercase text-xs tracking-widest ${selectedReport.status?.toLowerCase() === 'resolved' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {selectedReport.status || 'Pending'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-orange-50/30 p-6 rounded-3xl border border-orange-100/50">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-2 tracking-widest flex items-center gap-2"><FaMapMarkerAlt/> Location</p>
                  <p className="font-bold text-slate-900">{selectedReport.location}</p>
                </div>
                <div className="bg-orange-50/30 p-6 rounded-3xl border border-orange-100/50">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-2 tracking-widest flex items-center gap-2"><FaUsers/> Involved Parties</p>
                  <p className="font-bold text-slate-900">{selectedReport.involved_parties}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-8 rounded-[2.5rem] mb-10 relative overflow-hidden shadow-2xl">
                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-4">Case Description</p>
                <p className="text-white/90 font-medium leading-relaxed italic text-xl">"{selectedReport.description}"</p>
              </div>

              {/* Evidence Section */}
              <div className="mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <FaShieldAlt className="text-orange-500" /> Digital Evidence Attachments
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedReport.evidence_image && (
                    <div className="group relative rounded-[2rem] border border-slate-100 overflow-hidden bg-slate-50 shadow-sm">
                      <img 
                        src={selectedReport.evidence_image.startsWith('http') ? selectedReport.evidence_image : `http://127.0.0.1:8000${selectedReport.evidence_image}`} 
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        alt="Evidence"
                      />
                      <div className="p-4 flex justify-between items-center bg-white/90 backdrop-blur-sm absolute bottom-0 w-full border-t border-slate-50">
                        <span className="text-[9px] font-black uppercase text-slate-500">Image</span>
                        <a href={selectedReport.evidence_image.startsWith('http') ? selectedReport.evidence_image : `http://127.0.0.1:8000${selectedReport.evidence_image}`} 
                           target="_blank" className="text-orange-600 font-black text-[9px] hover:underline">OPEN</a>
                      </div>
                    </div>
                  )}

                  {selectedReport.evidence_video && (
                    <div className="rounded-[2rem] border border-slate-100 p-6 bg-slate-50 flex flex-col items-center justify-center text-center gap-3">
                      <FaVideo className="text-xl text-slate-950" />
                      <p className="text-[9px] font-black uppercase text-slate-900">Video Clip</p>
                      <a href={selectedReport.evidence_video.startsWith('http') ? selectedReport.evidence_video : `http://127.0.0.1:8000${selectedReport.evidence_video}`} 
                         target="_blank" className="bg-slate-950 text-white px-5 py-2 rounded-xl text-[8px] font-black uppercase hover:bg-orange-600 transition-all">STREAM</a>
                    </div>
                  )}

                  {selectedReport.evidence_audio && (
                    <div className="rounded-[2rem] border border-orange-100 p-6 bg-orange-50/30 flex flex-col items-center justify-center text-center gap-3">
                      <FaMicrophone className="text-xl text-orange-600" />
                      <p className="text-[9px] font-black uppercase text-orange-600">Audio Record</p>
                      <a href={selectedReport.evidence_audio.startsWith('http') ? selectedReport.evidence_audio : `http://127.0.0.1:8000${selectedReport.evidence_audio}`} 
                         target="_blank" className="bg-orange-600 text-white px-5 py-2 rounded-xl text-[8px] font-black uppercase hover:bg-slate-950 transition-all">LISTEN</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 relative">
                <div className="flex-1 relative">
                  <button 
                    disabled={statusUpdating}
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <FaCheckCircle className="text-lg" /> 
                    {statusUpdating ? 'Updating...' : `Update Status: ${selectedReport.status || 'Pending'}`}
                    <FaChevronDown className={`transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showStatusDropdown && (
                    <div className="absolute bottom-full left-0 w-full mb-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in slide-in-from-bottom-2">
                      {['Pending', 'Under Investigation', 'Resolved', 'Dismissed'].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => handleUpdateStatus(selectedReport.id, statusOption)}
                          className="w-full py-4 px-8 text-left font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-slate-50 hover:text-orange-600 border-b border-slate-50 last:border-0 transition-all"
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleDownloadPDF(selectedReport, selectedReport.serialNo)}
                  className="flex-1 bg-slate-950 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
                >
                  <FaFilePdf className="text-lg" /> Export Audit PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}