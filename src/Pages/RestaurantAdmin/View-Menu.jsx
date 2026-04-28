import React, {
  useState, useEffect, useMemo, useCallback, useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaPlus, FaMinus, FaTrash, FaUtensils,
  FaCheck, FaTimes, FaChevronDown, FaTag, FaShoppingBag,
  FaReceipt, FaChevronLeft, FaChevronRight, FaTable,
} from 'react-icons/fa';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Tk = ({ amount }) => <span>৳{Number(amount).toFixed(0)}</span>;

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Cart Item ────────────────────────────────────────────────────────────────
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.22 }}
    className="flex items-center gap-3 py-3 border-b border-[#f0ece6] last:border-0"
  >
    <div className="relative flex-shrink-0">
      <img
        src={item.img}
        alt={item.name}
        className="w-12 h-12 rounded-xl object-cover border border-[#f0ece6]"
      />
      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7c4a1e] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
        {item.quantity}
      </span>
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-[#1a1209] truncate leading-tight">{item.name}</p>
      <p className="text-[12px] text-[#b5814a] font-semibold mt-0.5">
        <Tk amount={item.price} /> × {item.quantity}
        {' = '}
        <span className="text-[#7c4a1e] font-extrabold">
          <Tk amount={item.price * item.quantity} />
        </span>
      </p>
    </div>

    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => onDecrease(item.id)}
        className="w-7 h-7 rounded-lg bg-[#f5ede3] hover:bg-[#e8d5c0] active:scale-90 text-[#7c4a1e] flex items-center justify-center transition-all"
      >
        <FaMinus size={9} />
      </button>
      <span className="w-6 text-center text-[13px] font-black text-[#1a1209]">{item.quantity}</span>
      <button
        onClick={() => onIncrease(item.id)}
        className="w-7 h-7 rounded-lg bg-[#7c4a1e] hover:bg-[#5c3414] active:scale-90 text-white flex items-center justify-center transition-all"
      >
        <FaPlus size={9} />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 active:scale-90 text-red-400 hover:text-red-600 flex items-center justify-center ml-1 transition-all"
      >
        <FaTrash size={9} />
      </button>
    </div>
  </motion.div>
);

