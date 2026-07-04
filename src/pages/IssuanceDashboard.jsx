import React, { useState } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import {
  LogOut, Plus, Clock,
  CheckCircle, XCircle, AlertTriangle, FileText,
  Droplets, X, Activity, Database, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bloodlinkLogo from '../assets/bloodlinks_logo/bloodlink-logo.png';

const COMPONENTS = ['PRBC', 'Platelet Concentrate', 'FFP', 'Cryoprecipitate', 'Cryosupernate'];

const HOSPITALS = [
  { id: 'HOSP-001', name: 'Southern Philippines Medical Center (SPMC)' },
  { id: 'HOSP-002', name: 'Davao Doctors Hospital' },
  { id: 'HOSP-003', name: 'San Pedro Hospital' },
  { id: 'HOSP-004', name: 'Philippine Red Cross – Davao Chapter' },
];

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const emptyForm = {
  hospital: 'Southern Philippines Medical Center (SPMC)',
  hospitalId: 'HOSP-001',
  patientBloodType: 'O+',
  units: 1,
  urgency: 'routine',
  dateNeeded: '',
  contactPerson: '',
  contactNumber: '',
  diagnosis: '',
  ward: '',
  notes: '',
  hospitalRefNo: '',
};

export default function IssuanceDashboard() {
  const { bloodRequests, inventory, addBloodRequest, approveRequest, rejectRequest, authSystemUser } = useBloodStore();

  const role           = authSystemUser?.role || 'Hospital User';
  const isHospitalUser  = role === 'Hospital User';
  const isIssuanceStaff = role === 'Issuance Personnel';
  const hospitalId      = authSystemUser?.hospitalId || 'HOSP-001';

  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ ...emptyForm, component: 'PRBC' });
  const [submitted,  setSubmitted]  = useState(null);
  const [viewingReq, setViewingReq] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [activeTab,  setActiveTab]  = useState('queue');

  const myRequests   = isHospitalUser
    ? bloodRequests.filter(r => r.hospitalId === hospitalId)
    : bloodRequests;
  const pendingCount  = myRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'Approved').length;
  const getInv = (type) => inventory.find(i => i.type === type);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'hospital') {
      const h = HOSPITALS.find(h => h.name === value);
      setForm(f => ({ ...f, hospital: value, hospitalId: h?.id || '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const refNo = addBloodRequest({ ...form, units: Number(form.units) });
    setSubmitted(refNo);
    setShowForm(false);
    setForm(emptyForm);
  };

  const urgencyConfig = {
    urgent:    { label: 'Urgent',    cls: 'bg-rose-50 text-[#C21C24] border-rose-200' },
    routine:   { label: 'Routine',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    scheduled: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  };

  const statusConfig = {
    Pending:  { icon: <Clock className="w-3 h-3" />,        cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    Approved: { icon: <CheckCircle className="w-3 h-3" />,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    Rejected: { icon: <XCircle className="w-3 h-3" />,      cls: 'bg-rose-50 text-[#C21C24] border-rose-100' },
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">

      {/* SIDEBAR */}
      <aside className="sidebar flex flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={bloodlinkLogo} alt="BloodLink" className="h-10 w-auto object-contain flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-900 tracking-tight leading-tight">BloodLink</p>
                <p className="text-[#C21C24] text-[10px] font-bold">{isHospitalUser ? 'Hospital Portal' : 'Issuance Portal'}</p>
              </div>
            </div>
          </div>

          <div className="mx-4 mt-4 mb-2 bg-slate-50 border border-slate-200/60 rounded-lg p-3">
            <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-0.5">Role Desk</p>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#C21C24]" />
              <p className="text-slate-800 font-bold text-xs">{role}</p>
            </div>
            <p className="text-slate-500 text-[10px] font-medium mt-0.5">
              {isHospitalUser ? `Facility ID: ${hospitalId}` : 'SNBC Issuance Center'}
            </p>
          </div>

          <nav className="flex-1 py-2 overflow-y-auto">
            <p className="text-slate-400 text-[9px] font-bold uppercase px-4 mt-3 mb-1 tracking-widest">Main Modules</p>
            <button onClick={() => setActiveTab('queue')}
              className={`w-full text-left nav-link ${activeTab === 'queue' ? 'active' : ''}`}>
              <FileText className="nav-icon" />
              <span>{isHospitalUser ? 'My Requests' : 'Issuance Queue'}</span>
              {pendingCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{pendingCount}</span>
              )}
            </button>
            {isIssuanceStaff && (
              <button onClick={() => setActiveTab('inventory')}
                className={`w-full text-left nav-link ${activeTab === 'inventory' ? 'active' : ''}`}>
                <Database className="nav-icon" />
                <span>Inventory Check</span>
              </button>
            )}
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

        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <div>
            <h2 className="text-slate-900 font-bold text-sm leading-tight">
              {isHospitalUser ? 'Blood Request Portal' : activeTab === 'inventory' ? 'Inventory Check' : 'Issuance Queue'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
              {isHospitalUser ? 'Logistics-only - RA 10173 compliant' : activeTab === 'inventory' ? 'Current blood component stock' : 'Review and fulfill hospital blood requests'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isHospitalUser && (
              <button onClick={() => { setShowForm(true); setSubmitted(null); }}
                className="bg-[#C21C24] hover:bg-[#A8181F] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> New Blood Request
              </button>
            )}
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{authSystemUser?.name || 'Staff'}</p>
              <p className="text-[10px] text-slate-400">{role}</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 text-[#C21C24] font-bold flex items-center justify-center text-xs">
              {isHospitalUser ? 'HU' : 'IP'}
            </span>
          </div>
        </header>

        <main className="p-8 flex-1 space-y-6">

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-900 text-sm">Request submitted successfully!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Ref No: <span className="font-mono font-bold">{submitted}</span> - awaiting Issuance Personnel review.</p>
                </div>
              </div>
              <button onClick={() => setSubmitted(null)} className="text-emerald-500 hover:text-emerald-700"><X className="w-4 h-4" /></button>
            </div>
          )}

          {isIssuanceStaff && activeTab === 'queue' && (
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">RA 10173 Data Privacy Notice</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Patient-identifiable clinical data is restricted. Queue shows logistics data only (blood type, component, units, urgency, ward).</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Requests',    val: myRequests.length,  color: 'bg-slate-900 text-white' },
              { label: 'Pending Review',    val: pendingCount,       color: 'bg-amber-500 text-white' },
              { label: 'Approved & Issued', val: approvedCount,      color: 'bg-emerald-600 text-white' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-xl p-5 shadow-sm`}>
                <p className="text-3xl font-extrabold">{s.val}</p>
                <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {activeTab === 'queue' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#C21C24]" />
                  {isHospitalUser ? 'My Blood Requests' : 'Hospital Issuance Queue'}
                </h3>
                {isIssuanceStaff && pendingCount > 0 && (
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">{pendingCount} pending</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3 font-bold">Ref No</th>
                      <th className="px-6 py-3 font-bold">Hospital</th>
                      <th className="px-6 py-3 font-bold text-center">Blood / Component</th>
                      <th className="px-6 py-3 font-bold text-center">Urgency</th>
                      <th className="px-6 py-3 font-bold">Submitted</th>
                      <th className="px-6 py-3 font-bold text-center">Status</th>
                      {isIssuanceStaff && <th className="px-6 py-3 font-bold text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRequests.map(req => {
                      const urgency  = urgencyConfig[req.urgency] || urgencyConfig.routine;
                      const status   = statusConfig[req.status]   || statusConfig.Pending;
                      const inv      = getInv(req.patientBloodType);
                      const hasStock = inv && inv.units >= (req.units || 0);
                      return (
                        <tr key={req.refNo} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono font-bold text-slate-400">{req.refNo}</td>
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-900">{req.hospital}</p>
                            {req.ward && <p className="text-[10px] text-slate-400 font-normal mt-0.5">{req.ward}</p>}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-[#C21C24] font-black text-[10px] border border-rose-100 font-mono">{req.patientBloodType}</span>
                              <span className="text-[10px] text-slate-500 font-bold">{req.units} Units</span>
                              {req.component && <span className="text-[9px] text-slate-400">{req.component}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${urgency.cls}`}>{urgency.label}</span>
                          </td>
                          <td className="px-6 py-3.5 font-mono font-normal text-slate-500">{req.submittedAt}</td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${status.cls}`}>{status.icon} {req.status}</span>
                          </td>
                          {isIssuanceStaff && (
                            <td className="px-6 py-3.5 text-center">
                              {req.status === 'Pending' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${hasStock ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-[#C21C24] border-rose-100'}`}>{inv ? `${inv.units} avail` : 'No stock'}</span>
                                  <button onClick={() => approveRequest(req.refNo)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                                  <button onClick={() => setViewingReq(req)} className="text-[#C21C24] hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {myRequests.length === 0 && (
                      <tr><td colSpan={isIssuanceStaff ? 7 : 6} className="px-6 py-8 text-center text-slate-400 font-normal">No blood requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isIssuanceStaff && activeTab === 'inventory' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C21C24]" />
                <h3 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Current Blood Component Stock</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3 font-bold">Blood Type</th>
                      <th className="px-6 py-3 font-bold text-center">PRBC</th>
                      <th className="px-6 py-3 font-bold text-center">Platelets</th>
                      <th className="px-6 py-3 font-bold text-center">FFP</th>
                      <th className="px-6 py-3 font-bold text-center">Cryo</th>
                      <th className="px-6 py-3 font-bold text-center">CryoSup</th>
                      <th className="px-6 py-3 font-bold text-center">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map(item => (
                      <tr key={item.type} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-[#C21C24] font-black border border-rose-100 text-[10px] font-mono">{item.type}</span></td>
                        <td className="px-6 py-3 text-center font-bold text-slate-800">{item.units}</td>
                        <td className="px-6 py-3 text-center text-slate-600">{item.platelets || 0}</td>
                        <td className="px-6 py-3 text-center text-slate-600">{item.ffp || 0}</td>
                        <td className="px-6 py-3 text-center text-slate-600">{item.cryo || 0}</td>
                        <td className="px-6 py-3 text-center text-slate-600">{item.cryosup || 0}</td>
                        <td className="px-6 py-3 text-center">
                          {item.status === 'safe'     && <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Safe</span>}
                          {item.status === 'low'      && <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1"><Activity className="w-3 h-3" />Low</span>}
                          {item.status === 'critical' && <span className="bg-rose-50 border border-rose-100 text-[#C21C24] px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Critical</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* NEW REQUEST MODAL (Hospital User) */}
      {showForm && isHospitalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-sm">New Blood Request</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Logistics-only - no patient-identifiable data (RA 10173)</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">

                {/* Hospital */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Requesting Hospital <span className="text-[#C21C24]">*</span></label>
                  <select name="hospital" required value={form.hospital} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                    {HOSPITALS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>

                {/* Blood Type + Units */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Blood Type <span className="text-[#C21C24]">*</span></label>
                    <select name="patientBloodType" required value={form.patientBloodType} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Units Needed <span className="text-[#C21C24]">*</span></label>
                    <input required type="number" name="units" min="1" max="20" value={form.units} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                </div>

                {/* Urgency + Date Needed */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Urgency Level <span className="text-[#C21C24]">*</span></label>
                    <select name="urgency" required value={form.urgency} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      <option value="urgent">Urgent</option>
                      <option value="routine">Routine</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Date Needed <span className="text-[#C21C24]">*</span></label>
                    <input required type="date" name="dateNeeded" value={form.dateNeeded} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none text-slate-600" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Patient names, IDs, and clinical diagnoses are not collected here per RA 10173. Use clinical indication category only.</span>
                </div>

                {/* Blood Type + Component */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Blood Type <span className="text-[#C21C24]">*</span></label>
                    <select name="patientBloodType" required value={form.patientBloodType} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      {BLOOD_TYPES.map(bt => <option key={bt}>{bt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Component <span className="text-[#C21C24]">*</span></label>
                    <select name="component" required value={form.component || 'PRBC'} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      {COMPONENTS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Clinical Indication + Ward */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Indication (Category) <span className="text-[#C21C24]">*</span></label>
                    <select required name="clinicalIndication" value={form.clinicalIndication} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      <option value="">Select indication...</option>
                      {['Surgical Support','Trauma / Emergency','Oncology Support','Obstetric Hemorrhage','Anemia Management','Pediatric Transfusion','Cardiac Surgery','Burns / Critical Care','Other'].map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Ward / Location</label>
                    <input type="text" name="ward" value={form.ward} onChange={handleChange}
                      placeholder="e.g. Ward 4B, Room 201"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                </div>

                {/* Contact Person + Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Person <span className="text-[#C21C24]">*</span></label>
                    <input required type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange}
                      placeholder="e.g. Dr. Juan Dela Cruz"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Number <span className="text-[#C21C24]">*</span></label>
                    <input required type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange}
                      placeholder="+63 917 000 0000"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                </div>

                {/* Hospital Reference + Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Hospital Reference No.</label>
                  <input type="text" name="hospitalRefNo" value={form.hospitalRefNo} onChange={handleChange}
                    placeholder="e.g. SPMC-2026-04821"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Additional Notes</label>
                  <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                    placeholder="Any special instructions or clinical context..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none resize-none" />
                </div>

                {/* Urgent Warning */}
                {form.urgency === 'urgent' && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-[#C21C24] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#C21C24] font-semibold leading-relaxed">
                      This request is marked <strong>URGENT</strong>. It will be prioritized and flagged for immediate Blood Bank Staff attention.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-4 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REJECT MODAL */}
      {viewingReq && isIssuanceStaff && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Reject Request {viewingReq.refNo}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{viewingReq.hospital} - {viewingReq.patientBloodType} x {viewingReq.units} units</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rejection Reason</label>
                <textarea rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                  placeholder="e.g. Insufficient stock, request mismatch..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setViewingReq(null); setRejectNote(''); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={() => { rejectRequest(viewingReq.refNo); setViewingReq(null); setRejectNote(''); }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#C21C24] hover:bg-[#A8181F] rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
