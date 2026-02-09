import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/header.css";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  navigate("/", { replace: true });
};


  return (
    <header className="app-header">
      <nav className="navbar">

        {/* Top row (logo left, toggle right) */}
        <div className="nav-top">
          <div className="logo">
            <img src={logo} alt="QPS Logo" />
          </div>

          <div
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li>
            <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/prognosis" onClick={() => setMenuOpen(false)}>
              Prognosis
            </NavLink>
          </li>

          <li>
            <NavLink to="/help" onClick={() => setMenuOpen(false)}>
              Help
            </NavLink>
          </li>

          <li>
            <button className="logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>

      </nav>
    </header>
  );
};

export default Header;
