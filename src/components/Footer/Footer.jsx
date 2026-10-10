import React, { Component } from "react";
import "./Footer.css";

const PRODUCTS_LINKS = [
  "Point of sale",
  "Payments",
  "Websites",
  "Kiosk",
  "Invoices",
  "Marketing",
  "Loyalty",
  "Customer Directory",
  "Banking",
  "Staff",
  "Payroll",
  "Buy Now, Pay Later",
  "Hardware",
  "Business software & solutions",
];

const BUSINESS_TYPES_LINKS = [
  "Food & Beverage",
  "Quick Service",
  "Full Service",
  "Bars & Breweries",
  "Retail",
  "Beauty Salon",
  "Barbershop",
  "Hair Salon",
  "Nail Salon",
  "Day Spa",
  "Tattoo & Piercing",
  "Med spa",
  "Fitness",
  "Professional Services",
  "Home & Repair",
  "Franchises",
];

const RESOURCES_LINKS = [
  "Pricing",
  "Why Square?",
  "The Bottom Line",
  "Sales",
  "Support",
  "Square Community",
  "Developer Platform",
  "Merchant Services",
  "Rent Hardware",
];

const SQUARE_LINKS = [
  "About",
  "Press & Media",
  "Careers",
  "Referrals",
  "Partners",
];

const LEGAL_LINKS = [
  "Privacy Notice",
  "Security",
  "Trust Center",
  "Terms of Service",
  "Government",
  "Licenses",
  "Square Capital, LLC Licenses",
  "Consumer Health Privacy",
  "Hardware Compliance Certifications",
  "Block, Inc.",
];

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer-section" aria-label="Square Footer">
        <div className="footer-container">
          <div className="footer-nav-grid">
            <div className="footer-col">
              <h3 className="footer-col-title">Products</h3>
              <ul className="footer-link-list">
                {PRODUCTS_LINKS.map((item) => (
                  <li key={item} className="footer-link-item">
                    <a href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Business Types</h3>
              <ul className="footer-link-list">
                {BUSINESS_TYPES_LINKS.map((item) => (
                  <li key={item} className="footer-link-item">
                    <a href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Resources</h3>
              <ul className="footer-link-list">
                {RESOURCES_LINKS.map((item) => (
                  <li key={item} className="footer-link-item">
                    <a href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <div>
                <h3 className="footer-col-title">Contact</h3>
                <ul className="footer-link-list">
                  <li className="footer-link-item">
                    <span>Customer support: 1 (855) 700-6000</span>
                  </li>
                  <li className="footer-link-item">
                    <span>Sales: 1 (833) 959-5325</span>
                  </li>
                </ul>
              </div>

              <div className="footer-col-group">
                <h3 className="footer-col-title">Square</h3>
                <ul className="footer-link-list">
                  {SQUARE_LINKS.map((item) => (
                    <li key={item} className="footer-link-item">
                      <a href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="footer-translation-notice">
            Translation Notice: Some content may have been translated using AI to help serve our global community.
            While all of our content is reviewed by humans, occasionally pre-reviewed content may be live.
            If you have any questions, please do not hesitate to reach out to Square Support in your preferred language.
          </p>

          <hr className="footer-divider" />

          <div className="footer-mid-bar">
            <button type="button" className="footer-region-btn" aria-label="Select country and language">
              <svg
                className="footer-region-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>United States (English)</span>
            </button>

            <div className="footer-social-links" aria-label="Social media links">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="X (formerly Twitter)"
              >
                <svg className="footer-social-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Facebook"
              >
                <svg className="footer-social-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-1.874 0-2.396.708-2.396 2.453v1.527h4.084l-.53 3.667H13.47v7.98C19.435 22.68 24 17.65 24 11.5 24 4.596 18.404-.999 11.5-.999S-1 4.596-1 11.5c0 6.15 4.565 11.18 10.101 12.191z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <svg
                  className="footer-social-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="footer-copyright">© 2026 Block, Inc.</p>
            <ul className="footer-legal-links">
              {LEGAL_LINKS.map((item) => (
                <li key={item} className="footer-legal-item">
                  <a href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    );
  }
}
