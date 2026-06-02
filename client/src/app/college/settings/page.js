'use client';
import { useState, useEffect } from 'react';
import { FaSave, FaBell, FaShieldAlt } from 'react-icons/fa';

export default function CollegeSettings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [isLoading, setIsLoading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    caseAlerts: true,
  });

  // --- NAYA STATE: Password Modal ke liye ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_notifications');
    if (savedSettings) {
      setNotifications(JSON.parse(savedSettings));
    }
  }, []);

  const handleNotificationChange = (field) => {
    const newValue = !notifications[field];
    setNotifications(prev => ({ ...prev, [field]: newValue }));
  };

  // --- NAYA LOGIC: Password Update Handler ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/collage/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password updated successfully!");
        setIsPasswordModalOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.error || "Failed to update password. Check old password.");
      }
    } catch (error) {
      console.error("Password update error:", error);
      alert("Server error. Try again later.");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    window.dispatchEvent(new Event('storage'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-black pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-black dark:text-white">
            System <span className="text-orange-600">Settings</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest mt-1 text-[10px]">
            Manage System Preferences & Security
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-black hover:bg-orange-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full font-black uppercase italic text-xs transition-all active:scale-95 shadow-lg shadow-orange-500/10"
        >
          <FaSave />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-4 shadow-sm">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl text-left transition-all font-bold uppercase text-[11px] tracking-wider ${
                      activeTab === tab.id
                        ? 'bg-black text-white shadow-xl shadow-black/10'
                        : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className={activeTab === tab.id ? 'text-orange-500' : ''} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm min-h-[500px]">
            
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <h2 className="text-xl font-black uppercase italic border-l-4 border-orange-600 pl-4 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-zinc-200 transition-all">
                      <div>
                        <h3 className="font-bold text-sm text-black dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 tracking-tight">
                          {key === 'emailNotifications' ? 'Connects alerts with message icon' : 'Receive alerts for this activity'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationChange(key)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <h2 className="text-xl font-black uppercase italic border-l-4 border-orange-600 pl-4 mb-6">Security & Privacy</h2>
                <div className="space-y-6">
                  <div className="p-6 border-2 border-dashed border-zinc-100 bg-zinc-50/50 rounded-[2rem] flex flex-col items-start">
                    <h3 className="font-black uppercase text-black dark:text-white text-sm mb-2">Update Password</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mb-4 tracking-wider">Change your master access password</p>
                    {/* onClick added to open modal */}
                    <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-black hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase italic text-[11px] transition-all active:scale-95 shadow-lg"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- NAYA: Update Password Modal --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900 p-6 text-white text-center">
              <h3 className="text-xl font-bold uppercase italic tracking-tighter">Update Master Access</h3>
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest mt-1">Security Protocol Required</p>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Current Password</label>
                <input 
                  type="password"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">New Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all"
                >
                  Secure Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}