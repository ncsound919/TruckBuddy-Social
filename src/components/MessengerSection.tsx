import React, { useState, useEffect, useRef } from 'react';
import { MessageThread, DirectMessage, Profile } from '../types';
import { initialMessageThreads, initialDirectMessages } from '../data';
import { MessageSquare, Send, Users, ShieldAlert, Check, Clock, UserCheck } from 'lucide-react';

export default function MessengerSection() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from local storage or seed
    const cachedThreads = localStorage.getItem('trucker_msg_threads');
    const cachedDMs = localStorage.getItem('trucker_dms');

    if (cachedThreads) {
      setThreads(JSON.parse(cachedThreads));
    } else {
      setThreads(initialMessageThreads);
      localStorage.setItem('trucker_msg_threads', JSON.stringify(initialMessageThreads));
    }

    if (cachedDMs) {
      setMessages(JSON.parse(cachedDMs));
    } else {
      setMessages(initialDirectMessages);
      localStorage.setItem('trucker_dms', JSON.stringify(initialDirectMessages));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedThread, isTyping]);

  const saveThreads = (updated: MessageThread[]) => {
    setThreads(updated);
    localStorage.setItem('trucker_msg_threads', JSON.stringify(updated));
  };

  const saveDMs = (updated: DirectMessage[]) => {
    setMessages(updated);
    localStorage.setItem('trucker_dms', JSON.stringify(updated));
  };

  const activeMessages = selectedThread
    ? messages.filter(m => m.threadId === selectedThread.id)
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedThread) return;

    const userMsg: DirectMessage = {
      id: `dm-user-${Date.now()}`,
      threadId: selectedThread.id,
      senderId: 'user-123', // Current user
      text: inputText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedDMs = [...messages, userMsg];
    saveDMs(updatedDMs);

    const updatedThreads = threads.map(t => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          lastMessageText: userMsg.text,
          lastMessageTime: userMsg.createdAt,
          unreadCount: 0
        };
      }
      return t;
    });
    saveThreads(updatedThreads);
    setSelectedThread(updatedThreads.find(t => t.id === selectedThread.id) || null);
    setInputText('');

    // Trigger AI response as the driver participant!
    setIsTyping(true);
    try {
      const response = await fetch('/api/gemini/driver-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: selectedThread.participant.displayName,
          driverBio: selectedThread.participant.bio,
          driverRig: selectedThread.participant.currentRig,
          userPrompt: userMsg.text,
          chatHistory: activeMessages.slice(-5).map(m => ({
            role: m.senderId === 'user-123' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Driver cellular service dead-zone');
      }

      const data = await response.json();
      
      const replyMsg: DirectMessage = {
        id: `dm-driver-${Date.now()}`,
        threadId: selectedThread.id,
        senderId: selectedThread.participant.id,
        text: data.text || "Ten-four! Having bad signal here in the hills, talk more when I scale.",
        createdAt: new Date().toISOString()
      };

      const finalDMs = [...updatedDMs, replyMsg];
      saveDMs(finalDMs);

      const finalThreads = updatedThreads.map(t => {
        if (t.id === selectedThread.id) {
          return {
            ...t,
            lastMessageText: replyMsg.text,
            lastMessageTime: replyMsg.createdAt
          };
        }
        return t;
      });
      saveThreads(finalThreads);
      setSelectedThread(finalThreads.find(t => t.id === selectedThread.id) || null);

    } catch (err) {
      console.error('Error getting driver response:', err);
      // Fallback response with typical trucker slang
      setTimeout(() => {
        const fallbacks = [
          "Ten-four on that! Heading into a weigh scale right now, talk to you once I park the semi.",
          "Roger that! Appreciate the heads-up. Catch you in the hammer lane.",
          "Copy that driver, keep the shiny side up and the dirty side down!",
          "Sounds good. Watch out for radar bears near mile marker 45!"
        ];
        const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        
        const replyMsg: DirectMessage = {
          id: `dm-driver-${Date.now()}`,
          threadId: selectedThread.id,
          senderId: selectedThread.participant.id,
          text: randomFallback,
          createdAt: new Date().toISOString()
        };

        const finalDMs = [...updatedDMs, replyMsg];
        saveDMs(finalDMs);

        const finalThreads = updatedThreads.map(t => {
          if (t.id === selectedThread.id) {
            return {
              ...t,
              lastMessageText: replyMsg.text,
              lastMessageTime: replyMsg.createdAt
            };
          }
          return t;
        });
        saveThreads(finalThreads);
        setSelectedThread(finalThreads.find(t => t.id === selectedThread.id) || null);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectThread = (thread: MessageThread) => {
    // Clear unread count
    const updated = threads.map(t => {
      if (t.id === thread.id) {
        return { ...t, unreadCount: 0 };
      }
      return t;
    });
    saveThreads(updated);
    setSelectedThread(updated.find(t => t.id === thread.id) || null);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]" id="messenger-layout">
      {/* LEFT COLUMN: CONVERSATION LIST / INBOX */}
      <div className={`md:col-span-4 border-r border-zinc-100 flex flex-col h-full ${selectedThread ? 'hidden md:flex' : 'flex'}`} id="inbox-list-pane">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
            <MessageSquare className="w-4 h-4 mr-1.5 text-amber-500" />
            Driver Direct Messages
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Coordinate routes & swap gear privately</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50 p-2 space-y-1">
          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => handleSelectThread(thread)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                selectedThread?.id === thread.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:bg-zinc-50 bg-white'
              }`}
              id={`thread-item-${thread.id}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative shrink-0">
                  <img src={thread.participant.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-zinc-100" alt="" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${selectedThread?.id === thread.id ? 'text-white' : 'text-slate-900'}`}>
                    {thread.participant.displayName}
                  </h4>
                  <p className={`text-[11px] truncate ${selectedThread?.id === thread.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {thread.lastMessageText}
                  </p>
                </div>
              </div>

              {thread.unreadCount > 0 && selectedThread?.id !== thread.id && (
                <span className="w-5 h-5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                  {thread.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: MESSENGER DISCUSSION THREAD */}
      <div className={`md:col-span-8 flex flex-col h-full bg-zinc-50/30 ${!selectedThread ? 'hidden md:flex items-center justify-center' : 'flex'}`} id="messenger-discussion-pane">
        {selectedThread ? (
          <div className="flex flex-col h-full w-full" id="active-chat-wrapper">
            {/* THREAD HEADER */}
            <div className="px-5 py-3 border-b border-zinc-100 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back button on mobile */}
                <button
                  onClick={() => setSelectedThread(null)}
                  className="md:hidden text-xs text-slate-600 font-bold px-2.5 py-1.5 bg-zinc-100 rounded-lg mr-1"
                >
                  ← Inbox
                </button>
                <img src={selectedThread.participant.avatarUrl} className="w-9 h-9 rounded-full object-cover" alt="" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedThread.participant.displayName}</h3>
                  <p className="text-[10px] text-zinc-400 font-medium">@{selectedThread.participant.username} · Class {selectedThread.participant.cdlClass}</p>
                </div>
              </div>

              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                CDL Verified
              </span>
            </div>

            {/* MESSAGES LIST PANEL */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-zinc-50/50" id="chat-messages-board">
              {activeMessages.map(dm => {
                const isMe = dm.senderId === 'user-123';
                return (
                  <div key={dm.id} className={`flex max-w-[80%] ${isMe ? 'ml-auto justify-end' : ''}`}>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-normal shadow-sm ${
                      isMe
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white border border-zinc-100 text-slate-800 rounded-bl-none'
                    }`}>
                      <p>{dm.text}</p>
                      <span className="block text-[8px] text-zinc-400 text-right mt-1.5">
                        {new Date(dm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Driver Typing indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 bg-white border border-zinc-100 rounded-xl px-3 py-2 w-max max-w-[80%] shadow-sm text-xs text-zinc-500">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span>{selectedThread.participant.displayName} is typing trucker reply...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* SEND COMPOSER */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-zinc-100 flex items-center space-x-3" id="dm-input-composer">
              <input
                type="text"
                placeholder={`Message ${selectedThread.participant.displayName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl transition-all text-xs flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3" id="empty-messenger-prompt">
            <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">No Active Thread Selected</h4>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              Tap any driver in your inbox on the left to negotiate truck parts, fuel sharing, or safe driving alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
