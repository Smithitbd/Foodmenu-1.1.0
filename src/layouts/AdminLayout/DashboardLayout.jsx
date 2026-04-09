import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import logo from "../../assets/foodmenu.png";
import { 
  LayoutDashboard, MapPin, ListPlus, Gift, Utensils, 
  BarChart3, MessageSquare, Star, UserPlus, Users, 
  ChevronDown, Store, PieChart, Menu, X, LogOut, 
  PlusCircle, ClipboardList 
} from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminData, setAdminData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // --- ডাইনামিক ইউআরএল কনফিগারেশন ---
  const isLocalhost = window.location.hostname === "localhost";
  const LIVE_API_URL = "https://api.yourdomain.com"; 
  const BASE_URL = isLocalhost ? "http://localhost:5000" : LIVE_API_URL;
  const ADMIN_IMG_PATH = `${BASE_URL}/uploads/AdminProfile/`;

  useEffect(() => {
    const savedData = localStorage.getItem('superadmin_data');
    if (savedData) {
      setAdminData(JSON.parse(savedData));
    } else {
      navigate('/superadminlogin'); 
    }
  }, [navigate]);

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
        localStorage.removeItem('superadmin_data');
        navigate('/superadminlogin');
      }
    });
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[#1E293B] text-gray-300 transition-all duration-300 flex flex-col shadow-2xl z-50`}>
        <div className="h-20 flex items-center px-4 bg-[#7c0606] border-b border-gray-800">
          <div className="min-w-[40px] h-10 flex items-center justify-center overflow-hidden rounded-lg">
            <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          <SidebarContent isSidebarOpen={isSidebarOpen} location={location} BASE_URL={BASE_URL} />
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
            <div className="relative">
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900 italic uppercase leading-none">
                    {adminData.name || "Super"} <span className="text-red-600 underline">{adminData.role || "Admin"}</span>
                  </p>
                  <p className="text-[9px] font-bold uppercase mt-1 flex items-center justify-end gap-1 text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                  </p>
                </div>

                <div className="w-11 h-11 bg-slate-900 rounded-2xl overflow-hidden shadow-md rotate-3 group-hover:rotate-0 transition-all border-2 border-white flex items-center justify-center">
                    {adminData.image ? (
                      <img 
                        src={`${ADMIN_IMG_PATH}${adminData.image}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${adminData.name}&background=random`; }}
                      />
                    ) : (
                        <Users size={20} className="text-white" />
                    )}
                </div>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Signed in as</p>
                    <p className="text-xs font-black text-gray-700 truncate">{adminData.email}</p>
                  </div>
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

// --- SIDEBAR CONTENT COMPONENTS ---

const SidebarContent = ({ isSidebarOpen, location, BASE_URL }) => {
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null); // নির্দিষ্ট এরিয়ার সাব-মেনু ট্র্যাকিং
  const [dynamicAreas, setDynamicAreas] = useState([]);

  useEffect(() => {
    const fetchDynamicAreas = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/get-area`);
        setDynamicAreas(res.data);
      } catch (err) {
        console.error("Sidebar areas fetch error:", err);
      }
    };
    fetchDynamicAreas();
  }, [BASE_URL]);

  const toggleSubMenu = (areaId) => {
    setOpenSubMenu(openSubMenu === areaId ? null : areaId);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Add Top Restaurant', path: '/admin/add-top', icon: <ListPlus size={20} /> },
    { name: 'Offer List', path: '/admin/offers', icon: <Gift size={20} /> },
    { name: 'Add Request', path: '/admin/request', icon: <Utensils size={20} /> },
    { name: 'Chatlist', path: '/admin/chats', icon: <MessageSquare size={20} /> },
    { name: 'Review', path: '/admin/reviews', icon: <Star size={20} /> },
    { name: 'Registration', path: '/admin/registration', icon: <UserPlus size={20} /> },
  ];

  return (
    <div className="space-y-1">
      <MenuLink item={menuItems[0]} isSidebarOpen={isSidebarOpen} location={location} />

      {/* --- DYNAMIC RESTAURANT AREA --- */}
      <div className="py-1">
        <button
          onClick={() => isSidebarOpen && setIsAreaOpen(!isAreaOpen)}
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
              <PlusCircle size={14} /> Add / Manage Area
            </Link>

            {/* এরিয়া ভিত্তিক নেস্টেড মেনু */}
            {dynamicAreas.map(area => (
              <div key={area.id} className="group/item">
                <button 
                  onClick={() => toggleSubMenu(area.id)}
                  className="w-full flex items-center justify-between px-6 py-2 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors tracking-tighter"
                >
                  <div className="flex items-center gap-3">
                    <Store size={14} className="group-hover/item:text-red-400" /> {area.name}
                  </div>
                  <ChevronDown size={12} className={`transition-transform ${openSubMenu === area.id ? 'rotate-180 text-red-500' : 'opacity-40'}`} />
                </button>

                {/* সাব-লিঙ্ক সমূহ */}
                {openSubMenu === area.id && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-gray-800 animate-in slide-in-from-left-2 duration-200">
                    <Link 
                      to={`/admin/add-restaurant/${area.name.toLowerCase()}`} 
                      className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-gray-500 hover:text-red-400 transition-all uppercase italic"
                    >
                      <PlusCircle size={12} /> Add Restaurant
                    </Link>
                    <Link 
                      to={`/admin/area/${(area.fileName || area.name).toLowerCase()}`} 
                      className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase italic"
                    >
                      <ClipboardList size={12} /> Restaurant List
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sales Report */}
      {/* <div className="py-1">
        <button
          onClick={() => isSidebarOpen && setIsSalesOpen(!isSalesOpen)}
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
      </div> */}

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