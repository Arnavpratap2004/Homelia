import { useParams, Link } from 'react-router-dom';
import { ArrowRight, FileText, ChevronRight } from 'lucide-react';
import { getBrandById, getProductsByBrand } from '../data/products';
import { ExpandableCards, ExpandableCardItem } from '../components/ui/ExpandableCards';
import '../components/ui/ExpandableCards.css';
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


            {/* Catalogues Section - Only for Durian */}
            {brand.id === 'durian' && (() => {
                const durianCatalogues: ExpandableCardItem[] = [
                    {
                        id: 1,
                        title: 'DURIAN EXPORT',
                        description: 'Premium export-quality laminates with international standards and contemporary designs for global markets.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2025/04/Serene-export-collection.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/DURIAN-EXPORT.pdf',
                        content: () => (
                            <p>
                                Explore our export-quality laminate collection featuring international design standards,
                                contemporary patterns, and premium finishes suitable for global markets. This catalogue
                                showcases our commitment to quality and innovation in decorative surfaces.
                            </p>
                        )
                    },
                    {
                        id: 2,
                        title: 'ECGL',
                        description: 'Eco-friendly green laminates with sustainable materials and environmentally conscious manufacturing.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2024/06/ecgl-jpg.webp',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/ECGL.pdf',
                        content: () => (
                            <p>
                                Our eco-conscious laminate collection featuring sustainable materials,
                                low-emission manufacturing, and environmentally responsible design choices
                                for the modern, sustainability-focused consumer.
                            </p>
                        )
                    },
                    {
                        id: 3,
                        title: 'ESPANIA LINER',
                        description: 'Spanish-inspired designs with rich textures and Mediterranean aesthetics for luxury interiors.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2024/06/ESPANIA-LINER-jpg.webp',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/ESPANIA-LINER.pdf',
                        content: () => (
                            <p>
                                Discover Mediterranean elegance with our Spanish-inspired laminate collection.
                                Rich textures, warm tones, and sophisticated patterns bring European luxury
                                to any interior space.
                            </p>
                        )
                    },
                    {
                        id: 4,
                        title: 'ENDEAVOUR',
                        description: 'Bold and innovative patterns designed for modern commercial and residential spaces.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2024/06/ENDEAVOUR-jpg.webp',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/Endeavour.pdf',
                        content: () => (
                            <p>
                                Push boundaries with our Endeavour collection - bold, innovative patterns
                                that make a statement in modern commercial and residential environments.
                                Perfect for those who dare to be different.
                            </p>
                        )
                    },
                    {
                        id: 5,
                        title: 'IMPRESSIONS',
                        description: 'Artistic laminate collection featuring unique textures and statement-making surface finishes.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2025/01/IMPRESSION.webp',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/IMPRESSIONS.pdf',
                        content: () => (
                            <p>
                                Create lasting impressions with our artistic laminate collection.
                                Unique textures, creative patterns, and statement-making finishes
                                for spaces that demand attention.
                            </p>
                        )
                    },
                    {
                        id: 6,
                        title: 'ITALIA',
                        description: 'Italian-inspired elegance with sophisticated patterns and timeless European craftsmanship.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2025/11/Italia_new.webp',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/Italia.pdf',
                        content: () => (
                            <p>
                                Experience Italian sophistication with our Italia collection.
                                Timeless European craftsmanship meets contemporary design,
                                bringing elegance and refinement to your interiors.
                            </p>
                        )
                    },
                    {
                        id: 7,
                        title: 'LAMDOOR 2024',
                        description: 'Latest door laminate collection featuring durable surfaces and contemporary door designs.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2024/09/LAMDOOR-jpg.webp',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/LAMDOOR_2024.pdf',
                        content: () => (
                            <p>
                                Our latest door laminate collection for 2024 features durable surfaces,
                                contemporary designs, and practical solutions for modern door applications
                                in residential and commercial settings.
                            </p>
                        )
                    },
                    {
                        id: 8,
                        title: 'ROMANIA',
                        description: 'Eastern European inspired designs with warm wood tones and rustic charm.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2025/08/Romaina.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/ROMANIA.pdf',
                        content: () => (
                            <p>
                                Embrace the rustic charm of Eastern Europe with our Romania collection.
                                Warm wood tones, natural textures, and authentic patterns create
                                cozy, inviting spaces with character.
                            </p>
                        )
                    },
                    {
                        id: 9,
                        title: 'FIGURWOODZ',
                        description: 'Realistic wood grain patterns with natural aesthetics and premium surface quality.',
                        thumbnail: 'https://durianlam.com/wp-content/uploads/2024/09/FIGURE-WOOZ.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/durian-catalogue/figurwoodz.pdf',
                        content: () => (
                            <p>
                                Our Figurwoodz collection offers incredibly realistic wood grain patterns
                                with natural aesthetics and premium surface quality. Achieve the beauty
                                of real wood with the durability of laminates.
                            </p>
                        )
                    }
                ];

                return (
                    <section className="catalogues-section section">
                        <div className="container">
                            <div className="section-header">
                                <span className="section-subtitle">Durian Laminates</span>
                                <h2>Explore Our Catalogues</h2>
                                <p className="section-description">Browse through our collection of premium laminate catalogues. Click on any catalogue to preview and explore.</p>
                            </div>
                            <ExpandableCards cards={durianCatalogues} />
                        </div>
                    </section>
                );
            })()}

            {/* Catalogues Section - For Rockstar */}
            {brand.id === 'rockstar' && (() => {
                const rockstarCatalogues: ExpandableCardItem[] = [
                    {
                        id: 1,
                        title: 'COLOR RUSH',
                        description: 'Experience a vibrant spectrum with ROCKSTAR\'s COLOR RUSH collection featuring bold hues, striking styles, and limitless creative energy.',
                        thumbnail: 'https://rockstarlaminates.in/wp-content/uploads/2025/09/Layer-2-1.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/rockstar-catalogue/ROCKSTAR-COLOR-RUSH.pdf',
                        content: () => (
                            <p>
                                Discover the vibrant world of Color Rush - a collection that brings bold,
                                energetic colors to your spaces. From striking reds to electric blues,
                                this catalogue is perfect for making a statement.
                            </p>
                        )
                    },
                    {
                        id: 2,
                        title: 'GOOD LOOK',
                        description: 'Premium aesthetics with the Good Look collection featuring sophisticated designs and refined finishes for elegant interiors.',
                        thumbnail: 'https://rockstarlaminates.in/wp-content/uploads/2025/09/Layer-3-1.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/rockstar-catalogue/ROCKSTAR-GOOD-LOOK-LINK.pdf',
                        content: () => (
                            <p>
                                The Good Look collection offers sophisticated designs with refined finishes
                                that elevate any interior space. Perfect for those who appreciate understated
                                luxury and timeless elegance.
                            </p>
                        )
                    },
                    {
                        id: 3,
                        title: 'ROCKSTAR LITE',
                        description: 'Lightweight laminate solutions with the Lite collection - perfect balance of durability, style, and ease of installation.',
                        thumbnail: 'https://rockstarlaminates.in/wp-content/uploads/2025/09/Layer-1-1.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/rockstar-catalogue/ROCKSTAR-LITE.pdf',
                        content: () => (
                            <p>
                                Rockstar Lite brings you lightweight laminate solutions that don't compromise
                                on quality. Easy to handle, install, and maintain while delivering the premium
                                look you expect from Rockstar.
                            </p>
                        )
                    },
                    {
                        id: 4,
                        title: 'ROCKSTAR DOOR',
                        description: 'Specialized door laminates with the Door collection - durable, stylish surfaces designed specifically for door applications.',
                        thumbnail: 'https://rockstarlaminates.in/wp-content/uploads/2025/09/Layer-1-4-1-1.png',
                        icon: '',
                        ctaText: 'Open PDF',
                        ctaLink: '/catalogues/rockstar-catalogue/ROCKSTAR-DOOR.pdf',
                        content: () => (
                            <p>
                                The Rockstar Door collection features laminates specifically designed for
                                door applications. Enhanced durability, fingerprint resistance, and stunning
                                designs make your doors stand out.
                            </p>
                        )
                    }
                ];

                return (
                    <section className="catalogues-section section">
                        <div className="container">
                            <div className="section-header">
                                <span className="section-subtitle">Rockstar Laminates</span>
                                <h2>Explore Our Catalogues</h2>
                                <p className="section-description">Browse through our collection of premium laminate catalogues. Click on any catalogue to preview and explore.</p>
                            </div>
                            <ExpandableCards cards={rockstarCatalogues} />
                        </div>
                    </section>
                );
            })()}

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
