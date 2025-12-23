import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, isLoading, getRole } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role permissions if specified
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = getRole();
        if (!userRole || !allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on role
            const dashboardPath = getDashboardPath(userRole);
            return <Navigate to={dashboardPath} replace />;
        }
    }

    return <>{children}</>;
};

// Helper to get dashboard path based on role
export const getDashboardPath = (role: UserRole | null): string => {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'DEALER':
            return '/dealer';
        case 'B2B_CUSTOMER':
            return '/dashboard';
        default:
            return '/';
    }
};

export default ProtectedRoute;
