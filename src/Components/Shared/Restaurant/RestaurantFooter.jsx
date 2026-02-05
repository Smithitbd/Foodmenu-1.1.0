import React from 'react';
import { Facebook, MessageCircle, ArrowUpRight } from 'lucide-react';

const RestaurantFooter = () => {
  return (
    <footer className="mt-12 mb-6 mx-2">
      <div className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-[30px] p-6 shadow-sm hover:shadow-md transition-all duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] leading-none mb-1">
                Developed With Passion
              </p>
              <div className="flex items-center group">
                <span className="text-[11px] font-bold text-gray-500 mr-1"> By ____</span>
                <a 
                  href='https://smithitbd.com/' 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-black text-gray-900 italic hover:text-red-600 transition-all flex items-center gap-1"
                >
                  SMITH <span className="text-red-600">IT</span>
                  <span className="text-[11px] font-bold text-gray-500 mr-1"> ____</span>
                  {/*<ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all" />*/}
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE*/}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Email with custom hover */}
            <a 
              href="mailto:info@smithitbd.com" 
              className="relative text-[11px] font-black text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest group"
            >
              info@smithitbd.com
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-600 transition-all group-hover:w-full"></span>
            </a>

            {/* Social Icons with Glass Effect */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/smithIt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
              >
                <Facebook size={18} />
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/+8801764561996" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default RestaurantFooter;