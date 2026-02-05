import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SkeletonImage from "../../Components/Shared/SkeletonImage"; 

const MenuItemCard = ({ item }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  return (
    <div
      onClick={() => navigate(`/cart/${item.slug}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 font-['Inter'] border border-slate-100"
    >
      {/* Image Container */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {loading && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        )}
        <img
          src={item.logo}
          alt={item.name}
          loading="lazy"
          onLoad={() => setLoading(false)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        <h3 className="text-slate-800 font-bold text-sm lg:text-base group-hover:text-red-600 transition-colors duration-300 truncate px-2">
          {item.name}
        </h3>
        
        {/* Optional: Add a small indicator or badge */}
        <div className="mt-2 flex justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500 transition-colors">
            View Menu
          </span>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;