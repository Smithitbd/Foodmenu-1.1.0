import React, { useState } from 'react';
import { Trash2, Search, Calendar, Phone, DollarSign, Tag, Utensils, AlertCircle, Layers, Clock, ArrowRight, Edit3, History, X, Save, Lock, ShoppingBag, BarChart3, Timer } from 'lucide-react';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

const OfferList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  // ১. Logs State
  const [logs, setLogs] = useState([`System initialized at ${new Date().toLocaleDateString()}`]);

  // ২. Database History Demo Data 
  const [pastOffers, setPastOffers] = useState([
    { 
      id: 101, 
      restaurantName: "CINEVIBE", 
      mobile: "01311796186", 
      itemName: "Burger Combo", 
      sales: 450, // how much sell
      price: 150, 
      from: "2023-11-01", 
      to: "2023-11-15",
      totalDays: 14
    },
    { 
      id: 102, 
      restaurantName: "Kacchi Ghar", 
      mobile: "01700000000", 
      itemName: "Basmati Kacchi", 
      sales: 1200, 
      price: 220, 
      from: "2023-10-01", 
      to: "2023-10-30",
      totalDays: 29
    }
  ]);

  const [offers, setOffers] = useState([
    { 
      id: 2, 
      restaurantName: "MRINAL RESTAURANT", 
      itemName: "Winter Platter", 
      price: 170, 
      quantity: "1:1", 
      mobile: "01311796186", 
      from: "2023-12-25", 
      to: "2026-01-15", 
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" 
    },

    { 
      id: 3, 
      restaurantName: "JUBORAJ RESTAURANT", 
      itemName: "Winter Platter", 
      price: 170, 
      quantity: "1:1", 
      mobile: "01311796186", 
      from: "2023-12-25", 
      to: "2026-01-15", 
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" 
    },

    { 
      id: 1, 
      restaurantName: "CINEVIBE RESTAURANT", 
      itemName: "Winter Platter", 
      price: 170, 
      quantity: "1:1", 
      mobile: "01311796186", 
      from: "2023-12-25", 
      to: "2026-01-15", 
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" 
    },
  ]);

  // --- ADVANCED HISTORY ANALYTICS MODAL ---
  const checkAdvancedHistory = () => {
    Swal.fire({
      title: '<span className="italic uppercase font-black text-gray-800">Sales & Activity Analytics</span>',
      width: '900px',
      html: `
        <div class="text-left font-sans">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest">Total Sales (Past)</p>
              <p class="text-2xl font-black text-blue-700 underline decoration-2 underline-offset-4">1,650 <span class="text-xs uppercase italic font-bold text-blue-400">Pcs</span></p>
            </div>
            <div class="bg-green-50 p-4 rounded-2xl border border-green-100">
              <p class="text-[9px] font-black text-green-400 uppercase tracking-widest">Revenue Impact</p>
              <p class="text-2xl font-black text-green-700">৳ 2.4L</p>
            </div>
             <div class="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p class="text-[9px] font-black text-red-400 uppercase tracking-widest">Logs Count</p>
              <p class="text-2xl font-black text-red-700">${logs.length}</p>
            </div>
          </div>

          <div class="mb-4 flex gap-2 border-b pb-2">
            <button class="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase">Offer History</button>
          </div>

          <div class="overflow-hidden border rounded-2xl bg-white shadow-inner">
            <table class="w-full text-[11px]">
              <thead class="bg-gray-50 border-b">
                <tr class="text-gray-400 uppercase font-black tracking-tighter">
                  <th class="p-3">Restaurant</th>
                  <th class="p-3">Item & Mobile</th>
                  <th class="p-3 text-center">Sales (Qty)</th>
                  <th class="p-3 text-center">Period</th>
                  <th class="p-3 text-center">Days</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${pastOffers.map(o => `
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-3 font-black text-gray-800 italic uppercase">${o.restaurantName}</td>
                    <td class="p-3">
                       <p class="font-bold text-gray-500">${o.itemName}</p>
                       <p class="text-[9px] text-blue-500">${o.mobile}</p>
                    </td>
                    <td class="p-3 text-center">
                       <span class="px-2 py-1 bg-gray-900 text-white rounded font-black italic">${o.sales} Pcs</span>
                       <p class="text-[9px] mt-1 text-gray-400 font-bold">@ ৳${o.price}</p>
                    </td>
                    <td class="p-3 text-center">
                       <p class="text-[9px] font-bold text-green-600">${o.from}</p>
                       <p class="text-[9px] font-bold text-red-400">${o.to}</p>
                    </td>
                    <td class="p-3 text-center font-black text-gray-400 italic">${o.totalDays}D</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="mt-4 p-3 bg-gray-900 rounded-xl">
             <p class="text-[9px] font-black text-gray-500 uppercase tracking-[2px] mb-1">Recent Activity Logs:</p>
             <p class="text-[10px] text-gray-200 font-bold italic underline decoration-red-500">→ ${logs[0]}</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#B91C1C',
      confirmButtonText: 'CLOSE ANALYTICS',
      showCloseButton: true,
    });
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Deleting the offer will move it to the archive or history!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Remove'
    }).then((result) => {
      if (result.isConfirmed) {
        setOffers(offers.filter(o => o.id !== id));
        setLogs([`Removed ${id} from Live List at ${new Date().toLocaleTimeString()}`, ...logs]);
        toast.success("Offer Moved to Archive");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans tracking-tight">
      <Toaster />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="group cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-200 text-white group-hover:rotate-12 transition-transform">
                <BarChart3 size={24} strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 italic uppercase"><span className="text-red-600">Offer</span>List</h1>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] ml-1">Live Inventory & Sales Analytics</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={18} />
            <input type="text" placeholder="Search Inventory..." className="pl-12 pr-6 py-4 bg-white border border-transparent rounded-2xl text-sm w-full md:w-80 shadow-xl shadow-gray-200/40 outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-semibold" />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 overflow-hidden border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Restaurant & Item</th>
                  <th className="px-8 py-6 text-center border-x border-gray-800">Commercials</th>
                  <th className="px-8 py-6">Validity Period</th>
                  <th className="px-8 py-6 text-right tracking-tighter">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative h-16 w-16 shrink-0">
                          <img src={item.image} className="h-full w-full rounded-2xl object-cover shadow-lg group-hover:rotate-2" alt="" />
                          <div className="absolute -bottom-2 -right-2 bg-white text-red-600 p-1 rounded-md shadow border"><Utensils size={10}/></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 uppercase italic leading-tight">{item.restaurantName}</h4>
                          <div className="flex items-center gap-1.5 mt-1 bg-gray-100 w-fit px-2 py-0.5 rounded shadow-inner">
                            <Layers size={10} className="text-gray-400" />
                            <span className="text-[9px] font-black text-gray-500 uppercase">{item.itemName}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-x border-gray-50">
                      <div className="flex flex-col items-center">
                         <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-xl font-black text-xs mb-1 italic shadow-sm">
                           ৳ {item.price}
                         </div>
                         <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 italic">
                            <Phone size={10} className="text-blue-400"/> {item.mobile}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] font-black text-gray-800 italic uppercase">Starts: {item.from}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span className="text-[10px] font-black text-red-600 italic uppercase">Deadline: {item.to}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingOffer({...item}); setIsEditModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer Navigation */}
          <div className="bg-gray-50/80 p-8 flex flex-col md:flex-row justify-between items-center border-t border-gray-100 gap-4">
             <div className="flex items-center gap-3">
                <button onClick={checkAdvancedHistory} className="group relative p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-red-600 hover:border-red-100 transition-all shadow-xl active:scale-95">
                  <Clock size={22} className="group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[8px] text-white items-center justify-center font-black italic">!</span>
                  </span>
                </button>
                <div>
                   <p className="text-[10px] font-black text-gray-900 uppercase italic tracking-widest">View <span className="text-red-600">Past Sale</span> Analytics</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="flex gap-1 pr-4">
                   <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase shadow-lg">1</button>
                   <button className="px-5 py-2.5 bg-white border border-gray-100 text-gray-300 rounded-xl text-[11px] font-black uppercase cursor-not-allowed">2</button>
                </div>
                <button onClick={() => toast("No more pages", {icon: '⚠️'})} className="p-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 transition-all">
                  <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* --- BOMB EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white">
            <div className="bg-gray-900 p-8 flex justify-between items-center text-white relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-red-600 rounded-b-full"></div>
              <div>
                <h3 className="font-black text-xl italic uppercase tracking-tighter">Adjust Campaign</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[3px] mt-1">Status: Modifying Records</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90"><X size={24}/></button>
            </div>

            <form className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* LOCKED */}
                <div className="space-y-2 group">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 ml-1 group-focus-within:text-gray-900 transition-colors">
                    <Lock size={10}/> Restaurant <span className="text-[8px] italic font-bold">(Locked)</span>
                  </label>
                  <div className="relative">
                    <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                    <input type="text" readOnly value={editingOffer?.restaurantName} className="w-full bg-gray-100 border-none pl-10 pr-5 py-4 rounded-2xl text-[11px] font-black text-gray-400 cursor-not-allowed uppercase" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 ml-1"><Lock size={10}/> Initial Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                    <input type="text" readOnly value={editingOffer?.from} className="w-full bg-gray-100 border-none pl-10 pr-5 py-4 rounded-2xl text-[11px] font-black text-gray-400 cursor-not-allowed uppercase" />
                  </div>
                </div>

                {/* EDITABLE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-red-600 uppercase tracking-widest italic underline underline-offset-4 decoration-2 ml-1 animate-pulse">Update Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={14} />
                    <input 
                      type="number" 
                      value={editingOffer?.price} 
                      onChange={(e) => setEditingOffer({...editingOffer, price: e.target.value})}
                      className="w-full bg-red-50/30 border-2 border-red-100 pl-10 pr-5 py-4 rounded-2xl text-[12px] font-black text-gray-900 focus:bg-white focus:border-red-600 transition-all outline-none shadow-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest italic underline underline-offset-4 decoration-2 ml-1">New End Date</label>
                  <div className="relative">
                    <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" size={14} />
                    <input 
                      type="date" 
                      value={editingOffer?.to} 
                      onChange={(e) => setEditingOffer({...editingOffer, to: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 pl-10 pr-5 py-4 rounded-2xl text-[11px] font-black text-gray-900 focus:bg-white focus:border-gray-900 transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => {
                  setOffers(offers.map(o => o.id === editingOffer.id ? editingOffer : o));
                  setLogs([`Updated "${editingOffer.restaurantName}" at ${new Date().toLocaleTimeString()}`, ...logs]);
                  setIsEditModalOpen(false);
                  toast.success("Changes Deployed!");
                }} className="flex-1 bg-red-600 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[2px] shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Save size={18}/> Update Record
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-10 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferList;