import { Profile, Post, Group, RoadReport, Listing, AppNotification, PostComment, MessageThread, DirectMessage } from './types';

export const CURRENT_USER_ID = 'user-123';

export const currentUserProfile: Profile = {
  id: CURRENT_USER_ID,
  username: 'OverdriveWill',
  displayName: 'Willie "Overdrive" Nelson',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  bio: 'Hauling flatbeds since 2012. If it fits, it ships. Owner-Operator running mostly I-40 and I-80 routes.',
  role: 'driver',
  cdlClass: 'A',
  yearsExperience: 14,
  currentRig: '2022 Peterbilt 389 (Chrome Custom)',
  homeBase: 'Nashville, TN',
  lanes: ['I-40 East Coast', 'I-80 Midwest', 'I-75 South'],
  carrierName: 'Independent / Apex Logistics',
  isVerified: true,
  followerCount: 342,
  followingCount: 189,
  postCount: 47,
};

export const sampleProfiles: Profile[] = [
  {
    id: 'user-2',
    username: 'DieselDuchess',
    displayName: 'Sarah "Diesel Duchess" Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: 'Heavy haul specialist pulling wind turbine blades and oversized machinery. Running Western States lanes.',
    role: 'driver',
    cdlClass: 'A',
    yearsExperience: 18,
    currentRig: '2023 Kenworth W900 (Heavy Spec)',
    homeBase: 'Denver, CO',
    lanes: ['I-80 West', 'I-15 Corridor', 'I-90 Northwest'],
    carrierName: 'Mammoth Heavy Haul',
    isVerified: true,
    followerCount: 2450,
    followingCount: 420,
    postCount: 154,
  },
  {
    id: 'user-3',
    username: 'GearJammer_77',
    displayName: 'Marcus "GearJammer" Cruz',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Reefer driver moving produce out of California central valley. Dedicated I-10 and I-20 shipper connections.',
    role: 'driver',
    cdlClass: 'A',
    yearsExperience: 6,
    currentRig: '2021 Freightliner Cascadia',
    homeBase: 'Fresno, CA',
    lanes: ['I-10 West-to-East', 'I-5 West Coast', 'I-20 Southern Route'],
    carrierName: 'Prime Fresh Express',
    isVerified: false,
    followerCount: 124,
    followingCount: 150,
    postCount: 18,
  },
  {
    id: 'user-4',
    username: 'National_ATA',
    displayName: 'American Trucking Chapters',
    avatarUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=200',
    bio: 'Official representative profile for state associations and local chapters. Providing regulatory updates, CDL advocacy, and safety briefings.',
    role: 'association',
    cdlClass: 'None',
    yearsExperience: 0,
    currentRig: 'Fleet Headquarters',
    homeBase: 'Washington, D.C.',
    lanes: ['National Network'],
    carrierName: 'ATA Federation',
    isVerified: true,
    followerCount: 18450,
    followingCount: 230,
    postCount: 1042,
  },
  {
    id: 'user-5',
    username: 'BrakeCheckRick',
    displayName: 'Rick "Brake Check" Callahan',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Running dry vans across the Northeast. Keep the rubber side down and shiny side up!',
    role: 'driver',
    cdlClass: 'A',
    yearsExperience: 25,
    currentRig: '2019 Volvo VNL 860',
    homeBase: 'Allentown, PA',
    lanes: ['I-95 Northeast Corridor', 'I-80 Pennsylvania', 'I-76 turnpike'],
    carrierName: 'Callahan & Sons Logistics',
    isVerified: true,
    followerCount: 890,
    followingCount: 450,
    postCount: 98,
  }
];

export const sampleGroups: Group[] = [
  {
    id: 'group-1',
    name: 'National Owner-Operators Association',
    slug: 'owner-operators',
    description: 'A community for independent owner-operators to discuss fuel cards, maintenance rates, dry-van vs flatbed load boards, business deductions, and state tax guidelines.',
    visibility: 'public',
    coverImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    category: 'association',
    memberCount: 4850,
    isJoined: true,
  },
  {
    id: 'group-2',
    name: 'Flatbed & Heavy Haul Masters',
    slug: 'heavy-haul',
    description: 'The securement experts. Share photos of crazy flatbed loads, oversized escorts, chain and strap techniques, and load securement regulations.',
    visibility: 'public',
    coverImageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600',
    category: 'freight_type',
    memberCount: 2310,
    isJoined: false,
  },
  {
    id: 'group-3',
    name: 'I-80 Winter Survival Chapter',
    slug: 'i80-survival',
    description: 'Real-time winter weather, snow removal updates, chain laws, and parking availability for Interstate 80 from Donner Pass in CA through Wyoming and Nebraska.',
    visibility: 'public',
    coverImageUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=600',
    category: 'region',
    memberCount: 6800,
    isJoined: false,
  },
  {
    id: 'group-4',
    name: 'Women in Trucking Association',
    slug: 'women-in-trucking',
    description: 'A dedicated group highlighting and supporting the incredible female commercial drivers on the highway. Professional networking, safety tips, and mentoring.',
    visibility: 'public',
    coverImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    category: 'association',
    memberCount: 3120,
    isJoined: true,
  }
];

