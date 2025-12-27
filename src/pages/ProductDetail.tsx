import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Minus,
    Plus,
    ShoppingCart,
    FileText,
    Palette,
    Download,
    Check,
    Heart,
    Truck,
    Shield,
    Package,
    ChevronRight,
    Sparkles,
    Maximize2,
    Layers,
    Droplets
} from 'lucide-react';
import { getProductById, formatPricePerSheet, products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Scroll to top when ID changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const product = getProductById(id || '');
    const [quantity, setQuantity] = useState(product?.moq || 10);
    const [selectedColor, setSelectedColor] = useState(0);
    const [activeTab, setActiveTab] = useState('specs');
    const [addedToCart, setAddedToCart] = useState(false);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    if (!product) {
        return (
            <div className="product-not-found">
                <div className="container">
                    <h1>Product Not Found</h1>
                    <p>The product you're looking for doesn't exist.</p>
                    <Link to="/catalog" className="btn btn-primary">
                        Browse Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price || 0,
            quantity: quantity,
            color: product.colors[selectedColor],
            sku: product.sku
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
    };

    const relatedProducts = products
        .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
        .slice(0, 4);

    const incrementQuantity = () => setQuantity(q => q + 1);
    const decrementQuantity = () => setQuantity(q => Math.max(product.moq, q - 1));

    // Calculate dynamic background color for hero mood
    const heroMoodColor = product.colors[selectedColor] || '#f3f4f6';

    return (
        <div className="product-detail-page">
            {/* Ambient Background */}
            <div className="ambient-hero-bg" style={{
                background: `radial-gradient(circle at 70% 30%, ${heroMoodColor}20 0%, transparent 60%)`
            }}></div>

            {/* Breadcrumb */}
            <div className="product-breadcrumb">
                <div className="container">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/catalog">Catalog</Link>
                    <ChevronRight size={14} />
                    <Link to={`/catalog?brand=${product.brand}`}>
                        {product.brand === 'durian' ? 'Durian' : 'Rockstar'}
                    </Link>
                    <ChevronRight size={14} />
                    <span>{product.name}</span>
                </div>
            </div>

            {/* Immersive Hero Section */}
            <section className="product-hero section">
                <div className="container">
                    <div className="product-grid">
                        {/* Interactive Gallery */}
                        <div className="product-gallery">
                            <div
                                className="main-image-frame"
                                style={{ boxShadow: `0 20px 40px -10px ${heroMoodColor}40` }}
                            >
                                <div
                                    className="main-image-texture"
                                    style={{ background: product.colors[selectedColor] }}
                                >
                                    <div className="texture-overlay"></div>

                                    <div className="image-badges">
                                        {product.bestseller && (
                                            <span className="badge badge-accent">
                                                <Sparkles size={12} fill="currentColor" />
                                                Bestseller
                                            </span>
                                        )}
                                        {product.featured && (
                                            <span className="badge badge-primary">Featured Collection</span>
                                        )}
                                    </div>

                                    <button className="expand-btn">
                                        <Maximize2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="gallery-thumbnails">
                                {product.colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        className={`thumbnail-btn ${selectedColor === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedColor(idx)}
                                    >
                                        <div
                                            className="thumbnail-color"
                                            style={{ background: color }}
                                        ></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Narrative */}
                        <div className="product-narrative">
                            <div className="narrative-header">
                                <div className="brand-pill" style={{
                                    color: product.brand === 'durian' ? '#2563EB' : '#DC2626',
                                    background: product.brand === 'durian' ? '#EFF6FF' : '#FEF2F2',
                                    borderColor: product.brand === 'durian' ? '#BFDBFE' : '#FECACA'
                                }}>
                                    {product.brand === 'durian' ? 'Durian Laminates' : 'Rockstar Surfaces'}
                                </div>
                                <h1 className="product-title">{product.name}</h1>
                                <div className="product-subtitle">
                                    <span className="finish-name">{product.texture} Finish</span>
                                    <span className="separator">•</span>
                                    <span className="sku-code">SKU: {product.sku}</span>
                                </div>
                            </div>

                            <div className="product-story">
                                <p className="story-text">{product.description}</p>

                                {product.emotionTags && (
                                    <div className="emotion-chips">
                                        {product.emotionTags.map(tag => (
                                            <span key={tag} className="emotion-chip">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="product-highlights">
                                <div className="highlight-item">
                                    <div className="highlight-icon">
                                        <Layers size={20} />
                                    </div>
                                    <div className="highlight-text">
                                        <span className="label">Thickness</span>
                                        <span className="value">{product.thickness}</span>
                                    </div>
                                </div>
                                <div className="highlight-item">
                                    <div className="highlight-icon">
                                        <Maximize2 size={20} />
                                    </div>
                                    <div className="highlight-text">
                                        <span className="label">Size</span>
                                        <span className="value">{product.sheetSize} ft</span>
                                    </div>
                                </div>
                                <div className="highlight-item">
                                    <div className="highlight-icon">
                                        <Droplets size={20} />
                                    </div>
                                    <div className="highlight-text">
                                        <span className="label">Finish</span>
                                        <span className="value capitalize">{product.finish}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="purchase-action-card">
                                <div className="price-row">
                                    <div className="price-info">
                                        <span className="current-price">{formatPricePerSheet(product.price)}</span>
                                        {product.price && <span className="price-sub">excl. GST</span>}
                                    </div>
                                    {!product.price && (
                                        <span className="contact-for-price">Contact for Bulk Pricing</span>
                                    )}
                                </div>

                                <div className="quantity-row">
                                    <div className="qty-selector">
                                        <button
                                            onClick={decrementQuantity}
                                            disabled={quantity <= product.moq}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="text"
                                            value={quantity}
                                            readOnly
                                        />
                                        <button onClick={incrementQuantity}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <span className="moq-label">Min. Order: {product.moq} sheets</span>
                                </div>

                                <div className="action-row">
                                    <button
                                        className={`btn-add-cart ${addedToCart ? 'added' : ''}`}
                                        onClick={handleAddToCart}
                                    >
                                        {addedToCart ? (
                                            <>
                                                <Check size={20} />
                                                <span>Added to Cart</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={20} />
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </button>
                                    <Link to="/request-quote" className="btn-quote">
                                        <FileText size={20} />
                                    </Link>
                                    <button className="btn-wishlist">
                                        <Heart size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="trust-badges-row">
                                <div className="badge-item">
                                    <Truck size={16} />
                                    <span>Pan-India Delivery</span>
                                </div>
                                <div className="badge-item">
                                    <Shield size={16} />
                                    <span>Genuine Product</span>
                                </div>
                                <div className="badge-item">
                                    <Package size={16} />
                                    <span>Bulk Discount Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* "Ideal For" Visualization Section */}
            {product.usageHints && product.usageHints.length > 0 && (
                <section className="ideal-for-section section">
                    <div className="container">
                        <div className="section-header centered">
                            <h2>Perfect For Your Space</h2>
                            <p>Bring your vision to life in these environments</p>
                        </div>
                        <div className="usage-grid">
                            {product.usageHints.map((hint, index) => (
                                <div key={index} className="usage-card">
                                    <div className="usage-icon-placeholder" style={{ background: `${heroMoodColor}20`, color: product.colors[0] }}>
                                        <Sparkles size={24} />
                                    </div>
                                    <h3>{hint}</h3>
                                    <p>Enhance your {hint.toLowerCase()} with the {product.emotionTags?.[0]?.toLowerCase() || 'premium'} feel of {product.name}.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Technical Tabs */}
            <section className="tech-specs-section section">
                <div className="container">
                    <div className="tabs-wrapper">
                        <div className="tabs-header">
                            <button
                                className={`tab-trigger ${activeTab === 'specs' ? 'active' : ''}`}
                                onClick={() => setActiveTab('specs')}
                            >
                                Technical Specifications
                            </button>
                            <button
                                className={`tab-trigger ${activeTab === 'downloads' ? 'active' : ''}`}
                                onClick={() => setActiveTab('downloads')}
                            >
                                Downloads & Docs
                            </button>
                            <button
                                className={`tab-trigger ${activeTab === 'applications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('applications')}
                            >
                                Applications
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'specs' && (
                                <div className="specs-grid">
                                    {Object.entries(product.technicalSpecs).map(([key, value]) => (
                                        <div key={key} className="spec-card">
                                            <span className="spec-key">{key}</span>
                                            <span className="spec-val">{value}</span>
                                        </div>
                                    ))}
                                    <div className="spec-card">
                                        <span className="spec-key">HSN Code</span>
                                        <span className="spec-val">{product.hsnCode}</span>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'downloads' && (
                                <div className="downloads-list">
                                    <a href="#" className="file-download-card">
                                        <div className="file-icon">
                                            <FileText size={24} />
                                        </div>
                                        <div className="file-info">
                                            <h4>Product Datasheet</h4>
                                            <span>PDF • 2.4 MB</span>
                                        </div>
                                        <Download size={20} className="download-action" />
                                    </a>
                                    <a href="#" className="file-download-card">
                                        <div className="file-icon">
                                            <Palette size={24} />
                                        </div>
                                        <div className="file-info">
                                            <h4>Full Catalog</h4>
                                            <span>PDF • 15.0 MB</span>
                                        </div>
                                        <Download size={20} className="download-action" />
                                    </a>
                                </div>
                            )}

                            {activeTab === 'applications' && (
                                <div className="applications-cloud">
                                    {product.applications.map((app, idx) => (
                                        <span key={idx} className="app-tag-large">
                                            {app.replace('-', ' ')}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            <section className="related-products-section section">
                <div className="container">
                    <div className="section-header">
                        <h2>You May Also Like</h2>
                        <p>Curated selections matching your style</p>
                    </div>
                    <div className="products-grid">
                        {relatedProducts.map((prod) => (
                            <ProductCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetail;
