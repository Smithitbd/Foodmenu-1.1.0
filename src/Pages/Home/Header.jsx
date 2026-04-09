import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios';
import Video from '../../assets/Foodmenu.mp4';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);

  // --- Backend Integration ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/all-restaurants-list'); 
        setRestaurants(response.data.restaurants || []);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filtered = Array.isArray(restaurants) 
    ? (query.trim() === "" 
        ? restaurants.slice(0, 6) 
        : restaurants.filter(r =>
            r.r_name?.toLowerCase().includes(query.toLowerCase()) ||
            r.address?.toLowerCase().includes(query.toLowerCase())
          ))
    : [];

  useEffect(() => {
    let index = 0; let forward = true;
    const typeText = "Find your favorite food...";
    const timer = setInterval(() => {
      if (forward) {
        setPlaceholder(typeText.slice(0, index + 1));
        index++;
        if (index > typeText.length) forward = false;
      } else {
        setPlaceholder(typeText.slice(0, index - 1));
        index--;
        if (index <= 0) forward = true;
      }
    }, 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative min-h-screen bg-white font-['Gilroy'] overflow-x-hidden">
      
      {/* Desktop Video Section - XL Screens */}
      <div className="hidden xl:block absolute inset-0 z-0">
        <div 
          className="absolute top-0 right-0 w-[46%] h-[92%] overflow-hidden bg-slate-100 shadow-2xl"
          style={{ 
            // এটি ভিডিওর বাম পাশটিকে শার্প কোণাকুণি (Angled) করে দিবে, বাঁকানো নয়
            clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)' 
          }}
        >
          <video autoPlay muted loop playsInline onCanPlayThrough={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <source src={Video} type="video/mp4" />
          </video>
          
          {/* ভিডিওর উপরে একটি হালকা লাল ওভারলে গ্রেডিয়েন্ট (ঐচ্ছিক, দেখতে ভালো লাগে) */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent z-10"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="flex flex-col xl:flex-row min-h-[90vh] pt-6 xl:pt-20 items-center xl:items-center">
          
          {/* Mobile & Tablet Video - (Fixed Cropping) */}
          <div className="w-full xl:hidden order-1 mb-8 mt-4">
              <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 border-4 border-white">
                <video autoPlay muted loop playsInline onCanPlayThrough={() => setVideoLoaded(true)}
                  className={`w-full h-full object-contain ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}>
                  <source src={Video} type="video/mp4" />
                </video>
              </div>
          </div>

          {/* new mod */}
          <div className="w-full xl:w-7/12 flex flex-col justify-start text-center xl:text-left order-2 px-2 sm:px-0">
            {/* Top Small Text - Slightly Reduced */}
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-gray-500 text-sm sm:text-lg lg:text-xl font-bold mb-3 tracking-wide uppercase"
            >
              Everything You Crave in One Place
            </motion.p>
            
            {/* Main Title - Food Anytime (Balanced Size) */}
            <h1 className="text-[2.8rem] sm:text-6xl md:text-7xl lg:text-[6rem] font-black text-slate-900 tracking-tighter leading-[0.9] sm:leading-none mb-2">
              FOOD ANYTIME
            </h1>
            
            {/* Subtitle - Crave It Find It (Balanced Size) */}
            <h2 className="text-xl sm:text-4xl lg:text-[3.5rem] font-black mt-1 mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
                CRAVE IT? FIND IT!
              </span>
            </h2>

            {/* Search Container - Adjusted Padding & Size */}
            <div className="relative mx-auto xl:mx-0 w-full max-w-md md:max-w-lg lg:max-w-[540px] mb-8 z-[100]" ref={searchRef}>
              <div className="relative group shadow-[0_15px_40px_rgba(239,68,68,0.12)] rounded-[1.8rem] transition-all duration-300">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={placeholder || "Find your favourite food..."}
                  className="w-full pl-12 sm:pl-14 pr-24 py-4 sm:py-4.5 text-base sm:text-lg rounded-[1.8rem] bg-white border-2 border-transparent focus:border-red-100 focus:ring-4 ring-red-500/10 outline-none transition-all duration-300 text-slate-800 font-bold placeholder:text-gray-400"
                />
                
                {/* Left Search Icon*/}
                <MagnifyingGlassIcon className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 transition-colors ${query ? 'text-red-500' : 'text-gray-400'}`} />

                {/* Right Buttons Area*/}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
                  {query && (
                    <XMarkIcon 
                      onClick={() => setQuery('')} 
                      className="w-6 h-6 text-gray-400 cursor-pointer hover:text-red-600 transition-all p-1" 
                    />
                  )}
                  <button className="bg-red-600 hover:bg-slate-900 text-white p-2.5 sm:p-3 rounded-full transition-all duration-300 shadow-lg active:scale-95">
                    <MagnifyingGlassIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </button>
                </div>
              </div>

              {/* Suggestions Dropdown - ১ নম্বর কোড অনুযায়ী */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-3 bg-white rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-50 z-[110] overflow-hidden"
                  >
                    <div className="max-h-[350px] md:max-h-[400px] overflow-y-auto py-4 no-scrollbar scroll-smooth px-1">
                      {loading ? (
                        <div className="p-10 text-center animate-pulse text-red-500 font-bold text-lg">
                          Searching for restaurants...
                        </div>
                      ) : filtered.length > 0 ? (
                        filtered.map((r) => (
                          <SuggestionItem key={r.id} restaurant={r} close={() => setShowSuggestions(false)} />
                        ))
                      ) : (
                        <div className="p-10 text-center text-slate-400 font-bold text-base">
                          No restaurants found.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body::-webkit-scrollbar { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%); background-size: 200% 100%; animation: shimmer 2s infinite linear; }
      `}</style>
    </section>
  );
};

const SuggestionItem = ({ restaurant, close }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/cart/${restaurant.slug}`}
      onClick={close}
      className="flex items-center gap-4 p-4 mx-3 mb-1 hover:bg-red-50 rounded-[1.5rem] transition-all group border-b border-gray-50 last:border-none"
    >
      <div className="relative w-14 h-14 shrink-0 bg-slate-100 rounded-[1rem] overflow-hidden shadow-sm border border-slate-200">
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer bg-slate-200" />}
        <img
          src={restaurant.pimage} 
          alt={restaurant.r_name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        />
      </div>
      <div className="text-left overflow-hidden">
        <h4 className="font-black text-slate-800 group-hover:text-red-600 transition-colors text-base sm:text-lg truncate">
          {restaurant.r_name}
        </h4>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mt-0.5 truncate">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
          {restaurant.address}
        </p>
      </div>
    </Link>
  );
};

export default Header;