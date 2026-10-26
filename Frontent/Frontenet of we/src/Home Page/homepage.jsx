import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/homecss/homepage.css";

import logo   from "../assets/Gemini_Generated_Image_cxbpy5cxbpy5cxbp.png";
import heroBg from "../assets/herobackimag.png";

const DESTINATIONS = [
  {
    badge: "Popular",
    emoji: "🌸",
    color: "linear-gradient(135deg,#C8E6B0,#7BAE5A,#2D5016)",
    title: "Valley of Flowers",
    location: "Chamoli, Uttarakhand",
    desc: "A UNESCO World Heritage Site bursting with rare alpine flora and breathtaking Himalayan vistas.",
  },
  {
    badge: "Trending",
    emoji: "🏔️",
    color: "linear-gradient(135deg,#b0cfe6,#6a9bb5,#2d4a5c)",
    title: "Kedarnath",
    location: "Rudraprayag, Uttarakhand",
    desc: "Sacred Shiva shrine at 3,583 m — reached through a dramatic, soul-stirring mountain pilgrimage.",
  },
  {
    badge: "Hidden Gem",
    emoji: "🌊",
    color: "linear-gradient(135deg,#fde68a,#f59e0b,#92400e)",
    title: "Rishikesh",
    location: "Dehradun, Uttarakhand",
    desc: "The yoga capital of the world — white-water rafting, ashrams, and Ganga aarti at dusk.",
  },
];

const EXPERIENCES = [
  { emoji: "🧗", color: "#EBF3EC", title: "Trekking",      desc: "Guided trails from easy meadow walks to challenging high-altitude Himalayan expeditions." },
  { emoji: "🛶", color: "#E6F1FB", title: "River Rafting", desc: "Ride the roaring rapids of the Ganges through stunning gorges and lush river valleys." },
  { emoji: "🧘", color: "#FAF0E6", title: "Yoga Retreats", desc: "Find inner peace with expert-led yoga and meditation programs set in serene nature." },
  { emoji: "🏕️", color: "#F0EBF3", title: "Camping",       desc: "Fall asleep under a canopy of stars in pristine, untouched Himalayan wilderness." },
];

const STATS = [
  { value: "120+", label: "Destinations" },
  { value: "2.4k", label: "Happy Travellers" },
  { value: "85+",  label: "Verified Hosts" },
  { value: "4.8★", label: "Avg Rating" },
];

const FEATURES = [
  { icon: "✅", title: "Verified Hosts",   desc: "Every host is personally vetted for safety, cleanliness, and warmth." },
  { icon: "🏡", title: "Authentic Stays",  desc: "Live like a local — traditional architecture, home-cooked Kumaoni meals." },
  { icon: "🌿", title: "Eco-Friendly",     desc: "All properties follow sustainable practices that protect the Himalayas." },
];

const NAV_LINKS = ["Explore", "Stays", "Experience", "About", "Contact"];

function DestCard({ badge, emoji, color, title, location, desc }) {
  return (
    <article className="dest-card reveal">
      <div className="dest-card-img" style={{ background: color }}>
        <span>{emoji}</span>
        <span className="dest-badge">{badge}</span>
      </div>
      <div className="dest-card-body">
        <h3>{title}</h3>
        <p className="dest-card-loc">📍 {location}</p>
        <p>{desc}</p>
        <button className="link-btn">Explore →</button>
      </div>
    </article>
  );
}

function ExCard({ emoji, color, title, desc, delay }) {
  return (
    <article className={`ex-card reveal delay-${delay}`}>
      <div className="ex-card-img" style={{ background: color }}>
        {emoji}
      </div>
      <div className="ex-card-body">
        <h3>{title}</h3>
        <p>{desc}</p>
        <button className="ex-card-btn">Book Now</button>
      </div>
    </article>
  );
}

