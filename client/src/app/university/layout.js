'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UniversitySidebar from '@/components/university/layout/UniversitySidebar';
import UniversityHeader from '@/components/university/layout/UniversityHeader';

export default function UniversityLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'university')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'university') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 to-white">
      <UniversitySidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UniversityHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}