import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    ChevronRight,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="contact-page">
            {/* Header */}
            <div className="contact-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <span>Contact Us</span>
                    </div>
                    <h1>Get in Touch</h1>
                    <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
            </div>

            <div className="container">
                <div className="contact-layout">
                    {/* Contact Form */}
                    <div className="contact-form-container card">
                        {submitted ? (
                            <div className="form-success">
                                <div className="success-icon">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2>Message Sent!</h2>
                                <p>Thank you for contacting us. Our team will get back to you within 24 hours.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setSubmitted(false)}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form">
                                <h2><MessageSquare size={20} /> Send us a Message</h2>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">Full Name *</label>
                                        <input type="text" className="input" placeholder="Your name" required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Phone *</label>
                                        <input type="tel" className="input" placeholder="+91 98765 43210" required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Email *</label>
                                    <input type="email" className="input" placeholder="your@email.com" required />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Subject</label>
                                    <select className="input select">
                                        <option value="">Select a topic</option>
                                        <option value="sales">Sales Inquiry</option>
                                        <option value="quote">Bulk Quote Request</option>
                                        <option value="support">Order Support</option>
                                        <option value="dealer">Dealer Registration</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Message *</label>
                                    <textarea
                                        className="input textarea"
                                        placeholder="How can we help you?"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg">
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <aside className="contact-info">
                        <div className="info-card card">
                            <h3>Contact Information</h3>
                            <div className="info-items">
                                <a href="tel:+919835268202" className="info-item">
                                    <div className="info-icon">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <strong>Phone</strong>
                                        <span>+91 98352 68202</span>
                                    </div>
                                </a>
                                <a href="mailto:arnavpratap2003@gmail.com" className="info-item">
                                    <div className="info-icon">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <strong>Email</strong>
                                        <span>arnavpratap2003@gmail.com</span>
                                    </div>
                                </a>
                                <a href="https://maps.google.com/?q=RPS+More+Patna+Bihar" target="_blank" rel="noopener noreferrer" className="info-item">
                                    <div className="info-icon">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <strong>Address</strong>
                                        <span>Near RPS More<br />Patna - 801503, Bihar</span>
                                    </div>
                                </a>
                                <div className="info-item">
                                    <div className="info-icon">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <strong>Business Hours</strong>
                                        <span>Mon - Sat: 9:00 AM - 7:00 PM<br />Sunday: Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-links-card card">
                            <h3>Quick Links</h3>
                            <div className="quick-links">
                                <Link to="/request-quote">Request a Quote</Link>
                                <Link to="/sample-order">Order Samples</Link>
                                <Link to="/catalog">Browse Catalog</Link>
                                <Link to="/faq">FAQs</Link>
                            </div>
                        </div>

                        <div className="map-card card">
                            <h3>Find Us</h3>
                            <a href="https://maps.google.com/?q=RPS+More+Patna+Bihar" target="_blank" rel="noopener noreferrer" className="map-placeholder">
                                <MapPin size={32} />
                                <p>Patna, Bihar</p>
                            </a>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Contact;