function Footer() {
  const cols = [
    { heading: "Explore",  links: ["Destinations", "Homestays", "Experiences", "Travel Guides", "Photo Gallery"] },
    { heading: "Company",  links: ["About Us", "Our Mission", "Press", "Careers", "Partner With Us"] },
    { heading: "Support",  links: ["Help Centre", "Safety", "Cancellations", "Contact Us", "Accessibility"] },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-brand-name">Uttarakhand Travels</span>
            <p>Your gateway to authentic Himalayan experiences — curated stays, guided adventures, and unforgettable culture.</p>
            <div className="socials">
              {["🐦", "📸", "▶️", "💼"].map((icon) => (
                <button className="social-btn" key={icon} aria-label={icon}>{icon}</button>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div className="footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>{col.links.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2025 Uttarakhand Travels. All rights reserved.</p>
          <nav className="footer-legal" aria-label="Legal">
            {["Privacy", "Terms", "Cookies", "Sitemap"].map((l) => (
              <a href="#" key={l}>{l}</a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function Homepage() {
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  // ✅ Token check — login hai ya nahi
  const token   = localStorage.getItem("token");
  const name    = localStorage.getItem("name");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleMyBookings = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/my-dashboard");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    const img  = new Image();
    img.src    = heroBg;
    img.onload = () => setBgLoaded(true);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {/* ── NAVIGATION ── */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`} role="navigation" aria-label="Main">
        <a className="nav-brand" href="#top" aria-label="Uttarakhand Travels home">
          <img className="nav-brand-logo" src={logo} alt="" />
          <span className="nav-brand-name">Uttarakhand Travels</span>
        </a>

        <div className="nav-links">
          {NAV_LINKS.map((label) => (
            <a href={`#${label.toLowerCase()}`} key={label}>{label}</a>
          ))}
        </div>

        {/* ✅ Token ke basis pe navbar buttons */}
        <div className="nav-auth">
          {isLoggedIn ? (
            <>
              {/* User naam dikhao */}
              <span style={{
                fontSize: 13, color: "#666",
                fontWeight: 500, marginRight: 4,
              }}>
                👋 {name}
              </span>

              {/* My Bookings button */}
              <button
                className="btn-ghost"
                onClick={handleMyBookings}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                📋 My Bookings
              </button>

              {/* Logout */}
              <button
                className="btn-solid"
                onClick={handleLogout}
                style={{ background: "#c62828" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-solid" onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>

        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-nav${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map((label) => (
          <a href={`#${label.toLowerCase()}`} key={label} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <div className="mobile-nav-auth">
          {isLoggedIn ? (
            <>
              <button className="btn-ghost" onClick={() => { handleMyBookings(); setMenuOpen(false); }}>
                📋 My Bookings
              </button>
              <button className="btn-solid" style={{ background: "#c62828" }} onClick={() => { handleLogout(); setMenuOpen(false); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-solid" onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero" id="top" aria-label="Hero">
        <div
          className={`hero-bg${bgLoaded ? " loaded" : ""}`}
          style={{ backgroundImage: `url(${heroBg})` }}
          role="img"
          aria-label="Himalayan mountain landscape"
        />
        <div className="hero-overlay" />

        <div className="trust-bar" role="list">
          {[
            { dot: true,  text: "Verified Hosts" },
            { dot: true,  text: "Safe & Secure Travel" },
            { dot: false, text: "⭐ 4.8 / 5 Rating" },
          ].map(({ dot, text }) => (
            <div className="trust-pill" role="listitem" key={text}>
              {dot && <span className="trust-dot" aria-hidden="true" />}
              {text}
            </div>
          ))}
        </div>

        <h1 className="hero-heading">
          Explore Uttarakhand
          <span className="hero-heading-accent">Naturally</span>
        </h1>

        <p className="hero-tagline">
          Discover the serene beauty of the Himalayas, connect with authentic
          local culture, and find peace in nature's embrace.
        </p>

        <div className="hero-cta">
          <button className="hero-btn-primary" onClick={() => navigate("/signupdesbord")}>
            🗺️ Start Exploring
          </button>
          <button className="hero-btn-outline" onClick={() => navigate("/signup")}>
            Plan My Trip
          </button>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <div className="scroll-line" />
          scroll
        </div>
      </section>

      {/* ── FEATURED DESTINATIONS ── */}
      <section className="s-destinations" id="explore">
        <div className="container">
          <header className="section-header reveal">
            <span className="eyebrow">Handpicked for You</span>
            <h2 className="section-title">Featured Destinations</h2>
            <p className="section-sub">Discover the hidden gems of Uttarakhand</p>
          </header>
          <div className="destinations-grid">
            {DESTINATIONS.map((d) => <DestCard key={d.title} {...d} />)}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="s-stats" aria-label="Key numbers">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(({ value, label }) => (
              <div className="stat-item reveal" key={label}>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOMESTAYS ── */}
      <section className="s-homestays" id="stays">
        <div className="container">
          <div className="homestays-grid">
            <div className="reveal">
              <span className="eyebrow">Live Like a Local</span>
              <h2 className="section-title">Featured Homestays</h2>
              <p className="section-sub">
                Stay with verified local hosts and experience true Himalayan
                hospitality — hearty meals, warm fires, star-filled skies.
              </p>
              <div className="homestays-features">
                {FEATURES.map((f) => (
                  <div className="feature-row" key={f.title}>
                    <div className="feature-icon">{f.icon}</div>
                    <div className="feature-text">
                      <h5>{f.title}</h5>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="coming-panel reveal delay-2">
              <div className="coming-panel-emoji">🏡</div>
              <h4>Homestays Coming Soon</h4>
              <p>We're hand-vetting cosy Himalayan homes for you. Be first to know when they go live!</p>
              <span className="coming-badge">Launching 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCES ── */}
      <section className="s-experiences" id="experience">
        <div className="container">
          <header className="section-header reveal">
            <span className="eyebrow">Activities & Adventures</span>
            <h2 className="section-title">Experiences for Every Traveller</h2>
            <p className="section-sub">Choose your adventure in the heart of the Himalayas</p>
          </header>
          <div className="experiences-grid">
            {EXPERIENCES.map((e, i) => (
              <ExCard key={e.title} {...e} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="s-cta" aria-label="Call to action">
        <div className="container">
          <h2>Ready for Your Himalayan Adventure?</h2>
          <p>
            Join thousands of travellers who found their perfect escape<br />
            in the hills of Uttarakhand.
          </p>
          <div className="cta-row">
            <button className="cta-btn-primary" onClick={() => navigate("/signup")}>
              Get Started — It's Free
            </button>
            <button className="cta-btn-outline" onClick={() => navigate("/signupdesbord")}>
              Browse Destinations
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </>
  );
}