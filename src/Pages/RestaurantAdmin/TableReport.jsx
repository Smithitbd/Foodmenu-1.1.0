import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Search, Printer, FileText, Hash, Calculator, Banknote, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import axios from 'axios'; 

const TableReport = () => {
  const [reportData, setReportData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // ১. লোকাল স্টোরেজ থেকে ওনারের ইমেইল নেওয়া
  const restaurantId = localStorage.getItem('resId');

  const fetchReportData = async () => {
    const restaurantId = localStorage.getItem('resId');
    if (!restaurantId) {
      toast.error("User not authenticated!");
      return;
    }

    try {
      setLoading(true);
      // ব্যাকএন্ডে ইমেইল এবং ডেট পাঠানো হচ্ছে
      const response = await axios.get(`http://localhost:5000/api/reports`, {
        params: {
          resId: restaurantId,
          from: fromDate,
          to: toDate
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch report data!");
    } finally {
      setLoading(false);
    }
  };

  // পেজ লোড হওয়ার সময় ডাটা নিয়ে আসা
  useEffect(() => {
    fetchReportData();
  }, []);

  // পরিসংখ্যান ক্যালকুলেশন
  const stats = useMemo(() => {
    const totalInvoice = reportData.length;
    const subTotalSum = reportData.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const netTotalSum = reportData.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
    return { totalInvoice, subTotalSum, netTotalSum };
}, [reportData]);

  // সার্চ লজিক
  const filteredData = useMemo(() => {
    return reportData.filter(item => 
      item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.id.toString().includes(searchTerm)
    );
  }, [searchTerm, reportData]);

  const handleFilterByDate = () => {
    if(!fromDate || !toDate) {
      Swal.fire('Warning', 'Select both dates to filter.', 'warning');
      return;
    }
    fetchReportData();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f4f7f6] min-h-screen p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-lg border-t-[5px] border-red-500 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg text-white">
                <FileText size={24} />
            </div>
            <h1 className="text-2xl font-black text-gray-800 uppercase italic">Restaurant <span className="text-red-600">Sales Report</span></h1>
          </div>
          <button onClick={fetchReportData} className="p-2 hover:rotate-180 transition-all duration-500 text-gray-400">
             <RefreshCw size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 no-print items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">From Date</label>
            <div className="flex items-center gap-2 border rounded-xl p-3 bg-gray-50">
              <Calendar size={18} className="text-red-500" />
              <input type="date" className="bg-transparent outline-none text-sm w-full font-bold" onChange={(e) => setFromDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">To Date</label>
            <div className="flex items-center gap-2 border rounded-xl p-3 bg-gray-50">
              <Calendar size={18} className="text-red-500" />
              <input type="date" className="bg-transparent outline-none text-sm w-full font-bold" onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <button onClick={handleFilterByDate} className="bg-gray-900 text-white font-black py-4 px-6 rounded-xl hover:bg-red-600 transition-all shadow-lg uppercase text-[11px] tracking-widest">
            Generate Report
          </button>
          <button onClick={handlePrint} className="bg-blue-600 text-white font-black py-4 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg uppercase text-[11px] tracking-widest flex justify-center items-center gap-2">
            <Printer size={16} /> Print
          </button>
        </div>

        {/* Stats Cards */}
        <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Hash/>} label="Total Invoice" value={stats.totalInvoice} color="bg-cyan-500" />
          <StatCard icon={<Calculator/>} label="Gross Subtotal" value={`৳${stats.subTotalSum.toFixed(2)}`} color="bg-green-500" />
          <StatCard icon={<Banknote/>} label="Net Revenue" value={`৳${stats.netTotalSum.toFixed(2)}`} color="bg-orange-500" />
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-gray-50 border-y flex justify-between items-center no-print">
            <p className="text-xs font-bold text-gray-400 uppercase">Showing report for: <span className="text-red-500">{restaurantId}</span></p>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search by ID or Name..." 
                    className="pl-10 pr-4 py-2 border rounded-full text-sm outline-none focus:ring-2 ring-red-100 w-64 md:w-80 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center font-black uppercase tracking-widest text-gray-300 animate-pulse">Loading Report Data...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="text-[11px] font-black text-gray-400 uppercase border-b bg-gray-50">
                  <th className="p-4">Inv ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Net Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">#{item.id}</td>
                    <td className="p-4 font-medium">{item.customer_name || 'Walking Customer'}</td>
                    <td className="p-4 text-gray-500">৳{item.subtotal || 0}</td>
                    <td className="p-4 text-red-500">-৳{item.discount || 0}</td>
                    <td className="p-4 font-black text-gray-900">৳{item.total_amount}</td>
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${Number(item.due_amount) > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {Number(item.due_amount) > 0 ? `Due: ৳${item.due_amount}` : 'Paid'}
                        </span>
                    </td>
                    {/* তারিখ ফরম্যাট করার জন্য slice ব্যবহার করা হয়েছে */}
                    <td className="p-4 text-gray-400 text-xs font-bold">{item.created_at ? item.created_at.slice(0, 10) : 'N/A'}</td>
                    <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded font-bold text-[10px] uppercase">{item.payment_method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* CSS for Print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .shadow-lg { box-shadow: none !important; border: 1px solid #eee !important; }
        }
      `}</style>
    </div>
  );
};

// স্ট্যাট কার্ড কম্পোনেন্ট
const StatCard = ({ icon, label, value, color }) => (
  <div className="flex items-center border rounded-2xl overflow-hidden shadow-sm bg-white group hover:shadow-md transition-all">
    <div className={`${color} p-6 text-white`}>
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <div className="p-4">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h2 className="text-2xl font-black text-gray-800">{value}</h2>
    </div>
  </div>
);

export default TableReport;