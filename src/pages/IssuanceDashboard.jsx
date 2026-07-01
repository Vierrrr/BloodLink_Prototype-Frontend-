import React, { useState } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import {
  Stethoscope, ArrowLeft, LogOut, Plus, Clock,
  CheckCircle, XCircle, AlertTriangle, FileText,
  Droplets, X, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const { bloodRequests, addBloodRequest } = useBloodStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(null); // stores refNo of latest submission

  const myRequests = bloodRequests; // In a real app, filtered by hospitalId session

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
    urgent:    { label: 'Urgent',    cls: 'bg-rose-100 text-rose-700 border-rose-200' },
    routine:   { label: 'Routine',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    scheduled: { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  };

  const statusConfig = {
    Pending:  { icon: <Clock className="w-3 h-3" />,        cls: 'bg-amber-100 text-amber-700' },
    Approved: { icon: <CheckCircle className="w-3 h-3" />,  cls: 'bg-emerald-100 text-emerald-700' },
    Rejected: { icon: <XCircle className="w-3 h-3" />,      cls: 'bg-rose-100 text-rose-700' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── STICKY HEADER ── */}
      <header className="bg-[#7B2D8B] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-purple-200 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-purple-700" />
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight tracking-wide">Issuance Portal</h1>
              <span className="text-[10px] text-purple-200 font-semibold uppercase tracking-wider">BloodLink DVO — Hospital Staff</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold">Hospital Staff</span>
              <span className="text-[10px] text-purple-300">Blood Request Officer</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-800 flex items-center justify-center border border-purple-700">
              <Stethoscope className="w-4 h-4 text-purple-100" />
            </div>
            <Link to="/" className="p-2 text-purple-300 hover:text-white hover:bg-purple-800 rounded-lg transition-colors ml-2">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── STICKY TAB BAR ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText className="w-4 h-4" />
            <span className="font-bold text-slate-800">Blood Requests</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{myRequests.length} total</span>
          </div>
          <button
            onClick={() => { setShowForm(true); setSubmitted(null); }}
            className="inline-flex items-center gap-2 bg-[#7B2D8B] hover:bg-[#6A2479] text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Blood Request
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">

        {/* Success Banner */}
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-900 text-sm">Request submitted successfully!</p>
                <p className="text-xs text-emerald-700 mt-0.5">Reference No: <span className="font-mono font-bold">{submitted}</span> — awaiting Blood Bank Staff review.</p>
              </div>
            </div>
            <button onClick={() => setSubmitted(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Requests',   val: myRequests.length,                                     color: 'bg-slate-800 text-white' },
            { label: 'Pending Review',   val: myRequests.filter(r => r.status === 'Pending').length,  color: 'bg-amber-500 text-white' },
            { label: 'Approved & Issued',val: myRequests.filter(r => r.status === 'Approved').length, color: 'bg-emerald-600 text-white' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-5 shadow-sm`}>
              <p className="text-3xl font-extrabold">{s.val}</p>
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#7B2D8B]" />
            <h2 className="font-bold text-slate-900">Request History</h2>
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Ref No</th>
                <th className="p-4 font-bold">Hospital</th>
                <th className="p-4 font-bold text-center">Request</th>
                <th className="p-4 font-bold text-center">Urgency</th>
                <th className="p-4 font-bold">Submitted</th>
                <th className="p-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.map(req => {
                const urgency = urgencyConfig[req.urgency] || urgencyConfig.routine;
                const status  = statusConfig[req.status]  || statusConfig.Pending;
                return (
                  <tr key={req.refNo} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-700">{req.refNo}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-xs leading-snug max-w-[200px]">{req.hospital}</p>
                      {req.ward && <p className="text-[10px] text-slate-400 mt-0.5">{req.ward}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-50 text-[#C21C24] font-extrabold text-xs border border-rose-100">
                          {req.patientBloodType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">{req.units} Units</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${urgency.cls}`}>
                        {urgency.label}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{req.submittedAt}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.cls}`}>
                        {status.icon} {req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {myRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 text-sm">No blood requests submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── NEW REQUEST MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col modal-in">

            {/* Modal Header */}
            <div className="bg-[#7B2D8B] px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-base">New Blood Issuance Request</h3>
                <p className="text-purple-200 text-xs mt-0.5">Fill in all required fields below</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-purple-200 hover:text-white transition-colors p-1 hover:bg-purple-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-5">

                {/* Hospital */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Requesting Hospital <span className="text-rose-500">*</span></label>
                  <select name="hospital" required value={form.hospital} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                    {HOSPITALS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>

                {/* Blood Type + Units */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Patient Blood Type <span className="text-rose-500">*</span></label>
                    <select name="patientBloodType" required value={form.patientBloodType} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                      {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Units Needed <span className="text-rose-500">*</span></label>
                    <input required type="number" name="units" min="1" max="20" value={form.units} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>

                {/* Urgency + Date Needed */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Urgency Level <span className="text-rose-500">*</span></label>
                    <select name="urgency" required value={form.urgency} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                      <option value="urgent">Urgent</option>
                      <option value="routine">Routine</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Date Needed <span className="text-rose-500">*</span></label>
                    <input required type="date" name="dateNeeded" value={form.dateNeeded} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-600" />
                  </div>
                </div>

                {/* Diagnosis + Ward */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Diagnosis / Procedure <span className="text-rose-500">*</span></label>
                    <input required type="text" name="diagnosis" value={form.diagnosis} onChange={handleChange}
                      placeholder="e.g. Open Heart Surgery"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ward / Room</label>
                    <input type="text" name="ward" value={form.ward} onChange={handleChange}
                      placeholder="e.g. Ward 4B, Room 201"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>

                {/* Contact Person + Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person <span className="text-rose-500">*</span></label>
                    <input required type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange}
                      placeholder="e.g. Dr. Juan Dela Cruz"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Number <span className="text-rose-500">*</span></label>
                    <input required type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange}
                      placeholder="+63 917 000 0000"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>

                {/* Hospital Reference + Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Hospital Reference No.</label>
                  <input type="text" name="hospitalRefNo" value={form.hospitalRefNo} onChange={handleChange}
                    placeholder="e.g. SPMC-2026-04821"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Additional Notes</label>
                  <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                    placeholder="Any special instructions or clinical context..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                </div>

                {/* Urgent Warning */}
                {form.urgency === 'urgent' && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                      This request is marked <strong>URGENT</strong>. It will be prioritized and flagged for immediate Blood Bank Staff attention.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#7B2D8B] hover:bg-[#6A2479] rounded-lg transition-colors shadow-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
