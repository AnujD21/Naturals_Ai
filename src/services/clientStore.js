/**
 * Client data store — Supabase-backed with localStorage fallback.
 * All functions are async. If Supabase is not configured the app
 * continues to work using localStorage exactly as before.
 */
import {
  dbGetAllClients, dbGetClient, dbSearchClients,
  dbAddClient, dbAddVisit, dbSaveAnalysis, dbUpdatePreferences,
} from './db';

const STORAGE_KEY = 'salonpilot_clients_v2';

/* ── Seed data (used when no DB and no localStorage data) ──── */
const SEED_CLIENTS = [
  {
    id: 'c1', name: 'Meera Kapoor', phone: '+91 98201 34012', email: 'meera.kapoor@email.com',
    initials: 'MK', createdAt: '2025-11-02T10:00:00Z',
    visits: [
      { date: '2026-04-20', service: 'Balayage & Gloss',  stylist: 'Aisha Sharma', notes: 'Level 7 Ash Brown, 20Vol dev, 35min process' },
      { date: '2026-03-08', service: 'Root Retouch',       stylist: 'Aisha Sharma', notes: 'Same formula #8821' },
      { date: '2025-12-15', service: 'Full Color + Cut',   stylist: 'Priya Nair',   notes: 'First visit. Wanted warmer tones.' },
    ],
    preferences: { preferredStylist: 'Aisha Sharma', colorHistory: ['Level 7 Ash Brown', 'Level 6 Warm Chestnut'], allergies: 'None known', notes: 'Prefers low-ammonia formulas. Sensitive scalp.' },
    lastAnalysis: { date: '2026-04-20', hairType: 'Type 2B — Wavy', porosity: 'High', damage: 'Moderate — heat damage at ends', confidence: 96 },
  },
  {
    id: 'c2', name: 'Rohan Verma', phone: '+91 99871 44550', email: 'rohan.verma@email.com',
    initials: 'RV', createdAt: '2026-01-10T10:00:00Z',
    visits: [{ date: '2026-05-01', service: 'Root Retouch', stylist: 'Priya Nair', notes: 'Level 4 Natural Black, 10Vol' }],
    preferences: { preferredStylist: 'Priya Nair', colorHistory: ['Level 4 Natural Black'], allergies: 'PPD sensitivity — use PPD-free color', notes: 'Short processing time preferred.' },
    lastAnalysis: null,
  },
  {
    id: 'c3', name: 'Sana Iyer', phone: '+91 97302 22890', email: 'sana.iyer@email.com',
    initials: 'SI', createdAt: '2026-03-22T10:00:00Z',
    visits: [{ date: '2026-04-28', service: 'Extensions Install', stylist: 'Aisha Sharma', notes: '22-inch tape-ins, Shade 8/11' }],
    preferences: { preferredStylist: 'Aisha Sharma', colorHistory: ['Level 8 Platinum Ash'], allergies: 'None', notes: 'Wants to go lighter next visit.' },
    lastAnalysis: null,
  },
];

/* ── localStorage helpers ─────────────────────────────────── */
function lsLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CLIENTS));
  return SEED_CLIENTS;
}

function lsSave(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

/* ── Public API (all async) ───────────────────────────────── */

export async function getAllClients() {
  const db = await dbGetAllClients();
  if (db) return db;
  return lsLoad();
}

export async function getClient(id) {
  const db = await dbGetClient(id);
  if (db !== null) return db;
  return lsLoad().find(c => c.id === id) || null;
}

export async function searchClients(query) {
  const q = query.toLowerCase().trim();
  if (!q) return getAllClients();
  const db = await dbSearchClients(q);
  if (db) return db;
  return lsLoad().filter(c => c.name.toLowerCase().includes(q));
}

export async function addClient({ name, phone = '', email = '' }) {
  const db = await dbAddClient({ name, phone, email });
  if (db) return db;

  const clients = lsLoad();
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const newClient = {
    id: `c${Date.now()}`, name, phone, email, initials,
    createdAt: new Date().toISOString(), visits: [],
    preferences: { preferredStylist: '', colorHistory: [], allergies: 'Not recorded', notes: '' },
    lastAnalysis: null,
  };
  clients.unshift(newClient);
  lsSave(clients);
  return newClient;
}

export async function addVisit(clientId, visit) {
  const db = await dbAddVisit(clientId, visit);
  if (db) return db;

  const clients = lsLoad();
  const client = clients.find(c => c.id === clientId);
  if (!client) return null;
  client.visits.unshift({ date: new Date().toISOString().split('T')[0], ...visit });
  lsSave(clients);
  return client;
}

export async function updatePreferences(clientId, prefs) {
  const db = await dbUpdatePreferences(clientId, prefs);
  if (db) return db;

  const clients = lsLoad();
  const client = clients.find(c => c.id === clientId);
  if (!client) return null;
  client.preferences = { ...client.preferences, ...prefs };
  lsSave(clients);
  return client;
}

export async function saveAnalysis(clientId, analysis) {
  const db = await dbSaveAnalysis(clientId, analysis);
  if (db) return db;

  const clients = lsLoad();
  const client = clients.find(c => c.id === clientId);
  if (!client) return null;
  client.lastAnalysis = { date: new Date().toISOString().split('T')[0], ...analysis };
  lsSave(clients);
  return client;
}

export async function isNewClient(clientId) {
  const client = await getClient(clientId);
  return client ? client.visits.length === 0 : true;
}

export async function getVisitCount(clientId) {
  const client = await getClient(clientId);
  return client ? client.visits.length : 0;
}
