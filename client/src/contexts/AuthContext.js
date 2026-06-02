'use client';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. App Startup: Sync LocalStorage and check for Session
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // CRITICAL: Ensure role is ALWAYS lowercase to prevent 404/STUDENT loops
          if (parsedUser && parsedUser.role) {
            parsedUser.role = parsedUser.role.toLowerCase().trim();
            setUser(parsedUser);
          } else {
            throw new Error("Missing Role");
          }
        }
      } catch (err) {
        console.error("Session Sync Error:", err);
        localStorage.clear();
        setUser(null);
      } finally {
        // App ko render karne ke liye loading band karna zaroori hai
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Optimized Login: Handles data storage and normalization
  const login = useCallback(async (token, userData, role) => {
    try {
      // Step A: Normalize Role (Backend se 'STUDENT' aaye ya 'student', hum lowercase rakhenge)
      const cleanRole = (role || userData?.role || 'student').toLowerCase().trim();
      
      const userWithRole = { 
        ...userData, 
        role: cleanRole,
        full_name: userData?.full_name || userData?.username || 'User'
      };
      
      // Step B: Persistence (LocalStorage updates)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      
      // Step C: Update Global State
      setUser(userWithRole);
      
      return true; 
    } catch (error) {
      console.error("Login Context Error:", error);
      return false;
    }
  }, []);

  // 3. Clear Session and Hard Redirect
  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    // Hard refresh ensures all states are wiped out completely
    window.location.replace('/login');
  }, []);

  // Memoizing the value to prevent unnecessary re-renders of the entire app
  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {/* IMPORTANT: Jab tak loading true hai, Dashboard render nahi hoga.
          Isse woh check (if(!user) redirect) trigger nahi hoga 
          aur loop nahi banega.
      */}
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Verifying System Access...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};