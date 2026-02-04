import { Link } from 'react-router-dom';
import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    ArrowRight,
    Shield,
    Truck,
    Award,
    CreditCard
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            {/* Trust Bar */}
            <div className="trust-bar">
                <div className="container">
                    <div className="trust-bar-grid">
                        <div className="trust-item">
                            <div className="trust-icon">
                                <Shield size={24} />
                            </div>
                            <div className="trust-text">
                                <strong>Authorized Distributor</strong>
                                <span>Official Durian & Rockstar Partner</span>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">
                                <Truck size={24} />
                            </div>
                            <div className="trust-text">
                                <strong>Pan-India Delivery</strong>
                                <span>Fast & Secure Shipping</span>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">
                                <Award size={24} />
                            </div>
                            <div className="trust-text">
                                <strong>Quality Assured</strong>
                                <span>100% Genuine Products</span>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">
                                <CreditCard size={24} />
                            </div>
                            <div className="trust-text">
                                <strong>Secure Payments</strong>
                                <span>GST Compliant Invoicing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        {/* Company Info */}
                        <div className="footer-col footer-col-brand">
                            <div className="footer-logo">
                                <img
                                    src="/homelia-logo.png"
                                    alt="Homelia - Premium Laminates"
                                    className="footer-logo-img"
                                />
                            </div>
                            <p className="footer-description">
                                Your trusted authorized distributor for Durian and Rockstar laminates.
                                Serving architects, interior designers, contractors, and bulk buyers across India.
                            </p>
                            <div className="footer-contact">
                                <a href="tel:+919835268202" className="contact-item" style={{ color: '#A69070', fontWeight: 500 }}>
                                    <Phone size={18} style={{ color: '#A69070' }} />
                                    <span>+91 98352 68202</span>
                                </a>
                                <a href="mailto:prabhatkumarbxr@gmail.com" className="contact-item" style={{ color: '#A69070', fontWeight: 500 }}>
                                    <Mail size={18} style={{ color: '#A69070' }} />
                                    <span>prabhatkumarbxr@gmail.com</span>
                                </a>
                                <a href="https://maps.google.com/?q=RPS+More+Patna+Bihar" target="_blank" rel="noopener noreferrer" className="contact-item" style={{ color: '#A69070', fontWeight: 500 }}>
                                    <MapPin size={18} style={{ color: '#A69070' }} />
                                    <span>Near RPS More, Patna, Bihar</span>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h4>Quick Links</h4>
                            <ul className="footer-links">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/catalog">All Products</Link></li>
                                <li><Link to="/brands/durian">Durian Laminates</Link></li>
                                <li><Link to="/brands/rockstar">Rockstar Laminates</Link></li>
                                <li><Link to="/request-quote">Request Quote</Link></li>
                                <li><Link to="/sample-order">Order Samples</Link></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="footer-col">
                            <h4>Categories</h4>
                            <ul className="footer-links">
                                <li><Link to="/catalog?category=decorative">Decorative Laminates</Link></li>
                                <li><Link to="/catalog?category=compact">Compact Laminates</Link></li>
                                <li><Link to="/catalog?category=exterior">Exterior Laminates</Link></li>
                                <li><Link to="/catalog?category=fire-retardant">Fire Retardant</Link></li>
                                <li><Link to="/catalog?category=anti-bacterial">Anti-Bacterial</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="footer-col">
                            <h4>Support</h4>
                            <ul className="footer-links">
                                <li><Link to="/buying-guide">Buying Guide</Link></li>
                                <li><Link to="/faq">FAQs</Link></li>
                                <li><Link to="/track-order">Track Order</Link></li>
                                <li><Link to="/shipping">Shipping Info</Link></li>
                                <li><Link to="/returns">Returns Policy</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="footer-col footer-col-newsletter">
                            <h4>Stay Updated</h4>
                            <p>Subscribe for new arrivals, exclusive offers, and design inspiration.</p>
                            <form className="newsletter-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="newsletter-input"
                                />
                                <button type="submit" className="newsletter-btn">
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                            <div className="footer-social">
                                <a href="#" className="social-link" aria-label="Facebook">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="LinkedIn">
                                    <Linkedin size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="YouTube">
                                    <Youtube size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © {new Date().getFullYear()} Homelia. All rights reserved. Authorized Distributor of Durian & Rockstar Laminates.
                        </p>
                        <div className="footer-bottom-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                            <Link to="/sitemap">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
