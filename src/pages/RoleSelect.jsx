import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scissors, BarChart3, Sparkles, ArrowRight } from 'lucide-react';

const roles = [
  {
    id: 'stylist',
    path: '/stylist',
    icon: Scissors,
    label: 'Stylist Portal',
    sub: 'Service workflows, AI consultation & client management',
    tags: ['AI Analysis', 'Guided Service', 'Style Preview'],
    gradient: 'linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.03) 100%)',
    border: 'rgba(201,168,76,0.22)',
    glow: 'rgba(201,168,76,0.15)',
    accent: '#C9A84C',
  },
  {
    id: 'manager',
    path: '/manager',
    icon: BarChart3,
    label: 'Manager Portal',
    sub: 'Live intelligence, staff oversight & operational analytics',
    tags: ['Live Dashboard', 'Staff Analytics', 'SOP Tracking'],
    gradient: 'linear-gradient(135deg, rgba(74,112,85,0.10) 0%, rgba(74,112,85,0.03) 100%)',
    border: 'rgba(74,112,85,0.22)',
    glow: 'rgba(74,112,85,0.15)',
    accent: '#4A7055',
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0D0C0A' }}>

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(74,112,85,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-4 sm:px-6">

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center mb-14">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #DFC06A)', boxShadow: '0 8px 32px rgba(201,168,76,0.30)' }}>
            <Sparkles size={20} className="text-obsidian" />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl sm:text-3xl font-display text-cream-200 tracking-tight">Naturals</span>
            <span className="text-2xl sm:text-3xl font-display text-gold tracking-tight">AI</span>
          </div>
          <p className="text-sm text-warm-600 tracking-wide">Intelligent Salon Operations Platform</p>
        </motion.div>

        {/* Role cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              onClick={() => navigate(role.path)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className="group relative text-left p-5 sm:p-7 rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: role.gradient,
                border: `1px solid ${role.border}`,
                boxShadow: `0 0 0 0 ${role.glow}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 60px ${role.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 0 0 ${role.glow}`; }}
            >
              {/* Top ambient */}
              <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${role.accent}0D 0%, transparent 80%)` }} />

              {/* Arrow — appears on hover */}
              <motion.div
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowRight size={16} style={{ color: role.accent }} />
              </motion.div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${role.accent}18`, border: `1px solid ${role.accent}30` }}>
                  <role.icon size={18} style={{ color: role.accent }} strokeWidth={1.5} />
                </div>

                {/* Label */}
                <h2 className="text-[18px] font-semibold text-cream-200 tracking-tight mb-2">{role.label}</h2>
                <p className="text-[13px] text-warm-600 leading-relaxed mb-5">{role.sub}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {role.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-lg"
                      style={{ background: `${role.accent}12`, border: `1px solid ${role.accent}25`, color: role.accent }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center text-2xs text-warm-800 mt-10">
          Naturals AI Platform · Enterprise Edition
        </motion.p>
      </div>
    </div>
  );
}
