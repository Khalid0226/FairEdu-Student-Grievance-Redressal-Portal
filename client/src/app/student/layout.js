'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StudentSidebar from '@/components/student/layout/StudentSidebar';
import StudentHeader from '@/components/student/layout/StudentHeader';

export default function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Modern Light Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-slate-500 font-medium tracking-wide">Loading Portal...</div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Light Version */}
      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Mobile Overlay with Blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - White & Sticky */}
        <StudentHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Top Decorative Background - Very Subtle Indigo Glow */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto w-full p-4 md:p-8 relative z-10">
            {children}
          </div>

          <footer className="p-8 text-center text-slate-400 text-[10px] font-semibold tracking-widest uppercase">
            Official Anti-Ragging Portal © 2025
          </footer>
        </main>
      </div>
    </div>
  );
}