'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiGrid, FiEdit3, FiLayers, FiMessageCircle, 
  FiShield, FiUser, FiSettings, FiX 
} from 'react-icons/fi';

const menuItems = [
  { name: 'Dashboard', href: '/student', icon: <FiGrid /> },
  { name: 'Report Incident', href: '/student/reports/new', icon: <FiEdit3 /> },
  { name: 'My Reports', href: '/student/reports', icon: <FiLayers /> },
  { name: 'Messages', href: '/student/messages', icon: <FiMessageCircle /> },
  { name: 'Emergency Help', href: '/student/emergency', icon: <FiShield /> },
  { name: 'Profile', href: '/student/profile', icon: <FiUser /> },
  { name: 'Settings', href: '/student/settings', icon: <FiSettings /> },
];

export default function StudentSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-72 bg-white border-r border-gray-100
        transform transition-all duration-300 ease-out
        flex flex-col shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-200">
               <FiShield className="text-white text-lg" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Anti-Ragging
            </h2>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-orange-500 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="px-6 mb-6">
          <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-4 border border-orange-100/50">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.full_name || 'Student Name'}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-200 text-orange-700 uppercase">
                Student
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={`
                  flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 translate-x-1' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-orange-600'}
                `}
              >
                <span className={`text-xl transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-1">Safety First</p>
             <p className="text-[11px] text-gray-500 text-center leading-relaxed font-medium">
               Anonymously report and stay protected.
             </p>
          </div>
        </div>
      </div>
    </>
  );
}