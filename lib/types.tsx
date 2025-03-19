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

  rhythm_pattern?: number[];
  pitch_histogram?: number[];
  note_density_over_time?: number[];
  most_common_pitches?: number[];
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

export interface ElementDetails {
  name: string;
  type: string;
  file_type: string;
  duration: number;
  pitch_histogram?: number[];
  most_common_pitches?: number[];
  note_density_over_time?: number[];
  rhythm_pattern?: number[];
  waveform_url?: string;
  spectrogram_url?: string;
}

export interface ElementAnalysis {
  [key: string]: ElementDetails;
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