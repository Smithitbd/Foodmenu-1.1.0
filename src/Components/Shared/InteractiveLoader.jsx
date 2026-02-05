import { motion } from "framer-motion";

const InteractiveLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <h2 className="text-2xl font-black text-[#b02532] tracking-tighter mb-4">FOODMENU<span className="text-slate-900">BD</span></h2>
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-[#b02532]"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveLoader;