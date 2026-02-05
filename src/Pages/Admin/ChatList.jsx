import React, { useState, useMemo } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, MessageSquare, Mail, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const ChatListPage = () => {
  // Demy Data  
  const [chats, setChats] = useState([
    { id: 1, firstName: "Sourov", lastName: "Ahmed", email: "sourov@gmail.com", description: "Looking for restaurant details", date: "2026-01-17" },
    { id: 2, firstName: "Tayef", lastName: "Khan", email: "tayef@yahoo.com", description: "Need help with menu updates", date: "2026-01-16" },
    { id: 3, firstName: "Zaber", lastName: "Ahmed", email: "zaber@gmail.com", description: "Order issue report", date: "2026-01-10" },
    { id: 4, firstName: "Fahim", lastName: "Ahmed", email: "fahim@gmail.com", description: "Excellent service!", date: "2025-12-31" },
    { id: 5, firstName: "Sajib", lastName: "Chy", email: "sajib@gmail.com", description: "Partnership inquiry", date: "2025-12-30" },
    { id: 6, firstName: "Karim", lastName: "Uddin", email: "karim@gmail.com", description: "Feedback on app", date: "2025-12-28" },
    { id: 7, firstName: "Mitu", lastName: "Akter", email: "mitu@gmail.com", description: "Sylhet food query", date: "2025-12-24" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Search Logic
  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredChats.length / entriesToShow);
  const indexOfLastChat = currentPage * entriesToShow;
  const indexOfFirstChat = indexOfLastChat - entriesToShow;
  const currentChats = filteredChats.slice(indexOfFirstChat, indexOfLastChat);

  // Delete Handler With alert
  const deleteChat = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this conversation!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: 'rounded-[2rem]' }
    }).then((result) => {
      if (result.isConfirmed) {
        setChats(chats.filter(chat => chat.id !== id));
        Swal.fire({ title: "Deleted!", icon: "success", timer: 1000, showConfirmButton: false, customClass: { popup: 'rounded-[2rem]' } });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-2 pb-10 px-4 sm:px-6 lg:px-10 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Chat List</h1>
        <div className="h-1.5 w-16 bg-red-600 rounded-full mt-1"></div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-white overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            Show 
            <select 
              value={entriesToShow} 
              onChange={(e) => {setEntriesToShow(Number(e.target.value)); setCurrentPage(1);}}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-red-500 transition-all"
            >
              {[5, 10, 15, 20, 25].map(num => <option key={num} value={num}>{num}</option>)}
            </select>
            entries
          </div>

          <div className="relative group w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search by name, email, msg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-5 text-center">Id</th>
                <th className="px-6 py-5">Sender</th>
                <th className="px-6 py-5 hidden md:table-cell">Email</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5 hidden sm:table-cell">Date</th>
                <th className="px-6 py-5 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentChats.map((chat) => (
                <tr key={chat.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{chat.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xs group-hover:bg-red-600 group-hover:text-white transition-all">
                        {chat.firstName.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-slate-700">{chat.firstName} {chat.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                      <Mail size={14} className="text-slate-300" /> {chat.email}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] truncate group-hover:whitespace-normal transition-all">
                      {chat.description}
                    </p>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black italic">
                      <Calendar size={14} /> {chat.date}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => deleteChat(chat.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination Footer */}
        <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {indexOfFirstChat + 1} to {Math.min(indexOfLastChat, filteredChats.length)} of {filteredChats.length} entries
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white hover:text-red-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all shadow-sm ${
                  currentPage === i + 1 ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-400 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white hover:text-red-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;