export const samplePosts: Post[] = [
  {
    id: 'post-1',
    author: sampleProfiles[0], // DieselDuchess
    postType: 'photo',
    caption: 'Locked and loaded with this 120-foot wind turbine blade! Escorts are ready, route cleared through the mountain passes of Wyoming on I-80. Shoutout to the DOT guys who actually helped map this bypass.',
    tags: ['#HeavyHaul', '#KenworthW900', '#WindTurbine', '#Wyoming', '#Lanes'],
    locationName: 'I-80 Exit 355 (Laramie, WY)',
    mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    likeCount: 142,
    commentCount: 2,
    likesUsers: ['user-2', 'user-5'],
    createdAt: '2026-09-04T10:30:00-07:00',
  },
  {
    id: 'post-2',
    author: sampleProfiles[2], // National_ATA
    postType: 'text',
    caption: '🚨 REGULATORY ALERT: FMCSA is holding an open comment session regarding upcoming modifications to the Hours of Service (HOS) split-sleeper berth provisions. Our association has voiced strong support for more flexible rest increments to help drivers dodge heavy-city rush hours safely. Let your state representative know your thoughts or use our quick portal link below to submit official driver comments! Keep advocating.',
    tags: ['#RegulatoryUpdate', '#FMCSA', '#HOS', '#OwnerOperator', '#TruckingAdvocacy'],
    locationName: 'Washington, D.C.',
    likeCount: 289,
    commentCount: 5,
    likesUsers: ['user-123'],
    createdAt: '2026-09-04T08:15:00-07:00',
  },
  {
    id: 'post-3',
    author: sampleProfiles[3], // BrakeCheckRick
    postType: 'photo',
    caption: 'Stunning sunset pull-in at the Iowa 80 Truckstop tonight. Parking is filling up fast but managed to grab a spot near the back. Taking my 34-hour restart here to catch up on laundry, a hot shower, and maybe a movie. Highly recommend the prime rib tonight!',
    tags: ['#Iowa80', '#VolvoVNL', '#SunsetHauling', '#34HourRestart', '#TruckerLife'],
    locationName: 'Iowa 80 Truckstop (Walcott, IA)',
    mediaUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    likeCount: 95,
    commentCount: 3,
    likesUsers: ['user-2', 'user-3'],
    createdAt: '2026-09-03T18:40:00-07:00',
  },
  {
    id: 'post-4',
    author: sampleProfiles[1], // GearJammer_77
    postType: 'road_report',
    caption: 'Be careful heading East on I-40 through the gorge near the NC/TN line. Left lane is completely blocked due to rockslide debris. Traffic is backed up about 4 miles. Slow down before the curve at mile marker 7!',
    tags: ['#I40Gorge', '#RoadHazard', '#Alert', '#NorthCarolina', '#SafetyFirst'],
    locationName: 'I-40 East Mile Marker 7 (NC Line)',
    likeCount: 64,
    commentCount: 1,
    likesUsers: ['user-123', 'user-5'],
    createdAt: '2026-09-04T12:00:00-07:00',
  }
];

export const sampleComments: Record<string, PostComment[]> = {
  'post-1': [
    {
      id: 'comment-1',
      postId: 'post-1',
      author: currentUserProfile, // OverdriveWill
      body: 'Incredible rig, Sarah! Those Kenworth heavy specs are built for the work. Be safe on those Wyomian slopes, the crosswinds have been brutal today.',
      createdAt: '2026-09-04T10:45:00-07:00',
    },
    {
      id: 'comment-2',
      postId: 'post-1',
      author: sampleProfiles[3], // BrakeCheckRick
      body: 'That wind blade is no joke. Massive respect to the escort pilots as well. Safe driving!',
      createdAt: '2026-09-04T11:15:00-07:00',
    }
  ],
  'post-2': [
    {
      id: 'comment-3',
      postId: 'post-2',
      author: sampleProfiles[1], // GearJammer_77
      body: 'We absolutely need 6/4 or even 5/5 sleeper splits. Forced 10-hour breaks when you are 30 minutes from home base because of a scale delay are exhausting.',
      createdAt: '2026-09-04T08:35:00-07:00',
    },
    {
      id: 'comment-4',
      postId: 'post-2',
      author: sampleProfiles[0], // DieselDuchess
      body: 'Exactly! Let drivers decide when they are fatigued. The static clocks can cause major rush-hour gridlock risks.',
      createdAt: '2026-09-04T09:02:00-07:00',
    }
  ],
  'post-3': [
    {
      id: 'comment-5',
      postId: 'post-3',
      author: sampleProfiles[1], // GearJammer_77
      body: 'Iowa 80 is like Disneyland for truckers. Enjoy the movie theater!',
      createdAt: '2026-09-03T19:10:00-07:00',
    }
  ]
};

export const sampleRoadReports: RoadReport[] = [
  {
    id: 'report-1',
    author: sampleProfiles[3], // BrakeCheckRick
    reportType: 'scale',
    title: 'I-80 Westbound Scale',
    description: 'Scales are open and pulling everyone in. Dot is conducting random Level 2 inspections near the exit ramp. Clear logbooks before approaching!',
    locationName: 'I-80 Westbound MM 120 (Near Mansfield, OH)',
    upvoteCount: 42,
    upvotedUsers: ['user-123', 'user-2'],
    expiresAt: '2026-09-04T17:44:58-07:00',
    createdAt: '2026-09-04T11:30:00-07:00',
    statusValue: 'Scale Open / Inspection Active'
  },
  {
    id: 'report-2',
    author: sampleProfiles[0], // DieselDuchess
    reportType: 'parking',
    title: 'Love\'s Travel Stop #420',
    description: 'Parking is completely packed out as of 1 PM. About 3 trucks are currently waiting in the turn lane. Recommend trying the Pilot down the road at MM 18.',
    locationName: 'I-75 South MM 42 (London, KY)',
    upvoteCount: 19,
    upvotedUsers: ['user-3'],
    expiresAt: '2026-09-04T16:00:00-07:00',
    createdAt: '2026-09-04T13:00:00-07:00',
    statusValue: 'Full (No Spots)'
  },
  {
    id: 'report-3',
    author: sampleProfiles[2], // National_ATA
    reportType: 'weather',
    title: 'Flash Flood Watch & Severe Storms',
    description: 'Heavy thunderstorm cells hitting the highway with visual range cut to less than 100 feet. Heavy crosswinds up to 45 mph. Hold tight or pull over at the nearest truck stop.',
    locationName: 'I-10 Eastbound (Near Gulfport, MS)',
    upvoteCount: 56,
    upvotedUsers: ['user-123', 'user-5', 'user-2'],
    expiresAt: '2026-09-04T20:00:00-07:00',
    createdAt: '2026-09-04T12:15:00-07:00',
    statusValue: 'Severe Thunderstorms / Winds'
  },
  {
    id: 'report-4',
    author: sampleProfiles[1], // GearJammer_77
    reportType: 'fuel',
    title: 'Unbelievable Fuel Discount!',
    description: 'Diesel price is running at $3.25/gallon with the TA-Petro Association fuel card! Easiest entry and exit, lanes are completely clean. Grab it before prices cycle.',
    locationName: 'TA Travel Center (Dexter, MI)',
    upvoteCount: 27,
    upvotedUsers: ['user-123'],
    expiresAt: '2026-09-05T13:44:58-07:00',
    createdAt: '2026-09-04T09:45:00-07:00',
    statusValue: '$3.25 / gal Diesel'
  }
];

