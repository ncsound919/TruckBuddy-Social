export type UserRole = 'driver' | 'instructor' | 'creator' | 'carrier' | 'shop' | 'association' | 'admin' | 'moderator';

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string | number;
  format: 'In-Cab Practical' | 'Range Maneuvers' | 'Online Tele-Study' | 'Exam Prep' | string;
}

export type CourseOffering = InstructorCourse;

export interface InstructorInfo {
  academyName?: string;
  specialties: string[];
  studentsTrainedCount?: number;
  certifications?: string[];
  acceptingStudents?: boolean;
  hourlyRate?: string | number;
  courses?: InstructorCourse[];
  courseOfferings?: InstructorCourse[];
}

export interface CreatorChannel {
  platform: 'youtube' | 'tiktok' | 'podcast' | 'instagram' | 'twitch' | string;
  handleOrUrl: string;
  followersCount?: string;
}

export interface CreatorInfo {
  channels?: CreatorChannel[];
  contentNiche?: string;
  niche?: string;
  featuredMediaUrl?: string;
  featuredMediaType?: 'video' | 'image';
  featuredTitle?: string;
  featuredVideoTitle?: string;
  totalViews?: string;
  subscriberCount?: number | string;
  youtubeHandle?: string;
  tiktokHandle?: string;
  podcastName?: string;
  instagramHandle?: string;
  equipmentGear?: string[];
  equipmentList?: string[];
}

export interface DriverMilestone {
  id: string;
  userId: string;
  title: string;
  category: 'safety' | 'inspection' | 'endorsement' | 'equipment' | 'career';
  date: string;
  description: string;
  badgeIcon?: string;
  verified?: boolean;
}

export type TimelineFilter = 'all' | 'posts' | 'reports' | 'listings' | 'milestones';

export interface DriverTimelineItem {
  id: string;
  type: 'post' | 'report' | 'listing' | 'milestone';
  timestamp: string;
  title: string;
  description: string;
  location?: string;
  corridor?: string;
  mediaUrl?: string;
  categoryBadge?: string;
  postData?: Post;
  reportData?: RoadReport;
  listingData?: Listing;
  milestoneData?: DriverMilestone;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  cdlClass: 'A' | 'B' | 'C' | 'None';
  yearsExperience: number;
  currentRig: string;
  homeBase: string;
  lanes: string[];
  carrierName: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  instructorInfo?: InstructorInfo;
  creatorInfo?: CreatorInfo;
}

export type PostType = 'photo' | 'video' | 'text' | 'road_report';

export interface PostPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PostPoll {
  question: string;
  options: PostPollOption[];
  userVotedId?: string;
  totalVotes: number;
}

export interface PostAudioNote {
  title: string;
  duration: string;
  speakerName: string;
  handle: string;
  transcript: string;
}

export interface TruckerReactions {
  affirmative: number; // 10-4 Affirmative
  hammerDown: number;  // Hammer Down 💨
  airHorn: number;     // Diesel Horn 🚛
  scaleAlert: number;  // Scale Alert ⚖️
  safeTravels: number; // Safe Travels 🙏
  userReactions?: Record<string, string>; // userId -> reactionType
}

export interface Post {
  id: string;
  author: Profile;
  groupId?: string; // If posted to a specific group/chapter
  postType: PostType;
  caption: string;
  tags: string[];
  locationName?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likeCount: number;
  commentCount: number;
  likesUsers: string[]; // List of user IDs who liked
  createdAt: string;
  poll?: PostPoll;
  audioNote?: PostAudioNote;
  reactions?: TruckerReactions;
  isBookmarked?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  author: Profile;
  body: string;
  createdAt: string;
}

export type GroupVisibility = 'public' | 'private' | 'restricted';

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: GroupVisibility;
  coverImageUrl: string;
  category: 'association' | 'carrier' | 'region' | 'freight_type';
  memberCount: number;
  isJoined?: boolean;
}

export type RoadReportType = 'scale' | 'parking' | 'shipper' | 'fuel' | 'weather' | 'inspection' | 'hazard';

export interface RoadReport {
  id: string;
  author: Profile;
  reportType: RoadReportType;
  title: string;
  description: string;
  locationName: string;
  corridor?: string; // e.g. "I-80", "I-10", "I-40", "I-70", "I-95", "I-5"
  upvoteCount: number;
  upvotedUsers: string[];
  expiresAt: string;
  createdAt: string;
  statusValue?: string; // e.g. "Scale Open", "DOT Inspection Active", "15 spots open"
  weighStatus?: 'open_pulling' | 'closed' | 'prepass_green' | 'level1_blitz';
  verifiedByDriversCount?: number;
}

export type ListingCategory = 'parts' | 'equipment' | 'cab_electronics' | 'tires' | 'truck' | 'trailer' | 'merchandise' | 'service';

export interface Listing {
  id: string;
  seller: Profile;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  mediaUrl: string;
  createdAt: string;
  corridor?: string;
  dotInspected?: boolean;
  preDef?: boolean;
  warrantyIncluded?: boolean;
  isNegotiable?: boolean;
  acceptsTrades?: boolean;
  contactMethod?: 'cb_chat' | 'phone' | 'offer';
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'group_invite' | 'system' | 'report_resolved';

export interface AppNotification {
  id: string;
  recipientId: string;
  actor?: Profile;
  type: NotificationType;
  entityId?: string; // post/listing ID
  read: boolean;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'dispatcher';
  text: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  participant: Profile;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

export type EndorsementSkill = 
  | 'mountain_driving' 
  | 'dock_backing' 
  | 'winter_ice' 
  | 'roadside_rescue' 
  | 'hazmat_safety' 
  | 'heavy_haul' 
  | 'fuel_efficiency';

export interface PeerEndorsement {
  id: string;
  recipientId: string;
  endorser: Profile;
  skill: EndorsementSkill;
  title: string;
  comment: string;
  date: string;
  upvotes: number;
}

export interface ConvoyBeacon {
  id: string;
  leader: Profile;
  title: string;
  corridor: string;
  origin: string;
  destination: string;
  currentMileMarker: string;
  direction: 'Eastbound' | 'Westbound' | 'Northbound' | 'Southbound';
  cruisingSpeedMph: number;
  cbChannel: number;
  members: Profile[];
  maxMembers: number;
  hazmatAllowed: boolean;
  oversizeAllowed: boolean;
  status: 'forming' | 'rolling' | 'fueling_stop' | 'disbanded';
  notes: string;
  fuelSavingsPercent: number;
  createdAt: string;
}

export interface ConvoyChatMessage {
  id: string;
  convoyId: string;
  sender: Profile;
  message: string;
  isAlert?: boolean;
  timestamp: string;
}

export interface CorridorDriverRadar {
  id: string;
  driver: Profile;
  corridor: string;
  currentLocation: string;
  direction: 'EB' | 'WB' | 'NB' | 'SB';
  status: 'rolling' | 'dock_waiting' | 'truck_stop' | 'mechanic_needed';
  rigType: string;
  distanceMilesAway: number;
  lastPing: string;
}

export type DriverMapStatus = 'rolling' | 'parked' | 'loading' | 'off_duty';

export interface MemberLocation {
  id: string;
  driver: Profile;
  lat: number;
  lng: number;
  city: string;
  state: string;
  corridor: string;
  mileMarker?: string;
  status: DriverMapStatus;
  speedMph: number;
  heading: 'EB' | 'WB' | 'NB' | 'SB';
  destinationCity: string;
  rigType: string;
  lastUpdated: string;
  isSharingLocation: boolean;
  privacyLevel: 'exact' | 'corridor' | 'hidden';
  statusNote?: string;
}

export type MileageTimeframe = 'weekly' | 'monthly' | 'annual' | 'all_time';
export type DriverCategory = 'all' | 'solo' | 'team' | 'owner_operator' | 'heavy_haul';
export type VerificationMethod = 'odometer_photo' | 'eld_telematics' | 'bol_scale';

export interface MileageProof {
  id: string;
  userId: string;
  driverName: string;
  driverHandle: string;
  driverAvatar: string;
  method: VerificationMethod;
  proofImageUrl?: string;
  eldProvider?: string;
  odometerStart: number;
  odometerEnd: number;
  milesLogged: number;
  routeCorridor: string;
  originCity: string;
  destinationCity: string;
  dateLogged: string;
  verificationBadge: string;
  verificationCode: string;
  status: 'verified' | 'pending' | 'flagged';
  notes?: string;
  rigUnit: string;
  upvotes: number;
}

export interface MileageLeaderboardEntry {
  id: string;
  driver: Profile;
  rank: number;
  previousRank: number;
  weeklyMiles: number;
  monthlyMiles: number;
  annualMiles: number;
  allTimeMiles: number;
  driverCategory: 'solo' | 'team' | 'owner_operator' | 'heavy_haul';
  verifiedProofsCount: number;
  latestProof?: MileageProof;
  avgMilesPerDay: number;
  streakDays: number;
}

export type PitstopCategory = 
  | 'truck_stop' 
  | 'fuel_station' 
  | 'food_dining' 
  | 'repair_tire' 
  | 'overnight_parking' 
  | 'driver_amenity';

export interface PitstopReview {
  id: string;
  locationId: string;
  author: Profile;
  rating: number; // 1 to 5
  cleanlinessRating?: number; // 1 to 5
  parkingRating?: number; // 1 to 5
  foodRating?: number; // 1 to 5
  serviceRating?: number; // 1 to 5
  reviewText: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaCaption?: string;
  amenitiesConfirmed?: string[]; // e.g. ['Showers Clean', 'DEF at Pump', 'Free High-Speed Wi-Fi', 'Easy Big-Rig Turning']
  visitedAt: string;
  createdAt: string;
  helpfulCount: number;
  helpfulUsers: string[];
}

export interface PitstopLocation {
  id: string;
  name: string;
  category: PitstopCategory;
  brand?: string; // e.g. "Love's", "Pilot Flying J", "TA Petro", "Iowa 80", "Independent"
  address: string;
  city: string;
  state: string;
  corridor: string; // e.g. "I-80", "I-40", "I-10", "I-95", "I-70", "I-35"
  exitNumber?: string;
  mileMarker?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  hours: string; // e.g. "24/7 Open"
  photoUrl: string;
  additionalPhotos?: string[];
  semiParkingSpots: number;
  hasDefAtPump: boolean;
  hasShowers: boolean;
  showerCount?: number;
  hasCatScale: boolean;
  hasRepairShop: boolean;
  hasLaundry: boolean;
  hasWifi: boolean;
  hasFoodCourt: boolean;
  foodOptions: string[];
  overallRating: number;
  reviewCount: number;
  addedBy?: Profile;
  createdAt: string;
}

export interface DriverRoadStatus {
  id: string;
  driver: Profile;
  statusText: string;
  corridor: string;
  mileMarker?: string;
  emoji: string;
  mediaUrl?: string;
  timestamp: string;
  expiresInHours?: number;
  waveCount: number;
  highBeamCount: number;
  hornCount: number;
  cheersCount: number;
  userInteractions?: Record<string, string>; // userId -> reactionType
}

export interface GroupDiscussion {
  id: string;
  groupId: string;
  author: Profile;
  title: string;
  content: string;
  category: 'safety_regulations' | 'rig_builds' | 'rates_dispatch' | 'road_meetups' | 'general';
  createdAt: string;
  upvotes: number;
  upvotedUsers: string[];
  replyCount: number;
  replies?: Array<{
    id: string;
    author: Profile;
    text: string;
    createdAt: string;
  }>;
}

export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  date: string;
  originLocation: string;
  destinationLocation: string;
  cbChannel: number;
  coordinator: Profile;
  attendeesCount: number;
  attendeeProfiles: Profile[];
  isAttending?: boolean;
}


