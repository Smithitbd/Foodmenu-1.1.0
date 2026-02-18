import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Edit, Eye, Printer, RefreshCcw, X } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast'; 
import axios from 'axios'; 
import { useReactToPrint } from 'react-to-print';

const Cart = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef(null);

  const restaurantId = localStorage.getItem('resId');
  const restaurantName = localStorage.getItem('resName') || "Restaurant Admin";

  const fetchOrders = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${restaurantId}`);
      setOrders(response.data);
    } catch (error) { 
      toast.error("Database connection failed!"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [restaurantId]);

  // প্রিন্ট হ্যান্ডলার (Updated Logic)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  // স্ট্যাটাস আপডেট লজিক
  const handleUpdateStatus = async (id, currentStatus) => {
    const { value: status } = await Swal.fire({
      title: 'Update Payment Status',
      input: 'select',
      inputOptions: { 'Paid': 'Paid', 'Due': 'Due' },
      inputValue: currentStatus,
      showCancelButton: true,
    });

    if (status && status !== currentStatus) {
      try {
        await axios.put(`http://localhost:5000/api/orders/status/${id}`, { status });
        fetchOrders(); 
        toast.success(`Order #${id} is now ${status}`);
      } catch (err) { toast.error("Update failed!"); }
    }
  };

  // ডিটেইলস এবং প্রিন্ট লোড লজিক (FIXED)
  const handleViewDetails = async (order, autoPrint = false) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/order-details/${order.id}`);
      setOrderDetails(response.data.items || []);
      setSelectedOrder(response.data.info || order); 
      
      if (autoPrint) {
        // ডাটা রেন্ডার হওয়ার জন্য সামান্য সময় বিরতি
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

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      (order.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (order.id?.toString() || "").includes(searchTerm)
    );
  }, [searchTerm, orders]);

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6 font-sans">
      <Toaster />
      
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{restaurantName}</h2>
            <p className="text-red-400 text-xs font-bold uppercase">Order Management System</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              className="bg-gray-800 border-none text-white p-2.5 rounded-lg text-sm flex-1 outline-none focus:ring-2 focus:ring-red-500" 
              placeholder="Search by ID or Name..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={fetchOrders} className="p-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Status & Method</th>
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
                  <td className="p-4 font-black text-gray-900">৳{order.total_amount}</td>
                  
                  {/* Reference logic: Due thakle name, Paid thakle N/A */}
                  <td className="p-4">
                    {order.order_status === 'Due' ? (
                      <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">
                        {order.reference || "Unknown"}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>

                  {/* Status & Method logic */}
                  <td className="p-4">
                    <div className={`font-black text-[11px] uppercase ${order.order_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {order.order_status}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{order.payment_method}</div>
                  </td>

                  <td className="p-4 flex justify-center gap-2">
                    <button title="View" onClick={() => handleViewDetails(order)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-black hover:text-white transition-all"><Eye size={17}/></button>
                    <button title="Update Status" onClick={() => handleUpdateStatus(order.id, order.order_status)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={17}/></button>
                    <button title="Quick Print" onClick={() => handleViewDetails(order, true)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Printer size={17}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Print Template (Hidden but accessible to react-to-print) --- */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef} className="p-6 text-black bg-white w-[80mm] font-sans">
          <div className="text-center border-b-2 border-dashed pb-3 mb-3">
            <h2 className="text-xl font-bold uppercase m-0">{restaurantName}</h2>
            <p className="text-[10px] font-bold m-0 uppercase tracking-widest">Cash Receipt</p>
          </div>
          
          <div className="text-[11px] mb-3 space-y-1">
            <div className="flex justify-between"><span>Inv: <strong>#{selectedOrder?.id}</strong></span> <span>{new Date().toLocaleDateString()}</span></div>
            <div>Customer: <strong>{selectedOrder?.customer_name}</strong></div>
            <div>Phone: <strong>{selectedOrder?.customer_phone}</strong></div>
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

          <div className="text-[12px] space-y-1 border-t border-black pt-2">
            <div className="flex justify-between font-black">
              <span>Grand Total:</span>
              <span>৳{selectedOrder?.total_amount}</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold pt-1">
              <span>Status: {selectedOrder?.order_status}</span>
              <span>Method: {selectedOrder?.payment_method}</span>
            </div>
            {selectedOrder?.order_status === 'Due' && (
              <div className="text-[10px] font-bold text-center mt-2 border border-black p-1 dashed">
                REF: {selectedOrder?.reference}
              </div>
            )}
          </div>

          <div className="mt-6 text-center border-t border-dashed pt-2">
            <p className="text-[10px] italic font-bold">Thank you! Visit again.</p>
            <p className="text-[8px] text-gray-400 mt-1 uppercase">Powered by FoodMenu BD</p>
          </div>
        </div>
      </div>

      {/* --- Details Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">Invoice #{selectedOrder?.id}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl text-sm">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Customer</label>
                  <p className="font-bold text-gray-800">{selectedOrder?.customer_name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Payment</label>
                  <p className={`font-black uppercase ${selectedOrder?.order_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedOrder?.order_status}
                  </p>
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

              <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center font-black text-lg">
                <span className="text-gray-600 text-sm uppercase">Total Amount:</span>
                <span className="text-blue-600">৳{selectedOrder?.total_amount}</span>
              </div>

              <button 
                onClick={handlePrint}
                className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
              >
                <Printer size={18}/> Print Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;