export const sampleListings: Listing[] = [
  {
    id: 'list-1',
    seller: sampleProfiles[0], // DieselDuchess
    title: 'Unused Cobra 29 LTD Classic CB Radio',
    description: 'Brand new, never mounted in truck. Features 40 CB channels, dynamic signal control, SWR calibration, and immediate channel 9 instant emergency link. Standard mic and brackets included.',
    price: 110.00,
    category: 'parts',
    condition: 'new',
    location: 'Denver, CO (Shipping available)',
    mediaUrl: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-03T14:20:00-07:00',
  },
  {
    id: 'list-2',
    seller: sampleProfiles[3], // BrakeCheckRick
    title: 'Bridgestone M710 Ecopia Drive Tires (Set of 4)',
    description: 'Gently used drive tire casings with roughly 85% tread life remaining. Excellent traction for all weather. Saved me hundreds of gallons on fuel. Standard sizing (295/75R22.5). Local pickup only.',
    price: 900.00,
    category: 'equipment',
    condition: 'used',
    location: 'Allentown, PA',
    mediaUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-02T11:00:00-07:00',
  },
  {
    id: 'list-3',
    seller: sampleProfiles[4], // BrakeCheckRick (using Callahan & Sons)
    title: '2016 Great Dane 53ft Utility Dry Van Trailer',
    description: 'Dry van trailer in fantastic road-ready condition. Air ride suspension, aluminum roof, premium wood floors with zero leakage, and swing doors. Inspections up to date. Ready to haul cargo today.',
    price: 14500.00,
    category: 'trailer',
    condition: 'used',
    location: 'Harrisburg, PA',
    mediaUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-01T09:30:00-07:00',
  }
];

export const sampleNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    recipientId: CURRENT_USER_ID,
    actor: sampleProfiles[0], // DieselDuchess
    type: 'like',
    entityId: 'post-1',
    read: false,
    message: 'liked your post "Ready for my long haul through the Carolinas!"',
    createdAt: '2026-09-04T12:30:00-07:00',
  },
  {
    id: 'notif-2',
    recipientId: CURRENT_USER_ID,
    actor: sampleProfiles[1], // GearJammer_77
    type: 'comment',
    entityId: 'post-1',
    read: false,
    message: 'commented on your photo: "Keep that chrome polished!"',
    createdAt: '2026-09-04T11:45:00-07:00',
  },
  {
    id: 'notif-3',
    recipientId: CURRENT_USER_ID,
    actor: sampleProfiles[3], // BrakeCheckRick
    type: 'follow',
    read: true,
    message: 'started following you.',
    createdAt: '2026-09-03T15:20:00-07:00',
  },
  {
    id: 'notif-4',
    recipientId: CURRENT_USER_ID,
    type: 'system',
    read: true,
    message: 'Welcome to the Truckers Social Association! Complete your profile details in your profile tab to connect with nearby chapters.',
    createdAt: '2026-09-01T08:00:00-07:00',
  }
];

export const mockDispatcherAnswers: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['hos', 'split', 'sleeper', 'break', 'fmcsa', 'hours of service', 'hours'],
    answer: "FMCSA split sleeper berth rule allows you to split your required 10-hour off-duty time into two periods: an 8/2 split or a 7/3 split (or even 7.5/2.5 for newer guidelines). The shorter period must be at least 2 consecutive hours (either in or out of sleeper), and the longer period must be at least 7 consecutive hours in the sleeper. Neither period counts against your 14-hour driving window."
  },
  {
    keywords: ['wind', 'wyoming', 'i80', 'i-80', 'weather', 'storms', 'laramie', 'elk mountain'],
    answer: "I-80 Wyoming (especially Elk Mountain and Laramie MM 250-290) is notorious for sudden high-wind advisories and whiteout winter storms. Wind gusts frequently reach 60+ mph, flipping empty flatbeds or light dry vans. When the 'Light & High Profile Vehicle' ban is active, it is illegal and highly dangerous to haul. Best locations to wait are the Travel Centers in Rawlins or Cheyenne."
  },
  {
    keywords: ['dot', 'inspection', 'level 1', 'level 2', 'inspection checklist', 'checklist'],
    answer: "A DOT Level 1 inspection is the most comprehensive roadside audit. It covers both the driver credentials (CDL, Medical Card, ELD log, Seat belt) and the vehicle's mechanics (brakes, lights, securement, tires, fuel system, steering, suspension, frame, and coupling devices). A Level 2 covers driver credentials and only what can be inspected without getting underneath the truck."
  },
  {
    keywords: ['securement', 'strap', 'chain', 'flatbed', 'weight limit', 'working load limit', 'wll'],
    answer: "Cargo securement rules require aggregate Working Load Limit (WLL) of all tie-downs to equal at least 50% of the weight of the cargo. You must have at least 1 tie-down for articles up to 5 feet and under 1100 lbs; 2 tie-downs for articles up to 10 feet; and an additional tie-down for every 10 feet of length beyond that. Chains should be checked for cracks, and straps should have zero tears."
  },
  {
    keywords: ['tax', 'deduction', 'write off', 'per diem', 'expenses', 'owner operator'],
    answer: "Owner-Operators can write off major expenses: fuel, truck lease/loan interest, insurance, repairs, tires, scaling fees, satellite communications, load board subscriptions, and association dues. Also, the standard per diem rate for transportation drivers is highly favorable (currently $80/day in the US for full travel days) and doesn't require saving individual meal receipts, just logging your logs."
  }
];

