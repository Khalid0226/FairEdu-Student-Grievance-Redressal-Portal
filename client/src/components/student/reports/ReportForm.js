'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, Clock, MapPin, Users, 
  ChevronRight, ChevronLeft, CheckCircle2, 
  ShieldCheck, AlertTriangle, Send, LogIn
} from 'lucide-react';

export default function ReportForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  
  const [formData, setFormData] = useState({
    incidentType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    involved: '',
    severity: 'medium',
    anonymous: true,
  });

  const router = useRouter();

  // Component load hote hi check karein ki token hai ya nahi
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedOut(true);
      setError("Session missing: Please login to submit a report.");
    }
  }, []);

  const incidentTypes = [
    'Verbal Abuse', 'Physical Harassment', 'Mental Harassment',
    'Cyber Bullying', 'Financial Exploitation', 'Academic Interference',
    'Social Boycott', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    // Safety Check: Token missing validation
    if (!token) {
      setError("Authentication failed: No token found. Please login again.");
      setLoading(false);
      return;
    }

    const payload = {
      incident_type: formData.incidentType,
      incident_date: formData.date,
      incident_time: formData.time,
      location: formData.location,
      description: formData.description,
      severity: formData.severity,
      is_anonymous: formData.anonymous,
      involved_parties: formData.involved || "Not specified"
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/student/submit-incident/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token.trim()}`, // Added trim to remove accidental spaces
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Report submitted successfully!');
        router.push('/student');
      } else {
        // Agar Django 401/403 de raha hai toh data.detail dikhao
        setError(data.detail || JSON.stringify(data));
        if(response.status === 401) setIsLoggedOut(true);
      }
    } catch (err) {
      setError('Connection failed. Please check if backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Basic Info", icon: <MapPin size={18} /> },
    { title: "Details", icon: <AlertCircle size={18} /> },
    { title: "Privacy", icon: <ShieldCheck size={18} /> },
    { title: "Review", icon: <CheckCircle2 size={18} /> }
  ];

  if (isLoggedOut && step === 4) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center border border-red-100">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Session Expired</h2>
        <p className="text-gray-500 mb-6">Aap login nahi hain. Bina login ke report submit nahi ho sakti.</p>
        <button onClick={() => router.push('/login')} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <LogIn size={20} /> Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* --- Stepper Header --- */}
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0" />
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                step > i + 1 ? 'bg-green-500 text-white' : 
                step === i + 1 ? 'bg-orange-500 text-white scale-110 ring-4 ring-orange-100' : 
                'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200'
              }`}>
                {step > i + 1 ? <CheckCircle2 size={20} /> : s.icon}
              </div>
              <span className={`mt-2 text-[10px] md:text-xs font-bold ${step >= i + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Main Form Card --- */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500">
        
        {error && (
          <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl">
            <AlertTriangle className="shrink-0" size={20} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><MapPin size={20} /></div>
                <h3 className="text-xl font-bold">Primary Incident Info</h3>
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Type of Incident *</label>
                <select name="incidentType" value={formData.incidentType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all" required>
                  <option value="">Select Category</option>
                  {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"><Clock size={14}/> Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"><Clock size={14}/> Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Specific Location *</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Canteen Area, Library 2nd Floor" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><AlertCircle size={20} /></div>
                <h3 className="text-xl font-bold">Describe what happened</h3>
              </div>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} placeholder="Provide a detailed description of the incident..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"><Users size={16}/> Persons Involved</label>
                <input type="text" name="involved" value={formData.involved} onChange={handleInputChange} placeholder="Names or descriptions of people" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 py-4 animate-in fade-in slide-in-from-right-4 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-bold">Privacy Selection</h3>
              <div 
                onClick={() => setFormData({...formData, anonymous: !formData.anonymous})}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  formData.anonymous ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`p-3 rounded-full transition-colors ${formData.anonymous ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                    <Users size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold">Anonymity Mode</h4>
                    <p className="text-xs text-gray-500">Your identity will not be shared with anyone.</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.anonymous ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                   {formData.anonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-center">Final Review</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 space-y-4 border border-gray-100 dark:border-gray-700 shadow-inner">
                <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 text-sm">Nature of Incident</span>
                  <span className="font-bold text-orange-600 text-sm uppercase">{formData.incidentType || 'Not Selected'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 text-sm">Location</span>
                  <span className="font-bold text-sm">{formData.location || 'Not Specified'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 text-sm">Timing</span>
                  <span className="font-bold text-sm">{formData.date} | {formData.time}</span>
                </div>
                <div className="pt-2">
                  <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Details Preview</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 line-clamp-2">
                    {formData.description ? `"${formData.description}"` : 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Action Buttons --- */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={prevStep} disabled={step === 1 || loading} className="px-6 py-2.5 flex items-center gap-2 font-bold text-gray-500 hover:text-gray-900 disabled:opacity-0 transition-all">
            <ChevronLeft size={20} /> Back
          </button>
          
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95">
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button type="submit" disabled={loading || isLoggedOut} className="bg-red-500 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-red-200 hover:bg-red-600 disabled:opacity-50 transition-all active:scale-95">
              {loading ? 'Submitting...' : 'Submit Report'} <Send size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}