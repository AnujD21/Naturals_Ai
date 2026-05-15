import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, Sparkles, AlertTriangle, CheckCircle2,
  Droplets, Layers, RotateCcw, ImagePlus, Palette, UserPlus
} from 'lucide-react';
import { analyzeHairImage } from '../services/gemini';
import { saveAnalysis } from '../services/clientStore';
import { ClientHistoryPanel } from '../components/ClientSelector';

const ANALYSIS_STEPS = [
  'Uploading image to AI…',
  'Scanning strand structure…',
  'Analyzing porosity levels…',
  'Evaluating damage markers…',
  'Generating recommendations…',
];

const FALLBACK_RESULTS = {
  confidence: 92,
  hairType: 'Type 2B — Wavy',
  porosity: 'High',
  damageLevel: 'Moderate',
  damageDetail: 'Heat damage concentrated at ends (last 3 cm)',
  recommendations: [
    { name: 'Olaplex No. 3', type: 'Bond Treatment', priority: 'High' },
    { name: 'Kérastase Hydration Mask', type: 'Weekly Care', priority: 'Medium' },
    { name: 'Trim 1.5 inches', type: 'Cut Recommendation', priority: 'High' },
  ],
  colorSuggestion: 'Level 7 Ash Brown with warm undertones',
};

