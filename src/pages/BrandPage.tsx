import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Download, FileText, Star, ChevronRight } from 'lucide-react';
import { getBrandById, getProductsByBrand, formatPricePerSheet } from '../data/products';
import './BrandPage.css';

const BrandPage = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const brand = getBrandById(brandId as 'durian' | 'rockstar');
    const products = brand ? getProductsByBrand(brand.id) : [];

    if (!brand) {
        return (
            <div className="brand-not-found">
                <div className="container">
                    <h1>Brand Not Found</h1>
                    <Link to="/" className="btn btn-primary">Go to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="brand-page">
            {/* Brand Hero */}
            <section className="brand-hero" style={{
                background: `linear-gradient(135deg, ${brand.color}15 0%, var(--color-bg) 100%)`
            }}>
                <div className="container">
                    <div className="brand-hero-content">
                        <div className="brand-hero-text">
                            <div className="breadcrumb">
                                <Link to="/">Home</Link>
                                <ChevronRight size={14} />
                                <span>{brand.name}</span>
                            </div>
                            <div className="brand-logo-large" style={{ background: `${brand.color}20` }}>
                                <span style={{ color: brand.color }}>{brand.name.split(' ')[0]}</span>
                            </div>
                            <h1>{brand.name}</h1>
                            <p className="brand-tagline">{brand.tagline}</p>
                            <p className="brand-description">{brand.description}</p>
                            <div className="brand-actions">
                                <Link to={`/catalog?brand=${brand.id}`} className="btn btn-primary btn-lg">
                                    View All Products <ArrowRight size={18} />
                                </Link>
                                <Link to="/request-quote" className="btn btn-outline btn-lg">
                                    <FileText size={18} />
                                    Request Quote
                                </Link>
                            </div>
                        </div>
                        <div className="brand-hero-visual">
                            <div className="brand-swatches">
                                {products.slice(0, 4).map((product, idx) => (
                                    <div
                                        key={product.id}
                                        className="brand-swatch"
                                        style={{
                                            background: product.colors[0],
                                            transform: `rotate(${(idx - 1.5) * 8}deg)`,
                                            zIndex: 4 - idx
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Collections */}
            <section className="collections-section section">
                <div className="container">
                    <h2>Collections</h2>
                    <div className="collections-grid">
                        {brand.collections.map((collection, idx) => (
                            <Link
                                to={`/catalog?brand=${brand.id}`}
                                key={idx}
                                className="collection-card"
                                style={{ borderColor: `${brand.color}30` }}
                            >
                                <span className="collection-name">{collection}</span>
                                <ArrowRight size={18} style={{ color: brand.color }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Products */}
            <section className="brand-products-section section">
                <div className="container">
                    <div className="section-header">
                        <h2>Popular from {brand.name.split(' ')[0]}</h2>
                        <Link to={`/catalog?brand=${brand.id}`} className="btn btn-outline">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="products-grid">
                        {products.slice(0, 4).map((product) => (
                            <Link to={`/product/${product.id}`} key={product.id} className="product-card card">
                                <div className="product-image">
                                    <div
                                        className="product-swatch"
                                        style={{ background: product.colors[0] }}
                                    >
                                        <div className="product-colors">
                                            {product.colors.map((color, idx) => (
                                                <span
                                                    key={idx}
                                                    className="color-dot"
                                                    style={{ background: color }}
                                                ></span>
                                            ))}
                                        </div>
                                    </div>
                                    {product.bestseller && (
                                        <div className="product-badge bestseller">
                                            <Star size={12} />
                                            Bestseller
                                        </div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <span className="product-category">{product.texture} • {product.finish}</span>
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-sku">SKU: {product.sku}</p>
                                    <div className="product-footer">
                                        <span className="product-price">{formatPricePerSheet(product.price)}</span>
                                        <span className="product-moq">MOQ: {product.moq}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Download Catalog */}
            <section className="catalog-download-section section">
                <div className="container">
                    <div className="catalog-download-card" style={{
                        background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}dd 100%)`
                    }}>
                        <div className="catalog-content">
                            <h2>Download {brand.name.split(' ')[0]} Catalog</h2>
                            <p>Get the complete collection catalog with all designs, specifications, and technical details.</p>
                            <a href={brand.catalogPdf} className="btn btn-lg" style={{
                                background: 'white',
                                color: brand.color
                            }}>
                                <Download size={20} />
                                Download PDF Catalog
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Request Quote CTA */}
            <section className="brand-cta-section section">
                <div className="container">
                    <div className="brand-cta-card card">
                        <h2>Need a Quote for {brand.name}?</h2>
                        <p>Get competitive pricing for bulk orders. Our team will provide customized quotes within 24 hours.</p>
                        <Link to="/request-quote" className="btn btn-accent btn-lg">
                            <FileText size={20} />
                            Request Quote for {brand.name.split(' ')[0]}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BrandPage;
