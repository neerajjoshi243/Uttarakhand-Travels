import "../../CSS/mainlistingpage/listing.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hotel, Car, Bike, ArrowRight, ShieldCheck, MapPin, Star, Smartphone, Leaf, DollarSign } from "lucide-react";

/* ─── DATA ─── */
const SERVICES = [
  {
    num: "01",
    icon: "🏨",
    title: "Hotel & Home Listing",
    desc: "List your hotel, resort, or homestay and connect with premium travellers looking for authentic Himalayan stays. Full booking management included.",
    path: "/BasicInfo",
  },
  {
    num: "02",
    icon: "🚗",
    title: "Car Rental Listing",
    desc: "Rent out your car to travellers exploring Uttarakhand's highways and mountain routes. Flexible schedules and secure payments.",
    path: '/carrent',
  },
  {
    num: "03",
    icon: "🏍️",
    title: "Bike Rental Listing",
    desc: "Offer bikes for adventure seekers and local explorers across the Himalayan foothills. Reach thousands of trekkers and riders.",
    path: '/bikerent',
  },
];

const STATS = [
  { value: "5,000+", label: "Active Listings" },
  { value: "50K+",   label: "Monthly Bookings" },
  { value: "4.8 ★",  label: "Average Rating" },
  { value: "98%",    label: "Host Satisfaction" },
];

const HIW_STEPS = [
  { n: "1", title: "Create Your Profile",  desc: "Sign up, verify your identity, and set up your host profile in under five minutes." },
  { n: "2", title: "Add Your Listing",     desc: "Describe your property or vehicle, upload photos, and set your pricing and availability." },
  { n: "3", title: "Accept Bookings",      desc: "Review requests, confirm bookings, and communicate with travellers — all in one place." },
  { n: "4", title: "Get Paid Securely",    desc: "Payments are released automatically after each stay or rental. Fast, reliable, secure." },
];

const FEATURES = [
  { icon: <ShieldCheck size={26} />, title: "Trusted Platform",     desc: "Verified hosts, secure payments, and 24/7 support for complete peace of mind." },
  { icon: <MapPin size={26} />,      title: "Tourism Focused",      desc: "Connect directly with travellers exploring Uttarakhand's most iconic destinations." },
  { icon: <Star size={26} />,        title: "Top Rated Experience", desc: "Our review system helps you build a strong reputation and attract more bookings." },
  { icon: <DollarSign size={26} />,  title: "Flexible Earnings",    desc: "Set your own prices, manage availability, and earn entirely on your own terms." },
  { icon: <Smartphone size={26} />,  title: "Easy to Manage",       desc: "Mobile-friendly dashboard makes managing bookings effortless from anywhere." },
  { icon: <Leaf size={26} />,        title: "Eco Responsible",      desc: "We promote sustainable tourism practices that protect Uttarakhand's natural beauty." },
];

const TESTIMONIALS = [
  {
    initials: "RS",
    name: "Rajesh Sharma",
    role: "Homestay Host, Nainital",
    text: "I started listing my homestay in Nainital just three months ago and the bookings have been incredible. The platform is simple and the guests are wonderful.",
  },
  {
    initials: "PK",
    name: "Priya Kothari",
    role: "Car Rental Host, Rishikesh",
    text: "My car sits idle during off-season, but now it earns throughout the year. The payment process is smooth and the support team is very responsive.",
  },
  {
    initials: "AM",
    name: "Arjun Mehta",
    role: "Bike Rental Host, Mussoorie",
    text: "Bike rental during trekking season has become my main income. This platform connects me with exactly the kind of travellers I want to serve.",
  },
];

const MARQUEE_PLACES = ["Nainital", "Mussoorie", "Rishikesh", "Jim Corbett", "Auli", "Kedarnath", "Badrinath", "Haridwar", "Lansdowne", "Chopta"];

/* ─── SCROLL REVEAL HOOK ─── */
function useReveal() {
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const ref = (i) => (el) => { refs.current[i] = el; };
  return ref;
}

