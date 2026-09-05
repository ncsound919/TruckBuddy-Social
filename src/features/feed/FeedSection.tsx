import React, { useState, useEffect } from 'react';
import { Post, PostComment, Profile } from '../../types';
import { useModeration } from '../../hooks/useModeration';
import { subscribeLivePosts, createLivePost, toggleLivePostLike, subscribeLiveComments, addLiveComment } from '../../lib/firebase';
import DriverStoriesBar from './DriverStoriesBar';
import { FeedPost } from './components/FeedPost';
import { FeedComposer } from './components/FeedComposer';
import { Clock, PlusCircle, Bookmark, Tag, Sparkles } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useToast } from '../../hooks/useToast';

interface FeedSectionProps {
  onNotificationAdd: (message: string, type: 'like' | 'comment') => void;
  isDeadZone?: boolean;
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
}

export default function FeedSection({ onNotificationAdd, isDeadZone = false, onViewProfile, onOpenDirectMessage }: FeedSectionProps) {
  const { profile: currentUserProfile } = useFirebase();
  const { fileReport } = useModeration();
  const [posts, setPosts] = useState<Post[]>([]);

  if (!currentUserProfile) return null;
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'saved'>('for_you');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const { toastMsg, showToast } = useToast();
  
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; caption?: string; author?: Profile; type?: 'image' | 'video' } | null>(null);
  const [repostModalPost, setRepostModalPost] = useState<Post | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeLivePosts((livePosts) => {
      setPosts(livePosts || []);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!openCommentsPostId) return;
    const unsubscribe = subscribeLiveComments(openCommentsPostId, (liveComments) => {
      setComments(prev => ({ ...prev, [openCommentsPostId]: liveComments }));
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [openCommentsPostId]);

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const hasLiked = (post.likesUsers || []).includes(currentUserProfile.id) || post.isLiked;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        let likesUsers = [...(p.likesUsers || [])];
        let likeCount = p.likeCount || p.likesCount || 0;
        if (hasLiked) {
          likesUsers = likesUsers.filter(id => id !== currentUserProfile.id);
          likeCount = Math.max(0, likeCount - 1);
        } else {
          likesUsers.push(currentUserProfile.id);
          likeCount += 1;
        }
        return { ...p, likeCount, likesCount: likeCount, isLiked: !hasLiked, likesUsers };
      }
      return p;
    }));
    try {
      await toggleLivePostLike(postId, currentUserProfile.id, hasLiked);
    } catch (e) {
      console.warn('Live like sync notice:', e);
    }
  };

  const handleCreatePost = async (postData: any, author: Profile) => {
    try {
      await createLivePost({ author, ...postData });
      showToast('📡 Post published live to Road Feed!');
    } catch (e) {
      console.warn('Live post create note:', e);
      showToast('Failed to publish post to Road Feed.');
    }
    setIsComposerOpen(false);
  };

  const handleAddComment = async (postId: string, body: string) => {
    try {
      await addLiveComment(postId, { author: currentUserProfile, body });
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, commentCount: (post.commentCount || 0) + 1 };
        }
        return post;
      }));
    } catch (e) {
      console.warn('Live comment sync notice:', e);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'following' && !(post.author.isVerified || post.author.id === currentUserProfile.id)) return false;
    if (activeTab === 'saved' && !post.isBookmarked) return false;
    if (selectedTag !== 'all') {
      const hasTag = post.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase());
      if (!hasTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" id="feed-container">
      {/* Toast Overlay */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-black tracking-tight">{toastMsg}</span>
        </div>
      )}

      <DriverStoriesBar onOpenDirectMessage={onOpenDirectMessage} onViewProfile={onViewProfile} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex space-x-1 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveTab('for_you')} className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap min-h-[40px] flex items-center justify-center ${activeTab === 'for_you' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-zinc-500 hover:text-slate-900'}`}>All Updates</button>
          <button onClick={() => setActiveTab('following')} className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap min-h-[40px] flex items-center justify-center ${activeTab === 'following' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-zinc-500 hover:text-slate-900'}`}>Verified CDL</button>
          <button onClick={() => setActiveTab('saved')} className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap min-h-[40px] ${activeTab === 'saved' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-zinc-500 hover:text-slate-900'}`}>
            <Bookmark className="w-3.5 h-3.5" /><span>Saved</span>
          </button>
        </div>
        <button onClick={() => setIsComposerOpen(true)} className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider min-h-[44px] w-full sm:w-auto">
          <PlusCircle className="w-4 h-4" /><span>Post Road Update</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center space-x-1"><Tag className="w-3 h-3" /><span>Topics:</span></span>
        {['all', '#WinterChainUp', '#RegulatoryPoll', '#OwnerOperator', '#I80Corridor', '#RoadHazard'].map(tag => (
          <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border ${selectedTag === tag ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
            {tag === 'all' ? 'All Topics' : tag}
          </button>
        ))}
      </div>

      {isComposerOpen && (
        <FeedComposer 
          onClose={() => setIsComposerOpen(false)} 
          onSubmit={handleCreatePost}
          isDeadZone={isDeadZone}
        />
      )}

      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-500">
            <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No updates matching current filters</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <FeedPost 
              key={post.id}
              post={post}
              comments={comments[post.id] || []}
              onLike={handleLike}
              onComment={handleAddComment}
              onBookmark={() => {}}
              onVotePoll={() => {}}
              onReact={() => {}}
              onViewProfile={onViewProfile}
              onOpenDirectMessage={onOpenDirectMessage}
              onReport={(id) => fileReport(id, 'post', 'Unspecified violation')}
              onViewMedia={setLightboxMedia}
              onOpenRepost={setRepostModalPost}
              openCommentsPostId={openCommentsPostId}
              setOpenCommentsPostId={setOpenCommentsPostId}
            />
          ))
        )}
      </div>
      
      {/* Modals for media and repost would go here if needed, but skipped for brevity */}
    </div>
  );
}
