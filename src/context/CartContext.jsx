// CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Delivery');

  // ১. সেশন থেকে ডাটা লোড করা (Initial & Event based)
  const syncWithSession = () => {
    const savedCart = JSON.parse(sessionStorage.getItem('global_cart_data')) || [];
    setCart(savedCart);
  };

  useEffect(() => {
    syncWithSession();
    // কাস্টম ইভেন্ট লিসেনার যাতে অন্য পেজে ডিলিট করলে এখানেও আপডেট হয়
    window.addEventListener('cartUpdate', syncWithSession);
    return () => window.removeEventListener('cartUpdate', syncWithSession);
  }, []);

  // ২. কার্ট স্টেট চেঞ্জ হলে সেশনে সেভ করা
  useEffect(() => {
    sessionStorage.setItem('global_cart_data', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product, restaurantSlug) => {
    // *** গুরুত্বপূর্ণ: অ্যাড করার ঠিক আগে সেশন থেকে একদম লেটেস্ট ডাটা নিন ***
    const latestCart = JSON.parse(sessionStorage.getItem('global_cart_data')) || [];
    
    const existingRestaurantSlugs = latestCart.map(item => item.restaurantSlug);
    const isNewVendor = existingRestaurantSlugs.length > 0 && !existingRestaurantSlugs.includes(restaurantSlug);

    if (orderType === 'Dine-In' && isNewVendor) {
      await Swal.fire({
        icon: 'error',
        title: 'Restricted Action',
        text: 'Dine-in orders are restricted to one restaurant at a time.',
        confirmButtonColor: '#be1e2d',
      });
      return { status: 'error' };
    }

    if (isNewVendor) {
      const result = await Swal.fire({
        title: 'Different Restaurant?',
        text: "You are adding items from a different restaurant. Separate delivery charges will apply.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#be1e2d',
        confirmButtonText: 'Yes, continue',
      });

      if (!result.isConfirmed) return { status: 'cancelled' };
    }

    // স্টেট আপডেট করার সময় লেটেস্ট সেশন ডাটা ব্যবহার করুন
    setCart(() => {
      const updatedCart = [...latestCart];
      const existingItemIndex = updatedCart.findIndex(
        (item) => item.name === product.name && item.restaurantSlug === restaurantSlug
      );

      if (existingItemIndex !== -1) {
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
      } else {
        updatedCart.push({ ...product, quantity: 1, restaurantSlug });
      }
      return updatedCart;
    });

    return { status: 'success' };
  };

  const updateQuantity = (productName, restaurantSlug, delta) => {
    setCart((prevCart) => {
      const updated = prevCart.map((item) => {
        if (item.name === productName && item.restaurantSlug === restaurantSlug) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
      return updated;
    });
  };

  const clearCart = () => { 
    setCart([]); 
    sessionStorage.removeItem('global_cart_data'); 
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, orderType, setOrderType }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);