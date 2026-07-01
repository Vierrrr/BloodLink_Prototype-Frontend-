import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DonorRegister from './pages/DonorRegister';
import DonorDashboard from './pages/DonorDashboard';
import DonorNotification from './pages/DonorNotification';
import DonorConfirm from './pages/DonorConfirm';
import AdminDashboard from './pages/AdminDashboard';
import RegistryDashboard from './pages/RegistryDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import IssuanceDashboard from './pages/IssuanceDashboard';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor/register" element={<DonorRegister />} />
        <Route path="/donor/dashboard" element={<DonorDashboard />} />
        <Route path="/donor/notification" element={<DonorNotification />} />
        <Route path="/donor/confirm" element={<DonorConfirm />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/registry/dashboard" element={<RegistryDashboard />} />
        <Route path="/bloodbank/dashboard" element={<BloodBankDashboard />} />
        <Route path="/issuance/dashboard" element={<IssuanceDashboard />} />
      </Routes>
    </Router>
  );
}
