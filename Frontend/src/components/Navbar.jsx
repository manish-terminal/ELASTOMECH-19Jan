import React from 'react';
import './Navbar.css'; // Ensure your CSS file is linked

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        {/* Company Logo and Name */}
        <img
          src="https://elastomech.in/img/elstomatch%20logo.png"
          alt="Elastomech Logo"
          className="logo"
        />
        <span className="company-name">Elastomech</span>
      </div>
      <div className="navbar-actions">
        {/* Display username if logged in */}
        {user ? (
          <>
            <span className="username">Welcome, {user.username}</span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
