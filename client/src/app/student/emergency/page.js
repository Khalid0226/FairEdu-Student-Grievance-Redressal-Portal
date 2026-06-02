'use client';
import { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle, FiTarget, FiWifi, FiMapPin, FiActivity } from 'react-icons/fi';

export default function ClassicEmergency() {
  const [stage, setStage] = useState('IDLE'); // IDLE -> ARMED -> ACTIVE
  const [timer, setTimer] = useState(3);
  
  // REAL-TIME STATES
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState('Locating...');
  const [locationStatus, setLocationStatus] = useState('Initializing...');
  const [battery, setBattery] = useState({ level: 100, isCharging: false });
  const [userId, setUserId] = useState('FETCHING...');

  // 1. Coordinates se Address Name nikaalne ka function
  const getAddressName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const area = data.address.suburb || data.address.neighbourhood || data.address.road || data.address.city || "Area Identified";
      setAddress(area.toUpperCase());
    } catch (error) {
      setAddress("STATION ACTIVE");
    }
  };

  // 2. SOS Trigger Function (Backend Integration Updated URL & Auth)
  const triggerSOS = async (currentCoords, currentAddress) => {
    try {
      // Token fetch and cleanup (quotes removal)
      const rawToken = localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/"/g, "") : null;

      const response = await fetch('http://127.0.0.1:8000/api/student/sos/trigger/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}` // CHANGED: Bearer to Token for Django compatibility
        },
        body: JSON.stringify({
          lat: currentCoords.lat,
          long: currentCoords.lng, 
          address: currentAddress
        })
      });

      if (response.ok) {
        console.log("SOS Message sent to College Chat successfully!");
      } else {
        const errorData = await response.text();
        console.error("Server Error:", errorData);
      }
    } catch (error) {
      console.error("Failed to trigger SOS:", error);
    }
  };

  // 3. Fetch Real Data on Mount
  useEffect(() => {
    const randomId = 'USR-' + Math.floor(1000 + Math.random() * 9000);
    setUserId(randomId);

    if (navigator.getBattery) {
      navigator.getBattery().then((batt) => {
        const updateBattery = () => {
          setBattery({
            level: Math.round(batt.level * 100),
            isCharging: batt.charging
          });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
      });
    }

    if (!navigator.geolocation) {
      setLocationStatus('Not Supported');
      return;
    }

    const onSuccess = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
      setLocationStatus('Fixed');
      getAddressName(lat, lng);
    };

    const onError = () => {
      setLocationStatus('Denied');
      setAddress("ACCESS DENIED");
    };

    const watcher = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // 4. Initiate Armed with Auto-Trigger
  const initiateArmed = () => {
    setStage('ARMED');
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setTimer(count);
      if (count === 0) {
        clearInterval(interval);
        setStage('ACTIVE');
        triggerSOS(coords, address);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 p-6 md:p-12 transition-colors duration-500 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-start mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${stage === 'ACTIVE' ? 'bg-red-500 animate-ping' : 'bg-orange-500'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Emergency Protocol 7.1</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Response <span className="text-zinc-400">Hub</span></h1>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-8 text-right">
            <TelemetryItem icon={<FiWifi />} label="Signal" value="Encrypted" />
            <TelemetryItem icon={<FiTarget />} label="Accuracy" value="Live" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: LIVE TELEMETRY */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Device Telemetry</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase italic">
                  <span>Battery</span> 
                  <span className={battery.level < 20 ? 'text-red-500' : ''}>
                    {battery.isCharging ? '⚡' : ''} {battery.level}%
                  </span>
                </div>
                <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${battery.level < 20 ? 'bg-red-500' : 'bg-orange-500'}`} 
                    style={{ width: `${battery.level}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase italic pt-2">
                  <span>GPS Lock</span> 
                  <span className={locationStatus === 'Fixed' ? 'text-green-500' : 'text-red-500'}>
                    {locationStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: ACTION CORE */}
          <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
            <div className="relative group">
              <div className={`absolute -inset-8 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 ${stage !== 'IDLE' ? 'animate-[spin_10s_linear_infinite] border-orange-500/50' : ''}`}></div>

              <button 
                onClick={stage === 'IDLE' ? initiateArmed : null}
                className={`
                  relative w-72 h-72 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-700
                  ${stage === 'IDLE' ? 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl hover:border-orange-500' : 
                    stage === 'ARMED' ? 'bg-orange-500 text-white scale-95' : 
                    'bg-red-600 text-white shadow-[0_0_80px_rgba(220,38,38,0.3)]'}
                `}
              >
                {stage === 'IDLE' && (
                  <>
                    <FiAlertTriangle size={40} className="text-orange-500 mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Initiate</span>
                    <span className="text-6xl font-black italic uppercase tracking-tighter">SOS</span>
                  </>
                )}
                {stage === 'ARMED' && (
                  <>
                    <span className="text-8xl font-black italic">{timer}</span>
                    <span className="text-xs font-black uppercase tracking-[0.3em] mt-2">Aborting in...</span>
                  </>
                )}
                {stage === 'ACTIVE' && (
                  <>
                    <FiShield size={60} className="animate-bounce" />
                    <span className="text-xl font-black italic uppercase tracking-tighter mt-4">Alert Sent</span>
                    <span className="text-[10px] font-bold opacity-60">LOCATION SHARED WITH COLLEGE</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="mt-12 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.6em] text-center italic">
              Strictly for Security Emergencies
            </p>
          </div>

          {/* RIGHT: TACTICAL CONTACTS */}
          <div className="lg:col-span-3 space-y-6 order-3">
            <div className="p-8 rounded-[2.5rem] bg-orange-500 text-white shadow-xl shadow-orange-500/20 group hover:scale-[1.02] transition-all cursor-pointer">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic mb-2">Primary Line</p>
              <h4 className="text-2xl font-black italic tracking-tighter leading-none">Security HQ</h4>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full">
                <FiActivity size={12} /> Live
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 italic">Nearest Node</h3>
              <p className="text-xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase leading-tight">
                {address}
              </p>
              <p className="text-[10px] font-bold text-zinc-500 mt-2">EST. RESPONSE: 04:20 MINS</p>
            </div>
          </div>

        </div>

        {/* BOTTOM LOGS SECTION */}
        <div className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <FooterInfo label="Protocol" value="End-to-End" />
            <FooterInfo label="Coordinates" value={coords.lat ? `${coords.lat}, ${coords.lng}` : 'FETCHING...'} />
            <FooterInfo label="ID" value={userId} />
            <FooterInfo label="System Status" value={stage === 'ACTIVE' ? 'DISPATCHED' : 'READY'} />
        </div>
      </div>
    </div>
  );
}

function TelemetryItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-black italic uppercase tracking-tighter text-orange-500">{value}</p>
    </div>
  );
}

function FooterInfo({ label, value }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-zinc-500 truncate">{value}</p>
    </div>
  );
}