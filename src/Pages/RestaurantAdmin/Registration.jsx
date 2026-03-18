import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Lock, ShieldCheck, Edit, Trash2, User, ChevronDown, Check, X, Ban, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const RegistrationPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Select Role' });
  const [editingId, setEditingId] = useState(null);

  // LocalStorage থেকে ডাটা রিট্রিভ
  const resId = localStorage.getItem('resId');
  const resName = localStorage.getItem('resName');

  useEffect(() => {
    if (resId) fetchUsers();
  }, [resId]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${resId}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // স্ট্যাটাস টগল ফাংশন (Active/Block)
  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await axios.patch(`http://localhost:5000/api/users/${user.id}/status`, { status: newStatus });
      Swal.fire({ icon: 'success', title: `User ${newStatus}!`, timer: 1000, showConfirmButton: false });
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && (editingId || formData.password) && formData.role !== 'Select Role') {
      try {
        const payload = { 
          ...formData, 
          restaurant_id: resId, 
          restaurant_name: resName 
        };

        if (editingId) {
          await axios.put(`http://localhost:5000/api/users/${editingId}`, payload);
          Swal.fire({ icon: 'success', title: 'Updated!', timer: 1000, showConfirmButton: false });
        } else {
          await axios.post('http://localhost:5000/api/users', payload);
          Swal.fire({ icon: 'success', title: 'Staff Registered!', timer: 1000, showConfirmButton: false });
        }
        
        setEditingId(null);
        setFormData({ name: '', email: '', password: '', role: 'Select Role' });
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Something went wrong!', 'error');
      }
    } else {
      Swal.fire('Warning', 'Please fill all required fields!', 'warning');
    }
  };

  const deleteUser = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This staff will be removed permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#f34336",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/users/${id}`);
          fetchUsers(); 
          Swal.fire("Deleted!", "Staff removed.", "success");
        } catch (err) {
          Swal.fire("Error", "Could not delete user", "error");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-2 pb-10 px-4 sm:px-6 lg:px-10 font-sans">
      <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Staff Management</h1>
          <div className="h-1.5 w-24 bg-red-600 rounded-full mt-1"></div>
          <p className="text-slate-500 mt-1 font-medium text-xs sm:text-sm">Manage {resName}'s system users and permissions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
        <div className="xl:col-span-4 lg:col-span-5 order-2 xl:order-1">
          <div className={`bg-white p-6 sm:p-8 rounded-4xl shadow-xl border-2 transition-all ${editingId ? 'border-blue-400' : 'border-white'}`}>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                {editingId ? <Edit className="text-blue-600" size={22} /> : <UserPlus className="text-red-600" size={22} />}
                {editingId ? 'Update Staff' : 'Register Staff'}
            </h2>
          
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Full Name</label>
                <div className="relative group">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700" required />
                  <User className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Address</label>
                <div className="relative group">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@company.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700" required />
                  <Mail className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                </div>
              </div>

              {!editingId && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Password</label>
                  <div className="relative group">
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700" required />
                    <Lock className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Access Level</label>
                <div className="relative group">
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer" required >
                    <option disabled value="Select Role">Select Role</option>
                    <option value="Manager">Manager</option>
                    <option value="Chief-Waiter">Chief-Waiter</option>
                  </select>
                  <ShieldCheck className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                  <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className={`flex-1 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-red-600'} text-white font-black py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]`}>
                  {editingId ? <Check size={16} /> : <UserPlus size={16} />} {editingId ? 'Update' : 'Create Staff'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', email:'', password:'', role:'Select Role'})}} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl">
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-8 lg:col-span-7 order-1 xl:order-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-white">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Staff List</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 bg-white">
                    <th className="px-6 py-5 text-center">#</th>
                    <th className="px-6 py-5">Identities</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user, index) => (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-all group ${user.status === 'blocked' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{index + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${user.status === 'blocked' ? 'bg-slate-200 text-slate-500' : 'bg-red-50 text-red-600'}`}>
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-700 leading-none mb-1">{user.name}</p>
                                <p className="text-[11px] font-bold text-slate-400">{user.email}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => toggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            user.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {user.status === 'active' ? <CheckCircle size={12}/> : <Ban size={12}/>}
                          {user.status}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => {setEditingId(user.id); setFormData({name: user.name, email: user.email, role: user.role})}} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;