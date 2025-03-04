import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-logo">Slates</div>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-auth">
          <a href="#signin" className="signin-link">Sign In</a>
          <a href="#register" className="register-btn">Register</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;