// ─── Image Preview Modal ──────────────────────────────────────────────────────
const ImagePreviewModal = ({ product, onClose, onAddToCart }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = product?.images || [];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % imgs.length);
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [imgs.length, onClose]);

  if (!product) return null;

  const discount = product.old_price
    ? Number(product.old_price) - Number(product.display_price)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6"
      style={{ background: 'rgba(10,6,3,0.94)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 28 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/60 hover:bg-red-600 active:scale-90 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
        >
          <FaTimes size={12} />
        </button>

        {/* Image Section */}
        <div className="relative w-full md:w-[52%] bg-[#140e07] flex-shrink-0" style={{ minHeight: 260 }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={imgs[imgIdx]}
              alt={product.display_name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-cover"
              style={{ minHeight: 260, maxHeight: '92vh' }}
            />
          </AnimatePresence>

          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
              <FaTag size={8} /> Save ৳{discount}
            </div>
          )}

          {imgs.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-[#7c4a1e] text-white rounded-full flex items-center justify-center transition-colors"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-[#7c4a1e] text-white rounded-full flex items-center justify-center transition-colors"
              >
                <FaChevronRight size={12} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`rounded-full transition-all duration-200 ${i === imgIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 p-7 md:p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="inline-block bg-[#f5ede3] text-[#b5814a] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              {product.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1209] leading-tight">{product.display_name}</h2>
            {product.estimated_time > 0 && (
              <p className="text-[12px] text-[#c9a882] font-semibold mt-3 flex items-center gap-1.5">
                ⏱ {product.estimated_time} min prep time
              </p>
            )}
          </div>

          <div className="mt-7">
            <div className="flex flex-col mb-6">
              {product.old_price && (
                <span className="text-[#c9a882] font-bold text-xl line-through">৳{product.old_price}</span>
              )}
              <span className="text-5xl font-black text-[#7c4a1e] tracking-tight leading-none mt-1">
                ৳{product.display_price}
              </span>
              {discount > 0 && (
                <span className="mt-2 text-[11px] font-black text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full w-fit">
                  You save ৳{discount}!
                </span>
              )}
            </div>
            <button
              onClick={() => { onAddToCart(product); onClose(); }}
              className="w-full bg-[#7c4a1e] hover:bg-[#5c3414] active:scale-95 text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#7c4a1e]/30"
            >
              <FaShoppingBag size={15} /> Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart, onPreview, isAdded }) => {
  const discount = product.old_price
    ? Number(product.old_price) - Number(product.display_price)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93 }}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(124,74,30,0.15)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden border border-[#f0ece6] cursor-pointer"
      onClick={() => onPreview(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-[#f5ede3]">
        <motion.img
          src={product.images[0]}
          alt={product.display_name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
        />

        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
            <FaTag size={7} /> ৳{discount} OFF
          </div>
        )}

        <motion.button
          onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          whileTap={{ scale: 0.85 }}
          animate={isAdded ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute bottom-2 right-2 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg z-10 transition-colors
            ${isAdded ? 'bg-green-500' : 'bg-[#7c4a1e] hover:bg-[#5c3414]'} text-white`}
        >
          {isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
        </motion.button>
      </div>

      <div className="p-3">
        <h4 className="text-[13px] font-bold text-[#1a1209] leading-tight truncate">{product.display_name}</h4>
        <div className="flex items-end justify-between mt-1.5">
          <div>
            {product.old_price && (
              <p className="text-[10px] text-gray-400 line-through font-semibold">৳{product.old_price}</p>
            )}
            <p className="text-[15px] font-black text-[#7c4a1e]">৳{product.display_price}</p>
          </div>
          <span className="text-[9px] bg-[#f5ede3] text-[#b5814a] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#fdf8f2] flex flex-col items-center justify-center gap-5">
    <div className="relative w-20 h-20">
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-[#f0ece6] border-t-[#7c4a1e]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      <FaUtensils className="absolute inset-0 m-auto text-[#b5814a] text-2xl" />
    </div>
    <motion.p
      className="font-black text-[#7c4a1e] text-xs uppercase tracking-[0.25em]"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      Loading Menu...
    </motion.p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ViewMenuPage = () => {
  const navigate  = useNavigate();
  const resId     = localStorage.getItem('resId');
  const resName   = localStorage.getItem('resName');
  const resLogo   = localStorage.getItem('resLogo');
  const staffData = JSON.parse(localStorage.getItem('user') || '{}');

  const [menuData,       setMenuData]       = useState({});
  const [tables,         setTables]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchInput,    setSearchInput]    = useState('');
  // ── activeCategory: 'All' = সব দেখাবে (default) ──
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount,   setVisibleCount]   = useState(8);
  const [tickedId,       setTickedId]       = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [cart,           setCart]           = useState([]);
  const [showCart,       setShowCart]       = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTable,  setSelectedTable]  = useState('');
  const [isSubmitting,   setIsSubmitting]   = useState(false);

  const searchTerm = useDebounce(searchInput, 280);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!resId) return;
    try {
      const [mRes, tRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/waiter/menu/${resId}`),
        axios.get(`http://localhost:5000/api/waiter/tables/${resId}`),
      ]);
      if (mRes.data) setMenuData(mRes.data.menu || {});
      if (tRes.data) setTables(tRes.data);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [resId]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const allProducts = useMemo(() => {
    let list = [];
    Object.values(menuData).forEach(arr => {
      if (Array.isArray(arr)) list = [...list, ...arr.filter(p => p.is_available == 1)];
    });
    return list;
  }, [menuData]);

  const offerProducts = useMemo(
    () => allProducts.filter(p => p.old_price && Number(p.old_price) > Number(p.display_price)),
    [allProducts],
  );

  // ── Categories list (sidebar/tabs এ দেখানোর জন্য) ──
  const categories = useMemo(() => {
    const cats = ['All'];
    if (offerProducts.length > 0) cats.push('Offers 🎁');
    Object.keys(menuData).forEach(c => { if (!cats.includes(c)) cats.push(c); });
    return cats;
  }, [menuData, offerProducts]);

  // ── Selected category অনুযায়ী products filter ──
  const displayedProducts = useMemo(() => {
    if (activeCategory === 'All') return allProducts;
    if (activeCategory === 'Offers 🎁') return offerProducts;
    return (menuData[activeCategory] || []).filter(p => p.is_available == 1);
  }, [activeCategory, allProducts, offerProducts, menuData]);

  // ── Search filter ──
  const isSearchMode  = searchTerm.trim().length > 0;
  const searchResults = useMemo(
    () => allProducts.filter(p => p.display_name.toLowerCase().includes(searchTerm.toLowerCase())),
    [allProducts, searchTerm],
  );

  // ── visibleCount reset when category changes ──
  useEffect(() => {
    setVisibleCount(8);
  }, [activeCategory]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ── Category click handler ─────────────────────────────────────────────────
  const handleCategoryClick = useCallback((cat) => {
    setActiveCategory(cat);
    setSearchInput('');
    // page-এর top-এ scroll করবে
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Cart Actions ───────────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        id: product.id,
        name: product.display_name,
        price: Number(product.display_price),
        img: product.images[0] || '',
        quantity: 1,
      }];
    });
    setTickedId(product.id);
    setTimeout(() => setTickedId(null), 950);
  }, []);

  const increaseQty = useCallback(id =>
    setCart(p => p.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)), []);

  const decreaseQty = useCallback(id =>
    setCart(p => {
      const it = p.find(i => i.id === id);
      if (!it || it.quantity === 1) return p.filter(i => i.id !== id);
      return p.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    }), []);

  const removeItem = useCallback(id => setCart(p => p.filter(i => i.id !== id)), []);
  const clearCart  = useCallback(() => { setCart([]); setShowCart(false); }, []);

  // ── Place Order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      Swal.fire({ icon: 'warning', title: 'Please select a table', confirmButtonColor: '#7c4a1e' });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/waiter/dine-in-order', {
        restaurant_id   : Number(resId),
        customer_name   : 'Walking Customer',
        customer_phone  : 'N/A',
        customer_address: 'Dine-In',
        table_id        : selectedTable,
        order_type      : 'Dine-In',
        payment_method  : 'CASH',
        items           : cart.map(i => ({
          product_id : i.id,
          quantity   : i.quantity,
          price      : i.price,
          total_price: i.price * i.quantity,
        })),
        subtotal    : cartTotal,
        total_amount: cartTotal,
        discount    : 0,
        staff_name  : staffData?.name || 'Staff',
      });

      Swal.fire({
        icon: 'success',
        title: 'Order Confirmed! ✅',
        html: `<p style="color:#555">Table: <b>${selectedTable}</b> &nbsp;|&nbsp; Total: <b>৳${cartTotal}</b></p>`,
        confirmButtonColor: '#7c4a1e',
        timer: 3000,
        customClass: { popup: 'rounded-3xl' },
      });
      setCart([]);
      setShowOrderModal(false);
      setShowCart(false);
      setSelectedTable('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.message || 'Could not place order. Please try again.',
        confirmButtonColor: '#7c4a1e',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!resId) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f2]">
      <div className="text-center p-10">
        <p className="text-2xl font-black text-[#7c4a1e] mb-2">Unauthorized</p>
        <p className="text-sm text-[#b5814a] mb-6">Please log in to access the menu.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#7c4a1e] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#5c3414] transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;

  // ── Active items to show (search or filtered) ──────────────────────────────
  const activeList   = isSearchMode ? searchResults : displayedProducts;
  const shownItems   = activeList.slice(0, visibleCount);
  const remaining    = activeList.length - shownItems.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#fdf8f2] min-h-screen" style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ─── TOPBAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-[#f0ece6] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-3">

          {/* Logo + Name */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {resLogo && (
              <img
                src={resLogo.startsWith('http') ? resLogo : `http://localhost:5000/uploads/${resLogo}`}
                alt="logo"
                className="w-8 h-8 rounded-lg object-contain border border-[#f0ece6]"
              />
            )}
            <div className="hidden sm:block">
              <p className="text-[12px] font-black text-[#1a1209] leading-tight">{resName}</p>
              <p className="text-[9px] text-[#b5814a] font-semibold uppercase tracking-wider">{staffData?.role}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-3 flex items-center bg-[#f5ede3] rounded-xl px-3 h-9 gap-2 transition-all focus-within:ring-2 focus-within:ring-[#b5814a]/30">
            <FaSearch className="text-[#b5814a] flex-shrink-0" size={12} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="bg-transparent outline-none text-sm text-[#1a1209] font-medium w-full placeholder-[#c9a882]"
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setSearchInput('')}
                  className="text-[#c9a882] hover:text-[#7c4a1e] transition-colors flex-shrink-0"
                >
                  <FaTimes size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Staff + Cart */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:block text-[10px] font-bold text-[#b5814a] bg-[#f5ede3] px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
              {staffData?.name || '—'}
            </span>
            <button
              onClick={() => setShowCart(true)}
              className="relative w-9 h-9 rounded-xl bg-[#7c4a1e] text-white flex items-center justify-center hover:bg-[#5c3414] active:scale-90 transition-all shadow-md shadow-[#7c4a1e]/30"
            >
              <FaShoppingBag size={14} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ─── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-8 py-5 flex gap-5">

        {/* ─── SIDEBAR (desktop) ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-48 flex-shrink-0">
          <div
            className="sticky top-20 bg-white rounded-2xl border border-[#f0ece6] p-3 shadow-sm overflow-y-auto hide-scroll"
            style={{ maxHeight: 'calc(100vh - 6rem)' }}
          >
            <p className="text-[9px] font-black text-[#b5814a] uppercase tracking-[0.2em] mb-2 ml-1">Categories</p>
            <div className="flex flex-col gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-between
                    ${activeCategory === cat
                      ? 'bg-[#7c4a1e] text-white shadow-md'
                      : `text-[#7c5a3a] hover:bg-[#f5ede3] ${cat === 'Offers 🎁' ? 'text-red-500 border border-red-100' : ''}`
                    }`}
                >
                  <span className="truncate">{cat}</span>
                  {activeCategory === cat && (
                    <motion.span
                      layoutId="sidebar-dot"
                      className="w-1.5 h-1.5 rounded-full bg-[#f5c58a] flex-shrink-0 ml-1"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">

          {/* Mobile category tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto hide-scroll mb-4 pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all
                  ${activeCategory === cat
                    ? 'bg-[#7c4a1e] text-white shadow-md'
                    : `bg-white text-[#7c5a3a] border ${cat === 'Offers 🎁' ? 'border-red-200 text-red-500' : 'border-[#f0ece6]'}`
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ─── Section Title ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              {isSearchMode ? (
                <h2 className="text-lg font-black text-[#1a1209]">
                  Results for <span className="text-[#b5814a]">"{searchTerm}"</span>
                </h2>
              ) : (
                <h2 className="text-lg md:text-xl font-black text-[#1a1209]">
                  {activeCategory.replace(' 🎁', '')} <span className="text-[#b5814a]">Items</span>
                </h2>
              )}
              {!isSearchMode && activeCategory === 'Offers 🎁' && (
                <motion.span
                  animate={{ opacity: [1, 0.55, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-black"
                >
                  LIMITED OFFER
                </motion.span>
              )}
            </div>
            <span className="text-[11px] text-[#b5814a] font-bold">
              {activeList.length} {activeList.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* ─── Product Grid ─────────────────────────────────────────────────── */}
          {activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#f0ece6]">
              <FaSearch className="text-[#e8d5c0] mb-3" size={28} />
              <p className="text-[#7c5a3a] font-black">
                {isSearchMode ? 'No results found' : 'No items in this category'}
              </p>
              <p className="text-[12px] text-[#c9a882] mt-1">
                {isSearchMode ? 'Try a different search term' : 'Check back later'}
              </p>
            </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                <AnimatePresence mode="popLayout">
                  {shownItems.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAddToCart={addToCart}
                      onPreview={setPreviewProduct}
                      isAdded={tickedId === p.id}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {remaining > 0 && (
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="flex items-center gap-2 bg-white border-2 border-[#e8d5c0] text-[#7c5a3a] px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:border-[#7c4a1e] hover:text-[#7c4a1e] active:scale-95 transition-all group"
                  >
                    <FaChevronDown className="group-hover:translate-y-0.5 transition-transform" size={10} />
                    Load More ({remaining} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ─── IMAGE PREVIEW MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewProduct && (
          <ImagePreviewModal
            product={previewProduct}
            onClose={() => setPreviewProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>

      {/* ─── CART SIDEBAR ────────────────────────────────────────────────────── */}
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
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ece6]">
                <div>
                  <h3 className="font-black text-[#1a1209] text-lg leading-tight">Order Cart</h3>
                  <p className="text-[11px] text-[#b5814a] font-semibold mt-0.5">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-[11px] font-bold text-red-400 hover:text-red-600 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowCart(false)}
                    className="w-9 h-9 rounded-xl bg-[#f5ede3] text-[#7c4a1e] flex items-center justify-center hover:bg-[#e8d5c0] transition-colors"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-5 py-2 hide-scroll">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="w-16 h-16 bg-[#f5ede3] rounded-2xl flex items-center justify-center">
                      <FaShoppingBag className="text-[#c9a882]" size={22} />
                    </div>
                    <p className="font-black text-[#7c5a3a]">Your cart is empty</p>
                    <p className="text-[12px] text-[#b5814a]">Add items from the menu to get started</p>
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
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-5 border-t border-[#f0ece6] bg-[#fdf8f2]"
                  >
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-[12px] text-[#7c5a3a]">
                        <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                        <span className="font-bold">৳{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-[12px] text-[#7c5a3a]">
                        <span>Discount</span>
                        <span className="font-bold text-green-600">৳0</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#f0ece6] pt-3 mb-4">
                      <span className="font-black text-[#1a1209]">Total</span>
                      <span className="text-2xl font-black text-[#7c4a1e]">৳{cartTotal}</span>
                    </div>
                    <button
                      onClick={() => { setShowCart(false); setShowOrderModal(true); }}
                      className="w-full bg-[#7c4a1e] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#5c3414] active:scale-95 transition-all shadow-lg shadow-[#7c4a1e]/30"
                    >
                      <FaReceipt size={14} /> Place Dine-In Order
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── ORDER MODAL ─────────────────────────────────────────────────────── */}
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
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">

                {/* Modal Header */}
                <div className="bg-gradient-to-br from-[#7c4a1e] to-[#4a2b0e] p-6 text-white flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black">Dine-In Order</h3>
                      <p className="text-[12px] text-[#e8c49a] font-medium mt-0.5">Select a table to confirm</p>
                    </div>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 active:scale-90 flex items-center justify-center transition-all"
                    >
                      <FaTimes size={13} />
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-[10px] text-[#e8c49a] font-black uppercase tracking-wider mb-2">Order Summary</p>
                    <div className="max-h-24 overflow-y-auto hide-scroll space-y-1">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-[12px]">
                          <span className="text-white/80 truncate mr-2">{item.name} × {item.quantity}</span>
                          <span className="font-bold text-white flex-shrink-0">৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/20 mt-2 pt-2 flex justify-between">
                      <span className="text-[13px] font-black text-[#e8c49a]">Total</span>
                      <span className="text-[15px] font-black text-white">৳{cartTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Table Select */}
                <div className="p-6 overflow-y-auto hide-scroll flex-1">
                  <label className="text-[11px] font-black text-[#7c5a3a] uppercase tracking-wider flex items-center gap-2 mb-3">
                    <FaTable size={10} className="text-[#b5814a]" /> Select Table *
                  </label>

                  {tables.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {tables.map(table => (
                        <motion.button
                          key={table.id}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setSelectedTable(table.table_number)}
                          className={`py-3 px-3 rounded-xl text-left border-2 transition-all
                            ${selectedTable === table.table_number
                              ? 'border-[#7c4a1e] bg-[#7c4a1e] text-white shadow-lg shadow-[#7c4a1e]/25'
                              : 'border-[#f0ece6] text-[#7c5a3a] hover:border-[#b5814a] bg-white'
                            }`}
                        >
                          <span className="block text-[13px] font-black">{table.table_number}</span>
                          <span className="block text-[9px] opacity-60 mt-0.5 font-semibold">
                            {table.category} · {table.capacity} seats
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={selectedTable}
                      onChange={e => setSelectedTable(e.target.value)}
                      placeholder="Enter table number..."
                      className="w-full border-2 border-[#f0ece6] rounded-xl px-4 py-3 text-sm font-medium text-[#1a1209] focus:outline-none focus:border-[#b5814a] mb-5 placeholder-[#c9a882] transition-colors"
                    />
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-[#7c4a1e] hover:bg-[#5c3414] disabled:bg-[#c9a882] disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#7c4a1e]/30 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        />
                        Placing Order...
                      </>
                    ) : (
                      <><FaCheck size={13} /> Confirm Order</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── FLOATING CART (mobile) ───────────────────────────────────────────── */}
      <AnimatePresence>
        {cartCount > 0 && !showCart && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-5 right-5 z-50 lg:hidden"
          >
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2.5 bg-[#7c4a1e] text-white px-4 py-3 rounded-2xl shadow-2xl shadow-[#7c4a1e]/40 font-black text-sm hover:bg-[#5c3414] active:scale-95 transition-all"
            >
              <FaShoppingBag size={14} />
              <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[11px]">৳{cartTotal}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewMenuPage;