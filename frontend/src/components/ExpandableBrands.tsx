import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { brands } from '../data/products';
import './ExpandableBrands.css';

interface ExpandableBrandsProps {
    isOpen: boolean;
    onClose: () => void;
}

// Floating particles for ambiance
const FloatingParticles = () => (
    <div className="particles-container">
        {[...Array(7)].map((_, i) => (
            <div key={i} className="particle" />
        ))}
    </div>
);

const ExpandableBrands = ({ isOpen, onClose }: ExpandableBrandsProps) => {
    const navigate = useNavigate();
    const [activeCard, setActiveCard] = useState<string | null>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    // Handle 3D tilt effect and spotlight tracking
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const card = cardRefs.current[index];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Spotlight position
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;

        // 3D tilt calculation (subtle effect)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // Max 5 degrees
        const rotateY = ((x - centerX) / centerX) * 5;  // Max 5 degrees

        card.style.setProperty('--mouse-x', `${percentX}%`);
        card.style.setProperty('--mouse-y', `${percentY}%`);
        card.style.setProperty('--rotation-x', `${rotateX}deg`);
        card.style.setProperty('--rotation-y', `${rotateY}deg`);
    }, []);

    // Reset card position on mouse leave
    const handleMouseLeave = useCallback((index: number) => {
        const card = cardRefs.current[index];
        if (!card) return;

        card.style.setProperty('--rotation-x', '0deg');
        card.style.setProperty('--rotation-y', '0deg');
    }, []);

    const handleCardClick = (brandId: string) => {
        setActiveCard(brandId);
        // Navigate after a brief animation
        setTimeout(() => {
            navigate(`/brands/${brandId}`);
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="expandable-overlay" onClick={onClose}>
            <FloatingParticles />

            <div className="expandable-container" onClick={(e) => e.stopPropagation()}>
                <button className="expandable-close" onClick={onClose} aria-label="Close modal">
                    <X size={22} />
                </button>

                <div className="expandable-header">
                    <span className="expandable-subtitle">Our Partners</span>
                    <h2 className="expandable-title">Choose Your Brand</h2>
                    <p className="expandable-description">
                        Select a brand to explore their premium laminate collections
                    </p>
                </div>

                <div className="expandable-cards">
                    {brands.map((brand, index) => (
                        <div
                            key={brand.id}
                            ref={(el) => { cardRefs.current[index] = el; }}
                            className={`expandable-card ${activeCard === brand.id ? 'active' : ''}`}
                            style={{
                                '--delay': `${index * 0.15}s`,
                                '--brand-color': brand.color
                            } as React.CSSProperties}
                            onClick={() => handleCardClick(brand.id)}
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                        >
                            <div className="card-background">
                                <div className="card-gradient" />
                            </div>

                            <div className="card-content">
                                <div className="card-logo">
                                    <img src={brand.logo} alt={brand.name} />
                                </div>
                                <h3 className="card-name">{brand.name}</h3>
                                <p className="card-tagline">{brand.tagline}</p>

                                <div className="card-collections">
                                    {brand.collections.slice(0, 3).map((collection, i) => (
                                        <span key={i} className="collection-tag">{collection}</span>
                                    ))}
                                </div>

                                <div className="card-cta">
                                    <span>Explore Collection</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="card-shine" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExpandableBrands;
