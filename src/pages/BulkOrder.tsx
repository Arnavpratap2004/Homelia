import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Send,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    Package,
    CheckCircle2,
    ChevronRight,
    TrendingUp,
    Truck,
    Shield,
    Users,
    FileText,
    Percent,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { brands, categories } from '../data/products';
import './BulkOrder.css';

// Web3Forms API Key
const WEB3FORMS_ACCESS_KEY = 'c8572849-db61-4485-be8b-0c9eb45913c4';

interface BulkOrderFormData {
    // Business Details
    companyName: string;
    gstin: string;
    businessType: string;
    annualVolume: string;
    // Contact Details
    contactPerson: string;
    designation: string;
    email: string;
    phone: string;
    alternatePhone: string;
    // Address
    address: string;
    city: string;
    state: string;
    pincode: string;
    // Requirements
    preferredBrand: string;
    productCategories: string[];
    estimatedVolume: string;
    frequency: string;
    // Additional
    specialRequirements: string;
    howDidYouHear: string;
}

const BulkOrder = () => {
    const [formData, setFormData] = useState<BulkOrderFormData>({
        companyName: '',
        gstin: '',
        businessType: '',
        annualVolume: '',
        contactPerson: '',
        designation: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        preferredBrand: '',
        productCategories: [],
        estimatedVolume: '',
        frequency: '',
        specialRequirements: '',
        howDidYouHear: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            productCategories: prev.productCategories.includes(categoryId)
                ? prev.productCategories.filter(id => id !== categoryId)
                : [...prev.productCategories, categoryId]
        }));
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
                    from_name: 'Homelia Bulk Order',
                    subject: `🔥 Bulk Order Inquiry - ${formData.companyName} (${formData.businessType})`,
                    // Business Info
                    company_name: formData.companyName,
                    gstin: formData.gstin || 'Not provided',
                    business_type: formData.businessType,
                    annual_volume: formData.annualVolume || 'Not specified',
                    // Contact
                    contact_person: formData.contactPerson,
                    designation: formData.designation || 'Not specified',
                    email: formData.email,
                    phone: formData.phone,
                    alternate_phone: formData.alternatePhone || 'Not provided',
                    // Address
                    address: formData.address || 'Not provided',
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode || 'Not provided',
                    // Requirements
                    preferred_brand: formData.preferredBrand || 'No preference',
                    product_categories: formData.productCategories.join(', ') || 'Not specified',
                    estimated_volume: formData.estimatedVolume || 'To be discussed',
                    order_frequency: formData.frequency || 'Not specified',
                    // Additional
                    special_requirements: formData.specialRequirements || 'None',
                    how_did_you_hear: formData.howDidYouHear || 'Not specified',
                    // Settings
                    botcheck: false,
                    replyto: formData.email
                })
            });

            const result = await response.json();

            if (result.success) {
                const newRefId = `BULK-${Date.now().toString().slice(-8)}`;
                setReferenceId(newRefId);
                setSubmitted(true);
            } else {
                throw new Error(result.message || 'Failed to submit inquiry');
            }
        } catch (err) {
            console.error('Bulk order submission error:', err);
            setError('Failed to submit your inquiry. Please try again or contact us directly.');
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bulk-success-page">
                <div className="container">
                    <div className="success-card card">
                        <div className="success-icon">
                            <CheckCircle2 size={64} />
                        </div>
                        <h1>Bulk Order Inquiry Received!</h1>
                        <p>Thank you for your interest in bulk ordering. Our dedicated B2B team will analyze your requirements and contact you within 24-48 hours with a customized proposal.</p>
                        <div className="success-details">
                            <div className="detail-item">
                                <span>Reference ID:</span>
                                <strong>{referenceId}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Expected Response:</span>
                                <strong>24-48 business hours</strong>
                            </div>
                            <div className="detail-item">
                                <span>What's Next:</span>
                                <strong>Personalized quote + Account Manager assigned</strong>
                            </div>
                        </div>
                        <div className="success-actions">
                            <Link to="/" className="btn btn-primary">Return to Home</Link>
                            <Link to="/catalog" className="btn btn-outline">Browse Products</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bulk-order-page">
            {/* Hero Section */}
            <section className="bulk-hero">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <span>Bulk Orders</span>
                    </div>
                    <div className="hero-content">
                        <h1><span className="text-accent">Bulk Orders & B2B Partnerships</span></h1>
                        <p>Special pricing for architects, interior designers, contractors, and dealers. Get volume discounts on premium laminates.</p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bulk-benefits">
                <div className="container">
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <Percent size={28} />
                            </div>
                            <h3>Competitive Pricing</h3>
                            <p>Special bulk rates tailored to your order volume. Request a quote for the best prices.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <Truck size={28} />
                            </div>
                            <h3>Pan-India Delivery</h3>
                            <p>Free shipping on orders above ₹50,000. Reliable logistics partners for safe delivery.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <Users size={28} />
                            </div>
                            <h3>Dedicated Support</h3>
                            <p>Personal account manager for all your queries. Priority customer support.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <Shield size={28} />
                            </div>
                            <h3>GST Compliant</h3>
                            <p>Proper tax invoicing with GST compliance. Easy input tax credit for your business.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Form Section */}
            <section className="bulk-form-section">
                <div className="container">
                    <div className="bulk-layout">
                        {/* Form */}
                        <div className="form-container card">
                            <form onSubmit={handleSubmit} className="bulk-form">
                                <div className="form-header">
                                    <h2>Bulk Order Inquiry</h2>
                                    <p>Fill in your details and we'll create a customized proposal for you</p>
                                </div>

                                {error && (
                                    <div className="form-error">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Business Details */}
                                <div className="form-section">
                                    <h3><Building2 size={18} /> Business Information</h3>
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label className="input-label">Company / Firm Name *</label>
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
                                            <label className="input-label">GSTIN</label>
                                            <input
                                                type="text"
                                                name="gstin"
                                                className="input"
                                                placeholder="e.g., 27AABCU9603R1ZM"
                                                value={formData.gstin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Business Type *</label>
                                            <select
                                                name="businessType"
                                                className="input select"
                                                value={formData.businessType}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select business type</option>
                                                <option value="interior-designer">Interior Designer</option>
                                                <option value="architect">Architect</option>
                                                <option value="contractor">Contractor / Builder</option>
                                                <option value="dealer">Dealer / Distributor</option>
                                                <option value="furniture-manufacturer">Furniture Manufacturer</option>
                                                <option value="modular-kitchen">Modular Kitchen Company</option>
                                                <option value="corporate">Corporate / Office Fitouts</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Annual Laminate Volume</label>
                                            <select
                                                name="annualVolume"
                                                className="input select"
                                                value={formData.annualVolume}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select annual volume</option>
                                                <option value="100-500">100 - 500 sheets</option>
                                                <option value="500-1000">500 - 1,000 sheets</option>
                                                <option value="1000-5000">1,000 - 5,000 sheets</option>
                                                <option value="5000+">5,000+ sheets</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="form-section">
                                    <h3><User size={18} /> Contact Person</h3>
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label className="input-label">Name *</label>
                                            <input
                                                type="text"
                                                name="contactPerson"
                                                className="input"
                                                placeholder="Your full name"
                                                value={formData.contactPerson}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Designation</label>
                                            <input
                                                type="text"
                                                name="designation"
                                                className="input"
                                                placeholder="e.g., Owner, Purchase Manager"
                                                value={formData.designation}
                                                onChange={handleChange}
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
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="form-section">
                                    <h3><MapPin size={18} /> Business Address</h3>
                                    <div className="form-grid">
                                        <div className="input-group full-width">
                                            <label className="input-label">Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                className="input"
                                                placeholder="Street address, Building name"
                                                value={formData.address}
                                                onChange={handleChange}
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
                                        <div className="input-group">
                                            <label className="input-label">State *</label>
                                            <select
                                                name="state"
                                                className="input select"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select state</option>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Bihar">Bihar</option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Haryana">Haryana</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Kerala">Kerala</option>
                                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                <option value="West Bengal">West Bengal</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                className="input"
                                                placeholder="400001"
                                                value={formData.pincode}
                                                onChange={handleChange}
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
                                                name="preferredBrand"
                                                className="input select"
                                                value={formData.preferredBrand}
                                                onChange={handleChange}
                                            >
                                                <option value="">No preference</option>
                                                <option value="durian">Durian Laminates</option>
                                                <option value="rockstar">Rockstar Laminates</option>
                                                <option value="both">Both Brands</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Order Frequency</label>
                                            <select
                                                name="frequency"
                                                className="input select"
                                                value={formData.frequency}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select frequency</option>
                                                <option value="one-time">One-time order</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="project-based">Project-based</option>
                                            </select>
                                        </div>
                                        <div className="input-group full-width">
                                            <label className="input-label">Product Categories of Interest</label>
                                            <div className="checkbox-grid">
                                                {categories.map(cat => (
                                                    <label key={cat.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.productCategories.includes(cat.id)}
                                                            onChange={() => handleCategoryChange(cat.id)}
                                                        />
                                                        <span>{cat.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Estimated Volume (sheets per order)</label>
                                            <input
                                                type="text"
                                                name="estimatedVolume"
                                                className="input"
                                                placeholder="e.g., 200"
                                                value={formData.estimatedVolume}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="form-section">
                                    <h3><FileText size={18} /> Additional Information</h3>
                                    <div className="form-grid">
                                        <div className="input-group full-width">
                                            <label className="input-label">Special Requirements or Notes</label>
                                            <textarea
                                                name="specialRequirements"
                                                className="input textarea"
                                                placeholder="Any specific requirements, preferred finishes, custom sizes, credit terms needed, etc."
                                                value={formData.specialRequirements}
                                                onChange={handleChange}
                                                rows={4}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">How did you hear about us?</label>
                                            <select
                                                name="howDidYouHear"
                                                className="input select"
                                                value={formData.howDidYouHear}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select option</option>
                                                <option value="google">Google Search</option>
                                                <option value="referral">Referral</option>
                                                <option value="social-media">Social Media</option>
                                                <option value="trade-fair">Trade Fair / Exhibition</option>
                                                <option value="existing-customer">Existing Customer</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg submit-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit Bulk Order Inquiry
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <aside className="bulk-sidebar">
                            <div className="sidebar-card card">
                                <h3>Why Order in Bulk?</h3>
                                <div className="bulk-benefits-list">
                                    <div className="bulk-benefit-item">
                                        <CheckCircle2 size={16} />
                                        <span>Best-in-market wholesale prices</span>
                                    </div>
                                    <div className="bulk-benefit-item">
                                        <CheckCircle2 size={16} />
                                        <span>Prices tailored to your volume</span>
                                    </div>
                                    <div className="bulk-benefit-item">
                                        <CheckCircle2 size={16} />
                                        <span>Flexible payment terms available</span>
                                    </div>
                                    <div className="bulk-benefit-item">
                                        <CheckCircle2 size={16} />
                                        <span>Priority stock availability</span>
                                    </div>
                                    <div className="bulk-benefit-item">
                                        <CheckCircle2 size={16} />
                                        <span>Dedicated account manager</span>
                                    </div>
                                </div>
                                <p className="tier-note">Contact us for a personalized quote based on your requirements</p>
                            </div>

                            <div className="sidebar-card card">
                                <h3>Our Brands</h3>
                                <div className="brand-list">
                                    {brands.map(brand => (
                                        <Link
                                            key={brand.id}
                                            to={`/brands/${brand.id}`}
                                            className="brand-item"
                                        >
                                            <div className="brand-logo-small" style={{ background: '#0a0a0a' }}>
                                                <img src={brand.logo} alt={brand.name} />
                                            </div>
                                            <div className="brand-info">
                                                <strong>{brand.name}</strong>
                                                <span>{brand.tagline}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="sidebar-card card">
                                <h3>Contact Sales Team</h3>
                                <div className="contact-info">
                                    <a href="tel:+919835268202" className="contact-item">
                                        <Phone size={18} />
                                        <span>+91 98352 68202</span>
                                    </a>
                                    <a href="mailto:prabhatkumarbxr@gmail.com" className="contact-item">
                                        <Mail size={18} />
                                        <span>prabhatkumarbxr@gmail.com</span>
                                    </a>
                                    <div className="contact-item">
                                        <MapPin size={18} />
                                        <span>Near RPS More, Patna, Bihar</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-card card highlight">
                                <TrendingUp size={24} />
                                <h3>Become a Dealer</h3>
                                <p>Interested in becoming an authorized dealer? We offer exclusive territories and attractive margins.</p>
                                <Link to="/contact" className="btn btn-outline btn-sm">
                                    Learn More
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BulkOrder;
