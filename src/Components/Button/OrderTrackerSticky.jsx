import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaMotorcycle, FaUser, FaBoxOpen, FaClock, FaTimes,
  FaStar, FaCheckCircle, FaMapMarkerAlt, FaStore, FaChevronRight,
  FaTimesCircle, FaHome, FaFireAlt, FaConciergeBell, FaClipboardCheck,
  FaSyncAlt
} from "react-icons/fa";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const API_BASE      = "http://localhost:5000";
const POLL_INTERVAL = 5000; 
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: "pending",    label: "Order Placed", Icon: FaClipboardCheck },
  { key: "confirmed",  label: "Confirmed",    Icon: FaCheckCircle    },
  { key: "cooking",    label: "Cooking",      Icon: FaFireAlt        },
  { key: "on_the_way", label: "On the Way",   Icon: FaMotorcycle     },
  { key: "delivered",  label: "Delivered",    Icon: FaConciergeBell  },
];

const STATUS_INDEX = {
  pending: 0, confirmed: 1, cooking: 2, on_the_way: 3, delivered: 4,
};

const formatTime = (s) => {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};


const extractOrderId = (data) =>
  data?.orderId || data?.order_id || data?.id || null;

// ─── CANCELLED SCREEN ────────────────────────────────────────────────────────
const CancelledScreen = ({ onClose }) => (
  <div className="w-[92vw] sm:w-[380px] bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-red-50">
    <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 text-white text-center relative">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <FaTimes size={13} />
      </button>
      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
        <FaTimesCircle size={38} className="text-white" />
      </div>
      <h2 className="text-2xl font-black tracking-tight">Order Cancelled</h2>
      <p className="text-red-100 text-sm mt-1 font-medium">We're really sorry about this.</p>
    </div>
    <div className="p-8 text-center">
      <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-6">
        <p className="text-slate-700 text-[14px] font-semibold leading-relaxed">
          Unfortunately your order was{" "}
          <span className="text-red-600 font-black">cancelled</span>. This may
          have happened due to availability or an operational issue.
        </p>
        <p className="text-slate-500 text-[13px] mt-3 leading-relaxed">
          We apologize for the inconvenience. Please try placing your order
          again — we'd love to serve you! 🙏
        </p>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("activeOrder");
          window.dispatchEvent(new Event("orderUpdated"));
          window.location.href = "/";
        }}
        className="group w-full py-5 bg-slate-900 text-white rounded-[25px] text-[13px] font-black uppercase tracking-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
      >
        <FaHome size={14} />
        <span>Go Back Home</span>
      </button>
      <p className="text-slate-400 text-[11px] mt-4 font-medium">
        Need help?{" "}
        <a href="/contact" className="text-red-500 font-black underline underline-offset-2">
          Contact Support
        </a>
      </p>
    </div>
  </div>
);

