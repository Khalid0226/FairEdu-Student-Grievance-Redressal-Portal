'use client';
import { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FaSearch, FaFilter, FaEye, FaEnvelope, FaUniversity, FaUserGraduate,
  FaMapMarkerAlt, FaPhone, FaEnvelopeOpen, FaExclamationTriangle,
  FaCheckCircle, FaSort, FaDownload, FaTimes, FaSpinner, FaShieldAlt
} from 'react-icons/fa';

export default function UniversityStudents() {
  // --- States for Data ---
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All'); 
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCompliance, setSelectedCompliance] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token'); 

        const response = await fetch('http://127.0.0.1:8000/api/university/students/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }); 

        if (response.status === 401) throw new Error('Unauthorized: Please login again.');
        if (!response.ok) throw new Error(`Error ${response.status}: Failed to fetch data`);

        const data = await response.json();
        setStudentsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- PDF Export Logic (Full Database) ---
  const handleExportFullDatabase = () => {
    if (processedStudents.length === 0) {
      alert("No data available to export");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape mode for better width
    
    // Header setup
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12); // Orange color
    doc.text("UNIVERSITY STUDENT DIRECTORY", 148, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total Records: ${processedStudents.length} | Exported on: ${new Date().toLocaleDateString()}`, 148, 28, { align: 'center' });

    const tableColumn = ["STUDENT NAME", "ROLL NO", "INSTITUTION", "SEMESTER", "COMPLIANCE", "CONTACT"];
    const tableRows = processedStudents.map(s => [
      (s.name || 'N/A').toUpperCase(),
      (s.rollNo || 'N/A').toUpperCase(),
      (s.college || 'N/A').toUpperCase(),
      `SEM ${s.semester || s.year || 'N/A'}`,
      (s.compliance || 'PENDING').toUpperCase(),
      s.phone || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      margin: { left: 15, right: 15 }, // Perfect side padding for centering
      styles: { 
        fontSize: 8, 
        cellPadding: 4, 
        halign: 'center', // Center text in all cells
        valign: 'middle' 
      },
      headStyles: { 
        fillColor: [234, 88, 12], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 }, // Name left aligned for readability
        2: { halign: 'left' } // College left aligned
      }
    });

    doc.save(`Student_Database_${new Date().getTime()}.pdf`);
  };

  // --- PDF Export Logic (Individual Profile) ---
  const handleDownloadPDF = (student) => {
    const doc = new jsPDF();
    doc.setFillColor(234, 88, 12); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text((student.name || 'STUDENT RECORD').toUpperCase(), 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Roll No: ${student.rollNo} | Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    
    const displaySem = student.semester ? student.semester : (student.year ? `Semester ${student.year}` : 'N/A');

    autoTable(doc, {
      startY: 55,
      body: [
        ['FULL NAME', (student.name || 'N/A').toUpperCase()],
        ['ROLL NUMBER', student.rollNo || 'N/A'],
        ['INSTITUTION', (student.college || 'N/A').toUpperCase()],
        ['DEPARTMENT', (student.course || 'N/A').toUpperCase()],
        ['ACADEMIC SEMESTER', displaySem.toString().toUpperCase()],
        ['EMAIL ADDRESS', student.email || 'N/A'],
        ['CONTACT NO', student.phone || 'N/A'],
        ['EMERGENCY CONTACT', student.emergency_contact || 'N/A'],
        ['RESIDENTIAL ADDRESS', (student.address || 'NOT PROVIDED').toUpperCase()],
        ['COMPLIANCE STATUS', (student.compliance || 'PENDING').toUpperCase()],
      ],
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 5, lineColor: [240, 240, 240], lineWidth: 0.1 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 50 },
        1: { fontStyle: 'bold', textColor: [20, 20, 20] },
      }
    });

    doc.save(`${student.rollNo}_Record.pdf`);
  };

  // --- Dynamic Options ---
  const colleges = ['All', ...new Set(studentsData.map(s => s.college).filter(Boolean))];
  const departments = ['All', ...new Set(studentsData.map(s => s.course).filter(Boolean))];
  const semesters = ['All', '1ST SEMESTER', '2ND SEMESTER', '3RD SEMESTER', '4TH SEMESTER', '5TH SEMESTER', '6TH SEMESTER','7TH SEMESTER', '8TH SEMESTER'];
  const statusTypes = ['All', 'Active', 'Inactive'];

  // --- Filtering Logic ---
  const processedStudents = useMemo(() => {
    let result = studentsData.filter(student => {
      const matchesSearch = 
        (student.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (student.rollNo?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      const matchesCollege = selectedCollege === 'All' || student.college === selectedCollege;
      const matchesDepartment = selectedDepartment === 'All' || student.course === selectedDepartment;
      
      const dropdownNum = selectedSemester.replace(/\D/g, ''); 
      const matchesSem = selectedSemester === 'All' || 
        student.semester?.toString() === dropdownNum || 
        student.year?.toString() === dropdownNum;

      const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
      const matchesCompliance = selectedCompliance === 'All' || student.compliance === selectedCompliance;

      return matchesSearch && matchesCollege && matchesDepartment && matchesSem && matchesStatus && matchesCompliance;
    });

    return result.sort((a, b) => {
      let aValue = a[sortBy]?.toString().toLowerCase() || '';
      let bValue = b[sortBy]?.toString().toLowerCase() || '';
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
  }, [studentsData, searchTerm, selectedCollege, selectedDepartment, selectedSemester, selectedStatus, selectedCompliance, sortBy, sortOrder]);

  const stats = useMemo(() => ({
    total: studentsData.length,
    active: studentsData.filter(s => s.status?.toLowerCase() === 'active').length,
    compliant: studentsData.filter(s => s.compliance?.toLowerCase() === 'compliant').length,
    pending: studentsData.reduce((sum, s) => sum + (Number(s.pending_cases) || 0), 0),
    reports: studentsData.reduce((sum, s) => sum + (Number(s.total_reports) || 0), 0)
  }), [studentsData]);

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setSortOrder('asc'); }
  };

  const getComplianceStyles = (compliance) => {
    const comp = compliance?.toLowerCase();
    if (comp === 'compliant') return { icon: <FaCheckCircle className="text-green-500" />, badge: 'bg-green-100 text-green-800 border-green-200' };
    if (comp === 'pending') return { icon: <FaExclamationTriangle className="text-orange-500" />, badge: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { icon: <FaExclamationTriangle className="text-red-500" />, badge: 'bg-red-100 text-red-800 border-red-200' };
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <FaSpinner className="animate-spin text-4xl text-orange-600 mb-4" />
      <p className="text-gray-600 font-bold">Connecting to University Database...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-gray-500 font-medium">Managing {stats.total} students</p>
        </div>
        <button 
          onClick={handleExportFullDatabase}
          className="flex items-center gap-2 bg-white border border-orange-200 text-orange-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-orange-50 transition-all active:scale-95"
        >
          <FaDownload /> Export Database
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Enrolled', value: stats.total, color: 'text-blue-600' },
          { label: 'Active Status', value: stats.active, color: 'text-green-600' },
          { label: 'Compliant', value: stats.compliant, color: 'text-purple-600' },
          { label: 'Unresolved', value: stats.pending, color: 'text-orange-600' },
          { label: 'Total Incidents', value: stats.reports, color: 'text-red-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-orange-50 p-5 hover:shadow-md transition-shadow">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
            <input
              type="text"
              placeholder="Search name or roll..."
              className="w-full pl-10 pr-4 py-2.5 border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="px-3 py-2.5 border border-orange-100 rounded-xl outline-none bg-gray-50 font-bold text-gray-700 text-xs uppercase" 
            value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}>
            {colleges.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Colleges' : opt}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-orange-100 rounded-xl outline-none bg-gray-50 font-bold text-gray-700 text-xs uppercase" 
            value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            {departments.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Departments' : opt}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-orange-100 rounded-xl outline-none bg-gray-50 font-bold text-gray-700 text-xs uppercase" 
            value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            {semesters.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Semesters' : opt}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-orange-100 rounded-xl outline-none bg-gray-50 font-bold text-gray-700 text-xs uppercase" 
            value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {statusTypes.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Status' : opt}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="py-5 px-8 text-[11px] font-black uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>Student & Roll No <FaSort className="inline ml-1 opacity-50"/></th>
                <th className="py-5 px-8 text-[11px] font-black uppercase tracking-wider">College Name</th>
                <th className="py-5 px-8 text-[11px] font-black uppercase tracking-wider text-center">Semester/Dept</th>
                <th className="py-5 px-8 text-[11px] font-black uppercase tracking-wider text-center">Compliance</th>
                <th className="py-5 px-8 text-[11px] font-black uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {processedStudents.length > 0 ? processedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{student.name}</div>
                    <div className="text-[10px] font-black text-orange-500 tracking-tighter uppercase">{student.rollNo}</div>
                  </td>
                  <td className="py-5 px-8 text-sm font-bold text-gray-500 uppercase">{student.college}</td>
                  <td className="py-5 px-8 text-center">
                    <div className="text-sm font-black text-gray-800 uppercase">Sem {student.semester || student.year}</div>
                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{student.course}</div>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex flex-col items-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1.5 ${getComplianceStyles(student.compliance).badge}`}>
                        {getComplianceStyles(student.compliance).icon} {student.compliance}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button onClick={() => setSelectedStudent(student)} className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:shadow-lg transition-all active:scale-95">
                      <FaEye /> View Profile
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="py-24 text-center font-black uppercase text-gray-300">No Students Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Profile */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200">
            <div className="bg-orange-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl font-black text-orange-600">{selectedStudent.name?.charAt(0)}</div>
                <div>
                  <h2 className="text-white text-xl font-black uppercase">{selectedStudent.name}</h2>
                  <p className="text-orange-100 font-bold text-xs uppercase">ID: {selectedStudent.rollNo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadPDF(selectedStudent)} className="text-white/70 hover:text-white bg-black/10 p-2.5 rounded-lg transition-all"><FaDownload size={18} /></button>
                <button onClick={() => setSelectedStudent(null)} className="text-white/70 hover:text-white bg-black/10 p-2.5 rounded-lg transition-all"><FaTimes size={20} /></button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-white p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaUniversity className="text-orange-500" /> Institution</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedStudent.college}</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaUserGraduate className="text-orange-500" /> Current Semester</p>
                  <p className="text-sm font-bold text-zinc-900 uppercase">Semester {selectedStudent.semester || selectedStudent.year}</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaUserGraduate className="text-orange-500" /> Course / Dept</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedStudent.course}</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaPhone className="text-orange-500" /> Contact Number</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedStudent.phone}</p>
                </div>
                <div className="bg-white p-5 col-span-2 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><FaEnvelopeOpen className="text-orange-500" /> Email Address</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedStudent.email}</p>
                </div>
                <div className="bg-red-50 p-5 col-span-2 border-t border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white p-2 rounded-lg"><FaExclamationTriangle /></div>
                    <div>
                      <p className="text-[9px] font-black text-red-400 uppercase">Emergency SOS</p>
                      <p className="text-lg font-black text-red-600 leading-none mt-1">{selectedStudent.emergency_contact}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 col-span-2 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-2"><FaMapMarkerAlt className="text-orange-500" /> Address</p>
                  <p className="text-sm font-bold text-zinc-800 uppercase">{selectedStudent.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="border-2 border-orange-100 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Total Reports</p>
                    <p className="text-2xl font-black text-orange-600">{selectedStudent.total_reports || 0}</p>
                 </div>
                 <div className="border-2 border-zinc-100 bg-zinc-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Unresolved Cases</p>
                    <p className="text-2xl font-black text-zinc-900">{selectedStudent.pending_cases || 0}</p>
                 </div>
              </div>

              <button onClick={() => setSelectedStudent(null)} className="w-full mt-6 bg-zinc-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-orange-600 transition-all shadow-lg">Close Profile Database</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}