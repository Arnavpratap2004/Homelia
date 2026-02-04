import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { clearCart } = useCart();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await logout();
                clearCart();
            } catch (error) {
                console.error('Logout error:', error);
            }
            // Also manually clear localStorage as a fallback
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            // Redirect to home
            navigate('/', { replace: true });
        };
        performLogout();
    }, [logout, clearCart, navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontSize: '18px'
        }}>
            Logging out...
        </div>
    );
};

export default Logout;
