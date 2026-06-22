import React, { useState, useEffect, useRef } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { 
  Heart, 
  Database, 
  Activity, 
  RefreshCw, 
  ClipboardList, 
  Map, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Play, 
  Send, 
  Plus, 
  ShieldAlert, 
  CheckSquare, 
  XCircle, 
  Clock,
  ArrowRight,
  Info,
  MapPin,
  Building2,
  FileText,
  UserCheck,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bloodlinkLogo from '../assets/bloodlinks_logo/bloodlink-logo.png';

export default function AdminDashboard() {
  // Zustand State
  const donors = useBloodStore((state) => state.donors);
  const inventory = useBloodStore((state) => state.inventory);
  const bloodRequests = useBloodStore((state) => state.bloodRequests);
  const smsLogs = useBloodStore((state) => state.smsLogs);
  const accountFlagged = useBloodStore((state) => state.accountFlagged);
  const arrivedAtFacility = useBloodStore((state) => state.arrivedAtFacility);
  const updateBloodRequestStatus = useBloodStore((state) => state.updateBloodRequestStatus);
  const updateInventoryUnits = useBloodStore((state) => state.updateInventoryUnits);
  const setFlaggedStatus = useBloodStore((state) => state.setFlaggedStatus);

  // Mobilization Simulation Hooks
  const mobilizeFlowStep = useBloodStore((state) => state.mobilizeFlowStep);
  const mobilizeTarget = useBloodStore((state) => state.mobilizeTarget);
  const mobilizeFacility = useBloodStore((state) => state.mobilizeFacility);
  const scanProgress = useBloodStore((state) => state.scanProgress);
  const scannedCount = useBloodStore((state) => state.scannedCount);
  const matchedCount = useBloodStore((state) => state.matchedCount);
  const criteriaChecked = useBloodStore((state) => state.criteriaChecked);
  const totalConfirmed = useBloodStore((state) => state.totalConfirmed);
  const currentPhase = useBloodStore((state) => state.currentPhase);
  
  const triggerMobilization = useBloodStore((state) => state.triggerMobilization);
  const setMobilizeFlowStep = useBloodStore((state) => state.setMobilizeFlowStep);
  const setScanProgress = useBloodStore((state) => state.setScanProgress);
  const setPhaseDetails = useBloodStore((state) => state.setPhaseDetails);
  const dispatchSMSLog = useBloodStore((state) => state.dispatchSMSLog);
  const resetMobilization = useBloodStore((state) => state.resetMobilization);

  // Local UI State
  const [tab, setTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestNote, setSelectedRequestNote] = useState('');
  const [selectedRequestRef, setSelectedRequestRef] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [reEligibilityScanning, setReEligibilityScanning] = useState(false);
  const [reEligibilityComplete, setReEligibilityComplete] = useState(false);
  const [reEligibilityCount, setReEligibilityCount] = useState(0);

  // Map References
  const mobMapRef = useRef(null);
  const mobMapInstance = useRef(null);
  const densityMapRef = useRef(null);
  const densityMapInstance = useRef(null);

  // Derived state
  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const criticalCount = inventory.filter((item) => item.status === 'critical').length;
  const pendingRequests = bloodRequests.filter((r) => r.status === 'Pending').length;

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    inventory: 'Blood Inventory Management',
    mobilize: 'Donor Mobilization Control',
    reeligibility: 'Re-Eligibility Database Scan',
    turnout: 'Donor Turnout Log',
    donormap: 'Geographic Donor Density Map',
    donors: 'Davao City Donor Registry',
    smslog: 'Semaphore SMS Transaction Log',
    bloodrequests: 'Hospital Blood Release Pre-Submissions'
  };

  const tabSubs = {
    dashboard: 'Real-time blood stock metrics and simulation shortcuts',
    inventory: 'Monitor blood bag levels and adjust safety thresholds',
    mobilize: 'Trigger matching algorithm and geographic expansion dispatches',
    reeligibility: 'Identify donors who completed their 90-day rest interval',
    turnout: 'Monitor registered donor arrivals at SPMC Blood Bank',
    donormap: 'Inspect geographical clusters of donors across Davao City',
    donors: 'Manage donor profiles, validation, and privacy permissions',
    smslog: 'SMS gateway tracking and delivery statistics',
    bloodrequests: 'Inspect attesting physician signatures and process releases'
  };

  // Timeline Response Graph Data (Recharts)
  const timelineData = [
    { time: '0m', confirmed: 0 },
    { time: '15m', confirmed: 3 },
    { time: '30m', confirmed: 7 },
    { time: '45m', confirmed: 12 },
    { time: '60m', confirmed: 14 },
    { time: '75m', confirmed: 16 },
    { time: '90m', confirmed: 20 },
    { time: '105m', confirmed: 22 },
    { time: '120m', confirmed: 24 },
    { time: '135m', confirmed: totalConfirmed }
  ];

  // Matched Donors for table display (Maria Santos ranked 1st due to nearest location 1.2km)
  const matchedDonors = donors.filter(d => d.bloodType === 'O-').sort((a,b) => parseFloat(a.distance) - parseFloat(b.distance));

  // Run database scanning simulation (Aho-Corasick matching)
  useEffect(() => {
    let scanInterval;

    if (mobilizeFlowStep === 1) {
      let currentScanned = 0;
      let currentMatched = 0;

      scanInterval = setInterval(() => {
        currentScanned += 43;
        if (currentScanned >= 1247) {
          currentScanned = 1247;
          clearInterval(scanInterval);
          
          setTimeout(() => {
            setScanProgress(100, 1247, currentMatched, 1);
            setTimeout(() => {
              setScanProgress(100, 1247, currentMatched, 2);
              setTimeout(() => {
                setScanProgress(100, 1247, currentMatched, 3);
                setTimeout(() => {
                  setMobilizeFlowStep(2); // Proceed to SMS gateway
                  
                  matchedDonors.forEach((d) => {
                    const initials = d.name.split(' ').map(n=>n[0]).join('');
                    const color = d.name.includes('Santos') ? '#3B82F6' : '#10B981';
                    const msg = `🩸 URGENT O- BLOOD NEEDED at SPMC Blood Production Services. Distance: ${d.distance}. You last donated 4 months ago and are eligible. Can you donate today? Reply YES to confirm.`;
                    dispatchSMSLog(d.name, d.phone, msg, color, initials);
                  });
                }, 800);
              }, 500);
            }, 500);
          }, 500);
        }

        if (currentMatched < 47) {
          currentMatched += 2;
          if (currentMatched > 47) currentMatched = 47;
        }

        setScanProgress(Math.round((currentScanned / 1247) * 100), currentScanned, currentMatched, 0);
      }, 100);
    }

    return () => {
      clearInterval(scanInterval);
    };
  }, [mobilizeFlowStep]);

  // Leaflet map render for Mobilization Step 3
  useEffect(() => {
    if (tab === 'mobilize' && mobilizeFlowStep === 3 && mobMapRef.current) {
      if (mobMapInstance.current) {
        mobMapInstance.current.remove();
        mobMapInstance.current = null;
      }

      const map = L.map(mobMapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([7.0731, 125.6128], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const spmcIcon = L.divIcon({
        className: 'mob-spmc-icon',
        html: `<div style="background-color: #C21C24; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([7.0731, 125.6128], { icon: spmcIcon })
        .bindPopup('<b>SPMC Blood Production Services</b><br>Target facility')
        .addTo(map);

      mobMapInstance.current = map;

      // Draw Phase 1 circle (2km)
      const circle1 = L.circle([7.0731, 125.6128], {
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        radius: 2000
      }).addTo(map);

      const donorIcon = L.divIcon({
        className: 'mob-donor-icon',
        html: `<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      L.marker([7.0822, 125.6210], { icon: donorIcon }).bindPopup('<b>Maria C. Santos</b><br>Confirmed (1.2 km)').addTo(map);

      for(let i=0; i<8; i++) {
        const lat = 7.0731 + (Math.random() - 0.5) * 0.02;
        const lng = 125.6128 + (Math.random() - 0.5) * 0.02;
        L.marker([lat, lng], { icon: donorIcon }).bindPopup('Donor confirmed').addTo(map);
      }

      const t1 = setTimeout(() => {
        setPhaseDetails(2, arrivedAtFacility ? 21 : 20);
        L.circle([7.0731, 125.6128], {
          color: '#F59E0B',
          fillColor: '#F59E0B',
          fillOpacity: 0.04,
          radius: 10000
        }).addTo(map);
        
        map.setView([7.0731, 125.6128], 11);

        for(let i=0; i<8; i++) {
          const lat = 7.0731 + (Math.random() - 0.5) * 0.08;
          const lng = 125.6128 + (Math.random() - 0.5) * 0.08;
          L.marker([lat, lng], { icon: donorIcon }).bindPopup('Donor confirmed').addTo(map);
        }
      }, 4000);

      const t2 = setTimeout(() => {
        setPhaseDetails(3, arrivedAtFacility ? 26 : 25);
        
        const compIcon = L.divIcon({
          className: 'mob-comp-icon',
          html: `<div style="background-color: #8B5CF6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        for(let i=0; i<5; i++) {
          const lat = 7.0731 + (Math.random() - 0.5) * 0.09;
          const lng = 125.6128 + (Math.random() - 0.5) * 0.09;
          L.marker([lat, lng], { icon: compIcon }).bindPopup('Compatible donor confirmed').addTo(map);
        }
      }, 7500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [tab, mobilizeFlowStep]);

  // Leaflet map render for General Donor Density map
  const initDonorMap = () => {
    if (densityMapRef.current) {
      if (densityMapInstance.current) {
        densityMapInstance.current.remove();
        densityMapInstance.current = null;
      }

      const map = L.map(densityMapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([7.0731, 125.6128], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const banks = [
        { name: 'SPMC Blood Services', coords: [7.0731, 125.6128], color: '#C21C24' },
        { name: 'Philippine Red Cross', coords: [7.0601, 125.6105], color: '#E11D48' },
        { name: 'SNBC Mindanao Compound', coords: [7.0755, 125.6140], color: '#2563EB' }
      ];

      banks.forEach((b) => {
        const bankIcon = L.divIcon({
          className: 'density-bank-icon',
          html: `<div style="background-color: ${b.color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker(b.coords, { icon: bankIcon }).bindPopup(`<b>${b.name}</b>`).addTo(map);
      });

      const donorPoints = [
        [7.0822, 125.6210], 
        [7.0850, 125.6190],
        [7.0910, 125.6310],
        [7.0510, 125.5920], 
        [7.0480, 125.5960],
        [7.0390, 125.5890],
        [7.0210, 125.5610], 
        [7.1110, 125.6450], 
        [7.1250, 125.6510],
        [7.0620, 125.5780], 
        [7.0680, 125.5810]
      ];

      const dotIcon = L.divIcon({
        className: 'density-dot-icon',
        html: `<div style="background-color: #10B981; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.25);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      donorPoints.forEach((pt) => {
        L.marker(pt, { icon: dotIcon }).addTo(map);
      });

      densityMapInstance.current = map;
    }
  };

  // Re-Eligibility Scanner simulation
  const runReEligibilityScan = () => {
    setReEligibilityScanning(true);
    setReEligibilityComplete(false);
    
    setTimeout(() => {
      setReEligibilityScanning(false);
      setReEligibilityComplete(true);
      setReEligibilityCount(18); 
    }, 2500);
  };

  const dispatchEligibilityReminders = () => {
    dispatchSMSLog(
      'Roberto T. Garcia', 
      '+63 920 456 7890', 
      'Hello Roberto. Your 90-day donation interval is complete! You are eligible to donate blood again. Visit bloodlinkdvo.ph to learn more.', 
      '#8B5CF6', 
      'RG'
    );
    alert('SMS reminders sent successfully via Semaphore Philippine Gateway!');
    setReEligibilityComplete(false);
  };

  const handleRequestAction = (refNo, status) => {
    setSelectedRequestRef(refNo);
    if (status === 'Declined' || status === 'Fulfilled' || status === 'Processing') {
      setSelectedRequestNote('');
      setShowNoteModal(true);
    } else {
      updateBloodRequestStatus(refNo, status);
    }
  };

  const saveRequestStatusWithNote = () => {
    updateBloodRequestStatus(selectedRequestRef, 'Processing', selectedRequestNote);
    setShowNoteModal(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* SIDEBAR NAVIGATION (CLEAN SAAS DIVIDER STYLE) */}
      <aside className="sidebar flex flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          {/* Logo Section */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={bloodlinkLogo} alt="BloodLink" className="h-10 w-auto object-contain flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-900 tracking-tight leading-tight">BloodLink</p>
                <p className="text-[#C21C24] text-[10px] font-bold">Center Portal</p>
              </div>
            </div>
          </div>
          
          {/* User Identity Panel */}
          <div className="mx-4 mt-4 mb-2 bg-slate-50 border border-slate-200/60 rounded-lg p-3">
            <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-0.5">Facility Desk</p>
            <p className="text-slate-800 font-bold text-xs">SPMC Blood Production</p>
            <p className="text-slate-500 text-[10px] font-medium">Operations Desk</p>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="flex-1 py-2">
            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-3 mb-1 tracking-widest">General</p>
            
            <button onClick={() => setTab('dashboard')} className={`w-full text-left nav-link ${tab === 'dashboard' ? 'active' : ''}`}>
              <Database className="nav-icon" />
              <span>Dashboard</span>
            </button>
            
            <button onClick={() => setTab('inventory')} className={`w-full text-left nav-link ${tab === 'inventory' ? 'active' : ''}`}>
              <Heart className="nav-icon" />
              <span>Blood Inventory</span>
              {criticalCount > 0 && (
                <span className="ml-auto bg-[#C21C24] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {criticalCount}
                </span>
              )}
            </button>

            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-4 mb-1 tracking-widest">Operations</p>
            
            <button onClick={() => setTab('mobilize')} className={`w-full text-left nav-link ${tab === 'mobilize' ? 'active' : ''}`}>
              <Activity className="nav-icon" />
              <span>Mobilization</span>
              {mobilizeFlowStep > 0 && mobilizeFlowStep < 4 && (
                <span className="ml-auto w-1.5 h-1.5 bg-[#C21C24] rounded-full"></span>
              )}
            </button>
            
            <button onClick={() => setTab('reeligibility')} className={`w-full text-left nav-link ${tab === 'reeligibility' ? 'active' : ''}`}>
              <RefreshCw className="nav-icon" />
              <span>Re-Eligibility Scan</span>
            </button>
            
            <button onClick={() => setTab('turnout')} className={`w-full text-left nav-link ${tab === 'turnout' ? 'active' : ''}`}>
              <ClipboardList className="nav-icon" />
              <span>Donor Turnout</span>
            </button>

            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-4 mb-1 tracking-widest">Records</p>
            
            <button onClick={() => { setTab('donormap'); setTimeout(()=>initDonorMap(), 100); }} className={`w-full text-left nav-link ${tab === 'donormap' ? 'active' : ''}`}>
              <Map className="nav-icon" />
              <span>Density Map</span>
            </button>
            
            <button onClick={() => setTab('donors')} className={`w-full text-left nav-link ${tab === 'donors' ? 'active' : ''}`}>
              <Users className="nav-icon" />
              <span>Donor Registry</span>
            </button>
            
            <button onClick={() => setTab('smslog')} className={`w-full text-left nav-link ${tab === 'smslog' ? 'active' : ''}`}>
              <MessageSquare className="nav-icon" />
              <span>SMS Gateway</span>
            </button>
            
            <button onClick={() => setTab('bloodrequests')} className={`w-full text-left nav-link ${tab === 'bloodrequests' ? 'active' : ''}`}>
              <FileText className="nav-icon" />
              <span>Release Referrals</span>
              {pendingRequests > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {pendingRequests}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-slate-100 text-xs text-slate-400">
          <p className="font-mono text-[10px]">Portal v2.4.0</p>
          <div className="flex items-center gap-1 mt-1 text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span>Gateway Connected</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="content-area bg-slate-50/50">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">{tabTitles[tab]}</h1>
            <p className="text-xs text-slate-400 font-medium">{tabSubs[tab]}</p>
          </div>
          <div className="flex items-center gap-4">
            {criticalCount > 0 && (
              <button 
                onClick={() => setTab('mobilize')} 
                className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#C21C24] hover:bg-rose-100/50 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent: O- Stock Critical</span>
              </button>
            )}
            <div className="h-8 w-px bg-slate-200"></div>
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Logout</Link>
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="p-8 flex-1">
          
          {/* TAB: DASHBOARD OVERVIEW */}
          {tab === 'dashboard' && (
            <div className="fade-in space-y-6">
              
              {/* Quick stats grids */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Stock</p>
                  <p className="text-2xl font-extrabold text-slate-900 font-mono">{totalUnits} units</p>
                  <p className="text-[10px] text-slate-450 mt-1 font-semibold">Across all type reserves</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-1">Active Donors</p>
                  <p className="text-2xl font-extrabold text-slate-900 font-mono">1,247</p>
                  <p className="text-[10px] text-slate-450 mt-1 font-semibold">Davao City regional pool</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Critical Deficits</p>
                  <p className="text-2xl font-extrabold text-[#C21C24] font-mono">{criticalCount}</p>
                  <p className="text-[10px] text-slate-450 mt-1 font-semibold">Below safety reserves</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Eligible Pool</p>
                  <p className="text-2xl font-extrabold text-emerald-600 font-mono">312</p>
                  <p className="text-[10px] text-slate-450 mt-1 font-semibold">Ready for dispatch matching</p>
                </div>
              </div>

              {/* Progress stock grids */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Progress Stock Bars */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-5 tracking-tight">Active Reserves vs Safety Thresholds</h3>
                    <div className="space-y-4">
                      {inventory.map((blood) => (
                        <div key={blood.type} className="flex items-center gap-4 text-xs font-semibold">
                          <span className="w-10 font-bold text-slate-900">{blood.type}</span>
                          <div className="flex-grow bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 rounded-full transition-all ${
                                blood.status === 'critical' ? 'bg-[#C21C24]' : blood.status === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min((blood.units / (blood.threshold * 2.5)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`w-16 text-right font-bold text-slate-800`}>{blood.units} units</span>
                          <span className={`w-20 text-[10px] font-bold px-2 py-0.5 rounded text-center border ${
                            blood.status === 'critical' ? 'bg-rose-50 border-rose-100 text-[#C21C24] pulse-red' : 
                            blood.status === 'low' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}>
                            {blood.status === 'critical' ? 'Critical' : blood.status === 'low' ? 'Low' : 'Stable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side Info Cards */}
                <div className="space-y-4">
                  {criticalCount > 0 && (
                    <div className="bg-white border-2 border-rose-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[#C21C24] font-bold text-xs uppercase tracking-wider mb-2">
                          <AlertTriangle className="w-4.5 h-4.5" />
                          <span>Shortage Identified</span>
                        </div>
                        <p className="text-slate-800 font-bold text-sm tracking-tight">O- Negative Supply Deficit</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                          3 units remaining in local storage (safety minimum: 5). Dispatch alerts recommended.
                        </p>
                      </div>
                      <button 
                        onClick={() => { setTab('mobilize'); if (mobilizeFlowStep === 0) triggerMobilization('O-'); }} 
                        className="w-full mt-5 bg-[#C21C24] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition-all shadow-sm"
                      >
                        Initiate Matching Protocol
                      </button>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">Interval Scan Query</h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">18 profiles completed their recovery rest periods today.</p>
                    <button onClick={() => setTab('reeligibility')} className="w-full border border-slate-200 text-slate-650 hover:bg-slate-50 py-2 rounded-lg text-xs font-bold transition-all">
                      Access Database Queries
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">Gateway Telemetry</h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">{smsLogs.length} matching alerts dispatched via Semaphore API today.</p>
                    <button onClick={() => setTab('smslog')} className="w-full border border-slate-200 text-slate-650 hover:bg-slate-50 py-2 rounded-lg text-xs font-bold transition-all">
                      View Dispatch Logs
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: BLOOD INVENTORY */}
          {tab === 'inventory' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Inventory</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Safe Minimum</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Reserves Level</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Status Badge</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Operational Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                  {inventory.map((blood) => (
                    <tr key={blood.type} className={`hover:bg-slate-50/30 transition-colors ${blood.status === 'critical' ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-6 py-4"><span className="text-base font-black text-slate-900 font-mono">{blood.type}</span></td>
                      <td className="px-6 py-4">
                        <span className={`text-base font-bold font-mono ${
                          blood.status === 'critical' ? 'text-[#C21C24]' : blood.status === 'low' ? 'text-amber-600' : 'text-slate-800'
                        }`}>{blood.units}</span>
                        <span className="text-slate-400 font-medium ml-1">units</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{blood.threshold} units</td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              blood.status === 'critical' ? 'bg-[#C21C24]' : blood.status === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((blood.units / (blood.threshold * 2.5)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          blood.status === 'critical' ? 'bg-rose-50 border-rose-100 text-[#C21C24]' : 
                          blood.status === 'low' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          {blood.status === 'critical' ? 'CRITICAL' : blood.status === 'low' ? 'LOWSTOCK' : 'STABLE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(blood.status === 'critical' || blood.status === 'low') ? (
                          <button 
                            onClick={() => { setTab('mobilize'); triggerMobilization(blood.type); }} 
                            className="bg-[#C21C24] text-white text-[10px] px-3 py-1.5 rounded font-bold hover:bg-[#A8181F] transition-all shadow-sm"
                          >
                            Mobilize
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Stable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: DONOR MOBILIZATION CONTROL FLOW */}
          {tab === 'mobilize' && (
            <div className="fade-in space-y-6">
              
              {/* Process indicator steps */}
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 flex items-center gap-4 overflow-x-auto shadow-sm">
                {['Algorithmic Filter Match', 'Semaphore SMS Gateway Dispatch', 'Dynamic Proximity Mapping', 'Consolidated Summary'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0 text-xs font-semibold">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      mobilizeFlowStep > i ? 'bg-emerald-500 text-white' : mobilizeFlowStep === i + 1 ? 'bg-[#C21C24] text-white' : 'bg-slate-100 text-slate-450 border border-slate-200'
                    }`}>
                      {mobilizeFlowStep > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={
                      mobilizeFlowStep === i + 1 ? 'text-[#C21C24] font-bold' : mobilizeFlowStep > i ? 'text-emerald-600' : 'text-slate-400'
                    }>{s}</span>
                    {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                ))}
              </div>

              {/* STEP 0: IDLE STATE */}
              {mobilizeFlowStep === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-2xl mx-auto">
                  <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C21C24]">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Automated Shortage Matching</h2>
                  <p className="text-slate-500 text-xs mb-6 max-w-md mx-auto leading-relaxed">
                    SPMC O- Blood stock is currently below safety thresholds. Run the search sequence to locate qualified proximity-mapped donors in Davao.
                  </p>
                  <button 
                    onClick={() => triggerMobilization('O-')}
                    className="bg-[#C21C24] text-white px-8 py-3 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition-all shadow-sm flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Match & Dispatch sequence</span>
                  </button>
                </div>
              )}

              {/* STEP 1: ALGORITHMIC SCANNING */}
              {mobilizeFlowStep === 1 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Algorithmic Match Engine</span>
                      <h2 className="text-base font-bold text-slate-900 mt-1">Filtering Active Database Profiles</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Processing whole-blood interval requirements sequentially</p>
                    </div>
                    <div className="text-center bg-slate-50 border border-slate-250/60 rounded-xl px-6 py-3 flex-shrink-0">
                      <p className="text-3xl font-extrabold text-slate-800 font-mono">{matchedCount}</p>
                      <p className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mt-0.5">Matched Donors</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between text-xs font-bold text-slate-650 mb-2">
                      <span>Analyzing registry profiles...</span>
                      <span className="font-mono">{scannedCount} / 1,247 scanned</span>
                    </div>
                    <div className="w-full bg-slate-150 rounded-full h-3 overflow-hidden mb-6">
                      <div 
                        className="h-3 rounded-full bg-[#C21C24] transition-all duration-100"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                      <div className={`rounded-xl border p-4 flex flex-col justify-between ${criteriaChecked >= 1 ? 'border-emerald-250 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 text-slate-500'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span>1. Compatibility Filter</span>
                          {criteriaChecked >= 1 && <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">Checks ABO matching tiers.</p>
                      </div>
                      
                      <div className={`rounded-xl border p-4 flex flex-col justify-between ${criteriaChecked >= 2 ? 'border-emerald-250 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 text-slate-500'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span>2. Interval Validation</span>
                          {criteriaChecked >= 2 && <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">Checks 90-day safe intervals.</p>
                      </div>

                      <div className={`rounded-xl border p-4 flex flex-col justify-between ${criteriaChecked >= 3 ? 'border-emerald-250 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 text-slate-500'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span>3. Verification Clearance</span>
                          {criteriaChecked >= 3 && <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">Verifies block/flag holds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DISPATCHED / SMS PREVIEW */}
              {mobilizeFlowStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between text-emerald-800 font-bold text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold tracking-tight">Semaphore Broadcast Dispatched</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-normal">Identified 47 matched O- donors. SMS sequences sent successfully.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMobilizeFlowStep(3)}
                      className="bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded hover:bg-emerald-700 transition-all"
                    >
                      Verify Turnout Maps
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Matched list */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                      <h4 className="font-bold text-slate-900 text-xs mb-4 uppercase tracking-wider">Matched Proximity Pool</h4>
                      <div className="divide-y divide-slate-100 overflow-y-auto flex-grow text-xs text-slate-650">
                        {matchedDonors.map((d, i) => (
                          <div key={i} className="py-3 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{d.name}</p>
                              <p className="text-[10px] text-slate-450 font-mono mt-0.5">{d.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 font-mono">{d.distance}</p>
                              <span className="text-[9px] text-emerald-600 font-bold">Alert Sent</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SMS Preview Logs */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                      <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">SMS Gateway Feed</h4>
                      <p className="text-[10px] text-slate-400 mb-4 font-semibold">Live Semaphore PH dispatch response logs</p>
                      <div className="divide-y divide-slate-100 overflow-y-auto flex-grow space-y-3.5">
                        {smsLogs.slice(0, 10).map((log, i) => (
                          <div key={i} className="pt-3 sms-in text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: log.color }}>
                                  {log.initials}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-905">{log.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono">{log.phone}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">{log.status}</span>
                            </div>
                            <p className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[10px] text-slate-600 leading-relaxed">{log.msg}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: RESPONSE TRACKING (MAP) */}
              {mobilizeFlowStep === 3 && (
                <div className="space-y-6 fade-in">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Response Routing</span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">Geographic Turnout Progress</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Tracking live donor responses and estimated arrivals</p>
                    </div>
                    <div className="text-center bg-slate-50 border border-slate-250/60 rounded-xl px-6 py-2.5 flex-shrink-0">
                      <p className="text-3xl font-extrabold text-slate-800 font-mono">{totalConfirmed}</p>
                      <p className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mt-0.5">Confirmed Turnouts</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* MAP PANEL */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Davao City Response Grid</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#C21C24] rounded-full"></span>SPMC target</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Volunteers</span>
                        </div>
                      </div>
                      <div ref={mobMapRef} id="portalMap"></div>
                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button 
                          onClick={() => setMobilizeFlowStep(4)}
                          className="bg-[#C21C24] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition-all shadow-sm"
                        >
                          Access Turnout Ledger →
                        </button>
                      </div>
                    </div>

                    {/* PHASES PANEL */}
                    <div className="space-y-4">
                      <div className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between ${currentPhase === 1 ? 'border-blue-300 ring-2 ring-blue-50 bg-blue-50/10' : 'border-slate-200/80 opacity-60'}`}>
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <h5 className="font-bold text-xs text-slate-900">Phase 1: Local Zone (0-2 km)</h5>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700">
                              {currentPhase === 1 ? 'ACTIVE' : 'COMPLETE'}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-slate-500">
                            <p>Threshold Radius: <strong>2.0 km</strong></p>
                            <p>Blood Target: <strong className="text-[#C21C24]">O- Only</strong></p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100/60 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Phase 1 Turnout</span>
                          <span className="font-bold text-slate-800 text-sm">{currentPhase === 1 ? totalConfirmed : 12} confirmed</span>
                        </div>
                      </div>

                      <div className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between ${currentPhase === 2 ? 'border-amber-300 ring-2 ring-amber-50 bg-amber-50/10' : 'border-slate-200/80 opacity-60'}`}>
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <h5 className="font-bold text-xs text-slate-900">Phase 2: City Perimeter (2-10 km)</h5>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${currentPhase === 2 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                              {currentPhase === 2 ? 'ACTIVE' : currentPhase > 2 ? 'COMPLETE' : 'STANDBY'}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-slate-500">
                            <p>Threshold Radius: <strong>10.0 km</strong></p>
                            <p>Blood Target: <strong className="text-[#C21C24]">O- Only</strong></p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100/60 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Phase 2 Turnout</span>
                          <span className="font-bold text-slate-800 text-sm">{currentPhase === 2 ? totalConfirmed : currentPhase > 2 ? 20 : '—'} confirmed</span>
                        </div>
                      </div>

                      <div className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between ${currentPhase === 3 ? 'border-purple-300 ring-2 ring-purple-50 bg-purple-50/10' : 'border-slate-200/80 opacity-60'}`}>
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <h5 className="font-bold text-xs text-slate-900">Phase 3: Compatible Types</h5>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${currentPhase === 3 ? 'bg-purple-50 border-purple-100 text-purple-750' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                              {currentPhase === 3 ? 'ACTIVE' : 'STANDBY'}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-slate-500">
                            <p>Threshold Radius: <strong>Region-wide</strong></p>
                            <p>Blood Target: <strong className="text-indigo-650">A-, B-, AB- compatible</strong></p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100/60 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Phase 3 Turnout</span>
                          <span className="font-bold text-slate-800 text-sm">{currentPhase === 3 ? totalConfirmed : '—'} confirmed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RESOLVED SUMMARY */}
              {mobilizeFlowStep === 4 && (
                <div className="space-y-6 max-w-4xl mx-auto fade-in">
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Shortage Resolved</h3>
                    <p className="text-xs text-slate-500 mb-6">{totalConfirmed} voluntary donors confirmed arrivals to SPMC. Supply margins are secured.</p>
                    
                    <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto mb-8 text-xs font-semibold">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg py-3.5 px-2">
                        <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider mb-0.5">SMS Alerts</p>
                        <p className="text-xl font-bold text-slate-800">47</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg py-3.5 px-2">
                        <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider mb-0.5">Turnout</p>
                        <p className="text-xl font-bold text-slate-800">{totalConfirmed}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg py-3.5 px-2">
                        <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider mb-0.5">Response Time</p>
                        <p className="text-xl font-bold text-slate-800">18m</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg py-3.5 px-2">
                        <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider mb-0.5">Match Speed</p>
                        <p className="text-xl font-bold text-slate-800">3.2s</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => { updateInventoryUnits('O-', 12); resetMobilization(); }}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      Update Inventory & Close Alert
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-xs mb-4 uppercase tracking-wider">Turnout Accumulation Timeline</h4>
                    <div style={{ height: '220px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="confirmed" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: RE-ELIGIBILITY SCAN */}
          {tab === 'reeligibility' && (
            <div className="grid lg:grid-cols-3 gap-6 fade-in items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight mb-2">Automated Interval Tracker</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    Run periodic scans to locate voluntary profiles that have passed their 90-day whole-blood interval recovery. These donors are dynamically updated as active candidates.
                  </p>
                  
                  {!reEligibilityScanning && !reEligibilityComplete ? (
                    <button 
                      onClick={runReEligibilityScan}
                      className="bg-[#C21C24] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition-all shadow-sm"
                    >
                      Initialize Database Query Scan
                    </button>
                  ) : reEligibilityScanning ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <svg className="w-4 h-4 animate-spin text-[#C21C24]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        <span>Scanning active profiles...</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#C21C24] h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-emerald-800">
                      <h5 className="font-bold text-sm tracking-tight mb-1">Scan Complete: 18 Eligible Profiles Located</h5>
                      <p className="text-slate-650 text-xs mb-4">18 donors have completed their recovery timelines. Send automated re-eligibility SMS alerts.</p>
                      <button 
                        onClick={dispatchEligibilityReminders}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        Dispatch Eligibility SMS Broadcast
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Medical Interval Rules</h4>
                <div className="space-y-2 text-xs text-slate-650 font-semibold">
                  <div className="flex justify-between pb-1 border-b border-slate-50"><span>Mandatory Recovery</span><span className="text-slate-800 font-mono">90 Days</span></div>
                  <div className="flex justify-between pb-1 border-b border-slate-50"><span>Exclusion Holds</span><span className="text-slate-850">Medical Hold flags</span></div>
                  <div className="flex justify-between"><span>Region Scope</span><span className="text-slate-800">Davao City</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DONOR TURNOUT LOG */}
          {tab === 'turnout' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs tracking-tight">Turnout Tracker (Davao Facilities)</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live arrivals feed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Donor Profile</th>
                      <th className="px-6 py-3 text-left">Blood Type</th>
                      <th className="px-6 py-3 text-left">Target Center</th>
                      <th className="px-6 py-3 text-left">Response Alert</th>
                      <th className="px-6 py-3 text-left">Facility Arrival Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Maria C. Santos</td>
                      <td className="px-6 py-4"><span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">O-</span></td>
                      <td className="px-6 py-4 text-slate-600">SPMC Blood Production Services</td>
                      <td className="px-6 py-4 text-[#C21C24] font-bold">YES</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          arrivedAtFacility 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse'
                        }`}>
                          {arrivedAtFacility ? 'Arrived at Facility' : 'Awaiting Arrival'}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Juan P. Dela Cruz</td>
                      <td className="px-6 py-4"><span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">O-</span></td>
                      <td className="px-6 py-4 text-slate-600">SPMC Blood Production Services</td>
                      <td className="px-6 py-4 text-[#C21C24] font-bold">YES</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-amber-50 border-amber-100 text-amber-700">
                          Awaiting Arrival
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Ana Marie Reyes</td>
                      <td className="px-6 py-4"><span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">O-</span></td>
                      <td className="px-6 py-4 text-slate-600">SPMC Blood Production Services</td>
                      <td className="px-6 py-4 text-[#C21C24] font-bold">YES</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-50 border-emerald-100 text-emerald-700">
                          Arrived at Facility
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DONOR DENSITY MAP */}
          {tab === 'donormap' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm fade-in">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Donor Distribution Heat Points - Davao City</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#C21C24] rounded-full"></span>SPMC target</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Registered Donors</span>
                </div>
              </div>
              <div ref={densityMapRef} id="densityMap" className="h-[500px]"></div>
            </div>
          )}

          {/* TAB: DONOR REGISTRY */}
          {tab === 'donors' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    placeholder="Search registry by name or blood type..."
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition outline-none bg-slate-50/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setFlaggedStatus(!accountFlagged)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                    accountFlagged 
                      ? 'bg-rose-50 border-rose-100 text-[#C21C24]' 
                      : 'bg-slate-50 border-slate-250 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{accountFlagged ? 'Account Flagged: Maria Santos' : 'Flag / Restrict Demo Account'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Registry ID</th>
                      <th className="px-6 py-3 text-left">Donor Name</th>
                      <th className="px-6 py-3 text-left">Blood Type</th>
                      <th className="px-6 py-3 text-left">Primary Address</th>
                      <th className="px-6 py-3 text-left">Phone Number</th>
                      <th className="px-6 py-3 text-left">Registry Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                    {donors
                      .filter(d => 
                        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        d.bloodType.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-[11px] font-bold text-slate-400">{d.id}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-900">{d.name}</td>
                          <td className="px-6 py-3.5"><span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">{d.bloodType}</span></td>
                          <td className="px-6 py-3.5 text-slate-500 font-normal">{d.address || 'Davao City'}</td>
                          <td className="px-6 py-3.5 text-slate-500 font-mono font-normal">{d.phone}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              d.name === 'Maria C. Santos' && accountFlagged 
                                ? 'bg-rose-50 border-rose-100 text-[#C21C24]' 
                                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            }`}>
                              {d.name === 'Maria C. Santos' && accountFlagged ? 'Restricted' : 'Cleared'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SMS LOGS */}
          {tab === 'smslog' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs tracking-tight">Semaphore Transaction ledger</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{smsLogs.length} logs dispatched today</span>
              </div>
              {smsLogs.length === 0 ? (
                <div className="px-5 py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                  <span>No SMS transaction records located.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-655">
                  {smsLogs.map((log, i) => (
                    <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: log.color }}>
                        {log.initials}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-bold text-slate-900">{log.name} <span className="font-mono text-[10px] text-slate-400 font-normal">({log.phone})</span></p>
                          <span className="text-[10px] text-slate-400 font-semibold">{log.time}</span>
                        </div>
                        <p className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[10px] text-slate-600 leading-relaxed max-w-3xl">{log.msg}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded flex-shrink-0">Delivered</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BLOOD RELEASE REQUESTS */}
          {tab === 'bloodrequests' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Reference No</th>
                      <th className="px-6 py-4 text-left">Patient Details</th>
                      <th className="px-6 py-4 text-left">Release Center</th>
                      <th className="px-6 py-4 text-left">Units / Urgency</th>
                      <th className="px-6 py-4 text-left">Attesting Physician</th>
                      <th className="px-6 py-4 text-left">Registry Status</th>
                      <th className="px-6 py-4 text-left">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                    {bloodRequests.map((req) => (
                      <tr key={req.refNo} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">{req.refNo}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{req.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{req.hospital} · Age: {req.patientAge}</p>
                          {req.notes && <p className="text-[9px] text-blue-600 font-bold mt-1.5 flex items-center gap-1"><Info className="w-3 h-3" /> Note: {req.notes}</p>}
                        </td>
                        <td className="px-6 py-4 text-[11px] text-slate-700">{req.bloodCenter}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{req.units} bags <span className="font-black text-[#C21C24] font-mono">({req.patientBloodType})</span></p>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            req.urgency === 'emergency' ? 'text-[#C21C24]' : req.urgency === 'urgent' ? 'text-amber-600' : 'text-slate-450'
                          }`}>{req.urgency}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{req.physician}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Form ref: {req.hospitalRefNo || 'None'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            req.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-705' :
                            req.status === 'Processing' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                            req.status === 'Fulfilled' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-[#C21C24]'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {req.status === 'Pending' && (
                              <button 
                                onClick={() => handleRequestAction(req.refNo, 'Processing')}
                                className="bg-blue-650 text-white font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-blue-700 transition"
                              >
                                Process
                              </button>
                            )}
                            {req.status === 'Processing' && (
                              <button 
                                onClick={() => updateBloodRequestStatus(req.refNo, 'Fulfilled')}
                                className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-emerald-700 transition"
                              >
                                Fulfill
                              </button>
                            )}
                            {req.status !== 'Fulfilled' && req.status !== 'Declined' && (
                              <button 
                                onClick={() => updateBloodRequestStatus(req.refNo, 'Declined')}
                                className="border border-slate-200 text-[#C21C24] hover:bg-rose-50/35 font-bold text-[10px] px-2.5 py-1.5 rounded transition"
                              >
                                Decline
                              </button>
                            )}
                            {(req.status === 'Fulfilled' || req.status === 'Declined') && (
                              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h4 className="font-bold text-sm text-slate-900 mb-1 tracking-tight">Pre-Submission Status Action Note</h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Enter a reference message that will immediately sync to the user's dashboard registry log.</p>
            <textarea 
              rows="3" 
              placeholder="e.g. Attending doctor signature validated. Staging units at SPMC center release desk. Present original form upon collection." 
              className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition outline-none resize-none mb-4 bg-slate-50/45"
              value={selectedRequestNote}
              onChange={(e) => setSelectedRequestNote(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2.5 text-xs font-semibold">
              <button 
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-650 rounded hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveRequestStatusWithNote}
                className="px-4 py-2 bg-blue-650 text-white rounded hover:bg-blue-700 transition-all shadow-sm"
              >
                Save Status note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
