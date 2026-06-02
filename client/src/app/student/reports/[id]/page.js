'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FaShieldAlt, FaFileAlt, FaImage, FaVideo, 
  FaMicrophone, FaDownload, FaCheckCircle, 
  FaClock, FaSearch, FaArrowLeft, FaFilePdf, FaTrashAlt
} from 'react-icons/fa';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id;
  const BACKEND_URL = "http://127.0.0.1:8000"; 
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DATA & AUTO-MARK SEEN ---
  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        // Jab ye API hit hogi, views.py wala logic isse 'is_seen_by_student=True' kar dega
        const response = await fetch(`${BACKEND_URL}/api/student/reports/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        if (data.status === "success" && data.reports) {
          const foundReport = data.reports.find(r => String(r.id) === String(reportId));
          if (foundReport) setReportData(foundReport);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReportDetail();
  }, [reportId]);

  // --- DELETE LOGIC ---
  const handleDeleteReport = async () => {
    if (!window.confirm("🚨 Are you sure? Ye report database se permanently delete ho jayegi.")) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/student/reports/delete/${reportId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert("✅ Report Deleted Successfully!");
        router.push('/student/reports');
      } else {
        alert("❌ Delete failed. Check permissions.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- PDF LOGIC ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const serialNo = reportData?.serial_number || reportId;

    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("OFFICIAL STUDENT INCIDENT COPY", 20, 25);
    doc.setFontSize(9);
    doc.text(`VERIFIED SYSTEM RECORD | CASE: #${serialNo}`, 20, 35);

    autoTable(doc, {
      startY: 55,
      head: [['Category', 'Official Details']],
      body: [
        ['Case Number', `#${serialNo}`],
        ['Incident Type', reportData?.incident_type || 'N/A'],
        ['Current Status', (reportData?.status || 'Pending').toUpperCase()],
        ['Severity Level', (reportData?.severity || 'Normal').toUpperCase()],
        ['Date of Incident', formatDate(reportData?.incident_date)],
        ['Location', reportData?.location || 'Campus'],
        ['Involved Parties', reportData?.involved_parties || 'Anonymous / Not Listed'],
        ['Full Description', reportData?.description || 'No description provided.'],
      ],
      headStyles: { fillColor: [249, 115, 22], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6, overflow: 'linebreak' },
      columnStyles: { 0: { fontStyle: 'bold', width: 45 } },
      theme: 'grid'
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Anti-Ragging Portal | Verified Document", 20, doc.lastAutoTable.finalY + 10);
    doc.save(`Report_${serialNo}.pdf`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getFileUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center animate-pulse">
      <div className="text-orange-600 font-black tracking-widest uppercase text-xs">Fetching Case File...</div>
    </div>
  );

  if (!reportData) return <div className="p-20 text-center font-bold uppercase text-xs">Report not found.</div>;

  const currentStatus = reportData?.status?.toLowerCase() || 'pending';
  const isResolved = currentStatus === 'resolved';

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 gap-6">
        <div>
          <button onClick={() => router.back()} className="text-[10px] font-black text-orange-600 mb-2 flex items-center gap-2 hover:underline uppercase tracking-widest">
            <FaArrowLeft /> Back to Records
          </button>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-950 uppercase">
            Case Detail<span className="text-orange-500">.</span>
          </h1>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleDeleteReport} disabled={isDeleting} className="flex-1 md:flex-none bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100 flex items-center justify-center gap-2">
            <FaTrashAlt /> {isDeleting ? 'Removing...' : 'Delete'}
          </button>
          <button onClick={handleDownloadPDF} className="flex-1 md:flex-none bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl">
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-4 border-b border-gray-100 pb-2">
        {['details', 'evidence', 'messages', 'tracker'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === tab 
                ? 'border-b-2 border-orange-500 text-orange-600 scale-105' 
                : 'text-gray-400 hover:text-slate-950'
            }`}
          >
            {tab === 'tracker' ? '📍 Lifecycle' : tab}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm min-h-[450px]">
        
        {/* 1. DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-start border-b border-gray-50 pb-8">
              <div>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Official Submission</p>
                <h2 className="text-3xl font-black text-slate-950 uppercase">{reportData?.incident_type}</h2>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database ID</p>
                <p className="text-xl font-black text-slate-950">#{reportData?.serial_number || reportData?.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Status', value: reportData?.status, color: 'text-orange-600' },
                { label: 'Severity', value: reportData?.severity, color: 'text-red-600' },
                { label: 'Date', value: formatDate(reportData?.incident_date) },
                { label: 'Location', value: reportData?.location },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">{item.label}</p>
                  <p className={`text-xs font-black uppercase ${item.color || 'text-slate-950'}`}>{item.value || 'N/A'}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Official Description</p>
              <p className="text-white/90 text-lg leading-relaxed italic font-medium">"{reportData?.description}"</p>
            </div>
            
            {reportData.involved_parties && (
               <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <p className="text-[9px] font-black text-orange-600 uppercase mb-2">Parties Involved</p>
                  <p className="text-sm font-bold text-slate-900">{reportData.involved_parties}</p>
               </div>
            )}
          </div>
        )}

        {/* 2. EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-black uppercase mb-8 flex items-center gap-3">
              <FaImage className="text-orange-500" /> Digital Evidence Vault
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reportData.evidence_image && (
                <div className="rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm group bg-gray-50">
                  <img src={getFileUrl(reportData.evidence_image)} className="w-full h-48 object-cover group-hover:scale-105 transition-all" alt="Image Evidence"/>
                  <div className="p-4 flex justify-between items-center font-black text-[9px] tracking-widest uppercase">
                    <span className="flex items-center gap-2"><FaImage /> Photo</span>
                    <a href={getFileUrl(reportData.evidence_image)} target="_blank" className="text-orange-600 hover:underline">View File</a>
                  </div>
                </div>
              )}

              {reportData.evidence_video && (
                <div className="rounded-[2rem] border border-gray-100 p-6 shadow-sm bg-gray-50 flex flex-col items-center justify-center gap-4 text-center">
                  <FaVideo className="text-3xl text-slate-950" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Video Evidence</p>
                    <p className="text-[8px] text-gray-400 mt-1">MP4 / MOV FORMAT</p>
                  </div>
                  <a href={getFileUrl(reportData.evidence_video)} target="_blank" className="bg-slate-950 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-orange-600 transition-all">Play Video</a>
                </div>
              )}

              {reportData.evidence_audio && (
                <div className="rounded-[2rem] border border-gray-100 p-6 shadow-sm bg-gray-50 flex flex-col items-center justify-center gap-4 text-center">
                  <FaMicrophone className="text-3xl text-orange-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Audio Recording</p>
                    <p className="text-[8px] text-gray-400 mt-1">VOICE_MEMO.MP3</p>
                  </div>
                  <a href={getFileUrl(reportData.evidence_audio)} target="_blank" className="bg-orange-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-950 transition-all">Play Audio</a>
                </div>
              )}

              {!reportData.evidence_image && !reportData.evidence_video && !reportData.evidence_audio && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">No attachments linked to this case record.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95">
            <div className="bg-orange-50 p-12 rounded-[3rem] border border-orange-100 text-center max-w-lg">
               <h3 className="text-xl font-black text-slate-950 uppercase mb-3 tracking-tighter">Committee Secure Line</h3>
               <p className="text-gray-600 text-sm font-medium mb-8">Discuss this case anonymously with the assigned investigation board.</p>
               <Link href={`/student/messages`} className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl">
                 Open Secure Chat
               </Link>
            </div>
          </div>
        )}

        {/* 4. TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="max-w-md mx-auto py-10 animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-center font-black uppercase tracking-widest text-[10px] text-gray-400 mb-12 flex items-center justify-center gap-2">
              <FaClock className="text-orange-500" /> Audit Lifecycle
            </h3>
            <div className="space-y-12 relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-100"></div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] shadow-lg shadow-orange-200">
                  <FaCheckCircle />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-950">Report Filed</p>
                  <p className="text-[9px] font-bold text-gray-400 italic">Case initialized in vault</p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] ${currentStatus !== 'pending' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                  {currentStatus !== 'pending' ? <FaCheckCircle /> : <FaSearch />}
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase ${currentStatus !== 'pending' ? 'text-slate-950' : 'text-gray-300'}`}>In Review</p>
                  <p className="text-[9px] font-bold text-gray-400 italic">Committee evaluating evidence</p>
                </div>
              </div>

              <div className={`flex items-center gap-6 relative z-10 transition-all ${isResolved ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] ${isResolved ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                  <FaCheckCircle />
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase ${isResolved ? 'text-emerald-600' : 'text-gray-300'}`}>Resolved</p>
                  <p className="text-[9px] font-bold text-gray-400 italic">Final verdict issued</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}