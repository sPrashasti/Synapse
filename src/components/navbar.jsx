import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z"
              stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 3V21M4 7.5L20 16.5M20 7.5L4 16.5"
              stroke="white" strokeWidth="1.5" opacity="0.6"/>
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
        {user ? (
          <>
            <span style={{fontSize:"14px",color:"rgba(255,255,255,0.55)",fontWeight:"500"}}>
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
