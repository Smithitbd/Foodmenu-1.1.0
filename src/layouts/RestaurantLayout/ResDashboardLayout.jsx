import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2';
import { 
  LayoutDashboard, Store, MapPin, PlusCircle, Utensils, 
  ShoppingCart, CheckCircle, BarChart3, Gift, UserCircle, 
  Menu, X, ChevronDown, Bell, Settings, LogOut, 
  Edit, List, Plus, FileText, PieChart
} from 'lucide-react';
import logoImg from '../../assets/foodmenu.png'; 
import Footer from '../../../src/Components/Shared/Restaurant/RestaurantFooter'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [newOrders, setNewOrders] = useState(3);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [resName, setResName] = useState(localStorage.getItem('resName'));
  const [resLogo, setResLogo] = useState(localStorage.getItem('resLogo'));
  useEffect(() => {
    const syncDashboard = async () => {
      const resId = localStorage.getItem('resId');
      if (!resId) return;
      try{
        const res = await axios.get(`http://localhost:5000/api/dashboard-stats/${resId}`);
        setIsStoreOpen(res.data.status === 'active');
        setResName(res.data.name);
        setResLogo(res.data.logo);
        localStorage.setItem('resName', res.data.name);
      }catch(error){
        console.error("Layout Sync Error:", error);
      }
    };
  syncDashboard();
  }, []);

  const restaurantInfo = {
    name: resName,
    logo: resLogo
  };

  const handleLogout = () => {
    setIsProfileOpen(false); 
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out from the panel!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout!',
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[#1E293B] text-gray-300 transition-all duration-300 flex flex-col shadow-2xl z-50`}>
        <div className="h-20 flex items-center px-4 bg-[#91290c] border-b border-gray-800">
          <div className="min-w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          
          {/* 1. Dashboard */}
          <Link 
            to="/restaurantadmin" 
            title={!isSidebarOpen ? "Dashboard" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><LayoutDashboard size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Dashboard</span></div>}
          </Link>

          {/* 2. Manage Shop */}
          <Link 
            to="/restaurantadmin/manage-shop" 
            title={!isSidebarOpen ? "Manage Shop" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/manage-shop' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/manage-shop' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><Store size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Manage Shop</span></div>}
          </Link>

          {/* 3. Delivery Area */}
          <Link 
            to="/restaurantadmin/delivery-area" 
            title={!isSidebarOpen ? "Delivery Area" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/delivery-area' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/delivery-area' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><MapPin size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Delivery Area</span></div>}
          </Link>

          {/* 4. Menu Category */}
          <Link 
            to="/restaurantadmin/category" 
            title={!isSidebarOpen ? "Menu Category" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/category' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/category' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><Menu size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Menu Category</span></div>}
          </Link>

          {/* 6. --- Dropdown: Menu --- */}
          <div className="py-1">
            <button
              onClick={() => isSidebarOpen && setIsMenuOpen(!isMenuOpen)}
              title={!isSidebarOpen ? "Menu" : ""}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/menu') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}
            >
              <Utensils size={20} className={location.pathname.includes('/restaurantadmin/menu') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1 ml-4">
                  <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Menu</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                </div>
              )}
            </button>
            {isSidebarOpen && isMenuOpen && (
              <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 animate-in slide-in-from-top-2">
                <Link to="/restaurantadmin/add-menus" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic tracking-widest">
                  <Plus size={14} /> Add Menu
                </Link>
                <Link to="/restaurantadmin/menu-list" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors tracking-tighter italic">
                  <List size={14} /> Menu List
                </Link>
              </div>
            )}
          </div>

          {/* 7. Cart List */}
          <Link 
            to="/restaurantadmin/cart" 
            title={!isSidebarOpen ? "Cart List" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/cart' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/cart' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><ShoppingCart size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Cart List</span></div>}
          </Link>

          {/* 8. Available Food */}
          <Link 
            to="/restaurantadmin/available" 
            title={!isSidebarOpen ? "Available Food" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/available' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/available' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><CheckCircle size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Available Food</span></div>}
          </Link>

          {/* 9. --- Dropdown: Order Food --- */}
          <div className="py-1">
            <button
              onClick={() => isSidebarOpen && setIsOrderOpen(!isOrderOpen)}
              title={!isSidebarOpen ? "Order Food" : ""}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/orderslists') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}
            >
              <ShoppingCart size={20} className={location.pathname.includes('/restaurantadmin/orderslists') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1 ml-4">
                  <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Order Food</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isOrderOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                </div>
              )}
            </button>
            {isSidebarOpen && isOrderOpen && (
              <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 animate-in slide-in-from-top-2">
                <Link to="/restaurantadmin/create-Order-List" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic tracking-widest">
                  <PlusCircle size={14} /> Create Order List
                </Link>
                <Link to="/restaurantadmin/orderslists" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors tracking-tighter italic">
                  <List size={14} /> Order List
                </Link>
              </div>
            )}
          </div>

          {/* 10. --- Dropdown: Sales Report --- */}
          <div className="py-1">
            <button
              onClick={() => isSidebarOpen && setIsReportOpen(!isReportOpen)}
              title={!isSidebarOpen ? "Sales Report" : ""}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/restaurantadmin/reports') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}
            >
              <BarChart3 size={20} className={location.pathname.includes('/restaurantadmin/reports') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1 ml-4">
                  <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Sales Report</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isReportOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
                </div>
              )}
            </button>
            {isSidebarOpen && isReportOpen && (
              <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 animate-in slide-in-from-top-2">
                <Link to="/restaurantadmin/table-report" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic tracking-widest">
                  <FileText size={14} /> Table Report
                </Link>
                <Link to="/restaurantadmin/graph-report" className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors tracking-tighter italic">
                  <PieChart size={14} /> Graph Report
                </Link>
              </div>
            )}
          </div>

          {/* 11. Add Offer */}
          <Link 
            to="/restaurantadmin/offers" 
            title={!isSidebarOpen ? "Add Offer" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/offers' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/offers' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><Gift size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Add Offer</span></div>}
          </Link>

          {/* 12. Registration */}
          <Link 
            to="/restaurantadmin/registration" 
            title={!isSidebarOpen ? "Registration" : ""}
            className={`flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/restaurantadmin/registration' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
          >
            <span className={`${location.pathname === '/restaurantadmin/registration' ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}><UserCircle size={20} /></span>
            {isSidebarOpen && <div className="flex items-center justify-between flex-1 ml-4"><span className="text-[13px] font-bold tracking-tight uppercase italic">Registration</span></div>}
          </Link>

        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- HEADER --- */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-40">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100">
            {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setNewOrders(0); navigate('/restaurantadmin/orderslists'); }} 
              className="relative p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
            >
              <Bell size={24} className={newOrders > 0 ? "animate-bounce text-red-600" : ""} />
              {newOrders > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">{newOrders}</span>}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900 italic uppercase leading-none"><span className="text-red-600">{resName} </span></p>
                  <p className={`text-[9px] font-bold uppercase mt-1 flex items-center justify-end gap-1 ${isStoreOpen ? 'text-green-500' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {isStoreOpen ? 'Online' : 'Offline'}
                  </p>
                </div>
                <img src={restaurantInfo.logo} alt="User" className={`w-11 h-11 bg-gray-900 rounded-2xl object-cover shadow-md rotate-3 group-hover:rotate-0 transition-all ${!isStoreOpen && 'grayscale-70'}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in zoom-in-95 duration-200">
                  <button onClick={() => { setIsProfileOpen(false); navigate('/restaurantadmin/manage-shop'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
                    <Edit size={18}/> Edit Profile
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                    <LogOut size={18}/> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- BODY --- */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet context={[isStoreOpen, setIsStoreOpen]} />
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