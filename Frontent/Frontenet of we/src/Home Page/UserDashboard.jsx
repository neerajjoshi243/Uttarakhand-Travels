import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ── Constants ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { bg: "#FEF9E7", color: "#B7770D", border: "#F9E4A0", icon: "⏳", label: "Pending"   },
  confirmed: { bg: "#EAF3DE", color: "#3B6D11", border: "#C0DD97", icon: "✅", label: "Confirmed" },
  cancelled: { bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", icon: "❌", label: "Cancelled" },
};

const TYPE_CONFIG = {
  hotel: { icon: "🏨", label: "Hotel", bg: "#E6F1FB", color: "#185FA5" },
  car:   { icon: "🚗", label: "Car",   bg: "#EAF3DE", color: "#3B6D11" },
  bike:  { icon: "🏍️", label: "Bike",  bg: "#FEF9E7", color: "#B7770D" },
};

export default function UserDashboard() {
  const navigate = useNavigate();

  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("all");
  const [cancelling, setCancelling] = useState(null);

  const token = localStorage.getItem("token");
  const name  = localStorage.getItem("name") || "User";

  // ✅ Token check
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBookings();
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("http://localhost:3000/my-bookings", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data);
      else setError(data.message || "Bookings fetch nahi hui.");
    } catch {
      setError("Server se connect nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleCancel = useCallback(async (booking_id) => {
    if (!window.confirm("Booking cancel karna chahte hain?")) return;
    setCancelling(booking_id);
    try {
      const res  = await fetch(`http://localhost:3000/cancel-booking/${booking_id}`, {
        method:  "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(prev =>
          prev.map(b => b.booking_id === booking_id ? { ...b, status: "cancelled" } : b)
        );
      } else {
        alert(data.message);
      }
    } catch {
      alert("Cancel nahi ho paya. Please try again.");
    } finally {
      setCancelling(null);
    }
  }, [token]);

  // ✅ Memoized stats — sirf tab recalculate ho jab bookings change ho
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  // ✅ Memoized filtered list
  const filtered = useMemo(() =>
    filter === "all" ? bookings : bookings.filter(b => b.status === filter),
    [bookings, filter]
  );

  const s = styles;

  return (
    <div style={s.page}>

      {/* ── TOP BAR ── */}
      <header style={s.topbar}>
        <div style={s.topLeft}>
          <button style={s.backBtn} onClick={() => navigate("/signupdesbord")}>
            <span style={{ fontSize: 16 }}>←</span> Back
          </button>
          <span style={s.brandText}>My Bookings</span>
        </div>
        <div style={s.userPill}>
          <div style={s.avatar}>{name[0]?.toUpperCase()}</div>
          <span style={s.userName}>{name}</span>
        </div>
      </header>

      <main style={s.body}>

        {/* ── STATS GRID ── */}
        <div style={s.statsGrid}>
          {[
            { label: "Total",     value: stats.total,     ...STAT_THEME.total     },
            { label: "Pending",   value: stats.pending,   ...STAT_THEME.pending   },
            { label: "Confirmed", value: stats.confirmed, ...STAT_THEME.confirmed },
            { label: "Cancelled", value: stats.cancelled, ...STAT_THEME.cancelled },
          ].map(k => (
            <div
              key={k.label}
              onClick={() => setFilter(k.label.toLowerCase() === "total" ? "all" : k.label.toLowerCase())}
              style={{
                ...s.statCard,
                background:  k.bg,
                borderColor: k.border,
                cursor: "pointer",
                outline: filter === (k.label.toLowerCase() === "total" ? "all" : k.label.toLowerCase())
                  ? `2px solid ${k.color}` : "none",
              }}
            >
              <div style={{ ...s.statValue, color: k.color }}>{k.value}</div>
              <div style={{ ...s.statLabel, color: k.labelColor }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── FILTER PILLS ── */}
        <div style={s.filterRow}>
          {[
            { key: "all",       label: "All",       count: stats.total     },
            { key: "pending",   label: "Pending",   count: stats.pending   },
            { key: "confirmed", label: "Confirmed", count: stats.confirmed },
            { key: "cancelled", label: "Cancelled", count: stats.cancelled },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{ ...s.pill, ...(filter === f.key ? s.pillActive : {}) }}
            >
              {f.label}
              <span style={{
                ...s.pillBadge,
                background: filter === f.key ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                color:      filter === f.key ? "#fff" : "#888",
              }}>
                {f.count}
              </span>
            </button>
          ))}

          {/* Refresh button */}
          <button
            onClick={fetchBookings}
            disabled={loading}
            style={{ ...s.pill, marginLeft: "auto", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "..." : "↻ Refresh"}
          </button>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div style={s.centerBox}>
            <div style={s.spinner} />
            <p style={{ color: "#888", marginTop: 14, fontSize: 14 }}>Loading your bookings...</p>
          </div>
        ) : error ? (
          <div style={s.centerBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: "#A32D2D", fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button style={s.retryBtn} onClick={fetchBookings}>Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} onExplore={() => navigate("/signupdesbord")} />
        ) : (
          <div style={s.grid}>
            {filtered.map(b => (
              <BookingCard
                key={b.booking_id}
                booking={b}
                onCancel={handleCancel}
                cancelling={cancelling === b.booking_id}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────
function EmptyState({ filter, onExplore }) {
  const msgs = {
    all:       { icon: "🎒", title: "Koi booking nahi",      sub: "Hotels, cars aur bikes explore karo aur apni pehli booking karo!" },
    pending:   { icon: "⏳", title: "Koi pending booking nahi", sub: "Pending bookings yahan dikhegi jab owner confirm kare."         },
    confirmed: { icon: "✅", title: "Koi confirmed booking nahi", sub: "Jab owner accept kare tab yahan dikhega."                    },
    cancelled: { icon: "❌", title: "Koi cancelled booking nahi", sub: "Aapne abhi tak koi booking cancel nahi ki."                  },
  };
  const m = msgs[filter] || msgs.all;

  return (
    <div style={emptyStyles.wrap}>
      <div style={emptyStyles.icon}>{m.icon}</div>
      <h3 style={emptyStyles.title}>{m.title}</h3>
      <p style={emptyStyles.sub}>{m.sub}</p>
      {filter === "all" && (
        <button style={emptyStyles.btn} onClick={onExplore}>
          Explore &amp; Book →
        </button>
      )}
    </div>
  );
}

// ── Booking Card ─────────────────────────────────────────────────
function BookingCard({ booking: b, onCancel, cancelling }) {
  const type   = TYPE_CONFIG[b.serviceType]   || TYPE_CONFIG.hotel;
  const status = STATUS_CONFIG[b.status]      || STATUS_CONFIG.pending;

  return (
    <article style={cardStyles.card}>

      {/* Card Header */}
      <div style={cardStyles.header}>
        <div style={cardStyles.headerLeft}>
          <div style={{ ...cardStyles.typeChip, background: type.bg }}>
            <span style={{ fontSize: 18 }}>{type.icon}</span>
            <span style={{ ...cardStyles.typeLabel, color: type.color }}>{type.label}</span>
          </div>
        </div>
        <div style={{
          ...cardStyles.statusBadge,
          background:   status.bg,
          color:        status.color,
          borderColor:  status.border,
        }}>
          {status.icon} {status.label}
        </div>
      </div>

      {/* Service name + ID */}
      <div style={cardStyles.serviceRow}>
        <div style={cardStyles.serviceName}>{b.serviceName || "—"}</div>
        <div style={cardStyles.bookingId}>#{b.booking_id}</div>
      </div>

      {/* Details */}
      <div style={cardStyles.details}>
        <DetailRow label="Check-in"  value={b.checkInDate}  />
        <DetailRow label="Check-out" value={b.checkOutDate} />
        <DetailRow label="Guests"    value={`${b.guests} person${b.guests > 1 ? "s" : ""}`} />
        {b.ownerContact && <DetailRow label="Owner" value={b.ownerContact} />}
      </div>

      {/* Footer */}
      <div style={cardStyles.footer}>
        <div>
          <div style={cardStyles.amountLabel}>Total</div>
          <div style={cardStyles.amount}>₹{b.totalAmount?.toLocaleString()}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {b.status === "pending" && (
            <button
              style={cardStyles.cancelBtn}
              onClick={() => onCancel(b.booking_id)}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
          {b.status === "confirmed" && (
            <span style={cardStyles.confirmedTag}>Owner accepted ✓</span>
          )}
          {b.status === "cancelled" && (
            <span style={cardStyles.cancelledTag}>Cancelled</span>
          )}
        </div>
      </div>

    </article>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
      <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Theme helpers ─────────────────────────────────────────────────
const STAT_THEME = {
  total:     { bg: "#F5F5F5", border: "#E0E0E0", color: "#555",    labelColor: "#888"    },
  pending:   { bg: "#FEF9E7", border: "#F9E4A0", color: "#B7770D", labelColor: "#9A6508" },
  confirmed: { bg: "#EAF3DE", border: "#C0DD97", color: "#3B6D11", labelColor: "#27500A" },
  cancelled: { bg: "#FCEBEB", border: "#F7C1C1", color: "#A32D2D", labelColor: "#791F1F" },
};

// ── Styles ────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#F4F6F8",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #EBEBEB",
    padding: "0 20px",
    height: 54,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid #E8E8E8",
    background: "#FAFAFA",
    color: "#555",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  brandText: {
    fontSize: 15,
    fontWeight: 500,
    color: "#1A1A2E",
    letterSpacing: "-0.2px",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#FFF4ED",
    borderRadius: 999,
    padding: "4px 12px 4px 4px",
    border: "1px solid #FDDCB8",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#D85A30",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 500,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: "#993C1D",
  },
  body: {
    maxWidth: 880,
    margin: "0 auto",
    padding: "20px 16px 40px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 12,
    padding: "14px 16px",
    textAlign: "center",
    border: "1px solid transparent",
    transition: "transform 0.1s, outline 0.1s",
  },
  statValue: {
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 1.1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
  },
  filterRow: {
    display: "flex",
    gap: 8,
    marginBottom: 18,
    flexWrap: "wrap",
    alignItems: "center",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 999,
    border: "1px solid #E8E8E8",
    background: "#fff",
    color: "#555",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  pillActive: {
    background: "#D85A30",
    color: "#fff",
    border: "1px solid #D85A30",
  },
  pillBadge: {
    borderRadius: 999,
    padding: "1px 7px",
    fontSize: 11,
    fontWeight: 500,
  },
  centerBox: {
    textAlign: "center",
    padding: "64px 20px",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #F0F0F0",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "2.5px solid #F0F0F0",
    borderTop: "2.5px solid #D85A30",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    margin: "0 auto",
  },
  retryBtn: {
    padding: "8px 20px",
    background: "#D85A30",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14,
  },
};

const cardStyles = {
  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #EBEBEB",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.15s",
  },
  header: {
    padding: "12px 14px",
    borderBottom: "1px solid #F5F5F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  typeChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 500,
  },
  statusBadge: {
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  },
  serviceRow: {
    padding: "10px 14px 6px",
    borderBottom: "1px solid #F8F8F8",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: 500,
    color: "#1A1A2E",
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 11,
    color: "#BBB",
    fontFamily: "monospace",
  },
  details: {
    padding: "8px 14px",
    flex: 1,
    borderBottom: "1px solid #F5F5F5",
  },
  footer: {
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#FAFAFA",
  },
  amountLabel: {
    fontSize: 11,
    color: "#AAA",
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 500,
    color: "#D85A30",
  },
  cancelBtn: {
    padding: "5px 12px",
    background: "#FCEBEB",
    color: "#A32D2D",
    border: "1px solid #F7C1C1",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  confirmedTag: {
    fontSize: 12,
    color: "#3B6D11",
    fontWeight: 500,
  },
  cancelledTag: {
    fontSize: 12,
    color: "#A32D2D",
    fontWeight: 500,
  },
};

const emptyStyles = {
  wrap: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #F0F0F0",
  },
  icon: {
    fontSize: 52,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: 500,
    color: "#1A1A2E",
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    lineHeight: 1.6,
    maxWidth: 320,
    margin: "0 auto 20px",
  },
  btn: {
    padding: "10px 24px",
    background: "#D85A30",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};