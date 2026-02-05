import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'; // 🔥 SweetAlert2 Import
import {
  FaPlus, FaMinus, FaChevronLeft, FaShoppingBag,
  FaTrashAlt, FaUtensils, FaCheckCircle, FaStore, FaMotorcycle, FaClock
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [selectedArea, setSelectedArea] = useState('Select Area');
  const cartKey = `global_cart_data`;

  const areaCharges = { Zindabazar: 40, Amberkhana: 50, Shibgonj: 60, Uposhohor: 55, Others: 80 };
  const currentCharge = areaCharges[selectedArea] || 0;

  useEffect(() => {
    let initialCart = [];
    if (location.state && location.state.cart) {
      initialCart = location.state.cart;
      sessionStorage.setItem(cartKey, JSON.stringify(initialCart));
    } else {
      const saved = JSON.parse(sessionStorage.getItem(cartKey)) || [];
      initialCart = saved;
    }
    setCartItems(initialCart);
    window.scrollTo(0, 0);
  }, [cartKey, location.state]);

  // --- GROUPING LOGIC ---
  const groupedCart = cartItems.reduce((groups, item) => {
    const group = item.restaurantSlug || restaurantSlug || 'Other Store';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});

  // --- 🔥 PROFESSIONAL REMOVE RESTAURANT LOGIC ---
  const handleRemoveRestaurant = (slug) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Apni ki "${slug.replace(/-/g, ' ')}" er shob item remove korte chan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be1e2d',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Yes, Remove It!',
      cancelButtonText: 'No, Keep It',
      customClass: {
        popup: 'rounded-[30px]',
        title: 'font-black text-gray-800',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cartItems.filter(item => item.restaurantSlug !== slug);
        setCartItems(updated);
        sessionStorage.setItem(cartKey, JSON.stringify(updated));
        
        // Show a small success toast
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Restaurant removed from basket',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
    });
  };

  const updateQuantity = (name, resSlug, delta) => {
    let msg = '';
    let type = 'success';
    const updated = cartItems.map(item => {
        if (item.name === name && (item.restaurantSlug === resSlug)) {
          const qty = Math.max(0, item.quantity + delta);
          msg = qty === 0 ? `${name} removed` : `${qty}x ${name} in basket`;
          type = qty === 0 ? 'remove' : 'update';
          return { ...item, quantity: qty };
        }
        return item;
      }).filter(i => i.quantity > 0);

    setCartItems(updated);
    sessionStorage.setItem(cartKey, JSON.stringify(updated));
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
  };

  const totalAmount = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);

  return (
    <div className="bg-[#fcfdfe] min-h-screen px-4 md:px-10 py-6 md:py-10 font-inter">
      <div className="max-w-[1150px] mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 bg-white border border-black/5 px-5 py-2 rounded-full shadow-lg hover:-translate-x-1 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#E3242B] text-white flex items-center justify-center shadow-md">
              <FaChevronLeft size={10} />
            </div>
            <span className="text-xs md:text-sm font-extrabold text-gray-700">Return to Menu</span>
          </button>

          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-[#be1e2d15] shadow-sm">
            <div className="w-2 h-2 bg-[#be1e2d] rounded-full animate-pulse" />
            <FaShoppingBag size={12} className="text-[#be1e2d]" />
            <span className="text-[10px] md:text-[11px] font-extrabold tracking-widest text-[#be1e2d] uppercase">
              {cartItems.length} Items Selected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 md:gap-10 items-start">

          {/* CART ITEMS LIST */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 mb-2">
              <FaUtensils className="text-[#be1e2d] text-xl" />
              <h2 className="text-xl md:text-3xl font-extrabold text-gray-900">Order Summary</h2>
            </div>

            {Object.keys(groupedCart).length > 0 ? Object.keys(groupedCart).map((resSlug) => (
              <div key={resSlug} className="bg-white/50 rounded-[35px] border border-dashed border-gray-200 overflow-hidden">
                {/* Restaurant Label */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/30 border-b border-dashed border-gray-200">
                  <div className="flex items-center gap-2 text-[#be1e2d] font-black uppercase italic text-sm tracking-widest">
                    <FaStore size={14} /> {resSlug.replace(/-/g, ' ')}
                  </div>
                  <button 
                    onClick={() => handleRemoveRestaurant(resSlug)} // 🔥 Triggering the Swal alert
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                </div>

                <div className="flex flex-col gap-4 p-4">
                  {groupedCart[resSlug].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                      <div className="relative flex-shrink-0">
                        <img src={item.img} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover" />
                        <span className="absolute -top-2 -right-2 bg-[#be1e2d] text-white text-[10px] font-black px-2 py-0.5 rounded-lg border-2 border-white">
                          {item.quantity}x
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-black text-gray-900 truncate">{item.name}</h4>
                        <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase mt-1">৳{item.price}</p>
                      </div>

                      <div className="flex items-center bg-gray-50 p-1 rounded-2xl gap-2 border border-gray-100">
                        <button onClick={() => updateQuantity(item.name, resSlug, -1)} className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                          {item.quantity === 1 ? <FaTrashAlt size={12} /> : <FaMinus size={10} />}
                        </button>
                        <span className="w-4 text-center font-black text-gray-800 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.name, resSlug, 1)} className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 hover:text-green-500 transition-all">
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* INDIVIDUAL RESTAURANT CHARGES & TIME */}
                <div className="bg-red-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-red-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                       <FaMotorcycle className="text-[#be1e2d] text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase leading-none">Delivery Fee</span>
                      <span className="text-xs font-black text-gray-700 leading-tight">৳{currentCharge}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                       <FaClock className="text-blue-500 text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase leading-none">Est. Time</span>
                      <span className="text-xs font-black text-gray-700 leading-tight">30-45 Mins</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[40px] py-20 text-center">
                <FaShoppingBag size={50} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold">Your basket is feeling lonely!</p>
              </div>
            )}
          </div>

          {/* CHECKOUT SIDEBAR */}
          <div className="sticky top-6">
            <CheckoutBox
              totalAmount={totalAmount}
              cartItems={cartItems}
              onAreaUpdate={setSelectedArea}
              onRemoveRestaurant={handleRemoveRestaurant} // 🔥 Passing the same swal logic to checkout box
              restaurantName={restaurantSlug?.replace(/-/g, ' ')}
              onSuccess={(data) => { setOrderData(data); setShowSuccess(true); }}
              onCancel={() => navigate(-1)}
            />
          </div>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-[99999] animate-bounce">
          {toast.type === 'remove' ? <FaTrashAlt className="text-red-400" /> : <FaCheckCircle className="text-green-400" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {showSuccess && orderData && (
        <OrderSuccess {...orderData} onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
};

export default ConfirmCart;