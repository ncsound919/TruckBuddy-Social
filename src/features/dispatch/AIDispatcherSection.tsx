import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { Truck, Send, HelpCircle, Shield, AlertTriangle, CloudRain, Scale } from 'lucide-react';

export default function AIDispatcherSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'init-msg',
        sender: 'dispatcher',
        text: "Ten-four, Driver! I'm your AI Dispatch Copilot. I can help you stay safe and fully compliant on the highway. Ask me anything about:\n\n• **Hours of Service (HOS)** split-sleeper berth rules\n• **DOT Inspection Checklists** (Level 1 and 2 checkouts)\n• **Wyoming I-80 winter safety** and high-wind regulations\n• **Cargo Securement** straps & chain calculations\n• **Owner-Operator tax deductions** and per-diem rules.\n\nWhat's your route or cargo query today?",
        createdAt: new Date().toISOString()
      }
    ]);
  }, []);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/dispatcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.text,
          history: messages.slice(-6) // Include up to last 6 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Dispatcher temporarily offline');
      }

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'dispatcher',
        text: data.text || "Ten-four, Driver. I'm experiencing some cellular dead-zones, let me recalculate. Try asking that again.",
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, replyMsg]);

    } catch (error) {
      console.error('Error fetching AI dispatcher:', error);
      const errorMsg: ChatMessage = {
        id: `reply-err-${Date.now()}`,
        sender: 'dispatcher',
        text: "⚠️ *Unable to reach primary GPS satellite dispatch. Check your internet connection or try a simplified HOS query.*",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetTap = (query: string) => {
    handleSendMessage(query);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm flex flex-col h-[600px]" id="dispatcher-container">
      {/* HEADER SPECS */}
      <div className="px-5 py-4 border-b border-zinc-100 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950">
            <Truck className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">AI Dispatch Copilot</h3>
            <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">Active DOT Compliance Assist</span>
          </div>
        </div>

        <span className="flex items-center text-[10px] font-bold uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          ● Secure Satellite Feed
        </span>
      </div>

      {/* CHAT MESSAGES PANEL */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/50" id="dispatcher-chat-board">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar icon */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-slate-800 text-white' 
                : 'bg-amber-500 text-slate-950 font-bold text-xs'
            }`}>
              {msg.sender === 'user' ? 'ME' : 'DP'}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl p-4 text-xs font-normal leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-zinc-100 shadow-sm text-slate-800 space-y-2'
            }`}>
              {/* Parse bold bullets beautifully */}
              <p className="whitespace-pre-line">{msg.text}</p>
              
              <span className={`block text-[9px] mt-2 text-right ${
                msg.sender === 'user' ? 'text-zinc-400' : 'text-zinc-400'
              }`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-7 h-7 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center">DP</div>
            <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center space-x-2 shadow-sm text-xs text-zinc-500">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Dispatcher is calculating route split guidelines...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* HELPER TIPS CHIPS */}
      <div className="p-4 bg-white border-t border-zinc-100 space-y-2.5" id="dispatcher-quick-chips">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tap for instant compliance logs:</span>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'hos-rules', text: 'FMCSA HOS split sleeper berth rules', icon: <Scale className="w-3.5 h-3.5" /> },
            { id: 'wy-wind', text: 'Wyoming I-80 high-wind safety', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
            { id: 'dot-check', text: 'DOT Level 1 Inspection checklist', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'cargo-limit', text: 'Flatbed strap & chain calculations', icon: <Truck className="w-3.5 h-3.5" /> },
            { id: 'tax-write', text: 'Owner-Operator daily tax deductions', icon: <HelpCircle className="w-3.5 h-3.5" /> }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => handlePresetTap(chip.text)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-[11px] text-zinc-600 hover:text-slate-900 hover:border-zinc-400 transition-all bg-zinc-50 shrink-0 font-semibold"
            >
              {chip.icon}
              <span>{chip.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INPUT FORM PANEL */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
        className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center space-x-3 rounded-b-2xl"
        id="dispatcher-input-form"
      >
        <input
          type="text"
          placeholder="Ask Dispatcher about logs, securements, rest-break split caps..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-xs rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-10 h-10 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
