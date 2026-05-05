import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

function AuthOrbs() {
  return (
    <>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",top:-150,right:-150,
        background:"radial-gradient(circle,rgba(109,40,217,0.4) 0%,transparent 70%)",
        filter:"blur(60px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",bottom:-100,left:-100,
        background:"radial-gradient(circle,rgba(37,99,235,0.35) 0%,transparent 70%)",
        filter:"blur(60px)",pointerEvents:"none"}}/>
    </>
  );
}

export default function Signup() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await register(name, email, password);
      navigate("/collections");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <AuthOrbs />
      <div className="auth-card">
        <div className="auth-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" strokeLinejoin="round"/>
            <path d="M12 3V21M4 7.5L20 16.5M20 7.5L4 16.5" opacity="0.6"/>
          </svg>
        </div>
        <h2>Create your account</h2>
        <p className="auth-sub">Start debugging with intention.</p>

        {error && <p style={{color:"#f87171",fontSize:"13px",marginBottom:"12px"}}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Display name</label>
            <input id="name" type="text" placeholder="Ada Lovelace"
              value={name} onChange={(e)=>setName(e.target.value)} required/>
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e)=>setEmail(e.target.value)} required/>
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••"
              value={password} onChange={(e)=>setPassword(e.target.value)} required/>
          </div>
          <button type="submit" className="btn-primary full" style={{marginTop:"6px"}} disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
