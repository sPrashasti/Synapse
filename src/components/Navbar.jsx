import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/global.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 3V21M4 7.5L20 16.5M20 7.5L4 16.5"
              stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
          </svg>
        </span>
        Synapse
      </Link>

      <ul className="navbar-links">
        <li><NavLink to="/library"     className={({isActive})=>isActive?"active":""}>Library</NavLink></li>
        <li><NavLink to="/review"      className={({isActive})=>isActive?"active":""}>Reviewer</NavLink></li>
        <li><NavLink to="/collections" className={({isActive})=>isActive?"active":""}>Collections</NavLink></li>
      </ul>

      <div className="navbar-right">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {user ? (
          <>
            <span style={{fontSize:"14px",color:"var(--text-mid)",fontWeight:"500"}}>
              Hi, {user.name.split(" ")[0]} 👋
            </span>
            <button className="btn-secondary" onClick={()=>{logout();navigate("/");}}
              style={{padding:"8px 18px",fontSize:"13px"}}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-login">Log in</Link>
            <button className="btn-primary" onClick={()=>navigate("/signup")}>
              Join Synapse →
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
