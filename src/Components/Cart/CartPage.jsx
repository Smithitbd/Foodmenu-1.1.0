import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../src/context/CartContext'; 
import { 
  FaShoppingCart, FaPlus, FaPhoneAlt, FaSearch, 
  FaCommentDots, FaArrowLeft, FaCheck, FaEye, FaTimes, FaArrowDown 
} from "react-icons/fa"; 
import { FaLocationDot } from "react-icons/fa6"; 
import Swal from 'sweetalert2';

const RestaurantPage = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isUserFiltering, setIsUserFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(6); 
  const [tickedId, setTickedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const [restaurantData] = useState({
    logo: "https://cdn-icons-png.flaticon.com/512/732/732217.png", 
    name: restaurantSlug?.replace(/-/g, ' '),
    location: "Zindabazar, Sylhet"
  });

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isUserFiltering || searchTerm !== '') return;
    const observerOptions = { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cat = entry.target.getAttribute('data-category');
          setActiveCategory(cat);
          const activeBtn = document.getElementById(`btn-${cat}`);
          if (activeBtn && sidebarRef.current) {
            sidebarRef.current.scrollTo({
              left: activeBtn.offsetLeft - 20,
              behavior: 'smooth'
            });
          }
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('.product-card').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleCount, searchTerm, isUserFiltering]);

  const handleCategoryClick = (cat) => {
    if (cat === 'All') {
      setIsUserFiltering(false);
      setActiveCategory('All');
      setVisibleCount(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsUserFiltering(true);
      setActiveCategory(cat);
    }
  };

  // ✅ FIXED handleAddToCart
  const handleAddToCart = async (product, id) => {
    try {
      const result = await addToCart(product, restaurantSlug);
      
      // শুধুমাত্র 'success' হলেই পরবর্তী কাজগুলো হবে
      if (result && result.status === 'success') {
        setTickedId(id);
        setIsCartBouncing(true);

        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-center',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });

        Toast.fire({
          icon: 'success',
          title: `${product.name} added!`,
          background: '#1a1a1a',
          color: '#fff',
          iconColor: '#22c55e',
        });

        setTimeout(() => { 
          setTickedId(null); 
          setIsCartBouncing(false); 
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    let prods = [
      { id: 1, category: 'Food Offer', img: 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg', name: 'Club Sandwich Deal', price: 180, desc: "Buy 1 Get 1 Club Sandwich with Fries." },
      { id: 2, category: 'Food Offer', img: 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg', name: 'Butter Naan Combo', price: 120, desc: "2 Butter Naan with Chicken Reshmi Kabab." },
      { id: 3, category: 'Food Offer', img: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg', name: 'Pizza Party Pack', price: 999, desc: "2 Medium Pizzas with 1L Coke." },
      { id: 4, category: 'Main Course', img: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg', name: 'Mutton Kacchi', price: 450, desc: "Traditional Sylheti Kacchi with Saffron Rice." },
      { id: 5, category: 'Main Course', img: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg', name: 'Grilled Chicken', price: 320, desc: "Quarter Grilled Chicken with Garlic Sauce." },
      { id: 6, category: 'Main Course', img: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg', name: 'Beef Tehari', price: 280, desc: "Old Dhaka style aromatic Beef Tehari." },
      { id: 7, category: 'Main Course', img: 'https://images.pexels.com/photos/9609835/pexels-photo-9609835.jpeg', name: 'Chicken Roast', price: 150, desc: "Wedding style Chicken Roast." },
      { id: 8, category: 'Fast Food', img: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', name: 'Cheese Burger', price: 280, desc: "Juicy beef patty with extra cheddar." },
      { id: 9, category: 'Fast Food', img: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg', name: 'Crispy Wings', price: 220, desc: "6pcs Spicy Deep Fried Wings." },
      { id: 10, category: 'Fast Food', img: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', name: 'French Fries', price: 120, desc: "Large bucket of salted fries." },
      { id: 11, category: 'Fast Food', img: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', name: 'Chicken Shawarma', price: 160, desc: "Leads style pita bread wrap." },
      { id: 12, category: 'Seafood', img: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg', name: 'Grilled Salmon', price: 850, desc: "Imported Salmon with butter lemon sauce." },
      { id: 13, category: 'Seafood', img: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg', name: 'Prawn Tempura', price: 550, desc: "8pcs Jumbo Prawn Tempura." },
      { id: 14, category: 'Seafood', img: 'https://images.pexels.com/photos/2827263/pexels-photo-2827263.jpeg', name: 'Fish & Chips', price: 420, desc: "Crispy Batter Fried Fish with tartar sauce." },
      { id: 15, category: 'Indian', img: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg', name: 'Chicken Tikka', price: 380, desc: "Smoky tandoori marinated chicken." },
      { id: 16, category: 'Indian', img: 'https://images.pexels.com/photos/6232532/pexels-photo-6232532.jpeg', name: 'Paneer Butter Masala', price: 320, desc: "Creamy vegetarian delight." },
      { id: 17, category: 'Indian', img: 'https://images.pexels.com/photos/3926133/pexels-photo-3926133.jpeg', name: 'Dal Makhani', price: 180, desc: "Slow cooked black lentils with butter." },
      { id: 18, category: 'Chinese', img: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg', name: 'Hakka Noodles', price: 220, desc: "Stir-fried noodles with veggies." },
      { id: 19, category: 'Chinese', img: 'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg', name: 'Manchurian Chicken', price: 350, desc: "Spicy & sour gravy chicken." },
      { id: 20, category: 'Chinese', img: 'https://images.pexels.com/photos/1241913/pexels-photo-1241913.jpeg', name: 'Egg Fried Rice', price: 200, desc: "Classic wok-tossed fried rice." }
    ];

    if (searchTerm) return prods.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (isUserFiltering) return prods.filter(p => p.category === activeCategory);
    return prods;
  }, [searchTerm, activeCategory, isUserFiltering]);

  // ✅ Reliable Item Count
  const cartTotalItems = useMemo(() => {
    return Array.isArray(cart) ? cart.reduce((total, item) => total + (item.quantity || 0), 0) : 0;
  }, [cart]);

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32 font-inter overflow-x-hidden">
      <style>{`
        .glass-morphism { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .green-pop { animation: pop 0.4s ease forwards; background: #22c55e !important; color: white !important; }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .cart-bounce { animation: cartBounce 0.5s ease; }
        @keyframes cartBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); } }
      `}</style>

      {/* Hero Section */}
      <div className="h-[45vh] md:h-[550px] relative overflow-hidden bg-slate-900">
        <img src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg" className="w-full h-full object-cover opacity-40" alt="" />
        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 z-50 bg-white/10 backdrop-blur-lg p-4 rounded-2xl text-white border border-white/20"><FaArrowLeft /></button>
        <div className="absolute bottom-12 left-5 right-5 md:left-20 z-20">
          <div className="flex items-center gap-4 md:gap-8 glass-morphism p-4 md:p-8 rounded-[35px] md:rounded-[50px] shadow-2xl w-full max-w-3xl">
             <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[25px] flex items-center justify-center p-3">
                <img src={restaurantData.logo} className="w-full h-auto" alt="logo" />
             </div>
             <div className="flex-1">
                <h1 className="text-3xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">{restaurantData.name}</h1>
                <div className="flex items-center gap-2 mt-2 md:mt-4 text-white/70">
                   <FaLocationDot className="text-[#ff4d00] text-sm md:text-xl" />
                   <span className="text-[10px] md:text-lg font-bold uppercase tracking-widest">{restaurantData.location}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 -mt-10 md:-mt-14 relative z-30">
        {/* Search Bar Area */}
        <div className="bg-white shadow-2xl rounded-[35px] md:rounded-[55px] p-3 md:p-4 flex flex-col xl:flex-row gap-4 border border-white">
          <div className="flex-1 flex items-center px-6 md:px-10 h-16 md:h-20 bg-slate-50 rounded-[30px] md:rounded-[45px]">
            <FaSearch className="text-slate-300 mr-4 md:mr-6" size={20} />
            <input type="text" placeholder="Search..." className="w-full bg-transparent outline-none font-bold text-lg md:text-xl text-slate-800" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-3 h-16 md:h-20">
             <button className="flex-1 xl:w-48 bg-[#fff5f2] text-[#ff4d00] rounded-[30px] md:rounded-[45px] font-black text-xs md:text-sm flex items-center justify-center gap-2"><FaCommentDots size={18}/> <span>MESSAGE</span></button>
             <a href="tel:+88" className="flex-1 xl:w-48 bg-gradient-to-r from-[#be1e2d] to-[#ff4d00] text-white rounded-[30px] md:rounded-[45px] font-black text-xs md:text-sm flex items-center justify-center gap-2"><FaPhoneAlt size={16}/> <span>CALL NOW</span></a>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-14 mt-12 md:mt-24 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-[300px] lg:sticky lg:top-28 z-40">
            <div className="bg-white p-5 md:p-7 rounded-[40px] border border-slate-100 shadow-xl">
              <div ref={sidebarRef} className="flex lg:flex-col gap-2 md:gap-3 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
                {['All', 'Food Offer', 'Main Course', 'Fast Food', 'Seafood', 'Indian', 'Chinese'].map((cat) => (
                  <button key={cat} id={`btn-${cat}`} onClick={() => handleCategoryClick(cat)}
                    className={`flex-shrink-0 px-6 py-4 rounded-[22px] font-black text-[10px] md:text-[11px] uppercase transition-all duration-300 flex items-center justify-between min-w-fit lg:min-w-0
                    ${activeCategory === cat ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    <span>{cat}</span>
                    {activeCategory === cat && <div className="hidden lg:block w-2.5 h-2.5 rounded-full bg-[#ff4d00]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
              {filteredProducts.slice(0, isUserFiltering ? 99 : visibleCount).map((product) => (
                <div key={product.id} data-category={product.category}
                  className="product-card bg-white rounded-[45px] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 group cursor-pointer" 
                  onClick={() => setSelectedProduct(product)}>
                  <div className="aspect-square relative overflow-hidden rounded-[35px]">
                    <img src={product.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    
                    <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product, product.id); }}
                      className={`absolute top-4 right-4 w-14 h-14 rounded-[22px] flex items-center justify-center shadow-xl z-10 transition-all
                      ${tickedId === product.id ? 'green-pop' : 'bg-white/90 backdrop-blur-md text-[#be1e2d] hover:bg-[#be1e2d] hover:text-white'}`}>
                      {tickedId === product.id ? <FaCheck size={20} /> : <FaPlus size={20} />}
                    </button>
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-[#ff4d00] uppercase tracking-widest">{product.category}</span>
                    <h4 className="text-xl font-black text-slate-800 italic mt-1">{product.name}</h4>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-2xl font-black text-slate-950 italic">৳{product.price}</span>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-black group-hover:text-white transition-all"><FaEye size={18}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!isUserFiltering && !searchTerm && visibleCount < filteredProducts.length && (
              <div className="mt-16 flex justify-center">
                <button onClick={() => setVisibleCount(prev => prev + 6)} className="flex items-center gap-3 bg-white border-2 border-slate-200 px-10 py-5 rounded-full font-black text-slate-900 shadow-xl">EXPLORE MORE <FaArrowDown /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ PERSISTENT Floating Cart UI */}
      {/* z-index অনেক বাড়ানো হয়েছে এবং লজিক চেক করা হয়েছে */}
      <div className={`fixed bottom-8 right-8 z-[9999] transition-all duration-500 ${cartTotalItems > 0 ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20'}`}>
        <Link to={`/cart/${restaurantSlug}/ConfirmCart`} 
          className={`w-20 h-20 md:w-32 md:h-32 rounded-[30px] md:rounded-[45px] flex items-center justify-center shadow-[0_20px_50px_rgba(190,30,45,0.3)] border-8 border-white bg-[#be1e2d] transition-all duration-300
          ${isCartBouncing ? 'cart-bounce' : 'hover:rotate-6 active:scale-90'}`}>
          <div className="relative">
            <FaShoppingCart className="text-white text-3xl md:text-5xl" />
            <span className="absolute -top-3 -right-3 md:-top-5 md:-right-5 bg-black text-white text-[10px] md:text-sm font-black w-8 h-8 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-[#be1e2d] animate-bounce">
              {cartTotalItems}
            </span>
          </div>
        </Link>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-white rounded-t-[40px] md:rounded-[60px] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 z-50 bg-slate-100 p-4 rounded-full"><FaTimes/></button>
            <div className="w-full md:w-1/2 h-72 md:h-auto"><img src={selectedProduct.img} className="w-full h-full object-cover" alt="" /></div>
            <div className="p-8 md:p-16 flex-1 flex flex-col justify-center">
              <span className="text-[#ff4d00] font-black text-xs uppercase mb-3">{selectedProduct.category}</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 italic mb-6">{selectedProduct.name}</h2>
              <p className="text-slate-500 mb-10">{selectedProduct.desc}</p>
              <span className="text-4xl md:text-5xl font-black italic mb-10">৳{selectedProduct.price}</span>
              <button onClick={() => { handleAddToCart(selectedProduct, selectedProduct.id); setSelectedProduct(null); }} className="w-full bg-[#be1e2d] text-white py-6 rounded-[25px] font-black text-xl shadow-2xl">Add To Basket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;