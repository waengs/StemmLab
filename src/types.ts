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
}

export const ACTIVITIES = {
  'parachute-drop': {
    id: 'parachute-drop',
    name: 'Parachute Drop Challenge',
    category: 'Engineering',
    description: 'Design and test a parachute to minimize impact force',
    sensors: ['slow-mo', 'g-force'],
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
    sensors: ['movement-detector'],
  },
  'earthquake': {
    id: 'earthquake',
    name: 'Earthquake-Resistant Structure',
    category: 'Engineering',
    description: 'Design a structure that withstands simulated earthquakes',
    sensors: ['vibration', 'slow-mo'],
  },
  'human-performance': {
    id: 'human-performance',
    name: 'Human Performance Lab',
    category: 'Health/Medical',
    description: 'Test stretch speed and gracefulness',
    sensors: ['slow-mo', 'movement-detector'],
  },
  'reaction-board': {
    id: 'reaction-board',
    name: 'Reaction Board Challenge',
    category: 'Health/Medical',
    description: 'Measure reaction time and accuracy',
    sensors: ['movement-detector'],
  },
  'breathing-pace': {
    id: 'breathing-pace',
    name: 'Breathing Pace Trainer',
    category: 'Health/Medical',
    description: 'Monitor and improve breathing patterns',
    sensors: ['movement-detector'],
  },
};

export const SENSORS = {
  'slow-mo': {
    id: 'slow-mo',
    name: 'Slow-Mo Video',
    icon: 'videocam',
    description: 'Record high-speed video for detailed analysis',
  },
  'g-force': {
    id: 'g-force',
    name: 'G-Force Meter',
    icon: 'speedometer',
    description: 'Measure acceleration forces',
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
  'movement-detector': {
    id: 'movement-detector',
    name: 'Movement Detector',
    icon: 'walk',
    description: 'Track motion and speed',
  },
};