export const fallbackDispatcherAnswer = "I'm your AI Dispatch Copilot. Ask me anything about FMCSA Hours of Service (HOS) rules, Wyoming I-80 wind conditions, DOT inspection checklists, cargo securement standards (straps/chains), or owner-operator tax deductions!";

export const initialMessageThreads: MessageThread[] = [
  {
    id: 'thread-1',
    participant: sampleProfiles[0], // DieselDuchess (Sarah)
    lastMessageText: "Ten-four! Safe driving in those high winds.",
    lastMessageTime: "2026-09-04T12:30:00-07:00",
    unreadCount: 1,
  },
  {
    id: 'thread-2',
    participant: sampleProfiles[1], // GearJammer_77 (Marcus)
    lastMessageText: "The shipper in Fresno is running 3 hours behind on reefer loads.",
    lastMessageTime: "2026-09-03T16:15:00-07:00",
    unreadCount: 0,
  },
  {
    id: 'thread-3',
    participant: sampleProfiles[3], // BrakeCheckRick (Rick)
    lastMessageText: "Catch you at the Walcott TS tomorrow.",
    lastMessageTime: "2026-09-02T19:40:00-07:00",
    unreadCount: 0,
  }
];

export const initialDirectMessages: DirectMessage[] = [
  // Thread 1
  {
    id: 'dm-1',
    threadId: 'thread-1',
    senderId: 'user-2', // Sarah
    text: "Hey Willie! Are you hauling through Wyoming on I-80 this week?",
    createdAt: "2026-09-04T12:10:00-07:00"
  },
  {
    id: 'dm-2',
    threadId: 'thread-1',
    senderId: 'user-123', // User
    text: "Yeah, Sarah. Moving a flatbed flat-steel payload out of Gary, IN heading west.",
    createdAt: "2026-09-04T12:20:00-07:00"
  },
  {
    id: 'dm-3',
    threadId: 'thread-1',
    senderId: 'user-2', // Sarah
    text: "Ten-four! Safe driving in those high winds. Keep an eye on the Elk Mountain warning boards.",
    createdAt: "2026-09-04T12:30:00-07:00"
  },
  
  // Thread 2
  {
    id: 'dm-4',
    threadId: 'thread-2',
    senderId: 'user-3', // Marcus
    text: "Willie, do you have that dispatcher contact for California Central Valley produce shippers?",
    createdAt: "2026-09-03T16:00:00-07:00"
  },
  {
    id: 'dm-5',
    threadId: 'thread-2',
    senderId: 'user-123', // User
    text: "Check with Apex Fresh dispatch. They usually handle the premium grape and lettuce loads.",
    createdAt: "2026-09-03T16:10:00-07:00"
  },
  {
    id: 'dm-6',
    threadId: 'thread-2',
    senderId: 'user-3', // Marcus
    text: "Got it, thanks. The shipper in Fresno is running 3 hours behind on reefer loads. Avoid the yard if you are nearby.",
    createdAt: "2026-09-03T16:15:00-07:00"
  },

  // Thread 3
  {
    id: 'dm-7',
    threadId: 'thread-3',
    senderId: 'user-5', // Rick
    text: "What lane are you running today Rick?",
    createdAt: "2026-09-02T19:30:00-07:00"
  },
  {
    id: 'dm-8',
    threadId: 'thread-3',
    senderId: 'user-123', // User
    text: "Taking dry freight through Indiana on I-80. Rest restart tomorrow.",
    createdAt: "2026-09-02T19:38:00-07:00"
  },
  {
    id: 'dm-9',
    threadId: 'thread-3',
    senderId: 'user-5', // Rick
    text: "Nice. Catch you at the Walcott TS tomorrow. I am buying the first round of coffee.",
    createdAt: "2026-09-02T19:40:00-07:00"
  }
];
