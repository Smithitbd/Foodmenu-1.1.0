import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, MapPin, Search, PlusCircle, XCircle, CheckCircle2, ListFilter } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const DeliveryArea = () => {
  const resId = localStorage.getItem('resId'); 
  const resName = localStorage.getItem('resName');

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ areaName: '', deliveryCharge: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesCount, setEntriesCount] = useState(10); // এক পেজে কয়টি ডাটা থাকবে
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('none');

  const fetchAreas = async () => {
    if (!resId || resId === "undefined") return;
    try {
      const response = await axios.get(`http://localhost:5000/api/delivery-areas/${resId}`);
      setAreas(response.data);
    } catch (error) {
      toast.error("Could not load delivery areas");
    }
  };

  useEffect(() => { fetchAreas(); }, [resId]);

  // যখনই সার্চ টার্ম বা এন্ট্রি কাউন্ট পাল্টাবে, পেজ ১-এ ফেরত যাবে
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.areaName || !formData.deliveryCharge) {
      return toast.error("Please fill all fields!");
    }

    const payload = {
      restaurant_id: parseInt(resId),   
      areaName: formData.areaName,
      deliveryCharge: parseFloat(formData.deliveryCharge)
    };

    try {
      setLoading(true);
      if (editId) {
        await axios.put(`http://localhost:5000/api/delivery-areas/${editId}`, payload);
        toast.success("Area info updated!");
      } else {
        await axios.post('http://localhost:5000/api/delivery-areas', payload);
        toast.success("New area added successfully!");
      }
      setFormData({ areaName: '', deliveryCharge: '' });
      setEditId(null);
      fetchAreas();
    } catch (error) {
      toast.error("Failed to save data!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F43F5E',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Delete',
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/delivery-areas/${id}`);
          fetchAreas();
          toast.success('Removed successfully');
        } catch (err) { toast.error("Delete failed"); }
      }
    });
  };

  // ডাটা ফিল্টারিং এবং সর্টিং
  const processedData = useMemo(() => {
    let filtered = areas.filter(item => 
      item.areaName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortOrder === 'asc') filtered.sort((a, b) => a.deliveryCharge - b.deliveryCharge);
    else if (sortOrder === 'desc') filtered.sort((a, b) => b.deliveryCharge - a.deliveryCharge);
    return filtered;
  }, [areas, searchTerm, sortOrder]);

  // প্যাজিনেশন লজিক
  const totalPages = Math.ceil(processedData.length / entriesCount);
  const currentTableData = processedData.slice((currentPage - 1) * entriesCount, currentPage * entriesCount);

  return (
    <div className="bg-[#F1F5F9] min-h-screen font-sans antialiased pb-20">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* --- HEADER (FIXED) --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-200">
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Delivery Zones</h2>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
                Managing: <span className="text-rose-600 font-black">{resName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* --- STICKY FORM (LEFT SIDE) --- */}
          <div className="w-full lg:w-[380px] lg:sticky lg:top-28 transition-all">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-2 rounded-lg ${editId ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                  {editId ? <Edit3 size={20} /> : <PlusCircle size={20} />}
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                  {editId ? 'Modify Zone' : 'New Zone'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Area Name</label>
                  <input 
                    type="text" 
                    value={formData.areaName}
                    onChange={(e) => setFormData({...formData, areaName: e.target.value})}
                    placeholder="e.g. UTTARA SECTOR 4" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold focus:bg-white focus:border-rose-500 transition-all outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Charge (BDT)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                    <input 
                      type="number" 
                      value={formData.deliveryCharge}
                      onChange={(e) => setFormData({...formData, deliveryCharge: e.target.value})}
                      placeholder="0.00" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold focus:bg-white focus:border-rose-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${editId ? 'bg-amber-500 shadow-amber-200' : 'bg-rose-500 shadow-rose-200'} text-white`}
                >
                  {loading ? 'Wait...' : (editId ? 'Update Info' : 'Add Zone')}
                  {!loading && <CheckCircle2 size={18} />}
                </button>
                
                {editId && (
                  <button type="button" onClick={() => {setEditId(null); setFormData({areaName: '', deliveryCharge: ''})}} className="w-full text-[11px] font-black text-slate-400 uppercase text-center hover:text-rose-500">Cancel Edit</button>
                )}
              </form>
            </div>
          </div>

          {/* --- TABLE & PAGINATION (RIGHT SIDE) --- */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-80">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="text" 
                     placeholder="Search location..."
                     className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-3.5 text-sm font-semibold focus:bg-white focus:border-rose-400 outline-none transition-all"
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                    <ListFilter size={14} className="text-slate-400" />
                    <select 
                      value={entriesCount}
                      onChange={(e) => setEntriesCount(Number(e.target.value))}
                      className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer"
                    >
                      <option value={5}>Show 5</option>
                      <option value={10}>Show 10</option>
                      <option value={20}>Show 20</option>
                      <option value={50}>Show 50</option>
                    </select>
                  </div>
                  <div className="bg-slate-900 text-white px-5 py-2 rounded-xl text-center">
                    <p className="text-[10px] font-bold uppercase opacity-60 leading-none">Total</p>
                    <p className="text-base font-black leading-none mt-1">{processedData.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[11px] font-black uppercase tracking-[2px] text-slate-400">
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Zone Name</th>
                      <th className="px-6 py-4 cursor-pointer group" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        <div className="flex items-center gap-2 group-hover:text-rose-500 transition-colors">
                          Charge <ArrowUpDown size={14} className="opacity-50" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right pr-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData.map((area, i) => (
                      <tr key={area.id} className="group bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all shadow-sm">
                        <td className="px-6 py-5 text-xs font-bold text-slate-300 rounded-l-2xl">
                          {String((currentPage-1)*entriesCount + i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-700 uppercase tracking-tight">
                          {area.areaName}
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100">
                            ৳ {area.deliveryCharge}
                          </span>
                        </td>
                        <td className="px-6 py-5 rounded-r-2xl pr-10">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => {setEditId(area.id); setFormData({areaName: area.areaName, deliveryCharge: area.deliveryCharge}); window.scrollTo({top:0, behavior:'smooth'})}} className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                            <button onClick={() => handleDelete(area.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {currentTableData.length === 0 && (
                  <div className="text-center py-20 opacity-30 flex flex-col items-center">
                    <MapPin size={48} />
                    <p className="mt-2 font-black uppercase tracking-widest">No areas found</p>
                  </div>
                )}
              </div>

              {/* --- PAGINATION CONTROLS --- */}
              <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-800">{(currentPage-1)*entriesCount + 1}</span> to <span className="text-slate-800">{Math.min(currentPage*entriesCount, processedData.length)}</span> of <span className="text-slate-800">{processedData.length}</span> entries
                </p>
                
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className={`p-2 rounded-xl border transition-all ${currentPage === 1 ? 'bg-white text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-500 hover:text-rose-500 shadow-sm'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      // বড় লিস্ট হলে সব পেজ নম্বর না দেখিয়ে শুধু কারেন্ট পেজ দেখানোর জন্য এই লজিক
                      if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                        if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-1">...</span>;
                        return null;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === pageNum ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-rose-200'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className={`p-2 rounded-xl border transition-all ${currentPage === totalPages || totalPages === 0 ? 'bg-white text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-500 hover:text-rose-500 shadow-sm'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryArea;