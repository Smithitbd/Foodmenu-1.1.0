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
  { name: 'Nayasarak', top: '55%', left: '30%' },
  { name: 'Kumarpara', top: '60%', left: '40%' },
  { name: 'Shahjalal Uposohor', top: '67%', left: '60%' },
  { name: 'Tilagor', top: '75%', left: '70%' },
  { name: 'Shahporan', top: '68%', left: '80%' },
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
            className="text-red-600 font-black text-s uppercase tracking-[4px] mb-3"
          >
            Service Areas
          </motion.p>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            Find Our Presence <br />
            <span className="text-slate-400 font-medium italic">Across The City</span>
          </h2>
        </div>

        {/* Map Container */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[1100px] mx-auto rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.07)] border-[1px] border-slate-100 bg-slate-50"
          >
            {/* Bright Clean Map */}
            <img 
              src={map} 
              alt="Map" 
              loading="lazy"
              className="w-full h-auto object-contain min-h-[300px] opacity-90 transition-all duration-500 hover:opacity-100" 
            />

            {/* Pins Overlay */}
            <div className="absolute inset-0">
              {pinsData.map((pin, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: 'spring', delay: index * 0.03 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <Link 
                    to={`/Arealist/${pin.name.replace(/\s/g, '-')}`}
                    onMouseEnter={() => setHoveredPin(pin.name)}
                    onMouseLeave={() => setHoveredPin(null)}
                    className="relative block"
                  >
                    {/* Animated Outer Glow (Light Mode Friendly) */}
                    <motion.div 
                      animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-red-400 rounded-full"
                    />
                    
                    {/* Main High-Contrast Pin */}
                    <motion.div
                      whileHover={{ scale: 1.2, y: -4 }}
                      className="relative z-20 w-8 h-8 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-[1px] border-slate-50"
                    >
                      {/* Inner Red Core */}
                      <div className="w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                      </div>
                    </motion.div>

                    {/* Tooltip Styling */}
                    <AnimatePresence>
                      {hoveredPin === pin.name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          className="absolute bottom-[140%] left-1/2 -translate-x-1/2 bg-white text-slate-900 border border-slate-100 px-4 py-2 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] z-50 pointer-events-none"
                        >
                          <span className="text-[10px] md:text-xs font-black whitespace-nowrap uppercase tracking-widest">
                            {pin.name}
                          </span>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
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