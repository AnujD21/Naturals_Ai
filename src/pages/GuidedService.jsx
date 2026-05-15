import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beaker, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Play, Pause, RotateCcw, Shield, UserPlus, PartyPopper, ChevronDown
} from 'lucide-react';
import { addVisit } from '../services/clientStore';
import { ClientHistoryPanel } from '../components/ClientSelector';
import { useSalon } from '../context/SalonContext';
import { getServicePrice, formatPrice } from '../services/pricing';

/* ── Per-category workflow steps ────────────────────────── */
const WORKFLOW_STEPS = {
  Color: [
    {
      id: 1, title: 'Consultation',
      desc: 'Confirm patch test result and desired shade. Review color history and any known sensitivities.',
      product: 'Client Record',
      safety: 'Verify no PPD or ammonia allergy. Perform a strand test if significant change is planned.',
    },
    {
      id: 2, title: 'Mixing',
      desc: 'Weigh 60g colorant + 60g developer (1:1 ratio) in a non-metallic bowl. Stir until fully combined.',
      product: "L'Oréal Professional iNOA / Wella Illumina",
      safety: 'Wear nitrile gloves. Never use metallic tools — they oxidise the formula.',
    },
    {
      id: 3, title: 'Application',
      desc: 'Section into 4 quadrants. Apply ½ inch from roots using a tint brush, working through mid-lengths.',
      product: 'Tint Brush, Bowl & Section Clips',
      safety: 'Check for scalp redness or irritation before proceeding to full application.',
    },
    {
      id: 4, title: 'Processing',
      desc: 'Allow color to develop at room temperature. Do not apply heat unless the formula specifies.',
      product: 'Timer (set above)',
      safety: 'Check development every 10 min. Remove immediately if client reports burning.',
    },
  ],

  Bleach: [
    {
      id: 1, title: 'Consultation',
      desc: 'Assess hair history — previous color, heat damage, porosity. Confirm lift goal and set realistic expectations with the client.',
      product: 'Client Record + Strand Test',
      safety: 'Never bleach over relaxed, heavily damaged, or recently colored hair without a full assessment.',
    },
    {
      id: 2, title: 'Preparation',
      desc: 'Section hair into 4 quadrants. Add Olaplex No.1 to the bleach mix. Apply barrier cream along the hairline.',
      product: 'Olaplex No.1 / FIBREPLEX + Barrier Cream',
      safety: 'Work on dry, unwashed hair — natural oils protect the scalp during lift.',
    },
    {
      id: 3, title: 'Application',
      desc: 'Apply bleach 1 inch from scalp first (scalp heat lifts faster). Work in thin, even ¼-inch sections throughout.',
      product: 'Bleach Powder + Developer (20–30 Vol)',
      safety: 'Never overlap onto previously lightened hair. Roots only on touch-up services.',
    },
    {
      id: 4, title: 'Processing',
      desc: 'Monitor lift level every 10 minutes. Watch for even development — adjust foil tension or add heat if sections lag.',
      product: 'Timer (set above)',
      safety: 'Maximum 50 minutes total. Remove immediately if scalp burning, excessive redness, or breakage is observed.',
    },
    {
      id: 5, title: 'Rinse & Tone',
      desc: 'Rinse thoroughly with cool water. Apply Olaplex No.2 for 10 min, then shampoo. Follow with toner to neutralise brassiness if needed.',
      product: 'Olaplex No.2 + Toner (Wella T18 / Redken Shades EQ)',
      safety: 'Always apply Olaplex No.2 before shampooing. Use cool water to seal the cuticle and lock in the tone.',
    },
  ],

  Treatment: [
    {
      id: 1, title: 'Consultation',
      desc: "Assess damage level and select the appropriate treatment. Confirm the client's treatment goal and any protein sensitivity.",
      product: 'Client Record',
      safety: 'Avoid over-proteinising fine or low-porosity hair — it causes brittleness. Ask about prior treatments.',
    },
    {
      id: 2, title: 'Cleanse',
      desc: 'Shampoo twice with a clarifying or sulfate shampoo to open the cuticle and remove all buildup and silicones.',
      product: 'Clarifying Shampoo (no conditioner)',
      safety: 'Do not apply conditioner before the treatment — it blocks absorption and reduces efficacy.',
    },
    {
      id: 3, title: 'Application',
      desc: 'Apply treatment to towel-dried hair in sections from root to tip. Ensure full, even saturation throughout.',
      product: 'Selected Treatment (K18 / Olaplex No.2 / Deep Mask / Keratin)',
      safety: 'Use the recommended amount — excess protein treatment can cause hair to become stiff and prone to breakage.',
    },
    {
      id: 4, title: 'Processing',
      desc: 'Leave the treatment on for the prescribed duration. Apply gentle heat (if specified by the product manufacturer).',
      product: 'Timer (set above)',
      safety: "Do not exceed the manufacturer's maximum processing time. K18 is 4 min — do not rinse prematurely.",
    },
  ],

  Other: [
    {
      id: 1, title: 'Consultation',
      desc: 'Discuss the service goal with the client. Confirm scalp health, any skin conditions, or contraindications to the service.',
      product: 'Client Record',
      safety: 'Check for active scalp conditions (psoriasis, open wounds, dermatitis) that may contraindicate heat or product application.',
    },
    {
      id: 2, title: 'Preparation',
      desc: 'Set up the workstation with all required tools and products. Section hair as needed for the selected service.',
      product: 'Service-specific tools',
      safety: 'Sanitize all tools before use. Drape the client with a clean protective cape.',
    },
    {
      id: 3, title: 'Application',
      desc: 'Apply the selected product or begin the service following the manufacturer or training guidelines precisely.',
      product: 'Selected Product',
      safety: 'Follow the recommended application method. Avoid contact with eyes, ears, and open skin.',
    },
    {
      id: 4, title: 'Processing',
      desc: 'Allow the service to take effect for the selected duration. Check in with the client regularly for comfort.',
      product: 'Timer (set above)',
      safety: 'Do not leave the client unattended during heat or chemical services.',
    },
  ],
};

/* ── Timer presets by service category ─────────────────── */
const TIMER_PRESETS = [
  {
    category: 'Color',
    color: '#C9A84C',
    items: [
      { label: 'Toner / Gloss',   seconds: 900,  note: '15 min' },
      { label: 'Root Retouch',    seconds: 1500, note: '25 min' },
      { label: 'Full Color',      seconds: 2100, note: '35 min' },
      { label: 'Resistant Grey',  seconds: 2700, note: '45 min' },
    ],
  },
  {
    category: 'Bleach',
    color: '#DFC06A',
    items: [
      { label: 'Foil Highlights', seconds: 2400, note: '40 min' },
      { label: 'Full Bleach',     seconds: 2700, note: '45 min' },
      { label: 'Max Lift',        seconds: 3000, note: '50 min' },
    ],
  },
  {
    category: 'Treatment',
    color: '#A0B89A',
    items: [
      { label: 'K18',                  seconds: 240,  note: '4 min'  },
      { label: 'Olaplex No. 2',        seconds: 1200, note: '20 min' },
      { label: 'Deep Mask',            seconds: 1200, note: '20 min' },
      { label: 'Keratin / Smoothing',  seconds: 1800, note: '30 min' },
    ],
  },
  {
    category: 'Other',
    color: '#7BA7BC',
    items: [
      { label: 'Scalp Treatment', seconds: 600,  note: '10 min' },
      { label: 'Steam',           seconds: 900,  note: '15 min' },
      { label: 'Custom 5 min',    seconds: 300,  note: '5 min'  },
      { label: 'Custom 60 min',   seconds: 3600, note: '60 min' },
    ],
  },
];

/* ── Timer hook ─────────────────────────────────────────── */
function useTimer(durationSecs) {
  const [seconds, setSeconds] = useState(durationSecs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(durationSecs);
  }, [durationSecs]);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      if (seconds === 0 && running) setRunning(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, seconds]);

  const toggle = () => setRunning(r => !r);
  const reset  = () => { clearInterval(intervalRef.current); setRunning(false); setSeconds(durationSecs); };
  const fmt    = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const pct    = durationSecs > 0 ? ((durationSecs - seconds) / durationSecs) * 100 : 0;

  return { seconds, running, toggle, reset, formatted: fmt, progress: pct, done: seconds === 0 };
}

const DEFAULT_CATEGORY = 'Color';
const DEFAULT_PRESET   = TIMER_PRESETS[0].items[2]; // Full Color — 35 min

