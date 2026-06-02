'use client';
import { useState, useEffect } from 'react';
import { 
  FaBuilding, FaUserCircle, FaIdCard, FaEnvelope, 
  FaCheckCircle, FaSpinner, FaShieldAlt, FaMapMarkerAlt, FaPhoneAlt, FaTimes, FaSave
} from 'react-icons/fa';

export default function CollegeProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    college_name: '',
    contact_person: '',
    phone_number: '',
    address: ''
  });

  // 1. Data Fetch Karne ke liye (FIXED TOKEN PREFIX)
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/college/profile/', {
        headers: {
          // 🔴 FIXED: 'Bearer' ki jagah 'Token' use kiya hai (DRF standard)
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = Array.isArray(data) ? data[0] : data;
        setProfile(profileData);
        
        // Form fields initialize karein
        setFormData({
          college_name: profileData?.college_name || '',
          contact_person: profileData?.contact_person || '',
          phone_number: profileData?.phone_number || '',
          address: profileData?.address || ''
        });
      } else if (response.status === 401) {
        console.error("Unauthorized: Check if token is valid");
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Profile Update Logic (FIXED TOKEN PREFIX)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/college/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}` // 🔴 FIXED
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        fetchProfile(); 
        alert("Profile Updated Successfully!");
      } else {
        const errData = await response.json();
        alert(`Update failed: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <FaSpinner className="animate-spin text-orange-600 text-5xl mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 font-sans">Syncing Profile Data</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#FBFBFE] min-h-screen font-sans text-slate-900 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            College <span className="text-orange-600">Profile</span>
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-sm tracking-wide">
            Manage and view your institutional registration details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Brand Identity Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="w-32 h-32 bg-orange-50 rounded-3xl flex items-center justify-center mb-8 border border-orange-100">
                <FaBuilding className="text-6xl text-orange-600" />
              </div>
              
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 text-center mb-2">
                {profile?.college_name || 'Institution'}
              </h2>
              
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                <FaCheckCircle /> Verified Institution
              </div>

              <div className="w-full mt-10 pt-8 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">College Code</span>
                  <span className="text-sm font-black text-slate-900">{profile?.college_code || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">System Status</span>
                  <span className="text-sm font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Information Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <DetailTile 
              icon={<FaUserCircle />} 
              label="Contact Person" 
              value={profile?.contact_person || 'Not Set'} 
            />

            <DetailTile 
              icon={<FaEnvelope />} 
              label="Registered Email" 
              value={profile?.user_email || 'Not Available'} 
            />

            <DetailTile 
              icon={<FaIdCard />} 
              label="Institution Code" 
              value={profile?.college_code || 'N/A'} 
            />

            <DetailTile 
              icon={<FaShieldAlt />} 
              label="Account Role" 
              value={profile?.role || 'College'} 
            />

            <DetailTile 
              icon={<FaPhoneAlt />} 
              label="Alternate Contact" 
              value={profile?.phone_number || 'N/A'} 
            />

            <DetailTile 
              icon={<FaMapMarkerAlt />} 
              label="Campus Location" 
              value={profile?.address || 'N/A'} 
            />

            {/* Action Box */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between shadow-xl shadow-slate-200">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500">
                  <FaShieldAlt size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Security Status</p>
                  <p className="text-base font-semibold text-white uppercase">Profile data is verified and secure</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase text-[11px] tracking-widest px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20"
              >
                Edit Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT IDENTITY MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="p-8 pb-4 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">
                Edit <span className="text-orange-600 italic">Identity</span>
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 pt-0 space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">College Name</label>
                <input 
                  type="text"
                  value={formData.college_name}
                  onChange={(e) => setFormData({...formData, college_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Contact Person</label>
                  <input 
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Phone Number</label>
                  <input 
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Campus Address</label>
                <textarea 
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-600/30"
              >
                <FaSave /> Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailTile({ icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
      <div className="text-orange-600 text-2xl mb-4">
        {icon}
      </div>
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-1 font-sans">
        {label}
      </p>
      <p className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
        {value}
      </p>
    </div>
  );
}