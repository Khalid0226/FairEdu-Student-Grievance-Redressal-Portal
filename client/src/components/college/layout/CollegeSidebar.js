'use client';
import { useState, useEffect } from 'react'; // useEffect add kiya dynamic name ke liye
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaCog, 
  FaChevronLeft, 
  FaChevronRight, 
  FaUniversity,
  FaUserAlt 
} from 'react-icons/fa';

const menuItems = [
  { name: 'Dashboard', href: '/college', icon: FaHome },
  { name: 'Students', href: '/college/students', icon: FaUserGraduate },
  { name: 'Messages', href: '/college/messages', icon: FaChalkboardTeacher },
  { name: 'Reports', href: '/college/reports', icon: FaBook },
  { name: 'Profile', href: '/college/profile', icon: FaUserAlt },
  { name: 'Settings', href: '/college/settings', icon: FaCog },
];

export default function CollegeSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collegeName, setCollegeName] = useState('RBIMS'); // Default Name
  const pathname = usePathname();

  // Login user ka naam fetch karne ke liye
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.college_name) {
      setCollegeName(user.college_name);
    }
  }, []);

  return (
    <div className={`bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 min-h-screen relative ${isCollapsed ? 'w-20' : 'w-72'}`}>
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-orange-600 p-2 rounded-lg shrink-0">
              <FaUniversity className="text-xl text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white truncate max-w-[150px]">
                {collegeName}
              </span>
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest -mt-1">
                Institutional Hub
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <FaChevronRight className="text-zinc-400" /> : <FaChevronLeft className="text-zinc-400" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 mt-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/college' 
              ? pathname === '/college' 
              : pathname.startsWith(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-4 p-4 rounded-2xl transition-all group relative ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200 dark:shadow-none'
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-orange-600'
                  }`}
                >
                  <div className={`${isActive ? 'text-orange-500' : 'group-hover:text-orange-600'} transition-colors`}>
                    <Icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
                  </div>
                  
                  {!isCollapsed && (
                    <span className="font-bold uppercase text-xs tracking-widest">
                      {item.name}
                    </span>
                  )}

                  {/* Active Indicator Pin */}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_#ea580c]"></div>
                  )}

                  {/* Tooltip for Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}