import React, { useState, useEffect } from 'react';
import { Upload, Edit3, Trash2, Store, MapPin, Link as LinkIcon, Phone, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const ManageShop = () => {
  const [shops, setShops] = useState([
    {
      _id: "sample_1",
      name: "O.S Food",
      address: "Nayasharak, Sylhet, Bangladesh",
      link: "https://www.facebook.com/o.sfood2018",
      mobile: "01745-12040632432432",
      logo: null, 
      bgImage: null,
      isSample: true 
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', address: '', link: '', mobile: '', logo: null, bgImage: null
  });

  const fetchShops = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shops');
      if (response.data && response.data.length > 0) {
        setShops(response.data);
      }
    } catch (error) {
      console.error("Backend not connected yet, showing sample data.");
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.address) {
      return Swal.fire({
        title: 'Missing Fields!',
        text: 'Please fill in the required fields.',
        icon: 'warning',
        confirmButtonColor: '#EF4444',
        customClass: { popup: 'rounded-[20px]' }
      });
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });

      if (editId) {
        await axios.put(`http://localhost:5000/api/shops/${editId}`, data);
        Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('http://localhost:5000/api/shops', data);
        Swal.fire({ title: 'Added!', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      
      setEditId(null);
      setFormData({ name: '', address: '', link: '', mobile: '', logo: null, bgImage: null });
      fetchShops();
    } catch (error) {
      Swal.fire('Error', 'Database connection failed!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, isSample) => {
    if (isSample) return Swal.fire('Info', 'Sample data cannot be deleted.', 'info');
    
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Delete!',
      customClass: { popup: 'rounded-[25px]' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/shops/${id}`);
          Swal.fire('Deleted!', '', 'success');
          fetchShops();
        } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-800 italic uppercase tracking-tight">
            Company <span className="text-red-600">Details</span> Add
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your shop information</p>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl">
          <Store className="text-red-600" size={24} />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-5">
            {[
              { label: 'Restaurant Name *', key: 'name', icon: <Store size={16}/>, placeholder: 'e.g. Sultan\'s Dine' },
              { label: 'Restaurant Address *', key: 'address', icon: <MapPin size={16}/>, placeholder: 'Enter full address' },
              { label: 'Messenger/WhatsApp Link', key: 'link', icon: <LinkIcon size={16}/>, placeholder: 'https://wa.me/...' },
              { label: 'Mobile No *', key: 'mobile', icon: <Phone size={16}/>, placeholder: 'Enter phone number' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1 mb-2 block italic">{field.label}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    {field.icon}
                  </div>
                  <input 
                    type="text" 
                    value={formData[field.key]} 
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} 
                    placeholder={field.placeholder}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-200 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1 mb-2 block italic">Shop Logo</label>
                <input type="file" id="logo-up" hidden onChange={(e) => setFormData({...formData, logo: e.target.files[0]})} />
                <label htmlFor="logo-up" className="flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[30px] p-6 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group">
                  <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-gray-400 group-hover:text-red-500" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase">{formData.logo ? "Selected" : "Upload Logo"}</span>
                </label>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1 mb-2 block italic">Background Image</label>
                <input type="file" id="bg-up" hidden onChange={(e) => setFormData({...formData, bgImage: e.target.files[0]})} />
                <label htmlFor="bg-up" className="flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[30px] p-6 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group">
                  <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon size={20} className="text-gray-400 group-hover:text-red-500" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase">{formData.bgImage ? "Selected" : "Upload BG"}</span>
                </label>
              </div>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-gray-900 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-[2px] shadow-xl shadow-gray-200 hover:bg-red-600 hover:shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (editId ? 'Update Details' : 'Save Shop Details')}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h3 className="text-sm font-black text-gray-700 uppercase italic tracking-wider">Registered Shops</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">Shop Info</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6 text-center">Media</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shops.map((shop, index) => (
                <tr key={shop._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-6 px-6 text-xs font-black text-gray-300">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="py-6 px-6">
                    <p className="font-black text-gray-800 italic uppercase text-sm leading-none">{shop.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {shop.address}
                    </p>
                  </td>
                  <td className="py-6 px-6">
                    <p className="text-xs font-bold text-gray-700">{shop.mobile}</p>
                    <a href={shop.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-500 uppercase hover:underline">Social Link</a>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex justify-center gap-3">
                      <div className="relative group/img">
                        <img 
                          src={shop.isSample ? "https://i.ibb.co/L6vM8D5/sultans-dine-logo.png" : `http://localhost:5000/uploads/${shop.logo}`} 
                          className="w-10 h-10 rounded-xl border border-gray-100 object-cover shadow-sm bg-white" 
                          alt="logo" 
                        />
                        <span className="absolute -top-2 -right-2 bg-gray-900 text-[8px] text-white px-1.5 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity">Logo</span>
                      </div>
                      <div className="relative group/img">
                        <img 
                          src={shop.isSample ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100" : `http://localhost:5000/uploads/${shop.bgImage}`} 
                          className="w-10 h-10 rounded-xl border border-gray-100 object-cover shadow-sm bg-white" 
                          alt="bg" 
                        />
                        <span className="absolute -top-2 -right-2 bg-gray-900 text-[8px] text-white px-1.5 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity">BG</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditId(shop._id); setFormData(shop); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2.5 bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all shadow-sm active:scale-90">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(shop._id, shop.isSample)} className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageShop;