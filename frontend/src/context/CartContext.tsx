import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface CartItem {
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    color: string;
    image?: string;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'homeliaCart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (!saved) return [];

            const parsedItems = JSON.parse(saved);

            // Filter out items with invalid IDs (non-UUIDs) to prevent 400 errors
            // UUIDs are 36 characters long. Old IDs were short strings like 'dur-001'
            if (Array.isArray(parsedItems)) {
                return parsedItems.filter((item: CartItem) =>
                    item.productId && item.productId.length === 36
                );
            }
            return [];
        } catch {
            return [];
        }
    });

    // Sync to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // Computed values
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Add to cart
    const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        const quantity = newItem.quantity || 1;

        setItems(currentItems => {
            const existingIndex = currentItems.findIndex(item => item.productId === newItem.productId);

            if (existingIndex >= 0) {
                // Update quantity of existing item
                const updated = [...currentItems];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                };
                return updated;
            } else {
                // Add new item
                return [...currentItems, { ...newItem, quantity }];
            }
        });
    };

    // Remove from cart
    const removeFromCart = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.productId !== productId));
    };

    // Update quantity
    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.productId === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    // Clear cart
    const clearCart = () => {
        setItems([]);
    };

    // Check if in cart
    const isInCart = (productId: string): boolean => {
        return items.some(item => item.productId === productId);
    };

    // Get quantity
    const getItemQuantity = (productId: string): number => {
        const item = items.find(i => i.productId === productId);
        return item?.quantity || 0;
    };

    const value: CartContextType = {
        items,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Hook
export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
