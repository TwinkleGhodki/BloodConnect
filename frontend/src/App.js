import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchDonors from './pages/SearchDonors';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EditProfile from './pages/EditProfile';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchDonors />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;