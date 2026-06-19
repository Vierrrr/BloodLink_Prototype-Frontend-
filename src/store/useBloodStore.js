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
  { id: 'BLD-582912', name: 'Juan P. Dela Cruz', phone: '+63 918 234 5678', bloodType: 'O-', lastDonation: '2025-10-10', distance: '1.8 km', totalDonations: 4, arrived: false },
  { id: 'BLD-938210', name: 'Ana Marie Reyes', phone: '+63 919 345 6789', bloodType: 'O-', lastDonation: '2025-11-01', distance: '2.1 km', totalDonations: 2, arrived: false },
  { id: 'BLD-293810', name: 'Roberto T. Garcia', phone: '+63 920 456 7890', bloodType: 'O-', lastDonation: '2025-09-15', distance: '2.4 km', totalDonations: 6, arrived: false },
  { id: 'BLD-394812', name: 'Sofia Isabella Cruz', phone: '+63 921 567 8901', bloodType: 'O-', lastDonation: '2025-11-14', distance: '2.7 km', totalDonations: 5, arrived: false },
  { id: 'BLD-203912', name: 'Miguel Angelo Ramos', phone: '+63 922 678 9012', bloodType: 'O-', lastDonation: '2025-08-10', distance: '3.1 km', totalDonations: 8, arrived: false },
  { id: 'BLD-495810', name: 'Gabriela M. Torres', phone: '+63 923 789 0123', bloodType: 'O-', lastDonation: '2025-12-14', distance: '3.5 km', totalDonations: 3, arrived: false },
  { id: 'BLD-102938', name: 'Carlos Daniel Mendoza', phone: '+63 924 890 1234', bloodType: 'O-', lastDonation: '2025-10-18', distance: '3.8 km', totalDonations: 1, arrived: false }
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
    patientName: 'Jose R. Reyes',
    patientAge: 45,
    patientBloodType: 'O-',
    units: 2,
    diagnosis: 'Open Heart Surgery',
    hospital: 'Southern Philippines Medical Center (SPMC)',
    physician: 'Dr. Juan Dela Cruz, MD',
    ward: 'Ward 4B, Room 201',
    hospitalRefNo: 'SPMC-2026-04821',
    bloodCenter: 'SPMC Blood Production Services',
    urgency: 'urgent',
    dateNeeded: '2026-06-20',
    contactPerson: 'Maria C. Santos',
    contactNumber: '+63 917 123 4567',
    status: 'Pending',
    submittedAt: 'June 19, 2026, 9:30 AM',
    notes: 'Urgent release needed for surgery.',
    statusNote: ''
  }
];

export const useBloodStore = create(
  persist(
    (set, get) => ({
      // State
      donors: initialDonors,
      inventory: initialInventory,
      bloodRequests: initialRequests,
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

      // Actions
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
          distance: '2.5 km' // Default mock distance
        };
        set((state) => ({
          donors: [newDonor, ...state.donors],
          currentUser: newDonor
        }));
        return id;
      },

      addBloodRequest: (reqForm) => {
        const refNo = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
        const dateString = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) + ', ' + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const newRequest = {
          ...reqForm,
          refNo,
          status: 'Pending',
          submittedAt: dateString,
          statusNote: ''
        };

        set((state) => ({
          bloodRequests: [newRequest, ...state.bloodRequests]
        }));
        return refNo;
      },

      updateBloodRequestStatus: (refNo, status, statusNote = '') => {
        set((state) => ({
          bloodRequests: state.bloodRequests.map((req) =>
            req.refNo === refNo ? { ...req, status, statusNote } : req
          )
        }));
      },

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

      setFlaggedStatus: (flagged) => {
        set({ accountFlagged: flagged });
      },

      setArrivalStatus: (arrived) => {
        set((state) => {
          // Update current user arrival
          const updatedUser = state.currentUser ? { ...state.currentUser, arrived } : null;
          // Also update in donor registry
          const updatedDonors = state.donors.map((d) =>
            d.id === state.currentUser?.id ? { ...d, arrived } : d
          );
          return {
            arrivedAtFacility: arrived,
            currentUser: updatedUser,
            donors: updatedDonors
          };
        });
      },

      triggerMobilization: (target = 'O-', facility = 'SPMC Blood Production Services') => {
        set({
          mobilizeFlowStep: 1,
          mobilizeTarget: target,
          mobilizeFacility: facility,
          scanProgress: 0,
          scannedCount: 0,
          matchedCount: 0,
          criteriaChecked: 0,
          totalConfirmed: 12,
          currentPhase: 1
        });
      },

      setMobilizeFlowStep: (step) => {
        set({ mobilizeFlowStep: step });
      },

      setScanProgress: (progress, scanned, matched, criteria) => {
        set({
          scanProgress: progress,
          scannedCount: scanned,
          matchedCount: matched,
          criteriaChecked: criteria
        });
      },

      setPhaseDetails: (phase, confirmedCount) => {
        set({
          currentPhase: phase,
          totalConfirmed: confirmedCount
        });
      },

      dispatchSMSLog: (name, phone, msg, color, initials) => {
        const timeString = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const log = { name, phone, time: timeString, status: 'Delivered', msg, color, initials };
        set((state) => ({
          smsLogs: [log, ...state.smsLogs]
        }));
      },

      resetMobilization: () => {
        set({
          mobilizeFlowStep: 0,
          scanProgress: 0,
          scannedCount: 0,
          matchedCount: 0,
          criteriaChecked: 0,
          totalConfirmed: 12,
          currentPhase: 1,
          smsLogs: []
        });
      }
    }),
    {
      name: 'bloodlink-dvo-store'
    }
  )
);
