import React, { useState, useEffect } from 'react';
import {
  FaMotorcycle, FaWalking, FaUtensils, FaCheckCircle, FaCalendarAlt,
  FaTrashAlt, FaMoneyBillWave, FaMobileAlt, FaStore
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const CheckoutBox = ({ totalAmount, cartItems, restaurantName, onCancel, onSuccess, onAreaUpdate }) => {
  const [method, setMethod] = useState('Delivery');
  const [payment, setPayment] = useState('Cash'); 
  const [area, setArea] = useState('Select Area');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  const [dbDeliveryData, setDbDeliveryData] = useState([]); 
  const [dbTables, setDbTables] = useState([]); 
  const [bookingType, setBookingType] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  // ইউনিক রেস্টুরেন্ট আইডি এবং স্ল্যাগ বের করা
  const uniqueRestaurantIds = [...new Set(cartItems.map(item => item.restaurant_id || item.resId))].filter(Boolean);
  const uniqueSlugs = [...new Set(cartItems.map(item => item.restaurantSlug))];
  const isMultiVendor = uniqueSlugs.length > 1;

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (uniqueRestaurantIds.length > 0) {
        try {
          // ডেলিভারি চার্জ ডাটা ফেচ
          const areaRes = await fetch('http://localhost:5000/api/get-cart-delivery-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restaurantIds: uniqueRestaurantIds })
          });
          const areaData = await areaRes.json();
          setDbDeliveryData(areaData);

          // যদি সিঙ্গেল রেস্টুরেন্ট হয়, তবে টেবিল ডাটা ফেচ করবে
          if (!isMultiVendor) {
            const tableRes = await fetch(`http://localhost:5000/api/get-tables/${uniqueRestaurantIds[0]}`);
            const tableData = await tableRes.json();
            setDbTables(tableData);
          }
        } catch (error) {
          console.error("Checkout Data Load Error:", error);
        }
      }
    };
    fetchCheckoutData();
  }, [cartItems, isMultiVendor]);

  // অ্যাভেইলঅ্যাবল এরিয়া লিস্ট
  const availableAreas = [...new Set(dbDeliveryData.map(d => d.areaName))];

  // ডেলিভারি চার্জ ক্যালকুলেশন (resId বা restaurant_id যেকোনোটি সাপোর্ট করবে)
  const deliveryChargeTotal = area === 'Select Area' ? 0 : uniqueRestaurantIds.reduce((total, resId) => {
    const chargeObj = dbDeliveryData.find(d => 
      (d.restaurant_id === resId || d.resId === resId) && d.areaName === area
    );
    return total + (chargeObj ? parseFloat(chargeObj.deliveryCharge) : 0);
  }, 0);

  // এক্সট্রা চার্জ লজিক (পিকআপে প্রতি দোকানের জন্য ৫ টাকা)
  const extraCharge = method === 'Delivery' ? deliveryChargeTotal : (method === 'Pickup' ? uniqueRestaurantIds.length * 5 : 0);
  const grandTotal = totalAmount + extraCharge;

  // টেবিল ফিল্টারিং লজিক
  const filteredTables = dbTables.filter(t => {
    if (!t.is_available) return false;
    if (bookingType === 'Couple') return t.capacity <= 2;
    if (bookingType === 'Family') return t.capacity >= 4;
    return true;
  });

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); 
    if (value.length <= 11) {
      setCustomerInfo({ ...customerInfo, phone: value });
    }
  };

  // বাটন ডিজেবল লজিক (ফুল ভ্যালিডেশন)
  const isButtonDisabled = 
    !customerInfo.name || 
    customerInfo.phone.length !== 11 || 
    (method === 'Delivery' && (area === 'Select Area' || !customerInfo.address)) ||
    (method === 'Dine-In' && (!selectedTable || isMultiVendor)) ||
    cartItems.length === 0;

  const handleConfirmOrder = () => {
    Swal.fire({
      title: 'Confirm Order?',
      html: `
        <div style="text-align: left; font-size: 14px; padding: 10px;">
          <p><b>Payable:</b> <span style="color:#be1e2d">Tk ${grandTotal}</span></p>
          <p><b>Method:</b> ${method}</p>
          <p><b>Items:</b> ${cartItems.length}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#be1e2d',
      confirmButtonText: 'Yes, Place Order',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        onSuccess({
          customerInfo, 
          cartItems, 
          grandTotal, 
          extraCharge, 
          method,
          area, 
          selectedTable, 
          paymentMethod: payment
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-[35px] shadow-2xl border border-slate-100 overflow-hidden font-inter">
      <div className="bg-[#A91B0D] px-6 py-6 text-white flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-lg font-black uppercase tracking-tight leading-none">Checkout</h3>
          <span className="text-[10px] opacity-70 mt-1 font-bold">
            {isMultiVendor ? "MULTI-VENDOR CART" : restaurantName?.replace(/-/g, ' ')}
          </span>
        </div>
        <FaCalendarAlt className="opacity-50" />
      </div>

      <div className="p-6">
        {/* ORDER METHOD SELECTOR */}
        <div className="flex bg-slate-50 border border-slate-100 rounded-3xl p-1.5 mb-6">
          {['Delivery', 'Pickup', 'Dine-In'].map(m => (
            <button 
              key={m} 
              disabled={m === 'Dine-In' && isMultiVendor}
              onClick={() => setMethod(m)} 
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all 
                ${method === m ? 'bg-[#be1e2d] text-white shadow-md' : 'text-slate-400'}
                ${(m === 'Dine-In' && isMultiVendor) ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {m === 'Delivery' ? <FaMotorcycle className="inline mr-1 mb-0.5" /> : m === 'Pickup' ? <FaWalking className="inline mr-1 mb-0.5" /> : <FaUtensils className="inline mr-1 mb-0.5" />}
              {m}
            </button>
          ))}
        </div>

        {/* DINE-IN OPTIONS */}
        {method === 'Dine-In' && !isMultiVendor && (
          <div className="bg-red-50 p-4 rounded-3xl mb-6 border border-red-100 animate-in fade-in duration-300">
            <p className="text-[10px] font-black text-red-800 mb-3 text-center uppercase">Choose Your Table</p>
             <div className="flex gap-2 mb-4">
                <button onClick={() => setBookingType('Couple')} className={`flex-1 p-2.5 rounded-xl border text-center font-bold text-[10px] transition-all ${bookingType === 'Couple' ? 'bg-white border-red-500 text-red-600 shadow-sm' : 'bg-white/50 text-gray-400'}`}>COUPLE</button>
                <button onClick={() => setBookingType('Family')} className={`flex-1 p-2.5 rounded-xl border text-center font-bold text-[10px] transition-all ${bookingType === 'Family' ? 'bg-white border-red-500 text-red-600 shadow-sm' : 'bg-white/50 text-gray-400'}`}>FAMILY</button>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {filteredTables.map(t => (
                  <button key={t.id} onClick={() => setSelectedTable(t.table_number)} className={`p-2 rounded-lg text-[10px] font-black border-2 transition-all ${selectedTable === t.table_number ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{t.table_number}</button>
                ))}
             </div>
          </div>
        )}

        {/* CUSTOMER INPUTS */}
        <div className="space-y-3 mb-6">
          <input 
            value={customerInfo.name} 
            onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
            placeholder="Recipient Name" 
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-red-200 transition-colors" 
          />
          
          <input 
            type="text" 
            inputMode="numeric"
            value={customerInfo.phone} 
            onChange={handlePhoneChange} 
            placeholder="Mobile Number (11 digits)" 
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-red-200" 
          />

          {method === 'Delivery' && (
            <>
              <select 
                value={area} 
                onChange={e => { setArea(e.target.value); onAreaUpdate?.(e.target.value); }} 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none"
              >
                <option disabled value="Select Area">Select Delivery Area</option>
                {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <textarea 
                value={customerInfo.address} 
                onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                placeholder="Detailed Delivery Address (Road, House, Flat)" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-20 outline-none text-sm font-bold focus:border-red-200 transition-colors" 
              />
            </>
          )}
        </div>

        {/* PAYMENT SELECTOR */}
        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 ml-2">Payment Option</p>
        <div className="flex gap-3 mb-6">
          {['Cash', 'Digital'].map(p => (
            <div 
              key={p} 
              onClick={() => setPayment(p)} 
              className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${payment === p ? 'border-[#be1e2d] bg-red-50' : 'border-slate-100 bg-slate-50'}`}
            >
              {p === 'Cash' ? <FaMoneyBillWave className={payment === 'Cash' ? 'text-[#be1e2d]' : 'text-slate-300'} /> : <FaMobileAlt className={payment === 'Digital' ? 'text-[#be1e2d]' : 'text-slate-300'} />}
              <span className={`text-[10px] font-black mt-1 ${payment === p ? 'text-[#be1e2d]' : 'text-slate-400'}`}>{p.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* FINAL BILL BOX */}
        <div className="bg-slate-900 p-5 rounded-[30px] mb-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between text-[11px] font-bold opacity-60 mb-2">
              <span>Items Subtotal</span>
              <span>Tk {totalAmount}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-red-400 mb-4">
              <span>{method} Charge ({uniqueRestaurantIds.length} Shop)</span>
              <span>+ Tk {extraCharge}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-xs font-black uppercase opacity-60">Grand Total</span>
              <span className="text-2xl font-black text-red-500 tracking-tight">Tk {grandTotal}</span>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* CONFIRM BUTTON */}
        <button 
          disabled={isButtonDisabled} 
          onClick={handleConfirmOrder} 
          className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all 
            ${isButtonDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#be1e2d] text-white shadow-xl hover:shadow-red-200 active:scale-95'}`}
        >
          {isButtonDisabled ? 'FILL ALL DETAILS' : 'PLACE ORDER'} 
          {!isButtonDisabled && <FaCheckCircle />}
        </button>
      </div>
    </div>
  );
};

export default CheckoutBox;