import React, { useState } from 'react';
import { Post, PostComment, Profile } from '../../../types';
import { 
  Heart, MessageSquare, MapPin, Tag, Share2, AlertTriangle, 
  Radio, Volume2, VolumeX, Bookmark, BookmarkCheck, BarChart2,
  ThumbsUp, Sparkles, Layers, Flame, Send
} from 'lucide-react';
import { useFirebase } from '../../../contexts/FirebaseContext';
import { playCbSquelch, playAirHorn } from '../../../utils/cbAudio';

export interface FeedPostProps {
  key?: string | number;
  post: Post;
  comments: PostComment[];
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onBookmark: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onReact: (postId: string, reactionId: any) => void;
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
  onReport: (postId: string) => void;
  onViewMedia: (media: any) => void;
  onOpenRepost: (post: Post) => void;
  openCommentsPostId: string | null;
  setOpenCommentsPostId: (id: string | null) => void;
}

export function FeedPost({ 
  post, comments, onLike, onComment, onBookmark, onVotePoll, 
  onReact, onViewProfile, onOpenDirectMessage, onReport, 
  onViewMedia, onOpenRepost, openCommentsPostId, setOpenCommentsPostId 
}: FeedPostProps) {
  const { profile: currentUserProfile } = useFirebase();
  const [newCommentText, setNewCommentText] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);

  if (!currentUserProfile) return null;

  const hasLiked = (post.likesUsers || []).includes(currentUserProfile.id) || post.isLiked;
  const userReaction = post.reactions?.userReactions?.[currentUserProfile.id];
  const reactions = post.reactions || { affirmative: 0, hammerDown: 0, airHorn: 0, scaleAlert: 0, safeTravels: 0 };
  const showComments = openCommentsPostId === post.id;

  const handleAudioToggle = () => {
    if (playingAudio) {
      setPlayingAudio(false);
    } else {
      playCbSquelch();
      setPlayingAudio(true);
      setTimeout(() => setPlayingAudio(false), 3000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onComment(post.id, newCommentText);
    setNewCommentText('');
  };

  return (
    <article className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-6" id={`post-${post.id}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-50 bg-zinc-50/40">
        <div onClick={() => onViewProfile?.(post.author)} className="flex items-center space-x-3 cursor-pointer group">
          <img src={post.author.avatarUrl || null} alt={post.author.displayName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:ring-2 ring-amber-500 transition-all" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm text-slate-900">{post.author.displayName}</span>
              {post.author.isVerified && <span className="text-[10px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded-sm font-black tracking-widest uppercase">CDL</span>}
            </div>
            <div className="flex items-center space-x-2 text-xs text-zinc-500 font-medium">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span>{post.lastUpdated || post.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{post.caption || post.content}</p>
        
        {post.mediaUrl && (
          <div className="mt-4 rounded-xl overflow-hidden bg-zinc-100 relative cursor-pointer" onClick={() => onViewMedia({ url: post.mediaUrl, caption: post.caption, author: post.author, type: 'image' })}>
            <img src={post.mediaUrl || null} alt="Post attachment" className="w-full max-h-[500px] object-cover" />
          </div>
        )}

        {/* Tags and Location */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {post.locationName && (
            <span className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-md text-[10px] font-bold border border-amber-200/50">
              <MapPin className="w-3 h-3" />
              <span>{post.locationName}</span>
            </span>
          )}
          {post.tags?.map(tag => (
            <span key={tag} className="flex items-center space-x-1 bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-[10px] font-bold">
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button onClick={() => onLike(post.id)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${hasLiked ? 'text-red-500 bg-red-50' : 'text-zinc-500 hover:bg-zinc-200'}`}>
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold">{post.likeCount || post.likesCount || 0}</span>
          </button>
          <button onClick={() => setOpenCommentsPostId(showComments ? null : post.id)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold">{post.commentCount || post.commentsCount || comments.length || 0}</span>
          </button>
        </div>
        <button onClick={() => onBookmark(post.id)} className={`p-1.5 rounded-lg transition-colors ${post.isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'}`}>
          {post.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="bg-zinc-50 p-4 border-t border-zinc-200/50">
          <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="flex space-x-3 bg-white p-3 rounded-xl border border-zinc-100">
                <img src={c.author.avatarUrl || null} className="w-8 h-8 rounded-full" alt="" />
                <div className="flex-1">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-xs">{c.author.displayName}</span>
                    <span className="text-[10px] text-zinc-400">{c.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">{c.content || c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
            <input type="text" value={newCommentText} onChange={e => setNewCommentText(e.target.value)} placeholder="Add to the conversation..." className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
            <button type="submit" disabled={!newCommentText.trim()} className="p-2 bg-amber-500 text-white rounded-lg disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
