import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RotateCcw, BookmarkPlus, CheckCircle2,
  Wand2, Palette, Scissors, ArrowLeftRight, UserPlus,
  Zap, Shield, Star, Eye, TrendingUp, Clock, ChevronRight,
  Download
} from 'lucide-react';

/* ── Single demo client photo — same person in EVERY preview ── */
const DEMO_PHOTO = '/styles/demo-client.jpg';

/* ── Hairstyles & Colors ──────────────────────────────────── */
const HAIRSTYLES = [
  { id: 'bob',    label: 'Bob Cut',       desc: 'Classic chin-length', badge: 'Trending' },
  { id: 'wolf',   label: 'Wolf Cut',      desc: 'Layered & edgy',      badge: 'Hot'      },
  { id: 'layers', label: 'Layer Cut',     desc: 'Soft face-framing',   badge: null       },
  { id: 'waves',  label: 'Long Waves',    desc: 'Flowing & romantic',  badge: 'Popular'  },
  { id: 'fringe', label: 'Korean Fringe', desc: 'See-through bangs',   badge: 'New'      },
];

const COLORS = [
  { id: 'ash-brown', label: 'Ash Brown',      hex: '#7A6548', desc: 'Cool-toned brunette' },
  { id: 'burgundy',  label: 'Burgundy',        hex: '#8B1A2C', desc: 'Deep red-wine'       },
  { id: 'caramel',   label: 'Caramel',         hex: '#B07830', desc: 'Warm golden tones'   },
  { id: 'platinum',  label: 'Platinum Blonde', hex: '#D4C89A', desc: 'Ice-cool blonde'     },
  { id: 'jet-black', label: 'Jet Black',       hex: '#0A0A0A', desc: 'High-gloss black'    },
];

/* ── Pre-generated image map — your uploaded files ───────── */
const PREVIEW_IMAGES = {
  'bob-ash-brown':    '/styles/bobcut-ashbrown.png',
  'bob-burgundy':     '/styles/bobcut-burgundy.png',
  'bob-caramel':      '/styles/bobcut-caramel.png',
  'bob-platinum':     '/styles/bobcut-platinum.png',
  'bob-jet-black':    '/styles/bobcut-jetblack.png',
  'wolf-ash-brown':   '/styles/wolfcut-ashbrown.jpg',
  'wolf-burgundy':    '/styles/wolfcut-burgundy.jpg',
  'wolf-caramel':     '/styles/wolfcut-caramel.jpg',
  'wolf-platinum':    '/styles/wolfcut-platinum.jpg',
  'wolf-jet-black':   '/styles/wolfcut-jetblack.jpg',
  'layers-ash-brown': '/styles/layercut-ashbrown.png',
  'layers-burgundy':  '/styles/layercut-burgundy.png',
  'layers-caramel':   '/styles/layercut-caramel.png',
  'layers-platinum':  '/styles/layercut-platinum.png',
  'layers-jet-black': '/styles/layercut-jetblack.png',
  'waves-ash-brown':  '/styles/longwaves-ashbrown.png',
  'waves-burgundy':   '/styles/longwaves-burgundy.png',
  'waves-caramel':    '/styles/longwaves-caramel.png',
  'waves-platinum':   '/styles/longwaves-platinum.png',
  'waves-jet-black':  '/styles/longwaves-jetblack.png',
  'fringe-ash-brown': '/styles/fringe-ashbrown.png',
  'fringe-burgundy':  '/styles/fringe-burgundy.png',
  'fringe-caramel':   '/styles/fringe-caramel.png',
  'fringe-platinum':  '/styles/fringe-platinum.png',
  'fringe-jet-black': '/styles/fringe-jetblack.png',
};

/* ── Loading phases ───────────────────────────────────────── */
const PHASES = [
  { label: 'Analyzing facial structure…',       detail: 'Mapping 68 facial landmark points'         },
  { label: 'Applying hairstyle layers…',         detail: 'Neural style transfer — 12 layers active' },
  { label: 'Generating realistic salon finish…', detail: 'Rendering hair strands at 4K quality'     },
  { label: 'Optimizing hair color tones…',       detail: 'Calibrating color chemistry & refraction' },
  { label: 'Finalizing premium preview…',        detail: 'Applying photorealistic post-processing'  },
];

