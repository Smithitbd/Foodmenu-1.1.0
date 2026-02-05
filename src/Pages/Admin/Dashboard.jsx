import React from 'react';
import { Store, TrendingUp, ShoppingCart, CreditCard, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const graphData = [
    { date: "2023-09-16", earning: 650 },
    { date: "2023-09-17", earning: 800 },
    { date: "2023-09-20", earning: 750 },
    { date: "2024-10-08", earning: 950 },
  ];

  const orders = [
    { id: 1, name: "Golden Fork Cafe & Restaurant", date: "2024-10-08", total: 0, due: "None", status: "Cash" },
    { id: 2, name: "Sinbad Restaurant", date: "2024-08-13", total: 0, due: "None", status: "Cash" },
    { id: 3, name: "Chef Master", date: "2024-07-18", total: 0, due: "None", status: "Cash" },
    { id: 4, name: "Delhi Darbar", date: "2024-06-24", total: 0, due: "None", status: "Cash" },
    { id: 5, name: "The Steak Blast", date: "2024-05-19", total: 0, due: "None", status: "Cash" },
  ];

  const stats = [
    { label: "Total Restaurant Add", value: "36", color: "from-sky-500 to-cyan-400", icon: <Store size={72} /> },
    { label: "Total Revenue", value: "৳ 2,590.00", color: "from-emerald-500 to-teal-400", icon: <TrendingUp size={72} /> },
    { label: "Total Restaurant", value: "38", color: "from-amber-400 to-yellow-300", icon: <ShoppingCart size={72} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 space-y-8 font-sans">

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl p-6 shadow-md bg-gradient-to-br ${stat.color} text-white transition hover:shadow-xl`}
          >
            <div className="relative z-10">
              <h3 className="text-4xl font-extrabold tracking-tight">{stat.value}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest opacity-90">
                {stat.label}
              </p>
            </div>

            <div className="absolute right-4 top-4 opacity-20">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* GRAPH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-sm font-extrabold tracking-widest uppercase text-slate-600">
            Earning by Date
          </h3>
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
            Live
          </span>
        </div>

        <div className="h-[320px] p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fontWeight: 700 }} />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />
              <Bar dataKey="earning" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-sm font-extrabold tracking-widest uppercase text-slate-600">
            Recent Orders
          </h3>
          <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">
            View all <ArrowRight size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-[10px] uppercase tracking-[2px] font-black text-slate-400">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4">Due</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y text-sm">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-400">#00{order.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800 hover:text-red-600">
                    {order.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{order.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white">
                      ৳ {order.total}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                    {order.due}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-white">
                      <CreditCard size={12} />
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
