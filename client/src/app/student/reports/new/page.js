'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaCamera, FaMicrophone, FaVideo, FaShieldAlt, 
  FaCheckCircle, FaInfoCircle, FaArrowRight, FaArrowLeft,
  FaMapMarkerAlt, FaCalendarAlt, FaClock, FaExclamationTriangle, FaUsers
} from 'react-icons/fa';

export default function NewReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🟢 Get today's date in YYYY-MM-DD format to disable future dates
  const today = new Date().toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState({
    incident_type: '',
    incident_date: '',
    incident_time: '',
    location: '',
    description: '',
    severity: 'medium',
    is_anonymous: false,
    involved_parties: '',
  });

  // Files State
  const [files, setFiles] = useState({
    evidence_image: null,
    evidence_video: null,
    evidence_audio: null,
  });

  // Navigation Handlers
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles && uploadedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
    }
  };

  // ✅ UPDATED TO MATCH YOUR student/urls.py
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token'); 
      
      if (!token) {
        alert("Session expired! Please login again.");
        router.push('/login');
        return;
      }

      const data = new FormData();
      
      // Text data append
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Files append
      if (files.evidence_image) data.append('evidence_image', files.evidence_image);
      if (files.evidence_video) data.append('evidence_video', files.evidence_video);
      if (files.evidence_audio) data.append('evidence_audio', files.evidence_audio);

      // --- URL UPDATED HERE ---
      const response = await fetch('http://127.0.0.1:8000/api/student/submit-incident/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setIsSuccess(true);
      } else {
        console.error("Backend Error:", result);
        alert(`❌ Error: ${result.message || "Failed to submit report"}`);
      }
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Connection Error: Check if your Django server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Component: Success Screen ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 max-w-sm w-full text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            <FaCheckCircle />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-800">Report Sent!</h2>
          <p className="text-gray-500 mt-2 font-bold text-sm">Your report has been saved to the database successfully.</p>
          <button 
            onClick={() => { setIsSuccess(false); setStep(1); }} 
            className="mt-8 w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-orange-600 transition-all"
          >
            Create New Report
          </button>
        </div>
      </div>
    );
  }

  // --- UI Component: Stepper ---
  const Stepper = () => (
    <div className="flex items-center justify-between mb-10 max-w-xl mx-auto relative px-4">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="z-10 flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
            step >= num ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-2 border-gray-100 text-gray-300'
          }`}>
            {step > num ? <FaCheckCircle className="text-lg" /> : num}
          </div>
          <span className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${step >= num ? 'text-gray-700' : 'text-gray-300'}`}>
            {num === 1 ? 'Basic' : num === 2 ? 'Details' : num === 3 ? 'Privacy' : 'Review'}
          </span>
        </div>
      ))}
      <div className="absolute top-5 left-10 right-10 h-[2px] bg-gray-100 -z-0" />
      <div 
        className="absolute top-5 left-10 h-[2px] bg-orange-500 transition-all duration-500 -z-0" 
        style={{ width: `${(step - 1) * 33}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-10">
      <div className="max-w-2xl mx-auto py-4">
        <Stepper />

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl p-8 min-h-[550px] flex flex-col justify-between transition-all">
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FaInfoCircle /></div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Incident Basics</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Type of Incident *</label>
                  <select name="incident_type" required value={formData.incident_type} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-orange-500">
                    <option value="">Select Category</option>
                    <option value="Physical Ragging">Physical Ragging / Assault</option>
                    <option value="Verbal Abuse">Verbal Abuse / Insults</option>
                    <option value="Cyber Bullying">Cyber Bullying / Online Threats</option>
                    <option value="Sexual Harassment">Sexual Harassment</option>
                    <option value="Financial Extortion">Financial Extortion (Money)</option>
                    <option value="Forced Substance Use">Forced Alcohol/Substance Use</option>
                    <option value="Property Damage">Hostel/Property Damage</option>
                    <option value="Other">Other Serious Misconduct</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><FaCalendarAlt size={8}/> Date</label>
                    <input 
                      type="date" 
                      name="incident_date" 
                      required 
                      value={formData.incident_date} 
                      onChange={handleChange} 
                      max={today} 
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><FaClock size={8}/> Time</label>
                    <input type="time" name="incident_time" value={formData.incident_time} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><FaMapMarkerAlt size={8}/> Specific Location *</label>
                  <input type="text" name="location" value={formData.location} placeholder="e.g. Canteen, Hostel Block B" required onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <button type="button" onClick={nextStep} disabled={!formData.incident_type || !formData.location} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 shadow-lg transition-all disabled:opacity-50">
                Continue <FaArrowRight />
              </button>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FaExclamationTriangle /></div> Incident Details
              </h2>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'critical'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                        formData.severity === level 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md' 
                        : 'bg-transparent border-gray-100 text-gray-400 hover:border-orange-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><FaUsers className="text-orange-500"/> Involved Persons</label>
                <input 
                  type="text" 
                  name="involved_parties" 
                  value={formData.involved_parties}
                  onChange={handleChange}
                  placeholder="Names or description of culprits..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-orange-500" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description *</label>
                <textarea name="description" value={formData.description} rows="3" required onChange={handleChange} placeholder="Describe the event..." className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[24px] p-4 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Evidence</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`cursor-pointer p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${files.evidence_image ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                    <input type="file" name="evidence_image" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <FaCamera size={16} className={files.evidence_image ? 'text-green-500' : 'text-gray-400'} />
                    <span className="text-[8px] font-black mt-1">PHOTO</span>
                  </label>
                  <label className={`cursor-pointer p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${files.evidence_video ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                    <input type="file" name="evidence_video" accept="video/*" onChange={handleFileChange} className="hidden" />
                    <FaVideo size={16} className={files.evidence_video ? 'text-blue-500' : 'text-gray-400'} />
                    <span className="text-[8px] font-black mt-1">VIDEO</span>
                  </label>
                  <label className={`cursor-pointer p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${files.evidence_audio ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}>
                    <input type="file" name="evidence_audio" accept="audio/*" onChange={handleFileChange} className="hidden" />
                    <FaMicrophone size={16} className={files.evidence_audio ? 'text-purple-500' : 'text-gray-400'} />
                    <span className="text-[8px] font-black mt-1">AUDIO</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={prevStep} className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100"><FaArrowLeft /> Back</button>
                <button type="button" onClick={nextStep} disabled={!formData.description} className="flex-[2] bg-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 shadow-lg">Continue <FaArrowRight /></button>
              </div>
            </div>
          )}

          {/* STEP 3: PRIVACY */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 py-6 text-center">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 border-4 border-white shadow-xl">
                <FaShieldAlt />
              </div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Privacy Mode</h2>
              
              <div 
                onClick={() => setFormData(p => ({...p, is_anonymous: !p.is_anonymous}))}
                className={`p-6 rounded-[28px] border-2 transition-all cursor-pointer ${formData.is_anonymous ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-gray-100 hover:border-orange-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`p-4 rounded-2xl ${formData.is_anonymous ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <FaShieldAlt size={20} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-sm">Anonymous Report</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Identity hidden from college authorities</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_anonymous ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                     {formData.is_anonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={prevStep} className="flex-1 bg-gray-50 text-gray-500 font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100">Back</button>
                <button type="button" onClick={nextStep} className="flex-[2] bg-orange-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 shadow-lg">Review <FaArrowRight /></button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <h2 className="text-xl font-black text-center text-gray-800 dark:text-white uppercase tracking-tighter">Final Review</h2>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[32px] p-6 space-y-4 border border-gray-100 dark:border-gray-700 shadow-inner text-left">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nature</span>
                  <span className="text-[11px] font-black text-orange-600 uppercase">{formData.incident_type}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Involved</span>
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase truncate max-w-[150px]">{formData.involved_parties || 'Not Listed'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Severity</span>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${formData.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{formData.severity}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privacy</span>
                  <span className="text-[10px] font-black text-gray-700 uppercase">{formData.is_anonymous ? '🔒 Anonymous' : '👤 Public'}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1 tracking-widest">Summary Preview</span>
                  <p className="text-[11px] text-gray-500 italic leading-relaxed line-clamp-2">"{formData.description}"</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={prevStep} disabled={isSubmitting} className="flex-1 bg-gray-50 text-gray-500 font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">Edit</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`flex-[2] text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Confirm Submission 🚀</>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}