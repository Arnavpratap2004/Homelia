import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    Package,
    Truck,
    History,
    Settings,
    LogOut,
    TrendingUp,
    Star,
    Clock,
    CheckCircle,
    Eye,
    Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../data/products';
import './DealerDashboard.css';

const DealerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Demo dealer data
    const dealerStats = {
        totalOrders: 47,
        pendingOrders: 3,
        totalSpent: 4567000,
        creditLimit: 1000000,
        availableCredit: 650000,
        tier: 'Gold',
        discount: '12%'
    };

    // Demo products with dealer pricing
    const dealerProducts = [
        { id: '1', name: 'American Walnut Classic', sku: 'AWC-001', retailPrice: 2850, dealerPrice: 2450, stock: 'In Stock', moq: 25 },
        { id: '2', name: 'Nordic Oak Natural', sku: 'NON-002', retailPrice: 3100, dealerPrice: 2680, stock: 'In Stock', moq: 20 },
        { id: '3', name: 'Charcoal Slate', sku: 'CS-003', retailPrice: 3350, dealerPrice: 2890, stock: 'Low Stock', moq: 15 },
        { id: '4', name: 'Pure White Gloss', sku: 'PWG-004', retailPrice: 3700, dealerPrice: 3200, stock: 'In Stock', moq: 10 },
    ];

    // Demo orders
    const recentOrders = [
        { id: 'ORD-2024-0156', date: '2024-12-22', items: 5, total: 245000, status: 'processing' },
        { id: 'ORD-2024-0148', date: '2024-12-20', items: 3, total: 178500, status: 'shipped' },
        { id: 'ORD-2024-0139', date: '2024-12-18', items: 8, total: 456000, status: 'delivered' },
    ];

    // Demo quotes
    const activeQuotes = [
        { id: 'RFQ-2024-0089', date: '2024-12-22', products: 'Mixed Collection - 200 sheets', status: 'pending', estimated: 520000 },
        { id: 'RFQ-2024-0085', date: '2024-12-19', products: 'Durian Premium - 150 sheets', status: 'approved', estimated: 380000, validUntil: '2025-01-19' },
    ];

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="dealer-dashboard">
            {/* Sidebar */}
            <aside className="dealer-sidebar">
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
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={20} />
                        Order History
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
                                    {recentOrders.map(order => (
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
                                    ))}
                                </div>
                            </div>

                            <div className="dealer-card">
                                <div className="card-header">
                                    <h3>Active Quotations</h3>
                                    <Link to="/request-quote" className="btn btn-ghost btn-sm">Request Quote</Link>
                                </div>
                                <div className="quotes-list">
                                    {activeQuotes.map(quote => (
                                        <div key={quote.id} className="quote-item">
                                            <div className="quote-info">
                                                <span className="quote-id">{quote.id}</span>
                                                <span className="quote-products">{quote.products}</span>
                                            </div>
                                            <div className="quote-details">
                                                <span className="quote-amount">{formatPrice(quote.estimated)}</span>
                                                <span className={`status-badge ${quote.status}`}>{quote.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="dealer-content">
                        <div className="dealer-header">
                            <div>
                                <h1>Products & Dealer Pricing</h1>
                                <p>Exclusive dealer pricing with {dealerStats.discount} discount</p>
                            </div>
                            <Link to="/catalog" className="btn btn-primary">Browse Full Catalog</Link>
                        </div>

                        <div className="dealer-card full-width">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Retail Price</th>
                                        <th>Your Price</th>
                                        <th>Savings</th>
                                        <th>Stock</th>
                                        <th>MOQ</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dealerProducts.map(product => (
                                        <tr key={product.id}>
                                            <td><strong>{product.name}</strong></td>
                                            <td className="sku">{product.sku}</td>
                                            <td className="retail-price">{formatPrice(product.retailPrice)}</td>
                                            <td className="dealer-price">{formatPrice(product.dealerPrice)}</td>
                                            <td className="savings">
                                                -{Math.round(((product.retailPrice - product.dealerPrice) / product.retailPrice) * 100)}%
                                            </td>
                                            <td>
                                                <span className={`stock-badge ${product.stock === 'In Stock' ? 'in-stock' : 'low-stock'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>{product.moq} sheets</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm">Add to Order</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {['orders', 'quotes', 'inventory', 'history', 'settings'].includes(activeTab) && (
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
        </div>
    );
};

export default DealerDashboard;
