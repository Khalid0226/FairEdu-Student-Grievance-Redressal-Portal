'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: New Password, Step 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Check if Email exists in DB
  const checkEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Yahan aapka Django endpoint aayega jo sirf email verify karega
      const response = await fetch('http://127.0.0.1:8000/api/student/verify-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep(2); // Email mil gaya, ab password change karne do
      } else {
        const data = await response.json();
        setError(data.message || "Email not found in our records.");
      }
    } catch (err) {
      setError("Connection error. Check if Django is running.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Password in DB
  const updatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/student/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (response.ok) {
        setStep(3); // Success!
      } else {
        setError("Could not update password. Try again.");
      }
    } catch (err) {
      setError("Server error during password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-orange-500/30">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-700">
        
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-600 rounded-[2rem] rotate-12 flex items-center justify-center text-3xl mx-auto mb-6 shadow-2xl shadow-orange-600/30">
            <span className="-rotate-12">{step === 3 ? '✅' : '🔑'}</span>
          </div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase italic">
            {step === 1 ? 'Verify' : step === 2 ? 'New' : 'Success'} <span className="text-orange-600">Access</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-4 italic">
            {step === 1 ? 'Step 1: Identity Check' : step === 2 ? 'Step 2: Security Update' : 'Access Restored'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-2xl relative">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
              <p className="text-[11px] font-black text-red-600 uppercase italic">{error}</p>
            </div>
          )}

          {/* STEP 1: EMAIL INPUT */}
          {step === 1 && (
            <form onSubmit={checkEmail} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ansarikhalid8054@gmail.com"
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm font-bold dark:text-white"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          )}

          {/* STEP 2: NEW PASSWORD INPUT */}
          {step === 2 && (
            <form onSubmit={updatePassword} className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm font-bold dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm font-bold dark:text-white"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS MESSAGE */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
              <h2 className="text-lg font-black text-black dark:text-white uppercase italic">Password Reset Done!</h2>
              <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                Your security credentials have been updated successfully.
              </p>
              <Link href="/login" className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 transition-transform active:scale-95">
                Back to Login
              </Link>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
              <Link href="/login" className="text-[10px] font-black text-zinc-400 hover:text-orange-600 transition-colors uppercase tracking-[0.2em]">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}