export default function GuidedService({ selectedClient, onSelectClient }) {
  const [activeCategory, setActiveCategory]   = useState(DEFAULT_CATEGORY);
  const [activePreset, setActivePreset]       = useState(DEFAULT_PRESET);
  const [showPresets, setShowPresets]         = useState(false);
  const [current, setCurrent]                 = useState(0);
  const [completed, setCompleted]             = useState(new Set());
  const [serviceComplete, setServiceComplete] = useState(false);
  const [earnedPrice, setEarnedPrice]         = useState(0);
  const [flashCategory, setFlashCategory]     = useState(false);
  const [auditLog, setAuditLog]               = useState([
    { text: 'Workflow initialized — Color', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) },
  ]);

  const { loggedInStylist, addRevenue, logActivity } = useSalon();

  const timer     = useTimer(activePreset.seconds);
  const steps     = WORKFLOW_STEPS[activeCategory];
  const step      = steps[current];
  const isLast    = current === steps.length - 1;
  const catMeta   = TIMER_PRESETS.find(p => p.category === activeCategory);
  const catColor  = catMeta?.color ?? '#C9A84C';

  const logEvent = useCallback((text) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setAuditLog(prev => [...prev, { text, time }]);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      logEvent(`Client: ${selectedClient.name}`);
      if (selectedClient.preferences?.allergies && !['None known', 'None'].includes(selectedClient.preferences.allergies)) {
        logEvent(`⚠ Allergy: ${selectedClient.preferences.allergies}`);
      }
    }
  }, [selectedClient, logEvent]);

  const selectPreset = (preset, group) => {
    const categoryChanged = group.category !== activeCategory;
    setActivePreset(preset);
    setShowPresets(false);
    logEvent(`Timer: ${preset.label} (${preset.note})`);

    if (categoryChanged) {
      setActiveCategory(group.category);
      setCurrent(0);
      setCompleted(new Set());
      logEvent(`↺ Workflow switched to ${group.category}`);
      // brief flash to signal the workflow changed
      setFlashCategory(true);
      setTimeout(() => setFlashCategory(false), 900);
    }
  };

  const completeStep = useCallback(() => {
    setCompleted(prev => new Set(prev).add(current));
    logEvent(`Step ${current + 1} complete: ${steps[current].title}`);
    if (!isLast) setCurrent(c => c + 1);
  }, [current, isLast, steps, logEvent]);

  const finalizeService = useCallback(() => {
    setCompleted(prev => new Set(prev).add(current));
    logEvent('Service finalized');
    const stylistName = loggedInStylist?.name || 'Stylist';
    if (selectedClient) {
      addVisit(selectedClient.id, {
        service: `${activeCategory} — ${activePreset.label}`,
        stylist: stylistName,
        notes: `${activePreset.label}, ${activePreset.note}`,
      });
      logEvent(`Visit saved to ${selectedClient.name}'s profile`);
    }
    const price = getServicePrice(`${activeCategory} — ${activePreset.label}`, activeCategory);
    setEarnedPrice(price);
    if (loggedInStylist?.id) addRevenue(loggedInStylist.id, price);
    logActivity(stylistName, `completed ${activePreset.label} — ${formatPrice(price)} earned`, 'service');
    setServiceComplete(true);
  }, [current, selectedClient, activeCategory, activePreset, logEvent, loggedInStylist, addRevenue, logActivity]);

  const resetWorkflow = () => {
    setCurrent(0); setCompleted(new Set()); setServiceComplete(false); setEarnedPrice(0); timer.reset();
    setAuditLog([{ text: `Workflow restarted — ${activeCategory}`, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }]);
  };

  const circumference = 2 * Math.PI * 42;

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1.5">Guided Service</p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display text-cream-200 tracking-tight">Active Workflow</h1>
            {/* Category badge — flashes gold on workflow switch */}
            <AnimatePresence mode="wait">
              <motion.span
                key={activeCategory}
                initial={{ opacity: 0, scale: 0.85, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-lg uppercase"
                style={{
                  background: flashCategory ? `${catColor}22` : `${catColor}14`,
                  border: `1px solid ${flashCategory ? catColor : catColor + '30'}`,
                  color: catColor,
                  boxShadow: flashCategory ? `0 0 12px ${catColor}40` : 'none',
                  transition: 'box-shadow 0.4s, border-color 0.4s',
                }}>
                {activeCategory}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-sm text-warm-600 mt-1">
            {selectedClient ? (
              <>Client: <span className="text-cream-300 font-medium">{selectedClient.name}</span>
                <span className="mx-2 text-warm-800">·</span>
                {selectedClient.visits.length === 0
                  ? <span className="text-blue-400 text-xs">New Customer</span>
                  : <span className="text-warm-500 text-xs">{activePreset.label}</span>}
              </>
            ) : (
              <button onClick={onSelectClient} className="text-gold hover:text-gold-light transition-base underline underline-offset-2">
                Select a client to begin
              </button>
            )}
          </p>
        </div>

        {/* Step progress — color matches active category */}
        <div className="flex items-center gap-1.5">
          {serviceComplete ? (
            <span className="badge-success"><CheckCircle2 size={9} /> Complete</span>
          ) : (
            steps.map((_, i) => (
              <motion.div
                key={`${activeCategory}-${i}`}
                layout
                className="h-1 rounded-full"
                animate={{
                  width: completed.has(i) ? 24 : i === current ? 32 : 12,
                  background: completed.has(i) ? '#4A7055' : i === current ? catColor : 'rgba(255,255,255,0.08)',
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            ))
          )}
        </div>
      </div>

      {/* Service Complete */}
      {serviceComplete ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(74,112,85,0.06) 0%, #161412 70%)', border: '1px solid rgba(74,112,85,0.20)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(74,112,85,0.12)', border: '1px solid rgba(74,112,85,0.25)' }}>
            <PartyPopper size={26} className="text-sage" />
          </div>
          <h2 className="text-2xl font-display text-cream-200 mb-2">Service Complete</h2>
          <p className="text-sm text-warm-500 max-w-md mx-auto mb-4 leading-relaxed">
            {selectedClient
              ? `${selectedClient.name}'s ${activePreset.label} service has been completed and saved to their profile.`
              : `The ${activePreset.label} workflow has been completed successfully.`}
          </p>
          {earnedPrice > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-7"
              style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <span className="text-warm-600 text-sm">Revenue earned</span>
              <span className="text-gold font-semibold text-base">{formatPrice(earnedPrice)}</span>
            </div>
          )}
          <div className={earnedPrice > 0 ? '' : 'mt-7'}>
            <button onClick={resetWorkflow} className="btn-ghost">
              <RotateCcw size={13} /> New Service
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Step content */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${current}`}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{    opacity: 0, x: -20, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{
                  background: '#161412',
                  border: `1px solid ${catColor}22`,
                }}>

                {/* Subtle category-colored ambient top glow */}
                <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${catColor}0D 0%, transparent 80%)` }} />

                {/* Step label */}
                <div className="relative z-10 flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold"
                    style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}BB)`, color: '#0D0C0A' }}>
                    {step.id}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-cream-200">{step.title}</p>
                    <p className="text-2xs text-warm-700">Step {step.id} of {steps.length} · {activeCategory}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-lg uppercase"
                      style={{ background: `${catColor}14`, border: `1px solid ${catColor}30`, color: catColor }}>
                      Active
                    </span>
                  </div>
                </div>

                {/* Category-colored divider */}
                <div className="relative z-10 h-px mb-6" style={{ background: `linear-gradient(90deg, ${catColor}40, transparent)` }} />

                <p className="relative z-10 text-[15px] text-warm-300 leading-relaxed mb-7">{step.desc}</p>

                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="rounded-xl px-4 py-3.5" style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Beaker size={12} className="text-warm-600" />
                      <p className="section-label">Required</p>
                    </div>
                    <p className="text-[13px] text-cream-300">{step.product}</p>
                  </div>
                  <div className="rounded-xl px-4 py-3.5"
                    style={{ background: 'rgba(155,59,59,0.05)', border: '1px solid rgba(155,59,59,0.15)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield size={12} className="text-ruby" />
                      <p className="section-label" style={{ color: '#9B3B3B' }}>Safety</p>
                    </div>
                    <p className="text-[13px] text-warm-400">{step.safety}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}
                className="btn-ghost disabled:opacity-0 disabled:pointer-events-none">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={isLast ? finalizeService : completeStep} className="btn-gold">
                {isLast ? 'Finalise Service' : 'Complete Step'} <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {selectedClient
              ? <ClientHistoryPanel client={selectedClient} />
              : (
                <div className="rounded-2xl p-6 text-center"
                  style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <UserPlus size={20} className="text-warm-800 mx-auto mb-2" />
                  <p className="text-2xs text-warm-700">No client selected</p>
                  <button onClick={onSelectClient} className="mt-2 text-2xs text-gold hover:text-gold-light transition-base">
                    Select client
                  </button>
                </div>
              )
            }

            {/* Timer */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#161412', border: `1px solid ${catColor}18` }}>

              {/* Preset selector toggle */}
              <button
                onClick={() => setShowPresets(s => !s)}
                className="w-full flex items-center justify-between px-5 pt-5 pb-3"
              >
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-warm-700" />
                  <p className="section-label">Process Timer</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs font-medium px-2 py-0.5 rounded-lg"
                    style={{ background: `${catColor}12`, border: `1px solid ${catColor}28`, color: catColor }}>
                    {activePreset.label}
                  </span>
                  <ChevronDown size={12} className={`text-warm-700 transition-transform duration-200 ${showPresets ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Preset dropdown */}
              <AnimatePresence>
                {showPresets && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {TIMER_PRESETS.map(group => (
                        <div key={group.category}>
                          <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5 px-1"
                            style={{ color: group.color }}>
                            {group.category}
                            {group.category === activeCategory && (
                              <span className="ml-1.5 normal-case tracking-normal font-normal opacity-60">— active</span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map(preset => {
                              const isActive = activePreset.label === preset.label && activePreset.seconds === preset.seconds;
                              return (
                                <button
                                  key={preset.label}
                                  onClick={() => selectPreset(preset, group)}
                                  className="flex flex-col items-start px-2.5 py-1.5 rounded-lg transition-all duration-150 text-left"
                                  style={isActive ? {
                                    background: `${group.color}16`,
                                    border: `1px solid ${group.color}35`,
                                  } : {
                                    background: '#1C1A17',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                  }}
                                >
                                  <span className="text-[11px] font-medium leading-none"
                                    style={{ color: isActive ? group.color : '#9A8470' }}>
                                    {preset.label}
                                  </span>
                                  <span className="text-[9px] mt-0.5" style={{ color: isActive ? group.color : '#52453A' }}>
                                    {preset.note}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clock face */}
              <div className="flex flex-col items-center px-6 pb-6 pt-3">
                <div className="relative w-32 h-32 mb-5">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={timer.done ? '#4A7055' : timer.running ? catColor : `${catColor}40`}
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - timer.progress / 100)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-semibold font-mono tabular-nums tracking-tight ${timer.done ? 'text-sage' : 'text-cream-200'}`}>
                      {timer.formatted}
                    </span>
                    <span className="text-[9px] mt-0.5 text-warm-700">{activePreset.note}</span>
                    {timer.done && <span className="text-2xs text-sage">Done!</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={timer.toggle} disabled={timer.done}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                      timer.done ? 'cursor-default text-sage' : 'hover:opacity-90'
                    }`}
                    style={timer.done
                      ? { background: 'rgba(74,112,85,0.12)', border: '1px solid rgba(74,112,85,0.20)' }
                      : timer.running
                        ? { background: '#1C1A17', border: '1px solid rgba(255,255,255,0.08)', color: '#E8DDD0' }
                        : { background: `linear-gradient(135deg, ${catColor}, ${catColor}BB)`, color: '#0D0C0A', border: 'none' }
                    }>
                    {timer.done ? <><CheckCircle2 size={12} /> Done</> :
                     timer.running ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start</>}
                  </button>
                  <button onClick={() => { timer.reset(); logEvent(`Timer reset: ${activePreset.label}`); }}
                    className="p-1.5 rounded-lg text-warm-700 hover:text-warm-400 transition-base"
                    aria-label="Reset timer">
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Audit log */}
            <div className="rounded-2xl p-5" style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="section-label mb-3.5">Audit Log</p>
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                {auditLog.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                        style={{ background: item.text.startsWith('↺') ? catColor : item.text.startsWith('⚠') ? '#9B3B3B' : '#C9A84C' }} />
                      <span className="text-2xs text-warm-500">{item.text}</span>
                    </div>
                    <span className="text-2xs text-warm-800 font-mono shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
