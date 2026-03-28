import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Printer, Save, Calendar, User, Phone, MapPin, LayoutGrid } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios'; 

const CreateOrder = () => {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();
  
  const restaurantId = localStorage.getItem('resId') || ""; 
  const resName = localStorage.getItem('resName') || "Our Restaurant";
  const resAddress = localStorage.getItem('restaurantAddress') || "Address not available";

  const [inventoryItems, setInventoryItems] = useState([]);
  const [tables, setTables] = useState([]); // টেবিল লিস্টের জন্য স্টেট
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '', date: today, table_id: '' });
  const [orderItems, setOrderItems] = useState([{ searchItem: '', searchId: '', price: 0, quantity: 1, total: 0 }]);
  
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [subscription, setSubscription] = useState('Paid'); 
  const [reference, setReference] = useState('');

  // Fetch Inventory & Tables
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (restaurantId) {
          // ইনভেন্টরি এবং টেবিল লিস্ট একসাথে কল করা হচ্ছে
          const [invRes, tableRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/inventory/${restaurantId}`),
            axios.get(`http://localhost:5000/api/get-tables/${restaurantId}`)
          ]);
          setInventoryItems(invRes.data);
          setTables(tableRes.data);
        }
      } catch (err) {
        console.error("Data load failed", err);
      }
    };
    fetchData();
  }, [restaurantId]);

  const subTotal = useMemo(() => orderItems.reduce((acc, curr) => acc + curr.total, 0), [orderItems]);
  const finalTotal = subTotal - discount;
  const dueAmount = finalTotal - paidAmount;

  const handlePrint = () => window.print();

  const addRow = () => {
    setOrderItems([...orderItems, { searchItem: '', searchId: '', price: 0, quantity: 1, total: 0 }]);
  };

  const handleItemChange = (index, selectedName) => {
    const item = inventoryItems.find(i => i.name === selectedName);
    const list = [...orderItems];
    if (item) {
      list[index] = { 
        ...list[index], 
        searchItem: item.name, 
        searchId: item.id, 
        price: Number(item.price), 
        total: Number(item.price) * list[index].quantity 
      };
    } else {
      list[index] = { searchItem: '', searchId: '', price: 0, quantity: 1, total: 0 };
    }
    setOrderItems(list);
  };

  const handleQuantityChange = (index, qty) => {
    const list = [...orderItems];
    const quantity = Number(qty) < 1 ? 1 : Number(qty);
    list[index].quantity = quantity;
    list[index].total = list[index].price * quantity;
    setOrderItems(list);
  };

  const removeRow = (index) => {
    if (orderItems.length > 1) {
      const list = [...orderItems];
      list.splice(index, 1);
      setOrderItems(list);
    }
  };

  const handleSave = async () => {
    if (!customer.name || !customer.mobile) {
      return Swal.fire('Warning', 'Customer name and mobile are required!', 'warning');
    }
    const validItems = orderItems.filter(item => item.searchId !== '');
    if (validItems.length === 0) {
      return Swal.fire('Error', 'Please select at least one food item.', 'error');
    }

    if (subscription === 'Due' && !reference) {
      return Swal.fire('Warning', 'Please provide a Reference Name for Due orders!', 'warning');
    }

    try {
      const payload = {
        restaurant_id: restaurantId,
        customer,
        order_type: 'Offline', // যেহেতু এটা ক্রিয়েট অর্ডার পেজ থেকে হচ্ছে, তাই টাইপ অফলাইন
        items: validItems,
        billing: { 
          subTotal, 
          discount, 
          finalTotal, 
          paidAmount: subscription === 'Paid' ? finalTotal : paidAmount,
          dueAmount: subscription === 'Paid' ? 0 : dueAmount 
        },
        payment: { paymentMethod },
        subscription: { 
          status: subscription === 'Paid' ? 'delivered' : 'pending', // পেইড হলে সরাসরি ডেলিভারড
          reference: subscription === 'Due' ? reference : '' 
        }
      };
      
      const response = await axios.post('http://localhost:5000/api/save-order', payload);
      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Order Saved!',
          text: `Invoice ID: ${response.data.orderId} | Table: ${customer.table_id || 'N/A'}`,
          confirmButtonColor: '#d33'
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Save Error:", error.response?.data);
      Swal.fire('Error', 'Failed to save order.', 'error');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 font-sans">
      <style>{`@media print { .no-print { display: none !important; } .print-area { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important;} }`}</style>

      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border-t-[12px] border-red-600 print-area">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-10 border-b pb-6">
            <div>
              <h2 className="text-3xl font-black uppercase text-gray-800">{resName}</h2>
              <p className="text-gray-400 font-bold text-xs italic">{resAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-gray-400">POS - Offline Receipt</p>
              <p className="font-bold text-gray-700">#ORD-{Math.floor(Date.now()/100000)}</p>
              {customer.table_id && <p className="text-red-600 font-black uppercase text-sm">Table: {customer.table_id}</p>}
            </div>
          </div>

          {/* Customer & Table Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border">
              <User size={18} className="text-gray-400"/>
              <input type="text" placeholder="Customer Name" className="bg-transparent w-full outline-none" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border">
              <Phone size={18} className="text-gray-400"/>
              <input type="text" placeholder="Mobile Number" className="bg-transparent w-full outline-none" value={customer.mobile} onChange={(e) => setCustomer({...customer, mobile: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100">
              <LayoutGrid size={18} className="text-red-500"/>
              <select 
                className="bg-transparent w-full outline-none font-bold text-red-600 appearance-none cursor-pointer" 
                value={customer.table_id} 
                onChange={(e) => setCustomer({...customer, table_id: e.target.value})}
              >
                <option value="">Select Table (Optional)</option>
                {tables.map(t => (
                  <option key={t.id} value={`Table - ${t.table_number}`}>
                    Table - {t.table_number} ({t.is_available ? 'Available' : 'Busy'})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded-xl border">
              <MapPin size={18} className="text-gray-400"/>
              <input type="text" placeholder="Note / Address" className="bg-transparent w-full outline-none" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-xl border">
              <Calendar size={18} className="text-gray-400"/>
              <input type="date" className="bg-transparent w-full outline-none" value={customer.date} readOnly />
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full mb-6 text-sm">
              <thead className="bg-gray-800 text-white uppercase text-[10px]">
                <tr>
                  <th className="p-4 text-left rounded-l-xl">Item Name</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Qty</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 no-print rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <select className="w-full bg-transparent border-none outline-none font-semibold cursor-pointer" value={item.searchItem} onChange={(e) => handleItemChange(index, e.target.value)}>
                        <option value="">Choose Food...</option>
                        {inventoryItems.map(inv => <option key={inv.id} value={inv.name}>{inv.name}</option>)}
                      </select>
                    </td>
                    <td className="p-4 font-bold text-gray-600">৳{item.price}</td>
                    <td className="p-4">
                      <input type="number" className="w-16 border rounded p-1 text-center" value={item.quantity} onChange={(e) => handleQuantityChange(index, e.target.value)} />
                    </td>
                    <td className="p-4 text-right font-black">৳{item.total}</td>
                    <td className="p-4 text-center no-print">
                      <button onClick={() => removeRow(index)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addRow} className="no-print flex items-center gap-2 mb-10 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold uppercase transition-colors">
            <Plus size={14}/> Add New Item
          </button>

          {/* Payment & Billing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10 border-t">
            <div className="space-y-6 no-print">
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 mb-3">Payment Method</h4>
                <div className="flex gap-4">
                  {['CASH', 'DIGITAL'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${paymentMethod === m ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>{m}</button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 mb-3">Billing Status</h4>
                <div className="flex gap-4">
                  {['Paid', 'Due'].map(s => (
                    <button key={s} onClick={() => setSubscription(s)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${subscription === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {subscription === 'Due' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="text-xs font-black uppercase text-red-500 mb-2">Reference / Due Holder Name *</h4>
                  <input type="text" placeholder="Enter Ref Name" className="w-full p-4 border-2 border-red-100 rounded-2xl outline-none focus:border-red-500 font-bold" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-gray-400 font-bold"><span>SubTotal</span><span>৳{subTotal}</span></div>
                <div className="flex justify-between items-center text-red-400">
                  <span>Discount</span>
                  <input type="number" className="w-20 bg-white/10 text-right p-1 rounded outline-none border border-white/5" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                </div>
                <div className="border-t border-white/10 my-4"></div>
                <div className="flex justify-between text-2xl font-black italic">
                  <span>Grand Total</span>
                  <span className="text-red-500">৳{finalTotal}</span>
                </div>
                
                {subscription === 'Due' && (
                  <>
                    <div className="flex justify-between items-center text-green-400 pt-4">
                      <span>Paid Amount</span>
                      <input type="number" className="w-24 bg-white/10 text-right p-1 rounded outline-none font-bold border border-white/5" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
                    </div>
                    <div className="flex justify-between text-orange-400 font-bold border-t border-white/10 pt-4">
                      <span>Balance Due</span><span>৳{dueAmount}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-12 no-print">
            <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-4 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all"><Printer size={18}/> Print</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-12 py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-red-700 active:scale-95 transition-all">
              <Save size={18}/> Confirm & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;