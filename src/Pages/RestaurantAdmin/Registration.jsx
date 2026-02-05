import React, { useState } from 'react';
import { UserPlus, Mail, Lock, ShieldCheck, Edit, Trash2, User, ChevronDown, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';

const RegistrationPage = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "sourov", email: "sourov@gmail.com", password: "12345", role: "Admin" },
    { id: 2, name: "sajib.chy", email: "sajib.chy15@yahoo.com", password: "123456789", role: "Admin" },
  ]);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Select Role' });
  const [editingId, setEditingId] = useState(null); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ formData, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password && formData.role !== 'Select Role') {
      if (editingId) {
        // Data update when edit mode selected
        setUsers(users.map(user => user.id === editingId ? { formData, id: editingId } : user));
        setEditingId(null);
      } else {
        // add new user
        const newUser = { id: Date.now(), formData };
        setUsers([users, newUser]);
      }
      setFormData({ name: '', email: '', password: '', role: 'Select Role' });
    } else {
      alert("Please fill all the fields correctly!");
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, password: user.password, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'Select Role' });
  };

  const deleteUser = (id) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1e293b", 
    cancelButtonColor: "#f34336", 
    confirmButtonText: "Yes, delete it!",
    customClass: {
      popup: 'rounded-[2rem]', 
      confirmButton: 'rounded-xl px-6 py-3',
      cancelButton: 'rounded-xl px-6 py-3'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      setUsers(users.filter(user => user.id !== id));
      Swal.fire({
        title: "Deleted!",
        text: "User has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
        popup: 'rounded-[2rem]'
        }
      });
    }
  });
};

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-2 pb-10 px-4 sm:px-6 lg:px-10 font-sans">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">User Registration</h1>
          <div className="h-1.5 w-24 bg-red-600 rounded-full mt-1"></div>
          <p className="text-slate-500 mt-1 font-medium text-xs sm:text-sm">Manage and register new administrators or users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
        
        {/* Left Side: New/Edit Account Form */}
        <div className="xl:col-span-4 lg:col-span-5 order-2 xl:order-1">
          <div className={`bg-white p-6 sm:p-8 rounded-4xl shadow-xl shadow-slate-200/60 border-2 transition-all duration-300 ${editingId ? 'border-blue-400' : 'border-white'}`}>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                {editingId ? <Edit className="text-blue-600" size={22} /> : <UserPlus className="text-red-600" size={22} />}
                {editingId ? 'Update Account' : 'New Account'}
            </h2>
          
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm" required />
                  <User className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@company.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm" required />
                  <Mail className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm" required />
                  <Lock className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Level</label>
                <div className="relative group">
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold text-slate-700 shadow-sm appearance-none cursor-pointer" required >
                    <option disabled value="Select Role">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Editor">Editor</option>
                  </select>
                  <ShieldCheck className="absolute left-4 top-3 text-slate-400 group-focus-within:text-red-500" size={18} />
                  <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className={`flex-1 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-red-600'} text-white font-black py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]`}>
                  {editingId ? <Check size={16} /> : <UserPlus size={16} />} {editingId ? 'Update' : 'Create Account'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all flex items-center justify-center">
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: System Users Table */}
        <div className="xl:col-span-8 lg:col-span-7 order-1 xl:order-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">System Users</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100 bg-white">
                    <th className="px-6 py-5 text-center">#</th>
                    <th className="px-6 py-5">Identities</th>
                    <th className="px-6 py-5">Passkey</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user, index) => (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-all group ${editingId === user.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{index + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xs uppercase group-hover:bg-red-600 group-hover:text-white">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-700 leading-none mb-1">{user.name}</p>
                                <p className="text-[11px] font-bold text-slate-400">{user.email}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono font-bold text-slate-300 bg-slate-100 px-2 py-1 rounded-md">
                            {user.password.replace(/./g, '•').slice(0, 5)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => startEdit(user)} className={`p-2 rounded-xl transition-all ${editingId === user.id ? 'text-blue-600 bg-blue-100' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}>
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