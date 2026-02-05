import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, MapPin, DollarSign, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const DeliveryArea = () => {
  // State Management 
  const [areas, setAreas] = useState([]); // For Store all Data
  const [loading, setLoading] = useState(false); // Button Loading state
  const [editId, setEditId] = useState(null); // for teack which id is edit 
  const [formData, setFormData] = useState({ areaName: '', deliveryCharge: '' }); 
  
  // Table control State
  const [searchTerm, setSearchTerm] = useState(''); 
  const [entriesCount, setEntriesCount] = useState(10); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [sortOrder, setSortOrder] = useState('none'); // Sorting order (Asc/Dec)

  // Fetching Data from database 
  const fetchAreas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/delivery-areas');
      setAreas(response.data);
    } catch (error) {
      setAreas([
        { _id: '1', areaName: 'Baghbari', deliveryCharge: 80 },
        { _id: '2', areaName: 'Bondor Bazar', deliveryCharge: 65 },
        { _id: '3', areaName: 'Chandi Ghat', deliveryCharge: 70 },
        { _id: '4', areaName: 'Daripara', deliveryCharge: 30 },
        { _id: '5', areaName: 'Hawapara', deliveryCharge: 60 },
        { _id: '6', areaName: 'Kastoghar Rd', deliveryCharge: 70 },
        { _id: '7', areaName: 'Kazir Bazar Bridge', deliveryCharge: 70 },
        { _id: '8', areaName: 'Kazirkhola', deliveryCharge: 90 },
      ]);
    }
  };

  // fetching data when component are load
  useEffect(() => { fetchAreas(); }, []);

  //Data save and update logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.areaName || !formData.deliveryCharge) {
      return Swal.fire('Error', 'Please fill all fields!', 'error');
    }
    try {
      setLoading(true);
      if (editId) {
        // Call update API
        await axios.put(`http://localhost:5000/api/delivery-areas/${editId}`, formData);
        Swal.fire({ icon: 'success', title: 'Updated!', showConfirmButton: false, timer: 1500 });
      } else {
        // new save data call API
        await axios.post('http://localhost:5000/api/delivery-areas', formData);
        Swal.fire({ icon: 'success', title: 'Saved!', showConfirmButton: false, timer: 1500 });
      }
      setFormData({ areaName: '', deliveryCharge: '' });
      setEditId(null);
      fetchAreas();
    } catch (error) {
      Swal.fire('Error', 'Action failed!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // confirmation message before Edit
  const handleEditClick = (area) => {
    Swal.fire({
      title: 'Edit Area?',
      text: `Do you want to edit ${area.areaName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, Edit'
    }).then((result) => {
      if (result.isConfirmed) {
        // state update when confirm
        setEditId(area._id);
        setFormData({ areaName: area.areaName, deliveryCharge: area.deliveryCharge });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  // Data Delete logic
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/delivery-areas/${id}`);
          fetchAreas();
          Swal.fire('Deleted!', 'Area has been deleted.', 'success');
        } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
      }
    });
  };

  // Search and sorting logic
  const processedData = useMemo(() => {
    let filtered = areas.filter(item => 
      item.areaName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortOrder === 'asc') filtered.sort((a, b) => a.deliveryCharge - b.deliveryCharge);
    else if (sortOrder === 'desc') filtered.sort((a, b) => b.deliveryCharge - a.deliveryCharge);
    return filtered;
  }, [areas, searchTerm, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(processedData.length / entriesCount);
  const currentTableData = processedData.slice((currentPage - 1) * entriesCount, currentPage * entriesCount);

  return (
    <div className="bg-[#F3F4F6] min-h-screen font-sans antialiased text-slate-900">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="text-red-500" size={22} /> Delivery Area Management
          </h2>
          <span className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">Restaurant Panel</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Area add card */}
          <div className="w-full lg:w-[350px]">
            <div className="bg-white rounded-2xl shadow-xl border border-white p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-3 uppercase tracking-tight">
                {editId ? 'Edit Area' : 'Add New Area'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Area Name</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      type="text" 
                      value={formData.areaName}
                      onChange={(e) => setFormData({...formData, areaName: e.target.value})}
                      placeholder="e.g. Bondor Bazar" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Delivery Charge</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      value={formData.deliveryCharge}
                      onChange={(e) => setFormData({...formData, deliveryCharge: e.target.value})}
                      placeholder="0.00" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${editId ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-red-400 hover:bg-red-600 text-white shadow-orange-200'}`}
                >
                  {loading ? 'Processing...' : (editId ? 'Update Area' : 'Save Area')}
                </button>
                {editId && (
                  <button type="button" onClick={() => {setEditId(null); setFormData({areaName: '', deliveryCharge: ''})}} className="w-full text-xs font-bold text-slate-500 uppercase hover:text-slate-700 underline decoration-slate-300">Cancel Edit</button>
                )}
              </form>
            </div>
          </div>

          
          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <span>Show</span>
                <select 
                  value={entriesCount} 
                  onChange={(e) => setEntriesCount(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {[5, 10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select> 
                <span>entries</span>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search areas..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Main Table Design */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-100">
                    <th className="py-4 px-6 text-left w-16">#</th>
                    <th className="py-4 px-6 text-left">Area Name</th>
                    <th className="py-4 px-6 text-left">
                      <button 
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase"
                      >
                        Charge <ArrowUpDown size={14} className={sortOrder !== 'none' ? 'text-blue-500' : 'text-slate-300'} />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentTableData.length > 0 ? currentTableData.map((area, index) => (
                    <tr key={area._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-6 text-slate-400 font-medium text-xs">
                        {String((currentPage - 1) * entriesCount + index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{area.areaName}</td>
                      <td className="py-4 px-6">
                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-sm font-bold border border-green-100">
                          ৳ {area.deliveryCharge}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => handleEditClick(area)} // Edit button logic
                            className="bg-white border border-slate-200 text-slate-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(area._id)} // Delete button logic
                            className="bg-white border border-slate-200 text-slate-600 p-2 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-slate-400 italic">No areas found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* pagination Navigation logic */}
            <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                Showing {processedData.length > 0 ? (currentPage - 1) * entriesCount + 1 : 0} to {Math.min(currentPage * entriesCount, processedData.length)} of {processedData.length} entries
              </p>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryArea;