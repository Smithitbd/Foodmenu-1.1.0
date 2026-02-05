import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query"; 
import { Helmet } from "react-helmet-async"; 
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaStar, FaFilter, FaArrowRight, FaMotorcycle, FaClock, FaCheckCircle } from "react-icons/fa";

import { manualRestaurants } from "../../Components/Shared/data/restaurantsData";

const AllRestaurants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");

  const areas = ["All", "Zindabazar", "Amberkhana", "Chowhatta", "Upashahar", "Subidbazar", "South Surma"];

  const { data: apiRestaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'], 
    queryFn: async () => {
      try {
        const res = await axios.get(`https://foodmenubd.com/api/all-restaurants.php`);
        return res.data.restaurants || [];
      } catch (err) {
        return [];
      }
    },
  });

  const displayRestaurants = useMemo(() => {
    const combined = [...manualRestaurants, ...apiRestaurants];
    const uniqueMap = new Map();
    combined.forEach(item => { if(item.slug) uniqueMap.set(item.slug, item); });
    const unique = Array.from(uniqueMap.values());

    return unique.filter((res) => {
      const matchesSearch = res.r_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArea = selectedArea === "All" || (res.address && res.address.includes(selectedArea));
      return matchesSearch && matchesArea;
    });
  }, [apiRestaurants, searchTerm, selectedArea]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      <Helmet><title>Explore Restaurants | FoodMenu BD</title></Helmet>

      {/* --- Header Section --- */}
      <div className="bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight leading-none">
                ALL <span className="text-red-600 italic">RESTAURANTS</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">Discover Sylhet's Best Eats</p>
              </div>
            </motion.div>

            {/* Premium Search Bar */}
            <div className="relative w-full md:w-[450px]">
              <input
                type="text"
                placeholder="Search for restaurants or cuisines..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-semibold outline-none shadow-sm placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
          </div>

          {/* --- Area Filter Pills --- */}
          <div className="flex items-center gap-3 mt-8 overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-wider shadow-xl shrink-0">
              <FaFilter className="text-red-500" /> Filter Area
            </div>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-7 py-3 rounded-2xl text-[12px] font-extrabold transition-all duration-300 whitespace-nowrap border-2 ${
                  selectedArea === area
                    ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 scale-105"
                    : "bg-white text-slate-600 border-slate-100 hover:border-red-100 hover:bg-red-50/30"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Restaurant Grid --- */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
          <AnimatePresence mode="popLayout">
            {isLoading && displayRestaurants.length === 0 ? (
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
              displayRestaurants.map((item, idx) => (
                <RestaurantCard key={item.slug} item={item} idx={idx} navigate={navigate} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Restaurant Card ---
const RestaurantCard = ({ item, idx, navigate }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    whileHover={{ y: -10 }}
    onClick={() => navigate(`/cart/${item.slug}`)}
    className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.15)] transition-all duration-500 cursor-pointer border border-slate-100 hover:border-red-100"
  >
    {/* Image Container */}
    <div className="relative h-48 md:h-56 overflow-hidden">
      <img src={item.pimage} alt={item.r_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      
      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
          <FaStar className="text-orange-400 text-xs" />
          <span className="text-slate-900 font-black text-[11px]">{item.ratings || "4.8"}</span>
        </div>
        {idx % 3 === 0 && (
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tighter shadow-lg shadow-red-200 uppercase">
            Popular
          </div>
        )}
      </div>

      {/* Glassmorphism Bottom Overlay */}
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>

    {/* Content Container */}
    <div className="p-6 relative">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <h3 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-red-600 transition-colors leading-tight">
              {item.r_name}
            </h3>
            <FaCheckCircle className="text-blue-500 text-[10px] shrink-0" title="Verified" />
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <FaMapMarkerAlt className="text-[11px] text-red-500" />
            <p className="text-[11px] font-bold truncate uppercase tracking-tight">{item.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Delivery</span>
            <div className="flex items-center gap-1 text-slate-700 font-black text-[11px]">
              <FaMotorcycle className="text-red-500" /> 25-35m
            </div>
          </div>
          <div className="w-[1px] h-6 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Min Order</span>
            <div className="text-slate-700 font-black text-[11px]">৳150</div>
          </div>
        </div>

        <motion.div 
          whileHover={{ x: 3 }}
          className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
        >
          <FaArrowRight size={12} />
        </motion.div>
      </div>
    </div>
  </motion.div>
);

// --- Sub-Component: Loading Skeleton ---
const SkeletonCard = () => (
  <div className="bg-white rounded-[2.5rem] p-4 h-80 animate-pulse border border-slate-50 shadow-sm">
    <div className="h-44 bg-slate-100 rounded-[2rem] mb-6" />
    <div className="px-2 space-y-4">
      <div className="h-5 bg-slate-100 rounded-full w-4/5" />
      <div className="h-3 bg-slate-50 rounded-full w-2/5" />
      <div className="h-10 bg-slate-50 rounded-2xl mt-4" />
    </div>
  </div>
);

export default AllRestaurants;