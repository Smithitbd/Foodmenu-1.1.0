import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, X, Upload, Plus, Globe, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const TopRestrurant = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newData, setNewData] = useState({ viewLink: "", messengerLink: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [topItems, setTopItems] = useState([]);

  const API_URL = "http://localhost:5000/api/top_restaurants";
  const IMG_BASE_URL = "http://localhost:5000/uploads/TopRestrurant/";

  // --- ডাটা লোড করা ---
  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(API_URL);
      setTopItems(res.data);
    } catch (err) {
      toast.error("Failed to load data!");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // --- নতুন ডাটা যোগ করা ---
  const handleAddDetails = async () => {
    if (!newData.viewLink || !newData.messengerLink || !selectedFile) {
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill all fields and select a logo!',
        confirmButtonColor: '#B91C1C',
      });
    }

    const formData = new FormData();
    formData.append('viewLink', newData.viewLink);
    formData.append('messengerLink', newData.messengerLink);
    formData.append('image', selectedFile);

    try {
      await axios.post(API_URL, formData);
      toast.success("Successfully Added!");
      setNewData({ viewLink: "", messengerLink: "" });
      setSelectedFile(null);
      fetchRestaurants();
    } catch (err) {
      toast.error("Failed to add restaurant");
    }
  };

  // --- এডিট সেভ করা ---
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('viewLink', editingData.viewLink);
    formData.append('messengerLink', editingData.messengerLink);
    if (editFile) formData.append('image', editFile);

    try {
      await axios.put(`${API_URL}/${editingData.id}`, formData);
      setIsEditModalOpen(false);
      setEditFile(null);
      fetchRestaurants();
      Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false });
    } catch (err) {
      toast.error("Update failed!");
    }
  };

  // --- ডিলিট হ্যান্ডলার ---
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Delete this restaurant?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B91C1C',
      confirmButtonText: 'Yes, Delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          fetchRestaurants();
          Swal.fire('Deleted!', 'Successfully removed.', 'success');
        } catch (err) {
          toast.error("Delete failed!");
        }
      }
    });
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen p-5 lg:p-10 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto">
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
                    <Globe className="absolute left-3 top-3 text-gray-300" size={16} />
                    <input 
                      type="text" 
                      value={newData.viewLink}
                      onChange={(e) => setNewData({...newData, viewLink: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm" 
                      placeholder="https://foodmenubd.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Messenger URL</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-3 top-3 text-gray-300" size={16} />
                    <input 
                      type="text" 
                      value={newData.messengerLink}
                      onChange={(e) => setNewData({...newData, messengerLink: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm" 
                      placeholder="https://m.me/..."
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest block mb-2">Identity Logo</label>
                  <label className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase italic">
                      {selectedFile ? selectedFile.name : "Choose Logo Image"}
                    </span>
                    <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  </label>
                </div>

                <button onClick={handleAddDetails} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                  Confirm & Add <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Table Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Preview</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Details</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-all group">
                      <td className="px-6 py-5 border-r">
                        <div className="relative">
                          <img src={`${IMG_BASE_URL}${item.image}`} className="w-16 h-12 rounded-lg object-cover border-2 border-white shadow-md" alt="logo" />
                          <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded italic">#{idx+1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ExternalLink size={10} className="text-red-500"/>
                            <span className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{item.viewLink}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MessageSquare size={10}/>
                            <span className="text-xs">{item.messengerLink}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setEditingData(item); setIsEditModalOpen(true); }} className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg"><Edit3 size={14}/></button>
                          <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center border text-red-600 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-black text-sm uppercase italic">Modify Premium Details</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={editingData?.viewLink || ""} 
                  onChange={(e) => setEditingData({...editingData, viewLink: e.target.value})}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border text-sm font-bold" 
                />
                <input 
                  type="text" 
                  value={editingData?.messengerLink || ""} 
                  onChange={(e) => setEditingData({...editingData, messengerLink: e.target.value})}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl border text-sm font-bold" 
                />
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border">
                  <img src={editFile ? URL.createObjectURL(editFile) : `${IMG_BASE_URL}${editingData?.image}`} className="w-20 h-14 rounded-lg object-cover" alt="preview" />
                  <label className="cursor-pointer text-[10px] font-black text-blue-600 uppercase underline">
                    Change Logo
                    <input type="file" className="hidden" onChange={(e) => setEditFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase">Apply Changes</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 bg-gray-100 text-gray-500 py-4 rounded-xl font-black text-xs uppercase">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopRestrurant;