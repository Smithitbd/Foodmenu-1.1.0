import React from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import login from '../../assets/Images/login.jpg';

const LoginPage = () => {
  return (
  
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans overflow-x-hidden">
      
 
      <div className="w-full lg:w-1/2 h-64 lg:h-screen relative">
        <img 
          src={login} 
          alt="Premium Food" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      
        <div className="absolute inset-0 bg-gradient-to-t from-[#B91C1C]/90 via-[#B91C1C]/20 to-transparent"></div>
        
      
        <div className="absolute bottom-6 left-6 lg:bottom-20 lg:left-16 z-10">
          {/* <h2 className="text-white text-2xl lg:text-5xl font-black italic leading-tight tracking-tighter">
            Manage Your <br className="hidden lg:block" />
            <span className="text-red-200">Food Empire</span>
          </h2> */}
          
        </div>
      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F9FAFB] lg:bg-white relative">
        
        <div className="w-full max-w-md bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl shadow-xl lg:shadow-none -mt-12 lg:mt-0 relative z-20">
          
 
          <div className="text-center mb-8 lg:mb-10">
            <div className="bg-white inline-block px-8 py-3 rounded-2xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
              <span className="text-black font-extrabold italic text-2xl lg:text-3xl tracking-tighter">
                foodmenu<span className="text-[#B91C1C]">BD</span>
              </span>
            </div>
            {/* <h1 className="text-xl lg:text-2xl font-black text-gray-800 uppercase tracking-tight">Welcome Back</h1> */}
            <p className="text-gray-400 text-xs lg:text-sm mt-1 font-medium">Please enter your credentials to login</p>
          </div>

          <form className="space-y-4 lg:space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#B91C1C]">
                  <User size={18} className="text-gray-400 group-focus-within:text-[#B91C1C]" />
                </div>
                <input 
                  type="text" 
                  placeholder="admin_sourov"
                  className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#B91C1C] transition-all text-sm font-semibold shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] lg:text-[11px] text-[#B91C1C] font-extrabold hover:text-red-700">FORGOT?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#B91C1C]">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-[#B91C1C]" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#B91C1C] transition-all text-sm font-semibold shadow-sm"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button className="w-full bg-[#B91C1C] hover:bg-red-700 text-white font-black py-3.5 lg:py-4 rounded-2xl shadow-xl shadow-red-100 hover:shadow-red-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs lg:text-sm mt-6 active:scale-95">
              <LogIn size={20} />
              Login to System
            </button>
          </form>

          {/* Footer Branding */}
          <div className="mt-8 lg:mt-12 text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
              Developed By <span className="text-[#B91C1C]">SMITH IT.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;