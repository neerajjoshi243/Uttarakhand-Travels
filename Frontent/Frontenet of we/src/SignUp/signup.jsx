import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/SignUp/signup.css";

function Signup() {
  const navigate     = useNavigate();
  const nameRef      = useRef();
  const emailRef     = useRef();
  const passwordRef  = useRef();
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name     = nameRef.current.value.trim();
    const email    = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    if (!name || !email || !password)                        { setError("All fields are required.");               return; }
    if (name.length < 2)                                     { setError("Name must be at least 2 characters.");    return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))          { setError("Enter a valid email address.");           return; }
    if (password.length < 6)                                 { setError("Password must be at least 6 characters."); return; }

    setLoading(true); setError("");
    try {
      const response = await fetch("http://localhost:3000/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="sunray r1" /><div className="sunray r2" /><div className="sunray r3" />

      <div className="signup-card">

        <div className="brand-row">
          <span className="leaf-sway">🍃</span>
          <span className="brand-name">Pahadi Stays</span>
        </div>

        <h2>Create account</h2>
        <p className="signup-sub">Join and discover mountain homestays</p>

        <form onSubmit={handleSubmit} noValidate>

          <div className="signup-field">
            <label>Full Name</label>
            <div className="inp-wrap">
              <input type="text"     ref={nameRef}     placeholder="Your full name"    autoComplete="name"         className="signup-input" />
              <span className="inp-ico">👤</span>
            </div>
          </div>

          <div className="signup-field">
            <label>Email</label>
            <div className="inp-wrap">
              <input type="email"    ref={emailRef}    placeholder="you@example.com"   autoComplete="email"        className="signup-input" />
              <span className="inp-ico">✉</span>
            </div>
          </div>

          <div className="signup-field">
            <label>Password</label>
            <div className="inp-wrap">
              <input
                type={showPw ? "text" : "password"}
                ref={passwordRef}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="signup-input pw-input"
              />
              <span className="inp-ico">🔒</span>
              <button type="button" className="eye-btn" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? <><span className="spinner" /> Creating account...</> : "Create Account"}
          </button>
        </form>

        {error && (
          <div className="signup-error">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <div className="signup-divider">
          <div className="dline" /><span className="dtxt">or</span><div className="dline" />
        </div>

        <p className="login-row">
          Already have an account?{" "}
          <button type="button" className="login-link" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </p>

      </div>
    </div>
  );
}

export default Signup;