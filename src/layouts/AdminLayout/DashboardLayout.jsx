import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from "../../assets/foodmenu.png";
import { 
  LayoutDashboard, MapPin, ListPlus, Gift, Utensils, 
  BarChart3, MessageSquare, Star, UserPlus, ChevronLeft, 
  ChevronRight, Users, ChevronDown, Store, PieChart, Menu, X, Bell, LogOut, Edit,
  PlusCircle 
} from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsProfileOpen(false); 
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out from the Admin Panel!",
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
        {/* Header - Brand Identity */}
        <div className="h-20 flex items-center px-4 bg-[#7c0606] border-b border-gray-800">
          <div className="min-w-[40px] h-10 flex items-center justify-center overflow-hidden rounded-lg">
            <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          <SidebarContent isSidebarOpen={isSidebarOpen} location={location} />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- HEADER --- */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100"
          >
            {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 rounded-xl transition-all">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">2</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900 italic uppercase leading-none">Sourov <span className="text-red-600 underline">Admin</span></p>
                  <p className="text-[9px] font-bold uppercase mt-1 flex items-center justify-end gap-1 text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                  </p>
                </div>
                <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md rotate-3 group-hover:rotate-0 transition-all border-2 border-white">
                    <Users size={20} className="text-white" />
                </div>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in zoom-in-95 duration-200">
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
            <Outlet />
          </div> 
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const SidebarContent = ({ isSidebarOpen, location }) => {
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Add Top Restrurant', path: '/admin/add-top', icon: <ListPlus size={20} /> },
    { name: 'Offer List', path: '/admin/offers', icon: <Gift size={20} /> },
    { name: 'Add Request', path: '/admin/request', icon: <Utensils size={20} /> },
    { name: 'Chatlist', path: '/admin/chats', icon: <MessageSquare size={20} /> },
    { name: 'Review', path: '/admin/reviews', icon: <Star size={20} /> },
    { name: 'Registration', path: '/admin/registration', icon: <UserPlus size={20} /> },
  ];

  const areas = ["Zindabazar", "Lamabazar", "Bondorbazar", "Tilagor"];

  return (
    <div className="space-y-1">
      {/* Dashboard Link */}
      <MenuLink item={menuItems[0]} isSidebarOpen={isSidebarOpen} location={location} />

      {/* Dropdown: Restaurant Area */}
      <div className="py-1">
        <button
          onClick={() => isSidebarOpen && setIsAreaOpen(!isAreaOpen)}
          title={!isSidebarOpen ? "Restaurant Area" : ""}
          className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/admin/area') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}
        >
          <MapPin size={20} className={location.pathname.includes('/admin/area') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
          {isSidebarOpen && (
            <div className="flex items-center justify-between flex-1 ml-4">
              <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Restaurant Area</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isAreaOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
            </div>
          )}
        </button>
        {isSidebarOpen && isAreaOpen && (
          <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 animate-in slide-in-from-top-2">
            <Link to="/admin/area" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors italic tracking-widest">
              <PlusCircle size={14} /> Add New Area
            </Link>
            {areas.map(area => (
              <Link key={area} to={`/admin/area/${area.toLowerCase()}`} className="flex items-center gap-3 px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors tracking-tighter">
                <Store size={14} /> {area}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown: Sales Report */}
      <div className="py-1">
        <button
          onClick={() => isSidebarOpen && setIsSalesOpen(!isSalesOpen)}
          title={!isSidebarOpen ? "Sales Report" : ""}
          className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname.includes('/admin/sales') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'}`}
        >
          <BarChart3 size={20} className={location.pathname.includes('/admin/sales') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} />
          {isSidebarOpen && (
            <div className="flex items-center justify-between flex-1 ml-4">
              <span className="text-[13px] font-bold tracking-tight uppercase italic text-left">Sales Report</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isSalesOpen ? 'rotate-180 text-red-500' : 'opacity-50'}`} />
            </div>
          )}
        </button>
        {isSidebarOpen && isSalesOpen && (
          <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 animate-in slide-in-from-top-2">
            <Link to="/admin/sales_tablereport" className="flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest italic">
              <PieChart size={14} /> Table Report
            </Link>
          </div>
        )}
      </div>

      {/* Other Menu Items */}
      {menuItems.slice(1).map((item) => (
        <MenuLink key={item.path} item={item} isSidebarOpen={isSidebarOpen} location={location} />
      ))}
    </div>
  );
};

const MenuLink = ({ item, isSidebarOpen, location }) => {
  const isActive = location.pathname === item.path;
  return (
    <Link 
      to={item.path} 
      title={!isSidebarOpen ? item.name : ""}
      className={`flex items-center p-3.5 rounded-xl transition-all group ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'hover:bg-gray-800/50 hover:text-white'}`}
    >
      <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-red-500'} transition-colors duration-300`}>
        {item.icon}
      </span>
      {isSidebarOpen && (
        <div className="flex items-center justify-between flex-1 ml-4 animate-in fade-in slide-in-from-left-2 duration-300">
          <span className="text-[13px] font-black tracking-tight uppercase italic">
            {item.name}
          </span>
        </div>
      )}
    </Link>
  );
};

export default DashboardLayout;