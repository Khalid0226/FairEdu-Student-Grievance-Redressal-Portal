'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm({ onSubmit, error, isLoading, showForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Local state for validation messages
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation Logic
    let errors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      errors.email = "Email address is required";
      isValid = false;
    }
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFieldErrors(errors);

    if (isValid) {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="user_email"
          name="user_email" 
          type="text" 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if(fieldErrors.email) setFieldErrors({...fieldErrors, email: ""});
          }}
          autoComplete="username" 
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-black dark:text-white bg-gray-50 dark:bg-zinc-900 ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500'
          }`}
          placeholder="ansarikhalid8054@gmail.com"
        />
        {fieldErrors.email && (
          <p className="text-[12px] text-red-500 mt-1 ml-1">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="user_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
        </div>
        <input
          id="user_password"
          name="user_password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if(fieldErrors.password) setFieldErrors({...fieldErrors, password: ""});
          }}
          autoComplete="current-password"
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-black dark:text-white bg-gray-50 dark:bg-zinc-900 ${
            fieldErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500'
          }`}
          placeholder="••••••••"
        />
        
        {/* 🟢 Forgot Password Link - Right aligned below input */}
        {showForgot && (
          <div className="flex justify-end mt-2">
            <Link 
              href="/forgot-password" 
              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-tight"
            >
              Forgot Password?
            </Link>
          </div>
        )}

        {fieldErrors.password && (
          <p className="text-[12px] text-red-500 mt-1 ml-1">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Backend/API Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
          <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Authenticating...' : 'Sign in'}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Secure anti-ragging platform
        </p>
      </div>
    </form>
  );
}