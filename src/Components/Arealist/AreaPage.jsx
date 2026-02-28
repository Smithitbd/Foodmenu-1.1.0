import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BgImage from '../../assets/Images/arealistbg.png'; // আপনার ইমেজ পাথ চেক করে নিন
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaMotorcycle, FaSearch, FaTimes, FaFire } from 'react-icons/fa';

const AreaPage = () => {
  const { areaName } = useParams(); 
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', '0', '1', '2'
  const [loading, setLoading] = useState(true);

  
  const formatAreaName = (slug) => {
    if (!slug) return "Area";
    return slug.replace(/-/g, " ").split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  };

  const areaTitle = formatAreaName(areaName);

  // --- API: Fetch Data with Filter ---
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`http://localhost:5000/api/area-restaurants?area=${areaName}&type=${activeFilter}`);
        
        const processedData = (res.data.restaurants || []).map(r => ({
          ...r,
          distance: (Math.random() * 4 + 0.5).toFixed(1),
          duration: Math.floor(Math.random() * 20 + 15)
        }));

        setRestaurants(processedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (areaName) loadRestaurants();
  }, [areaName, activeFilter]); 

  // --- Search Logic (Frontend) ---
  const filteredItems = useMemo(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return restaurants.filter(item => item.r_name.toLowerCase().includes(term));
    }
    return restaurants;
  }, [restaurants, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-800 font-bold animate-pulse text-xl">Scanning Kitchens in {areaTitle}...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfe] min-h-screen font-['Inter',sans-serif]">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <img src={BgImage} loading="lazy" className="absolute inset-0 w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Best Bites in <span className="text-red-500">{areaTitle}</span>
          </motion.h1>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={`Search in ${areaTitle}...`}
              className="w-full pl-14 pr-12 py-5 rounded-[1.5rem] shadow-2xl outline-none focus:ring-4 focus:ring-red-500/20 bg-white text-slate-900 text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600">
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto no-scrollbar gap-3 md:justify-center">
          {/* ডাটাবেসের foodcourt ভ্যালু অনুযায়ী ফিল্টার */}
          {[
            { id: "all", label: "ALL" },
            { id: "0", label: "RESTAURANT" },
            { id: "1", label: "FOOD COURT" },
            { id: "2", label: "HOME KITCHEN" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-8 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap tracking-widest ${
                activeFilter === f.id 
                ? "bg-red-600 text-white shadow-xl shadow-red-200" 
                : "bg-white text-slate-400 border border-slate-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                onClick={() => navigate(`/cart/${item.slug}`)}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img src={item.pimage} alt={item.r_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <FaStar className="text-orange-400 text-xs" />
                    <span className="text-slate-900 font-black text-sm">{item.ratings}</span>
                  </div>
                  {item.featured === 1 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                      <FaFire className="text-[12px]" />
                      <span className="font-black text-[10px] uppercase tracking-tighter">Popular</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-[10px] font-black flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" /> {item.distance} KM
                  </div>
                </div>
                {/* Info Section */}
                <div className="p-7 flex flex-col flex-grow bg-white">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors mb-2 line-clamp-1">
                    {item.r_name}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-1">{item.address}</p>
                  <div className="mt-auto pt-5 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-tight">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <FaMotorcycle className="text-red-500" />
                      </div>
                      {item.duration} Mins
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
                      <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 mt-10">
            <div className="text-6xl mb-6">🍽️</div>
            <h3 className="text-2xl font-black text-slate-800">No restaurants found</h3>
            <p className="text-slate-400 mt-2">Try clearing filters or check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AreaPage;