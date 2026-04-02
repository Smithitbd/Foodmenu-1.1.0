import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Loader2, Crown, Eye, X, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

const DownloadMenuPage = () => {
    const [menus, setMenus] = useState({});
    const [resInfo, setResInfo] = useState({
        name: localStorage.getItem('resName') || 'Elite Dining',
        address: '',
        phone: '',
        logo: ''
    });
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState('royal-gold');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewTpl, setPreviewTpl] = useState(null);

    const restaurantId = localStorage.getItem('resId');

    const templates = [
        { id: 'royal-gold', name: 'Royal Gold', color: '#B8860B', bg: 'bg-stone-50', dark: false },
        { id: 'midnight-onyx', name: 'Midnight Onyx', color: '#fbbf24', bg: 'bg-slate-900', dark: true },
        { id: 'rose-quartz', name: 'Rose Gold Luxury', color: '#b76e79', bg: 'bg-rose-50', dark: false },
        { id: 'emerald-palace', name: 'Deep Emerald', color: '#d4af37', bg: 'bg-emerald-950', dark: true },
        { id: 'imperial-purple', name: 'Royal Velvet', color: '#e5e7eb', bg: 'bg-indigo-950', dark: true },
        { id: 'platinum-white', name: 'Platinum Minimal', color: '#4b5563', bg: 'bg-white', dark: false },
        { id: 'burgundy-wine', name: 'Vintage Burgundy', color: '#f3f4f6', bg: 'bg-rose-950', dark: true },
        { id: 'ocean-silk', name: 'Sapphire Silk', color: '#93c5fd', bg: 'bg-blue-950', dark: true },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/download-menu/${restaurantId}`);
                if (response.data.success) {
                    setMenus(response.data.menu);
                    const res = response.data.restaurant;
                    setResInfo({
                        name: res.name || 'Elite Dining',
                        address: res.address || 'Address not found',
                        phone: res.phone || 'Phone not found',
                        logo: res.logo || ''
                    });
                }
                setLoading(false);
            } catch (err) { 
                console.error("Fetch Error:", err);
                setLoading(false); 
            }
        };
        if (restaurantId) fetchData();
    }, [restaurantId]);

    // সংশোধিত ইমেজ কনভার্টার (যা আটকে থাকবে না)
    const getBase64Image = (url) => {
        return new Promise((resolve) => {
            if (!url) return resolve(null);
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous");
            
            // ৫ সেকেন্ডের মধ্যে লোড না হলে বাতিল করবে
            const timeout = setTimeout(() => resolve(null), 5000);

            img.onload = () => {
                clearTimeout(timeout);
                const canvas = document.createElement("canvas");
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(null);
            };
            img.src = url;
        });
    };

    const generatePDF = async (templateId = selectedTemplate) => {
        if (isGenerating) return;
        setIsGenerating(true);
        
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const selected = templates.find(t => t.id === templateId);
            const pColor = selected.color;
            
            const drawLayoutFrame = async (isFirstPage = false) => {
                if(selected.dark) {
                    const bgColors = {
                        'midnight-onyx': [15, 23, 42],
                        'emerald-palace': [6, 40, 31],
                        'imperial-purple': [30, 27, 75],
                        'burgundy-wine': [69, 10, 10],
                        'ocean-silk': [23, 37, 84]
                    };
                    const rgb = bgColors[selected.id] || [15, 23, 42];
                    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                }

                let startY = 20;

                if (isFirstPage && resInfo.logo) {
                    const logoBase64 = await getBase64Image(resInfo.logo);
                    if (logoBase64) {
                        doc.addImage(logoBase64, 'JPEG', (pageWidth/2) - 15, 15, 30, 30);
                        startY = 55; // লোগো থাকলে নাম একটু নিচে নামবে
                    }
                }
                
                doc.setFont("times", "bold"); doc.setFontSize(26);
                doc.setTextColor(selected.dark ? '#FFFFFF' : pColor);
                doc.text(resInfo.name.toUpperCase(), pageWidth/2, startY, { align: 'center' });
                
                doc.setFontSize(9); doc.setFont("helvetica", "normal");
                doc.setTextColor(selected.dark ? '#94a3b8' : '#64748b');
                doc.text(`${resInfo.address}  |  ${resInfo.phone}`, pageWidth/2, startY + 8, { align: 'center' });
                
                doc.setDrawColor(pColor); doc.setLineWidth(0.3);
                doc.line(60, startY + 12, pageWidth - 60, startY + 12);

                doc.setFontSize(8);
                {/*doc.setTextColor(selected.dark ? 'rgba(255,255,255,0.3)' : '#9ca3af');*/}
                doc.setTextColor(selected.dark ? '#6b7280' : '#9ca3af');
                doc.text("Generated by Foodmenu", pageWidth/2, pageHeight - 10, { align: 'center' });
                
                return startY + 25;
            };

            let y = await drawLayoutFrame(true);
            const categories = Object.keys(menus);

            for (const catName of categories) {
                const items = menus[catName];
                
                // নতুন ক্যাটাগরির আগে স্পেস চেক
                if (y > 240) { doc.addPage(); y = await drawLayoutFrame(); }

                doc.setFont("times", "italic"); doc.setFontSize(20);
                doc.setTextColor(pColor);
                doc.text(catName, 20, y);
                y += 12;

                for (const item of items) {
                    if (y > 270) { doc.addPage(); y = await drawLayoutFrame(); }

                    // প্রোডাক্ট ইমেজ ড্রয়িং
                    if (item.image) {
                        const itemImg = await getBase64Image(item.image);
                        if (itemImg) {
                            doc.setDrawColor(pColor);
                            doc.rect(19, y - 7, 12, 12);
                            doc.addImage(itemImg, 'JPEG', 20, y - 6, 10, 10);
                        }
                    }

                    doc.setFontSize(11); doc.setTextColor(selected.dark ? '#FFFFFF' : '#111827');
                    doc.setFont("helvetica", "bold");
                    doc.text(item.name, 35, y);

                    const nameWidth = doc.getTextWidth(item.name);
                    doc.setTextColor(selected.dark ? '#334155' : '#e5e7eb');
                    // ডটেড লাইন
                    for(let dotX = 35 + nameWidth + 4; dotX < 170; dotX += 3) { doc.text(".", dotX, y); }

                    doc.setTextColor(pColor); doc.text(`${item.price} TK`, 190, y, { align: 'right' });
                    y += 14;
                }
                y += 10;
            }

            doc.save(`${resInfo.name.replace(/\s+/g, '_')}_Menu.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Something went wrong while generating PDF.");
        } finally {
            setIsGenerating(false);
            setPreviewTpl(null);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-[#B8860B]" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-8 font-sans mb-20">
            {/* Header */}
            <div className="bg-slate-950 p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center shadow-2xl border-b-[10px] border-[#B8860B] relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    
                    <h6 className="text-2xl font-black text-white italic tracking-tighter uppercase">DOWNLOAD YOUR RESTAURANT MENU</h6>
                    
                </div>
                
                
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                {templates.map((tpl) => (
                    <div 
                        key={tpl.id}
                        onClick={() => setPreviewTpl(tpl)}
                        className="group cursor-pointer rounded-[2.5rem] overflow-hidden border-4 border-transparent hover:border-[#B8860B] transition-all bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2"
                    >
                        <div className={`h-40 ${tpl.bg} flex items-center justify-center relative`}>
                            <Eye className="text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 z-20" size={40} />
                            <div className="absolute inset-0 group-hover:bg-black/30 transition-colors z-10"></div>
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="font-bold text-slate-800 uppercase tracking-tight">{tpl.name}</h3>
                            <div className="w-10 h-1 bg-slate-100 mx-auto mt-2 group-hover:w-20 transition-all" style={{backgroundColor: tpl.color}}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PREVIEW MODAL */}
            {previewTpl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Template Preview</h2>
                            <button onClick={() => setPreviewTpl(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
                        </div>
                        
                        <div className={`p-10 ${previewTpl.bg} min-h-[450px] flex flex-col items-center`}>
                            {resInfo.logo && <img src={resInfo.logo} className="w-16 h-16 object-contain mb-4" alt="logo" />}
                            
                            <h4 className="text-3xl font-black italic text-center" style={{color: previewTpl.dark ? '#fff' : previewTpl.color}}>{resInfo.name}</h4>
                            <p className="text-[10px] opacity-60 mt-1 text-center" style={{color: previewTpl.dark ? '#fff' : '#000'}}>{resInfo.address}</p>
                            
                            <div className="w-full mt-10 space-y-6 flex-1">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex items-center gap-4 opacity-20">
                                        <div className="w-10 h-10 rounded-lg bg-slate-500"></div>
                                        <div className="flex-1 h-3 bg-slate-500 rounded-full"></div>
                                        <div className="w-12 h-3 bg-slate-500 rounded-full"></div>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full mt-10 pt-6 border-t border-black/5">
                                <p className="text-[9px] opacity-40 text-center mb-6 font-bold uppercase tracking-widest" style={{color: previewTpl.dark ? '#fff' : '#000'}}>Generated by Foodmenu</p>
                                <button 
                                    onClick={() => generatePDF(previewTpl.id)}
                                    disabled={isGenerating}
                                    className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
                                    style={{ backgroundColor: previewTpl.color, color: previewTpl.dark && previewTpl.id !== 'royal-gold' ? '#000' : '#fff' }}
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>}
                                    {isGenerating ? 'Drafting...' : 'Export Masterpiece'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DownloadMenuPage;