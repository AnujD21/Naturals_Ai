/**
 * Database service — all Supabase operations.
 * Every function returns null (not throws) when Supabase is not configured,
 * letting callers fall back to localStorage seamlessly.
 */
import { supabase } from './supabase';

// ── Helpers ────────────────────────────────────────────────────

/** Convert a DB visits array (sorted desc by created_at) into the clientStore shape */
function shapeClient(row, visits = []) {
  return {
    id:           row.id,
    name:         row.name,
    phone:        row.phone || '',
    email:        row.email || '',
    initials:     row.initials,
    createdAt:    row.created_at,
    preferences:  row.preferences ?? { preferredStylist: '', colorHistory: [], allergies: 'Not recorded', notes: '' },
    lastAnalysis: row.last_analysis ?? null,
    visits: visits
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(v => ({ date: v.date, service: v.service, stylist: v.stylist, notes: v.notes })),
  };
}

/** Convert a DB session row to the SalonContext session shape */
function shapeSession(row) {
  return {
    id:             row.id,
    clientName:     row.client_name,
    clientInitials: row.client_initials,
    service:        row.service,
    status:         row.status,
    progress:       row.progress,
    currentStep:    row.current_step,
    totalSteps:     row.total_steps,
    stepName:       row.step_name,
    startTime:      row.start_time,
    category:       row.category,
  };
}

/** Convert a DB activity row to the SalonContext log shape */
function shapeLog(row) {
  return {
    id:      row.id,
    stylist: row.stylist_name,
    text:    row.text,
    time:    new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type:    row.type,
  };
}

// ── Stylists ───────────────────────────────────────────────────

export async function getStylists() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('stylists').select('*').order('id');
  if (error) { console.error('[db] getStylists:', error.message); return null; }
  return data.map(s => ({
    id:             s.id,
    name:           s.name,
    role:           s.role,
    specialization: s.specialization,
    shift:          s.shift,
    shiftHours:     s.shift_hours,
    initials:       s.initials,
    accentColor:    s.accent_color,
    rating:         s.rating,
    completedToday: s.completed_today,
    status:         s.status,
  }));
}

// ── Managers ───────────────────────────────────────────────────

export async function validateManager(username, password) {
  if (!supabase) return null; // null = not configured, caller decides fallback
  const { data, error } = await supabase
    .from('managers')
    .select('id')
    .eq('username', username.trim())
    .eq('password', password.trim())
    .maybeSingle();
  if (error) { console.error('[db] validateManager:', error.message); return null; }
  return Boolean(data);
}

// ── Clients ────────────────────────────────────────────────────

export async function dbGetAllClients() {
  if (!supabase) return null;
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*, visits(*)')
    .order('created_at', { ascending: false });
  if (error) { console.error('[db] getAllClients:', error.message); return null; }
  return clients.map(c => shapeClient(c, c.visits));
}

export async function dbGetClient(id) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('clients')
    .select('*, visits(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('[db] getClient:', error.message); return null; }
  return data ? shapeClient(data, data.visits) : null;
}

export async function dbSearchClients(query) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('clients')
    .select('*, visits(*)')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });
  if (error) { console.error('[db] searchClients:', error.message); return null; }
  return data.map(c => shapeClient(c, c.visits));
}

export async function dbAddClient({ name, phone = '', email = '' }) {
  if (!supabase) return null;
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const id = `c${Date.now()}`;
  const { data, error } = await supabase
    .from('clients')
    .insert({ id, name, phone, email, initials })
    .select()
    .single();
  if (error) { console.error('[db] addClient:', error.message); return null; }
  return shapeClient(data, []);
}

export async function dbAddVisit(clientId, visit) {
  if (!supabase) return null;
  const { error } = await supabase.from('visits').insert({
    client_id: clientId,
    date:      visit.date || new Date().toISOString().split('T')[0],
    service:   visit.service,
    stylist:   visit.stylist,
    notes:     visit.notes,
  });
  if (error) { console.error('[db] addVisit:', error.message); return null; }
  return dbGetClient(clientId);
}

export async function dbSaveAnalysis(clientId, analysis) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('clients')
    .update({ last_analysis: { date: new Date().toISOString().split('T')[0], ...analysis } })
    .eq('id', clientId);
  if (error) { console.error('[db] saveAnalysis:', error.message); return null; }
  return dbGetClient(clientId);
}

export async function dbUpdatePreferences(clientId, prefs) {
  if (!supabase) return null;
  // Merge with existing preferences
  const existing = await dbGetClient(clientId);
  if (!existing) return null;
  const merged = { ...existing.preferences, ...prefs };
  const { error } = await supabase
    .from('clients')
    .update({ preferences: merged })
    .eq('id', clientId);
  if (error) { console.error('[db] updatePreferences:', error.message); return null; }
  return dbGetClient(clientId);
}

// ── Sessions ───────────────────────────────────────────────────

/** Load all sessions as { [stylistId]: Session[] } */
export async function dbGetSessions() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('[db] getSessions:', error.message); return null; }
  const map = {};
  data.forEach(row => {
    if (!map[row.stylist_id]) map[row.stylist_id] = [];
    map[row.stylist_id].push(shapeSession(row));
  });
  return map;
}

export async function dbAddSession(stylistId, session) {
  if (!supabase) return;
  const { error } = await supabase.from('sessions').insert({
    id:              session.id,
    stylist_id:      stylistId,
    client_name:     session.clientName,
    client_initials: session.clientInitials,
    service:         session.service,
    status:          session.status,
    progress:        session.progress,
    current_step:    session.currentStep,
    total_steps:     session.totalSteps,
    step_name:       session.stepName,
    start_time:      session.startTime,
    category:        session.category,
  });
  if (error) console.error('[db] addSession:', error.message);
}

export async function dbUpdateSession(sessionId, updates) {
  if (!supabase) return;
  const patch = { updated_at: new Date().toISOString() };
  if (updates.progress   !== undefined) patch.progress    = updates.progress;
  if (updates.status     !== undefined) patch.status      = updates.status;
  if (updates.currentStep !== undefined) patch.current_step = updates.currentStep;
  if (updates.stepName   !== undefined) patch.step_name   = updates.stepName;
  if (updates.totalSteps !== undefined) patch.total_steps = updates.totalSteps;
  const { error } = await supabase.from('sessions').update(patch).eq('id', sessionId);
  if (error) console.error('[db] updateSession:', error.message);
}

// ── Activity Log ───────────────────────────────────────────────

export async function dbGetActivityLog() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25);
  if (error) { console.error('[db] getActivityLog:', error.message); return null; }
  return data.map(shapeLog);
}

export async function dbLogActivity(stylist, text, type) {
  if (!supabase) return;
  const { error } = await supabase
    .from('activity_log')
    .insert({ stylist_name: stylist, text, type });
  if (error) console.error('[db] logActivity:', error.message);
}
