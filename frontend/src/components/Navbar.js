import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="logo-dot"></div>
        BloodConnect
      </Link>
      <div className="navbar-links">
        {!user ? (
          <>
            <Link to="/search" className="nav-link">Find Donors</Link>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-red">Register</Link>
          </>
        ) : user.role === 'donor' ? (
          <>
            <Link to="/search" className="nav-link">Find Donors</Link>
            <Link to="/donor-dashboard" className="nav-link">My Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/hospital-dashboard" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;