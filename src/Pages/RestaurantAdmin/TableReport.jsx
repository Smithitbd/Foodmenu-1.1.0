import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Search, Printer, FileText, Hash, Calculator, Banknote, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

const TableReport = () => {
  const [reportData, setReportData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const componentRef = useRef();

  // লোকাল স্টোরেজ থেকে ডাটা নেওয়া
  const restaurantId = localStorage.getItem('resId');
  const restaurantName = localStorage.getItem('resName') || "Our Restaurant";
  const restaurantLogo = localStorage.getItem('resLogo'); // নিশ্চিত করুন লোগো URL এখানে আছে

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${restaurantName}_Sales_Report`,
  });

  const fetchReportData = async () => {
    if (!restaurantId) {
      toast.error("User not authenticated!");
      return;
    }

    try {
      setLoading(true);
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

  useEffect(() => {
    fetchReportData();
  }, []);

  const stats = useMemo(() => {
    const validOrders = reportData.filter(item => item.order_status !== 'cancelled');
    const totalInvoice = reportData.length;
    const subTotalSum = validOrders.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const netTotalSum = validOrders.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
    return { totalInvoice, subTotalSum, netTotalSum };
  }, [reportData]);

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

  return (
    <div className="bg-[#f4f7f6] min-h-screen p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto">
        
        {/* Control Panel (No Print) */}
        <div className="bg-white rounded-xl shadow-md border-b p-6 mb-6 no-print">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
             <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-lg text-white">
                    <FileText size={24} />
                </div>
                <h1 className="text-2xl font-black text-gray-800 uppercase italic">Sales <span className="text-red-600">Report Center</span></h1>
             </div>
             <button onClick={fetchReportData} className="p-2 hover:rotate-180 transition-all duration-500 text-gray-400">
                <RefreshCw size={20} />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">From Date</label>
              <input type="date" className="w-full border rounded-xl p-3 bg-gray-50 text-sm font-bold outline-none" onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">To Date</label>
              <input type="date" className="w-full border rounded-xl p-3 bg-gray-50 text-sm font-bold outline-none" onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button onClick={handleFilterByDate} className="bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg uppercase text-[11px] tracking-widest">
              Generate Report
            </button>
            <button onClick={handlePrint} className="bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg uppercase text-[11px] tracking-widest flex justify-center items-center gap-2">
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>

        {/* Print Area */}
        <div ref={componentRef} className="bg-white rounded-xl shadow-lg border-t-[5px] border-red-500 overflow-hidden p-6 print:shadow-none print:border-none print:p-0">
          
          {/* Header for Print Copy (Logo & Name) */}
          <div className="hidden print:flex flex-col items-center mb-8 border-b-2 border-gray-100 pb-6">
              {restaurantLogo ? (
                <img src={restaurantLogo} alt="Logo" className="h-20 w-auto object-contain mb-3" />
              ) : (
                <div className="bg-red-500 text-white p-3 rounded-full mb-3"><FileText size={30}/></div>
              )}
              <h1 className="text-4xl font-black uppercase text-gray-900">{restaurantName}</h1>
              <div className="mt-4 py-1 bg-gray-900 text-white px-6 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Sales Summary Report
              </div>
          </div>

          <div className="flex justify-between items-center mb-6 print:hidden">
              <h2 className="text-xl font-black text-gray-800 uppercase italic">Live <span className="text-red-600">Statistics</span></h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search ID or Name..." 
                    className="pl-10 pr-4 py-2 border rounded-full text-sm outline-none focus:ring-2 ring-red-100 w-64 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
            <StatCard icon={<Hash/>} label="Total Invoice" value={stats.totalInvoice} color="bg-cyan-500" />
            <StatCard icon={<Calculator/>} label="Gross Subtotal" value={`৳${stats.subTotalSum.toFixed(2)}`} color="bg-green-500" />
            <StatCard icon={<Banknote/>} label="Net Revenue" value={`৳${stats.netTotalSum.toFixed(2)}`} color="bg-orange-500" />
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center font-black uppercase tracking-widest text-gray-300 animate-pulse">Loading...</div>
            ) : (
              <table className="w-full text-left border-collapse print:text-[12px]">
                <thead>
                  <tr className="text-[11px] font-black text-gray-400 uppercase border-b bg-gray-50 print:bg-gray-100 print:text-black">
                    <th className="p-4">Inv ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Net Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredData.map((item, index) => (
                    <tr key={index} className={`border-b hover:bg-gray-50 transition-colors ${item.order_status === 'cancelled' ? 'bg-red-50 opacity-60 print:text-gray-400' : ''}`}>
                      <td className="p-4 font-bold text-gray-800">#{item.id}</td>
                      <td className="p-4 font-medium">
                        {item.customer_name || 'Walking Customer'}
                        {item.order_status === 'cancelled' && <span className="ml-2 text-[8px] bg-red-500 text-white px-1 rounded no-print">CANCELLED</span>}
                      </td>
                      <td className="p-4">৳{item.order_status === 'cancelled' ? '0.00' : (item.subtotal || 0)}</td>
                      <td className="p-4 text-red-500">-৳{item.order_status === 'cancelled' ? '0.00' : (item.discount || 0)}</td>
                      <td className="p-4 font-black text-gray-900">৳{item.order_status === 'cancelled' ? '0.00' : item.total_amount}</td>
                      <td className="p-4 uppercase text-[10px] font-bold">{item.order_status}</td>
                      <td className="p-4 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer for Every Printed Page */}
          <div className="hidden print:block mt-12 border-t pt-4">
              <div className="flex justify-between items-end italic text-[10px] text-gray-400">
                  <div>
                      <p className="font-bold text-gray-600">Generated by FOODMENUBD</p>
                      <p>Report Date: {new Date().toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                      <p className="border-t border-gray-300 px-8 pt-1 text-gray-600 font-bold uppercase tracking-widest">Manager Signature</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          @page { size: auto; margin: 15mm; }
        }
      `}</style>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon, label, value, color }) => (
  <div className="flex items-center border rounded-2xl overflow-hidden shadow-sm bg-white print:shadow-none print:border-gray-200">
    <div className={`${color} p-6 text-white print:bg-transparent print:text-black print:p-2`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div className="p-4">
      <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">{label}</p>
      <h2 className="text-xl font-black text-gray-800 print:text-lg">{value}</h2>
    </div>
  </div>
);

export default TableReport;