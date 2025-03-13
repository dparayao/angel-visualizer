// lib/types.ts
export interface Timestamp {
  start: number;
  end: number;
  song?: string;
}

export interface Fingerprint {
  bpm?: number;
  key?: string;
  energy?: number;
  complexity?: number;
  density?: number;
  [key: string]: number | string | undefined;
}

export interface Pattern {
  name: string;
  type: string;
  fingerprint: Fingerprint;
  timestamps: Timestamp[];
  details?: Record<string, unknown>;
}

// lib/types.ts
export interface Song {
  title: string;
  start: number;
  end: number;
}

export interface MixAnnotations {
  youtubeVideoId: string;
  mixTitle?: string; // Properly marked as optional
  mixDescription?: string; // Properly marked as optional
  patterns: Pattern[];
  songs: Song[]; // Add this required property
}

export interface ElementAnalysis {
  [key: string]: {
    fingerprint?: Fingerprint;
    details?: Record<string, unknown>;
  }
}

// YouTube API related types
export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

export interface YouTubePlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  // Add other YouTube player methods as needed
}