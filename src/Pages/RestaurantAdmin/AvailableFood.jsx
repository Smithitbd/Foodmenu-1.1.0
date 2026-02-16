import React, { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const AvailableFood = () => {
    const [foods, setFoods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    const resId = localStorage.getItem('resId');

    // Food list fetch 
    const fetchFoods = async () => {
        if (!resId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/menu-list?restaurant_id=${resId}`);
            const formattedData = response.data.map(food => ({
                ...food,
                status: food.is_available === 1 || food.is_available === true
            }));
            setFoods(formattedData);
        } catch (err) {
            console.error("Fetch Error:", err);
            Swal.fire('Error', 'Could not load menu items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, [resId]);

    // Check Availability
    const isAllAvailable = useMemo(() => foods.length > 0 && foods.every(f => f.status), [foods]);

    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    // Indivisual Status Update
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            await axios.patch(`http://localhost:5000/api/update-food-status/${id}`, { is_available: newStatus });
            
            setFoods(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
            
            Toast.fire({
                icon: newStatus ? 'success' : 'warning',
                title: newStatus ? 'Marked as Available' : 'Marked as Unavailable'
            });
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Update Failed' });
        }
    };

    // All item update
    const handleToggleAllStatus = async () => {
        const newStatus = !isAllAvailable;
        try {
            await axios.patch('http://localhost:5000/api/update-all-status', {
                restaurant_id: resId,
                is_available: newStatus
            });
            
            setFoods(prev => prev.map(f => ({ ...f, status: newStatus })));
            
            Swal.fire({
                icon: 'success',
                title: newStatus ? 'All Items Available' : 'All Items Unavailable',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    //Sorting and filtering
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const processedFoods = useMemo(() => {
        let filtered = foods.filter(food =>
            food.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [foods, searchTerm, sortConfig]);

    // Pagination
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = processedFoods.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(processedFoods.length / entriesPerPage);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <Loader2 className="animate-spin mb-2" size={40} />
                <p className="font-bold animate-pulse">Loading Your Menu...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-red-600 p-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-6 gap-4">
                <h2 className="text-2xl font-black text-gray-800 italic uppercase tracking-tight">
                    Available Food <span className="text-red-600">List</span>
                </h2>
                
                <button 
                    onClick={handleToggleAllStatus}
                    className={`${isAllAvailable ? 'bg-amber-600' : 'bg-red-600'} text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2`}
                >
                    {isAllAvailable ? <><XCircle size={16}/> Make All Unavailable</> : <><CheckCircle size={16}/> Make All Available</>}
                </button>
            </div>

            {/* Search and Show Entries */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    Show 
                    <select 
                        className="bg-gray-50 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                        value={entriesPerPage}
                        onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                        {[5, 10, 15, 20].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    Entries
                </div>

                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search Item name..."
                        className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-red-500/20 shadow-inner italic font-medium"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-300" size={18} />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-[1.5rem] border border-gray-50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th onClick={() => requestSort('id')} className="p-4 cursor-pointer text-[10px] font-black uppercase italic tracking-widest">#</th>
                            <th onClick={() => requestSort('name')} className="p-4 cursor-pointer text-[10px] font-black uppercase italic tracking-widest">Item name</th>
                            <th className="p-4 text-[10px] font-black uppercase italic tracking-widest text-center">Price</th>
                            <th className="p-4 text-[10px] font-black uppercase italic tracking-widest text-center">Status Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEntries.length > 0 ? currentEntries.map((food, index) => (
                            <tr key={food.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-all">
                                <td className="p-4 text-xs font-bold text-gray-300 italic">{indexOfFirstEntry + index + 1}</td>
                                <td className="p-4 text-sm font-black text-gray-700 uppercase">{food.name}</td>
                                <td className="p-4 text-sm font-black text-gray-900 text-center italic">৳ {food.price}</td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => toggleStatus(food.id, food.status)}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[9px] font-black uppercase tracking-[0.15em] transition-all shadow-md active:scale-90 ${
                                            food.status ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                                        }`}
                                    >
                                        {food.status ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {food.status ? 'Available' : 'Unavailable'}
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-gray-300 font-bold italic">No food items found...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">
                    Showing {processedFoods.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, processedFoods.length)} of {processedFoods.length} entries
                </p>
                
                <div className="flex items-center gap-1">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 text-gray-400 hover:text-red-600 disabled:opacity-30 font-black text-[10px] uppercase">Prev</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>{i + 1}</button>
                    ))}
                    <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-gray-400 hover:text-red-600 disabled:opacity-30 font-black text-[10px] uppercase">Next</button>
                </div>
            </div>
        </div>
    );
};

export default AvailableFood;