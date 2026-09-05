import { 
  Profile, 
  Post, 
  Group, 
  RoadReport, 
  Listing, 
  AppNotification, 
  PostComment, 
  MessageThread, 
  DirectMessage, 
  DriverMilestone,
  PeerEndorsement,
  ConvoyBeacon,
  CorridorDriverRadar,
  ConvoyChatMessage,
  MemberLocation,
  MileageProof,
  MileageLeaderboardEntry,
  PitstopLocation,
  PitstopReview,
  DriverRoadStatus,
  GroupDiscussion,
  GroupEvent
} from './types';

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
  },
  {
    id: 'user-6',
    username: 'CoachMiller_CDL',
    displayName: 'Dave "Coach" Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    bio: 'Master CDL Class A Instructor with 22 years over the road. Teaching the next generation how to back into tight docks, master mountain passes, and stay safe.',
    role: 'instructor',
    cdlClass: 'A',
    yearsExperience: 22,
    currentRig: 'Apex Training Simulator & KW T680',
    homeBase: 'Dallas, TX',
    lanes: ['I-35 Texas Corridor', 'I-40 Southwest', 'I-20 Southern Route'],
    carrierName: 'Lone Star Commercial Driving Academy',
    isVerified: true,
    followerCount: 5420,
    followingCount: 310,
    postCount: 284,
    instructorInfo: {
      academyName: 'Lone Star Commercial Driving Academy',
      specialties: ['90° Alley-Dock Backing', 'Pre-Trip Inspection Walkthrough', 'Mountain Downgrades & Jake Brake', 'Winter Chain-Up Controls', 'Logbook & Hours of Service Mastery'],
      studentsTrainedCount: 520,
      certifications: ['CVTA Master Certified Instructor', 'DOT Safety Specialist', 'Smith System 5 Keys Pro'],
      acceptingStudents: true,
      hourlyRate: '$65 / Hour Practical',
      courses: [
        {
          id: 'course-1',
          title: 'Blind-Side & 90° Alley-Dock Mastery',
          description: 'Master trailer pivot points, 45° setups, and micro-steer corrections without panic.',
          duration: '3.5 Hours Practical',
          price: '$140',
          format: 'In-Cab Practical'
        },
        {
          id: 'course-2',
          title: 'DOT Class A Pre-Trip Walkaround Blitz',
          description: 'Step-by-step air brake test, steering linkages, fifth wheel gap, and pass the examiner on first attempt.',
          duration: '4 Hours Range',
          price: '$95',
          format: 'Range Maneuvers'
        },
        {
          id: 'course-3',
          title: 'Winter Chain-Up & Rocky Mountain Pass Tactics',
          description: 'Donner Pass & Elk Mountain survival, brake cooling, speed control on 6% grades, and cam chain install.',
          duration: '2 Hours Tele-Study',
          price: '$65',
          format: 'Online Tele-Study'
        }
      ]
    }
  },
  {
    id: 'user-7',
    username: 'HighwayVlogs_Brenda',
    displayName: 'Brenda "RoadCam" Kelly',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    bio: 'Full-time OTR creator documenting life behind the wheel of a purple Peterbilt 389. Unfiltered cab tours, truck stop honest reviews, and highway sunsets.',
    role: 'creator',
    cdlClass: 'A',
    yearsExperience: 9,
    currentRig: '2023 Peterbilt 389 Extended Hood (Purple Reign)',
    homeBase: 'Phoenix, AZ',
    lanes: ['I-10 Transcon', 'I-40 West', 'I-15 Desert Run'],
    carrierName: 'RoadCam Media & Freight',
    isVerified: true,
    followerCount: 38400,
    followingCount: 620,
    postCount: 612,
    creatorInfo: {
      channels: [
        { platform: 'youtube', handleOrUrl: '@BrendaRoadCamOTR', followersCount: '185K subscribers' },
        { platform: 'tiktok', handleOrUrl: '@brenda_trucker_life', followersCount: '420K followers' },
        { platform: 'podcast', handleOrUrl: 'The Diesel Frequency Podcast', followersCount: '48K weekly listeners' },
        { platform: 'instagram', handleOrUrl: '@brenda_peterbilt389', followersCount: '95K followers' }
      ],
      contentNiche: 'Rig Tours, Honest Truck Stop Reviews, & Life on the Interstate',
      featuredMediaUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
      featuredMediaType: 'video',
      featuredTitle: 'Wyoming Winter Storm Survial & Cab Comfort Tour | Peterbilt 389',
      totalViews: '4.8M views',
      equipmentGear: ['GoPro Hero 12 Windshield Mount', 'DJI Mic 2 Dual Wireless', 'Garmin dēzl OTR710 Dashcam', 'Sony A7IV B-Roll Cam']
    }
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
    tags: ['#HeavyHaul', '#KenworthW900', '#WindTurbine', '#Wyoming', '#I80Corridor'],
    locationName: 'I-80 Exit 355 (Laramie, WY)',
    mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    likeCount: 142,
    commentCount: 2,
    likesUsers: ['user-2', 'user-5'],
    createdAt: '2026-09-04T10:30:00-07:00',
    reactions: {
      affirmative: 65,
      hammerDown: 42,
      airHorn: 38,
      scaleAlert: 4,
      safeTravels: 89,
    },
    audioNote: {
      title: 'Elk Mountain Escort Radio Dispatch',
      duration: '0:38',
      speakerName: 'Sarah "Diesel Duchess"',
      handle: 'Channel 19 Pilot',
      transcript: 'Pilot cars in front and rear, wind speeds at 28 mph, keeping speed at 45 on the grades. Breaker 19, wide load passing mile marker 260.'
    }
  },
  {
    id: 'post-2',
    author: sampleProfiles[2], // National_ATA
    postType: 'text',
    caption: '🚨 REGULATORY POLL: FMCSA is reviewing Hours of Service (HOS) split-sleeper berth provisions. How do you prefer to manage rest splits when running cross-country?',
    tags: ['#RegulatoryPoll', '#FMCSA', '#HOS', '#OwnerOperator', '#TruckingAdvocacy'],
    locationName: 'Washington, D.C.',
    likeCount: 289,
    commentCount: 5,
    likesUsers: ['user-123'],
    createdAt: '2026-09-04T08:15:00-07:00',
    reactions: {
      affirmative: 110,
      hammerDown: 22,
      airHorn: 45,
      scaleAlert: 78,
      safeTravels: 130,
    },
    poll: {
      question: 'Which HOS sleeper split structure works best for highway safety?',
      options: [
        { id: 'opt-1', text: 'Flexible 7/3 or 8/2 split (Current Rule)', votes: 142 },
        { id: 'opt-2', text: '5/5 or 6/4 equal split option', votes: 318 },
        { id: 'opt-3', text: 'Driver-determined fatigue pause (stop the 14h clock)', votes: 524 }
      ],
      userVotedId: undefined,
      totalVotes: 984
    }
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
    reactions: {
      affirmative: 38,
      hammerDown: 14,
      airHorn: 29,
      scaleAlert: 2,
      safeTravels: 56,
    }
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
    reactions: {
      affirmative: 45,
      hammerDown: 5,
      airHorn: 12,
      scaleAlert: 88,
      safeTravels: 92,
    },
    audioNote: {
      title: 'CB 19 Voice Advisory: Rockslide Mile Marker 7',
      duration: '0:22',
      speakerName: 'Marcus Cruz (GearJammer)',
      handle: 'Smokey & Road Watch',
      transcript: 'All drivers Eastbound I-40, come off the throttle now. Left lane has boulders rolled across, DOT emergency crews staging at MM 6.'
    }
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
    title: 'I-80 Westbound Mansfield Scale',
    description: 'Scales are open and pulling everyone in. Dot is conducting random Level 2 inspections near the exit ramp. Clear logbooks before approaching!',
    locationName: 'I-80 Westbound MM 120 (Near Mansfield, OH)',
    corridor: 'I-80',
    upvoteCount: 42,
    upvotedUsers: ['user-123', 'user-2'],
    expiresAt: '2026-09-04T17:44:58-07:00',
    createdAt: '2026-09-04T11:30:00-07:00',
    statusValue: 'Scale Open / Inspection Active',
    weighStatus: 'open_pulling',
    verifiedByDriversCount: 14
  },
  {
    id: 'report-2',
    author: sampleProfiles[0], // DieselDuchess
    reportType: 'parking',
    title: 'Love\'s Travel Stop #420',
    description: 'Parking is completely packed out as of 1 PM. About 3 trucks are currently waiting in the turn lane. Recommend trying the Pilot down the road at MM 18.',
    locationName: 'I-75 South MM 42 (London, KY)',
    corridor: 'I-75',
    upvoteCount: 19,
    upvotedUsers: ['user-3'],
    expiresAt: '2026-09-04T16:00:00-07:00',
    createdAt: '2026-09-04T13:00:00-07:00',
    statusValue: 'Full (No Spots)',
    verifiedByDriversCount: 8
  },
  {
    id: 'report-3',
    author: sampleProfiles[2], // National_ATA
    reportType: 'weather',
    title: 'Flash Flood Watch & High Crosswinds',
    description: 'Heavy thunderstorm cells hitting the highway with visual range cut to less than 100 feet. Heavy crosswinds up to 45 mph. Hold tight or pull over at the nearest truck stop.',
    locationName: 'I-10 Eastbound (Near Gulfport, MS)',
    corridor: 'I-10',
    upvoteCount: 56,
    upvotedUsers: ['user-123', 'user-5', 'user-2'],
    expiresAt: '2026-09-04T20:00:00-07:00',
    createdAt: '2026-09-04T12:15:00-07:00',
    statusValue: 'Severe Thunderstorms / 45mph Winds',
    verifiedByDriversCount: 26
  },
  {
    id: 'report-4',
    author: sampleProfiles[1], // GearJammer_77
    reportType: 'fuel',
    title: 'Unbelievable Fuel Discount!',
    description: 'Diesel price is running at $3.25/gallon with the TA-Petro Association fuel card! Easiest entry and exit, lanes are completely clean. Grab it before prices cycle.',
    locationName: 'TA Travel Center (Dexter, MI)',
    corridor: 'I-94',
    upvoteCount: 27,
    upvotedUsers: ['user-123'],
    expiresAt: '2026-09-05T13:44:58-07:00',
    createdAt: '2026-09-04T09:45:00-07:00',
    statusValue: '$3.25 / gal Diesel',
    verifiedByDriversCount: 12
  },
  {
    id: 'report-5',
    author: sampleProfiles[0],
    reportType: 'scale',
    title: 'Evanston Port of Entry Scales (WB)',
    description: 'PrePass green light bypass running smooth today. Heavy volume but rolling scales are active.',
    locationName: 'I-80 Westbound MM 5 (Evanston, WY)',
    corridor: 'I-80',
    upvoteCount: 38,
    upvotedUsers: ['user-123'],
    expiresAt: '2026-09-04T22:00:00-07:00',
    createdAt: '2026-09-04T14:10:00-07:00',
    statusValue: 'PrePass Green / Bypass OK',
    weighStatus: 'prepass_green',
    verifiedByDriversCount: 19
  },
  {
    id: 'report-6',
    author: sampleProfiles[3],
    reportType: 'inspection',
    title: 'Crossville DOT Blitz Patrols',
    description: 'State troopers checking fire extinguisher charge pins, logbook cycles, and tire wear on eastbound shoulder.',
    locationName: 'I-40 Eastbound MM 315 (Crossville, TN)',
    corridor: 'I-40',
    upvoteCount: 51,
    upvotedUsers: ['user-2'],
    expiresAt: '2026-09-04T19:00:00-07:00',
    createdAt: '2026-09-04T13:30:00-07:00',
    statusValue: 'DOT Level 1 Blitz Active',
    weighStatus: 'level1_blitz',
    verifiedByDriversCount: 23
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
    corridor: 'I-80 West',
    dotInspected: true,
    warrantyIncluded: true,
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
    corridor: 'I-78 / I-80',
    dotInspected: true,
    mediaUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-02T11:00:00-07:00',
  },
  {
    id: 'list-3',
    seller: sampleProfiles[3], // BrakeCheckRick (using Callahan & Sons)
    title: '2016 Great Dane 53ft Utility Dry Van Trailer',
    description: 'Dry van trailer in fantastic road-ready condition. Air ride suspension, aluminum roof, premium wood floors with zero leakage, and swing doors. Inspections up to date. Ready to haul cargo today.',
    price: 14500.00,
    category: 'trailer',
    condition: 'used',
    location: 'Harrisburg, PA',
    corridor: 'I-81 / I-76',
    dotInspected: true,
    warrantyIncluded: false,
    mediaUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-01T09:30:00-07:00',
  },
  {
    id: 'list-4',
    seller: currentUserProfile,
    title: '2004 Peterbilt 379 EXHD (Pre-Emissions / Cat C15 6NZ)',
    description: 'Legendary 6NZ Caterpillar single turbo powerhouse, 550HP, 18-speed Eaton Fuller transmission, 3.55 rears, 280-inch wheelbase, American Class interior with dual high-back seats. Pre-emission, ELD-exempt legal.',
    price: 78500.00,
    category: 'truck',
    condition: 'used',
    location: 'Nashville, TN',
    corridor: 'I-40 Southeast',
    dotInspected: true,
    preDef: true,
    warrantyIncluded: true,
    mediaUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-08-30T10:00:00-07:00',
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

export const sampleMilestones: DriverMilestone[] = [
  {
    id: 'mile-1',
    userId: 'user-123', // Willie
    title: 'Passed DOT Level 1 Annual Roadside Inspection',
    category: 'inspection',
    date: '2026-08-28T14:30:00-07:00',
    description: 'Clean inspection with zero violations at Evanston WY Port of Entry. Full brake check, air system, and logbook audited.',
    verified: true,
  },
  {
    id: 'mile-2',
    userId: 'user-123',
    title: 'Awarded 1,000,000 Safe Driving Miles',
    category: 'safety',
    date: '2026-06-15T09:00:00-07:00',
    description: 'Recognized by the American Trucking Association for 1 million consecutive highway miles without a preventable accident.',
    verified: true,
  },
  {
    id: 'mile-3',
    userId: 'user-123',
    title: 'Added Tanker (N) & Hazmat (H) Endorsements',
    category: 'endorsement',
    date: '2025-11-10T11:00:00-07:00',
    description: 'Cleared TSA background security audit and passed state written examinations for combination hazardous cargo hauling.',
    verified: true,
  },
  {
    id: 'mile-4',
    userId: 'user-123',
    title: 'Commissioned 2022 Peterbilt 389 Chrome Custom',
    category: 'equipment',
    date: '2025-04-02T15:00:00-07:00',
    description: 'Upgraded to custom Cummins X15 565HP engine with 18-speed Eaton Fuller transmission and polished dual exhaust stacks.',
    verified: true,
  },
  {
    id: 'mile-5',
    userId: 'user-2', // Sarah "Diesel Duchess"
    title: 'Record Heavy Haul Transport Completed',
    category: 'career',
    date: '2026-08-19T17:00:00-07:00',
    description: 'Delivered 185-ton electrical substation transformer across three mountain passes on a 13-axle perimeter trailer.',
    verified: true,
  },
  {
    id: 'mile-6',
    userId: 'user-2',
    title: 'Commercial Driver Safety Leadership Award',
    category: 'safety',
    date: '2026-03-12T10:00:00-07:00',
    description: 'Recognized by Women In Trucking for 18 years of zero-incident heavy equipment securement.',
    verified: true,
  },
  {
    id: 'mile-7',
    userId: 'user-3', // Marcus Cruz
    title: 'Joined Prime Fresh Logistics Dedicated Fleet',
    category: 'career',
    date: '2026-05-01T08:00:00-07:00',
    description: 'Contracted dedicated temperature-controlled freight lanes covering California Central Valley to Texas corridors.',
    verified: true,
  },
  {
    id: 'mile-8',
    userId: 'user-5', // Rick Callahan
    title: 'Quarterly Million-Miler Hall of Honor',
    category: 'safety',
    date: '2026-07-04T12:00:00-07:00',
    description: 'Achieved 25 years on the road with flawless FMCSA compliance scorecard in the Northeast corridor.',
    verified: true,
  }
];

export const samplePeerEndorsements: PeerEndorsement[] = [
  {
    id: 'vouch-1',
    recipientId: 'user-123', // Willie Nelson
    endorser: sampleProfiles[0], // Sarah Vance
    skill: 'mountain_driving',
    title: 'Flawless Elk Mountain & Cabbage Hill Chain-Up',
    comment: 'Rolled alongside Willie during the January I-80 whiteout. He chained up in 8 minutes, stayed on the radio giving mile-by-mile traction callouts, and led three rookies safely to the summit.',
    date: '2026-08-28T14:30:00-07:00',
    upvotes: 19
  },
  {
    id: 'vouch-2',
    recipientId: 'user-123',
    endorser: sampleProfiles[3], // Rick Callahan
    skill: 'roadside_rescue',
    title: 'Brake Airline Repair at MM 188 Rest Area',
    comment: 'My emergency gladhand ruptured in freezing wind. Willie stopped without hesitation, supplied a spare brass coupling from his sidebox, and had me back rolling before DOT showed up.',
    date: '2026-08-15T09:15:00-07:00',
    upvotes: 24
  },
  {
    id: 'vouch-3',
    recipientId: 'user-2', // Sarah Vance
    endorser: currentUserProfile,
    skill: 'heavy_haul',
    title: 'Master-Class Wind Turbine Blade Transport',
    comment: 'Watched Sarah pivot a 185-ft blade through a tight two-lane roundabout in Wyoming with zero curb contact. Top 1% heavy haul driver in North America.',
    date: '2026-08-20T11:00:00-07:00',
    upvotes: 38
  },
  {
    id: 'vouch-4',
    recipientId: 'user-2',
    endorser: sampleProfiles[3], // Rick Callahan
    skill: 'winter_ice',
    title: 'Donner Pass Winter Navigation Champion',
    comment: 'Total composure on black ice. Sarah keeps a 500-foot buffer, never panics on engine retarder, and guides everyone on Channel 19.',
    date: '2026-07-22T16:45:00-07:00',
    upvotes: 31
  },
  {
    id: 'vouch-5',
    recipientId: 'user-3', // Marcus Cruz
    endorser: currentUserProfile,
    skill: 'dock_backing',
    title: 'Blind-Side 90 Degree Docking in Tight Hunt’s Point Terminal',
    comment: 'Put a 53-foot reefer into a spot that four day-cabs gave up on. Marcus is smooth on the clutch and mirrors.',
    date: '2026-08-04T13:20:00-07:00',
    upvotes: 14
  },
  {
    id: 'vouch-6',
    recipientId: 'user-5', // Rick Callahan
    endorser: currentUserProfile,
    skill: 'hazmat_safety',
    title: '25-Year Flawless Hazmat Placard & Tanker Safety',
    comment: 'Rick knows every DOT hazardous regulation by heart. Highest safety standard in the Northeast.',
    date: '2026-06-18T10:10:00-07:00',
    upvotes: 42
  }
];

export const sampleConvoys: ConvoyBeacon[] = [
  {
    id: 'convoy-1',
    leader: sampleProfiles[0], // Sarah "Diesel Duchess"
    title: 'I-80 Wyoming High-Wind & Blizzard Draft Pack',
    corridor: 'I-80',
    origin: 'Salt Lake City, UT',
    destination: 'Cheyenne, WY',
    currentMileMarker: 'MM 211 (Sinclair, WY)',
    direction: 'Eastbound',
    cruisingSpeedMph: 62,
    cbChannel: 19,
    members: [sampleProfiles[0], currentUserProfile, sampleProfiles[3]],
    maxMembers: 5,
    hazmatAllowed: false,
    oversizeAllowed: true,
    status: 'rolling',
    notes: 'Wind gusts clocked at 48mph near Elk Mountain. Keeping 200ft spacing, lead rig blocking crosswinds, tail gunner watching lane drift. Draft saving ~12% fuel.',
    fuelSavingsPercent: 12.5,
    createdAt: '2026-09-04T15:30:00-07:00'
  },
  {
    id: 'convoy-2',
    leader: sampleProfiles[1], // Marcus Cruz
    title: 'I-40 Lone Star Overnight Reefer Express',
    corridor: 'I-40',
    origin: 'Amarillo, TX',
    destination: 'Little Rock, AR',
    currentMileMarker: 'MM 78 (Groom, TX)',
    direction: 'Eastbound',
    cruisingSpeedMph: 68,
    cbChannel: 17,
    members: [sampleProfiles[1]],
    maxMembers: 4,
    hazmatAllowed: true,
    oversizeAllowed: false,
    status: 'forming',
    notes: 'Straight night run across Oklahoma City into Arkansas. Need 2-3 reliable rigs to pace tandem and share scale callouts. Departing Flying J in 25 mins.',
    fuelSavingsPercent: 10.2,
    createdAt: '2026-09-04T16:15:00-07:00'
  },
  {
    id: 'convoy-3',
    leader: sampleProfiles[3], // Rick Callahan
    title: 'I-10 Sunset Southern Flatbed Run',
    corridor: 'I-10',
    origin: 'Phoenix, AZ',
    destination: 'San Antonio, TX',
    currentMileMarker: 'MM 340 (Bowie, AZ)',
    direction: 'Eastbound',
    cruisingSpeedMph: 70,
    cbChannel: 21,
    members: [sampleProfiles[3]],
    maxMembers: 6,
    hazmatAllowed: true,
    oversizeAllowed: true,
    status: 'forming',
    notes: 'Rolling through New Mexico border checkpoints. Smooth asphalt, steady 70 mph cruise. Group discount organized at Pilot in Lordsburg.',
    fuelSavingsPercent: 11.0,
    createdAt: '2026-09-04T17:00:00-07:00'
  }
];

export const sampleConvoyMessages: Record<string, ConvoyChatMessage[]> = {
  'convoy-1': [
    {
      id: 'cmsg-1',
      convoyId: 'convoy-1',
      sender: sampleProfiles[0],
      message: '10-4 pack, Sarah on point at MM 211. Crosswind easing up slightly, maintaining 62 mph.',
      timestamp: '2026-09-04T17:15:00-07:00'
    },
    {
      id: 'cmsg-2',
      convoyId: 'convoy-1',
      sender: currentUserProfile,
      message: 'Copy that Duchess, Willie in slot 2. Fuel computer showing 8.4 MPG drafting behind your heavy spec. Sweet run.',
      timestamp: '2026-09-04T17:18:00-07:00'
    },
    {
      id: 'cmsg-3',
      convoyId: 'convoy-1',
      sender: sampleProfiles[3],
      message: 'Rick in the tailgunner slot. Heads up: WYDOT digital sign at MM 218 says chain law lifted for tractors, but watch for black ice on the bridge decks.',
      isAlert: true,
      timestamp: '2026-09-04T17:22:00-07:00'
    },
    {
      id: 'cmsg-4',
      convoyId: 'convoy-1',
      sender: sampleProfiles[0],
      message: 'Good eyes Rick! Everyone check your spacing when we hit the Medicine Bow River bridge. Next planned 15-min logbook stretch at Laramie TA.',
      timestamp: '2026-09-04T17:24:00-07:00'
    }
  ]
};

export const sampleCorridorRadars: CorridorDriverRadar[] = [
  {
    id: 'radar-1',
    driver: sampleProfiles[0], // Sarah Vance
    corridor: 'I-80',
    currentLocation: 'MM 211, Rawlins/Sinclair, WY',
    direction: 'EB',
    status: 'rolling',
    rigType: 'Kenworth W900 Heavy Haul',
    distanceMilesAway: 1.2,
    lastPing: '30s ago'
  },
  {
    id: 'radar-2',
    driver: sampleProfiles[3], // Rick Callahan
    corridor: 'I-80',
    currentLocation: 'MM 209, Sinclair, WY',
    direction: 'EB',
    status: 'rolling',
    rigType: 'Volvo VNL 860 Sleeper',
    distanceMilesAway: 2.8,
    lastPing: '1m ago'
  },
  {
    id: 'radar-3',
    driver: sampleProfiles[1], // Marcus Cruz
    corridor: 'I-40',
    currentLocation: 'MM 78, Groom, TX',
    direction: 'EB',
    status: 'truck_stop',
    rigType: 'Freightliner Cascadia Reefer',
    distanceMilesAway: 44.5,
    lastPing: '3m ago'
  },
  {
    id: 'radar-4',
    driver: {
      id: 'user-6',
      username: 'IronHorse_Jake',
      displayName: 'Jake "Iron Horse" Miller',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      bio: 'Owner-Operator hauling dry bulk tankers. 12 years OTR.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 12,
      currentRig: '2020 Peterbilt 579',
      homeBase: 'Omaha, NE',
      lanes: ['I-80 Central', 'I-29 North'],
      carrierName: 'Miller Bulk Transport',
      isVerified: true,
      followerCount: 680,
      followingCount: 310,
      postCount: 89
    },
    corridor: 'I-80',
    currentLocation: 'MM 245, Elk Mountain, WY',
    direction: 'EB',
    status: 'rolling',
    rigType: 'Peterbilt 579 Pneumatic Tanker',
    distanceMilesAway: 34.0,
    lastPing: '2m ago'
  },
  {
    id: 'radar-5',
    driver: {
      id: 'user-7',
      username: 'SteelCity_Lou',
      displayName: 'Lou "Steel City" Rossi',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      bio: 'Steel coils and machinery hauler. Steer clear of bad tie-downs.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 21,
      currentRig: '2021 Mack Anthem',
      homeBase: 'Pittsburgh, PA',
      lanes: ['I-80 Midwest', 'I-76 Turnpike'],
      carrierName: 'Allegheny Heavy Logistics',
      isVerified: true,
      followerCount: 1120,
      followingCount: 450,
      postCount: 210
    },
    corridor: 'I-80',
    currentLocation: 'MM 182, Creston Junction, WY',
    direction: 'EB',
    status: 'dock_waiting',
    rigType: 'Mack Anthem Flatbed',
    distanceMilesAway: 29.1,
    lastPing: '5m ago'
  }
];

export const sampleMemberLocations: MemberLocation[] = [
  {
    id: 'loc-1',
    driver: currentUserProfile, // Willie "Overdrive" Nelson
    lat: 36.1627,
    lng: -86.7816,
    city: 'Nashville',
    state: 'TN',
    corridor: 'I-40',
    mileMarker: 'MM 215',
    status: 'rolling',
    speedMph: 67,
    heading: 'EB',
    destinationCity: 'Knoxville, TN',
    rigType: '2022 Peterbilt 389 Custom',
    lastUpdated: '1m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Cruising steady with 42,000 lbs coils. Clear pavement.'
  },
  {
    id: 'loc-2',
    driver: sampleProfiles[0], // Sarah "Diesel Duchess" Vance
    lat: 41.7911,
    lng: -107.2387,
    city: 'Rawlins',
    state: 'WY',
    corridor: 'I-80',
    mileMarker: 'MM 211',
    status: 'rolling',
    speedMph: 62,
    heading: 'EB',
    destinationCity: 'Cheyenne, WY',
    rigType: '2023 Kenworth W900 Heavy Spec',
    lastUpdated: '30s ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Leading turbine blade convoy. Pilot cars active on Ch. 19.'
  },
  {
    id: 'loc-3',
    driver: sampleProfiles[1], // Marcus "GearJammer" Cruz
    lat: 35.2017,
    lng: -101.1068,
    city: 'Groom',
    state: 'TX',
    corridor: 'I-40',
    mileMarker: 'MM 112',
    status: 'parked',
    speedMph: 0,
    heading: 'EB',
    destinationCity: 'Oklahoma City, OK',
    rigType: '2021 Freightliner Cascadia Reefer',
    lastUpdated: '3m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Parked at Love\'s #405 for mandatory 30-min break & coffee.'
  },
  {
    id: 'loc-4',
    driver: sampleProfiles[3], // Rick "Brake Check" Callahan
    lat: 41.7712,
    lng: -107.1219,
    city: 'Sinclair',
    state: 'WY',
    corridor: 'I-80',
    mileMarker: 'MM 209',
    status: 'rolling',
    speedMph: 65,
    heading: 'EB',
    destinationCity: 'Omaha, NE',
    rigType: '2019 Volvo VNL 860 Sleeper',
    lastUpdated: '45s ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Drafting 1.5 miles behind Duchess convoy. Fuel economy 8.2 MPG.'
  },
  {
    id: 'loc-5',
    driver: {
      id: 'user-6',
      username: 'IronHorse_Jake',
      displayName: 'Jake "Iron Horse" Miller',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      bio: 'Owner-Operator hauling dry bulk tankers. 12 years OTR.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 12,
      currentRig: '2020 Peterbilt 579',
      homeBase: 'Omaha, NE',
      lanes: ['I-80 Central', 'I-29 North'],
      carrierName: 'Miller Bulk Transport',
      isVerified: true,
      followerCount: 680,
      followingCount: 310,
      postCount: 89
    },
    lat: 41.6847,
    lng: -106.4114,
    city: 'Elk Mountain',
    state: 'WY',
    corridor: 'I-80',
    mileMarker: 'MM 245',
    status: 'rolling',
    speedMph: 68,
    heading: 'EB',
    destinationCity: 'Lincoln, NE',
    rigType: 'Peterbilt 579 Pneumatic Tanker',
    lastUpdated: '2m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Clear of Elk Mountain wind zone. Rolling steady.'
  },
  {
    id: 'loc-6',
    driver: {
      id: 'user-7',
      username: 'SteelCity_Lou',
      displayName: 'Lou "Steel City" Rossi',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      bio: 'Steel coils and machinery hauler. Steer clear of bad tie-downs.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 21,
      currentRig: '2021 Mack Anthem',
      homeBase: 'Pittsburgh, PA',
      lanes: ['I-80 Midwest', 'I-76 Turnpike'],
      carrierName: 'Allegheny Heavy Logistics',
      isVerified: true,
      followerCount: 1120,
      followingCount: 450,
      postCount: 210
    },
    lat: 40.3524,
    lng: -79.7121,
    city: 'New Stanton',
    state: 'PA',
    corridor: 'I-76',
    mileMarker: 'MM 75',
    status: 'loading',
    speedMph: 0,
    heading: 'EB',
    destinationCity: 'Philadelphia, PA',
    rigType: '2021 Mack Anthem Flatbed',
    lastUpdated: '8m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Tarping 48k lbs cold-rolled coils at rail distribution depot.'
  },
  {
    id: 'loc-7',
    driver: {
      id: 'user-8',
      username: 'LoneStar_Elena',
      displayName: 'Elena "LoneStar" Morales',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      bio: 'Cross-border express reefer driver running Texas to California.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 9,
      currentRig: '2024 Kenworth T680 NextGen',
      homeBase: 'San Antonio, TX',
      lanes: ['I-10 West', 'I-35 Texas Corridor'],
      carrierName: 'Sol Aztec Freight',
      isVerified: true,
      followerCount: 1530,
      followingCount: 520,
      postCount: 112
    },
    lat: 30.0474,
    lng: -99.1403,
    city: 'Kerrville',
    state: 'TX',
    corridor: 'I-10',
    mileMarker: 'MM 508',
    status: 'rolling',
    speedMph: 72,
    heading: 'WB',
    destinationCity: 'El Paso, TX',
    rigType: '2024 Kenworth T680',
    lastUpdated: '1m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Heading into West Texas open stretch. Ch. 19 listening.'
  },
  {
    id: 'loc-8',
    driver: {
      id: 'user-9',
      username: 'MidwestHammer_Travis',
      displayName: 'Travis "Midwest Hammer" Boone',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
      bio: 'Grain hopper and dry van hauler. Iowa 80 regular.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 15,
      currentRig: '2018 Western Star 4900EX',
      homeBase: 'Davenport, IA',
      lanes: ['I-80 Midwest', 'I-35 Corridor'],
      carrierName: 'Hawkeye Freight Lines',
      isVerified: true,
      followerCount: 940,
      followingCount: 380,
      postCount: 76
    },
    lat: 41.6042,
    lng: -90.7813,
    city: 'Walcott',
    state: 'IA',
    corridor: 'I-80',
    mileMarker: 'MM 284',
    status: 'parked',
    speedMph: 0,
    heading: 'EB',
    destinationCity: 'Chicago, IL',
    rigType: '2018 Western Star 4900EX',
    lastUpdated: '12m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Fueled and parked at Iowa 80 Truckstop. Grabbing barbecue dinner.'
  },
  {
    id: 'loc-9',
    driver: {
      id: 'user-10',
      username: 'BigRig_Cody',
      displayName: 'Cody "BigRig" Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Running auto-haulers up and down the Eastern Seaboard.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 8,
      currentRig: '2022 Peterbilt 389 9-Car Hauler',
      homeBase: 'Charlotte, NC',
      lanes: ['I-95 North/South', 'I-85 Southeast'],
      carrierName: 'East Coast Car Transport',
      isVerified: true,
      followerCount: 710,
      followingCount: 290,
      postCount: 64
    },
    lat: 37.5407,
    lng: -77.4360,
    city: 'Richmond',
    state: 'VA',
    corridor: 'I-95',
    mileMarker: 'MM 76',
    status: 'rolling',
    speedMph: 64,
    heading: 'NB',
    destinationCity: 'Baltimore, MD',
    rigType: 'Peterbilt 389 9-Car Stinger',
    lastUpdated: '2m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Traffic heavy around DC bypass. Rolling 9 new SUVs.'
  },
  {
    id: 'loc-10',
    driver: {
      id: 'user-11',
      username: 'Mojave_Maria',
      displayName: 'Maria "Mojave" Santos',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      bio: 'Hazmat tanker driver crossing the Mojave and desert basins.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 11,
      currentRig: '2023 Freightliner Cascadia Tanker',
      homeBase: 'Bakersfield, CA',
      lanes: ['I-10 West', 'I-40 Southwest', 'I-15 Desert'],
      carrierName: 'Desert Eagle Fuels',
      isVerified: true,
      followerCount: 1820,
      followingCount: 460,
      postCount: 140
    },
    lat: 33.7206,
    lng: -116.2156,
    city: 'Indio',
    state: 'CA',
    corridor: 'I-10',
    mileMarker: 'MM 144',
    status: 'rolling',
    speedMph: 60,
    heading: 'EB',
    destinationCity: 'Phoenix, AZ',
    rigType: 'Freightliner Cascadia Fuel Tanker',
    lastUpdated: '1m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Loaded hazmat placards inspected. Clear skies over Chiriaco Summit.'
  },
  {
    id: 'loc-11',
    driver: {
      id: 'user-12',
      username: 'Redwood_Tanya',
      displayName: 'Tanya "Redwood" Larson',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      bio: 'Pacific Northwest timber and freight hauler. Running I-5 year-round.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 14,
      currentRig: '2020 Kenworth T880 Log Spec',
      homeBase: 'Eugene, OR',
      lanes: ['I-5 Corridor', 'US-101 Coast'],
      carrierName: 'Cascadia Log & Timber',
      isVerified: true,
      followerCount: 890,
      followingCount: 310,
      postCount: 92
    },
    lat: 40.5865,
    lng: -122.3917,
    city: 'Redding',
    state: 'CA',
    corridor: 'I-5',
    mileMarker: 'MM 678',
    status: 'rolling',
    speedMph: 59,
    heading: 'NB',
    destinationCity: 'Portland, OR',
    rigType: 'Kenworth T880 Spec',
    lastUpdated: '4m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Climbing toward Siskiyou pass. Temperature 48°F, roads dry.'
  },
  {
    id: 'loc-12',
    driver: {
      id: 'user-13',
      username: 'HighPlains_Hank',
      displayName: 'Hank "High Plains" Walker',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      bio: 'Cattle hauler and livestock logistics. Bull rack specialist.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 22,
      currentRig: '2021 Peterbilt 389 Bull Rack',
      homeBase: 'Dodge City, KS',
      lanes: ['I-70 Central', 'I-35 Great Plains'],
      carrierName: 'Walker Livestock Transport',
      isVerified: true,
      followerCount: 1650,
      followingCount: 520,
      postCount: 180
    },
    lat: 38.8403,
    lng: -97.6114,
    city: 'Salina',
    state: 'KS',
    corridor: 'I-70',
    mileMarker: 'MM 252',
    status: 'rolling',
    speedMph: 71,
    heading: 'EB',
    destinationCity: 'Kansas City, MO',
    rigType: 'Peterbilt 389 Livestock Pot',
    lastUpdated: '3m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Live cargo on board. Non-stop roll to KC stockyards.'
  },
  {
    id: 'loc-13',
    driver: {
      id: 'user-14',
      username: 'BlackIce_Darrell',
      displayName: 'Darrell "Black Ice" King',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
      bio: 'Northern Plains heavy equipment hauler. Surviving blizzard season.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 19,
      currentRig: '2022 Mack Titan',
      homeBase: 'Bismarck, ND',
      lanes: ['I-94 Northern Tier', 'I-90 Corridor'],
      carrierName: 'Northern Tier Transport',
      isVerified: true,
      followerCount: 810,
      followingCount: 270,
      postCount: 65
    },
    lat: 44.0805,
    lng: -103.2310,
    city: 'Rapid City',
    state: 'SD',
    corridor: 'I-90',
    mileMarker: 'MM 61',
    status: 'off_duty',
    speedMph: 0,
    heading: 'WB',
    destinationCity: 'Billings, MT',
    rigType: '2022 Mack Titan Lowboy',
    lastUpdated: '15m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'Off duty 10-hour sleeper berth reset. Rig checked and pre-tripped.'
  },
  {
    id: 'loc-14',
    driver: {
      id: 'user-15',
      username: 'DeltaKing_Sam',
      displayName: 'Sam "Delta King" Washington',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: 'Container and intermodal runner connecting Gulf ports to Midwest.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 10,
      currentRig: '2023 International LT625',
      homeBase: 'Memphis, TN',
      lanes: ['I-55 Mid-South', 'I-40 East-West'],
      carrierName: 'Delta Intermodal Logistics',
      isVerified: true,
      followerCount: 620,
      followingCount: 240,
      postCount: 48
    },
    lat: 32.2988,
    lng: -90.1848,
    city: 'Jackson',
    state: 'MS',
    corridor: 'I-55',
    mileMarker: 'MM 98',
    status: 'loading',
    speedMph: 0,
    heading: 'NB',
    destinationCity: 'Memphis, TN',
    rigType: '2023 International LT625 Container',
    lastUpdated: '20m ago',
    isSharingLocation: true,
    privacyLevel: 'exact',
    statusNote: 'At rail intermodal ramp hooking 53ft refrigerated container.'
  }
];

export const sampleOdometerPresets = [
  {
    name: 'Peterbilt 389 Gauge Cluster (Digital Trip Odometer)',
    truck: '2022 Peterbilt 389',
    unit: 'Unit #389-A',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    currentOdo: 482150,
    tripMiles: 3420,
    route: 'I-80 EB: Gary, IN to Salt Lake City, UT',
    description: 'Crisp green digital LED odometer display with dual trip counter. Validated against Cummins ECM.'
  },
  {
    name: 'Kenworth W900 SmartWheel Odometer & Trip Computer',
    truck: '2023 Kenworth W900',
    unit: 'Unit #W900-Heavy',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    currentOdo: 314890,
    tripMiles: 3840,
    route: 'I-80 WB: Cheyenne, WY to Reno, NV',
    description: 'High-contrast 15-inch PACCAR digital instrument cluster. Verified by fleet telematics gateway.'
  },
  {
    name: 'Freightliner Cascadia Digital Cockpit Dashboard',
    truck: '2021 Freightliner Cascadia',
    unit: 'Unit #CAS-77',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800',
    currentOdo: 592400,
    tripMiles: 3150,
    route: 'I-40 EB: Barstow, CA to Little Rock, AR',
    description: 'Detroit Connect virtual dashboard with certified odometer stamp and HOS daily drive log.'
  },
  {
    name: 'Volvo VNL 860 High-Res Graphic Instrument Display',
    truck: '2019 Volvo VNL 860',
    unit: 'Unit #VNL-860',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    currentOdo: 741220,
    tripMiles: 2980,
    route: 'I-76 to I-80: Harrisburg, PA to Des Moines, IA',
    description: 'Volvo D13 digital cluster with verified odometer readout and DPF status check.'
  }
];

export const sampleMileageProofs: MileageProof[] = [
  {
    id: 'proof-1',
    userId: 'user-2', // Sarah Vance
    driverName: 'Sarah "Diesel Duchess" Vance',
    driverHandle: 'DieselDuchess',
    driverAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    method: 'odometer_photo',
    proofImageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    odometerStart: 311050,
    odometerEnd: 314890,
    milesLogged: 3840,
    routeCorridor: 'I-80 Westbound (Cheyenne, WY → Reno, NV)',
    originCity: 'Cheyenne, WY',
    destinationCity: 'Reno, NV',
    dateLogged: '2026-09-04T15:30:00-07:00',
    verificationBadge: 'Verified Odometer OCR',
    verificationCode: 'ODO-W900-8842',
    status: 'verified',
    notes: 'Wind turbine component transport through Wyoming passes. Zero logbook violations.',
    rigUnit: 'Kenworth W900 #Heavy-01',
    upvotes: 48
  },
  {
    id: 'proof-2',
    userId: CURRENT_USER_ID, // Willie Nelson
    driverName: 'Willie "Overdrive" Nelson',
    driverHandle: 'OverdriveWill',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    method: 'odometer_photo',
    proofImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    odometerStart: 478730,
    odometerEnd: 482150,
    milesLogged: 3420,
    routeCorridor: 'I-40 Eastbound (Amarillo, TX → Nashville, TN)',
    originCity: 'Amarillo, TX',
    destinationCity: 'Nashville, TN',
    dateLogged: '2026-09-04T12:15:00-07:00',
    verificationBadge: 'Verified Odometer OCR',
    verificationCode: 'ODO-PETE-3891',
    status: 'verified',
    notes: 'Hauling steel structural beams. Clean CAT Scale slip attached.',
    rigUnit: '2022 Peterbilt 389 Custom',
    upvotes: 62
  },
  {
    id: 'proof-3',
    userId: 'user-8', // Elena Morales
    driverName: 'Elena "LoneStar" Morales',
    driverHandle: 'LoneStar_Elena',
    driverAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    method: 'eld_telematics',
    eldProvider: 'Motive (KeepTruckin)',
    odometerStart: 182400,
    odometerEnd: 186020,
    milesLogged: 3620,
    routeCorridor: 'I-10 Westbound (San Antonio, TX → Phoenix, AZ)',
    originCity: 'San Antonio, TX',
    destinationCity: 'Phoenix, AZ',
    dateLogged: '2026-09-03T18:45:00-07:00',
    verificationBadge: 'ELD Telematics Direct Sync',
    verificationCode: 'ELD-MOTIVE-9912',
    status: 'verified',
    notes: 'Direct API telemetry pull from Motive ELD gateway. Authenticated ECM odometer sync.',
    rigUnit: 'Kenworth T680 #Aztec-14',
    upvotes: 35
  },
  {
    id: 'proof-4',
    userId: 'user-13', // Hank Walker
    driverName: 'Hank "High Plains" Walker',
    driverHandle: 'HighPlains_Hank',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    method: 'bol_scale',
    proofImageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800',
    odometerStart: 620100,
    odometerEnd: 623450,
    milesLogged: 3350,
    routeCorridor: 'I-70 Eastbound (Denver, CO → Kansas City, MO)',
    originCity: 'Denver, CO',
    destinationCity: 'Kansas City, MO',
    dateLogged: '2026-09-03T09:20:00-07:00',
    verificationBadge: 'Certified CAT Scale Ticket',
    verificationCode: 'CAT-SCALE-4821',
    status: 'verified',
    notes: 'Certified CAT scale weigh slip with stamped hub odometer reading at Salina exit.',
    rigUnit: 'Peterbilt 389 Bull Rack #3',
    upvotes: 29
  },
  {
    id: 'proof-5',
    userId: 'user-3', // Marcus Cruz
    driverName: 'Marcus "GearJammer" Cruz',
    driverHandle: 'GearJammer_77',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    method: 'odometer_photo',
    proofImageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    odometerStart: 589250,
    odometerEnd: 592400,
    milesLogged: 3150,
    routeCorridor: 'I-40 Eastbound (Barstow, CA → Amarillo, TX)',
    originCity: 'Barstow, CA',
    destinationCity: 'Amarillo, TX',
    dateLogged: '2026-09-02T21:10:00-07:00',
    verificationBadge: 'Verified Odometer OCR',
    verificationCode: 'ODO-CASC-7714',
    status: 'verified',
    notes: 'Reefer load temperature verified +34°F continuous. Clean run through Arizona & New Mexico.',
    rigUnit: 'Freightliner Cascadia #77',
    upvotes: 41
  }
];

export const sampleMileageLeaderboard: MileageLeaderboardEntry[] = [
  {
    id: 'lead-1',
    driver: sampleProfiles[0], // Sarah "Diesel Duchess" Vance
    rank: 1,
    previousRank: 1,
    weeklyMiles: 3840,
    monthlyMiles: 14620,
    annualMiles: 154800,
    allTimeMiles: 2480000,
    driverCategory: 'heavy_haul',
    verifiedProofsCount: 42,
    latestProof: sampleMileageProofs[0],
    avgMilesPerDay: 548,
    streakDays: 19
  },
  {
    id: 'lead-2',
    driver: {
      id: 'user-8',
      username: 'LoneStar_Elena',
      displayName: 'Elena "LoneStar" Morales',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      bio: 'Cross-border express reefer driver running Texas to California.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 9,
      currentRig: '2024 Kenworth T680 NextGen',
      homeBase: 'San Antonio, TX',
      lanes: ['I-10 West', 'I-35 Texas Corridor'],
      carrierName: 'Sol Aztec Freight',
      isVerified: true,
      followerCount: 1530,
      followingCount: 520,
      postCount: 112
    },
    rank: 2,
    previousRank: 3,
    weeklyMiles: 3620,
    monthlyMiles: 13940,
    annualMiles: 148200,
    allTimeMiles: 1120000,
    driverCategory: 'solo',
    verifiedProofsCount: 38,
    latestProof: sampleMileageProofs[2],
    avgMilesPerDay: 517,
    streakDays: 24
  },
  {
    id: 'lead-3',
    driver: currentUserProfile, // Willie Nelson (Current User)
    rank: 3,
    previousRank: 4,
    weeklyMiles: 3420,
    monthlyMiles: 13250,
    annualMiles: 142100,
    allTimeMiles: 1890000,
    driverCategory: 'owner_operator',
    verifiedProofsCount: 36,
    latestProof: sampleMileageProofs[1],
    avgMilesPerDay: 488,
    streakDays: 14
  },
  {
    id: 'lead-4',
    driver: {
      id: 'user-13',
      username: 'HighPlains_Hank',
      displayName: 'Hank "High Plains" Walker',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      bio: 'Cattle hauler and livestock logistics. Bull rack specialist.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 22,
      currentRig: '2021 Peterbilt 389 Bull Rack',
      homeBase: 'Dodge City, KS',
      lanes: ['I-70 Central', 'I-35 Great Plains'],
      carrierName: 'Walker Livestock Transport',
      isVerified: true,
      followerCount: 1650,
      followingCount: 520,
      postCount: 180
    },
    rank: 4,
    previousRank: 2,
    weeklyMiles: 3350,
    monthlyMiles: 12890,
    annualMiles: 139400,
    allTimeMiles: 2950000,
    driverCategory: 'owner_operator',
    verifiedProofsCount: 31,
    latestProof: sampleMileageProofs[3],
    avgMilesPerDay: 478,
    streakDays: 11
  },
  {
    id: 'lead-5',
    driver: sampleProfiles[1], // Marcus Cruz
    rank: 5,
    previousRank: 5,
    weeklyMiles: 3150,
    monthlyMiles: 12400,
    annualMiles: 134200,
    allTimeMiles: 780000,
    driverCategory: 'solo',
    verifiedProofsCount: 27,
    latestProof: sampleMileageProofs[4],
    avgMilesPerDay: 450,
    streakDays: 8
  },
  {
    id: 'lead-6',
    driver: sampleProfiles[3], // Rick Callahan
    rank: 6,
    previousRank: 6,
    weeklyMiles: 2980,
    monthlyMiles: 11950,
    annualMiles: 128900,
    allTimeMiles: 3400000,
    driverCategory: 'solo',
    verifiedProofsCount: 25,
    avgMilesPerDay: 425,
    streakDays: 16
  },
  {
    id: 'lead-7',
    driver: {
      id: 'user-10',
      username: 'BigRig_Cody',
      displayName: 'Cody "BigRig" Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Running auto-haulers up and down the Eastern Seaboard.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 8,
      currentRig: '2022 Peterbilt 389 9-Car Hauler',
      homeBase: 'Charlotte, NC',
      lanes: ['I-95 North/South', 'I-85 Southeast'],
      carrierName: 'East Coast Car Transport',
      isVerified: true,
      followerCount: 710,
      followingCount: 290,
      postCount: 64
    },
    rank: 7,
    previousRank: 8,
    weeklyMiles: 2840,
    monthlyMiles: 11200,
    annualMiles: 121500,
    allTimeMiles: 920000,
    driverCategory: 'heavy_haul',
    verifiedProofsCount: 22,
    avgMilesPerDay: 405,
    streakDays: 9
  },
  {
    id: 'lead-8',
    driver: {
      id: 'user-11',
      username: 'Mojave_Maria',
      displayName: 'Maria "Mojave" Santos',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      bio: 'Hazmat tanker driver crossing the Mojave and desert basins.',
      role: 'driver',
      cdlClass: 'A',
      yearsExperience: 11,
      currentRig: '2023 Freightliner Cascadia Tanker',
      homeBase: 'Bakersfield, CA',
      lanes: ['I-10 West', 'I-40 Southwest', 'I-15 Desert'],
      carrierName: 'Desert Eagle Fuels',
      isVerified: true,
      followerCount: 1820,
      followingCount: 460,
      postCount: 140
    },
    rank: 8,
    previousRank: 7,
    weeklyMiles: 2710,
    monthlyMiles: 10850,
    annualMiles: 118400,
    allTimeMiles: 1350000,
    driverCategory: 'solo',
    verifiedProofsCount: 19,
    avgMilesPerDay: 387,
    streakDays: 12
  }
];

export const samplePitstopLocations: PitstopLocation[] = [
  {
    id: 'pit-1',
    name: "Iowa 80 - World's Largest Truckstop",
    category: 'truck_stop',
    brand: 'Iowa 80',
    address: '755 W Iowa 80 Rd',
    city: 'Walcott',
    state: 'IA',
    corridor: 'I-80',
    exitNumber: 'Exit 284',
    mileMarker: 'MM 284',
    lat: 41.601,
    lng: -90.771,
    phone: '(563) 284-6961',
    hours: 'Open 24/7 / 365',
    photoUrl: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=800',
    additionalPhotos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
    ],
    semiParkingSpots: 900,
    hasDefAtPump: true,
    hasShowers: true,
    showerCount: 24,
    hasCatScale: true,
    hasRepairShop: true,
    hasLaundry: true,
    hasWifi: true,
    hasFoodCourt: true,
    foodOptions: ['Iowa 80 Kitchen (Buffet)', "Wendy's", 'Caribou Coffee', 'Blimpie Subs', "Godfather's Pizza"],
    overallRating: 4.9,
    reviewCount: 342,
    addedBy: sampleProfiles[0],
    createdAt: '2026-08-10T10:00:00-07:00'
  },
  {
    id: 'pit-2',
    name: 'Little America Travel Center',
    category: 'truck_stop',
    brand: 'Little America',
    address: 'I-80 & WY-374',
    city: 'Little America',
    state: 'WY',
    corridor: 'I-80',
    exitNumber: 'Exit 68',
    mileMarker: 'MM 68',
    lat: 41.536,
    lng: -109.873,
    phone: '(307) 875-2400',
    hours: '24/7 Fuel & Grill',
    photoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800',
    additionalPhotos: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800'
    ],
    semiParkingSpots: 240,
    hasDefAtPump: true,
    hasShowers: true,
    showerCount: 55,
    hasCatScale: true,
    hasRepairShop: true,
    hasLaundry: true,
    hasWifi: true,
    hasFoodCourt: true,
    foodOptions: ['Little America Grill (50¢ Soft Serve)', 'Prime Rib Dining Room', 'Hot Deli & Bakery'],
    overallRating: 4.8,
    reviewCount: 218,
    addedBy: sampleProfiles[0],
    createdAt: '2026-08-12T14:30:00-07:00'
  },
  {
    id: 'pit-3',
    name: "Buc-ee's Mega Travel Center #45",
    category: 'fuel_station',
    brand: "Buc-ee's",
    address: '10070 I-10',
    city: 'Luling',
    state: 'TX',
    corridor: 'I-10',
    exitNumber: 'Exit 632',
    mileMarker: 'MM 632',
    lat: 29.682,
    lng: -97.648,
    phone: '(979) 238-6390',
    hours: 'Open 24/7',
    photoUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
    semiParkingSpots: 65,
    hasDefAtPump: true,
    hasShowers: false,
    hasCatScale: false,
    hasRepairShop: false,
    hasLaundry: false,
    hasWifi: true,
    hasFoodCourt: true,
    foodOptions: ['Fresh Carved Texas Brisket Bar', 'Beaver Nuggets Counter', 'Warm Roasted Pecans', 'Kolaches & Tacos'],
    overallRating: 4.7,
    reviewCount: 412,
    addedBy: currentUserProfile,
    createdAt: '2026-08-15T09:15:00-07:00'
  },
  {
    id: 'pit-4',
    name: "Smokey's Iron Skillet & Pit BBQ",
    category: 'food_dining',
    brand: 'Independent Diner',
    address: '9200 S I-35 Service Rd',
    city: 'Oklahoma City',
    state: 'OK',
    corridor: 'I-40',
    exitNumber: 'Exit 148',
    mileMarker: 'MM 148',
    lat: 35.378,
    lng: -97.492,
    phone: '(405) 631-7788',
    hours: '6:00 AM - Midnight (Late Night Window)',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    semiParkingSpots: 45,
    hasDefAtPump: false,
    hasShowers: false,
    hasCatScale: false,
    hasRepairShop: false,
    hasLaundry: false,
    hasWifi: true,
    hasFoodCourt: false,
    foodOptions: ['14-Hr Smoked Beef Brisket', 'Chicken Fried Steak', 'Fresh Biscuits & Sausage Gravy', 'Free Coffee for CDL'],
    overallRating: 4.9,
    reviewCount: 164,
    addedBy: sampleProfiles[1],
    createdAt: '2026-08-20T17:45:00-07:00'
  },
  {
    id: 'pit-5',
    name: 'Petro Laramie Speedco & Heavy Shop',
    category: 'repair_tire',
    brand: 'TA Petro',
    address: '2252 S 3rd St',
    city: 'Laramie',
    state: 'WY',
    corridor: 'I-80',
    exitNumber: 'Exit 311',
    mileMarker: 'MM 311',
    lat: 41.298,
    lng: -105.592,
    phone: '(307) 745-7388',
    hours: '24/7 Bay Service & Mobile Road Call',
    photoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
    semiParkingSpots: 180,
    hasDefAtPump: true,
    hasShowers: true,
    showerCount: 16,
    hasCatScale: true,
    hasRepairShop: true,
    hasLaundry: true,
    hasWifi: true,
    hasFoodCourt: true,
    foodOptions: ['Iron Skillet Restaurant', 'Sbarro Pizza', 'Dunkin Donuts'],
    overallRating: 4.6,
    reviewCount: 188,
    addedBy: sampleProfiles[3],
    createdAt: '2026-08-25T11:00:00-07:00'
  },
  {
    id: 'pit-6',
    name: 'Jubitz Truck Stop & Sleeper Staging',
    category: 'overnight_parking',
    brand: 'Jubitz',
    address: '10210 N Vancouver Way',
    city: 'Portland',
    state: 'OR',
    corridor: 'I-5',
    exitNumber: 'Exit 307',
    mileMarker: 'MM 307',
    lat: 45.602,
    lng: -122.684,
    phone: '(503) 289-9800',
    hours: 'Open 24 Hours / Lighted Perimeter Security',
    photoUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=800',
    semiParkingSpots: 320,
    hasDefAtPump: true,
    hasShowers: true,
    showerCount: 20,
    hasCatScale: true,
    hasRepairShop: true,
    hasLaundry: true,
    hasWifi: true,
    hasFoodCourt: true,
    foodOptions: ['Ponderosa Lounge & Grill', 'Cascade Grill', 'Moe Deli & Bakery'],
    overallRating: 4.8,
    reviewCount: 275,
    addedBy: sampleProfiles[0],
    createdAt: '2026-08-28T16:20:00-07:00'
  }
];

