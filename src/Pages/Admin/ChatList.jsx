import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Mail, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios'; // npm install axios

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ডাটাবেস থেকে ডাটা ফেচ করা
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/messages');
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Search Logic
  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredChats.length / entriesToShow);
  const indexOfLastChat = currentPage * entriesToShow;
  const indexOfFirstChat = indexOfLastChat - entriesToShow;
  const currentChats = filteredChats.slice(indexOfFirstChat, indexOfLastChat);

  // Delete Handler
  const deleteChat = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this message!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: 'rounded-[2rem]' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/admin/messages/${id}`);
          setChats(chats.filter(chat => chat.id !== id));
          Swal.fire({ title: "Deleted!", icon: "success", timer: 1000, showConfirmButton: false });
        } catch (error) {
          Swal.fire("Error!", "Could not delete the message.", "error");
        }
      }
    });
  };

  if (loading) return <div className="text-center mt-20 font-bold">Loading Messages...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-2 pb-10 px-4 sm:px-6 lg:px-10 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Contact Messages</h1>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-5 text-center">Id</th>
                <th className="px-6 py-5">Sender</th>
                <th className="px-6 py-5 hidden md:table-cell">Email</th>
                <th className="px-6 py-5">Message</th>
                <th className="px-6 py-5 hidden sm:table-cell">Date</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentChats.map((chat) => (
                <tr key={chat.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{chat.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xs group-hover:bg-red-600 group-hover:text-white transition-all">
                        {chat.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-black text-slate-700">{chat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                      <Mail size={14} className="text-slate-300" /> {chat.email}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[250px] truncate group-hover:whitespace-normal transition-all">
                      <span className="block font-bold text-slate-700">{chat.subject}</span>
                      {chat.message}
                    </p>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black italic">
                      <Calendar size={14} /> {new Date(chat.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => deleteChat(chat.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredChats.length > 0 ? indexOfFirstChat + 1 : 0} to {Math.min(indexOfLastChat, filteredChats.length)} of {filteredChats.length} entries
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
              disabled={currentPage === totalPages || totalPages === 0}
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