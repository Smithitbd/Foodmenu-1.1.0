import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaPlus, FaMinus, FaTrash, FaUtensils,
  FaCheck, FaTimes, FaChevronDown, FaTag, FaShoppingBag,
  FaArrowLeft, FaTable, FaReceipt
} from 'react-icons/fa';

// ─── Helper: Bengali Taka Sign ───────────────────────────────────────────────
const Tk = ({ amount }) => <span>৳{Number(amount).toFixed(0)}</span>;

// ─── Cart Item Row ────────────────────────────────────────────────────────────
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 30 }}
    className="flex items-center gap-3 py-3 border-b border-[#f0ece6] last:border-0"
  >
    <img
      src={item.img}
      alt={item.name}
      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-[#f0ece6]"
    />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-[#1a1209] truncate leading-tight">{item.name}</p>
      <p className="text-[12px] text-[#b5814a] font-semibold mt-0.5">
        <Tk amount={item.price} /> × {item.quantity} ={' '}
        <span className="text-[#7c4a1e] font-extrabold">
          <Tk amount={item.price * item.quantity} />
        </span>
      </p>
    </div>
    <div className="flex items-center gap-1">
      <button
        onClick={() => onDecrease(item.id)}
        className="w-7 h-7 rounded-lg bg-[#f5ede3] hover:bg-[#e8d5c0] text-[#7c4a1e] flex items-center justify-center transition-colors"
      >
        <FaMinus size={10} />
      </button>
      <span className="w-6 text-center text-[13px] font-black text-[#1a1209]">{item.quantity}</span>
      <button
        onClick={() => onIncrease(item.id)}
        className="w-7 h-7 rounded-lg bg-[#7c4a1e] hover:bg-[#5c3414] text-white flex items-center justify-center transition-colors"
      >
        <FaPlus size={10} />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center ml-1 transition-colors"
      >
        <FaTrash size={10} />
      </button>
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ViewMenuPage = () => {
  const navigate = useNavigate();

  // LocalStorage থেকে Staff Info নেওয়া
  const resId = localStorage.getItem('resId');
  const resName = localStorage.getItem('resName');
  const resLogo = localStorage.getItem('resLogo');
  const staffData = JSON.parse(localStorage.getItem('user') || '{}');

  // ── States ──────────────────────────────────────────────────────────────────
  const [menuData, setMenuData] = useState({});
  const [profile, setProfile] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);
  const [tickedId, setTickedId] = useState(null);

  // Cart
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Order Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch Menu + Tables ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!resId) return;
    try {
      const [menuRes, tablesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/waiter/menu/${resId}`),
        axios.get(`http://localhost:5000/api/waiter/tables/${resId}`)
      ]);
      if (menuRes.data) {
        setProfile(menuRes.data.profile);
        setMenuData(menuRes.data.menu || {});
      }
      if (tablesRes.data) {
        setTables(tablesRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const allProducts = useMemo(() => {
    let list = [];
    Object.values(menuData).forEach(catProds => {
      if (Array.isArray(catProds)) {
        list = [...list, ...catProds.filter(p => p.is_available == 1)];
      }
    });
    return list;
  }, [menuData]);

  const offerProducts = useMemo(() =>
    allProducts.filter(p => p.old_price && Number(p.old_price) > Number(p.display_price)),
    [allProducts]
  );

  const categories = useMemo(() => {
    const cats = [];
    if (offerProducts.length > 0) cats.push('Offers 🎁');
    cats.push('All');
    Object.keys(menuData).forEach(cat => { if (!cats.includes(cat)) cats.push(cat); });
    return cats;
  }, [menuData, offerProducts]);

  const filteredProducts = useMemo(() => {
    let prods = activeCategory === 'Offers 🎁' ? offerProducts
      : activeCategory === 'All' ? allProducts
        : menuData[activeCategory] || [];
    if (searchTerm) {
      prods = prods.filter(p => p.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return prods;
  }, [menuData, activeCategory, searchTerm, allProducts, offerProducts]);

  const cartTotal = useMemo(() =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(() =>
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // ── Cart Actions ──────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: product.id,
        name: product.display_name,
        price: Number(product.display_price),
        img: product.images[0] || 'https://via.placeholder.com/80',
        quantity: 1,
      }];
    });
    setTickedId(product.id);
    setTimeout(() => setTickedId(null), 800);
  };

  const increaseQty = (id) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
  );
  const decreaseQty = (id) => setCart(prev => {
    const item = prev.find(i => i.id === id);
    if (item.quantity === 1) return prev.filter(i => i.id !== id);
    return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
  });
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { setCart([]); setShowCart(false); };

  // ── Place Order ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      Swal.fire({ icon: 'warning', title: 'Table Select করুন', text: 'একটি টেবিল নির্বাচন করুন', confirmButtonColor: '#7c4a1e' });
      return;
    }
    /*if (!customerName.trim()) {
      Swal.fire({ icon: 'warning', title: 'নাম দিন', text: 'Customer এর নাম লিখুন', confirmButtonColor: '#7c4a1e' });
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      Swal.fire({ icon: 'warning', title: 'ফোন নম্বর দিন', text: 'সঠিক ফোন নম্বর লিখুন', confirmButtonColor: '#7c4a1e' });
      return;
    }*/

    setIsSubmitting(true);
    try {
      const payload = {
        restaurant_id: Number(resId),
        customer_name: 'Walking Customer', 
      customer_phone: 'N/A',
      customer_address: 'Dine-In',
        table_id: selectedTable,
        order_type: 'Dine-In',
        payment_method: 'CASH',
        items: cart.map(i => ({
          product_id: i.id,
          quantity: i.quantity,
          price: i.price,
          total_price: i.price * i.quantity,
        })),
        subtotal: cartTotal,
        total_amount: cartTotal,
        discount: 0,
        staff_name: staffData?.name || 'Staff',
      };

      await axios.post('http://localhost:5000/api/waiter/dine-in-order', payload);

      Swal.fire({
        icon: 'success',
        title: 'Order Placed! ✅',
        html: `
          <div style="font-family: sans-serif; text-align:center;">
            <p style="font-size:14px; color:#555; margin-bottom:8px;">Table: <b>${selectedTable}</b></p>
            <p style="font-size:14px; color:#555;">Total: <b>৳${cartTotal}</b></p>
          </div>
        `,
        confirmButtonColor: '#7c4a1e',
        confirmButtonText: 'Done',
        customClass: { popup: 'rounded-3xl' },
        timer: 3000,
      });

      setCart([]);
      setShowOrderModal(false);
      setShowCart(false);
      setCustomerName('Walking Customer');
      setCustomerPhone('N/A');
      setSelectedTable('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.message || 'Order দেওয়া যায়নি। আবার চেষ্টা করুন।',
        confirmButtonColor: '#7c4a1e',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Auth Guard ────────────────────────────────────────────────────────────────
  if (!resId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f2]">
        <div className="text-center p-10">
          <p className="text-2xl font-black text-[#7c4a1e] mb-4">অনুমতি নেই</p>
          <p className="text-[#b5814a] mb-6">আপনাকে আগে লগইন করতে হবে।</p>
          <button onClick={() => navigate('/login')}
            className="bg-[#7c4a1e] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#5c3414] transition-colors">
            লগইন করুন
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fdf8f2] flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-[#f0ece6] border-t-[#7c4a1e] animate-spin" />
        <FaUtensils className="absolute inset-0 m-auto text-[#b5814a] text-2xl" />
      </div>
      <p className="font-black text-[#7c4a1e] text-sm uppercase tracking-[0.2em] animate-pulse">
        Menu Loading...
      </p>
    </div>
  );

  return (
    <div className="bg-[#fdf8f2] min-h-screen font-sans" style={{ fontFamily: "'Sora', 'Noto Sans Bengali', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .card-hover { transition: all 0.3s cubic-bezier(.25,.8,.25,1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(124,74,30,0.12); }
        .green-pop { animation: gpop 0.5s ease forwards; background: #22c55e !important; color: white !important; }
        @keyframes gpop { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .cart-slide { animation: slideIn 0.3s cubic-bezier(.25,.8,.25,1); }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      {/*<header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#f0ece6] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Back + Logo 
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-[#f5ede3] hover:bg-[#e8d5c0] text-[#7c4a1e] flex items-center justify-center transition-colors"
            >
              <FaArrowLeft size={14} />
            </button>
            <div className="flex items-center gap-2">
              {resLogo && (
                <img src={resLogo.startsWith('http') ? resLogo : `http://localhost:5000/uploads/${resLogo}`}
                  alt="logo" className="w-8 h-8 rounded-lg object-contain border border-[#f0ece6]" />
              )}
              <div>
                <p className="text-[13px] font-black text-[#1a1209] leading-tight">{resName}</p>
                <p className="text-[10px] text-[#b5814a] font-semibold uppercase tracking-wider">View Menu</p>
              </div>
            </div>
          </div>

          {/* Center: Search 
          <div className="hidden md:flex flex-1 max-w-md mx-6 items-center bg-[#f5ede3] rounded-xl px-4 h-10 gap-3">
            <FaSearch className="text-[#b5814a] flex-shrink-0" size={13} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm text-[#1a1209] font-medium w-full placeholder-[#c9a882]"
            />
          </div>

          {/* Right: Staff + Cart 
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[11px] font-bold text-[#b5814a] bg-[#f5ede3] px-3 py-1.5 rounded-lg uppercase tracking-wide">
              {staffData?.role || 'Staff'}: {staffData?.name || '—'}
            </span>
            <button
              onClick={() => setShowCart(true)}
              className="relative w-10 h-10 rounded-xl bg-[#7c4a1e] text-white flex items-center justify-center hover:bg-[#5c3414] transition-colors shadow-lg shadow-[#7c4a1e]/30"
            >
              <FaShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center bg-[#f5ede3] rounded-xl px-4 h-10 gap-3">
            <FaSearch className="text-[#b5814a]" size={13} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm text-[#1a1209] font-medium w-full placeholder-[#c9a882]"
            />
          </div>
        </div>
      </header>*/}

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex gap-6">
        {/* ── SIDEBAR CATEGORIES ── */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#f0ece6] p-4 shadow-sm">
            <p className="text-[10px] font-black text-[#b5814a] uppercase tracking-[0.2em] mb-3 ml-1">Categories</p>
            <div className="flex flex-col gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200
                    ${activeCategory === cat
                      ? 'bg-[#7c4a1e] text-white shadow-md shadow-[#7c4a1e]/25'
                      : 'text-[#7c5a3a] hover:bg-[#f5ede3]'
                    }
                    ${cat === 'Offers 🎁' ? 'border border-red-200 text-red-600' : ''}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0">
          {/* Mobile Category Scroll */}
          <div className="lg:hidden flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all
                  ${activeCategory === cat ? 'bg-[#7c4a1e] text-white' : 'bg-white text-[#7c5a3a] border border-[#f0ece6]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[#1a1209]">
              {activeCategory.replace(' 🎁', '')} <span className="text-[#b5814a]">Items</span>
            </h2>
            <p className="text-[11px] text-[#b5814a] font-bold uppercase tracking-widest">
              {filteredProducts.length} টি আইটেম
            </p>
          </div>

          {/* Product Grid */}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.slice(0, visibleCount).map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#f0ece6] card-hover group cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#f5ede3]">
                    <img
                      src={product.images[0]}
                      alt={product.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.old_price && Number(product.old_price) > Number(product.display_price) && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <FaTag size={7} /> SAVE ৳{Number(product.old_price) - Number(product.display_price)}
                      </div>
                    )}
                    {/* Add Button */}
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all z-10
                        ${tickedId === product.id ? 'green-pop' : 'bg-[#7c4a1e] text-white hover:bg-[#5c3414]'}`}
                    >
                      {tickedId === product.id ? <FaCheck size={12} /> : <FaPlus size={12} />}
                    </button>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <h4 className="text-[13px] font-bold text-[#1a1209] leading-tight truncate">{product.display_name}</h4>
                    <div className="flex items-end justify-between mt-1.5">
                      <div>
                        {product.old_price && (
                          <p className="text-[10px] text-gray-400 line-through font-semibold">৳{product.old_price}</p>
                        )}
                        <p className="text-[15px] font-black text-[#7c4a1e]">৳{product.display_price}</p>
                      </div>
                      <span className="text-[9px] bg-[#f5ede3] text-[#b5814a] px-2 py-0.5 rounded-full font-bold uppercase">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load More */}
          {visibleCount < filteredProducts.length && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisibleCount(p => p + 12)}
                className="flex items-center gap-2 bg-white border-2 border-[#7c4a1e] text-[#7c4a1e] px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#7c4a1e] hover:text-white transition-all group"
              >
                <FaChevronDown className="group-hover:translate-y-1 transition-transform" />
                আরো দেখুন
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#f0ece6]">
              <FaSearch className="text-[#e8d5c0] mb-3" size={30} />
              <p className="text-[#7c5a3a] font-black text-base">কিছু পাওয়া যায়নি</p>
              <p className="text-[#b5814a] font-medium text-sm mt-1">অন্য ক্যাটাগরি বা শব্দ দিয়ে খুঁজুন</p>
            </div>
          )}
        </main>
      </div>

      {/* ── CART SIDEBAR ── */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#f0ece6]">
                <div>
                  <h3 className="font-black text-[#1a1209] text-lg">অর্ডার ক্যার্ট</h3>
                  <p className="text-[11px] text-[#b5814a] font-semibold">{cartCount} টি আইটেম</p>
                </div>
                <div className="flex gap-2">
                  {cart.length > 0 && (
                    <button onClick={clearCart}
                      className="text-[11px] font-bold text-red-400 hover:text-red-600 px-3 py-1.5 bg-red-50 rounded-xl transition-colors">
                      Clear All
                    </button>
                  )}
                  <button onClick={() => setShowCart(false)}
                    className="w-9 h-9 rounded-xl bg-[#f5ede3] text-[#7c4a1e] flex items-center justify-center hover:bg-[#e8d5c0] transition-colors">
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="w-16 h-16 bg-[#f5ede3] rounded-2xl flex items-center justify-center">
                      <FaShoppingBag className="text-[#c9a882]" size={24} />
                    </div>
                    <p className="font-black text-[#7c5a3a]">ক্যার্ট খালি</p>
                    <p className="text-[12px] text-[#b5814a]">Menu থেকে আইটেম যোগ করুন</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {cart.map(item => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onIncrease={increaseQty}
                        onDecrease={decreaseQty}
                        onRemove={removeItem}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-[#f0ece6] bg-[#fdf8f2]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-[#1a1209]">মোট</span>
                    <span className="text-2xl font-black text-[#7c4a1e]">৳{cartTotal}</span>
                  </div>
                  <button
                    onClick={() => { setShowCart(false); setShowOrderModal(true); }}
                    className="w-full bg-[#7c4a1e] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#5c3414] transition-colors shadow-lg shadow-[#7c4a1e]/30"
                  >
                    <FaReceipt /> Dine-In Order দিন
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ORDER CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showOrderModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-br from-[#7c4a1e] to-[#5c3414] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black">Dine-In Order</h3>
                      <p className="text-[12px] text-[#e8c49a] font-medium mt-0.5">Customer তথ্য পূরণ করুন</p>
                    </div>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 bg-white/10 rounded-2xl p-4">
                    <p className="text-[11px] text-[#e8c49a] font-bold uppercase tracking-wider mb-2">Order Summary</p>
                    <div className="max-h-28 overflow-y-auto hide-scrollbar space-y-1">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-[12px]">
                          <span className="text-white/80">{item.name} × {item.quantity}</span>
                          <span className="font-bold text-white">৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/20 mt-2 pt-2 flex justify-between">
                      <span className="text-[13px] font-black text-[#e8c49a]">Total</span>
                      <span className="text-[15px] font-black text-white">৳{cartTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Form */}
                <div className="p-6 space-y-4">
                  {/* Table Select */}
                  <div>
                    <label className="text-[11px] font-black text-[#7c5a3a] uppercase tracking-wider flex items-center gap-2 mb-2">
                      <FaTable size={11} className="text-[#b5814a]" /> টেবিল নির্বাচন করুন *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {tables.length > 0 ? tables.map(table => (
                        <button
                          key={table.id}
                          onClick={() => setSelectedTable(table.table_number)}
                          className={`py-2.5 px-3 rounded-xl text-[12px] font-bold border-2 transition-all
                            ${selectedTable === table.table_number
                              ? 'border-[#7c4a1e] bg-[#7c4a1e] text-white'
                              : 'border-[#f0ece6] text-[#7c5a3a] hover:border-[#b5814a]'
                            }`}
                        >
                          {table.table_number}
                          <span className="block text-[9px] opacity-70">{table.category} · {table.capacity} সিট</span>
                        </button>
                      )) : (
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={selectedTable}
                            onChange={e => setSelectedTable(e.target.value)}
                            placeholder="টেবিল নম্বর লিখুন..."
                            className="w-full border-2 border-[#f0ece6] rounded-xl px-4 py-3 text-sm font-medium text-[#1a1209] focus:outline-none focus:border-[#b5814a] placeholder-[#c9a882]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Name */}
                  {/*<div>
                    <label className="text-[11px] font-black text-[#7c5a3a] uppercase tracking-wider mb-2 block">
                      Customer নাম *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Customer এর নাম লিখুন..."
                      className="w-full border-2 border-[#f0ece6] focus:border-[#b5814a] rounded-xl px-4 py-3 text-sm font-medium text-[#1a1209] outline-none transition-colors placeholder-[#c9a882]"
                    />
                  </div>*/}

                  {/* Customer Phone */}
                  {/*<div>
                    <label className="text-[11px] font-black text-[#7c5a3a] uppercase tracking-wider mb-2 block">
                      ফোন নম্বর *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full border-2 border-[#f0ece6] focus:border-[#b5814a] rounded-xl px-4 py-3 text-sm font-medium text-[#1a1209] outline-none transition-colors placeholder-[#c9a882]"
                    />
                  </div>*/}

                  {/* Submit */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-[#7c4a1e] hover:bg-[#5c3414] disabled:bg-[#c9a882] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#7c4a1e]/30 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Order দেওয়া হচ্ছে...
                      </>
                    ) : (
                      <>
                        <FaCheck size={14} /> Dine-In Order Confirm করুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE FLOATING CART BUTTON ── */}
      {cartCount > 0 && !showCart && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center gap-3 bg-[#7c4a1e] text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-[#7c4a1e]/40 font-black text-sm hover:bg-[#5c3414] transition-colors"
          >
            <FaShoppingBag size={16} />
            <span>{cartCount} টি আইটেম</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[12px]">৳{cartTotal}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ViewMenuPage;