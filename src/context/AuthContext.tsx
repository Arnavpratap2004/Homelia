import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, setToken, setRefreshToken, clearTokens } from '../api';

// Types
export type UserRole = 'ADMIN' | 'DEALER' | 'B2B_CUSTOMER' | 'RETAIL' | 'RETAIL_CUSTOMER';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    getRole: () => UserRole | null;
    isAdmin: () => boolean;
    isDealer: () => boolean;
    isB2B: () => boolean;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
    role?: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely get user from localStorage
const getStoredUser = (): User | null => {
    try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            return JSON.parse(storedUser);
        }
    } catch (e) {
        console.error('[AuthContext] Error reading stored user:', e);
    }
    return null;
};

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize with null, then hydrate from localStorage in useEffect
    const [user, setUser] = useState<User | null>(getStoredUser);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate auth state from localStorage on mount
    useEffect(() => {
        const storedUser = getStoredUser();
        console.log('[AuthContext] Hydrating from localStorage:', storedUser ? storedUser.role : 'NULL');
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
        try {
            const response = await authApi.login(email, password);

            if (response.success && response.data) {
                const userData = response.data.user;
                // Store tokens and user
                setToken(response.data.tokens.accessToken);
                setRefreshToken(response.data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));
                // Update React state
                setUser(userData);
                console.log('[AuthContext] Login successful, user set:', userData.role);
                return { success: true, user: userData };
            }

            return { success: false, error: response.message || 'Login failed' };
        } catch (error) {
            console.error('[AuthContext] Login error:', error);
            return { success: false, error: 'An error occurred during login' };
        }
    };

    // Register function
    const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await authApi.register({
                email: data.email,
                password: data.password,
                name: data.name,
                phone: data.phone || '',
                companyName: data.companyName,
            });

            if (response.success && response.data) {
                const userData = response.data.user;
                setToken(response.data.tokens.accessToken);
                setRefreshToken(response.data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            }

            return { success: false, error: response.message || 'Registration failed' };
        } catch (error) {
            console.error('[AuthContext] Register error:', error);
            return { success: false, error: 'An error occurred during registration' };
        }
    };

    // Logout function
    const logout = async () => {
        console.log('[AuthContext] Logging out');
        try {
            await authApi.logout();
        } catch (error) {
            console.error('[AuthContext] Logout API error:', error);
        }
        // Clear everything
        clearTokens();
        setUser(null);
    };

    // Role helpers
    const getRole = (): UserRole | null => {
        return user?.role as UserRole || null;
    };

    const isAdmin = (): boolean => {
        return user?.role === 'ADMIN';
    };

    const isDealer = (): boolean => {
        return user?.role === 'DEALER';
    };

    const isB2B = (): boolean => {
        return user?.role === 'B2B_CUSTOMER';
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        getRole,
        isAdmin,
        isDealer,
        isB2B,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