export const samplePitstopReviews: PitstopReview[] = [
  {
    id: 'rev-1',
    locationId: 'pit-1',
    author: sampleProfiles[0], // DieselDuchess
    rating: 5,
    cleanlinessRating: 5,
    parkingRating: 5,
    foodRating: 5,
    serviceRating: 5,
    reviewText: "There's a reason Iowa 80 is legendary. Even on a Friday night at 10 PM with hundreds of rigs rolling in, I found a clean paved pull-through spot in Row 14. Showers have zero wait time on the kiosk, water pressure feels like a 5-star hotel, and the buffet brisket was fresh out of the smoker. Also picked up chrome mirror brackets in the super truck showroom.",
    mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    mediaType: 'image',
    mediaCaption: 'Row 14 semi parking at Iowa 80 sunset - plenty of clearance!',
    amenitiesConfirmed: ['Showers Clean', '900+ Semi Spots', 'CAT Scale Open', 'High-Speed Wi-Fi'],
    visitedAt: '2026-09-02',
    createdAt: '2026-09-02T21:15:00-07:00',
    helpfulCount: 28,
    helpfulUsers: ['user-123', 'user-3', 'user-5']
  },
  {
    id: 'rev-2',
    locationId: 'pit-1',
    author: {
      id: 'user-7',
      username: 'HighwayVlogs_Brenda',
      displayName: 'Brenda "RoadCam" Kelly',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      bio: 'Full-time OTR creator documenting life behind the wheel.',
      role: 'creator',
      cdlClass: 'A',
      yearsExperience: 9,
      currentRig: '2023 Peterbilt 389 Extended Hood',
      homeBase: 'Phoenix, AZ',
      lanes: ['I-10 Transcon', 'I-40 West'],
      carrierName: 'RoadCam Media & Freight',
      isVerified: true,
      followerCount: 38400,
      followingCount: 620,
      postCount: 612
    },
    rating: 5,
    cleanlinessRating: 5,
    parkingRating: 4,
    foodRating: 5,
    serviceRating: 5,
    reviewText: "Filmed a full cab tour & truck stop walkthrough here yesterday for my YouTube channel! The driver dental clinic on-site is a lifesaver, and the laundry machines take Apple Pay so you don't need quarters. If you love Peterbilts and Kenworths, the vintage truck museum is free to walk through while your trailer is getting washed out.",
    mediaUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600',
    mediaType: 'video',
    mediaCaption: 'Video Walkthrough: Private Shower Suites & Iowa 80 Showroom',
    amenitiesConfirmed: ['Private Luxury Showers', 'Trucker Dentist', 'Laundry Apple Pay', 'Washout Bay'],
    visitedAt: '2026-09-03',
    createdAt: '2026-09-03T18:40:00-07:00',
    helpfulCount: 42,
    helpfulUsers: ['user-123', 'user-2', 'user-6']
  },
  {
    id: 'rev-3',
    locationId: 'pit-2',
    author: currentUserProfile,
    rating: 5,
    cleanlinessRating: 5,
    parkingRating: 5,
    foodRating: 5,
    serviceRating: 5,
    reviewText: "The 50 cent soft serve ice cream at Little America is the best morale booster on I-80 Wyoming. Snow storm was blowing hard outside Elk Mountain, but the parking lot was plowed and salted down to the bare asphalt. The marble tiled shower was massive with four fresh bath towels. 10/10 stop every time.",
    mediaUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=600',
    mediaType: 'image',
    mediaCaption: 'Warm prime rib dinner & ice cream break after surviving Elk Mountain crosswinds.',
    amenitiesConfirmed: ['50¢ Ice Cream', 'Marble Showers', 'Lot Plowed & Salted', 'CAT Scale'],
    visitedAt: '2026-09-01',
    createdAt: '2026-09-01T19:30:00-07:00',
    helpfulCount: 19,
    helpfulUsers: ['user-2', 'user-5']
  },
  {
    id: 'rev-4',
    locationId: 'pit-4',
    author: sampleProfiles[1], // GearJammer_77
    rating: 5,
    cleanlinessRating: 4,
    parkingRating: 4,
    foodRating: 5,
    serviceRating: 5,
    reviewText: "Do not sleep on this place if you're hauling down I-40 through OKC! 35 genuine tractor-trailer parking spots behind the smokehouse with easy ingress/egress. Show your CDL and you get unlimited hot coffee. The beef ribs literally fall off the bone. Way better than fast food heat lamps.",
    mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    mediaType: 'image',
    mediaCaption: 'Authentic hickory pit brisket with scratch made mac and cornbread.',
    amenitiesConfirmed: ['CDL Free Coffee', '35 Semi Spots', 'Scratch Kitchen', 'Quiet Parking'],
    visitedAt: '2026-09-04',
    createdAt: '2026-09-04T12:10:00-07:00',
    helpfulCount: 15,
    helpfulUsers: ['user-123']
  },
  {
    id: 'rev-5',
    locationId: 'pit-5',
    author: sampleProfiles[3], // BrakeCheckRick
    rating: 4,
    cleanlinessRating: 4,
    parkingRating: 5,
    foodRating: 4,
    serviceRating: 5,
    reviewText: "Blew a steer tire air seal at MM 290 on I-80. Called Petro Laramie road service and technician Gary was at my rig within 35 minutes with a fresh Michelin casing. Had me rolling before my 14-hour clock was compromised. Fast, honest billing without insane highway gouging fees.",
    mediaUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600',
    mediaType: 'image',
    mediaCaption: 'Speedco service bay swapping steer tire in under 40 minutes.',
    amenitiesConfirmed: ['24/7 Road Service', 'Michelin Certified', 'Fast Mechanics', 'Clean Lot'],
    visitedAt: '2026-08-30',
    createdAt: '2026-08-30T14:45:00-07:00',
    helpfulCount: 31,
    helpfulUsers: ['user-123', 'user-2', 'user-4']
  }
];

