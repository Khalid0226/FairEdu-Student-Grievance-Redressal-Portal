'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; 
import { 
  FaEnvelope, 
  FaCaretDown, 
  FaSignOutAlt, 
  FaCog, 
  FaUser, 
  FaShieldAlt 
} from 'react-icons/fa';

export default function UniversityHeader() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Settings Sync State
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);

  // University data state
  const [uniData, setUniData] = useState({
    university_name: '',
    contact_email: '',
    logo: null
  });

  const profileRef = useRef(null);
  const messagesRef = useRef(null);

  const BASE_URL = 'http://127.0.0.1:8000';

  // --- 1. Settings Sync (Event Based - Only on Save) ---
  useEffect(() => {
    const syncSettings = () => {
      const savedSettings = localStorage.getItem('university_notifications');
      if (savedSettings) {
        try {
          const { emailNotifications } = JSON.parse(savedSettings);
          setIsEmailEnabled(emailNotifications);
          
          // Agar settings OFF hui hain, toh turant UI reset karo
          if (emailNotifications === false) {
            setUnreadCount(0);
            setNotifications([]);
            setIsMessagesOpen(false);
          }
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
      }
    };

    // Initial load par check karein
    syncSettings();

    // Jab Save button dabega aur event fire hoga, tabhi ye chalega
    window.addEventListener('settingsUpdated', syncSettings);
    
    // Alag tab/window mein change ho toh uske liye (Optional but good)
    window.addEventListener('storage', syncSettings);

    return () => {
      window.removeEventListener('settingsUpdated', syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, []);

  // --- 2. Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${BASE_URL}/api/university/profile/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUniData(data);
        }
      } catch (error) {
        console.error("Header Profile Sync Error:", error);
      }
    };
    fetchProfile();
  }, []);

  // --- 3. Fetch Notifications (Conditional) ---
  const fetchNotifications = async () => {
    // API call tabhi karein jab settings ON ho
    if (!isEmailEnabled) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/university/notifications/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      // Double check current state before updating
      if (data.status === 'success' && isEmailEnabled) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Notification Fetch Error:", error);
    }
  };

  // Real-time polling only if enabled
  useEffect(() => {
    if (isEmailEnabled) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3000); 
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isEmailEnabled]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (messagesRef.current && !messagesRef.current.contains(event.target)) setIsMessagesOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const handleNotifClick = (senderEmail) => {
    setIsMessagesOpen(false);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const uniName = uniData.university_name || user?.name || 'UNIVERSITY PANEL';
  const uniEmail = uniData.contact_email || user?.email || 'admin@university.edu';
  const uniLogo = uniData.logo;

  return (
    <header className="bg-white shadow-sm border-b border-orange-200 relative z-[50] w-full h-20">
      <div className="flex items-center justify-between px-6 h-full">
        
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-lg shadow-md">
            <FaShieldAlt className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">University Panel</h1>
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Management System</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          
          {/* Messages Dropdown - Strict UI Visibility Check */}
          {isEmailEnabled && (
            <div className="relative" ref={messagesRef}>
              <button 
                onClick={() => { setIsMessagesOpen(!isMessagesOpen); setIsProfileOpen(false); }}
                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all relative"
              >
                <FaEnvelope className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isMessagesOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-orange-100 overflow-hidden z-[100]">
                  <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-800">Messages</h3>
                    {unreadCount > 0 && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{unreadCount} New</span>}
                  </div>

                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((msg) => (
                        <Link 
                          key={msg.id}
                          href={`/university/message?target_email=${msg.sender}`}
                          onClick={() => handleNotifClick(msg.sender)}
                          className="flex items-start gap-3 p-4 hover:bg-orange-50 border-b border-gray-50 transition-colors"
                        >
                          <div className="mt-1 p-2 rounded-full bg-blue-100 text-blue-600">
                            <FaEnvelope size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-gray-900 lowercase">{msg.sender}</p>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{msg.text}</p>
                            <p className="text-[9px] text-gray-400 mt-1 font-bold">{msg.time}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <FaEnvelope className="mx-auto text-gray-200 text-3xl mb-2" />
                        <p className="text-xs text-gray-400">No new messages</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    href="/university/message" 
                    className="block text-center p-3 text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors border-t border-orange-100"
                    onClick={() => setIsMessagesOpen(false)}
                  >
                    View All Messages
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="h-8 w-px bg-gray-200 mx-2"></div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsMessagesOpen(false); }}
              className="flex items-center space-x-3 p-1 pr-3 rounded-xl hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden border border-orange-200">
                {uniLogo ? (
                  <img 
                    src={uniLogo.startsWith('http') ? uniLogo : `${BASE_URL}${uniLogo}`} 
                    className="w-full h-full object-cover" 
                    alt="Logo"
                  />
                ) : (
                  <FaUser className="text-sm" />
                )}
              </div>

              <div className="text-left hidden md:block max-w-[200px]">
                <p className="text-xs font-bold text-gray-900 leading-none truncate italic uppercase">
                  {uniName}
                </p>
                <p className="text-[10px] text-gray-500 font-medium truncate mt-1">Administrator</p>
              </div>
              <FaCaretDown className="text-gray-400 text-xs" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-orange-100 py-1.5 z-[60]">
                <div className="px-4 py-3 border-b border-orange-50 mb-1">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Institution Info</p>
                  <p className="text-sm font-bold text-gray-900 truncate mt-1">{uniName}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{uniEmail}</p>
                </div>
                
                <Link href="/university/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium">
                  <FaUser className="text-orange-400" />
                  <span>View Profile</span>
                </Link>
                
                <Link href="/university/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium">
                  <FaCog className="text-orange-400" />
                  <span>Settings</span>
                </Link>
                
                <div className="border-t border-orange-50 mt-1">
                  <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold uppercase tracking-wider">
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}