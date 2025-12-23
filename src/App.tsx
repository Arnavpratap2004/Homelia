import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
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
// Role-specific dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import DealerDashboard from './pages/dealer/DealerDashboard';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/catalog" element={<Catalog />} />
                                <Route path="/product/:id" element={<ProductDetail />} />
                                <Route path="/brands/:brandId" element={<BrandPage />} />
                                <Route path="/request-quote" element={<RequestQuote />} />
                                <Route path="/sample-order" element={<SampleOrder />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/logout" element={<Logout />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/faq" element={<FAQ />} />

                                {/* Admin Routes */}
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN']}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Dealer Routes */}
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
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
