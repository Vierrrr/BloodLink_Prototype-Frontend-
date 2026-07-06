import React, { useState } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import {
  LogOut, Plus, Clock,
  CheckCircle, XCircle, AlertTriangle, FileText,
  Droplets, X, Activity, Database, Shield, Trash2, ShoppingCart, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bloodlinkLogo from '../assets/bloodlinks_logo/bloodlink-logo.png';

const COMPONENTS = ['PRBC', 'Platelet Concentrate', 'FFP', 'Cryoprecipitate', 'Cryosupernate'];
const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const emptyForm = {
  urgency: 'routine',
  dateNeeded: '',
  contactPerson: '',
  contactNumber: '',
  ward: '',
  notes: '',
  hospitalRefNo: '',
  clinicalIndication: '',
};

const emptyCartItem = {
  bloodType: 'O+',
  component: 'PRBC',
  units: 1,
};

export default function IssuanceDashboard() {
  const { 
    bloodRequests, 
    inventory, 
    hospitals, 
    addBloodRequest, 
    approveRequest, 
    rejectRequest, 
    authSystemUser,
    bloodIssuance,
    bloodIssuanceDetails
  } = useBloodStore();

  const role           = authSystemUser?.role || 'Hospital User';
  const isHospitalUser  = role === 'Hospital User';
  const isIssuanceStaff = role === 'Issuance Personnel';
  const hospitalId      = authSystemUser?.hospitalId || 'HOSP-001';

  // Resolve the hospital name from the store
  const myHospital = hospitals?.find(h => h.id === hospitalId);
  const hospitalName = myHospital?.name || 'Unknown Hospital';

  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState({ ...emptyForm });
  const [cartItems,   setCartItems]   = useState([]);
  const [cartItem,    setCartItem]    = useState({ ...emptyCartItem });
  const [cartError,   setCartError]   = useState('');
  const [submitted,   setSubmitted]   = useState(null);
  const [viewingReq,  setViewingReq]  = useState(null);
  const [rejectNote,  setRejectNote]  = useState('');
  const [activeTab,   setActiveTab]   = useState('queue');
  const [detailMode,  setDetailMode]  = useState('reject'); // 'reject' | 'view'

  const myRequests   = isHospitalUser
    ? bloodRequests.filter(r => r.hospitalId === hospitalId)
    : bloodRequests;
  const pendingCount  = myRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'Approved').length;
  const getInv = (type) => inventory.find(i => i.type === type);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCartItemChange = (e) => {
    const { name, value } = e.target;
    setCartItem(ci => ({ ...ci, [name]: value }));
  };

  const handleAddToCart = () => {
    const units = Number(cartItem.units);
    if (!units || units < 1) {
      setCartError('Please enter a valid unit count (≥ 1).');
      return;
    }
    setCartItems(prev => [...prev, {
      bloodType: cartItem.bloodType,
      component: cartItem.component,
      units,
    }]);
    setCartItem({ ...emptyCartItem });
    setCartError('');
  };

  const handleRemoveCartItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setCartError('Please add at least one blood component to the requisition.');
      return;
    }
    const refNo = addBloodRequest({
      ...form,
      hospital: hospitalName,
      hospitalId,
      items: cartItems,
    });
    setSubmitted(refNo);
    setShowForm(false);
    setForm({ ...emptyForm });
    setCartItems([]);
    setCartItem({ ...emptyCartItem });
    setCartError('');
  };

  const openNewForm = () => {
    setForm({ ...emptyForm });
    setCartItems([]);
    setCartItem({ ...emptyCartItem });
    setCartError('');
    setSubmitted(null);
    setShowForm(true);
  };

  const openReject = (req) => {
    setDetailMode('reject');
    setViewingReq(req);
    setRejectNote('');
  };

  const openView = (req) => {
    setDetailMode('view');
    setViewingReq(req);
  };

  const urgencyConfig = {
    urgent:    { label: 'Urgent',    cls: 'bg-rose-50 text-[#C21C24] border-rose-200' },
    routine:   { label: 'Routine',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    emergency: { label: 'Emergency', cls: 'bg-red-600 text-white border-red-700 font-extrabold pulse' },
  };

  const statusConfig = {
    Pending:  { icon: <Clock className="w-3 h-3" />,        cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    Approved: { icon: <CheckCircle className="w-3 h-3" />,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    Rejected: { icon: <XCircle className="w-3 h-3" />,      cls: 'bg-rose-50 text-[#C21C24] border-rose-100' },
  };

  const componentColor = (comp) => {
    const map = {
      'PRBC': 'bg-rose-50 text-rose-700 border-rose-100',
      'Platelet Concentrate': 'bg-amber-50 text-amber-700 border-amber-100',
      'FFP': 'bg-blue-50 text-blue-700 border-blue-100',
      'Cryoprecipitate': 'bg-purple-50 text-purple-700 border-purple-100',
      'Cryosupernate': 'bg-teal-50 text-teal-700 border-teal-100',
    };
    return map[comp] || 'bg-slate-50 text-slate-600 border-slate-200';
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
            {isHospitalUser && (
              <p className="text-slate-500 text-[10px] font-medium mt-1 leading-tight">{hospitalName}</p>
            )}
            <p className="text-slate-400 text-[9px] font-medium mt-0.5">
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
              <>
                <button onClick={() => setActiveTab('inventory')}
                  className={`w-full text-left nav-link ${activeTab === 'inventory' ? 'active' : ''}`}>
                  <Database className="nav-icon" />
                  <span>Inventory Check</span>
                </button>
                <button onClick={() => setActiveTab('issuance_details')}
                  className={`w-full text-left nav-link ${activeTab === 'issuance_details' ? 'active' : ''}`}>
                  <Activity className="nav-icon" />
                  <span>Blood Issuance Details</span>
                </button>
              </>
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
              {isHospitalUser ? 'Blood Request Portal' : activeTab === 'inventory' ? 'Inventory Check' : activeTab === 'issuance_details' ? 'Blood Issuance Details' : 'Issuance Queue'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
              {isHospitalUser ? 'Logistics-only - RA 10173 compliant' : activeTab === 'inventory' ? 'Current blood component stock' : activeTab === 'issuance_details' ? 'Detailed records of issued units' : 'Review and fulfill hospital blood requests'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isHospitalUser && (
              <button onClick={openNewForm}
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
                  <p className="text-xs text-emerald-700 mt-0.5">Ref No: <span className="font-mono font-bold">{submitted}</span> — awaiting Issuance Personnel review.</p>
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
                      <th className="px-6 py-3 font-bold">Requisition Items</th>
                      <th className="px-6 py-3 font-bold text-center">Urgency</th>
                      <th className="px-6 py-3 font-bold">Submitted</th>
                      <th className="px-6 py-3 font-bold text-center">Status</th>
                      <th className="px-6 py-3 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRequests.map(req => {
                      const urgency = urgencyConfig[req.urgency] || urgencyConfig.routine;
                      const status  = statusConfig[req.status]   || statusConfig.Pending;
                      const items   = req.items || [];
                      return (
                        <tr key={req.refNo} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono font-bold text-slate-400">{req.refNo}</td>
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-900">{req.hospital}</p>
                            {req.ward && <p className="text-[10px] text-slate-400 font-normal mt-0.5">{req.ward}</p>}
                          </td>
                          <td className="px-6 py-3.5">
                            {items.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {items.map((item, idx) => (
                                  <div key={idx} className="inline-flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-[#C21C24] font-black text-[9px] border border-rose-100 font-mono">{item.bloodType}</span>
                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${componentColor(item.component)}`}>{item.component}</span>
                                    <span className="text-[10px] text-slate-500 font-bold">{item.units} unit{item.units !== 1 ? 's' : ''}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Legacy single-item fallback */
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-[#C21C24] font-black text-[9px] border border-rose-100 font-mono">{req.patientBloodType}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{req.units} unit{req.units !== 1 ? 's' : ''}</span>
                                {req.component && <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${componentColor(req.component)}`}>{req.component}</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${urgency.cls}`}>{urgency.label}</span>
                          </td>
                          <td className="px-6 py-3.5 font-mono font-normal text-slate-500">{req.submittedAt}</td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${status.cls}`}>{status.icon} {req.status}</span>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* View details - available to all */}
                              <button onClick={() => openView(req)}
                                className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors" title="View Details">
                                <Eye className="w-4 h-4" />
                              </button>
                              {/* Approve / Reject - issuance staff only */}
                              {isIssuanceStaff && req.status === 'Pending' && (
                                <>
                                  <button onClick={() => approveRequest(req.refNo)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors" title="Approve">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => openReject(req)} className="text-[#C21C24] hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Reject">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {isIssuanceStaff && req.status !== 'Pending' && (
                                <span className="text-slate-300 text-[10px]">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {myRequests.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-normal">No blood requests found.</td></tr>
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

          {isIssuanceStaff && activeTab === 'issuance_details' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C21C24]" />
                <h3 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Blood Issuance Details (Line Items)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3 font-bold">Detail ID</th>
                      <th className="px-6 py-3 font-bold">Issuance ID</th>
                      <th className="px-6 py-3 font-bold">Unit ID</th>
                      <th className="px-6 py-3 font-bold text-right">Quantity (mL)</th>
                      <th className="px-6 py-3 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bloodIssuanceDetails && bloodIssuanceDetails.length > 0 ? (
                      bloodIssuanceDetails.map(detail => (
                        <tr key={detail.detailId} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-mono font-bold text-slate-700">{detail.detailId}</td>
                          <td className="px-6 py-3 font-mono text-slate-500">{detail.issuanceId}</td>
                          <td className="px-6 py-3 font-mono text-slate-500">{detail.unitId}</td>
                          <td className="px-6 py-3 text-right text-slate-800 font-bold">{parseFloat(detail.quantity).toFixed(2)} mL</td>
                          <td className="px-6 py-3 text-slate-500 font-normal">Line items for each issuance — the specific units released.</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-normal">No blood issuance detail records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── NEW REQUEST MODAL (Hospital User) ─── */}
      {showForm && isHospitalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-sm">New Blood Requisition</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Logistics-only — no patient-identifiable data (RA 10173)</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-assigned Hospital Banner */}
            <div className="px-6 py-3 bg-rose-50 border-b border-rose-100 flex items-center gap-3 flex-shrink-0">
              <Shield className="w-4 h-4 text-[#C21C24] flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Requesting Hospital (Auto-detected from session)</p>
                <p className="text-sm font-bold text-slate-900 leading-tight">{hospitalName}</p>
                <p className="text-[10px] text-slate-400 font-mono">{hospitalId}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-5">

                {/* ── CART BUILDER ── */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#C21C24]" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Blood Requisition Cart</span>
                    {cartItems.length > 0 && (
                      <span className="ml-auto bg-[#C21C24] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartItems.length}</span>
                    )}
                  </div>

                  {/* Item Adder */}
                  <div className="p-4 bg-white border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Add Component to Requisition</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Blood Type</label>
                        <select name="bloodType" value={cartItem.bloodType} onChange={handleCartItemChange}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Component</label>
                        <select name="component" value={cartItem.component} onChange={handleCartItemChange}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                          {COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Units</label>
                        <input type="number" name="units" min="1" max="50" value={cartItem.units} onChange={handleCartItemChange}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                      </div>
                    </div>
                    {cartError && (
                      <p className="text-[11px] text-[#C21C24] mt-2 font-semibold">{cartError}</p>
                    )}
                    <button type="button" onClick={handleAddToCart}
                      className="mt-3 w-full py-2 text-xs font-bold text-[#C21C24] border border-[#C21C24] hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add to Requisition
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="bg-white">
                    {cartItems.length === 0 ? (
                      <div className="px-4 py-5 text-center">
                        <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-semibold">No items added yet</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">Use the form above to add blood components</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[9px] font-bold text-slate-400">#{idx + 1}</span>
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-[#C21C24] font-black text-[9px] border border-rose-100 font-mono">{item.bloodType}</span>
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${componentColor(item.component)}`}>{item.component}</span>
                              <span className="text-xs text-slate-700 font-bold">{item.units} unit{item.units !== 1 ? 's' : ''}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveCartItem(idx)}
                              className="text-slate-300 hover:text-[#C21C24] transition-colors p-1 rounded cursor-pointer" title="Remove item">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <div className="px-4 py-2 bg-slate-50 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Components</span>
                          <span className="text-xs font-extrabold text-slate-800">{cartItems.length} line item{cartItems.length !== 1 ? 's' : ''} · {cartItems.reduce((sum, i) => sum + Number(i.units), 0)} total units</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── GENERAL INFO ── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Urgency Level <span className="text-[#C21C24]">*</span></label>
                    <select name="urgency" required value={form.urgency} onChange={handleFormChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      <option value="urgent">Urgent</option>
                      <option value="routine">Routine</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Date Needed <span className="text-[#C21C24]">*</span></label>
                    <input required type="date" name="dateNeeded" value={form.dateNeeded} onChange={handleFormChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none text-slate-600" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Patient names, IDs, and clinical diagnoses are not collected here per RA 10173. Use clinical indication category only.</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Indication (Category) <span className="text-[#C21C24]">*</span></label>
                    <select required name="clinicalIndication" value={form.clinicalIndication} onChange={handleFormChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none bg-white">
                      <option value="">Select indication...</option>
                      {['Surgical Support','Trauma / Emergency','Oncology Support','Obstetric Hemorrhage','Anemia Management','Pediatric Transfusion','Cardiac Surgery','Burns / Critical Care','Other'].map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Ward / Location</label>
                    <input type="text" name="ward" value={form.ward} onChange={handleFormChange}
                      placeholder="e.g. Ward 4B, Room 201"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Person <span className="text-[#C21C24]">*</span></label>
                    <input required type="text" name="contactPerson" value={form.contactPerson} onChange={handleFormChange}
                      placeholder="e.g. Dr. Juan Dela Cruz"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Number <span className="text-[#C21C24]">*</span></label>
                    <input required type="tel" name="contactNumber" value={form.contactNumber} onChange={handleFormChange}
                      placeholder="+63 917 000 0000"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Hospital Reference No.</label>
                  <input type="text" name="hospitalRefNo" value={form.hospitalRefNo} onChange={handleFormChange}
                    placeholder="e.g. SPMC-2026-04821"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Additional Notes</label>
                  <textarea name="notes" rows={2} value={form.notes} onChange={handleFormChange}
                    placeholder="Any special instructions or clinical context..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#C21C24] outline-none resize-none" />
                </div>

                {form.urgency === 'urgent' && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-[#C21C24] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#C21C24] font-semibold leading-relaxed">
                      This request is marked <strong>URGENT</strong>. It will be prioritized and flagged for immediate Blood Bank Staff attention.
                    </p>
                  </div>
                )}
                {form.urgency === 'emergency' && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
                    <p className="text-xs text-red-700 font-bold leading-relaxed">
                      This request is marked as an <strong>EMERGENCY</strong>. Maximum priority protocol initiated!
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-4 flex justify-between items-center gap-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                <span className="text-[10px] text-slate-400">
                  {cartItems.length > 0
                    ? `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} · ${cartItems.reduce((s, i) => s + Number(i.units), 0)} total units`
                    : 'No items in cart yet'}
                </span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit"
                    disabled={cartItems.length === 0}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                    <FileText className="w-3.5 h-3.5" /> Submit Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VIEW / DETAILS MODAL ─── */}
      {viewingReq && detailMode === 'view' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-white text-sm">Request Details</h3>
                <p className="text-slate-400 text-[10px] mt-0.5 font-mono">{viewingReq.refNo}</p>
              </div>
              <button onClick={() => setViewingReq(null)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Hospital + Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Requesting Hospital</p>
                  <p className="font-bold text-slate-800">{viewingReq.hospital}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${(statusConfig[viewingReq.status] || statusConfig.Pending).cls}`}>
                    {(statusConfig[viewingReq.status] || statusConfig.Pending).icon} {viewingReq.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Urgency</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${(urgencyConfig[viewingReq.urgency] || urgencyConfig.routine).cls}`}>
                    {(urgencyConfig[viewingReq.urgency] || urgencyConfig.routine).label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Date Needed</p>
                  <p className="font-semibold text-slate-800">{viewingReq.dateNeeded || '—'}</p>
                </div>
                {viewingReq.ward && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Ward / Location</p>
                    <p className="font-semibold text-slate-800">{viewingReq.ward}</p>
                  </div>
                )}
                {viewingReq.contactPerson && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Contact Person</p>
                    <p className="font-semibold text-slate-800">{viewingReq.contactPerson}</p>
                  </div>
                )}
                {viewingReq.contactNumber && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Contact Number</p>
                    <p className="font-semibold text-slate-800">{viewingReq.contactNumber}</p>
                  </div>
                )}
                {viewingReq.hospitalRefNo && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Hospital Ref No.</p>
                    <p className="font-mono font-bold text-slate-700">{viewingReq.hospitalRefNo}</p>
                  </div>
                )}
              </div>

              {/* Requisition Items */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                  <ShoppingCart className="w-3 h-3" /> Requisition Items
                </p>
                {(() => {
                  const items = viewingReq.items && viewingReq.items.length > 0
                    ? viewingReq.items
                    : (viewingReq.patientBloodType
                        ? [{ bloodType: viewingReq.patientBloodType, component: viewingReq.component || 'PRBC', units: viewingReq.units || 1 }]
                        : []);
                  return items.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[9px] tracking-wider">
                            <th className="px-3 py-2 font-bold text-left">#</th>
                            <th className="px-3 py-2 font-bold text-left">Blood Type</th>
                            <th className="px-3 py-2 font-bold text-left">Component</th>
                            <th className="px-3 py-2 font-bold text-right">Units</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-[#C21C24] font-black text-[9px] border border-rose-100 font-mono">{item.bloodType}</span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${componentColor(item.component)}`}>{item.component}</span>
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-slate-800">{item.units}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 border-t border-slate-200">
                            <td colSpan={3} className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Units</td>
                            <td className="px-3 py-2 text-right font-extrabold text-slate-900">{items.reduce((s, i) => s + Number(i.units), 0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No items recorded.</p>
                  );
                })()}
              </div>

              {viewingReq.clinicalIndication && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Clinical Indication</p>
                  <p className="text-xs font-semibold text-slate-800">{viewingReq.clinicalIndication}</p>
                </div>
              )}
              {viewingReq.notes && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Notes</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{viewingReq.notes}</p>
                </div>
              )}
              {viewingReq.statusNote && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                  <p className="text-[10px] text-[#C21C24] uppercase font-bold tracking-wider mb-0.5">Rejection Reason</p>
                  <p className="text-xs text-slate-700">{viewingReq.statusNote}</p>
                </div>
              )}
              <div className="text-[10px] text-slate-400">Submitted: {viewingReq.submittedAt}</div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button onClick={() => setViewingReq(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECT MODAL ─── */}
      {viewingReq && detailMode === 'reject' && isIssuanceStaff && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Reject Request {viewingReq.refNo}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{viewingReq.hospital}</p>
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
