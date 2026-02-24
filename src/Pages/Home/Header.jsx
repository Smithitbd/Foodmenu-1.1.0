import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import Video from '../../assets/Foodmenu.mp4';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const restaurants = [
  { id: 1, name: "Panshi Restaurant", slug: "panshi", address: "Zindabazar, Sylhet", img: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg" },
  { id: 2, name: "Woondal King", slug: "woondal", address: "Amberkhana, Sylhet", img: "https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg" },
  { id: 3, name: "Bhujon Bari", slug: "bhujon", address: "Modina Market, Sylhet", img: "https://images.pexels.com/photos/687824/pexels-photo-687824.jpeg" },
  { id: 4, name: "PizzaBurg", slug: "pizzaburg", address: "Shahi Eidgah, Sylhet", img: "https://images.pexels.com/photos/239975/pexels-photo-239975.jpeg" },
  { id: 5, name: "KFC Sylhet", slug: "kfc", address: "Kumarpara, Sylhet", img: "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg" },
  { id: 6, name: "Star Kabab", slug: "starkabab", address: "Bondor Bazar", img: "https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg" },
  { id: 7, name: "Burger King", slug: "burgerking", address: "Sobhanighat", img: "https://images.pexels.com/photos/2282531/pexels-photo-2282531.jpeg" },
];

const Header = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const searchRef = useRef(null);

  const filtered = query.trim() === "" 
    ? restaurants 
    : restaurants.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.address.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    let index = 0;
    let forward = true;
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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(true);
  };

  return (
    <section className="relative min-h-screen bg-white font-['Gilroy'] overflow-x-hidden">
      
      {/* Desktop Video Background */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <div 
          className="absolute top-0 right-0 w-5/12 h-[75vh] overflow-hidden rounded-bl-[4rem] shadow-2xl bg-slate-100"
          style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 7% 100%)' }}
        >
          {!videoLoaded && <div className="absolute inset-0 animate-shimmer bg-slate-200" />}
          <video
            autoPlay muted loop playsInline
            onCanPlayThrough={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          >
            <source src={Video} type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        {/* Changed pt-12 to pt-4 and lg:pt-32 to lg:pt-16 to move everything UP */}
        <div className="flex flex-col lg:flex-row min-h-[85vh] pt-4 lg:pt-16">
          
          {/* Text Content Area */}
          <div className="w-full lg:w-7/12 flex flex-col justify-start text-center lg:text-left order-2 lg:order-1 mt-4 lg:mt-8">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-500 text-sm sm:text-lg lg:text-xl font-medium mb-2 tracking-wide"
            >
              Everything You Crave in One Place
            </motion.p>
            
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none">
              FOOD ANYTIME
            </h1>
            
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black mt-2 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
                CRAVE IT? FIND IT!
              </span>
            </h2>

            {/* Search Bar Container */}
            <div className="relative mx-auto lg:mx-0 w-full max-w-lg mb-10" ref={searchRef}>
              <div className="relative group shadow-[0_10px_40px_rgba(0,0,0,0.06)] rounded-[2rem]">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={placeholder || "Search restaurants..."}
                  className="w-full pl-12 sm:pl-14 pr-24 sm:pr-32 py-4 sm:py-5 text-base sm:text-lg rounded-[2.2rem] bg-white border-2 border-transparent focus:border-red-100 focus:ring-2 ring-red-500 outline-none transition-all duration-300 text-slate-800 font-bold"
                />
                <MagnifyingGlassIcon className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 transition-colors ${query ? 'text-red-500' : 'text-gray-400'}`} />

                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  {query && (
                    <button onClick={handleClear} className="p-1 sm:p-2 text-gray-400 hover:text-red-600 text-xl sm:text-2xl font-light">×</button>
                  )}
                  <button className="bg-red-600 hover:bg-slate-900 text-white p-3 sm:p-4 rounded-full transition-all shadow-lg">
                    <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-3 bg-white/98 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 z-[100] "
                  >
                    <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto py-2 sm:py-4 no-scrollbar scroll-smooth">
                      {filtered.length > 0 ? (
                        filtered.map((r) => (
                          <SuggestionItem key={r.id} restaurant={r} close={() => setShowSuggestions(false)} />
                        ))
                      ) : (
                        <div className="p-8 sm:p-12 text-center text-slate-400 font-bold">
                          No restaurants found.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Video Area moved up as well */}
          <div className="w-full lg:hidden order-1 mt-2">
              <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-xl bg-slate-100">
                {!videoLoaded && <div className="absolute inset-0 animate-shimmer bg-slate-200" />}
                <video
                  autoPlay muted loop playsInline
                  onCanPlayThrough={() => setVideoLoaded(true)}
                  className={`w-full h-full object-cover ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                >
                  <source src={Video} type="video/mp4" />
                </video>
              </div>
          </div>

        </div>
      </div>

      <style>{`
        /* Completely invisible scrollbar for the entire page AND dropdown */
        body::-webkit-scrollbar{ 
          display: none !important; 
        }
        body{ 
          -ms-overflow-style: none !important; 
          scrollbar-width: none !important; 
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
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
      className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 mx-2 hover:bg-red-50 rounded-[1.2rem] sm:rounded-[1.8rem] transition-all group border-b border-gray-50 last:border-none"
    >
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-slate-100 rounded-[0.8rem] sm:rounded-[1.2rem] overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer bg-slate-200" />}
        <img
          src={restaurant.img}
          alt={restaurant.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        />
      </div>
      <div className="text-left">
        <h4 className="font-black text-slate-800 group-hover:text-red-600 transition-colors text-sm sm:text-lg">{restaurant.name}</h4>
        <p className="text-[10px] sm:text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {restaurant.address}
        </p>
      </div>
    </Link>
  );
};

export default Header;