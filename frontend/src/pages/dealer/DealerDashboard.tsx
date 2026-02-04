import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    Package,
    Truck,
    Settings,
    LogOut,
    TrendingUp,
    Star,
    Clock,
    CheckCircle,
    Plus,
    Menu,
    X,
    Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, quotesApi, productsApi, ordersApi, creditApi } from '../../api';
import { formatPrice } from '../../data/products';
import './DealerDashboard.css';

const DealerDashboard = () => {
    const { user, logout, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dealer profile form state
    const [dealerProfileForm, setDealerProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        companyName: user?.companyName || '',
        gstNumber: user?.gstNumber || '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteFormData, setQuoteFormData] = useState({
        productId: '',
        productName: '',
        quantity: 100,
        notes: '',
        brand: '',
        timeline: ''
    });
    const [products, setProducts] = useState<any[]>([]);
    const [, setIsLoadingProducts] = useState(false);
    const [realQuotes, setRealQuotes] = useState<any[]>([]);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [quoteToConvert, setQuoteToConvert] = useState<any>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);


    // Credit Request State
    const [showCreditRequestModal, setShowCreditRequestModal] = useState(false);
    const [creditRequestAmount, setCreditRequestAmount] = useState('');
    const [creditRequestNotes, setCreditRequestNotes] = useState('');
    const [isSubmittingCredit, setIsSubmittingCredit] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [myCreditRequests, setMyCreditRequests] = useState<any[]>([]);
    const [, setIsLoadingCreditRequests] = useState(false);

    // Fetch credit requests when modal opens and refresh user data
    useEffect(() => {
        if (showCreditRequestModal) {
            fetchMyCreditRequests();
            refreshUser(); // Refresh user data to get latest creditLimit
        }
    }, [showCreditRequestModal]);

    const fetchMyCreditRequests = async () => {
        setIsLoadingCreditRequests(true);
        try {
            const response = await creditApi.getMyRequests();
            if (response.success && response.data) {
                setMyCreditRequests(response.data as any[]);
            }
        } catch (error) {
            console.error('Error fetching credit requests:', error);
        } finally {
            setIsLoadingCreditRequests(false);
        }
    };

    // Sync dealer profile form when user data changes
    useEffect(() => {
        if (user) {
            setDealerProfileForm({
                name: user.name || '',
                phone: user.phone || '',
                companyName: user.companyName || '',
                gstNumber: user.gstNumber || '',
            });
        }
        fetchProducts();
        fetchProducts();
        fetchQuotes();
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const response = await ordersApi.list({ limit: 10 });
            if (response.success && response.data) {
                // Handle both simple array response and paginated response structure
                setOrders((response.data as any).data || response.data || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchQuotes = async () => {
        setIsLoadingQuotes(true);
        try {
            const response = await quotesApi.list({ limit: 5 });
            if (response.success && response.data) {
                setRealQuotes(response.data as any[]);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await productsApi.list({ limit: 50 });
            if (response.success && Array.isArray(response.data)) {
                // Map real products to the format used in the dashboard
                const mappedProducts = response.data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku || 'N/A',
                    retailPrice: Number(p.basePrice) || 0,
                    dealerPrice: Number(p.basePrice) * 0.88, // Applying 12% discount for Gold tier as demo
                    stock: p.stock > 0 ? 'In Stock' : 'Out of Stock',
                    moq: 10
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Dealer stats - use actual user creditLimit from database
    // Debug: Log the user creditLimit to see what's coming from API
    console.log('User creditLimit from API:', user?.creditLimit, typeof user?.creditLimit);

    const userCreditLimit = user?.creditLimit !== undefined && user?.creditLimit !== null
        ? Number(user.creditLimit)
        : 0; // New dealers start with 0 credit limit

    // Calculate tier based on credit limit
    const getTierFromLimit = (limit: number) => {
        if (limit >= 1500000) return { name: 'Gold', discount: '8%' };
        if (limit >= 500000) return { name: 'Silver', discount: '5%' };
        return { name: 'Bronze', discount: '2%' };
    };
    const currentTierInfo = getTierFromLimit(userCreditLimit);

    const dealerStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length,
        totalSpent: orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
        creditLimit: userCreditLimit,
        availableCredit: userCreditLimit,
        tier: currentTierInfo.name,
        discount: currentTierInfo.discount
    };

    // Demo products with dealer pricing (commented out - using API products)
    // const dealerProducts = [
    //     { id: '1', name: 'American Walnut Classic', sku: 'AWC-001', retailPrice: 2850, dealerPrice: 2450, stock: 'In Stock', moq: 25 },
    //     { id: '2', name: 'Nordic Oak Natural', sku: 'NON-002', retailPrice: 3100, dealerPrice: 2680, stock: 'In Stock', moq: 20 },
    //     { id: '3', name: 'Charcoal Slate', sku: 'CS-003', retailPrice: 3350, dealerPrice: 2890, stock: 'Low Stock', moq: 15 },
    //     { id: '4', name: 'Pure White Gloss', sku: 'PWG-004', retailPrice: 3700, dealerPrice: 3200, stock: 'In Stock', moq: 10 },
    // ];

    // Recent orders from real API data (show latest 3)
    const recentOrders = orders.slice(0, 3).map((o: any) => ({
        id: o.orderNumber || `ORD-${o.id?.slice(-8)}`,
        date: new Date(o.createdAt).toLocaleDateString(),
        items: o.items?.length || 0,
        total: Number(o.totalAmount || 0),
        status: o.status?.toLowerCase() || 'pending'
    }));

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    // Save dealer profile to backend
    const handleSaveDealerProfile = async () => {
        setIsSavingProfile(true);
        setSaveMessage(null);

        try {
            const response = await authApi.updateProfile({
                name: dealerProfileForm.name,
                phone: dealerProfileForm.phone,
                companyName: dealerProfileForm.companyName,
                gstNumber: dealerProfileForm.gstNumber,
            });

            if (response.success) {
                refreshUser();
                setSaveMessage('Profile saved successfully!');
            } else {
                setSaveMessage('Failed to save profile: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaveMessage('Error saving profile. Please try again.');
        } finally {
            setIsSavingProfile(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setQuoteLoading(true);

        try {
            const notes = `Brand: ${quoteFormData.brand}\nTimeline: ${quoteFormData.timeline}\nNotes: ${quoteFormData.notes}`;
            const response = await quotesApi.create({
                items: [{
                    productId: quoteFormData.productId,
                    requestedQty: quoteFormData.quantity,
                }],
                notes: notes
            });

            if (response.success) {
                setSaveMessage('Quote request submitted successfully!');
                setShowQuoteModal(false);
                fetchQuotes(); // Refresh quotes
                setActiveTab('quotes');
            } else {
                setSaveMessage('Failed to submit quote: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating quote:', error);
            setSaveMessage('Error submitting quote request. Please try again.');
        } finally {
            setQuoteLoading(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const openQuoteModal = (product?: any) => {
        if (product) {
            setQuoteFormData({
                ...quoteFormData,
                productId: product.id,
                productName: product.name,
                brand: product.name.toLowerCase().includes('durian') ? 'durian' : product.name.toLowerCase().includes('rockstar') ? 'rockstar' : '',
            });
        } else {
            setQuoteFormData({
                productId: '',
                productName: '',
                quantity: 100,
                notes: '',
                brand: '',
                timeline: ''
            });
        }
        setShowQuoteModal(true);
    };

    const handleViewQuoteDetails = (quote: any) => {
        setSelectedQuote(quote);
        setShowDetailsModal(true);
    };

    const handleConvertQuoteToOrder = (quote: any) => {
        setQuoteToConvert(quote);
        setShowConfirmModal(true);
    };

    const executeConversion = async () => {
        if (!quoteToConvert) return;

        setIsConverting(true);
        try {
            // Use user's addresses or fallback to empty objects (backend validation will catch if empty)
            const response = await quotesApi.convertToOrder(quoteToConvert.id, {
                shippingAddress: user?.shippingAddress || {
                    street: 'Refer to profile',
                    city: 'Refer to profile',
                    state: 'Refer to profile',
                    zip: '000000'
                },
                billingAddress: user?.billingAddress || {
                    street: 'Refer to profile',
                    city: 'Refer to profile',
                    state: 'Refer to profile',
                    zip: '000000'
                }
            });

            if (response.success) {
                setSaveMessage('Quote successfully converted to order!');
                setSaveMessage('Quote successfully converted to order!');
                fetchQuotes();
                fetchOrders(); // Refresh orders after conversion
                setActiveTab('orders');
                setShowConfirmModal(false);
                setShowDetailsModal(false); // Close details modal if open
            } else {
                setSaveMessage('Failed to convert quote: ' + (response.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Error converting quote:', error);
            setSaveMessage(error.message || 'Error converting quote to order.');
        } finally {
            setIsConverting(false);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    };

    const openOrderDetails = (order: any) => {
        console.log('Opening order details for:', order);
        setSelectedOrder(order);
        setShowOrderDetailsModal(true);
    };

    const handleRequestCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!creditRequestAmount) return;

        setIsSubmittingCredit(true);
        try {
            const response = await creditApi.request(Number(creditRequestAmount), creditRequestNotes);
            if (response.success) {
                setToast({ message: 'Credit request submitted successfully! The admin will review your request.', type: 'success' });
                setShowCreditRequestModal(false);
                setCreditRequestAmount('');
                setCreditRequestNotes('');
                setTimeout(() => setToast(null), 5000);
            } else {
                setToast({ message: response.message || 'Failed to submit request. Please try again.', type: 'error' });
                setTimeout(() => setToast(null), 5000);
            }
        } catch (error) {
            console.error('Error requesting credit:', error);
            setToast({ message: 'Error submitting credit request. Please check your connection.', type: 'error' });
            setTimeout(() => setToast(null), 5000);
        } finally {
            setIsSubmittingCredit(false);
        }
    };

    return (
        <div className="dealer-dashboard">
            {/* Mobile Menu Toggle */}
            <button
                className="dealer-mobile-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay */}
            <div
                className={`dealer-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`dealer-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dealer-logo">
                    <div className="logo-icon">H</div>
                    <div className="logo-text">
                        <span className="logo-name">Homelia</span>
                        <span className="logo-badge">Dealer Portal</span>
                    </div>
                </div>

                <div className="dealer-tier">
                    <Star size={16} />
                    <span>{dealerStats.tier} Partner</span>
                    <span className="discount-badge">{dealerStats.discount} OFF</span>
                </div>

                <nav className="dealer-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={20} />
                        Products & Pricing
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingCart size={20} />
                        My Orders
                        {dealerStats.pendingOrders > 0 && (
                            <span className="nav-badge">{dealerStats.pendingOrders}</span>
                        )}
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'quotes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quotes')}
                    >
                        <FileText size={20} />
                        Quotations
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <Truck size={20} />
                        Stock Status
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'partner' ? 'active' : ''}`}
                        onClick={() => setActiveTab('partner')}
                    >
                        <Award size={20} />
                        Partner Program
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} />
                        Account Settings
                    </button>

                    <div className="nav-divider"></div>

                    <button
                        className="nav-item logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dealer-main">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <div>
                                <h1>Welcome back, {user?.name || 'Partner'}!</h1>
                                <p>Here's your dealer dashboard overview</p>
                            </div>
                            <Link to="/catalog" className="btn btn-primary">
                                <Plus size={18} />
                                Place New Order
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon orders">
                                    <ShoppingCart size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">{dealerStats.totalOrders}</span>
                                    <span className="stat-label">Total Orders</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon revenue">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">{formatPrice(dealerStats.totalSpent)}</span>
                                    <span className="stat-label">Total Purchases</span>
                                </div>
                            </div>
                            <div className="stat-card highlight">
                                <div className="stat-icon credit">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">{formatPrice(dealerStats.availableCredit)}</span>
                                    <span className="stat-label">Available Credit</span>
                                    <div className="credit-bar">
                                        <div
                                            className="credit-fill"
                                            style={{ width: `${(dealerStats.availableCredit / dealerStats.creditLimit) * 100}%` }}
                                        />
                                    </div>
                                    <button
                                        className="credit-request-btn"
                                        onClick={() => setShowCreditRequestModal(true)}
                                    >
                                        Request Increase
                                    </button>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">{dealerStats.pendingOrders}</span>
                                    <span className="stat-label">Pending Orders</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="dealer-grid">
                            <div className="dealer-card">
                                <div className="card-header">
                                    <h3>Recent Orders</h3>
                                    <button onClick={() => setActiveTab('orders')} className="btn btn-ghost btn-sm">View All</button>
                                </div>
                                <div className="orders-list">
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map(order => (
                                            <div key={order.id} className="order-item">
                                                <div className="order-info">
                                                    <span className="order-id">{order.id}</span>
                                                    <span className="order-date">{order.date}</span>
                                                </div>
                                                <div className="order-details">
                                                    <span className="order-amount">{formatPrice(order.total)}</span>
                                                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
                                            {isLoadingOrders ? 'Loading orders...' : 'No orders yet.'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="dealer-card">
                                <div className="card-header">
                                    <h3>Active Quotations</h3>
                                    <button onClick={() => openQuoteModal()} className="btn btn-ghost btn-sm">Request Quote</button>
                                </div>
                                <div className="quotes-list">
                                    {realQuotes.length > 0 ? (
                                        realQuotes.map((quote: any) => (
                                            <div key={quote.id} className="quote-item">
                                                <div className="quote-info">
                                                    <span className="quote-id">{quote.quoteNumber || quote.id.slice(-8)}</span>
                                                    <span className="quote-products">
                                                        {quote.items?.[0]?.product?.name || 'Multiple items'}
                                                        {quote.items?.length > 1 ? ` (+${quote.items.length - 1} more)` : ''}
                                                    </span>
                                                </div>
                                                <div className="quote-details">
                                                    <span className="quote-amount">{formatPrice(quote.totalAmount || 0)}</span>
                                                    <span className={`status-badge ${quote.status?.toLowerCase()}`}>{quote.status}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
                                            {isLoadingQuotes ? 'Loading quotes...' : 'No active quotations.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Products Tab - Coming Soon */}
                {activeTab === 'products' && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <div>
                                <h1>Products & Dealer Pricing</h1>
                                <p>Exclusive dealer pricing with {dealerStats.discount} discount</p>
                            </div>
                        </div>

                        <div className="dealer-card full-width" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            minHeight: '400px',
                            background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a69070 0%, #8b7a5c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                boxShadow: '0 4px 20px rgba(166, 144, 112, 0.3)'
                            }}>
                                <Package size={36} color="#fff" />
                            </div>
                            <h2 style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '2rem',
                                fontWeight: 500,
                                color: '#2c2c2c',
                                marginBottom: '0.75rem'
                            }}>
                                Coming Soon
                            </h2>
                            <p style={{
                                color: '#666',
                                fontSize: '1rem',
                                maxWidth: '400px',
                                lineHeight: 1.6,
                                marginBottom: '1.5rem'
                            }}>
                                We're adding exclusive dealer pricing and product catalog.
                                This feature will be available shortly.
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center',
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(166, 144, 112, 0.1)',
                                borderRadius: '8px',
                                color: '#8b7a5c',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                <TrendingUp size={16} />
                                Your {currentTierInfo.name} Partner discount: {dealerStats.discount}
                            </div>
                        </div>
                    </div>
                )}

                {/* Partner Program Tab - Premium Psychology-Driven Design */}
                {activeTab === 'partner' && (() => {
                    const creditLimit = user?.creditLimit ? Number(user.creditLimit) : 0;

                    // Tier configuration with profit-focused messaging
                    const tiers = [
                        {
                            name: 'Bronze',
                            label: 'Getting Started',
                            minCredit: 0,
                            maxCredit: 499999,
                            discount: 2,
                            monthlyEarnings: 2000,
                            orderSavings: 2000,
                            color: { bg: '#F5F0EA', border: '#C4A77D', text: '#8B7355', gradient: 'linear-gradient(135deg, #C4A77D 0%, #A89070 100%)' }
                        },
                        {
                            name: 'Silver',
                            label: 'Growing Partner',
                            minCredit: 500000,
                            maxCredit: 1499999,
                            discount: 5,
                            monthlyEarnings: 8000,
                            orderSavings: 5000,
                            color: { bg: '#F8F8F8', border: '#9A9A9A', text: '#606060', gradient: 'linear-gradient(135deg, #A8A8A8 0%, #787878 100%)' }
                        },
                        {
                            name: 'Gold',
                            label: 'Preferred Business Partner',
                            minCredit: 1500000,
                            maxCredit: Infinity,
                            discount: 8,
                            monthlyEarnings: 25000,
                            orderSavings: 8000,
                            color: { bg: '#FFF9F0', border: '#D4AF37', text: '#8B6914', gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 50%, #8B6914 100%)' }
                        }
                    ];

                    const getCurrentTier = () => {
                        if (creditLimit >= 1500000) return tiers[2];
                        if (creditLimit >= 500000) return tiers[1];
                        return tiers[0];
                    };

                    const getNextTier = () => {
                        if (creditLimit >= 1500000) return null;
                        if (creditLimit >= 500000) return tiers[2];
                        return tiers[1];
                    };

                    const currentTier = getCurrentTier();
                    const nextTier = getNextTier();
                    const amountToNextTier = nextTier ? nextTier.minCredit - creditLimit : 0;
                    const progressPercent = nextTier
                        ? Math.min(100, ((creditLimit - currentTier.minCredit) / (nextTier.minCredit - currentTier.minCredit)) * 100)
                        : 100;

                    return (
                        <div className="dealer-content" style={{ background: '#FAFAFA', minHeight: '100vh', padding: '2rem' }}>

                            {/* ============ CURRENT TIER - AUTHORITY & CONFIDENCE ============ */}
                            <div style={{
                                background: currentTier.color.gradient,
                                borderRadius: '20px',
                                padding: '2.5rem',
                                color: 'white',
                                marginBottom: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative element */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '200px',
                                    height: '200px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                }} />

                                <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.9 }}>
                                    Your Partnership Status
                                </p>
                                <h1 style={{ margin: '0.5rem 0 0', fontSize: '2.25rem', fontWeight: 600 }}>
                                    You're a Trusted {currentTier.name} Partner
                                </h1>

                                {/* Key Metrics */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', marginTop: '2rem' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>💰 Your Discount</p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '3rem', fontWeight: 700 }}>{currentTier.discount}%</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>on all products</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>📊 Credit Limit</p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '2.5rem', fontWeight: 600 }}>₹{(creditLimit / 100000).toFixed(1)}L</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>📈 Est. Monthly Savings</p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '2.5rem', fontWeight: 600 }}>₹{currentTier.monthlyEarnings.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Progress Bar to Next Tier */}
                                {nextTier && (
                                    <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Progress to {nextTier.name}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{(amountToNextTier / 100000).toFixed(1)}L more to unlock</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${progressPercent}%`,
                                                height: '100%',
                                                background: 'white',
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ============ TIER COMPARISON - MAKE GOLD IRRESISTIBLE ============ */}
                            <h2 style={{ margin: '2.5rem 0 1.5rem', color: '#1C1917', fontSize: '1.5rem', fontWeight: 500 }}>
                                Partnership Tiers
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                                {tiers.map((tier) => {
                                    const isCurrentTier = currentTier.name === tier.name;
                                    const isGold = tier.name === 'Gold';
                                    const isBronze = tier.name === 'Bronze';

                                    return (
                                        <div key={tier.name} style={{
                                            background: isGold ? 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 100%)' : tier.color.bg,
                                            border: isGold ? '2px solid #D4AF37' : isCurrentTier ? `2px solid ${tier.color.border}` : '1px solid #E8E6E3',
                                            borderRadius: '16px',
                                            padding: isGold ? '2rem' : '1.5rem',
                                            position: 'relative',
                                            transform: isGold ? 'scale(1.02)' : 'none',
                                            boxShadow: isGold
                                                ? '0 20px 50px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
                                                : isCurrentTier ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
                                            opacity: isBronze && !isCurrentTier ? 0.85 : 1
                                        }}>
                                            {/* Badges */}
                                            {isGold && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-12px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                                                    color: 'white',
                                                    padding: '0.35rem 1rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
                                                }}>
                                                    ⭐ Most Profitable
                                                </div>
                                            )}
                                            {isCurrentTier && !isGold && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    right: '16px',
                                                    background: tier.color.border,
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Current
                                                </div>
                                            )}

                                            {/* Tier Header */}
                                            <div style={{ marginTop: isGold ? '0.5rem' : 0 }}>
                                                <h3 style={{ margin: 0, fontSize: isGold ? '1.5rem' : '1.25rem', color: tier.color.text, fontWeight: 600 }}>
                                                    {tier.name}
                                                </h3>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#78716C' }}>
                                                    {tier.label}
                                                </p>
                                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#A1A1AA' }}>
                                                    {tier.maxCredit === Infinity
                                                        ? `₹${(tier.minCredit / 100000).toFixed(0)}L+ credit limit`
                                                        : `₹${(tier.minCredit / 100000).toFixed(0)}L - ₹${((tier.maxCredit + 1) / 100000).toFixed(0)}L credit limit`}
                                                </p>
                                            </div>

                                            {/* Profit-Focused Value */}
                                            <div style={{ margin: '1.5rem 0', padding: '1rem', background: isGold ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                                                <p style={{ margin: 0, fontSize: isGold ? '2.5rem' : '2rem', fontWeight: 700, color: tier.color.text }}>
                                                    {tier.discount}% <span style={{ fontSize: '1rem', fontWeight: 400 }}>OFF</span>
                                                </p>
                                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: isGold ? '#8B6914' : '#57534E' }}>
                                                    {isGold
                                                        ? `Save ₹${tier.orderSavings.toLocaleString()} on every ₹1L order`
                                                        : `Save ₹${tier.orderSavings.toLocaleString()} on every ₹1L order`}
                                                </p>
                                            </div>

                                            {/* Gold-specific micro-copy */}
                                            {isGold && (
                                                <p style={{
                                                    margin: '0 0 1rem',
                                                    padding: '0.75rem',
                                                    background: '#FEF3C7',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    color: '#92400E',
                                                    fontWeight: 500,
                                                    textAlign: 'center'
                                                }}>
                                                    💡 Top dealers recover their Gold investment within 2–3 orders
                                                </p>
                                            )}

                                            {/* CTA for non-current tiers */}
                                            {!isCurrentTier && (
                                                <button
                                                    onClick={() => setShowCreditRequestModal(true)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.85rem',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        background: isGold ? 'linear-gradient(135deg, #D4AF37, #B8962E)' : tier.color.border,
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        boxShadow: isGold ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none',
                                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                                    }}
                                                >
                                                    {isGold ? '🚀 Unlock Gold Benefits' : `Upgrade to ${tier.name}`}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ============ WHY INVEST MORE SECTION ============ */}
                            <div style={{
                                marginTop: '3rem',
                                padding: '2rem',
                                background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
                                borderRadius: '20px',
                                color: 'white'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 500 }}>
                                    Why Top Dealers Choose Higher Tiers
                                </h3>
                                <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
                                    Beyond discounts, here's what serious partners unlock
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                                    {[
                                        { icon: '⚡', title: 'Faster Processing', desc: 'Priority order fulfillment' },
                                        { icon: '📦', title: 'Stock Priority', desc: 'First access during high demand' },
                                        { icon: '💰', title: 'Better Margins', desc: 'Without raising retail prices' },
                                        { icon: '👤', title: 'Account Manager', desc: 'Direct personal support' },
                                        { icon: '🎁', title: 'Early Access', desc: 'New collections before others' },
                                        { icon: '🏆', title: 'Partner Events', desc: 'Exclusive networking opportunities' }
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '10px'
                                        }}>
                                            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</p>
                                                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', opacity: 0.7 }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ============ FINAL CTA ============ */}
                            {nextTier && (
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '2rem',
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ margin: '0 0 0.5rem', color: '#1C1917', fontSize: '1.25rem' }}>
                                        Ready to Grow Your Partnership?
                                    </h3>
                                    <p style={{ margin: '0 0 1.5rem', color: '#57534E', fontSize: '0.95rem' }}>
                                        Increase your credit limit to unlock {nextTier.name} tier and save more on every order.
                                    </p>
                                    <button
                                        onClick={() => setShowCreditRequestModal(true)}
                                        style={{
                                            padding: '1rem 2.5rem',
                                            border: 'none',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #A69070, #8B7355)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            boxShadow: '0 8px 25px rgba(166, 144, 112, 0.35)'
                                        }}
                                    >
                                        Increase My Credit Limit →
                                    </button>
                                    <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: '#A1A1AA' }}>
                                        ✓ No hidden fees &nbsp;•&nbsp; ✓ Quick approval &nbsp;•&nbsp; ✓ Credit reviewed quarterly
                                    </p>
                                </div>
                            )}

                            {/* Trust Signal */}
                            <div style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#78716C' }}>
                                    🔒 Your partnership investment is protected. Over 500+ dealers trust Homelia.
                                </p>
                            </div>
                        </div>
                    );
                })()}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <h1>Account Settings</h1>
                        </div>
                        <div className="dealer-card full-width">
                            <div className="card-header">
                                <h3>Profile Information</h3>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={dealerProfileForm.name}
                                        onChange={(e) => setDealerProfileForm({ ...dealerProfileForm, name: e.target.value })}
                                        placeholder="Enter your name"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={dealerProfileForm.phone}
                                        onChange={(e) => setDealerProfileForm({ ...dealerProfileForm, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={dealerProfileForm.companyName}
                                        onChange={(e) => setDealerProfileForm({ ...dealerProfileForm, companyName: e.target.value })}
                                        placeholder="Enter company name"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>GSTIN</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={dealerProfileForm.gstNumber}
                                        onChange={(e) => setDealerProfileForm({ ...dealerProfileForm, gstNumber: e.target.value })}
                                        placeholder="Enter GSTIN"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={user?.email || ''}
                                        readOnly
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', opacity: 0.7 }}
                                    />
                                    <small style={{ color: '#888', fontSize: '12px' }}>Email cannot be changed</small>
                                </div>

                                {saveMessage && (
                                    <div style={{
                                        padding: '0.75rem',
                                        marginBottom: '1rem',
                                        borderRadius: '8px',
                                        backgroundColor: saveMessage.includes('Error') || saveMessage.includes('Failed') ? '#fee2e2' : '#d1fae5',
                                        color: saveMessage.includes('Error') || saveMessage.includes('Failed') ? '#dc2626' : '#059669'
                                    }}>
                                        {saveMessage}
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveDealerProfile}
                                    disabled={isSavingProfile}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quotations Tab */}
                {activeTab === 'quotes' && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <div>
                                <h1>General Quotations</h1>
                                <p>Manage and track your custom price requests</p>
                            </div>
                            <button onClick={() => openQuoteModal()} className="btn btn-primary">
                                <Plus size={18} />
                                New Quote Request
                            </button>
                        </div>

                        <div className="dealer-card full-width">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Quote #</th>
                                        <th>Date</th>
                                        <th>Products</th>
                                        <th>Total Items</th>
                                        <th>Estimated Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {realQuotes.length > 0 ? (
                                        realQuotes.map((quote: any) => (
                                            <tr key={quote.id}>
                                                <td><strong>{quote.quoteNumber || quote.id.slice(-8)}</strong></td>
                                                <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {quote.items?.[0]?.product?.name || 'Custom Request'}
                                                        {quote.items?.length > 1 ? ` (+${quote.items.length - 1} more)` : ''}
                                                    </div>
                                                </td>
                                                <td>{quote.items?.reduce((acc: number, item: any) => acc + item.requestedQty, 0) || 0} sheets</td>
                                                <td className="dealer-price">{formatPrice(quote.totalAmount || 0)}</td>
                                                <td>
                                                    <span className={`status-badge ${quote.status?.toLowerCase()}`}>
                                                        {quote.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleViewQuoteDetails(quote)}
                                                        >
                                                            View Details
                                                        </button>
                                                        {quote.status === 'APPROVED' && (
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleConvertQuoteToOrder(quote)}
                                                                disabled={isConverting}
                                                            >
                                                                {isConverting ? 'Converting...' : 'Convert to Order'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                                                {isLoadingQuotes ? (
                                                    <div className="loading-spinner">Loading quotations...</div>
                                                ) : (
                                                    <div className="empty-state">
                                                        <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                        <p>No quotations found.</p>
                                                        <button onClick={() => openQuoteModal()} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                                                            Request Your First Quote
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <div>
                                <h1>My Orders</h1>
                                <p>Track and manage your purchase orders</p>
                            </div>
                        </div>
                        <div className="dealer-card full-width">
                            <div className="table-container">
                                <table className="dealer-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total Amount</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length > 0 ? (
                                            orders.map((order: any) => (
                                                <tr key={order.id}>
                                                    <td style={{ fontWeight: '600', color: '#8b5e3c' }}>{order.orderNumber || order.id.slice(-8)}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td>{order.items?.length || 0} items</td>
                                                    <td className="dealer-price">{formatPrice(order.totalAmount || 0)}</td>
                                                    <td>
                                                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                                                            {order.paymentStatus || 'PENDING'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => openOrderDetails(order)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                                                    {isLoadingOrders ? (
                                                        <div className="loading-spinner">Loading orders...</div>
                                                    ) : (
                                                        <div className="empty-state">
                                                            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                            <p>No orders found.</p>
                                                            <button onClick={() => setActiveTab('pricing')} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                                                                Browse Products
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {['inventory', 'history'].includes(activeTab) && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        </div>
                        <div className="dealer-card full-width">
                            <div className="placeholder-content">
                                <Package size={48} />
                                <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                                <p>This section displays your {activeTab} information.</p>
                                <button onClick={() => setActiveTab('overview')} className="btn btn-primary">Back to Dashboard</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Direct Quote Modal */}
            {showQuoteModal && (
                <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Request a Quote</h2>
                            <button className="close-btn" onClick={() => setShowQuoteModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateQuote} className="modal-body">
                            <div className="order-detail-section">
                                <h4>Business Details (Auto-filled)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Company</label>
                                        <p><strong>{user?.companyName || 'N/A'}</strong></p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>GSTIN</label>
                                        <p><strong>{user?.gstNumber || 'N/A'}</strong></p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Contact Person</label>
                                        <p><strong>{user?.name}</strong></p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Phone</label>
                                        <p><strong>{user?.phone}</strong></p>
                                    </div>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h4>Product Requirements</h4>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product</label>
                                    <select
                                        className="form-input"
                                        value={quoteFormData.productId}
                                        onChange={(e) => {
                                            const selectedProduct = products.find(p => p.id === e.target.value);
                                            setQuoteFormData({
                                                ...quoteFormData,
                                                productId: e.target.value,
                                                productName: selectedProduct?.name || ''
                                            });
                                        }}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} ({product.sku})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity (Sheets)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={quoteFormData.quantity}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, quantity: parseInt(e.target.value) })}
                                            min="1"
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Timeline</label>
                                        <select
                                            className="form-input"
                                            value={quoteFormData.timeline}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, timeline: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                                        >
                                            <option value="">Select timeline</option>
                                            <option value="immediate">Immediate</option>
                                            <option value="2-weeks">Within 2 weeks</option>
                                            <option value="1-month">Within 1 month</option>
                                            <option value="planning">Planning phase</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Additional Notes</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="Any specific requirements or instructions"
                                        value={quoteFormData.notes}
                                        onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                                        rows={3}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer" style={{ marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowQuoteModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={quoteLoading}>
                                    {quoteLoading ? 'Submitting...' : 'Submit Quote Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Quote Details Modal */}
            {showDetailsModal && selectedQuote && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Quote Details: {selectedQuote.quoteNumber || selectedQuote.id.slice(-8)}</h2>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-header-info">
                                <div className="info-item">
                                    <span className="label">Status</span>
                                    <span className={`status-badge ${selectedQuote.status?.toLowerCase()}`}>{selectedQuote.status}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Date</span>
                                    <span>{new Date(selectedQuote.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Total Amount</span>
                                    <span className="dealer-price">{formatPrice(selectedQuote.totalAmount || 0)}</span>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h4>Items</h4>
                                <table className="products-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Requested Qty</th>
                                            <th>Quoted Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedQuote.items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td>{item.product?.name || 'Custom Product'}</td>
                                                <td>{item.product?.sku || 'N/A'}</td>
                                                <td>{item.requestedQty} sheets</td>
                                                <td>{item.quotedPrice ? formatPrice(item.quotedPrice) : 'Pending'}</td>
                                                <td>{item.quotedPrice ? formatPrice(item.quotedPrice * item.requestedQty) : 'Pending'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedQuote.notes && (
                                <div className="order-detail-section">
                                    <h4>Notes</h4>
                                    <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                        {selectedQuote.notes}
                                    </div>
                                </div>
                            )}

                            {selectedQuote.adminNotes && (
                                <div className="order-detail-section">
                                    <h4>Admin Feedback</h4>
                                    <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e' }}>
                                        {selectedQuote.adminNotes}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowDetailsModal(false)}>Close</button>
                            {selectedQuote.status === 'APPROVED' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleConvertQuoteToOrder(selectedQuote)}
                                    disabled={isConverting}
                                >
                                    {isConverting ? 'Converting...' : 'Convert to Order'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && quoteToConvert && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0 }}>
                            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706', marginBottom: '1rem' }}>
                                <TrendingUp size={32} />
                            </div>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Confirm Conversion</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Are you sure you want to convert quote <strong>{quoteToConvert.quoteNumber || quoteToConvert.id.slice(-8)}</strong> to a firm order?
                        </p>
                        <div className="modal-footer" style={{ borderTop: 'none', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isConverting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={executeConversion}
                                disabled={isConverting}
                            >
                                {isConverting ? 'Converting...' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {showOrderDetailsModal && selectedOrder && (
                <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowOrderDetailsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Order Details: {selectedOrder.orderNumber || selectedOrder.id.slice(-8)}</h2>
                            <button className="close-btn" onClick={() => setShowOrderDetailsModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-header-info">
                                <div className="info-item">
                                    <span className="label">Status</span>
                                    <span className={`status-badge ${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Date</span>
                                    <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Total Amount</span>
                                    <span className="dealer-price">{formatPrice(selectedOrder.totalAmount || 0)}</span>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h4>Items</h4>
                                <table className="products-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Unit Price</th>
                                            <th>Tax</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td>{item.product?.name || 'Product'}</td>
                                                <td>{item.quantity} sheets</td>
                                                <td>{formatPrice(item.unitPrice)}</td>
                                                <td>{formatPrice(item.taxAmount)}</td>
                                                <td>{formatPrice(item.totalPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="order-detail-section">
                                <h4>Financials</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="info-item">
                                        <span className="label">Subtotal</span>
                                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Freight Charges</span>
                                        <span>{formatPrice(selectedOrder.freightCharges)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Total Tax</span>
                                        <span>{formatPrice(selectedOrder.totalTax)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label" style={{ fontWeight: 'bold' }}>Grand Total</span>
                                        <span className="dealer-price">{formatPrice(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.shippingAddress && (
                                <div className="order-detail-section">
                                    <h4>Shipping Address</h4>
                                    <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <p>{selectedOrder.shippingAddress.street}</p>
                                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowOrderDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Request Modal */}
            {showCreditRequestModal && (
                <div className="modal-overlay" onClick={() => setShowCreditRequestModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Credit Limit Increase</h2>
                            <button className="close-btn" onClick={() => setShowCreditRequestModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Request History Section */}
                        {myCreditRequests.length > 0 && (
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E8E6E3', background: '#FAF9F8' }}>
                                <h4 style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: '#57534E',
                                    marginBottom: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    Your Previous Requests
                                </h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {myCreditRequests.slice(0, 5).map((req: any) => (
                                        <div
                                            key={req.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.5rem 0',
                                                borderBottom: '1px solid #F0EFE8'
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontWeight: 500, color: '#1C1917' }}>
                                                    {formatPrice(req.amount)}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#78716C', marginLeft: '0.5rem' }}>
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '4px',
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em',
                                                background: req.status === 'APPROVED' ? '#E8F0E8' :
                                                    req.status === 'REJECTED' ? '#F5E8E8' : '#F5F0E8',
                                                color: req.status === 'APPROVED' ? '#5A7A5A' :
                                                    req.status === 'REJECTED' ? '#8A4A4A' : '#9A7A4A'
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleRequestCredit}>
                            <div className="form-group">
                                <label>Requested New Limit (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={creditRequestAmount}
                                    onChange={e => setCreditRequestAmount(e.target.value)}
                                    min={1}
                                    required
                                    placeholder="Enter total desired limit"
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                                    Current Limit: {formatPrice(user?.creditLimit ? Number(user.creditLimit) : dealerStats.creditLimit)}
                                </small>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Notes / Reason</label>
                                <textarea
                                    className="form-input"
                                    value={creditRequestNotes}
                                    onChange={e => setCreditRequestNotes(e.target.value)}
                                    placeholder="Why do you need this increase?"
                                    rows={3}
                                />
                            </div>
                            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowCreditRequestModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmittingCredit}>
                                    {isSubmittingCredit ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        padding: '1rem 1.5rem',
                        borderRadius: '8px',
                        backgroundColor: toast.type === 'success' ? '#5A7A5A' : '#8A4A4A',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        maxWidth: '400px',
                        animation: 'slideIn 0.3s ease'
                    }}
                >
                    <span style={{ fontSize: '1.25rem' }}>{toast.type === 'success' ? '✓' : '✕'}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            fontSize: '1.25rem',
                            opacity: 0.7
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default DealerDashboard;
