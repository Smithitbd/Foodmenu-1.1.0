import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Armchair, Hash, Users, Layers, Save } from 'lucide-react';

const AddTable = () => {
    const resId = localStorage.getItem('resId');
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        table_number: '',
        category: '', 
        capacity: ''
    });

    const capacityOptions = {
        'Couple': [2],
        'Family': [4, 6, 8, 10, 12]
    };

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000, // টাইম একটু কমিয়ে দিলাম যাতে দ্রুত রেসপন্স পাওয়া যায়
        timerProgressBar: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFormData({ ...formData, [name]: value, capacity: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!resId) return Swal.fire("Error", "Restaurant ID not found!", "error");
        if (!formData.capacity) return Toast.fire({ icon: 'warning', title: 'Select capacity' });

        setLoading(true); 

        try {
            // রিকোয়েস্ট পাঠানো হচ্ছে
            const response = await axios.post('http://localhost:5000/api/add-table', {
                restaurant_id: resId,
                ...formData
            });

            // যদি স্ট্যাটাস ২০১ বা ২০০ হয় (ডাটাবেসে সেভ হওয়া মানেই সাকসেস)
            if (response.status === 201 || response.status === 200 || response.data.success) {
                setLoading(false); // সাথে সাথে লোডিং বন্ধ করুন
                
                Toast.fire({
                    icon: 'success',
                    title: 'Table added successfully!'
                });
                
                // ফরম ক্লিয়ার
                setFormData({ table_number: '', category: '', capacity: '' });
            } else {
                // যদি সাকসেস ট্রু না আসে
                setLoading(false);
                Toast.fire({ icon: 'error', title: 'Unexpected response' });
            }

        } catch (error) {
            setLoading(false); // এরর হলেও লোডিং বন্ধ করুন
            console.error("Submission Error:", error);
            Toast.fire({
                icon: 'error',
                title: error.response?.data?.message || 'Failed to save data'
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
                        <Armchair size={24} />
                    </div>
                    Add New Restaurant Table
                </h2>
                <p className="text-slate-500 text-sm mt-2 ml-14 font-medium italic">
                    By Adding Table Information Save This
                </p>
            </div>

            <div className="bg-white rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Hash size={14} className="text-red-500" /> Table Number
                            </label>
                            <input
                                required
                                type="text"
                                name="table_number"
                                value={formData.table_number}
                                onChange={handleChange}
                                placeholder="e.g. T-01"
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-red-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Layers size={14} className="text-red-500" /> Category
                            </label>
                            <select
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-red-500 transition-all outline-none font-bold text-slate-700 appearance-none"
                            >
                                <option value="">Select Category</option>
                                <option value="Couple">Couple</option>
                                <option value="Family">Family</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={14} className="text-red-500" /> Capacity
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {!formData.category ? (
                                    <p className="col-span-full text-xs text-amber-500 font-bold italic">Please select category.</p>
                                ) : (
                                    capacityOptions[formData.category].map((cap) => (
                                        <label key={cap} className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="capacity"
                                                value={cap}
                                                checked={parseInt(formData.capacity) === cap}
                                                onChange={handleChange}
                                                className="peer hidden"
                                            />
                                            <div className="py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-center transition-all peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-600">
                                                <span className="block text-xl font-black">{cap}</span>
                                                <span className="text-[9px] uppercase font-bold">Persons</span>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex justify-end">
                        <button
                            disabled={loading}
                            type="submit"
                            className={`flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[2px] transition-all hover:bg-red-700 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Save Table
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTable;