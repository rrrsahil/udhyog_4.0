import React from "react";
import { NavLink } from "react-router-dom";
import "../css/footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* LEFT — Contact */}
        <div className="footer-contact">
          <h4 className="heading">Contact</h4>
          <p className="paragraph">
            <i className="fas fa-envelope"></i> support@qps.com
          </p>
          <p className="paragraph">
            <i className="fas fa-phone"></i> +91-XXXXXXXXXX
          </p>
        </div>

        {/* CENTER — System Info */}
        <div className="footer-center">
          <h4 className="heading">QPS</h4>
          <p className="paragraph">
            Quality Prognosis System (QPS) is an AI-powered industrial platform
            for defect prediction, property forecasting, and process
            optimization integrated with Web3 technologies for secure and
            transparent operations.
          </p>
        </div>

        <div className="footer-center">
          <h4 className="heading">Modules</h4>

          <p className="paragraph">
            <NavLink to="/prognosis">Prognosis</NavLink>
            <NavLink to="/analysis">Diagnosis</NavLink>
            <NavLink to="/mechanical">Mechanical</NavLink>
            <NavLink to="/property-prognosis">Property Prediction</NavLink>
          </p>
        </div>

        {/* RIGHT — Social */}
        <div className="footer-social">
          <h4 className="heading">Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} QPS | AI + Web3 Industrial Platform All
        rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
