import React, { useState, useEffect } from 'react';
import {
  FaMotorcycle, FaWalking, FaUtensils, FaCheckCircle, FaCalendarAlt,
  FaHeart, FaUsers, FaTrashAlt, FaMoneyBillWave, FaMobileAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const CheckoutBox = ({ totalAmount, cartItems, restaurantName, onCancel, onSuccess, onAreaUpdate, onRemoveRestaurant }) => {
  const [method, setMethod] = useState('Delivery');
  const [payment, setPayment] = useState('Cash'); 
  const [area, setArea] = useState('Select Area');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  const [dbDeliveryData, setDbDeliveryData] = useState([]); 
  const [dbTables, setDbTables] = useState([]); 
  const [bookingType, setBookingType] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const uniqueRestaurantIds = [...new Set(cartItems.map(item => item.restaurant_id || item.resId))];
  const uniqueSlugs = [...new Set(cartItems.map(item => item.restaurantSlug))];
  const isMultiVendor = uniqueSlugs.length > 1;

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (uniqueRestaurantIds.length > 0) {
        try {
          const areaRes = await fetch('http://localhost:5000/api/get-cart-delivery-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restaurantIds: uniqueRestaurantIds })
          });
          const areaData = await areaRes.json();
          setDbDeliveryData(areaData);

          if (!isMultiVendor) {
            const tableRes = await fetch(`http://localhost:5000/api/get-tables/${uniqueRestaurantIds[0]}`);
            const tableData = await tableRes.json();
            setDbTables(tableData);
          }
        } catch (error) {
          console.error("Data Load Error:", error);
        }
      }
    };
    fetchCheckoutData();
  }, [cartItems]);

  const availableAreas = [...new Set(dbDeliveryData.map(d => d.areaName))];

  const deliveryChargeTotal = area === 'Select Area' ? 0 : uniqueRestaurantIds.reduce((total, resId) => {
    const chargeObj = dbDeliveryData.find(d => d.restaurant_id === resId && d.areaName === area);
    return total + (chargeObj ? parseFloat(chargeObj.deliveryCharge) : 0);
  }, 0);

  const extraCharge = method === 'Delivery' ? deliveryChargeTotal : (method === 'Pickup' ? cartItems.length * 5 : 0);
  const grandTotal = totalAmount + extraCharge;

  const filteredTables = dbTables.filter(t => {
    if (!t.is_available) return false;
    if (bookingType === 'Couple') return t.capacity <= 2;
    if (bookingType === 'Family') {
      if (memberCount === '4') return t.capacity > 2 && t.capacity <= 4;
      if (memberCount === '6+') return t.capacity >= 6;
    }
    return false;
  });

  // শুধুমাত্র নাম্বার ইনপুট নেয়ার ফাংশন
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // সংখ্যা ছাড়া সব রিমুভ করবে
    setCustomerInfo({ ...customerInfo, phone: value });
  };

  const isButtonDisabled = 
    !customerInfo.name || 
    customerInfo.phone.length < 11 || // মিনিমাম ১১ ডিজিট ভ্যালিডেশন (ঐচ্ছিক)
    (method === 'Delivery' && (area === 'Select Area' || !customerInfo.address)) ||
    (method === 'Dine-In' && (!selectedTable || isMultiVendor)) ||
    cartItems.length === 0;

  const handleConfirmOrder = () => {
    Swal.fire({
      title: 'Confirm Order?',
      html: `<b style="color:#be1e2d">Total Payable: Tk ${grandTotal}</b><br/>Method: ${method} | Payment: ${payment}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#be1e2d',
      confirmButtonText: 'Yes, Place Order',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        onSuccess({
          customerInfo, cartItems, grandTotal, extraCharge, method,
          area, selectedTable, paymentMethod: payment
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-[35px] shadow-2xl border border-slate-100 sticky top-5 overflow-hidden font-inter">
      <div className="bg-[#A91B0D] px-6 py-6 text-white flex justify-between items-center">
        <h3 className="text-lg font-black uppercase tracking-tight">
          {isMultiVendor ? "Multi-Store Order" : restaurantName?.replace(/-/g, ' ')}
        </h3>
        <FaCalendarAlt className="opacity-50" />
      </div>

      <div className="p-6">
        {/* ORDER METHOD */}
        <div className="flex bg-slate-50 border border-slate-100 rounded-3xl p-1.5 mb-6">
          {['Delivery', 'Pickup', 'Dine-In'].map(m => (
            <button key={m} onClick={() => setMethod(m)} 
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${method === m ? 'bg-[#be1e2d] text-white shadow-md' : 'text-slate-400'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* DINE-IN LOGIC */}
        {method === 'Dine-In' && (
          <div className="bg-red-50 p-4 rounded-3xl mb-6 border border-red-100 shadow-inner">
             <div className="flex gap-2 mb-4">
                <button onClick={() => setBookingType('Couple')} className={`flex-1 p-3 rounded-xl border text-center font-bold text-[10px] ${bookingType === 'Couple' ? 'bg-white border-red-500 text-red-600 shadow-sm' : 'bg-white text-gray-400'}`}>COUPLE</button>
                <button onClick={() => setBookingType('Family')} className={`flex-1 p-3 rounded-xl border text-center font-bold text-[10px] ${bookingType === 'Family' ? 'bg-white border-red-500 text-red-600 shadow-sm' : 'bg-white text-gray-400'}`}>FAMILY</button>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {filteredTables.map(t => (
                  <button key={t.id} onClick={() => setSelectedTable(t.table_number)} className={`p-2 rounded-lg text-[10px] font-black border-2 transition-all ${selectedTable === t.table_number ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{t.table_number}</button>
                ))}
             </div>
          </div>
        )}

        {/* CUSTOMER INFO */}
        <div className="space-y-3 mb-6">
          <input value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-red-200 transition-colors" />
          
          {/* ফোন নাম্বার ফিল্ড ফিক্স করা হয়েছে */}
          <input 
            type="text" 
            inputMode="numeric"
            value={customerInfo.phone} 
            onChange={handlePhoneChange} 
            placeholder="Phone Number (e.g. 017...)" 
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-red-200 transition-colors" 
          />

          {method === 'Delivery' && (
            <>
              <select value={area} onChange={e => { setArea(e.target.value); onAreaUpdate?.(e.target.value); }} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none">
                <option disabled value="Select Area">Select Area</option>
                {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <textarea value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="Full Address" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-20 outline-none text-sm font-bold focus:border-red-200 transition-colors" />
            </>
          )}
        </div>

        {/* PAYMENT METHOD SELECTION */}
        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 ml-2">Select Payment Method</p>
        <div className="flex gap-3 mb-6">
          <div onClick={() => setPayment('Cash')} className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${payment === 'Cash' ? 'border-[#be1e2d] bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
            <FaMoneyBillWave className={payment === 'Cash' ? 'text-[#be1e2d]' : 'text-slate-300'} />
            <span className={`text-[10px] font-black mt-1 ${payment === 'Cash' ? 'text-[#be1e2d]' : 'text-slate-400'}`}>CASH</span>
          </div>
          <div onClick={() => setPayment('Digital')} className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${payment === 'Digital' ? 'border-[#be1e2d] bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
            <FaMobileAlt className={payment === 'Digital' ? 'text-[#be1e2d]' : 'text-slate-300'} />
            <span className={`text-[10px] font-black mt-1 ${payment === 'Digital' ? 'text-[#be1e2d]' : 'text-slate-400'}`}>DIGITAL</span>
          </div>
        </div>

        {/* BILL SUMMARY */}
        <div className="bg-slate-900 p-5 rounded-[30px] mb-6 text-white shadow-xl">
          <div className="flex justify-between text-[11px] font-bold opacity-60 mb-2"><span>Items Total</span><span>Tk {totalAmount}</span></div>
          <div className="flex justify-between text-[11px] font-bold text-red-400 mb-4"><span>{method} Charge ({uniqueRestaurantIds.length} Shop)</span><span>+ Tk {extraCharge}</span></div>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-xs font-black uppercase opacity-60">To Pay</span>
            <span className="text-2xl font-black text-red-500">Tk {grandTotal}</span>
          </div>
        </div>

        <button disabled={isButtonDisabled} onClick={handleConfirmOrder} className={`w-full py-5 rounded-2xl font-black transition-all ${isButtonDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#be1e2d] text-white shadow-xl hover:shadow-red-200 hover:scale-[1.01] active:scale-95'}`}>
          CONFIRM ORDER <FaCheckCircle className="inline ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CheckoutBox;