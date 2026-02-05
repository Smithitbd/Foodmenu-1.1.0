import React, { useState } from 'react';
import { MapPin, Plus, Edit3, Trash2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AreaManagement = () => {
  const [areas, setAreas] = useState([
    { id: 1, name: "Tilagor", fileName: "Tilagor", img: "https://via.placeholder.com/100" },
    { id: 2, name: "Shahporan", fileName: "Shahporan", img: "https://via.placeholder.com/100" },
    { id: 3, name: "Bondorbazar", fileName: "Bondorbazar", img: "https://via.placeholder.com/100" },
    { id: 4, name: "Shahi Eidgah", fileName: "Shahi", img: "https://via.placeholder.com/100" },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  return (
    <div className="bg-[#F4F7F9] min-h-screen p-4 lg:p-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* Page Title */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add Restrurant Area</h2>

      {/* --- INPUT FORM (As per image_c67fa5.png) --- */}
      <div className="bg-white p-8 rounded-sm shadow-sm border-t-2 border-[#B91C1C] mb-8">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">Restrurant Area</label>
              <input type="text" placeholder="Enter Area" className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-blue-400 outline-none text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">File Name</label>
              <input type="text" placeholder="Enter File Name From Frontend Arealist Folder" className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:border-blue-400 outline-none text-sm italic" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">Image</label>
              <div className="flex flex-col gap-1">
                <input type="file" className="text-sm file:mr-4 file:py-1 file:px-4 file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 cursor-pointer" />
                <span className="text-xs text-gray-500">upload logo</span>
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="bg-[#00C2FF] hover:bg-cyan-600 text-white py-2 px-8 rounded-sm font-medium text-sm transition-all shadow-sm">
                Add Details
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* --- DATA TABLE (As per image_c67fa5.png) --- */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-bold text-gray-700 w-16">#</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Name</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">File name</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Image</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Edit</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Delete</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {areas.map((area, index) => (
                <tr key={area.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-6 py-4 text-sm font-medium">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium">{area.name}</td>
                  <td className="px-6 py-4 text-sm">{area.fileName}</td>
                  <td className="px-6 py-4">
                    <img src={area.img} className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200" alt="" />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setEditingArea(area); setIsEditModalOpen(true); }}
                      className="p-2 bg-[#00C2FF] text-white rounded hover:bg-cyan-600 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 bg-[#E1533F] text-white rounded hover:bg-red-700 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL (As per image_86a571.png) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-lg rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#B91C1C] p-4 flex justify-between items-center text-white">
               <h3 className="font-bold flex items-center gap-2 text-sm uppercase">
                 <Edit3 size={18}/> Edit Area Details
               </h3>
               <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Area Name</label>
                  <input 
                    type="text" 
                    defaultValue={editingArea?.name} 
                    className="w-full px-3 py-3 border border-red-200 rounded outline-none focus:border-[#B91C1C] text-gray-700 font-medium"
                  />
               </div>
               
               <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Current Image</label>
                  <div className="space-y-4">
                    <img src={editingArea?.img} className="w-32 h-20 object-cover rounded border border-gray-200" alt="" />
                    <div className="flex items-center gap-2">
                        <input type="file" className="text-xs text-gray-400 file:bg-gray-100 file:border-0 file:px-4 file:py-1 file:rounded file:text-gray-600" />
                    </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-6">
                  <button type="button" className="flex-1 bg-[#00C2FF] text-white py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-cyan-600 shadow-md">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)} 
                    className="flex-1 bg-gray-100 text-gray-500 py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-gray-200"
                  >
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

export default AreaManagement;