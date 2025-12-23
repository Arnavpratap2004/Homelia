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
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null);
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

    useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => setActive(null));

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="expandable-overlay"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active && (
                    <div className="expandable-modal-container">
                        <motion.button
                            key={`button-${active.id}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="expandable-close-button"
                            onClick={() => setActive(null)}
                        >
                            <CloseIcon />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.id}-${id}`}
                            ref={ref}
                            className="expandable-modal"
                        >
                            <motion.div layoutId={`image-${active.id}-${id}`} className="expandable-modal-image-wrapper">
                                <iframe
                                    src={active.ctaLink}
                                    className="expandable-modal-iframe"
                                    title={active.title}
                                />
                            </motion.div>

                            <div className="expandable-modal-content">
                                <div className="expandable-modal-header">
                                    <div>
                                        <motion.h3
                                            layoutId={`title-${active.id}-${id}`}
                                            className="expandable-modal-title"
                                        >
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.id}-${id}`}
                                            className="expandable-modal-description"
                                        >
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.a
                                        layoutId={`button-${active.id}-${id}`}
                                        href={active.ctaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="expandable-modal-cta"
                                    >
                                        {active.ctaText}
                                    </motion.a>
                                </div>
                                <div className="expandable-modal-body">
                                    {typeof active.content === "function"
                                        ? active.content()
                                        : active.content}
                                </div>
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
