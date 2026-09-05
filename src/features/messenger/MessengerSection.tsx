import React, { useState, useEffect, useRef } from 'react';
import { MessageThread, DirectMessage, Profile } from '../../types';
import { initialMessageThreads, initialDirectMessages, sampleProfiles } from '../../data';
import { broadcastCbMessage } from '../../utils/cbAudio';
import { MessageSquare, Send, Users, ShieldAlert, Check, Clock, UserCheck, Plus, X, Radio, Volume2 } from 'lucide-react';

interface MessengerSectionProps {
  isDeadZone?: boolean;
  initialRecipient?: Profile | null;
  onViewProfile?: (profile: Profile) => void;
}

export default function MessengerSection({ 
  isDeadZone = false,
  initialRecipient = null,
  onViewProfile
}: MessengerSectionProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from local storage or seed
    const cachedThreads = localStorage.getItem('trucker_msg_threads');
    const cachedDMs = localStorage.getItem('trucker_dms');

    let loadedThreads: MessageThread[] = [];
    if (cachedThreads) {
      loadedThreads = JSON.parse(cachedThreads);
      setThreads(loadedThreads);
    } else {
      loadedThreads = initialMessageThreads;
      setThreads(initialMessageThreads);
      localStorage.setItem('trucker_msg_threads', JSON.stringify(initialMessageThreads));
    }

    if (cachedDMs) {
      setMessages(JSON.parse(cachedDMs));
    } else {
      setMessages(initialDirectMessages);
      localStorage.setItem('trucker_dms', JSON.stringify(initialDirectMessages));
    }

    // Handle initial recipient if provided
    if (initialRecipient) {
      handleOpenOrCreateThreadWith(initialRecipient, loadedThreads);
    } else if (loadedThreads.length > 0 && !selectedThread) {
      setSelectedThread(loadedThreads[0]);
    }
  }, [initialRecipient]);

  const handleOpenOrCreateThreadWith = (driver: Profile, currentThreads = threads) => {
    const existing = currentThreads.find(t => t.participant.id === driver.id || t.participant.username === driver.username);
    if (existing) {
      setSelectedThread(existing);
    } else {
      const newThread: MessageThread = {
        id: `thread-${Date.now()}`,
        participant: driver,
        lastMessageText: 'Started direct highway conversation',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
      const updated = [newThread, ...currentThreads];
      saveThreads(updated);
      setSelectedThread(newThread);
    }
  };

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

    if (isDeadZone) {
      const offlineMsg: DirectMessage = {
        ...userMsg,
        id: `offline-${userMsg.id}`
      };
      const currentOffline = JSON.parse(localStorage.getItem('trucker_offline_messages') || '[]');
      localStorage.setItem('trucker_offline_messages', JSON.stringify([...currentOffline, offlineMsg]));
      
      const updatedDMs = [...messages, offlineMsg];
      saveDMs(updatedDMs);
      
      const updatedThreads = threads.map(t => {
        if (t.id === selectedThread.id) {
          return {
            ...t,
            lastMessageText: `[Queued] ${offlineMsg.text}`,
            lastMessageTime: offlineMsg.createdAt,
            unreadCount: 0
          };
        }
        return t;
      });
      saveThreads(updatedThreads);
      setSelectedThread(updatedThreads.find(t => t.id === selectedThread.id) || null);
      setInputText('');
      return;
    }

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
      setIsTyping(false);

    } catch (err) {
      console.error('Error getting driver response:', err);
      // Fallback response with custom smart responses based on participant and prompt keywords
      setTimeout(() => {
        const username = selectedThread.participant.username;
        const promptLower = userMsg.text.toLowerCase();
        let fallbackText = '';

        if (username === 'DieselDuchess') {
          if (promptLower.includes('wind') || promptLower.includes('load') || promptLower.includes('oversize') || promptLower.includes('rig')) {
            fallbackText = "Hey Willie! Oversized loads are crazy right now, got a 110ft wind turbine blade behind me on a steerable deck. Running the I-80 pass near Cheyenne and the wind meter is flirting with 35 mph. Taking it real slow.";
          } else if (promptLower.includes('where') || promptLower.includes('status') || promptLower.includes('location')) {
            fallbackText = "Just pulled into the Denver Kenworth shop to get a quick steer-axle alignment checked out, then heading out on I-15 up to Idaho Falls tomorrow. You rolling anywhere near?";
          } else {
            fallbackText = "Ten-four on that, Willie! Heavy haul life has no off-days. Keep the shiny side up out there on the highways!";
          }
        } else if (username === 'GearJammer_77') {
          if (promptLower.includes('temp') || promptLower.includes('reefer') || promptLower.includes('produce') || promptLower.includes('load')) {
            fallbackText = "Man, reefer units are a full-time babysitting job! Got a load of organic strawberries out of Salinas, temp's locked at exactly 34 degrees. If the compressor shuts down for even 10 mins, the receiver will reject the whole box.";
          } else if (promptLower.includes('where') || promptLower.includes('lane') || promptLower.includes('status')) {
            fallbackText = "Currently scaling at the I-10 Eastbound coop just past El Paso. Heading towards Dallas. Traffic is stacked, but fuel is cheap here.";
          } else {
            fallbackText = "Copy that, Willie! Just trying to jam these gears and get this CA produce unloaded on time. Safe travels!";
          }
        } else if (username === 'National_ATA') {
          if (promptLower.includes('rule') || promptLower.includes('law') || promptLower.includes('fmcsa') || promptLower.includes('dot') || promptLower.includes('cdl')) {
            fallbackText = "Thank you for reaching out to the American Trucking Chapters. Our legislative team is currently advocating on Capitol Hill for expanded safe truck parking funding and fairer per-diem tax adjustments. Let's keep working together to keep America moving.";
          } else {
            fallbackText = "Hello Willie, thank you for your message. Be sure to check our daily ATA Alliance feed for the latest federal CDL-A regulatory amendments and chapter meetings in your region.";
          }
        } else if (username === 'BrakeCheckRick') {
          if (promptLower.includes('route') || promptLower.includes('traffic') || promptLower.includes('weather') || promptLower.includes('northeast')) {
            fallbackText = "Ah, the Northeast corridor is an absolute parking lot today! NJ Turnpike was backed up 5 miles due to a minor fender bender in the left lane. Got a dry van load going into Allentown, hoping to make it before my 14-hour clock expires.";
          } else {
            fallbackText = "You got it, buddy! Keep the rubber side down and watch out for those crazy four-wheelers in Jersey. Catch you on the flip side!";
          }
        } else {
          fallbackText = "Copy that driver! Keep the shiny side up and the dirty side down. I'll catch you on the flip-flop!";
        }

        const replyMsg: DirectMessage = {
          id: `dm-driver-${Date.now()}`,
          threadId: selectedThread.id,
          senderId: selectedThread.participant.id,
          text: fallbackText,
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
        setIsTyping(false);
      }, 1500);
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
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5 text-amber-500" />
              Driver Direct Messages
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">Coordinate routes & swap gear privately</p>
          </div>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition"
            title="Start new direct message"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
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
                <img 
                  src={selectedThread.participant.avatarUrl} 
                  className="w-9 h-9 rounded-full object-cover cursor-pointer hover:ring-2 ring-amber-400 transition-all" 
                  alt="" 
                  onClick={() => onViewProfile?.(selectedThread.participant)}
                />
                <div 
                  className="cursor-pointer group"
                  onClick={() => onViewProfile?.(selectedThread.participant)}
                >
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {selectedThread.participant.displayName}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium">@{selectedThread.participant.username} · Class {selectedThread.participant.cdlClass}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewProfile?.(selectedThread.participant)}
                  className="text-[10px] text-zinc-600 hover:text-slate-900 font-bold px-2 py-1 bg-zinc-100 rounded-lg"
                >
                  View Profile
                </button>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                  CDL Verified
                </span>
              </div>
            </div>

            {/* CELLULAR SIGNAL LOST WARNING */}
            {isDeadZone && (
              <div className="bg-amber-50 border-y border-amber-200 text-amber-800 text-[10px] font-bold py-2 px-5 flex items-center justify-between">
                <span>⚠️ Cellular signal lost. Messages are being saved to your Offline Outbox.</span>
                <span className="text-[9px] uppercase tracking-wider bg-amber-200/50 px-1.5 py-0.5 rounded">Dead-Zone Active</span>
              </div>
            )}

            {/* MESSAGES LIST PANEL */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-zinc-50/50" id="chat-messages-board">
              {activeMessages.map(dm => {
                const isMe = dm.senderId === 'user-123';
                const isOffline = dm.id.startsWith('offline-');
                return (
                  <div key={dm.id} className={`flex max-w-[80%] ${isMe ? 'ml-auto justify-end' : ''}`}>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-normal shadow-sm relative ${
                      isMe
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white border border-zinc-100 text-slate-800 rounded-bl-none'
                    }`}>
                      <p>{dm.text}</p>
                      <div className="flex items-center justify-between space-x-1.5 mt-1.5 pt-1 border-t border-zinc-100/30">
                        <button
                          type="button"
                          onClick={() => broadcastCbMessage(dm.text)}
                          className={`text-[9px] flex items-center gap-1 font-bold ${isMe ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-500 hover:text-slate-900'}`}
                          title="Play CB Voice"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>CB Read</span>
                        </button>
                        <div className="flex items-center space-x-1">
                          {isOffline && (
                            <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">Queued Offline ⏳</span>
                          )}
                          <span className="block text-[8px] text-zinc-400">
                            {new Date(dm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
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

            {/* QUICK CB SQUELCH REPLIES BAR */}
            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <span className="text-[10px] text-zinc-400 font-black uppercase shrink-0 mr-1 flex items-center">
                <Radio className="w-3 h-3 mr-1 text-amber-500" />
                Quick CB:
              </span>
              {[
                '10-4 Copy That',
                'What is your 20?',
                'How is the scale looking?',
                'Need a hand with tandems?',
                'Hammer down!',
                'Taking a 30-min break'
              ].map(phrase => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => setInputText(phrase)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-900 border border-zinc-200 text-slate-700 font-semibold rounded-lg shrink-0 transition text-[10px]"
                >
                  {phrase}
                </button>
              ))}
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

      {/* NEW CHAT MODAL */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">Start Highway Message</h3>
              </div>
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-zinc-500 font-medium">Select a verified CDL driver from the network directory:</p>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {sampleProfiles.map(driver => (
                  <div
                    key={driver.id}
                    onClick={() => {
                      handleOpenOrCreateThreadWith(driver);
                      setIsNewChatModalOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 border border-zinc-100 cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={driver.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{driver.displayName}</h4>
                        <p className="text-[10px] text-zinc-400">@{driver.username} • Class {driver.cdlClass}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      Message
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
