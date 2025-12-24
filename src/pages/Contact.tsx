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
    MessageSquare,
    Loader2,
    AlertCircle
} from 'lucide-react';
import './Contact.css';

// Web3Forms API Key - Get your free key at https://web3forms.com/
// Replace this with your actual access key
const WEB3FORMS_ACCESS_KEY = 'c8572849-db61-4485-be8b-0c9eb45913c4';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    from_name: 'Homelia Contact Form',
                    subject: `New Contact: ${formData.subject || 'General Inquiry'} - ${formData.name}`,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    topic: formData.subject,
                    message: formData.message,
                    // Additional useful fields
                    botcheck: false,
                    // Customize the email format
                    replyto: formData.email
                })
            });

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            setError('Failed to send message. Please try again or contact us directly via phone/email.');
        } finally {
            setIsLoading(false);
        }
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

                                {error && (
                                    <div className="form-error">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="input"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="input"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Subject</label>
                                    <select
                                        name="subject"
                                        className="input select"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="Sales Inquiry">Sales Inquiry</option>
                                        <option value="Bulk Quote Request">Bulk Quote Request</option>
                                        <option value="Order Support">Order Support</option>
                                        <option value="Dealer Registration">Dealer Registration</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Message *</label>
                                    <textarea
                                        name="message"
                                        className="input textarea"
                                        placeholder="How can we help you?"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
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
                                <a href="mailto:prabhatkumarbxr@gmail.com" className="info-item">
                                    <div className="info-icon">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <strong>Email</strong>
                                        <span>prabhatkumarbxr@gmail.com</span>
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
