import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    FileText,
    BarChart3,
    Bell,
    Settings,
    LogOut,
    TrendingUp,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
    Check,
    X,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ordersApi, quotesApi } from '../../api';
import { formatPrice } from '../../data/products';
import './AdminDashboard.css';

interface Order {
    id: string;
    orderNumber: string;
    user?: { name: string; companyName?: string };
    totalAmount: number;
    status: string;
    createdAt: string;
    items?: Array<{ product?: { name: string }; quantity: number; unitPrice: number }>;
    shippingAddress?: { street?: string; city?: string; state?: string; pincode?: string };
}

interface Quote {
    id: string;
    quoteNumber: string;
    user?: { name: string; companyName?: string };
    status: string;
    createdAt: string;
    notes?: string;
    totalAmount?: number;
    items?: Array<{ product?: { name: string }; requestedQty: number; quotedPrice?: number }>;
}

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [newOrderStatus, setNewOrderStatus] = useState<string>('');

    // Demo KPIs
    const kpis = {
        totalRevenue: 8945000,
        pendingOrders: 23,
        activeQuotes: 12,
        totalUsers: 156,
        monthlyGrowth: 18.5,
        todayOrders: 8
    };

    // Demo recent orders
    const recentOrders = [
        { id: 'ORD-2024-0156', customer: 'Interior Pro Designs', amount: 145000, status: 'pending', date: '2024-12-22' },
        { id: 'ORD-2024-0155', customer: 'ABC Contractors', amount: 89500, status: 'processing', date: '2024-12-22' },
        { id: 'ORD-2024-0154', customer: 'Design Hub', amount: 234000, status: 'shipped', date: '2024-12-21' },
        { id: 'ORD-2024-0153', customer: 'Build Masters', amount: 167500, status: 'delivered', date: '2024-12-21' },
    ];

    // Demo pending approvals
    const pendingApprovals = [
        { id: 'RFQ-2024-0089', type: 'quote', customer: 'Sharma Interiors', amount: 456000, date: '2024-12-22' },
        { id: 'REG-2024-0034', type: 'dealer', customer: 'Mumbai Laminates Co.', status: 'pending', date: '2024-12-22' },
        { id: 'RFQ-2024-0088', type: 'quote', customer: 'Creative Spaces', amount: 178000, date: '2024-12-21' },
    ];

    // Demo users (fallback)
    const demoUsers = [
        { id: '1', name: 'Rajesh Kumar', email: 'rajesh@interiorpro.in', phone: '+91 98765 43210', role: 'B2B_CUSTOMER', status: 'active', companyName: 'Interior Pro Designs', createdAt: '2024-11-15' },
        { id: '2', name: 'Priya Sharma', email: 'priya@sharma-interiors.com', phone: '+91 98765 43211', role: 'DEALER', status: 'active', companyName: 'Sharma Interiors', createdAt: '2024-10-20' },
        { id: '3', name: 'Amit Patel', email: 'amit@mumbailaminates.com', phone: '+91 98765 43212', role: 'DEALER', status: 'pending', companyName: 'Mumbai Laminates Co.', createdAt: '2024-12-20' },
        { id: '4', name: 'Neha Gupta', email: 'neha@designhub.in', phone: '+91 98765 43213', role: 'B2B_CUSTOMER', status: 'active', companyName: 'Design Hub', createdAt: '2024-09-10' },
    ];

    // User management states
    const [usersList, setUsersList] = useState<typeof demoUsers>(demoUsers);
    const [filteredUsers, setFilteredUsers] = useState<typeof demoUsers>(demoUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState<typeof demoUsers[0] | null>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'B2B_CUSTOMER',
        companyName: ''
    });

    // Fetch orders when orders tab is active
    useEffect(() => {
        if (activeTab === 'orders' && orders.length === 0) {
            fetchOrders();
        }
    }, [activeTab]);

    // Fetch quotes when quotes tab is active
    useEffect(() => {
        if (activeTab === 'quotes' && quotes.length === 0) {
            fetchQuotes();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const response = await ordersApi.list();
            console.log('Orders API response:', response);

            // Handle paginated response (data might be in response.data.data or response.data)
            const ordersData = (response as any).data?.data || (response as any).data || [];

            if (response.success && ordersData && ordersData.length > 0) {
                // Convert Prisma Decimal values to numbers
                const parsedOrders = ordersData.map((o: any) => ({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    user: o.user,
                    totalAmount: typeof o.totalAmount === 'object' ? parseFloat(o.totalAmount) : parseFloat(o.totalAmount) || 0,
                    status: o.status,
                    createdAt: o.createdAt,
                    items: o.items?.map((item: any) => ({
                        product: item.product,
                        quantity: item.quantity,
                        unitPrice: typeof item.unitPrice === 'object' ? parseFloat(item.unitPrice) : parseFloat(item.unitPrice) || 0
                    })),
                    shippingAddress: o.shippingAddress
                }));
                setOrders(parsedOrders);
            } else {
                // Use demo data when no real orders exist
                setOrders(recentOrders.map(o => ({
                    id: o.id,
                    orderNumber: o.id,
                    user: { name: o.customer },
                    totalAmount: o.amount,
                    status: o.status.toUpperCase(),
                    createdAt: o.date
                })));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Use demo data as fallback
            setOrders(recentOrders.map(o => ({
                id: o.id,
                orderNumber: o.id,
                user: { name: o.customer },
                totalAmount: o.amount,
                status: o.status.toUpperCase(),
                createdAt: o.date
            })));
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchQuotes = async () => {
        setIsLoadingQuotes(true);
        try {
            const response = await quotesApi.list();
            if (response.success && response.data && (response.data as Quote[]).length > 0) {
                setQuotes(response.data as Quote[]);
            } else {
                // Use demo data when no real quotes exist
                setQuotes(pendingApprovals.filter(p => p.type === 'quote').map(p => ({
                    id: p.id,
                    quoteNumber: p.id,
                    user: { name: p.customer },
                    status: 'PENDING',
                    createdAt: p.date,
                    totalAmount: p.amount,
                    notes: `Amount: ${p.amount}`
                })));
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            // Use demo data as fallback
            setQuotes(pendingApprovals.filter(p => p.type === 'quote').map(p => ({
                id: p.id,
                quoteNumber: p.id,
                user: { name: p.customer },
                status: 'PENDING',
                createdAt: p.date,
                totalAmount: p.amount,
                notes: `Amount: ${p.amount}`
            })));
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    // View order details
    const handleViewOrder = (order: Order | typeof recentOrders[0]) => {
        console.log('handleViewOrder called with:', order);

        // Helper to convert Prisma Decimal to number
        const toNumber = (val: unknown): number => {
            if (typeof val === 'number') return val;
            if (val && typeof val === 'object' && 'toNumber' in val) {
                return (val as { toNumber: () => number }).toNumber();
            }
            if (typeof val === 'string') return parseFloat(val) || 0;
            return 0;
        };

        // Convert to Order format
        const orderDetail: Order = 'orderNumber' in order
            ? {
                id: order.id,
                orderNumber: order.orderNumber,
                user: order.user,
                totalAmount: toNumber(order.totalAmount),
                status: order.status,
                createdAt: order.createdAt,
                items: order.items?.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    unitPrice: toNumber(item.unitPrice)
                })),
                shippingAddress: order.shippingAddress
            }
            : {
                id: order.id,
                orderNumber: order.id,
                user: { name: order.customer },
                totalAmount: order.amount,
                status: order.status.toUpperCase(),
                createdAt: order.date,
                items: [
                    { product: { name: 'American Walnut Classic' }, quantity: 25, unitPrice: 2450 },
                    { product: { name: 'Nordic Oak Natural' }, quantity: 15, unitPrice: 2680 },
                ],
                shippingAddress: { street: 'Block A, Sunshine Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400069' }
            };

        console.log('Setting selectedOrder:', orderDetail);
        setSelectedOrder(orderDetail);
        setNewOrderStatus(orderDetail.status);
    };

    // Handle approve quote
    const handleApproveQuote = async (quoteId: string) => {
        try {
            const response = await quotesApi.approve(quoteId);
            if (response.success) {
                setActionMessage(`Quote ${quoteId} approved successfully!`);
                // Update local state
                setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'APPROVED' } : q));
            } else {
                setActionMessage(`Failed to approve: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error approving quote:', error);
            // Still update locally for demo data
            setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'APPROVED' } : q));
            setActionMessage('Quote approved (demo mode)');
        }
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Handle reject quote
    const handleRejectQuote = async (quoteId: string) => {
        try {
            const response = await quotesApi.reject(quoteId, 'Rejected by admin');
            if (response.success) {
                setActionMessage(`Quote ${quoteId} rejected.`);
                // Update local state
                setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'REJECTED' } : q));
            } else {
                setActionMessage(`Failed to reject: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting quote:', error);
            // Still update locally for demo data
            setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'REJECTED' } : q));
            setActionMessage('Quote rejected (demo mode)');
        }
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Handle update order status
    const handleUpdateOrderStatus = async () => {
        if (!selectedOrder || !newOrderStatus) {
            setActionMessage('Please select a status');
            setTimeout(() => setActionMessage(null), 3000);
            return;
        }

        try {
            // Call backend API to persist the change
            const response = await ordersApi.updateStatus(selectedOrder.id, newOrderStatus);

            if (response.success) {
                // Update local state
                setOrders(prev => prev.map(o =>
                    o.id === selectedOrder.id ? { ...o, status: newOrderStatus } : o
                ));

                // Update selected order display
                setSelectedOrder({ ...selectedOrder, status: newOrderStatus });

                setActionMessage(`Order ${selectedOrder.orderNumber} status updated to ${newOrderStatus}!`);
            } else {
                setActionMessage(`Failed to update status: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            // Still update locally for demo purposes
            setOrders(prev => prev.map(o =>
                o.id === selectedOrder.id ? { ...o, status: newOrderStatus } : o
            ));
            setSelectedOrder({ ...selectedOrder, status: newOrderStatus });
            setActionMessage(`Order ${selectedOrder.orderNumber} status updated locally (demo mode)`);
        }

        setTimeout(() => setActionMessage(null), 3000);
    };

    // Handle approve pending approval (quote or dealer)
    const handleApproveItem = (itemId: string, type: string) => {
        setActionMessage(`${type === 'quote' ? 'Quote' : 'Dealer registration'} ${itemId} approved!`);
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Handle reject pending approval
    const handleRejectItem = (itemId: string, type: string) => {
        setActionMessage(`${type === 'quote' ? 'Quote' : 'Dealer registration'} ${itemId} rejected.`);
        setTimeout(() => setActionMessage(null), 3000);
    };

    // User management: Filter users based on search, role, and status
    useEffect(() => {
        let result = usersList;

        if (searchQuery) {
            result = result.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.companyName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (roleFilter) {
            result = result.filter(u => u.role === roleFilter);
        }

        if (statusFilter) {
            result = result.filter(u => u.status === statusFilter);
        }

        setFilteredUsers(result);
    }, [searchQuery, roleFilter, statusFilter, usersList]);

    // User management: View user details
    const handleViewUser = (userItem: typeof demoUsers[0]) => {
        setSelectedUser(userItem);
    };

    // User management: Approve user
    const handleApproveUser = (userId: string) => {
        setUsersList(prev => prev.map(u =>
            u.id === userId ? { ...u, status: 'active' } : u
        ));
        setActionMessage('User approved successfully!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    // User management: Reject/suspend user
    const handleRejectUser = (userId: string) => {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setActionMessage('User rejected and removed.');
        setTimeout(() => setActionMessage(null), 3000);
    };

    // User management: Add new user
    const handleAddUser = () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setActionMessage('Please fill in all required fields');
            setTimeout(() => setActionMessage(null), 3000);
            return;
        }

        const newUserObj = {
            id: `new-${Date.now()}`,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone || '+91 00000 00000',
            role: newUser.role,
            status: 'active',
            companyName: newUser.companyName || 'N/A',
            createdAt: new Date().toISOString().split('T')[0]
        };

        setUsersList(prev => [...prev, newUserObj]);
        setShowAddUserModal(false);
        setNewUser({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'B2B_CUSTOMER',
            companyName: ''
        });
        setActionMessage('User added successfully!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    return (
        <div className="admin-dashboard">
            {/* Action Message Toast */}
            {actionMessage && (
                <div className="action-toast">
                    <CheckCircle size={18} />
                    {actionMessage}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-header">
                                <div>
                                    <h3>{selectedOrder.orderNumber}</h3>
                                    <p>Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>

                            <div className="order-detail-section">
                                <h4>Customer</h4>
                                <p><strong>{selectedOrder.user?.companyName || selectedOrder.user?.name || 'Customer'}</strong></p>
                            </div>

                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="order-detail-section">
                                    <h4>Products</h4>
                                    <table className="order-items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.product?.name || 'Product'}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatPrice(item.unitPrice)}</td>
                                                    <td>{formatPrice(item.quantity * item.unitPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedOrder.shippingAddress && (
                                <div className="order-detail-section">
                                    <h4>Shipping Address</h4>
                                    <p>
                                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}<br />
                                        {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                                    </p>
                                </div>
                            )}

                            <div className="order-detail-section">
                                <h4>Order Total</h4>
                                <p className="order-total-amount">{formatPrice(selectedOrder.totalAmount)}</p>
                            </div>

                            <div className="order-detail-section">
                                <h4>Update Status</h4>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                    value={newOrderStatus || selectedOrder.status}
                                    onChange={(e) => setNewOrderStatus(e.target.value)}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => { setSelectedOrder(null); setNewOrderStatus(''); }}>Close</button>
                            <button className="btn btn-primary" onClick={handleUpdateOrderStatus}>Update Status</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Detail Modal */}
            {selectedQuote && (
                <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Quote Details</h2>
                            <button className="close-btn" onClick={() => setSelectedQuote(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-header">
                                <div>
                                    <h3>{selectedQuote.quoteNumber}</h3>
                                    <p>Submitted on {new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`status-badge ${selectedQuote.status.toLowerCase()}`}>
                                    {selectedQuote.status}
                                </span>
                            </div>

                            <div className="order-detail-section">
                                <h4>Requested By</h4>
                                <p><strong>{selectedQuote.user?.companyName || selectedQuote.user?.name || 'Customer'}</strong></p>
                            </div>

                            {selectedQuote.items && selectedQuote.items.length > 0 && (
                                <div className="order-detail-section">
                                    <h4>Requested Products</h4>
                                    <table className="order-items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Quoted Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedQuote.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.product?.name || 'Product'}</td>
                                                    <td>{item.requestedQty}</td>
                                                    <td>{item.quotedPrice ? formatPrice(item.quotedPrice) : 'Pending'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedQuote.notes && (
                                <div className="order-detail-section">
                                    <h4>Notes</h4>
                                    <p>{selectedQuote.notes}</p>
                                </div>
                            )}

                            {selectedQuote.totalAmount && (
                                <div className="order-detail-section">
                                    <h4>Total Amount</h4>
                                    <p className="order-total-amount">{formatPrice(selectedQuote.totalAmount)}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setSelectedQuote(null)}>Close</button>
                            {selectedQuote.status === 'PENDING' && (
                                <>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => { handleRejectQuote(selectedQuote.id); setSelectedQuote(null); }}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => { handleApproveQuote(selectedQuote.id); setSelectedQuote(null); }}
                                    >
                                        Approve Quote
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <div className="logo-icon">H</div>
                    <div className="logo-text">
                        <span className="logo-name">Homelia</span>
                        <span className="logo-badge">Admin</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingCart size={20} />
                        Orders
                        <span className="nav-badge">{kpis.pendingOrders}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'quotes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quotes')}
                    >
                        <FileText size={20} />
                        Quotes
                        <span className="nav-badge">{kpis.activeQuotes}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} />
                        Users
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={20} />
                        Products
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <BarChart3 size={20} />
                        Reports
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell size={20} />
                        Notifications
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} />
                        Settings
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

                <div className="admin-user">
                    <div className="admin-avatar">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="admin-user-info">
                        <span className="admin-user-name">{user?.name || 'Admin'}</span>
                        <span className="admin-user-role">Administrator</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Dashboard Overview</h1>
                            <p>Welcome back, {user?.name || 'Admin'}!</p>
                        </div>

                        {/* KPI Cards */}
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-icon revenue">
                                    <DollarSign size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{formatPrice(kpis.totalRevenue)}</span>
                                    <span className="kpi-label">Total Revenue</span>
                                </div>
                                <div className="kpi-trend up">
                                    <TrendingUp size={16} />
                                    +{kpis.monthlyGrowth}%
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon orders">
                                    <ShoppingCart size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{kpis.todayOrders}</span>
                                    <span className="kpi-label">Today's Orders</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{kpis.pendingOrders}</span>
                                    <span className="kpi-label">Pending Orders</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon users">
                                    <Users size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{kpis.totalUsers}</span>
                                    <span className="kpi-label">Total Users</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="admin-grid">
                            <div className="admin-card">
                                <div className="card-header">
                                    <h3>Recent Orders</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('orders')}>View All</button>
                                </div>
                                <div className="orders-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map(order => (
                                                <tr key={order.id}>
                                                    <td><strong>{order.id}</strong></td>
                                                    <td>{order.customer}</td>
                                                    <td>{formatPrice(order.amount)}</td>
                                                    <td>
                                                        <span className={`status-badge ${order.status}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleViewOrder(order)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="admin-card">
                                <div className="card-header">
                                    <h3>Pending Approvals</h3>
                                    <span className="badge-count">{pendingApprovals.length}</span>
                                </div>
                                <div className="approvals-list">
                                    {pendingApprovals.map(item => (
                                        <div key={item.id} className="approval-item">
                                            <div className="approval-icon">
                                                {item.type === 'quote' ? <FileText size={20} /> : <Users size={20} />}
                                            </div>
                                            <div className="approval-info">
                                                <span className="approval-id">{item.id}</span>
                                                <span className="approval-customer">{item.customer}</span>
                                                {item.amount && <span className="approval-amount">{formatPrice(item.amount)}</span>}
                                            </div>
                                            <div className="approval-actions">
                                                <button
                                                    className="approve-btn"
                                                    onClick={() => handleApproveItem(item.id, item.type)}
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className="reject-btn"
                                                    onClick={() => handleRejectItem(item.id, item.type)}
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>User Management</h1>
                            <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
                                Add User
                            </button>
                        </div>

                        <div className="admin-card full-width">
                            <div className="filters-bar">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <select
                                    className="filter-select"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="DEALER">Dealers</option>
                                    <option value="B2B_CUSTOMER">B2B Customers</option>
                                </select>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Company</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td><strong>{u.name}</strong></td>
                                            <td>{u.email}</td>
                                            <td>{u.companyName}</td>
                                            <td>
                                                <span className={`role-badge ${u.role.toLowerCase()}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${u.status}`}>
                                                    {u.status === 'active' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="View User"
                                                    onClick={() => handleViewUser(u)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {u.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            title="Approve"
                                                            onClick={() => handleApproveUser(u.id)}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            title="Reject"
                                                            onClick={() => handleRejectUser(u.id)}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* User Detail Modal */}
                {selectedUser && (
                    <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>User Details</h2>
                                <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="order-detail-header">
                                    <div>
                                        <h3>{selectedUser.name}</h3>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                    <span className={`status-badge ${selectedUser.status}`}>
                                        {selectedUser.status}
                                    </span>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Contact Information</h4>
                                    <p><strong>Phone:</strong> {selectedUser.phone}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Company Details</h4>
                                    <p><strong>Company:</strong> {selectedUser.companyName}</p>
                                    <p><strong>Role:</strong> {selectedUser.role.replace('_', ' ')}</p>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Account Information</h4>
                                    <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {selectedUser.status}</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setSelectedUser(null)}>Close</button>
                                {selectedUser.status === 'pending' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            handleApproveUser(selectedUser.id);
                                            setSelectedUser(null);
                                        }}
                                    >
                                        Approve User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add User Modal */}
                {showAddUserModal && (
                    <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add New User</h2>
                                <button className="close-btn" onClick={() => setShowAddUserModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        className="search-input"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        className="search-input"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        className="search-input"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        className="search-input"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        className="filter-select"
                                        style={{ width: '100%' }}
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="B2B_CUSTOMER">B2B Customer</option>
                                        <option value="DEALER">Dealer</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        className="search-input"
                                        value={newUser.companyName}
                                        onChange={(e) => setNewUser({ ...newUser, companyName: e.target.value })}
                                        placeholder="Enter company name"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleAddUser}>Add User</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Order Management</h1>
                            <button className="btn btn-outline" onClick={fetchOrders}>
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>
                        <div className="admin-card full-width">
                            {isLoadingOrders ? (
                                <div className="placeholder-content">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p>Loading orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="placeholder-content">
                                    <ShoppingCart size={48} />
                                    <h3>No Orders Yet</h3>
                                    <p>Orders will appear here when customers place them.</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td><strong>{order.orderNumber}</strong></td>
                                                <td>{order.user?.companyName || order.user?.name || 'Customer'}</td>
                                                <td>{formatPrice(order.totalAmount)}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleViewOrder(order)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Quote Requests</h1>
                            <button className="btn btn-outline" onClick={fetchQuotes}>
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>
                        <div className="admin-card full-width">
                            {isLoadingQuotes ? (
                                <div className="placeholder-content">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p>Loading quotes...</p>
                                </div>
                            ) : quotes.length === 0 ? (
                                <div className="placeholder-content">
                                    <FileText size={48} />
                                    <h3>No Quote Requests</h3>
                                    <p>Quote requests will appear here when customers submit them.</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Quote #</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotes.map(quote => (
                                            <tr key={quote.id}>
                                                <td><strong>{quote.quoteNumber}</strong></td>
                                                <td>{quote.user?.companyName || quote.user?.name || 'Customer'}</td>
                                                <td>{quote.totalAmount ? formatPrice(quote.totalAmount) : '-'}</td>
                                                <td>
                                                    <span className={`status-badge ${quote.status.toLowerCase()}`}>
                                                        {quote.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setSelectedQuote(quote)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {quote.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleApproveQuote(quote.id)}
                                                                title="Approve Quote"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleRejectQuote(quote.id)}
                                                                title="Reject Quote"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <div>
                                <h1>Product Catalog</h1>
                                <p>Manage your laminate collection</p>
                            </div>
                            <Link to="/catalog" className="btn btn-primary">
                                <Package size={16} /> View Full Catalog
                            </Link>
                        </div>
                        <div className="admin-card full-width">
                            <div className="card-header">
                                <h3>Catalog Overview</h3>
                            </div>
                            <div className="placeholder-content">
                                <Package size={48} />
                                <h3>Product Management</h3>
                                <p>Your product catalog is managed through the main catalog page. View, filter, and manage all laminates from our curated collection.</p>
                                <Link to="/catalog" className="btn btn-outline">Browse Catalog</Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <div>
                                <h1>Analytics & Reports</h1>
                                <p>Business insights and performance metrics</p>
                            </div>
                        </div>
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-icon revenue">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">+18.5%</span>
                                    <span className="kpi-label">Monthly Growth</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon orders">
                                    <ShoppingCart size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">156</span>
                                    <span className="kpi-label">Orders This Month</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon users">
                                    <Users size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">24</span>
                                    <span className="kpi-label">New Customers</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon pending">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">89%</span>
                                    <span className="kpi-label">Order Fulfillment</span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-card full-width">
                            <div className="card-header">
                                <h3>Performance Summary</h3>
                            </div>
                            <div className="placeholder-content">
                                <BarChart3 size={48} />
                                <h3>Detailed Reports Coming Soon</h3>
                                <p>Advanced analytics and exportable reports will be available in a future update. Track sales, inventory, and customer trends.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <div>
                                <h1>Notifications</h1>
                                <p>Stay updated with system alerts</p>
                            </div>
                        </div>
                        <div className="admin-card full-width">
                            <div className="orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Message</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="status-badge approved">New Order</span></td>
                                            <td>Order #ORD-2024-0156 received from Interior Pro Designs</td>
                                            <td>2 hours ago</td>
                                        </tr>
                                        <tr>
                                            <td><span className="status-badge pending">Quote Request</span></td>
                                            <td>New quote request from Sharma Interiors for bulk order</td>
                                            <td>5 hours ago</td>
                                        </tr>
                                        <tr>
                                            <td><span className="status-badge processing">Registration</span></td>
                                            <td>New dealer registration from Mumbai Laminates Co.</td>
                                            <td>1 day ago</td>
                                        </tr>
                                        <tr>
                                            <td><span className="status-badge delivered">Completed</span></td>
                                            <td>Order #ORD-2024-0152 has been delivered successfully</td>
                                            <td>2 days ago</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <div>
                                <h1>Settings</h1>
                                <p>Configure your admin preferences</p>
                            </div>
                        </div>
                        <div className="admin-grid">
                            <div className="admin-card">
                                <div className="card-header">
                                    <h3>Account Settings</h3>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Admin Name</label>
                                        <input type="text" className="search-input" value={user?.name || 'Admin'} readOnly />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" className="search-input" value={user?.email || 'admin@homelia.com'} readOnly />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <input type="text" className="search-input" value="Administrator" readOnly />
                                    </div>
                                </div>
                            </div>
                            <div className="admin-card">
                                <div className="card-header">
                                    <h3>Preferences</h3>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Notifications</label>
                                        <select className="filter-select" style={{ width: '100%' }}>
                                            <option value="all">All Notifications</option>
                                            <option value="important">Important Only</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Currency Display</label>
                                        <select className="filter-select" style={{ width: '100%' }}>
                                            <option value="inr">₹ INR</option>
                                            <option value="usd">$ USD</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date Format</label>
                                        <select className="filter-select" style={{ width: '100%' }}>
                                            <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                                            <option value="mm-dd-yyyy">MM-DD-YYYY</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
