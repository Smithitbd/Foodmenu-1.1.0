import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center px-4 font-['Gilroy'] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-50/50 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Illustration */}
          <div className="relative mb-12">
            <motion.h1 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-[120px] md:text-[180px] font-black text-slate-900/5 leading-none select-none"
            >
              404
            </motion.h1>
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                 className="text-6xl md:text-8xl text-[#b02532] opacity-20"
               >
                 <FaUtensils />
               </motion.div>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
            Lost in the <span className="text-[#b02532]">Flavor?</span>
          </h2>
          <p className="text-slate-500 font-medium mb-10 text-sm md:text-lg max-w-md mx-auto">
            The page you are looking for might have been moved, deleted, or never existed in our menu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-full font-black shadow-2xl hover:bg-[#b02532] transition-all uppercase tracking-widest text-[10px]"
            >
              <FaHome size={14} /> Back to Home
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/all-restaurants')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-full font-black shadow-lg hover:border-[#b02532] transition-all uppercase tracking-widest text-[10px]"
            >
              <FaSearch size={12} /> Explore Food
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;