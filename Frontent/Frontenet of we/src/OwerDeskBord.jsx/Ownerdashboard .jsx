import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const S = {
  page:       { minHeight: '100vh', background: '#f4f6f8', fontFamily: "'Segoe UI', sans-serif" },
  topbar:     { background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo:       { fontSize: 18, fontWeight: 700, color: '#e07b39' },
  userPill:   { display: 'flex', alignItems: 'center', gap: 10, background: '#fff4ed', borderRadius: 999, padding: '6px 14px 6px 6px', fontSize: 13, color: '#b35a0f' },
  avatar:     { width: 28, height: 28, borderRadius: '50%', background: '#e07b39', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  body:       { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  sidebar:    { width: 220, background: '#fff', borderRight: '1px solid #e8e8e8', padding: '20px 0' },
  sideSection:{ padding: '0 16px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 },
  sideLabel:  { fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: 1, marginBottom: 8 },
  sideItem:   (a) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 2, background: a ? '#fff4ed' : 'transparent', color: a ? '#e07b39' : '#555', fontWeight: a ? 600 : 400 }),
  main:       { flex: 1, padding: 28 },
  sectionTitle:{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#222' },
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 },
  kpiCard:    (c) => ({ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #f0f0f0', borderLeft: `4px solid ${c}` }),
  kpiLabel:   { fontSize: 11, color: '#888', marginBottom: 6 },
  kpiValue:   { fontSize: 26, fontWeight: 700, color: '#222' },
  kpiSub:     { fontSize: 11, color: '#aaa', marginTop: 4 },
  tableWrap:  { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' },
  filterPills:{ display: 'flex', gap: 6 },
  pill:       (a) => ({ padding: '4px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer', border: a ? 'none' : '1px solid #ddd', background: a ? '#e07b39' : '#fff', color: a ? '#fff' : '#666' }),
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#888', borderBottom: '1px solid #f0f0f0', background: '#fafafa', textAlign: 'left' },
  td:         { padding: '11px 16px', fontSize: 13, borderBottom: '1px solid #f7f7f7', color: '#333' },
  badge:      (s) => ({ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: s === 'confirmed' ? '#e8f5e9' : s === 'cancelled' ? '#ffebee' : '#fff8e1', color: s === 'confirmed' ? '#2e7d32' : s === 'cancelled' ? '#c62828' : '#f57f17' }),
  typeBadge:  (t) => ({ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: t === 'hotel' ? '#e8f5e9' : t === 'car' ? '#e3f2fd' : '#fff3e0', color: t === 'hotel' ? '#2e7d32' : t === 'car' ? '#1565c0' : '#e65100' }),
  actionBtn:  (c) => ({ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: c, color: '#fff', marginLeft: 4 }),
  emptyState: { textAlign: 'center', padding: '48px 20px', color: '#aaa', fontSize: 14 },
  logoutBtn:  { padding: '6px 14px', borderRadius: 8, border: '1px solid #e07b39', background: 'transparent', color: '#e07b39', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('overview');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error,      setError]      = useState('');

  const name  = localStorage.getItem('name') || 'Owner';
  const token = localStorage.getItem('token');

  // ✅ Token se bookings fetch
  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch('http://localhost:3000/owner-bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
        else setError(data.message || 'Koi bookings nahi mili');
        setLoading(false);
      })
      .catch(() => {
        setError('Server se connect nahi ho pa raha');
        setLoading(false);
      });
  }, []);

  // ✅ Status update — confirmed/cancelled pe user ko email
  const updateStatus = async (booking_id, status) => {
    try {
      const res = await fetch(`http://localhost:3000/booking-status/${booking_id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.booking_id === booking_id ? { ...b, status } : b));
      } else {
        const d = await res.json();
        alert(d.message || 'Status update fail');
      }
    } catch {
      alert('Server Error');
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const filtered = typeFilter === 'all' ? bookings : bookings.filter(b => b.serviceType === typeFilter);
  const total    = bookings.length;
  const pending  = bookings.filter(b => b.status === 'pending').length;
  const revenue  = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0);
  const hotels   = bookings.filter(b => b.serviceType === 'hotel').length;
  const cars     = bookings.filter(b => b.serviceType === 'car').length;
  const bikes    = bookings.filter(b => b.serviceType === 'bike').length;

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={S.logo}>🏨 Owner Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={S.userPill}>
            <div style={S.avatar}>{name[0]?.toUpperCase()}</div>
            {name}
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={S.body}>
        <div style={S.sidebar}>
          <div style={S.sideSection}>
            <div style={S.sideLabel}>MENU</div>
            {['overview', 'bookings'].map(tab => (
              <div key={tab} style={S.sideItem(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                {tab === 'overview' ? '📊' : '📋'}&nbsp;{tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
          <div style={{ padding: '0 16px' }}>
            <div style={S.sideLabel}>FILTER</div>
            {['all', 'hotel', 'car', 'bike'].map(t => (
              <div key={t} style={S.sideItem(typeFilter === t)} onClick={() => setTypeFilter(t)}>
                {t === 'all' ? '🔍' : t === 'hotel' ? '🏨' : t === 'car' ? '🚗' : '🏍️'}&nbsp;
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div style={S.main}>
          {loading ? (
            <p style={{ color: '#888', marginTop: 40, textAlign: 'center' }}>Loading...</p>
          ) : error ? (
            <p style={{ color: '#c62828', marginTop: 40, textAlign: 'center' }}>{error}</p>
          ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  <div style={S.sectionTitle}>Overview</div>
                  <div style={S.kpiGrid}>
                    {[
                      { label: 'Total Bookings', value: total,   sub: 'All time',          color: '#e07b39' },
                      { label: 'Pending',         value: pending, sub: 'Action chahiye',    color: '#ff9800' },
                      { label: 'Revenue',         value: `₹${(revenue/1000).toFixed(1)}K`, sub: 'Confirmed', color: '#4caf50' },
                      { label: 'Hotels',          value: hotels,  sub: 'Hotel bookings',    color: '#2196f3' },
                      { label: 'Cars',            value: cars,    sub: 'Car bookings',      color: '#9c27b0' },
                      { label: 'Bikes',           value: bikes,   sub: 'Bike bookings',     color: '#ff5722' },
                    ].map(k => (
                      <div key={k.label} style={S.kpiCard(k.color)}>
                        <div style={S.kpiLabel}>{k.label}</div>
                        <div style={S.kpiValue}>{k.value}</div>
                        <div style={S.kpiSub}>{k.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={S.sectionTitle}>Recent Bookings</div>
                  <BookingTable bookings={bookings.slice(0, 5)} updateStatus={updateStatus} />
                </>
              )}

              {activeTab === 'bookings' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={S.sectionTitle}>All Bookings ({filtered.length})</div>
                    <div style={S.filterPills}>
                      {['all', 'hotel', 'car', 'bike'].map(t => (
                        <span key={t} style={S.pill(typeFilter === t)} onClick={() => setTypeFilter(t)}>
                          {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <BookingTable bookings={filtered} updateStatus={updateStatus} full />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingTable({ bookings, updateStatus, full }) {
  if (!bookings.length) return <div style={{ textAlign:'center', padding:'48px 20px', color:'#aaa' }}>📭 Koi booking nahi</div>;

  const headers = full
    ? ['ID', 'Service', 'Type', 'Guest', 'Phone', 'Check-in', 'Check-out', 'Guests', 'Amount', 'Status', 'Action']
    : ['ID', 'Service', 'Type', 'Guest', 'Dates', 'Amount', 'Status', 'Action'];

  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid #f0f0f0', overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={{ padding:'10px 16px', fontSize:11, fontWeight:600, color:'#888', borderBottom:'1px solid #f0f0f0', background:'#fafafa', textAlign:'left' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.booking_id}>
              <td style={{ padding:'11px 16px', fontSize:11, fontFamily:'monospace', borderBottom:'1px solid #f7f7f7' }}>#{b.booking_id}</td>
              <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.serviceName}</td>
              <td style={{ padding:'11px 16px', borderBottom:'1px solid #f7f7f7' }}>
                <span style={{ padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600, background: b.serviceType==='hotel'?'#e8f5e9':b.serviceType==='car'?'#e3f2fd':'#fff3e0', color: b.serviceType==='hotel'?'#2e7d32':b.serviceType==='car'?'#1565c0':'#e65100' }}>
                  {b.serviceType}
                </span>
              </td>
              <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.guestName}</td>
              {full && <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.guestPhone}</td>}
              <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.checkInDate}</td>
              {full
                ? <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.checkOutDate}</td>
                : <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.checkInDate} → {b.checkOutDate}</td>
              }
              {full && <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>{b.guests}</td>}
              <td style={{ padding:'11px 16px', fontSize:13, borderBottom:'1px solid #f7f7f7' }}>₹{b.totalAmount?.toLocaleString()}</td>
              <td style={{ padding:'11px 16px', borderBottom:'1px solid #f7f7f7' }}>
                <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background: b.status==='confirmed'?'#e8f5e9':b.status==='cancelled'?'#ffebee':'#fff8e1', color: b.status==='confirmed'?'#2e7d32':b.status==='cancelled'?'#c62828':'#f57f17' }}>
                  {b.status}
                </span>
              </td>
              <td style={{ padding:'11px 16px', borderBottom:'1px solid #f7f7f7' }}>
                {b.status === 'pending' && (
                  <>
                    <button style={{ padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:'#2e7d32', color:'#fff', marginRight:4 }}
                      onClick={() => updateStatus(b.booking_id, 'confirmed')}>✓ Accept</button>
                    <button style={{ padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:'#c62828', color:'#fff' }}
                      onClick={() => updateStatus(b.booking_id, 'cancelled')}>✕ Reject</button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <button style={{ padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:'#c62828', color:'#fff' }}
                    onClick={() => updateStatus(b.booking_id, 'cancelled')}>Cancel</button>
                )}
                {b.status === 'cancelled' && <span style={{ color:'#bbb', fontSize:12 }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}