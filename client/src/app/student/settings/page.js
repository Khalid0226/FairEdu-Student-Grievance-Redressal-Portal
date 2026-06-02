'use client';
import { useState, useEffect } from 'react';
import { 
  FiLock, FiShield, 
  FiSmartphone, FiDatabase, FiX, FiDownload 
} from 'react-icons/fi';

const DJANGO_BASE_URL = "http://127.0.0.1:8000/api/student";

export default function StudentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  // --- Password Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passStep, setPassStep] = useState(1); // 1: Old Pass, 2: New Pass
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Django se Settings Load karna
  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${DJANGO_BASE_URL}/settings/`, {
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.status === "success") {
          setSettings(data.settings);
          localStorage.setItem('emailNotificationsEnabled', data.settings.emailNotifications);
          window.dispatchEvent(new Event('storage'));
        }
      } catch (error) {
        console.error("Django connection failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // 2. Download Archive Logic
  const handleDownloadArchive = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const response = await fetch(`${DJANGO_BASE_URL}/download-archive/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size === 0) {
          alert("Archive is empty. You don't have any reports yet.");
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Incident_Archive_${new Date().toLocaleDateString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

      } else if (response.status === 404) {
        alert("No reports found! Submit a report first to generate an archive.");
      } else {
        alert("Server error while generating PDF. Please try again later.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to connect to server. Check if your backend is running.");
    }
  };

  // 3. Toggle Handler
  const handleSettingChange = async (setting) => {
    const newValue = !settings[setting];
    setSettings(prev => ({ ...prev, [setting]: newValue }));

    if (setting === 'emailNotifications') {
      localStorage.setItem('emailNotificationsEnabled', newValue);
      window.dispatchEvent(new Event('storage'));
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${DJANGO_BASE_URL}/settings/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ key: setting, value: newValue }),
      });

      if (!response.ok) throw new Error("Backend update failed");
    } catch (error) {
      setSettings(prev => ({ ...prev, [setting]: !newValue }));
      if (setting === 'emailNotifications') {
        localStorage.setItem('emailNotificationsEnabled', !newValue);
        window.dispatchEvent(new Event('storage'));
      }
      alert("Setting save nahi ho payi!");
    }
  };

  // --- Password Logic Helpers ---
  const openPasswordModal = () => {
    setPassStep(1);
    setPassData({ old: '', new: '', confirm: '' });
    setPassError('');
    setIsModalOpen(true);
  };

  const verifyAndNext = async () => {
    if (!passData.old) return setPassError("Password field is empty");
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${DJANGO_BASE_URL}/verify-password/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ password: passData.old }),
      });
      const data = await response.json();

      if (data.valid) {
        setPassStep(2);
        setPassError('');
      } else {
        setPassError("Password Doesn't Matching");
      }
    } catch (err) {
      setPassError("Server error. Try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const finalUpdatePassword = async () => {
    if (passData.new !== passData.confirm) {
      setPassError("Passwords do not match!");
      return;
    }
    if (passData.new.length < 6) {
      setPassError("Password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${DJANGO_BASE_URL}/change-password/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ old_password: passData.old, new_password: passData.new }),
      });
      const data = await response.json();
      alert(data.message);
      setIsModalOpen(false);
    } catch (err) {
      setPassError("Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
          Account <span className="text-orange-500">Settings</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">
          Manage your security protocols and interface preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Communications Section (Now first and cleaned) */}
        <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
              <FiSmartphone size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tight text-gray-900 dark:text-white">Communications</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Alert Channels</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(settings)
              .filter(([key]) => key === 'emailNotifications') // Only Email Notifications kept
              .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
                <div className="pr-4">
                  <h3 className="text-sm font-bold capitalize text-gray-700 dark:text-zinc-300">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </h3>
                </div>
                <ToggleButton active={value} onClick={() => handleSettingChange(key)} />
              </div>
            ))}
          </div>
        </section>

        {/* Password Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-gray-100 dark:border-zinc-800">
            <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <FiShield className="text-green-500" /> Update Password
            </h2>
            <div className="space-y-3">
                <ActionBtn onClick={openPasswordModal} icon={<FiLock/>} label="Update Master Password" />
            </div>
        </div>

        {/* Data Management Section */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-gray-100 dark:border-zinc-800">
            <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <FiDatabase className="text-purple-500" /> Data Management
            </h2>
            <div className="space-y-3">
                <ActionBtn 
                    onClick={handleDownloadArchive} 
                    icon={<FiDownload/>} 
                    label="Download Data Archive" 
                />
            </div>
        </div>
      </div>

      {/* --- Password Update Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic uppercase text-gray-900 dark:text-white flex items-center gap-2">
                <FiLock className="text-orange-500" /> 
                {passStep === 1 ? "Security Check" : "New Credentials"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500">
                <FiX size={20} />
              </button>
            </div>

            {passStep === 1 ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Enter Old Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border rounded-2xl outline-none transition-all font-bold dark:text-white ${passError ? 'border-red-500' : 'border-transparent focus:border-orange-500'}`}
                    value={passData.old}
                    onChange={(e) => { setPassData({...passData, old: e.target.value}); setPassError(''); }}
                  />
                  {passError && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1 animate-pulse">{passError}</p>}
                </div>
                <button 
                  disabled={isUpdating}
                  onClick={verifyAndNext}
                  className="w-full p-4 bg-gray-900 dark:bg-orange-500 text-white rounded-2xl font-black uppercase italic hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Verifying..." : "Continue"}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-orange-500 rounded-2xl outline-none transition-all font-bold dark:text-white"
                    value={passData.new}
                    onChange={(e) => setPassData({...passData, new: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border rounded-2xl outline-none transition-all font-bold dark:text-white ${passError ? 'border-red-500' : 'border-transparent focus:border-orange-500'}`}
                    value={passData.confirm}
                    onChange={(e) => { setPassData({...passData, confirm: e.target.value}); setPassError(''); }}
                  />
                  {passError && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{passError}</p>}
                </div>
                <button 
                    disabled={isUpdating}
                    onClick={finalUpdatePassword}
                    className="w-full p-4 bg-orange-500 text-white rounded-2xl font-black uppercase italic hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleButton({ active, onClick }) {
  return (
    <button onClick={onClick} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${active ? 'bg-orange-500' : 'bg-gray-200 dark:bg-zinc-700'}`}>
      <span className={`${active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 shadow-sm`} />
    </button>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 font-bold text-gray-700 dark:text-zinc-300 transition-all text-sm group">
      <span className="text-orange-500 transition-transform group-hover:scale-110">{icon}</span>
      {label}
    </button>
  );
}