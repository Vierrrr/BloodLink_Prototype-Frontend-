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
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bloodlinkLogo from '../assets/bloodlinks_logo/bloodlink-logo.png';

export default function AdminDashboard() {
  // Zustand State
  const donors = useBloodStore((state) => state.donors);
  const inventory = useBloodStore((state) => state.inventory);
  const bloodRequests = useBloodStore((state) => state.bloodRequests);
  const hospitals = useBloodStore((state) => state.hospitals);
  const users = useBloodStore((state) => state.users);
  const forecastData = useBloodStore((state) => state.forecastData);
  const smsLogs = useBloodStore((state) => state.smsLogs);
  const distributionLog = useBloodStore((state) => state.distributionLog);
  const accountFlagged = useBloodStore((state) => state.accountFlagged);
  const arrivedAtFacility = useBloodStore((state) => state.arrivedAtFacility);
  const authSystemUser = useBloodStore((state) => state.authSystemUser);
  const updateBloodRequestStatus = useBloodStore((state) => state.updateBloodRequestStatus);
  const updateInventoryUnits = useBloodStore((state) => state.updateInventoryUnits);
  const setFlaggedStatus = useBloodStore((state) => state.setFlaggedStatus);
  const addHospital = useBloodStore((state) => state.addHospital);
  const updateHospital = useBloodStore((state) => state.updateHospital);
  const deleteHospital = useBloodStore((state) => state.deleteHospital);
  const getEquityAllocations = useBloodStore((state) => state.getEquityAllocations);
  const recordDistribution = useBloodStore((state) => state.recordDistribution);
  const getLastDistributionByBloodType = useBloodStore((state) => state.getLastDistributionByBloodType);
  const generateNextWeeks = useBloodStore((state) => state.generateNextWeeks);
  const addUser = useBloodStore((state) => state.addUser);

  // Role Detection
  const adminRole   = authSystemUser?.role || 'Administrator';
  const isSuperAdmin = adminRole === 'Super Admin';
  const isAdministrator = adminRole === 'Administrator';

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
  const [selectedDonor, setSelectedDonor] = useState(null);
  // Hospital CRUD state
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({ name: '', type: 'Government', contact: '', phone: '', email: '', address: '' });
  // Distribution history filter
  const [distHospitalFilter, setDistHospitalFilter] = useState('ALL');
  const [emergencyBloodType, setEmergencyBloodType] = useState(null);
  const [selectedInventoryType, setSelectedInventoryType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestNote, setSelectedRequestNote] = useState('');
  const [selectedRequestRef, setSelectedRequestRef] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [reEligibilityScanning, setReEligibilityScanning] = useState(false);
  const [reEligibilityComplete, setReEligibilityComplete] = useState(false);
  const [reEligibilityCount, setReEligibilityCount] = useState(0);

  // Distribution History detail modal
  const [selectedDistLog, setSelectedDistLog] = useState(null);
  const [showDistLogModal, setShowDistLogModal] = useState(false);

  // Allocate confirmation modal
  const [allocateTarget, setAllocateTarget] = useState(null); // { hospitalId, hospitalName, bloodType, units }
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  // SMS Recall confirmation modal
  const [showSmsConfirmModal, setShowSmsConfirmModal] = useState(false);

  // Reports local tab
  const [reportsTab, setReportsTab] = useState('stock');

  // Super Admin: Add System User modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', role: 'Registry Staff', email: '', hospitalId: '' });
  const [userSaved, setUserSaved] = useState(false);

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
    users: 'User Management',
    donors: 'Donor Management',
    inventory: 'Blood Inventory',
    issuance: 'Blood Issuance',
    hospitals: 'Hospital Management',
    forecasting: 'Demand Forecasting',
    distribution: 'Distribution Recommendation',
    recall: 'Donor Recall',
    reports: 'Reports Module',
    hospital_history: 'Distribution History',
    dist_record_detail: 'Distribution Record Detail'
  };

  const tabSubs = {
    dashboard: 'Real-time metrics and system overview',
    users: 'Manage system users and access privileges',
    donors: 'Manage donor records and donation history',
    inventory: 'Monitors available blood stocks and components',
    issuance: 'Records blood distribution transactions to hospitals',
    hospitals: 'Maintains partner hospital information',
    forecasting: 'Predicts future blood demand using Regression-Enhanced Forecasting',
    distribution: 'Equity-based blood allocation to partner hospitals',
    recall: 'Automates donor recall after the required eligibility period',
    reports: 'Generates operational reports',
    hospital_history: 'Searchable log of all blood distributions per hospital',
    dist_record_detail: 'Full breakdown of a single distribution transaction'
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
        { name: 'SPMC Blood Services (Blood hospital partnered with SNBC)', coords: [7.0731, 125.6128], color: '#C21C24' },
        { name: 'Philippine Red Cross (Other bloodbank)', coords: [7.0601, 125.6105], color: '#E11D48' },
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

  // Open distribution log detail — navigate like blood inventory (inline page)
  const openDistLog = (log) => {
    setSelectedDistLog(log);
    setTab('dist_record_detail');
  };

  // Emergency Retrack: navigate to Distribution History tab & highlight that blood type
  const handleEmergencyRetrack = (bloodType) => {
    setEmergencyBloodType(bloodType);
    setDistHospitalFilter('ALL');
    setTab('hospital_history');
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
          <nav className="flex-1 py-2 overflow-y-auto">
            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-3 mb-1 tracking-widest">General</p>
            
            <button onClick={() => setTab('dashboard')} className={`w-full text-left nav-link ${tab === 'dashboard' ? 'active' : ''}`}>
              <Database className="nav-icon" />
              <span>Dashboard</span>
            </button>

            <button onClick={() => setTab('users')} className={`w-full text-left nav-link ${tab === 'users' ? 'active' : ''}`}>
              <UserCheck className="nav-icon" />
              <span>User Management</span>
            </button>

            <button onClick={() => setTab('donors')} className={`w-full text-left nav-link ${tab === 'donors' ? 'active' : ''}`}>
              <Users className="nav-icon" />
              <span>Donor Management</span>
            </button>
            
            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-4 mb-1 tracking-widest">Inventory & Issuance</p>

            <button onClick={() => setTab('inventory')} className={`w-full text-left nav-link ${tab === 'inventory' ? 'active' : ''}`}>
              <Heart className="nav-icon" />
              <span>Blood Inventory</span>
              {criticalCount > 0 && (
                <span className="ml-auto bg-[#C21C24] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {criticalCount}
                </span>
              )}
            </button>

            <button onClick={() => setTab('issuance')} className={`w-full text-left nav-link ${tab === 'issuance' ? 'active' : ''}`}>
              <FileText className="nav-icon" />
              <span>Blood Issuance</span>
              {pendingRequests > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {pendingRequests}
                </span>
              )}
            </button>

            <button onClick={() => setTab('hospitals')} className={`w-full text-left nav-link ${tab === 'hospitals' ? 'active' : ''}`}>
              <Building2 className="nav-icon" />
              <span>Hospital Management</span>
            </button>

            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-4 mb-1 tracking-widest">Capstone Elements</p>

            <button onClick={() => setTab('forecasting')} className={`w-full text-left nav-link ${tab === 'forecasting' ? 'active' : ''}`}>
              <Activity className="nav-icon" />
              <span>Demand Forecasting</span>
            </button>

            <button onClick={() => setTab('distribution')} className={`w-full text-left nav-link ${tab === 'distribution' ? 'active' : ''}`}>
              <Map className="nav-icon" />
              <span>Distribution Recs</span>
            </button>

            <button onClick={() => setTab('hospital_history')} className={`w-full text-left nav-link ${tab === 'hospital_history' ? 'active' : ''}`}>
              <ClipboardList className="nav-icon" />
              <span>Distribution History</span>
            </button>

            <button onClick={() => setTab('recall')} className={`w-full text-left nav-link ${tab === 'recall' ? 'active' : ''}`}>
              <RefreshCw className="nav-icon" />
              <span>Donor Recall</span>
            </button>

            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-4 mb-1 tracking-widest">Analytics</p>

            <button onClick={() => setTab('reports')} className={`w-full text-left nav-link ${tab === 'reports' ? 'active' : ''}`}>
              <ClipboardList className="nav-icon" />
              <span>Reports</span>
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
            <Link
              to="/"
              title="Logout"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-[#C21C24] hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
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
                  {/* Intentionally removed matching protocol button */}

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
                    <tr 
                      key={blood.type} 
                      onClick={() => { setSelectedInventoryType(blood.type); setTab('blood_records'); }}
                      className={`hover:bg-slate-50/30 transition-colors cursor-pointer ${blood.status === 'critical' ? 'bg-rose-50/20' : ''}`}
                    >
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
                        <span className="text-slate-400 font-medium flex items-center gap-1 text-[10px]">
                          View Donors <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: BLOOD RECORDS (Specific Blood Type) */}
          {tab === 'blood_records' && selectedInventoryType && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Donors with Blood Type {selectedInventoryType}</h3>
                <button onClick={() => setTab('inventory')} className="text-xs text-blue-600 hover:underline">Back to Inventory</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Donor Name</th>
                      <th className="px-6 py-3 text-left">Blood Type</th>
                      <th className="px-6 py-3 text-left">Blood Donated Date</th>
                      <th className="px-6 py-3 text-left">Expiry Date (35 Days)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                    {donors.filter(d => d.bloodType === selectedInventoryType).map(donor => {
                      const donatedDate = new Date(donor.lastDonation);
                      const expiryDate = new Date(donatedDate.getTime() + 35 * 24 * 60 * 60 * 1000);
                      return (
                        <tr key={donor.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => { setSelectedDonor(donor); setTab('donor_detail'); }}>
                          <td className="px-6 py-4 font-bold text-slate-900">{donor.name}</td>
                          <td className="px-6 py-4"><span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">{donor.bloodType}</span></td>
                          <td className="px-6 py-4 text-slate-600">{donatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td className="px-6 py-4 text-rose-600">{expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DONOR DETAIL */}
          {tab === 'donor_detail' && selectedDonor && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Donor Details</h3>
                <button onClick={() => setTab('blood_records')} className="text-sm text-blue-600 hover:underline">Back to List</button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div><strong>Name:</strong> {selectedDonor.name}</div>
                <div><strong>Blood Type:</strong> {selectedDonor.bloodType}</div>
                <div><strong>Last Donation:</strong> {new Date(selectedDonor.lastDonation).toLocaleDateString()}</div>
                <div><strong>Expiry Date:</strong> {new Date(new Date(selectedDonor.lastDonation).getTime() + 35*24*60*60*1000).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {selectedDonor.status || 'N/A'}</div>
                <div><strong>Contact:</strong> {selectedDonor.phone || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* TAB: DONOR RECALL (CAPSTONE) */}
          {tab === 'recall' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">Eligible Donor Detection (Donor Recall)</h3>
                  <p className="text-xs text-slate-500 mt-1">Automated donor recall after the required 85-90 day eligibility period.</p>
                </div>
                <button 
                  onClick={() => setShowSmsConfirmModal(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch SMS Recall
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Donor Name</th>
                      <th className="px-6 py-3 text-left">Blood Type</th>
                      <th className="px-6 py-3 text-left">Last Donation Date</th>
                      <th className="px-6 py-3 text-left">Days Since Donation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                    {donors.map(donor => {
                      const today = new Date('2026-06-27');
                      const lastDonationDate = new Date(donor.lastDonation);
                      const diffTime = Math.abs(today - lastDonationDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return { ...donor, diffDays };
                    }).filter(donor => donor.diffDays >= 85 && donor.diffDays <= 90).map(donor => (
                        <tr key={donor.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-900">{donor.name}</td>
                          <td className="px-6 py-4"><span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">{donor.bloodType}</span></td>
                          <td className="px-6 py-4 text-slate-600">{donor.lastDonation}</td>
                          <td className="px-6 py-4 text-amber-600 font-bold">{donor.diffDays} Days</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
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
                <span>Blood hospitals partnered with SNBC and other bloodbanks</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#C21C24] rounded-full"></span>SPMC target</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Registered Donors</span>
                </div>
              </div>
              <div ref={densityMapRef} id="densityMap" className="h-[500px]"></div>
            </div>
          )}

          {/* TAB: USER MANAGEMENT */}
          {tab === 'users' && (
            <div className="space-y-4 fade-in">

              {/* RBAC Role Notice */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Role-Based Access Control (RBAC)</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    {isSuperAdmin
                      ? 'You are logged in as Super Admin. You can manage all system users including Administrator accounts and audit logs.'
                      : 'You are logged in as Administrator. You can verify accounts and create Hospital User logins. Super Admin accounts can only be managed by Super Admins.'}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">System Access Privileges</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{users.length} system users registered</p>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="bg-[#C21C24] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition flex items-center gap-2 shadow-sm cursor-pointer">
                      <Plus className="w-4 h-4" /> Add System User
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 text-left">User ID</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Role</th>
                        <th className="px-6 py-3 text-left">Email Contact</th>
                        <th className="px-6 py-3 text-left">Account Status</th>
                        {isSuperAdmin && <th className="px-6 py-3 text-left">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                      {users.map((u) => {
                        const roleColors = {
                          'Super Admin':         'bg-purple-50 border-purple-200 text-purple-700',
                          'Administrator':       'bg-blue-50 border-blue-200 text-blue-700',
                          'Registry Staff':      'bg-emerald-50 border-emerald-200 text-emerald-700',
                          'Blood Bank Staff':    'bg-rose-50 border-rose-100 text-[#C21C24]',
                          'Issuance Personnel':  'bg-amber-50 border-amber-200 text-amber-700',
                          'Hospital User':       'bg-slate-50 border-slate-200 text-slate-600',
                        };
                        const roleCls = roleColors[u.role] || 'bg-slate-50 border-slate-200 text-slate-600';
                        const isSuperAdminUser = u.role === 'Super Admin';
                        const canEdit = isSuperAdmin || (!isSuperAdminUser && isAdministrator);
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">{u.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${roleCls}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-mono">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-50 border-emerald-100 text-emerald-700">
                                {u.status}
                              </span>
                            </td>
                            {isSuperAdmin && (
                              <td className="px-6 py-4">
                                {canEdit ? (
                                  <button className="text-[10px] font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-50 transition-colors">
                                    Edit
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300">Protected</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* TAB: DONOR MANAGEMENT */}
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
                  <span>{accountFlagged ? 'Medical Hold Applied (Maria Santos)' : 'Flag / Apply Deferral Record'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Registry ID</th>
                      <th className="px-6 py-3 text-left">Donor Name</th>
                      <th className="px-6 py-3 text-left">Blood Type</th>
                      <th className="px-6 py-3 text-left">Phone Number</th>
                      <th className="px-6 py-3 text-left">Donor Status</th>
                      <th className="px-6 py-3 text-left">Registry Validation</th>
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
                          <td className="px-6 py-3.5 text-slate-500 font-mono font-normal">{d.phone}</td>
                          <td className="px-6 py-3.5">
                            {(() => {
                              const daysSince = Math.floor((new Date() - new Date(d.lastDonation)) / (1000 * 60 * 60 * 24));
                              if (daysSince >= 90) {
                                return <span className="text-amber-650 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded text-[10px] font-bold">Lapsed</span>;
                              }
                              return d.totalDonations > 1 ? (
                                <span className="text-emerald-600 font-bold">Regular</span>
                              ) : (
                                <span className="text-blue-600 font-bold">New</span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              d.name === 'Maria C. Santos' && accountFlagged 
                                ? 'bg-rose-50 border-rose-100 text-[#C21C24]' 
                                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            }`}>
                              {d.name === 'Maria C. Santos' && accountFlagged ? 'Temporary Deferral' : 'Cleared'}
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

          {/* TAB: BLOOD ISSUANCE */}
          {tab === 'issuance' && (
            <div className="space-y-4 fade-in">
              {/* Emergency Retracking Banner */}
              {emergencyBloodType && (() => {
                const logs = getLastDistributionByBloodType(emergencyBloodType);
                return logs.length > 0 ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#C21C24] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-[#C21C24] text-sm mb-1">⚠ Emergency Retrack – {emergencyBloodType} Unavailable</p>
                        <p className="text-xs text-rose-700 mb-3">The last {emergencyBloodType} distribution was sent to the hospitals below. Contact them to check for availability and request a temporary loan.</p>
                        <div className="space-y-2">
                          {logs.slice(0, 3).map(log => {
                            const hosp = hospitals.find(h => h.id === log.hospitalId);
                            return (
                              <div key={log.id} className="bg-white border border-rose-100 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-slate-900 text-xs">{log.hospitalName}</p>
                                  <p className="text-[10px] text-slate-500">{log.units} bags distributed on {log.date}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-700">{hosp?.contact}</p>
                                  <p className="text-[10px] font-mono text-blue-600">{hosp?.phone}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button onClick={() => setEmergencyBloodType(null)} className="text-rose-400 hover:text-rose-600"><XCircle className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Hospital Blood Issuance Ledger</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Blood bags released to partner hospitals and blood centres</p>
                  </div>
                  <button className="bg-[#C21C24] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Create Issuance
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left">Reference No</th>
                        <th className="px-6 py-4 text-left">Requesting Hospital</th>
                        <th className="px-6 py-4 text-left">Blood Type / Units</th>
                        <th className="px-6 py-4 text-left">Urgency</th>
                        <th className="px-6 py-4 text-left">Contact Person</th>
                        <th className="px-6 py-4 text-left">Issuance Status</th>
                        <th className="px-6 py-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                      {bloodRequests.map((req) => {
                        const hospRecord = hospitals.find(h => h.id === req.hospitalId);
                        const inventoryItem = inventory.find(i => i.type === req.patientBloodType);
                        const stockInsufficient = inventoryItem && inventoryItem.units < req.units;
                        return (
                          <tr key={req.refNo} className={`hover:bg-slate-50/50 transition-colors ${stockInsufficient ? 'bg-rose-50/30' : ''}`}>
                            <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">{req.refNo}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{req.hospital}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{hospRecord?.address || req.ward}</p>
                              {req.diagnosis && <p className="text-[9px] text-blue-600 font-bold mt-1">Dx: {req.diagnosis}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[10px] font-mono">{req.patientBloodType}</span>
                              <span className="ml-2 font-bold text-slate-800">{req.units} bags</span>
                              {stockInsufficient && (
                                <p className="text-[9px] text-[#C21C24] font-bold mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Insufficient stock
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                req.urgency === 'emergency' ? 'bg-rose-50 border-rose-100 text-[#C21C24]' : req.urgency === 'urgent' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                              }`}>{req.urgency}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{req.contactPerson}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{req.contactNumber}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                req.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                req.status === 'Processing' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                req.status === 'Fulfilled' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-[#C21C24]'
                              }`}>{req.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 flex-wrap">
                                {req.status === 'Pending' && !stockInsufficient && (
                                  <button onClick={() => handleRequestAction(req.refNo, 'Processing')} className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-blue-700 transition">Process</button>
                                )}
                                {req.status === 'Pending' && stockInsufficient && (
                                  <button onClick={() => setEmergencyBloodType(req.patientBloodType)} className="bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-rose-700 transition flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Retrack
                                  </button>
                                )}
                                {req.status === 'Processing' && (
                                  <button onClick={() => updateBloodRequestStatus(req.refNo, 'Fulfilled')} className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded hover:bg-emerald-700 transition">Fulfill</button>
                                )}
                                {req.status !== 'Fulfilled' && req.status !== 'Declined' && (
                                  <button onClick={() => updateBloodRequestStatus(req.refNo, 'Declined')} className="border border-slate-200 text-[#C21C24] hover:bg-rose-50/35 font-bold text-[10px] px-2.5 py-1.5 rounded transition">Decline</button>
                                )}
                                {(req.status === 'Fulfilled' || req.status === 'Declined') && (
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOSPITAL MANAGEMENT – FULL CRUD */}
          {tab === 'hospitals' && (
            <div className="space-y-4 fade-in">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Partner Hospital & Blood Centre Registry</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{hospitals.length} registered partners</p>
                  </div>
                  <button
                    onClick={() => { setEditingHospital(null); setHospitalForm({ name: '', type: 'Government', contact: '', phone: '', email: '', address: '' }); setShowHospitalModal(true); }}
                    className="bg-[#C21C24] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Hospital
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 text-left">ID</th>
                        <th className="px-6 py-3 text-left">Hospital / Blood Centre</th>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Contact Person</th>
                        <th className="px-6 py-3 text-left">Phone</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Address</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                      {hospitals.map(h => (
                        <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">{h.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{h.name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              h.type === 'Government' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                              h.type === 'Blood Bank' ? 'bg-rose-50 border-rose-100 text-[#C21C24]' :
                              'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>{h.type}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{h.contact}</td>
                          <td className="px-6 py-4 font-mono text-slate-600">{h.phone}</td>
                          <td className="px-6 py-4 text-slate-500">{h.email}</td>
                          <td className="px-6 py-4 text-slate-500 max-w-[180px] truncate">{h.address}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditingHospital(h); setHospitalForm({ name: h.name, type: h.type, contact: h.contact, phone: h.phone, email: h.email || '', address: h.address || '' }); setShowHospitalModal(true); }}
                                className="border border-blue-100 bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded hover:bg-blue-100 transition"
                              >Edit</button>
                              <button
                                onClick={() => { if (window.confirm(`Delete ${h.name}?`)) deleteHospital(h.id); }}
                                className="border border-rose-100 bg-rose-50 text-[#C21C24] font-bold text-[10px] px-2.5 py-1 rounded hover:bg-rose-100 transition"
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEMAND FORECASTING (CAPSTONE) – EXPANDED */}
          {tab === 'forecasting' && (() => {
            const latestForecast = forecastData.filter(w => w.actual === null)[0];
            const historicalAvg = Math.round(forecastData.filter(w => w.actual !== null).reduce((s, w) => s + w.actual, 0) / (forecastData.filter(w => w.actual !== null).length || 1));
            const trend = forecastData.length >= 2 ? forecastData[forecastData.length - 1].demand - forecastData[forecastData.length - 2].demand : 0;
            return (
              <div className="space-y-5 fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Next Week Forecast</p>
                    <p className="text-2xl font-extrabold text-[#C21C24] font-mono">{latestForecast?.demand ?? '—'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">units predicted</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Confidence Band</p>
                    <p className="text-2xl font-extrabold text-blue-700 font-mono">{latestForecast?.lower ?? '—'}–{latestForecast?.upper ?? '—'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">±7% margin</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Historical Avg</p>
                    <p className="text-2xl font-extrabold text-emerald-600 font-mono">{historicalAvg}</p>
                    <p className="text-[10px] text-slate-400 mt-1">actual units/week</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Demand Trend</p>
                    <p className={`text-2xl font-extrabold font-mono ${trend > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{trend > 0 ? '+' : ''}{trend}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{trend > 0 ? 'Rising demand' : trend < 0 ? 'Falling demand' : 'Stable'}</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">Regression-Enhanced Demand Forecast</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Historical actuals vs. predicted demand. Dashed bands = confidence interval.</p>
                    </div>
                    <button
                      onClick={() => generateNextWeeks(4)}
                      className="bg-[#C21C24] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition flex items-center gap-2 shadow-sm"
                    >
                      <Activity className="w-3.5 h-3.5" /> Generate Next 4 Weeks
                    </button>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="upper" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" name="Upper Bound" dot={false} />
                        <Line type="monotone" dataKey="lower" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" name="Lower Bound" dot={false} />
                        <Line type="monotone" dataKey="demand" stroke="#C21C24" strokeWidth={3} name="Predicted Demand" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Actual Distribution" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-5 mt-3 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#C21C24] inline-block rounded"></span>Predicted</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-500 inline-block rounded"></span>Actual</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-400 inline-block rounded" style={{borderTop:'2px dashed'}}></span>Confidence Band</span>
                    <span className="ml-auto text-slate-400">Weeks marked (P) = predicted, no actual recorded yet</span>
                  </div>
                </div>

                {/* Weekly breakdown table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Weekly Demand Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">Week</th>
                          <th className="px-6 py-3 text-left">Predicted Demand</th>
                          <th className="px-6 py-3 text-left">Actual Distribution</th>
                          <th className="px-6 py-3 text-left">Confidence Band</th>
                          <th className="px-6 py-3 text-left">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                        {forecastData.map((w, i) => {
                          const acc = w.actual !== null ? Math.round(100 - (Math.abs(w.demand - w.actual) / w.demand) * 100) : null;
                          return (
                            <tr key={i} className={`hover:bg-slate-50/50 ${w.actual === null ? 'bg-blue-50/20' : ''}`}>
                              <td className="px-6 py-3 font-bold text-slate-900">{w.week}</td>
                              <td className="px-6 py-3 font-mono text-[#C21C24] font-bold">{w.demand}</td>
                              <td className="px-6 py-3 font-mono text-emerald-700 font-bold">{w.actual ?? <span className="text-slate-400">—</span>}</td>
                              <td className="px-6 py-3 text-slate-500">{w.lower} – {w.upper}</td>
                              <td className="px-6 py-3">
                                {acc !== null ? (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    acc >= 90 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                    acc >= 75 ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                    'bg-rose-50 border-rose-100 text-[#C21C24]'
                                  }`}>{acc}%</span>
                                ) : <span className="text-slate-400 text-[10px] font-bold">Predicted</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: DISTRIBUTION RECOMMENDATION (CAPSTONE) – EQUITY ALGORITHM */}
          {tab === 'distribution' && (() => {
            const allocations = getEquityAllocations();
            return (
              <div className="space-y-5 fade-in">
                {/* Info banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-bold mb-0.5">Equity-Based Blood Distribution Algorithm</p>
                    <p className="text-blue-700">Allocations are computed proportionally based on hospital type weighting (Government 1.5×, Blood Bank 1.2×, Private 1.0×) and the next predicted demand week. Only units above the safety threshold are released.</p>
                  </div>
                </div>

                {allocations.map(({ bloodType, status, allocations: hospAllocs }) => (
                  <div key={bloodType} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className={`px-6 py-3 border-b border-slate-100 flex items-center justify-between ${
                      status === 'critical' ? 'bg-rose-50/30' : status === 'low' ? 'bg-amber-50/20' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-sm font-mono">{bloodType}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          status === 'critical' ? 'text-[#C21C24]' : status === 'low' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{status === 'critical' ? '⚠ Critical' : status === 'low' ? '↓ Low Stock' : '✓ Stable'}</span>
                        <span className="text-[10px] text-slate-400">Stock: {hospAllocs[0]?.currentStock} / Threshold: {hospAllocs[0]?.threshold} / Releasable: {hospAllocs[0]?.safeToRelease}</span>
                      </div>
                      {hospAllocs[0]?.safeToRelease === 0 && (
                        <button onClick={() => handleEmergencyRetrack(bloodType)} className="flex items-center gap-1.5 text-[10px] font-bold text-[#C21C24] bg-rose-50 border border-rose-100 px-2.5 py-1 rounded hover:bg-rose-100 transition">
                          <AlertTriangle className="w-3 h-3" /> Emergency Retrack
                        </button>
                      )}
                    </div>
                    {hospAllocs[0]?.safeToRelease > 0 ? (
                      <table className="min-w-full">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3 text-left">Hospital / Centre</th>
                            <th className="px-6 py-3 text-left">Type</th>
                            <th className="px-6 py-3 text-left">Weight</th>
                            <th className="px-6 py-3 text-left">Suggested Units</th>
                            <th className="px-6 py-3 text-left">Emergency Contact</th>
                            <th className="px-6 py-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                          {hospAllocs.map(a => (
                            <tr key={a.hospitalId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-3 font-bold text-slate-900">{a.hospitalName}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  a.hospitalType === 'Government' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                  a.hospitalType === 'Blood Bank' ? 'bg-rose-50 border-rose-100 text-[#C21C24]' :
                                  'bg-slate-50 border-slate-200 text-slate-600'
                                }`}>{a.hospitalType}</span>
                              </td>
                              <td className="px-6 py-3 font-mono text-slate-600">{a.hospitalType === 'Government' ? '1.5×' : a.hospitalType === 'Blood Bank' ? '1.2×' : '1.0×'}</td>
                              <td className="px-6 py-3">
                                <span className="text-lg font-black text-slate-900 font-mono">{a.suggestedUnits}</span>
                                <span className="text-slate-400 ml-1 text-[10px]">bags</span>
                              </td>
                              <td className="px-6 py-3">
                                <p className="font-bold text-slate-700">{a.hospitalContact}</p>
                                <p className="font-mono text-[10px] text-blue-600">{a.hospitalPhone}</p>
                              </td>
                              <td className="px-6 py-3">
                                {a.suggestedUnits > 0 ? (
                                  <button
                                    onClick={() => {
                                      setAllocateTarget({ hospitalId: a.hospitalId, hospitalName: a.hospitalName, bloodType, units: a.suggestedUnits });
                                      setShowAllocateModal(true);
                                    }}
                                    className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded hover:bg-emerald-700 transition"
                                  >
                                    Allocate
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400">No surplus</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-6 py-5 text-xs text-[#C21C24] font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Cannot allocate – stock is at or below safety threshold. Use Emergency Retrack to locate a lending source.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* TAB: DISTRIBUTION HISTORY */}
          {tab === 'hospital_history' && (
            <div className="space-y-4 fade-in">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">Distribution History</h3>
                  <select
                    value={distHospitalFilter}
                    onChange={e => setDistHospitalFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 outline-none focus:border-slate-800"
                  >
                    <option value="ALL">All Hospitals</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 text-left">Dist. ID</th>
                        <th className="px-6 py-3 text-left">Hospital</th>
                        <th className="px-6 py-3 text-left">Units Released</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Allocated By</th>
                        <th className="px-6 py-3 text-left">View Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                      {distributionLog
                        .filter(log => distHospitalFilter === 'ALL' || log.hospitalId === distHospitalFilter)
                        .filter(log => !emergencyBloodType || log.bloodType === emergencyBloodType)
                        .map(log => (
                          <tr
                            key={log.id}
                            className="hover:bg-rose-50/20 transition-colors cursor-pointer group"
                            onClick={() => openDistLog(log)}
                          >
                            <td className="px-6 py-3 font-mono text-[11px] font-bold text-slate-400">{log.id}</td>
                            <td className="px-6 py-3 font-bold text-slate-900 group-hover:text-[#C21C24] transition-colors">{log.hospitalName}</td>
                            <td className="px-6 py-3 font-bold text-slate-800 font-mono">{log.units} bags</td>
                            <td className="px-6 py-3 text-slate-600">{log.date}</td>
                            <td className="px-6 py-3 text-slate-500">{log.allocatedBy}</td>
                            <td className="px-6 py-3">
                              <span className="text-[10px] text-slate-400 group-hover:text-[#C21C24] transition-colors flex items-center gap-1 font-bold">View Record <ChevronRight className="w-3 h-3" /></span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {distributionLog
                    .filter(log => distHospitalFilter === 'ALL' || log.hospitalId === distHospitalFilter)
                    .filter(log => !emergencyBloodType || log.bloodType === emergencyBloodType)
                    .length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-400 text-xs">No distribution records found.</div>
                  )}
                </div>
              </div>

              {/* Emergency Retrack highlight banner */}
              {emergencyBloodType && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#C21C24] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-[#C21C24] text-sm mb-0.5">Emergency Retrack – Blood Type {emergencyBloodType}</p>
                    <p className="text-xs text-rose-700">Showing only <strong>{emergencyBloodType}</strong> distributions. Click any row to view full details and locate a possible lending source.</p>
                  </div>
                  <button onClick={() => setEmergencyBloodType(null)} className="text-rose-400 hover:text-rose-600"><XCircle className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          )}

          {/* TAB: DISTRIBUTION RECORD DETAIL (inline page, same pattern as blood_records) */}
          {tab === 'dist_record_detail' && selectedDistLog && (() => {
            const fmt = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            const getBulkDistributionData = (log) => {
              const types = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
              
              return types.map(type => {
                let unitsReleased = 0;
                if (type === log.bloodType) {
                  unitsReleased = log.units;
                } else {
                  // Deterministic mock units released in bulk for other types based on record ID
                  const hash = (log.id.charCodeAt(log.id.length - 1) + type.charCodeAt(0)) % 5;
                  unitsReleased = hash === 0 ? 0 : hash === 1 ? 1 : hash === 2 ? 2 : 0;
                }

                const distDate = new Date(log.date);
                const requestDate = new Date(distDate.getTime() - 2 * 24 * 60 * 60 * 1000);
                const expiryDate = new Date(distDate.getTime() + 35 * 24 * 60 * 60 * 1000);

                return {
                  type,
                  unitsReleased,
                  requestDate,
                  distDate,
                  expiryDate
                };
              });
            };

            return (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-in space-y-4 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Distribution Record — {selectedDistLog.id}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedDistLog.hospitalName}</p>
                  </div>
                  <button
                    onClick={() => setTab('hospital_history')}
                    className="text-xs text-[#C21C24] font-bold hover:underline"
                  >← Back to Distribution History</button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider text-left">
                      <tr>
                        <th className="px-6 py-3">Blood Type</th>
                        <th className="px-6 py-3">Units Released</th>
                        <th className="px-6 py-3">Date of Request</th>
                        <th className="px-6 py-3">Date of Distribution</th>
                        <th className="px-6 py-3">Expiry Date (35-day)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-655">
                      {getBulkDistributionData(selectedDistLog).map((item) => (
                        <tr key={item.type} className={`hover:bg-slate-50/50 transition-colors ${item.unitsReleased > 0 ? 'bg-emerald-50/10' : ''}`}>
                          <td className="px-6 py-4">
                            <span className="text-base font-black text-slate-900 font-mono">{item.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            {item.unitsReleased > 0 ? (
                              <>
                                <span className="text-base font-bold font-mono text-slate-800">{item.unitsReleased}</span>
                                <span className="text-slate-400 font-medium ml-1">units</span>
                              </>
                            ) : (
                              <span className="text-slate-350 font-normal">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.unitsReleased > 0 ? (
                              <span className="text-slate-600 font-mono">{fmt(item.requestDate)}</span>
                            ) : (
                              <span className="text-slate-350 font-normal">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.unitsReleased > 0 ? (
                              <span className="text-emerald-700 font-bold font-mono">{fmt(item.distDate)}</span>
                            ) : (
                              <span className="text-slate-350 font-normal">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.unitsReleased > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-50 border-rose-100 text-[#C21C24] font-mono">
                                {fmt(item.expiryDate)}
                              </span>
                            ) : (
                              <span className="text-slate-350 font-normal">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Extra hospital info footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-6">
                    <span><span className="font-bold text-slate-700">Receiving Hospital:</span> {selectedDistLog.hospitalName}</span>
                    <span><span className="font-bold text-slate-700">Allocated By:</span> {selectedDistLog.allocatedBy}</span>
                    <span><span className="font-bold text-slate-700">Record ID:</span> <span className="font-mono">{selectedDistLog.id}</span></span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: REPORTS */}
          {tab === 'reports' && (() => {
            const mbdData = [
              { venue: 'Davao City Hall', date: '2026-06-20', target: 100, collected: 85, deferrals: 15, ncu: 1, ns: 84 },
              { venue: 'Gaisano Mall Bajada', date: '2026-06-15', target: 50, collected: 48, deferrals: 8, ncu: 0, ns: 48 },
              { venue: 'SM City Davao', date: '2026-06-10', target: 80, collected: 82, deferrals: 12, ncu: 2, ns: 80 },
              { venue: 'SPMC Compound Campaign', date: '2026-06-05', target: 120, collected: 115, deferrals: 18, ncu: 3, ns: 112 },
            ];

            const totalMbdCollected = mbdData.reduce((sum, item) => sum + item.collected, 0);
            const totalMbdTarget = mbdData.reduce((sum, item) => sum + item.target, 0);
            const avgMbdTurnout = Math.round((totalMbdCollected / totalMbdTarget) * 100);

            return (
              <div className="space-y-4 fade-in">
                {/* Reports Header & Toggle */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportsTab('stock')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        reportsTab === 'stock'
                          ? 'bg-[#C21C24] text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      Daily Stock Summary
                    </button>
                    <button
                      onClick={() => setReportsTab('mbd')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        reportsTab === 'mbd'
                          ? 'bg-[#C21C24] text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-655 hover:bg-slate-100'
                      }`}
                    >
                      MBD Collections Report
                    </button>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Print / Export PDF
                  </button>
                </div>

                {/* Report Content */}
                {reportsTab === 'stock' ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4 text-center">
                      <h3 className="font-extrabold text-slate-900 text-base">SNBC DAILY BLOOD STOCK REPORT</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">GENERATED ON: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} | SYSTEM: BLOODLINK DVO</p>
                    </div>

                    {/* Stock Overview Table */}
                    <div className="overflow-x-auto border border-slate-150 rounded-lg">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-450 uppercase tracking-wider text-left">
                          <tr>
                            <th className="px-6 py-3">Blood Type</th>
                            <th className="px-6 py-3 text-center">PRBC (bags)</th>
                            <th className="px-6 py-3 text-center">Platelets (bags)</th>
                            <th className="px-6 py-3 text-center">FFP (bags)</th>
                            <th className="px-6 py-3 text-center">Cryo (bags)</th>
                            <th className="px-6 py-3 text-center">CryoSup (bags)</th>
                            <th className="px-6 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                          {inventory.map((item) => (
                            <tr key={item.type} className="hover:bg-slate-50/30">
                              <td className="px-6 py-4 font-black text-slate-900 font-mono">{item.type}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-800 font-mono">{item.units}</td>
                              <td className="px-6 py-4 text-center text-slate-600 font-mono">{item.platelets || 0}</td>
                              <td className="px-6 py-4 text-center text-slate-600 font-mono">{item.ffp || 0}</td>
                              <td className="px-6 py-4 text-center text-slate-600 font-mono">{item.cryo || 0}</td>
                              <td className="px-6 py-4 text-center text-slate-600 font-mono">{item.cryosup || 0}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  item.status === 'safe'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : item.status === 'low'
                                      ? 'bg-amber-50 border-amber-100 text-amber-700'
                                      : 'bg-rose-50 border-rose-100 text-[#C21C24]'
                                }`}>
                                  {item.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold border-t border-slate-200">
                            <td className="px-6 py-4 text-slate-800">TOTAL BAGS</td>
                            <td className="px-6 py-4 text-center text-slate-900 font-mono">{inventory.reduce((s,i)=>s+(i.units||0), 0)}</td>
                            <td className="px-6 py-4 text-center text-slate-900 font-mono">{inventory.reduce((s,i)=>s+(i.platelets||0), 0)}</td>
                            <td className="px-6 py-4 text-center text-slate-900 font-mono">{inventory.reduce((s,i)=>s+(i.ffp||0), 0)}</td>
                            <td className="px-6 py-4 text-center text-slate-900 font-mono">{inventory.reduce((s,i)=>s+(i.cryo||0), 0)}</td>
                            <td className="px-6 py-4 text-center text-slate-900 font-mono">{inventory.reduce((s,i)=>s+(i.cryosup||0), 0)}</td>
                            <td className="px-6 py-4 text-center text-slate-500">—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4 text-center">
                      <h3 className="font-extrabold text-slate-900 text-base">MOBILE BLOOD DONATION (MBD) COLLECTIONS REPORT</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">GENERATED ON: {new Date().toLocaleDateString()} | SOURCE: REGISTRY & LAB SYNC</p>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Collected Bags</p>
                        <p className="text-xl font-extrabold text-slate-900 font-mono">{totalMbdCollected}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Average Turnout Rate</p>
                        <p className="text-xl font-extrabold text-[#C21C24] font-mono">{avgMbdTurnout}%</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Deferral Records</p>
                        <p className="text-xl font-extrabold text-amber-600 font-mono">{mbdData.reduce((s,i)=>s+i.deferrals,0)}</p>
                      </div>
                    </div>

                    {/* Camps Table */}
                    <div className="overflow-x-auto border border-slate-150 rounded-lg">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-450 uppercase tracking-wider text-left">
                          <tr>
                            <th className="px-6 py-3">MBD Venue / Campaign</th>
                            <th className="px-6 py-3 text-center">Date</th>
                            <th className="px-6 py-3 text-center">Target (bags)</th>
                            <th className="px-6 py-3 text-center">Collected (bags)</th>
                            <th className="px-6 py-3 text-center">Turnout</th>
                            <th className="px-6 py-3 text-center">Deferrals</th>
                            <th className="px-6 py-3 text-center">Serology Positive (NCU)</th>
                            <th className="px-6 py-3 text-center">Serology Negative (NS)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                          {mbdData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30">
                              <td className="px-6 py-4 font-bold text-slate-900">{item.venue}</td>
                              <td className="px-6 py-4 text-center text-slate-500 font-mono">{item.date}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-600 font-mono">{item.target}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-800 font-mono">{item.collected}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-900 font-mono">{Math.round((item.collected/item.target)*100)}%</td>
                              <td className="px-6 py-4 text-center text-amber-600 font-mono">{item.deferrals}</td>
                              <td className="px-6 py-4 text-center text-rose-600 font-mono">{item.ncu}</td>
                              <td className="px-6 py-4 text-center text-emerald-700 font-mono">{item.ns}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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

      {/* HOSPITAL CRUD MODAL */}
      {showHospitalModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-xl fade-in">
            <h4 className="font-bold text-sm text-slate-900 mb-1 tracking-tight">
              {editingHospital ? 'Edit Hospital / Blood Centre' : 'Add Hospital / Blood Centre'}
            </h4>
            <p className="text-xs text-slate-400 mb-5">All fields are used for the distribution algorithm and emergency contact lookup.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hospital / Centre Name</label>
                <input type="text" value={hospitalForm.name} onChange={e => setHospitalForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Davao Medical School Foundation" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition bg-slate-50/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Type</label>
                <select value={hospitalForm.type} onChange={e => setHospitalForm(f => ({...f, type: e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50/50 outline-none focus:border-slate-800">
                  <option>Government</option>
                  <option>Private</option>
                  <option>Blood Bank</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Contact Person</label>
                <input type="text" value={hospitalForm.contact} onChange={e => setHospitalForm(f => ({...f, contact: e.target.value}))} placeholder="Dr. Juan Dela Cruz" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition bg-slate-50/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
                <input type="text" value={hospitalForm.phone} onChange={e => setHospitalForm(f => ({...f, phone: e.target.value}))} placeholder="0917-000-0000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition bg-slate-50/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                <input type="email" value={hospitalForm.email} onChange={e => setHospitalForm(f => ({...f, email: e.target.value}))} placeholder="blood@hospital.ph" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition bg-slate-50/50" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Address</label>
                <input type="text" value={hospitalForm.address} onChange={e => setHospitalForm(f => ({...f, address: e.target.value}))} placeholder="Purok 5, Tigatto, Davao City" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition bg-slate-50/50" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 text-xs font-semibold mt-5">
              <button onClick={() => setShowHospitalModal(false)} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-650 rounded hover:bg-slate-100 transition-all">Cancel</button>
              <button
                onClick={() => {
                  if (!hospitalForm.name.trim()) return alert('Hospital name is required.');
                  if (editingHospital) {
                    updateHospital(editingHospital.id, hospitalForm);
                  } else {
                    addHospital(hospitalForm);
                  }
                  setShowHospitalModal(false);
                }}
                className="px-4 py-2 bg-[#C21C24] text-white rounded hover:bg-[#A8181F] transition-all shadow-sm"
              >
                {editingHospital ? 'Save Changes' : 'Add Hospital'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution log detail is now an inline page (tab === 'dist_record_detail'), not a modal */}

      {/* ALLOCATE CONFIRMATION MODAL */}
      {showAllocateModal && allocateTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAllocateModal(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm modal-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white rounded-t-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Allocation</p>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">Release Blood Stock</h4>
            </div>
            <div className="p-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are about to release{' '}
                  <span className="font-black text-slate-900">{allocateTarget.units} bags</span> of{' '}
                  <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-[#C21C24] font-black rounded text-[11px] font-mono">{allocateTarget.bloodType}</span>{' '}
                  to <span className="font-bold text-slate-900">{allocateTarget.hospitalName}</span>.
                </p>
                <p className="text-[10px] text-slate-500 mt-2">This will immediately decrement the inventory and log the distribution. This action cannot be undone.</p>
              </div>
              <div className="flex gap-2.5 text-xs font-semibold">
                <button
                  onClick={() => setShowAllocateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-100 transition"
                >Cancel</button>
                <button
                  onClick={() => {
                    recordDistribution(allocateTarget.hospitalId, allocateTarget.hospitalName, allocateTarget.bloodType, allocateTarget.units);
                    setShowAllocateModal(false);
                    setAllocateTarget(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
                >Confirm Allocate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH SMS RECALL CONFIRMATION MODAL */}
      {showSmsConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowSmsConfirmModal(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm modal-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm SMS Dispatch</p>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">Send Donor Recall Messages</h4>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">You are about to send <span className="font-black text-slate-900">automated SMS recall messages</span> to all eligible donors (85–90 day interval complete) via the <span className="font-bold text-blue-700">Semaphore Philippine Gateway</span>.</p>
                <p className="text-[10px] text-slate-500 bg-white/70 border border-blue-100 rounded-lg p-2.5 font-mono leading-relaxed">"Hello [Donor]. Your 90-day donation interval is complete! You are eligible to donate again. Visit bloodlinkdvo.ph."</p>
              </div>
              <div className="flex gap-2.5 text-xs font-semibold">
                <button
                  onClick={() => setShowSmsConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-100 transition"
                >Cancel</button>
                <button
                  onClick={() => {
                    dispatchEligibilityReminders();
                    setShowSmsConfirmModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
                ><Send className="w-3.5 h-3.5" /> Confirm Dispatch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SYSTEM USER MODAL */}
      {showAddUserModal && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setShowAddUserModal(false); setUserSaved(false); }}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md modal-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white rounded-t-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Tool</p>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">Register New System User</h4>
            </div>
            <div className="p-6 space-y-4">
              {userSaved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-lg text-xs font-bold text-center">
                  User registered successfully!
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" value={addUserForm.name} onChange={e => setAddUserForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dr. Jane Doe" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-slate-50/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={addUserForm.email} onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))} placeholder="jane.doe@bloodlink.dvo" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-slate-50/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">Assigned Role</label>
                <select value={addUserForm.role} onChange={e => setAddUserForm(f => ({ ...f, role: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50/50 outline-none focus:border-slate-800">
                  <option>Registry Staff</option>
                  <option>Blood Bank Staff</option>
                  <option>Issuance Personnel</option>
                  <option>Hospital User</option>
                  <option>Administrator</option>
                  <option>Super Admin</option>
                </select>
              </div>
              {addUserForm.role === 'Hospital User' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">Requesting Hospital / Facility</label>
                  <select value={addUserForm.hospitalId} onChange={e => setAddUserForm(f => ({ ...f, hospitalId: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50/50 outline-none focus:border-slate-800">
                    <option value="">Select hospital...</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2.5 text-xs font-semibold pt-2">
                <button
                  onClick={() => { setShowAddUserModal(false); setUserSaved(false); }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-655 rounded-lg hover:bg-slate-100 transition"
                >Cancel</button>
                <button
                  onClick={() => {
                    if (!addUserForm.name.trim() || !addUserForm.email.trim()) return alert('Name and email are required.');
                    addUser(addUserForm);
                    setUserSaved(true);
                    setAddUserForm({ name: '', role: 'Registry Staff', email: '', hospitalId: '' });
                    setTimeout(() => {
                      setUserSaved(false);
                      setShowAddUserModal(false);
                    }, 1200);
                  }}
                  className="flex-1 px-4 py-2.5 bg-purple-650 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
                >Register User</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
