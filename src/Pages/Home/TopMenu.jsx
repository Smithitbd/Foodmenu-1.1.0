import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation'; 
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa'; 

import { manualRestaurants } from '../../Components/Shared/data/restaurantsData';

const TopMenu = () => {
  const titleRef = useRef(null);
  const [startTyping, setStartTyping] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    // Data Loading time 
    const timer = setTimeout(() => setIsDataLoading(false), 1200);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
        }
      },
      { threshold: 0.5 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // (Shimmer Effect with Skeleton hover)
  const SkeletonItem = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm p-2">
      <div className="relative h-32 md:h-40 bg-slate-200 rounded-xl overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded-full w-3/4 mx-auto animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  );

  // Restaurant card
  const MenuItemCard = ({ item }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10 }}
        onClick={() => navigate(`/cart/${item.slug}`)}
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(176,37,50,0.15)] transition-all duration-500 border border-transparent hover:border-red-50 mb-4 mx-1"
      >
        <div className="relative h-32 md:h-44 overflow-hidden bg-slate-100">
          {!imgLoaded && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
          <img
            src={item.pimage}
            alt={item.r_name}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <FaStar className="text-yellow-400 text-[10px]" />
            <span className="text-[10px] font-black text-slate-800">{item.ratings}</span>
          </div>
        </div>
        
        <div className="p-4 bg-white text-center">
          <h3 className="font-black text-slate-800 text-sm md:text-base truncate group-hover:text-[#b02532] transition-colors duration-300">
            {item.r_name}
          </h3>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="relative z-20 py-16 md:py-24 bg-[#fcfdfe] font-['Gilroy'] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-50/50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left" ref={titleRef}>
            <AnimatePresence mode="wait">
              <motion.p 
                key={startTyping ? 'suggest' : 'recom'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] md:text-xs font-black tracking-[0.4em] text-[#b02532] uppercase mb-3"
              >
                {startTyping ? "Top Suggestions" : "Recommended for you"}
              </motion.p>
            </AnimatePresence>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Ultimate <span className="text-[#b02532] relative">Food
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="#b02532" strokeWidth="2" fill="none" opacity="0.3" /></svg>
              </span> <br /> Experience
            </h2>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#b02532" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/all-restaurants')} 
            className="w-fit px-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl transition-all"
          >
            Explore All Brands
          </motion.button>
        </div>

        {/* Swiper Section */}
        <div className="relative group/swiper">
          {/* Custom Navigation */}
          <div className="hidden lg:block">
            <button className="swiper-prev-btn absolute -left-6 top-[45%] -translate-y-1/2 z-30 w-12 h-12 bg-white shadow-2xl rounded-full flex items-center justify-center text-slate-800 hover:bg-[#b02532] hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-gray-50">
              <FaChevronLeft size={16} />
            </button>
            <button className="swiper-next-btn absolute -right-6 top-[45%] -translate-y-1/2 z-30 w-12 h-12 bg-white shadow-2xl rounded-full flex items-center justify-center text-slate-800 hover:bg-[#b02532] hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-gray-50">
              <FaChevronRight size={16} />
            </button>
          </div>

          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={20}
            slidesPerView={2.2}
            navigation={{
              nextEl: '.swiper-next-btn',
              prevEl: '.swiper-prev-btn',
            }}
            breakpoints={{
              640: { slidesPerView: 3.2, spaceBetween: 24 },
              1024: { slidesPerView: 4.5, spaceBetween: 28 },
              1280: { slidesPerView: 5.5, spaceBetween: 30 },
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            loop={manualRestaurants.length > 5}
            className="!pb-16 !px-2"
          >
            {isDataLoading 
              ? [...Array(6)].map((_, i) => (
                  <SwiperSlide key={`skeleton-${i}`}>
                    <SkeletonItem />
                  </SwiperSlide>
                ))
              : manualRestaurants.map((rest) => (
                  <SwiperSlide key={rest.id}>
                    <MenuItemCard item={rest} />
                  </SwiperSlide>
                ))
            }
          </Swiper>
        </div>
      </div>

      <style>{`
        .swiper-pagination-bullet { background: #cbd5e1; opacity: 1; }
        .swiper-pagination-bullet-active {
          background: #b02532 !important;
          width: 28px !important;
          border-radius: 12px !important;
          transition: all 0.3s ease;
        }
        .swiper-slide { height: auto; }
      `}</style>
    </section>
  );
};

export default TopMenu;