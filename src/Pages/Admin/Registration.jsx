import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, ShieldCheck, Edit, Trash2, User, ChevronDown, Check, X, Eye, EyeOff, Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const RegistrationPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Select Role' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [showFormPassword, setShowFormPassword] = useState(false);
  const [visibleTablePasswords, setVisibleTablePasswords] = useState({});

  const isLocalhost = window.location.hostname === "localhost";
  const LIVE_URL = "https://your-live-api.com";
  const BASE_URL = isLocalhost ? "http://localhost:5000" : LIVE_URL;
  const API_BASE = `${BASE_URL}/api/superadmin`;
  const IMAGE_PATH = `${BASE_URL}/uploads/AdminProfile/`;

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
  });

  const fetchUsers = async () => {
    try {
      // এখানে নিশ্চিত করুন এপিআই থেকে পাসওয়ার্ড ফিল্ডটি আসছে
      const response = await axios.get(`${API_BASE}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ১ মেগাবাইট = ১০,৪৮,৫৭৬ বাইট
      const maxSize = 1 * 1024 * 1024;

      if (file.size > maxSize) {
        Toast.fire({
          icon: 'error',
          title: 'File is too large!',
          text: 'Please upload an image smaller than 1MB.'
        });
        e.target.value = null; // ইনপুট ক্লিয়ার করে দেওয়া
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // পাসওয়ার্ড টগল ফাংশন
  const toggleTablePassword = (userId) => {
    setVisibleTablePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (selectedFile) data.append('image', selectedFile);

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/update/${editingId}`, data);
        Toast.fire({ icon: 'success', title: 'Updated!' });
      } else {
        await axios.post(`${API_BASE}/register`, data);
        Toast.fire({ icon: 'success', title: 'Registered!' });
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Failed!' });
    }
  };

  const startEdit = (user) => {
    const uId = user.id || user._id;
    setEditingId(uId);
    // এখানে user.password যদি ডাটাবেসে অন্য নামে থাকে তবে সেটি দিন
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: user.password || '', // এই লাইনটি গুরুত্বপূর্ণ
      role: user.role || 'Select Role'
    });
    setPreviewUrl(user.image ? `${IMAGE_PATH}${user.image}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'Select Role' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowFormPassword(false);
  };

  const deleteUser = (uId) => {
    Swal.fire({
      title: 'Delete user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE}/delete/${uId}`);
          fetchUsers();
          Toast.fire({ icon: 'success', title: 'Deleted!' });
        } catch (error) {
          Toast.fire({ icon: 'error', title: 'Error!' });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-2 pb-10 px-4 sm:px-6 lg:px-10 font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">

        {/* FORM SECTION */}
        <div className="xl:col-span-4 lg:col-span-5">
          <div className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-2 transition-all ${editingId ? 'border-blue-500' : 'border-white'}`}>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              {editingId ? <Edit className="text-blue-600" /> : <UserPlus className="text-blue-600" />}
              {editingId ? 'Update Account' : 'New Account'}
            </h2>

            <form className="space-y-4" onSubmit={handleSave}>
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-400">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <Camera className="text-slate-300" size={30} />
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                  Recommended: WEBP, Max 1MB
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="relative">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" required />
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                </div>

                <div className="relative">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" required />
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                </div>

                {/* Password input with Toggle */}
                <div className="relative">
                  <input
                    type={showFormPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-mono"
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600">
                    {showFormPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none" required >
                    <option disabled value="Select Role">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <ShieldCheck className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px]">
                  {editingId ? 'Save Changes' : 'Create Account'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-5 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><X size={18} /></button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="xl:col-span-8 lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5">Identities</th>
                    <th className="px-6 py-5">Passkey</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => {
                    const uId = user.id || user._id;
                    return (
                      <tr key={uId} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                              {user.image ? (
                                <img src={`${IMAGE_PATH}${user.image}`} className="w-full h-full object-cover" alt=""
                                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xs">{user.name.charAt(0)}</div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700">{user.name}</p>
                              <p className="text-[11px] font-bold text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md min-w-[90px] inline-block">
                              {visibleTablePasswords[uId] ? user.password : '••••••••'}
                            </span>
                            <button onClick={() => toggleTablePassword(uId)} className="text-slate-300 hover:text-blue-500 transition-colors">
                              {visibleTablePasswords[uId] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                        {/* <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.role === 'Admin' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {user.role}
                          </span>
                        </td> */}


                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.role?.toLowerCase() === 'admin'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-blue-50 text-blue-600'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => startEdit(user)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl"><Edit size={18} /></button>
                            <button onClick={() => deleteUser(uId)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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