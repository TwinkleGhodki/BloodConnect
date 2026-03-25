import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import API from '../api';

function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'donor', bloodType: '', city: '', state: '',
    hospitalName: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/api/auth/register', form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'donor') navigate('/donor-dashboard');
      else navigate('/hospital-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="page" style={{maxWidth:'560px'}}>
      <div className="card" style={{marginTop:'40px'}}>
        <h2 className="section-title" style={{marginBottom:'8px'}}>
          Join <span>BloodConnect</span>
        </h2>
        <p style={{color:'#888', marginBottom:'28px'}}>Create your account and start saving lives</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="tab-bar">
          <button className={`tab ${form.role === 'donor' ? 'active' : ''}`}
            onClick={() => setForm({...form, role: 'donor'})}>
            🩸 I am a Donor
          </button>
          <button className={`tab ${form.role === 'hospital' ? 'active' : ''}`}
            onClick={() => setForm({...form, role: 'hospital'})}>
            🏥 I am a Hospital
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Your name"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>

          {form.role === 'donor' && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label>Blood Type</label>
                  <select value={form.bloodType}
                    onChange={e => setForm({...form, bloodType: e.target.value})} required>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input placeholder="Chennai"
                    value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>State</label>
                <input placeholder="Tamil Nadu"
                  value={form.state}
                  onChange={e => setForm({...form, state: e.target.value})} />
              </div>
            </>
          )}

          {form.role === 'hospital' && (
            <>
              <div className="form-group">
                <label>Hospital Name</label>
                <input placeholder="Apollo Hospital"
                  value={form.hospitalName}
                  onChange={e => setForm({...form, hospitalName: e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>City</label>
                  <input placeholder="Chennai"
                    value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input placeholder="Tamil Nadu"
                    value={form.state}
                    onChange={e => setForm({...form, state: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input placeholder="Hospital address"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-red"
            style={{width:'100%', padding:'14px'}} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{textAlign:'center', marginTop:'20px', color:'#888'}}>
          Already have an account? <Link to="/login" style={{color:'#e74c3c'}}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;