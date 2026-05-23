import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, formatPricePerSheet } from '../data/products';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
    const { addToCart } = useCart();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            color: product.colors[0],
            image: product.image
        });
    };
    return (
        <Link
            to={`/product/${product.id}`}
            className={`product-card card ${viewMode}`}
        >
            <div className="product-image">
                <div
                    className="product-swatch"
                    style={{ background: product.colors[0] }}
                >
                    <div className="product-colors">
                        {product.colors.map((color, idx) => (
                            <span
                                key={idx}
                                className="color-dot"
                                style={{ background: color }}
                            ></span>
                        ))}
                    </div>
                </div>

                {product.bestseller && (
                    <div className="product-badge bestseller">
                        <Star size={12} />
                        Bestseller
                    </div>
                )}

                <div className="product-brand-badge" style={{
                    background: product.brand === 'durian' ? '#2563EB' : '#DC2626'
                }}>
                    {product.brand === 'durian' ? 'Durian' : 'Rockstar'}
                </div>

                {/* Emotion Tags Overlay on Hover */}
                {product.emotionTags && product.emotionTags.length > 0 && (
                    <div className="product-emotions">
                        {product.emotionTags.map(tag => (
                            <span key={tag} className="emotion-tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className="product-info">
                <span className="product-category">{product.texture} • {product.finish}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-sku">SKU: {product.sku}</p>

                {viewMode === 'list' && product.description && (
                    <p className="product-description">{product.description}</p>
                )}

                {/* Usage Hints */}
                {viewMode === 'list' && product.usageHints && (
                    <div className="product-usage-hints">
                        {product.usageHints.map(hint => (
                            <span key={hint} className="usage-hint">{hint}</span>
                        ))}
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="product-specs">
                        <span>{product.thickness}</span>
                        <span>{product.sheetSize} ft</span>
                    </div>
                )}

                <div className="product-footer">
                    <span className="product-price">{formatPricePerSheet(product.price)}</span>
                    <button 
                        className="btn btn-primary btn-sm quick-add-btn"
                        onClick={handleQuickAdd}
                        title="Quick Add to Cart"
                    >
                        <ShoppingCart size={16} />
                    </button>
                    <span className="product-moq">MOQ: {product.moq} sheets</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
