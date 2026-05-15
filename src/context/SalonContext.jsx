import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStylists, dbGetSessions, dbAddSession, dbUpdateSession, dbGetActivityLog, dbLogActivity } from '../services/db';
import { getServicePrice } from '../services/pricing';

/* ── Fallback stylist data (shown instantly, replaced by DB data) */
export const STYLISTS_DATA = [
  { id: 's1', name: 'Aisha', role: 'Senior Colorist', specialization: 'Balayage & Color Correction', shift: 'Morning Shift',   shiftHours: '9:00 AM – 3:00 PM',  initials: 'AI', accentColor: '#C9A84C', rating: 4.9, completedToday: 2, status: 'active' },
  { id: 's2', name: 'Priya', role: 'Style Specialist', specialization: 'Hair Spa & Treatments',       shift: 'Full Day',        shiftHours: '9:00 AM – 6:00 PM',  initials: 'PR', accentColor: '#A0B89A', rating: 4.8, completedToday: 3, status: 'active' },
  { id: 's3', name: 'Kavya', role: 'Master Stylist',   specialization: 'Precision Cuts & Blowouts',   shift: 'Afternoon Shift', shiftHours: '12:00 PM – 8:00 PM', initials: 'KV', accentColor: '#7BA7BC', rating: 4.7, completedToday: 1, status: 'active' },
];

/* ── Demo seed sessions (visible before DB loads) ─────────── */
const INITIAL_SESSIONS = {
  s1: [
    { id: 'sess_1', clientName: 'Meera', clientInitials: 'ME', service: 'Balayage & Color',  status: 'In Progress',   progress: 65, currentStep: 3, totalSteps: 4, stepName: 'Processing',         startTime: '10:30 AM', category: 'Color'        },
    { id: 'sess_2', clientName: 'Sana',  clientInitials: 'SA', service: 'AI Consultation',   status: 'Pending',       progress: 0,  currentStep: 1, totalSteps: 4, stepName: 'Consultation',       startTime: '11:45 AM', category: 'Consultation' },
  ],
  s2: [
    { id: 'sess_3', clientName: 'Riya',   clientInitials: 'RI', service: 'Hair Spa Treatment', status: 'In Progress',   progress: 40, currentStep: 2, totalSteps: 4, stepName: 'Application',        startTime: '09:15 AM', category: 'Treatment' },
    { id: 'sess_4', clientName: 'Ananya', clientInitials: 'AN', service: 'Style Preview (AI)', status: 'AI Processing', progress: 80, currentStep: 3, totalSteps: 3, stepName: 'Generating Preview', startTime: '11:00 AM', category: 'Style'     },
  ],
  s3: [
    { id: 'sess_5', clientName: 'Diya', clientInitials: 'DI', service: 'Guided Color Service', status: 'Active', progress: 50, currentStep: 2, totalSteps: 5, stepName: 'Bleach Application', startTime: '10:00 AM', category: 'Bleach' },
  ],
};

const INITIAL_LOG = [
  { id: 1, stylist: 'Aisha', text: 'started Balayage for Meera',         time: '10:32 AM', type: 'service' },
  { id: 2, stylist: 'Priya', text: 'completed Hair Spa step 1 for Riya', time: '10:48 AM', type: 'step'    },
  { id: 3, stylist: 'Aisha', text: 'AI analysis queued for Sana',          time: '11:02 AM', type: 'ai'     },
  { id: 4, stylist: 'Kavya', text: 'started Guided Service for Diya',      time: '11:15 AM', type: 'service' },
  { id: 5, stylist: 'Priya', text: 'Style Preview generating for Ananya',  time: '11:22 AM', type: 'ai'     },
];

/* ── Context ──────────────────────────────────────────────── */
const SalonContext = createContext(null);

export function SalonProvider({ children }) {
  const [stylists, setStylists]               = useState(STYLISTS_DATA);
  const [sessions, setSessions]               = useState(INITIAL_SESSIONS);
  const [loggedInStylist, setLoggedInStylist] = useState(null);
  const [managerLoggedIn, setManagerLoggedIn] = useState(false);
  const [activityLog, setActivityLog]         = useState(INITIAL_LOG);
  const [stylistRevenue, setStylistRevenue]   = useState({ s1: 0, s2: 0, s3: 0 });

  /* Load real data from DB on mount, updating UI once it arrives */
  useEffect(() => {
    getStylists().then(data      => { if (data?.length)                setStylists(data);   });
    dbGetSessions().then(data    => { if (data && Object.keys(data).length) setSessions(data); });
    dbGetActivityLog().then(data => { if (data?.length)                setActivityLog(data); });
  }, []);

  const logActivity = useCallback((stylist, text, type = 'service') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setActivityLog(prev => [{ id: Date.now(), stylist, text, time, type }, ...prev].slice(0, 25));
    dbLogActivity(stylist, text, type);
  }, []);

  const updateSession = useCallback((stylistId, sessionId, updates) => {
    setSessions(prev => ({
      ...prev,
      [stylistId]: (prev[stylistId] || []).map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    }));
    dbUpdateSession(sessionId, updates);
  }, []);

  const addRevenue = useCallback((stylistId, amount) => {
    setStylistRevenue(prev => ({ ...prev, [stylistId]: (prev[stylistId] || 0) + amount }));
  }, []);

  const completeSession = useCallback((stylistId, sessionId) => {
    setSessions(prev => {
      const updated = {
        ...prev,
        [stylistId]: (prev[stylistId] || []).map(s =>
          s.id === sessionId ? { ...s, status: 'Completed', progress: 100 } : s
        ),
      };
      // Add revenue for the completed session
      const session = (prev[stylistId] || []).find(s => s.id === sessionId);
      if (session) {
        const price = getServicePrice(session.service, session.category);
        setStylistRevenue(r => ({ ...r, [stylistId]: (r[stylistId] || 0) + price }));
      }
      return updated;
    });
    dbUpdateSession(sessionId, { status: 'Completed', progress: 100 });
  }, []);

  const addSession = useCallback((stylistId, session) => {
    const newSession = { id: `sess_${Date.now()}`, ...session };
    setSessions(prev => ({
      ...prev,
      [stylistId]: [...(prev[stylistId] || []), newSession],
    }));
    dbAddSession(stylistId, newSession);
  }, []);

  const getKPIs = useCallback(() => {
    const all       = Object.values(sessions).flat();
    const active    = all.filter(s => s.status !== 'Completed');
    const completed = all.filter(s => s.status === 'Completed');
    const live      = all.filter(s => ['In Progress', 'Active', 'AI Processing'].includes(s.status));
    const avgProg   = live.length
      ? Math.round(live.reduce((sum, s) => sum + s.progress, 0) / live.length)
      : 0;
    const busyStylistIds = Object.keys(sessions).filter(id =>
      (sessions[id] || []).some(s => s.status !== 'Completed')
    );
    return {
      totalActive:    active.length,
      totalCompleted: completed.length,
      liveServices:   live.length,
      avgProgress:    avgProg,
      totalClients:   all.length,
      activeStylists: busyStylistIds.length,
    };
  }, [sessions]);

  return (
    <SalonContext.Provider value={{
      stylists,
      sessions,
      loggedInStylist,
      setLoggedInStylist,
      managerLoggedIn,
      setManagerLoggedIn,
      activityLog,
      logActivity,
      updateSession,
      completeSession,
      addSession,
      getKPIs,
      stylistRevenue,
      addRevenue,
    }}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) throw new Error('useSalon must be used within SalonProvider');
  return ctx;
}
