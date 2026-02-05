import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Import the Context Api
import Swal from 'sweetalert2';
import { 
  Utensils, ShoppingBag, Banknote, 
  Star, AlertCircle, ChevronRight 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const weeklySales = [
  { day: 'Mon', total: 2400 },
  { day: 'Tue', total: 1398 },
  { day: 'Wed', total: 9800 },
  { day: 'Thu', total: 3908 },
  { day: 'Fri', total: 4800 },
  { day: 'Sat', total: 3800 },
  { day: 'Sun', total: 4300 },
];

const RestaurantDashboard = () => {
  // Global State from the Layout page
  const [isStoreOpen, setIsStoreOpen] = useOutletContext();
  const navigate = useNavigate();

  const restaurantInfo = {
    name: "Sultan's Dine",
  };

  const handleStatusToggle = () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus); // Update the header 

    Swal.fire({
      title: `Restaurant is now ${newStatus ? 'OPEN' : 'CLOSED'}!`,
      text: `Currently you are ${newStatus ? 'Online' : 'Offline'}.`,
      icon: newStatus ? 'success' : 'warning',
      timer: 1800,
      showConfirmButton: false,
      customClass: { popup: 'rounded-[30px] font-sans' }
    });
  };

  const stats = [
    { id: 1, title: 'Active Orders', value: '12', icon: <ShoppingBag size={24}/>, color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-600' },
    { id: 2, title: 'Total Menu Items', value: '17', icon: <Utensils size={24}/>, color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-600' },
    { id: 3, title: 'Today\'s Earning', value: '৳ 18,450', icon: <Banknote size={24}/>, color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-600' },
    { id: 4, title: 'Avg. Rating', value: '4.8', icon: <Star size={24}/>, color: 'text-yellow-600', bg: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ---Banner Section --- */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">
            <span className="text-red-600">{restaurantInfo.name} </span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-1 italic leading-relaxed">
            Welcome back! Your restaurant is currently {' '}
            <span className={`font-black underline ${isStoreOpen ? 'text-green-500' : 'text-red-500'}`}>
              {isStoreOpen ? 'Open' : 'Close'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100 shadow-inner">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Store Status</p>
            <p className="text-xs font-black text-gray-900 uppercase italic mt-1">Live Ordering</p>
          </div>
          <button onClick={handleStatusToggle} className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${isStoreOpen ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
            <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
          </button>
        </div>
      </div>

      {/* --- 1. Quick Stats Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className={`bg-white p-7 rounded-[35px] border border-gray-100 shadow-sm transition-all duration-300 group cursor-pointer ${stat.hoverBg}`}>
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/20 group-hover:text-white group-hover:rotate-12 transition-all duration-300`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none group-hover:text-white/80 transition-colors">{stat.title}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-2 italic tracking-tight group-hover:text-white transition-colors">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* --- 2. Weekly Sales Graph & Orders --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
           <div className="mb-8 flex justify-between items-start">
             <div>
               <h3 className="font-black text-gray-900 italic uppercase">Weekly Sales Performance</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Total revenue this week</p>
             </div>
             <span className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full border border-red-100 uppercase italic">Live Data</span>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" radius={[12, 12, 12, 12]} barSize={35}>
                    {weeklySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#B91C1C' : '#E2E8F0'} className="hover:fill-red-600 transition-all cursor-pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#0F172A] rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center animate-pulse">
                    <AlertCircle className="text-red-500" size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black italic uppercase leading-none">Incoming<br/>Orders</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Action Required</p>
                 </div>
              </div>
              
              <div className="space-y-3 mt-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <div>
                           <p className="text-[10px] font-black text-red-500 italic uppercase leading-none">#OD-229{i}</p>
                           <p className="text-xs font-bold italic mt-1 text-gray-300 group-hover:text-white transition-colors">2x Special Kacchi...</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-red-500 transition-all" />
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative z-10 mt-8">
              <button onClick={() => navigate('/restaurantadmin/orderslists')} className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[2px] shadow-xl shadow-red-900/40 hover:bg-white hover:text-red-600 transition-all group flex items-center justify-center gap-2">
                  Manage All Orders <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
           <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-red-600/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;