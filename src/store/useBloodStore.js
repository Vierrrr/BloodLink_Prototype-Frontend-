import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialDonors = [
  { 
    id: 'BLD-482931', 
    firstName: 'Maria C.', 
    lastName: 'Santos', 
    name: 'Maria C. Santos', 
    phone: '+63 917 123 4567', 
    email: 'maria@example.com', 
    dob: '1995-10-15', 
    sex: 'Female', 
    address: 'Brgy. Buhangin, Davao City', 
    preferredCenter: 'SPMC Blood Production Services', 
    bloodType: 'O-', 
    weight: 54, 
    donatedBefore: 'yes', 
    lastDonation: '2025-11-14', 
    health: [true, true, true, true, true], 
    consent: true, 
    totalDonations: 7, 
    alertsResponded: 4, 
    livesImpacted: 21, 
    arrived: false,
    distance: '1.2 km'
  },
  { id: 'BLD-582912', name: 'Juan P. Dela Cruz', phone: '+63 918 234 5678', bloodType: 'O-', lastDonation: '2026-04-01', distance: '1.8 km', totalDonations: 4, arrived: false },
  { id: 'BLD-938210', name: 'Ana Marie Reyes', phone: '+63 919 345 6789', bloodType: 'O-', lastDonation: '2026-03-30', distance: '2.1 km', totalDonations: 2, arrived: false },
  { id: 'BLD-293810', name: 'Roberto T. Garcia', phone: '+63 920 456 7890', bloodType: 'O-', lastDonation: '2026-03-29', distance: '2.4 km', totalDonations: 6, arrived: false },
  { id: 'BLD-394812', name: 'Sofia Isabella Cruz', phone: '+63 921 567 8901', bloodType: 'A-', lastDonation: '2026-04-02', distance: '2.7 km', totalDonations: 5, arrived: false },
  { id: 'BLD-203912', name: 'Miguel Angelo Ramos', phone: '+63 922 678 9012', bloodType: 'B+', lastDonation: '2025-08-10', distance: '3.1 km', totalDonations: 8, arrived: false },
  { id: 'BLD-495810', name: 'Gabriela M. Torres', phone: '+63 923 789 0123', bloodType: 'O+', lastDonation: '2025-12-14', distance: '3.5 km', totalDonations: 3, arrived: false },
  { id: 'BLD-102938', name: 'Carlos Daniel Mendoza', phone: '+63 924 890 1234', bloodType: 'AB-', lastDonation: '2025-10-18', distance: '3.8 km', totalDonations: 1, arrived: false }
];

const initialInventory = [
  { type: 'O-', units: 3, threshold: 5, status: 'critical' },
  { type: 'O+', units: 24, threshold: 10, status: 'safe' },
  { type: 'A-', units: 2, threshold: 4, status: 'critical' },
  { type: 'A+', units: 18, threshold: 10, status: 'safe' },
  { type: 'B-', units: 3, threshold: 4, status: 'low' },
  { type: 'B+', units: 20, threshold: 10, status: 'safe' },
  { type: 'AB-', units: 1, threshold: 3, status: 'critical' },
  { type: 'AB+', units: 12, threshold: 8, status: 'safe' }
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
  { id: 'USR-001', name: 'Admin User', role: 'System Admin', email: 'admin@bloodlink.dvo', status: 'Active' },
  { id: 'USR-002', name: 'Dr. Juan Dela Cruz', role: 'Hospital Staff', email: 'juan@spmc.ph', status: 'Active' },
  { id: 'USR-003', name: 'Nurse Joy', role: 'Phlebotomist', email: 'joy@redcross.ph', status: 'Active' }
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
    { name: 'bloodlink-dvo-store' }
  )
);