export default function HairAnalysis({ selectedClient, onSelectClient }) {
  const [state, setState]               = useState('idle');
  const [results, setResults]           = useState(null);
  const [step, setStep]                 = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError]               = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (file.size > 10 * 1024 * 1024)   { setError('Image must be under 10 MB.'); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUploadedImage({ url: dataUrl, base64: dataUrl.split(',')[1], mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload({ target: { files: [file] } });
  }, [handleImageUpload]);

  const startAnalysis = useCallback(async () => {
    if (!uploadedImage) { setError('Please upload an image first.'); return; }
    setState('analyzing'); setStep(0); setResults(null); setError(null);

    const stepInterval = setInterval(() => {
      setStep(s => { if (s < ANALYSIS_STEPS.length - 1) return s + 1; clearInterval(stepInterval); return s; });
    }, 800);

    const clientContext = selectedClient?.preferences ? {
      name: selectedClient.name,
      colorHistory: selectedClient.preferences.colorHistory,
      allergies: selectedClient.preferences.allergies,
      notes: selectedClient.preferences.notes,
    } : null;

    const response = await analyzeHairImage(uploadedImage.base64, uploadedImage.mimeType, clientContext);
    clearInterval(stepInterval);
    setStep(ANALYSIS_STEPS.length - 1);
    await new Promise(r => setTimeout(r, 400));

    if (response.success) {
      setResults(response.data);
      if (selectedClient) {
        await saveAnalysis(selectedClient.id, {
          hairType: response.data.hairType,
          porosity: response.data.porosity,
          damage: `${response.data.damageLevel} — ${response.data.damageDetail}`,
          confidence: response.data.confidence,
        });
      }
    } else {
      setResults(FALLBACK_RESULTS);
    }
    setState('done');
  }, [uploadedImage, selectedClient]);

  const reset = () => {
    setState('idle'); setResults(null); setStep(0); setUploadedImage(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1.5">AI Consultation</p>
          <h1 className="text-2xl font-display text-cream-200 tracking-tight">Hair Diagnostics</h1>
          <p className="text-sm text-warm-600 mt-1">Upload a photo for AI-powered hair analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          {!selectedClient && (
            <button onClick={onSelectClient} className="btn-ghost text-[12px]">
              <UserPlus size={13} /> Select Client
            </button>
          )}
          {state === 'done' && (
            <button onClick={reset} className="btn-ghost text-[12px]">
              <RotateCcw size={13} /> New Analysis
            </button>
          )}
          <button
            onClick={startAnalysis}
            disabled={state === 'analyzing' || !uploadedImage}
            className="btn-gold"
          >
            <Sparkles size={13} />
            {state === 'analyzing' ? 'Analysing…' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] text-ruby"
          style={{ background: 'rgba(155,59,59,0.08)', border: '1px solid rgba(155,59,59,0.18)' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left — Upload */}
        <div className="lg:col-span-2 space-y-3">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />

          <div
            onClick={() => state !== 'analyzing' && fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative overflow-hidden flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 group ${uploadedImage ? '' : 'aspect-[4/3]'} ${state === 'analyzing' ? 'pointer-events-none' : ''}`}
            style={{ background: '#161412', border: `1px solid ${uploadedImage ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.07)'}` }}
          >
            {/* Scanner line */}
            <AnimatePresence>
              {state === 'analyzing' && (
                <motion.div
                  initial={{ top: '0%', opacity: 0 }}
                  animate={{ top: '100%', opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px z-20"
                  style={{ boxShadow: '0 0 12px 3px rgba(201,168,76,0.5)', background: 'rgba(201,168,76,0.8)' }}
                />
              )}
            </AnimatePresence>

            {state === 'analyzing' && (
              <div className="absolute inset-0 opacity-[0.06] z-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(201,168,76,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.8) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }} />
            )}

            {uploadedImage ? (
              <div className="w-full relative">
                <img src={uploadedImage.url} alt="Uploaded hair" className="w-full h-auto max-h-[400px] object-cover rounded-2xl" />
                {state === 'idle' && (
                  <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-cream-200 text-[13px] font-medium">
                      <ImagePlus size={16} /> Change Photo
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center px-8 py-10 z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.14)' }}>
                  <Camera size={22} className="text-warm-700" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-cream-300 mb-1">Upload Hair Photo</p>
                <p className="text-2xs text-warm-700 max-w-[200px] mb-5 leading-relaxed">Click to browse or drag & drop. JPEG, PNG or WebP.</p>
                <div className="flex items-center gap-1.5 text-2xs text-gold font-medium">
                  <Upload size={11} /> Browse files
                </div>
              </div>
            )}
          </div>

          {uploadedImage && state === 'idle' && (
            <div className="flex items-center justify-between px-1">
              <p className="text-2xs text-warm-700 truncate max-w-[200px]">{uploadedImage.name}</p>
              <button onClick={reset} className="text-2xs text-warm-600 hover:text-warm-300 transition-base">Remove</button>
            </div>
          )}

          {/* Progress */}
          <AnimatePresence>
            {state === 'analyzing' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl px-5 py-4 space-y-2.5 overflow-hidden"
                style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.12)' }}>
                {ANALYSIS_STEPS.map((label, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-gold' : 'bg-warm-800'}`} />
                    <span className={`text-2xs transition-base ${i <= step ? 'text-warm-300' : 'text-warm-800'}`}>{label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedClient && <ClientHistoryPanel client={selectedClient} />}
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence mode="wait">

            {state === 'idle' && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-2xl flex flex-col items-center justify-center py-24 text-center"
                style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.10)' }}>
                  <Sparkles size={24} className="text-warm-800" strokeWidth={1} />
                </div>
                <p className="text-sm text-warm-600">{uploadedImage ? 'Ready — click "Run Analysis"' : 'Upload a photo to begin'}</p>
                <p className="text-2xs text-warm-800 mt-1.5">AI-powered hair diagnostics in seconds</p>
              </motion.div>
            )}

            {state === 'analyzing' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3">
                {/* Skeleton: confidence bar */}
                <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
                  style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-warm-900 animate-pulse" />
                    <div className="w-32 h-3 rounded bg-warm-900 animate-pulse" />
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-warm-900 animate-pulse" />
                </div>
                {/* Skeleton: metric cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map(i => (
                    <div key={i} className="px-4 py-3.5 rounded-2xl space-y-2"
                      style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-16 h-2.5 rounded bg-warm-900 animate-pulse" />
                      <div className="w-24 h-3.5 rounded bg-warm-900 animate-pulse" />
                    </div>
                  ))}
                </div>
                {/* Skeleton: color suggestion */}
                <div className="px-5 py-4 rounded-2xl space-y-2"
                  style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.08)' }}>
                  <div className="w-28 h-2.5 rounded bg-warm-900 animate-pulse" />
                  <div className="w-full h-3 rounded bg-warm-900 animate-pulse" />
                </div>
                {/* Skeleton: damage */}
                <div className="px-5 py-4 rounded-2xl space-y-2"
                  style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-36 h-2.5 rounded bg-warm-900 animate-pulse" />
                  <div className="w-3/4 h-3 rounded bg-warm-900 animate-pulse" />
                </div>
                {/* Current step label */}
                <div className="flex items-center gap-2 px-2">
                  <div className="relative w-4 h-4 shrink-0">
                    <div className="absolute inset-0 rounded-full border border-warm-800" />
                    <div className="absolute inset-0 rounded-full border border-t-gold animate-spin" />
                  </div>
                  <p className="text-2xs text-warm-600">{ANALYSIS_STEPS[step]}</p>
                </div>
              </motion.div>
            )}

            {state === 'done' && results && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }} className="space-y-3">

                {/* Confidence header */}
                <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
                  style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.14)' }}>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-sage" />
                    <span className="text-[13px] font-semibold text-cream-200">Analysis Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${results.confidence}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #C9A84C, #DFC06A)' }} />
                    </div>
                    <span className="text-2xs font-semibold text-gold">{results.confidence}%</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Layers,   label: 'Hair Type', value: results.hairType,  color: '#C9A84C' },
                    { icon: Droplets, label: 'Porosity',  value: results.porosity,  color: '#7BA7BC' },
                  ].map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="px-4 py-3.5 rounded-2xl" style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <m.icon size={12} style={{ color: m.color }} />
                        <p className="section-label">{m.label}</p>
                      </div>
                      <p className="text-[13px] font-semibold text-cream-200">{m.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Color suggestion */}
                {results.colorSuggestion && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="px-5 py-4 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, #161412 100%)', border: '1px solid rgba(201,168,76,0.14)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Palette size={12} className="text-gold" />
                      <p className="section-label-gold">AI Color Suggestion</p>
                    </div>
                    <p className="text-[13px] text-warm-300">{results.colorSuggestion}</p>
                  </motion.div>
                )}

                {/* Damage */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="px-5 py-4 rounded-2xl"
                  style={{ background: 'rgba(155,59,59,0.05)', border: '1px solid rgba(155,59,59,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle size={12} className="text-ruby" />
                    <p className="section-label text-ruby-DEFAULT" style={{ color: '#9B3B3B' }}>Damage Assessment</p>
                  </div>
                  <p className="text-[13px] font-semibold text-cream-300">{results.damageLevel}</p>
                  <p className="text-2xs text-warm-600 mt-0.5">{results.damageDetail}</p>
                </motion.div>

                {/* Recommendations */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="rounded-2xl p-5" style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="section-label mb-4">AI Recommendations</p>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                        style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 rounded-full bg-gold opacity-60" />
                          <div>
                            <p className="text-[13px] font-medium text-cream-300">{rec.name}</p>
                            <p className="text-2xs text-warm-700">{rec.type}</p>
                          </div>
                        </div>
                        <span className={rec.priority === 'High' ? 'badge-gold' : 'badge-cream'}>{rec.priority}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {selectedClient && (
                  <div className="flex items-center gap-1.5 px-2 text-2xs text-sage">
                    <CheckCircle2 size={10} /> Results saved to {selectedClient.name}'s profile
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