export const sampleDriverRoadStatuses: DriverRoadStatus[] = [
  {
    id: 'status-1',
    driver: sampleProfiles[0], // DieselDuchess
    statusText: 'Heavy haul turbine blade rolling I-80 EB. Scaling Evanston port of entry. Road dry & clear.',
    corridor: 'I-80 EB',
    mileMarker: 'MM 142 (WY)',
    emoji: '🚛',
    mediaUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    timestamp: '2026-09-04T18:10:00-07:00',
    expiresInHours: 6,
    waveCount: 42,
    highBeamCount: 28,
    hornCount: 19,
    cheersCount: 15,
    userInteractions: {}
  },
  {
    id: 'status-2',
    driver: sampleProfiles[1], // GearJammer_77
    statusText: 'Pre-pass green light at Banning scale! Reefer running 34°F steady with Salinas lettuce. Making Houston by Sunday.',
    corridor: 'I-10 EB',
    mileMarker: 'MM 101 (CA)',
    emoji: '🟢',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    timestamp: '2026-09-04T17:45:00-07:00',
    expiresInHours: 5,
    waveCount: 31,
    highBeamCount: 14,
    hornCount: 9,
    cheersCount: 22,
    userInteractions: {}
  },
  {
    id: 'status-3',
    driver: currentUserProfile, // Willie Overdrive
    statusText: 'Parked in spot #44 at Iowa 80 for 10-hour reset. Fresh pork tenderloin & hot coffee in the cab. Holler on Ch 19 if nearby!',
    corridor: 'I-80 WB',
    mileMarker: 'Exit 284 (Walcott, IA)',
    emoji: '☕',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    timestamp: '2026-09-04T16:20:00-07:00',
    expiresInHours: 8,
    waveCount: 56,
    highBeamCount: 39,
    hornCount: 27,
    cheersCount: 48,
    userInteractions: {}
  },
  {
    id: 'status-4',
    driver: sampleProfiles[3], // BrakeCheckRick
    statusText: 'Chaining up required at Donner Summit west-bound. Caltrans active MM 180. Slow down on the bridge deck.',
    corridor: 'I-80 WB',
    mileMarker: 'MM 174 (Donner Summit, CA)',
    emoji: '❄️',
    mediaUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    timestamp: '2026-09-04T17:15:00-07:00',
    expiresInHours: 3,
    waveCount: 88,
    highBeamCount: 64,
    hornCount: 45,
    cheersCount: 37,
    userInteractions: {}
  },
  {
    id: 'status-5',
    driver: sampleProfiles[4], // MountainMack
    statusText: 'Eisenhower Tunnel westbound open with no delays. Engine brake engaged at 45 MPH down the grade.',
    corridor: 'I-70 WB',
    mileMarker: 'MM 215 (CO)',
    emoji: '🏔️',
    mediaUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    timestamp: '2026-09-04T15:30:00-07:00',
    expiresInHours: 4,
    waveCount: 29,
    highBeamCount: 18,
    hornCount: 12,
    cheersCount: 16,
    userInteractions: {}
  }
];

