import { Link } from 'react-router-dom';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    ChevronRight,
    Truck,
    Shield,
    CreditCard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products, formatPrice } from '../data/products';
import './Cart.css';

const Cart = () => {
    const { items, updateQuantity, removeFromCart, subtotal } = useCart();

    const getProduct = (id: string) => products.find(p => p.id === id);

    const handleUpdateQuantity = (productId: string, change: number) => {
        const item = items.find(i => i.productId === productId);
        const product = getProduct(productId);
        if (!item || !product) return;

        const newQty = Math.max(product.moq || 1, item.quantity + change);
        updateQuantity(productId, newQty);
    };

    const gstRate = 0.18;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;

    if (items.length === 0) {
        return (
            <div className="cart-empty-page">
                <div className="container">
                    <div className="empty-cart-card card">
                        <ShoppingBag size={64} />
                        <h1>Your Cart is Empty</h1>
                        <p>Browse our laminate collection and add products to your cart.</p>
                        <Link to="/catalog" className="btn btn-primary btn-lg">
                            Browse Catalog <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            {/* Header */}
            <div className="cart-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <span>Cart</span>
                    </div>
                    <h1>Shopping Cart</h1>
                    <p>{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
                </div>
            </div>

            <div className="container">
                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items-container">
                        <div className="cart-table card">
                            <div className="cart-table-header">
                                <span className="col-product">Product</span>
                                <span className="col-price">Price</span>
                                <span className="col-quantity">Quantity</span>
                                <span className="col-total">Total</span>
                                <span className="col-action"></span>
                            </div>
                            <div className="cart-items-list">
                                {items.map(item => {
                                    const product = getProduct(item.productId);
                                    const itemTotal = item.price * item.quantity;

                                    return (
                                        <div key={item.productId} className="cart-item">
                                            <div className="col-product">
                                                <div
                                                    className="item-image"
                                                    style={{ background: item.color || product?.colors[0] || '#e5e5e5' }}
                                                />
                                                <div className="item-details">
                                                    <Link to={`/product/${item.productId}`} className="item-name">
                                                        {item.name}
                                                    </Link>
                                                    <span className="item-sku">SKU: {item.sku}</span>
                                                    {product && (
                                                        <span className="item-specs">
                                                            {product.finish} • {product.thickness} • {product.sheetSize} ft
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-price">
                                                <span className="price-label">Price:</span>
                                                <span>{formatPrice(item.price)}</span>
                                            </div>
                                            <div className="col-quantity">
                                                <span className="qty-label">Qty:</span>
                                                <div className="quantity-control">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                                                        disabled={item.quantity <= (product?.moq || 1)}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.productId, 1)}>
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                {product && <span className="moq-hint">Min: {product.moq}</span>}
                                            </div>
                                            <div className="col-total">
                                                <span className="total-label">Total:</span>
                                                <span className="item-total">{formatPrice(itemTotal)}</span>
                                            </div>
                                            <div className="col-action">
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => removeFromCart(item.productId)}
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="cart-actions">
                            <Link to="/catalog" className="btn btn-outline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <aside className="cart-summary">
                        <div className="summary-card card">
                            <h2>Order Summary</h2>

                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>GST (18%)</span>
                                    <span>{formatPrice(gstAmount)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="shipping-tbd">Calculated at checkout</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="btn btn-primary btn-lg checkout-btn">
                                Proceed to Checkout <ArrowRight size={18} />
                            </Link>

                            <div className="summary-trust">
                                <div className="trust-item">
                                    <Truck size={16} />
                                    <span>Pan-India Delivery</span>
                                </div>
                                <div className="trust-item">
                                    <Shield size={16} />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="trust-item">
                                    <CreditCard size={16} />
                                    <span>GST Invoice</span>
                                </div>
                            </div>
                        </div>

                        <div className="promo-card card">
                            <h3>Have a Promo Code?</h3>
                            <div className="promo-input">
                                <input type="text" placeholder="Enter code" className="input" />
                                <button className="btn btn-outline">Apply</button>
                            </div>
                        </div>

                        <div className="bulk-card card">
                            <h3>Need a Bulk Quote?</h3>
                            <p>For orders above 100 sheets, get special pricing.</p>
                            <Link to="/request-quote" className="btn btn-accent">
                                Request Quote
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Cart;