/* ─── MOUNTAIN SVG ─── */
function MountainSVG() {
  return (
    <svg viewBox="0 0 500 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ABFA0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1A4731" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="500" height="300" fill="url(#sky-g)" />
      <polygon points="0,220 60,120 130,180 200,90 270,160 340,70 410,150 500,100 500,300 0,300" fill="rgba(255,255,255,0.06)" />
      <polygon points="0,260 80,160 160,210 250,110 330,175 420,120 500,160 500,300 0,300" fill="rgba(255,255,255,0.10)" />
      <polygon points="200,90 220,110 240,105 250,110 255,100 270,160 200,90" fill="rgba(255,255,255,0.5)" />
      <polygon points="340,70 355,90 370,85 380,95 390,88 410,150 340,70" fill="rgba(255,255,255,0.5)" />
      <circle cx="60"  cy="40" r="1.5" fill="rgba(255,255,255,0.6)" />
      <circle cx="140" cy="25" r="1.2" fill="rgba(255,255,255,0.5)" />
      <circle cx="300" cy="35" r="1.5" fill="rgba(255,255,255,0.6)" />
      <circle cx="440" cy="20" r="1"   fill="rgba(255,255,255,0.5)" />
      <circle cx="380" cy="50" r="1.2" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function ListYourService() {
  const navigate = useNavigate();
  const reveal = useReveal();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Duplicate places for infinite marquee
  const marqueeItems = [...MARQUEE_PLACES, ...MARQUEE_PLACES];

  return (
    <div className="listing-page">

      {/* ─── NAV ─── */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo" onClick={() => scrollTo("hero")}>
          <div className="nav-leaf" />
          Uttarakhand Travels
        </div>

        <ul className="nav-links">
          <li><a onClick={() => scrollTo("services")}>Services</a></li>
          <li><a onClick={() => scrollTo("how-it-works")}>How It Works</a></li>
          <li><a onClick={() => scrollTo("testimonials")}>Reviews</a></li>
          <li><a onClick={() => scrollTo("contact")} className="nav-cta">Get Started</a></li>
        </ul>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <a onClick={() => scrollTo("services")}>Services</a>
        <a onClick={() => scrollTo("how-it-works")}>How It Works</a>
        <a onClick={() => scrollTo("testimonials")}>Reviews</a>
        <a onClick={() => scrollTo("contact")}>Get Started →</a>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero" id="hero">
        <div className="hero-bg" />
        <div className="hero-pattern" />

        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Explore · Earn · Grow
          </div>

          <h1>
            List Your<br />
            Service in the<br />
            <em>Himalayas</em>
          </h1>

          <p className="hero-desc">
            Start earning by sharing your hotel, homestay, car, or bike
            with travellers discovering the timeless beauty of Uttarakhand.
          </p>

          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo("services")}>
              Become a Host
              <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => scrollTo("how-it-works")}>
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card-grid">
            <div className="h-card">
              <div className="h-card-icon ic-hotel">🏨</div>
              <h4>Hotels &amp; Homestays</h4>
              <p>List your property and welcome guests from around the world.</p>
            </div>
            <div className="h-card">
              <div className="h-card-icon ic-car">🚗</div>
              <h4>Car Rentals</h4>
              <p>Earn by renting your vehicle to mountain explorers.</p>
            </div>
            <div className="h-card wide">
              <div className="h-card-icon ic-bike">🏍️</div>
              <div>
                <h4>Bike Rentals</h4>
                <p>Let adventure seekers ride through Himalayan trails on your bikes.</p>
              </div>
            </div>
          </div>

          <div className="hero-stats-row">
            <div className="h-stat">
              <strong>5K+</strong>
              <span>Active Listings</span>
            </div>
            <div className="h-stat">
              <strong>50K+</strong>
              <span>Monthly Bookings</span>
            </div>
            <div className="h-stat">
              <strong>4.8★</strong>
              <span>Avg. Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {marqueeItems.map((place, i) => (
            <span className="marquee-item" key={i}>{place}</span>
          ))}
        </div>
      </div>

      {/* ─── SERVICES ─── */}
      <section className="services-section section" id="services">
        <div className="container">
          <div className="services-head">
            <div className="section-label reveal" ref={reveal(0)}>Choose Your Listing Type</div>
            <h2 className="section-title reveal delay-1" ref={reveal(1)}>What do you want to offer?</h2>
            <p className="section-sub reveal delay-2" ref={reveal(2)}>
              Select the service you want to host and start receiving bookings
              from genuine travellers exploring Uttarakhand.
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map((svc, i) => (
              <div className={`s-card reveal delay-${i}`} key={svc.num} ref={reveal(10 + i)}>
                <div className="s-card-num">{svc.num}</div>
                <div className="s-icon">{svc.icon}</div>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
                <button
                  className="s-btn"
                  onClick={() => svc.path ? navigate(svc.path) : alert(`${svc.title} — coming soon!`)}
                >
                  Start Listing
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-inner">
            {STATS.map((s, i) => (
              <div className={`stat-item reveal delay-${i}`} key={s.label} ref={reveal(20 + i)}>
                <strong>{s.value}</strong>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="hiw-section section" id="how-it-works">
        <div className="container">
          <div className="hiw-grid">
            <div className="hiw-left">
              <div className="section-label reveal" ref={reveal(30)}>Simple Process</div>
              <h2 className="section-title reveal delay-1" ref={reveal(31)}>How It Works</h2>
              <p className="section-sub reveal delay-2" ref={reveal(32)}>
                Start listing your service in minutes. We handle the rest.
              </p>

              <div className="hiw-steps">
                {HIW_STEPS.map((step, i) => (
                  <div className={`hiw-step reveal delay-${i}`} key={step.n} ref={reveal(40 + i)}>
                    <div className="step-num">{step.n}</div>
                    <div className="step-text">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hiw-visual reveal delay-1" ref={reveal(50)}>
              <div className="hiw-mountain-wrap">
                <MountainSVG />
              </div>
              <div className="hiw-caption">
                <h4>🏔 Uttarakhand Awaits</h4>
                <p>Join thousands of hosts earning from one of India's most beloved travel destinations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="features-section section">
        <div className="container">
          <div className="features-head">
            <div className="section-label reveal" ref={reveal(60)}>Why Choose Us</div>
            <h2 className="section-title reveal delay-1" ref={reveal(61)}>Built for Hosts, Made for Travellers</h2>
            <p className="section-sub reveal delay-2" ref={reveal(62)}>
              Everything you need to run a successful listing with confidence.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feat, i) => (
              <div className={`feat-box reveal delay-${i % 3}`} key={feat.title} ref={reveal(70 + i)}>
                <div className="feat-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="testimonials-section section" id="testimonials">
        <div className="container">
          <div className="testimonials-head">
            <div className="section-label reveal" ref={reveal(80)}>What Hosts Say</div>
            <h2 className="section-title reveal delay-1" ref={reveal(81)}>Loved by Hosts Across Uttarakhand</h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className={`t-card reveal delay-${i}`} key={t.name} ref={reveal(90 + i)}>
                <div className="t-stars">★★★★★</div>
                <p className="t-text">"{t.text}"</p>
                <div className="t-author">
                  <div className="t-avatar">{t.initials}</div>
                  <div className="t-author-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section" id="contact">
        <div className="container cta-inner">
          <h2 className="reveal" ref={reveal(100)}>Ready to Start Earning?</h2>
          <p className="reveal delay-1" ref={reveal(101)}>
            Join over 5,000 active hosts across Uttarakhand and turn your property
            or vehicle into a steady income stream.
          </p>
          <div className="cta-btns reveal delay-2" ref={reveal(102)}>
            <button className="cta-btn-white" onClick={() => scrollTo("services")}>
              Start Listing Today
            </button>
            <button className="cta-btn-outline" onClick={() => scrollTo("how-it-works")}>
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="footer-brand-name">Uttarakhand Travels</span>
              <p>Your gateway to authentic Himalayan experiences — connecting hosts and travellers since 2022.</p>
              <div className="footer-socials">
                {["📷", "f", "✕", "▶"].map((icon, i) => (
                  <div className="social-btn" key={i}>{icon}</div>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>Destinations</h4>
              <ul>
                {["Nainital", "Mussoorie", "Jim Corbett", "Rishikesh", "Auli", "Haridwar"].map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                {["About Us", "Become a Host", "Blog", "Safety", "Contact", "Careers"].map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                {["Help Center", "Cancellation Policy", "Privacy Policy", "Terms of Service", "Host Guidelines"].map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Uttarakhand Travels. Made with care for nature lovers. 🌿</span>
            <div className="footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}