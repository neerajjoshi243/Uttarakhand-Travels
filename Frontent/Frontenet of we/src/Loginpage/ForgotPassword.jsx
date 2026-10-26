import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── inject CSS once ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}

.signup-page{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  font-family:'Jost',sans-serif;
  background:radial-gradient(ellipse 60% 50% at 80% 20%,rgba(255,220,120,.28) 0%,transparent 60%),
             radial-gradient(ellipse 40% 40% at 10% 80%,rgba(180,210,140,.2) 0%,transparent 55%),
             #f5f2eb;
  overflow:hidden;position:relative;
}

.sunray{
  position:absolute;top:-60px;width:2px;
  background:linear-gradient(180deg,rgba(255,210,80,.45),transparent);
  transform-origin:top center;border-radius:2px;
  animation:rayDrift 6s ease-in-out infinite alternate;
}
.r1{right:80px;height:260px}
.r2{right:110px;height:200px;opacity:.6;animation-delay:1s;animation-duration:8s}
.r3{right:58px;height:180px;opacity:.5;animation-delay:2s;animation-duration:7s}
@keyframes rayDrift{from{opacity:.3;transform:rotate(-4deg)}to{opacity:.7;transform:rotate(4deg)}}

.signup-card{
  position:relative;z-index:10;background:#fffdf7;
  border:1px solid rgba(160,140,100,.15);border-radius:18px;
  padding:40px 40px 36px;width:100%;max-width:380px;
  box-shadow:0 2px 32px rgba(100,80,40,.07);
  animation:cardIn .55s cubic-bezier(.22,1,.36,1) both;
}
@keyframes cardIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.brand-row{display:flex;align-items:center;gap:8px;margin-bottom:24px}
.leaf-sway{font-size:22px;animation:leafSway 3s ease-in-out infinite alternate}
@keyframes leafSway{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
.brand-name{font-size:15px;font-weight:600;color:#3a5a2a;letter-spacing:.02em}

.signup-card h2{font-size:24px;font-weight:600;color:#2a3a1a;margin-bottom:4px}
.signup-sub{font-size:13px;color:#9aaa88;margin-bottom:24px}

.signup-field{margin-bottom:13px}
.signup-field label{
  display:block;font-size:11px;font-weight:600;color:#9aaa88;
  letter-spacing:.07em;text-transform:uppercase;margin-bottom:6px;
}
.inp-wrap{position:relative}

.signup-input{
  width:100%;background:#f9f7f1;border:1.5px solid #e0d8c8;border-radius:10px;
  padding:11px 14px 11px 38px;
  font-family:'Jost',sans-serif;font-size:14px;color:#2a3a1a;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.signup-input:focus{border-color:#5a8a45;background:#fff;box-shadow:0 0 0 3px rgba(90,138,69,.1)}
.signup-input::placeholder{color:#c4bfb0;font-size:13px}
.otp-input{padding:11px 14px;letter-spacing:8px;font-size:20px;text-align:center}

.inp-ico{
  position:absolute;left:12px;top:50%;transform:translateY(-50%);
  font-size:14px;color:#b8c8a0;pointer-events:none;
}

.signup-btn{
  width:100%;padding:13px 0;margin-top:6px;
  background:#4a7a38;border:none;border-radius:10px;
  font-family:'Jost',sans-serif;font-size:14px;font-weight:600;
  color:#fff;cursor:pointer;letter-spacing:.04em;
  transition:background .2s,transform .15s;
  box-shadow:0 3px 14px rgba(74,122,56,.22);
}
.signup-btn:hover:not(:disabled){background:#3a6628;transform:translateY(-1px)}
.signup-btn:active:not(:disabled){transform:scale(.98)}
.signup-btn:disabled{background:#a8c298;cursor:not-allowed;box-shadow:none}

.spinner{
  display:inline-block;width:13px;height:13px;
  border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
  border-radius:50%;animation:spin .7s linear infinite;
  margin-right:6px;vertical-align:middle;
}
@keyframes spin{to{transform:rotate(360deg)}}

.signup-error{
  font-size:12px;color:#7a4a2a;background:#fef5ee;border:1px solid #f0d8c0;
  border-radius:8px;padding:9px 12px;margin-top:12px;
  display:flex;align-items:center;gap:6px;
}
.signup-success{
  font-size:12px;color:#2a5a1a;background:#f2faea;border:1px solid #c8e0b8;
  border-radius:8px;padding:9px 12px;margin-top:12px;
  display:flex;align-items:center;gap:6px;
}

.signup-divider{display:flex;align-items:center;gap:10px;margin:18px 0 14px}
.dline{flex:1;height:1px;background:#e8e0d0}
.dtxt{font-size:11px;color:#b8b0a0;letter-spacing:.05em}

.login-row{text-align:center;font-size:13px;color:#9aaa88}
.login-link{
  color:#4a7a38;cursor:pointer;font-weight:600;
  background:none;border:none;font-family:'Jost',sans-serif;
  font-size:13px;padding:0;transition:opacity .2s;
}
.login-link:hover{opacity:.65}

.resend-btn{
  display:block;width:100%;text-align:center;
  color:#4a7a38;cursor:pointer;font-weight:600;
  background:none;border:none;font-family:'Jost',sans-serif;
  font-size:13px;padding:0;margin-top:12px;transition:opacity .2s;
}
.resend-btn:hover{opacity:.65}

input:-webkit-autofill{
  -webkit-box-shadow:0 0 0 1000px #f9f7f1 inset !important;
  -webkit-text-fill-color:#2a3a1a !important;
}

@media(max-width:440px){.signup-card{padding:36px 24px 30px}}
`;

function ForgotPassword() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [newPass, setNewPass] = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* inject CSS once into <head> */
  useEffect(() => {
    const id = "fp-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
  }, []);

  const handleSendOtp = async () => {
    setError(""); setSuccess("");
    if (!email.trim())                               { setError("Email is required.");          return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:3000/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess("OTP sent to your email!"); setStep(2); }
      else         { setError(data.message); }
    } catch { setError("Server Error. Please try again."); }
    finally  { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setError(""); setSuccess("");
    if (!otp.trim())        { setError("OTP is required.");                       return; }
    if (otp.length !== 6)   { setError("OTP must be 6 digits.");                  return; }
    if (newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:3000/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess("Password reset successful!"); setTimeout(() => navigate("/login"), 1500); }
      else         { setError(data.message); }
    } catch { setError("Server Error. Please try again."); }
    finally  { setLoading(false); }
  };

  const goBack = () => { setStep(1); setError(""); setSuccess(""); };

  return (
    <div className="signup-page">
      <div className="sunray r1" /><div className="sunray r2" /><div className="sunray r3" />

      <div className="signup-card">

        <div className="brand-row">
          <span className="leaf-sway">🍃</span>
          <span className="brand-name">Pahadi Stays</span>
        </div>

        {step === 1 ? (
          <>
            <h2>Forgot password</h2>
            <p className="signup-sub">Enter your email — we'll send you an OTP</p>

            <div className="signup-field">
              <label>Email</label>
              <div className="inp-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="signup-input"
                />
                <span className="inp-ico">✉</span>
              </div>
            </div>

            <button className="signup-btn" onClick={handleSendOtp} disabled={loading}>
              {loading ? <><span className="spinner" />Sending...</> : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <h2>Enter OTP</h2>
            <p className="signup-sub">OTP sent to: {email}</p>

            <div className="signup-field">
              <label>OTP</label>
              <div className="inp-wrap">
                <input
                  type="text"
                  value={otp}
                  maxLength={6}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="······"
                  className="signup-input otp-input"
                />
              </div>
            </div>

            <div className="signup-field">
              <label>New Password</label>
              <div className="inp-wrap">
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="signup-input"
                />
                <span className="inp-ico">🔒</span>
              </div>
            </div>

            <button className="signup-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? <><span className="spinner" />Resetting...</> : "Reset Password"}
            </button>

            <button type="button" className="resend-btn" onClick={goBack}>
              Resend OTP
            </button>
          </>
        )}

        {error   && <div className="signup-error"><span>⚠</span><span>{error}</span></div>}
        {success && <div className="signup-success"><span>✓</span><span>{success}</span></div>}

        <div className="signup-divider">
          <div className="dline" /><span className="dtxt">or</span><div className="dline" />
        </div>

        <p className="login-row">
          <button type="button" className="login-link" onClick={() => navigate("/login")}>
            ← Back to Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;