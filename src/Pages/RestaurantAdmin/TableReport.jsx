import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Search, Printer, FileText, 
  Hash, Calculator, Banknote 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
// import axios from 'axios'; 

const TableReport = () => {
  const [reportData, setReportData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Database/Backend Logic 
  /*
  const API_URL = 'http://localhost:5000/api/reports';

  const fetchReportData = async () => {
    try {
      // API for data filter by date
      const response = await axios.get(`${API_URL}?from=${fromDate}&to=${toDate}`);
      setReportData(response.data);
      toast.success("Data synced with database!");
    } catch (error) {
      toast.error("Failed to connect to backend!");
    }
  };
  */

  // Dummy Data
  useEffect(() => {
    const dummyReports = [
      { id: "2001", name: "Sabbir Ahmed", subtotal: 1500, discount: 100, total: 1400, paid: 1400, due: 0, date: "2026-02-01", type: "CASH" },
      { id: "2002", name: "Jasim Uddin", subtotal: 3000, discount: 200, total: 2800, paid: 2000, due: 800, date: "2026-02-02", type: "BKASH" },
      { id: "2003", name: "Mitu Akter", subtotal: 1200, discount: 0, total: 1200, paid: 1200, due: 0, date: "2026-02-03", type: "CARD" },
    ];
    setReportData(dummyReports);
  }, []);

  //Calculation Logic
  const stats = useMemo(() => {
    const totalInvoice = reportData.length;
    const subTotalSum = reportData.reduce((sum, item) => sum + item.subtotal, 0);
    const netTotalSum = reportData.reduce((sum, item) => sum + item.total, 0);
    return { totalInvoice, subTotalSum, netTotalSum };
  }, [reportData]);

  // Search Logic
  const filteredData = useMemo(() => {
    return reportData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.id.includes(searchTerm)
    );
  }, [searchTerm, reportData]);

  const handleFilterByDate = () => {
    if(!fromDate || !toDate) {
      Swal.fire('Incomplete!', 'Please select both dates.', 'warning');
      return;
    }
    toast.success(`Filtering reports from ${fromDate} to ${toDate}`);
    // fetchReportData(); // When backend conected remove comment 
  };

  const handlePrint = () => {
    toast.loading("Preparing report...", { duration: 1500 });
    setTimeout(() => window.print(), 1600);
  };

  return (
    <div className="bg-[#f4f7f6] min-h-screen p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto bg-white rounded-lg shadow-md border-t-[4px] border-[#d9534f]">
        
        {/* Header Section */}
        <div className="p-4 border-b flex items-center gap-2">
          <FileText className="text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-700">Table Report</h1>
        </div>

        {/* Filters Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          <div className="flex items-center gap-2 border rounded p-2 focus-within:ring-2 ring-red-100">
            <Calendar size={20} className="text-gray-400" />
            <input 
              type="date" 
              className="w-full outline-none text-sm" 
              placeholder="From Date"
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 border rounded p-2 focus-within:ring-2 ring-red-100">
            <Calendar size={20} className="text-gray-400" />
            <input 
              type="date" 
              className="w-full outline-none text-sm" 
              placeholder="To Date"
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button 
            onClick={handleFilterByDate}
            className="bg-[#28a745] text-white font-bold py-2 px-6 rounded hover:bg-green-600 transition-colors shadow-sm"
          >
            Filter By Date
          </button>
        </div>

        {/* Stats Cards Section */}
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Invoice */}
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm bg-white group hover:shadow-md transition-shadow">
            <div className="bg-[#00c0ef] p-6 text-white group-hover:bg-[#00acd6]">
              <Hash size={40} />
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Invoice</p>
              <h2 className="text-3xl font-black text-gray-800">{stats.totalInvoice}</h2>
            </div>
          </div>

          {/* Sub Total */}
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm bg-white group hover:shadow-md transition-shadow">
            <div className="bg-[#00a65a] p-6 text-white group-hover:bg-[#008d4c]">
              <Calculator size={40} />
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Sub Total</p>
              <h2 className="text-3xl font-black text-gray-800">৳{stats.subTotalSum.toFixed(2)}</h2>
            </div>
          </div>

          {/* Net Total */}
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm bg-white group hover:shadow-md transition-shadow">
            <div className="bg-[#f39c12] p-6 text-white group-hover:bg-[#e08e0b]">
              <Banknote size={40} />
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Net Total</p>
              <h2 className="text-3xl font-black text-gray-800">৳{stats.netTotalSum.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        {/* Search & Meta Section */}
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t no-print">
          <div className="text-[#28a745] font-bold text-xl italic">
            From : <span className="text-gray-400">{fromDate || "---"}</span> To: <span className="text-gray-400">{toDate || "---"}</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Tablereport item..." 
              className="border-2 border-green-500 rounded-full px-4 py-1 pl-10 w-64 md:w-80 outline-none focus:shadow-lg transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2 text-green-500" size={18} />
          </div>
        </div>

        {/* Report Table */}
        <div className="px-6 overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="text-sm font-bold text-gray-700 border-b">
                <th className="p-3">Invoice ID</th>
                <th className="p-3">CustomerName</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Total</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Due</th>
                <th className="p-3">OrderDate</th>
                <th className="p-3">Payment Type</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-gray-600">
              {filteredData.length > 0 ? filteredData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold">#{item.id}</td>
                  <td className="p-3 text-gray-900">{item.name}</td>
                  <td className="p-3">৳{item.subtotal}</td>
                  <td className="p-3 text-red-500">-৳{item.discount}</td>
                  <td className="p-3 font-bold text-gray-800">৳{item.total}</td>
                  <td className="p-3 text-green-600 font-semibold">৳{item.paid}</td>
                  <td className="p-3 text-red-600 font-bold">৳{item.due}</td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3 uppercase font-medium">{item.type}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="text-center p-10 text-gray-400 italic">No data found in report</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Print Button Section */}
        <div className="p-6 text-center no-print">
          <button 
            onClick={handlePrint}
            className="bg-[#00c0ef] text-white px-10 py-2 rounded shadow hover:bg-[#00acd6] transition-all font-bold uppercase tracking-wider flex items-center gap-2 mx-auto"
          >
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .max-w-[1400px] { box-shadow: none; border: none; width: 100%; max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

// ==========================================
// --- 2. BACKEND & DATABASE CODE (Node.js/Express) ---
// ==========================================
/*
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/pos_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Order Schema (Data will come from here)
const OrderSchema = new mongoose.Schema({
    id: String,
    name: String,
    subtotal: Number,
    discount: Number,
    total: Number,
    paid: Number,
    due: Number,
    date: String,
    type: String
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

// GET Report API with Date Range Filter
app.get('/api/reports', async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        
        // date filtering Logic
        if (from && to) {
            query.date = { 
                $gte: from, 
                $lte: to 
            };
        }

        const reports = await Order.find(query).sort({ date: -1 });
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
*/

export default TableReport;