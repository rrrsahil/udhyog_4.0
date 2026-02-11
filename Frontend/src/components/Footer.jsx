import React from "react";
import "../css/footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">

        {/* LEFT — Contact */}
        <div className="footer-contact">
          <h4 className="heading">Contact</h4>
          <p className="paragraph"><i className="fas fa-envelope"></i> support@qps.com</p>
          <p className="paragraph"><i className="fas fa-phone"></i> +91-XXXXXXXXXX</p>
        </div>

        {/* CENTER — System Info */}
        <div className="footer-center">
          <h4 className="heading">QPS</h4>
          <p className="paragraph">
            Quality Prognosis System predicts manufacturing product quality
            using intelligent machine learning models for accurate decision making.
          </p>
        </div>

        {/* RIGHT — Social */}
        <div className="footer-social">
          <h4 className="heading">Follow Us</h4>
          <div className="social-icons">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-linkedin-in"></i>
            <i className="fab fa-github"></i>
            <i className="fab fa-twitter"></i>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Quality Prognosis System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
