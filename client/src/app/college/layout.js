'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CollegeSidebar from '@/components/college/layout/CollegeSidebar';
import CollegeHeader from '@/components/college/layout/CollegeHeader';

export default function CollegeLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jab tak loading ho rahi hai, kuch mat karo
    if (loading) return;

    // Agar user nahi hai, toh login phek do
    if (!user) {
      router.replace('/login');
      return;
    }

    // AGAR USER HAI LEKIN USKA ROLE COLLEGE NAHI HAI
    // Toh usey uske sahi dashboard par bhejo, na ki login par
    if (user.role !== 'college') {
      console.log("Not a college user, redirecting to:", user.role);
      router.replace(`/${user.role}`); 
    }
  }, [user, loading, router]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-600"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Verifying College Access...</p>
        </div>
      </div>
    );
  }

  // Agar user college nahi hai toh content mat dikhao (useEffect handles redirect)
  if (!user || user.role !== 'college') {
    return null;
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <CollegeSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <CollegeHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}