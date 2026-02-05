import React, { useState } from 'react';
import {
  FaMotorcycle, FaWalking, FaUtensils, FaCheckCircle, FaCalendarAlt,
  FaUser, FaPhoneAlt, FaMoneyBillWave, FaMobileAlt,
  FaChair, FaUsers, FaHeart, FaInfoCircle, FaTrashAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const CheckoutBox = ({ totalAmount, cartItems, restaurantName, onCancel, onSuccess, onAreaUpdate, onRemoveRestaurant }) => {
  const [method, setMethod] = useState('Delivery');
  const [payment, setPayment] = useState('Cash');
  const [area, setArea] = useState('Select Area');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  const [bookingType, setBookingType] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  // logic for multi-vendor check
  const uniqueRestaurants = [...new Set(cartItems.map(item => item.restaurantSlug))];
  const isMultiVendor = uniqueRestaurants.length > 1;

  const areaCharges = {
    Zindabazar: 40, Amberkhana: 50, Shibgonj: 60,
    Uposhohor: 55, 'Modina Market': 70,
    Dariapara: 40, Others: 80
  };

  const totalItemQuantity = cartItems.reduce((s, i) => s + i.quantity, 0);
  const perStoreCharge = areaCharges[area] || 0;
  
  const extraCharge =
    method === 'Delivery' ? (perStoreCharge * uniqueRestaurants.length)
      : method === 'Pickup' ? totalItemQuantity * 5 : 0;

  const chargeNote =
    method === 'Delivery' ? `Delivery Fee (${uniqueRestaurants.length} Shops)`
      : method === 'Pickup' ? 'Packaging Fee' : 'Service Fee';

  const grandTotal = totalAmount + extraCharge;

  const allTables = [
    { id: 'C-01', type: 'Couple', capacity: 2, available: true },
    { id: 'C-03', type: 'Couple', capacity: 2, available: true },
    { id: 'F-04-1', type: 'Family', capacity: 4, available: true },
    { id: 'F-04-3', type: 'Family', capacity: 4, available: true },
    { id: 'F-06-1', type: 'Family', capacity: 6, available: true },
    { id: 'F-06-3', type: 'Family', capacity: 6, available: true },
    { id: 'F-06-5', type: 'Family', capacity: 6, available: true },
  ];

  const filteredTables = allTables.filter(t => {
    if (bookingType === 'Couple') return t.type === 'Couple';
    if (bookingType === 'Family') {
      if (memberCount === '4') return t.capacity === 4;
      if (memberCount === '6+') return t.capacity === 6;
    }
    return false;
  });

  const handleAreaChange = (val) => {
    setArea(val);
    if (onAreaUpdate) onAreaUpdate(val);
  };

  const isButtonDisabled =
    !customerInfo.name ||
    !customerInfo.phone ||
    (method === 'Delivery' && (area === 'Select Area' || !customerInfo.address)) ||
    (method === 'Dine-In' && (!selectedTable || isMultiVendor)) ||
    cartItems.length === 0;

  const handleConfirmOrder = () => {
    if (method === 'Dine-In' && isMultiVendor) {
      Swal.fire({
        icon: 'error',
        title: '<span style="font-family:Inter; font-weight:900">POSSIBLE HOBA NAH!</span>',
        html: '<p style="font-family:Inter; font-weight:600; color:#666">Dine-in order-er jonno ekshathe ekter beshi restaurant allow na. Please edit koren.</p>',
        confirmButtonText: 'Got It',
        confirmButtonColor: '#be1e2d',
        customClass: { popup: 'rounded-[30px]' }
      });
      return;
    }
    
    Swal.fire({
      title: 'Place Order?',
      text: `Your total is Tk ${grandTotal}. Confirm korchen?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#be1e2d',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Yes, Order Now!',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        onSuccess({
          customerInfo, cartItems, grandTotal, extraCharge, chargeNote, method,
          area, selectedTable, paymentMethod: payment, orderDate: new Date().toLocaleString()
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-[35px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-slate-100 sticky top-5 overflow-hidden font-inter">
      
      {/* HEADER */}
      <div className="bg-[#A91B0D] px-6 py-7 flex justify-between items-center text-white">
        <h3 className="text-xl font-black uppercase tracking-tight">
          {isMultiVendor ? "Multi-Store Order" : restaurantName?.replace(/-/g, ' ')}
        </h3>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-xs font-bold">
          <FaCalendarAlt size={10} /> {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      <div className="p-6">
        {/* METHOD */}
        <div className="flex bg-slate-50 border border-slate-100 rounded-3xl p-2 mb-8">
          {[{ id: 'Delivery', icon: <FaMotorcycle />, label: 'Delivery' },
            { id: 'Pickup', icon: <FaWalking />, label: 'Pickup' },
            { id: 'Dine-In', icon: <FaUtensils />, label: 'Dine-In' }].map(m => (
            <div
              key={m.id}
              onClick={() => { 
                if (m.id === 'Dine-In' && isMultiVendor) {
                    // 🔥 Professional Swal Alert instead of default alert
                    Swal.fire({
                      icon: 'warning',
                      title: '<span style="font-family:Inter; font-weight:900">NOT ALLOWED!</span>',
                      html: '<p style="font-family:Inter; font-weight:600; color:#666">Dine-in is only for 1 restaurant. Please remove other stores first.</p>',
                      confirmButtonText: 'Understood',
                      confirmButtonColor: '#be1e2d',
                      customClass: { popup: 'rounded-[30px]' }
                    });
                    return;
                }
                setMethod(m.id); 
                setSelectedTable(null); 
              }}
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl cursor-pointer transition-all ${method === m.id ? 'bg-[#be1e2d] text-white shadow-lg' : 'text-slate-500 hover:-translate-y-0.5'}`}
            >
              {m.icon}
              <span className="text-[11px] font-extrabold mt-1">{m.label}</span>
            </div>
          ))}
        </div>

        {/* DINE-IN REMOVAL LOGIC UI */}
        {method === 'Dine-In' && isMultiVendor && (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-5 mb-8 animate-pulse">
            <p className="text-[10px] font-black text-red-600 uppercase mb-3 italic">⚠️ Edit basket to 1 restaurant for Dine-in:</p>
            {uniqueRestaurants.map(slug => (
              <div key={slug} className="flex justify-between items-center bg-white p-3 rounded-2xl mb-2 shadow-sm border border-red-50">
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">{slug.replace(/-/g, ' ')}</span>
                <button onClick={() => onRemoveRestaurant(slug)} className="text-red-500 hover:scale-125 transition-transform p-1">
                   <FaTrashAlt size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* DINE IN TABLE SECTION */}
        {method === 'Dine-In' && !isMultiVendor && (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-8 transition-all duration-300">
             <div className="flex gap-4 mb-4">
                <div onClick={() => {setBookingType('Couple'); setSelectedTable(null);}} className={`flex-1 p-4 rounded-2xl border text-center cursor-pointer transition-all ${bookingType === 'Couple' ? 'bg-red-50 border-[#be1e2d] shadow-sm' : 'bg-white border-slate-100'}`}><FaHeart className={`mx-auto mb-1 ${bookingType === 'Couple' ? 'text-[#be1e2d]' : 'text-slate-300'}`}/> <span className="text-[10px] font-bold uppercase">Couple</span></div>
                <div onClick={() => {setBookingType('Family'); setSelectedTable(null);}} className={`flex-1 p-4 rounded-2xl border text-center cursor-pointer transition-all ${bookingType === 'Family' ? 'bg-red-50 border-[#be1e2d] shadow-sm' : 'bg-white border-slate-100'}`}><FaUsers className={`mx-auto mb-1 ${bookingType === 'Family' ? 'text-[#be1e2d]' : 'text-slate-300'}`}/> <span className="text-[10px] font-bold uppercase">Family</span></div>
             </div>
             {bookingType === 'Family' && (
                <div className="flex justify-center gap-3 mb-4">
                  {['4', '6+'].map(c => (
                    <button key={c} onClick={() => {setMemberCount(c); setSelectedTable(null);}} className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${memberCount === c ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>{c} PERSON</button>
                  ))}
                </div>
             )}
             {(bookingType === 'Couple' || memberCount) && (
                 <div className="grid grid-cols-4 gap-2">
                    {filteredTables.map(t => (
                        <div key={t.id} onClick={() => setSelectedTable(t.id)} className={`p-2 rounded-xl text-[10px] font-black border-2 text-center cursor-pointer transition-all ${selectedTable === t.id ? 'bg-[#be1e2d] text-white border-[#be1e2d]' : 'bg-white text-slate-400 border-slate-100'}`}>{t.id}</div>
                    ))}
                 </div>
             )}
          </div>
        )}

        {/* PERSONAL INFO */}
        <div className="space-y-4 mb-8">
          <input name="name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-semibold text-slate-700 focus:border-[#be1e2d10] transition-colors" />
          <input name="phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="Phone" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-semibold text-slate-700 focus:border-[#be1e2d10] transition-colors" />
          
          {method === 'Delivery' && (
            <div className="space-y-4 animate-fadeIn">
              <select value={area} onChange={e => handleAreaChange(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-semibold text-slate-700 outline-none cursor-pointer">
                <option disabled value="Select Area">Select Area</option>
                {Object.keys(areaCharges).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <textarea value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="Full Address (House/Road/Area)" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-semibold resize-none h-[80px] outline-none text-slate-700" />
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-6">
          <div className="flex justify-between text-sm mb-2 text-slate-500 font-bold"><span>Items Total</span><span>Tk {totalAmount}</span></div>
          {extraCharge > 0 && (
            <div className="flex justify-between text-sm mb-2 text-[#be1e2d] font-black italic">
              <span>{chargeNote}</span><span>+ Tk {extraCharge}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed border-slate-200">
            <span className="text-xl font-black text-slate-800 tracking-tighter">Grand Total</span>
            <span className="text-2xl font-black text-[#be1e2d]">Tk {grandTotal}</span>
          </div>
        </div>

        <button
          disabled={isButtonDisabled}
          onClick={handleConfirmOrder}
          className={`w-full py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 transition-all ${isButtonDisabled ? 'bg-slate-200 text-slate-400' : 'bg-[#be1e2d] text-white shadow-xl hover:bg-[#a91b0d] active:scale-95'}`}
        >
          Confirm Order <FaCheckCircle />
        </button>
      </div>
    </div>
  );
};

export default CheckoutBox;