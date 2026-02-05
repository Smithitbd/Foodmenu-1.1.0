import React, { useState } from 'react';
import { Edit3, Trash2, X, Upload, Save, Link, MessageSquare, Plus, Globe, ExternalLink, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

const TopRestrurant = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newData, setNewData] = useState({ viewLink: "", messengerLink: "" });
  const [editingData, setEditingData] = useState(null);
  const [topItems, setTopItems] = useState([
    { id: 1, viewLink: "https://foodmenubd.com/osfood", messengerLink: "https://m.me/osfood", image: "https://via.placeholder.com/150" },
  ]);

  // --- ADD DATA ---
  const handleAddDetails = () => {
    if (!newData.viewLink || !newData.messengerLink) {
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Fill in all fields!',
        confirmButtonColor: '#B91C1C',
      });
    }
    const newItem = {
      id: Date.now(),
      ...newData,
      image: "https://via.placeholder.com/150"
    };
    setTopItems([newItem, ...topItems]);
    setNewData({ viewLink: "", messengerLink: "" });
    toast.success("Successfully Added!");
  };

  // --- SAVE EDIT ---
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setTopItems(topItems.map(item => item.id === editingData.id ? editingData : item));
    setIsEditModalOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'The information has been updated successfully.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // --- SWEETALERT DELETE ---
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this restaurant?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B91C1C',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-sm text-gray-600'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setTopItems(topItems.filter(i => i.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'The restaurant has been successfully moved.',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
      }
    });
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen p-5 lg:p-10 font-sans">
      <Toaster />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Top <span className="text-red-600">RESTAURANT </span> List</h2>
            <div className="h-1 w-20 bg-red-600 mt-2 rounded-full"></div>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border">
            Total Active: {topItems.length}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-xl border-b-4 border-red-600">
              <div className="flex items-center gap-2 mb-6 text-red-600">
                <Plus size={20} strokeWidth={3} />
                <span className="font-black uppercase text-xs tracking-tighter">Add New Restaurant</span>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Menu URL Link</label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-3 text-gray-300 group-focus-within:text-red-500 transition-colors" size={16} />
                    <input 
                      type="text" 
                      value={newData.viewLink}
                      onChange={(e) => setNewData({...newData, viewLink: e.target.value})}
                      placeholder="https://foodmenubd.com/..." 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Messenger URL</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-3 top-3 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      type="text" 
                      value={newData.messengerLink}
                      onChange={(e) => setNewData({...newData, messengerLink: e.target.value})}
                      placeholder="https://m.me/..." 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest block mb-2">Identity Logo</label>
                  <label className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all active:scale-95">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase italic">Choose Logo Image</span>
                    <input type="file" className="hidden" />
                  </label>
                </div>

                <button 
                  onClick={handleAddDetails}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  Confirm & Add <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Table Side - Unique Glass Layout */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-800">Preview</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Connection Details</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="px-6 py-5 border-r border-gray-50">
                        <div className="relative">
                          <img src={item.image} className="w-16 h-12 rounded-lg object-cover shadow-md border-2 border-white group-hover:scale-110 transition-transform" alt="logo" />
                          <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm italic">#{idx+1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-red-50 text-red-600 rounded"><ExternalLink size={10}/></div>
                            <span className="text-xs font-bold text-gray-800 truncate max-w-[250px] italic underline decoration-red-200">{item.viewLink}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-50 text-blue-600 rounded"><MessageSquare size={10}/></div>
                            <span className="text-xs font-semibold text-gray-400 truncate max-w-[250px]">{item.messengerLink}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setEditingData(item); setIsEditModalOpen(true); }}
                            className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-xl shadow-md hover:bg-red-600 transition-all active:scale-90"
                          >
                            <Edit3 size={14}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-red-600 rounded-xl shadow-md hover:bg-red-600 hover:text-white transition-all active:scale-90"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topItems.length === 0 && (
                <div className="py-20 text-center bg-gray-50/50">
                  <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-3">
                    <Globe size={30} className="text-gray-200" />
                  </div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[5px]">Empty Listing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-900/20"><Edit3 size={18}/></div>
                <div>
                  <h3 className="font-black text-sm uppercase italic tracking-tighter">Modify Premium Details</h3>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Editing ID: {editingData?.id}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update View Link</label>
                  <input 
                    type="text" 
                    value={editingData?.viewLink || ""} 
                    onChange={(e) => setEditingData({...editingData, viewLink: e.target.value})}
                    className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold border border-gray-100 focus:ring-2 focus:ring-red-500/10 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Messenger Link</label>
                  <input 
                    type="text" 
                    value={editingData?.messengerLink || ""} 
                    onChange={(e) => setEditingData({...editingData, messengerLink: e.target.value})}
                    className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold border border-gray-100 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <img src={editingData?.image} className="w-20 h-14 rounded-lg shadow-md border-2 border-white object-cover" alt="preview" />
                <div>
                  <p className="text-[10px] font-black text-gray-800 uppercase italic">Current Logo</p>
                  <button type="button" className="text-[8px] font-black text-blue-600 uppercase hover:underline">Click to change image</button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all">
                  Apply Changes
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 bg-gray-100 text-gray-500 py-4 rounded-xl font-black text-xs uppercase hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopRestrurant;