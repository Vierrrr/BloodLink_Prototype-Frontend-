import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialDonors = [
  // ── Sample Dataset: Donor Registration ──
  { 
    id: 'D001', name: 'Juan P. Dela Cruz', sex: 'Male', civilStatus: 'Single', dob: '1998-05-12', 
    bloodType: 'O+', address: 'Buhangin, Davao City', donationDate: '2026-03-10', status: 'Regular', 
    lastDonation: '2026-03-10', remarks: 'Eligible', phone: '+63 917 111 1111', distance: '1.2 km', totalDonations: 4 
  },
  { 
    id: 'D002', name: 'Maria A. Santos', sex: 'Female', civilStatus: 'Married', dob: '1992-09-08', 
    bloodType: 'A+', address: 'Matina, Davao City', donationDate: '2026-06-15', status: 'New', 
    lastDonation: '2026-06-15', remarks: 'Eligible', phone: '+63 917 222 2222', distance: '3.4 km', totalDonations: 1 
  },
  { 
    id: 'D003', name: 'Robert L. Tan', sex: 'Male', civilStatus: 'Single', dob: '1988-12-04', 
    bloodType: 'B-', address: 'Talomo, Davao City', donationDate: '2026-05-20', status: 'Regular', 
    lastDonation: '2026-05-20', remarks: 'Eligible', phone: '+63 917 333 3333', distance: '5.1 km', totalDonations: 2 
  },
  { 
    id: 'D004', name: 'Sarah G. Cruz', sex: 'Female', civilStatus: 'Single', dob: '2000-03-16', 
    bloodType: 'AB+', address: 'Mintal, Davao City', donationDate: '2026-04-05', status: 'Regular', 
    lastDonation: '2026-04-05', remarks: 'Eligible', phone: '+63 917 444 4444', distance: '8.2 km', totalDonations: 5 
  },
  { 
    id: 'D005', name: 'Joseph M. Castro', sex: 'Male', civilStatus: 'Single', dob: '1995-07-22', 
    bloodType: 'O-', address: 'Agdao, Davao City', donationDate: '2026-01-15', status: 'Regular', 
    lastDonation: '2026-01-15', remarks: 'Eligible', phone: '+63 917 888 8888', distance: '2.5 km', totalDonations: 8 
  },
  { 
    id: 'D006', name: 'Elena F. Diaz', sex: 'Female', civilStatus: 'Married', dob: '1990-11-30', 
    bloodType: 'A-', address: 'Lanang, Davao City', donationDate: '2026-06-25', status: 'Regular', 
    lastDonation: '2026-06-25', remarks: 'Eligible', phone: '+63 917 999 9999', distance: '4.1 km', totalDonations: 3 
  },
  { 
    id: 'D007', name: 'Mark Anthony V. Reyes', sex: 'Male', civilStatus: 'Single', dob: '1993-02-14', 
    bloodType: 'B-', address: 'Toril, Davao City', donationDate: '2026-02-28', status: 'Regular', 
    lastDonation: '2026-02-28', remarks: 'Eligible', phone: '+63 917 777 7777', distance: '12.4 km', totalDonations: 4 
  },
  { 
    id: 'D008', name: 'Patricia J. Gomez', sex: 'Female', civilStatus: 'Single', dob: '1997-08-19', 
    bloodType: 'O-', address: 'Cabantian, Davao City', donationDate: '2026-05-01', status: 'Regular', 
    lastDonation: '2026-05-01', remarks: 'Eligible', phone: '+63 917 654 3210', distance: '6.7 km', totalDonations: 2 
  },
  // ── Sample Dataset: Deferred Donors ──
  { 
    id: 'D014', name: 'Miguel S. Alcantara', sex: 'Male', 
    bloodType: 'O+', address: 'Davao City', donationDate: '2026-02-05', status: 'Deferred', 
    lastDonation: '2026-02-05', remarks: 'Low Hemoglobin (Temporary)', phone: '+63 917 555 5555', distance: '2.0 km', totalDonations: 3 
  },
  { 
    id: 'D022', name: 'Clarisse D. Villamin', sex: 'Female', 
    bloodType: 'A-', address: 'Davao City', donationDate: '2026-02-10', status: 'Deferred', 
    lastDonation: '2026-02-10', remarks: 'Recent Tattoo (Temporary)', phone: '+63 917 666 6666', distance: '4.5 km', totalDonations: 1 
  }
];

const initialInventory = [
  // ── Sample Dataset: Blood Components ──
  { type: 'O+', units: 25, platelets: 180, ffp: 293, cryo: 113, cryosup: 51, threshold: 15, status: 'safe' },
  { type: 'A+', units: 9,  platelets: 64,  ffp: 160, cryo: 85,  cryosup: 31, threshold: 10, status: 'low' },
  { type: 'B+', units: 9,  platelets: 52,  ffp: 140, cryo: 42,  cryosup: 20, threshold: 10, status: 'low' },
  { type: 'AB+', units: 4, platelets: 25,  ffp: 40,  cryo: 8,   cryosup: 4,  threshold: 5,  status: 'critical' },
  { type: 'O-', units: 4,  platelets: 15,  ffp: 0,   cryo: 0,   cryosup: 0,  threshold: 5,  status: 'critical' },
  { type: 'A-', units: 2,  platelets: 10,  ffp: 0,   cryo: 1,   cryosup: 0,  threshold: 3,  status: 'critical' },
  { type: 'B-', units: 1,  platelets: 8,   ffp: 1,   cryo: 0,   cryosup: 0,  threshold: 3,  status: 'critical' },
  { type: 'AB-', units: 1, platelets: 5,   ffp: 0,   cryo: 0,   cryosup: 0,  threshold: 2,  status: 'critical' }
];

const initialRequests = [
  {
    refNo: 'REQ-4821',
    hospital: 'Southern Philippines Medical Center (SPMC)',
    hospitalId: 'HOSP-001',
    patientBloodType: 'O-',
    units: 2,
    urgency: 'urgent',
    dateNeeded: '2026-06-20',
    contactPerson: 'Dr. Juan Dela Cruz, MD',
    contactNumber: '+63 917 000 0001',
    status: 'Pending',
    submittedAt: 'June 19, 2026, 9:30 AM',
    notes: 'Urgent release needed for cardiac surgery.',
    diagnosis: 'Open Heart Surgery',
    ward: 'Ward 4B, Room 201',
    hospitalRefNo: 'SPMC-2026-04821',
  }
];

const initialHospitals = [
  {
    id: 'HOSP-001',
    name: 'Southern Philippines Medical Center (SPMC)',
    type: 'Government',
    contact: 'Dr. Maria Santos',
    phone: '0917-000-0001',
    email: 'bloodbank@spmc.gov.ph',
    address: 'J.P. Laurel Ave., Bajada, Davao City'
  },
  {
    id: 'HOSP-002',
    name: 'Davao Doctors Hospital',
    type: 'Private',
    contact: 'Dr. Juan Reyes',
    phone: '0917-000-0002',
    email: 'blood@davaodoctors.com',
    address: 'E. Quirino Ave., Davao City'
  },
  {
    id: 'HOSP-003',
    name: 'San Pedro Hospital',
    type: 'Private',
    contact: 'Dr. Ana Cruz',
    phone: '0917-000-0003',
    email: 'blood@sanpedro.ph',
    address: 'Ponciano St., Davao City'
  },
  {
    id: 'HOSP-004',
    name: 'Philippine Red Cross – Davao Chapter',
    type: 'Blood Bank',
    contact: 'Ms. Joy Villanueva',
    phone: '0917-000-0004',
    email: 'davao@redcross.org.ph',
    address: 'Anda St., Davao City'
  }
];

const initialUsers = [
  { id: 'USR-001', name: 'DOH Super Admin', role: 'Super Admin', email: 'superadmin@bloodlink.dvo', status: 'Active', hospitalId: null },
  { id: 'USR-002', name: 'DOH Medical Officer IV', role: 'Administrator', email: 'admin@bloodlink.dvo', status: 'Active', hospitalId: null },
  { id: 'USR-003', name: 'Nurse Joy Cruz', role: 'Registry Staff', email: 'registry@bloodlink.dvo', status: 'Active', hospitalId: null },
  { id: 'USR-004', name: 'RMT Mark Lopez', role: 'Blood Bank Staff', email: 'bloodbank@bloodlink.dvo', status: 'Active', hospitalId: null },
  { id: 'USR-005', name: 'SNBC Issuance Officer', role: 'Issuance Personnel', email: 'issuance@bloodlink.dvo', status: 'Active', hospitalId: null },
  { id: 'USR-006', name: 'Dr. Roberto Santos', role: 'Hospital User', email: 'hospital@bloodlink.dvo', status: 'Active', hospitalId: 'HOSP-001' }
];

// 8‑week historical + 4 predicted weeks with upper/lower confidence bounds
const initialForecastData = [
  { week: 'Wk 1', demand: 112, actual: 108, upper: 118, lower: 106 },
  { week: 'Wk 2', demand: 118, actual: 125, upper: 126, lower: 110 },
  { week: 'Wk 3', demand: 125, actual: 120, upper: 133, lower: 117 },
  { week: 'Wk 4', demand: 130, actual: 138, upper: 138, lower: 122 },
  { week: 'Wk 5', demand: 122, actual: 119, upper: 130, lower: 114 },
  { week: 'Wk 6', demand: 140, actual: 145, upper: 150, lower: 130 },
  { week: 'Wk 7', demand: 155, actual: 150, upper: 165, lower: 145 },
  { week: 'Wk 8', demand: 160, actual: 162, upper: 172, lower: 148 },
  { week: 'Wk 9 (P)', demand: 168, actual: null, upper: 180, lower: 156 },
  { week: 'Wk 10 (P)', demand: 172, actual: null, upper: 185, lower: 159 },
  { week: 'Wk 11 (P)', demand: 165, actual: null, upper: 178, lower: 152 },
  { week: 'Wk 12 (P)', demand: 175, actual: null, upper: 190, lower: 160 },
];

// Seed some initial distribution logs
const initialDistributionLog = [
  {
    id: 'DIST-001',
    hospitalId: 'HOSP-001',
    hospitalName: 'Southern Philippines Medical Center (SPMC)',
    bloodType: 'O+',
    units: 6,
    date: '2026-06-20',
    allocatedBy: 'Admin User'
  },
  {
    id: 'DIST-002',
    hospitalId: 'HOSP-002',
    hospitalName: 'Davao Doctors Hospital',
    bloodType: 'A+',
    units: 4,
    date: '2026-06-21',
    allocatedBy: 'Admin User'
  },
  {
    id: 'DIST-003',
    hospitalId: 'HOSP-003',
    hospitalName: 'San Pedro Hospital',
    bloodType: 'B+',
    units: 3,
    date: '2026-06-22',
    allocatedBy: 'Admin User'
  },
  {
    id: 'DIST-004',
    hospitalId: 'HOSP-001',
    hospitalName: 'Southern Philippines Medical Center (SPMC)',
    bloodType: 'O-',
    units: 2,
    date: '2026-06-23',
    allocatedBy: 'Admin User'
  },
];

// Equity‑based allocation algorithm:
// Proportionally distribute available units across hospitals using forecast demand weight.
// Each hospital receives: floor( (hospitalWeight / totalWeight) * availableUnits )
function computeEquityAllocation(inventory, hospitals, forecastData) {
  // Use the most recent predicted week demand as the weight base
  const latestDemand = forecastData.filter(w => w.actual === null);
  const demandForecast = latestDemand.length > 0 ? latestDemand[0].demand : 160;

  // Assign weights: government hospitals get 1.5x, blood banks get 1.2x, private 1.0x
  const weights = { Government: 1.5, 'Blood Bank': 1.2, Private: 1.0 };
  const totalWeight = hospitals.reduce((sum, h) => sum + (weights[h.type] || 1), 0);

  return inventory.map(inv => {
    // Safety buffer: only distribute units above threshold
    const safeToRelease = Math.max(0, inv.units - inv.threshold);

    const allocations = hospitals.map(h => {
      const hospitalWeight = weights[h.type] || 1;
      const share = (hospitalWeight / totalWeight);
      const allocatedUnits = Math.floor(share * safeToRelease);
      return {
        hospitalId: h.id,
        hospitalName: h.name,
        hospitalType: h.type,
        hospitalContact: h.contact,
        hospitalPhone: h.phone,
        hospitalEmail: h.email,
        bloodType: inv.type,
        suggestedUnits: allocatedUnits,
        inventoryStatus: inv.status,
        currentStock: inv.units,
        threshold: inv.threshold,
        safeToRelease,
        forecastDemand: demandForecast,
      };
    });

    return { bloodType: inv.type, status: inv.status, allocations };
  });
}

