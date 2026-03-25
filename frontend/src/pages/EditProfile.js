import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bloodType: '', city: '', state: '', phone: '',
    lastDonationDate: '', isAvailable: true
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/auth/me');
      setForm({
        bloodType: res.data.bloodType || '',
        city: res.data.city || '',
        state: res.data.state || '',
        phone: res.data.phone || '',
        lastDonationDate: res.data.lastDonationDate
          ? new Date(res.data.lastDonationDate).toISOString().split('T')[0]
          : '',
        isAvailable: res.data.isAvailable
      });
    } catch (err) {
      setError('Failed to load profile');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await API.put('/donors/profile', form);
      setMsg('Profile updated successfully!');
      setTimeout(() => navigate('/donor-dashboard'), 1500);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) return <div className="page"><p style={{ color: '#888' }}>Loading...</p></div>;

  return (
    <div className="page" style={{ maxWidth: '560px' }}>
      <div className="card" style={{ marginTop: '40px' }}>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>
          Edit <span>Profile</span>
        </h2>
        <p style={{ color: '#888', marginBottom: '28px' }}>
          Update your donor information
        </p>

        {msg && <div className="success-banner">{msg}</div>}
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Blood Type</label>
              <select value={form.bloodType}
                onChange={e => setForm({ ...form, bloodType: e.target.value })}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>City</label>
              <input placeholder="Chennai"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input placeholder="Tamil Nadu"
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label>Last Donation Date</label>
            <input type="date"
              value={form.lastDonationDate}
              onChange={e => setForm({ ...form, lastDonationDate: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Availability</label>
            <select value={form.isAvailable}
              onChange={e => setForm({ ...form, isAvailable: e.target.value === 'true' })}>
              <option value="true">Available to Donate</option>
              <option value="false">Not Available</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-red"
              style={{ flex: 1, padding: '14px' }}>
              Save Changes
            </button>
            <button type="button" className="btn btn-gray"
              style={{ flex: 1, padding: '14px' }}
              onClick={() => navigate('/donor-dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;