import React, { useState } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import {
  Archive, Stethoscope, LogOut,
  CheckCircle, XCircle, Droplets, Clock, Activity, AlertTriangle, Database, FileText, Plus, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bloodlinkLogo from '../assets/bloodlinks_logo/bloodlink-logo.png';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const COMPONENTS = ['PRBC', 'Platelet Concentrate', 'FFP', 'Cryoprecipitate', 'Cryosupernate'];
const SAFETY_STATUSES = ['Cleared', 'Hold-Quarantined', 'NCU', 'NS', 'Discarded'];
const INTENDED_USES = ['Transfusable', 'Storage-Research Only', 'Restricted'];

const emptyUnitForm = {
  unitRefId: '',
  donationId: '',
  bloodType: 'O+',
  component: 'PRBC',
  collectionDate: new Date().toISOString().slice(0, 10),
  expirationDate: '',
  quantity: '450',
  safetyStatus: 'Cleared',
  intendedUse: 'Transfusable',
  inventoryStatus: 'Available'
};

export default function BloodBankDashboard() {
  const { donors, inventory, bloodRequests, approveRequest, rejectRequest, updateInventoryUnits, recordBloodUnit, bloodInventory, donations } = useBloodStore();
  const [tab, setTab] = useState('inventory'); // 'inventory' | 'requests'
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitForm, setUnitForm] = useState(emptyUnitForm);
  const [unitSaved, setUnitSaved] = useState(false);
  const [donationSearch, setDonationSearch] = useState('');

  const handleUnitSubmit = (e) => {
    e.preventDefault();
    recordBloodUnit(unitForm);
    setUnitSaved(true);
    setTimeout(() => { setUnitSaved(false); setUnitForm(emptyUnitForm); setShowUnitForm(false); setDonationSearch(''); }, 2000);
  };

  // Filter requests that are still Pending
  const pendingRequests = bloodRequests.filter(req => req.status === 'Pending');
  const pastRequests = bloodRequests.filter(req => req.status !== 'Pending');

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">

      {/* SIDEBAR NAVIGATION (consistent with AdminDashboard) */}
      <aside className="sidebar flex flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          {/* Logo Section */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={bloodlinkLogo} alt="BloodLink" className="h-10 w-auto object-contain flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-900 tracking-tight leading-tight">BloodLink</p>
                <p className="text-slate-500 text-[10px] font-bold">Blood Bank Portal</p>
              </div>
            </div>
          </div>

          {/* User Identity Panel */}
          <div className="mx-4 mt-4 mb-2 bg-slate-50 border border-slate-200/60 rounded-lg p-3">
            <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-0.5">Role Desk</p>
            <p className="text-slate-800 font-bold text-xs">Blood Bank Staff</p>
            <p className="text-slate-500 text-[10px] font-medium">Inventory & Issuance</p>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="flex-1 py-2 overflow-y-auto">
            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-3 mb-1 tracking-widest">Main Modules</p>

            <button
              onClick={() => setTab('inventory')}
              className={`w-full text-left nav-link ${tab === 'inventory' ? 'active' : ''}`}
            >
              <Droplets className="nav-icon" />
              <span>Component Inventory</span>
            </button>

            <button
              onClick={() => setTab('requests')}
              className={`w-full text-left nav-link ${tab === 'requests' ? 'active' : ''}`}
            >
              <Stethoscope className="nav-icon" />
              <span>Issuance Requests</span>
              {pendingRequests.length > 0 && (
                <span className="ml-auto bg-[#C21C24] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="w-full inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Exit Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="content-area flex flex-col flex-1 min-h-screen bg-slate-50">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <div>
            <h2 className="text-slate-900 font-bold text-sm leading-tight">
              {tab === 'inventory' ? 'Blood Component Inventory' : 'Hospital Issuance Queue'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
              {tab === 'inventory' ? 'Live tracking of PRBC, FFP, Cryoprecipitate, and Cryosupernate levels' : 'Review pending requests and process blood unit issuance'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">Operations Center</p>
              <p className="text-[10px] text-slate-400">Bajada HQ, Davao City</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
              BB
            </span>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="p-8 flex-1 space-y-6">

          {/* TAB 1: INVENTORY */}
          {tab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Current Blood Stock</h3>
                  <p className="text-xs text-slate-455 mt-0.5">Real-time status of PRBC, Platelets, FFP, Cryoprecipitate and Cryosupernate.</p>
                </div>
                <button
                  onClick={() => setShowUnitForm(true)}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Blood Unit
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-655">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3 font-bold">Blood Type</th>
                        <th className="px-6 py-3 font-bold text-center border-l border-slate-100">PRBC (Units)</th>
                        <th className="px-6 py-3 font-bold text-center border-l border-slate-100">Platelets</th>
                        <th className="px-6 py-3 font-bold text-center border-l border-slate-100">FFP</th>
                        <th className="px-6 py-3 font-bold text-center border-l border-slate-100">Cryoprecipitate</th>
                        <th className="px-6 py-3 font-bold text-center border-l border-slate-100">Cryosupernate</th>
                        <th className="px-6 py-3 font-bold text-center border-l border-slate-100">PRBC Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map((item) => (
                        <tr key={item.type} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[10px] font-mono shadow-sm">
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center border-l border-slate-100 font-bold text-sm text-slate-800">
                            {item.units}
                          </td>
                          <td className="px-6 py-3.5 text-center border-l border-slate-100 font-bold text-slate-600">
                            {item.platelets || 0}
                          </td>
                          <td className="px-6 py-3.5 text-center border-l border-slate-100 font-bold text-slate-600">
                            {item.ffp || 0}
                          </td>
                          <td className="px-6 py-3.5 text-center border-l border-slate-100 font-bold text-slate-600">
                            {item.cryo || 0}
                          </td>
                          <td className="px-6 py-3.5 text-center border-l border-slate-100 font-bold text-slate-600">
                            {item.cryosup || 0}
                          </td>
                          <td className="px-6 py-3.5 text-center border-l border-slate-100">
                            {item.status === 'safe' && <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Safe</span>}
                            {item.status === 'low' && <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1"><Activity className="w-3 h-3" /> Low</span>}
                            {item.status === 'critical' && <span className="bg-rose-50 border border-rose-100 text-[#C21C24] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PHYSICAL BLOOD BAG REGISTRY (Table 9) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                    <Database className="w-4 h-4 text-indigo-600" /> Physical Blood Bag Registry (Table 9)
                  </h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                    Total: {bloodInventory ? bloodInventory.length : 0} bags
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3 font-bold">Unit ID</th>
                        <th className="px-5 py-3 font-bold">Donation ID</th>
                        <th className="px-5 py-3 font-bold text-center">Type</th>
                        <th className="px-5 py-3 font-bold">Component</th>
                        <th className="px-5 py-3 font-bold text-center">Collected</th>
                        <th className="px-5 py-3 font-bold text-center">Expiry</th>
                        <th className="px-5 py-3 font-bold text-center">Qty (mL)</th>
                        <th className="px-5 py-3 font-bold text-center">Safety</th>
                        <th className="px-5 py-3 font-bold">Intended Use</th>
                        <th className="px-5 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {(bloodInventory || []).map(unit => (
                        <tr key={unit.unitId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 font-mono font-bold text-slate-900">{unit.unitId}</td>
                          <td className="px-5 py-3 font-mono text-slate-400 text-[10px]">{unit.donationId}</td>
                          <td className="px-5 py-3 text-center">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded text-[10px] font-mono shadow-sm">
                              {unit.bloodTypeId}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-700">{unit.componentId}</td>
                          <td className="px-5 py-3 text-center font-mono text-[10px]">{unit.collectionDate || '—'}</td>
                          <td className="px-5 py-3 text-center font-mono text-[10px]">{unit.expirationDate}</td>
                          <td className="px-5 py-3 text-center font-bold text-slate-800">{unit.quantity} mL</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              unit.safetyStatus === 'Cleared' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              unit.safetyStatus === 'Hold-Quarantined' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {unit.safetyStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-600">{unit.intendedUse}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              unit.inventoryStatus === 'Available' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              unit.inventoryStatus === 'Issued' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              unit.inventoryStatus === 'Expired' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {unit.inventoryStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISSUANCE REQUESTS */}
          {tab === 'requests' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* Pending Requests Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                    <Clock className="w-4 h-4 text-amber-500" /> Pending Approval ({pendingRequests.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3 font-bold">Ref No / Hospital</th>
                        <th className="px-6 py-3 font-bold text-center">Blood Type</th>
                        <th className="px-6 py-3 font-bold text-center">Units</th>
                        <th className="px-6 py-3 font-bold">Diagnosis / Ward</th>
                        <th className="px-6 py-3 font-bold">Contact Person</th>
                        <th className="px-6 py-3 text-center font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingRequests.map(req => (
                        <tr key={req.refNo} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-mono text-[10px] font-bold text-slate-400">{req.refNo}</p>
                            <p className="font-bold text-slate-900 mt-0.5">{req.hospital}</p>
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5">{req.submittedAt}</p>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded text-[10px] font-mono shadow-sm">
                              {req.patientBloodType || req.bloodType}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center font-bold text-slate-800 text-sm">
                            {req.units}
                          </td>
                          <td className="px-6 py-3.5 font-normal">
                            <p className="font-semibold text-slate-700">{req.diagnosis || req.notes || 'Routine Clinic Use'}</p>
                            {req.ward && <p className="text-[10px] text-slate-400 mt-0.5">{req.ward}</p>}
                          </td>
                          <td className="px-6 py-3.5 font-normal">
                            <p className="font-semibold text-slate-800">{req.contactPerson}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{req.contactNumber}</p>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => approveRequest(req.refNo)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => rejectRequest(req.refNo)}
                                className="bg-white border border-slate-250 text-rose-650 hover:bg-rose-50/50 px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingRequests.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-450 font-normal">
                            No pending blood requests at this time.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Processed Requests */}
              {pastRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Processed Requests Log</h3>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs font-semibold text-slate-655">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                          <th className="px-6 py-3">Ref No</th>
                          <th className="px-6 py-3">Hospital</th>
                          <th className="px-6 py-3 text-center">Request Detail</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pastRequests.map(req => (
                          <tr key={req.refNo}>
                            <td className="px-6 py-3.5 font-mono text-[10px] font-bold text-slate-400">{req.refNo}</td>
                            <td className="px-6 py-3.5 font-bold text-slate-900">{req.hospital}</td>
                            <td className="px-6 py-3.5 text-center font-bold text-slate-800">{req.units}x {req.patientBloodType || req.bloodType}</td>
                            <td className="px-6 py-3.5">
                              {req.status === 'Approved' ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Issued</span>
                              ) : (
                                <span className="text-[#C21C24] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── RECORD BLOOD UNIT MODAL (Table 9) ── */}
      {showUnitForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl flex-shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Bank Staff · Table 9: Blood Inventory</p>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Record Blood Unit</h3>
                </div>
                <button onClick={() => { setShowUnitForm(false); setDonationSearch(''); }} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUnitSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

              {/* Row 1: Link Donation ID / Donor (Full Width) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Link Donation ID / Donor <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="Search Donor Name, ID, or Donation ID..."
                  value={donationSearch}
                  onChange={e => { setDonationSearch(e.target.value); setUnitForm({ ...unitForm, donationId: '' }); }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Donation record selector with Donor Name lookup */}
              {(() => {
                const q = donationSearch.toLowerCase().trim();
                // If query is empty or matches the currently selected/active donation, hide suggestions
                if (!q || (unitForm.donationId && donationSearch.includes(unitForm.donationId))) return null;

                const filtered = (donations || []).map(d => {
                  const donor = (donors || []).find(donorObj => donorObj.id.toLowerCase() === d.donorId.toLowerCase());
                  return { ...d, donorName: donor ? donor.name : 'Unknown Donor' };
                }).filter(d => {
                  return d.donationId.toLowerCase().includes(q) || 
                         d.donorId.toLowerCase().includes(q) || 
                         d.donorName.toLowerCase().includes(q);
                });

                if (filtered.length === 0) return (
                  <p className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                    No matching donation records found.
                  </p>
                );

                return (
                  <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100 shadow-inner">
                    {filtered.map(d => (
                      <button key={d.donationId} type="button"
                        onClick={() => {
                          setUnitForm(f => ({ ...f, donationId: d.donationId, bloodType: d.bloodTypeId || f.bloodType }));
                          setDonationSearch(`${d.donorName} (${d.donationId})`);
                        }}
                        className={`w-full text-left p-2.5 text-xs flex justify-between items-center transition-all hover:bg-slate-50 ${
                          unitForm.donationId === d.donationId ? 'bg-indigo-50 border-l-4 border-indigo-600 font-bold text-indigo-900' : 'text-slate-700'
                        }`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800 text-xs">{d.donorName}</span>
                          <span className="text-[10px] text-slate-400">Donor ID: {d.donorId} · Date: {d.donationDate}</span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {d.donationId}
                          </span>
                          {d.bloodTypeId && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[9px] font-mono border border-slate-200">
                              {d.bloodTypeId}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Row 2: Blood Type + Component */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Blood Type <span className="text-rose-500">*</span></label>
                  <select required value={unitForm.bloodType} onChange={e => setUnitForm({ ...unitForm, bloodType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                    {BLOOD_TYPES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Blood Component <span className="text-rose-500">*</span></label>
                  <select required value={unitForm.component} onChange={e => setUnitForm({ ...unitForm, component: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                    {COMPONENTS.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Collection Date + Expiration Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Collection Date <span className="text-rose-500">*</span></label>
                  <input type="date" required value={unitForm.collectionDate}
                    onChange={e => setUnitForm({ ...unitForm, collectionDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiration Date <span className="text-rose-500">*</span></label>
                  <input type="date" required value={unitForm.expirationDate}
                    onChange={e => setUnitForm({ ...unitForm, expirationDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>

              {/* Row 4: Quantity */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity / Volume (mL) <span className="text-rose-500">*</span></label>
                <input type="number" required min="1" step="0.01" value={unitForm.quantity}
                  onChange={e => setUnitForm({ ...unitForm, quantity: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="e.g. 450" />
              </div>

              {/* Row 5: Safety Status + Intended Use */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Safety Status <span className="text-rose-500">*</span></label>
                  <select required value={unitForm.safetyStatus} onChange={e => setUnitForm({ ...unitForm, safetyStatus: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${
                      unitForm.safetyStatus !== 'Cleared' ? 'border-amber-200 bg-amber-50 text-amber-700 font-bold' : 'border-slate-200 bg-white focus:ring-2 focus:ring-slate-900'
                    }`}>
                    {SAFETY_STATUSES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Intended Use <span className="text-rose-500">*</span></label>
                  <select required value={unitForm.intendedUse} onChange={e => setUnitForm({ ...unitForm, intendedUse: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                    {INTENDED_USES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 6: Inventory Status */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Inventory Status <span className="text-rose-500">*</span></label>
                <select required value={unitForm.inventoryStatus} onChange={e => setUnitForm({ ...unitForm, inventoryStatus: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                  {['Available', 'Issued', 'Expired', 'Discarded'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {unitSaved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Unit recorded successfully! Inventory updated.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUnitForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Commit Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