/* ── Facial landmarks for scan animation ─────────────────── */
const LANDMARKS = [
  { x: 34, y: 29 }, { x: 66, y: 29 },
  { x: 50, y: 50 }, { x: 42, y: 48 }, { x: 58, y: 48 },
  { x: 36, y: 68 }, { x: 50, y: 72 }, { x: 64, y: 68 },
  { x: 22, y: 50 }, { x: 78, y: 50 },
  { x: 50, y: 18 }, { x: 50, y: 85 },
];

/* ── Deterministic AI metrics ─────────────────────────────── */
function getMetrics(styleId, colorId) {
  const seed = [...(styleId + colorId)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    confidence:     91 + (seed % 7),
    stylePrecision: 88 + ((seed * 3) % 9),
    colorAccuracy:  90 + ((seed * 7) % 8),
    processingMs:   (2.1 + (seed % 14) * 0.1).toFixed(1),
    faceShape:      ['Oval', 'Heart', 'Round', 'Square'][seed % 4],
    suitability:    ['Optimal', 'Very High', 'High'][seed % 3],
    maintenance:    ['Low', 'Medium', 'Medium-High'][seed % 3],
  };
}

const TIPS = {
  bob:    'A precision bob with point-cut ends adds texture and movement. Recommend a blowout finish to maximise shine.',
  wolf:   'Wolf cuts thrive with layering at the crown. A diffuser on low heat brings out natural texture beautifully.',
  layers: 'Face-framing layers starting 2 inches below the cheekbone open up features and work for all face shapes.',
  waves:  'Long waves need a deep hydration treatment before styling. Bond-builder treatments extend the look significantly.',
  fringe: 'Korean see-through bangs require precision point-cutting. Book a maintenance trim every 4–5 weeks to hold shape.',
};

/* ── Pre-generated preview — your uploaded images ─────────── */
function SimulatedPreview({ styleId, colorId, className = '' }) {
  const src = PREVIEW_IMAGES[`${styleId}-${colorId}`];
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <img src={src} alt="AI Preview" className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}

