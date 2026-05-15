import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { validateManager } from '../services/db';

const STATS = [
  { label: 'Stylists Online',   value: '3' },
  { label: 'Active Services',   value: '5' },
  { label: 'Avg Completion',    value: '63%' },
];

export default function ManagerLogin() {
  const navigate = useNavigate();
  const { setManagerLoggedIn } = useSalon();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Please enter your credentials.'); return; }
    setError('');
    setLoading(true);

    // Validate against DB; null means DB not configured → allow any credentials (demo mode)
    const valid = await validateManager(username, password);
    if (valid === false) {
      setLoading(false);
      setError('Invalid credentials. Please try again.');
      return;
    }

    setManagerLoggedIn(true);
    navigate('/manager/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: '#0D0C0A' }}>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(74,112,85,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-2xs text-warm-700 hover:text-warm-400 transition-base mb-8">
          <ArrowLeft size={12} /> Back to Portal Select
        </motion.button>

        {/* Brand + portal label */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(74,112,85,0.30), rgba(74,112,85,0.10))', border: '1px solid rgba(74,112,85,0.30)' }}>
              <BarChart3 size={16} className="text-sage" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-luxury text-sage uppercase">Manager Portal</p>
              <p className="text-2xs text-warm-700">Enterprise Access</p>
            </div>
          </div>
          <h1 className="text-2xl font-display text-cream-200 tracking-tight mb-1.5">Salon Intelligence</h1>
          <p className="text-sm text-warm-600 leading-relaxed">Sign in to access the live operational dashboard, staff analytics, and AI insights.</p>
        </motion.div>

        {/* Live stats preview */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-3 gap-2 mb-6">
          {STATS.map(s => (
            <div key={s.label} className="rounded-xl px-3 py-2.5 text-center"
              style={{ background: 'rgba(74,112,85,0.06)', border: '1px solid rgba(74,112,85,0.15)' }}>
              <p className="text-[15px] font-bold text-sage">{s.value}</p>
              <p className="text-[9px] text-warm-700 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Login form */}
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          onSubmit={handleLogin}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={12} className="text-sage" />
            <p className="text-2xs text-warm-700">Secure enterprise sign-in</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-2xs text-warm-700 mb-1.5">Manager ID</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="manager@naturals"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-warm-300 placeholder:text-warm-800"
                style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)', outline: 'none' }}
              />
            </div>
            <div>
              <label className="block text-2xs text-warm-700 mb-1.5">Access Code</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-warm-300 placeholder:text-warm-800"
                style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)', outline: 'none' }}
              />
            </div>
          </div>

          {error && <p className="text-2xs text-ruby">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4A7055, #5A8A65)', color: '#F5EDD8' }}>
            {loading ? (
              <><div className="w-4 h-4 rounded-full border-2 border-cream-200/30 border-t-cream-200 animate-spin" /> Authenticating…</>
            ) : (
              <><Sparkles size={13} /> Access Dashboard <ArrowRight size={13} /></>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
