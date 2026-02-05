import React, { useState, useEffect } from "react";
import {
  FaCheckCircle, FaClock, FaEdit, FaReceipt, FaTruck,
  FaArrowLeft, FaCheck, FaLock, FaUser, FaStore, FaMapMarkerAlt, FaPhoneAlt, FaChair
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // ✅ Added Cart Context import

const OrderSuccess = ({
  onClose,
  customerInfo,
  cartItems = [],
  grandTotal,
  method,
  area,
  orderId,
  paymentMethod,
  selectedTable
}) => {
  const navigate = useNavigate();
  const { clearCart } = useCart(); // ✅ Get clearCart function from context
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [editTimeLeft, setEditTimeLeft] = useState(100);
  const [securityKey, setSecurityKey] = useState(null);

  // --- Logic: Group items by Restaurant Name ---
  const groupedByShop = cartItems.reduce((acc, item) => {
    const shopName = item.restaurantName || "Our Kitchen";
    if (!acc[shopName]) acc[shopName] = [];
    acc[shopName].push(item);
    return acc;
  }, {});

  const getInitialTime = () => {
    const m = method?.toLowerCase();
    if (m === "dine-in") return 16 * 60;
    if (m === "pickup") return 20 * 60;
    return 45 * 60;
  };

  const [deliveryTimeLeft, setDeliveryTimeLeft] = useState(getInitialTime());

  useEffect(() => {
    if (isConfirmed) return;
    if (editTimeLeft <= 0) { handleConfirm(); return; }
    const t = setInterval(() => setEditTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [editTimeLeft, isConfirmed]);

  useEffect(() => {
    if (!isConfirmed) return;
    const t = setInterval(() => {
      setDeliveryTimeLeft(p => (p <= 0 ? 0 : p - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [isConfirmed]);

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleConfirm = () => {
    if (isConfirmed) return;
    const key = Math.floor(10000 + Math.random() * 90000);
    
    const orderData = {
      orderId,
      customerInfo,
      cartItems,
      grandTotal,
      method,
      area,
      selectedTable,
      paymentMethod,
      startTime: Date.now(),
      deliveryDuration: getInitialTime(),
      securityKey: key,
      status: "confirmed"
    };

    localStorage.setItem("activeOrder", JSON.stringify(orderData));
    
    // ✅ NEW ACTION: Clear the cart data as soon as order is confirmed
    if (typeof clearCart === 'function') {
      clearCart();
    }
    
    // Widget ke notify korar jonno custom event
    window.dispatchEvent(new Event("orderUpdated")); 
    
    setSecurityKey(key);
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-['Inter']">
      
      <div className="w-full max-w-2xl bg-[#F8FAFC] rounded-[30px] sm:rounded-[45px] shadow-2xl animate-scaleIn overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        
        {/* --- HEADER SECTION --- */}
        <div className={`p-6 sm:p-8 text-center transition-colors duration-500 ${isConfirmed ? "bg-emerald-500" : "bg-amber-500"} text-white`}>
          <div className="flex justify-center mb-3">
             {isConfirmed ? <FaCheckCircle size={40} className="animate-bounce" /> : <FaClock size={40} className="animate-spin" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none">
            {isConfirmed ? "Order Confirmed!" : "Confirming Order..."}
          </h2>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-[3px] mt-2">ID: #{orderId}</p>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar">
          
          {/* 1. CUSTOMER & DELIVERY INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm flex items-start gap-3">
                <div className="bg-slate-100 p-3 rounded-2xl text-slate-500"><FaUser size={14}/></div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recipient</p>
                   <p className="text-sm font-black text-slate-800 uppercase">{customerInfo?.name || "Guest"}</p>
                   <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><FaPhoneAlt size={8}/> {customerInfo?.phone || "No Phone"}</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm flex items-start gap-3">
                <div className="bg-red-50 p-3 rounded-2xl text-red-600"><FaMapMarkerAlt size={14}/></div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery Details</p>
                   <p className="text-sm font-black text-slate-800 uppercase">{area || "Default Location"}</p>
                   <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-600 uppercase">{method}</span>
                      {selectedTable && <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 rounded text-emerald-700 uppercase">Table {selectedTable}</span>}
                   </div>
                </div>
             </div>
          </div>

          {/* 2. SECURITY & TIMER CARD (IF CONFIRMED) */}
          {isConfirmed && (
            <div className="bg-slate-900 rounded-[30px] p-6 text-white flex justify-between items-center shadow-xl">
               <div>
                  <p className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Total Est. Wait</p>
                  <p className="text-2xl font-black italic">{formatTime(deliveryTimeLeft)}</p>
               </div>
               <div className="h-10 w-px bg-white/20"></div>
               <div className="text-right">
                  <p className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Pickup Code</p>
                  <p className="text-2xl font-black text-emerald-400 tracking-tighter">{securityKey}</p>
               </div>
            </div>
          )}

          {/* 3. MULTI-RESTAURANT ITEM CARDS */}
          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-1">Orders by Restaurant</h3>
             {Object.entries(groupedByShop).map(([shopName, items], idx) => (
               <div key={idx} className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
                     <div className="flex items-center gap-2">
                        <FaStore className="text-red-700" size={12}/>
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{shopName}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                        <FaClock className="text-amber-500" size={10}/>
                        <span className="text-[9px] font-black text-slate-600 uppercase">{isConfirmed ? formatTime(deliveryTimeLeft) : 'Estimating...'}</span>
                     </div>
                  </div>
                  <div className="p-4 space-y-3">
                     {items.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                          <p className="font-bold text-slate-700 truncate w-3/4">{item.name} <span className="text-red-700 ml-1">x{item.quantity}</span></p>
                          <p className="font-black text-slate-900">৳{item.price * item.quantity}</p>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* --- FOOTER ACTION SECTION --- */}
        <div className="p-6 sm:p-8 bg-white border-t border-slate-100">
          {!isConfirmed ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onClose} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-xs text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <FaEdit /> Adjust ({formatTime(editTimeLeft)})
              </button>
              <button onClick={handleConfirm} className="flex-[1.5] py-4 rounded-2xl bg-red-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-800 transition-all flex items-center justify-center gap-2">
                <FaCheck /> Confirm Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
               <button onClick={() => navigate("/")} className="flex-1 py-4 sm:py-5 rounded-2xl border-2 border-slate-100 font-black text-xs text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                 <FaArrowLeft/> Back Home
               </button>
               <div className="flex-[2] bg-slate-900 rounded-2xl flex items-center justify-between px-6 text-white py-4 sm:py-5 shadow-xl shadow-slate-200">
                  <div className="text-left">
                     <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Total Payable</p>
                     <p className="text-lg font-black text-emerald-400">৳{grandTotal}</p>
                  </div>
                  <button onClick={onClose} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Track Order</button>
               </div>
            </div>
          )}
          <p className="text-center mt-4 text-[9px] font-black text-slate-300 uppercase tracking-[4px] flex items-center justify-center gap-2">
            <FaLock /> Secure SSL Order Processed
          </p>
        </div>

      </div>
      
      <style>{`
        @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default OrderSuccess;