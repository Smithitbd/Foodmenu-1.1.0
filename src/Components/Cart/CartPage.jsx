import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../src/context/CartContext'; 
import { 
  FaShoppingCart, FaPlus, FaPhoneAlt, FaSearch, 
  FaCommentDots, FaArrowLeft, FaCheck, FaEye, FaTimes, FaArrowDown, FaUtensils  
} from "react-icons/fa"; 
import { FaLocationDot } from "react-icons/fa6"; 
import Swal from 'sweetalert2';
import axios from 'axios';

const RestaurantPage = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // cart variable removed from here to use local sync

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
  
  // কার্ট নাম্বার লাইভ আপডেট করার জন্য লোকাল স্টেট
  const [localCartCount, setLocalCartCount] = useState(0);

  const sidebarRef = useRef(null);
  const cartKey = `global_cart_data`;

  // --- Cart Sync Logic (FIXED) ---
  // এই ইফেক্টটি চেক করবে সেশনে কোনো পরিবর্তন হয়েছে কি না
  useEffect(() => {
    const syncCartCount = () => {
      const savedCart = JSON.parse(sessionStorage.getItem(cartKey)) || [];
      const total = savedCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setLocalCartCount(total);
    };

    syncCartCount(); // Initial load

    // পেজ ফোকাস হলে বা স্টোরেজ চেঞ্জ হলে আপডেট হবে
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('focus', syncCartCount);

    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('focus', syncCartCount);
    };
  }, [cartKey]);

  // --- API Fetch ---
  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/public/restaurant/${restaurantSlug}`);
        if (response.data) {
          setProfile(response.data.profile);
          setMenuData(response.data.menu);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Restaurant not found or server error");
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, [restaurantSlug]);

  // --- Filter Logic ---
  const categories = useMemo(() => ['All', ...Object.keys(menuData)], [menuData]);

  const allProducts = useMemo(() => {
    let list = [];
    Object.values(menuData).forEach(catProds => { list = [...list, ...catProds]; });
    return list;
  }, [menuData]);

  const filteredProducts = useMemo(() => {
    let prods = activeCategory === 'All' ? allProducts : (menuData[activeCategory] || []);
    if (searchTerm) {
      prods = allProducts.filter(p => p.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return prods;
  }, [menuData, activeCategory, searchTerm, allProducts]);

  // --- Add To Cart Logic ---
  const handleAddToCart = async (product) => {
    const cartItem = {
      id: product.id,
      name: product.display_name,
      price: product.display_price,
      img: product.images[0] || "https://via.placeholder.com/150",
      restaurant_id: profile.id,
      restaurantSlug: restaurantSlug // নিশ্চিত করুন স্লাগটি যাচ্ছে
    };

    const result = await addToCart(cartItem, restaurantSlug);
    
    if (result && result.status === 'success') {
      setTickedId(product.id);
      setIsCartBouncing(true);
      
      // লোকাল কাউন্ট সাথে সাথে বাড়ানো
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl animate-pulse">🍱 Loading Delicious Menu...</div>;
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
      `}</style>

      {/* Hero Section */}
      <div className="h-[45vh] md:h-[500px] relative overflow-hidden bg-slate-900">
        <img src={profile.bg_image || "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg"} className="w-full h-full object-cover opacity-60" alt="cover" />
        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 z-50 bg-white/20 hover:bg-white/40 backdrop-blur-lg p-4 rounded-2xl text-white border border-white/20 transition-all">
          <FaArrowLeft />
        </button>
        <div className="absolute bottom-12 left-5 right-5 md:left-20 z-20">
          <div className="flex items-center gap-4 md:gap-8 glass-morphism p-4 md:p-6 rounded-[35px] md:rounded-[45px] shadow-2xl w-full max-w-3xl">
             <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[25px] flex items-center justify-center p-2 shadow-inner">
                <img src={profile.logo} className="w-full h-full object-contain" alt="logo" />
             </div>
             <div className="flex-1">
                <h1 className="text-2xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{profile.restaurant_name}</h1>
                <div className="flex items-center gap-2 text-white/80">
                   <FaLocationDot className="text-orange-500 text-sm md:text-xl" />
                   <span className="text-[10px] md:text-lg font-bold uppercase tracking-widest">{profile.location}</span>
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
            <input type="text" placeholder="Search dishes..." className="w-full bg-transparent outline-none font-bold text-lg text-slate-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <a href={`tel:${profile.contact_mobile}`} className="flex-1 xl:w-56 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-[30px] md:rounded-[45px] font-black text-sm flex items-center justify-center gap-3 px-8 h-16 md:h-20 shadow-lg shadow-rose-200"><FaPhoneAlt /> <span>ORDER NOW</span></a>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-12 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-80 lg:sticky lg:top-28 z-40">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 p-6">
              <div className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => {setActiveCategory(cat); setVisibleCount(6);}} className={`flex-shrink-0 px-6 py-4 rounded-2xl font-black text-[11px] uppercase transition-all duration-300 flex items-center justify-between ${activeCategory === cat ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    <span>{cat}</span>
                    {activeCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <div key={product.id} className="bg-white rounded-[40px] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <div className="aspect-square relative overflow-hidden rounded-[30px] bg-slate-100">
                    <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.display_name} />
                    <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl z-20 transition-all ${tickedId === product.id ? 'green-pop' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white'}`}>
                      {tickedId === product.id ? <FaCheck /> : <FaPlus />}
                    </button>
                  </div>
                  <div className="mt-5 px-2">
                    <h4 className="text-xl font-black text-slate-800 italic truncate">{product.display_name}</h4>
                    <div className="flex items-end gap-3 mt-4">
                      <span className="text-2xl font-black text-slate-950 italic">৳{product.display_price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      {selectedProduct && (
        <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-t-[40px] md:rounded-[50px] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-[70] bg-slate-100 p-4 rounded-2xl"><FaTimes size={20}/></button>
            <div className="w-full md:w-1/2 h-80 md:h-auto"><img src={selectedProduct.images[0]} className="w-full h-full object-cover" alt="detail" /></div>
            <div className="p-10 md:p-16 flex-1">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 italic mb-6">{selectedProduct.display_name}</h2>
              <div className="flex items-center gap-4 mb-10"><span className="text-5xl font-black italic">৳{selectedProduct.display_price}</span></div>
              <button onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl">ADD TO BASKET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;