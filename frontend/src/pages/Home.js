import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className="hero">
        <h1>Save Lives with <span>Blood Donation</span></h1>
        <p>
          Connect with nearby blood donors instantly during emergencies.
          Our AI-powered system finds the most eligible donors in seconds.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-red">Become a Donor</Link>
          <Link to="/search" className="btn btn-outline">Find Donors Now</Link>
          {/* Only show if logged in as admin */}
          <Link to="/admin" className="btn btn-gray" style={{marginTop:'10px'}}>Admin Panel</Link>
        </div>
      </div>

      <div className="page">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">4</div>
            <div className="stat-label">Registered Donors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1</div>
            <div className="stat-label">Hospitals Connected</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1</div>
            <div className="stat-label">SOS Requests Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">&lt;2min</div>
            <div className="stat-label">Avg Response Time</div>
          </div>
        </div>

        <div className="sos-section">
          <h2 style={{fontSize:'32px', marginBottom:'12px'}}>🚨 Emergency Blood Needed?</h2>
          <p style={{color:'#aaa', marginBottom:'32px', fontSize:'16px'}}>
            Hospitals can trigger SOS to instantly notify all compatible donors in the city
          </p>
          <Link to="/register" className="sos-btn" style={{textDecoration:'none'}}>
            REGISTER AS DONOR
          </Link>
        </div>

        <h2 className="section-title">How It <span>Works</span></h2>
        <div className="grid-3">
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'40px', marginBottom:'16px'}}>🩸</div>
            <h3 style={{marginBottom:'8px'}}>Register as Donor</h3>
            <p style={{color:'#888', fontSize:'14px'}}>
              Sign up with your blood type and location. Takes less than 2 minutes.
            </p>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'40px', marginBottom:'16px'}}>🔔</div>
            <h3 style={{marginBottom:'8px'}}>Get Notified</h3>
            <p style={{color:'#888', fontSize:'14px'}}>
              Receive instant alerts when hospitals near you need your blood type.
            </p>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'40px', marginBottom:'16px'}}>❤️</div>
            <h3 style={{marginBottom:'8px'}}>Save a Life</h3>
            <p style={{color:'#888', fontSize:'14px'}}>
              Respond to requests and earn badges for every donation you make.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;