import { Link } from "react-router-dom";
import logo from "../../../assets/foodmenu.png";
import OrderTrackerWidget from "../../Button/OrderTrackerSticky";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          
          {/* Logo Section - Removed Hover Scale */}
          <div className="shrink-0 flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2"
            >
              {/* App Logo with Continuous Shine Animation */}
              <div className="relative overflow-hidden animate-in fade-in slide-in-from-left-5 duration-1000 ease-out">
                <img
                  src={logo}
                  alt="FoodMenu"
                  loading="lazy"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain"
                />
                
                {/* Continuous Shine Effect (Hover Removed) */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
              </div>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-1000">
            <OrderTrackerWidget />
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;