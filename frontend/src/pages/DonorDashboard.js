import React, { useState, useEffect } from 'react';
import API from '../api';

function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchRequests();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/me');
      setProfile(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleAvailability = async () => {
    try {
      const res = await API.patch('/donors/availability');
      setMsg(res.data.message);
      setProfile({...profile, isAvailable: res.data.isAvailable});
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { console.error(err); }
  };

  const respondToRequest = async (requestId, response) => {
    try {
      await API.post(`/requests/${requestId}/respond`, { response });
      setMsg(`Response recorded: ${response}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page"><p style={{color:'#888'}}>Loading...</p></div>;

  return (
    <div className="page">
      <h2 className="section-title">Donor <span>Dashboard</span></h2>

      {msg && <div className="success-banner">{msg}</div>}

      <div className="grid-2" style={{marginBottom:'28px'}}>
        <div className="card">
          <div className="card-header">
            <h3>My Profile</h3>
            <span className={`badge ${profile?.isAvailable ? 'badge-green' : 'badge-gray'}`}>
              {profile?.isAvailable ? '● Available' : '● Unavailable'}
            </span>
          </div>
          <p style={{color:'#888', marginBottom:'8px'}}>
            <strong style={{color:'#fff'}}>Name:</strong> {profile?.name}
          </p>
          <p style={{color:'#888', marginBottom:'8px'}}>
            <strong style={{color:'#fff'}}>Blood Type:</strong>{' '}
            <span style={{color:'#e74c3c', fontWeight:'800'}}>{profile?.bloodType}</span>
          </p>
          <p style={{color:'#888', marginBottom:'8px'}}>
            <strong style={{color:'#fff'}}>City:</strong> {profile?.city}
          </p>
          <p style={{color:'#888', marginBottom:'20px'}}>
            <strong style={{color:'#fff'}}>Donations:</strong> {profile?.donationCount}
          </p>

          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <span style={{color:'#888', fontSize:'14px'}}>Availability:</span>
            <label className="toggle-switch">
              <input type="checkbox"
                checked={profile?.isAvailable || false}
                onChange={toggleAvailability} />
              <span className="slider"></span>
            </label>
            <span style={{color: profile?.isAvailable ? '#27ae60' : '#888', fontSize:'14px'}}>
              {profile?.isAvailable ? 'Available to Donate' : 'Not Available'}
            </span>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <a href="/edit-profile" className="btn btn-gray"
            style={{ fontSize: '13px', padding: '8px 18px' }}>
             ✏️ Edit Profile
          </a>
        </div>

        <div className="card">
          <h3 style={{marginBottom:'16px'}}>My Badges</h3>
          {profile?.badges?.length === 0 ? (
            <div>
              <p style={{color:'#888', fontSize:'14px', marginBottom:'12px'}}>
                No badges yet. Respond to a blood request to earn your first badge!
              </p>
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                <div className="badge badge-gray" style={{width:'fit-content'}}>🔒 First Responder — respond to 1 request</div>
                <div className="badge badge-gray" style={{width:'fit-content'}}>🔒 Life Saver — respond to 5 requests</div>
                <div className="badge badge-gray" style={{width:'fit-content'}}>🔒 Hero Donor — respond to 10 requests</div>
              </div>
            </div>
          ) : (
            profile?.badges?.map(b => (
              <span key={b} className="badge badge-red" style={{marginRight:'8px', marginBottom:'8px', display:'inline-block'}}>
                🏅 {b}
              </span>
            ))
          )}
          <div style={{marginTop:'20px', padding:'16px', background:'#111', borderRadius:'8px'}}>
            <p style={{color:'#888', fontSize:'13px'}}>Donation Count</p>
            <p style={{fontSize:'32px', fontWeight:'800', color:'#c0392b'}}>{profile?.donationCount}</p>
          </div>
        </div>
      </div>

      <h3 className="section-title" style={{fontSize:'22px'}}>
        Open Blood <span>Requests</span>
      </h3>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No open requests right now.</p>
        </div>
      ) : (
        requests.map(req => (
          <div className="card" key={req._id}>
            <div className="card-header">
              <div>
                <h3>{req.hospitalName}</h3>
                <p style={{color:'#888', fontSize:'14px', marginTop:'4px'}}>
                 {req.city} &nbsp;|&nbsp; {req.bloodType} &nbsp;|&nbsp; {req.unitsNeeded} units
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                <span className={`badge ${req.urgencyLevel === 'critical' ? 'badge-red' : req.urgencyLevel === 'high' ? 'badge-orange' : 'badge-gray'}`}>
                  {req.urgencyLevel?.toUpperCase()}
                </span>
                {req.isSOS && <div style={{color:'#e74c3c', fontSize:'12px', marginTop:'4px'}}>🚨 SOS ACTIVE</div>}
              </div>
            </div>
            {req.patientDescription && (
              <p style={{color:'#888', fontSize:'14px', marginBottom:'16px'}}>
                {req.patientDescription}
              </p>
            )}
            <div style={{display:'flex', gap:'10px'}}>
              <button className="btn btn-green"
                onClick={() => respondToRequest(req._id, 'accepted')}>
                ✓ Accept
              </button>
              <button className="btn btn-gray"
                onClick={() => respondToRequest(req._id, 'declined')}>
                ✗ Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DonorDashboard;