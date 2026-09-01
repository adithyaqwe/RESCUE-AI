import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuery } from '../api';
import { Send } from 'lucide-react';

const PROCESSING_STEPS = [
  'Analyzing incident records...',
  'Checking apparatus locations...',
  'Assessing response routes and ETAs...',
];

export const AiAssistant = () => {
  const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Operational assistant online. You can query unassigned incidents, check responder availability, or request triage summaries.',
      ts: ts(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const endRef = useRef(null);

  const quickPrompts = [
    { label: 'Unassigned incidents', query: 'Which active incidents are currently unassigned?' },
    { label: 'Available responders', query: 'How many responders are available right now?' },
    { label: 'Critical calls summary', query: 'Summarize all critical emergencies currently in queue' },
    { label: 'En-route units & ETAs', query: 'List all en-route units and their estimated arrival times' },
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % PROCESSING_STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const send = async (q) => {
    if (!q || !q.trim() || loading) return;
    const userMsg = { sender: 'user', text: q, ts: ts() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);
    setLoadingStep(0);
    try {
      const historyToSend = messages.slice(1).map(m => ({
        sender: m.sender,
        text: m.text,
      }));
      const { response } = await sendChatQuery(q, historyToSend);
      setMessages(p => [...p, { sender: 'bot', text: response, ts: ts() }]);
    } catch {
      setMessages(p => [
        ...p,
        {
          sender: 'bot',
          text: 'Unable to query dispatch records. Please verify network connectivity and try again.',
          ts: ts(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col bg-[#FFFFFF] border border-[#E2E5DF] rounded-md h-full min-h-[500px] p-5">
      {/* Header (18px section typography) */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E5DF]">
        <div>
          <h3 className="text-[17px] font-semibold text-[#111417] m-0">
            Dispatch assistant
          </h3>
          <div className="text-[12px] text-[#78828C]">
            Operational CAD queries and response summaries
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-[#475059]">
          <span className="status-dot online" />
          <span>Active</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              <div
                className="text-[11px] font-mono text-[#78828C] mb-1"
                style={{ textAlign: m.sender === 'user' ? 'right' : 'left' }}
              >
                {m.sender === 'user' ? 'Dispatcher' : 'Assistant'} · {m.ts}
              </div>
              <div
                className={`text-[13.5px] leading-relaxed p-3 rounded ${
                  m.sender === 'user'
                    ? 'bg-[#EDF3F0] text-[#111417] border border-[#CDDDD5]'
                    : 'bg-[#F6F7F5] text-[#111417] border border-[#E2E5DF]'
                }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="text-[13px] p-2.5 rounded bg-[#F6F7F5] border border-[#E2E5DF] text-[#475059] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#19483A] animate-pulse" />
              <span>{PROCESSING_STEPS[loadingStep]}</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => send(p.query)}
            className="text-[12px] whitespace-nowrap px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E2E5DF] text-[#475059] hover:border-[#19483A] hover:text-[#19483A] transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about active incidents, available units, or ETAs..."
          className="flex-1 bg-[#FFFFFF] border border-[#C8CCC3] rounded px-3 py-2 text-[13.5px] text-[#111417] outline-none focus:border-[#19483A] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded bg-[#19483A] text-white hover:bg-[#13392E] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-[13px] font-medium"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
