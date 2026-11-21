"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('smart_agro_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when cart changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('smart_agro_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, openDrawer = true) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = Number(item.salePrice ?? item.regularPrice ?? item.price ?? 0);
    return acc + (price * (Number(item.quantity) || 1));
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, setIsCartOpen, isMenuOpen, setIsMenuOpen, totalItems, totalPrice, isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
