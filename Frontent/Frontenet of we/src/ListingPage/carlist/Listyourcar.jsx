import { useState, useRef, useCallback } from "react";
import "../../CSS/mainlistingpage/ListYourCar.css";

const FUEL_TYPES = [
  { value: "Petrol",   label: "Petrol",   icon: "⛽" },
  { value: "Diesel",   label: "Diesel",   icon: "🛢️" },
  { value: "Electric", label: "Electric", icon: "⚡" },
  { value: "Hybrid",   label: "Hybrid",   icon: "🔋" },
];

const SEAT_OPTIONS = [2, 4, 5, 6, 7, 8];
const MAX_IMAGES = 6;

export default function ListYourCar() {
  const [form, setForm] = useState({
    carName:    "",
    carModel:   "",
    priceDay:   "",
    priceHour:  "",
    pickup:     "",
    fuel:       "",
    seats:      "",
    contact:    "",
    email:      "",
    available:  true,
  });

  const [images,    setImages]    = useState([]);
  const [dragging,  setDragging]  = useState(false);
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const fileRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setFuel  = (v) => setForm((f) => ({ ...f, fuel: v }));
  const setSeats = (v) => setForm((f) => ({ ...f, seats: v }));

  const addFiles = (files) => {
    const allowed = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_IMAGES - images.length);
    setImages((prev) => [...prev, ...allowed.map((f) => ({ url: URL.createObjectURL(f), file: f }))]);
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [images]);

  const validate = () => {
    const e = {};
    if (!form.carName.trim())  e.carName  = "Car name is required";
    if (!form.carModel.trim()) e.carModel = "Car model is required";
    if (!form.priceDay)        e.priceDay = "Price per day is required";
    if (!form.pickup.trim())   e.pickup   = "Pickup location is required";
    if (!form.fuel)            e.fuel     = "Select a fuel type";
    if (!form.seats)           e.seats    = "Select number of seats";
    if (!form.contact.trim() || !/^\d{10}$/.test(form.contact.trim()))
      e.contact = "Enter a valid 10-digit number";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email.trim()))
      e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("carName",        form.carName);
      formData.append("carModel",       form.carModel);
      formData.append("pricePerDay",    form.priceDay);
      formData.append("pricePerHour",   form.priceHour || 0);
      formData.append("pickupLocation", form.pickup);
      formData.append("fuelType",       form.fuel);
      formData.append("seats",          form.seats);
      formData.append("contactNumber",  form.contact);
      formData.append("ownerEmail",     form.email);
      formData.append("isAvailable",    form.available);
      images.forEach((img) => formData.append("carImages", img.file));

      const token = localStorage.getItem("token");
if (!token) { alert("Please login first."); return; }

