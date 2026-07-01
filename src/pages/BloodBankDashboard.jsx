import React, { useState } from 'react';
import { useBloodStore } from '../store/useBloodStore';
import { 
  Archive, Stethoscope, ArrowLeft, LogOut, 
  CheckCircle, XCircle, Droplets, Clock, Activity, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BloodBankDashboard() {
  const { inventory, bloodRequests, approveRequest, rejectRequest } = useBloodStore();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'requests'

  // Filter requests that are still Pending
  const pendingRequests = bloodRequests.filter(req => req.status === 'Pending');
  const pastRequests = bloodRequests.filter(req => req.status !== 'Pending');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight tracking-wide">Blood Bank Portal</h1>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">BloodLink DVO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold">Blood Bank Staff</span>
              <span className="text-[10px] text-slate-400">Inventory & Issuance</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <Archive className="w-4 h-4 text-slate-300" />
            </div>
            <Link to="/" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / TABS */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'inventory' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4" /> Component Inventory
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'requests' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Issuance Requests
            {pendingRequests.length > 0 && (
              <span className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        
        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Blood Component Inventory</h2>
              <p className="text-sm text-slate-500 mt-1">Live tracking of PRBC, FFP, Cryoprecipitate, and Cryosupernate levels.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-bold">Blood Type</th>
                      <th className="p-4 font-bold text-center border-l border-slate-100">PRBC (Units)</th>
                      <th className="p-4 font-bold text-center border-l border-slate-100">FFP</th>
                      <th className="p-4 font-bold text-center border-l border-slate-100">Cryoprecipitate</th>
                      <th className="p-4 font-bold text-center border-l border-slate-100">Cryosupernate</th>
                      <th className="p-4 font-bold text-center border-l border-slate-100">PRBC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => (
                      <tr key={item.type} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-[#C21C24] font-extrabold text-sm border border-rose-100 shadow-sm">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4 text-center border-l border-slate-100 font-bold text-lg text-slate-800">
                          {item.units}
                        </td>
                        <td className="p-4 text-center border-l border-slate-100 font-semibold text-slate-600">
                          {item.ffp || 0}
                        </td>
                        <td className="p-4 text-center border-l border-slate-100 font-semibold text-slate-600">
                          {item.cryo || 0}
                        </td>
                        <td className="p-4 text-center border-l border-slate-100 font-semibold text-slate-600">
                          {item.cryosup || 0}
                        </td>
                        <td className="p-4 text-center border-l border-slate-100">
                          {item.status === 'safe' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Safe</span>}
                          {item.status === 'low' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><Activity className="w-3 h-3"/> Low</span>}
                          {item.status === 'critical' && <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Critical</span>}
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
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hospital Issuance Requests</h2>
              <p className="text-sm text-slate-500 mt-1">Review pending requests and process blood unit issuance.</p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Pending Approval ({pendingRequests.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-bold">Ref No / Hospital</th>
                      <th className="p-4 font-bold text-center">Blood Type</th>
                      <th className="p-4 font-bold text-center">Units</th>
                      <th className="p-4 font-bold">Diagnosis / Ward</th>
                      <th className="p-4 font-bold">Contact Person</th>
                      <th className="p-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingRequests.map(req => (
                      <tr key={req.refNo} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-mono text-xs font-bold text-slate-500">{req.refNo}</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{req.hospital}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{req.submittedAt}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-[#C21C24] font-extrabold text-xs border border-rose-100">
                            {req.patientBloodType || req.bloodType}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">
                          {req.units}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700 text-xs">{req.diagnosis || req.notes || 'Routine Clinic Use'}</p>
                          {req.ward && <p className="text-[10px] text-slate-400 mt-0.5">{req.ward}</p>}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800 text-xs">{req.contactPerson}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{req.contactNumber}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => approveRequest(req.refNo)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectRequest(req.refNo)}
                              className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingRequests.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">
                          No pending blood requests at this time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Past Requests */}
            {pastRequests.length > 0 && (
              <>
                <h3 className="font-bold text-slate-700 mt-8 mb-4">Processed Requests</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                        <th className="p-4">Ref No</th>
                        <th className="p-4">Hospital</th>
                        <th className="p-4 text-center">Request</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pastRequests.map(req => (
                        <tr key={req.refNo}>
                          <td className="p-4 font-mono text-xs text-slate-500">{req.refNo}</td>
                          <td className="p-4 font-semibold text-slate-800">{req.hospital}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{req.units}x {req.patientBloodType || req.bloodType}</td>
                          <td className="p-4">
                            {req.status === 'Approved' ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Issued</span>
                            ) : (
                              <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
