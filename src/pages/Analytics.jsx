import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { askGemini } from '../services/gemini';
import { useSalon } from '../context/SalonContext';

const revenueData = [
  { day: 'Mon', revenue: 4000 },
  { day: 'Tue', revenue: 3200 },
  { day: 'Wed', revenue: 2100 },
  { day: 'Thu', revenue: 2780 },
  { day: 'Fri', revenue: 5890 },
  { day: 'Sat', revenue: 8390 },
  { day: 'Sun', revenue: 6490 },
];

const serviceData = [
  { name: "Women's Cut",    count: 60 },
  { name: 'Balayage',       count: 45 },
  { name: 'Root Retouch',   count: 30 },
  { name: 'Gloss Treatment',count: 25 },
  { name: 'Extensions',     count: 15 },
];


function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: '#1C1A17', border: '1px solid rgba(201,168,76,0.18)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
      <p className="text-2xs text-warm-700 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-cream-200">₹{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
});

export default function Analytics() {
  const { stylists, stylistRevenue } = useSalon();
  const [projLoading, setProjLoading] = useState(true);
  const [projection, setProjection]   = useState(null);

  useEffect(() => {
    const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const peak = [...revenueData].sort((a, b) => b.revenue - a.revenue)[0];
    const slow = [...revenueData].sort((a, b) => a.revenue - b.revenue)[0];
    const prompt = `You are a salon business analyst. Given this 7-day revenue data (in INR):
${revenueData.map(d => `${d.day}: ₹${d.revenue}`).join(', ')}
Total: ₹${totalRevenue.toLocaleString('en-IN')}. Peak day: ${peak.day} (₹${peak.revenue}). Slowest day: ${slow.day} (₹${slow.revenue}).
In 2 concise sentences, give a projected next-week revenue figure and one specific actionable recommendation to increase it. Be direct, no preamble.`;

    askGemini(prompt).then(text => {
      setProjection(text);
      setProjLoading(false);
    });
  }, []);

  // Compute week-over-week delta from the data
  const weekTotal = revenueData.reduce((s, d) => s + d.revenue, 0);
  const projectedTotal = Math.round(weekTotal * 1.125);

  return (
    <div className="space-y-7">

      {/* Header */}
      <div>
        <p className="section-label mb-1.5">Manager View</p>
        <h1 className="text-2xl font-display text-cream-200 tracking-tight">Intelligence</h1>
        <p className="text-sm text-warm-600 mt-1">Revenue performance and operational analytics.</p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Revenue chart */}
        <motion.div {...fadeUp(0)} className="lg:col-span-3 rounded-2xl p-6"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-cream-200">Weekly Revenue</h2>
              <p className="text-2xs text-warm-700 mt-0.5">7-day performance overview</p>
            </div>
            <span className="badge-success"><TrendingUp size={9} /> +12.5%</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#C9A84C" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" stroke="#52453A" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#7A6452' }} />
                <YAxis stroke="#52453A" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${v / 1000}k`} tick={{ fill: '#7A6452' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.12)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={1.5}
                  fill="url(#revGrad)" dot={false}
                  activeDot={{ r: 3, fill: '#C9A84C', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Projection */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between"
          style={{ background: 'linear-gradient(155deg, rgba(201,168,76,0.06) 0%, #161412 60%)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <div>
            <p className="section-label-gold mb-5">AI Projection</p>
            <p className="text-4xl font-display text-cream-200 tracking-tight mb-1">
              ₹{projectedTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-2xs text-sage font-medium">+12.5% projected next week</p>
          </div>
          <div className="mt-6 rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={11} className="text-gold" />
              <p className="text-2xs font-semibold text-gold tracking-luxury uppercase">AI Recommendation</p>
            </div>
            {projLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={11} className="text-warm-700 animate-spin" />
                <p className="text-2xs text-warm-700">Analysing revenue data…</p>
              </div>
            ) : (
              <p className="text-2xs text-warm-500 leading-relaxed">{projection}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Services */}
        <motion.div {...fadeUp(0.2)} className="rounded-2xl p-6"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-[15px] font-semibold text-cream-200 mb-6">Top Services</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#52453A" fontSize={11}
                  tickLine={false} axisLine={false} width={95} tick={{ fill: '#9A8470' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(201,168,76,0.03)' }}
                  contentStyle={{ backgroundColor: '#1C1A17', border: '1px solid rgba(201,168,76,0.16)', borderRadius: '10px', fontSize: '12px', color: '#F5EDD8' }}
                  itemStyle={{ color: '#C9A84C' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}
                  fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#B8942E" />
                    <stop offset="100%" stopColor="#DFC06A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Staff leaderboard */}
        <motion.div {...fadeUp(0.3)} className="rounded-2xl p-6"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-semibold text-cream-200">Staff Performance</h2>
            <button className="text-2xs text-warm-700 hover:text-warm-400 transition-base">View all</button>
          </div>
          <div className="space-y-2">
            {[...stylists].sort((a, b) => (stylistRevenue[b.id] || 0) - (stylistRevenue[a.id] || 0)).map((s, i) => {
              const rev = stylistRevenue[s.id] || 0;
              const revLabel = rev > 0 ? `₹${rev.toLocaleString('en-IN')}` : '—';
              return (
              <div key={s.id} className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200"
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <span className="text-2xs font-bold text-gold">{s.initials}</span>
                  </div>
                  {i === 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #C9A84C, #DFC06A)' }}>
                      <span className="text-[6px] font-bold text-obsidian">1</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-cream-300 truncate">{s.name}</p>
                  <p className="text-2xs text-warm-700">{s.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold text-gold">{revLabel}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-0.5">
                    <div className="w-14 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, 60 + (stylistRevenue[s.id] || 0) / 100)}%`, background: 'linear-gradient(90deg, #B8942E, #DFC06A)' }} />
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
