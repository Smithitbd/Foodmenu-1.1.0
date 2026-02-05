import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const Cart = () => {
  // Sample data
  const initialData = Array.from({ length: 20 }, (_, i) => ({
    _id: `${i + 1}`,
    customerName: i % 2 === 0 ? `Sajib Chowdhury` : `Anika Rahman`,
    address: i % 2 === 0 ? 'Rashid Building, BondorBazer, Sylhet.' : 'Nayasharak, Sylhet, Bangladesh',
    deliveryCharge: 50,
    mobile: `0176456${1000 + i}`,
    paymentType: i % 3 === 0 ? 'Cash on Delivery' : 'Nagad',
    items: `ছানার সন্দেশ 1 Pcs - ${ (i % 3) + 1 } x BDT 35`,
    date: '0000-00-00',
    time: '12:00 AM',
    total: 135 + (i * 10),
    guest: i % 5 === 0 ? 'Null' : ''
  }));

  const [cartData, setCartData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesCount, setEntriesCount] = useState(10);
  const [sortOrder, setSortOrder] = useState('none');
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Sort Logic
  const filteredData = useMemo(() => {
    let data = cartData.filter(item => 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm) ||
      item.items.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === 'asc') data.sort((a, b) => a.total - b.total);
    else if (sortOrder === 'desc') data.sort((a, b) => b.total - a.total);

    return data;
  }, [cartData, searchTerm, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / entriesCount);
  const startIndex = (currentPage - 1) * entriesCount;
  const currentTableData = filteredData.slice(startIndex, startIndex + entriesCount);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, entriesCount]);

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'none' || prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E66767',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCartData(prev => prev.filter(item => item._id !== id));
        Swal.fire('Deleted!', '', 'success');
      }
    });
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Page Header - Exact Match */}
      <div className="border-b border-red-500 bg-[#F5F5F5] mb-0">
        <h2 className="text-[20px] font-normal text-gray-700 py-3 px-4">Cart Details</h2>
      </div>

      <div className="p-4">
        {/* Container with Table Border Style */}
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          
          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-[14px] text-gray-700">
              Show 
              <select 
                value={entriesCount} 
                onChange={(e) => setEntriesCount(Number(e.target.value))}
                className="mx-2 border border-gray-300 rounded p-1 outline-none text-sm"
              >
                {[5, 10, 15, 20].map(val => <option key={val} value={val}>{val}</option>)}
              </select> 
              entries
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-700">Search:</span>
              <input 
                type="text" 
                className="border border-gray-300 rounded p-1 text-sm outline-none focus:border-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table - Restored to Original Design */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-white text-[13px] font-bold text-gray-700">
                  <th className="border border-gray-200 p-3 text-center w-12">ID</th>
                  <th className="border border-gray-200 p-3 text-left">CustomerName</th>
                  <th className="border border-gray-200 p-3 text-left">Address</th>
                  <th className="border border-gray-200 p-3 text-center">Delivery Charge</th>
                  <th className="border border-gray-200 p-3 text-center">Mobile</th>
                  <th className="border border-gray-200 p-3 text-center">Payment Type</th>
                  <th className="border border-gray-200 p-3 text-left w-44">Item Nmae & with qunatity</th>
                  <th className="border border-gray-200 p-3 text-center">Date</th>
                  <th className="border border-gray-200 p-3 text-center">Time</th>
                  <th 
                    className="border border-gray-200 p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Total <ArrowUpDown size={12} className={sortOrder !== 'none' ? 'text-red-500' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th className="border border-gray-200 p-3 text-center">Guest</th>
                  <th className="border border-gray-200 p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-600">
                {currentTableData.map((order, idx) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 p-3 text-center">{startIndex + idx + 1}</td>
                    <td className="border border-gray-200 p-3 text-center">{order.customerName}</td>
                    <td className="border border-gray-200 p-3 text-center text-[12px]">{order.address || 'N/A'}</td>
                    <td className="border border-gray-200 p-3 text-center">{order.deliveryCharge}</td>
                    <td className="border border-gray-200 p-3 text-center">{order.mobile}</td>
                    <td className="border border-gray-200 p-3 text-center">{order.paymentType}</td>
                    <td className="border border-gray-200 p-3 text-center italic">{order.items}</td>
                    <td className="border border-gray-200 p-3 text-center">{order.date}</td>
                    <td className="border border-gray-200 p-3 text-center">{order.time}</td>
                    <td className="border border-gray-200 p-3 text-center font-semibold">{order.total}</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-400">{order.guest || 'Null'}</td>
                    <td className="border border-gray-200 p-3 text-center">
                      <button 
                        onClick={() => handleDelete(order._id)}
                        className="bg-[#E66767] text-white p-2 rounded shadow-sm hover:scale-110 transition-transform mx-auto block"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[13px] text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + entriesCount, filteredData.length)} of {filteredData.length} entries
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border border-gray-300 text-sm ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Previous
              </button>

              {[Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 border-t border-b border-r border-gray-300 text-sm transition-colors ${currentPage === i + 1 ? 'bg-[#F5F5F5] text-gray-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border-t border-b border-r border-gray-300 text-sm rounded-r ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;