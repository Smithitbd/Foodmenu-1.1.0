import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Edit, Eye, Printer, RefreshCcw, X, Truck, ShoppingBag, Utensils, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast'; 
import axios from 'axios'; 
import { useReactToPrint } from 'react-to-print';

const Cart = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All"); 
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef(null);

  const restaurantId = localStorage.getItem('resId');
  const restaurantName = localStorage.getItem('resName') || "Restaurant Admin";

  // ডাটা ফেচ করার ফাংশন
  const fetchOrders = async (showLoading = true) => {
    if (!restaurantId) return;
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${restaurantId}`);
      setOrders(response.data);
    } catch (error) { 
      console.error("Fetch error:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // অটো-রিফ্রেশ সেটআপ
  useEffect(() => {
    fetchOrders(); 
    const intervalId = setInterval(() => {
      fetchOrders(false); 
    }, 10000); 
    return () => clearInterval(intervalId); 
  }, [restaurantId]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleUpdateStatus = async (id, currentStatus) => {
    const { value: status } = await Swal.fire({
      title: 'Update Order Status',
      input: 'select',
      inputOptions: {
        'pending': 'Pending (New)',
        'confirmed': 'Confirm/Accept',
        'cooking': 'Cooking',
        'on_the_way': 'On The Way',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
      },
      inputValue: currentStatus || 'pending',
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#10b981',
    });

    if (status && status !== currentStatus) {
      try {
        await axios.put(`http://localhost:5000/api/orders/status/${id}`, { status });
        fetchOrders(false); 
        toast.success(`Order #${id} updated to ${status}`);
      } catch (err) { toast.error("Update failed!"); }
    }
  };

  const handleViewDetails = async (order, autoPrint = false) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/order-details/${order.id}`);
      setOrderDetails(response.data.items || []);
      setSelectedOrder(response.data.info || order); 
      
      if (autoPrint) {
        setTimeout(() => {
          handlePrint();
        }, 300);
      } else {
        setIsModalOpen(true);
      }
    } catch (err) { 
      toast.error("Could not load details!"); 
    }
  };

  // --- পরিবর্তিত ফিল্টার লজিক ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // ১. অফলাইন অর্ডারগুলো একদম বাদ দিয়ে দেওয়া হয়েছে
      if (order.order_type === "Offline") return false;

      // ২. সার্চ টার্ম চেক
      const matchesSearch = (order.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                            (order.id?.toString() || "").includes(searchTerm);
      
      // ৩. টাইপ ফিল্টার (Dine-In, Pickup, Delivery)
      const matchesType = filterType === "All" || order.order_type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [searchTerm, orders, filterType]);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cooking': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'on_the_way': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6 font-sans">
      <Toaster />
      
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{restaurantName}</h2>
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Live Online Panel</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              className="bg-gray-800 border-none text-white p-2.5 rounded-lg text-sm flex-1 outline-none focus:ring-2 focus:ring-red-500" 
              placeholder="Search Online Orders..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => fetchOrders(true)} className="p-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filtering Tabs (Offline বাদ দেওয়া হয়েছে) */}
        <div className="bg-white border-b p-2 flex flex-wrap gap-2 justify-center md:justify-start">
          {["All", "Dine-In", "Pickup", "Delivery"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all border-2 ${
                filterType === type 
                ? "bg-red-600 border-red-600 text-white shadow-lg" 
                : "bg-white border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-blue-50/20 transition-all">
                  <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{order.customer_name}</div>
                    <div className="text-[11px] text-gray-500">{order.customer_phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase">
                      {order.order_type === 'Delivery' ? <Truck size={14} className="text-orange-500"/> : 
                       order.order_type === 'Pickup' ? <ShoppingBag size={14} className="text-blue-500"/> : 
                       <Utensils size={14} className="text-purple-500"/>}
                      {order.order_type}
                    </div>
                    {order.table_id && <span className="text-[10px] text-gray-400 font-bold">Ref: {order.table_id}</span>}
                  </td>
                  <td className="p-4 font-black text-gray-900">৳{order.total_amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black uppercase ${getStatusStyle(order.order_status)}`}>
                      {order.order_status || 'Pending'}
                    </span>
                    <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{order.payment_method}</div>
                  </td>

                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleViewDetails(order)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-white transition-all"><Eye size={17}/></button>
                    <button onClick={() => handleUpdateStatus(order.id, order.order_status)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={17}/></button>
                    <button onClick={() => handleViewDetails(order, true)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Printer size={17}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && !loading && (
            <div className="p-20 text-center">
              <div className="flex justify-center mb-4"><Filter size={40} className="text-gray-200" /></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Online Orders Found</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Hidden Print Template --- */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef} className="p-6 text-black bg-white w-[80mm] font-sans">
          <div className="text-center border-b-2 border-dashed pb-3 mb-3">
            <h2 className="text-xl font-bold uppercase m-0">{restaurantName}</h2>
            <p className="text-[10px] font-bold m-0 uppercase tracking-widest">Order Receipt</p>
          </div>
          <div className="text-[11px] mb-3 space-y-1">
            <div className="flex justify-between"><span>Inv: <strong>#{selectedOrder?.id}</strong></span> <span>{new Date().toLocaleDateString()}</span></div>
            <div>Customer: <strong>{selectedOrder?.customer_name}</strong></div>
            <div>Type: <strong>{selectedOrder?.order_type}</strong> {selectedOrder?.table_id && `(${selectedOrder.table_id})`}</div>
          </div>
          <table className="w-full text-[11px] mb-3 border-collapse">
            <thead>
              <tr className="border-y border-black text-left font-bold">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-1">{item.product_name}</td>
                  <td className="py-1 text-center">x{item.quantity}</td>
                  <td className="py-1 text-right">৳{item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[12px] space-y-1 border-t border-black pt-2 font-bold">
            <div className="flex justify-between"><span>Grand Total:</span><span>৳{selectedOrder?.total_amount}</span></div>
          </div>
          <div className="mt-6 text-center border-t border-dashed pt-2">
            <p className="text-[10px] italic font-bold uppercase">Powered by FoodMenu BD</p>
          </div>
        </div>
      </div>

      {/* --- Details Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="font-black text-lg uppercase">Invoice #{selectedOrder?.id}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl text-sm border border-gray-100">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Customer</label>
                  <p className="font-bold text-gray-800">{selectedOrder?.customer_name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder?.customer_phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                  <p className="font-black text-blue-600 uppercase">{selectedOrder?.order_type}</p>
                  <p className="text-xs text-gray-500">{selectedOrder?.table_id || 'N/A'}</p>
                </div>
              </div>

              <div className="max-h-[200px] overflow-y-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b text-[11px] text-gray-400 uppercase">
                    <tr>
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-3 font-semibold text-gray-700">{item.product_name}</td>
                        <td className="py-3 text-center text-gray-500">{item.quantity}</td>
                        <td className="py-3 text-right font-bold">৳{item.total_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center font-black text-lg border border-blue-100">
                <span className="text-gray-600 text-sm uppercase">Total:</span>
                <span className="text-blue-600">৳{selectedOrder?.total_amount}</span>
              </div>

              <div className="flex gap-2 mt-6">
                 <button 
                  onClick={() => { setIsModalOpen(false); handleUpdateStatus(selectedOrder.id, selectedOrder.order_status); }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all uppercase text-xs"
                >
                  Update Status
                </button>
                <button onClick={handlePrint} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                  <Printer size={18}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;