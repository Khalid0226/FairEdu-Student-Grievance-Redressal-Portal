'use client';
import { useState, useEffect } from 'react';
import { 
  FaSave, 
  FaBell, 
  FaShieldAlt,
  FaLock,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function UniversitySettings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [isLoading, setIsLoading] = useState(false);

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true
  });

  // --- Password Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOldVerified, setIsOldVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load initial state from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('university_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordChangeRequired: true,
    loginAlerts: true,
    ipWhitelist: false,
    auditLogs: true
  });

  // --- Password Logic ---

  // 1. Verify Old Password
  const handleVerifyOld = async () => {
    if (!passwords.old_password) return;
    setPasswordError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/university/verify-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ old_password: passwords.old_password })
      });

      if (response.ok) {
        setIsOldVerified(true);
      } else {
        setPasswordError('Password incorrect! Please try again.');
      }
    } catch (err) {
      setPasswordError('Server connection error.');
    }
  };

  // 2. Change to New Password
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError('New passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/university/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: passwords.new_password })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        closeModal();
      } else {
        setPasswordError('Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Something went wrong.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsOldVerified(false);
    setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    setPasswordError('');
  };

  // Toggling only updates local component state (Not localStorage)
  const handleNotificationChange = (field) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('university_notifications', JSON.stringify(notifications));
      window.dispatchEvent(new Event('settingsUpdated'));
      alert('University settings saved successfully!');
    } catch (error) {
      console.error("Save Error:", error);
      alert('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">University Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage university notifications and security preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          <FaSave />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <Icon />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive notifications for important university updates via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-medium text-red-800 mb-2">Change Password</h3>
                    <p className="text-sm text-red-600 mb-4">
                      It's recommended to change your password for security
                    </p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Change Password Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaLock className="text-orange-500" />
                <h3 className="font-bold text-gray-800">Change Password</h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {passwordError && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 font-bold flex items-center gap-2">
                  <FaExclamationTriangle /> {passwordError}
                </div>
              )}

              {/* Step 1: Verify Old Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Old Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    disabled={isOldVerified}
                    value={passwords.old_password}
                    onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                    placeholder="Enter old password"
                  />
                  {!isOldVerified && (
                    <button 
                      onClick={handleVerifyOld}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      Verify
                    </button>
                  )}
                </div>
                {isOldVerified && (
                  <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
                    <FaCheckCircle /> Verified! You can now set a new password.
                  </p>
                )}
              </div>

              {/* Step 2: New & Confirm Password (Only enabled if old is verified) */}
              <form onSubmit={handlePasswordChangeSubmit} className={`space-y-4 transition-all duration-300 ${isOldVerified ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-2'}`}>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required={isOldVerified}
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    required={isOldVerified}
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Repeat new password"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-200 mt-2 active:scale-95"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}