import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, SendHorizonal, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getToken } from '../../../services/api';
import { Markdown } from '../../../components/ai/Markdown';

interface Msg {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  streaming?: boolean;
  error?: boolean;
}

const SUGGESTIONS: Record<string, string[]> = {
  student: [
    'How can I save ₹2,000 this month?',
    'Is my entertainment spending too high?',
    'Help me budget my allowance',
  ],
  professional: [
    'What is my savings rate and how do I improve it?',
    'Can I afford a ₹40,000 purchase right now?',
    'Where should I cut spending to invest more?',
  ],
  family: [
    'How are our household budgets doing?',
    'Plan an emergency fund for my family',
    'Which bills grew the most this month?',
  ],
  senior: [
    'Is my pension covering my essentials?',
    'Summarize my medical spending',
    'How much can I safely spend this month?',
  ],
};

const CoachView: React.FC = () => {
  const { currentUser } = useAuth();
  const persona = currentUser?.persona || 'professional';

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Namaste ${currentUser?.name?.split(' ')[0] || ''}! I'm your Savorah coach — I've read your transactions, budgets and goals. Ask me anything about your money.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, sender: 'user', text: trimmed };
    const aiId = `a-${Date.now()}`;
    const history = [...messages, userMsg];

    setMessages([...history, { id: aiId, sender: 'ai', text: '', streaming: true }]);
    setInput('');
    setBusy(true);

    const updateAi = (updater: (prev: Msg) => Msg) =>
      setMessages((msgs) => msgs.map((m) => (m.id === aiId ? updater(m) : m)));

    try {
      const token = getToken();
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== 'welcome' && !m.error)
            .map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Coach unavailable (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) streamError = parsed.error;
            if (parsed.delta) {
              full += parsed.delta;
              updateAi((m) => ({ ...m, text: full }));
            }
          } catch {
            // partial chunk
          }
        }
      }

      if (!full && streamError) throw new Error(streamError);
      if (!full) throw new Error('The coach returned an empty reply. Please try again.');
      updateAi((m) => ({ ...m, streaming: false }));
    } catch (e: any) {
      updateAi((m) => ({
        ...m,
        streaming: false,
        error: true,
        text: e?.message || 'Something went wrong. Please try again.',
      }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11.5rem)] lg:h-[calc(100vh-9.5rem)] min-h-[26rem]">
      {/* Header */}
      <div className="flex items-center gap-3.5 pb-5">
        <div className="w-12 h-12 rounded-2xl btn-accent flex items-center justify-center relative">
          <Sparkles className="w-5.5 h-5.5" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-ink-950" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold">AI Coach</h1>
          <p className="text-xs text-mist-500">Grounded in your live transactions, budgets & goals</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar glass card-ring rounded-3xl p-5 space-y-5"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : ''}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl btn-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4.5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-white/10 border border-white/10 rounded-br-md'
                    : m.error
                      ? 'bg-rose-500/10 border border-rose-400/25 text-rose-200 rounded-tl-md'
                      : 'glass rounded-tl-md'
                }`}
              >
                {m.sender === 'ai' && !m.error && m.text ? (
                  <Markdown content={m.text} />
                ) : (
                  m.text
                )}
                {m.streaming && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                {m.streaming && !m.text && (
                  <span className="inline-flex gap-1 items-center" aria-label="Coach is thinking">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--accent)' }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </span>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-mist-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {(SUGGESTIONS[persona] || SUGGESTIONS.professional).map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="glass px-4 py-2.5 rounded-2xl text-xs font-medium text-mist-300 hover:text-white hover:bg-white/8 transition-colors whitespace-nowrap shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 glass-strong card-ring rounded-3xl p-2 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your money — budgets, goals, spending…"
          className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-mist-500 focus:outline-none"
          disabled={busy}
          aria-label="Message the AI coach"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-accent w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-40 shrink-0"
          aria-label="Send message"
        >
          <SendHorizonal className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};

export default CoachView;
