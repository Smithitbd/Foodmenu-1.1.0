import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ক্লিকের বাইরে মেনু বন্ধ করার জন্য
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
      {/* বাম দিকে স্বাগতম মেসেজ */}
      <div className="hidden md:block text-gray-400 font-medium italic text-sm">
        Welcome back, <span className="text-[#B91C1C] font-bold">Sourov</span>
      </div>
      
      {/* ডান দিকে প্রোফাইল ড্রপডাউন */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs border-2 border-red-100 shadow-sm">
             SO
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-gray-800 font-black text-sm uppercase tracking-tight">sourov</span>
            <span className="text-[10px] text-green-500 font-bold">Admin</span>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* ড্রপডাউন মেনু */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Manage Account</p>
            </div>
            
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#B91C1C] transition-colors">
              <User size={16} />
              <span className="font-semibold">View Profile</span>
            </button>
            
            <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
            
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={16} />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;