import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CTAButton from '../../Components/Button/CTAButton'; 
import menuDemo from '../../assets/images/menu.jpeg';
import CreationModal from '../../Components/Shared/CreationModal';

const HowToMakeMenu = () => {
  const [openIndex, setOpenIndex] = useState(0); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const steps = [
    "Access the Dashboard",
    "Browse Template",
    "Select Your Design",
    "Publish or Print"
  ];

  const contents = [
    "Open the Food Menu app, enter your username and password, then click ‘Login’ to access your account. This will take you to the main dashboard of the app.",
    "Select 'Offline Menu' from the dashboard and choose your restaurant category—Small, Medium, or Large. After selecting the category, you will see three or four different menu types.",
    "Pick your preferred menu from the available options and update your restaurant details. Experiment with different menu designs to find the one that best suits your style.",
    "Once satisfied with your menu design, you can either publish it online or print a hard copy. This ensures your restaurant’s menu is ready for customers."
  ];

  return (
    <section className="relative py-20 lg:py-[120px] bg-white font-['Gilroy'] overflow-hidden">
      {/* Background Subtle Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-[1300px] mx-auto px-5 relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-16 lg:mb-[90px]">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-red-600 font-black tracking-[0.3em] uppercase text-xs md:text-sm mb-3"
          >
            Workflow
          </motion.p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            How To Make <span className="text-red-600">Menu</span>
          </h2>
          <div className="w-20 h-1.5 bg-red-600 mx-auto mt-6 rounded-full" />
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-[80px]">
          
          {/* Left Column: Image with Floating Animation */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:flex-1"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-red-100/50 rounded-[40px] blur-2xl group-hover:bg-red-200/50 transition-colors" />
              <img 
                src={menuDemo} 
                alt="Food Menu BD Demo" 
                loading="lazy"
                className="relative w-full h-auto rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </motion.div>

          {/* Right Column: Accordion Steps */}
          <div className="w-full lg:flex-1">
            <div className="rounded-[24px] py-2">
              {steps.map((title, index) => (
                <div 
                  key={index} 
                  className={`mb-4 rounded-3xl transition-all duration-300 ${
                    openIndex === index ? 'bg-slate-50 p-4 md:p-6' : 'p-4'
                  }`}
                >
                  
                  {/* Step Header */}
                  <div 
                    onClick={() => toggleAnswer(index)}
                    className="flex items-center gap-5 cursor-pointer group"
                  >
                    {/* Number Badge */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 ${
                      openIndex === index ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      0{index + 1}
                    </div>
                    
                    <h3 className={`text-lg lg:text-xl font-black flex-1 transition-colors duration-300 ${
                      openIndex === index ? 'text-red-600' : 'text-slate-700 hover:text-red-500'
                    }`}>
                      {title}
                    </h3>
                    
                    <div className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-red-600' : 'text-slate-300'}`}>
                      {openIndex === index ? '−' : '+'}
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out
                      ${openIndex === index ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-slate-500 text-sm md:text-base leading-[1.8] pl-[60px]">
                      {contents[index]}
                    </p>
                  </div>
                </div>
              ))}

              {/* Action Button Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-10 flex flex-col items-center lg:items-start"
              >
                <div onClick={() => setIsModalOpen(true)}>
                  <CTAButton>
                    Create Your Menu Now
                  </CTAButton>
                </div>
                <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Start your journey for free
                </p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* Creation Modal Integration */}
      <CreationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default HowToMakeMenu;