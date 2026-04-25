import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2';
import { 
  LayoutDashboard, Store, MapPin, PlusCircle, Utensils, 
  ShoppingCart, CheckCircle, BarChart3, Gift, UserCircle, 
  Menu, X, ChevronDown, Settings, LogOut, 
  Edit, List, Plus, FileText, PieChart, Armchair, Bell,
  Download 
} from 'lucide-react';
import logoImg from '../../assets/foodmenu.png'; 
import Footer from '../../../src/Components/Shared/Restaurant/RestaurantFooter'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false); 

  // --- Notification State ---
  const [hasNewOrder, setHasNewOrder] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole'); 
  const restaurantId = localStorage.getItem('resId');
  const [resName, setResName] = useState(localStorage.getItem('resName'));
  const [resLogo, setResLogo] = useState(localStorage.getItem('resLogo'));

  // নোটিফিকেশন চেক করার ফাংশন
  const checkNewOrders = async () => {
    if (!restaurantId) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${restaurantId}`);
      const pendingOrders = response.data.filter(order => 
        order.order_status === 'pending' && order.order_type !== 'Offline'
      );
      
      if (pendingOrders.length > 0 && location.pathname !== '/restaurantadmin/cart') {
        setHasNewOrder(true);
      } else {
        setHasNewOrder(false);
      }
    } catch (error) {
      console.error("Notification Check Error:", error);
    }
  };

  useEffect(() => {
    const syncDashboard = async () => {
      const resId = localStorage.getItem('resId');
      if (!resId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/restaurant/${resId}`);
        setIsStoreOpen(res.data.status === 'active');
        setResName(res.data.restaurant_name);
        const formattedLogo = `http://localhost:5000/uploads/${res.data.logo}`;
        setResLogo(formattedLogo);
        localStorage.setItem('resName', res.data.restaurant_name);
        localStorage.setItem('resLogo', formattedLogo);
      } catch (error) {
        console.error("Layout Sync Error:", error);
      }
    };
    syncDashboard();

    checkNewOrders();
    const intervalId = setInterval(checkNewOrders, 10000);
    return () => clearInterval(intervalId);
  }, [restaurantId, location.pathname]);

  const restaurantInfo = {
    name: resName,
    logo: resLogo
  };

  const handleLogout = () => {
    setIsProfileOpen(false); 
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout!',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear(); 
        navigate('/login');
      }
    });
  };

  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(userRole);
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans overflow-hidden border-none">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[#1E293B] text-gray-300 transition-all duration-300 flex flex-col shadow-2xl z-50`}>
        <div className="h-20 flex items-center px-4 bg-[#91290c] border-b border-gray-800">
          <div className="min-w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          
          {/* 1. Dashboard */}
          {hasAccess(['Owner', 'Manager']) && (
            <Link to="/restaurantadmin" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><LayoutDashboard size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Dashboard</span></div>}
            </Link>
          )}

          {/* 2. Manage Shop */}
          {hasAccess(['Owner']) && (
            <Link to="/restaurantadmin/manage-shop" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/manage-shop' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/manage-shop' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><Store size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Manage Shop</span></div>}
            </Link>
          )}

          {/* 3. Delivery Area */}
          {hasAccess(['Owner']) && (
            <Link to="/restaurantadmin/delivery-area" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/delivery-area' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/delivery-area' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><MapPin size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Delivery Area</span></div>}
            </Link>
          )}

          {/* 4. Menu Category */}
          {hasAccess(['Owner', 'Manager']) && (
            <Link to="/restaurantadmin/category" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/category' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/category' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><Menu size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Menu Category</span></div>}
            </Link>
          )}

          {/* 5. Menu Dropdown */}
          {hasAccess(['Owner', 'Manager', 'Chief-Waiter', 'Waiter']) && (
            <div className="py-1">
              <button onClick={() => isSidebarOpen && setIsMenuOpen(!isMenuOpen)} className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/menu') || location.pathname.includes('/restaurantadmin/download-menu') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}>{/**/}
                <Utensils size={20} className={location.pathname.includes('/restaurantadmin/menu') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-4">
                    <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Menu</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                  </div>
                )}
              </button>
              {isSidebarOpen && isMenuOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l border-gray-700">
                  {hasAccess(['Owner', 'Manager']) && (
                    <Link to="/restaurantadmin/add-menus" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic">
                      <Plus size={14} /> Add Menu
                    </Link>
                  )}
                  <Link to="/restaurantadmin/menu-list" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors italic">
                    <List size={14} /> Menu List
                  </Link>
                  <Link to="/restaurantadmin/view-menu" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors italic">
                    <List size={14} /> View-Menu
                  </Link>
                  {/* --- Download Menu Added --- 
                  <Link to="/restaurantadmin/download-menu" className={`flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase hover:text-red-500 transition-colors italic ${location.pathname === '/restaurantadmin/download-menu' ? 'text-red-500' : 'text-gray-400'}`}>
                    <Download size={14} /> Download Menu
                  </Link>*/}
                  <div className={`flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase transition-colors italic cursor-not-allowed opacity-70 ${location.pathname === '/restaurantadmin/download-menu' ? 'text-red-500' : 'text-gray-400'}`}>
                    <Download size={14} /> Download Menu
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. Cart List */}
          {hasAccess(['Owner', 'Manager']) && (
            <Link to="/restaurantadmin/cart" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/cart' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/cart' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><ShoppingCart size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Cart List</span></div>}
            </Link>
          )}

          {/* 7. Available Food */}
          {hasAccess(['Owner', 'Manager', 'Chief-Waiter']) && (
            <Link to="/restaurantadmin/available" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/available' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/available' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><CheckCircle size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Available Food</span></div>}
            </Link>
          )}

          {/* 8. Table Dropdown */}
          {hasAccess(['Owner', 'Manager', 'Chief-Waiter']) && (
            <div className="py-1">
              <button onClick={() => isSidebarOpen && setIsTableOpen(!isTableOpen)} className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/table') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}>
                <Armchair size={20} className={location.pathname.includes('/restaurantadmin/table') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-4">
                    <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Table</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isTableOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                  </div>
                )}
              </button>
              {isSidebarOpen && isTableOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l border-gray-700">
                  {hasAccess(['Owner', 'Manager']) && (
                    <Link to="/restaurantadmin/add-table" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic">
                      <Plus size={14} /> Add Table
                    </Link>
                  )}
                  <Link to="/restaurantadmin/table-list" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors italic">
                    <List size={14} /> Table List
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 9. Order Dropdown */}
          {hasAccess(['Owner', 'Manager', 'Chief-Waiter']) && (
            <div className="py-1">
              <button onClick={() => isSidebarOpen && setIsOrderOpen(!isOrderOpen)} className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/orderslists') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}>
                <ShoppingCart size={20} className={location.pathname.includes('/restaurantadmin/orderslists') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-4">
                    <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Order</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOrderOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                  </div>
                )}
              </button>
              {isSidebarOpen && isOrderOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l border-gray-700">
                  <Link to="/restaurantadmin/create-Order-List" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic">
                    <PlusCircle size={14} /> Create Order
                  </Link>
                  <Link to="/restaurantadmin/orderslists" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors italic">
                    <List size={14} /> Order List
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 10. Reports */}
          {hasAccess(['Owner']) && (
            <div className="py-1">
              <button onClick={() => isSidebarOpen && setIsReportOpen(!isReportOpen)} className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/reports') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}>
                <BarChart3 size={20} className={location.pathname.includes('/restaurantadmin/reports') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-4">
                    <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Reports</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isReportOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                  </div>
                )}
              </button>
              {isSidebarOpen && isReportOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l border-gray-700">
                  <Link to="/restaurantadmin/table-report" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 italic">
                    <FileText size={14} /> Table Report
                  </Link>
                  <Link to="/restaurantadmin/graph-report" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 italic">
                    <PieChart size={14} /> Graph Report
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 11. Offers */}
          {hasAccess(['Owner', 'Manager']) && (
            <Link to="/restaurantadmin/offers" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/offers' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/offers' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><Gift size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Offers</span></div>}
            </Link>
          )}

          {/* 12. Registration */}
          {hasAccess(['Owner']) && (
            <Link to="/restaurantadmin/registration" className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/registration' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-gray-800/50 hover:text-white'}`}>
              <span className={`${location.pathname === '/restaurantadmin/registration' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><UserCircle size={20} /></span>
              {isSidebarOpen && <div className="ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Registration</span></div>}
            </Link>
          )}

        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 border-none">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-40">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100">
            {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>

          {/* --- Right Section (Notification + Profile) --- */}
          <div className="flex items-center gap-6">
            
            {hasNewOrder && (
              <button 
                onClick={() => { navigate('/restaurantadmin/cart'); setHasNewOrder(false); }}
                className="relative p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100 animate-bounce"
                title="New Online Orders!"
              >
                <Bell size={20} fill="currentColor" />
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                </span>
              </button>
            )}

            <div className="relative">
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900 italic uppercase leading-none">
                    <span className="text-red-600">{resName} </span>
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Role: {userRole}</p>
                </div>
                <img src={restaurantInfo.logo} alt="User" className={`w-11 h-11 bg-gray-900 rounded-2xl object-cover shadow-md rotate-3 group-hover:rotate-0 transition-all ${!isStoreOpen && 'grayscale-70'}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  {hasAccess(['Owner', 'Manager']) && (
                    <button onClick={() => { setIsProfileOpen(false); navigate('/restaurantadmin/manage-shop'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
                      <Edit size={18}/> Edit Profile
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                    <LogOut size={18}/> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet context={[isStoreOpen, setIsStoreOpen, userRole]} />
          </div> 
          <Footer />
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;