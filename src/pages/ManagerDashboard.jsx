import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, Activity, TrendingUp, CheckCircle2, Sparkles,
  LogOut, Bell, Zap, Clock, BarChart3, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

/* ── Revenue spark data ──────────────────────────────────── */
const revenueData = [
  { day: 'Mon', revenue: 4000 },
  { day: 'Tue', revenue: 3200 },
  { day: 'Wed', revenue: 2100 },
  { day: 'Thu', revenue: 2780 },
  { day: 'Fri', revenue: 5890 },
  { day: 'Sat', revenue: 8390 },
  { day: 'Sun', revenue: 6490 },
];

/* ── Dynamic headings ────────────────────────────────────── */
const HEADINGS = [
  'Salon Operations Overview',
  'Live Service Intelligence',
  "Today's Active Workflows",
  'Operational Excellence Dashboard',
];

const STATUS_STYLES = {
  'In Progress':   { color: '#C9A84C', bg: 'rgba(201,168,76,0.10)',  border: 'rgba(201,168,76,0.20)'  },
  'Active':        { color: '#C9A84C', bg: 'rgba(201,168,76,0.10)',  border: 'rgba(201,168,76,0.20)'  },
  'AI Processing': { color: '#7BA7BC', bg: 'rgba(123,167,188,0.10)', border: 'rgba(123,167,188,0.20)' },
  'Pending':       { color: '#9A8470', bg: 'rgba(154,132,112,0.08)', border: 'rgba(154,132,112,0.15)' },
  'Completed':     { color: '#4A7055', bg: 'rgba(74,112,85,0.10)',   border: 'rgba(74,112,85,0.20)'   },
  'Waiting':       { color: '#9A8470', bg: 'rgba(154,132,112,0.08)', border: 'rgba(154,132,112,0.15)' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Pending'];
  return (
    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-lg"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}10 0%, transparent 80%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}14`, border: `1px solid ${color}20` }}>
            <Icon size={15} style={{ color }} strokeWidth={1.5} />
          </div>
          <span className="text-2xs font-medium" style={{ color }}>{sub}</span>
        </div>
        <p className="text-2xl font-semibold text-cream-200 tracking-tight">{value}</p>
        <p className="text-2xs text-warm-700 mt-0.5 tracking-wide">{label}</p>
      </div>
    </motion.div>
  );
}

function StylistWorkloadCard({ stylist, stylistSessions, revenue = 0, delay = 0 }) {
  const active = stylistSessions.filter(s => s.status !== 'Completed');
  const done   = stylistSessions.filter(s => s.status === 'Completed').length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 h-full"
      style={{ background: '#161412', border: `1px solid ${stylist.accentColor}18` }}>

      {/* Stylist header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold"
            style={{
              background: `linear-gradient(135deg, ${stylist.accentColor}28, ${stylist.accentColor}0A)`,
              border: `2px solid ${stylist.accentColor}40`,
              color: stylist.accentColor,
            }}>
            {stylist.initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-obsidian"
            style={{ background: '#4A7055' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-cream-200">{stylist.name}</p>
          <p className="text-2xs text-warm-700 truncate">{stylist.specialization}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] font-semibold" style={{ color: stylist.accentColor }}>{active.length} active</p>
          <p className="text-2xs text-warm-700">{done} done{revenue > 0 ? ` · ₹${revenue.toLocaleString('en-IN')}` : ''}</p>
        </div>
      </div>

      {/* Session list */}
      <div className="space-y-2">
        {active.length === 0 ? (
          <div className="py-4 text-center">
            <CheckCircle2 size={16} className="text-sage mx-auto mb-1.5" />
            <p className="text-2xs text-warm-700">All services complete</p>
          </div>
        ) : (
          active.map(sess => (
            <div key={sess.id} className="rounded-xl px-3.5 py-3"
              style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: `${stylist.accentColor}18`, color: stylist.accentColor }}>
                    {sess.clientInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-cream-300 truncate">{sess.clientName}</p>
                    <p className="text-2xs text-warm-700 truncate">{sess.service}</p>
                  </div>
                </div>
                <StatusBadge status={sess.status} />
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${sess.progress}%` }}
                    transition={{ duration: 0.8, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${stylist.accentColor}80, ${stylist.accentColor})` }}
                  />
                </div>
                <span className="text-2xs text-warm-700 font-mono tabular-nums shrink-0">{sess.progress}%</span>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[9px] text-warm-800">
                  Step {sess.currentStep}/{sess.totalSteps} · {sess.stepName}
                </p>
                <p className="text-[9px] text-warm-800 flex items-center gap-1">
                  <Clock size={8} /> {sess.startTime}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

const TYPE_COLORS = {
  service: '#C9A84C',
  step:    '#A0B89A',
  ai:      '#7BA7BC',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: '#1C1A17', border: '1px solid rgba(201,168,76,0.18)' }}>
      <p className="text-2xs text-warm-700 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-cream-200">₹{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { stylists, sessions, activityLog, getKPIs, setManagerLoggedIn, managerLoggedIn, stylistRevenue } = useSalon();
  const [headingIdx, setHeadingIdx] = useState(0);

  // Guard
  useEffect(() => {
    if (!managerLoggedIn) navigate('/manager');
  }, [managerLoggedIn, navigate]);

  // Rotate headings every 8s
  useEffect(() => {
    const t = setInterval(() => setHeadingIdx(i => (i + 1) % HEADINGS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const kpis = getKPIs();

  const handleLogout = () => {
    setManagerLoggedIn(false);
    navigate('/');
  };

  const kpiCards = [
    { icon: Users,      label: 'Active Clients',      value: String(kpis.totalActive),    sub: `${kpis.activeStylists} stylists`, color: '#C9A84C' },
    { icon: Activity,   label: 'Services Running',     value: String(kpis.liveServices),   sub: 'Live now',                        color: '#7BA7BC' },
    { icon: TrendingUp, label: 'Avg. Workflow Progress', value: `${kpis.avgProgress}%`,    sub: 'Across all',                      color: '#A0B89A' },
    { icon: CheckCircle2, label: 'Completed Today',    value: String(kpis.totalCompleted), sub: 'Sessions',                        color: '#4A7055' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0D0C0A' }}>

      {/* Top bar */}
      <header className="sticky top-0 z-30 h-[60px] flex items-center justify-between px-8"
        style={{ background: 'rgba(13,12,10,0.90)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #DFC06A)', boxShadow: '0 2px 10px rgba(201,168,76,0.25)' }}>
            <Sparkles size={13} className="text-obsidian" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[14px] font-display text-cream-200 tracking-tight">Naturals</span>
            <span className="text-[14px] font-display text-gold tracking-tight">AI</span>
          </div>
          <div className="w-px h-4 mx-2" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-[11px] font-bold tracking-luxury text-sage uppercase">Manager Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warm-900/40 transition-base">
            <Bell size={15} className="text-warm-600" />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold" />
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-2xs text-warm-700 hover:text-warm-400 transition-base px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-7">

        {/* Page heading — animated rotation */}
        <div className="flex items-end justify-between">
          <div>
            <p className="section-label mb-1.5">Manager View · Live</p>
            <div className="h-9 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={headingIdx}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-2xl font-display text-cream-200 tracking-tight">
                  {HEADINGS[headingIdx]}
                </motion.h1>
              </AnimatePresence>
            </div>
            <p className="text-sm text-warm-600 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            <p className="text-2xs text-warm-600">Live · Auto-refreshing</p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiCards.map((k, i) => (
            <KpiCard key={k.label} {...k} delay={i * 0.07} />
          ))}
        </div>

        {/* Main grid: Stylist workload + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Stylist workload cards — 3 cols */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {stylists.map((stylist, i) => (
              <StylistWorkloadCard
                key={stylist.id}
                stylist={stylist}
                stylistSessions={sessions[stylist.id] || []}
                revenue={stylistRevenue[stylist.id] || 0}
                delay={0.15 + i * 0.1}
              />
            ))}
          </div>

          {/* Live activity feed — 2 cols */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={13} className="text-gold" />
              <p className="text-[14px] font-semibold text-cream-200">Live Activity</p>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {activityLog.map(item => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: TYPE_COLORS[item.type] || '#C9A84C' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-cream-300">
                        <span className="font-semibold" style={{ color: TYPE_COLORS[item.type] || '#C9A84C' }}>
                          {item.stylist}
                        </span>
                        {' '}{item.text}
                      </p>
                    </div>
                    <span className="text-[9px] text-warm-800 font-mono shrink-0">{item.time}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Bottom row: Revenue + SOP compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Revenue sparkline */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="lg:col-span-3 rounded-2xl p-6"
            style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-cream-200">Weekly Revenue</h2>
                <p className="text-2xs text-warm-700 mt-0.5">7-day performance</p>
              </div>
              <button onClick={() => navigate('/analytics')}
                className="flex items-center gap-1 text-2xs text-gold hover:text-gold-light transition-base">
                Full analytics <ArrowUpRight size={10} />
              </button>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mgRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#C9A84C" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" stroke="#52453A" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#7A6452' }} />
                  <YAxis stroke="#52453A" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={v => `₹${v / 1000}k`} tick={{ fill: '#7A6452' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.12)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={1.5}
                    fill="url(#mgRevGrad)" dot={false} activeDot={{ r: 3, fill: '#C9A84C', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* SOP Compliance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="lg:col-span-2 rounded-2xl p-6 space-y-4"
            style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <BarChart3 size={13} className="text-warm-600" />
              <h2 className="text-[14px] font-semibold text-cream-200">SOP Compliance</h2>
            </div>
            {stylists.map((stylist, i) => {
              const stylistSessions = sessions[stylist.id] || [];
              const completed = stylistSessions.filter(s => s.status === 'Completed').length;
              const compliance = stylistSessions.length
                ? Math.round(((completed + stylistSessions.filter(s => s.progress > 50).length * 0.5) / stylistSessions.length) * 100)
                : 100;
              return (
                <motion.div key={stylist.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08, duration: 0.35 }}
                  className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ background: `${stylist.accentColor}18`, color: stylist.accentColor }}>
                        {stylist.initials}
                      </div>
                      <span className="text-[12px] text-cream-300">{stylist.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {compliance < 60 && <AlertTriangle size={10} className="text-ruby" />}
                      <span className="text-[12px] font-semibold" style={{ color: stylist.accentColor }}>{compliance}%</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${compliance}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${stylist.accentColor}80, ${stylist.accentColor})` }}
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* AI Insight */}
            <div className="mt-3 rounded-xl px-3.5 py-3"
              style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.10)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={10} className="text-gold" />
                <p className="text-[9px] font-bold tracking-luxury text-gold uppercase">AI Note</p>
              </div>
              <p className="text-2xs text-warm-600 leading-relaxed">
                All stylists maintaining strong SOP adherence. Priya leading with 3 completions today.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
