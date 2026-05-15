import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const roles = [
  {
    id: 'Staff',
    title: 'Stylist',
    desc: 'Consultations & guided services',
    tag: 'Field Access',
  },
  {
    id: 'Manager',
    title: 'Director',
    desc: 'Analytics, oversight & full access',
    tag: 'Full Access',
  },
];

export default function Login({ onLogin }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-gold/[0.025] rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px] mx-6"
      >
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="mb-8"
          >
            {/* Logo container */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #DFC06A 60%, #B8942E 100%)', boxShadow: '0 4px 32px rgba(201,168,76,0.30)' }}>
                <Sparkles size={22} className="text-obsidian" />
              </div>
              {/* Glow ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gold/10 blur-md -z-10" />
            </div>
          </motion.div>

          <div className="text-center">
            <div className="flex items-baseline gap-2 justify-center mb-2">
              <h1 className="text-2xl font-display text-cream-200 tracking-tight">Naturals</h1>
              <span className="text-2xl font-display" style={{ color: '#C9A84C' }}>AI</span>
            </div>
            <p className="text-xs text-warm-600 tracking-luxury uppercase">Intelligent Salon Operations</p>
          </div>

          {/* Gold divider */}
          <div className="mt-6 w-16 gold-line" />
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          <p className="text-2xs text-warm-700 tracking-luxury uppercase text-center mb-4">Select your role to continue</p>

          {roles.map(({ id, title, desc, tag }, i) => (
            <motion.button
              key={id}
              onClick={() => onLogin(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
              whileTap={{ scale: 0.985 }}
              className="w-full group relative overflow-hidden"
            >
              <div className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 ${
                hovered === id
                  ? 'border-gold/30 shadow-gold-sm'
                  : 'border-border'
              }`}
                style={{
                  background: hovered === id
                    ? 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(26,24,21,1) 60%)'
                    : '#161412',
                }}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-300 ${
                  hovered === id ? 'bg-gold opacity-100' : 'opacity-0'
                }`} />

                <div className="flex-1 text-left pl-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="text-[15px] font-semibold text-cream-200">{title}</p>
                    <span className="badge-cream text-[9px]">{tag}</span>
                  </div>
                  <p className="text-2xs text-warm-600">{desc}</p>
                </div>

                <ArrowRight
                  size={15}
                  className={`transition-all duration-300 ${
                    hovered === id ? 'text-gold translate-x-0.5' : 'text-warm-700'
                  }`}
                />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-2xs text-warm-800 mt-10 tracking-wide"
        >
          Powered by Gemini AI · Naturals Salon Enterprise
        </motion.p>
      </motion.div>
    </div>
  );
}
