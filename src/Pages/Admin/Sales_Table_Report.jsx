import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Search, Calendar, Filter, Printer, Download, ReceiptText, Banknote } from 'lucide-react';

const TableReport = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const reportRef = useRef(); // essential for pdf download

  // print and sweet alert function 
  const handlePrint = () => {
    Swal.fire({
      title: 'Do you Want To Print?',
      text: "Are you sure you want to print the current report?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00c3da',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Print',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        window.print();
      }
    });
  };

  // pdf download function
  const handleDownloadPDF = async () => {
  const element = reportRef.current; 
  
  if (!element) {
    Swal.fire("Error", "Table data not found!", "error");
    return;
  }

  try {
    Swal.fire({
      title: 'Processing...',
      text: 'Your file is being created, please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true, 
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Table_Report_${new Date().getTime()}.pdf`);

    Swal.close(); // close the loading
    Swal.fire('Success', 'PDF Download Successful!', 'success');
    
  } catch (error) {
    console.error("PDF Error:", error);
    Swal.fire('Error', 'There was a problem creating the PDF!', 'error');
  }
};

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section with PDF Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-700">Table Report</h2>
          <button 
            onClick={handleDownloadPDF} 
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-md font-semibold"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>

        {/* Filters Area */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">From Date</label>
            <input type="date" className="w-full border rounded-lg p-2 bg-gray-50 outline-none" onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">To Date</label>
            <input type="date" className="w-full border rounded-lg p-2 bg-gray-50 outline-none" onChange={(e) => setToDate(e.target.value)} />
          </div>
          <button className="bg-emerald-500 text-white py-2 rounded-lg font-bold hover:bg-emerald-600 transition">
            FILTER BY DATE
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search Table item" className="w-full pl-10 pr-4 py-2 border-2 border-emerald-500 rounded-full outline-none focus:border-emerald-600" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 border-l-4 border-cyan-400">
            <div className="bg-cyan-500 p-4 rounded-lg text-white"><ReceiptText size={32} /></div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">Total Service</p>
              <h3 className="text-3xl font-black">0</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 border-l-4 border-emerald-400">
            <div className="bg-emerald-500 p-4 rounded-lg text-white font-bold text-3xl px-5">৳</div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">Sub Total</p>
              <h3 className="text-3xl font-black">0.00</h3>
            </div>
          </div>
        </div>

        {/* Table Area (Reference for PDF) */}
        <div ref={reportRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-white border-b text-emerald-600 font-bold text-xl">
            From: {fromDate || "..."} To: {toDate || "..."}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-800 text-xs font-black uppercase border-b">
                <tr>
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Due</th>
                  <th className="p-4">OrderDate</th>
                  <th className="p-4 text-center">Payment Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr className="text-center">
                  <td colSpan="9" className="p-10 text-gray-300 italic">No data available in table</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Print Button at Bottom */}
          <div className="p-8 flex justify-center">
            <button 
              onClick={handlePrint} 
              className="bg-cyan-500 text-white px-10 py-2.5 rounded-lg font-bold hover:bg-cyan-600 transition shadow-lg shadow-cyan-100 uppercase"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableReport;