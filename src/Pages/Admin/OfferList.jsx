import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, X, Plus, Upload, MapPin, Loader2, Edit2, Package } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Add form state
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [addForm, setAddForm] = useState({
    offerTitle: '', area: '', itemName: '', offerPrice: '', totalQuantity: '', endDate: ''
  });

  // ✅ Edit form state
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editForm, setEditForm] = useState({
    offerTitle: '', area: '', itemName: '', offerPrice: '', totalQuantity: '', endDate: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [areasRes, offersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/get-area`),
        axios.get(`${API_BASE_URL}/api/addoffers`)
      ]);
      setAreas(Array.isArray(areasRes.data) ? areasRes.data : []);
      setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
    } catch (err) {
      toast.error("Failed to load data");
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ✅ ADD
  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!addImageFile) {
      toast.error("Please select an image!");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('offerImage', addImageFile);
    formData.append('offerTitle', addForm.offerTitle);
    formData.append('area', addForm.area);
    formData.append('itemName', addForm.itemName);
    formData.append('offerPrice', addForm.offerPrice);
    formData.append('totalQuantity', addForm.totalQuantity);
    formData.append('endDate', addForm.endDate);

    // Debug
    for (let [k, v] of formData.entries()) {
      console.log(k, v instanceof File ? `FILE:${v.name}(${v.size}b)` : v);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/addoffers`, formData);
      console.log('Response:', res.data);
      toast.success("Offer Created!", {
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontWeight: 'bold' }
      });
      setIsAddModalOpen(false);
      setAddImageFile(null);
      setAddImagePreview(null);
      setAddForm({ offerTitle: '', area: '', itemName: '', offerPrice: '', totalQuantity: '', endDate: '' });
      fetchData();
    } catch (err) {
      console.error('Error:', err.response?.data);
      toast.error("Failed to add offer");
    } finally {
      setLoading(false);
    }
  };

  // ✅ EDIT OPEN
  const handleEditOpen = (offer) => {
    setEditOffer(offer);
    setEditImagePreview(offer.offerImage ? `${API_BASE_URL}/uploads/offers/${offer.offerImage}` : null);
    setEditImageFile(null);
    setEditForm({
      offerTitle: offer.offerTitle || '',
      area: offer.selectedAreas || offer.area || '',
      itemName: offer.itemName || '',
      offerPrice: offer.offerPrice || '',
      totalQuantity: offer.totalQuantity || '',
      endDate: offer.endDate?.split('T')[0] || ''
    });
    setIsEditModalOpen(true);
  };

  // ✅ EDIT SUBMIT
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (editImageFile) formData.append('offerImage', editImageFile);
    formData.append('offerTitle', editForm.offerTitle);
    formData.append('area', editForm.area);
    formData.append('itemName', editForm.itemName);
    formData.append('offerPrice', editForm.offerPrice);
    formData.append('totalQuantity', editForm.totalQuantity);
    formData.append('endDate', editForm.endDate);

    try {
      await axios.put(`${API_BASE_URL}/api/addoffers/${editOffer.id}`, formData);
      toast.success("Updated Successfully!", {
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontWeight: 'bold' },
        iconTheme: { primary: '#3b82f6', secondary: '#fff' }
      });
      setIsEditModalOpen(false);
      setEditOffer(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchData();
    } catch (err) {
      toast.error("Update Failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This offer will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/addoffers/${id}`);
      Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire({ title: 'Failed!', icon: 'error' });
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-100 text-black";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">
          OFFER<span className="text-red-600">LIST</span>
        </h1>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-black transition-all">
          <Plus size={18} /> Add New Offer
        </button>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Campaign Info</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Price & Qty</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {offers.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-16 text-gray-400 font-bold">No offers found</td></tr>
            ) : offers.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-all">
                <td className="px-8 py-6 flex items-center gap-4">
                  <img
                    src={item.offerImage ? `${API_BASE_URL}/uploads/offers/${item.offerImage}` : "https://placehold.co/56x56/f1f5f9/94a3b8?text=No+Img"}
                    className="w-14 h-14 rounded-2xl object-cover shadow-md bg-slate-100"
                    alt=""
                    onError={(e) => e.target.src = "https://placehold.co/56x56/f1f5f9/94a3b8?text=No+Img"}
                  />
                  <div>
                    <p className="font-black text-slate-800 text-sm uppercase">{item.offerTitle}</p>
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase mt-0.5 italic">
                      <MapPin size={10} /> {item.selectedAreas || item.area || "No Area"}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-black italic">
                    ৳ {item.offerPrice}
                  </div>
          
<p className="text-[10px] text-slate-400 font-bold mt-1 uppercase flex justify-center items-center gap-1">
    <Package size={10}/> QTY: {item.quantityType || item.totalQuantity}
</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEditOpen(item)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                      <Edit2 size={16}/>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== ADD MODAL ===== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-xl font-black italic uppercase">Create New Offer</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fill in the details below</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white/10 hover:bg-red-500 rounded-xl transition-all">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleAddOffer} className="p-8 grid grid-cols-2 gap-5 overflow-y-auto">
              {/* Image */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Offer Banner *</label>
                <div className="relative w-full h-36 border-4 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center justify-center bg-slate-50 hover:border-red-200 transition-all overflow-hidden">
                  {addImagePreview ? (
                    <img src={addImagePreview} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-300 mb-1" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">Click to Upload Banner</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAddImageFile(file);
                        setAddImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Offer Title</label>
                <input className={inputClass} placeholder="Ramadan Platter" required
                  value={addForm.offerTitle} onChange={e => setAddForm({...addForm, offerTitle: e.target.value})} />
              </div>

              {/* Area */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Target Area</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className={`${inputClass} pl-12 appearance-none`} required
                    value={addForm.area} onChange={e => setAddForm({...addForm, area: e.target.value})}>
                    <option value="">Choose Area</option>
                    {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Item Name */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Item Name</label>
                <input className={inputClass} placeholder="Chicken Roast" required
                  value={addForm.itemName} onChange={e => setAddForm({...addForm, itemName: e.target.value})} />
              </div>

              {/* Price */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Price (BDT)</label>
                <input type="number" className={inputClass} placeholder="0.00" required
                  value={addForm.offerPrice} onChange={e => setAddForm({...addForm, offerPrice: e.target.value})} />
              </div>

              {/* Quantity - 1:1 format */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Quantity (e.g. 1:1)</label>
                <input className={inputClass} placeholder="1:1" required
                  value={addForm.totalQuantity} onChange={e => setAddForm({...addForm, totalQuantity: e.target.value})} />
              </div>

              {/* End Date */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Expiry Date</label>
                <input type="date" className={inputClass} required
                  value={addForm.endDate} onChange={e => setAddForm({...addForm, endDate: e.target.value})} />
              </div>

              <div className="col-span-2 pt-4">
                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 shadow-xl transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={20}/> : "Publish Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {isEditModalOpen && editOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-xl font-black italic uppercase">Edit Offer</h2>
                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Update the details below</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/10 hover:bg-red-500 rounded-xl transition-all">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 grid grid-cols-2 gap-5 overflow-y-auto">
              {/* Image */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Offer Banner</label>
                <div className="relative w-full h-36 border-4 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center justify-center bg-slate-50 hover:border-blue-200 transition-all overflow-hidden">
                  {editImagePreview ? (
                    <img src={editImagePreview} className="w-full h-full object-cover" alt="preview"
                      onError={(e) => e.target.style.display='none'} />
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-300 mb-1" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">Click to Change Banner</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditImageFile(file);
                        setEditImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Offer Title</label>
                <input className={inputClass} required
                  value={editForm.offerTitle} onChange={e => setEditForm({...editForm, offerTitle: e.target.value})} />
              </div>

              {/* Area */}
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Target Area</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className={`${inputClass} pl-12 appearance-none`} required
                    value={editForm.area} onChange={e => setEditForm({...editForm, area: e.target.value})}>
                    <option value="">Choose Area</option>
                    {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Item Name */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Item Name</label>
                <input className={inputClass} required
                  value={editForm.itemName} onChange={e => setEditForm({...editForm, itemName: e.target.value})} />
              </div>

              {/* Price */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Price (BDT)</label>
                <input type="number" className={inputClass} required
                  value={editForm.offerPrice} onChange={e => setEditForm({...editForm, offerPrice: e.target.value})} />
              </div>

              {/* Quantity */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Quantity (e.g. 1:1)</label>
                <input className={inputClass} placeholder="1:1" required
                  value={editForm.totalQuantity} onChange={e => setEditForm({...editForm, totalQuantity: e.target.value})} />
              </div>

              {/* End Date */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Expiry Date</label>
                <input type="date" className={inputClass} required
                  value={editForm.endDate} onChange={e => setEditForm({...editForm, endDate: e.target.value})} />
              </div>

              <div className="col-span-2 pt-4">
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={20}/> : "Update Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferList;