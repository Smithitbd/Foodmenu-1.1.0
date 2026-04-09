import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // রিডাইরেক্ট করার জন্য
import { User, Lock, LogIn } from 'lucide-react';
import Swal from 'sweetalert2'; // অ্যালার্টের জন্য
import axios from 'axios';
import loginImg from '../../assets/Images/login.jpg';

const LoginPage = () => {
  // ১. স্টেট ডিক্লেয়ারেশন
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // ২. লগইন হ্যান্ডলার ফাংশন
const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/api/superadmin/login', {
            email,
            password
        });

        if (response.data.admin) {
            // ১. এখানে ডাটা সেভ হচ্ছে
            localStorage.setItem('superadmin_data', JSON.stringify(response.data.admin));

            // ২. সাকসেস মেসেজ দেখিয়ে ড্যাশবোর্ডে পাঠানো
            Swal.fire('Success', 'Login Successful', 'success');
            navigate('/admin'); // ড্যাশবোর্ডে রিডাইরেক্ট
        }
    } catch (error) {
        Swal.fire('Error', 'Invalid Credentials', 'error');
    }
};

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans overflow-x-hidden">
      {/* বাম পাশের ইমেজ সেকশন */}
      <div className="w-full lg:w-1/2 h-64 lg:h-screen relative">
        <img 
          src={loginImg} 
          alt="Premium Food" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#B91C1C]/90 via-[#B91C1C]/20 to-transparent"></div>
      </div>

      {/* ডান পাশের ফর্ম সেকশন */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F9FAFB] lg:bg-white relative">
        <div className="w-full max-w-md bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl shadow-xl lg:shadow-none -mt-12 lg:mt-0 relative z-20">
          
          <div className="text-center mb-8 lg:mb-10">
            <div className="bg-white inline-block px-8 py-3 rounded-2xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
              <span className="text-black font-extrabold italic text-2xl lg:text-3xl tracking-tighter">
                foodmenu<span className="text-[#B91C1C]">BD</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs lg:text-sm mt-1 font-medium">Please enter your credentials to login</p>
          </div>

          {/* লগইন ফর্ম */}
          <form className="space-y-4 lg:space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#B91C1C]">
                  <User size={18} className="text-gray-400 group-focus-within:text-[#B91C1C]" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
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
                  type="text" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#B91C1C] transition-all text-sm font-semibold shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#B91C1C] hover:bg-red-700 text-white font-black py-3.5 lg:py-4 rounded-2xl shadow-xl shadow-red-100 hover:shadow-red-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs lg:text-sm mt-6 active:scale-95"
            >
              <LogIn size={20} />
              Login to System
            </button>
          </form>

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