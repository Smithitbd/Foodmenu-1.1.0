import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../src/context/CartContext'; 
import { 
  FaShoppingCart, FaPlus, FaPhoneAlt, FaSearch, 
  FaCommentDots, FaArrowLeft, FaCheck, FaEye, FaTimes, FaArrowDown, FaUtensils  
} from "react-icons/fa"; 
import { FaLocationDot, FaMessage } from "react-icons/fa6"; 
import Swal from 'sweetalert2';
import axios from 'axios';

const RestaurantPage = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  // --- States ---
  const [menuData, setMenuData] = useState({}); // Categories as keys
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(6); 
  const [tickedId, setTickedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const sidebarRef = useRef(null);

  // --- API Fetch ---
  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setLoading(true);
        // আপনার নতুন Single API ব্যবহার করা হয়েছে
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
  const categories = useMemo(() => {
    return ['All', ...Object.keys(menuData)];
  }, [menuData]);

  const allProducts = useMemo(() => {
    let list = [];
    Object.values(menuData).forEach(catProds => {
      list = [...list, ...catProds];
    });
    return list;
  }, [menuData]);

  const filteredProducts = useMemo(() => {
    let prods = activeCategory === 'All' ? allProducts : (menuData[activeCategory] || []);
    if (searchTerm) {
      prods = allProducts.filter(p => p.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return prods;
  }, [menuData, activeCategory, searchTerm, allProducts]);

  // --- Cart Logic ---
  const handleAddToCart = async (product) => {
    const cartItem = {
      id: product.id,
      name: product.display_name,
      price: product.display_price,
      img: product.images[0] || "https://via.placeholder.com/150",
      restaurant_id: profile.id
    };

    const result = await addToCart(cartItem, restaurantSlug);
    
    if (result && result.status === 'success') {
      setTickedId(product.id);
      setIsCartBouncing(true);
      
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

  const cartTotalItems = useMemo(() => {
    return Array.isArray(cart) ? cart.reduce((total, item) => total + (item.quantity || 0), 0) : 0;
  }, [cart]);

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
        <img 
          src={profile.bg_image || "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg"} 
          className="w-full h-full object-cover opacity-60" 
          alt="cover" 
        />
        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 z-50 bg-white/20 hover:bg-white/40 backdrop-blur-lg p-4 rounded-2xl text-white border border-white/20 transition-all">
          <FaArrowLeft />
        </button>
        
        <div className="absolute bottom-12 left-5 right-5 md:left-20 z-20">
          <div className="flex items-center gap-4 md:gap-8 glass-morphism p-4 md:p-6 rounded-[35px] md:rounded-[45px] shadow-2xl w-full max-w-3xl">
             <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[25px] flex items-center justify-center p-2 shadow-inner">
                <img src={profile.logo} className="w-full h-full object-contain" alt="logo" />
             </div>
             <div className="flex-1">
                <h1 className="text-2xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                  {profile.restaurant_name}
                </h1>
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
            <input 
              type="text" 
              placeholder="Search dishes..." 
              className="w-full bg-transparent outline-none font-bold text-lg text-slate-800" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex gap-3">
            <a href={`tel:${profile.contact_mobile}`} className="flex-1 xl:w-56 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-[30px] md:rounded-[45px] font-black text-sm flex items-center justify-center gap-3 px-8 h-16 md:h-20 shadow-lg shadow-rose-200">
              <FaPhoneAlt /> <span>ORDER NOW</span>
            </a>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex flex-col lg:flex-row gap-8 mt-12 items-start">
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 lg:sticky lg:top-28 z-40">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 p-6">
              <div className="hidden lg:flex items-center gap-3 mb-6 px-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><FaUtensils size={18} /></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Categories</h3>
              </div>
              <div ref={sidebarRef} className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => {setActiveCategory(cat); setVisibleCount(6);}}
                    className={`flex-shrink-0 px-6 py-4 rounded-2xl font-black text-[11px] uppercase transition-all duration-300 flex items-center justify-between
                    ${activeCategory === cat 
                      ? 'bg-slate-900 text-white shadow-xl scale-105' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
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
                <div key={product.id} 
                  className="bg-white rounded-[40px] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-square relative overflow-hidden rounded-[30px] bg-slate-100">
                    <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.display_name} />
                    
                    {product.has_offer === 1 && (
                      <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-10">
                        OFFER
                      </div>
                    )}

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl z-20 transition-all
                      ${tickedId === product.id ? 'green-pop' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white'}`}
                    >
                      {tickedId === product.id ? <FaCheck /> : <FaPlus />}
                    </button>
                  </div>
                  
                  <div className="mt-5 px-2">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{product.category}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 italic truncate leading-tight">{product.display_name}</h4>
                    <div className="flex items-end gap-3 mt-4">
                      <span className="text-2xl font-black text-slate-950 italic">৳{product.display_price}</span>
                      {product.has_offer === 1 && (
                        <span className="text-sm text-slate-400 line-through mb-1">৳{product.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {visibleCount < filteredProducts.length && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)} 
                  className="flex items-center gap-3 bg-white border-2 border-slate-100 px-10 py-5 rounded-full font-black text-slate-900 hover:bg-slate-50 transition-all shadow-xl shadow-slate-100"
                >
                  LOAD MORE DELICIOUSNESS <FaArrowDown />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Icon */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-8 right-8 z-[9999] animate-in fade-in zoom-in duration-300">
          <Link to={`/cart/${restaurantSlug}/ConfirmCart`} 
            className={`w-20 h-20 md:w-28 md:h-28 rounded-[30px] md:rounded-[40px] flex items-center justify-center shadow-2xl border-4 border-white bg-rose-600 transition-all
            ${isCartBouncing ? 'cart-bounce' : 'hover:scale-110 active:scale-95'}`}>
            <div className="relative">
              <FaShoppingCart className="text-white text-2xl md:text-4xl" />
              <span className="absolute -top-4 -right-4 bg-slate-900 text-white text-[10px] md:text-xs font-black w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-rose-600 animate-pulse">
                {cartTotalItems}
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="bg-white rounded-t-[40px] md:rounded-[50px] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative shadow-2xl">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-6 right-6 z-[70] bg-slate-100 hover:bg-rose-500 hover:text-white p-4 rounded-2xl transition-all shadow-sm"
            >
              <FaTimes size={20}/>
            </button>
            
            <div className="w-full md:w-1/2 h-80 md:h-auto bg-slate-50">
              <img src={selectedProduct.images[0]} className="w-full h-full object-cover" alt="detail" />
            </div>
            
            <div className="p-10 md:p-16 flex-1">
              <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">
                {selectedProduct.category}
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 italic mb-6 leading-none">
                {selectedProduct.display_name}
              </h2>
              <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                {selectedProduct.description || "Freshly prepared with authentic ingredients. Experience the taste of quality in every bite."}
              </p>
              
              <div className="flex items-center gap-4 mb-10">
                <span className="text-5xl font-black italic text-slate-900">৳{selectedProduct.display_price}</span>
                {selectedProduct.has_offer === 1 && (
                  <span className="text-2xl text-slate-300 line-through">৳{selectedProduct.price}</span>
                )}
              </div>

              <button 
                onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} 
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-orange-600 transition-all shadow-2xl shadow-slate-200"
              >
                ADD TO BASKET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;