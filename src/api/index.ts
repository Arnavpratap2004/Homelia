// API Configuration and Helper Functions

const API_BASE_URL = 'http://localhost:3001/api';

// Token management
export function getToken(): string | null {
    return localStorage.getItem('token');
}

export function getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

// Aliases for AuthContext
export const setToken = (token: string) => localStorage.setItem('token', token);
export const setRefreshToken = (token: string) => localStorage.setItem('refreshToken', token);
export const removeTokens = clearTokens;

export function getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export function setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
}

// Types
export interface User {
    id: string;
    email: string;
    phone: string;
    name: string;
    role: 'ADMIN' | 'DEALER' | 'B2B_CUSTOMER' | 'RETAIL_CUSTOMER';
    companyName: string | null;
    gstNumber: string | null;
    isVerified: boolean;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        user: User;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
    errors?: Array<{ field: string; message: string }>;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ field: string; message: string }>;
}

// API Request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network error');
    }
}

// Auth API
export const authApi = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await apiRequest<AuthResponse['data']>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.success && response.data) {
            setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            setUser(response.data.user);
        }

        return response as AuthResponse;
    },

    async register(data: {
        email: string;
        phone: string;
        password: string;
        name: string;
        companyName?: string;
        gstNumber?: string;
    }): Promise<AuthResponse> {
        const response = await apiRequest<AuthResponse['data']>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (response.success && response.data) {
            setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            setUser(response.data.user);
        }

        return response as AuthResponse;
    },

    async logout(): Promise<void> {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            clearTokens();
        }
    },

    async getProfile(): Promise<ApiResponse<User>> {
        return apiRequest<User>('/auth/me');
    },

    isLoggedIn(): boolean {
        return !!getToken();
    },
};

// Products API
export const productsApi = {
    async list(params?: {
        page?: number;
        limit?: number;
        brand?: string;
        category?: string;
        search?: string;
    }): Promise<ApiResponse<unknown>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString();
        return apiRequest(`/products${query ? `?${query}` : ''}`);
    },

    async getById(id: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/products/${id}`);
    },

    async getFeatured(): Promise<ApiResponse<unknown>> {
        return apiRequest('/products/featured');
    },

    async getBestsellers(): Promise<ApiResponse<unknown>> {
        return apiRequest('/products/bestsellers');
    },
};

// Orders API
export const ordersApi = {
    async create(data: {
        items: Array<{ productId: string; quantity: number }>;
        shippingAddress: Record<string, unknown>;
        billingAddress: Record<string, unknown>;
        notes?: string;
    }): Promise<ApiResponse<unknown>> {
        return apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async list(): Promise<ApiResponse<unknown>> {
        return apiRequest('/orders');
    },

    async getById(id: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/orders/${id}`);
    },

    async updateStatus(id: string, status: string, adminNotes?: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, adminNotes }),
        });
    },

    async cancel(id: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/orders/${id}/cancel`, {
            method: 'PATCH',
        });
    },
};

// Quotes API
export const quotesApi = {
    async create(data: {
        items: Array<{ productId: string; requestedQty: number; notes?: string }>;
        notes?: string;
    }): Promise<ApiResponse<unknown>> {
        return apiRequest('/quotes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async list(): Promise<ApiResponse<unknown>> {
        return apiRequest('/quotes');
    },

    async getById(id: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/quotes/${id}`);
    },

    async approve(id: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/quotes/${id}/approve`, {
            method: 'PATCH',
        });
    },

    async reject(id: string, reason: string): Promise<ApiResponse<unknown>> {
        return apiRequest(`/quotes/${id}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ reason }),
        });
    },
};

// Contact API
export const contactApi = {
    async submit(data: {
        name: string;
        email: string;
        phone: string;
        subject?: string;
        message: string;
    }): Promise<ApiResponse<unknown>> {
        return apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Invoices API
export const invoicesApi = {
    async list(params?: {
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<unknown>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString();
        return apiRequest(`/invoices/my-invoices${query ? `?${query}` : ''}`);
    },

    async download(id: string): Promise<ApiResponse<unknown>> {
        // This likely returns a blob or similar, but for now we follow the wrapper pattern
        // The actual implementation might need window.open or blob handling
        return apiRequest(`/invoices/${id}/download`);
    },
};

// Users API (Admin only)
export const usersApi = {
    async list(params?: {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
    }): Promise<ApiResponse<User[]>> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString();
        return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
    },

    async getById(id: string): Promise<ApiResponse<User>> {
        return apiRequest(`/admin/users/${id}`);
    },

    async updateStatus(id: string, status: 'active' | 'pending' | 'suspended'): Promise<ApiResponse<User>> {
        return apiRequest(`/admin/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    async updateRole(id: string, role: string): Promise<ApiResponse<User>> {
        return apiRequest(`/admin/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return apiRequest(`/admin/users/${id}`, {
            method: 'DELETE',
        });
    },

    async create(data: {
        email: string;
        phone: string;
        password: string;
        name: string;
        role: string;
        companyName?: string;
    }): Promise<ApiResponse<User>> {
        return apiRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

export default {
    auth: authApi,
    products: productsApi,
    orders: ordersApi,
    quotes: quotesApi,
    contact: contactApi,
    invoices: invoicesApi,
    users: usersApi,
};

