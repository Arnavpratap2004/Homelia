import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import BrandPage from './pages/BrandPage';
import RequestQuote from './pages/RequestQuote';
import SampleOrder from './pages/SampleOrder';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import BulkOrder from './pages/BulkOrder';
// Role-specific dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import DealerDashboard from './pages/dealer/DealerDashboard';

// Layout wrapper that conditionally shows Header/Footer
function AppLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    // Check if current route is a dashboard (admin, dealer, or B2B customer)
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isDealerRoute = location.pathname.startsWith('/dealer');
    const isB2BDashboard = location.pathname === '/dashboard';
    const isStandaloneDashboard = isAdminRoute || isDealerRoute || isB2BDashboard;

    if (isStandaloneDashboard) {
        // Render without Header/Footer for all dashboard pages
        return <>{children}</>;
    }

    // Render with Header/Footer for all other routes
    return (
        <div className="app">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppLayout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />

                            {/* Product pages - Coming Soon */}
                            <Route path="/catalog" element={<ComingSoon />} />
                            <Route path="/product/:id" element={<ComingSoon />} />

                            {/* Brands - Active with catalogues */}
                            <Route path="/brands/:brandId" element={<BrandPage />} />

                            <Route path="/request-quote" element={<RequestQuote />} />
                            <Route path="/sample-order" element={<SampleOrder />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/bulk-order" element={<BulkOrder />} />

                            {/* Admin Routes - Standalone layout */}
                            <Route
                                path="/admin/*"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Dealer Routes - Standalone layout */}
                            <Route
                                path="/dealer/*"
                                element={
                                    <ProtectedRoute allowedRoles={['DEALER']}>
                                        <DealerDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* B2B Customer Dashboard */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['B2B_CUSTOMER', 'DEALER', 'ADMIN']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </AppLayout>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
