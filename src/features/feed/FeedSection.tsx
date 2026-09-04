import React, { useState, useEffect } from 'react';
import { Post, PostComment, Profile } from '../../types';
import { samplePosts, sampleComments, currentUserProfile } from '../../data';
import { useModeration } from '../../hooks/useModeration';
import { db } from '../../lib/supabase';
import { Heart, MessageSquare, MapPin, Tag, Image, Clock, Share2, PlusCircle, CheckCircle, ChevronRight, X, AlertTriangle } from 'lucide-react';

interface FeedSectionProps {
  onNotificationAdd: (message: string, type: 'like' | 'comment') => void;
  isDeadZone?: boolean;
}

export default function FeedSection({ onNotificationAdd, isDeadZone = false }: FeedSectionProps) {
  const { fileReport } = useModeration();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Post composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [postType, setPostType] = useState<'photo' | 'text' | 'road_report'>('photo');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaSimUrl, setMediaSimUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Comments view state
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load from Supabase DB (with local seed fallback handled automatically by our db client)
  useEffect(() => {
    const loadData = async () => {
      // Fetch posts
      const { data: postsData, error: postsError } = await db
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!postsError && postsData && postsData.length > 0) {
        setPosts(postsData);
      } else {
        // Fallback to sample seed data if DB is empty or fails
        setPosts(samplePosts);
        localStorage.setItem('trucker_posts', JSON.stringify(samplePosts));
        await db.from('posts').insert(samplePosts);
      }

      // Fetch comments
      const { data: commentsData, error: commentsError } = await db
        .from('comments')
        .select('*');

      if (!commentsError && commentsData && commentsData.length > 0) {
        // Group comments by postId
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
        // Flat insert sample comments for seeding
        const flatComments = Object.entries(sampleComments).flatMap(([postId, list]) => 
          list.map(c => ({ ...c, postId }))
        );
        await db.from('comments').insert(flatComments);
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
          // Trigger mock notification if someone else posted it
          if (post.author.id !== currentUserProfile.id) {
            onNotificationAdd(`${currentUserProfile.displayName} liked your post: "${post.caption.slice(0, 30)}..."`, 'like');
          }
        }
        
        // Asynchronously update Supabase
        db.from('posts').update({ likeCount, likesUsers }).eq('id', postId);
        
        return { ...post, likeCount, likesUsers };
      }
      return post;
    });
    savePosts(updatedPosts);
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

    // Save locally and in Supabase
    await db.from('comments').insert({ ...newComment, postId });

    const postComments = comments[postId] ? [...comments[postId]] : [];
    const updatedComments = {
      ...comments,
      [postId]: [...postComments, newComment]
    };

    saveComments(updatedComments);
    setNewCommentText('');

    // Update comment counter in post
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.author.id !== currentUserProfile.id) {
          onNotificationAdd(`${currentUserProfile.displayName} commented: "${newComment.body.slice(0, 30)}..."`, 'comment');
        }
        const updatedPost = { ...post, commentCount: post.commentCount + 1 };
        db.from('posts').update({ commentCount: post.commentCount + 1 }).eq('id', postId);
        return updatedPost;
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  // Simulated image upload with compression
  const simulateImageSelect = (url: string) => {
    setIsCompressing(true);
    // Simulate low bandwidth trucker compression logic (reducing 10MB to ~150KB WebP)
    setTimeout(() => {
      setMediaSimUrl(url);
      setIsCompressing(false);
    }, 900);
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
          // Compress to WebP (60% quality) or fallback to JPEG
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
    if (!caption.trim() && !mediaSimUrl) return;

    // Process tags
    const processedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: currentUserProfile,
      postType: postType,
      caption: caption.trim(),
      tags: processedTags.length > 0 ? processedTags : ['#TruckerSocial'],
      locationName: locationName.trim() || undefined,
      mediaUrl: postType === 'photo' ? (mediaSimUrl || 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=800') : undefined,
      mediaType: postType === 'photo' ? 'image' : undefined,
      likeCount: 0,
      commentCount: 0,
      likesUsers: [],
      createdAt: new Date().toISOString(),
    };

    if (isDeadZone) {
      const currentQueue = JSON.parse(localStorage.getItem('trucker_offline_media_queue') || '[]');
      const updatedQueue = [newPost, ...currentQueue];
      localStorage.setItem('trucker_offline_media_queue', JSON.stringify(updatedQueue));
      setToastMsg('⚠️ Cellular Dead-Zone Active: Saved post to Offline Upload Queue! It will automatically sync once signal returns.');
    } else {
      await db.from('posts').insert(newPost);
      const updatedPosts = [newPost, ...posts];
      savePosts(updatedPosts);
      setToastMsg('📡 Post published successfully to Road Feed!');
    }

    // Reset fields
    setCaption('');
    setLocationName('');
    setTagsInput('');
    setMediaSimUrl('');
    setIsComposerOpen(false);
  };

  // Filter posts based on tab
  const filteredPosts = activeTab === 'for_you' 
    ? posts 
    : posts.filter(post => post.author.isVerified || post.author.id === currentUserProfile.id);

  return (
    <div className="space-y-6" id="feed-container">
      {toastMsg && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-extrabold uppercase ml-2 text-[10px] hover:opacity-80">✕</button>
        </div>
      )}

      {/* Feed Navigation and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-zinc-100" id="feed-header-bar">
        <div className="flex space-x-1 bg-zinc-100 p-1 rounded-lg self-start" id="feed-tabs">
          <button
            id="tab-foryou"
            onClick={() => setActiveTab('for_you')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'for_you'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            For You
          </button>
          <button
            id="tab-following"
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'following'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            Verified Only
          </button>
        </div>

        <button
          id="btn-new-post"
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Road Update</span>
        </button>
      </div>

      {/* COMPOSER MODAL / OVERLAY */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="post-composer-modal">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-lg font-bold text-slate-900">Compose Highway Update</h3>
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'photo', label: 'Rig / Photo' },
                    { id: 'text', label: 'Log / Question' },
                    { id: 'road_report', label: 'Road Alert' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostType(t.id as any)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                        postType === t.id
                          ? 'bg-slate-900 text-white border-slate-900'
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
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Caption / Details</label>
                <textarea
                  required
                  placeholder="Share details about load weights, rest areas, DOT scale activity, cargo tips, or highway hazards..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm text-slate-800"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Highway Location (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. I-80 West MM 142 (Lovelock, NV)"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Tags (Comma separated)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. HeavyHaul, Peterbilt, SafetyAlert"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Simulated media uploading and optimization */}
              {postType === 'photo' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Attach Rig Photo</label>
                  
                  {/* Real file input */}
                  <input
                    type="file"
                    accept="image/*"
                    id="real-file-upload"
                    className="hidden"
                    onChange={handleRealImageUpload}
                  />
                  <label
                    htmlFor="real-file-upload"
                    className="block text-center py-2 px-4 rounded-xl border border-dashed border-amber-500 bg-amber-50 text-amber-900 font-bold text-xs cursor-pointer hover:bg-amber-100 transition-all mb-3 animate-pulse"
                  >
                    📷 Upload Custom Device Image...
                  </label>

                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-2">Or Use Highway Presets:</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { name: 'Peterbilt Rig', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400' },
                      { name: 'Highway Road', url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400' },
                      { name: 'Sunset Truckstop', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400' }
                    ].map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => simulateImageSelect(img.url)}
                        className={`relative rounded-lg overflow-hidden border-2 h-16 transition-all ${
                          mediaSimUrl === img.url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" alt={img.name} />
                      </button>
                    ))}
                  </div>

                  {isCompressing ? (
                    <div className="flex items-center justify-center space-x-2 bg-zinc-50 border border-dashed border-zinc-200 p-4 rounded-xl text-xs text-zinc-500">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Compressing to WebP 1280px (saving fuel on low cellular bandwidth)...</span>
                    </div>
                  ) : mediaSimUrl ? (
                    <div className="relative rounded-xl overflow-hidden h-40 bg-zinc-100">
                      <img src={mediaSimUrl} className="w-full h-full object-cover" alt="Selected Attachment" />
                      <button
                        type="button"
                        onClick={() => setMediaSimUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-200 rounded-xl p-6 text-center text-zinc-500 hover:bg-zinc-50 transition-colors">
                      <Image className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs">Select a preset rig photo above to simulate compression pipeline</p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isCompressing}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl transition-all text-sm shadow-md disabled:opacity-50 mt-2"
              >
                Broadcast Update to Highway
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
            <p className="font-semibold text-slate-800">No recent updates found</p>
            <p className="text-sm mt-1">Be the first to post a road report or rig update above!</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const hasLiked = post.likesUsers.includes(currentUserProfile.id);
            const postCommentsList = comments[post.id] || [];

            return (
              <article key={post.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden" id={`post-${post.id}`}>
                {/* Author Metadata Header */}
                <div className="p-5 flex items-center justify-between border-b border-zinc-50 bg-zinc-50/50">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={post.author.avatarUrl} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" 
                      alt={post.author.displayName} 
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 text-sm">{post.author.displayName}</span>
                        <span className="text-zinc-400 text-xs">@{post.author.username}</span>
                        {post.author.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10" title="Verified Association Driver" />
                        )}
                      </div>
                      
                      {/* Driver Rig Badge Bar */}
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

                  <div className="flex items-center text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Location Bar if tagged */}
                {post.locationName && (
                  <div className="flex items-center px-5 py-2.5 bg-amber-50/50 border-b border-amber-100/40 text-xs font-semibold text-amber-800">
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
                        <span key={idx} className="text-xs text-amber-600 hover:text-amber-700 cursor-pointer font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Media Attachment */}
                {post.mediaUrl && (
                  <div className="relative border-y border-zinc-100 max-h-[420px] overflow-hidden bg-zinc-50">
                    <img 
                      src={post.mediaUrl} 
                      className="w-full h-full object-cover max-h-[420px]" 
                      alt="Rig update media" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Post Metrics / Actions Tray */}
                <div className="px-5 py-3 border-t border-zinc-50 flex items-center justify-between text-zinc-500 text-xs font-semibold">
                  <div className="flex items-center space-x-4">
                    {/* Like Action */}
                    <button
                      id={`like-post-${post.id}`}
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg transition-colors ${
                        hasLiked 
                          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                          : 'hover:text-slate-900 hover:bg-zinc-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500' : ''}`} />
                      <span>{post.likeCount} Likes</span>
                    </button>

                    {/* View Comments Trigger */}
                    <button
                      id={`comments-trigger-${post.id}`}
                      onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
                      className={`flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-zinc-50 ${
                        openCommentsPostId === post.id ? 'text-slate-900 bg-zinc-50' : ''
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{postCommentsList.length} Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg hover:text-slate-900 hover:bg-zinc-50 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share Link</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        fileReport(post.id, 'post', 'Inappropriate content flagged by community driver');
                        setToastMsg('⚠️ Broadcast update flagged and submitted to the district moderation queue.');
                      }}
                      className="flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 text-zinc-400 transition-colors"
                      title="Report Broadcast"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Flag</span>
                    </button>
                  </div>
                </div>

                {/* THREADED COMMENTS PANEL */}
                {openCommentsPostId === post.id && (
                  <div className="bg-zinc-50 p-5 border-t border-zinc-100 space-y-4" id={`comments-panel-${post.id}`}>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Driver Discussions</h4>
                    
                    {/* Render existing comments */}
                    {postCommentsList.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2">No diesel fumes in this discussion yet. Type below to chime in!</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {postCommentsList.map(comment => (
                          <div key={comment.id} className="flex space-x-2.5 items-start text-xs bg-white p-3 rounded-xl border border-zinc-100">
                            <img src={comment.author.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="commenter" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <span className="font-bold text-slate-900">{comment.author.displayName}</span>
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
                        className="flex-1 px-4 py-2 text-xs text-slate-800 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
    </div>
  );
}
