import React, { useState, useEffect } from 'react';
import API from '../api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, donorsRes, hospitalsRes, requestsRes] = await Promise.all([
        API.get('/api/admin/stats'),
        API.get('/api/admin/donors'),
        API.get('/api/admin/hospitals'),
        API.get('/api/admin/requests'),
      ]);
      setStats(statsRes.data);
      setDonors(donorsRes.data);
      setHospitals(hospitalsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const verifyDonor = async (id) => {
    try {
      await API.patch(`/api/admin/verify/${id}`);
      setMsg('Donor verified successfully!');
      fetchAll();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/user/${id}`);
      setMsg('User deleted.');
      fetchAll();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page"><p style={{ color: '#888' }}>Loading admin data...</p></div>;

  return (
    <div className="page">
      <h2 className="section-title">Admin <span>Dashboard</span></h2>
      <p style={{ color: '#888', marginBottom: '28px' }}>
        System overview and management panel
      </p>

      {msg && <div className="success-banner">{msg}</div>}

      {/* STATS ROW */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalDonors}</div>
          <div className="stat-label">Total Donors</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalHospitals}</div>
          <div className="stat-label">Hospitals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.sosRequests}</div>
          <div className="stat-label">SOS Triggered</div>
        </div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#27ae60' }}>{stats?.openRequests}</div>
          <div className="stat-label">Open Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#27ae60' }}>{stats?.verifiedDonors}</div>
          <div className="stat-label">Verified Donors</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#27ae60' }}>{stats?.totalResponses}</div>
          <div className="stat-label">Accepted Responses</div>
        </div>
      </div>

      {/* BLOOD TYPE DISTRIBUTION */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Blood Type Distribution</h3>
          {stats?.bloodTypeStats?.map(b => (
            <div key={b._id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#e74c3c', fontWeight: '700' }}>{b._id || 'Unknown'}</span>
                <span style={{ color: '#888' }}>{b.count} donors</span>
              </div>
              <div style={{ background: '#2a2a2a', borderRadius: '4px', height: '8px' }}>
                <div style={{
                  background: '#c0392b',
                  height: '8px',
                  borderRadius: '4px',
                  width: `${(b.count / stats.totalDonors) * 100}%`,
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Top Cities</h3>
          {stats?.cityStats?.map((c, i) => (
            <div key={c._id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px', background: '#111',
              borderRadius: '8px', marginBottom: '8px'
            }}>
              <span style={{ color: '#fff' }}>#{i + 1} {c._id || 'Unknown'}</span>
              <span className="badge badge-red">{c.count} donors</span>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="tab-bar">
        <button className={`tab ${activeTab === 'donors' ? 'active' : ''}`}
          onClick={() => setActiveTab('donors')}>
          Donors ({donors.length})
        </button>
        <button className={`tab ${activeTab === 'hospitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('hospitals')}>
          Hospitals ({hospitals.length})
        </button>
        <button className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}>
          Requests ({requests.length})
        </button>
      </div>

      {/* DONORS TAB */}
      {activeTab === 'donors' && (
        <div>
          {donors.map(donor => (
            <div className="donor-card" key={donor._id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="blood-badge">{donor.bloodType || '?'}</div>
                <div className="donor-info">
                  <h3>{donor.name}
                    {donor.isVerified &&
                      <span className="badge badge-green" style={{ marginLeft: '8px' }}>✓ Verified</span>
                    }
                  </h3>
                  <p>📧 {donor.email} &nbsp;|&nbsp; 📞 {donor.phone}</p>
                  <p style={{ marginTop: '4px' }}>📍 {donor.city}, {donor.state} &nbsp;|&nbsp;
                    🩸 {donor.donationCount} donations &nbsp;|&nbsp;
                    <span style={{ color: donor.isAvailable ? '#27ae60' : '#888' }}>
                      {donor.isAvailable ? '● Available' : '● Unavailable'}
                    </span>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                {!donor.isVerified && (
                  <button className="btn btn-green" style={{ fontSize: '13px', padding: '8px 16px' }}
                    onClick={() => verifyDonor(donor._id)}>
                    ✓ Verify
                  </button>
                )}
                <button className="btn btn-gray" style={{ fontSize: '13px', padding: '8px 16px', background: '#3a0a0a', color: '#e74c3c' }}
                  onClick={() => deleteUser(donor._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOSPITALS TAB */}
      {activeTab === 'hospitals' && (
        <div>
          {hospitals.map(h => (
            <div className="card" key={h._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '6px' }}>🏥 {h.hospitalName || h.name}</h3>
                  <p style={{ color: '#888', fontSize: '14px' }}>
                    📧 {h.email} &nbsp;|&nbsp; 📞 {h.phone}
                  </p>
                  <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                    📍 {h.city}, {h.state}
                  </p>
                </div>
                <button className="btn btn-gray"
                  style={{ fontSize: '13px', padding: '8px 16px', background: '#3a0a0a', color: '#e74c3c' }}
                  onClick={() => deleteUser(h._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div>
          {requests.map(req => (
            <div className="card" key={req._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '6px' }}>{req.hospitalName}</h3>
                  <p style={{ color: '#888', fontSize: '14px' }}>
                    🩸 {req.bloodType} &nbsp;|&nbsp;
                    {req.unitsNeeded} units &nbsp;|&nbsp;
                    📍 {req.city}
                  </p>
                  <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                    👥 {req.respondedDonors?.length || 0} donors responded &nbsp;|&nbsp;
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${req.urgencyLevel === 'critical' ? 'badge-red' : req.urgencyLevel === 'high' ? 'badge-orange' : 'badge-gray'}`}>
                    {req.urgencyLevel?.toUpperCase()}
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge ${req.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                      {req.status?.toUpperCase()}
                    </span>
                  </div>
                  {req.isSOS && (
                    <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                      🚨 SOS ACTIVE
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;