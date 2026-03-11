import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    User, Phone, CheckCircle, XCircle, RefreshCw, Armchair, 
    Users, Zap, Clock, ArrowRight, MoreHorizontal, Map
} from 'lucide-react';

const TableList = () => {
    const resId = localStorage.getItem('resId');
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    const fetchTables = useCallback(async () => {
        if (!resId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/tables/${resId}`);
            setTables(Array.isArray(response.data) ? response.data : []);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }, [resId]);

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 1500);
        return () => clearInterval(interval);
    }, [fetchTables]);

    const toggleStatus = async (tableId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            const res = await axios.put('http://localhost:5000/api/update-table-status', {
                tableId,
                is_available: newStatus
            });
            if (res.data.success) {
                fetchTables();
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
                Toast.fire({
                    icon: 'success',
                    title: `Table ${newStatus ? 'is now Free' : 'is now Occupied'}`
                });
            }
        } catch (error) {
            Swal.fire("Error", "Update failed", "error");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#FDFDFF]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-[3px] border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium tracking-widest text-xs uppercase">Initializing Floor...</p>
            </div>
        </div>
    );

    return (
        <div className="p-5 md:p-12 bg-[#F8FAFF] min-h-screen">
            {/* --- Advanced Header --- */}
            <div className="max-w-[1400px] mx-auto mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-3">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Table</span> Distribution
                        </h1>
                        <p className="text-slate-400 flex items-center gap-2 font-medium">
                            <Clock size={16} /> Auto-refresh active • {lastUpdated}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            <div className="w-14 h-14 bg-white border-4 border-[#F8FAFF] rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                <span className="text-emerald-500 font-black text-lg">{tables.filter(t => t.is_available).length}</span>
                                <span className="text-[8px] text-slate-400 font-bold uppercase">Free</span>
                            </div>
                            <div className="w-14 h-14 bg-white border-4 border-[#F8FAFF] rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                <span className="text-rose-500 font-black text-lg">{tables.filter(t => !t.is_available).length}</span>
                                <span className="text-[8px] text-slate-400 font-bold uppercase">Busy</span>
                            </div>
                        </div>
                        <button 
                            onClick={fetchTables}
                            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 hover:rotate-90 duration-500"
                        >
                            <RefreshCw size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Table Grid --- */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {tables.map((table) => {
                    const isFree = table.is_available === 1;
                    return (
                        <div 
                            key={table.id}
                            className="group relative perspective-1000"
                        >
                            <div className={`relative bg-white rounded-[35px] transition-all duration-500 border border-slate-100 
                                ${isFree 
                                    ? 'hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] hover:-translate-y-3' 
                                    : 'hover:shadow-[0_30px_60px_-15px_rgba(244,63,94,0.15)] hover:-translate-y-3'
                                }`}>
                                
                                {/* Top Accents */}
                                <div className={`absolute top-0 left-10 right-10 h-1.5 rounded-b-full transition-all duration-500 ${isFree ? 'bg-indigo-500' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}></div>

                                <div className="p-8 space-y-8">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{table.table_number}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mt-1">{table.category}</p>
                                        </div>
                                        <div className={`p-3 rounded-2xl ${isFree ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-500 animate-pulse'}`}>
                                            <Zap size={20} fill={!isFree ? "currentColor" : "none"} />
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Users size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">{table.capacity} Seater</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Info Panel */}
                                    <div className={`rounded-[30px] p-6 transition-all duration-500 min-h-[120px] flex flex-col justify-center
                                        ${isFree ? 'bg-slate-50/50 border border-dashed border-slate-200' : 'bg-white shadow-inner border border-rose-50'}`}>
                                        
                                        {table.customer_name ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-100">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                                        <p className="text-sm font-black text-slate-800 truncate max-w-[120px]">{table.customer_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                                                        <p className="text-sm font-bold text-slate-600">{table.customer_phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="text-indigo-600/20 mb-2 flex justify-center"><Armchair size={32} /></div>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px]">Waiting</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => toggleStatus(table.id, table.is_available)}
                                        className={`w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-[2px] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg 
                                            ${isFree 
                                                ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100' 
                                                : 'bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white shadow-rose-50'
                                            }`}
                                    >
                                        {isFree ? (
                                            <>Assign Table <ArrowRight size={18} /></>
                                        ) : (
                                            <>Release <XCircle size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TableList;