import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft, ChevronRight, ChevronDown, Check,
  Minus, Plus, Download, X, Maximize2, PanelLeftClose, PanelLeft, Clock, LayoutGrid
} from 'lucide-react';
import { ExpandableCardItem } from './ExpandableCards';
import './CatalogueViewer.css';

// PDF.js worker — served from public/ for reliable Vite compatibility
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface CatalogueViewerProps {
  card: ExpandableCardItem;
  cards: ExpandableCardItem[];
  onClose: () => void;
  onSwitch: (card: ExpandableCardItem) => void;
}

export default function CatalogueViewer({ card, cards, onClose, onSwitch }: CatalogueViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [contentWidth, setContentWidth] = useState(700);
  const [contentHeight, setContentHeight] = useState(500);
  const [pageRatio, setPageRatio] = useState<number | null>(null);
  
  const [pageInput, setPageInput] = useState('1');
  const [zoomInput, setZoomInput] = useState('100');

  useEffect(() => setPageInput(currentPage.toString()), [currentPage]);
  useEffect(() => setZoomInput(Math.round(scale * 100).toString()), [scale]);

  const observerRef = useRef<ResizeObserver | null>(null);

  const contentRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    if (node) {
      observerRef.current = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        const h = entries[0].contentRect.height;
        // Ignore minor changes (< 25px) like Windows scrollbars appearing/disappearing
        // This prevents the PDF from re-rendering and flashing when scale crosses 100%
        if (w > 0) setContentWidth(prev => Math.abs(w - prev) > 25 ? w : prev);
        if (h > 0) setContentHeight(prev => Math.abs(h - prev) > 25 ? h : prev);
      });
      observerRef.current.observe(node);
    }
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const isComingSoon = card.ctaLink === '#';
  const pdfUrl = card.ctaLink;

  // ---- Reset when switching catalogues ----
  useEffect(() => {
    setCurrentPage(1);
    setScale(1);
    setPdfLoading(true);
    setNumPages(0);
  }, [pdfUrl]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Escape') { onClose(); return; }
      if (!numPages) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goToPage(currentPage + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goToPage(currentPage - 1); }
      if ((e.key === '=' || e.key === '+') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomIn(); }
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomOut(); }
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPage, numPages]);

  // ---- Click outside dropdown ----
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  // ---- Scroll active thumbnail into view ----
  useEffect(() => {
    if (!sidebarRef.current) return;
    const activeThumb = sidebarRef.current.querySelector('.cv-thumb.active');
    activeThumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentPage]);

  // ---- Navigation ----
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > numPages || page === currentPage || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
    }, 180);
  }, [numPages, currentPage, isTransitioning]);

  const prevPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);
  const nextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);

  // ---- Zoom ----
  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.25, 3)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.25, 0.5)), []);

  // ---- Fullscreen & Close ----
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    onClose();
  }, [onClose]);

  // ---- Touch swipe ----
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) nextPage();
      else prevPage();
    }
  }, [nextPage, prevPage]);

  // ---- Pinch to Zoom (Trackpad) ----
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault(); // Prevent default browser zoom
        // Use a slightly higher sensitivity for Windows trackpads which often report smaller deltaYs
        const zoomSensitivity = 0.01;
        const delta = -e.deltaY * zoomSensitivity;
        setScale(s => Math.min(Math.max(s + delta, 0.5), 3));
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  // ---- PDF load success ----
  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPdfLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    try {
      const viewport = page.getViewport({ scale: 1 });
      if (viewport.width && viewport.height) {
        setPageRatio(viewport.width / viewport.height);
      }
    } catch (e) {
      if (page.originalWidth && page.originalHeight) {
        setPageRatio(page.originalWidth / page.originalHeight);
      }
    }
  }, []);

  // ---- Calculate optimal page width ----
  const pageWidth = useMemo(() => {
    const PADDING = 0; // Absolute zero padding to maximize space
    if (!pageRatio) {
      const base = contentWidth - PADDING;
      return Math.max(base, 200);
    }
    
    const containerRatio = (contentWidth - PADDING) / (contentHeight - PADDING);
    let baseWidth;
    
    if (pageRatio > containerRatio) {
      // PDF is wider than container, constrain by width
      baseWidth = contentWidth - PADDING;
    } else {
      // PDF is taller than container, constrain by height
      baseWidth = (contentHeight - PADDING) * pageRatio;
    }
    
    return Math.max(baseWidth, 200);
  }, [contentWidth, contentHeight, pageRatio]);

  const thumbWidth = 70;

  // ---- Dots (max 15 shown) ----
  const maxDots = 15;
  const dotsToShow = useMemo(() => {
    if (numPages <= maxDots) return Array.from({ length: numPages }, (_, i) => i + 1);
    // Show dots around current page
    const half = Math.floor(maxDots / 2);
    let start = Math.max(1, currentPage - half);
    let end = start + maxDots - 1;
    if (end > numPages) { end = numPages; start = Math.max(1, end - maxDots + 1); }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [numPages, currentPage]);

  const handleSwitch = useCallback((e: React.MouseEvent, c: ExpandableCardItem) => {
    e.stopPropagation();
    if (c.ctaLink === '#') return; // coming soon
    setShowDropdown(false);
    onSwitch(c);
  }, [onSwitch]);

  // ---- Memoized Heavy PDF Components ----
  const sidebarContent = useMemo(() => {
    if (!showSidebar || numPages <= 0) return null;
    return (
      <aside className="cv-sidebar" ref={sidebarRef}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pg) => (
          <div
            key={pg}
            className={`cv-thumb ${pg === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(pg)}
          >
            <div className="cv-thumb-canvas">
              <Page
                pageNumber={pg}
                width={thumbWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading=""
              />
            </div>
            <span className="cv-thumb-num">{pg}</span>
          </div>
        ))}
      </aside>
    );
  }, [showSidebar, numPages, currentPage, goToPage, thumbWidth]);

  const mainPagesContent = useMemo(() => {
    return [currentPage - 1, currentPage, currentPage + 1]
      .filter((p) => p >= 1 && p <= numPages)
      .map((pg) => (
        <div
          key={pg}
          style={{
            position: pg === currentPage ? 'relative' : 'absolute',
            opacity: pg === currentPage ? 1 : 0,
            pointerEvents: pg === currentPage ? 'auto' : 'none',
            zIndex: pg === currentPage ? 1 : -1,
            visibility: pg === currentPage ? 'visible' : 'hidden',
          }}
        >
          <Page
            pageNumber={pg}
            width={pageWidth}
            onLoadSuccess={pg === currentPage ? onPageLoadSuccess : undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading=""
          />
        </div>
      ));
  }, [currentPage, numPages, pageWidth, onPageLoadSuccess]);

  return (
    <div className="cv-container">
      {/* Progress bar */}
      {numPages > 0 && (
        <div className="cv-progress" style={{ width: `${(currentPage / numPages) * 100}%` }} />
      )}

      {/* ======== HEADER ======== */}
      <header className="cv-header">
        <div className="cv-header-left" ref={dropdownRef}>
          <div className="cv-brand-icon">H</div>
          
          <button className="cv-cat-trigger" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="cv-cat-name-row">
              <h2 className="cv-cat-name">{card.title}</h2>
              <ChevronDown size={14} className={`cv-cat-arrow ${showDropdown ? 'open' : ''}`} />
            </div>
            <div className="cv-cat-label">CATALOGUE PREVIEW</div>
          </button>

          {showDropdown && (
            <div className="cv-dropdown">
              <div className="cv-dropdown-header">
                <span>All Catalogues</span>
                <span className="cv-dropdown-count">{cards.length}</span>
              </div>
              <div className="cv-dropdown-list">
                {cards.map((c) => (
                  <button
                    key={c.id}
                    className={`cv-dropdown-item ${c.id === card.id ? 'active' : ''}`}
                    onClick={(e) => handleSwitch(e, c)}
                  >
                    <div>
                      <span className={`cv-dropdown-item-name ${c.ctaLink === '#' ? 'dim' : ''}`}>
                        {c.title}
                      </span>
                    </div>
                    {c.ctaLink === '#' ? (
                      <span className="cv-dropdown-badge">Coming Soon</span>
                    ) : c.id === card.id ? (
                      <Check size={14} className="cv-dropdown-check" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cv-sep" />

        <div className="cv-nav-group">
          <button className="cv-btn" onClick={prevPage} disabled={currentPage <= 1 || pdfLoading} aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <span className="cv-page-info">
            <input
              type="text"
              value={pdfLoading ? '–' : pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setPageInput(currentPage.toString())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(pageInput);
                  if (!isNaN(val) && val >= 1 && val <= numPages) goToPage(val);
                  else setPageInput(currentPage.toString());
                  e.currentTarget.blur();
                }
              }}
              disabled={pdfLoading}
              className="cv-inline-input"
              style={{ width: `${Math.max(1, pageInput.length)}ch` }}
            />
            <span className="cv-slash">/</span>
            <span>{pdfLoading ? '–' : numPages}</span>
          </span>
          <button className="cv-btn" onClick={nextPage} disabled={currentPage >= numPages || pdfLoading} aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="cv-sep" />

        <div className="cv-zoom-group">
          <button className="cv-btn" onClick={zoomOut} disabled={scale <= 0.5 || pdfLoading} aria-label="Zoom out">
            <Minus size={14} />
          </button>
          <span className="cv-zoom-label">
            <input
              type="text"
              value={zoomInput}
              onChange={(e) => setZoomInput(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setZoomInput(Math.round(scale * 100).toString())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(zoomInput);
                  if (!isNaN(val)) {
                    // restrict zoom between 50% and 300%
                    setScale(s => Math.min(Math.max(val / 100, 0.5), 3));
                  } else {
                    setZoomInput(Math.round(scale * 100).toString());
                  }
                  e.currentTarget.blur();
                }
              }}
              disabled={pdfLoading}
              className="cv-inline-input"
              style={{ width: `${Math.max(2, zoomInput.length)}ch` }}
            />
            <span className="cv-percent">%</span>
          </span>
          <button className="cv-btn" onClick={zoomIn} disabled={scale >= 3 || pdfLoading} aria-label="Zoom in">
            <Plus size={14} />
          </button>
        </div>

        <div className="cv-header-right">
          <button
            className={`cv-sidebar-toggle ${showSidebar ? 'active' : ''}`}
            onClick={() => setShowSidebar(!showSidebar)}
            aria-label="Toggle sidebar"
          >
            {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>

          <div className="cv-sep" />

          {!isComingSoon && (
            <a href={pdfUrl} download className="cv-download-btn">
              <Download size={14} />
              <span>DOWNLOAD PDF</span>
            </a>
          )}

          <button className="cv-close-btn" onClick={handleClose} aria-label="Close viewer">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ======== MAIN AREA ======== */}
      <div className="cv-main">
        {isComingSoon ? (
          <div className="cv-coming-soon">
            <Clock size={56} className="cv-coming-soon-icon" />
            <h3>Coming Soon</h3>
            <p>This catalogue will be available shortly.</p>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading=""
            className="cv-document-wrapper"
            error={
              <div className="cv-coming-soon">
                <X size={56} className="cv-coming-soon-icon" />
                <h3>Unable to Load</h3>
                <p>Could not load this PDF. Please try downloading it instead.</p>
              </div>
            }
          >
            {/* Sidebar Thumbnails */}
            {sidebarContent}

            {/* Page Display */}
            <div
              className="cv-content-area"
              ref={contentRef}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {pdfLoading ? (
                <div className="cv-loading-container">
                  <div className="cv-loading-skeleton" />
                </div>
              ) : (
                <div 
                  className={`cv-page-wrapper ${isTransitioning ? 'transitioning' : ''}`} 
                  style={{ 
                    position: 'relative',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: isTransitioning ? 'transform 0.2s ease-out' : 'none',
                    willChange: 'transform'
                  }}
                >
                  {mainPagesContent}
                </div>
              )}
            </div>
          </Document>
        )}
      </div>

      {/* ======== FOOTER ======== */}
      <footer className="cv-footer">
        <span className="cv-footer-label">{card.title} · Homelia</span>
        <span className="cv-footer-desc">{card.description}</span>

        {numPages > 0 && (
          <div className="cv-dots">
            {dotsToShow[0] > 1 && <span className="cv-dots-ellipsis">…</span>}
            {dotsToShow.map((pg) => (
              <div
                key={pg}
                className={`cv-dot ${pg === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(pg)}
              />
            ))}
            {dotsToShow[dotsToShow.length - 1] < numPages && <span className="cv-dots-ellipsis">…</span>}
          </div>
        )}

        <span className="cv-footer-tip">
          <kbd>←</kbd> <kbd>→</kbd> navigate · <kbd>F</kbd> fullscreen · <kbd>ESC</kbd> close
        </span>

        <button className="cv-fullscreen-btn" onClick={toggleFullscreen} title="Fullscreen">
          <Maximize2 size={14} />
        </button>
      </footer>
    </div>
  );
}
