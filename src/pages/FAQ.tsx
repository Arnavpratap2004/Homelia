import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Search, HelpCircle } from 'lucide-react';
import './FAQ.css';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQ = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', label: 'All Questions' },
        { id: 'orders', label: 'Orders & Delivery' },
        { id: 'products', label: 'Products' },
        { id: 'payments', label: 'Payments & GST' },
        { id: 'bulk', label: 'Bulk Orders' },
        { id: 'samples', label: 'Samples' },
    ];

    const faqs: FAQItem[] = [
        {
            category: 'orders',
            question: 'What is the minimum order quantity (MOQ)?',
            answer: 'The MOQ varies by product but is typically 10-20 sheets per design. For bulk orders above 100 sheets, we offer special pricing. Check each product page for specific MOQ requirements.'
        },
        {
            category: 'orders',
            question: 'How long does delivery take?',
            answer: 'Standard delivery takes 5-7 business days for most locations across India. Metro cities may receive orders faster (3-5 days). For urgent requirements, please contact our sales team for express shipping options.'
        },
        {
            category: 'orders',
            question: 'Do you deliver across India?',
            answer: 'Yes, we deliver to all major cities and towns across India. Shipping charges are calculated based on your location and order weight. Orders above ₹50,000 qualify for free shipping.'
        },
        {
            category: 'orders',
            question: 'Can I track my order?',
            answer: 'Yes, once your order is shipped, you will receive an email and SMS with tracking details. You can also track your order from your dashboard in the "My Orders" section.'
        },
        {
            category: 'products',
            question: 'What laminate brands do you offer?',
            answer: 'We are authorized distributors of Durian Laminates and Rockstar Laminates. Both brands offer a wide range of decorative, compact, exterior, fire-retardant, and anti-bacterial laminates.'
        },
        {
            category: 'products',
            question: 'What are the standard laminate sizes?',
            answer: 'Standard sheets come in 8x4 feet (2440x1220 mm). Thickness options include 0.8mm, 1mm, 1.25mm, and thicker options for compact laminates. Some specialty products may have different dimensions.'
        },
        {
            category: 'products',
            question: 'How do I choose the right laminate finish?',
            answer: 'We offer various finishes: Matte (for subtle elegance), Gloss (for high shine), Textured (for natural feel), and Suede (for smooth touch). Consider your application - glossy works well for vertical surfaces while matte or textured is better for horizontal surfaces that may show fingerprints.'
        },
        {
            category: 'products',
            question: 'Are the laminates heat and scratch resistant?',
            answer: 'Our laminates are designed for durability. They offer good heat resistance (up to 180°C for short exposure), scratch resistance, and are easy to maintain. For high-traffic commercial areas, we recommend compact or high-pressure laminates.'
        },
        {
            category: 'payments',
            question: 'What payment methods do you accept?',
            answer: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, MasterCard, Rupay), net banking, and bank transfers (RTGS/NEFT). For B2B orders, we also offer credit terms for verified businesses.'
        },
        {
            category: 'payments',
            question: 'Do you provide GST invoices?',
            answer: 'Yes, we provide GST-compliant invoices for all orders. If you need a tax invoice with your GSTIN for input credit, please provide your GST details during checkout. The invoice will be sent to your email within 24 hours of order confirmation.'
        },
        {
            category: 'payments',
            question: 'What is the HSN code for laminates?',
            answer: 'The HSN code for decorative laminates is 4811. This is pre-filled on all our GST invoices. The applicable GST rate is 18%.'
        },
        {
            category: 'bulk',
            question: 'How do I request a bulk quote?',
            answer: 'You can request a bulk quote by visiting our "Request Quote" page and filling out your requirements. Our sales team will respond within 24 hours with a customized quote including volume discounts.'
        },
        {
            category: 'bulk',
            question: 'Do you offer volume discounts?',
            answer: 'Yes, we offer tiered pricing for bulk orders. Discounts typically start from 50+ sheets and increase with larger quantities. For project-specific requirements, contact our sales team for the best rates.'
        },
        {
            category: 'bulk',
            question: 'Can you handle large project requirements?',
            answer: 'Absolutely! We regularly supply to architects, interior designers, contractors, and furniture manufacturers for large projects. We can coordinate deliveries, provide technical support, and offer project-specific pricing.'
        },
        {
            category: 'samples',
            question: 'Can I order samples before buying?',
            answer: 'Yes, you can order up to 10 samples per order. Sample ordering costs just ₹99 (shipping) and is fully credited towards your first purchase above ₹10,000.'
        },
        {
            category: 'samples',
            question: 'How big are the sample pieces?',
            answer: 'Our samples are A4 size (approximately 21x30 cm), large enough to evaluate the color, texture, and finish properly. Each sample is labeled with the product code for easy reordering.'
        },
        {
            category: 'samples',
            question: 'How long does sample delivery take?',
            answer: 'Samples are typically delivered within 2-3 business days via courier. You will receive tracking information once shipped.'
        },
    ];

    const toggleItem = (index: number) => {
        setOpenItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = !searchQuery ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="faq-page">
            {/* Header */}
            <div className="faq-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <span>FAQ</span>
                    </div>
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about our products, orders, and services.</p>

                    <div className="faq-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="faq-layout">
                    {/* Categories */}
                    <aside className="faq-categories">
                        <h3>Categories</h3>
                        <div className="category-list">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* FAQ List */}
                    <div className="faq-list">
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq, index) => (
                                <div
                                    key={index}
                                    className={`faq-item card ${openItems.includes(index) ? 'open' : ''}`}
                                >
                                    <button
                                        className="faq-question"
                                        onClick={() => toggleItem(index)}
                                    >
                                        <HelpCircle size={20} />
                                        <span>{faq.question}</span>
                                        <ChevronDown size={20} className="chevron" />
                                    </button>
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results card">
                                <HelpCircle size={40} />
                                <h3>No matching questions found</h3>
                                <p>Try adjusting your search or selecting a different category.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="faq-cta card">
                    <div className="cta-content">
                        <h2>Still have questions?</h2>
                        <p>Can't find the answer you're looking for? Our team is here to help.</p>
                    </div>
                    <div className="cta-actions">
                        <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                        <a href="tel:+919876543210" className="btn btn-outline">Call: +91 98765 43210</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
