'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCommentDots, FaBell, FaCircle } from 'react-icons/fa';

export default function StudentHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false); 
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ messages: 0, reports: 0 }); 
  const [notifications, setNotifications] = useState([]); 
  const [recentMessages, setRecentMessages] = useState([]); 
  
  // --- NAYA LOGIC: Notification visibility control karne ke liye ---
  const [showNotifIcon, setShowNotifIcon] = useState(true);

  useEffect(() => {
    const checkSettings = () => {
      // LocalStorage se check karega ki settings mein email notifications ON hain ya nahi
      const isEnabled = localStorage.getItem('emailNotificationsEnabled') !== 'false';
      setShowNotifIcon(isEnabled);
    };

    checkSettings(); // Pehli baar check karne ke liye
    
    // Jab settings page par toggle hoga, ye event listen karega
    window.addEventListener('storage', checkSettings);
    return () => window.removeEventListener('storage', checkSettings);
  }, []);
  // -----------------------------------------------------------

  const router = useRouter();
  const dropdownRef = useRef(null); 
  
  const BACKEND_URL = "http://127.0.0.1:8000";

  const handleMessageClick = (msg) => {
    setShowMessageDropdown(false);
    if (msg.channel) {
      router.push(`/student/messages?selected=${msg.channel}`);
    } else {
      router.push('/student/messages');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
        setShowUserMenu(false);
        setShowMessageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${BACKEND_URL}/api/student/notifications/summary/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            setUnreadCounts({
              messages: Number(data.unread_messages) || 0,
              reports: Number(data.unread_reports) || 0
            });
            setNotifications(data.updates || []);
            setRecentMessages(data.recent_messages || []); 
          }
        }
      } catch (error) {
        console.error("Header Notification Error:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center justify-between" ref={dropdownRef}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Anti-Ragging Portal
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* 1. Messages Icon + Dropdown (Conditional rendering added) */}
          {showNotifIcon && (
            <div className="relative">
              <button 
                onClick={() => { setShowMessageDropdown(!showMessageDropdown); setShowNotifDropdown(false); }}
                className={`relative p-2 rounded-lg transition-colors group ${showMessageDropdown ? 'bg-gray-100 dark:bg-gray-800 text-orange-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <FaCommentDots className="w-5 h-5" />
                {unreadCounts.messages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-pulse shadow-sm">
                    {unreadCounts.messages}
                  </span>
                )}
              </button>

              {showMessageDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Messages</h4>
                    {unreadCounts.messages > 0 && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{unreadCounts.messages} NEW</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentMessages.length === 0 && unreadCounts.messages === 0 ? (
                      <div className="p-8 text-center"><p className="text-xs font-bold text-gray-400 uppercase">No new messages</p></div>
                    ) : recentMessages.length === 0 && unreadCounts.messages > 0 ? (
                      <button onClick={() => router.push('/student/messages')} className="w-full text-left block p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">You have new unread messages. Click to view.</p>
                        </div>
                      </button>
                    ) : (
                      recentMessages.map((msg) => (
                        <button 
                          key={msg.id} 
                          onClick={() => handleMessageClick(msg)} 
                          className="w-full text-left block p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                            <div>
                              <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase">{msg.sender_name || 'Official'}</h5>
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{msg.text}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <Link href="/student/messages" className="block p-3 text-center text-[10px] font-black uppercase text-gray-500 hover:text-orange-600 bg-gray-50 dark:bg-gray-800/50 transition-colors" onClick={() => setShowMessageDropdown(false)}>
                    View All Messages
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 2. Reports (Bell) Icon + Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowMessageDropdown(false); }}
              className={`relative p-2 rounded-lg transition-colors group ${showNotifDropdown ? 'bg-gray-100 dark:bg-gray-800 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <FaBell className="w-5 h-5" />
              {unreadCounts.reports > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-bounce shadow-sm">
                  {unreadCounts.reports}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Updates</h4>
                  {unreadCounts.reports > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{unreadCounts.reports} NEW</span>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center"><p className="text-xs font-bold text-gray-400 uppercase">No new status updates</p></div>
                  ) : (
                    notifications.map((notif) => (
                      <Link key={notif.id} href={`/student/reports/`} className="block p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group" onClick={() => setShowNotifDropdown(false)}>
                        <div className="flex items-start gap-3">
                          <FaCircle className="text-[8px] text-blue-600 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Case #{notif.serial}</p>
                            <h5 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase">{notif.type}</h5>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">Status changed to <span className="font-black text-blue-600 uppercase">{notif.status.replace('_', ' ')}</span></p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <Link href="/student/reports" className="block p-3 text-center text-[10px] font-black uppercase text-gray-500 hover:text-blue-600 bg-gray-50 dark:bg-gray-800/50 transition-colors" onClick={() => setShowNotifDropdown(false)}>
                  View All Reports
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative border-l pl-2 sm:pl-4 border-gray-100 dark:border-gray-800">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifDropdown(false); setShowMessageDropdown(false); }}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-medium text-white">{user?.full_name?.charAt(0) || 'S'}</span>
              </div>
              <span className="text-sm font-medium hidden sm:block text-gray-700 dark:text-gray-300">
                {user?.role === 'student' ? 'Student' : user?.role || 'User'}
              </span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''} text-gray-700 dark:text-gray-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-40">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium truncate">{user?.full_name || 'Student'}</p>
                  <p className="text-xs text-gray-500">Official Profile</p>
                </div>
                <Link href="/student/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" onClick={() => setShowUserMenu(false)}>👤 My Profile</Link>
                <Link href="/student/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" onClick={() => setShowUserMenu(false)}>⚙️ Settings</Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">🚪 Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}