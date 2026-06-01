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

export interface ForumPost {
  id: string;
  topicTitle: string;
  authorUid: string;
  authorName: string;
  teamDiscriminator: string;
  teamName: string;
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
    description: 'Design and test a parachute to minimize impact force',
    sensors: ['slow-mo'],
  },
  'sound-pollution': {
    id: 'sound-pollution',
    name: 'Sound Pollution Hunter',
    category: 'Engineering',
    description: 'Measure and map sound levels in different environments',
    sensors: ['sound-meter', 'location'],
  },
  'hand-fan': {
    id: 'hand-fan',
    name: 'Hand Fan Challenge',
    category: 'Engineering',
    description: 'Build an efficient hand-powered fan',
    sensors: ['slow-mo'],
  },
  'earthquake': {
    id: 'earthquake',
    name: 'Earthquake-Resistant Structure',
    category: 'Engineering',
    description: 'Design a structure that withstands simulated earthquakes',
    sensors: ['phone-vibration'],
  },
  'human-performance': {
    id: 'human-performance',
    name: 'Human Performance Lab',
    category: 'Health/Medical',
    description: 'Test stretch speed and gracefulness',
    sensors: ['vibration'],
  },
  'reaction-board': {
    id: 'reaction-board',
    name: 'Reaction Board Challenge',
    category: 'Health/Medical',
    description: 'Measure reaction time and accuracy',
    sensors: ['reaction-timer'],
  },
  'breathing-pace': {
    id: 'breathing-pace',
    name: 'Breathing Pace Trainer',
    category: 'Health/Medical',
    description: 'Analyse breathing patterns at rest and after exercise',
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
};
