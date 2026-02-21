import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Tag, Save, MapPin, Image as ImageIcon, Calendar } from 'lucide-react';

const AddOffer = ({ restaurantId }) => {
    const today = new Date().toISOString().split('T')[0];
    const [products, setProducts] = useState([]);
    const [areas, setAreas] = useState([]);
    
    const [formData, setFormData] = useState({
        offerTitle: '', productId: '', itemName: '', originalPrice: '',
        offerPrice: '', endDate: '', selectedAreas: [],
        quantityType: 'Unlimited', totalQuantity: 0,
        offerImage: null, preview: null
    });

    // ডাটাবেস থেকে প্রোডাক্ট এবং এরিয়া ফেচ করা
    // useEffect এর ভেতর URL টি চেক করুন
// AddOffer.jsx (useEffect এর ভেতর)
useEffect(() => {
    const loadData = async () => {
        // localStorage থেকে resId নিন
        const resId = localStorage.getItem('resId'); 
        
        if (!resId) {
            console.error("Restaurant ID not found in localStorage!");
            return;
        }

        try {
            // নিশ্চিত হোন আপনার server.js এ রুটটি /api/setup-offer-data/:restaurant_id আছে
            const res = await axios.get(`http://localhost:5000/api/setup-offer-data/${resId}`);
            console.log("Offer Page Data Loaded:", res.data);
            setProducts(res.data.products || []);
            setAreas(res.data.areas || []);
        } catch (err) {
            console.error("Error loading offer data:", err);
        }
    };
    loadData();
}, []); // এখানে [] দিলে পেজ লোড হওয়ার সাথে সাথে একবার কল হবে

    const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    // ডাটাবেসের আইডি সাধারণত Number হয়, তাই == ব্যবহার করা নিরাপদ
    const product = products.find(p => p.id == selectedId);
    
    if (product) {
        setFormData(prev => ({ 
            ...prev, 
            productId: selectedId, 
            itemName: product.name, 
            originalPrice: product.price 
        }));
    }
};

    const toggleArea = (areaName) => {
        const updated = formData.selectedAreas.includes(areaName)
            ? formData.selectedAreas.filter(a => a !== areaName)
            : [...formData.selectedAreas, areaName];
        setFormData({ ...formData, selectedAreas: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'selectedAreas') data.append(key, JSON.stringify(formData[key]));
            else if (key !== 'preview') data.append(key, formData[key]);
        });

        try {
            await axios.post('http://localhost:5000/api/launch-offer', data);
            Swal.fire('Success', 'Offer launched & Product price updated!', 'success');
        } catch (err) {
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <Tag className="text-orange-500" /> CREATE NEW OFFER
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Section */}
                    <div className="relative h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                        {formData.preview ? (
                            <img src={formData.preview} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <div className="text-slate-400 text-center">
                                <ImageIcon size={32} className="mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase">Upload Offer Banner</p>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, offerImage: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Offer Title</label>
                            <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" placeholder="e.g. Ramadan Special" onChange={(e) => setFormData({...formData, offerTitle: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Select Product</label>
                            <select onChange={handleProductSelect} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none">
                                <option value="">Choose Food</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Regular Price</label>
                            <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl font-black">৳ {formData.originalPrice || '0'}</div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 text-orange-500">Offer Price</label>
                            <input type="number" className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl font-black text-orange-600 outline-none" onChange={(e) => setFormData({...formData, offerPrice: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">End Date</label>
                            <input type="date" min={today} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>

                    {/* Areas from Database */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-3 block">Available Areas</label>
                        <div className="flex flex-wrap gap-2">
                            {areas.map(area => (
                                <button key={area.id} type="button" onClick={() => toggleArea(area.areaName)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.selectedAreas.includes(area.areaName) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {area.areaName}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stock Logic */}
                    <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl">
                        {['Unlimited', 'Limited'].map(type => (
                            <button key={type} type="button" onClick={() => setFormData({...formData, quantityType: type})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${formData.quantityType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                                {type}
                            </button>
                        ))}
                    </div>

                    {formData.quantityType === 'Limited' && (
                        <input type="number" placeholder="Enter Stock Quantity" className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold" onChange={(e) => setFormData({...formData, totalQuantity: e.target.value})} />
                    )}

                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
                        <Save size={20} /> Launch Offer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddOffer;