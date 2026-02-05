import React, { useState, useEffect } from 'react';
import { 
  Tag, Image as ImageIcon, Save, XCircle, 
  CloudLightning, Upload, ArrowRight, Package, MapPin 
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

//const API_URL = 'http://localhost:5000/api/offers';

const AddOffer = () => {
  const [items, setItems] = useState([
    { _id: '1', name: 'Burger Dhamaka', price: 250 },
    { _id: '2', name: 'Platter 1:1', price: 450 },
    { _id: '3', name: 'Crunchy Chicken', price: 180 },
    { _id: '4', name: 'Choco Cold Coffee', price: 120 }
  ]);
  
  // damy area list
  const [areas] = useState(['Noyasorok', 'Zindabazar', 'Kumarpara', 'Dariapara', 'Baghbari']);

  const [runningOffers, setRunningOffers] = useState([
    {
      _id: 'o1',
      offerTitle: 'Flash Sale',
      itemName: 'Burger Dhamaka',
      offerPrice: 199,
      originalPrice: 250,
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      quantityType: 'Unlimited',
      totalQuantity: 0,
      selectedAreas: ['Uttara', 'Mirpur'],
      offerImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'
    }
  ]);

  const [selectedOfferForEdit, setSelectedOfferForEdit] = useState(null);
  const [formData, setFormData] = useState({
    offerTitle: '', itemName: '', originalPrice: '', offerPrice: '',
    startDate: '', endDate: '', selectedAreas: [], quantityType: 'Unlimited',
    totalQuantity: 0, offerImage: null, previewImage: null
  });

  // Area Selection Logic
  const toggleArea = (area, isEdit = false) => {
    if (isEdit) {
      const currentAreas = selectedOfferForEdit.selectedAreas || [];
      const updatedAreas = currentAreas.includes(area)
        ? currentAreas.filter(a => a !== area)
        : [...currentAreas, area];
      setSelectedOfferForEdit({ ...selectedOfferForEdit, selectedAreas: updatedAreas });
    } else {
      const updatedAreas = formData.selectedAreas.includes(area)
        ? formData.selectedAreas.filter(a => a !== area)
        : [...formData.selectedAreas, area];
      setFormData({ ...formData, selectedAreas: updatedAreas });
    }
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setSelectedOfferForEdit({ ...selectedOfferForEdit, offerImage: reader.result, imageFile: file });
        } else {
          setFormData({ ...formData, offerImage: file, previewImage: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateOffer = () => {
    setRunningOffers(runningOffers.map(offer => 
      offer._id === selectedOfferForEdit._id ? selectedOfferForEdit : offer
    ));
    Swal.fire('Updated!', 'Successfully updated.', 'success');
    setSelectedOfferForEdit(null);
  };

  const handleLaunchOffer = async (e) => {
    e.preventDefault();
    if (!formData.offerTitle || !formData.offerPrice || !formData.offerImage) {
      return Swal.fire('Error', 'Fill in all the boxes!', 'error');
    }
    Swal.fire('Success', 'Launched!', 'success');
  };

  const handleCancelOffer = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this campaign!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F172A', 
      cancelButtonColor: '#EF4444',  
      confirmButtonText: 'Yes, stop it!',
      cancelButtonText: 'No, keep it',
      border: 'none',
      customClass: {
        popup: 'rounded-[30px]',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setRunningOffers(runningOffers.filter(o => o._id !== id));
        setSelectedOfferForEdit(null);

        Swal.fire({
          title: 'Stopped!',
          text: 'The offer has been cancelled.',
          icon: 'success',
          confirmButtonColor: '#F97316',
          customClass: {
            popup: 'rounded-[30px]',
            confirmButton: 'rounded-xl px-6 py-3 font-bold'
          }
        });
      }
    });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-10 font-sans text-slate-900">
      {/* Running Campaigns */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-xs font-black uppercase text-slate-600 mb-6 flex items-center gap-2 tracking-widest">
            <CloudLightning size={16} className="text-orange-500 animate-pulse"/> Running Campaigns
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {runningOffers.map((offer) => (
            <button key={offer._id} onClick={() => setSelectedOfferForEdit(offer)} className="bg-white p-4 rounded-[35px] shadow-sm border border-slate-100 hover:border-orange-500 transition-all flex items-center gap-4 group text-left">
                <img src={offer.offerImage} alt="food" className="w-16 h-16 rounded-2xl object-cover" />
                <div className="overflow-hidden">
                    <p className="text-[9px] font-black text-slate-600 uppercase truncate">{offer.offerTitle}</p>
                    <p className="text-sm font-black text-slate-800 leading-tight truncate">{offer.itemName}</p>
                    <p className="text-xs font-black text-orange-600">৳{offer.offerPrice}</p>
                </div>
                <ArrowRight className="ml-auto text-slate-200 group-hover:text-orange-500" size={16}/>
            </button>
            ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"><Tag size={24}/></div>
                CREATE NEW OFFER
            </h1>

            <div className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 space-y-8">
                {/* Image Upload Area */}
                <div className="relative group w-full h-48 rounded-[35px] border-2 border-dashed border-slate-200 bg-slate-300 overflow-hidden flex flex-col items-center justify-center">
                    {formData.previewImage ? <img src={formData.previewImage} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-slate-300" />}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[11px] font-black text-slate-600 uppercase mb-2 block ml-1">Offer Name</label>
                        <input value={formData.offerTitle} onChange={(e) => setFormData({...formData, offerTitle: e.target.value})} type="text" className="w-full px-6 py-4 bg-slate-300 border-none rounded-2xl outline-none font-bold" />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-600 uppercase mb-2 block ml-1">Select Food Item</label>
                        <select className="w-full px-6 py-4 bg-slate-300 border-none rounded-2xl outline-none font-bold" onChange={(e) => {
                            const item = items.find(i => i.name === e.target.value);
                            setFormData({...formData, itemName: e.target.value, originalPrice: item?.price || ''});
                        }}>
                            <option value="">Select an item</option>
                            {items.map(i => <option key={i._id} value={i.name}>{i.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* AREA SELECTION FOR CREATE */}
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase mb-3 block ml-1">Target Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {areas.map(area => (
                      <button key={area} onClick={() => toggleArea(area)} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${formData.selectedAreas.includes(area) ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-[11px] font-black text-slate-600 uppercase mb-2 block ml-1">Regular</label><div className="w-full px-6 py-4 bg-slate-100 rounded-2xl font-black text-slate-600 tracking-tighter">৳{formData.originalPrice || '0'}</div></div>
                    <div><label className="text-[11px] font-black text-slate-600 uppercase mb-2 block ml-1">Offer Price</label><input value={formData.offerPrice} onChange={(e) => setFormData({...formData, offerPrice: e.target.value})} type="number" className="w-full px-6 py-4 bg-orange-200 border-2 border-orange-50 rounded-2xl outline-none font-black text-red-700" /></div>
                    <div><label className="text-[11px] font-black text-slate-600 uppercase mb-2 block ml-1">Start Date</label><input value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} type="date" className="w-full px-4 py-4 bg-slate-300 rounded-2xl outline-none text-xs font-bold" /></div>
                    <div><label className="text-[11px] font-black text-slate-600 uppercase mb-2 block ml-1">End Date</label><input value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} type="date" className="w-full px-4 py-4 bg-slate-300 rounded-2xl outline-none text-xs font-bold" /></div>
                </div>
            </div>
        </div>

        {/* Launch Control */}
        <div className="lg:col-span-4">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl sticky top-10 border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-6">Inventory Status</p>
                <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-6">
                    {['Unlimited', 'Limited'].map(t => (
                        <button key={t} onClick={() => setFormData({...formData, quantityType: t})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.quantityType === t ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>{t}</button>
                    ))}
                </div>
                {formData.quantityType === 'Limited' && (
                    <input value={formData.totalQuantity} onChange={(e) => setFormData({...formData, totalQuantity: e.target.value})} type="number" className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none mb-4 text-center text-2xl font-black" />
                )}
                <button onClick={handleLaunchOffer} className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"><Save size={20}/> Launch Offer</button>
            </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {selectedOfferForEdit && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-xl rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-slate-300 px-10 py-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-800 uppercase">Edit Campaign</h3>
                    <button onClick={() => setSelectedOfferForEdit(null)} className="p-2 bg-white shadow-sm text-slate-600 hover:text-red-500 rounded-full"><XCircle/></button>
                </div>

                <div className="p-10 space-y-6">
                    <div className="flex items-center gap-6 bg-slate-300 p-6 rounded-3xl">
                        <img src={selectedOfferForEdit.offerImage} alt="food" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-sm" />
                        <div>
                            <h4 className="text-lg font-black text-slate-800">{selectedOfferForEdit.itemName}</h4>
                            <p className="text-xs font-bold text-orange-600">Reg: ৳{selectedOfferForEdit.originalPrice || '0'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Offer Title</label>
                            <input value={selectedOfferForEdit.offerTitle} onChange={(e) => setSelectedOfferForEdit({...selectedOfferForEdit, offerTitle: e.target.value})} type="text" className="w-full px-5 py-4 bg-slate-300 rounded-2xl font-bold outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Deal Price (৳)</label>
                            <input value={selectedOfferForEdit.offerPrice} onChange={(e) => setSelectedOfferForEdit({...selectedOfferForEdit, offerPrice: e.target.value})} type="number" className="w-full px-5 py-4 bg-orange-50 rounded-2xl font-black text-orange-600 outline-none" />
                        </div>
                    </div>

                    {/* AREA SELECTION FOR EDIT */}
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Update Areas</label>
                      <div className="flex flex-wrap gap-2">
                        {areas.map(area => (
                          <button key={area} onClick={() => toggleArea(area, true)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${selectedOfferForEdit.selectedAreas?.includes(area) ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Start Date</label><input value={selectedOfferForEdit.startDate} onChange={(e) => setSelectedOfferForEdit({...selectedOfferForEdit, startDate: e.target.value})} type="date" className="w-full px-5 py-4 bg-slate-300 rounded-2xl font-bold outline-none text-xs" /></div>
                        <div><label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">End Date</label><input value={selectedOfferForEdit.endDate} onChange={(e) => setSelectedOfferForEdit({...selectedOfferForEdit, endDate: e.target.value})} type="date" className="w-full px-5 py-4 bg-slate-300 rounded-2xl font-bold outline-none text-xs" /></div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button onClick={handleUpdateOffer} className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all">Update Now</button>
                        <button onClick={() => handleCancelOffer(selectedOfferForEdit._id)} className="px-8 bg-red-50 text-red-500 py-5 rounded-3xl font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all">Stop Deal</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddOffer;