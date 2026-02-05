import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Globe, UploadCloud, Save, X, ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const AddArea = () => {
  // Data list state
  const [areaList, setAreaList] = useState([
    { id: 1, name: "TILAGOR", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100" },
    { id: 2, name: "SHAHPORAN", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100" },
  ]);

  // new data input state
  const [newName, setNewName] = useState("");
  const [newImg, setNewImg] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  // --- 1. new area add function ---
  const handleAdd = (e) => {
    e.preventDefault();

    if (!newName) {
      toast.error("Please enter an area name!");
      return;
    }

    // here call future Database API (fetch/axios)
    // for now we create a object 
    const newEntry = {
      id: Date.now(), // unique id
      name: newName.toUpperCase(),
      // if any photo not select than automatic selected a default photo
      img: newImg ? URL.createObjectURL(newImg) : "https://via.placeholder.com/100"
    };

    setAreaList([newEntry, ...areaList]); // new data add before list
    setNewName(""); // empty input box
    setNewImg(null); // reset image
    toast.success(`${newName} added successfully!`);
  };

  // --- Delete Function (with SweetAlert) ---
  const handleDelete = (id, name) => {
    Swal.fire({
      title: `<span class="uppercase font-black text-gray-800 italic">Confirm Delete?</span>`,
      html: `<p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Are you sure you want to delete <span class="text-red-600 font-black italic underline">${name}</span>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B91C1C',
      cancelButtonColor: '#838da2',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      borderRadius: '24px',
    }).then((result) => {
      if (result.isConfirmed) {
        // এখানে Database Delete API কল হবে
        setAreaList(areaList.filter(item => item.id !== id));
        toast.error(`${name} has been removed!`);
      }
    });
  };

  // --- Update function ---
  const handleUpdate = (e) => {
    e.preventDefault();
    // here call Database Update API 
    setIsEditModalOpen(false);
    toast.success('Information Updated!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans tracking-tight">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-gray-900 rounded-3xl shadow-xl text-white">
            <MapPin size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Regional <span className="text-red-600 underline decoration-red-600/20 underline-offset-4">Nodes</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mt-1">Area Control System</p>
          </div>
        </div>

        {/* --- ADD FORM CARD --- */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden mb-12">
          <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 font-black text-[10px] text-gray-400 uppercase tracking-[4px]">
             Initialize New Entry
          </div>
          <form onSubmit={handleAdd} className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
             <div className="lg:col-span-5 space-y-3">
               <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Area Designation</label>
               <div className="relative group">
                 <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors" size={18} />
                 <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter Area Name" 
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all shadow-inner uppercase tracking-tighter" 
                    required 
                 />
               </div>
             </div>
             <div className="lg:col-span-4 space-y-3">
               <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Visual ID (Image)</label>
               <div className="relative group">
                 <UploadCloud className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <input 
                    type="file" 
                    onChange={(e) => setNewImg(e.target.files[0])}
                    className="w-full pl-14 pr-6 py-[17px] bg-gray-50 border-none rounded-3xl text-[10px] text-gray-400 file:hidden cursor-pointer shadow-inner" 
                 />
               </div>
             </div>
             <div className="lg:col-span-3">
               <button type="submit" className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl text-xs uppercase italic tracking-[2px] shadow-xl hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-3">
                 <Plus size={20} strokeWidth={3} /> Map Zone
               </button>
             </div>
          </form>
        </div>

        {/* --- 🔴 RED TABLE HEADER --- */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#B91C1C] text-[10px] font-black text-white uppercase tracking-[3px]">
                <th className="px-10 py-6">Registered Node</th>
                <th className="px-10 py-6">Visual Preview</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {areaList.length > 0 ? areaList.map((area) => (
                <tr key={area.id} className="group hover:bg-red-50/20 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-red-600 group-hover:scale-125 transition-all"></span>
                       <span className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">{area.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <img src={area.img} className="w-20 h-12 object-cover rounded-2xl shadow-md border-2 border-white group-hover:rotate-2 transition-transform" alt="" />
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setEditingArea(area); setIsEditModalOpen(true); }} className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:bg-gray-900 hover:text-white transition-all active:scale-90">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(area.id, area.name)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs italic">No Territories Mapped Yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white relative">
            <div className="bg-gray-900 p-8 flex justify-between items-center text-white">
              <h3 className="font-black italic uppercase tracking-tighter text-lg">Modify Record</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-10 space-y-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rename Area</label>
                 <input type="text" defaultValue={editingArea?.name} className="w-full px-6 py-5 bg-gray-50 rounded-3xl border-none outline-none focus:ring-2 focus:ring-red-600 font-black italic uppercase text-sm" />
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update visual preview</label>
                 <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-[30px] border border-dashed border-gray-200">
                    <div className="relative group">
                       <img src={editingArea?.img} className="w-20 h-20 object-cover rounded-2xl border-4 border-white shadow-lg" alt="current" />
                       <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <ImageIcon className="text-white" size={20} />
                       </div>
                    </div>
                    <div className="flex-1">
                       <input type="file" className="block w-full text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-red-600 file:text-white hover:file:bg-black transition-all cursor-pointer" />
                    </div>
                 </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-gray-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                    <Save size={18}/> Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 bg-gray-100 text-orange-500 py-5 rounded-3xl font-black uppercase text-[10px]">Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddArea;