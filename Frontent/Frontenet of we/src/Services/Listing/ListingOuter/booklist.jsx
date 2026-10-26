import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@600;700&display=swap');

  .ss-box {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #f0ece6;
    padding: 28px 24px;
    font-family: 'DM Sans', sans-serif;
    position: sticky;
    top: 24px;
    overflow: hidden;
  }

  .ss-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e07b39, #f5a96b, #e07b39);
    background-size: 200% 100%;
    animation: shimmer 2.5s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .ss-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: #fff4ed; color: #e07b39;
    border: 1px solid #fdd5b8;
    border-radius: 999px; padding: 4px 12px;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.07em;
    margin-bottom: 14px;
  }

  .ss-title {
    font-family: 'Fraunces', serif;
    font-size: clamp(1.1rem, 2.5vw, 1.35rem);
    font-weight: 700; color: #1a1a2e;
    margin: 0 0 8px; line-height: 1.25;
  }

  .ss-subtitle {
    font-size: 13.5px; color: #999;
    margin: 0 0 24px; line-height: 1.5;
  }

  .ss-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }

  .ss-option {
    display: flex; align-items: center; gap: 12px;
    background: #faf9f7; border: 1.5px solid #f0ece6;
    border-radius: 12px; padding: 13px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    font-weight: 500; color: #555; cursor: default;
    transition: all 0.2s;
  }

  .ss-option:hover {
    background: #fff4ed;
    border-color: #fdd5b8;
    color: #e07b39;
    transform: translateX(4px);
  }

  .ss-option-icon {
    width: 38px; height: 38px;
    background: #fff; border-radius: 10px;
    border: 1px solid #ede8e0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .ss-option-text { flex: 1; }
  .ss-option-text strong { display: block; font-size: 13.5px; font-weight: 600; color: #1a1a2e; }
  .ss-option-text span { font-size: 11.5px; color: #aaa; }

  .ss-option-arrow { color: #ccc; font-size: 16px; transition: color 0.2s; }
  .ss-option:hover .ss-option-arrow { color: #e07b39; }

  .ss-start-btn {
    width: 100%; padding: 14px 0;
    background: #e07b39; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    cursor: pointer; margin-bottom: 20px;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 16px rgba(224,123,57,0.3);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .ss-start-btn:hover { background: #c96a2a; box-shadow: 0 6px 20px rgba(224,123,57,0.35); }
  .ss-start-btn:active { transform: scale(0.98); }

  .ss-divider { border: none; border-top: 1px solid #f0ece6; margin: 0 0 18px; }

  .ss-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .ss-stat {
    background: #faf9f7; border-radius: 12px;
    padding: 12px 14px; text-align: center;
  }

  .ss-stat strong {
    display: block; font-family: 'Fraunces', serif;
    font-size: 1.15rem; font-weight: 700; color: #e07b39;
  }

  .ss-stat span { font-size: 11px; color: #bbb; margin-top: 2px; display: block; }

  .ss-trust {
    display: flex; align-items: center; gap: 6px;
    justify-content: center; margin-top: 16px;
    font-size: 12px; color: #bbb;
  }

  .ss-trust-dot { width: 5px; height: 5px; background: #e07b39; border-radius: 50%; }

  /* Responsive: on tablet/mobile, sidebar goes below content */
  @media (max-width: 900px) {
    .ss-box {
      position: static;
      border-radius: 16px;
      padding: 22px 18px;
    }

    .ss-options { flex-direction: row; flex-wrap: wrap; }
    .ss-option { flex: 1; min-width: 130px; }
  }

  @media (max-width: 480px) {
    .ss-options { flex-direction: column; }
    .ss-option { flex: none; }
  }
`;

function ServiceSidebar() {
  const navigate = useNavigate();

  const services = [
    { icon: '🏨', label: 'List Hotel',  sub: 'Rooms, villas & more' },
    { icon: '🚗', label: 'List Car',    sub: 'Self-drive or with driver' },
    { icon: '🏍️', label: 'List Bike',   sub: 'Scooters & motorcycles' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="ss-box">
        <div className="ss-badge">
          <span>⚡</span> Partner Program
        </div>

        <h2 className="ss-title">List Your Property & Earn</h2>
        <p className="ss-subtitle">
          Join 500+ partners and start earning by listing your hotel, car, or bike today.
        </p>

        <div className="ss-options">
          {services.map((s, i) => (
            <div className="ss-option" key={i}>
              <div className="ss-option-icon">{s.icon}</div>
              <div className="ss-option-text">
                <strong>{s.label}</strong>
                <span>{s.sub}</span>
              </div>
              <span className="ss-option-arrow">›</span>
            </div>
          ))}
        </div>

        <button className="ss-start-btn" onClick={() => navigate('/listing')}>
          <span>🚀</span> Start Listing Free
        </button>

        <hr className="ss-divider" />

        <div className="ss-stats">
          <div className="ss-stat">
            <strong>500+</strong>
            <span>Active Partners</span>
          </div>
          <div className="ss-stat">
            <strong>₹50k+</strong>
            <span>Avg. Monthly</span>
          </div>
          <div className="ss-stat">
            <strong>4.8★</strong>
            <span>Partner Rating</span>
          </div>
          <div className="ss-stat">
            <strong>Free</strong>
            <span>To List</span>
          </div>
        </div>

        <div className="ss-trust">
          <div className="ss-trust-dot" />
          <span>Verified & trusted by 10,000+ guests</span>
        </div>
      </div>
    </>
  );
}

export default ServiceSidebar;