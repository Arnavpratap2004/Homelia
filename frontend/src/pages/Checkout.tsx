import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Truck,
    Shield,
    CheckCircle2,
    FileText,
    AlertCircle,
    Loader2,
    Lock,
    Gift,
    Home,
    Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api';
import { formatPrice } from '../data/products';
import './Checkout.css';

interface CheckoutStep {
    id: number;
    title: string;
    completed: boolean;
}

const Checkout = () => {
    // Navigation available if needed in future
    const { items, subtotal, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState(1);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: ''
    });

    // Product lookup available if needed: products.find(p => p.id === id)

    const gstRate = 0.18;
    const gstAmount = subtotal * gstRate;
    const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over 50k
    const total = subtotal + gstAmount + shipping;

    const steps: CheckoutStep[] = [
        { id: 1, title: 'Delivery', completed: currentStep > 1 },
        { id: 2, title: 'Billing', completed: currentStep > 2 },
        { id: 3, title: 'Payment', completed: currentStep > 3 },
    ];

    const handlePlaceOrder = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await ordersApi.create({
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                shippingAddress: shippingAddress,
                billingAddress: shippingAddress, // Same as shipping for now
                notes: `Payment method: ${paymentMethod}`
            });

            if (response.success) {
                const newOrderId = `ORD-${Date.now().toString().slice(-8)}`;
                setOrderId(newOrderId);
                clearCart();
                setOrderPlaced(true);
                window.scrollTo(0, 0); // Scroll to top for success message
            } else {
                setError(response.message || 'Failed to place order');
            }
        } catch (err) {
            console.error('Order error:', err);
            setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect if cart is empty and not showing success
    if (items.length === 0 && !orderPlaced) {
        return (
            <div className="cart-empty-page">
                <div className="container">
                    <div className="empty-cart-card card">
                        <div className="empty-icon-bg">
                            <Sparkles size={48} />
                        </div>
                        <h1>Your Cart is Waiting</h1>
                        <p>Fill it with things that make your house a home.</p>
                        <Link to="/catalog" className="btn btn-primary btn-lg">
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="order-success-page">
                <div className="confetti-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#2563EB', '#DC2626', '#10B981', '#F59E0B'][Math.floor(Math.random() * 4)]
                        }}></div>
                    ))}
                </div>
                <div className="container">
                    <div className="success-content">
                        <div className="success-header">
                            <div className="success-icon-bloom">
                                <CheckCircle2 size={56} />
                            </div>
                            <h1>Welcome to the Family!</h1>
                            <p className="success-subtitle">We're delighted to be part of your home journey.</p>
                        </div>

                        <div className="order-receipt card">
                            <div className="receipt-header">
                                <span>Receipt</span>
                                <strong>{orderId}</strong>
                            </div>
                            <div className="receipt-body">
                                <div className="receipt-row">
                                    <span>Total Amount</span>
                                    <strong>{formatPrice(total)}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Estimated Delivery</span>
                                    <strong>5-7 Business Days</strong>
                                </div>
                                <div className="receipt-divider"></div>
                                <p className="receipt-note">
                                    We've sent a detailed confirmation to your email.
                                </p>
                            </div>
                        </div>

                        <div className="success-actions">
                            <Link to="/dashboard" className="btn btn-primary">
                                Track Order
                            </Link>
                            <Link to="/" className="btn btn-ghost">
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-header-simple">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo-link">
                            <Home size={20} />
                            <span>Homelia</span>
                        </Link>
                        <div className="secure-badge">
                            <Lock size={14} />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="checkout-layout">
                    <div className="checkout-main">
                        <div className="checkout-progress">
                            {steps.map((step, idx) => (
                                <div key={step.id} className={`progress-step ${currentStep === step.id ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
                                    <div className="step-marker">
                                        {step.completed ? <CheckCircle2 size={16} /> : <span>{step.id}</span>}
                                    </div>
                                    <span className="step-label">{step.title}</span>
                                    {idx < steps.length - 1 && <div className="step-connector"></div>}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Shipping */}
                        {currentStep === 1 && (
                            <div className="form-section fade-in">
                                <div className="section-header">
                                    <h2>Where should we send your order?</h2>
                                    <p>We'll ensure it arrives safely to your doorstep.</p>
                                </div>
                                <form className="checkout-form">
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Arnav Sharma"
                                                value={shippingAddress.name}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Mobile Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={shippingAddress.phone}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group full-width">
                                            <label>Address Info</label>
                                            <input
                                                type="text"
                                                placeholder="Street address, Apartment, Suite"
                                                value={shippingAddress.address1}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                                                className="mb-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Landmark (Optional)"
                                                value={shippingAddress.address2}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                value={shippingAddress.city}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Pincode</label>
                                            <input
                                                type="text"
                                                value={shippingAddress.pincode}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <Link to="/cart" className="btn-back">
                                            <ChevronRight className="rotate-180" size={16} />
                                            Back to Cart
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => setCurrentStep(2)}
                                            disabled={!shippingAddress.name || !shippingAddress.address1}
                                        >
                                            Continue to Details
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Billing */}
                        {currentStep === 2 && (
                            <div className="form-section fade-in">
                                <div className="section-header">
                                    <h2>Billing & Invoicing</h2>
                                    <p>Details for your tax invoice and warranty.</p>
                                </div>
                                <form className="checkout-form">
                                    <label className="checkbox-frame">
                                        <input type="checkbox" defaultChecked />
                                        <span className="checkbox-text">Billing address same as shipping</span>
                                    </label>

                                    <div className="gst-container">
                                        <div className="gst-header">
                                            <FileText size={18} />
                                            <h3>GST Details (Optional)</h3>
                                        </div>
                                        <p className="gst-hint">Enter your GSTIN to claim input tax credit on this purchase.</p>
                                        <div className="form-grid">
                                            <div className="input-group">
                                                <label>Company Name</label>
                                                <input type="text" placeholder="Business Name" />
                                            </div>
                                            <div className="input-group">
                                                <label>GSTIN</label>
                                                <input type="text" placeholder="e.g. 27AABCU..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input-group full-width mt-4">
                                        <label>Order Notes</label>
                                        <textarea placeholder="Any specific requirements or gate instructions?" rows={3} />
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn-back" onClick={() => setCurrentStep(1)}>
                                            Back
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                                            Continue to Payment
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="form-section fade-in">
                                <div className="section-header">
                                    <h2>Complete Your Order</h2>
                                    <p>Safe and secure payment processing.</p>
                                </div>

                                <div className="payment-stack">
                                    <div
                                        className={`payment-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('upi')}
                                    >
                                        <div className="payment-radio">
                                            <div className="radio-dot"></div>
                                        </div>
                                        <div className="payment-info">
                                            <strong>UPI / Apps</strong>
                                            <span>Google Pay, PhonePe, Paytm, BHIM</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className="payment-radio">
                                            <div className="radio-dot"></div>
                                        </div>
                                        <div className="payment-info">
                                            <strong>Credit / Debit Card</strong>
                                            <span>Visa, Mastercard, Rupay, Amex</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`payment-card ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('netbanking')}
                                    >
                                        <div className="payment-radio">
                                            <div className="radio-dot"></div>
                                        </div>
                                        <div className="payment-info">
                                            <strong>Net Banking</strong>
                                            <span>All major Indian banks supported</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="trust-badges">
                                    <div className="secure-note">
                                        <Shield size={16} />
                                        <span>256-bit SSL Encrypted Payment</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="error-banner">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button type="button" className="btn-back" onClick={() => setCurrentStep(2)}>
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-pay"
                                        onClick={handlePlaceOrder}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay {formatPrice(total)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="checkout-sidebar">
                        <div className="order-summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-list">
                                {items.map(item => {
                                    return (
                                        <div key={item.productId} className="summary-item">
                                            <div className="item-thumb" style={{ background: item.color || '#eee' }}></div>
                                            <div className="item-text">
                                                <h4>{item.name}</h4>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                            <div className="item-cost">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="summary-breakdown">
                                <div className="breakdown-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>GST (18%)</span>
                                    <span>{formatPrice(gstAmount)}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                                </div>
                                <div className="breakdown-divider"></div>
                                <div className="breakdown-row total">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <div className="trust-footer">
                                <div className="trust-pill">
                                    <Truck size={14} />
                                    <span>Express Ship</span>
                                </div>
                                <div className="trust-pill">
                                    <Gift size={14} />
                                    <span>Care Pack</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
