import React, { useEffect, useRef, useState } from 'react';
import picture from '../../assets/Images/Picture.gif';
import img1 from '../../assets/Images/01.gif';
import img2 from '../../assets/Images/02.gif';
import img4 from '../../assets/Images/04.gif';
import img5 from '../../assets/Images/05.gif';
import img6 from '../../assets/Images/06.gif';

const Features = () => {
  const cardRefs = useRef([]);
  const titleRef = useRef(null);
  const [startTyping, setStartTyping] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide effect for features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for Typing effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
          setTimeout(() => setStartTyping(false), 3000);
        }
      },
      { threshold: 0.5 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: img2, title: "Get It Your Way", subtitle: "(Dine In, Take Out, Delivery)" },
    { icon: img1, title: "Updated & Printed Offline Menu", subtitle: null },
    { icon: img2, title: "Available / Unavailable Foods Selection.", subtitle: null },
    { icon: img4, title: "Sales Report", subtitle: "(Daily, Weekly, Monthly)" },
    { icon: img5, title: "Invoice Create", subtitle: null },
    { icon: img6, title: "Friendly User For All People", subtitle: null },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white font-['Gilroy']" id="feature_part">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Title Section */}
        <div className="text-center mb-12 lg:mb-20">
          <p
            ref={titleRef}
            className={`text-xl sm:text-2xl font-normal tracking-widest text-[#b02532] mb-4 h-8 ${startTyping ? "animate-pulse" : ""}`}
          >
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-5xl font-normal leading-tight text-gray-800">
            Unmatched Features <span className="text-[#b02532]">You'll Love</span>
          </h2>
        </div>

        {/* Mobile Animation Image */}
        <div className="block lg:hidden mb-12 text-center">
          <img src={picture} alt="Food Animation" loading="lazy" className="w-full max-w-sm mx-auto rounded-3xl shadow-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Features Grid */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-16">

              {features.map((f, i) => {
                const isActive = activeIndex === i;
                return (
                  <div key={i} className="relative group">
                    
                    {/* Circle/Icon Part */}
                    <div className="absolute -top-8 left-3 lg:-top-10 lg:left-6 z-20">
                      <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full shadow-xl flex items-center justify-center border-[6px] lg:border-8 border-gray-50 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
                        <div
                          className="w-11 h-11 lg:w-14 lg:h-14 bg-cover bg-center rounded-full"
                          style={{ backgroundImage: `url(${f.icon})` }}
                        />
                      </div>
                    </div>

                    {/* Feature Card Content */}
                    <div className={`pt-14 pb-10 px-6 lg:pt-16 lg:px-8 rounded-3xl shadow-lg text-left relative overflow-hidden transition-all duration-500 
                      ${isActive ? 'bg-[#b02532] -translate-y-3' : 'bg-white'}`}>
                      
                      <h3 className={`text-lg lg:text-xl font-normal mb-2 leading-tight relative z-10 transition-colors duration-500 
                        ${isActive ? 'text-white' : 'text-gray-800'}`}>
                        {f.title}
                      </h3>
                      
                      {f.subtitle && (
                        <p className={`text-sm font-normal leading-tight relative z-10 transition-colors duration-500 
                          ${isActive ? 'text-red-100' : 'text-gray-500'}`}>
                          {f.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Desktop Sticky Image */}
          <div className="hidden lg:block lg:col-span-5 order-1 lg:order-2">
            <div className="sticky top-24">
              <img src={picture} alt="Food Animation" className="w-full max-w-xl mx-auto rounded-[2rem] shadow-2xl transition-transform duration-700 hover:scale-105" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;