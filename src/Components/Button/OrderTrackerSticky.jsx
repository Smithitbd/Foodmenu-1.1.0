import React, { useState, useEffect } from "react";
import { 
  FaMotorcycle, FaUser, FaBoxOpen, FaClock, FaTimes, 
  FaStar, FaCheckCircle, FaMapMarkerAlt, FaStore, FaChevronRight 
} from "react-icons/fa";

const OrderTrackerWidget = () => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const syncData = () => {
    const raw = localStorage.getItem("activeOrder");
    if (!raw) {
      setActiveOrder(null);
      return;
    }

    try {
      const data = JSON.parse(raw);
      if (!data.startTime) return;

      const now = Date.now();
      const elapsed = Math.floor((now - Number(data.startTime)) / 1000);
      const duration = data.deliveryDuration || 1800;
      const remaining = Math.max(0, duration - elapsed);
      
      setRemainingTime(remaining);
      setActiveOrder(data);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 1000);
    window.addEventListener("storage", syncData);
    window.addEventListener("orderUpdated", syncData);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncData);
      window.removeEventListener("orderUpdated", syncData);
    };
  }, []);

  if (!activeOrder) return null;

  // ডাটা ম্যাপিং
  const firstItem = activeOrder.cartItems?.[0] || {};
  const rawName = activeOrder.restaurantName || firstItem.restaurantSlug || "Our Kitchen";
  const restaurantName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const restaurantArea = activeOrder.area || "Main Branch";
  const deliveryAddress = activeOrder.customerInfo?.address || "Location Not Set";

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handleConfirmReceived = () => {
    // Show Premium Toast
    setShowToast(true);
    
    // Clear data after 2 seconds
    setTimeout(() => {
      localStorage.removeItem("activeOrder");
      window.dispatchEvent(new Event("orderUpdated"));
      setActiveOrder(null);
      setIsOpen(false);
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-['Inter']">
      
      {/* --- Custom Toast Notification --- */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-[10000] border border-slate-700">
          <FaCheckCircle className="text-emerald-400 text-xl" />
          <span className="text-sm font-bold tracking-wide">Order Received! Enjoy your meal.</span>
        </div>
      )}

      {/* --- Floating Mini Tracker --- */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-4 bg-slate-900 p-2 pr-5 rounded-full cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all border border-white/10 group"
        >
          <div className="relative">
            <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <FaMotorcycle size={22} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[1px]">On the way</span>
            <span className="text-base font-black text-white tracking-tighter tabular-nums">{formatTime(remainingTime)}</span>
          </div>
        </div>
      )}

      {/* --- Premium Popup Card --- */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[-1]" onClick={() => setIsOpen(false)} />
          <div className="w-[92vw] sm:w-[380px] bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
            
            {/* Header: Restaurant Profile */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-7 text-white relative">
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <FaTimes size={14}/>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center shadow-xl p-1 overflow-hidden">
                   {firstItem.img ? (
                     <img src={firstItem.img} alt="logo" className="w-full h-full object-cover rounded-[16px]" />
                   ) : (
                     <FaStore size={24} className="text-red-600" />
                   )}
                </div>
                <div>
                    <h3 className="text-lg font-black tracking-tight leading-none mb-2">{restaurantName}</h3>
                    <div className="flex items-center gap-2 opacity-70">
                        <FaMapMarkerAlt size={10} className="text-red-500"/>
                        <span className="text-[11px] font-bold uppercase tracking-wider">{restaurantArea}</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
              
              {/* Delivery Section */}
              <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 mb-6 group transition-all">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                          <FaMapMarkerAlt size={14}/>
                      </div>
                      <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deliver to</p>
                          <p className="text-[12px] font-bold text-slate-700 line-clamp-1 italic">{deliveryAddress}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                      <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                          <FaUser size={12}/>
                      </div>
                      <div>
                          <p className="text-[12px] font-black text-slate-800 tracking-tight">
                            {activeOrder.customerInfo?.name} <span className="text-slate-300 mx-1">•</span> {activeOrder.customerInfo?.phone}
                          </p>
                      </div>
                  </div>
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-4 ml-1 flex items-center gap-2">
                  <FaBoxOpen className="text-slate-300"/> Order Summary
                </p>
                <div className="space-y-3">
                  {activeOrder.cartItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
                      <img src={item.img} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="item" />
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-slate-700 leading-none mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[12px] font-black text-slate-900">৳{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50 text-center">
                    <FaClock className="mx-auto text-emerald-500 mb-2" size={18}/>
                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Estimated</p>
                    <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{formatTime(remainingTime)}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-3xl text-center shadow-lg shadow-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Bill</p>
                    <p className="text-lg font-black text-white leading-none tracking-tighter">৳{activeOrder.grandTotal}</p>
                  </div>
              </div>

              {/* Rating Section */}
              <div className="bg-white p-5 rounded-[30px] border border-slate-100 text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Rate the quality</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={24}
                      className={`cursor-pointer transition-all hover:scale-125 ${star <= rating ? 'text-amber-400' : 'text-slate-100'}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="p-6 pt-0 bg-slate-50/50">
              <button
                onClick={handleConfirmReceived}
                className="group w-full py-5 bg-slate-900 text-white rounded-[25px] text-[13px] font-black uppercase tracking-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <span>Confirm Delivery</span>
                <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default OrderTrackerWidget;