import React, { useRef, useEffect } from 'react';
import { ConvoyChatMessage, Profile, ConvoyBeacon } from '../../../types';
import { 
  Send, 
  UserPlus, 
  X, 
  ShieldCheck, 
  MapPin, 
  Radio, 
  RadioTower, 
  Volume2,
  Clock
} from 'lucide-react';

interface ConvoyChatRoomProps {
  convoy: ConvoyBeacon;
  messages: ConvoyChatMessage[];
  currentUser: Profile;
  input: string;
  onInputChange: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ConvoyChatRoom({ 
  convoy, 
  messages, 
  currentUser, 
  input, 
  onInputChange, 
  onSend,
  onClose
}: ConvoyChatRoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-right-5 duration-300">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight">{convoy.title}</h4>
            <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-bold">
              <span className="flex items-center space-x-1">
                <RadioTower className="w-3 h-3 text-emerald-500" />
                <span>CH {convoy.cbChannel} Comms</span>
              </span>
              <span>•</span>
              <span>{convoy.members.length} Drivers Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Corridor Info Mini-bar */}
      <div className="px-5 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-[10px]">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-zinc-400">
            <MapPin className="w-3 h-3 text-amber-500" />
            <span className="font-bold text-zinc-300">{convoy.corridor}: {convoy.currentMileMarker}</span>
          </span>
          <span className="flex items-center space-x-1 text-zinc-400">
            <Volume2 className="w-3 h-3 text-sky-400" />
            <span className="font-bold text-zinc-300">{convoy.cruisingSpeedMph} MPH</span>
          </span>
        </div>
        <div className="flex -space-x-2">
          {convoy.members.slice(0, 3).map(m => (
            <img key={m.id} src={m.avatarUrl} className="w-5 h-5 rounded-full border-2 border-slate-800 object-cover" alt="" />
          ))}
          {convoy.members.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold">
              +{convoy.members.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
            <Radio className="w-10 h-10 text-zinc-400" />
            <p className="text-xs font-bold text-zinc-500">Channel squelch clear.<br/>Radio check, anyone out there?</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.id === currentUser.id;
            return (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="relative shrink-0">
                    <img src={msg.sender.avatarUrl} className="w-8 h-8 rounded-full border border-zinc-200 object-cover" alt="" />
                    {msg.sender.isVerified && (
                      <div className="absolute -right-0.5 -bottom-0.5 bg-white rounded-full">
                        <ShieldCheck className="w-3 h-3 text-sky-500 fill-sky-500 stroke-white" />
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center space-x-1.5 text-[10px] mb-0.5 ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-black text-slate-800">@{msg.sender.username}</span>
                    <span className="text-zinc-400 font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`px-3 py-2 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-amber-500 text-slate-950 rounded-tr-none' 
                      : 'bg-white border border-zinc-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={onSend}
        className="p-4 bg-white border-t border-zinc-100 flex items-center space-x-2"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={`Ch ${convoy.cbChannel} Voice Comms...`}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-zinc-100 border-none rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
          <div className="absolute right-3 top-3">
            <Volume2 className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
        <button 
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center rounded-2xl transition-all disabled:opacity-50 disabled:grayscale"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
