import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, Scissors,
  ArrowUpRight, Clock, ChevronRight, Sparkles, Star,
  Scan, PlayCircle, Activity
} from 'lucide-react';
import { getAllClients } from '../services/clientStore';
import { useSalon } from '../context/SalonContext';

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const HEADINGS = [
  'Salon Operations Overview',
  'Live Service Intelligence',
  "Today's Active Workflows",
  'AI-Assisted Service Center',
  'Operational Excellence Dashboard',
];

const STATUS_COLORS = {
  'In Progress': '#C9A84C',
  'Active':      '#C9A84C',
  'Pending':     '#B8A48E',
  'AI Processing': '#A0B89A',
  'Completed':   '#4A7055',
};

// Average revenue per visit in INR
const AVG_SERVICE_PRICE = 850;

export default function Dashboard({ onSelectClient, onNavigate }) {
  const { loggedInStylist, sessions, stylistRevenue } = useSalon();
  const [clients, setClients]   = useState([]);
  const [headingIdx, setHeadingIdx] = useState(0);

  useEffect(() => { getAllClients().then(setClients); }, []);

  // Rotate heading every 8 seconds
  useEffect(() => {
    const id = setInterval(() => setHeadingIdx(i => (i + 1) % HEADINGS.length), 8000);
    return () => clearInterval(id);
  }, []);

  // Stylist-specific sessions from shared state
  const stylistSessions = loggedInStylist
    ? (sessions[loggedInStylist.id] || [])
    : [];

  const activeSessions   = stylistSessions.filter(s => s.status !== 'Completed');
  const completedToday   = stylistSessions.filter(s => s.status === 'Completed').length;

  // Client-store derived stats
  const totalVisits      = clients.reduce((s, c) => s + c.visits.length, 0);
  const newClients       = clients.filter(c => c.visits.length === 0).length;

  const today         = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekStr   = thisWeekStart.toISOString().split('T')[0];

  const todayVisits  = clients.reduce((s, c) =>
    s + c.visits.filter(v => v.date === today).length, 0);
  const weekVisits   = clients.reduce((s, c) =>
    s + c.visits.filter(v => v.date >= thisWeekStr).length, 0);
  const sessionRevenue   = loggedInStylist ? (stylistRevenue[loggedInStylist.id] || 0) : 0;
  const weekRevenue      = sessionRevenue > 0 ? sessionRevenue : weekVisits * AVG_SERVICE_PRICE;
  const revenueDisplay   = `₹${weekRevenue.toLocaleString('en-IN')}`;
  const revenueDelta     = sessionRevenue > 0 ? 'From completed services' : 'Estimated';

  const kpis = [
    {
      label: 'Active Sessions',
      value: String(activeSessions.length),
      delta: `${completedToday} completed`,
      icon: Activity,
      color: loggedInStylist?.accentColor || '#C9A84C',
    },
    {
      label: 'Clients',
      value: String(clients.length),
      delta: `${newClients} new`,
      icon: Users,
      color: '#A0B89A',
    },
    {
      label: 'Revenue',
      value: revenueDisplay,
      delta: revenueDelta,
      icon: TrendingUp,
      color: '#C9A84C',
    },
    {
      label: 'Total Visits',
      value: String(totalVisits),
      delta: `${todayVisits} today`,
      icon: Scissors,
      color: '#B8A48E',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="section-label mb-1.5">
            {loggedInStylist ? `${loggedInStylist.name} · ${loggedInStylist.role}` : 'Naturals AI Platform'}
          </p>
          <div className="h-9 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headingIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl font-display text-cream-200 tracking-tight">
                {HEADINGS[headingIdx]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <p className="text-sm text-warm-600 mt-1">
            {activeSessions.length > 0
              ? `${activeSessions.length} active service${activeSessions.length > 1 ? 's' : ''} in progress`
              : "Here's your salon at a glance."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-warm-700">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            <p className="text-2xs text-warm-600">Salon open</p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={fadeUp}
            className="relative overflow-hidden rounded-2xl p-5 group cursor-default transition-all duration-300 hover:shadow-card-hover"
            style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${kpi.color}10 0%, transparent 80%)` }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}14`, border: `1px solid ${kpi.color}20` }}>
                  <kpi.icon size={15} style={{ color: kpi.color }} strokeWidth={1.5} />
                </div>
                <span className="text-2xs font-medium" style={{ color: kpi.color }}>{kpi.delta}</span>
              </div>
              <p className="text-2xl font-semibold text-cream-200 tracking-tight">{kpi.value}</p>
              <p className="text-2xs text-warm-700 mt-0.5 tracking-wide">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Today's Schedule — stylist's active sessions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="lg:col-span-3 rounded-2xl p-6"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-cream-200">Today's Schedule</h2>
              <p className="text-2xs text-warm-700 mt-0.5">
                {stylistSessions.length > 0
                  ? `${stylistSessions.length} session${stylistSessions.length > 1 ? 's' : ''} assigned`
                  : 'No sessions yet'}
              </p>
            </div>
            <button className="text-2xs text-gold hover:text-gold-light transition-base flex items-center gap-1">
              View all <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-1">
            {stylistSessions.length > 0 ? (
              stylistSessions.map((session) => {
                const statusColor = STATUS_COLORS[session.status] || '#B8A48E';
                return (
                  <div key={session.id}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>

                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${statusColor}14`, border: `1px solid ${statusColor}25` }}>
                      <span className="text-2xs font-bold" style={{ color: statusColor }}>
                        {session.clientInitials}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-medium text-cream-300 truncate">{session.clientName}</p>
                      </div>
                      <p className="text-2xs text-warm-700 truncate">{session.service}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-20 shrink-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-2xs text-warm-700">Progress</span>
                        <span className="text-2xs font-medium" style={{ color: statusColor }}>{session.progress}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-warm-900/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${session.progress}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ background: statusColor }} />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xs font-medium" style={{ color: statusColor }}>{session.status}</span>
                      <p className="text-2xs text-warm-700 mt-0.5 flex items-center gap-1 justify-end">
                        <Clock size={9} /> Step {session.currentStep}/{session.totalSteps}
                      </p>
                    </div>

                    <ChevronRight size={13} className="text-warm-800 group-hover:text-gold transition-base" />
                  </div>
                );
              })
            ) : (
              /* Fallback: show clients from store */
              clients.slice(0, 4).map((c, i) => {
                const apt = {
                  ...c,
                  time:    ['10:00 AM', '11:30 AM', '2:00 PM', '3:45 PM'][i],
                  service: c.visits.length > 0 ? c.visits[0].service : 'New Consultation',
                  status:  ['Confirmed', 'Checked In', 'Confirmed', 'Confirmed'][i],
                };
                const isNew = c.visits.length === 0;
                const isVIP = c.visits.length >= 3;
                return (
                  <div key={i} onClick={() => { onSelectClient(apt); onNavigate('analysis', apt); }}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>

                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                      <span className="text-2xs font-bold text-gold">{apt.initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-medium text-cream-300 truncate">{apt.name}</p>
                        {isNew && <span className="badge text-[9px] bg-blue-500/10 text-blue-400" style={{ border: '1px solid rgba(59,130,246,0.15)' }}>New</span>}
                        {isVIP && <span className="badge-gold text-[9px]"><Star size={7} /> VIP</span>}
                      </div>
                      <p className="text-2xs text-warm-700 truncate">{apt.service}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xs text-warm-500 flex items-center gap-1 justify-end">
                        <Clock size={9} /> {apt.time}
                      </p>
                      <span className={`text-2xs font-medium ${apt.status === 'Checked In' ? 'text-sage' : 'text-warm-700'}`}>
                        {apt.status}
                      </span>
                    </div>

                    <ChevronRight size={13} className="text-warm-800 group-hover:text-gold transition-base" />
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">

          {/* AI Insight */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.4 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.07) 0%, #161412 60%)', border: '1px solid rgba(201,168,76,0.14)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)' }}>
                <Sparkles size={11} className="text-gold" />
              </div>
              <p className="section-label-gold">AI Insight</p>
            </div>
            <p className="text-[13px] text-warm-300 leading-relaxed">
              {loggedInStylist
                ? `${loggedInStylist.name}'s specialization in ${loggedInStylist.specialization} is trending. Peak booking window is 2–4 PM — consider prioritizing premium services.`
                : 'Peak booking window is shifting to 2–4 PM. Consider adding a stylist to the afternoon rotation for maximum revenue capture.'}
            </p>
            <button onClick={() => onNavigate('analytics')}
              className="mt-4 flex items-center gap-1 text-2xs text-gold hover:text-gold-light transition-base font-medium">
              View Intelligence <ArrowUpRight size={11} />
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-2xl p-5"
            style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-4">Quick Actions</p>
            <div className="space-y-1">
              {[
                { label: 'Start AI Consultation', target: 'analysis', icon: Scan },
                { label: 'Guided Service Workflow', target: 'service', icon: PlayCircle },
                { label: 'Style AI Preview', target: 'style', icon: Sparkles },
              ].map((a, i) => (
                <button key={i} onClick={() => onNavigate(a.target)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-warm-500 transition-all duration-200 group"
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; e.currentTarget.style.color = '#E8DDD0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ''; }}>
                  <ArrowUpRight size={13} className="text-warm-800 group-hover:text-gold transition-base" />
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
