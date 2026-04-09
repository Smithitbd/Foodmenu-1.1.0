import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Trash2, Search, ChevronLeft, ChevronRight, Power, PowerOff } from 'lucide-react';

const API_URL = "http://localhost:5000/api/add-requests"; // Base URL for requests
const RESTAURANT_URL = "http://localhost:5000/api/restaurants"; // URL for status toggle

const AddToRestrurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setRestaurants(res.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to load data!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --- Toggle Status Logic ---
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(`${RESTAURANT_URL}/${id}/toggle-status`);
      
      // Update local state to reflect change immediately
      setRestaurants(prev => prev.map(item => 
        item.id === id ? { ...item, status: res.data.status } : item
      ));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Restaurant is now ${res.data.status}`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed!', text: 'Could not update status.' });
    }
  };

  const filtered = useMemo(() => {
    return restaurants.filter(item =>
      item.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact_mobile?.includes(searchTerm) ||
      item.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [restaurants, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This restaurant will be removed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B91C1C',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          fetchRequests();
          Swal.fire('Deleted!', 'Record removed.', 'success');
        } catch (err) {
          Swal.fire('Error!', 'Delete failed.', 'error');
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-red-500 border-t-4 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Restaurant Management</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-red-500"
            >
              {[5, 10, 20].map(val => <option key={val} value={val}>{val}</option>)}
            </select>
            <span>Entries</span>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Owner or Restaurant..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-4 text-xs font-bold uppercase text-slate-600">ID</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-600">Restaurant</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-600">Owner</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-600">Contact</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-600 text-center">Status</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading && currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm">{item.id}</td>
                  <td className="p-4 text-sm font-bold text-red-700">{item.restaurant_name}</td>
                  <td className="p-4 text-sm">{item.owner_name}</td>
                  <td className="p-4 text-sm font-mono">{item.contact_mobile}</td>
                  
                  {/* Status Toggle Button */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 mx-auto transition-all ${
                        item.status === 'active' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.status === 'active' ? <Power size={14} /> : <PowerOff size={14} />}
                      {item.status.toUpperCase()}
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddToRestrurant;