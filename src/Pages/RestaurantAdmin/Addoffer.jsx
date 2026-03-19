import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Tag, Save, ImageIcon, Trash2, Pause, Play, Package, Edit3, XCircle } from 'lucide-react';

const AddOffer = () => {
    const today = new Date().toISOString().split('T')[0];
    const resId = localStorage.getItem('resId');
    
    const [products, setProducts] = useState([]);
    const [areas, setAreas] = useState([]);
    const [existingOffers, setExistingOffers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    
    const [formData, setFormData] = useState({
        offerTitle: '', productId: '', itemName: '', originalPrice: '',
        offerPrice: '', endDate: '', selectedAreas: [],
        quantityType: 'Unlimited', totalQuantity: 0,
        offerImage: null, preview: null, status: 'active'
    });

    const loadAllData = async () => {
        try {
            const [setupRes, offersRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/setup-offer-data/${resId}`),
                axios.get(`http://localhost:5000/api/offers/${resId}`)
            ]);
            setProducts(setupRes.data.products || []);
            setAreas(setupRes.data.areas || []);
            setExistingOffers(offersRes.data || []);
        } catch (err) { console.error("Error:", err); }
    };

    useEffect(() => { loadAllData(); }, []);

    const resetForm = () => {
        setFormData({
            offerTitle: '', productId: '', itemName: '', originalPrice: '',
            offerPrice: '', endDate: '', selectedAreas: [],
            quantityType: 'Unlimited', totalQuantity: 0,
            offerImage: null, preview: null, status: 'active'
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleProductSelect = (e) => {
        const product = products.find(p => p.id == e.target.value);
        if (product) {
            setFormData(prev => ({ 
                ...prev, productId: product.id, itemName: product.name, originalPrice: product.price 
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
            else if (key !== 'preview' && formData[key] !== null) data.append(key, formData[key]);
        });

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/update-offer/${editId}`, data);
                Swal.fire('Updated!', 'Offer details updated.', 'success');
            } else {
                await axios.post('http://localhost:5000/api/launch-offer', data);
                Swal.fire('Launched!', 'New offer is live.', 'success');
            }
            resetForm();
            loadAllData();
        } catch (err) { Swal.fire('Error', 'Action failed', 'error'); }
    };

    const startEdit = (offer) => {
    setIsEditing(true);
    setEditId(offer.id);

    // ইমেজ পাথের জন্য চেক
    const imagePreview = offer.offerImage 
        ? `http://localhost:5000/uploads/${offer.offerImage}` 
        : null;

    setFormData({
        offerTitle: offer.offerTitle,
        productId: offer.productId,
        itemName: offer.itemName,
        originalPrice: offer.originalPrice,
        offerPrice: offer.offerPrice,
        // ডেট ফরম্যাট ঠিক করা (YYYY-MM-DD)
        endDate: new Date(offer.endDate).toISOString().split('T')[0],
        selectedAreas: typeof offer.selectedAreas === 'string' 
            ? JSON.parse(offer.selectedAreas) 
            : offer.selectedAreas,
        quantityType: offer.quantityType,
        totalQuantity: offer.totalQuantity,
        status: offer.status,
        preview: imagePreview, // এখানে ইমেজ পাথ সেট হচ্ছে
        offerImage: null // নতুন ফাইল সিলেক্ট করার জন্য খালি রাখা
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

    const toggleStatus = async (offer) => {
        const newStatus = offer.status === 'active' ? 'inactive' : 'active';
        try {
            await axios.put(`http://localhost:5000/api/toggle-offer/${offer.id}`, {
                status: newStatus, productId: offer.productId,
                offerPrice: offer.offerPrice, originalPrice: offer.originalPrice
            });
            loadAllData();
        } catch (err) { Swal.fire('Error', 'Status update failed', 'error'); }
    };

    const deleteOffer = async (id, productId) => {
        const result = await Swal.fire({
            title: 'Delete Offer?',
            text: "This will remove the discount from the product.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/delete-offer/${id}/${productId}`);
                loadAllData();
                Swal.fire('Deleted!', '', 'success');
            } catch (err) { Swal.fire('Error', 'Failed', 'error'); }
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-10">
            {/* --- FORM SECTION --- */}
            <div className={`max-w-4xl mx-auto bg-white rounded-[40px] shadow-xl border-2 p-6 md:p-10 transition-all ${isEditing ? 'border-orange-400' : 'border-slate-50'}`}>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 italic uppercase">
                        <Tag className={isEditing ? 'text-blue-500' : 'text-orange-500'} /> 
                        {isEditing ? 'Update Existing Offer' : 'Launch New Offer'}
                    </h2>
                    {isEditing && (
                        <button onClick={resetForm} className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase hover:underline">
                            <XCircle size={16}/> Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative h-44 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                        {formData.preview ? (
                            <img src={formData.preview} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <div className="text-slate-400 text-center">
                                <ImageIcon size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Banner Image</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFormData({
                                        ...formData, 
                                        offerImage: file, 
                                        preview: URL.createObjectURL(file) // নতুন ছবির প্রিভিউ
                                    });
                                }
                            }} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Title</label>
                            <input type="text" required value={formData.offerTitle} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" onChange={(e) => setFormData({...formData, offerTitle: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Product</label>
                            <select disabled={isEditing} required value={formData.productId} onChange={handleProductSelect} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none disabled:opacity-50">
                                <option value="">Select Item</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Original Price</p>
                            <p className="text-lg font-black text-slate-600">৳{formData.originalPrice || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-orange-500 uppercase ml-2 italic">Offer Price</label>
                            <input type="number" required value={formData.offerPrice} className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl font-black text-orange-600 outline-none" onChange={(e) => setFormData({...formData, offerPrice: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">End Date</label>
                            <input type="date" required value={formData.endDate} min={today} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" className={`w-full p-5 rounded-3xl font-black flex items-center justify-center gap-2 transition-all shadow-xl uppercase italic tracking-widest ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-orange-600'} text-white`}>
                        {isEditing ? <Edit3 size={20}/> : <Save size={20}/>}
                        {isEditing ? 'Update Promotion' : 'Launch Promotion'}
                    </button>
                </form>
            </div>

            {/* --- LIST SECTION --- */}
            <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 italic uppercase">
                    <Package className="text-orange-500" /> Active Promotions ({existingOffers.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {existingOffers.map((offer) => (
                        <div key={offer.id} className={`bg-white rounded-[35px] overflow-hidden border-2 transition-all ${offer.status === 'active' ? 'border-white shadow-lg' : 'border-slate-200 grayscale opacity-70'}`}>
                            <div className="relative h-40">
                                <img src={`http://localhost:5000/uploads/${offer.offerImage}`} className="w-full h-full object-cover" alt="offer" />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase ${offer.status === 'active' ? 'bg-green-500' : 'bg-slate-500'} text-white`}>
                                    {offer.status}
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <h4 className="font-black text-slate-800 uppercase italic truncate">{offer.offerTitle}</h4>
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                                    <span className="text-xl font-black text-orange-600 italic">৳{offer.offerPrice}</span>
                                    <span className="text-[10px] font-bold text-slate-400 line-through">৳{offer.originalPrice}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => toggleStatus(offer)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                                        {offer.status === 'active' ? <Pause size={16} className="mx-auto"/> : <Play size={16} className="mx-auto"/>}
                                    </button>
                                    <button onClick={() => startEdit(offer)} className="flex-1 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                                        <Edit3 size={16} className="mx-auto"/>
                                    </button>
                                    <button onClick={() => deleteOffer(offer.id, offer.productId)} className="flex-1 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={16} className="mx-auto"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddOffer;