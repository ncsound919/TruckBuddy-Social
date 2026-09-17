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
  UserRole,
} from '../types';
import { publicMediaUrl } from './supabase';

/**
 * Row <-> domain mappers between the normalised Supabase schema and the rich
 * client types in `src/types.ts`. First-class columns map directly; client-only
 * detail rides in each row's `metadata` JSONB bag (see migration 0008).
 */

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

type Row = Record<string, any>;

export function fallbackProfile(id: string, overrides: Partial<Profile> = {}): Profile {
  return {
    id,
    username: 'driver',
    displayName: 'Driver',
    avatarUrl: DEFAULT_AVATAR,
    bio: '',
    role: 'driver',
    cdlClass: 'None',
    yearsExperience: 0,
    currentRig: '',
    homeBase: '',
    lanes: [],
    carrierName: 'Independent',
    isVerified: false,
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
    ...overrides,
  };
}

export function rowToProfile(row?: Row | null, overrides: Partial<Profile> = {}): Profile {
  if (!row) return fallbackProfile('unknown', overrides);
  const meta = row.metadata ?? {};
  return {
    id: row.id,
    username: row.username ?? 'driver',
    displayName: row.display_name || row.username || 'Driver',
    avatarUrl: row.avatar_url || DEFAULT_AVATAR,
    bio: row.bio ?? '',
    role: (row.role ?? 'driver') as UserRole,
    cdlClass: (row.cdl_class ?? 'None') as Profile['cdlClass'],
    yearsExperience: row.years_experience ?? 0,
    currentRig: row.current_rig ?? '',
    homeBase: row.home_base ?? '',
    lanes: row.lanes ?? [],
    carrierName: row.carrier_name ?? 'Independent',
    isVerified: Boolean(row.is_verified),
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
    postCount: row.post_count ?? 0,
    instructorInfo: meta.instructorInfo,
    creatorInfo: meta.creatorInfo,
    ...overrides,
  };
}

export function profileToRow(profile: Profile): Row {
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    bio: profile.bio,
    role: profile.role,
    cdl_class: profile.cdlClass,
    years_experience: profile.yearsExperience,
    current_rig: profile.currentRig,
    home_base: profile.homeBase,
    lanes: profile.lanes,
    carrier_name: profile.carrierName,
    is_verified: profile.isVerified,
    metadata: {
      instructorInfo: profile.instructorInfo,
      creatorInfo: profile.creatorInfo,
    },
  };
}

/** The legacy backend used 'image'; the schema enum uses 'photo'. */
export function toDbPostType(t: string | undefined): string {
  if (!t) return 'text';
  return t === 'image' ? 'photo' : t;
}

function fromDbPostType(t: string | undefined): Post['postType'] {
  if (!t) return 'text';
  return (t === 'image' ? 'photo' : t) as Post['postType'];
}

export function rowToPost(row: Row): Post {
  const meta = row.metadata ?? {};
  const media: Row[] = Array.isArray(row.post_media) ? row.post_media : [];
  const firstMedia = [...media].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
  const likes: Row[] = Array.isArray(row.likes) ? row.likes : [];
  return {
    id: row.id,
    author: rowToProfile(row.author, fallbackProfile(row.author_id ?? 'unknown')),
    groupId: row.group_id ?? undefined,
    postType: fromDbPostType(row.post_type),
    caption: row.caption ?? row.content ?? '',
    tags: row.tags ?? [],
    locationName: row.location_name ?? undefined,
    mediaUrl: firstMedia
      ? publicMediaUrl(firstMedia.storage_path, 'post-media')
      : (meta.mediaUrl ?? undefined),
    mediaType: firstMedia?.media_type ?? meta.mediaType,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    likesUsers: likes.map((l) => l.user_id),
    createdAt: row.created_at ?? new Date().toISOString(),
    poll: meta.poll,
    audioNote: meta.audioNote,
    reactions: meta.reactions,
    isBookmarked: meta.isBookmarked,
  };
}

export function rowToComment(row: Row): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    author: rowToProfile(row.author, fallbackProfile(row.author_id ?? 'unknown')),
    body: row.body ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export const REACTION_TO_DB: Record<string, string> = {
  wave: 'wave',
  highBeam: 'high_beam',
  horn: 'horn',
  cheers: 'cheers',
};

export const REACTION_FROM_DB: Record<string, string> = {
  wave: 'wave',
  high_beam: 'highBeam',
  horn: 'horn',
  cheers: 'cheers',
};

export function rowToRoadStatus(row: Row, currentUserId?: string | null): DriverRoadStatus {
  const meta = row.metadata ?? {};
  const reactions: Row[] = Array.isArray(row.road_status_reactions) ? row.road_status_reactions : [];
  const userInteractions: Record<string, string> = {};
  for (const r of reactions) {
    if (currentUserId && r.user_id === currentUserId) {
      userInteractions[r.user_id] = REACTION_FROM_DB[r.reaction] ?? r.reaction;
    }
  }
  return {
    id: row.id,
    driver: rowToProfile(row.driver, fallbackProfile(row.driver_id ?? 'unknown')),
    statusText: row.status_text ?? '',
    corridor: row.corridor ?? '',
    mileMarker: row.mile_marker ?? undefined,
    emoji: row.emoji ?? '',
    mediaUrl: row.media_url ?? undefined,
    timestamp: row.created_at ?? new Date().toISOString(),
    expiresInHours: meta.expiresInHours,
    waveCount: row.wave_count ?? 0,
    highBeamCount: row.high_beam_count ?? 0,
    hornCount: row.horn_count ?? 0,
    cheersCount: row.cheers_count ?? 0,
    userInteractions,
  };
}

export function rowToRoadReport(row: Row): RoadReport {
  const meta = row.metadata ?? {};
  const votes: Row[] = Array.isArray(row.safety_report_votes) ? row.safety_report_votes : [];
  return {
    id: row.id,
    author: rowToProfile(row.author, fallbackProfile(row.author_id ?? 'unknown')),
    reportType: (row.category ?? 'hazard') as RoadReport['reportType'],
    title: row.title ?? '',
    description: row.body ?? '',
    locationName: row.location_name ?? '',
    corridor: meta.corridor,
    lat: row.latitude ?? undefined,
    lng: row.longitude ?? undefined,
    severity: meta.severity,
    upvoteCount: row.upvote_count ?? 0,
    upvotedUsers: votes.filter((v) => v.vote === 1).map((v) => v.user_id),
    expiresAt: meta.expiresAt,
    createdAt: row.created_at ?? new Date().toISOString(),
    statusValue: meta.statusValue,
    weighStatus: meta.weighStatus,
    verifiedByDriversCount: meta.verifiedByDriversCount,
  };
}

export function rowToConvoy(row: Row): ConvoyBeacon {
  const meta = row.metadata ?? {};
  const members: Row[] = Array.isArray(row.convoy_members) ? row.convoy_members : [];
  return {
    id: row.id,
    leader: rowToProfile(row.leader, fallbackProfile(row.leader_id ?? 'unknown')),
    title: row.title ?? 'Highway Convoy',
    corridor: meta.corridor ?? '',
    origin: row.origin ?? '',
    destination: row.destination ?? '',
    currentMileMarker: meta.currentMileMarker ?? '',
    direction: meta.direction ?? 'Eastbound',
    cruisingSpeedMph: meta.cruisingSpeedMph ?? 65,
    cbChannel: meta.cbChannel ?? 19,
    members: members
      .map((m) => rowToProfile(m.profile ?? m.profiles))
      .filter((p) => p.id !== 'unknown'),
    maxMembers: meta.maxMembers ?? 10,
    hazmatAllowed: Boolean(meta.hazmatAllowed),
    oversizeAllowed: Boolean(meta.oversizeAllowed),
    cargoType: row.metadata?.cargoType ?? meta.cargoType,
    status: meta.status ?? 'forming',
    notes: row.description ?? '',
    fuelSavingsPercent: meta.fuelSavingsPercent ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function rowToConvoyMessage(row: Row): ConvoyChatMessage {
  const created = row.created_at ? new Date(row.created_at) : new Date();
  return {
    id: row.id,
    convoyId: row.convoy_id,
    sender: rowToProfile(row.sender, fallbackProfile(row.sender_id ?? 'unknown')),
    message: row.message ?? '',
    text: row.message ?? '',
    audioFx: row.audio_fx ?? null,
    isAlert: Boolean(row.is_alert),
    timestamp: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export function rowToMemberLocation(row: Row): MemberLocation {
  const meta = row.metadata ?? {};
  return {
    id: row.user_id,
    driver: rowToProfile(row.driver, fallbackProfile(row.user_id ?? 'unknown')),
    lat: row.latitude ?? 0,
    lng: row.longitude ?? 0,
    city: meta.city ?? row.location_name ?? '',
    state: meta.state ?? '',
    corridor: meta.corridor ?? '',
    mileMarker: meta.mileMarker,
    status: (meta.status ?? row.status ?? 'rolling') as MemberLocation['status'],
    speedMph: meta.speedMph ?? 0,
    heading: meta.heading ?? 'EB',
    destinationCity: meta.destinationCity ?? '',
    rigType: meta.rigType ?? '',
    lastUpdated: row.updated_at ?? new Date().toISOString(),
    isSharingLocation: row.is_sharing ?? true,
    privacyLevel: meta.privacyLevel ?? 'corridor',
    statusNote: meta.statusNote,
  };
}

export function rowToListing(row: Row): Listing {
  const meta = row.metadata ?? {};
  const media: Row[] = Array.isArray(row.listing_media) ? row.listing_media : [];
  const firstMedia = [...media].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
  return {
    id: row.id,
    seller: rowToProfile(row.seller, fallbackProfile(row.seller_id ?? 'unknown')),
    title: row.title ?? '',
    description: row.description ?? '',
    price: Number(row.price ?? 0),
    category: (row.category ?? 'parts') as Listing['category'],
    condition: (row.condition ?? 'used') as Listing['condition'],
    location: row.location ?? '',
    mediaUrl: firstMedia
      ? (publicMediaUrl(firstMedia.storage_path, 'listing-media') ?? '')
      : (meta.mediaUrl ?? ''),
    createdAt: row.created_at ?? new Date().toISOString(),
    corridor: meta.corridor,
    dotInspected: meta.dotInspected,
    preDef: meta.preDef,
    warrantyIncluded: meta.warrantyIncluded,
    isNegotiable: meta.isNegotiable,
    acceptsTrades: meta.acceptsTrades,
    contactMethod: meta.contactMethod,
  };
}

export function rowToMileageEntry(row: Row, rank: number): MileageLeaderboardEntry {
  const meta = row.metadata ?? {};
  const miles = Number(row.miles ?? 0);
  return {
    id: row.id,
    driver: rowToProfile(row.driver, fallbackProfile(row.user_id ?? 'unknown')),
    rank,
    previousRank: meta.previousRank ?? rank,
    weeklyMiles: meta.weeklyMiles ?? miles,
    monthlyMiles: meta.monthlyMiles ?? miles,
    annualMiles: meta.annualMiles ?? miles,
    allTimeMiles: meta.allTimeMiles ?? miles,
    driverCategory: meta.driverCategory ?? 'solo',
    verifiedProofsCount: meta.verifiedProofsCount ?? 0,
    avgMilesPerDay: meta.avgMilesPerDay ?? 0,
    streakDays: meta.streakDays ?? 0,
  };
}

export function rowToMileageProof(row: Row): MileageProof {
  const meta = row.metadata ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    driverName: meta.driverName ?? 'Driver',
    driverHandle: meta.driverHandle ?? '',
    driverAvatar: meta.driverAvatar ?? DEFAULT_AVATAR,
    method: meta.method ?? 'odometer_photo',
    proofImageUrl: row.evidence_url ?? undefined,
    eldProvider: meta.eldProvider,
    odometerStart: meta.odometerStart ?? 0,
    odometerEnd: meta.odometerEnd ?? 0,
    milesLogged: Number(row.miles_logged ?? 0),
    miles: Number(row.miles_logged ?? 0),
    currentOdometer: meta.odometerEnd,
    routeCorridor: meta.routeCorridor ?? '',
    originCity: meta.originCity ?? '',
    destinationCity: meta.destinationCity ?? '',
    dateLogged: meta.dateLogged ?? row.created_at ?? new Date().toISOString(),
    verificationBadge: meta.verificationBadge ?? '',
    verificationCode: meta.verificationCode ?? '',
    status: (row.status === 'approved' ? 'verified' : row.status === 'rejected' ? 'flagged' : 'pending') as MileageProof['status'],
    notes: meta.notes,
    rigUnit: meta.rigUnit ?? '',
    upvotes: meta.upvotes ?? 0,
  };
}
