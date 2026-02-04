import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// useOutsideClick hook
export const useOutsideClick = (
    ref: React.RefObject<HTMLDivElement>,
    callback: (event: MouseEvent | TouchEvent) => void
) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            callback(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, callback]);
};

// CloseIcon component
export function CloseIcon() {
    return (
        <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="expandable-close-icon"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    );
}

// Types
export interface ExpandableCardItem {
    id: number | string;
    title: string;
    description: string;
    thumbnail: string;
    icon?: string;
    ctaText: string;
    ctaLink: string;
    content: () => React.ReactNode;
}

interface ExpandableCardProps {
    cards: ExpandableCardItem[];
}

// Main ExpandableCards component
export function ExpandableCards({ cards }: ExpandableCardProps) {
    const [active, setActive] = useState<ExpandableCardItem | null>(null);
    const [showCatalogueSelector, setShowCatalogueSelector] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null);
                setShowCatalogueSelector(false);
            }
        }

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => {
        setActive(null);
        setShowCatalogueSelector(false);
    });

    const handleCatalogueSelect = (e: React.MouseEvent, card: ExpandableCardItem) => {
        e.stopPropagation();
        setActive(card);
        setShowCatalogueSelector(false);
    };

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="expandable-overlay"
                        onClick={() => setActive(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active && (
                    <div className="pdf-viewer-container" ref={ref} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <motion.div
                            className="pdf-viewer-header"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="pdf-viewer-header-left">
                                <div className="pdf-viewer-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                    </svg>
                                </div>

                                {/* Catalogue Selector */}
                                <div className="pdf-catalogue-selector" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="pdf-catalogue-selector-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCatalogueSelector(!showCatalogueSelector);
                                        }}
                                    >
                                        <div className="pdf-viewer-title-group">
                                            <h2 className="pdf-viewer-title">{active.title}</h2>
                                            <p className="pdf-viewer-subtitle">Catalogue Preview</p>
                                        </div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={`selector-arrow ${showCatalogueSelector ? 'open' : ''}`}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {/* Dropdown */}
                                    {showCatalogueSelector && (
                                        <motion.div
                                            className="pdf-catalogue-dropdown"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="pdf-catalogue-dropdown-header">
                                                <span>All Catalogues</span>
                                                <span className="catalogue-count">{cards.length}</span>
                                            </div>
                                            <div className="pdf-catalogue-dropdown-list">
                                                {cards.map((card) => (
                                                    <button
                                                        key={card.id}
                                                        className={`pdf-catalogue-item ${card.id === active.id ? 'active' : ''}`}
                                                        onClick={(e) => handleCatalogueSelect(e, card)}
                                                    >
                                                        <div className="catalogue-item-info">
                                                            <span className="catalogue-item-title">{card.title}</span>
                                                            {card.ctaLink === '#' && (
                                                                <span className="catalogue-item-badge">Coming Soon</span>
                                                            )}
                                                        </div>
                                                        {card.id === active.id && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            <div className="pdf-viewer-header-right">
                                {active.ctaLink !== '#' && (
                                    <a
                                        href={active.ctaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pdf-viewer-download-btn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download PDF
                                    </a>
                                )}
                                <button
                                    className="pdf-viewer-close-btn"
                                    onClick={() => setActive(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>

                        {/* PDF Content */}
                        <motion.div
                            className="pdf-viewer-content"
                            layoutId={`card-${active.id}-${id}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            {active.ctaLink !== '#' ? (
                                <iframe
                                    src={active.ctaLink}
                                    className="pdf-viewer-iframe"
                                    title={active.title}
                                />
                            ) : (
                                <div className="pdf-viewer-coming-soon">
                                    <div className="coming-soon-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <h3>Coming Soon</h3>
                                    <p>This catalogue will be available shortly.</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Footer Info */}
                        <motion.div
                            className="pdf-viewer-footer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <p className="pdf-viewer-description">{active.description}</p>
                            <div className="pdf-viewer-tips">
                                <span>💡 Tip: Use scroll or pinch to zoom • Press ESC to close</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ul className="expandable-cards-grid">
                {cards.map((card, index) => (
                    <motion.li
                        layoutId={`card-${card.id}-${id}`}
                        key={`card-${card.id}-${id}`}
                        onClick={() => setActive(card)}
                        className="expandable-card"
                    >
                        <div className="expandable-card-inner">
                            {/* Text Content Box */}
                            <div className="expandable-card-text">
                                {/* Number Indicator */}
                                <span className="expandable-card-number">{String(index + 1).padStart(2, '0')}</span>

                                {/* Icon in dark circle */}
                                <div className="expandable-card-icon-wrapper">
                                    {card.icon ? (
                                        <span className="expandable-card-icon">{card.icon}</span>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                        </svg>
                                    )}
                                </div>
                                <motion.h3
                                    layoutId={`title-${card.id}-${id}`}
                                    className="expandable-card-title"
                                >
                                    {card.title}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${card.id}-${id}`}
                                    className="expandable-card-description"
                                >
                                    {card.description}
                                </motion.p>
                                <motion.button
                                    layoutId={`button-${card.id}-${id}`}
                                    className="expandable-card-cta"
                                >
                                    <span>Open</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </motion.button>
                            </div>
                            {/* Floating Book Image */}
                            <motion.div layoutId={`image-${card.id}-${id}`} className="expandable-card-image-wrapper">
                                <img
                                    src={card.thumbnail}
                                    alt={card.title}
                                    className="expandable-card-image"
                                />
                            </motion.div>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </>
    );
}

export default ExpandableCards;
