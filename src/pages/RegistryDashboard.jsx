import React, { useState, useMemo } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import {
  Users, PhoneCall, Search, Plus, CheckCircle, AlertCircle, 
  MapPin, Clock, Edit, Droplets, ArrowLeft, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegistryDashboard() {
  const { donors, inventory, addDonor } = useBloodStore();
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'recall'
  const [searchQuery, setSearchQuery] = useState('');

  // Add Donor Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDonorForm, setNewDonorForm] = useState({
    name: '', phone: '', bloodType: 'O+', sex: 'Female', dob: '', address: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const id = 'D' + String(Math.floor(Math.random() * 900) + 100);
    const newDonor = {
      ...newDonorForm,
      id,
      donationDate: new Date().toISOString().slice(0, 10),
      status: 'New',
      lastDonation: new Date().toISOString().slice(0, 10),
      remarks: 'Eligible',
      distance: 'Pending',
      totalDonations: 1
    };
    addDonor(newDonor);
    setShowAddModal(false);
    setNewDonorForm({ name: '', phone: '', bloodType: 'O+', sex: 'Female', dob: '', address: '' });
  };

  // 1. Donor Registry Data
  const filteredDonors = useMemo(() => {
    return donors.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [donors, searchQuery]);

  // 2. Donor Recall Logic (Eligible donors + Critical inventory)
  const criticalBloodTypes = useMemo(() => {
    return inventory.filter(i => i.status === 'critical').map(i => i.type);
  }, [inventory]);

  const recallDonors = useMemo(() => {
    return donors.filter(d => {
      // 90 days rule check (simplified for UI: assuming those in critical need are shown)
      const lastDonationDate = new Date(d.lastDonation);
      const daysSince = Math.floor((new Date() - lastDonationDate) / (1000 * 60 * 60 * 24));
      const isEligible = daysSince >= 90;
      
      // Match with critical inventory or just show all eligible if search is used
      return isEligible && criticalBloodTypes.includes(d.bloodType);
    });
  }, [donors, criticalBloodTypes]);

  // Handle Dispatch SMS (Mock)
  const handleRecall = (id) => {
    alert(`SMS Recall Dispatch triggered for Donor ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-blue-200 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-blue-700"></div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight tracking-wide">Registry Staff Portal</h1>
              <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">BloodLink DVO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold">Staff Member</span>
              <span className="text-[10px] text-blue-300">SNBC Registry Dept.</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center border border-blue-600">
              <Users className="w-4 h-4 text-blue-100" />
            </div>
            <Link to="/" className="p-2 text-blue-300 hover:text-white hover:bg-blue-700 rounded-lg transition-colors ml-2" title="Log Out">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / TABS */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('registry')}
            className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'registry' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Donor Registry
          </button>
          <button 
            onClick={() => setActiveTab('recall')}
            className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'recall' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall className="w-4 h-4" /> Recall Operations
            {recallDonors.length > 0 && (
              <span className="ml-1 bg-rose-100 text-[#C21C24] text-[10px] px-1.5 py-0.5 rounded-full">
                {recallDonors.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        
        {/* TAB 1: DONOR REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Donor Database</h2>
                <p className="text-sm text-slate-500 mt-1">Manage all registered blood donors across the network.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by name, ID, or Type..." 
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Donor
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-bold">Donor Details</th>
                    <th className="p-4 font-bold">Blood Type</th>
                    <th className="p-4 font-bold">Last Donation</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonors.map((donor) => {
                    const daysSince = Math.floor((new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24));
                    const isEligible = daysSince >= 90;

                    return (
                      <tr key={donor.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {donor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{donor.name}</p>
                              <p className="text-xs text-slate-500">{donor.id} • {donor.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-[#C21C24] font-extrabold text-xs border border-rose-100">
                            {donor.bloodType}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{donor.lastDonation}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            {isEligible ? (
                              <><CheckCircle className="w-3 h-3 text-emerald-500" /><span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Eligible</span></>
                            ) : (
                              <><AlertCircle className="w-3 h-3 text-amber-500" /><span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">Resting ({90 - daysSince} days left)</span></>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span className="text-xs leading-tight max-w-[150px]">{donor.address || 'Davao City'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredDonors.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                        No donors found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DONOR RECALL */}
        {activeTab === 'recall' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-blue-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4">
                <PhoneCall className="w-64 h-64" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-widest">Action Required</span>
                  <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Targeted Dispatch</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Critical Shortage Recall</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  The following donors are fully eligible (past 90-day rest) AND match the blood types currently listed as <strong className="text-white">CRITICAL</strong> across the hospital network ({criticalBloodTypes.join(', ') || 'None'}).
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-bold">Donor Details</th>
                    <th className="p-4 font-bold">Blood Type</th>
                    <th className="p-4 font-bold">Last Donation</th>
                    <th className="p-4 font-bold">Recall Status</th>
                    <th className="p-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recallDonors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {donor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{donor.name}</p>
                            <p className="text-xs text-slate-500">{donor.id} • {donor.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-[#C21C24] font-extrabold text-xs border border-rose-100">
                          {donor.bloodType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donor.lastDonation}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Ready (Past 90 Days)
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRecall(donor.id)}
                          className="bg-[#C21C24] hover:bg-[#A8181F] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors mx-auto"
                        >
                          <Droplets className="w-3.5 h-3.5" /> Trigger SMS Recall
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recallDonors.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-slate-900">No Critical Recalls Needed</h3>
                        <p className="text-sm text-slate-500 mt-1">There are currently no critical inventory shortages requiring targeted donor recalls.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── ADD DONOR MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden modal-in">
            <div className="bg-blue-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Register New Donor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-blue-200 hover:text-white transition-colors">
                <AlertCircle className="w-5 h-5 rotate-45" /> {/* simple cross icon alternative */}
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newDonorForm.name} onChange={e => setNewDonorForm({...newDonorForm, name: e.target.value})} placeholder="e.g. Juan P. Dela Cruz" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Type</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newDonorForm.bloodType} onChange={e => setNewDonorForm({...newDonorForm, bloodType: e.target.value})}>
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sex</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newDonorForm.sex} onChange={e => setNewDonorForm({...newDonorForm, sex: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input required type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" 
                    value={newDonorForm.dob} onChange={e => setNewDonorForm({...newDonorForm, dob: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input required type="tel" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newDonorForm.phone} onChange={e => setNewDonorForm({...newDonorForm, phone: e.target.value})} placeholder="+63 9xx" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Barangay</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newDonorForm.address} onChange={e => setNewDonorForm({...newDonorForm, address: e.target.value})} placeholder="e.g. Matina, Davao City" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors">
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
