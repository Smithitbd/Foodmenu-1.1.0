import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHeadset, FaLayerGroup, FaUserPlus, FaTimes, FaSignInAlt, FaUserEdit, FaArrowLeft }
from 'react-icons/fa';

const CreationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [view, setView] = useState('main');

  if (!isOpen) return null;

  const mainOptions = [
    {
      id: 1,
      title: "Live Support",
      desc: "Instant help via WhatsApp",
      icon: <FaHeadset />,
      color: "bg-blue-50 text-blue-600",
      hoverBg: "hover:bg-blue-600", 
      action: () => window.open('https://wa.me/01640026138', '_blank')
    },
    {
      id: 2,
      title: "Menu Templates",
      desc: "Browse 50+ professional designs",
      icon: <FaLayerGroup />,
      color: "bg-purple-50 text-purple-600",
      hoverBg: "hover:bg-purple-600", 
      action: () => navigate('/templates')
    },
    {
      id: 3,
      title: "Quick Account",
      desc: "Login or Register your restaurant",
      icon: <FaUserPlus />,
      color: "bg-orange-50 text-orange-600",
      hoverBg: "hover:bg-orange-600", 
      action: () => setView('account') 
    },
  ];

  const accountOptions = [
    {
      id: 'login',
      title: "Login",
      desc: "Access your dashboard",
      icon: <FaSignInAlt />,
      color: "bg-green-50 text-green-600",
      hoverBg: "hover:bg-green-600",
      action: () => navigate('/login') 
    },
    {
      id: 'register',
      title: "Registration",
      desc: "Start fresh with new profile",
      icon: <FaUserEdit />,
      color: "bg-red-50 text-red-600",
      hoverBg: "hover:bg-red-600",
      action: () => navigate('/addmenuform') 
    }
  ];

  const handleClose = () => {
    setView('main');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden p-6 md:p-12 border border-slate-100"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="w-10">
              {view === 'account' && (
                <button 
                  onClick={() => setView('main')}
                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <FaArrowLeft size={18} />
                </button>
              )}
            </div>
            <button 
              onClick={handleClose} 
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <motion.h2 
              key={view}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight"
            >
              {view === 'main' ? "Start Your Journey" : "Account Access"}
            </motion.h2>
          </div>

          {/* Options Grid */}
          <div className={`grid grid-cols-1 ${view === 'main' ? 'md:grid-cols-3' : 'sm:grid-cols-2 max-w-2xl mx-auto'} gap-8`}>
            {(view === 'main' ? mainOptions : accountOptions).map((opt) => (
              <motion.div 
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.97 }}
                key={opt.id} 
                onClick={opt.action} 
                className={`relative p-10 rounded-[2.5rem] cursor-pointer group transition-all duration-500 overflow-hidden border-2 border-slate-50 ${opt.hoverBg}`}
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-20 h-20 ${opt.color} rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:bg-white group-hover:scale-110 transition-all duration-500`}>
                    {opt.icon}
                  </div>
                  <h4 className="font-black text-slate-800 text-xl mb-2 group-hover:text-white transition-colors duration-500">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium group-hover:text-white/80 transition-colors duration-500">
                    {opt.desc}
                  </p>
                </div>

                {/* Background Decor Layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Food Menu BD Premium Experience</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreationModal;