import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scan, PlayCircle, BarChart3,
  LogOut, Bell, Search, Sparkles, Wand2, Settings, X, Menu
} from 'lucide-react';

import { SalonProvider, useSalon } from './context/SalonContext';
import RoleSelect      from './pages/RoleSelect';
import StylistLogin    from './pages/StylistLogin';
import ManagerLogin    from './pages/ManagerLogin';
import ManagerDashboard from './pages/ManagerDashboard';
import Dashboard       from './pages/Dashboard';
import HairAnalysis    from './pages/HairAnalysis';
import GuidedService   from './pages/GuidedService';
import Analytics       from './pages/Analytics';
import StylePreview    from './pages/StylePreview';
import AIChat          from './components/AIChat';
import ClientSelector, { ClientBadge } from './components/ClientSelector';
import { searchClients } from './services/clientStore';

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Overview'         },
  { id: 'analysis',  path: '/analysis',  icon: Scan,            label: 'AI Consultation'  },
  { id: 'service',   path: '/service',   icon: PlayCircle,      label: 'Guided Service'   },
  { id: 'style',     path: '/style',     icon: Wand2,           label: 'Style Preview', badge: 'AI' },
];
const MANAGER_NAV = { id: 'analytics', path: '/analytics', icon: BarChart3, label: 'Intelligence' };

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

