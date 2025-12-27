import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    ChevronRight,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    Truck
} from 'lucide-react';
import { products } from '../data/products';
import './SampleOrder.css';

interface SampleItem {
    productId: string;
    quantity: number;
}

const SampleOrder = () => {
    const [selectedSamples, setSelectedSamples] = useState<SampleItem[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const maxSamplesPerProduct = 2;
    const maxTotalSamples = 10;
    const sampleProducts = products.slice(0, 8);

    const getSampleCount = (productId: string) => {
        return selectedSamples.find(s => s.productId === productId)?.quantity || 0;
    };

    const getTotalSamples = () => {
        return selectedSamples.reduce((sum, s) => sum + s.quantity, 0);
    };

    const addSample = (productId: string) => {
        if (getTotalSamples() >= maxTotalSamples) return;

        setSelectedSamples(prev => {
            const existing = prev.find(s => s.productId === productId);
            if (existing) {
                if (existing.quantity >= maxSamplesPerProduct) return prev;
                return prev.map(s =>
                    s.productId === productId
                        ? { ...s, quantity: s.quantity + 1 }
                        : s
                );
            }
            return [...prev, { productId, quantity: 1 }];
        });
    };

    const removeSample = (productId: string) => {
        setSelectedSamples(prev => {
            const existing = prev.find(s => s.productId === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(s =>
                    s.productId === productId
                        ? { ...s, quantity: s.quantity - 1 }
                        : s
                );
            }
            return prev.filter(s => s.productId !== productId);
        });
    };

    const clearSamples = () => setSelectedSamples([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="sample-success-page">
                <div className="container">
                    <div className="success-card card">
                        <div className="success-icon">
                            <CheckCircle2 size={64} />
                        </div>
                        <h1>Sample Order Placed!</h1>
                        <p>Your sample request has been submitted. We'll ship your samples within 2-3 business days.</p>
                        <div className="success-details">
                            <div className="detail-item">
                                <span>Order ID:</span>
                                <strong>SMP-{Date.now().toString().slice(-8)}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Samples Ordered:</span>
                                <strong>{getTotalSamples()} samples</strong>
                            </div>
                        </div>
                        <div className="success-actions">
                            <Link to="/" className="btn btn-primary">Return to Home</Link>
                            <Link to="/catalog" className="btn btn-outline">Continue Browsing</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sample-order-page">
            {/* Header */}
            <div className="sample-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <span>Order Samples</span>
                    </div>
                    <h1>Order Laminate Samples</h1>
                    <p>Experience our laminates firsthand. Order up to {maxTotalSamples} samples to evaluate before your purchase.</p>
                </div>
            </div>

            <div className="container">
                <div className="sample-layout">
                    {/* Products Grid */}
                    <div className="sample-products">
                        <div className="sample-products-header">
                            <h2>Select Samples</h2>
                            <span className="sample-counter">
                                {getTotalSamples()} / {maxTotalSamples} samples selected
                            </span>
                        </div>
                        <div className="sample-grid">
                            {sampleProducts.map(product => {
                                const count = getSampleCount(product.id);
                                return (
                                    <div key={product.id} className={`sample-product-card card ${count > 0 ? 'selected' : ''}`}>
                                        <div
                                            className="sample-swatch"
                                            style={{ background: product.colors[0] }}
                                        >
                                            <div className="brand-tag" style={{
                                                background: product.brand === 'durian' ? '#2563EB' : '#DC2626'
                                            }}>
                                                {product.brand === 'durian' ? 'Durian' : 'Rockstar'}
                                            </div>
                                        </div>
                                        <div className="sample-info">
                                            <span className="sample-texture">{product.texture}</span>
                                            <h3>{product.name}</h3>
                                            <p>{product.finish} • {product.thickness}</p>
                                            <div className="sample-controls">
                                                {count > 0 ? (
                                                    <div className="quantity-control">
                                                        <button onClick={() => removeSample(product.id)}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <span>{count}</span>
                                                        <button
                                                            onClick={() => addSample(product.id)}
                                                            disabled={count >= maxSamplesPerProduct || getTotalSamples() >= maxTotalSamples}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => addSample(product.id)}
                                                        disabled={getTotalSamples() >= maxTotalSamples}
                                                    >
                                                        <Plus size={14} />
                                                        Add Sample
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar / Cart */}
                    <aside className="sample-sidebar">
                        <div className="sample-cart card">
                            <div className="cart-header">
                                <h3><Package size={18} /> Sample Cart</h3>
                                {selectedSamples.length > 0 && (
                                    <button className="clear-btn" onClick={clearSamples}>
                                        <Trash2 size={14} />
                                        Clear
                                    </button>
                                )}
                            </div>

                            {selectedSamples.length > 0 ? (
                                <>
                                    <div className="cart-items">
                                        {selectedSamples.map(item => {
                                            const product = products.find(p => p.id === item.productId);
                                            if (!product) return null;
                                            return (
                                                <div key={item.productId} className="cart-item">
                                                    <div
                                                        className="item-swatch"
                                                        style={{ background: product.colors[0] }}
                                                    />
                                                    <div className="item-info">
                                                        <span className="item-name">{product.name}</span>
                                                        <span className="item-qty">Qty: {item.quantity}</span>
                                                    </div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => removeSample(item.productId)}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="cart-summary">
                                        <div className="summary-row">
                                            <span>Total Samples</span>
                                            <strong>{getTotalSamples()}</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Sample Cost</span>
                                            <strong>FREE</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            <strong>₹99</strong>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total</span>
                                            <strong>₹99</strong>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="checkout-form">
                                        <div className="input-group">
                                            <label className="input-label">Full Name *</label>
                                            <input type="text" className="input" required placeholder="Your name" />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Phone *</label>
                                            <input type="tel" className="input" required placeholder="+91 98765 43210" />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Email *</label>
                                            <input type="email" className="input" required placeholder="your@email.com" />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Shipping Address *</label>
                                            <textarea className="input textarea" required placeholder="Complete address with PIN code" rows={3} />
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-lg order-btn">
                                            <Truck size={18} />
                                            Order Samples - ₹99
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="cart-empty">
                                    <Package size={40} />
                                    <p>Select samples from the catalog to order</p>
                                </div>
                            )}
                        </div>

                        <div className="sample-info-card card">
                            <h4>Sample Policy</h4>
                            <ul>
                                <li>Max {maxSamplesPerProduct} samples per product</li>
                                <li>Max {maxTotalSamples} samples per order</li>
                                <li>Samples are credited on bulk orders</li>
                                <li>Delivery in 2-3 business days</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default SampleOrder;
