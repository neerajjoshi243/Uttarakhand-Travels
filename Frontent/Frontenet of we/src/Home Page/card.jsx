// Card.jsx — Destination Card Component
// Usage: <Card title="Nainital" distance="300 km from Delhi" desc="..." image={img} badge="Popular" />
import '../../src/CSS/homecss/homepage.css'

function Card({ title, distance, desc, image, badge }) {
  return (
    <div className="card reveal">
      <div className="imgs">
        {image ? (
          <img src={image} alt={title || "Destination"} />
        ) : (
          <div className="img-placeholder">🏔️</div>
        )}
        {badge && <span className="card-badge">{badge}</span>}
      </div>

      <div className="details">
        <h3>{title || "Destination"}</h3>
        {distance && <h6>{distance}</h6>}
        <p>{desc || "A beautiful destination waiting to be explored."}</p>
        <button className="card-explore-btn">
          Explore
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Card;