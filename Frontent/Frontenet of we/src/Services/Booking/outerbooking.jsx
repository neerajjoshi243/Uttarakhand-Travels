import { useState, useEffect, useMemo } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@600;700&display=swap');

  .bs-wrap { padding: 32px 20px; max-width: 1200px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }

  .bs-header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
  }

  .bs-title {
    font-family: 'Fraunces', serif; font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 700; color: #1a1a2e; margin: 0;
  }

  .bs-filter-badge {
    display: flex; align-items: center; gap: 8px;
    background: #fff4ed; border: 1px solid #fdd5b8;
    border-radius: 999px; padding: 5px 14px;
    font-size: 13px; color: #b35a0f; font-weight: 500;
  }

  .bs-tabs {
    display: flex; gap: 8px; margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .bs-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 999px;
    border: 1.5px solid #ede8e0; background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px;
    font-weight: 500; color: #888; cursor: pointer;
    transition: all 0.2s; white-space: nowrap;
  }

  .bs-tab:hover { border-color: #e07b39; color: #e07b39; }

  .bs-tab.active {
    background: #e07b39; border-color: #e07b39;
    color: #fff; box-shadow: 0 4px 12px rgba(224,123,57,0.3);
  }

  .bs-tab .count {
    background: rgba(255,255,255,0.25);
    border-radius: 999px; padding: 1px 8px;
    font-size: 12px; font-weight: 600;
  }

  .bs-tab:not(.active) .count {
    background: #f0ece6; color: #999;
  }

  .bs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  @media (max-width: 600px) {
    .bs-grid { grid-template-columns: 1fr; gap: 16px; }
    .bs-wrap { padding: 24px 14px; }
  }

  .bs-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #f0ece6; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .bs-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(224,123,57,0.13);
  }

  .bs-card img {
    width: 100%; height: 190px; object-fit: cover;
    display: block;
  }

  @media (max-width: 480px) { .bs-card img { height: 160px; } }

  .bs-card-body { padding: 16px; }

  .bs-card-body h3 {
    font-family: 'Fraunces', serif; font-size: 15.5px;
    font-weight: 600; color: #1a1a2e; margin: 0 0 5px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .bs-card-body .location {
    font-size: 12.5px; color: #aaa; display: flex; align-items: center; gap: 4px;
    margin: 0 0 12px;
  }

  .bs-tags {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;
  }

  .bs-tag {
    font-size: 11.5px; font-weight: 500;
    padding: 3px 10px; border-radius: 999px;
    background: #f5f2ee; color: #6b5c4d;
  }

  .bs-tag.avail { background: #e8f5e9; color: #2e7d32; }
  .bs-tag.unavail { background: #ffebee; color: #c62828; }

  .bs-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid #f0ece6; margin-top: 4px;
    flex-wrap: wrap; gap: 8px;
  }

  .bs-price {
    font-family: 'Fraunces', serif; font-size: 1.15rem;
    font-weight: 700; color: #1a1a2e;
  }

  .bs-price span {
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    font-weight: 400; color: #aaa;
  }

  .bs-price .per-hr {
    font-family: 'DM Sans', sans-serif; font-size: 11.5px;
    font-weight: 400; color: #bbb; margin-left: 4px;
  }

  .bs-book-btn {
    background: #e07b39; color: #fff; border: none;
    border-radius: 8px; padding: 8px 18px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 600; cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    white-space: nowrap;
  }

  .bs-book-btn:hover { background: #c96a2a; }
  .bs-book-btn:active { transform: scale(0.97); }

  .bs-loading {
    text-align: center; padding: 80px 20px;
    color: #bbb; font-size: 15px;
  }

  .bs-loader {
    width: 36px; height: 36px;
    border: 3px solid #f0ece6;
    border-top-color: #e07b39;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .bs-empty {
    text-align: center; padding: 64px 24px;
    background: #fff; border-radius: 16px;
    border: 1px dashed #e8e0d8; grid-column: 1 / -1;
  }

  .bs-empty-icon {
    width: 52px; height: 52px;
    background: #fff4ed; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 24px;
  }

  .bs-empty h3 {
    font-family: 'Fraunces', serif; font-size: 16px;
    font-weight: 600; color: #1a1a2e; margin: 0 0 8px;
  }

  .bs-empty p {
    font-size: 13.5px; color: #aaa; margin: 0 0 20px; line-height: 1.5;
  }

  .bs-empty-btn {
    background: #e07b39; color: #fff; border: none;
    border-radius: 8px; padding: 9px 22px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px;
    font-weight: 600; cursor: pointer;
    transition: background 0.2s;
  }

  .bs-empty-btn:hover { background: #c96a2a; }

  /* ── Modal ── */
  .bm-overlay {
    position: fixed; inset: 0;
    background: rgba(20,10,5,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 16px;
  }

  .bm-box {
    background: #fff; border-radius: 20px;
    padding: 28px 24px; width: 100%; max-width: 420px;
    max-height: 92vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.22);
    position: relative;
  }

  @media (max-width: 480px) {
    .bm-box { padding: 22px 16px; border-radius: 16px; }
  }

  .bm-close {
    position: absolute; top: 16px; right: 16px;
    background: #f5f2ee; border: none;
    border-radius: 50%; width: 32px; height: 32px;
    font-size: 16px; cursor: pointer; color: #888;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }

  .bm-close:hover { background: #ede8e0; }

  .bm-title {
    font-family: 'Fraunces', serif; font-size: 18px;
    font-weight: 700; color: #1a1a2e; margin: 0 0 22px;
  }

  .bm-label {
    font-size: 11px; font-weight: 600; color: #e07b39;
    text-transform: uppercase; letter-spacing: 0.06em;
    display: block; margin-bottom: 6px;
  }

  .bm-input {
    width: 100%; padding: 10px 14px;
    border-radius: 10px; border: 1.5px solid #ede8e0;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #1a1a2e; margin-bottom: 16px;
    box-sizing: border-box; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .bm-input:focus {
    border-color: #e07b39;
    box-shadow: 0 0 0 3px rgba(224,123,57,0.1);
  }

  .bm-grid-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }

  .bm-price-box {
    background: #faf9f7; border-radius: 12px;
    padding: 16px; margin-bottom: 18px;
    border: 1px solid #f0ece6;
  }

  .bm-row {
    display: flex; justify-content: space-between;
    font-size: 13.5px; color: #777; margin-bottom: 6px;
  }

  .bm-row-total {
    display: flex; justify-content: space-between;
    font-size: 15px; font-weight: 700; color: #1a1a2e;
    border-top: 1px solid #ede8e0; padding-top: 10px; margin-top: 6px;
  }

  .bm-row-total span:last-child { color: #e07b39; }

  .bm-confirm {
    width: 100%; padding: 13px 0;
    background: #e07b39; color: #fff; border: none;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  .bm-confirm:hover { background: #c96a2a; }
  .bm-confirm:active { transform: scale(0.98); }
  .bm-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

  .bm-error {
    color: #c62828; font-size: 12.5px;
    margin: -10px 0 14px; padding: 8px 12px;
    background: #ffebee; border-radius: 8px;
  }

  .bm-success { text-align: center; padding: 16px 0; }
  .bm-success-icon { font-size: 52px; margin-bottom: 14px; }

  .bm-success-title {
    font-family: 'Fraunces', serif; font-size: 20px;
    font-weight: 700; color: #2e7d32; margin: 0 0 8px;
  }

  .bm-success-id {
    display: inline-block; background: #e8f5e9; color: #1b5e20;
    padding: 4px 16px; border-radius: 999px;
    font-family: monospace; font-size: 13.5px; margin-bottom: 14px;
  }

  .bm-success p { font-size: 13.5px; color: #666; margin: 4px 0; }

  .bm-done-btn {
    width: 100%; padding: 12px 0; margin-top: 20px;
    background: #388e3c; color: #fff; border: none;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background 0.2s;
  }

  .bm-done-btn:hover { background: #2e7d32; }
`;

const getImageSrc = (img) => {
  if (!img)          return "https://placehold.co/600x400?text=No+Image";
  if (img.imageUrl)  return img.imageUrl;
  if (img.imageData) return `data:${img.imageType};base64,${img.imageData}`;
  return "https://placehold.co/600x400?text=No+Image";
};

function BookingModal({ item, type, onClose }) {
  const [form, setForm] = useState({ guestName: '', guestPhone: '', checkInDate: '', checkOutDate: '', guests: 1 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const pricePerUnit = type === 'hotel' ? item.pricePerNight : item.pricePerDay;
  const unitLabel = type === 'hotel' ? 'night' : 'day';

  const calcDays = () => {
    if (!form.checkInDate || !form.checkOutDate) return 0;
    return Math.max(0, Math.round((new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000));
  };

  const days = calcDays();
  const total = days * pricePerUnit;
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const today = new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    if (!form.guestName || !form.guestPhone || !form.checkInDate || !form.checkOutDate)
      return setError('Please fill all details.');
    if (days <= 0) return setError('Check-out must be after check-in.');
    const token = localStorage.getItem('token');
    if (!token) return setError('Please login first.');
    if (!/^[0-9]{10}$/.test(form.guestPhone)) return setError('Phone must be 10 digits.');

    setLoading(true); setError('');
    const service_id = type === 'hotel' ? item.hotel_id : type === 'car' ? item.car_id : item.bike_id;

    try {
      const res = await fetch('http://localhost:3000/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ serviceType: type, service_id, ...form, totalAmount: total }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(data);
      else setError(data.message || 'Booking failed.');
    } catch { setError('Cannot connect to server.'); }
    setLoading(false);
  };

  return (
    <div className="bm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bm-box">
        <button className="bm-close" onClick={onClose}>✕</button>

        {success ? (
          <div className="bm-success">
            <div className="bm-success-icon">🎉</div>
            <div className="bm-success-title">Booking Confirmed!</div>
            <div className="bm-success-id">#{success.booking_id}</div>
            <p>{success.data?.serviceName}</p>
            <p>{form.checkInDate} → {form.checkOutDate}</p>
            <p style={{ fontWeight: 600, color: '#1a1a2e', marginTop: 8 }}>
              Total: ₹{total.toLocaleString()}
            </p>
            <p style={{ color: '#e07b39', fontSize: 12.5 }}>Awaiting owner confirmation</p>
            <button className="bm-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="bm-title">
              {type === 'hotel' ? '🏨' : type === 'car' ? '🚗' : '🏍️'} Book Now
            </div>

            <label className="bm-label">Full Name</label>
            <input className="bm-input" placeholder="Your full name" value={form.guestName} onChange={set('guestName')} />

            <label className="bm-label">Phone Number</label>
            <input className="bm-input" placeholder="10-digit mobile number" maxLength={10}
              value={form.guestPhone}
              onChange={(e) => setForm(f => ({ ...f, guestPhone: e.target.value.replace(/\D/g, '') }))} />

            <div className="bm-grid-2">
              <div>
                <label className="bm-label">{type === 'hotel' ? 'Check-in' : 'Pickup'}</label>
                <input className="bm-input" type="date" value={form.checkInDate}
                  min={today} onChange={set('checkInDate')} />
              </div>
              <div>
                <label className="bm-label">{type === 'hotel' ? 'Check-out' : 'Return'}</label>
                <input className="bm-input" type="date" value={form.checkOutDate}
                  min={form.checkInDate || today} onChange={set('checkOutDate')} />
              </div>
            </div>

            <label className="bm-label">Guests</label>
            <input className="bm-input" type="number" min="1" max="10"
              value={form.guests} onChange={set('guests')} />

            <div className="bm-price-box">
              <div className="bm-row">
                <span>Rate per {unitLabel}</span>
                <span>₹{pricePerUnit?.toLocaleString()}</span>
              </div>
              <div className="bm-row">
                <span>Duration</span>
                <span>{days > 0 ? `${days} ${unitLabel}${days > 1 ? 's' : ''}` : '—'}</span>
              </div>
              <div className="bm-row-total">
                <span>Total Amount</span>
                <span>{days > 0 ? `₹${total.toLocaleString()}` : '—'}</span>
              </div>
            </div>

            {error && <div className="bm-error">{error}</div>}

            <button className="bm-confirm" onClick={handleBook} disabled={loading}>
              {loading ? 'Processing...' : '✅ Confirm Booking'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ query, onClear }) {
  return (
    <div className="bs-empty">
      <div className="bs-empty-icon">🔍</div>
      <h3>No results found</h3>
      <p>
        {query
          ? `We couldn't find anything matching "${query}". Try a different location.`
          : 'Nothing available right now. Check back soon.'}
      </p>
      {query && <button className="bs-empty-btn" onClick={onClear}>Clear Filters</button>}
    </div>
  );
}

function BookingSection({ filters = {}, onClearFilters }) {
  const [hotels,    setHotels]    = useState([]);
  const [cars,      setCars]      = useState([]);
  const [bikes,     setBikes]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('hotels');
  const [modal,     setModal]     = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/merge-hotels').then(r => r.json()),
      fetch('http://localhost:3000/cars').then(r => r.json()),
      fetch('http://localhost:3000/bikes').then(r => r.json()),
    ])
    .then(([h, c, b]) => { setHotels(h); setCars(c); setBikes(b); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  const loc = filters.location;

  const filteredHotels = useMemo(() => !loc ? hotels : hotels.filter(h =>
    h.hotelLocation?.toLowerCase().includes(loc) || h.hotelName?.toLowerCase().includes(loc)
  ), [hotels, loc]);

  const filteredCars = useMemo(() => !loc ? cars : cars.filter(c =>
    c.pickupLocation?.toLowerCase().includes(loc) || c.carName?.toLowerCase().includes(loc)
  ), [cars, loc]);

  const filteredBikes = useMemo(() => !loc ? bikes : bikes.filter(b =>
    b.pickupLocation?.toLowerCase().includes(loc) || b.bikeName?.toLowerCase().includes(loc)
  ), [bikes, loc]);

  const tabs = [
    { id: 'hotels', label: '🏨 Hotels', count: filteredHotels.length },
    { id: 'cars',   label: '🚗 Cars',   count: filteredCars.length   },
    { id: 'bikes',  label: '🏍️ Bikes',  count: filteredBikes.length  },
  ];

  const currentItems = activeTab === 'hotels' ? filteredHotels : activeTab === 'cars' ? filteredCars : filteredBikes;

  if (loading) return (
    <div className="bs-loading">
      <div className="bs-loader" />
      Finding best options for you...
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="bs-wrap">
        <div className="bs-header">
          <h2 className="bs-title">Available Stays & Rides</h2>
          {loc && (
            <div className="bs-filter-badge">
              📍 {loc}
            </div>
          )}
        </div>

        <div className="bs-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`bs-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              <span className="count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="bs-grid">
          {currentItems.length === 0 ? (
            <EmptyState query={loc} onClear={onClearFilters} />
          ) : activeTab === 'hotels' ? (
            filteredHotels.map(hotel => (
              <div className="bs-card" key={hotel.hotel_id}>
                <img src={getImageSrc(hotel.hotelImages?.[0])} alt={hotel.hotelName}
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }} />
                <div className="bs-card-body">
                  <h3>{hotel.hotelName}</h3>
                  <p className="location">📍 {hotel.hotelLocation}</p>
                  {hotel.amenities?.length > 0 && (
                    <div className="bs-tags">
                      {hotel.amenities.slice(0, 4).map((a, i) => <span className="bs-tag" key={i}>{a}</span>)}
                    </div>
                  )}
                  <div className="bs-card-footer">
                    <div className="bs-price">₹{hotel.pricePerNight?.toLocaleString()} <span>/ night</span></div>
                    <button className="bs-book-btn" onClick={() => setModal({ item: hotel, type: 'hotel' })}>Book Now</button>
                  </div>
                </div>
              </div>
            ))
          ) : activeTab === 'cars' ? (
            filteredCars.map(car => (
              <div className="bs-card" key={car.car_id}>
                <img src={getImageSrc(car.carImages?.[0])} alt={car.carName}
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }} />
                <div className="bs-card-body">
                  <h3>{car.carName} — {car.carModel}</h3>
                  <p className="location">📍 {car.pickupLocation}</p>
                  <div className="bs-tags">
                    <span className="bs-tag">⛽ {car.fuelType}</span>
                    <span className="bs-tag">👥 {car.seats} Seats</span>
                    <span className={`bs-tag ${car.isAvailable ? 'avail' : 'unavail'}`}>
                      {car.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                  <div className="bs-card-footer">
                    <div className="bs-price">
                      ₹{car.pricePerDay?.toLocaleString()} <span>/ day</span>
                      {car.pricePerHour > 0 && <span className="per-hr">· ₹{car.pricePerHour}/hr</span>}
                    </div>
                    <button className="bs-book-btn" onClick={() => setModal({ item: car, type: 'car' })}>Book Now</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredBikes.map(bike => (
              <div className="bs-card" key={bike.bike_id}>
                <img src={getImageSrc(bike.bikeImages?.[0])} alt={bike.bikeName}
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }} />
                <div className="bs-card-body">
                  <h3>{bike.bikeName} — {bike.bikeModel}</h3>
                  <p className="location">📍 {bike.pickupLocation}</p>
                  <div className="bs-tags">
                    <span className="bs-tag">🏷️ {bike.bikeType}</span>
                    <span className="bs-tag">⛽ {bike.fuelType}</span>
                    {bike.helmetIncluded && <span className="bs-tag">🪖 Helmet</span>}
                    <span className={`bs-tag ${bike.isAvailable ? 'avail' : 'unavail'}`}>
                      {bike.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                  <div className="bs-card-footer">
                    <div className="bs-price">
                      ₹{bike.pricePerDay?.toLocaleString()} <span>/ day</span>
                      {bike.pricePerHour > 0 && <span className="per-hr">· ₹{bike.pricePerHour}/hr</span>}
                    </div>
                    <button className="bs-book-btn" onClick={() => setModal({ item: bike, type: 'bike' })}>Book Now</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal && <BookingModal item={modal.item} type={modal.type} onClose={() => setModal(null)} />}
    </>
  );
}

export default BookingSection;