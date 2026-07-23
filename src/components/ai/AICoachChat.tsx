import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { ChatMessage } from '../../types';
import {
  Bot,
  Send,
  Brain,
  Globe,
  Zap,
  Sparkles,
  ExternalLink,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react';

export const AICoachChat: React.FC = () => {
  const { currentUser } = useAuth();
  const { totalIncome, totalExpense, netSavings, budgets } = useFinance();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'there'}! I am your Savorah Gemini AI Financial Coach. How can I help you optimize your budgets, tax strategies, or daily spending today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle States for prompt specifications
  const [enableThinking, setEnableThinking] = useState(false); // gemini-3.1-pro-preview with thinkingLevel HIGH
  const [enableSearch, setEnableSearch] = useState(false); // Google search grounding
  const [enableLowLatency, setEnableLowLatency] = useState(false); // gemini-3.1-flash-lite

  const promptSuggestions = [
    'How can I cut my grocery & dining bill by $150?',
    'What is a safe investment strategy for my persona?',
    'Analyze my current spending leaks',
    'How should I plan my tax deductions this quarter?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const topCategories = budgets
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 3)
        .map((b) => ({ category: b.category, spent: b.spent }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userContext: {
            name: currentUser?.name,
            persona: currentUser?.persona,
            monthlyIncome: currentUser?.monthlyIncome || totalIncome,
            totalExpense,
            netSavings,
            topCategories,
          },
          enableThinking,
          enableSearch,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.text || 'I could not process your financial request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingUrls: data.groundingUrls || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: 'Network error communicating with Savorah Gemini server. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Savorah Gemini Financial Coach
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-turn intelligent chatbot tailored to your financial profile ({currentUser?.persona}).
          </p>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* High Thinking Toggle */}
          <button
            onClick={() => {
              setEnableThinking(!enableThinking);
              if (!enableThinking) setEnableLowLatency(false);
            }}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              enableThinking
                ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm'
                : 'bg-white/80 text-slate-600 border-slate-200'
            }`}
            title="Enable High Reasoning Thinking Mode with gemini-3.1-pro-preview"
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            High Thinking {enableThinking && 'ON'}
          </button>

          {/* Search Grounding Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              enableSearch
                ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-sm'
                : 'bg-white/80 text-slate-600 border-slate-200'
            }`}
            title="Enable Google Search Grounding for live financial web data"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            Google Search {enableSearch && 'ON'}
          </button>

          {/* Low Latency Toggle */}
          <button
            onClick={() => {
              setEnableLowLatency(!enableLowLatency);
              if (!enableLowLatency) setEnableThinking(false);
            }}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              enableLowLatency
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                : 'bg-white/80 text-slate-600 border-slate-200'
            }`}
            title="Enable Low Latency mode with gemini-3.1-flash-lite"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Fast Lite {enableLowLatency && 'ON'}
          </button>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 h-[480px] flex flex-col justify-between">
        {/* Scrollable Message History */}
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-600/15'
                    : 'bg-slate-100/90 border border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounding Source Links if present */}
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 block">
                      Google Search Grounding Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingUrls.map((g, idx) => (
                        <a
                          key={idx}
                          href={g.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-600 hover:underline text-[10px] font-semibold flex items-center gap-1"
                        >
                          {g.title}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[9px] mt-1.5 text-right font-medium ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold p-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              Savorah Gemini AI is reasoning...
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-bold whitespace-nowrap">Try:</span>
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 whitespace-nowrap transition-all font-medium border border-slate-200"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100"
        >
          <input
            type="text"
            placeholder="Ask Savorah AI anything about your money, taxes, or goals..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
