import React, { useState } from 'react';
import API from '../api';

function SearchDonors() {
  const [filters, setFilters] = useState({ bloodType: '', city: '' });
  const [donors, setDonors] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.city) params.append('city', filters.city);
      const res = await API.get(`/donors/ranked?${params.toString()}`);
      setDonors(res.data.donors);
      setCount(res.data.count);
      setSearched(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="page">
      <h2 className="section-title">Find <span>Blood Donors</span></h2>
      <p style={{color:'#888', marginBottom:'28px'}}>
        Search donors by blood type and city. Our ML system ranks them by availability likelihood.
      </p>

      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="grid-2">
            <div className="form-group" style={{margin:0}}>
              <label>Blood Type</label>
              <select value={filters.bloodType}
                onChange={e => setFilters({...filters, bloodType: e.target.value})}>
                <option value="">All Blood Types</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{margin:0}}>
              <label>City</label>
              <input placeholder="e.g. Chennai"
                value={filters.city}
                onChange={e => setFilters({...filters, city: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-red"
            style={{marginTop:'20px', padding:'12px 40px'}} disabled={loading}>
            {loading ? 'Searching...' : '🔍 Search Donors'}
          </button>
        </form>
      </div>

      {searched && (
        <div style={{marginTop:'28px'}}>
          <p style={{color:'#888', marginBottom:'16px'}}>
            Found <strong style={{color:'#e74c3c'}}>{count}</strong> eligible donors
          </p>

          {donors.length === 0 ? (
            <div className="empty-state">
              <p>😔 No donors found for this search.</p>
              <p style={{marginTop:'8px', fontSize:'14px'}}>Try a different city or blood type.</p>
            </div>
          ) : (
            donors.map(donor => (
              <div className="donor-card" key={donor._id}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                  <div className="blood-badge">{donor.bloodType}</div>
                  <div className="donor-info">
                    <h3>{donor.name}</h3>
                    <p>📍 {donor.city} &nbsp;|&nbsp; 📞 {donor.phone}</p>
                    <p style={{marginTop:'4px'}}>
                      {donor.badges?.map(b => (
                        <span key={b} className="badge badge-red" style={{marginRight:'6px'}}>{b}</span>
                      ))}
                      {donor.isVerified && (
                        <span className="badge badge-green">✓ Verified</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="ml-score">
                  <div className="score" style={{color: getScoreColor(donor.mlScore)}}>
                    {donor.mlScore}
                  </div>
                  <div className="label">ML Score</div>
                  <div style={{fontSize:'11px', color:'#888', marginTop:'4px', maxWidth:'120px', textAlign:'center'}}>
                    {donor.prediction}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchDonors;