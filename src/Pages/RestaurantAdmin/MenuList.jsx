import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Eye, Edit3, Trash2, X, ImageIcon, Calendar, Tag, Layers } from 'lucide-react';
import Swal from 'sweetalert2';

const MenuList = () => {
    const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'নাগা রোল', quantity: '1 Pcs', price: 30, date: '2023-09-20', category: 'ঝালপিঠা', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300' },
    { id: 2, name: 'আলুর ঝাল পিঠা', quantity: '1 Pcs', price: 25, date: '2023-09-19', category: 'ঝালপিঠা', image: 'https://images.unsplash.com/photo-1601050648497-355eeff9a98f?w=300' },
    { id: 3, name: 'লুচি সবজি', quantity: '1 Plate', price: 40, date: '2023-09-19', category: 'ঝালপিঠা', image: 'https://images.unsplash.com/photo-1626132646529-500637532537?w=300' },
    { id: 4, name: 'সিদ্ধ পুলি পিঠা', quantity: '1 Pcs', price: 30, date: '2023-09-19', category: 'পিঠা', image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300' },
    { id: 5, name: 'ক্ষীরের পাটিসাপটা', quantity: '1 Pcs', price: 25, date: '2023-09-19', category: 'পিঠা', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300' },
    { id: 6, name: 'নারিকেল পাটিসাপটা', quantity: '1 Pcs', price: 30, date: '2023-09-19', category: 'পিঠা', image: 'https://images.unsplash.com/photo-1621447509372-246f23fba835?w=300' },
    { id: 7, name: 'মুগ ডালের বরফি', quantity: '1 Pcs', price: 30, date: '2023-09-19', category: 'পিঠা', image: 'https://images.unsplash.com/photo-1589113110390-2646875d6911?w=300' },
    { id: 8, name: 'চিকেন বার্গার', quantity: '1 Pcs', price: 150, date: '2023-10-01', category: 'ফাস্ট ফুড', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
    { id: 9, name: 'স্পেশাল কাচ্চি বিরিয়ানি', quantity: 'Full', price: 350, date: '2023-10-05', category: 'মেইন কোর্স', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300' },
    { id: 10, name: 'চকোলেট লাভা কেক', quantity: '1 Pcs', price: 120, date: '2023-10-06', category: 'ডেজার্ট', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300' },
    { id: 11, name: 'বিফ তেহারি', quantity: 'Half', price: 180, date: '2023-10-10', category: 'মেইন কোর্স', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300' },
    { id: 12, name: 'চিকেন নাগেটস', quantity: '6 Pcs', price: 220, date: '2023-10-12', category: 'ফাস্ট ফুড', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300' },
    { id: 13, name: 'মিষ্টি দই', quantity: '1 Cup', price: 50, date: '2023-10-15', category: 'ডেজার্ট', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300' },
    { id: 14, name: 'ফালুদা', quantity: '1 Glass', price: 130, date: '2023-10-16', category: 'ডেজার্ট', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300' },
    { id: 15, name: 'চিকেন চিজ পিৎজা', quantity: '8 Inch', price: 550, date: '2023-10-20', category: 'ফাস্ট ফুড', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
    { id: 16, name: 'মসলা চা', quantity: '1 Cup', price: 20, date: '2023-10-21', category: 'ড্রিংকস', image: 'https://images.unsplash.com/photo-1544787210-22d16a444f44?w=300' },
    { id: 17, name: 'কোল্ড কফি', quantity: '1 Glass', price: 90, date: '2023-10-22', category: 'ড্রিংকস', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300' },
    { id: 18, name: 'চিকেন মোমো', quantity: '6 Pcs', price: 180, date: '2023-10-25', category: 'ফাস্ট ফুড', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=300' },
    { id: 19, name: 'ভাপা পিঠা', quantity: '1 Pcs', price: 15, date: '2023-10-28', category: 'পিঠা', image: 'https://images.unsplash.com/photo-1605065539334-1000ca4b795c?w=300' },
    { id: 20, name: 'হায়দ্রাবাদি দম বিরিয়ানি', quantity: 'Full', price: 420, date: '2023-11-01', category: 'মেইন কোর্স', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300' },
    ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  
  // Modals State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  /* --- BACKEND API CALLS (Future Use) --- */
  /*
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('your-api/menu');
        setMenuItems(res.data);
      } catch (err) { console.error(err); }
    };
    fetchMenu();
  }, []);
  */

  // --- Delete Logic ---
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1e293b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // UI Update
        setMenuItems(menuItems.filter(item => item.id !== id));
        
        /* BACKEND DELETE API
        try { await axios.delete(`your-api/menu/${id}`); } 
        catch (err) { console.error(err); }
        */

        Swal.fire('Deleted!', 'Item has been removed.', 'success');
      }
    });
  };

  // --- Sorting & Filtering Logic ---
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [menuItems, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / entriesPerPage);
  const currentEntries = processedData.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-gray-50">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">
            Menu <span className="text-red-600">List</span> Management
          </h2>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search item or category..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm font-medium shadow-inner"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-slate-300" size={18} />
          </div>
        </div>

        {/* Table Controls */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase italic">
            Show 
            <select 
              className="bg-slate-50 border-none rounded-lg px-2 py-1 outline-none cursor-pointer text-slate-700"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              {[5, 10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            Entries
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic px-4">
                <th onClick={() => requestSort('id')} className="p-4 cursor-pointer hover:text-red-600">#</th>
                <th onClick={() => requestSort('name')} className="p-4 cursor-pointer hover:text-red-600">Item Name</th>
                <th className="p-4">Quantity</th>
                <th onClick={() => requestSort('price')} className="p-4 cursor-pointer hover:text-red-600">Price</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Image</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentEntries.map((item, index) => (
                <tr key={item.id} className="group shadow-sm hover:shadow-md transition-all rounded-2xl border border-slate-50">
                  <td className="p-4 text-sm font-bold text-slate-300 italic">{(currentPage-1)*entriesPerPage + index + 1}</td>
                  <td className="p-4 text-sm font-black text-slate-700 uppercase">{item.name}</td>
                  <td className="p-4 text-xs font-bold text-slate-500">{item.quantity}</td>
                  <td className="p-4 text-sm font-black text-slate-900 italic">৳{item.price}</td>
                  <td className="p-4 text-[11px] font-bold text-slate-400 uppercase">{item.date}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <img 
                      src={item.image} 
                      alt="food" 
                      className="w-10 h-10 rounded-xl object-cover cursor-pointer hover:ring-2 ring-red-500 transition-all mx-auto"
                      onClick={() => setPreviewImage(item.image)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => {setSelectedItem(item); setIsViewOpen(true)}} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => {setSelectedItem(item); setIsEditOpen(true)}} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-black text-slate-400 uppercase italic">
            Showing {currentEntries.length} of {processedData.length} entries
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white rounded-xl text-xs font-black shadow-sm disabled:opacity-50">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg">Next</button>
          </div>
        </div>
      </div>

      {/* --- Image Preview Modal --- */}
      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 text-white bg-red-600 p-2 rounded-full"><X size={24}/></button>
            <img src={previewImage} className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl" alt="Preview"/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- View Modal --- */}
      <AnimatePresence>
        {isViewOpen && selectedItem && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl">
               <button onClick={() => setIsViewOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-600"><X/></button>
               <div className="flex flex-col items-center">
                  <img src={selectedItem.image} className="w-32 h-32 rounded-3xl object-cover mb-6 shadow-xl ring-4 ring-red-50" alt=""/>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight mb-2">{selectedItem.name}</h3>
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Tag size={12}/> Price</p>
                      <p className="text-lg font-black italic">৳{selectedItem.price}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Date</p>
                      <p className="text-xs font-black">{selectedItem.date}</p>
                    </div>
                  </div>
                  <div className="w-full mt-4 bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                    <p className="text-[10px] font-black text-red-400 uppercase flex items-center gap-1"><Layers size={12}/> Category</p>
                    <p className="text-xs font-black text-red-600 uppercase italic">{selectedItem.category}</p>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Edit Modal (Simple version for demo) --- */}
      <AnimatePresence>
        {isEditOpen && selectedItem && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
               <button onClick={() => setIsEditOpen(false)} className="absolute top-6 right-6 text-slate-400"><X/></button>
               <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">Edit Item <span className="text-red-600">#{selectedItem.id}</span></h3>
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                    <input type="text" defaultValue={selectedItem.name} className="w-full mt-1 px-5 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 ring-red-500/10"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (৳)</label>
                      <input type="number" defaultValue={selectedItem.price} className="w-full mt-1 px-5 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 ring-red-500/10"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <input type="text" defaultValue={selectedItem.category} className="w-full mt-1 px-5 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 ring-red-500/10"/>
                    </div>
                  </div>
                  <button onClick={() => setIsEditOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 shadow-xl transition-all mt-4">Update Changes</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuList;