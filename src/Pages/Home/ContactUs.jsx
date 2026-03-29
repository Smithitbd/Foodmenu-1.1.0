import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, 
  FaInstagram, FaLinkedinIn, FaWhatsapp, FaYoutube, FaPaperPlane 
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const ContactUs = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    otherSubject: '', // Other সিলেক্ট করলে এখানে জমা হবে
    message: ''
  });

const handleSubmit = (e) => { // async তুলে দিয়েছি যাতে ব্লক না হয়
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    const finalSubject = formData.subject === 'Other' ? formData.otherSubject : formData.subject;
    const payload = {
      name: formData.name,
      email: formData.email,
      subject: finalSubject || 'General Inquiry',
      message: formData.message
    };

    // ১. ব্যাকএন্ডে রিকোয়েস্ট পাঠিয়ে দিন (কোনো await ছাড়াই, এটা ব্যাকগ্রাউন্ডে চলবে)
    fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.log("Silent Error:", err)); 

    // ২. ১.৫ সেকেন্ডের ম্যাজিক টাইমার
    setTimeout(() => {
      setLoading(false);
      
      // সুইট অ্যালার্ট দেখানো
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Message Sent Successfully!',
        timer: 1000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      // ৩. ১.৫ সেকেন্ড পর হোম পেজে রিডাইরেক্ট
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: 'General Inquiry', otherSubject: '', message: '' });
        navigate('/');
      }, 1000);

    }, 1000); 
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-['Gilroy']">
      {/* Header Section */}
      <section className="relative pt-32 pb-20 bg-[#0A0F1D] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 inline-block">Get In Touch</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black mb-6 tracking-tight">How Can We <span className="text-red-600">Help?</span></motion.h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">Have questions about our services or want to partner with us? Our team is here to help you 24/7.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="relative z-20 mt-[-50px] pb-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Cards */}
            <div className="lg:col-span-1 space-y-4">
              {[
                { icon: <FaPhoneAlt />, label: 'Call Us', val: '+880 1764 561996', color: 'bg-blue-50 text-blue-600' },
                { icon: <FaEnvelope />, label: 'Email Us', val: 'info@smithitbd.com', color: 'bg-red-50 text-red-600' },
                { icon: <FaMapMarkerAlt />, label: 'Our Office', val: 'Rashid Building, Bondorbazer, Sylhet 3100', color: 'bg-green-50 text-green-600' },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ x: 10 }} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${item.color}`}>{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.label}</p>
                    <h4 className="text-slate-900 font-bold text-sm">{item.val}</h4>
                  </div>
                </motion.div>
              ))}
              <div className="bg-[#0A0F1D] p-8 rounded-[2.5rem] text-white">
                <p className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-50 text-center">Follow Our Socials</p>
                <div className="flex justify-center gap-4">
                  {[
                    { icon: <FaFacebookF />, link: 'https://facebook.com/smithIt' },
                    { icon: <FaInstagram />, link: 'https://www.instagram.com/smithitbd/' },
                    { icon: <FaWhatsapp />, link: 'https://wa.me/8801764561996' }, 
                    { icon: <FaLinkedinIn />, link: 'https://www.linkedin.com/company/smith-it/' },
                    { icon: <FaYoutube />, link: 'https://www.youtube.com/channel/UC_dQDK1qmZUvYe8jXJ8riZw' }
                  ].map((soc, i) => (
                    <motion.a key={i} href={soc.link} target="_blank" rel="noopener noreferrer" whileHover={{ y: -5, scale: 1.1 }} className="w-12 h-12 bg-white/5 hover:bg-red-600 rounded-2xl flex items-center justify-center transition-all border border-white/10 text-white">{soc.icon}</motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-50">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Address</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subject</label>
                    <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm cursor-pointer">
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Restaurant Partnership">Restaurant Partnership</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <AnimatePresence>
                    {formData.subject === 'Other' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-red-500 ml-2">Specify Your Subject</label>
                        <input type="text" required={formData.subject === 'Other'} value={formData.otherSubject} onChange={(e) => setFormData({...formData, otherSubject: e.target.value})} placeholder="Type your subject here..." className="w-full px-6 py-4 bg-red-50/30 border-2 border-red-100 focus:border-red-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Your Message</label>
                  <textarea rows="5" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="How can we help you today?" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm resize-none" />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-[#0A0F1D] transition-all flex items-center justify-center gap-3 disabled:opacity-70">
                  {loading ? 'Sending...' : 'Send Message'} <FaPaperPlane className="text-[10px]" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-6 pb-24">
        <motion.div {...fadeUp} className="w-full h-[450px] bg-slate-100 rounded-[3.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
          <iframe title="location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.1066705574443!2d91.8688402!3d24.8943486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375054d4f66438ad%3A0x6b1654e9545d9086!2sBandar%20Bazar%2C%20Sylhet!5e0!3m2!1sen!2sbd!4v1700000000000" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
          <div className="absolute bottom-8 left-8 bg-[#0A0F1D] text-white p-6 rounded-3xl shadow-2xl max-w-xs hidden md:block">
            <h5 className="font-black text-red-500 uppercase tracking-widest text-[10px] mb-2">Main Hub</h5>
            <p className="text-sm font-bold">Rashid Building (4th & 5th Floor) <br /> Bondorbazer, Sylhet 3100</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ContactUs;