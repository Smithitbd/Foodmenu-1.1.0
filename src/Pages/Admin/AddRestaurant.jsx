import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { Store, User, Phone, MapPin, Upload, Star } from 'lucide-react';

const AddRestaurant = () => {
  const { areaName } = useParams();
  const [areas, setAreas] = useState([]);
  
  const baseURL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : window.location.origin;

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '', 
    restaurantName: '',
    restaurantType: 'RESTAURANT',
    area: areaName || '',
    address: '',
    ratings: '',
    date: new Date().toISOString().split('T')[0],
    price: '',
    discount: '0',
    paid: '',
    subscription: 'None',
    paymentMethod: 'CASH',
    hasOffer: 'No'
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/get-area`);
        setAreas(res.data);
      } catch (err) {
        console.error("Error fetching areas:", err);
      }
    };
    fetchAreas();
  }, [baseURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    // Image check
    if (!image) {
        return Swal.fire('Error', 'Please select an image first!', 'error');
    }

    const data = new FormData();
    
    // Numbers clean kora
    const cleanPrice = String(formData.price).replace(/\D/g, "") || "0";
    const cleanPaid = String(formData.paid).replace(/\D/g, "") || "0";
    const offerValue = formData.hasOffer === 'Yes' ? 1 : 0;

    // Backend-er variable names (camelCase) onusare append kora
    data.append('customerName', formData.customerName);
    data.append('mobile', formData.mobile);
    data.append('restaurantName', formData.restaurantName);
    data.append('restaurantType', formData.restaurantType);
    data.append('area', formData.area);
    data.append('address', formData.address);
    data.append('ratings', formData.ratings || 0);
    data.append('date', formData.date);
    data.append('price', cleanPrice);
    data.append('discount', formData.discount);
    data.append('paid', cleanPaid);
    data.append('subscription', formData.subscription);
    data.append('paymentMethod', formData.paymentMethod);
    data.append('hasOffer', offerValue);
    data.append('image', image); // 'image' hobe key-ti

    try {
        const res = await axios.post(`${baseURL}/api/add-restaurant`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.status === 200 || res.status === 201) {
            Swal.fire('Success', 'Restaurant Added Successfully!', 'success');
            
            // Form reset
            setFormData({
                customerName: '',
                mobile: '',
                restaurantName: '',
                restaurantType: 'RESTAURANT',
                area: areaName || '',
                address: '',
                ratings: '',
                date: new Date().toISOString().split('T')[0],
                price: '',
                discount: '0',
                paid: '',
                subscription: 'None',
                paymentMethod: 'CASH',
                hasOffer: 'No'
            });
            setImage(null);
            e.target.reset(); // File input reset
        }
    } catch (err) {
        console.error("Upload Error:", err);
        Swal.fire('Error', err.response?.data?.message || 'Server connection failed!', 'error');
    }
};

  const dueAmount = (Number(formData.price) - Number(formData.discount)) - Number(formData.paid);

  return (
    <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#f8f9fa] border-b border-gray-100 px-8 py-5">
        <h2 className="text-xl font-black text-gray-800 uppercase flex items-center gap-2">
          <Store className="text-red-600" /> Add Restaurant {areaName && `- ${areaName}`}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          {/* Restaurant Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Restaurant Type</label>
            <select name="restaurantType" value={formData.restaurantType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-red-500">
              <option value="RESTAURANT">RESTAURANT</option>
              <option value="FOOD COURT">FOOD COURT</option>
              <option value="HOME KITCHEN">HOME KITCHEN</option>
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Customer Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" name="customerName" value={formData.customerName} placeholder="Enter name" onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none" required />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Customer Contact</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" name="mobile" value={formData.mobile} placeholder="Enter mobile number" onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Area</label>
              <select name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none">
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Has Offer?</label>
              <select name="hasOffer" value={formData.hasOffer} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-red-500">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Restaurant Name</label>
            <input type="text" name="restaurantName" value={formData.restaurantName} placeholder="Enter restaurant name" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none" required />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" name="address" value={formData.address} placeholder="Enter address" onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Image Upload Design */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Restaurant Image</label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-red-300 transition-colors">
              <Upload className="text-gray-400" />
              <input type="file" onChange={handleImageChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer" />
            </div>
            {image && <p className="text-xs text-green-600 mt-2 font-bold">✓ Selected: {image.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Price (৳)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Paid (৳)</label>
              <input type="number" name="paid" value={formData.paid} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-600 flex justify-between">
                <span>Due Amount:</span>
                <span className={dueAmount > 0 ? "text-red-600" : "text-green-600"}>৳ {dueAmount || 0}</span>
              </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subscription</label>
              <select name="subscription" value={formData.subscription} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                <option value="None">None</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ratings</label>
              <div className="relative">
                <Star className="absolute left-3 top-3 text-yellow-500" size={18} />
                <input type="text" name="ratings" value={formData.ratings} placeholder="Ex: 4.5" onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Payment Method</label>
            <div className="flex gap-6 mt-2">
              {['CASH', 'CARD', 'BKASH'].map(method => (
                <label key={method} className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={handleChange} className="w-4 h-4 accent-red-600" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-red-600">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-[#00bee1] hover:bg-[#009cb9] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
            Add Restaurant
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurant;