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
    Building2
} from 'lucide-react';
import { productsApi } from '../api';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getBestsellerProducts, categories, brands, Product } from '../data/products';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>(getFeaturedProducts().slice(0, 3));
    const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>(getBestsellerProducts().slice(0, 3));

    // Fetch products from API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch featured products
                const featuredRes = await productsApi.getFeatured();
                if (featuredRes.success && Array.isArray(featuredRes.data) && featuredRes.data.length > 0) {
                    setFeaturedProducts(featuredRes.data.slice(0, 3) as Product[]);
                }

                // Fetch bestsellers
                const bestsellersRes = await productsApi.getBestsellers();
                if (bestsellersRes.success && Array.isArray(bestsellersRes.data) && bestsellersRes.data.length > 0) {
                    setBestsellerProducts(bestsellersRes.data.slice(0, 3) as Product[]);
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
                </div>
                <div className="container">
                    <div className="hero-content animate-fade-in-up">
                        <div className="hero-text">
                            <div className="hero-badge">
                                <span>Authorized Distributor</span>
                            </div>
                            <h1 className="hero-title">
                                Crafted for <br />
                                <span className="text-gradient">Quiet Living</span>
                            </h1>
                            <p className="hero-subtitle">
                                Premium laminates that bring warmth, texture, and timeless elegance to spaces designed for life.
                            </p>
                            <div className="hero-ctas">
                                <Link to="/catalog" className="btn btn-primary btn-lg">
                                    Explore Collection
                                </Link>
                                <Link to="/sample-order" className="btn btn-outline btn-lg">
                                    Request Samples
                                </Link>
                            </div>
                            <div className="hero-stats">
                                <div className="hero-stat">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">Designs</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="hero-stat">
                                    <span className="stat-number">2</span>
                                    <span className="stat-label">Premium Brands</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="hero-stat">
                                    <span className="stat-number">1000+</span>
                                    <span className="stat-label">Projects</span>
                                </div>
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
                            <div className="divider-accent"></div>
                            <h2>The Art of Considered Design</h2>
                            <p className="philosophy-text">
                                Every surface tells a story. The grain of wood, the warmth of stone, the subtlety of texture—these are the elements that transform a house into a home.
                            </p>
                            <p className="philosophy-text">
                                At Homelia, we curate laminates that honor craftsmanship and endure time. Our collection speaks to those who value quality, appreciate restraint, and understand that true luxury lies in the details.
                            </p>
                        </div>
                        <div className="philosophy-visual">
                            <img
                                src="/design-art.png"
                                alt="The Art of Considered Design"
                                className="philosophy-image"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mood Browsing Section */}
            <section className="mood-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Explore by Mood</h2>
                        <p>Find the atmosphere that resonates with your vision</p>
                    </div>
                    <div className="mood-grid">
                        <Link to="/catalog?mood=calm" className="mood-card">
                            <div className="mood-image-container">
                                <img src="/mood-collage.png" alt="Calm & Minimal" className="mood-img mood-img-1" />
                            </div>
                            <div className="mood-content">
                                <span className="mood-icon">○</span>
                                <h3>Calm & Minimal</h3>
                                <p>Soft tones for peaceful spaces</p>
                            </div>
                        </Link>
                        <Link to="/catalog?mood=bold" className="mood-card">
                            <div className="mood-image-container">
                                <img src="/mood-collage.png" alt="Bold & Expressive" className="mood-img mood-img-2" />
                            </div>
                            <div className="mood-content">
                                <span className="mood-icon">◆</span>
                                <h3>Bold & Expressive</h3>
                                <p>Statement pieces that endure</p>
                            </div>
                        </Link>
                        <Link to="/catalog?mood=warm" className="mood-card">
                            <div className="mood-image-container">
                                <img src="/mood-collage.png" alt="Warm & Inviting" className="mood-img mood-img-3" />
                            </div>
                            <div className="mood-content">
                                <span className="mood-icon">◐</span>
                                <h3>Warm & Inviting</h3>
                                <p>Natural warmth for living</p>
                            </div>
                        </Link>
                        <Link to="/catalog?mood=elegant" className="mood-card">
                            <div className="mood-image-container">
                                <img src="/mood-collage.png" alt="Modern Elegance" className="mood-img mood-img-4" />
                            </div>
                            <div className="mood-content">
                                <span className="mood-icon">◇</span>
                                <h3>Modern Elegance</h3>
                                <p>Refined sophistication</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Brands Section */}
            <section className="brands-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Our Partners</h2>
                        <p>Authorized distributor of India's finest laminate houses</p>
                    </div>
                    <div className="brands-grid">
                        {brands.map((brand) => (
                            <Link to={`/brands/${brand.id}`} key={brand.id} className="brand-card">
                                <div className="brand-logo">
                                    <img
                                        src={brand.logo}
                                        alt={`${brand.name} Logo`}
                                        className="brand-logo-img"
                                    />
                                </div>
                                <div className="brand-info">
                                    <h3>{brand.name}</h3>
                                    <p>{brand.tagline}</p>
                                    <div className="brand-collections">
                                        {brand.collections.slice(0, 3).map((collection, idx) => (
                                            <span key={idx} className="badge badge-outline">{collection}</span>
                                        ))}
                                    </div>
                                    <span className="brand-cta">
                                        View Collection <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>By Application</h2>
                        <p>Find the perfect laminate for your project</p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                to={`/catalog?category=${category.id}`}
                                key={category.id}
                                className="category-card"
                            >
                                <div className="category-icon">
                                    <Palette size={24} />
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                    <span className="category-count">{category.count} Products</span>
                                </div>
                                <ArrowRight size={18} className="category-arrow" />
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
                            <h2>Curated Selection</h2>
                            <p>Handpicked designs from our collection</p>
                        </div>
                        <Link to="/catalog?featured=true" className="btn btn-outline">
                            View All <ArrowRight size={14} />
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
                        <div className="quick-action-card">
                            <div className="quick-action-icon">
                                <Package size={28} />
                            </div>
                            <h3>Bulk Orders</h3>
                            <p>Special pricing for architects, designers, and contractors working on large-scale projects.</p>
                            <Link to="/bulk-order" className="btn btn-primary">
                                Inquire Now
                            </Link>
                        </div>
                        <div className="quick-action-card">
                            <div className="quick-action-icon">
                                <FileText size={28} />
                            </div>
                            <h3>Request Quote</h3>
                            <p>Get customized pricing for your project requirements. Our team responds within 24 hours.</p>
                            <Link to="/request-quote" className="btn btn-primary">
                                Get Quote
                            </Link>
                        </div>
                        <div className="quick-action-card">
                            <div className="quick-action-icon">
                                <Palette size={28} />
                            </div>
                            <h3>Sample Swatches</h3>
                            <p>Experience the quality firsthand. Order sample swatches delivered to your doorstep.</p>
                            <Link to="/sample-order" className="btn btn-primary">
                                Order Samples
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-us-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Why Homelia</h2>
                        <p>Your trusted partner for premium surfaces</p>
                    </div>
                    <div className="why-us-grid">
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3>Authorized Partner</h3>
                            <p>Official distributor with manufacturer warranty and genuine products.</p>
                        </div>
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <TrendingUp size={24} />
                            </div>
                            <h3>Competitive Pricing</h3>
                            <p>Best-in-market rates for bulk orders with special dealer pricing.</p>
                        </div>
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Users size={24} />
                            </div>
                            <h3>Expert Support</h3>
                            <p>Dedicated account managers and technical guidance for your projects.</p>
                        </div>
                        <div className="why-us-card">
                            <div className="why-us-icon">
                                <Building2 size={24} />
                            </div>
                            <h3>GST Compliant</h3>
                            <p>Proper documentation with seamless B2B transactions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bestsellers */}
            <section className="products-section section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2>Most Loved</h2>
                            <p>Designs chosen by architects and designers</p>
                        </div>
                        <Link to="/catalog?bestseller=true" className="btn btn-outline">
                            View All <ArrowRight size={14} />
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
                        <h2>Client Stories</h2>
                        <p>Trusted by architects, designers, and businesses across India</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "The quality is exceptional. Their curated collection made our selection process effortless, and the bulk pricing is unmatched."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">RK</div>
                                <div className="author-info">
                                    <strong>Rajesh Kumar</strong>
                                    <span>Interior Designer, Mumbai</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Two years of consistent quality and service. The sample service is fantastic—clients love seeing the actual textures."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">PS</div>
                                <div className="author-info">
                                    <strong>Priya Sharma</strong>
                                    <span>Architect, Delhi</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Quick delivery and genuine products. The quote system saves considerable time on large commercial projects."
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
                            <h2>Begin Your Project</h2>
                            <p>Connect with our team for bulk orders, dealer pricing, or project consultations.</p>
                            <div className="cta-buttons">
                                <Link to="/request-quote" className="btn btn-accent btn-lg">
                                    Request Quote
                                </Link>
                                <Link to="/contact" className="btn btn-outline btn-lg">
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
