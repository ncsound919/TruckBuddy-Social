import React, { useState } from 'react';
import { Profile } from '../../../types';
import { Image, MapPin, Tag, PlusCircle, CheckCircle, Flame } from 'lucide-react';
import { useFirebase } from '../../../contexts/FirebaseContext';

export interface FeedComposerProps {
  onClose: () => void;
  onSubmit: (postData: any, author: Profile) => Promise<void>;
  isDeadZone: boolean;
}

export function FeedComposer({ onClose, onSubmit, isDeadZone }: FeedComposerProps) {
  const { profile: currentUserProfile } = useFirebase();
  const [caption, setCaption] = useState('');

  if (!currentUserProfile) return null;
  const [locationName, setLocationName] = useState('');
  const [postType, setPostType] = useState<'photo' | 'video' | 'text' | 'road_report'>('photo');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaSimUrl, setMediaSimUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollOpt3, setPollOpt3] = useState('');

  const handleSimulateCompression = () => {
    setIsCompressing(true);
    setTimeout(() => {
      setIsCompressing(false);
      setMediaSimUrl('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200');
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    let pollData = null;
    if (includePoll && pollQuestion.trim() && pollOpt1.trim() && pollOpt2.trim()) {
      pollData = {
        question: pollQuestion,
        options: [
          { id: 'opt-1', text: pollOpt1, votes: 0 },
          { id: 'opt-2', text: pollOpt2, votes: 0 }
        ],
        userVotedId: null,
        totalVotes: 0
      };
      if (pollOpt3.trim()) {
        pollData.options.push({ id: 'opt-3', text: pollOpt3, votes: 0 });
      }
    }

    const postData = {
      caption,
      locationName: locationName || 'Unknown Highway',
      postType,
      tags: tagsInput ? tagsInput.split(' ').filter(t => t.startsWith('#')) : ['#RoadUpdate'],
      mediaUrl: mediaSimUrl || (postType === 'photo' ? 'https://images.unsplash.com/photo-1596701509867-0c58e5f1f727?auto=format&fit=crop&q=80&w=1200' : ''),
      poll: pollData
    };

    await onSubmit(postData, currentUserProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-6" id="composer-modal">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">New Dispatch</h2>
          <button onClick={onClose} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" id="form-new-post">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
            <textarea
              placeholder="What's happening on the road, driver?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-32 text-lg text-slate-900 placeholder:text-zinc-400 bg-transparent resize-none focus:outline-none"
              autoFocus
            />

            {mediaSimUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-100 border border-zinc-200">
                <img src={mediaSimUrl} alt="Attached media" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setMediaSimUrl('')}
                  className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {includePoll && (
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">Driver Poll</span>
                  </div>
                  <button type="button" onClick={() => setIncludePoll(false)} className="text-xs text-blue-600 hover:text-blue-800 font-bold">Remove</button>
                </div>
                <input type="text" placeholder="Poll Question (e.g., Should FMCSA revise the 14-hour clock?)" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500" required />
                <div className="space-y-2">
                  <input type="text" placeholder="Option 1" value={pollOpt1} onChange={e => setPollOpt1(e.target.value)} className="w-full bg-white border-none rounded-xl p-3 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500" required />
                  <input type="text" placeholder="Option 2" value={pollOpt2} onChange={e => setPollOpt2(e.target.value)} className="w-full bg-white border-none rounded-xl p-3 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500" required />
                  <input type="text" placeholder="Option 3 (Optional)" value={pollOpt3} onChange={e => setPollOpt3(e.target.value)} className="w-full bg-white border-none rounded-xl p-3 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleSimulateCompression} disabled={isCompressing} className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-colors border border-zinc-200">
                  <Image className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold">{isCompressing ? 'Compressing...' : 'Attach Photo'}</span>
                </button>
                <button type="button" onClick={() => setIncludePoll(true)} className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-colors border border-zinc-200">
                  <Flame className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold">Add Poll</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  placeholder="Location (e.g. I-80 Wyoming, Scale House)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="pl-10 w-full bg-zinc-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all text-slate-900"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  placeholder="Hashtags (e.g. #WinterChainUp #I80)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="pl-10 w-full bg-zinc-50 border-none rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all text-slate-900"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between rounded-b-3xl">
            <div className="flex items-center text-xs font-bold text-zinc-500">
              {isDeadZone ? (
                <>
                  <CheckCircle className="w-4 h-4 text-amber-500 mr-1.5" />
                  Offline Mode: Will sync later
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
                  Live Sync Connection
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={!caption.trim() || isCompressing}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
