import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import API from '../api';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'donor') navigate('/donor-dashboard');
      else navigate('/hospital-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="page" style={{maxWidth:'480px'}}>
      <div className="card" style={{marginTop:'60px'}}>
        <h2 className="section-title" style={{marginBottom:'8px'}}>
          Welcome <span>Back</span>
        </h2>
        <p style={{color:'#888', marginBottom:'28px'}}>Login to your BloodConnect account</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-red" style={{width:'100%', padding:'14px'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{textAlign:'center', marginTop:'20px', color:'#888'}}>
          Don't have an account? <Link to="/register" style={{color:'#e74c3c'}}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;