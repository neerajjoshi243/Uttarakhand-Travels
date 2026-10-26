import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/login/login.css";

export default function Login() {
  const navigate    = useNavigate();
  const emailRef    = useRef();
  const passwordRef = useRef();
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email    = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();
    if (!email || !password)                          { setError("Please fill in all fields.");                     return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))   { setError("Enter a valid email address.");                   return; }
    if (password.length < 6)                          { setError("Password must be at least 6 characters.");        return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token",        data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("name",         data.name);
        navigate(data.has_listing ? "/owner-dashboard" : "/signupdesbord");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="sunray r1" /><div className="sunray r2" /><div className="sunray r3" />

      <div className="login-card">

        <div className="brand-row">
          <span className="leaf-sway">🍃</span>
          <span className="brand-name">Pahadi Stays</span>
        </div>

        <h2>Welcome back</h2>
        <p className="login-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate>

          <div className="login-field">
            <label>Email</label>
            <div className="inp-wrap">
              <input type="email" ref={emailRef} placeholder="you@example.com" autoComplete="email" className="login-input" />
              <span className="inp-ico">✉</span>
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="inp-wrap">
              <input
                type={showPw ? "text" : "password"}
                ref={passwordRef}
                placeholder="••••••••"
                autoComplete="current-password"
                className="login-input pw-input"
              />
              <span className="inp-ico">🔒</span>
              <button type="button" className="eye-btn" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="forgot-row">
            <button type="button" className="forgot-btn" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <><span className="spinner" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        {error && (
          <div className="login-error">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <div className="login-divider">
          <div className="dline" /><span className="dtxt">or</span><div className="dline" />
        </div>

        <p className="signup-row">
          No account?{" "}
          <button type="button" className="signup-link" onClick={() => navigate("/signup")}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}