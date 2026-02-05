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

  const addToCart = (product, restaurantSlug) => {
    const uniqueRestaurants = [new Set(cart.map(item => item.restaurantSlug))];
    const isNewVendor = uniqueRestaurants.length > 0 && !uniqueRestaurants.includes(restaurantSlug);

    // DINE-IN RESTRICTION
    if (orderType === 'Dine-In' && isNewVendor) {
      alert(" Dine-in orders are restricted to one restaurant at a time.");
      return { status: 'error' };
    }

    // MULTI-VENDOR ALERT
    if (isNewVendor) {
      const proceed = window.confirm(" You are adding items from a different restaurant. Separate delivery charges will apply for each store. Do you want to continue?");
      if (!proceed) return { status: 'cancelled' };
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.name === product.name && item.restaurantSlug === restaurantSlug
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.name === product.name && item.restaurantSlug === restaurantSlug
            ? { item, quantity: item.quantity + 1 } : item
        );
      }
      return [prevCart, { product, quantity: 1, restaurantSlug }];
    });
    return { status: 'success' };
  };

  const updateQuantity = (productName, restaurantSlug, delta) => {
    setCart((prevCart) => prevCart.map((item) => {
        if (item.name === productName && item.restaurantSlug === restaurantSlug) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const clearCart = () => { setCart([]); sessionStorage.removeItem('global_cart_data'); };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, orderType, setOrderType }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);