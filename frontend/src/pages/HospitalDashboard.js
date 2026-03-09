import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import API from '../api';

function HospitalDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [sosResult, setSosResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [newRequest, setNewRequest] = useState({
    bloodType: '', unitsNeeded: '', urgencyLevel: 'normal',
    city: '', state: '', patientDescription: ''
  });
  const [newInventory, setNewInventory] = useState({
    bloodType: '', unitsAvailable: '', minimumRequired: 5
  });

  useEffect(() => {
    fetchRequests();
    fetchInventory();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchInventory = async () => {
    try {
      const res = await API.get('/hospitals/inventory');
      setInventory(res.data.inventory);
      setAlerts(res.data.alerts);
    } catch (err) { console.error(err); }
  };

  const createRequest = async (e) => {
    e.preventDefault();
    try {
      await API.post('/requests', newRequest);
      setMsg('Blood request created successfully!');
      fetchRequests();
      setNewRequest({ bloodType:'', unitsNeeded:'', urgencyLevel:'normal', city:'', state:'', patientDescription:'' });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('Error creating request'); }
  };

  const triggerSOS = async (requestId) => {
    try {
      const res = await API.post(`/requests/${requestId}/sos`);
      setSosResult(res.data);
    } catch (err) { console.error(err); }
  };

  const updateInventory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/hospitals/inventory', newInventory);
      setMsg('Inventory updated!');
      fetchInventory();
      setNewInventory({ bloodType:'', unitsAvailable:'', minimumRequired:5 });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('Error updating inventory'); }
  };

  return (
    <div className="page">
      <h2 className="section-title">Hospital <span>Dashboard</span></h2>
      <p style={{color:'#888', marginBottom:'28px'}}>
        Welcome, <strong style={{color:'#fff'}}>{user?.name}</strong>
      </p>

      {msg && <div className="success-banner">{msg}</div>}

      {alerts.length > 0 && alerts.map((alert, i) => (
        <div className="alert-box" key={i}>
          <span style={{fontSize:'20px'}}>⚠️</span>
          <span>{alert.message}</span>
        </div>
      ))}

      {sosResult && (
        <div style={{background:'rgba(192,57,43,0.15)', border:'2px solid #c0392b',
          borderRadius:'12px', padding:'24px', marginBottom:'24px'}}>
          <h3 style={{color:'#e74c3c', marginBottom:'12px'}}>
            🚨 SOS Triggered — {sosResult.donorsNotified} Donors Notified
          </h3>
          {sosResult.matchingDonors?.map(d => (
            <div key={d._id} style={{display:'flex', justifyContent:'space-between',
              padding:'10px', background:'#1a1a1a', borderRadius:'8px', marginBottom:'8px'}}>
              <span>{d.name} — <strong style={{color:'#e74c3c'}}>{d.bloodType}</strong></span>
              <span style={{color:'#888'}}>📞 {d.phone}</span>
            </div>
          ))}
          <button className="btn btn-gray" style={{marginTop:'12px'}}
            onClick={() => setSosResult(null)}>Close</button>
        </div>
      )}

      <div className="tab-bar">
        <button className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}>Blood Requests</button>
        <button className={`tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}>+ New Request</button>
        <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}>Inventory</button>
      </div>

      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="empty-state"><p>No open requests yet.</p></div>
          ) : (
            requests.map(req => (
              <div className="card" key={req._id}>
                <div className="card-header">
                  <div>
                    <h3>{req.hospitalName}</h3>
                    <p style={{color:'#888', fontSize:'14px', marginTop:'4px'}}>
                      🩸 {req.bloodType} &nbsp;|&nbsp; {req.unitsNeeded} units &nbsp;|&nbsp; 📍 {req.city}
                    </p>
                    <p style={{color:'#888', fontSize:'13px', marginTop:'4px'}}>
                      👥 {req.respondedDonors?.length || 0} donors responded
                    </p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className={`badge ${req.urgencyLevel === 'critical' ? 'badge-red' : req.urgencyLevel === 'high' ? 'badge-orange' : 'badge-gray'}`}>
                      {req.urgencyLevel?.toUpperCase()}
                    </span>
                    {req.isSOS && <div style={{color:'#e74c3c', fontSize:'12px', marginTop:'4px'}}>🚨 SOS ACTIVE</div>}
                  </div>
                </div>
                {!req.isSOS && (
                  <button className="sos-btn" style={{fontSize:'14px', padding:'10px 28px'}}
                    onClick={() => triggerSOS(req._id)}>
                    🚨 TRIGGER SOS
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="card">
          <h3 style={{marginBottom:'20px'}}>Create Blood Request</h3>
          <form onSubmit={createRequest}>
            <div className="grid-2">
              <div className="form-group">
                <label>Blood Type Needed</label>
                <select value={newRequest.bloodType}
                  onChange={e => setNewRequest({...newRequest, bloodType: e.target.value})} required>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Units Needed</label>
                <input type="number" placeholder="2"
                  value={newRequest.unitsNeeded}
                  onChange={e => setNewRequest({...newRequest, unitsNeeded: e.target.value})} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Urgency Level</label>
                <select value={newRequest.urgencyLevel}
                  onChange={e => setNewRequest({...newRequest, urgencyLevel: e.target.value})}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <input placeholder="Chennai"
                  value={newRequest.city}
                  onChange={e => setNewRequest({...newRequest, city: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>Patient Description (optional)</label>
              <input placeholder="e.g. Patient needs urgent surgery"
                value={newRequest.patientDescription}
                onChange={e => setNewRequest({...newRequest, patientDescription: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-red" style={{padding:'12px 32px'}}>
              Create Request
            </button>
          </form>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
          <div className="card" style={{marginBottom:'24px'}}>
            <h3 style={{marginBottom:'20px'}}>Update Blood Inventory</h3>
            <form onSubmit={updateInventory}>
              <div className="grid-3">
                <div className="form-group" style={{margin:0}}>
                  <label>Blood Type</label>
                  <select value={newInventory.bloodType}
                    onChange={e => setNewInventory({...newInventory, bloodType: e.target.value})} required>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label>Units Available</label>
                  <input type="number" placeholder="10"
                    value={newInventory.unitsAvailable}
                    onChange={e => setNewInventory({...newInventory, unitsAvailable: e.target.value})} required />
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label>Minimum Required</label>
                  <input type="number" placeholder="5"
                    value={newInventory.minimumRequired}
                    onChange={e => setNewInventory({...newInventory, minimumRequired: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-red" style={{marginTop:'20px', padding:'12px 32px'}}>
                Update Inventory
              </button>
            </form>
          </div>

          <h3 style={{marginBottom:'16px', color:'#aaa'}}>Current Stock</h3>
          {inventory.length === 0 ? (
            <div className="empty-state"><p>No inventory data yet.</p></div>
          ) : (
            <div className="grid-3">
              {inventory.map(item => (
                <div className="card" key={item._id} style={{textAlign:'center'}}>
                  <div className="blood-badge" style={{margin:'0 auto 12px', width:'60px', height:'60px', fontSize:'18px'}}>
                    {item.bloodType}
                  </div>
                  <div style={{fontSize:'32px', fontWeight:'800', color: item.isLow ? '#e74c3c' : '#27ae60'}}>
                    {item.unitsAvailable}
                  </div>
                  <div style={{color:'#888', fontSize:'13px'}}>units available</div>
                  {item.isLow && (
                    <div className="badge badge-red" style={{marginTop:'8px'}}>⚠️ Low Stock</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;