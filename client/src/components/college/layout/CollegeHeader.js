'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBell, 
  FaEnvelope, 
  FaUserCircle, 
  FaCaretDown,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaShieldAlt,
  FaExclamationCircle 
} from 'react-icons/fa';

export default function CollegeHeader() {
  const { logout } = useAuth();
  const router = useRouter();
  const [collegeData, setCollegeData] = useState({ name: '', email: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  
  // --- NAYA STATE: Visibility ke liye ---
  const [showMessagesIcon, setShowMessagesIcon] = useState(true);
  const [showBellIcon, setShowBellIcon] = useState(true); // Naya: Case Alerts ke liye

  const [notifications, setNotifications] = useState([]);
  const [realMessages, setRealMessages] = useState([]);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  // --- API Fetch Logic ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. Profile Data
      const profileRes = await fetch('http://127.0.0.1:8000/api/collage/profile/', { headers });
      if (profileRes.ok) {
        const data = await profileRes.json();
        const profile = Array.isArray(data) ? data[0] : data;
        setCollegeData({
          name: profile?.college_name || 'College Admin',
          email: profile?.user_email || 'admin@college.edu'
        });
      }

      // 2. Notifications (Bell Icon)
      const notifRes = await fetch(`http://127.0.0.1:8000/api/collage/notifications/?t=${new Date().getTime()}`, { 
        headers,
        cache: 'no-store' 
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data);
      }

      // 3. Messages (Envelope Icon)
      const msgRes = await fetch(`http://127.0.0.1:8000/api/collage/messages/unread/?t=${new Date().getTime()}`, { 
        headers,
        cache: 'no-store' 
      });
      if (msgRes.ok) {
        const data = await msgRes.json();
        setRealMessages(data); 
      }

    } catch (error) {
      console.error("Header fetch error:", error);
    }
  };

  // --- UPDATED LOGIC: Settings read karne ke liye ---
  useEffect(() => {
    const checkSettings = () => {
      const saved = localStorage.getItem('admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Email Notifications logic
        setShowMessagesIcon(parsed.emailNotifications !== false);
        // Case Alerts logic (Bell Icon)
        setShowBellIcon(parsed.caseAlerts !== false);
      }
    };

    fetchData();
    checkSettings();

    window.addEventListener('storage', checkSettings);
    
    const interval = setInterval(fetchData, 10000); 
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkSettings);
    };
  }, []);

  // --- Notification Click ---
  const handleNotificationClick = async (id) => {
    const token = localStorage.getItem('token');
    setNotifications(prev => prev.filter(n => n.id !== id));
    setIsNotificationsOpen(false);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/collage/notifications/read/${id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) await fetchData();
    } catch (error) {
      console.error("Error updating notification status:", error);
    } finally {
      router.push(`/college/reports?id=${id}`);
    }
  };

  // --- Updated Message Click Handler ---
  const handleMessageClick = async (message) => {
    const token = localStorage.getItem('token');
    
    setRealMessages(prev => prev.filter(m => m.id !== message.id));
    setIsMessagesOpen(false);

    try {
      await fetch(`http://127.0.0.1:8000/api/collage/messages/read/${message.id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      await fetchData();
    } catch (error) {
      console.error("Error marking message as read:", error);
    } finally {
      const identifier = message.sender_type === 'OFFICIAL' ? 'university' : message.full_sender_email;
      router.push(`/college/messages?id=${identifier}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
      if (messagesRef.current && !messagesRef.current.contains(event.target)) setIsMessagesOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.length;
  const unreadMessages = realMessages.length;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Left Section */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="bg-zinc-100 dark:bg-zinc-700 p-2 rounded-lg">
            <FaShieldAlt className="text-orange-600 text-lg" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Anti-Ragging <span className="text-orange-600">Control Center</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Campus Security: <span className="text-emerald-500">Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          
          {/* Notifications Dropdown - 🟢 CASE ALERTS LOGIC */}
          {showBellIcon && (
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsMessagesOpen(false);
                  setIsProfileOpen(false);
                }}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
              >
                <FaBell className="text-xl" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Active Reports</h3>
                    <p className="text-xs text-gray-500">{unreadNotifications} urgent notifications</p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        onClick={() => handleNotificationClick(notification.id)}
                        className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <FaExclamationCircle className="text-orange-500 mt-1" />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{notification.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">No new reports</div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800/50">
                    <Link href="/college/reports" className="block w-full text-center text-orange-600 hover:text-orange-700 text-xs font-bold py-1 uppercase">
                      View All Reports
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages Dropdown */}
          {showMessagesIcon && (
            <div className="relative" ref={messagesRef}>
              <button 
                onClick={() => {
                  setIsMessagesOpen(!isMessagesOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
              >
                <FaEnvelope className="text-xl" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-gray-800 animate-pulse">
                    {unreadMessages}
                  </span>
                )}
              </button>

              {isMessagesOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Direct Messages</h3>
                    <p className="text-[10px] text-orange-500 font-bold uppercase">{unreadMessages} New Conversations</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {realMessages.length > 0 ? realMessages.map((message) => (
                      <div 
                        key={message.id} 
                        onClick={() => handleMessageClick(message)}
                        className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-tighter italic">
                            From: {message.sender_name}
                          </p>
                          <span className="text-[9px] text-gray-400">{message.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{message.text}</p>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-center text-gray-400 text-xs font-bold uppercase italic tracking-widest">
                        No new messages
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800/50 text-center">
                    <Link href="/college/messages" className="text-orange-600 hover:text-orange-700 text-[10px] font-black uppercase">
                      Message Center
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
                setIsMessagesOpen(false);
              }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaUserCircle className="text-2xl text-gray-600 dark:text-gray-300" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase truncate max-w-[100px]">
                  {collegeData.name}
                </p>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                  Admin
                </p>
              </div>
              <FaCaretDown className="text-gray-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate uppercase">{collegeData.name}</p>
                  <p className="text-xs text-gray-500 truncate">{collegeData.email}</p>
                </div>
                <Link href="/college/profile" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FaUser className="text-gray-400" /> <span>My Profile</span>
                </Link>
                <Link href="/college/settings" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FaCog className="text-gray-400" /> <span>Settings</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 font-bold border-t border-gray-100 dark:border-gray-700 hover:bg-red-50 uppercase italic tracking-tighter">
                  <FaSignOutAlt /> <span>Terminate Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}