/* ── Before / After Slider ────────────────────────────────── */
function BeforeAfterSlider({ afterNode }) {
  const [pos, setPos]           = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef            = useRef(null);

  const updatePos = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onMove = useCallback((e) => { if (dragging) updatePos(e.clientX); }, [dragging, updatePos]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener('mousemove', onMove);
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', up); };
  }, [dragging, onMove]);

  return (
    <div ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden select-none cursor-col-resize group">

      {/* After layer — full width (colour-simulated preview) */}
      <div className="absolute inset-0">{afterNode}</div>

      {/* Before layer — clipped to left of pos, img counter-scaled so it stays full size */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={DEMO_PHOTO}
          alt="Before"
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${10000 / pos}%`, maxWidth: 'none' }}
        />
      </div>

      {/* Gold divider line */}
      <div className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{ left: `${pos}%`, background: 'rgba(201,168,76,0.95)', boxShadow: '0 0 16px rgba(201,168,76,0.7), 0 0 32px rgba(201,168,76,0.3)' }} />

      {/* Handle */}
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20 cursor-grab active:cursor-grabbing"
        style={{ left: `${pos}%`, background: '#0D0C0A', border: '2px solid rgba(201,168,76,0.75)', boxShadow: '0 0 20px rgba(201,168,76,0.35), 0 4px 20px rgba(0,0,0,0.6)' }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
        onTouchMove={e => updatePos(e.touches[0].clientX)}>
        <ArrowLeftRight size={13} className="text-gold" />
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-warm-400 backdrop-blur-sm"
        style={{ background: 'rgba(13,12,10,0.80)', border: '1px solid rgba(255,255,255,0.08)' }}>Before</div>
      <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-gold backdrop-blur-sm"
        style={{ background: 'rgba(13,12,10,0.80)', border: '1px solid rgba(201,168,76,0.30)' }}>AI Preview</div>
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-2xs text-warm-600 backdrop-blur-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: 'rgba(13,12,10,0.7)' }}>Drag to compare</p>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function StylePreview({ selectedClient, onSelectClient }) {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [state, setState]                 = useState('idle');  // idle | generating | done
  const [loadPct, setLoadPct]             = useState(0);
  const [loadPhase, setLoadPhase]         = useState(0);
  const [savedLooks, setSavedLooks]       = useState([]);
  const [justSaved, setJustSaved]         = useState(false);
  const [imgReady, setImgReady]           = useState(false);

  /* Preload demo photo */
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true); // still proceed
    img.src = DEMO_PHOTO;
  }, []);

  const generate = useCallback(async () => {
    if (!selectedStyle || !selectedColor) return;
    setState('generating');
    setLoadPct(0);
    setLoadPhase(0);

    const TOTAL_MS = 5000;
    let elapsed = 0;
    const tick = setInterval(() => {
      elapsed += 80;
      const pct = Math.min(96, (elapsed / TOTAL_MS) * 100);
      setLoadPct(pct);
      setLoadPhase(Math.min(PHASES.length - 1, Math.floor((pct / 100) * PHASES.length)));
    }, 80);

    await new Promise(r => setTimeout(r, TOTAL_MS));
    clearInterval(tick);
    setLoadPct(100);
    await new Promise(r => setTimeout(r, 380));

    setState('done');
  }, [selectedStyle, selectedColor]);

  const saveLook = () => {
    if (state !== 'done') return;
    const s = HAIRSTYLES.find(h => h.id === selectedStyle);
    const c = COLORS.find(x => x.id === selectedColor);
    setSavedLooks(prev => [{
      id: Date.now(),
      styleId:    selectedStyle,
      colorId:    selectedColor,
      colorHex:   c?.hex,
      colorRgb:   c?.rgb,
      styleLabel: s?.label,
      colorLabel: c?.label,
    }, ...prev].slice(0, 6));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  const reset = () => {
    setState('idle');
    setSelectedStyle(null);
    setSelectedColor(null);
  };

  const style       = HAIRSTYLES.find(h => h.id === selectedStyle);
  const color       = COLORS.find(c => c.id === selectedColor);
  const metrics     = (selectedStyle && selectedColor) ? getMetrics(selectedStyle, selectedColor) : null;
  const canGenerate = selectedStyle && selectedColor && state !== 'generating';

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Wand2 size={11} className="text-gold" />
            </div>
            <span className="section-label-gold">AI Feature</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.16)' }}>
              <motion.div className="w-1.5 h-1.5 rounded-full bg-gold"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              <span className="text-[9px] font-bold text-gold tracking-wide">NATURALS AI v2.3</span>
            </div>
            {/* Photo ready indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: imgReady ? 'rgba(74,112,85,0.10)' : 'rgba(255,255,255,0.04)', border: `1px solid ${imgReady ? 'rgba(74,112,85,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className={`w-1.5 h-1.5 rounded-full ${imgReady ? 'bg-sage' : 'bg-warm-700 animate-pulse'}`} />
              <span className={`text-[9px] font-semibold ${imgReady ? 'text-sage' : 'text-warm-700'}`}>
                {imgReady ? 'Preview ready' : 'Loading…'}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-display text-cream-200 tracking-tight">Style Preview</h1>
          <p className="text-sm text-warm-600 mt-1">AI-powered hairstyle try-on. See it before you commit.</p>
        </div>

        <div className="flex items-center gap-2">
          {!selectedClient && (
            <button onClick={onSelectClient} className="btn-ghost text-[12px]">
              <UserPlus size={13} /> Select Client
            </button>
          )}
          {state === 'done' && (
            <button onClick={reset} className="btn-ghost text-[12px]">
              <RotateCcw size={13} /> New Preview
            </button>
          )}
          <motion.button onClick={generate} disabled={!canGenerate} whileTap={canGenerate ? { scale: 0.97 } : {}}
            className="btn-gold relative overflow-hidden"
            style={!canGenerate ? { opacity: 0.35, cursor: 'not-allowed', background: '#1C1A17', color: '#7A6452', boxShadow: 'none' } : {}}>
            {canGenerate && (
              <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', width: '50%' }} />
            )}
            <Sparkles size={13} />
            {state === 'generating' ? 'Generating…' : 'Generate AI Preview'}
          </motion.button>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT — Client photo + selectors */}
        <div className="lg:col-span-5 space-y-4">

          {/* Fixed demo photo */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.14)' }}>
            <div className="relative w-full aspect-[4/5]">
              <img src={DEMO_PHOTO} alt="Client" className="w-full h-full object-cover" />

              {/* Scanning overlay — shows during generation */}
              {state === 'generating' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 opacity-70"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px)',
                      backgroundSize: '36px 36px',
                    }} />
                  <motion.div className="absolute left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.9) 30%, rgba(255,240,160,1) 50%, rgba(201,168,76,0.9) 70%, transparent 100%)', boxShadow: '0 0 20px rgba(201,168,76,0.6)' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
                  {LANDMARKS.map((lm, i) => (
                    <motion.div key={i}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{ left: `${lm.x}%`, top: `${lm.y}%`, transform: 'translate(-50%,-50%)', background: '#C9A84C', boxShadow: '0 0 6px rgba(201,168,76,0.8)' }}
                      animate={{ opacity: [0, 1, 0.4, 1, 0], scale: [0.5, 1, 0.8, 1, 0.5] }}
                      transition={{ duration: 2, delay: i * 0.12, repeat: Infinity }} />
                  ))}
                  {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
                    ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']
                  ].map(([pos, borders], i) => (
                    <div key={i} className={`absolute w-5 h-5 ${pos} ${borders}`}
                      style={{ borderColor: 'rgba(201,168,76,0.75)' }} />
                  ))}
                  <div className="absolute inset-0" style={{ background: 'rgba(13,12,10,0.18)' }} />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    style={{ background: 'rgba(13,12,10,0.88)', border: '1px solid rgba(201,168,76,0.35)' }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-gold"
                      animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
                    <span className="text-[10px] font-bold tracking-wider text-gold">AI PROCESSING</span>
                  </div>
                </div>
              )}

              {/* Client label */}
              {state !== 'generating' && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-sm"
                  style={{ background: 'rgba(13,12,10,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    <span className="text-[9px] font-bold text-gold">
                      {selectedClient ? selectedClient.initials : 'DC'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-warm-300">
                    {selectedClient ? selectedClient.name : 'Demo Client'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hairstyle selector */}
          <div className="rounded-2xl p-4 space-y-1.5" style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Scissors size={12} className="text-warm-700" />
              <p className="section-label">Hairstyle</p>
              {selectedStyle && <div className="w-1 h-1 rounded-full bg-gold ml-auto" />}
            </div>
            {HAIRSTYLES.map((s) => {
              const active = selectedStyle === s.id;
              return (
                <motion.button key={s.id}
                  onClick={() => { setSelectedStyle(s.id); if (state === 'done') { setState('idle'); } }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 relative overflow-hidden"
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.09) 0%, rgba(201,168,76,0.03) 100%)',
                    border: '1px solid rgba(201,168,76,0.20)',
                  } : { border: '1px solid transparent' }}>
                  {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gold" />}
                  <div className="flex-1 pl-1">
                    <p className={`text-[13px] font-medium ${active ? 'text-cream-200' : 'text-warm-500'}`}>{s.label}</p>
                    <p className="text-2xs text-warm-700">{s.desc}</p>
                  </div>
                  {s.badge && (
                    <span className={`badge text-[9px] ${
                      s.badge === 'Hot' ? 'text-ruby' : s.badge === 'New' ? 'text-blue-400' : 'text-gold'
                    }`} style={
                      s.badge === 'Hot' ? { background: 'rgba(155,59,59,0.10)', border: '1px solid rgba(155,59,59,0.18)' } :
                      s.badge === 'New' ? { background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.18)' } :
                      { background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.20)' }
                    }>{s.badge}</span>
                  )}
                  {active && <ChevronRight size={11} className="text-gold shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Color selector */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Palette size={12} className="text-warm-700" />
              <p className="section-label">Hair Color</p>
              {selectedColor && <div className="w-1 h-1 rounded-full bg-gold ml-auto" />}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => {
                const active = selectedColor === c.id;
                return (
                  <motion.button key={c.id}
                    onClick={() => { setSelectedColor(c.id); if (state === 'done') { setState('idle'); } }}
                    whileTap={{ scale: 0.88 }} title={c.label}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200"
                    style={active ? { background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' } : { border: '1px solid transparent' }}>
                    <div className="w-8 h-8 rounded-full transition-all duration-200"
                      style={{ backgroundColor: c.hex,
                        border: active ? '2px solid rgba(201,168,76,0.75)' : '2px solid rgba(255,255,255,0.10)',
                        boxShadow: active ? `0 0 14px ${c.hex}55, 0 0 28px ${c.hex}22` : 'none' }} />
                    <span className="text-[9px] text-warm-700 text-center leading-tight">{c.label.split(' ')[0]}</span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {color && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mt-1"
                    style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-4 h-4 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: color.hex }} />
                    <div>
                      <p className="text-[12px] font-medium text-cream-300">{color.label}</p>
                      <p className="text-2xs text-warm-700">{color.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Result panel */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">

            {/* Idle */}
            {state === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
                style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)', aspectRatio: '3/4' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
                <div className="relative z-10 space-y-6 px-8">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
                    style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.10)' }}>
                    <Wand2 size={30} className="text-warm-800" strokeWidth={1} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-600 mb-1.5">AI preview will appear here</p>
                    <p className="text-2xs text-warm-800 leading-relaxed">Pick a hairstyle & color,<br />then click Generate</p>
                  </div>
                  <div className="space-y-2.5 w-full max-w-[200px] mx-auto text-left">
                    {[
                      { label: 'Choose a hairstyle', done: !!selectedStyle },
                      { label: 'Choose a color',     done: !!selectedColor },
                    ].map((item, i) => (
                      <motion.div key={i} className="flex items-center gap-2.5"
                        animate={item.done ? { x: [4, 0] } : {}} transition={{ duration: 0.2 }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                          style={{ background: item.done ? 'rgba(74,112,85,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.done ? 'rgba(74,112,85,0.30)' : 'rgba(255,255,255,0.07)'}` }}>
                          {item.done && <CheckCircle2 size={11} className="text-sage" />}
                        </div>
                        <span className={`text-[12px] transition-colors ${item.done ? 'text-warm-400' : 'text-warm-800'}`}>{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generating */}
            {state === 'generating' && (
              <motion.div key="generating" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-8 px-8"
                style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.14)', aspectRatio: '3/4' }}>

                <motion.div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none"
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.08, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)' }} />
                <motion.div className="absolute bottom-[-20%] right-[-15%] w-[65%] h-[65%] rounded-full pointer-events-none"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />

                <div className="relative z-10 flex flex-col items-center gap-8 w-full">
                  {/* Progress ring */}
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="2.5" />
                      <circle cx="48" cy="48" r="40" fill="none"
                        stroke="url(#goldRing)" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - loadPct / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
                      <defs>
                        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#B8942E" />
                          <stop offset="100%" stopColor="#DFC06A" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                        <Sparkles size={20} className="text-gold" />
                      </motion.div>
                      <p className="text-[11px] font-bold text-gold mt-0.5 font-mono">{Math.round(loadPct)}%</p>
                    </div>
                  </div>

                  {/* Phase messages */}
                  <div className="text-center space-y-2 w-full">
                    <AnimatePresence mode="wait">
                      <motion.div key={loadPhase}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}>
                        <p className="text-[15px] font-semibold text-cream-200">{PHASES[loadPhase]?.label}</p>
                        <p className="text-2xs text-warm-700 mt-1">{PHASES[loadPhase]?.detail}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress bar + dots */}
                  <div className="w-full max-w-[260px] space-y-2">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-100"
                        style={{ width: `${loadPct}%`, background: 'linear-gradient(90deg, #8B6A24, #C9A84C, #DFC06A)' }} />
                    </div>
                    <div className="flex justify-between">
                      {PHASES.map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full transition-all duration-400"
                          style={{ background: i <= loadPhase ? '#C9A84C' : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                  </div>

                  {/* Style + color chips */}
                  {style && color && (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-gold"
                        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.16)' }}>
                        <Scissors size={10} /> {style.label}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-warm-400"
                        style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: color.hex }} />
                        {color.label}
                      </div>
                    </div>
                  )}

                  {/* Processing log */}
                  <div className="w-full max-w-[260px] rounded-xl overflow-hidden"
                    style={{ background: '#0D0C0A', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="px-3 py-2 space-y-1.5 font-mono">
                      {PHASES.slice(0, loadPhase + 1).map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-[10px]">
                          <CheckCircle2 size={9} className={i < loadPhase ? 'text-sage' : 'text-gold'} />
                          <span className={i < loadPhase ? 'text-warm-700' : 'text-warm-400'}>{p.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Done */}
            {state === 'done' && style && color && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4">

                {/* Before / After slider */}
                <div className="rounded-2xl overflow-hidden p-1"
                  style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.14)' }}>
                  <BeforeAfterSlider
                    afterNode={
                      <SimulatedPreview
                        styleId={selectedStyle}
                        colorId={selectedColor}
                        className="absolute inset-0 w-full h-full"
                      />
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button onClick={saveLook} whileTap={{ scale: 0.96 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
                    style={justSaved
                      ? { background: 'rgba(74,112,85,0.10)', border: '1px solid rgba(74,112,85,0.24)', color: '#4A7055' }
                      : { background: '#161412', border: '1px solid rgba(255,255,255,0.08)', color: '#9A8470' }}>
                    {justSaved ? <><CheckCircle2 size={14} /> Saved to Gallery</> : <><BookmarkPlus size={14} /> Save Look</>}
                  </motion.button>
                  <button onClick={reset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium"
                    style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.08)', color: '#9A8470' }}>
                    <Download size={14} /> Export
                  </button>
                </div>

                {/* AI Metrics */}
                {metrics && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-2xl p-5 space-y-4"
                    style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.22)' }}>
                          <Shield size={11} className="text-gold" />
                        </div>
                        <p className="text-[13px] font-semibold text-cream-200">AI Analysis Report</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(74,112,85,0.10)', border: '1px solid rgba(74,112,85,0.22)' }}>
                        <CheckCircle2 size={10} className="text-sage" />
                        <span className="text-[10px] font-bold text-sage">Verified</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Overall Confidence', value: metrics.confidence,     icon: Zap,       color: '#C9A84C' },
                        { label: 'Style Precision',    value: metrics.stylePrecision, icon: Scissors,  color: '#A0B89A' },
                        { label: 'Color Accuracy',     value: metrics.colorAccuracy,  icon: Eye,       color: '#7BA7BC' },
                      ].map((m, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <m.icon size={10} style={{ color: m.color }} />
                              <span className="text-2xs text-warm-600">{m.label}</span>
                            </div>
                            <span className="text-[12px] font-bold" style={{ color: m.color }}>{m.value}%</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <motion.div className="h-full rounded-full"
                              initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                              style={{ background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Face Shape',  value: metrics.faceShape,   icon: Eye        },
                        { label: 'Suitability', value: metrics.suitability, icon: TrendingUp },
                        { label: 'Maintenance', value: metrics.maintenance, icon: Clock      },
                      ].map((m, i) => (
                        <div key={i} className="rounded-xl px-3 py-2.5 text-center"
                          style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <p className="text-[11px] font-semibold text-cream-300">{m.value}</p>
                          <p className="text-2xs text-warm-700 mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-2xs text-warm-800">Processed in {metrics.processingMs}s · NaturalsAI v2.3</span>
                      <span className="text-2xs text-warm-800">StyleGAN-HD</span>
                    </div>
                  </motion.div>
                )}

                {/* Stylist tip */}
                {style && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, #161412 100%)', border: '1px solid rgba(201,168,76,0.12)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.22)' }}>
                        <Sparkles size={12} className="text-gold" />
                      </div>
                      <div>
                        <p className="section-label-gold mb-1.5">Naturals Stylist Tip</p>
                        <p className="text-[13px] text-warm-400 leading-relaxed">{TIPS[style.id]}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Saved Looks Gallery ──────────────────────────────── */}
      <AnimatePresence>
        {savedLooks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={13} className="text-gold" />
                <p className="section-label">Saved Looks</p>
                <span className="text-2xs text-warm-700 ml-1">({savedLooks.length})</span>
              </div>
              <button onClick={() => setSavedLooks([])}
                className="text-2xs text-warm-700 hover:text-warm-500 transition-base">Clear all</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {savedLooks.map((look) => (
                <motion.div key={look.id} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden relative group transition-all duration-200 hover:scale-105"
                    style={{ border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    {/* Render pre-generated image as gallery thumbnail */}
                    <SimulatedPreview
                      styleId={look.styleId}
                      colorId={look.colorId}
                    />
                    <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/30 transition-all duration-200 flex items-end p-2 opacity-0 group-hover:opacity-100">
                      <span className="text-[9px] font-bold text-gold">{look.styleLabel}</span>
                    </div>
                  </div>
                  <p className="text-2xs font-medium text-warm-500 truncate mt-1.5">{look.styleLabel}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2 h-2 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: look.colorHex }} />
                    <p className="text-2xs text-warm-800 truncate">{look.colorLabel}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