/* ── Sidebar content (shared between desktop aside and mobile drawer) ── */
function SidebarContent({ navItems, activeTab, navigate, selectedClient, setShowClientSelector, loggedInStylist, handleLogout }) {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />

      {/* Brand */}
      <div className="h-[60px] flex items-center gap-3 px-5 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #DFC06A)', boxShadow: '0 2px 10px rgba(201,168,76,0.25)' }}>
          <Sparkles size={13} className="text-obsidian" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[14px] font-display text-cream-200 tracking-tight">Naturals</span>
          <span className="text-[14px] font-display text-gold tracking-tight">AI</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 space-y-0.5 relative z-10">
        <p className="section-label px-3 mb-3">Workspace</p>
        {navItems.map(({ id, path, icon: Icon, label, badge }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative ${
                active ? 'text-cream-200' : 'text-warm-600 hover:text-warm-300'
              }`}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.04) 100%)',
                border: '1px solid rgba(201,168,76,0.14)',
              } : { background: 'transparent', border: '1px solid transparent' }}>
              {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gold" />}
              <Icon size={15} strokeWidth={active ? 2 : 1.5} className={active ? 'text-gold' : ''} />
              <span className="flex-1 text-left">{label}</span>
              {badge && !active && (
                <span className="text-[9px] font-bold tracking-luxury px-1.5 py-0.5 rounded bg-gold-muted text-gold-400"
                  style={{ border: '1px solid rgba(201,168,76,0.15)' }}>{badge}</span>
              )}
            </button>
          );
        })}

        {/* Active client */}
        {selectedClient && (
          <div className="pt-5 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="section-label px-3 mb-2">Active Client</p>
            <div onClick={() => setShowClientSelector(true)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-warm-900/30"
              style={{ border: '1px solid rgba(201,168,76,0.10)', background: 'rgba(201,168,76,0.04)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.20)' }}>
                <span className="text-2xs font-bold text-gold">{selectedClient.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-cream-300 truncate">{selectedClient.name}</p>
                <p className="text-2xs text-warm-700">
                  {selectedClient.visits.length === 0 ? 'New client' : `${selectedClient.visits.length} visits`}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User card */}
      <div className="p-3 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-2xs font-bold"
            style={{
              background: `linear-gradient(135deg, ${loggedInStylist.accentColor}28, ${loggedInStylist.accentColor}0A)`,
              border: `1px solid ${loggedInStylist.accentColor}30`,
              color: loggedInStylist.accentColor,
            }}>
            {loggedInStylist.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-cream-300 truncate">{loggedInStylist.name}</p>
            <p className="text-2xs text-warm-700">{loggedInStylist.role}</p>
          </div>
          <button onClick={handleLogout} className="text-warm-700 hover:text-warm-400 transition-base" aria-label="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Stylist shell (protected) ────────────────────────────── */
function StylistShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loggedInStylist, setLoggedInStylist } = useSalon();

  const [selectedClient, setSelectedClient]         = useState(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [headerSearch, setHeaderSearch]             = useState('');
  const [searchResults, setSearchResults]           = useState([]);
  const [showSearch, setShowSearch]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]               = useState(false);
  const [showMobileSearch, setShowMobileSearch]     = useState(false);

  // Guard — redirect if not logged in as stylist
  useEffect(() => {
    if (!loggedInStylist) navigate('/stylist');
  }, [loggedInStylist, navigate]);

  if (!loggedInStylist) return null;

  const activeTab = location.pathname.replace('/', '') || 'dashboard';
  const navItems  = loggedInStylist ? [...NAV_ITEMS, MANAGER_NAV] : NAV_ITEMS;

  const navigateTo = (tab, client = null) => {
    if (client) setSelectedClient(client);
    navigate('/' + tab);
  };

  const handleSearch = (q) => {
    setHeaderSearch(q);
    if (q.trim().length > 0) {
      setSearchResults(searchClients(q).slice(0, 5));
      setShowSearch(true);
    } else {
      setShowSearch(false);
      setSearchResults([]);
    }
  };

  const selectSearchResult = (client) => {
    setSelectedClient(client);
    setHeaderSearch('');
    setShowSearch(false);
    setShowMobileSearch(false);
    navigate('/analysis');
  };

  const handleLogout = () => {
    setLoggedInStylist(null);
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0D0C0A' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] flex-col shrink-0 relative"
        style={{ background: '#0D0C0A', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <SidebarContent
          navItems={navItems}
          activeTab={activeTab}
          navigate={navigate}
          selectedClient={selectedClient}
          setShowClientSelector={setShowClientSelector}
          loggedInStylist={loggedInStylist}
          handleLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 h-full w-[240px] z-50 flex flex-col relative overflow-hidden"
              style={{ background: '#0D0C0A', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 z-20 w-7 h-7 flex items-center justify-center rounded-lg text-warm-600 hover:text-warm-300 transition-base"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                aria-label="Close menu">
                <X size={14} />
              </button>
              <SidebarContent
                navItems={navItems}
                activeTab={activeTab}
                navigate={(path) => { navigate(path); setSidebarOpen(false); }}
                selectedClient={selectedClient}
                setShowClientSelector={(v) => { setShowClientSelector(v); setSidebarOpen(false); }}
                loggedInStylist={loggedInStylist}
                handleLogout={handleLogout}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] flex items-center justify-between px-4 md:px-6 shrink-0 z-20"
          style={{ background: 'rgba(13,12,10,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warm-900/40 transition-base"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu">
              <Menu size={18} className="text-warm-500" />
            </button>

            {/* Search bar — hidden on phones */}
            <div className="hidden sm:block relative">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl w-60"
                style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Search size={12} className="text-warm-700 shrink-0" />
                <input value={headerSearch} onChange={e => handleSearch(e.target.value)}
                  onFocus={() => headerSearch && setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  placeholder="Search clients…"
                  className="bg-transparent border-none outline-none text-[13px] w-full text-warm-300 placeholder:text-warm-700" />
                {headerSearch && (
                  <button onClick={() => { setHeaderSearch(''); setShowSearch(false); }}>
                    <X size={12} className="text-warm-700 hover:text-warm-400" />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {showSearch && searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 mt-2 w-72 rounded-2xl overflow-hidden z-50"
                    style={{ background: '#1C1A17', border: '1px solid rgba(201,168,76,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                    <div className="py-2">
                      {searchResults.map(client => (
                        <button key={client.id} onMouseDown={() => selectSearchResult(client)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold/[0.04] transition-base text-left">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.18)' }}>
                            <span className="text-2xs font-bold text-gold">{client.initials}</span>
                          </div>
                          <div>
                            <p className="text-[13px] text-cream-300">{client.name}</p>
                            <p className="text-2xs text-warm-700">
                              {client.visits.length === 0 ? 'New client' : `${client.visits.length} visits`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search icon — phone only */}
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warm-900/40 transition-base"
              onClick={() => setShowMobileSearch(v => !v)}
              aria-label="Search">
              <Search size={16} className="text-warm-600" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ClientBadge client={selectedClient} onClick={() => setShowClientSelector(true)} />
            <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warm-900/40 transition-base">
              <Bell size={15} className="text-warm-600" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warm-900/40 transition-base">
              <Settings size={15} className="text-warm-600" />
            </button>
          </div>
        </header>

        {/* Mobile search overlay */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="sm:hidden px-4 py-3 z-10 shrink-0"
              style={{ background: 'rgba(13,12,10,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="relative">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
                  style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Search size={12} className="text-warm-700 shrink-0" />
                  <input
                    autoFocus
                    value={headerSearch}
                    onChange={e => handleSearch(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    placeholder="Search clients…"
                    className="bg-transparent border-none outline-none text-[13px] w-full text-warm-300 placeholder:text-warm-700" />
                  <button onClick={() => { setHeaderSearch(''); setShowSearch(false); setShowMobileSearch(false); }}>
                    <X size={12} className="text-warm-700 hover:text-warm-400" />
                  </button>
                </div>
                <AnimatePresence>
                  {showSearch && searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                      style={{ background: '#1C1A17', border: '1px solid rgba(201,168,76,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                      <div className="py-2">
                        {searchResults.map(client => (
                          <button key={client.id} onMouseDown={() => selectSearchResult(client)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold/[0.04] transition-base text-left">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.18)' }}>
                              <span className="text-2xs font-bold text-gold">{client.initials}</span>
                            </div>
                            <div>
                              <p className="text-[13px] text-cream-300">{client.name}</p>
                              <p className="text-2xs text-warm-700">
                                {client.visits.length === 0 ? 'New client' : `${client.visits.length} visits`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <section className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1280px] mx-auto px-4 py-4 md:px-8 md:py-8 pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} {...pageVariants}>
                <Routes>
                  <Route path="/dashboard" element={
                    <Dashboard selectedClient={selectedClient} onSelectClient={setSelectedClient} onNavigate={navigateTo} />
                  } />
                  <Route path="/analysis" element={
                    <HairAnalysis selectedClient={selectedClient} onSelectClient={() => setShowClientSelector(true)} />
                  } />
                  <Route path="/service" element={
                    <GuidedService selectedClient={selectedClient} onSelectClient={() => setShowClientSelector(true)} />
                  } />
                  <Route path="/style" element={
                    <StylePreview selectedClient={selectedClient} onSelectClient={() => setShowClientSelector(true)} />
                  } />
                  <Route path="/analytics" element={<Analytics />} />
                  {/* Default inner route */}
                  <Route path="*" element={
                    <Dashboard selectedClient={selectedClient} onSelectClient={setSelectedClient} onNavigate={navigateTo} />
                  } />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <AIChat />
      </main>

      {/* ── Bottom Navigation (mobile only) ─────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex items-center justify-around px-2 py-2 safe-area-bottom"
        style={{ background: '#0D0C0A', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {navItems.map(({ id, path, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-base">
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? '#C9A84C' : '#6B5E52' }} />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? '#C9A84C' : '#6B5E52' }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {showClientSelector && (
          <ClientSelector
            selectedClient={selectedClient}
            onSelect={(client) => { setSelectedClient(client); setShowClientSelector(false); }}
            onClose={() => setShowClientSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────── */
export default function App() {
  return (
    <SalonProvider>
      <Routes>
        <Route path="/"                  element={<RoleSelect />} />
        <Route path="/stylist"           element={<StylistLogin />} />
        <Route path="/manager"           element={<ManagerLogin />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/*"                 element={<StylistShell />} />
      </Routes>
    </SalonProvider>
  );
}
