import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Printer, Save, Calendar, User, Phone, MapPin, Hash } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios'; 

const CreateOrder = () => {
  const today = new Date().toISOString().split('T')[0];

  // Fake Restaurant data
  const restaurantInfo = {
    name: "Aman's Kitchen",
    address: "123 Food Street, Sylhet, Bangladesh"
  };

  const inventoryItems = [
    { id: 'F001', name: 'ছানার সন্দেশ', price: 35 },
    { id: 'F002', name: 'ক্ষীরের সন্দেশ', price: 23 },
    { id: 'F003', name: 'বার্গের', price: 150 },
    { id: 'F004', name: 'পিজ্জা', price: 700 },
  ];

  const [customer, setCustomer] = useState({
    name: '', mobile: '', address: '', date: today
  });

  const [orderItems, setOrderItems] = useState([
    { searchItem: '', searchId: '', price: 0, quantity: 1, total: 0 }
  ]);

  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [digitalType, setDigitalType] = useState(''); 
  const [provider, setProvider] = useState(''); 
  const [providerDetails, setProviderDetails] = useState(''); 
  const [subscription, setSubscription] = useState('Paid');
  const [reference, setReference] = useState('');

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const addRow = () => {
    setOrderItems([...orderItems, { searchItem: '', searchId: '', price: 0, quantity: 1, total: 0 }]);
  };

  const removeRow = (index) => {
    Swal.fire({
      title: 'Are you sure? ',
      text: "This item will be removed from the list! ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel..'
    }).then((result) => {
      if (result.isConfirmed) {
        const list = [...orderItems];
        list.splice(index, 1);
        setOrderItems(list);
        Swal.fire({ title: 'Deleted!', text: 'The item has been removed.', icon: 'success', timer: 1000, showConfirmButton: false });
      }
    });
  };

  const handleItemChange = (index, selectedName) => {
    const item = inventoryItems.find(i => i.name === selectedName);
    const list = [...orderItems];
    if (item) {
      list[index].searchItem = item.name;
      list[index].searchId = item.id;
      list[index].price = item.price;
      list[index].total = item.price * list[index].quantity;
    } else {
      list[index].searchItem = selectedName;
      list[index].searchId = '';
      list[index].price = 0;
      list[index].total = 0;
    }
    setOrderItems(list);
  };

  const handleQuantityChange = (index, qty) => {
    const list = [...orderItems];
    list[index].quantity = Number(qty);
    list[index].total = list[index].price * Number(qty);
    setOrderItems(list);
  };

  const subTotal = useMemo(() => orderItems.reduce((acc, curr) => acc + curr.total, 0), [orderItems]);
  const finalTotal = subTotal - discount;
  const dueAmount = finalTotal - paidAmount;

  const handleSave = async () => {
    if (!customer.name || !customer.mobile || !customer.address ) {
      return Swal.fire({ icon: 'warning', title: 'Missing Details!', text: 'Please provide all details.', confirmButtonColor: '#d33' });
    }

    const validItems = orderItems.filter(item => item.searchId !== '');
    if (validItems.length === 0) {
      return Swal.fire('Error', 'Please select at least one item.', 'error');
    }

    if (subscription === 'Due' && !reference) {
      return Swal.fire('Reference Needed', 'A reference name is required for Due orders.', 'warning');
    }

    const finalOrderData = {
      customer,
      items: validItems,
      billing: { subTotal, discount, finalTotal, paidAmount, dueAmount },
      payment: { paymentMethod, digitalType, provider, providerDetails },
      subscription: { status: subscription, reference }
    };

    console.log("Saving Data to DB:", finalOrderData);

    Swal.fire({
      icon: 'success',
      title: 'Order Ready!',
      text: 'Order data logged in console.',
      footer: 'Check Console (F12) to see JSON data.'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 font-sans">
      {/* Extra style effect for removing the bunnon when print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border-t-[12px] border-red-600 print-area">
        <div className="p-8">
          <div className="flex justify-between items-center mb-10 border-b pb-6">
            <div>
              {/* Restaurant Name and address */}
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-800">
                {restaurantInfo.name}
              </h2>
              <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest italic">{restaurantInfo.address}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order Receipt</p>
              <p className="font-bold text-gray-700">#ORD-{Math.floor(Math.random() * 10000)}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-1">
                  <User size={12}/> Customer Name <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="Full Name" className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-bold" 
                  value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-1">
                  <MapPin size={12}/> Address <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="Customer Address" className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-bold"
                  value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-1">
                  <Phone size={12}/> Mobile Number <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="01XXX-XXXXXX" className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-bold"
                  value={customer.mobile} onChange={(e) => setCustomer({...customer, mobile: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest flex items-center gap-1">
                    <Calendar size={12}/> Date
                  </label>
                  <input type="date" min={today} value={customer.date} className="w-full mt-1 px-4 py-3 bg-gray-100 border-none rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed" readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 shadow-sm mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="p-5">Item Details</th>
                  <th className="p-5">Price</th>
                  <th className="p-5">Qty</th>
                  <th className="p-5 text-right">Total</th>
                  <th className="p-5 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orderItems.map((item, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-all">
                    <td className="p-4">
                      <select className="w-full bg-transparent font-black text-gray-700 outline-none appearance-none cursor-pointer" 
                        value={item.searchItem} onChange={(e) => handleItemChange(index, e.target.value)}>
                        <option value="">Select Food Item</option>
                        {inventoryItems.map(inv => <option key={inv.id} value={inv.name}>{inv.name} ({inv.id})</option>)}
                      </select>
                      <p className="text-[9px] font-bold text-gray-300 italic uppercase tracking-tighter">{item.searchId || 'No ID'}</p>
                    </td>
                    <td className="p-4 font-bold text-gray-600">৳{item.price}</td>
                    <td className="p-4">
                      <input type="number" min="1" className="w-14 p-2 bg-gray-50 rounded-lg text-center font-bold outline-none focus:ring-1 focus:ring-red-400" 
                        value={item.quantity} onChange={(e) => handleQuantityChange(index, e.target.value)} />
                    </td>
                    <td className="p-4 text-right font-black text-gray-800">৳{item.total}</td>
                    <td className="p-4 text-center no-print">
                      <button onClick={() => removeRow(index)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button onClick={addRow} className="no-print flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95">
            <Plus size={14}/> Add New Item
          </button>

          {/* Billing & Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 pt-10 border-t-2 border-dashed border-gray-100">
            <div className="space-y-8 no-print">
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Payment Strategy</h4>
                <div className="flex gap-4">
                  {['CASH', 'DIGITAL'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} 
                      className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${paymentMethod === m ? 'bg-red-600 text-white shadow-red-200 shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'DIGITAL' && (
                <div className="p-6 bg-red-50/50 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
                  <select className="w-full p-3 bg-white rounded-xl font-bold outline-none" onChange={(e) => setDigitalType(e.target.value)}>
                    <option value="">Select Method</option>
                    <option value="CARD">Bank Cards</option>
                    <option value="MOBILE">Mobile Banking</option>
                  </select>

                  {digitalType === 'CARD' && (
                    <div className="flex gap-2">
                      <select className="p-3 bg-white rounded-xl font-bold outline-none" onChange={(e) => setProvider(e.target.value)}>
                        <option value="VISA">Visa</option>
                        <option value="MASTER">MasterCard</option>
                      </select>
                      <input type="text" placeholder="Card Number" className="flex-1 p-3 bg-white rounded-xl font-bold outline-none" onChange={(e) => setProviderDetails(e.target.value)} />
                    </div>
                  )}

                  {digitalType === 'MOBILE' && (
                    <div className="flex gap-2">
                      <select className="p-3 bg-white rounded-xl font-bold outline-none" onChange={(e) => setProvider(e.target.value)}>
                        <option value="BKASH">BKash</option>
                        <option value="NAGAD">Nagad</option>
                      </select>
                      <input type="text" placeholder="Transaction ID / Number" className="flex-1 p-3 bg-white rounded-xl font-bold outline-none" onChange={(e) => setProviderDetails(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Order Status</h4>
                <div className="flex gap-4">
                  {['Paid', 'Due'].map(s => (
                    <button key={s} onClick={() => setSubscription(s)} 
                      className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${subscription === s ? 'bg-gray-800 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {subscription === 'Due' && (
                  <input type="text" placeholder="Reference Person Name (Required)" className="w-full mt-4 p-4 border-2 border-red-100 rounded-2xl outline-none focus:border-red-500 font-bold italic transition-all" onChange={(e) => setReference(e.target.value)} />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-16 -mt-16"></div>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]"><span>SubTotal</span> <span>৳{subTotal}</span></div>
                <div className="flex justify-between items-center text-red-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                  <span>Discount</span>
                  <input type="number" className="w-20 bg-white/10 rounded-lg p-1 text-right text-white outline-none focus:ring-1 focus:ring-red-500" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                </div>
                <div className="h-[1px] bg-white/10 my-6"></div>
                <div className="flex justify-between items-center">
                  <span className="font-black italic uppercase tracking-tighter text-2xl">Total Payable</span>
                  <span className="text-3xl font-black text-red-500 tracking-tighter">৳{finalTotal}</span>
                </div>
                <div className="flex justify-between items-center text-green-400 font-bold uppercase text-[10px] tracking-[0.2em] pt-4">
                  <span>Paid Now</span>
                  <input type="number" className="w-24 bg-white/10 rounded-lg p-1 text-right text-white outline-none focus:ring-1 focus:ring-green-500" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
                </div>
                <div className="flex justify-between font-black text-orange-400 uppercase text-[10px] tracking-[0.2em] border-t border-white/5 pt-4">
                  <span>Balance Due</span> <span>৳{dueAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-4 mt-16 no-print">
            {/* conection with print function */}
            <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-gray-100 text-gray-800 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-200 transition-all shadow-sm active:scale-95">
              <Printer size={18}/> Print Invoice
            </button>
            <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95">
              <Save size={18}/> Confirm & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;