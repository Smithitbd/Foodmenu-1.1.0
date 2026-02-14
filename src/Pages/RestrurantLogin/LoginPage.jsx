import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import Swal from 'sweetalert2'; 
import axios from 'axios'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Default Email and Pass
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
         email : email,
         password: password 
        });
      if(response.status === 200){
        setIsLoading(false);
        Swal.fire({
          icon : 'success',
          title : 'Welcome Back..!',
          text: `Hello ${response.data.user.name}, Login Successfully..!`,
          timer: 1500,
          showConfirmButton : false
        });
        //store user data in localstorage
        localStorage.setItem('user',JSON.stringify(response.data.user));
        localStorage.setItem('restaurantId', response.data.user.id);
        navigate('/restaurantadmin');
      }
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon : 'error',
        title : 'Login Failed..',
        text: error.response?.data?.message || 'The email or password you entered is incorrect.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-5 overflow-hidden font-['Gilroy']">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1000px] h-full max-h-[600px] lg:max-h-[620px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 relative z-10"
      >
        
        <div className="w-full md:w-[40%] h-[180px] md:h-full bg-slate-900 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <div onClick={() => navigate('/')} className="flex items-center gap-2 mb-4 md:mb-12 cursor-pointer w-50 h-25 brightness-0 invert">
              {/*<div className=" bg-red-600 rounded-lg flex items-center justify-center font-black text-base"></div>*/}
              <span  classname ="w-half h-half object-contain" > <img src= '../../../src/assets/foodmenu.png' alt='FoodMenuBD'></img></span>
              {/*<span className="text-sm md:text-lg font-black tracking-tight uppercase">FoodMenu<span className="text-red-500">BD</span></span>*/}
            </div>

            <h1 className="text-xl md:text-4xl font-black leading-tight mb-2 md:mb-4">
              Elevate your <br className="hidden md:block" /> 
              <span className="text-red-500">Kitchen</span> Business.
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
              Join thousands of restaurant owners managing their menus digitally.
            </p>
          </div>

          <div className="relative z-10 hidden sm:block">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secured by <span className="text-[12px] text-red-500">SMITH IT</span></p>
          </div>
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-red-500/20 to-transparent" />
        </div>

        {/* Form Section */}
        <div className="flex-1 p-6 md:p-10 lg:p-12 bg-white flex flex-col justify-center overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-6 md:mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Login</h2>
                <div className="h-1 w-8 bg-red-600 rounded-full mt-1"></div>
              </div>
              <Link to="/addmenuform" className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                Register?
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button className="flex items-center justify-center gap-2 py-2 md:py-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-600">
                <FaGoogle className="text-red-500" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2 md:py-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-600">
                <FaFacebookF className="text-blue-600" /> Facebook
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cafe.com"
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-red-100 focus:bg-white rounded-xl outline-none text-xs font-semibold text-slate-700 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <button type="button" className="text-[9px] font-black text-slate-300 hover:text-red-600 transition-colors">Forgot?</button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-red-100 focus:bg-white rounded-xl outline-none text-xs font-semibold text-slate-700 transition-all"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                  </button>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-xl font-black text-white text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                  isLoading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-red-600 shadow-slate-50'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Sign In'}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-[9px] text-slate-300 font-medium">
              By logging in, you agree to our <span className="underline">Terms</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;