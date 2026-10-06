"use client";

import Link from "next/link";
import Image from "next/image";
import "./layout.css";

export default function Footer() {
  return (
    <footer className="editorial-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo-text">The Hunger</h2>
            <p className="footer-brand-statement">
              An ultra-premium modern Indian culinary experience.<br/>
              Taste the royal heritage.
            </p>
          </div>
          
          <div className="footer-nav-grid">
            <div className="footer-column">
              <h4>Experience</h4>
              <Link href="/menu">Signature Menu</Link>
              <Link href="/services">Private Dining</Link>
              <Link href="/categories">Tasting Courses</Link>
            </div>
            <div className="footer-column">
              <h4>Brand</h4>
              <Link href="/about">Our Story</Link>
              <Link href="/about#philosophy">Philosophy</Link>
              <Link href="/about#chefs">Master Chefs</Link>
            </div>
            <div className="footer-column">
              <h4>Contact & Location</h4>
              <p className="footer-contact-text">
                <strong>Address:</strong><br/>
                123 Premium Arcade, Boring Road<br/>
                Patna, Bihar 800001
              </p>
              <p className="footer-contact-text">
                <strong>Phone:</strong><br/>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </p>
              <p className="footer-contact-text">
                <strong>Email:</strong><br/>
                <a href="mailto:info@thehunger.in">info@thehunger.in</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} The Hunger. All rights reserved.</p>
          <div style={{
            background: "rgba(198,162,74,0.1)", border: "1px solid rgba(198,162,74,0.3)",
            borderRadius: "999px", padding: "0.4rem 1rem", fontSize: "0.8rem",
            color: "var(--color-champagne-gold)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem"
          }}>
            Track Your Order
          </div>
          <div className="footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
