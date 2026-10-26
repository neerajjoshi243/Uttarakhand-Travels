import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@600;700&display=swap');

  .sb-hero {
    background: linear-gradient(135deg, #fff8f4 0%, #fef3ec 50%, #fce8d8 100%);
    padding: 60px 24px 40px;
    text-align: center;
    border-bottom: 1px solid #f0e4d6;
  }

  .sb-hero h1 {
    font-family: 'Fraunces', serif;
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 12px;
    line-height: 1.2;
  }

  .sb-hero h1 span { color: #e07b39; }

  .sb-hero p {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.85rem, 2vw, 1rem);
    color: #888;
    margin: 0 0 36px;
  }

  .sb-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 32px rgba(224,123,57,0.12), 0 1px 4px rgba(0,0,0,0.06);
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
  }

  .sb-fields {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    .sb-fields { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .sb-fields { grid-template-columns: 1fr; }
    .sb-hero { padding: 40px 16px 32px; }
    .sb-card { padding: 16px; border-radius: 16px; }
  }

  .sb-field label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #e07b39;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    display: block;
    margin-bottom: 6px;
  }

  .sb-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #faf9f7;
    border: 1.5px solid #ede8e0;
    border-radius: 10px;
    padding: 0 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .sb-input-wrap:focus-within {
    border-color: #e07b39;
    box-shadow: 0 0 0 3px rgba(224,123,57,0.1);
    background: #fff;
  }

  .sb-input-wrap svg {
    color: #bbb;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }

  .sb-input-wrap input {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #1a1a2e;
    outline: none;
  }

  .sb-input-wrap input::placeholder { color: #bbb; }

  .sb-input-wrap input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0.5;
    cursor: pointer;
  }

  .sb-actions {
    display: flex;
    gap: 10px;
  }

  .sb-btn-search {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #e07b39;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  .sb-btn-search:hover { background: #c96a2a; }
  .sb-btn-search:active { transform: scale(0.98); }

  .sb-btn-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #fff;
    color: #999;
    border: 1.5px solid #ede8e0;
    border-radius: 10px;
    padding: 12px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
  }

  .sb-btn-clear:hover { border-color: #e07b39; color: #e07b39; }

  .sb-stats {
    display: flex;
    justify-content: center;
    gap: clamp(16px, 4vw, 48px);
    margin-top: 28px;
    flex-wrap: wrap;
  }

  .sb-stat {
    text-align: center;
    font-family: 'DM Sans', sans-serif;
  }

  .sb-stat strong {
    display: block;
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    font-weight: 600;
    color: #e07b39;
  }

  .sb-stat span {
    font-size: 12px;
    color: #aaa;
    letter-spacing: 0.04em;
  }
`;

function SearchBar({ onSearch }) {
  const [location, setLocation] = useState("");
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests,   setGuests]   = useState(1);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ location: location.trim().toLowerCase(), checkIn, checkOut, guests: Number(guests) });
    }
  };

  const handleClear = () => {
    setLocation(""); setCheckIn(""); setCheckOut(""); setGuests(1);
    if (onSearch) onSearch({ location: "", checkIn: "", checkOut: "", guests: 1 });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <style>{styles}</style>
      <div className="sb-hero">
        <h1>Find Your Perfect <span>Stay & Ride</span></h1>
        <p>Compare prices, choose services, and book instantly — all in one place</p>

        <div className="sb-card">
          <div className="sb-fields">
            <div className="sb-field">
              <label>Destination</label>
              <div className="sb-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <input
                  type="text"
                  placeholder="Nainital, Delhi, Goa..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <div className="sb-field">
              <label>Check-in</label>
              <div className="sb-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <input type="date" value={checkIn} min={today}
                  onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </div>

            <div className="sb-field">
              <label>Check-out</label>
              <div className="sb-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <input type="date" value={checkOut} min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>

            <div className="sb-field">
              <label>Guests</label>
              <div className="sb-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87"/>
                </svg>
                <input type="number" min="1" max="20" value={guests}
                  onChange={(e) => setGuests(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="sb-actions">
            <button className="sb-btn-search" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
            <button className="sb-btn-clear" onClick={handleClear}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
              Clear
            </button>
          </div>
        </div>

        <div className="sb-stats">
          <div className="sb-stat"><strong>500+</strong><span>Partners</span></div>
          <div className="sb-stat"><strong>50+</strong><span>Destinations</span></div>
          <div className="sb-stat"><strong>4.8★</strong><span>Avg Rating</span></div>
          <div className="sb-stat"><strong>10k+</strong><span>Happy Guests</span></div>
        </div>
      </div>
    </>
  );
}

export default SearchBar;