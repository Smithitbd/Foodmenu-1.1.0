import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Phone, Globe, Save, Loader2, Store, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageShop = () => {
    const [shop, setShop] = useState({
        restaurant_name: '',
        location: '',
        contact_mobile: '',
        slug: ''
    });
    
    const [logo, setLogo] = useState(null);
    const [cover, setCover] = useState(null);
    const [previews, setPreviews] = useState({ logo: '', cover: '' });
    const [loading, setLoading] = useState(false);
    const resId = localStorage.getItem('resId');
    
    const logoInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // ১. ডাটা লোড করা (Optimized)
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
                slug: data.slug || ''
            });

            // ডাটাবেস কলাম bg_image অনুযায়ী প্রিভিউ সেট
            setPreviews({
                logo: data.logo ? `http://localhost:5000/uploads/${data.logo}` : '',
                cover: data.bg_image ? `http://localhost:5000/uploads/${data.bg_image}` : ''
            });
        } catch (err) {
            console.error(err);
        }
    };
    fetchShopData();
}, [resId]);

    // ২. ফাইল হ্যান্ডলিং উইথ প্রিভিউ
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

    // ৩. সেভ লজিক (Fixed & Verified with your Backend)
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
        
        // আপনার ব্যাকএন্ডে এই কী (Key) গুলোই ব্যবহার করা হয়েছে
        if (logo) formData.append('logo', logo); 
        if (cover) formData.append('cover', cover);

        try {
            const response = await axios.put(`http://localhost:5000/api/restaurant/update-all/${resId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success("Settings updated successfully!", {
                    icon: '🚀',
                    style: { borderRadius: '15px', background: '#333', color: '#fff' }
                });
                // রিলোড ছাড়াই ডাটা আপডেট নিশ্চিত করা
                setLogo(null);
                setCover(null);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Update failed. Check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-5xl mx-auto pt-10 px-4">
                
                {/* Header Title */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Store</h1>
                        <p className="text-slate-500 font-medium">Configure your restaurant profile and branding</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                            <CheckCircle size={16} /> Live on Platform
                        </span>
                    </div>
                </div>

                {/* Profile Visual Section */}
                <div className="relative group mb-32">
                    {/* Cover Photo */}
                    <div className="h-72 w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white relative bg-slate-200">
                        {previews.cover ? (
                            <img src={previews.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Store size={48} className="mb-2 opacity-20" />
                                <span className="text-sm font-bold uppercase tracking-widest opacity-50">No Cover Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        
                        <button 
                            onClick={() => coverInputRef.current.click()}
                            className="absolute bottom-6 right-6 bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-slate-900 p-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm"
                        >
                            <Camera size={20} /> Change Cover
                        </button>
                        <input ref={coverInputRef} type="file" hidden onChange={(e) => handleFile(e, 'cover')} accept="image/*" />
                    </div>

                    {/* Logo Photo */}
                    <div className="absolute -bottom-20 left-12">
                        <div className="relative group/logo">
                            <div className="w-44 h-44 rounded-[2.5rem] border-[10px] border-white shadow-2xl overflow-hidden bg-slate-50">
                                {previews.logo ? (
                                    <img src={previews.logo} className="w-full h-full object-cover" alt="Logo" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-300 font-black">LOGO</div>
                                )}
                            </div>
                            <button 
                                onClick={() => logoInputRef.current.click()}
                                className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 active:scale-95"
                            >
                                <Camera size={22} />
                            </button>
                            <input ref={logoInputRef} type="file" hidden onChange={(e) => handleFile(e, 'logo')} accept="image/*" />
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField 
                                    label="Restaurant Identity" 
                                    icon={<Store size={20}/>} 
                                    value={shop.restaurant_name} 
                                    onChange={(v) => setShop({...shop, restaurant_name: v})} 
                                    placeholder="Nanna Biryani"
                                />
                                <InputField 
                                    label="Official Contact" 
                                    icon={<Phone size={20}/>} 
                                    value={shop.contact_mobile} 
                                    onChange={(v) => setShop({...shop, contact_mobile: v})} 
                                    placeholder="+880 17..."
                                />
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Physical Location" 
                                        icon={<MapPin size={20}/>} 
                                        value={shop.location} 
                                        onChange={(v) => setShop({...shop, location: v})} 
                                        placeholder="Block E, Banani, Dhaka"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Store URL Slug" 
                                        icon={<Globe size={20}/>} 
                                        value={shop.slug} 
                                        onChange={(v) => setShop({...shop, slug: v})} 
                                        placeholder="nanna-biryani-official"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl shadow-2xl transition-all duration-300 flex justify-center items-center gap-4 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save className="group-hover:rotate-12 transition-transform" />}
                                <span className="text-lg tracking-[0.2em] uppercase">Save Changes</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Info Box */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 rounded-[2.5rem] text-white shadow-xl">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                <AlertCircle /> Pro Tip
                            </h3>
                            <p className="text-red-50/80 font-medium leading-relaxed">
                                Use high-quality (1920x1080) images for your cover to attract more customers. 
                                Logos should be 500x500 for best clarity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Input Component for Professionalism
const InputField = ({ label, icon, value, onChange, placeholder }) => (
    <div className="space-y-3">
        <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] ml-2 italic">{label}</label>
        <div className="group relative flex items-center bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-5 transition-all duration-300 focus-within:bg-white focus-within:border-emerald-500/20 focus-within:ring-4 ring-emerald-500/5">
            <span className="text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                {icon}
            </span>
            <input 
                className="w-full p-5 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default ManageShop;