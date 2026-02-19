import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Package, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; 

const GraphReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGraphData = async() =>{
    const restaurantId = localStorage.getItem('resId');
    if (!restaurantId) {
      toast.error("Please login first!");
      return;
    }
    setLoading(true);
    try{
      const response = await axios.get(`http://localhost:5000/api/reports/graph`,{
        params: { resId: restaurantId}
      });
      setData(response.data);
      if(response.data.length > 0) {
        toast.success("Graph data synced!");
      }
    }catch(error){
      console.error("Fetch error:", error);
      toast.error("Failed to fetch graph data");
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  //Calculation 
  const summary = useMemo(() => {
    return data.reduce((acc, curr) => ({
      totalEarning: acc.totalEarning + curr.earning,
      totalDue: acc.totalDue + curr.due,
      totalQty: acc.totalQty + curr.qty
    }), { totalEarning: 0, totalDue: 0, totalQty: 0 });
  }, [data]);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Analytics Report</h1>
            <p className="text-slate-500 font-medium">Visual representation of your business performance</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-all text-slate-600 font-bold">
            <Calendar size={18} /> Last 6 Months
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Total Earning (Big Chart) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg inline-block mb-2">
                  <DollarSign size={24} />
                </span>
                <h3 className="text-xl font-bold text-slate-700">Total Earnings</h3>
                <h2 className="text-4xl font-black text-slate-900 mt-1">৳{summary.totalEarning.toLocaleString()}</h2>
              </div>
              <div className="text-right">
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <TrendingUp size={16} /> +12.5%
                </span>
                <p className="text-slate-400 text-xs">vs last month</p>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="earning" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarning)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Quantity & Due (Small Charts in one column but stacked) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Total Quantity Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Quantity</p>
                  <h3 className="text-2xl font-black text-slate-800">{summary.totalQty.toLocaleString()}</h3>
                </div>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <Bar dataKey="qty" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Due Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-rose-100 text-rose-600 p-3 rounded-xl">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Due</p>
                  <h3 className="text-2xl font-black text-rose-600">৳{summary.totalDue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <Area type="step" dataKey="due" stroke="#e11d48" fill="#fff1f2" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Comparison Table (Lower Row) */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Monthly Performance Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 font-bold text-slate-600">Month</th>
                  <th className="p-4 font-bold text-slate-600">Earning</th>
                  <th className="p-4 font-bold text-slate-600">Quantity Sold</th>
                  <th className="p-4 font-bold text-slate-600">Due Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{row.name}</td>
                    <td className="p-4 text-emerald-600 font-bold">৳{row.earning}</td>
                    <td className="p-4 text-slate-600">{row.qty} Units</td>
                    <td className="p-4 text-rose-500 font-semibold">৳{row.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphReport;