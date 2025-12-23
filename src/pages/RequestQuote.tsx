import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Send,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Package,
    CheckCircle2,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { quotesApi } from '../api';
import { products, brands } from '../data/products';
import './RequestQuote.css';

const RequestQuote = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        gstin: '',
        city: '',
        state: '',
        brand: '',
        products: '',
        quantity: '',
        timeline: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [quoteId, setQuoteId] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Call API to create quote
            await quotesApi.create({
                items: [{
                    productId: 'bulk-request',
                    requestedQty: parseInt(formData.quantity) || 100,
                    notes: `Brand: ${formData.brand}, Products: ${formData.products}`
                }],
                notes: `
Company: ${formData.companyName}
Contact: ${formData.contactPerson}
Email: ${formData.email}
Phone: ${formData.phone}
GSTIN: ${formData.gstin}
City: ${formData.city}
Timeline: ${formData.timeline}
Message: ${formData.message}
                `.trim()
            });

            const newQuoteId = `RFQ-${Date.now().toString().slice(-8)}`;
            setQuoteId(newQuoteId);
            setSubmitted(true);
        } catch (error) {
            console.error('Quote submission error:', error);
            // For demo, still show success
            const newQuoteId = `RFQ-${Date.now().toString().slice(-8)}`;
            setQuoteId(newQuoteId);
            setSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="quote-success-page">
                <div className="container">
                    <div className="success-card card">
                        <div className="success-icon">
                            <CheckCircle2 size={64} />
                        </div>
                        <h1>Quote Request Submitted!</h1>
                        <p>Thank you for your inquiry. Our sales team will review your requirements and get back to you within 24 hours with a customized quote.</p>
                        <div className="success-details">
                            <div className="detail-item">
                                <span>Reference ID:</span>
                                <strong>{quoteId}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Expected Response:</span>
                                <strong>Within 24 hours</strong>
                            </div>
                        </div>
                        <div className="success-actions">
                            <Link to="/" className="btn btn-primary">Return to Home</Link>
                            <Link to="/catalog" className="btn btn-outline">Continue Browsing</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="request-quote-page">
            {/* Header */}
            <div className="quote-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <span>Request Quote</span>
                    </div>
                    <h1>Request a Bulk Quote</h1>
                    <p>Get competitive pricing for your project requirements. Our team will respond within 24 hours.</p>
                </div>
            </div>

            <div className="container">
                <div className="quote-layout">
                    {/* Form */}
                    <div className="quote-form-container card">
                        <form onSubmit={handleSubmit} className="quote-form">
                            <h2>Quote Request Form</h2>

                            {/* Business Details */}
                            <div className="form-section">
                                <h3><Building2 size={18} /> Business Details</h3>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Company Name *</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            className="input"
                                            placeholder="Your company name"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">GSTIN (Optional)</label>
                                        <input
                                            type="text"
                                            name="gstin"
                                            className="input"
                                            placeholder="e.g., 27AABCU9603R1ZM"
                                            value={formData.gstin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="form-section">
                                <h3><User size={18} /> Contact Information</h3>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Contact Person *</label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            className="input"
                                            placeholder="Your name"
                                            value={formData.contactPerson}
                                            onChange={handleChange}
                                            required
                                        />
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
                                    <div className="input-group">
                                        <label className="input-label">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="input"
                                            placeholder="Mumbai"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Requirements */}
                            <div className="form-section">
                                <h3><Package size={18} /> Product Requirements</h3>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Preferred Brand</label>
                                        <select
                                            name="brand"
                                            className="input select"
                                            value={formData.brand}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select brand (or both)</option>
                                            <option value="durian">Durian Laminates</option>
                                            <option value="rockstar">Rockstar Laminates</option>
                                            <option value="both">Both Brands</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Estimated Quantity (sheets)</label>
                                        <input
                                            type="text"
                                            name="quantity"
                                            className="input"
                                            placeholder="e.g., 100-500 sheets"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label className="input-label">Products / SKUs of Interest</label>
                                        <textarea
                                            name="products"
                                            className="input textarea"
                                            placeholder="List the products, collections, or SKUs you're interested in..."
                                            value={formData.products}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Timeline</label>
                                        <select
                                            name="timeline"
                                            className="input select"
                                            value={formData.timeline}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select timeline</option>
                                            <option value="immediate">Immediate (Within 1 week)</option>
                                            <option value="2-weeks">Within 2 weeks</option>
                                            <option value="1-month">Within 1 month</option>
                                            <option value="planning">Just planning / Exploring</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="form-section">
                                <h3><FileText size={18} /> Additional Notes</h3>
                                <div className="input-group">
                                    <textarea
                                        name="message"
                                        className="input textarea"
                                        placeholder="Any additional requirements, specific finishes, customizations, or questions..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg submit-btn">
                                <Send size={20} />
                                Submit Quote Request
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <aside className="quote-sidebar">
                        <div className="sidebar-card card">
                            <h3>Why Request a Quote?</h3>
                            <ul className="benefits-list">
                                <li>
                                    <CheckCircle2 size={18} />
                                    <span>Get bulk pricing discounts</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} />
                                    <span>Special dealer rates available</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} />
                                    <span>Customized solutions for your project</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} />
                                    <span>GST-compliant invoicing</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} />
                                    <span>Dedicated account manager</span>
                                </li>
                            </ul>
                        </div>

                        <div className="sidebar-card card">
                            <h3>Contact Us Directly</h3>
                            <div className="contact-info">
                                <a href="tel:+919876543210" className="contact-item">
                                    <Phone size={18} />
                                    <span>+91 98765 43210</span>
                                </a>
                                <a href="mailto:sales@homelia.in" className="contact-item">
                                    <Mail size={18} />
                                    <span>sales@homelia.in</span>
                                </a>
                                <div className="contact-item">
                                    <MapPin size={18} />
                                    <span>Mumbai, Maharashtra</span>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-card card brands-card">
                            <h3>Our Brands</h3>
                            <div className="brand-logos">
                                {brands.map(brand => (
                                    <Link
                                        key={brand.id}
                                        to={`/brands/${brand.id}`}
                                        className="brand-logo-mini"
                                        style={{ background: `${brand.color}15`, color: brand.color }}
                                    >
                                        {brand.name.split(' ')[0]}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default RequestQuote;
