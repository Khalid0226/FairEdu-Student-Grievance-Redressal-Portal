'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiSettings,
  FiX,
  FiMenu 
} from 'react-icons/fi';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: FiHome, mobileIcon: FiHome },
  { name: 'User Management', href: '/admin/users', icon: FiUsers, mobileIcon: FiUsers },
  { name: 'All Reports', href: '/admin/reports', icon: FiFileText, mobileIcon: FiFileText },
  { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2, mobileIcon: FiBarChart2 },
  { name: 'System Settings', href: '/admin/settings', icon: FiSettings, mobileIcon: FiSettings },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 md:w-20 lg:w-64
        bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black hidden lg:block">
            Admin Portal
          </h2>
          <h2 className="text-lg font-bold text-black hidden md:block lg:hidden">
            AP
          </h2>
          <h2 className="text-lg font-bold text-black md:hidden">
            Admin Portal
          </h2>
          
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">A</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-black">{user?.name}</p>
              <p className="text-xs text-gray-600">System Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const MobileIconComponent = item.mobileIcon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 group
                  ${pathname === item.href
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={item.name}
                onClick={onClose}
              >
                <IconComponent className="text-lg md:hidden lg:block" />
                <MobileIconComponent className="text-lg hidden md:block lg:hidden" />
                <span className="md:hidden lg:block">{item.name}</span>
                
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block lg:hidden z-50">
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="hidden lg:block text-xs text-gray-500">
            <p>Anti-Ragging Platform</p>
            <p>System Administration</p>
          </div>
          <div className="hidden md:block lg:hidden text-xs text-gray-500 text-center">
            <p>Admin Panel</p>
          </div>
          <div className="md:hidden text-xs text-gray-500">
            <p>Anti-Ragging Platform</p>
            <p>System Administration</p>
          </div>
        </div>
      </div>
    </>
  );
}