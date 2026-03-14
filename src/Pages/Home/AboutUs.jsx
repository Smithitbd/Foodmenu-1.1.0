import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaUtensils, FaMapMarkedAlt, FaRocket, FaUsers, FaShieldAlt,
  FaHeart, FaChevronRight, FaCheckCircle, FaAward, FaHandshake 
} from 'react-icons/fa';

const AboutUs = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-['Gilroy'] text-[#1A1A1A]">
      
      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative pt-32 pb-40 bg-[#0A0F1D] overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block px-5 py-2 rounded-full bg-white/5 border border-white/10 text-red-500 text-[11px] font-black uppercase tracking-[0.3em] mb-8"
            >
              The Future of Food Discovery
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.95]"
            >
              Your City. <br /> <span className="text-red-600">Digitalized.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-lg md:text-2xl leading-relaxed font-medium mb-12"
            >
              FoodMenuBD is building the digital infrastructure for Sylhet’s food ecosystem—connecting thousands of food lovers with the most authentic culinary experiences.
            </motion.p>
          </div>
        </div>
      </section>

      {/* --- TRUST STATS (GLASSMORPHISM) --- */}
      <section className="relative z-20 mt-[-100px] px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Registered Partners', val: '500+', icon: <FaUtensils /> },
              { label: 'Trusted By', val: '15k+', icon: <FaUsers /> },
              { label: 'Secure Platform', val: '100%', icon: <FaShieldAlt /> },
              { label: 'Local Support', val: '24/7', icon: <FaHandshake /> },
            ].map((s, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex flex-col items-center"
              >
                <div className="w-14 h-14 bg-slate-50 text-red-600 rounded-2xl flex items-center justify-center text-xl mb-6">{s.icon}</div>
                <h3 className="text-4xl font-black mb-1">{s.val}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY TRUST US SECTION --- */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeUp} className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-50 rounded-full -z-10" />
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8">
                  Building a Platform Based on <span className="text-red-600">Trust</span> and <span className="text-red-600">Transparency</span>
                </h2>
                <div className="space-y-6">
                    <div className="flex gap-5">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex-shrink-0 flex items-center justify-center text-green-600"><FaCheckCircle /></div>
                        <div>
                            <h4 className="font-black text-lg">Verified Merchants Only</h4>
                            <p className="text-slate-500 text-sm">We manually verify every restaurant’s legal documents to ensure safety for our users.</p>
                        </div>
                    </div>
                    <div className="flex gap-5">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600"><FaAward /></div>
                        <div>
                            <h4 className="font-black text-lg">Accurate Information</h4>
                            <p className="text-slate-500 text-sm">Our team ensures that menus, pricing, and locations are always up-to-date.</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600" className="rounded-[3rem] h-64 w-full object-cover mt-12 shadow-2xl" alt="Trust 1" />
              <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600" className="rounded-[3rem] h-64 w-full object-cover shadow-2xl" alt="Trust 2" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- OUR PROMISE (ICON GRID) --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-16">The FoodMenuBD Promise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Empowerment", desc: "Giving local home-kitchens the same digital power as big brands." },
              { title: "Discovery", desc: "Helping you find the hidden gems of Sylhet that aren't on Google Maps." },
              { title: "Innovation", desc: "Using cutting-edge technology to make food ordering a breeze." }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="w-2 h-12 bg-red-600 mx-auto rounded-full" />
                <h4 className="text-xl font-black">{item.title}</h4>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROFESSIONAL CTA --- */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="bg-[#0A0F1D] rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(220,38,38,0.2)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tight">
                Partner with the <br /> <span className="text-red-600">Leader</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed">
                Take your restaurant’s digital presence to the next level. Join our network and reach thousands of new customers today.
              </p>
              
              <Link to="/addmenuform">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220,38,38,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 text-white px-16 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center gap-4 mx-auto"
                >
                  Register Your Business <FaChevronRight />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;