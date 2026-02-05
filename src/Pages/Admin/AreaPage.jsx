import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Edit3, Trash2, Search, ChevronLeft, ChevronRight, X, Upload, Save, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AreaPage = () => {
  const { areaName } = useParams();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination & Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Demo Data 
  const [restaurants, setRestaurants] = useState([
    { id: 1, customerName: "Exit", mobile: "01760-570323", entryDate: "2023-09-17", restaurantName: "Exit (Zindabazar Branch)", area: "Zindabazar", address: "Zindabazar, Sylhet", price: 700, image: "https://via.placeholder.com/40", subtotal: 650, discount: 50, paid: 650, due: 350, paymentType: "Cash", subscription: "Paid", status: "Active" },
    { id: 2, customerName: "The Swad", mobile: "01314-902661", entryDate: "2023-12-29", restaurantName: "The Swad Restaurant", area: "Zindabazar", address: "Barutkhana road, Sylhet", price: 1200, image: "https://via.placeholder.com/40", subtotal: 1000, discount: 200, paid: 1000, due: 0, paymentType: "Card", subscription: "Paid", status: "Active" },
    { id: 3, customerName: "Cafe Aarko", mobile: "01719-389009", entryDate: "2023-12-29", restaurantName: "Cafe Aarko", area: "Zindabazar", address: "Ahmed Trade Centre, Sylhet", price: 500, image: "https://via.placeholder.com/40", subtotal: 450, discount: 50, paid: 450, due: 50, paymentType: "Cash", subscription: "Paid", status: "Active" },
    { id: 4, customerName: "Abdul Aziz", mobile: "01311-796186", entryDate: "2024-01-03", restaurantName: "CineVibe Restaurant", area: "Zindabazar", address: "East Zindabazar, Sylhet", price: 900, image: "https://via.placeholder.com/40", subtotal: 900, discount: 0, paid: 500, due: 400, paymentType: "Cash", subscription: "None", status: "Active" },
    { id: 5, customerName: "Mr. Blender", mobile: "01760-574342", entryDate: "2024-01-10", restaurantName: "Blender King", area: "Zindabazar", address: "Sylhet Tower, Sylhet", price: 1500, image: "https://via.placeholder.com/40", subtotal: 1400, discount: 100, paid: 1400, due: 0, paymentType: "Card", subscription: "Paid", status: "Active" },
    { id: 6, customerName: "Tasty Bite", mobile: "01912-112233", entryDate: "2024-01-15", restaurantName: "Tasty Corner", area: "Zindabazar", address: "Main Road, Sylhet", price: 800, image: "https://via.placeholder.com/40", subtotal: 800, discount: 0, paid: 800, due: 0, paymentType: "Cash", subscription: "Paid", status: "Active" },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, [areaName]);

  // --- Search Logic ---
  const filteredData = restaurants.filter(item => 
    item.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mobile.includes(searchTerm)
  );

  // --- Pagination Logic ---
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // --- RED ALERT DELETE FUNCTION ---
  const handleDelete = (id) => {
    toast((t) => (
      <div className="bg-red-600 p-5 rounded-lg shadow-2xl text-white min-w-[320px] border-b-4 border-red-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-2 rounded-full animate-pulse">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <p className="font-black uppercase text-sm tracking-widest">Delete Restaurant?</p>
            <p className="text-[10px] opacity-80">This data will be lost forever.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              setRestaurants(restaurants.filter(r => r.id !== id));
              toast.dismiss(t.id);
              toast.success("Successfully Deleted!", { style: { background: '#B91C1C', color: '#fff', fontWeight: 'bold' }});
            }}
            className="bg-white text-red-600 px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-gray-100 transition-all"
          > Confirm </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-red-900/50 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-red-800"
          > Cancel </button>
        </div>
      </div>
    ), { duration: 6000, position: 'top-center', style: { padding: 0, background: 'transparent', boxShadow: 'none' } });
  };

  const handleEditOpen = (item) => {
    setEditingData(item);
    setIsEditModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#F8F9FC] min-h-screen p-4 lg:p-6">
      <Toaster />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          All Restrurant Name – <span className="text-red-600 capitalize">{areaName}</span>
        </h1>
      </div>

      <div className="bg-white rounded-sm shadow-md border-t-2 border-red-600">
        {/* Table Controls */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Show <select className="border-2 border-gray-100 rounded px-1 py-1 outline-none text-black"><option>5</option><option>10</option></select> entries
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by restaurant or mobile..." 
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded focus:border-red-400 outline-none text-black font-bold text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="bg-[#FCFCFC] border-b border-gray-200">
                {["ID", "Customer", "Mobile", "Date", "Restrurent Name", "Area", "Paid", "Subtotal", "Payment", "Status", "Edit", "Delete"].map(h => (
                  <th key={h} className="px-3 py-4 text-[11px] font-black text-gray-700 uppercase border-x border-gray-50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-3 py-4 text-xs font-bold text-gray-400 border-x border-gray-50">{item.id}</td>
                  <td className="px-3 py-4 text-xs font-bold text-gray-700 border-x border-gray-50">{item.customerName}</td>
                  <td className="px-3 py-4 text-xs font-black text-gray-500 border-x border-gray-50">{item.mobile}</td>
                  <td className="px-3 py-4 text-xs text-gray-400 border-x border-gray-50">{item.entryDate}</td>
                  <td className="px-3 py-4 text-xs font-bold text-gray-800 border-x border-gray-50">{item.restaurantName}</td>
                  <td className="px-3 py-4 text-xs font-black text-gray-500 border-x border-gray-50 uppercase">{item.area}</td>
                  <td className="px-3 py-4 text-xs font-black text-green-600 border-x border-gray-50">৳{item.paid}</td>
                  <td className="px-3 py-4 text-xs font-black text-red-600 border-x border-gray-50">৳{item.subtotal}</td>
                  <td className="px-3 py-4 text-[10px] font-black text-blue-500 border-x border-gray-50 uppercase italic">{item.paymentType}</td>
                  <td className="px-3 py-4 border-x border-gray-50 text-center">
                    <span className="bg-[#28A745] text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                  </td>
                  <td className="px-3 py-4 border-x border-gray-50 text-center">
                    <button onClick={() => handleEditOpen(item)} className="p-1.5 bg-[#00C2FF] text-white rounded hover:bg-cyan-600 shadow-sm transition-all hover:scale-110"><Edit3 size={14} /></button>
                  </td>
                  <td className="px-3 py-4 border-x border-gray-50 text-center">
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-[#E1533F] text-white rounded hover:bg-red-700 shadow-sm transition-all hover:scale-110"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- DYNAMIC PAGINATION --- */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-[#FCFCFC] border-t border-gray-100 gap-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing <span className="text-red-600">{indexOfFirstItem + 1}</span> to <span className="text-red-600">{Math.min(indexOfLastItem, totalItems)}</span> of {totalItems} entries
          </p>
          <div className="flex gap-1">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="p-2 border-2 border-gray-100 rounded text-gray-400 hover:bg-red-600 hover:text-white transition-all disabled:opacity-20"
            >
              <ChevronLeft size={16}/>
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-lg' : 'bg-white border-2 border-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="p-2 border-2 border-gray-100 rounded text-gray-400 hover:bg-red-600 hover:text-white transition-all disabled:opacity-20"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* --- EDIT MODAL (Image 86a571.png Style) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#B91C1C] p-4 flex justify-between items-center text-white border-b-4 border-red-800">
              <h3 className="font-black flex items-center gap-2 uppercase tracking-tighter text-sm"><Edit3 size={18}/> Update Restrurant Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-all bg-red-800 p-1 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); toast.success("Updated Successfully!"); setIsEditModalOpen(false); }} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[85vh] overflow-y-auto">
              {/* Identity Details */}
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</label>
                  <input type="text" defaultValue={editingData?.customerName} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded focus:border-[#00C2FF] outline-none text-sm font-bold text-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                  <input type="text" defaultValue={editingData?.mobile} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded focus:border-[#00C2FF] outline-none text-sm font-bold text-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant Name</label>
                  <input type="text" defaultValue={editingData?.restaurantName} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded focus:border-[#00C2FF] outline-none text-sm font-bold text-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                  <textarea rows="3" defaultValue={editingData?.address} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded focus:border-[#00C2FF] outline-none text-sm font-bold text-black resize-none" />
                </div>
              </div>

              {/* Finance & Image */}
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant Image</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-4 rounded bg-gray-50 group hover:border-[#00C2FF] transition-all">
                    <img src={editingData?.image} className="w-20 h-20 rounded-md object-cover border-4 border-white shadow-md mb-3" alt="" />
                    <label className="cursor-pointer bg-white border-2 border-gray-100 px-5 py-2 text-[10px] font-black uppercase rounded flex items-center gap-2 hover:bg-[#00C2FF] hover:text-white transition-all">
                      <Upload size={14}/> Change File <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (৳)</label>
                    <input type="number" defaultValue={editingData?.price} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded focus:border-[#00C2FF] outline-none text-sm font-bold text-red-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription</label>
                    <select className="w-full px-4 py-2.5 border-2 border-gray-100 rounded outline-none text-sm font-bold">
                      <option>Paid</option><option>None</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-4 pt-6">
                  <button type="submit" className="flex-1 bg-[#00C2FF] text-white py-3.5 rounded font-black uppercase text-[11px] tracking-[2px] shadow-xl hover:bg-cyan-600 transition-all flex items-center justify-center gap-2">
                    <Save size={16}/> Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded font-black uppercase text-[11px] tracking-[2px] hover:bg-gray-200">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaPage;