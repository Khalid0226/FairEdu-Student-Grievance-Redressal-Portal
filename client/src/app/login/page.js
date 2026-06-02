'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/shared/LoginForm';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  // 1. Smart Guard: Redirect if already logged in
  useEffect(() => {
    if (!loading && user?.role) {
      const safeRole = user.role.toLowerCase().trim();
      const redirectPath = safeRole === 'college' || safeRole === 'collage' ? '/college' : `/${safeRole}`;
      window.location.replace(redirectPath);
    }
  }, [user, loading]);

  const handleLogin = async (identifier, password) => {
    setSubmitting(true);
    setError('');

    try {
      // 🟢 Role based endpoint selection
      let endpoint = 'http://127.0.0.1:8000/api/student/login/';
      
      if (selectedRole === 'university') {
        endpoint = 'http://127.0.0.1:8000/api/university/login/';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          username: identifier, 
          email: identifier,
          password: password 
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Database connection or Django error.");
      }

      const data = await response.json();

      if (response.ok) {
        // 🔴 CRITICAL FIX: Clear old college data before setting new session
        localStorage.clear();
        sessionStorage.clear();
        console.log("Logged out previous session and cleared cache.");

        // Backend se role nikalein
        const rawRole = data.user_details?.role || data.user?.role || data.role || 'student';
        const backendRole = rawRole.toLowerCase().trim();
        
        // Normalize role name
        const normalizedRole = (backendRole === 'collage' || backendRole === 'college') ? 'college' : backendRole;

        // 🟢 VALIDATION: Check if user selected the right tab
        if (normalizedRole !== selectedRole) {
          throw new Error(`Access Denied: This is a ${normalizedRole} account. Please use the ${normalizedRole.toUpperCase()} tab.`);
        }

        const token = data.token;
        const userData = data.user_details || data.user || data;

        // Update global AuthContext
        const success = await login(token, userData, normalizedRole);
        
        if (success) {
          // Hard redirect to clear any lingering state
          setTimeout(() => {
            window.location.href = normalizedRole === 'college' ? '/college' : `/${normalizedRole}`;
          }, 150);
        }
      } else {
        setError(data.message || data.error || `Invalid credentials for ${selectedRole}`);
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message.includes('fetch') 
        ? 'Connection failed. Ensure Django is running on port 8000.' 
        : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-orange-500/30">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-700">
        
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-600 rounded-[2rem] rotate-12 flex items-center justify-center text-3xl mx-auto mb-6 shadow-2xl shadow-orange-600/30 group hover:rotate-0 transition-transform duration-500 cursor-pointer">
            <span className="-rotate-12 group-hover:rotate-0 transition-transform duration-500">🛡️</span>
          </div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase italic">
            Secure <span className="text-orange-600">Portal</span>
          </h1>
          
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl mt-8 border border-gray-200 dark:border-zinc-800 shadow-inner">
            {['student', 'college', 'university'].map((roleOption) => (
              <button
                key={roleOption}
                type="button"
                onClick={() => setSelectedRole(roleOption)}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  selectedRole === roleOption 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'text-gray-500 hover:text-orange-500'
                }`}
              >
                {roleOption}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <LoginForm 
              onSubmit={handleLogin} 
              error={error} 
              isLoading={submitting} 
              showForgot={selectedRole === 'student'} // 🟢 Prop added here
          />
        </div>
        
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 opacity-60">
              Authorized Access Only • GTU Security Node
          </p>
        </div>
      </div>
    </div>
  );
}