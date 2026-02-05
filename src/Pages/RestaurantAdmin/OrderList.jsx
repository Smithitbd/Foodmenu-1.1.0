import React, { useState, useEffect, useMemo } from 'react';
import { Search, Edit, Eye, Printer, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2'; // npm install sweetalert2
import toast, { Toaster } from 'react-hot-toast'; 
// import axios from 'axios'; 

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // --- 1. Database Connection Logic (Commented Out) ---
  /*
  const API_URL = 'http://localhost:5000/api/orders';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(API_URL);
        setOrders(response.data);
      } catch (error) { 
        toast.error("Failed to load data from Database!"); 
      }
    };
    fetchOrders();
  }, []);
  */

  useEffect(() => {
    const dummyData = [
      { id: "1001", name: "Rahim Uddin", date: "2026-02-03", total: 1200, paid: 1000, due: 200, type: "CASH", sub: "Paid", mobile: "01711111111", address: "Sylhet" },
      { id: "1002", name: "Abul Kashem", date: "2026-02-03", total: 500, paid: 500, due: 0, type: "CARD", sub: "Paid", mobile: "01822222222", address: "Dhaka" },
      { id: "1003", name: "Karim Ali", date: "2026-02-04", total: 2000, paid: 1500, due: 500, type: "CASH", sub: "Due", mobile: "01933333333", address: "Chittagong" },
    ];
    setOrders(dummyData);
  }, []);

  // --- Logic Functions ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm) ||
      order.mobile.includes(searchTerm)
    );
  }, [searchTerm, orders]);

  const indexOfLastOrder = currentPage * entries;
  const indexOfFirstOrder = indexOfLastOrder - entries;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / entries);

  // --- Functions with SweetAlert2 ---

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete Order #${id}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        /* // --- BACKEND DELETE CALL ---
        try {
          await axios.delete(`${API_URL}/${id}`);
          // ... update state
        } catch (err) { Swal.fire('Error!', 'Deletion failed.', 'error'); }
        */
        const updatedOrders = orders.filter(order => order.id !== id);
        setOrders(updatedOrders);
        Swal.fire('Deleted!', 'The order has been deleted.', 'success');
      }
    });
  };

  const handleUpdate = (id) => {
    Swal.fire({
      title: 'Edit Mode',
      text: `Redirecting to edit form for Order #${id}...`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleViewDetails = (order) => {
    Swal.fire({
      title: `<strong>Order Details</strong>`,
      icon: 'info',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><b>Invoice ID:</b> #${order.id}</p>
          <p><b>Customer:</b> ${order.name}</p>
          <p><b>Mobile:</b> ${order.mobile}</p>
          <p><b>Address:</b> ${order.address}</p>
          <hr/>
          <p><b>Total Amount:</b> ৳${order.total}</p>
          <p><b>Paid Amount:</b> ৳${order.paid}</p>
          <p style="color: red;"><b>Due Amount:</b> ৳${order.due}</p>
          <p><b>Payment:</b> ${order.type}</p>
        </div>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Close',
      confirmButtonColor: '#d9534f'
    });
  };

  const handlePrint = (id) => {
    toast.success(`Generating Invoice #${id}`, { icon: '🖨️' });
    setTimeout(() => window.print(), 1000);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto bg-white rounded-md shadow-sm border-t-[3px] border-[#d9534f]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl text-gray-700 font-sans font-bold">Order List</h2>
          <button onClick={() => window.location.reload()} className="p-2 bg-gray-100 rounded hover:bg-gray-200 no-print">Refresh</button>
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Show 
            <select value={entries} onChange={(e) => { setEntries(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-1 py-1">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-bold">Search:</span>
            <div className="relative">
              <input type="text" placeholder="Name, ID, Mobile..." className="border rounded pl-2 pr-8 py-1 outline-none focus:border-red-400" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              <Search className="absolute right-2 top-1.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-4">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-left text-[13px] font-bold border-b">
                <th className="p-3 border-r">Invoice ID</th>
                <th className="p-3 border-r">Customer Name</th>
                <th className="p-3 border-r">Order Date</th>
                <th className="p-3 border-r">Total</th>
                <th className="p-3 border-r">Paid</th>
                <th className="p-3 border-r">Due</th>
                <th className="p-3 border-r">Payment</th>
                <th className="p-3 border-r">Status</th>
                <th className="p-3 border-r text-center" colSpan="4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {currentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-red-50/30">
                  <td className="p-3 border-r font-semibold">#{order.id}</td>
                  <td className="p-3 border-r font-medium">{order.name}</td>
                  <td className="p-3 border-r text-gray-500">{order.date}</td>
                  <td className="p-3 border-r font-bold">৳{order.total}</td>
                  <td className="p-3 border-r text-green-600 font-semibold">৳{order.paid}</td>
                  <td className="p-3 border-r text-red-600 font-bold">৳{order.due}</td>
                  <td className="p-3 border-r">{order.type}</td>
                  <td className="p-3 border-r">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${order.sub === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{order.sub}</span>
                  </td>
                  <td className="p-2 text-center border-l"><button onClick={() => handleUpdate(order.id)} className="p-1 text-blue-500 hover:bg-blue-100 rounded" title="Edit"><Edit size={14}/></button></td>
                  <td className="p-2 text-center"><button onClick={() => handleViewDetails(order)} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="View"><Eye size={14}/></button></td>
                  <td className="p-2 text-center"><button onClick={() => handlePrint(order.id)} className="p-1 text-emerald-500 hover:bg-emerald-100 rounded" title="Print"><Printer size={14}/></button></td>
                  <td className="p-2 text-center"><button onClick={() => handleDelete(order.id)} className="p-1 text-red-500 hover:bg-red-100 rounded" title="Delete"><Trash2 size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t">
          <p className="text-xs font-bold italic text-gray-500">Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} entries</p>
          <div className="flex border rounded overflow-hidden">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border-r disabled:text-gray-300"><ChevronLeft size={18}/></button>
            <span className="px-4 py-1 text-sm font-black bg-red-50 text-red-600">Page {currentPage} of {totalPages || 1}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 disabled:text-gray-300"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } .max-w-[1400px] { border: none; box-shadow: none; } }`}</style>
    </div>
  );
};

// --- 2. BACKEND SERVER CODE (Commented Out) ---
/*
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/pos_system', { useNewUrlParser: true, useUnifiedTopology: true });

const OrderSchema = new mongoose.Schema({
    id: String,
    name: String,
    date: String,
    total: Number,
    paid: Number,
    due: Number,
    type: String,
    sub: String,
    mobile: String,
    address: String
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

// GET API
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({createdAt: -1});
        res.json(orders);
    } catch (err) { res.status(500).send(err); }
});

// DELETE API
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findOneAndDelete({id: req.params.id});
        res.status(200).send("Order Deleted Successfully");
    } catch (err) { res.status(500).send(err); }
});

app.listen(5000, () => console.log('Backend Server running on port 5000'));
*/

export default OrderList;