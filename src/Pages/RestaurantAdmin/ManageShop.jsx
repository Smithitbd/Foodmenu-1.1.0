import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Phone, Globe, Save, Loader2, Store, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageShop = () => {
    const [shop, setShop] = useState({
        restaurant_name: '',
        location: '',
        contact_mobile: '',
        slug: '',
        opening_time: '10:00',
        closing_time: '22:00'
    });
    
    const [logo, setLogo] = useState(null);
    const [cover, setCover] = useState(null);
    const [previews, setPreviews] = useState({ logo: '', cover: '' });
    const [loading, setLoading] = useState(false);
    const resId = localStorage.getItem('resId');
    
    const logoInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // ১. ডাটা লোড করা
    useEffect(() => {
        const fetchShopData = async () => {
            if (!resId) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/restaurant/${resId}`);
                const data = res.data;
                
                setShop({
                    restaurant_name: data.restaurant_name || '',
                    location: data.location || '',
                    contact_mobile: data.contact_mobile || '',
                    slug: data.slug || '',
                    opening_time: data.opening_time ? data.opening_time.substring(0, 5) : '10:00',
                    closing_time: data.closing_time ? data.closing_time.substring(0, 5) : '22:00'
                });

                setPreviews({
                    logo: data.logo ? `http://localhost:5000/uploads/${data.logo}` : '',
                    cover: data.bg_image ? `http://localhost:5000/uploads/${data.bg_image}` : ''
                });
            } catch (err) {
                console.error("Fetch Error:", err);
                toast.error("Failed to load store data");
            }
        };
        fetchShopData();
    }, [resId]);

    // ২. ফাইল হ্যান্ডেলিং (Logo & Cover)
    const handleFile = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error("File size must be under 2MB");
            const objectUrl = URL.createObjectURL(file);
            if (type === 'logo') {
                setLogo(file);
                setPreviews(prev => ({ ...prev, logo: objectUrl }));
            } else {
                setCover(file);
                setPreviews(prev => ({ ...prev, cover: objectUrl }));
            }
        }
    };

    // ৩. সেভ করার লজিক
    const handleSave = async () => {
        if (!shop.restaurant_name || !shop.contact_mobile) {
            return toast.error("Name and Mobile are required!");
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('restaurant_name', shop.restaurant_name);
        formData.append('location', shop.location);
        formData.append('contact_mobile', shop.contact_mobile);
        formData.append('slug', shop.slug);
        formData.append('opening_time', shop.opening_time);
        formData.append('closing_time', shop.closing_time);
        
        if (logo) formData.append('logo', logo); 
        if (cover) formData.append('cover', cover);

        try {
            const response = await axios.put(`http://localhost:5000/api/restaurant/update-all/${resId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success("Store updated successfully!");
                setLogo(null);
                setCover(null);
                window.location.reload(); // পেজ রিফ্রেশ করে নতুন ডাটা দেখানো
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-5xl mx-auto pt-10 px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Store</h1>
                        <p className="text-slate-500 font-medium">Edit your profile, branding, and timing</p>
                    </div>
                </div>

                {/* Visual Section (Image Uploads) */}
                <div className="relative group mb-32">
                    {/* Cover Photo */}
                    <div className="h-72 w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative bg-slate-200">
                        {previews.cover ? (
                            <img src={previews.cover} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No Cover Image</div>
                        )}
                        <button 
                            onClick={() => coverInputRef.current.click()}
                            className="absolute bottom-6 right-6 bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-slate-900 p-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 font-bold"
                        >
                            <Camera size={20} /> Change Cover
                        </button>
                        <input ref={coverInputRef} type="file" hidden onChange={(e) => handleFile(e, 'cover')} accept="image/*" />
                    </div>

                    {/* Logo Photo */}
                    <div className="absolute -bottom-20 left-12">
                        <div className="relative">
                            <div className="w-44 h-44 rounded-[2.5rem] border-[10px] border-white shadow-2xl overflow-hidden bg-white">
                                {previews.logo ? (
                                    <img src={previews.logo} className="w-full h-full object-cover" alt="Logo" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-300 font-bold">LOGO</div>
                                )}
                            </div>
                            <button 
                                onClick={() => logoInputRef.current.click()}
                                className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl shadow-lg transition-transform hover:scale-110"
                            >
                                <Camera size={22} />
                            </button>
                            <input ref={logoInputRef} type="file" hidden onChange={(e) => handleFile(e, 'logo')} accept="image/*" />
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="Restaurant Name" icon={<Store size={20}/>} value={shop.restaurant_name} onChange={(v) => setShop({...shop, restaurant_name: v})} />
                                <InputField label="Contact Mobile" icon={<Phone size={20}/>} value={shop.contact_mobile} onChange={(v) => setShop({...shop, contact_mobile: v})} />
                                
                                {/* Opening Time */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Opening Time</label>
                                    <div className="flex items-center bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-5 transition-all focus-within:bg-white focus-within:border-red-500/20">
                                        <Clock size={20} className="text-slate-400" />
                                        <input 
                                            type="time"
                                            className="w-full p-5 bg-transparent outline-none font-bold text-slate-700"
                                            value={shop.opening_time}
                                            onChange={(e) => setShop({...shop, opening_time: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Closing Time */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Closing Time</label>
                                    <div className="flex items-center bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-5 transition-all focus-within:bg-white focus-within:border-red-500/20">
                                        <Clock size={20} className="text-slate-400" />
                                        <input 
                                            type="time"
                                            className="w-full p-5 bg-transparent outline-none font-bold text-slate-700"
                                            value={shop.closing_time}
                                            onChange={(e) => setShop({...shop, closing_time: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <InputField label="Location" icon={<MapPin size={20}/>} value={shop.location} onChange={(v) => setShop({...shop, location: v})} />
                                </div>
                                <div className="md:col-span-2">
                                    <InputField label="Store URL Slug" icon={<Globe size={20}/>} value={shop.slug} onChange={(v) => setShop({...shop, slug: v})} />
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl shadow-2xl flex justify-center items-center gap-4 disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save />}
                                <span className="text-lg uppercase">Save Changes</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Sidebar Tips */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 rounded-[2.5rem] text-white shadow-lg">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Clock /> Operation Hours</h3>
                            <p className="opacity-90 text-sm leading-relaxed">Set your restaurant hours accurately. Your shop status on the dashboard will automatically follow this schedule.</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-800"><AlertCircle /> Tips</h3>
                            <ul className="text-sm text-slate-500 space-y-3 font-medium">
                                <li>• Use a high-quality Square logo (1:1).</li>
                                <li>• Cover photo looks best at 16:9 ratio.</li>
                                <li>• Keep the Slug simple (e.g., 'panshi-restaurant').</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Input Component
const InputField = ({ label, icon, value, onChange, placeholder }) => (
    <div className="space-y-3">
        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">{label}</label>
        <div className="flex items-center bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-5 focus-within:bg-white focus-within:border-red-500/20 transition-all">
            <span className="text-slate-400">{icon}</span>
            <input 
                className="w-full p-5 bg-transparent outline-none font-bold text-slate-700"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default ManageShop;