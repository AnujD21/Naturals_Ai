import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ArrowUp, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { askGemini, getApiStatus } from '../services/gemini';

const SUGGESTIONS = [
  'Best toner for brassy highlights?',
  'How to fix uneven colour?',
  'Olaplex vs K18 — which is better?',
];

/* Render plain text with bold (**text**) and line-breaks */
function ChatText({ text }) {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={li}>
            {li > 0 && <br />}
            {parts.map((part, pi) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={pi} className="font-semibold text-cream-200">{part.slice(2, -2)}</strong>
                : part
            )}
          </span>
        );
      })}
    </span>
  );
}

export default function AIChat() {
  const [open, setOpen]     = useState(false);
  const [msg, setMsg]       = useState('');
  const [chat, setChat]     = useState([
    { role: 'ai', text: "Hello! I'm your Naturals AI assistant. Ask me about formulas, colour correction, or product recommendations." },
  ]);
  const [loading, setLoading] = useState(false);
  const [apiLive, setApiLive] = useState(null);
  const scrollRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = async (text) => {
    const q = (text || msg).trim();
    if (!q || loading) return;
    setMsg('');

    const newChat = [...chat, { role: 'user', text: q }];
    setChat(newChat);
    setLoading(true);

    // Pass conversation history (exclude the initial greeting)
    const history = newChat.slice(1);
    const reply = await askGemini(q, history.slice(0, -1)); // history before this message
    setApiLive(getApiStatus());
    setChat(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 w-[360px] flex flex-col overflow-hidden rounded-2xl"
            style={{ height: 500, background: '#161412', border: '1px solid rgba(201,168,76,0.14)', boxShadow: '0 24px 64px rgba(0,0,0,0.65)' }}
          >
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 100%)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #DFC06A)', boxShadow: '0 2px 10px rgba(201,168,76,0.25)' }}>
                  <Sparkles size={12} className="text-obsidian" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-cream-200 leading-none">Naturals AI</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {apiLive === null  && <><div className="w-1.5 h-1.5 rounded-full bg-warm-700" /><p className="text-[10px] text-warm-700">Ready</p></>}
                    {apiLive === true  && <><Wifi size={9} className="text-sage" /><p className="text-[10px] text-sage">Live AI</p></>}
                    {apiLive === false && <><WifiOff size={9} className="text-ruby" /><p className="text-[10px] text-ruby">Offline Mode</p></>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {chat.length > 1 && (
                  <button onClick={() => setChat([chat[0]])}
                    className="text-2xs text-warm-700 hover:text-warm-400 transition-base px-2 py-1 rounded-lg hover:bg-white/[0.04]">
                    Clear
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-warm-700 hover:text-warm-400 hover:bg-white/[0.05] transition-base">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3">
              {chat.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    c.role === 'user' ? 'rounded-br-sm text-obsidian' : 'rounded-bl-sm text-warm-400'
                  }`}
                    style={c.role === 'user'
                      ? { background: 'linear-gradient(135deg, #C9A84C, #DFC06A)' }
                      : { background: '#1C1A17', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <ChatText text={c.text} />
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-1 px-3.5 py-2.5 w-fit rounded-2xl rounded-bl-sm"
                  style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-warm-700"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </motion.div>
              )}

              {/* Suggestions — shown only on first message */}
              {chat.length === 1 && !loading && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-2xs text-warm-800 px-1">Try asking</p>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => send(s)}
                      className="w-full text-left px-3 py-2 rounded-xl text-2xs text-warm-600 transition-all duration-200"
                      style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.color = '#E8DDD0'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = ''; }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
                style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                <input
                  ref={inputRef}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask anything about hair…"
                  disabled={loading}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-warm-300 placeholder:text-warm-800 disabled:opacity-50"
                />
                <button onClick={() => send()} disabled={!msg.trim() || loading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  style={{ background: msg.trim() && !loading ? 'linear-gradient(135deg, #C9A84C, #DFC06A)' : 'rgba(255,255,255,0.05)' }}>
                  <ArrowUp size={13} className={msg.trim() && !loading ? 'text-obsidian' : 'text-warm-700'} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button onClick={() => setOpen(!open)} whileTap={{ scale: 0.90 }}
        style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #C9A84C, #DFC06A)', boxShadow: '0 4px 24px rgba(201,168,76,0.30)', borderRadius: 16 }}
        className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90,  opacity: 0 }}><X size={18} className="text-obsidian" /></motion.div>
            : <motion.div key="mc" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={18} className="text-obsidian" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
