import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaCheck, FaCrown, FaSearch, FaArrowRight, FaMagic } from 'react-icons/fa';

const TemplatePage = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCard, setActiveCard] = useState(null);

  // Smooth Loading Simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const templates = [
    { id: 1, name: 'Midnight Fusion', category: 'Luxury', image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=400&auto=format&fit=crop', isPremium: true },
    { id: 2, name: 'Minimalist Zen', category: 'Minimal', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400&auto=format&fit=crop', isPremium: false },
    { id: 3, name: 'Urban Street', category: 'Fast Food', image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=400&auto=format&fit=crop', isPremium: false },
    { id: 4, name: 'Golden Bistro', category: 'Luxury', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=400&auto=format&fit=crop', isPremium: true },
    { id: 5, name: 'Pure Organic', category: 'Healthy', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop', isPremium: false },
    { id: 6, name: 'Vintage Classic', category: 'Classic', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', isPremium: false },
  ];

  const filteredTemplates = templates.filter(t => 
    (filter === 'All' || t.category === filter) &&
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-['Gilroy'] text-slate-900 pb-32 overflow-x-hidden relative">
      
      {/* --- Smooth Sticky Header --- */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-black italic tracking-tight"
          >
            Menu <span className="text-red-600">Templates</span>
          </motion.h1>

          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search styles..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-full text-xs font-bold outline-none focus:ring-2 ring-red-100 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 pt-8">
        
        {/* --- Smooth Category Tabs --- */}
        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar scroll-smooth">
          {['All', 'Luxury', 'Minimal', 'Fast Food', 'Healthy', 'Classic'].map((cat, idx) => (
            <motion.button 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === cat ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* --- Card Grid with AnimatePresence --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode='wait'>
            {loading ? (
              // Enhanced Skeleton Grid
              [...Array(6)].map((_, i) => <SkeletonCard key={`skel-${i}`} />)
            ) : (
              filteredTemplates.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="relative group cursor-pointer"
                  onClick={() => setActiveCard(activeCard === item.id ? null : item.id)}
                >
                  <div className={`relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 transition-all duration-500 ${selected === item.id ? 'border-red-600 shadow-2xl scale-[1.02]' : 'border-white shadow-xl shadow-slate-100 hover:shadow-2xl'}`}>
                    
                    <img src={item.image} alt={item.name}
                    loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />

                    {/* Premium Label */}
                    {item.isPremium && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                        <FaCrown className="text-yellow-500 text-[10px]" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Premium</span>
                      </div>
                    )}

                    {/* Touch/Hover Overlay */}
                    <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[3px] transition-all duration-500 flex flex-col justify-end p-6 
                      ${activeCard === item.id ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white text-slate-900 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg">
                          Preview
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item.id);
                          }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all shadow-xl ${selected === item.id ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:scale-110'}`}
                        >
                          <FaCheck />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 px-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 tracking-tight">{item.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                    </div>
                    {selected === item.id && (
                       <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">Selected</motion.span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* --- BULLETPROOF CENTERING ACTION BAR --- */}
      <AnimatePresence>
        {selected && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center px-6 z-[100] pointer-events-none">
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-[480px] bg-slate-900/95 backdrop-blur-2xl p-4 md:p-5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/10 flex items-center justify-between pointer-events-auto"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-red-600 rounded-[1.2rem] flex items-center justify-center text-white text-lg shadow-lg shadow-red-500/30">
                  <FaMagic className="animate-pulse" />
                </div>
                <div>
                  <p className="text-white text-[11px] font-bold">Style #{selected} ready!</p>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Next: Menu Editor</p>
                </div>
              </div>

              <button className="bg-white text-slate-900 px-8 py-3.5 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                Next <FaArrowRight className="inline ml-1" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Pro Skeleton Card (Moving Gradient) ---
const SkeletonCard = () => (
  <div className="space-y-4">
    <div className="relative aspect-[3/4] bg-slate-100 rounded-[2.5rem] overflow-hidden">
      <motion.div 
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
    </div>
    <div className="px-4 space-y-2">
    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
    <div className="h-3 bg-slate-50 rounded-full w-1/2" />
    </div>
</div>
);

export default TemplatePage;