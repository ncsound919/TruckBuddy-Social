import { supabase, currentUserId, isSupabaseConfigured } from './supabase';
import { accumulateMiles } from './mileage';
import {
  REACTION_TO_DB,
  profileToRow,
  rowToComment,
  rowToConvoy,
  rowToConvoyMessage,
  rowToListing,
  rowToMemberLocation,
  rowToMileageEntry,
  rowToPost,
  rowToProfile,
  rowToRoadReport,
  rowToRoadStatus,
  toDbPostType,
} from './social-mappers';
import type {
  ConvoyBeacon,
  ConvoyChatMessage,
  DriverRoadStatus,
  Listing,
  MemberLocation,
  MileageLeaderboardEntry,
  MileageProof,
  Post,
  PostComment,
  Profile,
  RoadReport,
} from '../types';

/**
 * Live data API for the social app, backed by the shared Truck Buddy Supabase
 * project. Drop-in data seam: it keeps the same exported names the feature
 * components already import, so only the import path changed.
 *
 * Every subscribe* function loads once, then re-loads whenever a relevant row
 * changes on a Realtime channel. Reads/writes are gated by RLS, so a signed-in
 * session is required for anything beyond the seed fallbacks.
 */

type Unsubscribe = () => void;

const COLLECTIONS: Record<string, { table: string; filter?: string }> = {
  posts: { table: 'posts' },
  comments: { table: 'comments' },
  likes: { table: 'likes' },
  roadStatuses: { table: 'road_statuses' },
  roadStatusReactions: { table: 'road_status_reactions' },
  safetyReports: { table: 'safety_reports' },
  safetyReportVotes: { table: 'safety_report_votes' },
  convoys: { table: 'convoys' },
  convoyMembers: { table: 'convoy_members' },
  convoyMessages: { table: 'convoy_messages' },
  memberLocations: { table: 'member_locations' },
  mileageEntries: { table: 'mileage_entries' },
  mileageProofs: { table: 'mileage_proofs' },
  listings: { table: 'listings' },
  profiles: { table: 'profiles' },
  reports: { table: 'reports' },
  postMedia: { table: 'post_media' },
  listingMedia: { table: 'listing_media' },
};

function live<T>(
  channelName: string,
  watch: Array<keyof typeof COLLECTIONS | { key: keyof typeof COLLECTIONS; filter: string }>,
  load: () => Promise<T>,
  onUpdate: (value: T) => void,
): Unsubscribe {
  let active = true;

  const refresh = () => {
    if (!active || !isSupabaseConfigured) return;
    void load()
      .then((value) => {
        if (active) onUpdate(value);
      })
      .catch((err) => console.warn(`[${channelName}] load failed:`, err));
  };

  refresh();

  let channel = supabase.channel(channelName);
  for (const entry of watch) {
    const spec = typeof entry === 'string' ? COLLECTIONS[entry] : COLLECTIONS[entry.key];
    const filter = typeof entry === 'string' ? undefined : entry.filter;
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: spec.table, ...(filter ? { filter } : {}) },
      refresh,
    );
  }
  channel.subscribe();

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}

/* ------------------------------------------------------------------ */
/* Posts, comments, likes                                              */
/* ------------------------------------------------------------------ */

export function subscribeLivePosts(onUpdate: (posts: Post[]) => void): Unsubscribe {
  return live(
    'live-posts',
    ['posts', 'profiles', 'likes', 'postMedia'],
    async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(
          '*, author:profiles!posts_author_id_fkey(*), likes(user_id), post_media(storage_path, media_type, position)',
        )
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map(rowToPost);
    },
    onUpdate,
  );
}

export async function createLivePost(postData: Partial<Post>): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to post');
  const caption = postData.caption || (postData as any).content || '';
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: uid,
      group_id: postData.groupId ?? null,
      post_type: toDbPostType(postData.postType),
      caption,
      content: caption,
      tags: postData.tags ?? ['Dispatch'],
      location_name: postData.locationName ?? 'Highway Dispatch',
      metadata: {
        mediaUrl: postData.mediaUrl,
        mediaType: postData.mediaType,
        poll: postData.poll,
        audioNote: postData.audioNote,
        reactions: postData.reactions,
      },
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function toggleLivePostLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean,
): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export function subscribeLiveComments(
  postId: string,
  onUpdate: (comments: PostComment[]) => void,
): Unsubscribe {
  return live(
    `live-comments-${postId}`,
    [
      { key: 'comments', filter: `post_id=eq.${postId}` },
      'profiles',
    ],
    async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:profiles!comments_author_id_fkey(*)')
        .eq('post_id', postId)
        .eq('is_removed', false)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(rowToComment);
    },
    onUpdate,
  );
}

export async function addLiveComment(postId: string, commentData: Partial<PostComment>): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to comment');
  const body = commentData.body || (commentData as any).text || (commentData as any).content || '';
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: uid, body })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

/* ------------------------------------------------------------------ */
/* Road status beacons                                                 */
/* ------------------------------------------------------------------ */

export function subscribeLiveRoadStatuses(onUpdate: (statuses: DriverRoadStatus[]) => void): Unsubscribe {
  const uidPromise = currentUserId();
  return live(
    'live-road-statuses',
    ['roadStatuses', 'roadStatusReactions', 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('road_statuses')
        .select(
          '*, driver:profiles!road_statuses_driver_id_fkey(*), road_status_reactions(user_id, reaction)',
        )
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const uid = await uidPromise;
      return (data ?? []).map((row) => rowToRoadStatus(row, uid));
    },
    onUpdate,
  );
}

export async function createLiveRoadStatus(statusData: Partial<DriverRoadStatus>): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to post a road status');
  const { data, error } = await supabase
    .from('road_statuses')
    .insert({
      driver_id: uid,
      status_text: statusData.statusText ?? '',
      corridor: statusData.corridor ?? '',
      mile_marker: statusData.mileMarker ?? null,
      emoji: statusData.emoji ?? '',
      media_url: statusData.mediaUrl ?? null,
      metadata: { expiresInHours: statusData.expiresInHours },
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateLiveRoadStatusReaction(
  statusId: string,
  reaction: string,
  userId: string,
  incrementValue: number,
  _prevReaction?: string,
): Promise<void> {
  await supabase.from('road_status_reactions').delete().eq('status_id', statusId).eq('user_id', userId);
  if (incrementValue !== 1) return;
  const { error } = await supabase.from('road_status_reactions').insert({
    status_id: statusId,
    user_id: userId,
    reaction: REACTION_TO_DB[reaction] ?? reaction,
  });
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Safety / road reports                                               */
/* ------------------------------------------------------------------ */

export function subscribeLiveSafetyReports(onUpdate: (reports: RoadReport[]) => void): Unsubscribe {
  return live(
    'live-safety-reports',
    ['safetyReports', 'safetyReportVotes', 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('safety_reports')
        .select(
          '*, author:profiles!safety_reports_author_id_fkey(*), safety_report_votes(user_id, vote)',
        )
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(rowToRoadReport);
    },
    onUpdate,
  );
}

export async function createLiveSafetyReport(reportData: Partial<RoadReport>): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to file a report');
  const { data, error } = await supabase
    .from('safety_reports')
    .insert({
      author_id: uid,
      category: reportData.reportType ?? 'hazard',
      title: reportData.title ?? 'Road Advisory',
      body: reportData.description ?? '',
      latitude: reportData.lat ?? null,
      longitude: reportData.lng ?? null,
      location_name: reportData.locationName ?? 'Mile Marker',
      metadata: {
        corridor: reportData.corridor,
        severity: reportData.severity ?? 'moderate',
        statusValue: reportData.statusValue,
        weighStatus: reportData.weighStatus,
        expiresAt: reportData.expiresAt,
        verifiedByDriversCount: reportData.verifiedByDriversCount,
      },
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function voteLiveSafetyReport(
  reportId: string,
  userId: string,
  isUpvote: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('safety_report_votes')
    .upsert(
      { report_id: reportId, user_id: userId, vote: isUpvote ? 1 : -1 },
      { onConflict: 'report_id,user_id' },
    );
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Convoys + radio chat                                                */
/* ------------------------------------------------------------------ */

export function subscribeLiveConvoys(onUpdate: (convoys: ConvoyBeacon[]) => void): Unsubscribe {
  return live(
    'live-convoys',
    ['convoys', 'convoyMembers', 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('convoys')
        .select(
          '*, leader:profiles!convoys_leader_id_fkey(*), convoy_members(profile:profiles(*))',
        )
        .limit(50);
      if (error) throw error;
      return (data ?? []).map(rowToConvoy);
    },
    onUpdate,
  );
}

export async function createLiveConvoy(convoyData: Partial<ConvoyBeacon>): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to start a convoy');
  const { data, error } = await supabase
    .from('convoys')
    .insert({
      title: convoyData.title ?? (convoyData as any).name ?? 'Highway Convoy',
      leader_id: uid,
      description: convoyData.notes ?? '',
      origin: convoyData.origin ?? '',
      destination: convoyData.destination ?? '',
      metadata: {
        corridor: convoyData.corridor ?? 'I-80 Wyoming',
        cbChannel: convoyData.cbChannel ?? 19,
        cruisingSpeedMph: convoyData.cruisingSpeedMph ?? 65,
        currentMileMarker: convoyData.currentMileMarker ?? '',
        direction: convoyData.direction ?? 'Eastbound',
        maxMembers: convoyData.maxMembers ?? 10,
        hazmatAllowed: convoyData.hazmatAllowed ?? false,
        oversizeAllowed: convoyData.oversizeAllowed ?? false,
        cargoType: convoyData.cargoType ?? 'General Freight',
        status: convoyData.status ?? 'forming',
        fuelSavingsPercent: convoyData.fuelSavingsPercent ?? 0,
      },
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function toggleLiveConvoyMembership(
  convoyId: string,
  profile: Profile,
  isJoining: boolean,
): Promise<void> {
  if (isJoining) {
    const { error } = await supabase
      .from('convoy_members')
      .insert({ convoy_id: convoyId, user_id: profile.id, role: 'member' });
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('convoy_members')
    .delete()
    .eq('convoy_id', convoyId)
    .eq('user_id', profile.id);
  if (error) throw error;
}

export function subscribeLiveConvoyMessages(
  convoyId: string,
  onUpdate: (messages: ConvoyChatMessage[]) => void,
): Unsubscribe {
  return live(
    `live-convoy-msgs-${convoyId}`,
    [{ key: 'convoyMessages', filter: `convoy_id=eq.${convoyId}` }, 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('convoy_messages')
        .select('*, sender:profiles!convoy_messages_sender_id_fkey(*)')
        .eq('convoy_id', convoyId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(rowToConvoyMessage);
    },
    onUpdate,
  );
}

export async function sendLiveConvoyMessage(
  convoyId: string,
  msgData: Partial<ConvoyChatMessage>,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to transmit');
  const { error } = await supabase.from('convoy_messages').insert({
    convoy_id: convoyId,
    sender_id: uid,
    message: msgData.message || (msgData as any).text || '',
  });
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Profiles + member locations                                         */
/* ------------------------------------------------------------------ */

export function subscribeLiveProfiles(onUpdate: (profiles: Profile[]) => void): Unsubscribe {
  return live(
    'live-profiles',
    ['profiles'],
    async () => {
      const { data, error } = await supabase.from('profiles').select('*').limit(100);
      if (error) throw error;
      return (data ?? []).map((row) => rowToProfile(row));
    },
    onUpdate,
  );
}

export async function saveLiveProfile(profile: Profile): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(profileToRow(profile), { onConflict: 'id' });
  if (error) throw error;
}

export function subscribeLiveMemberLocations(onUpdate: (locs: MemberLocation[]) => void): Unsubscribe {
  return live(
    'live-member-locations',
    ['memberLocations', 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('member_locations')
        .select('*, driver:profiles!member_locations_user_id_fkey(*)')
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(rowToMemberLocation);
    },
    onUpdate,
  );
}

/**
 * Round a coordinate to the precision implied by the privacy level. Even
 * 'exact' is coarsened to ~110 m; the map never stores a precise fix.
 */
export function quantizeCoord(value: number, level: MemberLocation['privacyLevel']): number {
  const decimals = level === 'corridor' ? 2 : 3; // ~1.1 km vs ~110 m
  return Number(value.toFixed(decimals));
}

export async function updateLiveMemberLocation(loc: MemberLocation): Promise<void> {
  const uid = loc.driver?.id ?? loc.id;
  // Opt-out/hidden = leave no location on the server at all.
  if (!loc.isSharingLocation || loc.privacyLevel === 'hidden') {
    const { error } = await supabase.from('member_locations').delete().eq('user_id', uid);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('member_locations').upsert(
    {
      user_id: uid,
      latitude: quantizeCoord(loc.lat, loc.privacyLevel),
      longitude: quantizeCoord(loc.lng, loc.privacyLevel),
      location_name: loc.city || loc.destinationCity || '',
      status: loc.status,
      is_sharing: loc.isSharingLocation,
      metadata: {
        city: loc.city,
        state: loc.state,
        corridor: loc.corridor,
        mileMarker: loc.mileMarker,
        speedMph: loc.speedMph,
        heading: loc.heading,
        destinationCity: loc.destinationCity,
        rigType: loc.rigType,
        privacyLevel: loc.privacyLevel,
        statusNote: loc.statusNote,
      },
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Mileage leaderboard + proofs                                        */
/* ------------------------------------------------------------------ */

export function subscribeLiveMileageLeaderboard(
  onUpdate: (entries: MileageLeaderboardEntry[]) => void,
): Unsubscribe {
  return live(
    'live-mileage',
    ['mileageEntries', 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('mileage_entries')
        .select('*, driver:profiles!mileage_entries_user_id_fkey(*)')
        .order('miles', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((row, i) => rowToMileageEntry(row, i + 1));
    },
    onUpdate,
  );
}

export async function submitLiveMileageProof(entry: MileageProof, driver: Profile): Promise<void> {
  const uid = driver.id;
  const { error: proofError } = await supabase.from('mileage_proofs').insert({
    user_id: uid,
    miles_logged: entry.milesLogged,
    period: entry.dateLogged?.slice(0, 7),
    evidence_url: entry.proofImageUrl ?? null,
    // Always submitted for review; the client cannot self-approve mileage.
    status: 'pending',
    metadata: {
      method: entry.method,
      eldProvider: entry.eldProvider,
      odometerStart: entry.odometerStart,
      odometerEnd: entry.odometerEnd,
      routeCorridor: entry.routeCorridor,
      originCity: entry.originCity,
      destinationCity: entry.destinationCity,
      dateLogged: entry.dateLogged,
      verificationBadge: entry.verificationBadge,
      verificationCode: entry.verificationCode,
      rigUnit: entry.rigUnit,
    },
  });
  if (proofError) throw proofError;

  const period = (entry.dateLogged || new Date().toISOString()).slice(0, 7);
  // Accumulate into the period's existing total. Overwriting would erase every
  // prior run in the same month; and is_verified stays false until reviewed.
  const { data: existing } = await supabase
    .from('mileage_entries')
    .select('miles')
    .eq('user_id', uid)
    .eq('period', period)
    .maybeSingle();
  const total = accumulateMiles((existing as { miles?: number } | null)?.miles, entry.milesLogged);

  const { error: entryError } = await supabase.from('mileage_entries').upsert(
    {
      user_id: uid,
      period,
      miles: total,
      is_verified: false,
      metadata: {
        weeklyMiles: total,
        monthlyMiles: total,
        annualMiles: total,
        allTimeMiles: total,
        driverCategory: driver.yearsExperience > 15 ? 'heavy_haul' : 'solo',
        verifiedProofsCount: 0,
      },
    },
    { onConflict: 'user_id,period' },
  );
  if (entryError) throw entryError;
}

/* ------------------------------------------------------------------ */
/* Marketplace                                                         */
/* ------------------------------------------------------------------ */

export function subscribeLiveListings(onUpdate: (listings: Listing[]) => void): Unsubscribe {
  return live(
    'live-listings',
    ['listings', 'listingMedia', 'profiles'],
    async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, seller:profiles!listings_seller_id_fkey(*), listing_media(storage_path, position)')
        .neq('status', 'removed')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(rowToListing);
    },
    onUpdate,
  );
}

export async function createLiveListing(listingData: Partial<Listing>): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to list an item');
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: uid,
      title: listingData.title ?? '',
      description: listingData.description ?? '',
      price: listingData.price ?? 0,
      category: listingData.category ?? 'parts',
      condition: listingData.condition ?? 'used',
      location: listingData.location ?? '',
      metadata: {
        mediaUrl: listingData.mediaUrl,
        corridor: listingData.corridor,
        dotInspected: listingData.dotInspected,
        preDef: listingData.preDef,
        warrantyIncluded: listingData.warrantyIncluded,
        isNegotiable: listingData.isNegotiable,
        acceptsTrades: listingData.acceptsTrades,
        contactMethod: listingData.contactMethod,
      },
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteLiveListing(listingId: string): Promise<void> {
  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Moderation (reports + moderation_actions, DB-backed)                */
/* ------------------------------------------------------------------ */

export type ReportReasonEnum = 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';

export interface LiveModerationReport {
  id: string;
  reporterId: string;
  targetType: string;
  targetRef: string;
  reason: string;
  details: string | null;
  status: 'open' | 'actioned' | 'dismissed';
  createdAt: string;
}

/** Map a free-text UI reason onto the DB `report_reason` enum. */
export function toReportReason(text: string): ReportReasonEnum {
  const t = (text || '').toLowerCase();
  if (t.includes('spam') || t.includes('advert') || t.includes('broker license')) return 'spam';
  if (t.includes('harass') || t.includes('threat')) return 'harassment';
  if (t.includes('inappropriate') || t.includes('explicit') || t.includes('abuse')) return 'inappropriate';
  if (t.includes('misinformation') || t.includes('false') || t.includes('rumor')) return 'misinformation';
  return 'other';
}

export function rowToLiveReport(row: Record<string, any>): LiveModerationReport {
  return {
    id: row.id,
    reporterId: row.reporter_id ?? '',
    targetType: row.target_type ?? 'post',
    targetRef: row.target_ref ?? row.target_id ?? '',
    reason: row.reason ?? 'other',
    details: row.details ?? null,
    status: (row.status ?? 'open') as LiveModerationReport['status'],
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function subscribeLiveReports(onUpdate: (reports: LiveModerationReport[]) => void): Unsubscribe {
  return live(
    'live-reports',
    ['reports', 'profiles'],
    async () => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map(rowToLiveReport);
    },
    onUpdate,
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidv4(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** The DB table that holds a reportable content type. */
export function moderationTargetTable(type: string): 'posts' | 'listings' | 'safety_reports' {
  if (type === 'listing') return 'listings';
  if (type === 'road_report') return 'safety_reports';
  return 'posts';
}

export async function createLiveReport(input: {
  targetType: 'post' | 'listing' | 'road_report';
  targetId: string;
  reason: string;
  details?: string;
}): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to file a report');
  const ref = String(input.targetId);
  const targetId = UUID_RE.test(ref) ? ref : uuidv4();
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: uid,
      target_type: input.targetType,
      target_id: targetId,
      target_ref: ref,
      reason: toReportReason(input.reason),
      details: input.details ?? input.reason ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function resolveLiveReport(
  reportId: string,
  action: 'dismiss' | 'remove_content' | 'warn' | 'ban_user',
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Sign in to moderate');

  // Fetch the target first so 'remove_content' actually hides it.
  const { data: report } = await supabase
    .from('reports')
    .select('target_type,target_ref,target_id')
    .eq('id', reportId)
    .maybeSingle();

  if (action === 'remove_content' && report) {
    const r = report as { target_type: string; target_ref: string | null; target_id: string };
    const table = moderationTargetTable(r.target_type);
    // Only a real DB row (a UUID ref) can be hidden. A non-UUID ref is seed/demo
    // content that is not in the database; fail loudly rather than reporting a
    // removal that never happened.
    const key = r.target_ref && UUID_RE.test(r.target_ref) ? r.target_ref : '';
    if (!key) {
      throw new Error('This content is not stored in the database and cannot be removed here.');
    }
    const { error: contentError } = await supabase.from(table).update({ is_removed: true }).eq('id', key);
    if (contentError) throw contentError;
  }

  const { error } = await supabase
    .from('reports')
    .update({
      status: action === 'dismiss' ? 'dismissed' : 'actioned',
      resolved_by: uid,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  if (error) throw error;

  // Action row last, so a rejected report update does not leave an orphan action.
  const { error: actionError } = await supabase
    .from('moderation_actions')
    .insert({ moderator_id: uid, report_id: reportId, action });
  if (actionError) throw actionError;
}

/* ------------------------------------------------------------------ */
/* Auth helpers                                                        */
/* ------------------------------------------------------------------ */

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}