const res = await fetch("http://localhost:3000/add-car", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData,
});
      const data = await res.json();

      if (res.ok) setSubmitted(true);
      else alert("Error: " + data.message);

    } catch (error) {
      console.log(error);
      alert("Server Error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ carName:"", carModel:"", priceDay:"", priceHour:"", pickup:"", fuel:"", seats:"", contact:"", email:"", available: true });
    setImages([]);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="lyc-success">
        <div className="lyc-success-card">
          <div className="lyc-success-icon">🚗</div>
          <h2>Listing Submitted!</h2>
          <p>Our team will verify your car and publish it within 24 hours.</p>
          <button className="lyc-btn-primary" onClick={resetForm}>List Another Car</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lyc-page">
      <div className="lyc-hero">
        <div className="lyc-hero-inner">
          <span className="lyc-eyebrow">Earn With Your Car</span>
          <h1 className="lyc-title">List Your Car</h1>
          <p className="lyc-subtitle">Rent your car to travellers and earn every day it sits idle.</p>
        </div>
        <div className="lyc-hero-steps">
          {["Fill Details","Upload Photos","Get Verified","Start Earning"].map((s, i) => (
            <div className="lyc-step" key={s}>
              <div className="lyc-step-num">{i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lyc-body">
        <div className="lyc-form-card">

          {/* Car Details */}
          <section className="lyc-section">
            <div className="lyc-section-head">
              <span className="lyc-section-icon">🚗</span>
              <div>
                <h2 className="lyc-section-title">Car Details</h2>
                <p className="lyc-section-sub">Basic information about your vehicle</p>
              </div>
            </div>

            <div className="lyc-grid-2">
              <Field label="Car Name" required error={errors.carName}>
                <input className={`lyc-input${errors.carName ? " lyc-input--err" : ""}`}
                  placeholder="e.g. Maruti Swift" value={form.carName} onChange={set("carName")} />
              </Field>

              <Field label="Car Model" required error={errors.carModel}>
                <input className={`lyc-input${errors.carModel ? " lyc-input--err" : ""}`}
                  placeholder="e.g. 2022 VXi" value={form.carModel} onChange={set("carModel")} />
              </Field>

              <Field label="Price Per Day (₹)" required error={errors.priceDay}>
                <div className="lyc-prefix-wrap">
                  <span className="lyc-prefix">₹</span>
                  <input className={`lyc-input lyc-input--prefixed${errors.priceDay ? " lyc-input--err" : ""}`}
                    type="number" placeholder="1500" min="0" value={form.priceDay} onChange={set("priceDay")} />
                </div>
              </Field>

              <Field label="Price Per Hour (₹)" hint="Optional">
                <div className="lyc-prefix-wrap">
                  <span className="lyc-prefix">₹</span>
                  <input className="lyc-input lyc-input--prefixed"
                    type="number" placeholder="200" min="0" value={form.priceHour} onChange={set("priceHour")} />
                </div>
              </Field>

              <Field label="Pickup Location" required error={errors.pickup} className="lyc-col-full">
                <div className="lyc-prefix-wrap">
                  <span className="lyc-prefix">📍</span>
                  <input className={`lyc-input lyc-input--prefixed${errors.pickup ? " lyc-input--err" : ""}`}
                    placeholder="e.g. Dehradun Railway Station" value={form.pickup} onChange={set("pickup")} />
                </div>
              </Field>
            </div>
          </section>

          <div className="lyc-divider" />

          {/* Fuel Type */}
          <section className="lyc-section">
            <div className="lyc-section-head">
              <span className="lyc-section-icon">⛽</span>
              <div>
                <h2 className="lyc-section-title">Fuel Type <span className="lyc-req">*</span></h2>
                <p className="lyc-section-sub">Select what your car runs on</p>
              </div>
            </div>
            <div className="lyc-fuel-grid">
              {FUEL_TYPES.map(({ value, label, icon }) => (
                <button key={value} type="button"
                  className={`lyc-fuel-btn${form.fuel === value ? " lyc-fuel-btn--active" : ""}${errors.fuel ? " lyc-fuel-btn--err" : ""}`}
                  onClick={() => { setFuel(value); setErrors((e) => ({ ...e, fuel: undefined })); }}>
                  <span className="lyc-fuel-icon">{icon}</span>
                  <span className="lyc-fuel-label">{label}</span>
                </button>
              ))}
            </div>
            {errors.fuel && <p className="lyc-err-msg">{errors.fuel}</p>}
          </section>

          <div className="lyc-divider" />

          {/* Seats & Contact */}
          <section className="lyc-section">
            <div className="lyc-section-head">
              <span className="lyc-section-icon">👥</span>
              <div>
                <h2 className="lyc-section-title">Capacity & Contact</h2>
                <p className="lyc-section-sub">Seats and how travellers can reach you</p>
              </div>
            </div>

            <div className="lyc-grid-2">
              <Field label="Number of Seats" required error={errors.seats}>
                <div className="lyc-seats-grid">
                  {SEAT_OPTIONS.map((n) => (
                    <button key={n} type="button"
                      className={`lyc-seat-btn${form.seats === String(n) ? " lyc-seat-btn--active" : ""}${errors.seats ? " lyc-seat-btn--err" : ""}`}
                      onClick={() => { setSeats(String(n)); setErrors((e) => ({ ...e, seats: undefined })); }}>
                      {n}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Contact Number" required error={errors.contact}>
                <div className="lyc-prefix-wrap">
                  <span className="lyc-prefix">🇮🇳 +91</span>
                  <input className={`lyc-input lyc-input--prefixed${errors.contact ? " lyc-input--err" : ""}`}
                    type="tel" placeholder="98XXXXXXXX" maxLength={10}
                    value={form.contact} onChange={set("contact")} />
                </div>
              </Field>

              <Field label="Owner Email" required error={errors.email} className="lyc-col-full">
                <div className="lyc-prefix-wrap">
                  <span className="lyc-prefix">✉️</span>
                  <input className={`lyc-input lyc-input--prefixed${errors.email ? " lyc-input--err" : ""}`}
                    type="email" placeholder="your@email.com"
                    value={form.email} onChange={set("email")} />
                </div>
              </Field>
            </div>
          </section>

          <div className="lyc-divider" />

          {/* Images */}
          <section className="lyc-section">
            <div className="lyc-section-head">
              <span className="lyc-section-icon">📸</span>
              <div>
                <h2 className="lyc-section-title">Upload Car Images</h2>
                <p className="lyc-section-sub">{images.length}/{MAX_IMAGES} — PNG, JPG up to 5 MB each</p>
              </div>
            </div>

            {images.length < MAX_IMAGES && (
              <div className={`lyc-dropzone${dragging ? " lyc-dropzone--active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" multiple
                  style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
                <div className="lyc-dropzone-icon">📷</div>
                <p className="lyc-dropzone-text">Drop images here or <span className="lyc-link">click to upload</span></p>
                <p className="lyc-dropzone-hint">PNG, JPG · max 5 MB</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="lyc-img-grid">
                {images.map((img, i) => (
                  <div className="lyc-img-thumb" key={i}>
                    <img src={img.url} alt={`Car ${i + 1}`} />
                    {i === 0 && <span className="lyc-img-cover">Cover</span>}
                    <button className="lyc-img-remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button className="lyc-img-add" onClick={() => fileRef.current?.click()} type="button">
                    <span>+</span><small>Add Photo</small>
                  </button>
                )}
              </div>
            )}
          </section>

          <div className="lyc-divider" />

          {/* Availability & Submit */}
          <section className="lyc-section">
            <div className="lyc-avail-row">
              <div>
                <p className="lyc-avail-label">Availability</p>
                <p className="lyc-avail-sub">Set your car as available for booking</p>
              </div>
              <button type="button"
                className={`lyc-toggle${form.available ? " lyc-toggle--on" : ""}`}
                onClick={() => setForm((f) => ({ ...f, available: !f.available }))}>
                <span className="lyc-toggle-thumb" />
              </button>
            </div>

            <div className="lyc-verified-notice">
              <span className="lyc-verified-icon">🛡️</span>
              <div>
                <p className="lyc-verified-title">Verified Listing</p>
                <p className="lyc-verified-sub">Your car will be verified before it goes live.</p>
              </div>
            </div>

            <button className="lyc-btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
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
    <div className={`lyc-field ${className}`}>
      <label className="lyc-label">
        {label}
        {required && <span className="lyc-req"> *</span>}
        {hint && <span className="lyc-hint"> — {hint}</span>}
      </label>
      {children}
      {error && <p className="lyc-err-msg">{error}</p>}
    </div>
  );
}