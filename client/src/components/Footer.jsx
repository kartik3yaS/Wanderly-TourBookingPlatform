import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <a href="tel:+919005998999">Phone: +91 9005998999</a>
          <a href="mailto:kartikeyashukla009@gmail.com">
            Email: kartikeyashukla009@gmail.com
          </a>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/">Our Tours</a>
            </li>
            <li>
              <a href="/">Customer Reviews</a>
            </li>
            <li>
              <a href="/">About Us</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a
              href="https://www.instagram.com/kartikeya.22/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/kartikeya-shukla-63b433250/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            {/* <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-youtube"></i>
            </a> */}
            <a
              href="https://wa.me/919005998999"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
            <a
              href="https://github.com/kartik3yaS"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Made With ❤️ By Kartikeya Shukla | All Rights Are Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
