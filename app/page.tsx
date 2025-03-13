"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import TimelineView from '../components/TimelineView';
import ElementVisualizer from '../components/ElementVisualizer';
import ElementInfoBox from '../components/ElementInfoBox';
import { loadEnhancedMixData } from '../lib/dataLoader';
import { MixAnnotations, Pattern, YouTubePlayer, YouTubePlayerEvent } from '../lib/types';

export default function Home() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mixData, setMixData] = useState<MixAnnotations | null>(null);
  const [activeElements, setActiveElements] = useState<Pattern[]>([]);
  const [jungleElement, setJungleElement] = useState<Pattern | null>(null);
  const [dnbElement, setDnbElement] = useState<Pattern | null>(null);
  const timerRef = useRef<number | null>(null);
  const [seekCheckIntervalId, setSeekCheckIntervalId] = useState<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Load the mix annotations data
  useEffect(() => {
    const loadData = async () => {
      const data = await loadEnhancedMixData();
      setMixData(data);
    };
    
    loadData();
  }, []);

  // Define YouTube window interface
  interface YouTubeWindow {
    YT: {
      Player: new (
        elementId: string, 
        config: {
          height: string | number;
          width: string | number;
          videoId: string;
          events: {
            onReady: () => void;
            onStateChange: (event: YouTubePlayerEvent) => void;
          }
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }

  // Define updateActiveElements first as a useCallback to avoid reference issues
  const updateActiveElements = useCallback((time: number) => {
    if (!mixData) return;
    
    // Don't update too frequently
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 100) return;
    lastUpdateTimeRef.current = now;
    
    const active = mixData.patterns.filter(pattern => 
      pattern.timestamps.some(ts => time >= ts.start && time <= ts.end)
    );
    
    setActiveElements(active);
    
    // Update jungle and dnb elements
    const junglePatterns = active.filter(el => el.type === 'jungle');
    const dnbPatterns = active.filter(el => el.type === 'dnb');
    
    // Set the first element of each type, if available
    setJungleElement(junglePatterns.length > 0 ? junglePatterns[0] : null);
    setDnbElement(dnbPatterns.length > 0 ? dnbPatterns[0] : null);
  }, [mixData]);

  // Convert startTimeTracking to useCallback
  const startTimeTracking = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        const newTime = player.getCurrentTime();
        setCurrentTime(newTime);
        updateActiveElements(newTime);
      }
    }, 100); // Update every 100ms for smooth tracking
  }, [updateActiveElements]); // Removed player from dependencies

  // Convert stopTimeTracking to useCallback
  const stopTimeTracking = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Add player to the dependency array of the initializePlayer useCallback
  const initializePlayer = useCallback((videoId: string) => {
    const onPlayerStateChange = (event: YouTubePlayerEvent) => {
      // YT.PlayerState.PLAYING = 1
      if (event.data === 1) {
        setIsPlaying(true);
        startTimeTracking();
        
        // Update elements immediately when playback starts
        if (player && typeof player.getCurrentTime === 'function') {
          const newTime = player.getCurrentTime();
          setCurrentTime(newTime);
          updateActiveElements(newTime);
        }
      } else {
        setIsPlaying(false);
        stopTimeTracking();
        
        // Also update elements when paused
        if (event.data === 2 && player && typeof player.getCurrentTime === 'function') {
          const newTime = player.getCurrentTime();
          setCurrentTime(newTime);
          updateActiveElements(newTime);
        }
      }
    };
    
    // Add this new function to detect seeking events
    const addSeekingEventListener = (playerInstance: YouTubePlayer) => {
      let lastTime = 0;
      
      // Set up a checking interval to detect seeking
      const seekCheckInterval = setInterval(() => {
        if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
          const currentTime = playerInstance.getCurrentTime();
          
          // Only update if time jumped by more than 1 second (seeking)
          // AND we haven't updated recently
          const now = Date.now();
          if (Math.abs(currentTime - lastTime) > 1 && 
              now - lastUpdateTimeRef.current > 100) {
            setCurrentTime(currentTime);
            updateActiveElements(currentTime);
          }
          
          lastTime = currentTime;
        }
      }, 200);
      
      // Store the interval ID for cleanup
      return seekCheckInterval;
    };
    
    const onPlayerReady = () => {
      console.log('Player ready');
      const intervalId = addSeekingEventListener(newPlayer);
      setSeekCheckIntervalId(intervalId);
    };

    // We need to cast window to unknown first, then to YouTubeWindow
    // to satisfy TypeScript's type checking
    const ytWindow = window as unknown as YouTubeWindow;
    
    const newPlayer = new ytWindow.YT.Player('youtube-player', {
      height: '270', // Smaller video height
      width: '480',  // Smaller video width
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    
    setPlayer(newPlayer);
  }, [setIsPlaying, updateActiveElements, setCurrentTime, startTimeTracking, stopTimeTracking]); // Removed player from dependencies

  // Initialize YouTube Player API
  useEffect(() => {
    // Only proceed if we have mixData with a valid YouTube ID
    if (!mixData || !mixData.youtubeVideoId) return;
    
    // Create YouTube script element if it doesn't exist
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Define the onYouTubeIframeAPIReady function
      // We need to cast window to unknown first, then to YouTubeWindow
      const ytWindow = window as unknown as YouTubeWindow;
      ytWindow.onYouTubeIframeAPIReady = () => {
        initializePlayer(mixData.youtubeVideoId);
      };
    } else if ((window as unknown as YouTubeWindow).YT) {
      // If the script already exists and YT is loaded, initialize player directly
      initializePlayer(mixData.youtubeVideoId);
    }
  }, [mixData, initializePlayer]); // Added initializePlayer to dependency array

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      if (seekCheckIntervalId !== null) {
        window.clearInterval(seekCheckIntervalId);
      }
    };
  }, [seekCheckIntervalId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("Canvas clicked!");
    // rest of the function
  };
  
  const handleTimelineClick = useCallback((time: number) => {
    console.log("Timeline click handler called with time:", time);
    if (player && typeof player.seekTo === 'function') {
      console.log("Seeking to time:", time);
      player.seekTo(time);
      updateActiveElements(time);
    } else {
      console.log("Player not available or seekTo not a function", player);
    }
  }, [player, updateActiveElements]);

  // Function to get the current song name
  const getCurrentSongName = (elements: Pattern[]): string => {
    if (elements.length === 0) {
      return "No song detected";
    }
    
    // Check if timestamps has song info
    if (elements[0].timestamps && 
        elements[0].timestamps.length > 0 && 
        elements[0].timestamps[0].song) {
      return elements[0].timestamps[0].song;
    }
    
    // Fall back to element name
    return elements[0].name;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-4 bg-gray-900">
        <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>Jungle/DnB Mix Visualizer</h1>
      </header>
      
      <main className="flex flex-col flex-1 p-4">
        {/* Top section with angel images - bigger and closer together */}
        <div className="flex justify-center gap-80 mb-6">
          <div className="h-80">
            <img src="/angel-left.png" alt="Angel" className="w-full h-full" />
          </div>
          
          <div className="h-80">
            <img src="/angel-right.png" alt="Angel" className="w-full h-full" />
          </div>
        </div>
        
        {/* YouTube player section with element boxes on each side */}
        <div className="flex justify-center items-center relative mb-10">
          {/* Left jungle element box */}
          <ElementInfoBox 
            element={jungleElement} 
            isPlaying={isPlaying} 
            type="jungle" 
          />
          
          {/* Center YouTube player */}
          <div id="youtube-player"></div>
          
          {/* Right dnb element box */}
          <ElementInfoBox 
            element={dnbElement} 
            isPlaying={isPlaying} 
            type="dnb" 
          />
      </div>
        
        {/* Timeline below player */}
        <div className="mb-4 mx-auto w-full max-w-4xl">
          <TimelineView 
            mixData={mixData} 
            currentTime={currentTime} 
            onTimeClick={handleTimelineClick} 
          />
        </div>
      </main>
      
      <footer className="text-xl bg-gray-900 text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
        <p>made by Dagny Parayao for DH150</p>
      </footer>
    </div>
  );
}