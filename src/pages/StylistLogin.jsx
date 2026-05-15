import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scissors, ArrowLeft, ArrowRight, Star, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { useSalon, STYLISTS_DATA } from '../context/SalonContext';

const STYLIST_DETAILS = {
  s1: { clients: 2, rating: '4.9', badge: 'Expert' },
  s2: { clients: 2, rating: '4.8', badge: 'Pro'    },
  s3: { clients: 1, rating: '4.7', badge: 'Master'  },
};

export default function StylistLogin() {
  const navigate = useNavigate();
  const { setLoggedInStylist, sessions } = useSalon();

  const [selected, setSelected]   = useState(null);
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Please enter your credentials.'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoggedInStylist(selected);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: '#0D0C0A' }}>

      {/* Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-lg">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-2xs text-warm-700 hover:text-warm-400 transition-base mb-8">
          <ArrowLeft size={12} /> Back to Portal Select
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #DFC06A)', boxShadow: '0 4px 16px rgba(201,168,76,0.25)' }}>
              <Scissors size={14} className="text-obsidian" />
            </div>
            <span className="text-[13px] font-semibold text-gold tracking-wide uppercase">Stylist Portal</span>
          </div>
          <h1 className="text-2xl font-display text-cream-200 tracking-tight mb-1">Select your profile</h1>
          <p className="text-sm text-warm-600">Choose your stylist card, then sign in to continue.</p>
        </motion.div>

        {/* Stylist cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-6">
          {STYLISTS_DATA.map((stylist) => {
            const detail  = STYLIST_DETAILS[stylist.id];
            const active  = selected?.id === stylist.id;
            const sessCount = (sessions[stylist.id] || []).length;
            return (
              <motion.button
                key={stylist.id}
                onClick={() => { setSelected(stylist); setError(''); }}
                whileTap={{ scale: 0.97 }}
                className="relative flex flex-col items-center p-4 rounded-2xl transition-all duration-200 text-center"
                style={{
                  background: active ? `${stylist.accentColor}14` : '#161412',
                  border: `1px solid ${active ? stylist.accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: active ? `0 8px 32px ${stylist.accentColor}20` : 'none',
                }}>
                {active && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 size={12} style={{ color: stylist.accentColor }} />
                  </div>
                )}

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-[14px] font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${stylist.accentColor}30, ${stylist.accentColor}10)`,
                    border: `2px solid ${active ? stylist.accentColor : stylist.accentColor + '30'}`,
                    color: stylist.accentColor,
                    boxShadow: active ? `0 0 0 3px ${stylist.accentColor}15` : 'none',
                  }}>
                  {stylist.initials}
                </div>

                <p className="text-[13px] font-semibold text-cream-200 mb-0.5">{stylist.name}</p>
                <p className="text-2xs text-warm-700 mb-3 leading-tight">{stylist.role}</p>

                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: stylist.status === 'active' ? '#4A7055' : '#9B3B3B' }} />
                    <span className="text-2xs" style={{ color: stylist.accentColor }}>{sessCount} clients</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Star size={8} style={{ color: stylist.accentColor }} />
                    <span className="text-2xs text-warm-700">{detail.rating}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Selected stylist info strip */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3"
              style={{ background: `${selected.accentColor}0A`, border: `1px solid ${selected.accentColor}20` }}>
              <Clock size={12} style={{ color: selected.accentColor }} />
              <span className="text-2xs text-warm-500">{selected.shift} · {selected.shiftHours}</span>
              <span className="ml-auto text-2xs font-medium" style={{ color: selected.accentColor }}>
                {selected.specialization}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          onSubmit={handleLogin}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>

          <p className="text-2xs text-warm-700 mb-2">Sign in to your workspace</p>

          <div className="space-y-3">
            <div>
              <label className="block text-2xs text-warm-700 mb-1.5">Username</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder={selected ? `${selected.name.toLowerCase()}@naturals` : 'Enter username'}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-warm-300 placeholder:text-warm-800 bg-transparent border-none outline-none"
                style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}
              />
            </div>
            <div>
              <label className="block text-2xs text-warm-700 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-warm-300 placeholder:text-warm-800 bg-transparent border-none outline-none"
                style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}
              />
            </div>
          </div>

          {error && (
            <p className="text-2xs text-ruby">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !selected}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:opacity-40"
            style={{
              background: selected ? `linear-gradient(135deg, ${selected.accentColor}, ${selected.accentColor}BB)` : 'rgba(255,255,255,0.06)',
              color: '#0D0C0A',
            }}>
            {loading ? (
              <><div className="w-4 h-4 rounded-full border-2 border-obsidian/30 border-t-obsidian animate-spin" /> Signing in…</>
            ) : (
              <><Sparkles size={13} /> Sign In <ArrowRight size={13} /></>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