// ─── STATUS STEPPER ──────────────────────────────────────────────────────────
const StatusStepper = ({ currentStatus }) => {
  const currentIdx = STATUS_INDEX[currentStatus] ?? 0;
  return (
    <div className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm mb-6">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
        <FaClock className="text-slate-300" /> Order Status
      </p>
      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-100 mx-4" style={{ zIndex: 0 }}>
          <div
            className="h-full bg-emerald-400 transition-all duration-700"
            style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>
        {STATUS_STEPS.map((step, idx) => {
          const done   = idx < currentIdx;
          const active = idx === currentIdx;
          const { Icon } = step;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10" style={{ flex: 1 }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-slate-900 border-slate-900 text-white scale-110 shadow-lg shadow-slate-200"
                    : "bg-white border-slate-200 text-slate-300"
                }`}
              >
                <Icon size={12} />
              </div>
              <p
                className={`text-[9px] font-black uppercase tracking-tight text-center leading-tight ${
                  active ? "text-slate-900" : done ? "text-emerald-600" : "text-slate-300"
                }`}
                style={{ maxWidth: 52 }}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── STATUS BADGE META ───────────────────────────────────────────────────────
const statusMeta = {
  pending:    { label: "Order Placed", color: "bg-blue-50 text-blue-600 border-blue-100"          },
  confirmed:  { label: "Confirmed",    color: "bg-violet-50 text-violet-600 border-violet-100"    },
  cooking:    { label: "Preparing",    color: "bg-amber-50 text-amber-600 border-amber-100"       },
  on_the_way: { label: "On the Way",   color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  delivered:  { label: "Delivered",    color: "bg-slate-50 text-slate-600 border-slate-200"       },
};

// ─── MAIN WIDGET ─────────────────────────────────────────────────────────────
const OrderTrackerWidget = () => {
  const [activeOrder,   setActiveOrder]   = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [rating,        setRating]        = useState(0);
  const [showToast,     setShowToast]     = useState(false);
  const [orderStatus,   setOrderStatus]   = useState("pending");
  const [isCancelled,   setIsCancelled]   = useState(false);
  const [isRefreshing,  setIsRefreshing]  = useState(false);

  const orderIdRef = useRef(null);

  // ── localStorage থেকে order data পড়া ─────────────────────────────────────
  const syncLocalData = useCallback(() => {
    const raw = localStorage.getItem("activeOrder");
    if (!raw) { setActiveOrder(null); return; }

    try {
      const data      = JSON.parse(raw);
      if (!data.startTime) return;

      const elapsed   = Math.floor((Date.now() - Number(data.startTime)) / 1000);
      const duration  = data.deliveryDuration || 1800;
      const remaining = Math.max(0, duration - elapsed);

      setRemainingTime(remaining);
      setActiveOrder(data);
      orderIdRef.current = extractOrderId(data);
    } catch (err) {
      console.error("LocalStorage Sync Error:", err);
    }
  }, []);

  // ── Backend থেকে শুধু status পড়া (কোনো write নেই) ──────────────────────
  const fetchOrderStatus = useCallback(async (orderId, silent = true) => {
    if (!orderId) return;
    if (!silent) setIsRefreshing(true);

    try {
      // ✅ সঠিক URL: API_BASE/order-statused?id=...
      const res         = await fetch(`${API_BASE}/order-statused?id=${orderId}`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        console.error("Non-JSON response from backend. Status:", res.status);
        return;
      }

      const json = await res.json();
      if (!json?.order_status) return;

      // Backend এর status দিয়ে UI update
      setOrderStatus(json.order_status);

      if (json.order_status === "cancelled") {
        setIsCancelled(true);
      }

      // Admin যদি backend থেকে delivered করে দেয়, ৩০ সেকেন্ড পর auto clear
      if (json.order_status === "delivered") {
        setTimeout(() => {
          localStorage.removeItem("activeOrder");
          window.dispatchEvent(new Event("orderUpdated"));
        }, 30000);
      }
    } catch (err) {
      console.error("Polling Error:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // ── localStorage interval ─────────────────────────────────────────────────
  useEffect(() => {
    syncLocalData();
    const localInterval = setInterval(syncLocalData, 1000);
    window.addEventListener("storage",      syncLocalData);
    window.addEventListener("orderUpdated", syncLocalData);
    return () => {
      clearInterval(localInterval);
      window.removeEventListener("storage",      syncLocalData);
      window.removeEventListener("orderUpdated", syncLocalData);
    };
  }, [syncLocalData]);

  // ── Polling: activeOrder load হলেই শুরু হবে ─────────────────────────────
  useEffect(() => {
    const orderId = extractOrderId(activeOrder);
    if (!orderId) return;

    orderIdRef.current = orderId;

    // প্রথমেই একবার fetch
    fetchOrderStatus(orderId);

    // তারপর প্রতি POLL_INTERVAL এ fetch
    const pollInterval = setInterval(() => {
      fetchOrderStatus(orderIdRef.current);
    }, POLL_INTERVAL);

    // Tab এ ফিরে আসলে সাথে সাথে fetch
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOrderStatus(orderIdRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeOrder, fetchOrderStatus]);

  if (!activeOrder) return null;

  const orderId         = extractOrderId(activeOrder);
  const firstItem       = activeOrder.cartItems?.[0] || {};
  const rawName         = activeOrder.restaurantName || firstItem.restaurantSlug || "Our Kitchen";
  const restaurantName  = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const restaurantArea  = activeOrder.area || "Main Branch";
  const restaurantLogo  = activeOrder.restaurantLogo || null;
  const deliveryAddress = activeOrder.customerInfo?.address || "Location Not Set";
  const currentBadge    = statusMeta[orderStatus] || statusMeta.pending;

  // ── Confirm Delivery: শুধু localStorage clear করবে, DB তে কিছু লিখবে না ─
  const handleConfirmReceived = () => {
    setShowToast(true);
    setTimeout(() => {
      localStorage.removeItem("activeOrder");
      window.dispatchEvent(new Event("orderUpdated"));
      setActiveOrder(null);
      setIsOpen(false);
      setShowToast(false);
    }, 2000);
  };

  const handleClose = () => {
    if (isCancelled) {
      localStorage.removeItem("activeOrder");
      window.dispatchEvent(new Event("orderUpdated"));
      setActiveOrder(null);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-['Inter']">

      {/* Toast */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-[10000] border border-slate-700">
          <FaCheckCircle className="text-emerald-400 text-xl" />
          <span className="text-sm font-bold tracking-wide">Order Received! Enjoy your meal.</span>
        </div>
      )}

      {/* Floating Mini Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-4 bg-slate-900 p-2 pr-5 rounded-full cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all border border-white/10 group"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-red-600 shadow-red-600/30">
              {isCancelled
                ? <FaTimesCircle size={20} />
                : <FaMotorcycle size={22} className="group-hover:translate-x-1 transition-transform" />
              }
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${isCancelled ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-[1px] ${isCancelled ? "text-red-400" : "text-slate-400"}`}>
              {isCancelled ? "Cancelled" : currentBadge.label}
            </span>
            {!isCancelled && (
              <span className="text-base font-black text-white tracking-tighter tabular-nums">
                {formatTime(remainingTime)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Full Popup */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[-1]" onClick={handleClose} />

          {isCancelled ? (
            <CancelledScreen onClose={handleClose} />
          ) : (
            <div className="w-[92vw] sm:w-[380px] bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-7 text-white relative">
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <button
                    onClick={() => fetchOrderStatus(orderId, false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    title="Refresh status"
                  >
                    <FaSyncAlt size={12} className={isRefreshing ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/*<div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center shadow-xl p-1 overflow-hidden">
                    {restaurantLogo ? (
                      <img src={restaurantLogo} alt="logo" className="w-full h-full object-cover rounded-[16px]" />
                    ) : firstItem.img ? (
                      <img src={firstItem.img} alt="logo" className="w-full h-full object-cover rounded-[16px]" />
                    ) : (
                      <FaStore size={24} className="text-red-600" />
                    )}
                  </div>*/}
                  <div>
                    <h3 className="text-lg font-black tracking-tight leading-none mb-2">{restaurantName}</h3>
                    <div className="flex items-center gap-2 opacity-70">
                      <FaMapMarkerAlt size={10} className="text-red-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{restaurantArea}</span>
                    </div>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${currentBadge.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {currentBadge.label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
                <StatusStepper currentStatus={orderStatus} />

                {/* Delivery Info */}
                <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                      <FaMapMarkerAlt size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deliver to</p>
                      <p className="text-[12px] font-bold text-slate-700 line-clamp-1 italic">{deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <FaUser size={12} />
                    </div>
                    <p className="text-[12px] font-black text-slate-800 tracking-tight">
                      {activeOrder.customerInfo?.name}
                      <span className="text-slate-300 mx-1">•</span>
                      {activeOrder.customerInfo?.phone}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-4 ml-1 flex items-center gap-2">
                    <FaBoxOpen className="text-slate-300" /> Order Summary
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

                {/* Timer + Total */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50 text-center">
                    <FaClock className="mx-auto text-emerald-500 mb-2" size={18} />
                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Estimated</p>
                    <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{formatTime(remainingTime)}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-3xl text-center shadow-lg shadow-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Bill</p>
                    <p className="text-lg font-black text-white leading-none tracking-tighter">৳{activeOrder.grandTotal}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-white p-5 rounded-[30px] border border-slate-100 text-center shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Rate the quality</p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={24}
                        className={`cursor-pointer transition-all hover:scale-125 ${star <= rating ? "text-amber-400" : "text-slate-100"}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA — admin delivered করলে button active হবে */}
              <div className="p-6 pt-0 bg-slate-50/50">
                <button
                  onClick={handleConfirmReceived}
                  disabled={orderStatus !== "delivered"}
                  className={`group w-full py-5 rounded-[25px] text-[13px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    orderStatus === "delivered"
                      ? "bg-slate-900 text-white shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:bg-black"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>
                    {orderStatus === "delivered" ? "Confirm Delivery" : "Waiting for Delivery…"}
                  </span>
                  {orderStatus === "delivered" && (
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default OrderTrackerWidget;
