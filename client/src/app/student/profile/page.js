'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaUserCircle, FaEnvelope, FaIdCard, FaBuilding, FaPhone, FaShieldAlt } from 'react-icons/fa';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Note: Backend uses snake_case, humne state ko sync kar diya hai
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_id: '',
    phone_number: '',
    college: '',
    university: '',
    course: '',
    semester: '',
    emergency_contact: '',
    address: ''
  });

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8000/api/student/profile/', {
          headers: { 
            'Authorization': `Token ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          // Backend profile object se state fill karein
          const p = data.profile;
          setFormData({
            full_name: p.full_name || '',
            email: user?.email || '', // Email User model se aata hai
            student_id: p.student_id || '',
            phone_number: p.phone_number || '',
            college: p.college || '',
            university: p.university || '',
            course: p.course || '',
            semester: p.semester || '',
            emergency_contact: p.emergency_contact || '',
            address: p.address || ''
          });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Submit Changes (PUT Method)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/student/profile/update/', {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.status === 'success') {
        alert('✅ Profile updated successfully!');
        setIsEditing(false);
        
        // LocalStorage update for Sidebar/Header
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...existingUser, full_name: formData.full_name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert('❌ Error: ' + (result.message || 'Update failed'));
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert('Network Error: Server is not responding');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Secure Records...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2">
            Identity & Academic Verification
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
            isEditing 
              ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300' 
              : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
          }`}
        >
          {isEditing ? 'Discard Changes' : 'Modify Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-zinc-800/50">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] mb-10 flex items-center gap-3">
               <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span> Data Repository
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              {[
                { label: 'Full Legal Name', name: 'full_name', type: 'text', icon: <FaUserCircle /> },
                { label: 'Academic Email', name: 'email', type: 'email', icon: <FaEnvelope />, disabledAlways: true },
                { label: 'Official Student ID', name: 'student_id', type: 'text', icon: <FaIdCard /> },
                { label: 'Contact Number', name: 'phone_number', type: 'tel', icon: <FaPhone /> },
                { label: 'College Name', name: 'college', type: 'text', icon: <FaBuilding /> },
                { label: 'University Body', name: 'university', type: 'text', icon: <FaBuilding /> },
                { label: 'Degree/Course', name: 'course', type: 'text', icon: <FaBuilding /> },
                { label: 'Current Semester', name: 'semester', type: 'text', icon: <FaBuilding /> },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">{field.label}</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                      {field.icon}
                    </span>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      disabled={field.disabledAlways || !isEditing}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition-all font-bold text-sm text-gray-900 dark:text-white disabled:opacity-60"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Emergency SOS Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition-all font-bold text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Residential Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition-all font-bold text-sm resize-none"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end mt-10 pt-8 border-t border-gray-50 dark:border-zinc-800/50">
                <button
                  type="submit"
                  className="bg-zinc-900 dark:bg-orange-500 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-500/20"
                >
                  Commit Update to Database
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-gray-100 dark:border-zinc-800/50 text-center shadow-sm">
            <div className="w-28 h-28 bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-orange-600 dark:to-orange-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl font-black text-white uppercase">{formData.full_name?.charAt(0) || user?.username?.charAt(0)}</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">{formData.full_name || 'Incognito User'}</h3>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-3">ID: {formData.student_id || 'PENDING'}</p>
            
            <div className="mt-10 pt-8 border-t border-gray-50 dark:border-zinc-800/50 space-y-5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-gray-400">Security Status</span>
                 <span className="text-green-500 flex items-center gap-1.5 italic">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Verified
                 </span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-gray-400">System Role</span>
                 <span className="text-zinc-900 dark:text-zinc-300">Student Body</span>
               </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-10 rounded-[3rem] text-white relative overflow-hidden group">
            <FaShieldAlt className="text-4xl mb-4 text-orange-500 relative z-10" />
            <h4 className="text-xs font-black uppercase tracking-widest mb-3 relative z-10">Data Protection</h4>
            <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed relative z-10">
              AES-256 Encryption active. Your information is strictly restricted to authorized committee members only.
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] group-hover:bg-orange-500/20 transition-all"></div>
          </div>
        </div>
      </div>
    </div>
  );
}