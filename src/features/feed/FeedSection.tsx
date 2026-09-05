import React, { useState, useEffect } from 'react';
import { Post, PostComment, Profile, PostPoll } from '../../types';
import { samplePosts, sampleComments, currentUserProfile } from '../../data';
import { useModeration } from '../../hooks/useModeration';
import { db } from '../../lib/supabase';
import { broadcastCbMessage, playAirHorn, playHighBeamFlash, playCbSquelch } from '../../utils/cbAudio';
import DriverStoriesBar from './DriverStoriesBar';
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  Tag, 
  Image, 
  Clock, 
  Share2, 
  PlusCircle, 
  CheckCircle, 
  ChevronRight, 
  X, 
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Check,
  BarChart2,
  ThumbsUp,
  Sparkles,
  Layers,
  Flame,
  Repeat,
  Send,
  Maximize2,
  Download
} from 'lucide-react';

interface FeedSectionProps {
  onNotificationAdd: (message: string, type: 'like' | 'comment') => void;
  isDeadZone?: boolean;
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
}

export default function FeedSection({ onNotificationAdd, isDeadZone = false, onViewProfile, onOpenDirectMessage }: FeedSectionProps) {
  const { fileReport } = useModeration();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'saved'>('for_you');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Audio playback state for CB voice notes
  const [playingAudioPostId, setPlayingAudioPostId] = useState<string | null>(null);

  // Lightbox Media Viewer State
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; caption?: string; author?: Profile; type?: 'image' | 'video' } | null>(null);

  // Quote / Repost State
  const [repostModalPost, setRepostModalPost] = useState<Post | null>(null);
  const [repostCommentary, setRepostCommentary] = useState('');

  // Post composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [postType, setPostType] = useState<'photo' | 'video' | 'text' | 'road_report'>('photo');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaSimUrl, setMediaSimUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Poll composer toggle & inputs
  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollOpt3, setPollOpt3] = useState('');

  // Comments view state
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');


  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load from Supabase DB or Local Storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: postsData, error: postsError } = await db
          .from('posts')
          .select('*')
          .order('createdAt', { ascending: false });

        if (!postsError && postsData && postsData.length > 0) {
          setPosts(postsData);
        } else {
          setPosts(samplePosts);
          localStorage.setItem('trucker_posts', JSON.stringify(samplePosts));
          try {
            await db.from('posts').insert(samplePosts);
          } catch (e) {
            console.warn('Failed to pre-seed posts in backend db, continuing locally:', e);
          }
        }
      } catch (e) {
        console.error('Failed to load posts from db, falling back to local storage:', e);
        const cached = localStorage.getItem('trucker_posts');
        if (cached) {
          setPosts(JSON.parse(cached));
        } else {
          setPosts(samplePosts);
          localStorage.setItem('trucker_posts', JSON.stringify(samplePosts));
        }
      }

      try {
        const { data: commentsData, error: commentsError } = await db
          .from('comments')
          .select('*');

        if (!commentsError && commentsData && commentsData.length > 0) {
          const grouped: Record<string, PostComment[]> = {};
          commentsData.forEach((c: any) => {
            if (!grouped[c.postId]) {
              grouped[c.postId] = [];
            }
            grouped[c.postId].push(c);
          });
          setComments(grouped);
        } else {
          setComments(sampleComments);
          localStorage.setItem('trucker_comments', JSON.stringify(sampleComments));
        }
      } catch (e) {
        console.error('Failed to load comments from db, falling back to local storage:', e);
        const cached = localStorage.getItem('trucker_comments');
        if (cached) {
          setComments(JSON.parse(cached));
        } else {
          setComments(sampleComments);
          localStorage.setItem('trucker_comments', JSON.stringify(sampleComments));
        }
      }
    };

    loadData();
  }, []);

  const savePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('trucker_posts', JSON.stringify(updatedPosts));
  };

  const saveComments = (updatedComments: Record<string, PostComment[]>) => {
    setComments(updatedComments);
    localStorage.setItem('trucker_comments', JSON.stringify(updatedComments));
  };

  // Like / Unlike action
  const handleLike = async (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likesUsers.includes(currentUserProfile.id);
        let likesUsers = [...post.likesUsers];
        let likeCount = post.likeCount;

        if (hasLiked) {
          likesUsers = likesUsers.filter(id => id !== currentUserProfile.id);
          likeCount = Math.max(0, likeCount - 1);
        } else {
          likesUsers.push(currentUserProfile.id);
          likeCount += 1;
          if (post.author.id !== currentUserProfile.id) {
            onNotificationAdd(`${currentUserProfile.displayName} liked your post: "${post.caption.slice(0, 30)}..."`, 'like');
          }
        }
        
        db.from('posts').update({ likeCount, likesUsers }).eq('id', postId)
          .catch(e => console.warn('Failed async post like sync to backend database, continuing locally:', e));
        
        return { ...post, likeCount, likesUsers };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  // Trucker Reaction Action
  const handleTruckerReaction = (postId: string, reactionKey: 'affirmative' | 'hammerDown' | 'airHorn' | 'scaleAlert' | 'safeTravels') => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const reactions = p.reactions || { affirmative: 0, hammerDown: 0, airHorn: 0, scaleAlert: 0, safeTravels: 0 };
        const userReactions = reactions.userReactions || {};
        const currentReaction = userReactions[currentUserProfile.id];

        let updatedReactions = { ...reactions };

        if (currentReaction === reactionKey) {
          // Toggle off
          updatedReactions[reactionKey] = Math.max(0, updatedReactions[reactionKey] - 1);
          delete userReactions[currentUserProfile.id];
        } else {
          // If had another reaction, decrement it
          if (currentReaction && currentReaction in updatedReactions) {
            updatedReactions[currentReaction as keyof typeof reactions] = Math.max(0, (updatedReactions[currentReaction as keyof typeof reactions] as number) - 1);
          }
          // Increment chosen reaction
          updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
          userReactions[currentUserProfile.id] = reactionKey;
        }

        updatedReactions.userReactions = userReactions;
        return { ...p, reactions: updatedReactions };
      }
      return p;
    });
    savePosts(updated);
  };

  // Poll Vote Action
  const handleVotePoll = (postId: string, optionId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId && p.poll) {
        const poll = p.poll;
        if (poll.userVotedId) return p; // Already voted

        const updatedOptions = poll.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        const updatedPoll: PostPoll = {
          ...poll,
          options: updatedOptions,
          userVotedId: optionId,
          totalVotes: poll.totalVotes + 1
        };

        return { ...p, poll: updatedPoll };
      }
      return p;
    });
    savePosts(updated);
    setToastMsg('🗳️ Driver ballot recorded in highway poll!');
  };

  // Toggle Bookmark for Dead-Zone reading
  const handleToggleBookmark = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const isBookmarked = !p.isBookmarked;
        return { ...p, isBookmarked };
      }
      return p;
    });
    savePosts(updated);
    const post = updated.find(p => p.id === postId);
    if (post?.isBookmarked) {
      setToastMsg('📌 Post bookmarked for reading in mountain cell dead-zones!');
    }
  };

  // Play CB Voice Dispatch Note
  const handlePlayAudioNote = (postId: string, transcript: string) => {
    if (playingAudioPostId === postId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioPostId(null);
      return;
    }

    setPlayingAudioPostId(postId);
    broadcastCbMessage(
      transcript,
      () => setPlayingAudioPostId(postId),
      () => setPlayingAudioPostId(null)
    );
  };

  // 10-4 Repost / Quote handler
  const handleExecuteRepost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repostModalPost) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: currentUserProfile,
      postType: 'text',
      caption: `🔁 10-4 REPOST: "${repostCommentary.trim()}"\n\n--- Original by @${repostModalPost.author.username} ---\n${repostModalPost.caption}`,
      tags: [...(repostModalPost.tags || []), '#104Repost'],
      locationName: repostModalPost.locationName,
      mediaUrl: repostModalPost.mediaUrl,
      mediaType: repostModalPost.mediaType,
      likeCount: 0,
      commentCount: 0,
      likesUsers: [],
      createdAt: new Date().toISOString(),
      reactions: {
        affirmative: 0,
        hammerDown: 0,
        airHorn: 0,
        scaleAlert: 0,
        safeTravels: 0
      }
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    playCbSquelch();
    setToastMsg(`🔁 Re-broadcasted update from @${repostModalPost.author.username} with 10-4 commentary!`);
    setRepostModalPost(null);
    setRepostCommentary('');
  };

  // Submit comment
  const handleSubmitComment = async (postId: string) => {
    if (!newCommentText.trim()) return;

    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      postId: postId,
      author: currentUserProfile,
      body: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await db.from('comments').insert({ ...newComment, postId });
    } catch (e) {
      console.warn('Failed to insert comment to backend database, continuing locally:', e);
    }

    const postComments = comments[postId] ? [...comments[postId]] : [];
    const updatedComments = {
      ...comments,
      [postId]: [...postComments, newComment]
    };

    saveComments(updatedComments);
    setNewCommentText('');

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.author.id !== currentUserProfile.id) {
          onNotificationAdd(`${currentUserProfile.displayName} commented: "${newComment.body.slice(0, 30)}..."`, 'comment');
        }
        const updatedPost = { ...post, commentCount: post.commentCount + 1 };
        db.from('posts').update({ commentCount: post.commentCount + 1 }).eq('id', postId)
          .catch(e => console.warn('Failed to update commentCount in backend database, continuing locally:', e));
        return updatedPost;
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  // Simulated image/video upload with compression
  const simulateImageSelect = (url: string) => {
    setIsCompressing(true);
    setTimeout(() => {
      setMediaSimUrl(url);
      setIsCompressing(false);
    }, 800);
  };

  const simulateVideoSelect = (url: string) => {
    setIsCompressing(true);
    setTimeout(() => {
      setMediaSimUrl(url);
      setIsCompressing(false);
    }, 1200);
  };

  const handleRealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/webp', 0.6);
          setMediaSimUrl(compressed);
        } else {
          setMediaSimUrl(event.target?.result as string);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaSimUrl && !includePoll) return;

    const processedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    const cachedProfile = localStorage.getItem('trucker_current_profile');
    const authorProfile = cachedProfile ? JSON.parse(cachedProfile) : currentUserProfile;
    const isMedia = postType === 'photo' || postType === 'video';

    // Build poll object if toggled
    let builtPoll: PostPoll | undefined = undefined;
    if (includePoll && pollQuestion.trim() && pollOpt1.trim() && pollOpt2.trim()) {
      builtPoll = {
        question: pollQuestion.trim(),
        options: [
          { id: 'opt-1', text: pollOpt1.trim(), votes: 0 },
          { id: 'opt-2', text: pollOpt2.trim(), votes: 0 },
          ...(pollOpt3.trim() ? [{ id: 'opt-3', text: pollOpt3.trim(), votes: 0 }] : [])
        ],
        totalVotes: 0
      };
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: authorProfile,
      postType: postType,
      caption: caption.trim(),
      tags: processedTags.length > 0 ? processedTags : ['#TruckerSocial'],
      locationName: locationName.trim() || undefined,
      mediaUrl: isMedia ? (mediaSimUrl || (postType === 'photo' 
        ? 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=800' 
        : 'https://assets.mixkit.co/videos/preview/mixkit-cargo-container-truck-on-a-highway-34440-large.mp4')) : undefined,
      mediaType: postType === 'photo' ? 'image' : (postType === 'video' ? 'video' : undefined),
      likeCount: 0,
      commentCount: 0,
      likesUsers: [],
      createdAt: new Date().toISOString(),
      poll: builtPoll,
      reactions: {
        affirmative: 0,
        hammerDown: 0,
        airHorn: 0,
        scaleAlert: 0,
        safeTravels: 0
      }
    };

    if (isDeadZone) {
      const currentQueue = JSON.parse(localStorage.getItem('trucker_offline_media_queue') || '[]');
      const updatedQueue = [newPost, ...currentQueue];
      localStorage.setItem('trucker_offline_media_queue', JSON.stringify(updatedQueue));
      setToastMsg('⚠️ Cellular Dead-Zone Active: Saved post to Offline Upload Queue! It will automatically sync once signal returns.');
    } else {
      try {
        await db.from('posts').insert(newPost);
      } catch (e) {
        console.warn('Failed to upload post to database backend, saved locally:', e);
      }
      const updatedPosts = [newPost, ...posts];
      savePosts(updatedPosts);
      setToastMsg('📡 Post published successfully to Road Feed!');
    }

    // Reset fields
    setCaption('');
    setLocationName('');
    setTagsInput('');
    setMediaSimUrl('');
    setIncludePoll(false);
    setPollQuestion('');
    setPollOpt1('');
    setPollOpt2('');
    setPollOpt3('');
    setIsComposerOpen(false);
  };

  // Filter posts based on tab & hashtag
  const filteredPosts = posts.filter(post => {
    // Tab filter
    if (activeTab === 'following' && !(post.author.isVerified || post.author.id === currentUserProfile.id)) {
      return false;
    }
    if (activeTab === 'saved' && !post.isBookmarked) {
      return false;
    }

    // Tag filter
    if (selectedTag !== 'all') {
      const hasTag = post.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase());
      if (!hasTag) return false;
    }

    return true;
  });

  const popularTags = [
    'all',
    '#WinterChainUp',
    '#RegulatoryPoll',
    '#OwnerOperator',
    '#I80Corridor',
    '#KenworthW900',
    '#VolvoVNL',
    '#HeavyHaul',
    '#RoadHazard'
  ];

  return (
    <div className="space-y-6" id="feed-container">
      {toastMsg && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-extrabold uppercase ml-2 text-[10px] hover:opacity-80">✕</button>
        </div>
      )}

      {/* LIVE HIGHWAY ROAD STATUS STORY BEACONS */}
      <DriverStoriesBar 
        onOpenDirectMessage={onOpenDirectMessage}
        onViewProfile={onViewProfile}
      />

      {/* Feed Navigation and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-zinc-100" id="feed-header-bar">
        <div className="flex space-x-1 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none" id="feed-tabs">
          <button
            id="tab-foryou"
            onClick={() => setActiveTab('for_you')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap min-h-[40px] sm:min-h-0 flex items-center justify-center ${
              activeTab === 'for_you'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            All Updates
          </button>
          <button
            id="tab-following"
            onClick={() => setActiveTab('following')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap min-h-[40px] sm:min-h-0 flex items-center justify-center ${
              activeTab === 'following'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            Verified CDL
          </button>
          <button
            id="tab-saved"
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap min-h-[40px] sm:min-h-0 ${
              activeTab === 'saved'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>

        <button
          id="btn-new-post"
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider min-h-[44px] w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Road Update</span>
        </button>
      </div>

      {/* POPULAR TRUCKING TOPIC HASHTAGS PILL BAR */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none" id="feed-topic-pills">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <Tag className="w-3 h-3" />
          <span>Topics:</span>
        </span>
        {popularTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedTag === tag
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {tag === 'all' ? 'All Topics' : tag}
          </button>
        ))}
      </div>

      {/* COMPOSER MODAL / OVERLAY */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="post-composer-modal">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Compose Highway Update</h3>
                <p className="text-xs text-zinc-500">Broadcast to drivers across your freight corridor</p>
              </div>
              <button 
                id="close-composer"
                onClick={() => setIsComposerOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Update Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'photo', label: 'Rig / Photo' },
                    { id: 'video', label: 'Highway Video' },
                    { id: 'text', label: 'Log / Question' },
                    { id: 'road_report', label: 'Road Alert' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setPostType(t.id as any);
                        setMediaSimUrl('');
                      }}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
                        postType === t.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Caption / Highway Story</label>
                <textarea
                  required
                  placeholder="Share details about load weights, rest areas, DOT scale activity, cargo tips, or highway hazards..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Highway Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. I-80 West MM 142 (Lovelock, NV)"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Poll Toggle */}
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePoll}
                      onChange={(e) => setIncludePoll(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-zinc-300 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Attach Highway Poll</span>
                    </span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium">Gather feedback from drivers</span>
                </div>

                {includePoll && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/60">
                    <input
                      type="text"
                      placeholder="Poll Question: e.g. Do you run recap hours or 34h resets?"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Option 1"
                        value={pollOpt1}
                        onChange={(e) => setPollOpt1(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Option 2"
                        value={pollOpt2}
                        onChange={(e) => setPollOpt2(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Option 3 (Optional)"
                      value={pollOpt3}
                      onChange={(e) => setPollOpt3(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Hashtags (Comma Separated)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. #OwnerOperator, #I80Winter, #CAT3406E"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Photo Upload Simulator */}
              {postType === 'photo' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Attach Rig Photo</label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    id="real-image-upload"
                    className="hidden"
                    onChange={handleRealImageUpload}
                  />
                  <label
                    htmlFor="real-image-upload"
                    className="block text-center py-2 px-4 rounded-xl border border-dashed border-amber-500 bg-amber-50 text-amber-900 font-bold text-xs cursor-pointer hover:bg-amber-100 transition-all mb-2"
                  >
                    📷 Upload Custom Device Photo...
                  </label>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
                      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
                      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400'
                    ].map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => simulateImageSelect(url)}
                        className={`relative rounded-xl overflow-hidden border-2 h-16 transition-all ${
                          mediaSimUrl === url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={url} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>

                  {isCompressing && (
                    <div className="flex items-center justify-center space-x-2 bg-zinc-50 border border-dashed border-zinc-200 p-3 rounded-xl text-xs text-zinc-500">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Compressing image to WebP (low bandwidth)...</span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isCompressing}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-md disabled:opacity-50 mt-2"
              >
                Broadcast Update to Road Feed
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FEED POSTS TIMELINE */}
      <div className="space-y-6" id="feed-timeline">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-500">
            <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No updates matching current filters</p>
            <p className="text-xs mt-1">Try selecting "All Topics" or create a new road update above.</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const hasLiked = post.likesUsers.includes(currentUserProfile.id);
            const postCommentsList = comments[post.id] || [];
            const userReaction = post.reactions?.userReactions?.[currentUserProfile.id];
            const reactions = post.reactions || { affirmative: 0, hammerDown: 0, airHorn: 0, scaleAlert: 0, safeTravels: 0 };
            const isPlayingAudio = playingAudioPostId === post.id;

            return (
              <article key={post.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden" id={`post-${post.id}`}>
                {/* Author Metadata Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-50 bg-zinc-50/40">
                  <div 
                    onClick={() => onViewProfile?.(post.author)}
                    className="flex items-center space-x-3 cursor-pointer group"
                    title={`View @${post.author.username}'s Profile & Timeline`}
                  >
                    <img 
                      src={post.author.avatarUrl} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-amber-400 transition-all" 
                      alt={post.author.displayName} 
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">{post.author.displayName}</span>
                        <span className="text-zinc-400 text-xs">@{post.author.username}</span>
                        {post.author.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10" title="Verified Association Driver" />
                        )}
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5 text-[11px] text-zinc-500">
                        {post.author.cdlClass !== 'None' && (
                          <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            CDL-Class {post.author.cdlClass}
                          </span>
                        )}
                        {post.author.yearsExperience > 0 && (
                          <span>· {post.author.yearsExperience} yrs on road</span>
                        )}
                        {post.author.currentRig && (
                          <span className="hidden sm:inline">· {post.author.currentRig}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-zinc-400">
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        post.isBookmarked 
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                          : 'text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100'
                      }`}
                      title={post.isBookmarked ? 'Saved for Dead-Zones' : 'Save post for offline dead-zones'}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Location Bar if tagged */}
                {post.locationName && (
                  <div className="flex items-center px-5 py-2 bg-amber-50/40 border-b border-amber-100/30 text-xs font-semibold text-amber-900">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" />
                    <span className="truncate">{post.locationName}</span>
                  </div>
                )}

                {/* Post Caption */}
                <div className="px-5 pt-4 pb-3">
                  <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                  
                  {/* Hashtags Cloud */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => setSelectedTag(tag)}
                          className="text-xs text-amber-600 hover:text-amber-700 cursor-pointer font-semibold bg-amber-50 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* EMBEDDED CB RADIO VOICE NOTE AUDIO CLIP (IF AVAILABLE) */}
                {post.audioNote && (
                  <div className="mx-5 mb-4 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">CB VOICE DISPATCH NOTE</span>
                          <h5 className="text-xs font-bold text-white">{post.audioNote.title}</h5>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{post.audioNote.duration}</span>
                    </div>

                    <p className="text-[11px] text-zinc-300 italic bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      "{post.audioNote.transcript}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-zinc-400">Speaker: <strong className="text-zinc-200">{post.audioNote.speakerName}</strong> ({post.audioNote.handle})</span>
                      <button
                        onClick={() => handlePlayAudioNote(post.id, post.audioNote!.transcript)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                          isPlayingAudio 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isPlayingAudio ? 'Stop Radio' : 'Play Dispatch'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* EMBEDDED DRIVER POLL (IF AVAILABLE) */}
                {post.poll && (
                  <div className="mx-5 mb-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3">
                    <div className="flex items-center space-x-2">
                      <BarChart2 className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-slate-900">{post.poll.question}</h4>
                    </div>

                    <div className="space-y-2">
                      {post.poll.options.map(opt => {
                        const total = post.poll!.totalVotes || 1;
                        const pct = Math.round((opt.votes / total) * 100);
                        const hasVotedThis = post.poll!.userVotedId === opt.id;

                        return (
                          <button
                            key={opt.id}
                            disabled={!!post.poll!.userVotedId}
                            onClick={() => handleVotePoll(post.id, opt.id)}
                            className={`w-full text-left p-2.5 rounded-xl border relative overflow-hidden transition-all text-xs font-semibold ${
                              hasVotedThis 
                                ? 'border-amber-500 bg-amber-50/50 text-slate-950 ring-1 ring-amber-500' 
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            {/* Vote Progress Bar */}
                            <div 
                              className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                hasVotedThis ? 'bg-amber-400/25' : 'bg-zinc-100'
                              }`} 
                              style={{ width: `${pct}%` }} 
                            />
                            
                            <div className="relative flex items-center justify-between z-10">
                              <span className="flex items-center space-x-1.5">
                                {hasVotedThis && <Check className="w-3.5 h-3.5 text-amber-700" />}
                                <span>{opt.text}</span>
                              </span>
                              <span className="font-bold text-[11px] text-zinc-500">{pct}% ({opt.votes})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                      <span>{post.poll.totalVotes} total driver votes</span>
                      <span>{post.poll.userVotedId ? 'Ballot Recorded' : 'Tap an option to vote'}</span>
                    </div>
                  </div>
                )}

                {/* Post Media Attachment */}
                {post.mediaUrl && (
                  <div 
                    onClick={() => setLightboxMedia({ 
                      url: post.mediaUrl!, 
                      caption: post.caption, 
                      author: post.author, 
                      type: post.mediaType === 'video' || post.mediaUrl.endsWith('.mp4') ? 'video' : 'image' 
                    })}
                    className="relative border-y border-zinc-100 max-h-[420px] overflow-hidden bg-zinc-950 flex items-center justify-center cursor-pointer group"
                  >
                    {post.mediaType === 'video' || post.mediaUrl.endsWith('.mp4') ? (
                      <video 
                        src={post.mediaUrl} 
                        className="w-full h-full object-cover max-h-[420px]" 
                        controls 
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <>
                        <img 
                          src={post.mediaUrl} 
                          className="w-full h-full object-cover max-h-[420px] group-hover:scale-[1.01] transition-transform duration-300" 
                          alt="Rig update media" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold">
                          <Maximize2 className="w-3.5 h-3.5" /> Enlarge
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* AUTHENTIC TRUCKER REACTIONS BAR */}
                <div className="px-5 py-2.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleTruckerReaction(post.id, 'affirmative')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        userReaction === 'affirmative' 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80'
                      }`}
                      title="10-4 Affirmative"
                    >
                      <span>👍 10-4</span>
                      <span className="text-[10px] text-zinc-500 ml-0.5">{reactions.affirmative}</span>
                    </button>

                    <button
                      onClick={() => handleTruckerReaction(post.id, 'hammerDown')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        userReaction === 'hammerDown' 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80'
                      }`}
                      title="Hammer Down"
                    >
                      <span>💨 Hammer Down</span>
                      <span className="text-[10px] text-zinc-500 ml-0.5">{reactions.hammerDown}</span>
                    </button>

                    <button
                      onClick={() => handleTruckerReaction(post.id, 'airHorn')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        userReaction === 'airHorn' 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80'
                      }`}
                      title="Diesel Air Horn"
                    >
                      <span>🚛 Horn</span>
                      <span className="text-[10px] text-zinc-500 ml-0.5">{reactions.airHorn}</span>
                    </button>

                    <button
                      onClick={() => handleTruckerReaction(post.id, 'scaleAlert')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        userReaction === 'scaleAlert' 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80'
                      }`}
                      title="Scale Warning"
                    >
                      <span>⚖️ Scale</span>
                      <span className="text-[10px] text-zinc-500 ml-0.5">{reactions.scaleAlert}</span>
                    </button>

                    <button
                      onClick={() => handleTruckerReaction(post.id, 'safeTravels')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        userReaction === 'safeTravels' 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80'
                      }`}
                      title="Safe Travels / Keep Rubber Down"
                    >
                      <span>🙏 Safe Travels</span>
                      <span className="text-[10px] text-zinc-500 ml-0.5">{reactions.safeTravels}</span>
                    </button>
                  </div>
                </div>

                {/* Standard Like, Comment, Repost and Flag Metrics */}
                <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-xs font-semibold">
                  <div className="flex items-center space-x-3">
                    <button
                      id={`like-post-${post.id}`}
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1.5 py-1 px-2 rounded-lg transition-colors ${
                        hasLiked 
                          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                          : 'hover:text-slate-900 hover:bg-zinc-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500' : ''}`} />
                      <span>{post.likeCount} Likes</span>
                    </button>

                    <button
                      id={`comments-trigger-${post.id}`}
                      onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
                      className={`flex items-center space-x-1.5 py-1 px-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-zinc-50 ${
                        openCommentsPostId === post.id ? 'text-slate-900 bg-zinc-50 font-bold' : ''
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{postCommentsList.length} Comments</span>
                    </button>

                    <button
                      onClick={() => setRepostModalPost(post)}
                      className="flex items-center space-x-1.5 py-1 px-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-zinc-50 text-zinc-500"
                      title="10-4 Quote Repost"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>10-4 Repost</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {post.author.id !== currentUserProfile.id && onOpenDirectMessage && (
                      <button
                        onClick={() => onOpenDirectMessage(post.author)}
                        className="flex items-center space-x-1 py-1 px-2 rounded-lg text-amber-600 hover:bg-amber-50 text-[11px] font-bold transition-colors"
                        title="Direct CB Message Driver"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">CB Message</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        fileReport(post.id, 'post', 'Inappropriate content flagged by community driver');
                        setToastMsg('⚠️ Broadcast update flagged and submitted to the district moderation queue.');
                      }}
                      className="flex items-center space-x-1 py-1 px-2 rounded-lg hover:text-rose-600 text-zinc-400 text-[11px] transition-colors"
                      title="Report Broadcast"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Flag</span>
                    </button>
                  </div>
                </div>

                {/* THREADED COMMENTS PANEL */}
                {openCommentsPostId === post.id && (
                  <div className="bg-zinc-50 p-5 border-t border-zinc-100 space-y-4" id={`comments-panel-${post.id}`}>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Driver Discussions</h4>
                    
                    {postCommentsList.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2">No diesel fumes in this discussion yet. Type below to chime in!</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {postCommentsList.map(comment => (
                          <div key={comment.id} className="flex space-x-2.5 items-start text-xs bg-white p-3 rounded-xl border border-zinc-100">
                            <img 
                              src={comment.author.avatarUrl} 
                              className="w-7 h-7 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                              alt="commenter" 
                              onClick={() => onViewProfile?.(comment.author)}
                              title={`View @${comment.author.username}'s Profile`}
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div 
                                  className="flex items-center space-x-1 cursor-pointer group"
                                  onClick={() => onViewProfile?.(comment.author)}
                                >
                                  <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{comment.author.displayName}</span>
                                  {comment.author.isVerified && (
                                    <span className="bg-blue-100 text-blue-800 text-[9px] px-1 rounded-sm font-semibold">Verified</span>
                                  )}
                                </div>
                                <span className="text-zinc-400 text-[10px]">
                                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-zinc-700 font-normal leading-relaxed">{comment.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit Comment Field */}
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="text"
                        placeholder="Chime in or offer highway advice..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 px-4 py-2 text-xs text-slate-800 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        id={`submit-comment-${post.id}`}
                        onClick={() => handleSubmitComment(post.id)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* 10-4 QUOTE / REPOST MODAL */}
      {repostModalPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden text-slate-900 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center space-x-2">
                <Repeat className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">10-4 Quote & Re-broadcast Update</h3>
              </div>
              <button
                onClick={() => setRepostModalPost(null)}
                className="text-zinc-400 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteRepost} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Your Commentary / Reaction
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Add your highway advice, verification, or road reaction..."
                  value={repostCommentary}
                  onChange={(e) => setRepostCommentary(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Embedded Original Post Card Preview */}
              <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200/80 space-y-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={repostModalPost.author.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {repostModalPost.author.displayName}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    @{repostModalPost.author.username}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 line-clamp-3 italic">
                  "{repostModalPost.caption}"
                </p>
                {repostModalPost.mediaUrl && (
                  <div className="h-24 rounded-xl overflow-hidden bg-black/10">
                    <img
                      src={repostModalPost.mediaUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRepostModalPost(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" /> Re-broadcast to Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL RESOLUTION LIGHTBOX MEDIA VIEWER */}
      {lightboxMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxMedia(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center shadow-2xl border border-white/10">
              {lightboxMedia.type === 'video' || lightboxMedia.url.endsWith('.mp4') ? (
                <video
                  src={lightboxMedia.url}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={lightboxMedia.url}
                  alt={lightboxMedia.caption || 'Expanded Rig Photo'}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {lightboxMedia.caption && (
              <div className="mt-3 bg-black/70 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-xl border border-white/10 max-w-xl text-center">
                {lightboxMedia.author && (
                  <span className="font-bold text-amber-400 mr-2">
                    @{lightboxMedia.author.username}:
                  </span>
                )}
                <span>{lightboxMedia.caption}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
