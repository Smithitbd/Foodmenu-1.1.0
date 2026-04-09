import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, Edit, Trash2, Star, Quote, Check, X } from 'lucide-react';
import Swal from 'sweetalert2'; 
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// আপনার ব্যাকএন্ড ইউআরএল
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/reviews' : '/api/reviews';

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- ১. ডাটাবেস থেকে রিভিউ লোড করা ---
  const fetchReviews = async () => {
    try {
      const res = await axios.get(API_URL);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- ২. সেভ এবং আপডেট ফাংশন ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    setLoading(true);
    try {
      if (editingId) {
        // এডিট মোড (UPDATE)
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Review has been updated.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[2rem]' } });
      } else {
        // নতুন রিভিউ (CREATE)
        await axios.post(API_URL, formData);
        Swal.fire({ icon: 'success', title: 'Published!', text: 'Your review is live.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[2rem]' } });
      }
      setFormData({ name: '', message: '' });
      fetchReviews(); // ডাটা রিফ্রেশ করা
    } catch (err) {
      toast.error("Operation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setFormData({ name: review.name, message: review.message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', message: '' });
  };

  // --- ৩. ডিলিট ফাংশন ---
  const deleteReview = (id) => {
    Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl px-6 py-3', cancelButton: 'rounded-xl px-6 py-3' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          fetchReviews();
          Swal.fire({ title: "Deleted!", icon: "success", timer: 1000, showConfirmButton: false, customClass: { popup: 'rounded-[2rem]' } });
        } catch (err) {
          toast.error("Delete failed.");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-2 pb-10 px-4 sm:px-6 lg:px-10 font-sans">
      <Toaster />
      
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Add Review</h1>
          <div className="h-1.5 w-16 bg-red-600 rounded-full mt-1"></div>
          <p className="text-slate-500 mt-1 font-medium text-xs sm:text-sm tracking-tight italic">
            Manage customer testimonials and feedback.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
        
        {/* Left Side: Form Card */}
        <div className="xl:col-span-4 order-2 xl:order-1">
          <div className={`bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/60 border-2 transition-all duration-300 ${editingId ? 'border-blue-400' : 'border-white'}`}>
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                {editingId ? <Edit className="text-blue-600" size={20} /> : <MessageSquare className="text-red-600" size={20} />} 
                {editingId ? 'Edit Review' : 'Share Experience'}
            </h2>
            
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reviewer Name</label>
                <div className="relative group">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm" required />
                  <User className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-red-500" size={16} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                <div className="relative group">
                  <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Enter your review message..." rows="4" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm resize-none" required></textarea>
                  <Quote className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-red-500" size={16} />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className={`flex-1 ${editingId ? 'bg-blue-600' : 'bg-slate-900'} hover:bg-red-600 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-[10px]`}>
                  {loading ? 'Processing...' : (editingId ? <><Check size={14} /> Update Review</> : <><Send size={14} /> Publish Review</>)}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="mt-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all flex items-center justify-center">
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Table Card */}
        <div className="xl:col-span-8 order-1 xl:order-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Feedback</h3>
                <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
            </div>
            
            <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 bg-white">
                    <th className="px-6 py-4 text-center w-16">#</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reviews.map((review, index) => (
                    <tr key={review.id} className={`hover:bg-slate-50/50 transition-all group ${editingId === review.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-6 py-4 text-xs font-bold text-slate-300 text-center">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black text-[10px] uppercase group-hover:bg-red-600 group-hover:text-white transition-all">
                                {review.name.charAt(0)}
                            </div>
                            <span className="text-xs font-black text-slate-700">{review.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                          "{review.message}"
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => startEdit(review)} className={`p-1.5 rounded-lg transition-all ${editingId === review.id ? 'text-blue-600 bg-blue-100' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteReview(review.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400 text-sm italic">No reviews found yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;