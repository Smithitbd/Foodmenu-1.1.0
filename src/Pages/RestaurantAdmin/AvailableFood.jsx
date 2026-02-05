import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
// import axios from 'axios'; 

const AvailableFood = () => {
  const [foods, setFoods] = useState([
    { id: 1, name: 'ছানার সন্দেশ 1 Pcs', quantity: '1', price: 35, status: true },
    { id: 2, name: 'ক্ষীরের সন্দেশ 1 Pcs', quantity: '1', price: 23, status: true },
    { id: 3, name: 'নারিকেল নাড়ু 1 Pcs', quantity: '1', price: 23, status: true },
    { id: 4, name: 'নারিকেল সন্দেশ 1 Pcs', quantity: '1', price: 30, status: true },
    { id: 5, name: 'চকলেট নারিকেলের সন্দেশ 1 Pcs', quantity: '1', price: 35, status: true },
    { id: 6, name: 'ক্ষীরের পেড়া 1 Pcs', quantity: '1', price: 15, status: true },
    { id: 7, name: 'ক্ষীরসা 1kg', quantity: '1', price: 700, status: true },
    { id: 8, name: 'বকুলফুল পিঠা 1 Pcs', quantity: '1', price: 20, status: true },
    { id: 9, name: 'Burger 1 Pcs', quantity: '1', price: 15, status: true },
    { id: 10, name: 'Pizza', quantity: '1', price: 700, status: true },
    { id: 11, name: 'Sand-Witch', quantity: '1', price: 20, status: true },
    { id: 12, name: 'Somucha', quantity: '1', price: 15, status: true },
    { id: 13, name: 'Shingara', quantity: '1', price: 700, status: true },
    { id: 14, name: 'Piyaju', quantity: '1', price: 5, status: true },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // logic checking for all item available or not
  const isAllAvailable = useMemo(() => foods.every(food => food.status === true), [foods]);

  // Toast configuration for SweetAlert
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom',
    showConfirmButton: false,
    timer: 1200,
    timerProgressBar: true,
    customClass: {
      popup: 'mb-20' 
    }
  });

  // All Available/Unavailable Toggle Logic
  const handleToggleAllStatus = async () => {
    const newStatus = !isAllAvailable;
    
    // UI Update
    const updatedFoods = foods.map(food => ({ ...food, status: newStatus }));
    setFoods(updatedFoods);

    // SweetAlert Message
    Swal.fire({
      icon: 'success',
      title: newStatus ? 'All Items Available' : 'All Items Unavailable',
      text: `Every item has been marked as ${newStatus ? 'available' : 'unavailable'}.`,
      timer: 1500,
      showConfirmButton: false,
    });

    /* --- BACKEND API CALL --- 
    try {
      await axios.put('your-api-endpoint/foods/toggle-all', { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
    }
    */
  };

  // Individual Toggle Status Logic
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    
    // UI Update
    setFoods(foods.map(food => 
      food.id === id ? { ...food, status: newStatus } : food
    ));

    // SweetAlert Individual Toast
    Toast.fire({
      icon: newStatus ? 'success' : 'warning',
      title: newStatus ? 'Marked as Available' : 'Marked as Unavailable'
    });

    /* --- BACKEND API CALL --- 
    try {
      await axios.patch(`your-api-endpoint/foods/${id}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update item status", error);
    }
    */
  };

  // Sorting Logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtering, Sorting, Searching Logic
  const processedFoods = useMemo(() => {
    let filtered = foods.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [foods, searchTerm, sortConfig]);

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = processedFoods.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(processedFoods.length / entriesPerPage);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-red-600 p-6 font-sans">
      <div className="flex justify-between items-center mb-6 border-b pb-6">
        <h2 className="text-2xl font-black text-gray-800 italic uppercase tracking-tight">
          Available Food <span className="text-red-600">List</span>
        </h2>
        
        {/* Main Dynamic button */}
        <button 
          onClick={handleToggleAllStatus}
          className={`${
            isAllAvailable 
            ? ' hover:bg-red-700 bg-[#d37d0d]' 
            : ' hover:bg-[#b0680a] bg-red-600'
          } text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2`}
        >
          {isAllAvailable ? (
            <><XCircle size={16}/> Make All Unavailable</>
          ) : (
            <><CheckCircle size={16}/> Make All Available</>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
          Show 
          <select 
            className="border-none bg-gray-50 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer text-gray-700 font-bold"
            value={entriesPerPage}
            onChange={(e) => {
               setEntriesPerPage(Number(e.target.value));
               setCurrentPage(1);
            }}
          >
            {[5, 10, 15, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          Entries
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Item name..."
            className="w-full border-none bg-gray-50 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner italic font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-3.5 text-gray-300" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-gray-50 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[#333]">
              <th onClick={() => requestSort('id')} className="p-4 cursor-pointer hover:text-red-600 transition-colors text-[10px] font-black uppercase italic tracking-widest">
                #
              </th>
              <th onClick={() => requestSort('name')} className="p-4 cursor-pointer hover:text-red-600 transition-colors text-[10px] font-black uppercase italic tracking-widest">
                Item name
              </th>
              <th onClick={() => requestSort('quantity')} className="p-4 cursor-pointer hover:text-red-600 transition-colors text-[10px] font-black uppercase italic tracking-widest">
                Quantity
              </th>
              <th onClick={() => requestSort('price')} className="p-4 cursor-pointer hover:text-red-600 transition-colors text-[10px] font-black uppercase italic tracking-widest text-center">
                Price
              </th>
              <th className="p-4 text-[10px] font-black uppercase italic tracking-widest text-center">Status Control</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? currentEntries.map((food, index) => (
              <tr key={food.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-all group">
                <td className="p-4 text-xs font-bold text-gray-300 italic">{indexOfFirstEntry + index + 1}</td>
                <td className="p-4 text-sm font-black text-gray-700 uppercase tracking-tight">{food.name}</td>
                <td className="p-4 text-xs font-bold text-gray-400">{food.quantity}</td>
                <td className="p-4 text-sm font-black text-gray-900 text-center italic">৳ {food.price}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleStatus(food.id, food.status)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[9px] font-black uppercase tracking-[0.15em] transition-all shadow-md active:scale-90 ${
                      food.status 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-100' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-100'
                    }`}
                  >
                    {food.status ? (
                      <><CheckCircle size={14} /> Available</>
                    ) : (
                      <><XCircle size={14} /> Unavailable</>
                    )}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-300 font-bold italic text-sm">No matching food items found...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
        <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">
          Showing {processedFoods.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, processedFoods.length)} of {processedFoods.length} entries
        </p>
        
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 bg-white text-gray-400 hover:text-red-600 disabled:opacity-30 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            Prev
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                  currentPage === i + 1 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-white text-gray-400 hover:text-red-600 disabled:opacity-30 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableFood;