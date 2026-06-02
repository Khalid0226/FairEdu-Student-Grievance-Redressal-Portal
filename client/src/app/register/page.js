'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    idNumber: '', 
  });

  // 🔴 Errors state for professional validation
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = "Full name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email";
    }

    if (!formData.idNumber.trim()) tempErrors.idNumber = "Enrollment number is required";
    if (!formData.password.trim()) tempErrors.password = "Password is required";
    else if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Stop if validation fails

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/student/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          id_number: formData.idNumber,
          password: formData.password,
          role: 'student'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please Login.");
        router.push('/login');
      } else {
        alert("Error: " + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Backend server se connect nahi ho pa raha. Check if Django is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full bg-gray-50 dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-black dark:text-white mb-2 text-center">Student Register</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Join the Anti-Ragging Platform</p>

        {/* noValidate turns off default browser tooltips */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" noValidate>
          
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              className={`w-full p-3 rounded-xl bg-white dark:bg-black border ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} text-black dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
              onChange={(e) => {
                setFormData({...formData, fullName: e.target.value});
                if (errors.fullName) setErrors({...errors, fullName: ""});
              }}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              className={`w-full p-3 rounded-xl bg-white dark:bg-black border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} text-black dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value});
                if (errors.email) setErrors({...errors, email: ""});
              }}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Enrollment Number */}
          <div>
            <input
              type="text"
              name="enrollment_no"
              placeholder="Enrollment Number"
              className={`w-full p-3 rounded-xl bg-white dark:bg-black border ${errors.idNumber ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} text-black dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
              onChange={(e) => {
                setFormData({...formData, idNumber: e.target.value});
                if (errors.idNumber) setErrors({...errors, idNumber: ""});
              }}
            />
            {errors.idNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.idNumber}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`w-full p-3 rounded-xl bg-white dark:bg-black border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} text-black dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
              onChange={(e) => {
                setFormData({...formData, password: e.target.value});
                if (errors.password) setErrors({...errors, password: ""});
              }}
              autoComplete="new-password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Registering...
              </span>
            ) : 'Register Now'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account? {' '}
          <button 
            onClick={() => router.push('/login')} 
            className="text-orange-500 font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}