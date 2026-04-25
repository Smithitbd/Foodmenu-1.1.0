//cartpage.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../src/context/CartContext'; 
import { 
  FaShoppingCart, FaPlus, FaPhoneAlt, FaSearch, 
  FaArrowLeft, FaCheck, FaTimes, FaChevronDown, FaTag, FaClock, FaCalendarDay 
} from "react-icons/fa"; 
import { FaLocationDot } from "react-icons/fa6"; 
import Swal from 'sweetalert2';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantPage = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- States ---
  const [menuData, setMenuData] = useState({}); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(6); 
  const [tickedId, setTickedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(0);

  const cartKey = `global_cart_data`;

  // --- Cart Sync ---
  useEffect(() => {
    const syncCartCount = () => {
      const savedCart = JSON.parse(sessionStorage.getItem(cartKey)) || [];
      const total = savedCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setLocalCartCount(total);
    };
    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('focus', syncCartCount);
    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('focus', syncCartCount);
    };
  }, [cartKey]);

  // --- API Fetch Function ---
  const fetchFullData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/public/restaurant/${restaurantSlug}`);
      if (response.data) {
        setProfile(response.data.profile);
        setMenuData(response.data.menu || {});
      }
    } catch (err) {
      setError(err.response?.data?.message || "Restaurant not found");
    } finally {
      if (!isSilent) setTimeout(() => setLoading(false), 800);
    }
  }, [restaurantSlug]);
  
  // --- Auto Refresh Logic (Every 10 Seconds) ---
  useEffect(() => {
    fetchFullData();
    const interval = setInterval(() => {
      fetchFullData(true); // Silent refresh in background
    }, 10000); 
    return () => clearInterval(interval);
  }, [fetchFullData]);


  // --- Opening Time Formatter ---
  const getOpeningStatus = () => {
    if (!profile?.opening_time) return "Check back soon";
    
    const [hours, minutes] = profile.opening_time.split(':');
    const openTime = new Date();
    openTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const timeString = openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const now = new Date();
    if (now > openTime) {
      return `Opens Tomorrow at ${timeString}`;
    }
    return `Opens Today at ${timeString}`;
  };

    
  
  // ১. সব প্রোডাক্টকে এক লিস্টে আনা
  const allProducts = useMemo(() => {
    let list = [];
    Object.values(menuData).forEach(catProds => {
      if (Array.isArray(catProds)) {
        // শুধু p.is_available === 1 অথবা p.is_available === true ফিল্টার করা হলো
        const availableOnly = catProds.filter(p => p.is_available == 1);
        list = [...list, ...availableOnly];
      }
    });
    return list;
  }, [menuData]);

  // ২. অফার আছে এমন প্রোডাক্টগুলো বের করা (যদি old_price থাকে)
  const offerProducts = useMemo(() => {
    return allProducts.filter(p => p.old_price && Number(p.old_price) > Number(p.display_price));
  }, [allProducts]);

  // ৩. ক্যাটাগরি লিস্ট তৈরি (অফার থাকলে সবার আগে আসবে)
  const categories = useMemo(() => {
    const cats = [];
    if (offerProducts.length > 0) {
      cats.push('Offers 🎁'); // অফার থাকলে সবার উপরে আসবে
    }
    cats.push('All');
    Object.keys(menuData).forEach(cat => {
      if (!cats.includes(cat)) cats.push(cat);
    });
    return cats;
  }, [menuData, offerProducts]);

  // ৪. ফিল্টার্ড প্রোডাক্টস
  const filteredProducts = useMemo(() => {
    let prods = [];
    if (activeCategory === 'Offers 🎁') {
      prods = offerProducts;
    } else if (activeCategory === 'All') {
      prods = allProducts;
    } else {
      prods = menuData[activeCategory] || [];
    }

    if (searchTerm) {
      prods = prods.filter(p => p.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return prods;
  }, [menuData, activeCategory, searchTerm, allProducts, offerProducts]);

  const handleAddToCart = async (product) => {
    // If restaurant is off
    if (profile?.is_online === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Restaurant Closed',
        text: `We are currently not taking orders. We will be back ${getOpeningStatus()}`,
        confirmButtonColor: '#e11d48',
        customClass: { popup: 'rounded-[30px]' }
      });
      return; 
    }
    const cartItem = {
      id: product.id,
      name: product.display_name,
      price: product.display_price,
      img: product.images[0] || "https://via.placeholder.com/150",
      restaurant_id: profile?.id,
      restaurantSlug: restaurantSlug
    };


    const result = await addToCart(cartItem, restaurantSlug);
    
    if (result && result.status === 'success') {
      setTickedId(product.id);
      setIsCartBouncing(true);
      setLocalCartCount(prev => prev + 1);

      Swal.fire({
        toast: true,
        position: 'bottom-center',
        showConfirmButton: false,
        timer: 1500,
        icon: 'success',
        title: `${product.display_name} added!`,
        background: '#1a1a1a',
        color: '#fff',
      });

      setTimeout(() => { 
        setTickedId(null); 
        setIsCartBouncing(false); 
      }, 1000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-rose-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-900 tracking-tighter italic uppercase">Preparing Delicious Menu...</p>
    </div>
  );

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold px-10 text-center uppercase tracking-widest">{error}</div>;

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32 font-inter">
      <style>{`
        .glass-morphism { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .green-pop { animation: pop 0.4s ease forwards; background: #22c55e !important; color: white !important; }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .cart-bounce { animation: cartBounce 0.5s ease; }
        @keyframes cartBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); } }
        
        /* Blinking Animation for Offers */
        .blink-offer { animation: blinker 1.2s cubic-bezier(.5, 0, 1, 1) infinite alternate; background: #be123c !important; color: white !important; }
        @keyframes blinker { from { opacity: 1; transform: scale(1.05); } to { opacity: 0.7; transform: scale(1); } }
      `}</style>

      {/* Hero Section */}
      <div className="h-[45vh] md:h-[500px] relative overflow-hidden bg-slate-900">
        <img src={profile?.bg_image || "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg"} className="w-full h-full object-cover opacity-60" alt="cover" />
        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 z-50 bg-white/20 hover:bg-white/40 backdrop-blur-lg p-4 rounded-2xl text-white border border-white/20 transition-all">
          <FaArrowLeft />
        </button>
        <div className="absolute bottom-12 left-5 right-5 md:left-20 z-20">
          <div className="flex items-center gap-4 md:gap-8 glass-morphism p-4 md:p-6 rounded-[35px] md:rounded-[45px] shadow-2xl w-full max-w-3xl">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[25px] flex items-center justify-center p-2 shadow-inner overflow-hidden">
                <img src={profile?.logo} className="w-full h-full object-contain" alt="logo" />
            </div>
            <div className="flex-1">
                <h1 className="text-2xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{profile?.restaurant_name}</h1>
                <div className="flex items-center gap-2 text-white/80">
                  <FaLocationDot className="text-orange-500 text-sm md:text-xl" />
                  <span className="text-[10px] md:text-lg font-bold uppercase tracking-widest">{profile?.location}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 -mt-10 md:-mt-14 relative z-30">
        {/* Search Bar */}
        <div className="bg-white shadow-2xl rounded-[35px] md:rounded-[55px] p-3 flex flex-col xl:flex-row gap-4 border border-white">
          <div className="flex-1 flex items-center px-6 h-16 md:h-20 bg-slate-50 rounded-[30px] md:rounded-[45px]">
            <FaSearch className="text-slate-300 mr-4" size={20} />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              className="w-full bg-transparent outline-none font-bold text-lg text-slate-800" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex gap-3">
            <a href={`tel:${profile?.contact_mobile}`} className="flex-1 xl:w-56 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-[30px] md:rounded-[45px] font-black text-sm flex items-center justify-center gap-3 px-8 h-16 md:h-20 shadow-lg shadow-rose-200">
              <FaPhoneAlt /> <span>ORDER NOW</span>
            </a>
          </div>
        </div>

        {/* --- RESTAURANT CLOSED ALERT --- */}
        {profile?.is_online === 0 && (
          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} className="mt-8 bg-amber-50 border-2 border-amber-200 p-6 md:p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-100">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 animate-pulse">
                <FaClock size={30} />
              </div>
              <div>
                <h3 className="text-xl md:text-3xl font-black text-amber-900 uppercase italic tracking-tighter">We're Currently Resting</h3>
                <p className="text-amber-700 font-bold uppercase text-[10px] md:text-xs tracking-widest mt-1 flex items-center gap-2">
                  <FaCalendarDay /> {getOpeningStatus()}
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="bg-amber-200 text-amber-900 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Store Closed</span>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mt-12 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-80 lg:sticky lg:top-28 z-40">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 p-6 overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Categories</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => {
                      setActiveCategory(cat); 
                      setVisibleCount(6);
                    }} 
                    className={`flex-shrink-0 px-6 py-4 rounded-2xl font-black text-[11px] uppercase transition-all duration-300 flex items-center justify-between 
                    ${cat === 'Offers 🎁' ? 'blink-offer' : (activeCategory === cat ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}
                  >
                    <span className="flex items-center gap-2">
                      {cat === 'Offers 🎁'}
                      {cat}
                    </span>
                    {activeCategory === cat && <motion.div layoutId="dot" className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="flex-1 w-full min-h-[600px]">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
                {activeCategory.replace(' 🎁', '')} <span className="text-rose-600">Items</span>
              </h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{filteredProducts.length} Total</p>
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              <AnimatePresence mode='popLayout'>
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={product.id} 
                    className="bg-white rounded-[40px] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group cursor-pointer relative" 
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-square relative overflow-hidden rounded-[30px] bg-slate-100">
                      <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.display_name} />
                      
                      {/* Offer Badge on Card */}
                      {product.old_price && Number(product.old_price) > Number(product.display_price) && (
                        <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-xl font-black text-[10px] shadow-lg flex items-center gap-1">
                          <FaTag size={8}/> SAVE ৳{product.old_price - product.display_price}
                        </div>
                      )}

                      <button 
                        
                        disabled={product.is_available == 0 || profile?.is_online === 0} // If the restaurant is close or the product is currently not available
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} 
                        className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl z-20 transition-all 
                          ${(product.is_available == 0 || profile?.is_online === 0) ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 
                            (tickedId === product.id ? 'green-pop' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white')}`}
                    >
                        {product.is_available == 0 ? <FaTimes /> : (profile?.is_online === 0 ? <FaTimes /> : (tickedId === product.id ? <FaCheck /> : <FaPlus />))}
                    </button>

                      {/*<button 
                          disabled={product.is_available == 0} 
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} 
                          className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl z-20 transition-all 
                            ${product.is_available == 0 ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 
                              (tickedId === product.id ? 'green-pop' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white')}`}
                        >
                          {product.is_available == 0 ? <FaTimes /> : (tickedId === product.id ? <FaCheck /> : <FaPlus />)}
                      </button>*/}
                    </div>
                    <div className="mt-5 px-2">
                      <h4 className="text-xl font-black text-slate-800 italic truncate">{product.display_name}</h4>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          {product.old_price && <span className="text-slate-400 text-xs line-through font-bold">৳{product.old_price}</span>}
                          <span className="text-2xl font-black text-slate-950 italic leading-none">৳{product.display_price}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{product.category}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="flex items-center gap-3 bg-white border-2 border-slate-900 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-95 group"
                >
                  <FaChevronDown className="group-hover:translate-y-1 transition-transform" /> 
                  Load More Dishes
                </button>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="text-slate-200" size={30} />
                </div>
                <h3 className="text-xl font-black text-slate-900 italic uppercase">No items found</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Try a different search or category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- FIXED FLOATING CART ICON --- */}
      {localCartCount > 0 && (
        <div className="fixed bottom-8 right-8 z-[9999]">
          <Link to={`/cart/${restaurantSlug}/ConfirmCart`} 
            className={`w-20 h-20 md:w-28 md:h-28 rounded-[30px] md:rounded-[40px] flex items-center justify-center shadow-2xl border-4 border-white bg-rose-600 transition-all
            ${isCartBouncing ? 'cart-bounce' : 'hover:scale-110 active:scale-95'}`}>
            <div className="relative">
              <FaShoppingCart className="text-white text-2xl md:text-4xl" />
              <span className="absolute -top-4 -right-4 bg-slate-900 text-white text-[10px] md:text-xs font-black w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-rose-600">
                {localCartCount}
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-[40px] md:rounded-[50px] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative shadow-2xl"
            >
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-[70] bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg hover:bg-rose-600 hover:text-white transition-all">
                <FaTimes size={20}/>
              </button>
              <div className="w-full md:w-1/2 h-80 md:h-[600px] relative">
                <img src={selectedProduct.images[0]} className="w-full h-full object-cover" alt="detail" />
                {selectedProduct.old_price && (
                  <div className="absolute top-6 left-6 bg-rose-600 text-white px-6 py-2 rounded-2xl font-black animate-pulse shadow-xl">
                      SPECIAL OFFER 🔥
                  </div>
                )}
              </div>
              <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
                <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-4 bg-orange-50 px-4 py-2 rounded-full w-fit">
                  {selectedProduct.category}
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 italic mb-6 leading-tight uppercase tracking-tighter">
                  {selectedProduct.display_name}
                </h2>
                <div className="flex flex-col mb-10">
                  {selectedProduct.old_price && <span className="text-slate-400 font-bold text-2xl line-through">৳{selectedProduct.old_price}</span>}
                  <span className="text-5xl md:text-7xl font-black italic text-slate-950 tracking-tighter">৳{selectedProduct.display_price}</span>
                </div>
                <button 
                  onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-rose-600 transition-colors shadow-2xl shadow-slate-200"
                >
                  ADD TO BASKET
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantPage;