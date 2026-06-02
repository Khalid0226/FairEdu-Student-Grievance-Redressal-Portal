'use client';
import { useState, useEffect } from 'react';
import { 
  FaSearch, FaPlus, FaTrash, FaEye, FaTimes, 
  FaUser, FaPhoneAlt, FaUniversity, FaMapMarkerAlt, 
  FaEnvelope, FaIdCard, FaDownload, FaLock, FaGraduationCap, FaCalendarAlt
} from 'react-icons/fa';

// PDF Imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 📝 Registration Form State
  const [registerLoading, setRegisterLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    student_id: '',
    phone_number: '',
    course: 'MCA',
    semester: '1',
    batch_year: new Date().getFullYear().toString(),
    address: '',
  });

  const departments = ['All', 'MCA', 'Computer Science', 'Mechanical Engineering', 'Electronics & Communication', 'Civil Engineering'];
  const years = ['All', 'SEM 1', 'SEM 2', 'SEM 3', 'SEM 4', 'SEM 5', 'SEM 6', 'SEM 7', 'SEM 8'];

  const fetchStudents = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/collage/students/', {
        method: 'GET',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.status === 'success') {
        setStudents(data.students);
      } else {
        setError(data.message || "Failed to load students");
      }
    } catch (err) {
      setError("Could not connect to server. Check if Django is running.");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete Student Function with API Call
  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm("⚠️ Are you sure? This will permanently delete the student from the database.");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/collage/students/${studentId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        // Update UI locally after successful deletion
        setStudents(students.filter(s => s.id !== studentId));
        alert("✅ Student removed from database successfully.");
      } else {
        const data = await res.json();
        alert("❌ Error: " + (data.message || "Delete request failed. Check Backend."));
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("📡 Network Error: Could not connect to the server.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/college/register-student/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('🚀 Student Registered Successfully!');
        // Reset Form
        setFormData({
          full_name: '', email: '', password: '', student_id: '',
          phone_number: '', course: 'MCA', semester: '1',
          batch_year: new Date().getFullYear().toString(), address: '',
        });
        setIsRegisterModalOpen(false);
        fetchStudents();
      } else {
        const data = await res.json();
        alert('Error: ' + (data.message || 'Registration failed'));
      }
    } catch (err) {
      alert('Network Error: Check if Django is running.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDownloadPDF = (student) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(24, 24, 27); 
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("STUDENT PROFILE REPORT", 15, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(249, 115, 22); 
      doc.text(`${(student.department || 'N/A').toUpperCase()} - SEMESTER ${student.semester || 'N/A'}`, 15, 33);

      const tableData = [
        ["Full Name", student.name?.toUpperCase() || 'N/A'],
        ["Roll Number", student.roll_no || 'N/A'],
        ["Email Address", student.email || 'N/A'],
        ["Phone Number", student.phone || 'N/A'],
        ["Department", student.department || 'N/A'],
        ["Semester", student.semester || 'N/A'],
        ["College", student.college_name || 'N/A'],
        ["University", student.university || 'N/A'],
        ["Home Address", student.address || 'N/A']
      ];

      autoTable(doc, {
        startY: 50,
        head: [['Student Details', 'Information']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [24, 24, 27], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
      });

      doc.save(`${student.name.replace(/\s+/g, '_')}_Profile.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === 'All' || student.department === selectedDepartment;
    
    const studentSem = student.semester?.toString().toUpperCase();
    const filterSem = selectedYear.replace('SEM ', '').toUpperCase();
    const matchesYear = selectedYear === 'All' || studentSem === filterSem || studentSem === selectedYear;
    
    return matchesSearch && matchesDepartment && matchesYear;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Database...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight uppercase">Students Directory</h1>
          <p className="text-zinc-500 mt-1 font-medium italic">Official enrollment and academic records management</p>
        </div>
        <button 
          onClick={() => setIsRegisterModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-900 hover:bg-orange-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95"
        >
          <FaPlus />
          <span>Register New Student</span>
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search student identity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-sm"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer font-black text-[10px] text-zinc-500 uppercase tracking-wider"
        >
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer font-black text-[10px] text-zinc-500 uppercase tracking-wider"
        >
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-100">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-16">#</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Student Profile</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Roll Number</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Department</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-6 px-8 font-black text-zinc-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="py-6 px-8">
                      <div className="font-black text-zinc-900 group-hover:text-orange-600 transition-colors uppercase text-sm leading-none mb-1">{student.name}</div>
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-tight">{student.email}</div>
                    </td>
                    <td className="py-6 px-8 font-black text-zinc-500 text-xs text-center tracking-tighter italic">{student.roll_no}</td>
                    <td className="py-6 px-8 text-zinc-500 font-black text-xs text-center uppercase">{student.department}</td>
                    <td className="py-6 px-8 text-center">
                      <span className="px-3.5 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[9px] font-black uppercase tracking-tighter">Active</span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }} className="p-3 text-zinc-300 hover:text-zinc-900 bg-zinc-50 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-zinc-100"><FaEye /></button>
                        <button onClick={() => handleDelete(student.id)} className="p-3 text-zinc-300 hover:text-red-600 bg-zinc-50 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-zinc-100"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-32 text-zinc-300 font-black uppercase text-[10px] tracking-widest bg-zinc-50/10">No matching records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="bg-zinc-900 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Student Registration</h2>
                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Initialize Student Identity & Profile</p>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="p-3 bg-white/10 hover:bg-red-600 rounded-2xl transition-all">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2 border-b border-zinc-100 pb-2 mb-2">
                   <p className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em]">01. Login Credentials</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Official Email (Username)</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input required type="email" placeholder="student@university.edu" 
                      value={formData.email}
                      autoComplete="new-email"
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Secure Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input required type="password" placeholder="••••••••" 
                      value={formData.password}
                      autoComplete="new-password"
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <div className="md:col-span-2 border-b border-zinc-100 pb-2 mt-4 mb-2">
                   <p className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em]">02. Personal Profile</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Full Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input required type="text" placeholder="Enter full name" 
                      value={formData.full_name}
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Phone Number</label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input required type="tel" placeholder="+91 00000 00000" 
                      value={formData.phone_number}
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Permanent Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-5 top-4 text-orange-500" />
                    <textarea placeholder="Building, Street, City, State..." rows="2"
                      value={formData.address}
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="md:col-span-2 border-b border-zinc-100 pb-2 mt-4 mb-2">
                   <p className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em]">03. Academic Records</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Enrollment / Roll No</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input required type="text" placeholder="245490694005" 
                      value={formData.student_id}
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Admission Batch</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input type="text" placeholder="2024" 
                      value={formData.batch_year}
                      className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500/50 transition-all"
                      onChange={(e) => setFormData({...formData, batch_year: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Department / Course</label>
                  <div className="relative">
                    <FaGraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                    <select className="w-full pl-12 p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none appearance-none border border-transparent focus:border-orange-500/50 cursor-pointer"
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}>
                      <option value="MCA">MCA</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Current Semester</label>
                  <select className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-orange-500/50 cursor-pointer"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                    {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button type="submit" disabled={registerLoading}
                  className="flex-1 bg-zinc-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-orange-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50">
                  {registerLoading ? 'Syncing Profile...' : 'Finalize Registration'}
                </button>
                <button type="button" onClick={() => setIsRegisterModalOpen(false)}
                  className="px-10 bg-zinc-100 text-zinc-500 py-5 rounded-[2rem] font-black uppercase text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="p-3.5 bg-orange-500/20 rounded-2xl mb-5 inline-block border border-orange-500/30">
                      <FaUser className="text-2xl text-orange-500" />
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white">
                      <FaTimes size={18} />
                    </button>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">{selectedStudent.name}</h2>
                  <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em]">
                    {selectedStudent.department} • SEMESTER {selectedStudent.semester || 'N/A'}
                  </p>
               </div>
               <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 space-y-7 bg-white">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-2 tracking-widest"><FaIdCard className="text-[12px]"/> Student ID</label>
                  <p className="font-black text-zinc-800 text-sm tracking-tight">{selectedStudent.roll_no}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-2 tracking-widest"><FaPhoneAlt className="text-[12px]"/> Phone Number</label>
                  <p className="font-black text-zinc-800 text-sm tracking-tight">{selectedStudent.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-2 tracking-widest"><FaEnvelope className="text-[12px]"/> Official Email</label>
                <p className="font-black text-zinc-800 text-sm lowercase">{selectedStudent.email}</p>
              </div>
              <div className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-inner">
                <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-2 tracking-widest mb-2"><FaUniversity className="text-[12px]"/> Academic Institution</label>
                <p className="font-black text-zinc-900 text-[13px] uppercase tracking-tight leading-tight">{selectedStudent.college_name || 'N/A'}</p>
                <p className="text-[9px] text-zinc-400 font-black uppercase mt-1 tracking-wider italic">{selectedStudent.university || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-2 tracking-widest"><FaMapMarkerAlt className="text-[12px]"/> Primary Address</label>
                <p className="font-black text-zinc-700 text-[11px] uppercase leading-relaxed tracking-tight">{selectedStudent.address || 'Address not registered'}</p>
              </div>
            </div>

            <div className="p-8 bg-zinc-50/80 border-t border-zinc-100 flex justify-between items-center">
              <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all">Dismiss</button>
              <button 
                onClick={() => handleDownloadPDF(selectedStudent)}
                className="px-7 py-3.5 bg-zinc-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center gap-3 active:scale-95"
              >
                <FaDownload /> Download Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}