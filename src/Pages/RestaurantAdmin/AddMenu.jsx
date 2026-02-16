import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Calendar, Tag, Layers, DollarSign, List, PlusCircle, X, Edit2, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios'; 

const AddMenu = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  const rid = localStorage.getItem('resId');
  if (!rid) {
    navigate('/login');
  }
}, [navigate]);

const restaurantId = localStorage.getItem('resId');
  

  // Form States
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('Full');
  const [customQuantity, setCustomQuantity] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [price, setPrice] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [existingCategories, setExistingCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/get-categories');
        // Map the name from database by using SET
        setCategories(res.data.map(item => item.name)); 
      } catch (err) {
        console.error("Categories fetch failed");
      }
    };
    fetchCategories();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Image Required', text: 'Please upload at least one image.' });
      return;
    }

    // Final quantity logic: if others selected than customQuantity will be selected
    const finalQuantity = quantity === 'Others' ? customQuantity : quantity;

    if (quantity === 'Others' && !customQuantity) {
      Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please specify the quantity.' });
      return;
    }

    setIsLoading(true);

    // Form Data object Create
    const formData = new FormData();
    formData.append('restaurant_id', restaurantId);
    formData.append('name', itemName);
    formData.append('quantity', finalQuantity);
    formData.append('category', selectedCategory);
    formData.append('price', price);
    formData.append('publishDate', publishDate);
    //for multiple image
    images.forEach((img) => {
    formData.append('images', img); 
  });

  try {
    const response = await axios.post('http://localhost:5000/api/add-product', formData,{
      headers : {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.status === 201){
      Swal.fire({
        icon: 'success',
        title: 'Published!',
        text: 'Menu item with images added successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/restaurantadmin/menu-list');
    }
  } catch (error){
    console.error("Upload Error : ", error);
    Swal.fire({
        icon: 'error',
        title: 'Failed..!',
        text: error.response?.data?.message || 'Something went Wrong..!',
      });
  } finally{
    setIsLoading(false);
  }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Add New <span className="text-red-600">Menu Item</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Create delicious entries for your customers</p>
          </div>
          
          <button 
            onClick={() => navigate('/restaurantadmin/menu-list')}
            className="flex items-center gap-2 bg-white border-2 border-slate-900 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <List size={16} /> View Menu List
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <PlusCircle size={14} className="text-red-500"/> Item Name
                </label>
                <input 
                  type="text" 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Special Mutton Kacchi"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>

              <div className="space-y-2 relative">
  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
    <Layers size={14} className="text-red-500"/> Select Category
  </label>
  
      <div className="relative">
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
          required
        >
          <option value="" disabled>Choose a category</option>
          {categories.length > 0 ? (
            categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))
          ) : (
            <option disabled>Loading categories...</option>
          )}
        </select>
        
        {/* DropDown Arrow Icon */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Tag size={14} className="text-red-500"/> Serving Quantity
                </label>
                <div className="flex gap-3">
                  {['Half', 'Full', 'Others'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setQuantity(option)}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        quantity === option 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* if select Others than a input box will come */}
                <AnimatePresence>
                  {quantity === 'Others' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative mt-2">
                        <input 
                          type="text" 
                          value={customQuantity}
                          onChange={(e) => setCustomQuantity(e.target.value)}
                          placeholder="e.g. 1kg or 2 Plates"
                          className="w-full px-5 py-4 bg-red-50/50 border-2 border-red-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-red-500 transition-all text-sm"
                          required
                        />
                        <Edit2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <DollarSign size={14} className="text-red-500"/> Price (BDT)
                </label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Calendar size={14} className="text-red-500"/> Publish Date
              </label>
              <input 
                type="date" 
                value={publishDate}
                min={today} 
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:bg-white outline-none transition-all font-bold text-slate-700 cursor-pointer"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Upload size={14} className="text-red-500"/> Product Gallery (Multiple)
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                    <img 
                      src={URL.createObjectURL(img)} 
                      alt="preview" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-red-500 hover:bg-red-50/30 transition-all group">
                  <Upload className="text-slate-300 group-hover:text-red-500 mb-2" size={24} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Add Photo</span>
                  <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            <div className="pt-6">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={`w-full py-5 rounded-3xl font-black text-white text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${
                  isLoading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-red-600 shadow-red-200'
                }`}
              >
                {isLoading ? 'Processing...' : (
                  <>
                    <PlusCircle size={18} /> Publish Menu Item
                  </>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddMenu;