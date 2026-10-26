// ExCard.jsx — Experience Cards Component
// Renders a grid of 4 experience cards with icons, title, description & button
import '../../src/CSS/homecss/homepage.css'

const EXPERIENCES = [
  {
    emoji: "🐯",
    gradient: "linear-gradient(135deg, #C8E6B0 0%, #7BAE5A 100%)",
    title: "Wildlife Safari",
    desc: "Spot tigers, elephants & rare Himalayan birds in their natural habitat.",
  },
  {
    emoji: "🥾",
    gradient: "linear-gradient(135deg, #B8D4E8 0%, #4A7B8C 100%)",
    title: "Trekking",
    desc: "Conquer iconic Himalayan trails — from gentle walks to high-altitude peaks.",
  },
  {
    emoji: "🏮",
    gradient: "linear-gradient(135deg, #F5DEB3 0%, #B8882A 100%)",
    title: "Cultural Tours",
    desc: "Immerse in ancient village traditions, temples & local folklore.",
  },
  {
    emoji: "🍲",
    gradient: "linear-gradient(135deg, #FFD9A0 0%, #C87941 100%)",
    title: "Local Food",
    desc: "Savour authentic Pahadi cuisine — hearty, wholesome & unforgettable.",
  },
];

function ExCard() {
  return (
    <div className="card-container">
      {EXPERIENCES.map((item, i) => (
        <div className={`ex-card reveal d${i + 1}`} key={item.title}>
          <div className="ex-img-wrap">
            <div
              className="ex-img-placeholder"
              style={{ background: item.gradient }}
            >
              {item.emoji}
            </div>
          </div>
          <div className="ex-body">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <button>Learn More</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExCard;