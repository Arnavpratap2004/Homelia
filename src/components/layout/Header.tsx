import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu,
    X,
    Search,
    ShoppingCart,
    User,
    Phone,
    ChevronDown,
    Package,
    FileText,
    Heart
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();
    const { itemCount } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
        setActiveDropdown(null);
    }, [location]);

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="container">
                    <div className="top-bar-content">
                        <div className="top-bar-left">
                            <Phone size={14} />
                            <span>+91 98765 43210</span>
                            <span className="divider">|</span>
                            <span>Pan-India Delivery</span>
                        </div>
                        <div className="top-bar-right">
                            <Link to="/dealer-enquiry">Become a Dealer</Link>
                            <span className="divider">|</span>
                            <Link to="/track-order">Track Order</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
                <div className="container">
                    <div className="header-content">
                        {/* Logo */}
                        <Link to="/" className="logo">
                            <div className="logo-icon">H</div>
                            <div className="logo-text">
                                <span className="logo-name">Homelia</span>
                                <span className="logo-tagline">Authorized Distributor</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="nav-desktop">
                            <ul className="nav-list">
                                <li>
                                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                                        Home
                                    </Link>
                                </li>
                                <li
                                    className="has-dropdown"
                                    onMouseEnter={() => setActiveDropdown('brands')}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button className="nav-link">
                                        Brands <ChevronDown size={16} />
                                    </button>
                                    <div className={`dropdown ${activeDropdown === 'brands' ? 'active' : ''}`}>
                                        <Link to="/brands/durian" className="dropdown-item">
                                            <span className="brand-dot durian"></span>
                                            Durian Laminates
                                        </Link>
                                        <Link to="/brands/rockstar" className="dropdown-item">
                                            <span className="brand-dot rockstar"></span>
                                            Rockstar Laminates
                                        </Link>
                                    </div>
                                </li>
                                <li
                                    className="has-dropdown"
                                    onMouseEnter={() => setActiveDropdown('products')}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button className="nav-link">
                                        Products <ChevronDown size={16} />
                                    </button>
                                    <div className={`dropdown dropdown-wide ${activeDropdown === 'products' ? 'active' : ''}`}>
                                        <div className="dropdown-grid">
                                            <div className="dropdown-section">
                                                <h4>By Category</h4>
                                                <Link to="/catalog?category=decorative" className="dropdown-item">Decorative Laminates</Link>
                                                <Link to="/catalog?category=compact" className="dropdown-item">Compact Laminates</Link>
                                                <Link to="/catalog?category=exterior" className="dropdown-item">Exterior Laminates</Link>
                                                <Link to="/catalog?category=fire-retardant" className="dropdown-item">Fire Retardant</Link>
                                                <Link to="/catalog?category=anti-bacterial" className="dropdown-item">Anti-Bacterial</Link>
                                            </div>
                                            <div className="dropdown-section">
                                                <h4>By Application</h4>
                                                <Link to="/catalog?application=kitchen" className="dropdown-item">Kitchen</Link>
                                                <Link to="/catalog?application=wardrobe" className="dropdown-item">Wardrobe</Link>
                                                <Link to="/catalog?application=furniture" className="dropdown-item">Furniture</Link>
                                                <Link to="/catalog?application=office" className="dropdown-item">Office</Link>
                                                <Link to="/catalog?application=wall-panels" className="dropdown-item">Wall Panels</Link>
                                            </div>
                                            <div className="dropdown-section">
                                                <h4>By Finish</h4>
                                                <Link to="/catalog?finish=matte" className="dropdown-item">Matte</Link>
                                                <Link to="/catalog?finish=glossy" className="dropdown-item">Glossy</Link>
                                                <Link to="/catalog?finish=textured" className="dropdown-item">Textured</Link>
                                                <Link to="/catalog?finish=high-gloss" className="dropdown-item">High Gloss</Link>
                                            </div>
                                        </div>
                                        <div className="dropdown-footer">
                                            <Link to="/catalog" className="btn btn-primary btn-sm">
                                                View All Products
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <Link to="/bulk-order" className={location.pathname === '/bulk-order' ? 'active' : ''}>
                                        Bulk Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/request-quote" className={location.pathname === '/request-quote' ? 'active' : ''}>
                                        Request Quote
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Header Actions */}
                        <div className="header-actions">
                            <button className="header-action-btn" aria-label="Search">
                                <Search size={20} />
                            </button>
                            <Link to="/wishlist" className="header-action-btn" aria-label="Wishlist">
                                <Heart size={20} />
                            </Link>
                            <Link to="/cart" className="header-action-btn cart-btn" aria-label="Cart">
                                <ShoppingCart size={20} />
                                {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
                            </Link>
                            <Link to="/login" className="header-action-btn" aria-label="Account">
                                <User size={20} />
                            </Link>
                            <button
                                className="mobile-menu-btn"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-nav-content">
                        <div className="mobile-nav-section">
                            <Link to="/" className="mobile-nav-link">Home</Link>
                        </div>

                        <div className="mobile-nav-section">
                            <div className="mobile-nav-header" onClick={() => toggleDropdown('brands-mobile')}>
                                <span>Brands</span>
                                <ChevronDown size={18} className={activeDropdown === 'brands-mobile' ? 'rotate' : ''} />
                            </div>
                            <div className={`mobile-dropdown ${activeDropdown === 'brands-mobile' ? 'active' : ''}`}>
                                <Link to="/brands/durian" className="mobile-nav-sublink">
                                    <span className="brand-dot durian"></span>
                                    Durian Laminates
                                </Link>
                                <Link to="/brands/rockstar" className="mobile-nav-sublink">
                                    <span className="brand-dot rockstar"></span>
                                    Rockstar Laminates
                                </Link>
                            </div>
                        </div>

                        <div className="mobile-nav-section">
                            <div className="mobile-nav-header" onClick={() => toggleDropdown('products-mobile')}>
                                <span>Products</span>
                                <ChevronDown size={18} className={activeDropdown === 'products-mobile' ? 'rotate' : ''} />
                            </div>
                            <div className={`mobile-dropdown ${activeDropdown === 'products-mobile' ? 'active' : ''}`}>
                                <Link to="/catalog?category=decorative" className="mobile-nav-sublink">Decorative Laminates</Link>
                                <Link to="/catalog?category=compact" className="mobile-nav-sublink">Compact Laminates</Link>
                                <Link to="/catalog?category=exterior" className="mobile-nav-sublink">Exterior Laminates</Link>
                                <Link to="/catalog" className="mobile-nav-sublink">View All</Link>
                            </div>
                        </div>

                        <div className="mobile-nav-section">
                            <Link to="/bulk-order" className="mobile-nav-link">
                                <Package size={18} />
                                Bulk Orders
                            </Link>
                            <Link to="/request-quote" className="mobile-nav-link">
                                <FileText size={18} />
                                Request Quote
                            </Link>
                            <Link to="/sample-order" className="mobile-nav-link">
                                Order Samples
                            </Link>
                            <Link to="/contact" className="mobile-nav-link">Contact Us</Link>
                        </div>

                        <div className="mobile-nav-footer">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Sign In / Register
                            </Link>
                            <p className="mobile-phone">
                                <Phone size={16} />
                                +91 98765 43210
                            </p>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
