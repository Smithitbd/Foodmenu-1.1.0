import React, { useState, useEffect } from "react";
import { FaMotorcycle, FaLock, FaCheck, FaUser, FaStore, FaDotCircle, FaTimes, FaStar, FaReceipt, FaChair, FaMapMarkerAlt } from "react-icons/fa";

const OrderTrackerWidget = () => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [timers, setTimers] = useState({});
  const [maxTime, setMaxTime] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState({});
  const [shopKeys, setShopKeys] = useState({}); // 🔑 SHOP WISE KEY STORAGE

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

      // Grouping by Restaurant
      const grouped = data.cartItems.reduce((acc, item) => {
        const shop = item.restaurantName || "Our Kitchen";
        if (!acc[shop]) acc[shop] = { items: [], duration: data.deliveryDuration };
        acc[shop].items.push(item);
        return acc;
      }, {});

      const newTimers = {};
      const generatedKeys = {}; // Temporary keys holder
      let currentMax = 0;

      Object.keys(grouped).forEach((shop, index) => {
        // Individual Timer
        const remaining = Math.max(0, grouped[shop].duration - elapsed);
        newTimers[shop] = remaining;
        if (remaining > currentMax) currentMax = remaining;

        // 🔑 GENERATE OR SYNC SHOP KEY
        // Prottek shop er jonno unique key (e.g., baseKey + index)
        generatedKeys[shop] = data.securityKey ? (Number(data.securityKey) + index) : "---";
      });

      setActiveOrder({ ...data, groupedShops: grouped });
      setTimers(newTimers);
      setMaxTime(currentMax);
      setShopKeys(generatedKeys);
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

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="relative inline-block ml-3 font-['Inter']">
      {/* Dynamic Nav Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border-2 border-red-700 px-3 py-1.5 rounded-2xl cursor-pointer shadow-[0_0_15px_rgba(185,28,28,0.2)] hover:scale-105 transition-all active:scale-95"
      >
        <div className="bg-red-700 w-8 h-8 rounded-xl flex items-center justify-center">
          <FaMotorcycle color="#fff" size={16} className="animate-bounce" />
        </div>
        <div className="flex flex-col leading-tight pr-1">
          <span className="text-sm font-black text-slate-900">{formatTime(maxTime)}</span>
          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
            <FaDotCircle size={6} className="animate-pulse" /> Live Tracking
          </span>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998]" onClick={() => setIsOpen(false)} />
          <div className="fixed sm:absolute top-1/2 sm:top-14 left-1/2 sm:left-auto right-1/2 sm:right-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 w-[95%] sm:w-[360px] bg-white rounded-[35px] p-5 shadow-2xl z-[999] border border-slate-100 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center mb-4">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Order Tracking</h4>
               <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-red-600"><FaTimes size={18}/></button>
            </div>

            {/* --- CUSTOMER INFO --- */}
            <div className="bg-slate-900 rounded-3xl p-4 mb-4 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-emerald-400"><FaUser size={12}/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Recipient</p>
                        <p className="text-xs font-black uppercase mt-1">{activeOrder.customerInfo?.name || "Guest"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-red-400">
                        {activeOrder.selectedTable ? <FaChair size={12}/> : <FaMapMarkerAlt size={12}/>}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Destination</p>
                        <p className="text-xs font-black uppercase mt-1">
                            {activeOrder.selectedTable ? `Table ${activeOrder.selectedTable}` : (activeOrder.area || "Pickup")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Shop Wise Display */}
            <div className="space-y-4">
              {Object.entries(activeOrder.groupedShops).map(([shop, shopData], i) => (
                <div key={i} className="bg-slate-50 rounded-3xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-2">
                      <FaStore className="text-red-700"/> {shop}
                    </span>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">{formatTime(timers[shop] || 0)}</span>
                  </div>

                  {/* Individual Items per Restaurant */}
                  <div className="space-y-2 mb-3 bg-white/50 p-3 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Items from {shop}</p>
                    {shopData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-600 italic">
                            <span>{item.name} <span className="text-red-700 font-black">x{item.quantity}</span></span>
                            <span className="text-slate-900">৳{item.price * item.quantity}</span>
                        </div>
                    ))}
                  </div>

                  {/* 🔑 UNIQUE KEY FOR THIS SHOP */}
                  <div className="bg-slate-900 py-3 rounded-2xl text-center mb-3 shadow-inner">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1 tracking-[2px]">Shop Verification Code</p>
                    <p className="text-xl font-black text-white tracking-[4px]">{shopKeys[shop]}</p>
                  </div>

                  {/* ⭐ INDIVIDUAL SHOP REVIEW */}
                  <div className="flex justify-between items-center mt-2 border-t border-dashed border-slate-200 pt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Rate {shop}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <FaStar key={s} size={14} 
                          className={`cursor-pointer transition-colors ${s <= (ratings[shop] || 0) ? 'text-amber-400' : 'text-slate-200'}`}
                          onClick={() => setRatings(prev => ({...prev, [shop]: s}))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Grand Total</span>
                    <span className="text-base font-black text-red-700 tracking-tighter">৳{activeOrder.grandTotal}</span>
                </div>
                <button
                    onClick={() => {
                        if(window.confirm("Confirm All Received?")) {
                            localStorage.removeItem("activeOrder");
                            window.dispatchEvent(new Event("orderUpdated"));
                            setActiveOrder(null);
                            setIsOpen(false);
                        }
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-black flex items-center justify-center gap-2"
                >
                    <FaCheck /> Confirm All Received
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderTrackerWidget;