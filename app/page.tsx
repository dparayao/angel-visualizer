"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import TimelineView from '../components/TimelineView';
import ElementInfoBox from '../components/ElementInfoBox';
import NavBar from '../components/NavBar';
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

  // load mix annotations data
  useEffect(() => {
    const loadData = async () => {
      const data = await loadEnhancedMixData();
      setMixData(data);
    };
    
    loadData();
  }, []);

  // define yt video interface
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

  const updateActiveElements = useCallback((time: number) => {
    if (!mixData) return;
    
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 100) return;
    lastUpdateTimeRef.current = now;
    
    const active = mixData.patterns.filter(pattern => 
      pattern.timestamps.some(ts => time >= ts.start && time <= ts.end)
    );
    
    setActiveElements(active);
    
    // update jungle and dnb elements
    const junglePatterns = active.filter(el => el.type === 'jungle');
    const dnbPatterns = active.filter(el => el.type === 'dnb');
    
    // set the first element of each type, if available
    setJungleElement(junglePatterns.length > 0 ? junglePatterns[0] : null);
    setDnbElement(dnbPatterns.length > 0 ? dnbPatterns[0] : null);
  }, [mixData]);

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
    }, 100);
  }, [updateActiveElements]); 

  const stopTimeTracking = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);


  const initializePlayer = useCallback((videoId: string) => {
    const onPlayerStateChange = (event: YouTubePlayerEvent) => {
      if (event.data === 1) {
        setIsPlaying(true);
        startTimeTracking();
        
        // update elements immediately when playback starts
        if (player && typeof player.getCurrentTime === 'function') {
          const newTime = player.getCurrentTime();
          setCurrentTime(newTime);
          updateActiveElements(newTime);
        }
      } else {
        setIsPlaying(false);
        stopTimeTracking();
        
        // update elements when paused
        if (event.data === 2 && player && typeof player.getCurrentTime === 'function') {
          const newTime = player.getCurrentTime();
          setCurrentTime(newTime);
          updateActiveElements(newTime);
        }
      }
    };
    
    const addSeekingEventListener = (playerInstance: YouTubePlayer) => {
      let lastTime = 0;
      
      // checking interval to detect seeking
      const seekCheckInterval = setInterval(() => {
        if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
          const currentTime = playerInstance.getCurrentTime();
          
          // only update if time jumped more than 1 sec + haven't checked recently
          const now = Date.now();
          if (Math.abs(currentTime - lastTime) > 1 && 
              now - lastUpdateTimeRef.current > 100) {
            setCurrentTime(currentTime);
            updateActiveElements(currentTime);
          }
          
          lastTime = currentTime;
        }
      }, 200);
      
      // store interval ID for cleanup
      return seekCheckInterval;
    };
    
    const onPlayerReady = () => {
      console.log('Player ready');
      const intervalId = addSeekingEventListener(newPlayer);
      setSeekCheckIntervalId(intervalId);
    };

    const ytWindow = window as unknown as YouTubeWindow;
    
    const newPlayer = new ytWindow.YT.Player('youtube-player', {
      height: '270', 
      width: '480', 
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    
    setPlayer(newPlayer);
  }, [setIsPlaying, updateActiveElements, setCurrentTime, startTimeTracking, stopTimeTracking]); 

  // initialize YouTube Player API
  useEffect(() => {
    // continue if mixData and valid YouTube ID
    if (!mixData || !mixData.youtubeVideoId) return;
    
    // initialize yt script element
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // onYouTubeIframeAPIReady function
      const ytWindow = window as unknown as YouTubeWindow;
      ytWindow.onYouTubeIframeAPIReady = () => {
        initializePlayer(mixData.youtubeVideoId);
      };
    } else if ((window as unknown as YouTubeWindow).YT) {
      // if script already exists and YT is loaded, initialize player directly
      initializePlayer(mixData.youtubeVideoId);
    }
  }, [mixData, initializePlayer]); // Added initializePlayer to dependency array

  // clean up on unmount
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

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-4 bg-gray-900">
        <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>Jungle/DnB Mix Visualizer</h1>
        <NavBar />
      </header>
      
      <main className="flex flex-col flex-1 p-4">
        {/* Top section with angel images*/}
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