export interface Team {
  name: string;
  password: string;
  members: string[];
  gradeLevel: string;
  discriminator: string;
}

export interface ActivityResult {
  id: string;
  activityId: string;
  activityName: string;
  teamDiscriminator: string;
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
}

export interface ForumPost {
  id: string;
  teamName: string;
  teamDiscriminator: string;
  content: string;
  timestamp: number;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  teamName: string;
  teamDiscriminator: string;
  content: string;
  timestamp: number;
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
    icon: 'Video',
    description: 'Record high-speed video for detailed analysis',
  },
  'g-force': {
    id: 'g-force',
    name: 'G-Force Meter',
    icon: 'Gauge',
    description: 'Measure acceleration forces',
  },
  'sound-meter': {
    id: 'sound-meter',
    name: 'Live Sound Meter',
    icon: 'Volume2',
    description: 'Real-time decibel measurements',
  },
  'location': {
    id: 'location',
    name: 'Location Tag',
    icon: 'MapPin',
    description: 'GPS location tracking',
  },
  'vibration': {
    id: 'vibration',
    name: 'Vibration Sensor',
    icon: 'Activity',
    description: 'Detect and measure vibrations',
  },
  'movement-detector': {
    id: 'movement-detector',
    name: 'Movement Detector',
    icon: 'Move',
    description: 'Track motion and speed',
  },
};
