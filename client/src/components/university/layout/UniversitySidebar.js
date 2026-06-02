'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaUniversity, 
  FaComments,
  FaChartBar, 
  FaCog, 
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaFileAlt,
  FaUserCircle // Profile ke liye icon add kiya
} from 'react-icons/fa';

const menuItems = [
  { name: 'Dashboard', href: '/university', icon: FaHome },
  { name: 'Colleges', href: '/university/colleges', icon: FaUniversity },
  { name: 'Messages', href: '/university/message', icon: FaComments },
  { name: 'Reports', href: '/university/reports', icon: FaChartBar },
  { name: 'Students', href: '/university/students', icon: FaGraduationCap },
  { name: 'Analytics', href: '/university/analytics', icon: FaFileAlt },
  { name: 'Profile', href: '/university/profile', icon: FaUserCircle }, // Naya Profile Option
  { name: 'Settings', href: '/university/settings', icon: FaCog },
];

export default function UniversitySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-white shadow-lg border-r border-orange-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <FaUniversity className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-gray-800">University</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Icon className={`text-lg ${isCollapsed ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-orange-500'}`} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapsed Tooltips */}
      {isCollapsed && (
        <div className="absolute left-20 z-50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <div
                key={item.name}
                className="relative group py-4" /* Thodi spacing add ki taaki icon ke barabar dikhe */
              >
                <div className="hidden group-hover:block absolute left-2 top-1/2 transform -translate-y-1/2">
                  <div className="bg-gray-800 text-white text-sm rounded py-1 px-2 whitespace-nowrap ml-2">
                    {item.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}