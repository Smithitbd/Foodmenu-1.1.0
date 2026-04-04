import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Utensils, ShoppingBag, Banknote, 
  Star, AlertCircle, ChevronRight, Clock 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const RestaurantDashboard = () => {
  const [isStoreOpen, setIsStoreOpen] = useOutletContext();
  const navigate = useNavigate();
  const resId = localStorage.getItem('resId'); 

  const [dashboardData, setDashboardData] = useState({
    name: "",
    status: "inactive",
    is_manual_online: 0,
    opening_time: "",
    closing_time: "",
    totalMenu: 0,
    activeOrders: 0,
    todayEarning: 0,
    avgRating: 0,
    weeklySales: [],
    incomingOrders: []
  });

  // Data fetch
  useEffect(() => {
    let interval;
    
    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/dashboard-stats/${resId}`);
            setDashboardData(res.data);
            setIsStoreOpen(res.data.status === 'active');
        } catch (error) {
            console.error("Dashboard Data Fetch Error:", error);
        }
    };

    if (resId) {
        fetchDashboardData();
        interval = setInterval(fetchDashboardData, 20000); 
    }

    return () => {
        if (interval) clearInterval(interval);
    };
}, [resId]);

  // Status Toggle 
  const handleStatusToggle = async () => {
    // ১. বর্তমানে কি আছে তার বিপরীত ভ্যালু ঠিক করা
    const currentStatus = dashboardData.is_manual_online;
    const nextStatusValue = currentStatus === 1 ? 0 : 1; // ১ থাকলে ০ হবে, ০ থাকলে ১ হবে
    const nextStatusText = nextStatusValue === 1 ? 'active' : 'inactive';

    try {
        // ২. এপিআই কল করা
        const response = await axios.put(`http://localhost:5000/api/update-store-status/${resId}`, { 
            status: nextStatusText 
        });

        if (response.data) {
            // ৩. সাথে সাথে লোকাল স্টেট আপডেট (যাতে বাটন সাথে সাথে ঘুরে যায়)
            setDashboardData(prev => ({
                ...prev,
                is_manual_online: nextStatusValue,
                status: nextStatusText
            }));
            
            // ৪. আউটলেট কন্টেক্সট আপডেট করা (যদি নেভবারেও প্রভাব ফেলতে চান)
            setIsStoreOpen(nextStatusValue === 1);

            // ৫. কনফার্মেশনের জন্য ডাটা আবার রি-ফেচ করা (ঐচ্ছিক কিন্তু ভালো)
            setTimeout(async () => {
                const refresh = await axios.get(`http://localhost:5000/api/dashboard-stats/${resId}`);
                setDashboardData(refresh.data);
                setIsStoreOpen(refresh.data.status === 'active');
            }, 500);

            Swal.fire({
                title: nextStatusValue === 1 ? 'Store is now OPEN' : 'Store is now CLOSED',
                icon: nextStatusValue === 1 ? 'success' : 'warning',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-[30px]' }
            });
        }
    } catch (err) {
        console.error("Update Error:", err);
        Swal.fire('Error', 'Could not update status', 'error');
    }
};

  const stats = [
    { id: 1, title: 'Active Orders', value: dashboardData.activeOrders, icon: <ShoppingBag size={24}/>, color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-600' },
    { id: 2, title: 'Total Menu Items', value: dashboardData.totalMenu, icon: <Utensils size={24}/>, color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-600' },
    { id: 3, title: 'Today\'s Earning', value: `৳ ${Number(dashboardData.todayEarning || 0).toFixed(2)}`, icon: <Banknote size={24}/>, color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-600' },
    { id: 4, title: 'Avg. Rating', value: dashboardData.avgRating, icon: <Star size={24}/>, color: 'text-yellow-600', bg: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Banner Section */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">
            <span className="text-red-600">{dashboardData.name}</span>
          </h1>
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] italic leading-relaxed">
               Current Status: <span className={isStoreOpen ? "text-green-500 underline" : "text-red-500 underline"}>
                   {isStoreOpen ? 'Accepting Orders' : 'Store Closed'}
               </span>
             </p>
             <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Clock size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase italic">
                  {dashboardData.opening_time?.substring(0,5)} - {dashboardData.closing_time?.substring(0,5)}
                </span>
             </div>
          </div>
        </div>

        {/* Manual Control Section এ এই পরিবর্তনটুকু করুন */}
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100 shadow-inner">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Manual Control</p>
            <p className={`text-xs font-black uppercase italic mt-1 ${dashboardData.is_manual_online === 1 ? 'text-green-600' : 'text-red-500'}`}>
                {dashboardData.is_manual_online === 1 ? 'Online' : 'Offline'}
            </p>
          </div>
          
          {/* মেইন টগল বাটন */}
          <button 
            onClick={handleStatusToggle} 
            className={`w-14 h-7 rounded-full transition-all duration-500 flex items-center px-1 relative ${
              dashboardData.is_manual_online === 1 ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
              dashboardData.is_manual_online === 1 ? 'translate-x-7' : 'translate-x-0'
            }`}></div>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className={`bg-white p-7 rounded-[35px] border border-gray-100 shadow-sm transition-all duration-300 group cursor-pointer ${stat.hoverBg}`}>
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/20 group-hover:text-white transition-all`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white/80">{stat.title}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-2 italic group-hover:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Graphs and New Orders (বাকি কোড আপনার আগের মতোই থাকবে) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Graph */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 italic uppercase">Weekly Performance</h3>
            <div className="h-[300px] w-full mt-6">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={dashboardData.weeklySales || []}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                   <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                   <Bar dataKey="total" radius={[12, 12, 12, 12]} barSize={35}>
                     {(dashboardData.weeklySales || []).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === (dashboardData.weeklySales.length - 1) ? '#B91C1C' : '#E2E8F0'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
        </div>

        {/* Incoming Orders */}
        <div className="bg-[#0F172A] rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center animate-pulse"><AlertCircle className="text-red-500" /></div>
                  <h3 className="text-xl font-black italic uppercase">New Orders</h3>
               </div>
               <div className="space-y-3">
                  {dashboardData.incomingOrders.length > 0 ? dashboardData.incomingOrders.map(order => (
                    <div key={order.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
                      <div>
                          <p className="text-[10px] font-black text-red-500 italic uppercase">#ORD-{order.id}</p>
                          <p className="text-xs font-bold text-gray-300 italic">Total: ৳ {order.total_price}</p>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                  )) : <p className="text-gray-500 text-xs text-center mt-10">No orders found.</p>}
               </div>
            </div>
            <button onClick={() => navigate('/restaurantadmin/orderslists')} className="w-full bg-red-600 py-4 mt-6 rounded-2xl font-black uppercase text-[11px] tracking-[2px] hover:bg-white hover:text-red-600 transition-all">
                View All Orders
            </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;