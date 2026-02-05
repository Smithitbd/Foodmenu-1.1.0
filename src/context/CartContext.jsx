import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Delivery');

  useEffect(() => {
    const savedCart = JSON.parse(sessionStorage.getItem('global_cart_data')) || [];
    setCart(savedCart);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('global_cart_data', JSON.stringify(cart));
  }, [cart]);

  // async করা হয়েছে কারণ Swal.fire একটি প্রমিজ
  const addToCart = async (product, restaurantSlug) => {
    const existingRestaurantSlugs = cart.map(item => item.restaurantSlug);
    const isNewVendor = existingRestaurantSlugs.length > 0 && !existingRestaurantSlugs.includes(restaurantSlug);

    // 1. DINE-IN RESTRICTION (SweetAlert)
    if (orderType === 'Dine-In' && isNewVendor) {
      await Swal.fire({
        icon: 'error',
        title: 'Restricted Action',
        text: 'Dine-in orders are restricted to one restaurant at a time.',
        confirmButtonColor: '#be1e2d',
      });
      return { status: 'error' };
    }

    // 2. MULTI-VENDOR ALERT (SweetAlert Confirm Box)
    if (isNewVendor) {
      const result = await Swal.fire({
        title: 'Different Restaurant?',
        text: "You are adding items from a different restaurant. Separate delivery charges will apply for each store. Do you want to continue?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#be1e2d',
        cancelButtonColor: '#6e7881',
        confirmButtonText: 'Yes, continue',
        cancelButtonText: 'No, cancel'
      });

      if (!result.isConfirmed) {
        return { status: 'cancelled' };
      }
    }

    // 3. CART UPDATE LOGIC (Same as before)
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.name === product.name && item.restaurantSlug === restaurantSlug
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      }

      return [...prevCart, { ...product, quantity: 1, restaurantSlug }];
    });

    return { status: 'success' };
  };

  const updateQuantity = (productName, restaurantSlug, delta) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.name === productName && item.restaurantSlug === restaurantSlug) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
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