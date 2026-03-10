import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LayoutGrid, User, Phone, CheckCircle, XCircle, RefreshCw, Armchair } from 'lucide-react';

const TableList = () => {
    const resId = localStorage.getItem('resId');
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTables = useCallback(async () => {
        if (!resId) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/tables/${resId}`);
            // নিশ্চিত হওয়া যে ডাটা অ্যারে হিসেবে আসছে
            setTables(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch Error:", error);
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, [resId]);

    useEffect(() => {
        fetchTables();
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
                Swal.fire({
                    toast: true, position: 'top-end', icon: 'success',
                    title: `Table ${newStatus ? 'is now Free' : 'is now Booked'}`,
                    showConfirmButton: false, timer: 1500
                });
            }
        } catch (error) {
            Swal.fire("Error", "Action failed", "error");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <RefreshCw className="animate-spin text-red-600" size={40} />
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Armchair className="text-red-600" size={32} />
                        TABLE OVERVIEW
                    </h2>
                    <p className="text-slate-500 font-medium">Manage your restaurant floor in real-time</p>
                </div>
                <button 
                    onClick={fetchTables}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={18} /> Refresh Floor
                </button>
            </div>

            {tables.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-bold">No tables found. Please add tables first!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map((table) => (
                        <div 
                            key={table.id}
                            className={`group relative rounded-[35px] transition-all duration-500 border-2 ${
                                table.is_available === 1 
                                ? 'bg-white border-slate-100 hover:border-green-200 shadow-xl shadow-slate-200/50' 
                                : 'bg-red-50 border-red-100 shadow-xl shadow-red-200/30'
                            }`}
                        >
                            <div className="p-7">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${table.is_available === 1 ? 'bg-slate-50 text-slate-400' : 'bg-red-600 text-white shadow-lg shadow-red-200'}`}>
                                        <Armchair size={24} />
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        table.is_available === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {table.is_available === 1 ? 'Free' : 'Occupied'}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 mb-1">{table.table_number}</h3>
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-wider mb-6">
                                    <span>{table.category}</span>
                                    <span>•</span>
                                    <span>{table.capacity} Seats</span>
                                </div>

                                <div className={`mb-8 p-4 rounded-2xl transition-all ${table.is_available === 1 ? 'bg-slate-50' : 'bg-white border border-red-100'}`}>
                                    {table.customer_name ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 truncate">{table.customer_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <Phone size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{table.customer_phone}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center py-2 text-xs font-bold text-slate-300 italic uppercase tracking-widest">No Active Guest</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => toggleStatus(table.id, table.is_available)}
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 ${
                                        table.is_available === 1 
                                        ? 'bg-slate-900 text-white hover:bg-green-600 shadow-lg shadow-slate-200' 
                                        : 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                                    }`}
                                >
                                    {table.is_available === 1 ? (
                                        <><CheckCircle size={18} /> Reserve Now</>
                                    ) : (
                                        <><XCircle size={18} /> Make Available</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TableList;