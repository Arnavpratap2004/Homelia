import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi, quotesApi, invoicesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
    Package,
    FileText,
    Heart,
    Settings,
    LogOut,
    Download,
    Eye,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { products, formatPrice } from '../data/products';
import './Dashboard.css';

import { useCart } from '../context/CartContext';
// ... other imports

const Dashboard = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { logout } = useAuth();

    // State declarations
    const [activeTab, setActiveTab] = useState('orders');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

    const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Default profile data
    const defaultProfile = {
        name: 'Rajesh Kumar',
        email: 'rajesh@interiorpro.in',
        phone: '+91 98765 43210',
        company: 'Interior Pro Designs',
        gstin: '27AABCU9603R1ZM',
        orderUpdates: true,
        quoteResponses: true,
        promotions: false
    };

    // Load profile from localStorage or use defaults
    const [profileForm, setProfileForm] = useState(() => {
        const saved = localStorage.getItem('homeliaProfile');
        if (saved) {
            try {
                return { ...defaultProfile, ...JSON.parse(saved) };
            } catch {
                return defaultProfile;
            }
        }
        return defaultProfile;
    });

    // Sign out handler
    const handleSignOut = async () => {
        try {
            await logout(); // Use AuthContext logout to properly clear tokens and user state
            clearCart(); // Clear cart on logout
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate('/');
    };

    // Save profile handler - persists to localStorage
    const handleSaveProfile = () => {
        localStorage.setItem('homeliaProfile', JSON.stringify(profileForm));
        setSaveMessage('Profile saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Demo data for user
    const demoUser = {
        name: profileForm.name,
        email: profileForm.email,
        company: profileForm.company,
        gstin: profileForm.gstin,
        phone: profileForm.phone
    };

    // Demo orders (used as fallback)
    const demoOrdersData = [
        {
            id: 'ORD-2024-0123',
            date: '2024-12-20',
            status: 'Delivered',
            items: 3,
            total: 145000,
            products: [
                { name: 'American Walnut Classic', qty: 25, price: 2450 },
                { name: 'Nordic Oak Natural', qty: 15, price: 2680 },
                { name: 'Pure White Gloss', qty: 10, price: 3200 }
            ],
            shippingAddress: 'Block A, Sunshine Complex, Andheri East, Mumbai - 400069',
            trackingId: 'DL123456789IN'
        },
        {
            id: 'ORD-2024-0098',
            date: '2024-12-15',
            status: 'Shipped',
            items: 5,
            total: 234500,
            products: [
                { name: 'Charcoal Slate', qty: 30, price: 2890 },
                { name: 'Urban Concrete Grey', qty: 40, price: 2550 },
                { name: 'Midnight Black Silk', qty: 20, price: 2780 }
            ],
            shippingAddress: 'Workshop 12, Industrial Area, Thane West, Mumbai - 400604',
            trackingId: 'DL987654321IN'
        },
        {
            id: 'ORD-2024-0076',
            date: '2024-12-08',
            status: 'Processing',
            items: 2,
            total: 58000,
            products: [
                { name: 'Bronze Metallic', qty: 10, price: 3100 },
                { name: 'Tropical Teak', qty: 12, price: 2390 }
            ],
            shippingAddress: 'Site Office, Green Valley Project, Powai, Mumbai - 400076',
            trackingId: null
        }
    ];

    // State for real orders from API
    const [orders, setOrders] = useState(demoOrdersData);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // Fetch user's orders from API
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const response = await ordersApi.list();
                if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                    // Map API orders to our format
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const apiOrders = (response.data as any[]).map(order => ({
                        id: order.orderNumber || order.id,
                        date: new Date(order.createdAt).toISOString().split('T')[0],
                        status: order.status,
                        items: order.items?.length || 0,
                        total: order.totalAmount,
                        products: order.items?.map((item: any) => ({
                            name: item.product?.name || 'Product',
                            qty: item.quantity,
                            price: item.unitPrice || item.price || 0
                        })) || [],
                        shippingAddress: order.shippingAddress
                            ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}`
                            : 'Address not available',
                        trackingId: null // Default to null if not available from API
                    }));
                    setOrders(apiOrders);
                } else {
                    // Use demo data if no orders
                    setOrders(demoOrdersData);
                }
            } catch (error) {
                console.log('Using demo order data (API not available)');
                setOrders(demoOrdersData);
            } finally {
                setIsLoadingOrders(false);
            }
        };
        fetchOrders();
    }, []);

    // Generate and download invoice
    const downloadInvoice = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const gstAmount = Math.round(order.total * 0.18);
        const grandTotal = order.total + gstAmount;
        const invoiceNumber = order.id.replace('ORD', 'INV');

        const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #8B5E34; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #8B5E34; }
        .logo-sub { font-size: 12px; color: #666; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 24px; color: #8B5E34; margin-bottom: 5px; }
        .invoice-title p { font-size: 14px; color: #666; }
        .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .party { width: 45%; }
        .party h3 { font-size: 12px; text-transform: uppercase; color: #8B5E34; margin-bottom: 10px; letter-spacing: 1px; }
        .party p { font-size: 13px; line-height: 1.6; }
        .party strong { display: block; font-size: 15px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #8B5E34; color: white; padding: 12px; text-align: left; font-size: 13px; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals tr td { border: none; padding: 8px 12px; }
        .totals .grand-total { background: #f8f4f0; font-weight: bold; font-size: 16px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        .gst-info { background: #f8f4f0; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 13px; }
        @media print { body { padding: 20px; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">Homelia</div>
            <div class="logo-sub">Premium Laminates</div>
        </div>
        <div class="invoice-title">
            <h1>TAX INVOICE</h1>
            <p>Invoice No: ${invoiceNumber}</p>
            <p>Date: ${order.date}</p>
        </div>
    </div>

    <div class="parties">
        <div class="party">
            <h3>Sold By</h3>
            <strong>Homelia Laminates</strong>
            <p>Near RPS More<br>Patna - 801503, Bihar</p>
            <p>GSTIN: 10AABCH1234A1ZB</p>
            <p>Phone: +91 98352 68202</p>
        </div>
        <div class="party">
            <h3>Bill To</h3>
            <strong>${demoUser.company}</strong>
            <p>${demoUser.name}</p>
            <p>${order.shippingAddress}</p>
            <p>GSTIN: ${demoUser.gstin}</p>
            <p>Phone: ${demoUser.phone}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Product</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.products.map((p, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${p.name}</td>
                    <td class="text-right">${p.qty}</td>
                    <td class="text-right">₹${p.price.toLocaleString('en-IN')}</td>
                    <td class="text-right">₹${(p.qty * p.price).toLocaleString('en-IN')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Subtotal</td>
            <td class="text-right">₹${order.total.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
            <td>CGST (9%)</td>
            <td class="text-right">₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
            <td>SGST (9%)</td>
            <td class="text-right">₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}</td>
        </tr>
        <tr class="grand-total">
            <td>Grand Total</td>
            <td class="text-right">₹${grandTotal.toLocaleString('en-IN')}</td>
        </tr>
    </table>

    <div class="gst-info">
        <strong>Amount in Words:</strong> Rupees ${numberToWords(grandTotal)} Only
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
        <p style="margin-top: 10px;">Homelia Laminates | arnavpratap2003@gmail.com | +91 98352 68202</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 30px; background: #8B5E34; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
            Print / Save as PDF
        </button>
    </div>
</body>
</html>`;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();
        }
    };

    // Helper function to convert number to words
    const numberToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (num === 0) return 'Zero';

        const convert = (n: number): string => {
            if (n < 20) return ones[n];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
            if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
            if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
            return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
        };

        return convert(Math.round(num));
    };



    const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

    interface Quote {
        id: string;
        date: string;
        status: string;
        products: string;
        items: {
            name: string;
            qty: number;
            price: number;
        }[];
        notes: string;
        estimatedTotal: number;
        validUntil?: string;
    }

    const demoQuotes: Quote[] = [
        {
            id: 'RFQ-2024-0045',
            date: '2024-12-18',
            status: 'Pending',
            products: 'Durian Decorative - 50 sheets',
            items: [
                { name: 'American Walnut Classic', qty: 30, price: 2450 },
                { name: 'Nordic Oak Natural', qty: 20, price: 2680 }
            ],
            notes: 'Need samples before bulk order. Delivery to Mumbai site.',
            estimatedTotal: 126100,
            validUntil: undefined
        }
    ];

    const demoInvoices = [
        {
            id: 'INV-2024-0123',
            orderId: 'ORD-2024-0123',
            date: '2024-12-20',
            amount: 171100,
            status: 'Paid'
        },
        {
            id: 'INV-2024-0098',
            orderId: 'ORD-2024-0098',
            date: '2024-12-15',
            amount: 276710,
            status: 'Paid'
        }
    ];

    const [quotes, setQuotes] = useState(demoQuotes);
    const [invoices, setInvoices] = useState(demoInvoices);


    // Fetch user's quotes from API
    useEffect(() => {
        const fetchQuotes = async () => {
            setIsLoadingQuotes(true);
            try {
                const response = await quotesApi.list();
                if (response.success && Array.isArray(response.data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const apiQuotes = (response.data as any[]).map(q => ({
                        id: q.quoteNumber,
                        date: new Date(q.createdAt).toISOString().split('T')[0],
                        status: q.status === 'REQUESTED' ? 'Pending' : q.status === 'QUOTED' ? 'Approved' : q.status,
                        products: `${q.items?.length || 0} Products`,
                        items: q.items?.map((item: any) => ({
                            name: item.product?.name || 'Product',
                            qty: item.requestedQty,
                            price: item.quotedPrice || 0
                        })) || [],
                        notes: q.notes,
                        estimatedTotal: q.totalAmount || 0,
                        validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : undefined
                    }));
                    setQuotes(apiQuotes.length ? apiQuotes : demoQuotes);
                } else {
                    setQuotes(demoQuotes);
                }
            } catch (error) {
                console.log('Using demo quote data (API not available)');
                setQuotes(demoQuotes);
            } finally {
                setIsLoadingQuotes(false);
            }
        };
        fetchQuotes();
    }, []);

    // Fetch user's invoices from API
    useEffect(() => {
        const fetchInvoices = async () => {
            setIsLoadingInvoices(true);
            try {
                const response = await invoicesApi.list();
                if (response.success && Array.isArray(response.data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const apiInvoices = (response.data as any[]).map(inv => ({
                        id: inv.invoiceNumber,
                        orderId: inv.order?.orderNumber || 'N/A',
                        date: new Date(inv.issuedAt).toISOString().split('T')[0],
                        amount: inv.totalAmount,
                        status: inv.paymentStatus === 'PAID' ? 'Paid' : 'Pending' // Simplified status mapping
                    }));
                    setInvoices(apiInvoices);
                } else {
                    setInvoices(demoInvoices);
                }
            } catch (error) {
                console.log('Using demo invoice data (API not available)');
                setInvoices(demoInvoices);
            } finally {
                setIsLoadingInvoices(false);
            }
        };
        fetchInvoices();
    }, []);

    const savedProducts = products.slice(0, 3);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-layout">
                    {/* Sidebar */}
                    <aside className="dashboard-sidebar">
                        <div className="user-card card">
                            <div className="user-avatar">
                                {(demoUser.name || '').split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <h3>{demoUser.name}</h3>
                            <p>{demoUser.company}</p>
                        </div>

                        <nav className="dashboard-nav">
                            <button
                                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package size={18} />
                                My Orders
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'quotes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('quotes')}
                            >
                                <FileText size={18} />
                                My Quotes
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
                                onClick={() => setActiveTab('invoices')}
                            >
                                <Download size={18} />
                                Invoices
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                                onClick={() => setActiveTab('favorites')}
                            >
                                <Heart size={18} />
                                Saved Items
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <Settings size={18} />
                                Profile & Settings
                            </button>
                        </nav>

                        <button className="nav-item logout" onClick={handleSignOut}>
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className="dashboard-main">
                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="tab-content">
                                <div className="tab-header">
                                    <h1>My Orders</h1>
                                    <Link to="/catalog" className="btn btn-primary">
                                        Place New Order
                                    </Link>
                                </div>

                                <div className="orders-list">
                                    {orders.map(order => (
                                        <div key={order.id} className="order-card card">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">{order.id}</span>
                                                    <span className="order-date">{order.date}</span>
                                                </div>
                                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="order-body">
                                                <div className="order-info">
                                                    <span>{order.items} items</span>
                                                    <span className="order-total">{formatPrice(order.total)}</span>
                                                </div>
                                                <div className="order-actions">
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => setSelectedOrder(order.id)}
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm">
                                                        <RefreshCw size={16} />
                                                        Reorder
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Detail Modal */}
                                {selectedOrder && (() => {
                                    const order = orders.find(o => o.id === selectedOrder);
                                    if (!order) return null;
                                    return (
                                        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                                            <div className="modal-content card" onClick={e => e.stopPropagation()}>
                                                <div className="modal-header">
                                                    <h2>Order Details</h2>
                                                    <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="order-detail-header">
                                                        <div>
                                                            <h3>{order.id}</h3>
                                                            <p>Placed on {order.date}</p>
                                                        </div>
                                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>

                                                    <div className="order-detail-section">
                                                        <h4>Products</h4>
                                                        <table className="order-products-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Product</th>
                                                                    <th>Qty</th>
                                                                    <th>Price</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.products.map((p, i) => (
                                                                    <tr key={i}>
                                                                        <td>{p.name}</td>
                                                                        <td>{p.qty}</td>
                                                                        <td>{formatPrice(p.price)}</td>
                                                                        <td>{formatPrice(p.qty * p.price)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td colSpan={3}><strong>Subtotal</strong></td>
                                                                    <td><strong>{formatPrice(order.total)}</strong></td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan={3}>GST (18%)</td>
                                                                    <td>{formatPrice(Math.round(order.total * 0.18))}</td>
                                                                </tr>
                                                                <tr className="total-row">
                                                                    <td colSpan={3}><strong>Grand Total</strong></td>
                                                                    <td><strong>{formatPrice(Math.round(order.total * 1.18))}</strong></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>

                                                    <div className="order-detail-section">
                                                        <h4>Shipping Address</h4>
                                                        <p>{order.shippingAddress}</p>
                                                    </div>

                                                    {order.trackingId && (
                                                        <div className="order-detail-section">
                                                            <h4>Tracking</h4>
                                                            <p>Tracking ID: <strong>{order.trackingId}</strong></p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="modal-footer">
                                                    <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
                                                    <button className="btn btn-primary" onClick={() => downloadInvoice(order.id)}>
                                                        <Download size={16} />
                                                        Download Invoice
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Quotes Tab */}
                        {activeTab === 'quotes' && (
                            <div className="tab-content">
                                <div className="tab-header">
                                    <h1>My Quotes</h1>
                                    <Link to="/request-quote" className="btn btn-primary">
                                        Request New Quote
                                    </Link>
                                </div>

                                <div className="quotes-list">
                                    {isLoadingQuotes ? (
                                        <div className="loading-state">
                                            <Loader2 className="animate-spin" size={32} />
                                            <p>Loading quotes...</p>
                                        </div>
                                    ) : quotes.map(quote => (
                                        <div key={quote.id} className="quote-card card">
                                            <div className="quote-header">
                                                <span className="quote-id">{quote.id}</span>
                                                <span className={`status-badge ${quote.status.toLowerCase()}`}>
                                                    {quote.status}
                                                </span>
                                            </div>
                                            <p className="quote-products">{quote.products}</p>
                                            <div className="quote-footer">
                                                <span className="quote-date">Requested: {quote.date}</span>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => setSelectedQuote(quote.id)}
                                                >
                                                    View Quote
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quote Detail Modal */}
                                {selectedQuote && (() => {
                                    const quote = quotes.find(q => q.id === selectedQuote);
                                    if (!quote) return null;
                                    return (
                                        <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
                                            <div className="modal-content card" onClick={e => e.stopPropagation()}>
                                                <div className="modal-header">
                                                    <h2>Quote Details</h2>
                                                    <button className="close-btn" onClick={() => setSelectedQuote(null)}>×</button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="order-detail-header">
                                                        <div>
                                                            <h3>{quote.id}</h3>
                                                            <p>Requested on {quote.date}</p>
                                                        </div>
                                                        <span className={`status-badge ${quote.status.toLowerCase()}`}>
                                                            {quote.status}
                                                        </span>
                                                    </div>

                                                    <div className="order-detail-section">
                                                        <h4>Requested Products</h4>
                                                        <table className="order-products-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Product</th>
                                                                    <th>Qty</th>
                                                                    <th>Est. Price</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {quote.items.map((item, i) => (
                                                                    <tr key={i}>
                                                                        <td>{item.name}</td>
                                                                        <td>{item.qty}</td>
                                                                        <td>{formatPrice(item.price)}</td>
                                                                        <td>{formatPrice(item.qty * item.price)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="total-row">
                                                                    <td colSpan={3}><strong>Estimated Total (excl. GST)</strong></td>
                                                                    <td><strong>{formatPrice(quote.estimatedTotal)}</strong></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>

                                                    <div className="order-detail-section">
                                                        <h4>Notes</h4>
                                                        <p>{quote.notes}</p>
                                                    </div>

                                                    {'validUntil' in quote && (
                                                        <div className="order-detail-section">
                                                            <h4>Valid Until</h4>
                                                            <p><strong>{quote.validUntil}</strong></p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="modal-footer">
                                                    <button className="btn btn-outline" onClick={() => setSelectedQuote(null)}>Close</button>
                                                    {quote.status === 'Approved' && (
                                                        <Link to="/checkout" className="btn btn-primary">
                                                            Convert to Order
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Invoices Tab */}
                        {activeTab === 'invoices' && (
                            <div className="tab-content">
                                <div className="tab-header">
                                    <h1>Invoices</h1>
                                </div>

                                <div className="invoices-table card">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Invoice No.</th>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingInvoices ? (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                            <Loader2 className="animate-spin" size={20} /> Loading invoices...
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No invoices found</td>
                                                </tr>
                                            ) : (
                                                invoices.map(invoice => (
                                                    <tr key={invoice.id}>
                                                        <td>{invoice.id}</td>
                                                        <td>{invoice.date}</td>
                                                        <td>{formatPrice(invoice.amount)}</td>
                                                        <td>
                                                            <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => downloadInvoice(invoice.orderId)}
                                                            >
                                                                <Download size={16} />
                                                                PDF
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Favorites Tab */}
                        {activeTab === 'favorites' && (
                            <div className="tab-content">
                                <div className="tab-header">
                                    <h1>Saved Items</h1>
                                </div>

                                <div className="favorites-grid">
                                    {savedProducts.map(product => (
                                        <Link to={`/product/${product.id}`} key={product.id} className="favorite-card card">
                                            <div
                                                className="favorite-image"
                                                style={{ background: product.colors[0] }}
                                            />
                                            <div className="favorite-info">
                                                <h3>{product.name}</h3>
                                                <p>{product.texture} • {product.finish}</p>
                                                <span className="favorite-price">{formatPrice(product.price)}/sheet</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="tab-content">
                                <div className="tab-header">
                                    <h1>Profile & Settings</h1>
                                </div>

                                <div className="profile-sections">
                                    <div className="profile-section card">
                                        <h2>Personal Information</h2>
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>Full Name</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="profile-field">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    className="input"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="profile-field">
                                                <label>Phone</label>
                                                <input
                                                    type="tel"
                                                    className="input"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-section card">
                                        <h2>Business Details</h2>
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>Company Name</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileForm.company}
                                                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                                                />
                                            </div>
                                            <div className="profile-field">
                                                <label>GSTIN</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileForm.gstin}
                                                    onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-section card">
                                        <h2>Notifications</h2>
                                        <div className="notification-options">
                                            <label className="notification-option">
                                                <input
                                                    type="checkbox"
                                                    checked={profileForm.orderUpdates}
                                                    onChange={(e) => setProfileForm({ ...profileForm, orderUpdates: e.target.checked })}
                                                />
                                                <div>
                                                    <strong>Order Updates</strong>
                                                    <span>Get notified about order status changes</span>
                                                </div>
                                            </label>
                                            <label className="notification-option">
                                                <input
                                                    type="checkbox"
                                                    checked={profileForm.quoteResponses}
                                                    onChange={(e) => setProfileForm({ ...profileForm, quoteResponses: e.target.checked })}
                                                />
                                                <div>
                                                    <strong>Quote Responses</strong>
                                                    <span>Receive alerts when quotes are ready</span>
                                                </div>
                                            </label>
                                            <label className="notification-option">
                                                <input
                                                    type="checkbox"
                                                    checked={profileForm.promotions}
                                                    onChange={(e) => setProfileForm({ ...profileForm, promotions: e.target.checked })}
                                                />
                                                <div>
                                                    <strong>Promotions</strong>
                                                    <span>Special offers and new arrivals</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {saveMessage && (
                                        <div className="save-success-message">
                                            ✓ {saveMessage}
                                        </div>
                                    )}

                                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
