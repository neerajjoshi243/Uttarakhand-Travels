import { useState, useRef, useCallback } from "react";
import "../../CSS/mainlistingpage/BiikeListing.css";

const BIKE_TYPES = [
  { value: "Scooter",    label: "Scooter",    icon: "🛵" },
  { value: "Sport",      label: "Sport",      icon: "🏍️" },
  { value: "Cruiser",    label: "Cruiser",    icon: "🏕️" },
  { value: "Adventure",  label: "Adventure",  icon: "🧭" },
];

const FUEL_TYPES = [
  { value: "Petrol",   label: "Petrol",   icon: "⛽" },
  { value: "Electric", label: "Electric", icon: "⚡" },
];

const MAX_IMAGES = 6;

export default function ListYourBike() {
  const [form, setForm] = useState({
    bikeName:      "",
    bikeModel:     "",
    bikeType:      "",
    priceDay:      "",
    priceHour:     "",
    pickup:        "",
    fuel:          "",
    contact:       "",
    email:         "",        // ← NEW
    available:     true,
    helmetIncluded: false,
  });

  const [images,    setImages]   = useState([]);
  const [dragging,  setDragging] = useState(false);
  const [errors,    setErrors]   = useState({});
  const [loading,   setLoading]  = useState(false);
  const [submitted, setSubmitted]= useState(false);
  const fileRef = useRef(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggle = (key) =>
    setForm((f) => ({ ...f, [key]: !f[key] }));

  const addFiles = (files) => {
    const allowed = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_IMAGES - images.length);
    const mapped = allowed.map((f) => ({
      url: URL.createObjectURL(f),
      file: f,
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (i) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [images]);

  const validate = () => {
    const e = {};
    if (!form.bikeName.trim())  e.bikeName  = "Bike name is required";
    if (!form.bikeModel.trim()) e.bikeModel = "Bike model is required";
    if (!form.bikeType)         e.bikeType  = "Select bike type";
    if (!form.priceDay)         e.priceDay  = "Price per day is required";
    if (!form.pickup.trim())    e.pickup    = "Pickup location is required";
    if (!form.fuel)             e.fuel      = "Select fuel type";
    if (!form.contact.trim() || !/^\d{10}$/.test(form.contact.trim()))
      e.contact = "Enter a valid 10-digit number";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";   // ← NEW
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("bikeName",       form.bikeName);
      formData.append("bikeModel",      form.bikeModel);
      formData.append("bikeType",       form.bikeType);
      formData.append("pricePerDay",    form.priceDay);
      formData.append("pricePerHour",   form.priceHour || 0);
      formData.append("pickupLocation", form.pickup);
      formData.append("fuelType",       form.fuel);
      formData.append("contactNumber",  form.contact);
      formData.append("email",          form.email);   // ← NEW
      formData.append("isAvailable",    form.available);
      formData.append("helmetIncluded", form.helmetIncluded);

      images.forEach((img) => formData.append("bikeImages", img.file));

      const token = localStorage.getItem("token");
if (!token) { alert("Please login first."); return; }

const res = await fetch("http://localhost:3000/add-bike", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData,
});

      const data = await res.json();

      if (res.ok) setSubmitted(true);
      else alert("Error: " + data.message);

    } catch (err) {
      console.log(err);
      alert("Server Error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({
      bikeName: "", bikeModel: "", bikeType: "", priceDay: "", priceHour: "",
      pickup: "", fuel: "", contact: "", email: "",   // ← NEW
      available: true, helmetIncluded: false,
    });
    setImages([]);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="lyb-success">
        <div className="lyb-success-card">
          <div className="lyb-success-icon">🏍️</div>
          <h2>Listing Submitted!</h2>
          <p>Our team will verify your bike and publish it within 24 hours.</p>
          <button className="lyb-btn-primary" onClick={resetForm}>
            List Another Bike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lyb-page">

      {/* ── HEADER ── */}
      <div className="lyb-hero">
        <div className="lyb-hero-inner">
          <span className="lyb-eyebrow">Earn With Your Bike</span>
          <h1 className="lyb-title">List Your Bike</h1>
          <p className="lyb-subtitle">
            Rent your bike to travellers exploring Uttarakhand and earn every day it sits idle.
          </p>
        </div>
        <div className="lyb-hero-steps">
          {["Fill Details","Upload Photos","Get Verified","Start Earning"].map((s, i) => (
            <div className="lyb-step" key={s}>
              <div className="lyb-step-num">{i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lyb-body">
        <div className="lyb-form-card">

          {/* ── Bike Details ── */}
          <section className="lyb-section">
            <div className="lyb-section-head">
              <span className="lyb-section-icon">🏍️</span>
              <div>
                <h2 className="lyb-section-title">Bike Details</h2>
                <p className="lyb-section-sub">Basic information about your bike</p>
              </div>
            </div>

            <div className="lyb-grid-2">
              <Field label="Bike Name" required error={errors.bikeName}>
                <input
                  className={`lyb-input${errors.bikeName ? " lyb-input--err" : ""}`}
                  placeholder="e.g. Royal Enfield"
                  value={form.bikeName}
                  onChange={set("bikeName")}
                />
              </Field>

              <Field label="Bike Model" required error={errors.bikeModel}>
                <input
                  className={`lyb-input${errors.bikeModel ? " lyb-input--err" : ""}`}
                  placeholder="e.g. Classic 350"
                  value={form.bikeModel}
                  onChange={set("bikeModel")}
                />
              </Field>

              <Field label="Price Per Day (₹)" required error={errors.priceDay}>
                <div className="lyb-prefix-wrap">
                  <span className="lyb-prefix">₹</span>
                  <input
                    className={`lyb-input lyb-input--prefixed${errors.priceDay ? " lyb-input--err" : ""}`}
                    type="number" placeholder="800" min="0"
                    value={form.priceDay}
                    onChange={set("priceDay")}
                  />
                </div>
              </Field>

              <Field label="Price Per Hour (₹)" hint="Optional">
                <div className="lyb-prefix-wrap">
                  <span className="lyb-prefix">₹</span>
                  <input
                    className="lyb-input lyb-input--prefixed"
                    type="number" placeholder="100" min="0"
                    value={form.priceHour}
                    onChange={set("priceHour")}
                  />
                </div>
              </Field>

              <Field label="Pickup Location" required error={errors.pickup} className="lyb-col-full">
                <div className="lyb-prefix-wrap">
                  <span className="lyb-prefix">📍</span>
                  <input
                    className={`lyb-input lyb-input--prefixed${errors.pickup ? " lyb-input--err" : ""}`}
                    placeholder="e.g. Nainital Bus Stand"
                    value={form.pickup}
                    onChange={set("pickup")}
                  />
                </div>
              </Field>
            </div>
          </section>

          <div className="lyb-divider" />

          {/* ── Bike Type ── */}
          <section className="lyb-section">
            <div className="lyb-section-head">
              <span className="lyb-section-icon">🏷️</span>
              <div>
                <h2 className="lyb-section-title">Bike Type <span className="lyb-req">*</span></h2>
                <p className="lyb-section-sub">What category is your bike?</p>
              </div>
            </div>

            <div className="lyb-fuel-grid">
              {BIKE_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value} type="button"
                  className={`lyb-fuel-btn${form.bikeType === value ? " lyb-fuel-btn--active" : ""}${errors.bikeType ? " lyb-fuel-btn--err" : ""}`}
                  onClick={() => { setForm(f => ({...f, bikeType: value})); setErrors(e => ({...e, bikeType: undefined})); }}
                >
                  <span className="lyb-fuel-icon">{icon}</span>
                  <span className="lyb-fuel-label">{label}</span>
                </button>
              ))}
            </div>
            {errors.bikeType && <p className="lyb-err-msg">{errors.bikeType}</p>}
          </section>

          <div className="lyb-divider" />

          {/* ── Fuel Type ── */}
          <section className="lyb-section">
            <div className="lyb-section-head">
              <span className="lyb-section-icon">⛽</span>
              <div>
                <h2 className="lyb-section-title">Fuel Type <span className="lyb-req">*</span></h2>
                <p className="lyb-section-sub">What does your bike run on?</p>
              </div>
            </div>

            <div className="lyb-fuel-grid">
              {FUEL_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value} type="button"
                  className={`lyb-fuel-btn${form.fuel === value ? " lyb-fuel-btn--active" : ""}${errors.fuel ? " lyb-fuel-btn--err" : ""}`}
                  onClick={() => { setForm(f => ({...f, fuel: value})); setErrors(e => ({...e, fuel: undefined})); }}
                >
                  <span className="lyb-fuel-icon">{icon}</span>
                  <span className="lyb-fuel-label">{label}</span>
                </button>
              ))}
            </div>
            {errors.fuel && <p className="lyb-err-msg">{errors.fuel}</p>}
          </section>

          <div className="lyb-divider" />

          {/* ── Contact ── */}
          <section className="lyb-section">
            <div className="lyb-section-head">
              <span className="lyb-section-icon">📞</span>
              <div>
                <h2 className="lyb-section-title">Contact</h2>
                <p className="lyb-section-sub">How travellers can reach you</p>
              </div>
            </div>

            <div className="lyb-grid-2">
              <Field label="Contact Number" required error={errors.contact}>
                <div className="lyb-prefix-wrap">
                  <span className="lyb-prefix">🇮🇳 +91</span>
                  <input
                    className={`lyb-input lyb-input--prefixed${errors.contact ? " lyb-input--err" : ""}`}
                    type="tel" placeholder="98XXXXXXXX" maxLength={10}
                    value={form.contact}
                    onChange={set("contact")}
                  />
                </div>
              </Field>

              {/* ── EMAIL FIELD (NEW) ── */}
              <Field label="Email Address" required error={errors.email}>
                <div className="lyb-prefix-wrap">
                  <span className="lyb-prefix">✉️</span>
                  <input
                    className={`lyb-input lyb-input--prefixed${errors.email ? " lyb-input--err" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                  />
                </div>
              </Field>

            </div>
          </section>

          <div className="lyb-divider" />

          {/* ── Images ── */}
          <section className="lyb-section">
            <div className="lyb-section-head">
              <span className="lyb-section-icon">📸</span>
              <div>
                <h2 className="lyb-section-title">Upload Bike Images</h2>
                <p className="lyb-section-sub">{images.length}/{MAX_IMAGES} — PNG, JPG up to 5 MB each</p>
              </div>
            </div>

            {images.length < MAX_IMAGES && (
              <div
                className={`lyb-dropzone${dragging ? " lyb-dropzone--active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef} type="file"
                  accept="image/png,image/jpeg" multiple
                  style={{ display: "none" }}
                  onChange={(e) => addFiles(e.target.files)}
                />
                <div className="lyb-dropzone-icon">📷</div>
                <p className="lyb-dropzone-text">
                  Drop images here or <span className="lyb-link">click to upload</span>
                </p>
                <p className="lyb-dropzone-hint">PNG, JPG · max 5 MB</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="lyb-img-grid">
                {images.map((img, i) => (
                  <div className="lyb-img-thumb" key={i}>
                    <img src={img.url} alt={`Bike ${i + 1}`} />
                    {i === 0 && <span className="lyb-img-cover">Cover</span>}
                    <button className="lyb-img-remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button className="lyb-img-add" onClick={() => fileRef.current?.click()} type="button">
                    <span>+</span>
                    <small>Add Photo</small>
                  </button>
                )}
              </div>
            )}
          </section>

          <div className="lyb-divider" />

          {/* ── Extras & Submit ── */}
          <section className="lyb-section">

            <div className="lyb-avail-row">
              <div>
                <p className="lyb-avail-label">🪖 Helmet Included</p>
                <p className="lyb-avail-sub">Do you provide helmet with the bike?</p>
              </div>
              <button
                type="button"
                className={`lyb-toggle${form.helmetIncluded ? " lyb-toggle--on" : ""}`}
                onClick={() => toggle("helmetIncluded")}
              >
                <span className="lyb-toggle-thumb" />
              </button>
            </div>

            <div className="lyb-avail-row" style={{ marginTop: "16px" }}>
              <div>
                <p className="lyb-avail-label">✅ Availability</p>
                <p className="lyb-avail-sub">Set your bike as available for booking</p>
              </div>
              <button
                type="button"
                className={`lyb-toggle${form.available ? " lyb-toggle--on" : ""}`}
                onClick={() => toggle("available")}
              >
                <span className="lyb-toggle-thumb" />
              </button>
            </div>

            <div className="lyb-verified-notice">
              <span className="lyb-verified-icon">🛡️</span>
              <div>
                <p className="lyb-verified-title">Verified Listing</p>
                <p className="lyb-verified-sub">
                  Your bike will be verified by our team before it goes live.
                </p>
              </div>
            </div>

            <button
              className="lyb-btn-primary"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "🚀 Publish Listing"}
            </button>

          </section>

        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, error, children, className = "" }) {
  return (
    <div className={`lyb-field ${className}`}>
      <label className="lyb-label">
        {label}
        {required && <span className="lyb-req"> *</span>}
        {hint && <span className="lyb-hint"> — {hint}</span>}
      </label>
      {children}
      {error && <p className="lyb-err-msg">{error}</p>}
    </div>
  );
}