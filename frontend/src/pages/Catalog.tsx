import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    ChevronDown,
    X,
    SlidersHorizontal,
    ArrowUpDown
} from 'lucide-react';
import { productsApi } from '../api';
import ProductCard from '../components/ProductCard';
import {
    products as mockProducts,
    categories,
    finishOptions,
    thicknessOptions,
    applicationOptions,
    Product
} from '../data/products';
import './Catalog.css';

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('featured');
    const [products, setProducts] = useState<Product[]>(mockProducts);

    // Fetch products from API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsApi.list();
                if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                    setProducts(response.data as Product[]);
                }
            } catch (error) {
                console.log('Using mock product data (API not available)');
                // Keep using mock data
            }
        };
        fetchProducts();
    }, []);

    // Get filter values from URL
    const selectedCategory = searchParams.get('category') || '';
    const selectedBrand = searchParams.get('brand') || '';
    const selectedFinish = searchParams.get('finish') || '';
    const selectedThickness = searchParams.get('thickness') || '';
    const selectedApplication = searchParams.get('application') || '';

    // Filter products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                p.texture.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Brand filter
        if (selectedBrand) {
            result = result.filter(p => p.brand === selectedBrand);
        }

        // Finish filter
        if (selectedFinish) {
            result = result.filter(p => p.finish === selectedFinish);
        }

        // Thickness filter
        if (selectedThickness) {
            result = result.filter(p => p.thickness === selectedThickness);
        }

        // Application filter
        if (selectedApplication) {
            result = result.filter(p => p.applications.includes(selectedApplication));
        }

        // Sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.price || 9999) - (b.price || 9999));
                break;
            case 'price-high':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'featured':
            default:
                result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        return result;
    }, [searchQuery, selectedCategory, selectedBrand, selectedFinish, selectedThickness, selectedApplication, sortBy]);

    const updateFilter = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
        setSearchQuery('');
    };

    const activeFiltersCount = [selectedCategory, selectedBrand, selectedFinish, selectedThickness, selectedApplication].filter(Boolean).length;

    return (
        <div className="catalog-page">
            {/* Page Header */}
            <div className="catalog-header">
                <div className="container">
                    <div className="catalog-header-content">
                        <div>
                            <h1>Laminate Catalog</h1>
                            <p>Explore our collection of {filteredProducts.length} premium laminates</p>
                        </div>
                        <div className="catalog-breadcrumb">
                            <Link to="/">Home</Link>
                            <span>/</span>
                            <span>Catalog</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="catalog-layout">
                    {/* Sidebar Filters - Desktop */}
                    <aside className={`catalog-sidebar ${showFilters ? 'show-mobile' : ''}`}>
                        <div className="sidebar-header">
                            <h3>
                                <Filter size={18} />
                                Filters
                            </h3>
                            {activeFiltersCount > 0 && (
                                <button className="clear-filters-btn" onClick={clearFilters}>
                                    Clear All
                                </button>
                            )}
                            <button className="close-filters-btn" onClick={() => setShowFilters(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="filter-section">
                            <h4>Category</h4>
                            <div className="filter-options">
                                {categories.map(cat => (
                                    <label key={cat.id} className="filter-option">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat.id}
                                            onChange={() => updateFilter('category', selectedCategory === cat.id ? '' : cat.id)}
                                        />
                                        <span className="filter-label">{cat.name}</span>
                                        <span className="filter-count">{cat.count}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div className="filter-section">
                            <h4>Brand</h4>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="brand"
                                        checked={selectedBrand === 'durian'}
                                        onChange={() => updateFilter('brand', selectedBrand === 'durian' ? '' : 'durian')}
                                    />
                                    <span className="brand-dot durian"></span>
                                    <span className="filter-label">Durian</span>
                                </label>
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="brand"
                                        checked={selectedBrand === 'rockstar'}
                                        onChange={() => updateFilter('brand', selectedBrand === 'rockstar' ? '' : 'rockstar')}
                                    />
                                    <span className="brand-dot rockstar"></span>
                                    <span className="filter-label">Rockstar</span>
                                </label>
                            </div>
                        </div>

                        {/* Finish Filter */}
                        <div className="filter-section">
                            <h4>Finish</h4>
                            <div className="filter-options">
                                {finishOptions.map(opt => (
                                    <label key={opt.value} className="filter-option">
                                        <input
                                            type="radio"
                                            name="finish"
                                            checked={selectedFinish === opt.value}
                                            onChange={() => updateFilter('finish', selectedFinish === opt.value ? '' : opt.value)}
                                        />
                                        <span className="filter-label">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Thickness Filter */}
                        <div className="filter-section">
                            <h4>Thickness</h4>
                            <div className="filter-options">
                                {thicknessOptions.map(opt => (
                                    <label key={opt.value} className="filter-option">
                                        <input
                                            type="radio"
                                            name="thickness"
                                            checked={selectedThickness === opt.value}
                                            onChange={() => updateFilter('thickness', selectedThickness === opt.value ? '' : opt.value)}
                                        />
                                        <span className="filter-label">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Application Filter */}
                        <div className="filter-section">
                            <h4>Application</h4>
                            <div className="filter-options">
                                {applicationOptions.map(opt => (
                                    <label key={opt.value} className="filter-option">
                                        <input
                                            type="radio"
                                            name="application"
                                            checked={selectedApplication === opt.value}
                                            onChange={() => updateFilter('application', selectedApplication === opt.value ? '' : opt.value)}
                                        />
                                        <span className="filter-label">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="catalog-main">
                        {/* Toolbar */}
                        <div className="catalog-toolbar">
                            <div className="toolbar-left">
                                <button
                                    className="filter-toggle-btn btn btn-outline"
                                    onClick={() => setShowFilters(true)}
                                >
                                    <SlidersHorizontal size={18} />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="filter-badge">{activeFiltersCount}</span>
                                    )}
                                </button>
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search laminates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')}>
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="toolbar-right">
                                <div className="sort-dropdown">
                                    <ArrowUpDown size={16} />
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="featured">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name">Name: A to Z</option>
                                    </select>
                                    <ChevronDown size={16} />
                                </div>
                                <div className="view-toggle">
                                    <button
                                        className={viewMode === 'grid' ? 'active' : ''}
                                        onClick={() => setViewMode('grid')}
                                        aria-label="Grid view"
                                    >
                                        <Grid3X3 size={18} />
                                    </button>
                                    <button
                                        className={viewMode === 'list' ? 'active' : ''}
                                        onClick={() => setViewMode('list')}
                                        aria-label="List view"
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFiltersCount > 0 && (
                            <div className="active-filters">
                                {selectedCategory && (
                                    <span className="active-filter">
                                        {categories.find(c => c.id === selectedCategory)?.name}
                                        <button onClick={() => updateFilter('category', '')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {selectedBrand && (
                                    <span className="active-filter">
                                        {selectedBrand === 'durian' ? 'Durian' : 'Rockstar'}
                                        <button onClick={() => updateFilter('brand', '')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {selectedFinish && (
                                    <span className="active-filter">
                                        {finishOptions.find(f => f.value === selectedFinish)?.label}
                                        <button onClick={() => updateFilter('finish', '')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {selectedThickness && (
                                    <span className="active-filter">
                                        {thicknessOptions.find(t => t.value === selectedThickness)?.label}
                                        <button onClick={() => updateFilter('thickness', '')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {selectedApplication && (
                                    <span className="active-filter">
                                        {applicationOptions.find(a => a.value === selectedApplication)?.label}
                                        <button onClick={() => updateFilter('application', '')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products Grid/List */}
                        {filteredProducts.length > 0 ? (
                            <div className={`products-container ${viewMode}`}>
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <div className="no-results-icon">
                                    <Search size={48} />
                                </div>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search query</p>
                                <button className="btn btn-primary" onClick={clearFilters}>
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
