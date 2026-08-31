import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuery } from '../api';
import { Send, ChevronRight } from 'lucide-react';

interface Message { sender: 'user' | 'bot'; text: string; ts: string; }

export const AiAssistant: React.FC = () => {
  const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const [messages, setMessages] = useState<Message[]>([{
    sender: 'bot',
    text: 'COMMAND INTELLIGENCE ONLINE. Query the network for active incidents, responder availability, or operation summaries.',
    ts: ts(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'Unassigned', query: 'Which active incidents are unassigned?' },
    { label: 'Fleet Status', query: 'How many responders are available?' },
    { label: 'Criticals', query: 'Summarize active critical emergencies' },
    { label: 'ETAs', query: 'List all en-route units and their ETAs' },
    { label: 'Ops Summary', query: "Summarize today's incidents" },
  ];

  const send = async (q: string) => {
    if (!q.trim() || loading) return;
    const userMsg: Message = { sender: 'user', text: q, ts: ts() };
    setMessages(p => [...p, userMsg]);
    setInput(''); setLoading(true);
    try {
      const historyToSend = messages.slice(1).map(m => ({
        sender: m.sender,
        text: m.text
      }));
      const { response } = await sendChatQuery(q, historyToSend);
      setMessages(p => [...p, { sender: 'bot', text: response, ts: ts() }]);
    } catch {
      setMessages(p => [...p, { sender: 'bot', text: 'AI ENGINE DEGRADED — LOCAL FALLBACK ACTIVE. Try again.', ts: ts() }]);
    } finally { setLoading(false); }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  return (
    <div
      className="flex flex-col hud-bracket"
      style={{ background: '#0D141C', border: '1px solid #243442', borderRadius: '6px', height: '380px', padding: '14px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-mono tracking-widest uppercase" style={{ color: '#8EA2B2' }}>02 //</div>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8F0F5' }}>Command Intelligence</span>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm flex items-center gap-1"
            style={{ background: '#111B24', border: '1px solid rgba(69,184,122,0.3)', color: '#45B87A' }}
          >
            <span className="status-dot online" style={{ width: '5px', height: '5px' }} />
            {loading ? 'PROCESSING' : 'LISTENING'}
          </span>
        </div>
        <span className="text-[8px] font-mono" style={{ color: '#243442' }}>GEMINI LIVE</span>
      </div>

      <hr className="hud-divider mb-3" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div style={{ maxWidth: '88%' }}>
              <div
                className="text-[9px] font-mono mb-0.5"
                style={{ color: '#243442', textAlign: m.sender === 'user' ? 'right' : 'left' }}
              >
                {m.sender === 'user' ? 'OPERATOR' : 'SYSTEM'} · {m.ts}
              </div>
              {m.sender === 'user' ? (
                <div
                  className="text-[11px] leading-relaxed px-3 py-2 rounded-sm"
                  style={{ background: 'rgba(79,163,209,0.12)', border: '1px solid rgba(79,163,209,0.25)', color: '#E8F0F5' }}
                >
                  <span className="font-mono" style={{ color: '#4FA3D1' }}>&gt; </span>{m.text}
                </div>
              ) : (
                <div
                  className="text-[11px] leading-relaxed px-3 py-2 rounded-sm"
                  style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
                >
                  {m.text}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="text-[10px] font-mono px-3 py-2 rounded-sm"
              style={{ background: '#111B24', border: '1px solid #243442', color: '#4FA3D1' }}
            >
              ANALYZING NETWORK<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => send(p.query)}
            className="text-[9px] font-mono whitespace-nowrap px-2 py-1 rounded-sm transition-all"
            style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4FA3D1'; e.currentTarget.style.color = '#4FA3D1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#243442'; e.currentTarget.style.color = '#8EA2B2'; }}
          >
            <ChevronRight className="w-2.5 h-2.5 inline mr-0.5" />{p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2"
        style={{ background: '#111B24', border: '1px solid #243442', borderRadius: '4px', padding: '4px 8px' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#4FA3D1')}
        onBlur={e => (e.currentTarget.style.borderColor = '#243442')}
      >
        <span className="font-mono text-xs" style={{ color: '#4FA3D1', flexShrink: 0 }}>&gt;</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter command..."
          className="flex-1 bg-transparent outline-none text-xs font-mono"
          style={{ color: '#E8F0F5' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? 'rgba(79,163,209,0.15)' : 'transparent',
            border: '1px solid',
            borderColor: input.trim() && !loading ? 'rgba(79,163,209,0.4)' : '#243442',
            borderRadius: '3px', padding: '3px 6px', color: input.trim() && !loading ? '#4FA3D1' : '#243442',
          }}
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
