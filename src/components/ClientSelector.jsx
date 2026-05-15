import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X, Sparkles, ChevronRight, Star } from 'lucide-react';
import { getAllClients, addClient, searchClients } from '../services/clientStore';

export default function ClientSelector({ selectedClient, onSelect, onClose }) {
  const [query, setQuery]     = useState('');
  const [clients, setClients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    (query ? searchClients(query) : getAllClients()).then(setClients);
  }, [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const client = await addClient({ name: newName.trim(), phone: newPhone.trim() });
    onSelect(client);
    setShowAdd(false); setNewName(''); setNewPhone('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl"
        style={{ background: '#161412', border: '1px solid rgba(201,168,76,0.14)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(201,168,76,0.04) 0%, transparent 100%)' }}>
          <div>
            <h2 className="text-[15px] font-semibold text-cream-200">Select Client</h2>
            <p className="text-2xs text-warm-700 mt-0.5">Choose from your client roster</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-warm-700 hover:text-warm-400 hover:bg-white/[0.05] transition-base">
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Search size={12} className="text-warm-700 shrink-0" />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-warm-300 placeholder:text-warm-800" />
            {query && (
              <button onClick={() => setQuery('')}><X size={11} className="text-warm-700" /></button>
            )}
          </div>
        </div>

        {/* Client list */}
        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
          {clients.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-warm-600">No clients found</p>
              <p className="text-2xs text-warm-800 mt-1">Try a different search or add a new client</p>
            </div>
          ) : (
            <div className="p-2">
              {clients.map(client => {
                const isNew      = client.visits.length === 0;
                const isSelected = selectedClient?.id === client.id;
                const isVIP      = client.visits.length >= 3;
                return (
                  <button key={client.id} onClick={() => onSelect(client)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group"
                    style={isSelected
                      ? { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.20)' }
                      : { border: '1px solid transparent' }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: isSelected ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isSelected ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
                      <span className={`text-2xs font-bold ${isSelected ? 'text-gold' : 'text-warm-600'}`}>{client.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-medium text-cream-300 truncate">{client.name}</p>
                        {isNew && <span className="badge text-[9px] bg-blue-500/10 text-blue-400" style={{ border: '1px solid rgba(59,130,246,0.15)' }}>New</span>}
                        {isVIP && <span className="badge-gold text-[9px]"><Star size={7} /> VIP</span>}
                      </div>
                      <p className="text-2xs text-warm-700 truncate">
                        {isNew ? 'No previous visits' : `${client.visits.length} visit${client.visits.length > 1 ? 's' : ''} · Last: ${client.visits[0]?.service}`}
                      </p>
                    </div>
                    <ChevronRight size={13} className="text-warm-800 group-hover:text-warm-500 transition-base shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new client */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <AnimatePresence>
            {showAdd ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="px-5 py-4 space-y-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Client name *"
                    className="input-luxury" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                  <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Phone (optional)"
                    className="input-luxury" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-[13px] text-warm-600 hover:text-warm-300 transition-base">
                      Cancel
                    </button>
                    <button onClick={handleAdd} disabled={!newName.trim()} className="btn-gold py-1.5 px-4 text-[12px] disabled:opacity-40">
                      Add Client
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <button onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-[13px] text-warm-600 hover:text-warm-300 transition-all duration-200 hover:bg-white/[0.02]">
                <UserPlus size={14} /> Add New Client
              </button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ClientBadge({ client, onClick }) {
  if (!client) {
    return (
      <button onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-warm-600 transition-all duration-200 hover:text-warm-300"
        style={{ border: '1px dashed rgba(255,255,255,0.10)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.20)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}>
        <UserPlus size={12} /> Select Client
      </button>
    );
  }

  const isNew = client.visits.length === 0;
  const isVIP = client.visits.length >= 3;

  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
      style={{ border: '1px solid rgba(201,168,76,0.16)', background: 'rgba(201,168,76,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)'; e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.16)'; e.currentTarget.style.background = 'rgba(201,168,76,0.05)'; }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)' }}>
        <span className="text-[9px] font-bold text-gold">{client.initials}</span>
      </div>
      <span className="text-[12px] font-medium text-cream-300">{client.name}</span>
      {isNew && <span className="badge text-[9px] bg-blue-500/10 text-blue-400" style={{ border: '1px solid rgba(59,130,246,0.15)' }}>New</span>}
      {isVIP && <span className="badge-gold text-[9px]"><Star size={7} /> VIP</span>}
    </button>
  );
}

export function ClientHistoryPanel({ client }) {
  if (!client) return null;
  const isNew = client.visits.length === 0;

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.20)' }}>
          <span className="text-xs font-bold text-gold">{client.initials}</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-cream-200">{client.name}</p>
          <p className="text-2xs text-warm-700">{isNew ? 'New Customer' : `${client.visits.length} visits`}</p>
        </div>
      </div>

      <div className="gold-line" />

      {isNew ? (
        <div className="rounded-xl px-4 py-3.5"
          style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.14)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={11} className="text-blue-400" />
            <p className="text-2xs font-semibold text-blue-400 tracking-luxury uppercase">New Customer</p>
          </div>
          <p className="text-2xs text-warm-600 leading-relaxed">
            First visit. No prior history on file. Run an AI analysis to start building their profile.
          </p>
        </div>
      ) : (
        <>
          {client.preferences && (
            <div className="space-y-2.5">
              <p className="section-label">Preferences</p>
              {client.preferences.preferredStylist && (
                <div className="flex justify-between text-2xs">
                  <span className="text-warm-700">Preferred Stylist</span>
                  <span className="text-warm-300">{client.preferences.preferredStylist}</span>
                </div>
              )}
              {client.preferences.colorHistory?.length > 0 && (
                <div className="flex justify-between text-2xs">
                  <span className="text-warm-700">Colour History</span>
                  <span className="text-warm-300 text-right max-w-[150px] truncate">{client.preferences.colorHistory.join(', ')}</span>
                </div>
              )}
              {client.preferences.allergies && (
                <div className="flex justify-between text-2xs">
                  <span className="text-warm-700">Allergies</span>
                  <span className={['None known', 'None'].includes(client.preferences.allergies) ? 'text-sage' : 'text-ruby'}>
                    {client.preferences.allergies}
                  </span>
                </div>
              )}
              {client.preferences.notes && (
                <p className="text-2xs text-warm-700 italic mt-1">"{client.preferences.notes}"</p>
              )}
            </div>
          )}

          <div className="space-y-2.5">
            <p className="section-label">Recent Visits</p>
            {client.visits.slice(0, 3).map((v, i) => (
              <div key={i} className="flex items-start justify-between text-2xs gap-3">
                <div>
                  <p className="text-warm-300 font-medium">{v.service}</p>
                  <p className="text-warm-700 mt-0.5 leading-relaxed">{v.notes}</p>
                </div>
                <span className="text-warm-800 font-mono shrink-0">{v.date}</span>
              </div>
            ))}
          </div>

          {client.lastAnalysis && (
            <div className="space-y-2">
              <p className="section-label">Last Analysis</p>
              <div className="rounded-xl px-3.5 py-3 space-y-1.5"
                style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { label: 'Hair Type', value: client.lastAnalysis.hairType, cls: 'text-warm-300' },
                  { label: 'Porosity',  value: client.lastAnalysis.porosity, cls: 'text-warm-300' },
                  { label: 'Damage',    value: client.lastAnalysis.damage,   cls: 'text-ruby' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-2xs">
                    <span className="text-warm-700">{row.label}</span>
                    <span className={row.cls}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
