import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import {
  FaPlus, FaMinus, FaChevronLeft, FaShoppingBag,
  FaTrashAlt, FaUtensils, FaStore, FaMotorcycle, FaClock, 
} from 'react-icons/fa';
import CheckoutBox from './CheckoutBox';
import OrderSuccess from './OrderSuccess';

const ConfirmCart = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  
  const [selectedArea, setSelectedArea] = useState('Select Area');
  const [deliveryInfo, setDeliveryInfo] = useState([]); 
  const [availableAreas, setAvailableAreas] = useState([]); 
  
  const cartKey = `global_cart_data`;

  // কার্ট ডাটা লোড করা
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem(cartKey)) || [];
    setCartItems(saved);
    window.scrollTo(0, 0);
  }, [cartKey]);

  // ডেলিভারি ইনফো ফেচ করা
  useEffect(() => {
    const fetchDeliveryData = async () => {
      const resIds = [...new Set(cartItems.map(item => item.restaurant_id || item.resId))].filter(Boolean);
      if (resIds.length > 0) {
        try {
          const response = await fetch('http://localhost:5000/api/get-cart-delivery-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restaurantIds: resIds })
          });
          const data = await response.json();
          setDeliveryInfo(data);
          const uniqueAreas = [...new Set(data.map(d => d.areaName))];
          setAvailableAreas(uniqueAreas);
        } catch (error) {
          console.error("Delivery Info Error:", error);
        }
      }
    };
    if (cartItems.length > 0) fetchDeliveryData();
  }, [cartItems]);

  // গ্লোবাল স্টোরেজ আপডেট করার ফাংশন
  const syncCart = (updatedItems) => {
    setCartItems(updatedItems);
    sessionStorage.setItem(cartKey, JSON.stringify(updatedItems));
    
    // 🔥 এই ইভেন্টটি ফায়ার করলে CartContext অটোমেটিক আপডেট হয়ে যাবে
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const updateQuantity = (name, resSlug, delta) => {
    const updated = cartItems.map(item => {
      if (item.name === name && item.restaurantSlug === resSlug) {
        const qty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: qty };
      }
      return item;
    }).filter(i => i.quantity > 0);
    
    syncCart(updated);
  };

  const handleRemoveRestaurant = (slug) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Remove all items from "${slug.replace(/-/g, ' ')}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be1e2d',
      confirmButtonText: 'Yes, Remove It!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cartItems.filter(item => item.restaurantSlug !== slug);
        syncCart(updated); // সেশন এবং কনটেক্সট দুইটাই আপডেট হবে
      }
    });
  };

  const getChargeForRestaurant = (resId) => {
    const info = deliveryInfo.find(d => (d.restaurant_id === resId || d.resId === resId) && d.areaName === selectedArea);
    return info ? info.deliveryCharge : 0;
  };

  const totalDeliveryCharge = [...new Set(cartItems.map(item => item.restaurant_id || item.resId))]
    .reduce((sum, resId) => sum + getChargeForRestaurant(resId), 0);

  const totalProductPrice = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);

  const groupedCart = cartItems.reduce((groups, item) => {
    const group = item.restaurantSlug || 'Other Store';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});

  const handleOrderSubmit = async (customerData) => {
    if (selectedArea === 'Select Area') {
      return Swal.fire('Wait!', 'Please select your delivery area.', 'warning');
    }
    try {
      const response = await fetch('http://localhost:5000/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: customerData,
          cartItems: cartItems,
          area: selectedArea,
          method: 'Delivery',
          extraCharge: totalDeliveryCharge,
          paymentMethod: 'Cash'
        })
      });
      const result = await response.json();
      if (result.success) {
        sessionStorage.removeItem(cartKey);
        window.dispatchEvent(new Event('cartUpdate')); // কার্ট খালি করা
        setOrderData(result);
        setShowSuccess(true);
      }
    } catch (error) {
      Swal.fire('Error', 'Order failed', 'error');
    }
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen px-4 md:px-10 py-6 md:py-10 font-inter">
      <div className="max-w-[1150px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 bg-white border border-black/5 px-5 py-2 rounded-full shadow-lg hover:-translate-x-1 transition-all">
            <div className="w-8 h-8 rounded-full bg-[#E3242B] text-white flex items-center justify-center"><FaChevronLeft size={10} /></div>
            <span className="text-xs md:text-sm font-extrabold text-gray-700">Return to Menu</span>
          </button>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-[#be1e2d15] shadow-sm">
            <FaShoppingBag size={12} className="text-[#be1e2d]" />
            <span className="text-[10px] md:text-[11px] font-extrabold text-[#be1e2d] uppercase">{cartItems.length} Items Selected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 md:gap-10">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 mb-2">
              <FaUtensils className="text-[#be1e2d] text-xl" />
              <h2 className="text-xl md:text-3xl font-extrabold text-gray-900">Order Summary</h2>
            </div>

            {Object.keys(groupedCart).length > 0 ? Object.keys(groupedCart).map((resSlug) => {
              const resId = groupedCart[resSlug][0].restaurant_id || groupedCart[resSlug][0].resId;
              const resCharge = getChargeForRestaurant(resId);
              return (
                <div key={resSlug} className="bg-white/50 rounded-[35px] border border-dashed border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 bg-white/30 border-b border-dashed border-gray-200">
                    <div className="flex items-center gap-2 text-[#be1e2d] font-black uppercase italic text-sm"><FaStore size={14} /> {resSlug.replace(/-/g, ' ')}</div>
                    <button onClick={() => handleRemoveRestaurant(resSlug)} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><FaTrashAlt size={12} /></button>
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    {groupedCart[resSlug].map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                        <img src={item.img} alt={item.name} className="w-16 h-16 rounded-2xl object-cover" />
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-bold">৳{item.price}</p>
                        </div>
                        <div className="flex items-center bg-gray-50 p-1 rounded-2xl gap-2 border border-gray-100">
                          <button onClick={() => updateQuantity(item.name, resSlug, -1)} className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                            {item.quantity === 1 ? <FaTrashAlt size={10} /> : <FaMinus size={10} />}
                          </button>
                          <span className="w-4 text-center font-black text-gray-800 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.name, resSlug, 1)} className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><FaPlus size={10} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-red-50/50 px-6 py-4 flex justify-between border-t border-red-50">
                     <div className="flex items-center gap-2">
                        <FaMotorcycle className="text-[#be1e2d] text-xs" />
                        <span className="text-xs font-black text-gray-700">Delivery: {selectedArea === 'Select Area' ? 'Wait' : `৳${resCharge}`}</span>
                     </div>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[40px] py-20 text-center">
                <FaShoppingBag size={50} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold italic">Your basket is feeling lonely!</p>
              </div>
            )}
          </div>

          <div className="sticky top-6">
            <CheckoutBox
              cartItems={cartItems}
              totalAmount={totalProductPrice}
              deliveryCharge={totalDeliveryCharge}
              availableAreas={availableAreas} 
              onAreaUpdate={setSelectedArea}
              onConfirm={handleOrderSubmit}
              onCancel={() => navigate(-1)}
            />
          </div>
        </div>
      </div>
      {showSuccess && orderData && <OrderSuccess {...orderData} onClose={() => setShowSuccess(false)} />}
    </div>
  );
};

export default ConfirmCart;