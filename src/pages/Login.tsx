import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    User,
    Phone,
    Building2,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Shield,
    Store,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

type UserType = 'ADMIN' | 'DEALER' | 'B2B' | null;

const Login = () => {
    const navigate = useNavigate();
    const { login, register, isAuthenticated, user, isLoading: authLoading } = useAuth();
    const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            console.log('[Login] Already authenticated, redirecting. Role:', user.role);
            const redirectPath = user.role === 'ADMIN' ? '/admin'
                : user.role === 'DEALER' ? '/dealer'
                    : '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (result.success && result.user) {
                // Use user from response directly
                const role = result.user.role;
                console.log('[Login] Login successful, redirecting. Role:', role);
                if (role === 'ADMIN') {
                    navigate('/admin', { replace: true });
                } else if (role === 'DEALER') {
                    navigate('/dealer', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                setError(result.error || 'Login failed');
                setIsLoading(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await register({
                email,
                phone,
                password,
                name,
                companyName: companyName || undefined,
            });
            if (result.success) {
                navigate('/dashboard', { replace: true });
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSelection = () => {
        setSelectedUserType(null);
        setError(null);
        setEmail('');
        setPassword('');
        setIsLogin(true);
    };

    const getPortalInfo = () => {
        switch (selectedUserType) {
            case 'ADMIN':
                return { name: 'Admin Portal', icon: Shield, color: 'admin' };
            case 'DEALER':
                return { name: 'Dealer Portal', icon: Store, color: 'dealer' };
            case 'B2B':
                return { name: 'B2B Customer Portal', icon: Briefcase, color: 'b2b' };
            default:
                return null;
        }
    };

    // Show loading while checking auth status
    if (authLoading) {
        return (
            <div className="auth-page">
                <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            </div>
        );
    }

    const portalInfo = getPortalInfo();

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Panel - Branding */}
                <div className="auth-branding">
                    <div className="branding-content">
                        <Link to="/" className="auth-logo">
                            <div className="logo-icon">H</div>
                            <span>Homelia</span>
                        </Link>
                        <h1>Welcome to Homelia</h1>
                        <p>Your trusted partner for premium Durian & Rockstar laminates. Access dealer pricing, manage orders, and track invoices.</p>
                        <div className="branding-features">
                            <div className="feature-item">
                                <div className="feature-check">✓</div>
                                <span>Exclusive dealer pricing</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-check">✓</div>
                                <span>Track orders & invoices</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-check">✓</div>
                                <span>Save quotes & favorites</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-check">✓</div>
                                <span>Quick re-ordering</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-container">
                        {/* User Type Selection */}
                        {!selectedUserType ? (
                            <div className="user-type-selection">
                                <h2 className="selection-title">Choose Your Portal</h2>
                                <p className="selection-subtitle">Select how you'd like to sign in</p>

                                <div className="user-type-selector">
                                    <button
                                        className="user-type-card admin"
                                        onClick={() => setSelectedUserType('ADMIN')}
                                    >
                                        <div className="card-icon">
                                            <Shield size={32} />
                                        </div>
                                        <h3>Admin Portal</h3>
                                        <p>Manage products, orders, and users</p>
                                    </button>

                                    <button
                                        className="user-type-card dealer"
                                        onClick={() => setSelectedUserType('DEALER')}
                                    >
                                        <div className="card-icon">
                                            <Store size={32} />
                                        </div>
                                        <h3>Dealer Portal</h3>
                                        <p>Access dealer pricing and inventory</p>
                                    </button>

                                    <button
                                        className="user-type-card b2b"
                                        onClick={() => setSelectedUserType('B2B')}
                                    >
                                        <div className="card-icon">
                                            <Briefcase size={32} />
                                        </div>
                                        <h3>B2B Customer</h3>
                                        <p>Browse catalog and place orders</p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Login Header with Back Button */}
                                <div className="login-header">
                                    <button
                                        className="back-button"
                                        onClick={handleBackToSelection}
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    {portalInfo && (
                                        <div className={`portal-badge ${portalInfo.color}`}>
                                            <portalInfo.icon size={16} />
                                            <span>{portalInfo.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tabs - Only show Create Account for B2B */}
                                <div className="auth-tabs">
                                    <button
                                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                                        onClick={() => { setIsLogin(true); setError(null); }}
                                    >
                                        Sign In
                                    </button>
                                    {selectedUserType === 'B2B' && (
                                        <button
                                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                            onClick={() => { setIsLogin(false); setError(null); }}
                                        >
                                            Create Account
                                        </button>
                                    )}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="auth-error">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Login Form */}
                                {isLogin ? (
                                    <form className="auth-form" onSubmit={handleLogin}>
                                        <div className="input-group">
                                            <label className="input-label">Email Address</label>
                                            <div className="input-with-icon">
                                                <Mail size={18} />
                                                <input
                                                    type="email"
                                                    className="input"
                                                    placeholder="your@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Password</label>
                                            <div className="input-with-icon">
                                                <Lock size={18} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="input"
                                                    placeholder="Enter password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-options">
                                            <label className="checkbox-label">
                                                <input type="checkbox" />
                                                <span>Remember me</span>
                                            </label>
                                            <a href="#" className="forgot-link">Forgot password?</a>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg submit-btn"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 size={18} className="spin" />
                                                    Signing in...
                                                </>
                                            ) : (
                                                <>
                                                    Sign In <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>

                                        <div className="demo-credentials">
                                            <p><strong>Test Credentials:</strong></p>
                                            {selectedUserType === 'ADMIN' && <p>admin@homelia.in / admin123</p>}
                                            {selectedUserType === 'DEALER' && <p>dealer@example.com / dealer123</p>}
                                            {selectedUserType === 'B2B' && <p>b2b@example.com / b2b123</p>}
                                        </div>
                                    </form>
                                ) : (
                                    /* Register Form - Only for B2B */
                                    <form className="auth-form" onSubmit={handleRegister}>
                                        <div className="form-row">
                                            <div className="input-group">
                                                <label className="input-label">Full Name</label>
                                                <div className="input-with-icon">
                                                    <User size={18} />
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        placeholder="Your name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Phone</label>
                                                <div className="input-with-icon">
                                                    <Phone size={18} />
                                                    <input
                                                        type="tel"
                                                        className="input"
                                                        placeholder="9876543210"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Email Address</label>
                                            <div className="input-with-icon">
                                                <Mail size={18} />
                                                <input
                                                    type="email"
                                                    className="input"
                                                    placeholder="your@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Company Name (Optional)</label>
                                            <div className="input-with-icon">
                                                <Building2 size={18} />
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Your company"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Password</label>
                                            <div className="input-with-icon">
                                                <Lock size={18} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="input"
                                                    placeholder="Create password (min 8 chars)"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    minLength={8}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <label className="checkbox-label terms">
                                            <input type="checkbox" required />
                                            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                                        </label>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg submit-btn"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 size={18} className="spin" />
                                                    Creating account...
                                                </>
                                            ) : (
                                                <>
                                                    Create Account <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
