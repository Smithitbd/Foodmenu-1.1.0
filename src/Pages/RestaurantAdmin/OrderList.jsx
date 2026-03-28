import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Edit, Eye, Printer, RefreshCcw, X, Globe, Monitor, CheckCircle, Clock, Calendar, LayoutGrid } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast'; 
import axios from 'axios'; 
import { useReactToPrint } from 'react-to-print';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("All"); 

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef(null);

  const restaurantId = localStorage.getItem('resId');
  const restaurantName = localStorage.getItem('resName') || "Restaurant Admin";

  const fetchOrders = async (showLoading = true) => {
    if (!restaurantId) return;
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${restaurantId}`);
      setOrders(response.data);
    } catch (error) { 
      console.error("Fetch error");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(false), 15000); 
    return () => clearInterval(interval);
  }, [restaurantId]);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handleUpdateFullStatus = async (order) => {
    const { value: formValues } = await Swal.fire({
      title: 'Update Order #' + order.id,
      html:
        `<div style="text-align: left; font-size: 14px;">` +
        `<label>Order Status</label>` +
        `<select id="swal-order-status" class="swal2-input">
          <option value="pending" ${order.order_status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.order_status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="delivered" ${order.order_status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.order_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>` +
        `<label>Due Amount (Current: ৳${order.due_amount})</label>` +
        `<input id="swal-due" type="number" class="swal2-input" placeholder="Enter 0 if fully paid" value="${order.due_amount}">` +
        `<label>Reference / Note</label>` +
        `<input id="swal-ref" type="text" class="swal2-input" value="${order.reference || ''}">` +
        `</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update & Save',
      preConfirm: () => {
        return {
          order_status: document.getElementById('swal-order-status').value,
          due_amount: document.getElementById('swal-due').value,
          reference: document.getElementById('swal-ref').value,
          payment_date: document.getElementById('swal-due').value === "0" ? new Date().toISOString() : order.payment_date 
        }
      }
    });

    if (formValues) {
      try {
        await axios.put(`http://localhost:5000/api/orders/full-update/${order.id}`, formValues);
        fetchOrders(false);
        toast.success("Order & Payment Updated!");
      } catch (err) { toast.error("Update failed!"); }
    }
  };

  const handleViewDetails = async (order, autoPrint = false) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/order-details/${order.id}`);
      setOrderDetails(response.data.items || []);
      setSelectedOrder(response.data.info || order); 
      if (autoPrint) {
        setTimeout(() => handlePrint(), 300);
      } else {
        setIsModalOpen(true);
      }
    } catch (err) { toast.error("Error loading details"); }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = (order.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (order.id?.toString() || "").includes(searchTerm);
      if (filterMode === "All") return matchesSearch;
      if (filterMode === "Offline") return matchesSearch && (order.order_type === 'Offline' || !['Delivery', 'Pickup', 'Dine-In'].includes(order.order_type));
      return matchesSearch && order.order_type === filterMode;
    });
  }, [searchTerm, orders, filterMode]);

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{restaurantName}</h2>
            <p className="text-red-400 text-xs font-bold uppercase flex items-center gap-1">
               <span className="animate-pulse h-2 w-2 rounded-full bg-red-500"></span> Live Order Monitor
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              className="bg-gray-800 border-none text-white p-2.5 rounded-lg text-sm flex-1 outline-none focus:ring-2 focus:ring-red-500" 
              placeholder="Search Invoice or Name..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => fetchOrders(true)} className="p-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Dynamic Filters */}
        <div className="p-3 bg-white border-b flex flex-wrap gap-2">
          {["All", "Dine-In", "Delivery", "Pickup", "Offline"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all border ${
                filterMode === mode ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Inv / Source</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const isOnline = ['Delivery', 'Pickup', 'Dine-In'].includes(order.order_type);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">#{order.id}</div>
                      <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${isOnline ? 'text-blue-500' : 'text-orange-500'}`}>
                        {isOnline ? <Globe size={10}/> : <Monitor size={10}/>}
                        {order.order_type || "Offline"}
                      </div>
                      {/* Table Number Badge for Offline Orders */}
                      {order.order_type === 'Offline' && order.table_id && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded w-fit border border-red-100">
                          <LayoutGrid size={10}/> {order.table_id}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{order.customer_name}</div>
                      <div className="text-[11px] text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-gray-900">৳{order.total_amount}</div>
                      {order.due_amount > 0 ? (
                        <div className="mt-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 uppercase">Due: ৳{order.due_amount}</span>
                          <div className="text-[9px] text-gray-400 mt-1 italic leading-tight">Ref: {order.reference || 'No Ref'}</div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-600 uppercase">Fully Paid</span>
                          {order.payment_date && (
                             <div className="text-[8px] text-gray-400 mt-1 flex items-center gap-1">
                               <Calendar size={10}/> {new Date(order.payment_date).toLocaleDateString()}
                             </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${order.order_status === 'delivered' ? 'text-green-600' : 'text-amber-500'}`}>
                        {order.order_status === 'delivered' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                        {order.order_status || 'Pending'}
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">{order.payment_method}</div>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button title="View" onClick={() => handleViewDetails(order)} className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-all"><Eye size={16}/></button>
                      <button title="Update Status/Payment" onClick={() => handleUpdateFullStatus(order)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16}/></button>
                      <button title="Print" onClick={() => handleViewDetails(order, true)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Printer size={16}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No orders found</div>}
        </div>
      </div>

      {/* --- Print Template (POS Style) --- */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="p-6 text-black bg-white w-[80mm] font-sans">
          <div className="text-center border-b-2 border-black pb-2 mb-4 uppercase">
            <h2 className="text-xl font-bold">{restaurantName}</h2>
            <p className="text-[10px]">Invoice #{selectedOrder?.id}</p>
          </div>
          <div className="text-[11px] mb-4 space-y-1">
            <p><strong>Customer:</strong> {selectedOrder?.customer_name}</p>
            <p><strong>Order Type:</strong> {selectedOrder?.order_type}</p>
            {/* Print Table ID if exists */}
            {selectedOrder?.table_id && <p className="text-[12px] font-black uppercase"><strong>Table:</strong> {selectedOrder?.table_id}</p>}
            <p><strong>Date:</strong> {new Date(selectedOrder?.created_at).toLocaleString()}</p>
          </div>
          <table className="w-full text-[11px] mb-4 border-t border-black">
            <thead>
              <tr className="text-left border-b border-black">
                <th className="py-1">Item</th>
                <th className="py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1">{item.product_name} x{item.quantity}</td>
                  <td className="py-1 text-right">৳{item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-[12px] font-bold space-y-1">
            <p className="flex justify-between"><span>Subtotal:</span> <span>৳{selectedOrder?.subtotal}</span></p>
            {selectedOrder?.discount > 0 && <p className="flex justify-between"><span>Discount:</span> <span>-৳{selectedOrder?.discount}</span></p>}
            <p className="flex justify-between border-t border-black pt-1"><span>Total:</span> <span>৳{selectedOrder?.total_amount}</span></p>
            {selectedOrder?.due_amount > 0 ? (
               <p className="flex justify-between text-red-600"><span>Due:</span> <span>৳{selectedOrder?.due_amount}</span></p>
            ) : (
               <p className="text-center bg-black text-white py-0.5 mt-2">PAID</p>
            )}
          </div>
          <div className="mt-6 text-center text-[9px] border-t border-dashed pt-2 uppercase">
            Thank you for dining with us!
          </div>
        </div>
      </div>

      {/* --- Details Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">Order #{selectedOrder?.id}</h3>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest">{selectedOrder?.order_type}</p>
                   {selectedOrder?.table_id && (
                      <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-black uppercase text-white">{selectedOrder?.table_id}</span>
                   )}
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Customer</p>
                  <p className="font-bold text-gray-800">{selectedOrder?.customer_name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder?.customer_phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border-l-4 border-red-500">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Billing Status</p>
                  <p className={`font-black ${selectedOrder?.due_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedOrder?.due_amount > 0 ? `DUE: ৳${selectedOrder?.due_amount}` : 'PAID'}
                  </p>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto mb-6 px-2 custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white text-[10px] text-gray-400 uppercase border-b">
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
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right font-bold">৳{item.total_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center border border-blue-100">
                <span className="font-bold text-gray-600">Grand Total:</span>
                <span className="font-black text-2xl text-blue-700">৳{selectedOrder?.total_amount}</span>
              </div>

              <button 
                onClick={() => { setIsModalOpen(false); setTimeout(() => handlePrint(), 300); }}
                className="w-full mt-4 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <Printer size={18}/> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;