'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowRight, FaShieldAlt, FaUserGraduate, FaUniversity, FaLock } from 'react-icons/fa';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 1. Agar auth loading khatam ho jaye tabhi redirect karein
    if (!loading && user) {
      setIsRedirecting(true);
      const roleRoutes = {
        student: '/student',
        admin: '/admin',
        college: '/college',
        university: '/university',
      };
      
      const targetPath = roleRoutes[user.role] || '/login';
      
      // replace use karne se back button par login loop nahi banta
      const timer = setTimeout(() => {
        router.replace(targetPath);
      }, 500); // Chhota delay taaki smooth experience mile

      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Loading ya Redirecting state UI - Modern Loader
  if (isRedirecting || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-orange-500"></div>
          <FaShieldAlt className="absolute text-2xl text-orange-500" />
        </div>
        <div className="mt-8 text-center">
          <p className="text-black dark:text-white font-black uppercase tracking-[0.3em] text-xs animate-pulse">
            Authenticating Session
          </p>
          <div className="mt-2 flex space-x-1 justify-center">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Navigation Bar (Mini) */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <span className="font-black text-xl uppercase tracking-tighter dark:text-white">Anti-Ragging</span>
          </div>
          {!user && (
            <button 
              onClick={() => router.push('/login')}
              className="text-xs font-black uppercase tracking-widest hover:text-orange-500 transition-colors dark:text-white"
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-zinc-900 px-4 py-2 rounded-full mb-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white dark:border-zinc-900"></div>
              <div className="w-6 h-6 rounded-full bg-black border-2 border-white dark:border-zinc-900"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Trusted by 50+ Universities
            </span>
          </div>
          
          <h1 className="text-6xl md:text-[7rem] font-black text-black dark:text-white mb-8 tracking-tighter italic uppercase leading-[0.85] py-2">
            Zero <br />
            <span className="text-orange-500 drop-shadow-sm">Tolerance.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            A secured, anonymous ecosystem to report, track, and eliminate campus harassment in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <button 
              onClick={() => router.push('/register')} 
              className="group relative bg-black dark:bg-white text-white dark:text-black px-12 py-6 rounded-2xl font-black uppercase text-sm tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <span className="flex items-center gap-3">
                Join the Network <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <FaLock className="text-orange-500" /> AES-256 Encrypted
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card 
            icon={<FaUserGraduate />} 
            title="Students" 
            desc="File incidents anonymously, chat with counselors, and access emergency SOS tools instantly."
            accent="orange"
          />
          <Card 
            icon={<FaShieldAlt />} 
            title="Colleges" 
            desc="Manage investigation committees, verify reports, and maintain institutional safety records."
            accent="black"
          />
          <Card 
            icon={<FaUniversity />} 
            title="Authorities" 
            desc="Gain high-level insights across all affiliated campuses with data-driven safety audits."
            accent="orange"
          />
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, desc, accent }) {
  return (
    <div className="group p-10 bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-[3rem] border border-gray-100 dark:border-zinc-800 hover:border-orange-500/40 transition-all duration-700 relative overflow-hidden">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
        accent === 'orange' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
      } shadow-xl`}>
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-4">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-sm opacity-80 group-hover:opacity-100 transition-opacity">
        {desc}
      </p>
      
      {/* Aesthetic Background Letter */}
      <div className="absolute -bottom-6 -right-6 text-[12rem] font-black text-orange-500/[0.03] dark:text-white/[0.02] pointer-events-none select-none uppercase">
        {title[0]}
      </div>
    </div>
  );
}