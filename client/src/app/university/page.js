'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUniversity, FaExclamationTriangle, FaCheckCircle, 
  FaChartBar, FaFileAlt, FaSync, FaShieldAlt, FaChevronRight,
  FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaPaperPlane
} from 'react-icons/fa';

export default function UniversityDashboard() {
  const router = useRouter();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/university/stats/', {
          headers: { 'Authorization': `Token ${token}` }
        });

        const json = await response.json();
        if (json.status === 'success') {
          setStatsData({
            stats: json.stats,
            chart_data: json.chart_data
          });
        } else {
          setError(json.message || "Unauthorized Access");
        }
      } catch (err) {
        setError("Network Connection Failed. Check if Backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  // --- PROFESSIONAL GLOBAL MASTER REPORT ---
  const exportGlobalReport = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('p', 'mm', 'a4');

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text("GUJARAT TECHNOLOGICAL UNIVERSITY", 105, 18, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text("CENTRAL MONITORING TERMINAL | AUDIT & COMPLIANCE DIVISION", 105, 25, { align: 'center' });
      
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.8);
      doc.line(40, 30, 170, 30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("MASTER INSTITUTIONAL COMPLIANCE AUDIT REPORT", 105, 38, { align: 'center' });

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Report ID: GTU-MASTER-${new Date().getTime().toString().slice(-6)}`, 15, 53);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 195, 53, { align: 'right' });

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text("I. EXECUTIVE COMPLIANCE SUMMARY", 15, 65);

      autoTable(doc, {
        startY: 70,
        margin: { left: 15, right: 15 },
        body: [
          ["Total Affiliated Institutions", statsData?.stats?.total_colleges || '0'],
          ["Cumulative Incidents Reported", statsData?.stats?.total_reports || '0'],
          ["Successfully Resolved Cases", statsData?.stats?.resolved_reports || '0'],
          ["Pending Review Cases", statsData?.stats?.pending_reports || '0'],
          ["Global Compliance Status", "OPERATIONAL / COMPLIANT"]
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.1 },
        columnStyles: { 
          0: { fontStyle: 'bold', textColor: [71, 85, 105], width: 100 },
          1: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }
        }
      });

      doc.setFontSize(13);
      doc.text("II. INSTITUTION REGISTRY DETAILS", 15, doc.lastAutoTable.finalY + 15);

      const tableRows = statsData?.chart_data?.map((college, idx) => [
        { content: idx + 1, styles: { halign: 'center' } },
        { content: college.name.toUpperCase(), styles: { fontStyle: 'bold' } },
        { content: college.code, styles: { halign: 'center' } },
        { content: college.reports, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: (college.reports - (college.pending_cases || 0)), styles: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' } },
        { content: college.pending_cases || "0", styles: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' } },
        { content: "VERIFIED", styles: { halign: 'center', fontStyle: 'bold' } }
      ]) || [];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        margin: { left: 15, right: 15 },
        head: [['SR.', 'INSTITUTION NAME', 'CODE', 'TOTAL', 'RESOLVED', 'PENDING', 'STATUS']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', cellPadding: 5 },
        styles: { fontSize: 8, cellPadding: 4, valign: 'middle', lineColor: [200, 200, 200] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      const finalY = doc.lastAutoTable.finalY + 30;
      doc.setDrawColor(200);
      doc.line(15, finalY, 65, finalY);
      doc.line(145, finalY, 195, finalY);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("AUTHORIZED SIGNATORY", 15, finalY + 5);
      doc.text("REGISTRAR, GTU", 145, finalY + 5);
      doc.text("This is an electronically generated document. No physical signature is required.", 105, 285, { align: 'center' });

      doc.save(`GTU_Global_Master_Report_${new Date().getTime()}.pdf`);
    } catch (err) {
      alert("Report generation failed.");
    }
  };

  // --- PROFESSIONAL INDIVIDUAL COLLEGE REPORT ---
  const downloadCollegePDF = async (college) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      
      doc.setFillColor(234, 88, 12);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("INSTITUTION AUDIT: " + (college.name).toUpperCase(), 15, 25);
      
      autoTable(doc, {
        startY: 50,
        head: [['SPECIFICATION', 'DETAILS']],
        body: [
          ["COLLEGE CODE", college.code || 'N/A'],
          ["INSTITUTION TYPE", (college.type || 'GENERAL').toUpperCase()],
          ["PHYSICAL LOCATION", (college.address || "GUJARAT, INDIA").toUpperCase()],
          ["NODE ADMINISTRATOR", (college.contact_person || "OFFICIAL IN-CHARGE").toUpperCase()],
          ["CONTACT NUMBER", (college.phone_number|| "NOT PROVIDED")],
          ["OFFICIAL EMAIL", (college.email || college.user_email || "N/A").toUpperCase()],
          ["COMPLIANCE STATUS", "STRICTLY COMPLIANT"]
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245], width: 60 } }
      });

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.text("CASE PERFORMANCE ANALYTICS", 15, doc.lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['METRIC', 'COUNT', 'REMARKS']],
        body: [
          ["Total Incidents Logged", college.reports || '0', "Cumulative monitoring"],
          ["Cases Resolved", (college.reports - (college.pending_cases || 0)) || '0', "Action completed"],
          ["Under Active Review", college.pending_cases || '0', "Prioritized attention"],
          ["Registered Students", college.students || "0", "Portal active status"]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { cellPadding: 4 }
      });

      doc.save(`${college.name}_Audit_Report.pdf`);
    } catch (err) {
      alert("Error generating College Report");
    }
  };

  // --- FIXED NAVIGATION: Uses the dynamic collegeName from the parameter ---
  const handleSendNotice = (collegeName) => {
    if (!collegeName) return;
    router.push(`/university/message?select=${encodeURIComponent(collegeName)}`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <FaSync className="animate-spin text-orange-600 text-3xl mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">Synchronizing Terminal...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen items-center justify-center bg-zinc-50 p-6 flex">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-red-50">
        <FaShieldAlt className="text-red-600 text-5xl mx-auto mb-6" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">Security Error</h2>
        <p className="text-zinc-400 text-[10px] font-bold uppercase mt-3 mb-8 tracking-widest leading-relaxed">{error}</p>
        <div className="space-y-3">
            <button onClick={() => window.location.reload()} className="w-full bg-orange-600 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all shadow-lg">Retry Connection</button>
            <button onClick={() => router.push('/login')} className="w-full bg-zinc-100 py-4 rounded-2xl text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Back to Login</button>
        </div>
      </div>
    </div>
  );

  const stats = [
    { title: 'Affiliated Colleges', value: statsData?.stats?.total_colleges, icon: FaUniversity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Incidents', value: statsData?.stats?.total_reports, icon: FaExclamationTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Pending Review', value: statsData?.stats?.pending_reports, icon: FaChartBar, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Resolved Cases', value: statsData?.stats?.resolved_reports, icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 bg-[#FCFCFC] min-h-screen text-left">
      
      <div className="bg-[#0A0A0A] rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-orange-600/20 to-transparent blur-[120px] pointer-events-none transition-all"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.8)]"></span>
              <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em]">Central Monitoring Terminal</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">
              GTU <span className="text-orange-600">COMMAND</span> CENTER
            </h1>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2.5rem] text-center min-w-[160px] shadow-inner">
            <p className="text-4xl font-black italic text-orange-600 leading-none">{statsData?.stats?.total_colleges || 0}</p>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-3">Active Nodes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-orange-500 hover:shadow-xl transition-all duration-500">
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">{s.title}</p>
              <p className="text-4xl font-black italic text-zinc-900">{s.value || 0}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center text-2xl transition-all duration-500 group-hover:rotate-[10deg] shadow-sm`}>
              <s.icon /> 
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 bg-white rounded-[4rem] p-10 border border-zinc-100 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="font-black text-2xl italic uppercase tracking-tighter">Institution Registry</h3>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Real-time compliance monitoring</p>
            </div>
            <button onClick={exportGlobalReport} className="bg-zinc-900 text-white text-[10px] font-black uppercase px-8 py-3.5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl active:scale-95">Global Export</button>
          </div>
          
          <div className="space-y-4">
            {statsData?.chart_data?.map((college, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 border border-zinc-50 rounded-[2.5rem] hover:bg-zinc-50 transition-all group hover:border-orange-200">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black italic text-base shadow-lg">{idx + 1}</div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight text-zinc-900 group-hover:text-orange-600 transition-colors">{college.name}</h4>
                      <div className="flex gap-4 mt-1.5 items-center">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-r border-zinc-200 pr-4">Code: {college.code}</span>
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Reports: {college.reports}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCollege(college)} className="bg-zinc-100 text-[9px] font-black uppercase px-6 py-3 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm flex items-center gap-2">View Details <FaChevronRight className="text-[8px]" /></button>
                </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden h-fit">
            <h3 className="font-black text-xl mb-10 uppercase italic tracking-tighter text-orange-600">Admin Actions</h3>
            <div className="space-y-4">
              <ActionBtn title="Affiliated Colleges" icon={<FaUniversity />} onClick={() => router.push('/university/colleges')} />
              <ActionBtn title="Consolidated Reports" icon={<FaFileAlt />} onClick={() => router.push('/university/reports')} />
              <ActionBtn title="Global Analytics" icon={<FaChartBar />} onClick={() => router.push('/university/analytics')} />
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[4rem] max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center text-gray-900 font-black italic uppercase">
                <div className="flex gap-4 items-center">
                   <div className="bg-black text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl tracking-tighter italic">{selectedCollege.name.charAt(0)}</div>
                   <div>
                     <h2 className="text-3xl tracking-tighter leading-none">{selectedCollege.name}</h2>
                     <span className="text-orange-600 text-[10px] tracking-widest">REGISTRY NODE: {selectedCollege.code}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedCollege(null)} className="text-gray-300 hover:text-red-500 text-4xl leading-none">×</button>
            </div>

            <div className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-orange-500 pl-4">Institutional Profile</h4>
                  <div className="space-y-3 text-[12px] font-bold uppercase italic text-gray-600">
                    <div className="flex justify-between border-b pb-2"><span>Type:</span> <span className="text-black font-black">{selectedCollege.type || 'GENERAL'}</span></div>
                    <div className="flex justify-between border-b pb-2"><span>Status:</span> <span className="text-green-600 font-black">VERIFIED node</span></div>
                    <div className="flex justify-between"><span>Location:</span> <span className="text-orange-600 font-black">{selectedCollege.address || 'GUJARAT, INDIA'}</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-orange-500 pl-4">Administrative Contact</h4>
                  <div className="space-y-3 text-[12px] font-bold uppercase italic text-gray-600">
                    <div className="flex items-center gap-3"><FaUserTie className="text-orange-500"/> {selectedCollege.contact_person || 'OFFICIAL IN-CHARGE'}</div>
                    <div className="flex items-center gap-3"><FaEnvelope className="text-orange-500"/> {selectedCollege.email || selectedCollege.user_email || 'NOT PROVIDED'}</div>
                    <div className="flex items-center gap-3"><FaPhone className="text-orange-500"/> {selectedCollege.phone_number|| '+91 0000000000'}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-blue-50/50 p-8 rounded-[2.5rem] text-center border-2 border-white shadow-sm">
                  <div className="text-3xl font-black italic text-blue-600">{selectedCollege.students || "0"}</div>
                  <div className="text-[8px] font-black uppercase text-gray-400 mt-2">Active Students</div>
                </div>
                <div className="bg-green-50/50 p-8 rounded-[2.5rem] text-center border-2 border-white shadow-sm">
                  <div className="text-3xl font-black italic text-green-600">{ (selectedCollege.reports - (selectedCollege.pending_cases || 0)) || "0"}</div>
                  <div className="text-[8px] font-black uppercase text-gray-400 mt-2">Resolved cases</div>
                </div>
                <div className="bg-red-50/50 p-8 rounded-[2.5rem] text-center border-2 border-white shadow-sm">
                  <div className="text-3xl font-black italic text-red-600">{selectedCollege.pending_cases || "0"}</div>
                  <div className="text-[8px] font-black uppercase text-gray-400 mt-2">Pending review</div>
                </div>
              </div>

              {/* ACTION BUTTONS: Now using dynamic collegeName explicitly */}
              <div className="flex gap-4">
                <button 
                  onClick={() => handleSendNotice(selectedCollege.name)}
                  className="flex-1 bg-orange-600 text-white py-6 rounded-[2rem] font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  <FaEnvelope className="text-lg" /> Send official notice to {selectedCollege.name}
                </button>
                <button 
                  onClick={() => downloadCollegePDF(selectedCollege)}
                  className="flex-1 bg-black text-white py-6 rounded-[2rem] font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl"
                >
                  <FaDownload className="text-lg" /> Export Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ title, icon, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-between hover:bg-orange-600 transition-all group shadow-sm active:scale-95">
      <div className="flex items-center gap-5">
        <span className="text-zinc-600 group-hover:text-white text-xl transition-colors">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white">{title}</span>
      </div>
      <FaChevronRight className="text-[10px] text-zinc-800 group-hover:text-white" />
    </button>
  );
}