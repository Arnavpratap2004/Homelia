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
    RefreshCw,
    Menu,
    Plus,
    Trash2,
    Download
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { ordersApi, quotesApi, authApi, usersApi, adminApi, notificationsApi, creditApi } from '../../api';
import { formatPrice } from '../../data/products';
import ManualInvoiceModal from '../../components/admin/ManualInvoiceModal';
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

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const AdminDashboard = () => {
    const { user, logout, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [approvalsList, setApprovalsList] = useState<any[]>([]);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
    const [dashboardRecentOrders, setDashboardRecentOrders] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);


    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [newOrderStatus, setNewOrderStatus] = useState<string>('');

    // Credit action confirmation modal
    const [creditActionModal, setCreditActionModal] = useState<{
        show: boolean;
        type: 'approve' | 'reject';
        request: any | null;
    }>({ show: false, type: 'approve', request: null });
    const [rejectReason, setRejectReason] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Admin profile form state
    const [adminProfileForm, setAdminProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Sync admin profile form when user data changes
    useEffect(() => {
        if (user) {
            setAdminProfileForm({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    // User management states
    const [usersList, setUsersList] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
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

    useEffect(() => {
        if (activeTab === 'quotes' && quotes.length === 0) {
            fetchQuotes();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'credit-requests') {
            fetchCreditRequests();
        }
    }, [activeTab]);


    // Fetch dashboard data when overview is active
    useEffect(() => {
        if (activeTab === 'overview') {
            fetchDashboardData();
            fetchPendingApprovals();
        } else if (activeTab === 'notifications') {
            fetchNotifications();
        }
    }, [activeTab]);


    const fetchDashboardData = async () => {
        setIsLoadingDashboard(true);
        try {
            const [statsRes, ordersRes] = await Promise.all([
                adminApi.getDashboardStats(),
                ordersApi.list({ limit: 5 })
            ]);

            if (statsRes.success) {
                setDashboardStats(statsRes.data);
            }

            if (ordersRes.success) {
                const ordersData = (ordersRes as any).data?.data || (ordersRes as any).data || [];
                const parsedOrders = ordersData.map((o: any) => ({
                    id: o.orderNumber || o.id,
                    customer: o.user?.companyName || o.user?.name || 'Customer',
                    amount: typeof o.totalAmount === 'object' ? parseFloat(o.totalAmount) : parseFloat(o.totalAmount) || 0,
                    status: o.status,
                    date: o.createdAt.split('T')[0],
                    originalData: o // Keep for handleViewOrder
                }));
                setDashboardRecentOrders(parsedOrders);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoadingDashboard(false);
        }
    };

    const fetchPendingApprovals = async () => {

        setIsLoadingApprovals(true);
        try {
            const [quotesRes, usersRes] = await Promise.all([
                quotesApi.list({ status: 'REQUESTED' }),
                usersApi.list({ isVerified: false, isActive: true })
            ]);

            const realApprovals: any[] = [];

            if (quotesRes.success && quotesRes.data) {
                const qList = (quotesRes.data as any[]).map(q => ({
                    id: q.id,
                    type: 'quote',
                    customer: q.user?.companyName || q.user?.name || 'Customer',
                    amount: (q.totalAmount && typeof q.totalAmount === 'object') ? q.totalAmount.toNumber() : q.totalAmount || 0,
                    date: q.createdAt,
                    number: q.quoteNumber
                }));
                realApprovals.push(...qList);
            }

            if (usersRes.success && usersRes.data) {
                const uList = (usersRes.data as any[]).map(u => ({
                    id: u.id,
                    type: u.role === 'DEALER' ? 'dealer' : 'user',
                    customer: u.companyName || u.name,
                    status: 'pending',
                    date: u.createdAt,
                    number: u.id.slice(0, 8).toUpperCase()
                }));
                realApprovals.push(...uList);
            }

            // Sort by date desc
            realApprovals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setApprovalsList(realApprovals);
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
        } finally {
            setIsLoadingApprovals(false);
        }
    };

    const [creditRequests, setCreditRequests] = useState<any[]>([]);
    const [isLoadingCreditRequests, setIsLoadingCreditRequests] = useState(false);

    const fetchCreditRequests = async () => {
        setIsLoadingCreditRequests(true);
        try {
            const response = await creditApi.getAllRequests('PENDING');
            if (response.success && response.data) {
                setCreditRequests(response.data as any[]);
            }
        } catch (error) {
            console.error('Error fetching credit requests:', error);
        } finally {
            setIsLoadingCreditRequests(false);
        }
    };

    const handleApproveCredit = (request: any) => {
        setCreditActionModal({ show: true, type: 'approve', request });
    };

    const handleRejectCredit = (request: any) => {
        setRejectReason('');
        setCreditActionModal({ show: true, type: 'reject', request });
    };

    const confirmCreditAction = async () => {
        const { type, request } = creditActionModal;
        if (!request) return;

        try {
            if (type === 'approve') {
                await creditApi.respond(request.id, 'APPROVED');
                setToast({ message: `Credit limit approved to ₹${request.amount.toLocaleString()}!`, type: 'success' });
            } else {
                if (!rejectReason.trim()) {
                    setToast({ message: 'Please enter a rejection reason', type: 'error' });
                    return;
                }
                await creditApi.respond(request.id, 'REJECTED', rejectReason);
                setToast({ message: 'Credit request rejected', type: 'success' });
            }
            fetchCreditRequests();
            setCreditActionModal({ show: false, type: 'approve', request: null });
            setRejectReason('');
            setTimeout(() => setToast(null), 4000);
        } catch (error) {
            console.error('Error processing credit request:', error);
            setToast({ message: 'Failed to process credit request', type: 'error' });
            setTimeout(() => setToast(null), 4000);
        }
    };

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const response = await ordersApi.list();
            const ordersData = (response as any).data?.data || (response as any).data || [];

            if (response.success && ordersData && ordersData.length > 0) {
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
                setOrders([]);
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
            const response = await quotesApi.list();
            if (response.success && response.data) {
                setQuotes(response.data as Quote[]);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await usersApi.list();
            if (response.success && response.data) {
                const mappedUsers = (response.data as any[]).map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    status: !u.isActive ? 'suspended' : !u.isVerified ? 'pending' : 'active',
                    companyName: u.companyName || 'N/A',
                    createdAt: u.createdAt
                }));
                setUsersList(mappedUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const response = await notificationsApi.list();
            if (response.success && response.data) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            const response = await notificationsApi.markAllAsRead();
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                fetchDashboardData(); // Refresh unread count in stats
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    // Save admin profile to backend
    const handleSaveAdminProfile = async () => {
        setIsSavingProfile(true);
        setActionMessage(null);

        try {
            const response = await authApi.updateProfile({
                name: adminProfileForm.name,
                phone: adminProfileForm.phone,
            });

            if (response.success) {
                refreshUser();
                setActionMessage('Profile saved successfully!');
            } else {
                setActionMessage('Failed to save profile: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setActionMessage('Error saving profile. Please try again.');
        } finally {
            setIsSavingProfile(false);
            setTimeout(() => setActionMessage(null), 3000);
        }
    };


    // View order details
    const handleViewOrder = (order: any) => {
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
                items: order.items?.map((item: any) => ({
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

    // Download Invoice as printable HTML - Premium Design
    const handleDownloadInvoice = (order: any) => {
        const invoiceDate = new Date(order.createdAt);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);

        const subtotal = order.items?.reduce((sum: number, item: any) =>
            sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) || order.totalAmount || 0;
        const gstAmount = Math.round(subtotal * 0.18);
        const grandTotal = order.totalAmount || (subtotal + gstAmount);

        const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${order.orderNumber} | Homelia</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --charcoal: #2C2C2C;
            --brass: #A69070;
            --brass-dark: #8B7A5C;
            --ivory: #FAF9F7;
            --linen: #F7F5F2;
            --stone: #E8E4DF;
            --gray: #78716C;
            --gray-light: #A8A29E;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 13px; line-height: 1.6; color: var(--charcoal); background: #fff; }
        .container { max-width: 800px; margin: 0 auto; padding: 60px 50px; }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 40px; border-bottom: 1px solid var(--stone); margin-bottom: 40px; }
        .brand-logo { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 500; color: var(--charcoal); letter-spacing: -0.5px; margin-bottom: 8px; }
        .brand-tagline { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-bottom: 4px; }
        .brand-contact { font-size: 11px; color: var(--gray-light); line-height: 1.8; }
        .invoice-title { font-family: 'Cormorant Garamond', serif; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: var(--brass); margin-bottom: 16px; text-align: right; }
        .invoice-meta { font-size: 12px; color: var(--gray); line-height: 2; text-align: right; }
        .invoice-meta strong { color: var(--charcoal); font-weight: 500; }
        
        .parties { display: flex; justify-content: space-between; margin-bottom: 50px; }
        .party { width: 45%; }
        .party-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--brass); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .party-label::after { content: ''; flex: 1; height: 1px; background: var(--stone); }
        .party-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; color: var(--charcoal); margin-bottom: 8px; }
        .party-details { font-size: 12px; color: var(--gray); line-height: 1.8; }
        .gstin { margin-top: 8px; font-size: 11px; color: var(--gray-light); }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gray); padding: 16px 12px; border-bottom: 2px solid var(--charcoal); text-align: left; }
        th:last-child { text-align: right; }
        td { padding: 20px 12px; border-bottom: 1px solid var(--stone); vertical-align: top; }
        tbody tr:last-child td { border-bottom: 2px solid var(--charcoal); }
        .item-num { color: var(--gray-light); font-size: 12px; }
        .item-name { font-weight: 400; color: var(--charcoal); }
        .item-sku { font-size: 11px; color: var(--gray-light); margin-top: 4px; }
        .text-right { text-align: right; }
        .amount { font-weight: 500; }
        
        .totals { display: flex; justify-content: flex-end; margin-bottom: 50px; }
        .totals-table { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; color: var(--gray); }
        .totals-row.subtotal { border-bottom: 1px solid var(--stone); }
        .totals-row.grand { margin-top: 12px; padding: 16px 0; border-top: 2px solid var(--charcoal); font-size: 16px; color: var(--charcoal); }
        .totals-row.grand .label { font-family: 'Cormorant Garamond', serif; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; }
        .totals-row.grand .value { font-weight: 600; font-size: 18px; }
        
        .payment { background: var(--linen); padding: 24px 28px; margin-bottom: 40px; border-left: 3px solid var(--brass); }
        .payment-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--brass); margin-bottom: 12px; }
        .payment-details { font-size: 12px; color: var(--gray); line-height: 1.8; }
        .payment-details strong { color: var(--charcoal); font-weight: 500; }
        
        .footer { text-align: center; padding-top: 30px; border-top: 1px solid var(--stone); }
        .footer-msg { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-style: italic; color: var(--charcoal); margin-bottom: 16px; }
        .footer-brand { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--brass); margin-bottom: 8px; }
        .footer-contact { font-size: 11px; color: var(--gray-light); }
        .footer-legal { margin-top: 20px; font-size: 10px; color: var(--gray-light); }
        
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { padding: 40px; } }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div>
                <div class="brand-logo">Homelia</div>
                <div class="brand-tagline">Premium Laminates & Surfaces</div>
                <div class="brand-contact">GSTIN: 27AABCH1234F1ZP<br>Patna, Bihar, India</div>
            </div>
            <div>
                <div class="invoice-title">Invoice</div>
                <div class="invoice-meta">
                    <strong>No.</strong> ${order.orderNumber}<br>
                    <strong>Date</strong> ${invoiceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
                    <strong>Due</strong> ${dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
            </div>
        </header>
        
        <section class="parties">
            <div class="party">
                <div class="party-label">Billed To</div>
                <div class="party-name">${order.user?.companyName || order.user?.name || 'Customer'}</div>
                <div class="party-details">
                    ${order.user?.name ? order.user.name + '<br>' : ''}
                    ${order.shippingAddress?.street || ''}<br>
                    ${order.shippingAddress?.city || ''}${order.shippingAddress?.state ? ', ' + order.shippingAddress.state : ''} ${order.shippingAddress?.postalCode || ''}
                    <div class="gstin">GSTIN: ${order.user?.gstNumber || 'N/A'}</div>
                </div>
            </div>
            <div class="party">
                <div class="party-label">Shipped To</div>
                <div class="party-name">${order.shippingAddress?.city || 'Same as billing'}</div>
                <div class="party-details">
                    ${order.shippingAddress?.street || ''}<br>
                    ${order.shippingAddress?.city || ''}${order.shippingAddress?.state ? ', ' + order.shippingAddress.state : ''}<br>
                    ${order.shippingAddress?.postalCode || ''}
                </div>
            </div>
        </section>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th>Description</th>
                    <th style="width: 80px;">Qty</th>
                    <th style="width: 120px;">Rate</th>
                    <th style="width: 120px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${order.items?.map((item: any, idx: number) => `
                    <tr>
                        <td class="item-num">${String(idx + 1).padStart(2, '0')}</td>
                        <td><div class="item-name">${item.product?.name || 'Product'}</div><div class="item-sku">${item.product?.sku || ''}</div></td>
                        <td>${item.quantity || 0} sheets</td>
                        <td>₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                        <td class="text-right amount">₹${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                `).join('') || '<tr><td colspan="5" style="text-align: center; padding: 40px;">No items</td></tr>'}
            </tbody>
        </table>
        
        <section class="totals">
            <div class="totals-table">
                <div class="totals-row subtotal"><span class="label">Subtotal</span><span class="value">₹${subtotal.toLocaleString('en-IN')}</span></div>
                <div class="totals-row"><span class="label">GST @ 18%</span><span class="value">₹${gstAmount.toLocaleString('en-IN')}</span></div>
                <div class="totals-row"><span class="label">Freight</span><span class="value">₹${(order.freightCharges || 0).toLocaleString('en-IN')}</span></div>
                <div class="totals-row grand"><span class="label">Total Due</span><span class="value">₹${grandTotal.toLocaleString('en-IN')}</span></div>
            </div>
        </section>
        
        <section class="payment">
            <div class="payment-title">Payment Information</div>
            <div class="payment-details">
                <strong>Payment Method:</strong> Cash On Delivery (COD)<br>
                <strong>Payment Due:</strong> Upon delivery<br>
                <strong>Terms:</strong> Full payment required at the time of delivery. Please keep exact change ready.
            </div>
        </section>
        
        <footer class="footer">
            <div class="footer-msg">Thank you for choosing Homelia</div>
            <div class="footer-brand">Crafted for Quiet Living</div>
            <div class="footer-contact">contact@homelia.in • +91 98352 68202 • www.homelia.studio</div>
            <div class="footer-legal">This is a computer-generated invoice and does not require a signature.</div>
        </footer>
    </div>
    <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(invoiceHtml);
            printWindow.document.close();
        }
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
                // Update local orders list
                setOrders(prev => prev.map(o =>
                    o.id === selectedOrder.id ? { ...o, status: newOrderStatus } : o
                ));

                // Update dashboard recent orders list if it exists there
                setDashboardRecentOrders(prev => prev.map(o =>
                    o.id === selectedOrder.id ? { ...o, status: newOrderStatus } : o
                ));

                // Update selected order display
                setSelectedOrder({ ...selectedOrder, status: newOrderStatus });

                setActionMessage(`Order ${selectedOrder.orderNumber} status updated to ${newOrderStatus}!`);

                // Refresh dashboard stats to reflect changes (e.g. pending count)
                fetchDashboardData();
            } else {
                setActionMessage(`Failed to update status: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setActionMessage('Error updating order status. Please try again.');
        }

        setTimeout(() => setActionMessage(null), 3000);
    };

    // Handle approve pending approval (quote or dealer)
    const handleApproveItem = async (itemId: string, type: string) => {
        try {
            let response;
            if (type === 'quote') {
                response = await quotesApi.approve(itemId);
            } else {
                response = await usersApi.verify(itemId);
            }

            if (response.success) {
                setActionMessage(`${type === 'quote' ? 'Quote' : 'User'} approved successfully!`);
                // Update local state by removing from approvals list
                setApprovalsList(prev => prev.filter(item => item.id !== itemId));

                // If quote, we might want to refresh quotes tab too
                if (type === 'quote') {
                    setQuotes(prev => prev.map(q => q.id === itemId ? { ...q, status: 'APPROVED' } : q));
                } else {
                    setUsersList(prev => prev.map(u => u.id === itemId ? { ...u, isVerified: true } : u));
                }

                // Refresh dashboard stats to reflect changes
                fetchDashboardData();
            } else {
                setActionMessage(`Failed to approve: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error approving item:', error);
            setActionMessage('Error approving item');
        }
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Handle reject pending approval
    const handleRejectItem = async (itemId: string, type: string) => {
        try {
            let response;
            if (type === 'quote') {
                response = await quotesApi.reject(itemId, 'Rejected by admin');
            } else {
                // For users, maybe we deactivate them or delete?
                // For now, let's just deactivate (isActive = false)
                response = await usersApi.updateStatus(itemId, false);
            }

            if (response.success) {
                setActionMessage(`${type === 'quote' ? 'Quote' : 'User'} rejected.`);
                setApprovalsList(prev => prev.filter(item => item.id !== itemId));

                if (type === 'quote') {
                    setQuotes(prev => prev.map(q => q.id === itemId ? { ...q, status: 'REJECTED' } : q));
                }

                // Refresh dashboard stats to reflect changes
                fetchDashboardData();
            } else {
                setActionMessage(`Failed to reject: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting item:', error);
            setActionMessage('Error rejecting item');
        }
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

    const handleViewUser = (userItem: any) => {
        setSelectedUser(userItem);
    };


    // User management: Approve user
    const handleApproveUser = async (userId: string) => {
        try {
            const response = await usersApi.verify(userId);
            if (response.success) {
                setUsersList(prev => prev.map(u =>
                    u.id === userId ? { ...u, status: 'active' } : u
                ));
                // Also update approvalsList if it exists there
                setApprovalsList(prev => prev.filter(item => item.id !== userId));
                setActionMessage('User approved successfully!');
            } else {
                setActionMessage(`Failed: ${response.message}`);
            }
        } catch (error) {
            console.error('Error approving user:', error);
        }
        setTimeout(() => setActionMessage(null), 3000);
    };

    // User management: Reject/suspend user
    const handleRejectUser = async (userId: string) => {
        try {
            // Deactivate user
            const response = await usersApi.updateStatus(userId, false);
            if (response.success) {
                setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
                setApprovalsList(prev => prev.filter(item => item.id !== userId));
                setActionMessage('User account suspended.');
            } else {
                setActionMessage(`Failed: ${response.message}`);
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
        }
        setTimeout(() => setActionMessage(null), 3000);
    };


    // User management: Add new user
    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setActionMessage('Please fill in all required fields');
            setTimeout(() => setActionMessage(null), 3000);
            return;
        }

        try {
            const response = await usersApi.create({
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone || '+91 00000 00000',
                password: newUser.password,
                role: newUser.role,
                companyName: newUser.companyName
            });

            if (response.success) {
                setActionMessage('User created successfully!');
                setShowAddUserModal(false);
                setNewUser({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'B2B_CUSTOMER',
                    companyName: ''
                });
                fetchUsers(); // Refresh list
            } else {
                setActionMessage(`Failed to create user: ${response.message}`);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            setActionMessage('Error adding user. Please try again.');
        }
        setTimeout(() => setActionMessage(null), 3000);
    };

    // User management: Delete user
    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await usersApi.delete(userId);
            if (response.success) {
                setActionMessage('User deleted successfully');
                setUsersList(prev => prev.filter(u => u.id !== userId));
            } else {
                setActionMessage(`Failed: ${response.message}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
        setTimeout(() => setActionMessage(null), 3000);
    };


    // User management: Add new user behavior logic

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

            {/* Mobile Menu Toggle */}
            <button
                className="admin-mobile-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay */}
            <div
                className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                        {dashboardStats && <span className="nav-badge">{dashboardStats.orders.pending}</span>}
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'quotes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quotes')}
                    >
                        <FileText size={20} />
                        Quotes
                        {dashboardStats && <span className="nav-badge">{dashboardStats.quotes.pending}</span>}
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'credit-requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('credit-requests')}
                    >
                        <DollarSign size={20} />
                        Credit Requests
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
                        {dashboardStats?.notifications?.unread > 0 && (
                            <span className="nav-badge">{dashboardStats.notifications.unread}</span>
                        )}
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
                                    <span className="kpi-value">{formatPrice(dashboardStats?.revenue?.total || 0)}</span>
                                    <span className="kpi-label">Total Revenue</span>
                                </div>
                                <div className="kpi-trend up">
                                    <TrendingUp size={16} />
                                    +12.5%
                                </div>

                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon orders">
                                    <ShoppingCart size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{dashboardStats?.orders?.today || 0}</span>
                                    <span className="kpi-label">Today's Orders</span>
                                </div>

                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{dashboardStats?.orders?.pending || 0}</span>
                                    <span className="kpi-label">Pending Orders</span>
                                </div>

                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon users">
                                    <Users size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{dashboardStats?.inventory?.lowStock || 0}</span>
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
                                            {isLoadingDashboard ? (
                                                <tr>
                                                    <td colSpan={5} className="placeholder-content" style={{ textAlign: 'center', padding: '2rem' }}>
                                                        <Loader2 className="animate-spin" />
                                                    </td>
                                                </tr>
                                            ) : dashboardRecentOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="placeholder-content" style={{ textAlign: 'center', padding: '2rem' }}>
                                                        No recent orders found
                                                    </td>
                                                </tr>
                                            ) : (
                                                dashboardRecentOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td><strong>{order.id}</strong></td>
                                                        <td>{order.customer}</td>
                                                        <td>{formatPrice(order.amount)}</td>
                                                        <td>
                                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => handleViewOrder(order.originalData)}
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>

                                    </table>
                                </div>
                            </div>

                            <div className="admin-card">
                                <div className="card-header">
                                    <h3>Pending Approvals</h3>
                                    <span className="badge-count">{approvalsList.length}</span>
                                </div>
                                <div className="approvals-list">
                                    {isLoadingApprovals ? (
                                        <div className="placeholder-content" style={{ padding: '1rem', minHeight: 'auto' }}>
                                            <Loader2 size={24} className="animate-spin" />
                                        </div>
                                    ) : approvalsList.length === 0 ? (
                                        <div className="placeholder-content" style={{ padding: '1rem', minHeight: 'auto' }}>
                                            <p>No pending approvals</p>
                                        </div>
                                    ) : (
                                        approvalsList.map(item => (
                                            <div key={item.id} className="approval-item">
                                                <div className="approval-icon">
                                                    {item.type === 'quote' ? <FileText size={20} /> : <Users size={20} />}
                                                </div>
                                                <div className="approval-info">
                                                    <span className="approval-id">{item.number || item.id}</span>
                                                    <span className="approval-customer">{item.customer}</span>
                                                    {item.amount > 0 && <span className="approval-amount">{formatPrice(item.amount)}</span>}
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
                                        ))
                                    )}
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
                                                <button
                                                    className="btn btn-ghost btn-sm text-red"
                                                    title="Delete User"
                                                    onClick={() => handleDeleteUser(u.id)}
                                                >
                                                    <Trash2 size={16} />
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
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowInvoiceModal(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Plus size={16} /> Create Invoice
                                </button>
                                <button className="btn btn-outline" onClick={fetchOrders}>
                                    <RefreshCw size={16} /> Refresh
                                </button>
                            </div>
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
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleViewOrder(order)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleDownloadInvoice(order)}
                                                            title="Download Invoice"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Credit Requests Tab */}
                {activeTab === 'credit-requests' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Credit Requests</h1>
                            <button className="btn btn-outline" onClick={fetchCreditRequests}>
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>
                        <div className="admin-card full-width">
                            {isLoadingCreditRequests ? (
                                <div className="placeholder-content">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p>Loading requests...</p>
                                </div>
                            ) : creditRequests.length === 0 ? (
                                <div className="placeholder-content">
                                    <CheckCircle size={48} />
                                    <h3>No Pending Requests</h3>
                                    <p>There are no pending credit limit increase requests.</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Dealer</th>
                                            <th>Current Limit</th>
                                            <th>Requested Limit</th>
                                            <th>Increase</th>
                                            <th>Notes</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {creditRequests.map(req => (
                                            <tr key={req.id}>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div>{req.user?.companyName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{req.user?.name}</div>
                                                </td>
                                                <td>{formatPrice(req.currentLimit)}</td>
                                                <td style={{ fontWeight: 'bold' }}>{formatPrice(req.amount)}</td>
                                                <td style={{ color: 'green' }}>+{formatPrice(req.requestedIncrease)}</td>
                                                <td style={{ maxWidth: '200px' }} title={req.notes}>{req.notes || '-'}</td>
                                                <td>
                                                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {req.status === 'PENDING' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="action-btn approve"
                                                                onClick={() => handleApproveCredit(req)}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                className="action-btn reject"
                                                                onClick={() => handleRejectCredit(req)}
                                                                title="Reject"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
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
                                                    {(quote.status === 'PENDING' || quote.status === 'REQUESTED') && (
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
                                    <span className="kpi-value">{formatPrice(dashboardStats?.revenue?.total || 0)}</span>
                                    <span className="kpi-label">Total Revenue</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon orders">
                                    <ShoppingCart size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{dashboardStats?.orders?.total || 0}</span>
                                    <span className="kpi-label">Total Orders</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon users">
                                    <Users size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{dashboardStats?.orders?.pending || 0}</span>
                                    <span className="kpi-label">Pending Orders</span>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon pending">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="kpi-content">
                                    <span className="kpi-value">{dashboardStats?.quotes?.pending || 0}</span>
                                    <span className="kpi-label">Pending Quotes</span>
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
                            <button className="btn btn-outline" onClick={handleMarkAllNotificationsRead}>
                                <CheckCircle size={16} /> Mark all as read
                            </button>
                        </div>
                        <div className="admin-card full-width">
                            {isLoadingNotifications ? (
                                <div className="placeholder-content">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p>Loading notifications...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="placeholder-content">
                                    <Bell size={48} />
                                    <h3>No Notifications</h3>
                                    <p>You're all caught up! New alerts will appear here.</p>
                                </div>
                            ) : (
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
                                            {notifications.map(notif => (
                                                <tr key={notif.id} className={notif.isRead ? '' : 'unread-row'}>
                                                    <td>
                                                        <span className={`status-badge ${notif.type.toLowerCase().replace('_', '-')}`}>
                                                            {notif.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                                                            {notif.title}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                            {notif.message}
                                                        </div>
                                                    </td>
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
                                        <input
                                            type="text"
                                            className="search-input"
                                            value={adminProfileForm.name}
                                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            className="search-input"
                                            value={adminProfileForm.phone}
                                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" className="search-input" value={user?.email || 'admin@homelia.com'} readOnly style={{ opacity: 0.7 }} />
                                        <small style={{ color: '#888', fontSize: '12px' }}>Email cannot be changed</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <input type="text" className="search-input" value="Administrator" readOnly style={{ opacity: 0.7 }} />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSaveAdminProfile}
                                        disabled={isSavingProfile}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        {isSavingProfile ? 'Saving...' : 'Save Profile'}
                                    </button>
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
            {/* Manual Invoice Modal */}
            {showInvoiceModal && (
                <ManualInvoiceModal
                    onClose={() => setShowInvoiceModal(false)}
                    onSuccess={() => {
                        fetchOrders(); // Refresh list
                        setShowInvoiceModal(false);
                    }}
                />
            )}

            {/* Credit Action Confirmation Modal */}
            {creditActionModal.show && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setCreditActionModal({ show: false, type: 'approve', request: null })}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            maxWidth: '450px',
                            width: '90%',
                            overflow: 'hidden'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '1.5rem',
                            background: creditActionModal.type === 'approve' ? '#5A7A5A' : '#8A4A4A',
                            color: 'white'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                                {creditActionModal.type === 'approve' ? '✓ Approve Credit Request' : '✕ Reject Credit Request'}
                            </h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            {creditActionModal.request && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ margin: '0 0 0.5rem', color: '#57534E', fontSize: '0.9rem' }}>
                                        <strong>Dealer:</strong> {creditActionModal.request.user?.companyName || creditActionModal.request.user?.name}
                                    </p>
                                    <p style={{ margin: '0 0 0.5rem', color: '#57534E', fontSize: '0.9rem' }}>
                                        <strong>Requested Amount:</strong> ₹{creditActionModal.request.amount?.toLocaleString()}
                                    </p>
                                    <p style={{ margin: '0', color: '#57534E', fontSize: '0.9rem' }}>
                                        <strong>Current Limit:</strong> ₹{creditActionModal.request.currentLimit?.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {creditActionModal.type === 'approve' ? (
                                <p style={{ color: '#1C1917', fontSize: '0.95rem', margin: 0 }}>
                                    Are you sure you want to approve this credit limit increase?
                                </p>
                            ) : (
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: '#57534E',
                                        marginBottom: '0.5rem',
                                        fontWeight: 600
                                    }}>
                                        Rejection Reason
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #E8E6E3',
                                            borderRadius: '6px',
                                            resize: 'vertical',
                                            minHeight: '80px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid #E8E6E3',
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setCreditActionModal({ show: false, type: 'approve', request: null })}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    border: '2px solid #E8E6E3',
                                    borderRadius: '6px',
                                    background: 'white',
                                    color: '#57534E',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCreditAction}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: creditActionModal.type === 'approve' ? '#5A7A5A' : '#8A4A4A',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                {creditActionModal.type === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
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
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        maxWidth: '400px'
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

export default AdminDashboard;
