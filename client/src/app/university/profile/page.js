'use client';
import { useState, useEffect } from 'react';
import { 
  FaUniversity, FaGlobe, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaCalendarAlt, FaAward,
  FaUserTie, FaEdit, FaCamera, FaBuilding, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

export default function UniversityProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    university_name: '',
    university_code: '',
    contact_email: '',
    contact_number: '',
    address: '',
    city: '',
    state: '',
    vice_chancellor: '',
    established_year: '',
    website: '',
    logo: null,
    accreditation_grade: 'NAAC A++', // Backend field name se match kiya
    official_grade: 'A++'           // Backend field name se match kiya
  });

  const BASE_URL = 'http://127.0.0.1:8000';

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); 
        const response = await fetch(`${BASE_URL}/api/university/profile/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }); 
        const data = await response.json();
        if (response.ok) setProfile(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // --- 2. LOGO UPLOAD & PREVIEW ---
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/university/profile/update/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Token ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(prev => ({ ...prev, logo: updatedData.logo }));
        alert('Logo updated successfully!');
      } else {
        alert('Failed to upload logo to server.');
      }
    } catch (error) {
      console.error("Logo Error:", error);
      alert('Network Error while uploading logo.');
    }
  };

  // --- 3. SAVE TEXT DETAILS ---
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/university/profile/update/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // Update local state with response from server
        setProfile(prev => ({
            ...prev,
            ...updatedData
        }));
        setIsEditing(false);
        alert('Profile details updated!');
      }
    } catch (error) {
      alert('Error saving data.');
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-orange-500 font-bold gap-3">
      <FaSpinner className="animate-spin text-3xl" /> <span>Loading Profile...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.university_name || 'University Profile'}</h1>
          <p className="text-gray-500 flex items-center gap-2 font-mono text-sm uppercase">
            <span className="text-orange-500 font-bold">CODE: {profile.university_code}</span>
          </p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all shadow-lg font-semibold ${
            isEditing ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'
          }`}
        >
          {isEditing ? <><FaCheckCircle /> <span>Save Changes</span></> : <><FaEdit /> <span>Edit Profile</span></>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="University Name" name="university_name" value={profile.university_name} icon={<FaUniversity/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="Vice Chancellor" name="vice_chancellor" value={profile.vice_chancellor} icon={<FaUserTie/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="Contact Email" name="contact_email" value={profile.contact_email} icon={<FaEnvelope/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="Website" name="website" value={profile.website} icon={<FaGlobe/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="Contact Number" name="contact_number" value={profile.contact_number} icon={<FaPhone/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="Established Year" name="established_year" value={profile.established_year} icon={<FaCalendarAlt/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="City" name="city" value={profile.city} icon={<FaBuilding/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="State" name="state" value={profile.state} icon={<FaMapMarkerAlt/>} isEditing={isEditing} onChange={handleChange} />
              
              {/* Nayi Fields: Accreditation and Grade */}
              <InputField label="Accreditation (Full)" name="accreditation_grade" value={profile.accreditation_grade} icon={<FaAward/>} isEditing={isEditing} onChange={handleChange} />
              <InputField label="Official Grade" name="official_grade" value={profile.official_grade} icon={<FaAward/>} isEditing={isEditing} onChange={handleChange} />

              <div className="md:col-span-2 space-y-2 pt-4 border-t border-gray-50">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</label>
                {isEditing ? (
                  <textarea name="address" value={profile.address} onChange={handleChange} rows={3} className="w-full p-4 border border-orange-100 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" />
                ) : (
                  <p className="text-gray-700 font-medium bg-orange-50/30 p-4 rounded-2xl italic leading-relaxed">{profile.address || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Logo */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 text-center relative">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gray-100 rounded-[2.5rem] border-2 border-dashed border-orange-200 flex items-center justify-center overflow-hidden">
                {profile.logo ? (
                  <img 
                    src={profile.logo.startsWith('blob:') || profile.logo.startsWith('http') ? profile.logo : `${BASE_URL}${profile.logo}`} 
                    className="w-full h-full object-cover" 
                    alt="University Logo"
                  />
                ) : (
                  <FaUniversity className="text-5xl text-orange-200" />
                )}
              </div>
              
              <label className="absolute bottom-1 -right-1 p-2.5 bg-orange-500 text-white shadow-xl rounded-xl cursor-pointer hover:scale-110 transition-all active:scale-95">
                <FaCamera size={14} />
                <input type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
              </label>
            </div>
            <h3 className="font-bold text-gray-800">Institution Logo</h3>
            <p className="text-[10px] text-gray-400 mt-2 uppercase">Click camera to update branding</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Accreditation</h3>
                <FaAward className="text-orange-500" />
             </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white text-center shadow-lg shadow-orange-100">
              {/* Yahan ab backend se aayi hui real value dikhegi */}
              <span className="text-4xl font-black">{profile.accreditation_grade || 'N/A'}</span>
              <p className="text-[10px] opacity-80 mt-2 uppercase font-bold tracking-widest">
                Official Grade: {profile.official_grade || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, icon, isEditing, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {isEditing ? (
        <input name={name} value={value} onChange={onChange} className="w-full px-4 py-2.5 border border-orange-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm" />
      ) : (
        <div className="flex items-center gap-3 text-gray-800 font-semibold py-1">
          <span className="text-orange-400 text-sm">{icon}</span>
          <span>{value || '---'}</span>
        </div>
      )}
    </div>
  );
}