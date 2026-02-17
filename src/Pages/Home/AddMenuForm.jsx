import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaStore, FaUser, FaMapMarkerAlt, FaGlobe, FaIdCard, FaPhone,
  FaCalendarAlt, FaCheckCircle, FaArrowRight, FaArrowLeft, 
  FaLock, FaCloudUploadAlt, FaEnvelope, FaSpinner, FaEdit,
  FaRegImage, FaFilePdf 
} from 'react-icons/fa';
// import Tesseract from 'tesseract.js'; //  OCR 
import { useFormContext } from '../../context/FormContext'; 

const AddMenuForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { formData, updateFormData, isVerified, setIsVerified } = useFormContext();

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    // OCR কমেন্ট করা থাকলেও Initial state true করে দিচ্ছি যেন Step 3 তে বাধা না দেয়
    setIsVerified(true); 
    setScanError("");
  }, [formData.idFormat, formData.idType, setIsVerified]);

  // --- UPDATED HANDLE FINISH ---
  const handleFinish = async () => {
    const slug = formData.restaurantName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    Swal.fire({
      title: 'Registering...',
      text: 'Please wait while we set up your restaurant.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const data = new FormData();
    data.append('owner_name', formData.ownerName);
    data.append('owner_email', formData.email);
    data.append('owner_password', formData.password);
    data.append('restaurant_name', formData.restaurantName);
    data.append('slug', slug);
    data.append('location', formData.ownerAddress);
    
    if (formData.logo) data.append('logo', formData.logo);
    if (formData.idFileFront) data.append('idFileFront', formData.idFileFront);
    if (formData.idFilePdf) data.append('idFilePdf', formData.idFilePdf);

    try {
      const response = await axios.post('http://localhost:5000/api/register-restaurant', data, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Restaurant registered successfully!',
          timer: 2000,
          showConfirmButton: false
        }).then(() => { navigate('/login'); });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || 'Something went wrong!',
      });
    }
  };

  /* --- OCR LOGIC COMMENTED FOR FUTURE VERSION ---
  const performOCR = async (file) => {
    if (!formData.ownerName || formData.ownerName.length < 3) {
      alert("Please enter a valid Owner Name in Step 1 first.");
      setStep(1);
      return;
    }
    setIsScanning(true);
    setScanError("");
    setIsVerified(false);
    setScanProgress(10);

    try {
      const result = await Tesseract.recognize(file, 'eng+ben', {
          logger: m => { if (m.status === 'recognizing text') setScanProgress(Math.floor(m.progress * 100)); }
      });
      const text = result.data.text.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ');
      const cleanInputName = formData.ownerName.toLowerCase().trim().replace(/[^\w\s]/gi, ' ');

      if (text.includes(cleanInputName) || cleanInputName.split(' ').some(part => part.length > 2 && text.includes(part))) {
        setIsVerified(true);
      } else {
        setScanError("Verification Failed: Name not found on document.");
      }
    } catch (err) {
      setScanError("Scan error. Please use a clearer image.");
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };
  */

  const handleInputChange = (field, value) => updateFormData({ [field]: value });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    updateFormData({ [field]: file });
    // OCR logic commented out
    // if (step === 3 && (field === 'idFileFront') && formData.idFormat === 'Photo') performOCR(file);
  };

  const canNextStep = () => {
    if (step === 1) return formData.restaurantName && formData.ownerName && formData.ownerContact && formData.ownerAddress && formData.dob;
    if (step === 2) return formData.officeAddress && formData.category && formData.resContact && formData.logo && formData.logoType;
    if (step === 3) {
      if (formData.idFormat === 'Photo') return formData.idFileFront && (formData.idType === 'NID' ? formData.idFileBack : true);
      return formData.idFilePdf;
    }
    if (step === 4) return formData.email && formData.password && (formData.password === formData.confirmPassword) && formData.password.length >= 6;
    // Step 5 (OTP) skipped currently
    return true;
  };

  const nextStep = () => {
    if (canNextStep()) {
        // Step 4 এর পর সরাসরি Step 6 এ চলে যাবে (Step 5 skip)
        if (step === 4) setStep(6);
        else setStep(prev => prev + 1);
    }
    else alert("Please complete all required fields correctly.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-2 sm:p-5 font-['Gilroy']">
      <motion.div className="w-full max-w-[1100px] h-full max-h-[750px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Sidebar */}
        <div className="hidden md:flex md:w-[28%] bg-slate-900 p-8 flex-col justify-between text-white">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black">F</div>
              <span className="text-lg font-black uppercase tracking-widest">FoodMenu<span className="text-red-500">BD</span></span>
            </div>
            <div className="space-y-4">
              {['Identity', 'Business', 'Verify', 'Security', 'Review'].map((t, i) => {
                // Step indexing logic adjusted because step 5 is skipped
                let displayStep = i + 1;
                if (i === 4) displayStep = 6; // Review is step 6

                return (
                  <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${step >= displayStep ? 'opacity-100' : 'opacity-20'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${step > displayStep ? 'bg-green-500 border-none' : step === displayStep ? 'bg-red-600 border-none' : 'border border-slate-700'}`}>
                      {step > displayStep ? <FaCheckCircle /> : i+1}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800">
             <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${(step / 6) * 100}%` }} className="h-full bg-red-600" />
             </div>
             <p className="text-[9px] mt-2 text-slate-500 font-bold uppercase">Step {step === 6 ? 5 : step} of 5</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10 bg-white flex flex-col justify-center overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode='wait'>
              
              {step === 1 && (
                <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Identity Details</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Restaurant Name *" icon={<FaStore/>} value={formData.restaurantName} onChange={(v)=>handleInputChange('restaurantName', v)} />
                    <Input label="Opening Date" icon={<FaCalendarAlt/>} type="date" value={formData.openingDate} onChange={(v)=>handleInputChange('openingDate', v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Owner Name *" icon={<FaUser/>} value={formData.ownerName} onChange={(v)=>handleInputChange('ownerName', v)} />
                    <Input label="Owner Contact *" icon={<FaPhone/>} value={formData.ownerContact} onChange={(v)=>handleInputChange('ownerContact', v)} />
                  </div>
                  <Input label="Owner Address *" icon={<FaMapMarkerAlt/>} value={formData.ownerAddress} onChange={(v)=>handleInputChange('ownerAddress', v)} />
                  <Input label="Owner DOB *" icon={<FaCalendarAlt/>} type="date" value={formData.dob} onChange={(v)=>handleInputChange('dob', v)} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Business Info</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Category *" options={['Cafe', 'Food court', 'Homemade', 'Others']} value={formData.category} onChange={(v)=>handleInputChange('category', v)} />
                    <Input label="Res. Contact *" icon={<FaPhone/>} value={formData.resContact} onChange={(v)=>handleInputChange('resContact', v)} />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logo Format *</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="logoType" checked={formData.logoType === 'Photo'} onChange={() => handleInputChange('logoType', 'Photo')} className="accent-red-600" />
                           <span className="text-[10px] font-bold text-slate-600 uppercase"><FaRegImage className="inline mb-1"/> Photo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="logoType" checked={formData.logoType === 'PDF'} onChange={() => handleInputChange('logoType', 'PDF')} className="accent-red-600" />
                           <span className="text-[10px] font-bold text-slate-600 uppercase"><FaFilePdf className="inline mb-1"/> PDF</span>
                        </label>
                    </div>
                    <Upload label={formData.logoType ? `Upload Logo (${formData.logoType})` : "Select Type First"} onChange={(e) => handleFileChange(e, 'logo')} fileName={formData.logo?.name} disabled={!formData.logoType} />
                  </div>
                  <Input label="Office Address *" icon={<FaMapMarkerAlt/>} value={formData.officeAddress} onChange={(v)=>handleInputChange('officeAddress', v)} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                  <h2 className="text-2xl font-black text-slate-900">Verification</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="ID Type *" options={['NID', 'Passport', 'Driving Licence']} value={formData.idType} onChange={(v)=>handleInputChange('idType', v)} />
                    <Select label="Format *" options={['Photo', 'PDF']} value={formData.idFormat} onChange={(v)=>handleInputChange('idFormat', v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.idFormat === 'Photo' ? (
                      <>
                        <Upload label="Front (ID Photo) *" onChange={(e)=>handleFileChange(e, 'idFileFront')} fileName={formData.idFileFront?.name} isScanning={isScanning} isVerified={true} />
                        {formData.idType === 'NID' && <Upload label="Back Side *" onChange={(e)=>handleFileChange(e, 'idFileBack')} fileName={formData.idFileBack?.name} />}
                      </>
                    ) : <Upload label="Identity PDF *" onChange={(e)=>handleFileChange(e, 'idFilePdf')} fileName={formData.idFilePdf?.name} />}
                  </div>
                  {/* OCR messages hidden */}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Security</h2>
                  <Input label="Email Address *" icon={<FaEnvelope/>} value={formData.email} onChange={(v)=>handleInputChange('email', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Password *" type="password" icon={<FaLock/>} value={formData.password} onChange={(v)=>handleInputChange('password', v)} />
                    <Input label="Confirm Password *" type="password" icon={<FaLock/>} value={formData.confirmPassword} onChange={(v)=>handleInputChange('confirmPassword', v)} />
                  </div>
                </motion.div>
              )}

              {/*step === 5 && (
                <motion.div key="5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto"><FaLock className="text-red-600 text-2xl" /></div>
                  <h2 className="text-2xl font-black text-slate-900">OTP Verification</h2>
                  <div className="flex gap-4 justify-center">
                    <button onClick={()=>handleInputChange('otpMethod', 'email')} className={`px-4 py-3 rounded-2xl border-2 transition-all ${formData.otpMethod === 'email' ? 'border-red-600 bg-red-50' : 'border-slate-100'}`}>
                      <FaEnvelope className="mx-auto mb-1"/> <p className="text-[9px] font-black">EMAIL</p>
                    </button>
                    <button onClick={()=>handleInputChange('otpMethod', 'phone')} className={`px-4 py-3 rounded-2xl border-2 transition-all ${formData.otpMethod === 'phone' ? 'border-red-600 bg-red-50' : 'border-slate-100'}`}>
                      <FaPhone className="mx-auto mb-1"/> <p className="text-[9px] font-black">SMS</p>
                    </button>
                  </div>
                  {formData.otpMethod && (
                    <div className="space-y-4">
                      <input type="text" maxLength="6" placeholder="0 0 0 0 0 0" className="w-full text-center text-2xl font-black tracking-[1em] py-3 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-red-100" onChange={(e)=>handleInputChange('otpCode', e.target.value)} />
                      <p className="text-[9px] font-bold text-slate-400">Sent to: {formData.otpMethod === 'email' ? formData.email : formData.ownerContact}</p>
                    </div>
                  )}
                </motion.div>
              )*/}

              {step === 6 && (
                <motion.div key="6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Final Review</h2>
                  <div className="bg-slate-50 p-4 rounded-[2rem] space-y-3 max-h-[350px] overflow-y-auto border border-slate-100 shadow-inner">
                    <ReviewSection title="Identity" onEdit={()=>setStep(1)}>
                        <ReviewItem label="Restaurant" value={formData.restaurantName} />
                        <ReviewItem label="Owner" value={formData.ownerName} />
                        <ReviewItem label="Address" value={formData.ownerAddress} /> 
                    </ReviewSection>
                    <ReviewSection title="Verification" onEdit={()=>setStep(3)}>
                        <ReviewItem label="ID Type" value={formData.idType} />
                        <ReviewItem label="Status" value="Document Uploaded" />
                    </ReviewSection>
                    <ReviewSection title="Security" onEdit={()=>setStep(4)}>
                        <ReviewItem label="Email" value={formData.email} />
                    </ReviewSection>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-10">
              {step > 1 && <button onClick={() => {
                  if (step === 6) setStep(4);
                  else setStep(step - 1);
              }} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Back</button>}
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={step === 6 ? handleFinish : nextStep}
                disabled={!canNextStep()}
                className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${canNextStep() ? 'bg-slate-900 hover:bg-red-600' : 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'}`}
              >
                {step === 6 ? "Finish" : "Continue"} <FaArrowRight />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ... Sub-components (ReviewSection, ReviewItem, Input, Select, Upload)
const ReviewSection = ({ title, children, onEdit }) => (
  <div className="bg-white p-3 rounded-2xl border border-slate-100 relative group">
    <div className="flex justify-between items-center mb-1">
       <p className="text-[8px] font-black text-red-600 uppercase">{title}</p>
       <button onClick={onEdit} className="text-slate-400 hover:text-red-600"><FaEdit size={10} /></button>
    </div>
    {children}
  </div>
);

const ReviewItem = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-1 mt-1">
    <span className="text-[8px] text-slate-400 uppercase font-bold">{label}</span>
    <span className="text-[9px] text-slate-900 font-bold truncate max-w-[140px]">{value}</span>
  </div>
);

const Input = ({ label, icon, value, onChange, type="text" }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <div className="relative group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500">{icon}</span>
      <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-red-100 rounded-2xl outline-none text-xs font-bold transition-all" />
    </div>
  </div>
);

const Select = ({ label, options, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-red-100 rounded-2xl outline-none text-xs font-bold cursor-pointer transition-all">
      <option value="">Select {label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Upload = ({ label, onChange, fileName, isScanning, isVerified, disabled }) => (
  <div className={`space-y-1 ${disabled ? 'opacity-40' : ''}`}>
    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <label className={`flex flex-col items-center justify-center w-full h-14 border-2 border-dashed rounded-2xl transition-all ${isVerified ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
       {fileName ? <p className="text-[8px] font-black text-slate-600 px-2 truncate w-full text-center">{fileName}</p> : <FaCloudUploadAlt className="text-slate-300 text-lg" />}
       <input type="file" className="hidden" onChange={onChange} disabled={isScanning || disabled} />
    </label>
  </div>
);

export default AddMenuForm;