import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Trash2, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const AddToRestrurant = () => {
  // Sample Data
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: "Tayef Ahmed", mobile: "017XXXXXXXX", date: "2026-01-29", restaurant: "Shahi Dine", area: "Zindabazar", address: "Sylhet" },
    { id: 2, name: "Noman Khan", mobile: "018XXXXXXXX", date: "2026-01-28", restaurant: "Preat & Curries", area: "Lamabazar", address: "Sylhet" },
    { id: 3, name: "Fahim Khan", mobile: "019XXXXXXXX", date: "2026-01-25", restaurant: "Food Garden", area: "Bondorbazar", address: "Sylhet" }
  ]);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete Handler With SweetAlert
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B91C1C',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setRestaurants(restaurants.filter(item => item.id !== id));
        Swal.fire(
          'Deleted!',
          'Restaurant has been deleted.',
          'success'
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-5 border-b border-red-500 border-t-4">
        <h2 className="text-xl font-bold text-slate-800">Add Restaurant List</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Top Controls: Show entries & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Show</span>
            <select 
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-red-500"
            >
              {[5, 10, 15, 20, 25, 30, 35, 40, 45,  50].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search....."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 text-sm font-bold text-slate-700">ID </th>
                <th className="p-4 text-sm font-bold text-slate-700">Customer Name </th>
                <th className="p-4 text-sm font-bold text-slate-700">Mobile</th>
                <th className="p-4 text-sm font-bold text-slate-700">Date</th>
                <th className="p-4 text-sm font-bold text-slate-700">Restaurant Name</th>
                <th className="p-4 text-sm font-bold text-slate-700">Area</th>
                <th className="p-4 text-sm font-bold text-slate-700 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {restaurants.length > 0 ? restaurants.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-sm text-slate-600">{item.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{item.name}</td>
                  <td className="p-4 text-sm text-slate-600">{item.mobile}</td>
                  <td className="p-4 text-sm text-slate-600">{item.date}</td>
                  <td className="p-4 text-sm text-slate-600 font-semibold">{item.restaurant}</td>
                  <td className="p-4 text-sm text-slate-600">{item.area}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400 italic">No restaurants found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
          <p className="text-sm text-slate-500">
            Showing 1 to {Math.min(entriesPerPage, restaurants.length)} of {restaurants.length} entries
          </p>
          <div className="flex gap-1">
            <button className="p-2 border rounded-lg hover:bg-slate-50 text-slate-400"><ChevronLeft size={18}/></button>
            <button className="px-3 py-1 border rounded-lg bg-red-600 text-white font-bold text-sm">1</button>
            <button className="p-2 border rounded-lg hover:bg-slate-50 text-slate-400"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToRestrurant;