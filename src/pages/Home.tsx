import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Package,
    FileText,
    Palette,
    Star,
    CheckCircle2,
    TrendingUp,
    Users,
    Building2,
    Sparkles
} from 'lucide-react';
import { productsApi } from '../api';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getBestsellerProducts, categories, brands, Product } from '../data/products';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>(getFeaturedProducts().slice(0, 4));
    const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>(getBestsellerProducts().slice(0, 4));

    // Fetch products from API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch featured products
                const featuredRes = await productsApi.getFeatured();
                if (featuredRes.success && Array.isArray(featuredRes.data) && featuredRes.data.length > 0) {
                    setFeaturedProducts(featuredRes.data.slice(0, 4) as Product[]);
                }

                // Fetch bestsellers
                const bestsellersRes = await productsApi.getBestsellers();
                if (bestsellersRes.success && Array.isArray(bestsellersRes.data) && bestsellersRes.data.length > 0) {
                    setBestsellerProducts(bestsellersRes.data.slice(0, 4) as Product[]);
                }
            } catch (error) {
                console.log('Using mock product data (API not available)');
                // Keep using mock data (already set as initial state)
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                    <div className="hero-texture"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text animate-fade-in-up">
                            <div className="hero-badge shadow-glow">
                                <Sparkles size={16} />
                                <span>Authorized Distributor</span>
                            </div>
                            <h1 className="hero-title">
                                Design Spaces That <br />
                                <span className="text-gradient">Feel Like Home</span>
                            </h1>
                            <p className="hero-subtitle">
                                Design isn't just about how it looks, but how it feels. Explore premium laminates that bring warmth, character, and life to your interiors.
                            </p>
                            <div className="hero-ctas">
                                <Link to="/catalog" className="btn btn-primary btn-lg">
                                    <Palette size={20} />
                                    Explore Designs
                                </Link>
                                <Link to="/catalog?featured=true" className="btn btn-outline btn-lg">
                                    <Sparkles size={20} />
                                    Find Your Style
                                </Link>
                            </div>
                            <div className="hero-stats">
                                <div className="hero-stat">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">Timeless Designs</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="hero-stat">
                                    <span className="stat-number">2</span>
                                    <span className="stat-label">Premium Brands</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="hero-stat">
                                    <span className="stat-number">1000+</span>
                                    <span className="stat-label">Happy Homes</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="hero-card-stack animate-float">
                                <div className="hero-swatch swatch-1"></div>
                                <div className="hero-swatch swatch-2"></div>
                                <div className="hero-swatch swatch-3"></div>
                                <div className="hero-swatch swatch-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="philosophy-section section">
                <div className="container">
                    <div className="philosophy-grid">
                        <div className="philosophy-content">
                            <h2 className="section-title">Why Home Décor Matters</h2>
                            <div className="divider-accent"></div>
                            <p className="philosophy-text">
                                Your home is more than just a place to live—it's a reflection of who you are. The textures you touch, the colors that surround you, and the spaces you inhabit shape your daily mood.
                            </p>
                            <p className="philosophy-text">
                                At Homelia, we believe that good décor brings comfort, belonging, and intention to your life. We're here to help you craft spaces that tell your story.
                            </p>
                        </div>
                        <div className="philosophy-visual">
                            <div className="mood-collage">
                                <div className="collage-item item-1 bg-gradient-warm card-elevated"></div>
                                <div className="collage-item item-2 bg-gradient-calm card-elevated"></div>
                                <div className="collage-item item-3 bg-gradient-elegant card-elevated"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mood Browsing Section */}
            <section className="mood-section section bg-gradient-hero">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Shop by Mood</h2>
                        <p>Find the perfect atmosphere for your space</p>
                    </div>
                    <div className="mood-grid">
                        <Link to="/catalog?mood=calm" className="mood-card card card-elevated" style={{ background: 'var(--gradient-calm)' }}>
                            <div className="mood-content">
                                <span className="mood-icon">🕊️</span>
                                <h3>Calm & Minimal</h3>
                                <p>Soft tones for peaceful minds</p>
                            </div>
                            <div className="mood-overlay"></div>
                        </Link>
                        <Link to="/catalog?mood=bold" className="mood-card card card-elevated" style={{ background: 'var(--gradient-bold)', color: 'white' }}>
                            <div className="mood-content">
                                <span className="mood-icon">🎨</span>
                                <h3>Bold & Expressive</h3>
                                <p>Make a statement that lasts</p>
                            </div>
                            <div className="mood-overlay"></div>
                        </Link>
                        <Link to="/catalog?mood=warm" className="mood-card card card-elevated" style={{ background: 'var(--gradient-warm)' }}>
                            <div className="mood-content">
                                <span className="mood-icon">🔥</span>
                                <h3>Warm & Cozy</h3>
                                <p>Embrace the comfort of home</p>
                            </div>
                            <div className="mood-overlay"></div>
                        </Link>
                        <Link to="/catalog?mood=elegant" className="mood-card card card-elevated" style={{ background: 'var(--gradient-elegant)' }}>
                            <div className="mood-content">
                                <span className="mood-icon">✨</span>
                                <h3>Modern Elegance</h3>
                                <p>Sophisticated and timeless</p>
                            </div>
                            <div className="mood-overlay"></div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Brands Section */}
            <section className="brands-section section">
                <div className="container">
                    <div className="section-header">
                        <h2>Official Brand Partner</h2>
                        <p>Authorized distributor of India's leading laminate brands</p>
                    </div>
                    <div className="brands-grid">
                        {brands.map((brand) => (
                            <Link to={`/brands/${brand.id}`} key={brand.id} className="brand-card card card-elevated">
                                <div className="brand-logo" style={{ background: `${brand.color}15` }}>
                                    <div className="brand-logo-text" style={{ color: brand.color }}>
                                        {brand.name.split(' ')[0]}
                                    </div>
                                </div>
                                <div className="brand-info">
                                    <h3>{brand.name}</h3>
                                    <p>{brand.tagline}</p>
                                    <div className="brand-collections">
                                        {brand.collections.slice(0, 3).map((collection, idx) => (
                                            <span key={idx} className="badge badge-outline">{collection}</span>
                                        ))}
                                        {brand.collections.length > 3 && (
                                            <span className="badge badge-outline">+{brand.collections.length - 3} more</span>
                                        )}
                                    </div>
                                    <span className="brand-cta">
                                        Explore Collection <ArrowRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section section bg-gradient-hero">
                <div className="container">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Find the perfect laminate for your application</p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                to={`/catalog?category=${category.id}`}
                                key={category.id}
                                className="category-card"
                            >
                                <div className="category-icon">
                                    <Palette size={28} />
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                    <span className="category-count">{category.count} Products</span>
                                </div>
                                <ArrowRight size={20} className="category-arrow" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="products-section section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2>Featured Products</h2>
                            <p>Handpicked designs from our premium collection</p>
                        </div>
                        <Link to="/catalog?featured=true" className="btn btn-outline">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="products-grid">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions section">
                <div className="container">
                    <div className="quick-actions-grid">
                        <div className="quick-action-card card card-glass">
                            <div className="quick-action-icon bg-gradient-primary">
                                <Package size={32} />
                            </div>
                            <h3>Bulk Orders</h3>
                            <p>Special pricing for bulk purchases. Dealer rates available for registered businesses.</p>
                            <Link to="/bulk-order" className="btn btn-primary">
                                Order in Bulk <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="quick-action-card card card-glass">
                            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)' }}>
                                <FileText size={32} />
                            </div>
                            <h3>Request Quote</h3>
                            <p>Get customized quotes for your project requirements. Quick response guaranteed.</p>
                            <Link to="/request-quote" className="btn btn-accent">
                                Get Quote <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="quick-action-card card card-glass">
                            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)' }}>
                                <Palette size={32} />
                            </div>
                            <h3>Order Samples</h3>
                            <p>Experience the quality firsthand. Order sample swatches before your purchase.</p>
                            <Link to="/sample-order" className="btn btn-secondary">
                                Get Samples <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-us-section section bg-gradient-hero">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Why Choose Homelia</h2>
                        <p>Your trusted partner for premium laminates</p>
                    </div>
                    <div className="why-us-grid">
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <CheckCircle2 size={28} />
                            </div>
                            <h3>Authorized Distributor</h3>
                            <p>Official partner of Durian & Rockstar with 100% genuine products and manufacturer warranty.</p>
                        </div>
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <TrendingUp size={28} />
                            </div>
                            <h3>Competitive Pricing</h3>
                            <p>Best-in-market rates for bulk orders. Special dealer pricing for registered businesses.</p>
                        </div>
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Users size={28} />
                            </div>
                            <h3>Expert Support</h3>
                            <p>Dedicated account managers for bulk buyers. Technical support for product selection.</p>
                        </div>
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Building2 size={28} />
                            </div>
                            <h3>GST Compliant</h3>
                            <p>Proper tax invoices with GST breakdown. Seamless B2B transactions and documentation.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bestsellers */}
            <section className="products-section section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2>Bestsellers</h2>
                            <p>Most loved designs by our customers</p>
                        </div>
                        <Link to="/catalog?bestseller=true" className="btn btn-outline">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="products-grid">
                        {bestsellerProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>What Our Clients Say</h2>
                        <p>Trusted by architects, designers, and businesses across India</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill="#D4A854" color="#D4A854" />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Excellent quality laminates and very professional service. Their bulk pricing is unbeatable and the GST invoicing is seamless."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">RK</div>
                                <div className="author-info">
                                    <strong>Rajesh Kumar</strong>
                                    <span>Interior Designer, Mumbai</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill="#D4A854" color="#D4A854" />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Been sourcing from Homelia for 2 years now. Consistent quality, great variety, and the sample service is fantastic."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">PS</div>
                                <div className="author-info">
                                    <strong>Priya Sharma</strong>
                                    <span>Architect, Delhi</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill="#D4A854" color="#D4A854" />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Quick delivery, genuine products, and great customer support. The RFQ system saves us so much time on large projects."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">AM</div>
                                <div className="author-info">
                                    <strong>Amit Mehta</strong>
                                    <span>Contractor, Bangalore</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Ready to Transform Your Space?</h2>
                            <p>Get in touch for bulk orders, dealer pricing, or project consultations. Our team is here to help.</p>
                            <div className="cta-buttons">
                                <Link to="/request-quote" className="btn btn-accent btn-lg">
                                    Request Quote
                                </Link>
                                <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
