import React, { useState, useEffect } from 'react';
import { 
  Edit2, Trash2, Search, Loader2, ChevronLeft, 
  ChevronRight, ArrowUpDown, Plus, ListOrdered 
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

// Backend API (when database will be ready)
//const API_BASE_URL = 'http://localhost:5000/api/categories';

const MenuCategory = () => {
  const [categories, setCategories] = useState([
    { _id: '1', name: 'Burger' },
    { _id: '2', name: 'Pizza' },
    { _id: '3', name: 'Platter' },
    { _id: '4', name: 'Drinks' },
    { _id: '5', name: 'Desserts' },
    { _id: '6', name: 'Sandwich' },
    { _id: '7', name: 'Pasta' },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5); 
  const [sortOrder, setSortOrder] = useState('asc');

  // data fetch function ( when API ready)
  const fetchCategories = async () => {
    try {
      // const res = await axios.get(API_BASE_URL);
      // setCategories(res.data);
      console.log("Fetching categories...");
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // save or update function
  const handleSave = async () => {
    if (!inputVal.trim()) {
      return Swal.fire('Error', 'Category name is required!', 'error');
    }

    setLoading(true);
    try {
      if (editId) {
        // API Update: await axios.put(`${API_BASE_URL}/${editId}`, { name: inputVal });
        setCategories(categories.map(cat => cat._id === editId ? { ...cat, name: inputVal } : cat));
        Swal.fire({ title: 'Updated!', text: 'Category name changed.', icon: 'success', confirmButtonColor: '#ef4444' });
        setEditId(null);
      } else {
        // API Post: const res = await axios.post(API_BASE_URL, { name: inputVal });
        const newCat = { _id: Date.now().toString(), name: inputVal };
        setCategories([...categories, newCat]);
        Swal.fire({ title: 'Success!', text: 'New category added.', icon: 'success', confirmButtonColor: '#ef4444' });
      }
      setInputVal("");
    } catch (err) {
      Swal.fire('Error', 'Action failed!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Function
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Items under this category might be affected!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCategories(categories.filter(cat => cat._id !== id));
        Swal.fire('Deleted!', 'Category removed.', 'success');
      }
    });
  };

  // Edit with SweetAlert
  const startEdit = (cat) => {
    Swal.fire({
      title: 'Edit Category?',
      text: `Modify the name of "${cat.name}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Edit'
    }).then((result) => {
      if (result.isConfirmed) {
        setInputVal(cat.name);
        setEditId(cat._id);
      }
    });
  };

  // Sorting Logic (Active)
  const toggleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setCategories([...categories].sort((a, b) => 
      newOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    ));
  };

  // Search & Pagination Active Logic
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const currentItems = filteredCategories.slice(
    (currentPage - 1) * entriesPerPage, 
    currentPage * entriesPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
          <ListOrdered size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Menu Category</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organize your restaurant menu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: ADD FORM --- */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Plus size={14} className="text-red-500"/> {editId ? 'Update Existing' : 'Create New'}
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 mb-2 block">Category Title</label>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. Traditional Pitha"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500/10 transition-all"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : (editId ? 'Apply Changes' : 'Save Category')}
              </button>

              {editId && (
                <button 
                  onClick={() => {setEditId(null); setInputVal("");}}
                  className="w-full text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: DATA TABLE --- */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Controls */}
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase">Show</span>
              <select 
                value={entriesPerPage}
                onChange={(e) => {setEntriesPerPage(Number(e.target.value)); setCurrentPage(1);}}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-red-500/10"
              >
                {[5, 10, 15, 20, 25].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                placeholder="Search categories..."
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/10"
              />
            </div>
          </div>

          {/* Table Data */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th 
                    className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-red-500"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-2">Name <ArrowUpDown size={12}/></div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 text-xs font-black text-slate-300">
                      {((currentPage - 1) * entriesPerPage + idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-700 uppercase italic">{cat.name}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => startEdit(cat)}
                          className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {currentItems.length} of {filteredCategories.length} Categories
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2.5 rounded-xl bg-white border border-gray-100 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18}/>
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-400 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2.5 rounded-xl bg-white border border-gray-100 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCategory;