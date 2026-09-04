export type UserRole = 'driver' | 'carrier' | 'shop' | 'association' | 'admin' | 'moderator';

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
}

export type PostType = 'photo' | 'video' | 'text' | 'road_report';

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
  upvoteCount: number;
  upvotedUsers: string[];
  expiresAt: string;
  createdAt: string;
  statusValue?: string; // e.g. "Scale Open", "DOT Inspection Active", "15 spots open"
}

export interface Listing {
  id: string;
  seller: Profile;
  title: string;
  description: string;
  price: number;
  category: 'parts' | 'equipment' | 'truck' | 'trailer' | 'service';
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  mediaUrl: string;
  createdAt: string;
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

