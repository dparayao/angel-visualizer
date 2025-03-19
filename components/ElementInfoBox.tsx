import React, { memo, useState } from 'react';
import { Pattern } from '../lib/types';
import ElementVisualizer from './ElementVisualizer';

interface ElementInfoBoxProps {
  element: Pattern | null;
  isPlaying: boolean;
  type: 'jungle' | 'dnb';
}

const ELEMENT_DATA = {
  "amen_break": {
    fingerprint: {
      bpm: 165,
      complexity: 8.5,
      density: 7.2,
      energy: 9.0,
      key: "C minor",
    },
    details: {
      description: "The most sampled drum break in history, from the song 'Amen, Brother'. It exploded in popularity in the early 1990s UK jungle scene when producers would pitch it up to 150-170 BPM and manipulate it.\nRunning this audio through Python's Librosa, we get:\n[0.0, 0.560774724133331, 0.10609165208763613, 0.33868341512464034, 1.0, 0.036266776425020165, 0.09692755364371677, 0.5186703449784449, 0.12747916231391482, 0.062482527048594416, 0.08574585066183836, 0.4204578841718032, 0.6962578729712173, 0.1791695114627513, 0.0, 0.0]\nMeaning,it has strong beats at positions 4 (1.0), 12 (0.70), and 1 (0.56), creating that iconic uneven pattern. it has an asymmetric distribution of intensity with multiple peaks and valleys, creating that distinctive 'rolling' feel. The pattern shows strong hits followed by ghost notes, giving it that characteristic swing.\nInternet subgenres have further manipulated breakcore by speeding it up to even higher BPMs and breaking it into small fragments to create a 'glitchy' sound."
    },
    filename: "amen_break.mp3"
  },
  "foghorn_car_bass": {
    fingerprint: {
      bpm: 175,
      complexity: 6.0,
      density: 9.2,
      energy: 9.5,
      key: "F minor",
    },
    details: {
      description: "Deep, rumbling bass created from a foghorn. \nRunning this sample through Python's MIDI, we can see that there is sparse 3-6 notes per slice, concentrated on pitches 4 (74.5%) and 9 (25.5%) \nThis demonstrates a Jungle bass sound, with the limited pitch range of two main notes, and a DnB bass characteristic, an irregular rhythm pattern."
    },
    filename: "foghorn_car_bass.mp3"
  },
  "175_bpm_break": {
    fingerprint: {
      bpm: 175,
      complexity: 7.5,
      density: 8.0,
      energy: 8.5,
      key: "Various",
    },
    details: {
      description: "An example of a 175 BPM drum break - typically used in DnB rather than Jungle."
    },
    filename: "175bpm_break.mp3"
  },
  "reese_bass": {
    fingerprint: {
      bpm: "Variable",
      complexity: 7.0,
      density: 9.0,
      energy: 8.8,
      key: "D minor",
    },
    details: {
      description: "A growling, distorted bass sound with rich harmonics."
    },
    filename: "reese_bass.mp3"
  },
  "ambient_sounds_sampled_music": {
    fingerprint: {
      bpm: "Variable",
      complexity: 6.5,
      density: 5.0,
      energy: 4.0,
      key: "Various",
    },
    details: {
      description: "Meant to evoke a melancholic emotion, these elements can either be created using music software or are modified samples from other songs, films, etc."
    },
    filename: "ambient_sample.mp3"
  },
  "think_break": {
    fingerprint: {
      bpm: 160,
      complexity: 7.0,
      density: 6.5,
      energy: 7.5,
      key: "N/A",
    },
    details: {
      description: "A popular drum break from the 1972 song 'Think'."
    },
    filename: "think_break_174bpm.mp3"
  },
  "reggae_bass": {
    fingerprint: {
      bpm: 90,
      complexity: 6.0,
      density: 8.5,
      energy: 7.5,
      key: "F minor",
    },
    details: {
      description: "Deep, rhythmic bassline inspired by reggae and dub music."
    },
    filename: "reggae_bass_90bpm.mp3"
  },
  "160_bpm_break": {
    fingerprint: {
      bpm: 160,
      complexity: 7.0,
      density: 7.5,
      energy: 8.0,
      key: "N/A",
    },
    details: {
      description: "An example of a 160 BPM breakbeat, a staple in jungle production."
    },
    filename: "160bpm_break.mp3"
  }
};

// Define the type for genre information
interface GenreInfo {
  bpm: string;
  characteristics: string;
  description: string;
  learnMoreLink?: string;
  learnMoreText?: string;
}

