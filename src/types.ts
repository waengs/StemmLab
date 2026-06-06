/** Signed-in individual (Firebase Auth + profile). */
export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  teamDiscriminator: string | null;
}

export interface Team {
  discriminator: string;
  name: string;
  gradeLevel: string;
  /** Password teammates use to join this team (not the user's login password). */
  joinPassword: string;
  createdByUid: string;
}

/** Team row for browse/join (no join password). */
export interface TeamListing {
  discriminator: string;
  name: string;
  gradeLevel: string;
}

export interface TeamMemberSummary {
  uid: string;
  displayName: string;
}

export interface ActivityResult {
  id: string;
  activityId: string;
  activityName: string;
  teamDiscriminator: string;
  submittedByUid?: string;
  timestamp: number;
  data: Record<string, any>;
  score?: number;
}

export interface SensorLog {
  id: string;
  sensorType: string;
  timestamp: number;
  data: any;
  teamDiscriminator: string;
  recordedByUid?: string;
}

export type ForumAttachment = {
  url: string;
  type: 'image' | 'video' | 'raw';
  name: string;
};

export type ForumGradeBand = 'primary' | 'high_school';

export interface ForumPost {
  id: string;
  topicTitle: string;
  authorUid: string;
  authorName: string;
  teamDiscriminator: string;
  teamName: string;
  /** Which grade cohort can see this post (upper primary vs lower high school). */
  gradeBand?: ForumGradeBand;
  /** Forum category key, usually an activity id. */
  categoryId?: string;
  categoryLabel?: string;
  content: string;
  timestamp: number;
  replies: ForumReply[];
  /** UIDs of users who have upvoted this post. */
  upvotes: string[];
  /** Optional image attachment URL. */
  attachmentUrl?: string;
  /** Multiple files array for V9+ */
  attachments?: ForumAttachment[];
}

export type AppNotificationType = 'forum_reply' | 'forum_comment';

export interface AppNotification {
  id: string;
  recipientUid: string;
  type: AppNotificationType;
  postId: string;
  postTitle: string;
  fromUid: string;
  fromName: string;
  preview: string;
  timestamp: number;
  read: boolean;
}

export interface ForumReply {
  id: string;
  /** Reply nesting parent id (null/undefined = direct reply to post). */
  parentReplyId?: string;
  authorUid: string;
  authorName: string;
  teamDiscriminator: string;
  teamName: string;
  content: string;
  timestamp: number;
  /** UIDs of users who have upvoted this reply. */
  upvotes?: string[];
  /** Optional image attachment URL. */
  attachmentUrl?: string;
  /** Multiple files array for V9+ */
  attachments?: ForumAttachment[];
}

export const ACTIVITIES = {
  'parachute-drop': {
    id: 'parachute-drop',
    name: 'Parachute Drop Challenge',
    category: 'Engineering',
    description: 'Design parachutes, record slow-motion drops, and compare fall times and forces',
    sensors: ['slow-mo'],
  },
  'sound-pollution': {
    id: 'sound-pollution',
    name: 'Sound Pollution Hunter',
    category: 'Engineering',
    description: 'Map loud and quiet zones by measuring sound levels around your school',
    sensors: ['sound-meter', 'location'],
  },
  'hand-fan': {
    id: 'hand-fan',
    name: 'Hand Fan Challenge',
    category: 'Engineering',
    description: 'Compare fan materials and designs to see how much air force bends a paper target',
    sensors: ['slow-mo'],
  },
  'earthquake': {
    id: 'earthquake',
    name: 'Earthquake-Resistant Structure',
    category: 'Engineering',
    description: 'Fold paper anti-vibration layers and test how much the phone moves in a simulated quake',
    sensors: ['phone-vibration'],
  },
  'human-performance': {
    id: 'human-performance',
    name: 'Human Performance Lab',
    category: 'Health/Medical',
    description: 'Test how smoothly and quickly you can move while the phone tracks vibration',
    sensors: ['vibration'],
  },
  'reaction-board': {
    id: 'reaction-board',
    name: 'Reaction Board Challenge',
    category: 'Health/Medical',
    description: 'Test reaction time and tracing accuracy with both dominant and non-dominant hands',
    sensors: ['reaction-timer'],
  },
  'breathing-pace': {
    id: 'breathing-pace',
    name: 'Breathing Pace Trainer',
    category: 'Health/Medical',
    description: 'Count breaths per minute at rest and after jogging and star jumps',
    sensors: ['vibration'],
  },
};

export const SENSORS = {
  'slow-mo': {
    id: 'slow-mo',
    name: 'Slow-Mo Video',
    icon: 'videocam',
    description: 'Record high-speed video for detailed analysis',
  },
  'sound-meter': {
    id: 'sound-meter',
    name: 'Live Sound Meter',
    icon: 'volume-high',
    description: 'Real-time decibel measurements',
  },
  'location': {
    id: 'location',
    name: 'Location Tag',
    icon: 'location',
    description: 'GPS location tracking',
  },
  'vibration': {
    id: 'vibration',
    name: 'Vibration Sensor',
    icon: 'pulse',
    description: 'Detect and measure vibrations',
  },
  'reaction-timer': {
    id: 'reaction-timer',
    name: 'Reaction Test',
    icon: 'flash',
    description: 'Measure reaction time to a visual cue',
  },
  battery: {
    id: 'battery',
    name: 'Battery',
    icon: 'battery-half',
    description: 'Device battery level and charging status',
  },
};