export const sampleGroupDiscussions: GroupDiscussion[] = [
  {
    id: 'disc-1',
    groupId: 'grp-1', // OOIDA Independent Drivers
    author: sampleProfiles[0],
    title: 'FMCSA Broker Transparency Rule Petition & Broker Margin Audits',
    content: 'We are organizing signatures for the 49 CFR § 371.3 compliance enforcement petition to mandate real-time rate confirmation transparency on contracted dry van and reefer loads. If you have had brokers refuse disclosure within 48 hours, drop your comments and state corridor below.',
    category: 'safety_regulations',
    createdAt: '2026-09-03T14:20:00-07:00',
    upvotes: 48,
    upvotedUsers: ['user-123', 'user-2', 'user-3'],
    replyCount: 14,
    replies: [
      {
        id: 'reply-1',
        author: currentUserProfile,
        text: '10-4 Sarah! Signed yesterday. We need full automated rate disclosure before wheels roll.',
        createdAt: '2026-09-03T15:10:00-07:00'
      },
      {
        id: 'reply-2',
        author: sampleProfiles[1],
        text: 'Agreed 100%. Seeing 25-30% margins taken on California produce runs without justification.',
        createdAt: '2026-09-03T16:05:00-07:00'
      }
    ]
  },
  {
    id: 'disc-2',
    groupId: 'grp-1',
    author: sampleProfiles[3],
    title: 'Recommended Torque Specs & Tire Pressure for Winter I-80 Crossings',
    content: 'Running Michelin X-Line steers at 110 PSI and drive singles at 95 PSI cold in sub-zero temps. Always double-check lug torque after the first 50 miles after any tire swap. What tire pressure monitoring systems (TPMS) are you running in your cabs?',
    category: 'rig_builds',
    createdAt: '2026-09-02T11:00:00-07:00',
    upvotes: 32,
    upvotedUsers: ['user-123'],
    replyCount: 8,
    replies: [
      {
        id: 'reply-3',
        author: currentUserProfile,
        text: 'TireMinder Bluetooth display mounted on the dash. Catches slow valve stem leaks before the rubber heats up.',
        createdAt: '2026-09-02T12:30:00-07:00'
      }
    ]
  },
  {
    id: 'disc-3',
    groupId: 'grp-2', // Mid-America Haulers
    author: currentUserProfile,
    title: 'Iowa 80 Jamboree Meetup & Group Convoy Formation',
    content: 'Setting up a 12-rig convoy starting out of Lincoln, NE eastbound to Walcott, IA for the summer trucker convention. Will be broadcasting on CB Channel 19 with rolling safety speed of 68 MPH. RSVP in the events tab!',
    category: 'road_meetups',
    createdAt: '2026-09-01T09:15:00-07:00',
    upvotes: 55,
    upvotedUsers: ['user-2', 'user-3', 'user-5'],
    replyCount: 19,
    replies: [
      {
        id: 'reply-4',
        author: sampleProfiles[0],
        text: 'Count me in with the Kenworth! I will ride tail-gunner with the oversized caution markers.',
        createdAt: '2026-09-01T10:45:00-07:00'
      }
    ]
  }
];

export const sampleGroupEvents: GroupEvent[] = [
  {
    id: 'event-1',
    groupId: 'grp-1',
    title: 'National Highway Driver Safety & Chain-Up Clinic',
    description: 'Hands-on winter weather preparation, triple-rail chain throwing masterclass, and brake stroke adjustment inspection seminar hosted by senior master drivers.',
    date: '2026-09-20T10:00:00',
    originLocation: 'Cheyenne, WY (Little America)',
    destinationLocation: 'Laramie, WY (Petro)',
    cbChannel: 19,
    coordinator: sampleProfiles[0], // DieselDuchess
    attendeesCount: 38,
    attendeeProfiles: [sampleProfiles[0], currentUserProfile, sampleProfiles[1], sampleProfiles[3]],
    isAttending: true
  },
  {
    id: 'event-2',
    groupId: 'grp-2',
    title: 'Midwest Corridor Harvest Reefer Run',
    description: 'Coordinated drafting convoy moving seasonal grain and produce from Omaha, NE to Chicago logistics hubs. Target speed 65 MPH with scheduled fuel stops.',
    date: '2026-09-25T06:00:00',
    originLocation: 'Omaha, NE (Sapp Bros)',
    destinationLocation: 'Joliet, IL (Intermodal Terminal)',
    cbChannel: 21,
    coordinator: currentUserProfile,
    attendeesCount: 16,
    attendeeProfiles: [currentUserProfile, sampleProfiles[1], sampleProfiles[4]],
    isAttending: true
  },
  {
    id: 'event-3',
    groupId: 'grp-3',
    title: 'Rocky Mountain Heavy Haul & Oversize Escort Meet',
    description: 'Pre-trip route coordination meeting for oversized loads traversing Vail Pass and Eisenhower Tunnel before winter closure restrictions.',
    date: '2026-10-05T08:30:00',
    originLocation: 'Grand Junction, CO',
    destinationLocation: 'Denver, CO',
    cbChannel: 17,
    coordinator: sampleProfiles[4],
    attendeesCount: 24,
    attendeeProfiles: [sampleProfiles[4], sampleProfiles[0]],
    isAttending: false
  }
];