// Default genre information
const GENRE_INFO: Record<'jungle' | 'dnb', GenreInfo> = {
  jungle: {
    bpm: "150-170 BPM",
    characteristics: "Reggae inspired, complicated breaks",
    description: "Jungle is a music genre birthed from underground UK raves - its mothers? The young working-class and immigrant musicians. The genre's 150-170 bpm songs are heavily reggae inspired and features complicated breaks made from sampled music like the 1969 track \"Amen, Brother\" by the Winstons.",
    learnMoreLink: "https://www.youtube.com/watch?v=vDZHEAwDAVo&ab_channel=ResidentAdvisor",
    learnMoreText: "What Makes Something Jungle?"
  },
  dnb: {
    bpm: "170-180 BPM",
    characteristics: "Simpler breaks, bass heavy",
    description: "DnB evolved out of jungle in the mid-late 90s. Thus, we can see the same elements as jungle, but a faster bpm (170-180), simpler breaks (typically 2-step) and lots of bass. The same bass that was used in Jungle music, like reggae and reese, is also used in addition to new bass sounds like the fog horn car bass."
  }
};

// Audio player component
const AudioPlayer = ({ filename }: { filename: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Reference files from the public directory
  const audioPath = `/samples/${filename}`;
  
  const handlePlayPause = () => {
    const audioElement = document.getElementById(`audio-${filename}`) as HTMLAudioElement;
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        // Pause all other audio elements first
        document.querySelectorAll('audio').forEach(audio => {
          if (audio.id !== `audio-${filename}`) {
            audio.pause();
          }
        });
        
        // Play and handle potential errors
        audioElement.play().catch(error => {
          console.error("Audio playback failed:", error);
          alert("Couldn't play audio. Check browser console for details.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="audio-player mt-2 mb-2">
      <audio 
        id={`audio-${filename}`}
        src={audioPath} 
        onEnded={() => setIsPlaying(false)}
      />
      <button 
        onClick={handlePlayPause}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded flex items-center text-sm"
      >
        <span className="mr-1">{isPlaying ? '■' : '▶'}</span>
        {isPlaying ? 'Stop' : 'Play Sample'}
      </button>
    </div>
  );
};

const ElementInfoBox: React.FC<ElementInfoBoxProps> = memo(({ element, isPlaying, type }) => {
  // If no element, show default genre information
  if (!element) {
    const genreInfo = GENRE_INFO[type];
    
    return (
      <div className="w-80 mr-6 ml-6 bg-gray-100 text-black rounded-md overflow-hidden">
        <div className="p-3 max-h-60 overflow-y-auto">
          <h3 className="text-3xl text-blue-400" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
            {type.toUpperCase()}
          </h3>
          <p className="text-xl font-bold mt-2" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>{genreInfo.bpm}</p>
          <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>{genreInfo.characteristics}</p>
          
          <div className="mt-2 text-xl border-t border-gray-300 pt-2" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
            <p>{genreInfo.description}</p>
            
            {genreInfo.learnMoreLink ? (
              <p className="mt-2">
                <a 
                  href={genreInfo.learnMoreLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {genreInfo.learnMoreText || "Learn more"}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Find matching element in database
  let elementInfo = null;
  let filename = "";
  const elementName = element.name.toLowerCase();
  
  if (elementName.includes('amen')) {
    elementInfo = ELEMENT_DATA.amen_break;
    filename = "amen_break.mp3";
  } else if (elementName.includes('foghorn') || elementName.includes('car_bass')) {
    elementInfo = ELEMENT_DATA.foghorn_car_bass;
    filename = "foghorn_car_bass.mp3";
  } else if (elementName.includes('175')) {
    elementInfo = ELEMENT_DATA['175_bpm_break']; 
    filename = "175bpm_break.mp3";
  } else if (elementName.includes('160')) {
    elementInfo = ELEMENT_DATA['160_bpm_break'];
    filename = "160bpm_break.mp3";
  } else if (elementName.includes('reese')) {
    elementInfo = ELEMENT_DATA.reese_bass;
    filename = "reese_bass.mp3";
  } else if (elementName.includes('ambient')) {
    elementInfo = ELEMENT_DATA.ambient_sounds_sampled_music;
    filename = "ambient_sample.mp3";
  } else if (elementName.includes('think')) {
    elementInfo = ELEMENT_DATA.think_break;
    filename = "think_break_174bpm.mp3";
  } else if (elementName.includes('reggae')) {
    elementInfo = ELEMENT_DATA.reggae_bass;
    filename = "reggae_bass_90bpm.mp3";
  }

  const description = elementInfo?.details.description || '';

  return (
    <div className="w-80 mr-6 ml-6 bg-gray-100 text-black rounded-md overflow-hidden">
      {/* Inner scrollable container */}
      <div className="p-3 max-h-80 overflow-y-auto">
        <h3 className="text-2xl" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
          {type} element:
        </h3>
        <h4 className="text-xl mb-1" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>{element.name}</h4>
        
        <div className="h-16 mt-2 mb-2">
          <ElementVisualizer element={element} isPlaying={isPlaying} />
        </div>
        
        {/* Audio player */}
        {filename && <AudioPlayer filename={filename} />}
        
        <div className="mt-2 text-sm border-t border-gray-300 pt-2">
          {/* Short description */}
          <p className="text-lg mt-1" style={{ fontFamily: 'var(--font-nintendo-ds)',whiteSpace: 'pre-line' }}>{description}</p>
        </div>
      </div>
    </div>
  );
});

ElementInfoBox.displayName = 'ElementInfoBox';

export default ElementInfoBox;