export const useBloodStore = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────
      donors: initialDonors,
      inventory: initialInventory,
      bloodRequests: initialRequests,
      hospitals: initialHospitals,
      users: initialUsers,
      forecastData: initialForecastData,
      distributionLog: initialDistributionLog,
      smsLogs: [],
      currentUser: {
        id: 'BLD-482931',
        name: 'Maria C. Santos',
        phone: '+63 917 123 4567',
        bloodType: 'O-',
        address: 'Brgy. Buhangin, Davao City'
      },
      authSystemUser: {
        id: 'USR-002',
        name: 'DOH Medical Officer IV',
        role: 'Administrator',
        email: 'admin@bloodlink.dvo',
        hospitalId: null
      },
      loginSystemUser: (email) => {
        const emailLower = email.toLowerCase();
        const found = get().users.find(u => u.email.toLowerCase() === emailLower);
        if (found) {
          set({ authSystemUser: found });
          return found;
        }
        // Fallback for demo flexibility
        let user = null;
        if (emailLower.includes('superadmin')) {
          user = { id: 'USR-001', name: 'DOH Super Admin', role: 'Super Admin', email: 'superadmin@bloodlink.dvo', hospitalId: null };
        } else if (emailLower.includes('admin')) {
          user = { id: 'USR-002', name: 'DOH Medical Officer IV', role: 'Administrator', email: 'admin@bloodlink.dvo', hospitalId: null };
        } else if (emailLower.includes('registry')) {
          user = { id: 'USR-003', name: 'Nurse Joy Cruz', role: 'Registry Staff', email: 'registry@bloodlink.dvo', hospitalId: null };
        } else if (emailLower.includes('bloodbank') || emailLower.includes('bank')) {
          user = { id: 'USR-004', name: 'RMT Mark Lopez', role: 'Blood Bank Staff', email: 'bloodbank@bloodlink.dvo', hospitalId: null };
        } else if (emailLower.includes('issuance')) {
          user = { id: 'USR-005', name: 'SNBC Issuance Officer', role: 'Issuance Personnel', email: 'issuance@bloodlink.dvo', hospitalId: null };
        } else if (emailLower.includes('hospital') || emailLower.includes('spmc')) {
          user = { id: 'USR-006', name: 'Dr. Roberto Santos', role: 'Hospital User', email: 'hospital@bloodlink.dvo', hospitalId: 'HOSP-001' };
        }
        if (user) {
          set({ authSystemUser: user });
          return user;
        }
        return null;
      },
      accountFlagged: false,
      arrivedAtFacility: false,

      // Mobilization Simulation State
      mobilizeFlowStep: 0,
      mobilizeTarget: 'O-',
      mobilizeFacility: 'SPMC Blood Production Services',
      scanProgress: 0,
      scannedCount: 0,
      matchedCount: 0,
      criteriaChecked: 0,
      totalConfirmed: 12,
      currentPhase: 1,

      // ─── Hospital CRUD ──────────────────────────────────────────────────
      addHospital: (form) => {
        const id = 'HOSP-' + String(Date.now()).slice(-4);
        const newHospital = { id, ...form };
        set((state) => ({ hospitals: [...state.hospitals, newHospital] }));
      },

      updateHospital: (id, form) => {
        set((state) => ({
          hospitals: state.hospitals.map(h => h.id === id ? { ...h, ...form } : h)
        }));
      },

      deleteHospital: (id) => {
        set((state) => ({
          hospitals: state.hospitals.filter(h => h.id !== id)
        }));
      },

      // ─── Registry Operations ─────────────────────────────────────────────
      addDonor: (newDonor) => {
        set((state) => ({ donors: [newDonor, ...state.donors] }));
      },


      // ─── Distribution & Equity Allocation ───────────────────────────────
      getEquityAllocations: () => {
        const { inventory, hospitals, forecastData } = get();
        return computeEquityAllocation(inventory, hospitals, forecastData);
      },

      recordDistribution: (hospitalId, hospitalName, bloodType, units) => {
        const { inventory } = get();
        const id = 'DIST-' + String(Date.now()).slice(-5);
        const date = new Date().toISOString().slice(0, 10);
        const log = { id, hospitalId, hospitalName, bloodType, units, date, allocatedBy: 'Admin User' };

        // Decrement inventory
        const newInventory = inventory.map(item => {
          if (item.type === bloodType) {
            const newUnits = Math.max(0, item.units - units);
            const status = newUnits < item.threshold ? 'critical' : newUnits === item.threshold ? 'low' : 'safe';
            return { ...item, units: newUnits, status };
          }
          return item;
        });

        set((state) => ({
          distributionLog: [log, ...state.distributionLog],
          inventory: newInventory
        }));
      },

      // Find the last time a hospital received a specific blood type (for emergency retracking)
      getLastDistributionByBloodType: (bloodType) => {
        const { distributionLog } = get();
        return distributionLog
          .filter(log => log.bloodType === bloodType)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      // ─── Forecasting ────────────────────────────────────────────────────
      generateNextWeeks: (weeks = 4) => {
        const { forecastData } = get();
        // Simple linear regression: slope from last 4 actual points
        const actuals = forecastData.filter(w => w.actual !== null);
        const n = actuals.length;
        const slope = n >= 2
          ? (actuals[n - 1].demand - actuals[0].demand) / (n - 1)
          : 5;
        const lastDemand = actuals.length > 0 ? actuals[n - 1].demand : 160;
        const existingPredicted = forecastData.filter(w => w.actual === null).length;
        const totalWeeks = forecastData.length;

        const newWeeks = [];
        for (let i = 1; i <= weeks; i++) {
          const wkNum = totalWeeks + existingPredicted + i;
          const demand = Math.round(lastDemand + slope * (existingPredicted + i));
          const margin = Math.round(demand * 0.07);
          newWeeks.push({
            week: `Wk ${wkNum} (P)`,
            demand,
            actual: null,
            upper: demand + margin,
            lower: demand - margin,
          });
        }
        set((state) => ({ forecastData: [...state.forecastData, ...newWeeks] }));
      },

      // ─── Donor Registration ─────────────────────────────────────────────
      registerDonor: (form) => {
        const id = 'BLD-' + Math.floor(100000 + Math.random() * 900000);
        const name = `${form.firstName} ${form.lastName}`;
        const newDonor = {
          ...form,
          id,
          name,
          totalDonations: form.donatedBefore === 'yes' ? 1 : 0,
          alertsResponded: 0,
          livesImpacted: form.donatedBefore === 'yes' ? 3 : 0,
          arrived: false,
          distance: '2.5 km'
        };
        set((state) => ({
          donors: [newDonor, ...state.donors],
          currentUser: newDonor
        }));
        return id;
      },

      updateDonorMedical: (id, medicalForm) => {
        set((state) => ({
          donors: state.donors.map(d => d.id === id ? { ...d, ...medicalForm } : d)
        }));
      },

      addUser: (userForm) => {
        const id = 'USR-' + String(Math.floor(Math.random() * 900) + 100);
        const newUser = { id, status: 'Active', ...userForm };
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser;
      },

      // ─── Blood Requests ─────────────────────────────────────────────────
      addBloodRequest: (reqForm) => {
        const refNo = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
        const dateString = new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newRequest = { ...reqForm, refNo, status: 'Pending', submittedAt: dateString, statusNote: '' };
        set((state) => ({ bloodRequests: [newRequest, ...state.bloodRequests] }));
        return refNo;
      },

      updateBloodRequestStatus: (refNo, status, statusNote = '') => {
        set((state) => ({
          bloodRequests: state.bloodRequests.map((req) =>
            req.refNo === refNo ? { ...req, status, statusNote } : req
          )
        }));
      },

      rejectRequest: (refNo) => {
        set((state) => ({
          bloodRequests: state.bloodRequests.map(req => req.refNo === refNo ? { ...req, status: 'Rejected' } : req)
        }));
      },

      approveRequest: (refNo) => {
        set((state) => {
          const req = state.bloodRequests.find(r => r.refNo === refNo);
          if (!req) return state;
          
          // Decrement inventory
          const newInventory = state.inventory.map(item => {
            const targetType = req.patientBloodType || req.bloodType;
            if (item.type === targetType) {
              const newUnits = Math.max(0, item.units - req.units);
              const status = newUnits < item.threshold ? 'critical' : newUnits === item.threshold ? 'low' : 'safe';
              return { ...item, units: newUnits, status };
            }
            return item;
          });

          return {
            bloodRequests: state.bloodRequests.map(r => r.refNo === refNo ? { ...r, status: 'Approved' } : r),
            inventory: newInventory
          };
        });
      },

      // ─── Inventory ──────────────────────────────────────────────────────
      updateInventoryUnits: (type, units) => {
        set((state) => {
          const newInventory = state.inventory.map((item) => {
            if (item.type === type) {
              const status = units < item.threshold ? 'critical' : units === item.threshold ? 'low' : 'safe';
              return { ...item, units, status };
            }
            return item;
          });
          return { inventory: newInventory };
        });
      },

      // ─── Misc ────────────────────────────────────────────────────────────
      setFlaggedStatus: (flagged) => set({ accountFlagged: flagged }),

      setArrivalStatus: (arrived) => {
        set((state) => {
          const updatedUser = state.currentUser ? { ...state.currentUser, arrived } : null;
          const updatedDonors = state.donors.map((d) =>
            d.id === state.currentUser?.id ? { ...d, arrived } : d
          );
          return { arrivedAtFacility: arrived, currentUser: updatedUser, donors: updatedDonors };
        });
      },

      triggerMobilization: (target = 'O-', facility = 'SPMC Blood Production Services') => {
        set({ mobilizeFlowStep: 1, mobilizeTarget: target, mobilizeFacility: facility, scanProgress: 0, scannedCount: 0, matchedCount: 0, criteriaChecked: 0, totalConfirmed: 12, currentPhase: 1 });
      },

      setMobilizeFlowStep: (step) => set({ mobilizeFlowStep: step }),

      setScanProgress: (progress, scanned, matched, criteria) => {
        set({ scanProgress: progress, scannedCount: scanned, matchedCount: matched, criteriaChecked: criteria });
      },

      setPhaseDetails: (phase, confirmedCount) => set({ currentPhase: phase, totalConfirmed: confirmedCount }),

      dispatchSMSLog: (name, phone, msg, color, initials) => {
        const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const log = { name, phone, time: timeString, status: 'Delivered', msg, color, initials };
        set((state) => ({ smsLogs: [log, ...state.smsLogs] }));
      },

      resetMobilization: () => {
        set({ mobilizeFlowStep: 0, scanProgress: 0, scannedCount: 0, matchedCount: 0, criteriaChecked: 0, totalConfirmed: 12, currentPhase: 1, smsLogs: [] });
      }
    }),
    { 
      name: 'bloodlink-dvo-store',
      version: 3,
      migrate: () => {
        // On version mismatch, return undefined so the store resets to initialState
        return undefined;
      }
    }
  )
);
