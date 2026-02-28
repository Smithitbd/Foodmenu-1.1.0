import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import map from '../../assets/Images/map.png';

const pinsData = [
  { name: 'Madina Market', top: '28%', left: '12%' },
  { name: 'Shubidbazar', top: '38%', left: '22%' },
  { name: 'Lamabazar', top: '38%', left: '35%' },
  { name: 'Amberkhana', top: '20%', left: '35%' },
  { name: 'Shahi Eidgah', top: '25%', left: '45%' },
  { name: 'Darga Gate', top: '30%', left: '55%' },
  { name: 'Jail Road', top: '39%', left: '74%' },
  { name: 'Zindabazar', top: '48%', left: '53%' },
  { name: 'Bondorbazar', top: '50%', left: '20%' },
  { name: 'NoyaSorak', top: '55%', left: '30%' },
  { name: 'Kumarpara', top: '60%', left: '40%' },
  { name: 'Shahjalal Uposohor', top: '67%', left: '60%' },
  { name: 'Tilagor', top: '75%', left: '70%' },
  { name: 'Shahporan', top: '68%', left: '80%' },
  { name: 'Dariapara', top: '25%', left: '52%' },
  { name: 'Kamal Bazar', top: '60%', left: '60%' },
];

const ExploreArea = () => {
  const [hoveredPin, setHoveredPin] = useState(null);

  return (
    <section className="bg-white py-16 md:py-24 font-['Inter',sans-serif] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-red-600 font-black text-[10px] md:text-xs uppercase tracking-[4px] mb-3"
          >
            Service Areas
          </motion.p>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            Find Our Presence <br />
            <span className="text-slate-400 font-medium italic text-2xl md:text-4xl">Across The City</span>
          </h2>
        </div>

        {/* Map Container */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full max-w-[1100px] mx-auto rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-[1px] border-slate-100 bg-[#fbfcfd]"
          >
            <img 
              src={map} 
              alt="Map" 
              className="w-full h-auto object-contain min-h-[350px] opacity-80" 
            />

            {/* Pins Overlay */}
            <div className="absolute inset-0">
              {pinsData.map((pin, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: index * 0.05 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <Link 
                    to={`/Arealist/${pin.name.replace(/\s/g, '-')}`}
                    onMouseEnter={() => setHoveredPin(pin.name)}
                    onMouseLeave={() => setHoveredPin(null)}
                    className="relative block"
                  >
                    
                    {/* The Main Pin Body with Shimmer */}
                    <motion.div
                      whileHover={{ scale: 1.15, y: -5 }}
                      className="relative z-20 w-9 h-9 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(220,38,38,0.15)] border-[1px] border-white/50 overflow-hidden"
                    >
                      {/* Global Shimmer Sweep across the whole pin */}
                      <motion.div 
                        animate={{ x: ['-150%', '150%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                        className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-20"
                      />

                      {/* Red Core */}
                      <div className="relative w-5 h-5 md:w-7 md:h-7 bg-red-600 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                        <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-white rounded-full relative z-10 shadow-sm" />
                        
                        {/* Internal Core Shimmer */}
                        <motion.div 
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </div>
                    </motion.div>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredPin === pin.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.9 }}
                          className="absolute bottom-[130%] left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl z-50 pointer-events-none"
                        >
                          <span className="text-[10px] md:text-xs font-bold whitespace-nowrap uppercase tracking-tighter">
                            {pin.name}
                          </span>
                          {/* Small Triangle for Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExploreArea;