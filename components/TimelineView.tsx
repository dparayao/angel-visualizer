import React, { useEffect, useRef, useCallback } from 'react';
import { MixAnnotations, Pattern, Timestamp, Song } from '../lib/types';

interface TimelineViewProps {
  mixData: MixAnnotations | null;
  currentTime: number;
  onTimeClick: (time: number) => void;
}

const TimelineView = ({ mixData, currentTime, onTimeClick }: TimelineViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Helper to format time in MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Use hardcoded max time as requested
  const getMaxTime = useCallback((): number => {
    return 32 * 60 + 24; // 32:24 = 1944 seconds
  }, []);

  // Get the current pattern based on currentTime
  const getCurrentPattern = (): string | null => {
    if (!mixData || !mixData.patterns || currentTime <= 0) return null;
    
    for (const pattern of mixData.patterns) {
      for (const ts of pattern.timestamps) {
        if (currentTime >= ts.start && currentTime <= ts.end) {
          return pattern.name;
        }
      }
    }
    
    return null;
  };
  
  // Get the currently playing song based on currentTime
  const getCurrentSong = (): string | null => {
    if (!mixData || !mixData.songs || currentTime <= 0) return null;
    
    for (const song of mixData.songs) {
      if (currentTime >= song.start && currentTime <= song.end) {
        return song.title;
      }
    }
    
    return null;
  };

  // Resize handler to make the canvas responsive
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions to match its displayed size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // Redraw after resize
      drawTimeline();
    }
  }, []);

  // Draw the timeline
  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mixData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const totalDuration = getMaxTime();
    if (totalDuration === 0) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw timeline background
    ctx.fillStyle = '#ffffff'; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw time markers with minimal space
    const markerInterval = Math.ceil(totalDuration / 10); // ~10 markers
    ctx.fillStyle = '#333'; // Darker text for markers on white background
    ctx.font = '8px Arial'; // Smaller font
    ctx.textAlign = 'center';
    
    for (let time = 0; time <= totalDuration; time += markerInterval) {
      const x = (time / totalDuration) * canvas.width;
      
      // Draw marker line (shorter)
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 5); // Shorter line
      ctx.strokeStyle = '#333'; // Darker lines for markers
      ctx.stroke();
      
      // Draw time label (more compact)
      ctx.fillText(formatTime(time), x, 12); // Position closer to top
    }
    
    // Draw song sections if available
    if (mixData.songs && mixData.songs.length > 0) {
      mixData.songs.forEach((song: Song, index: number) => {
        const startX = Math.floor((song.start / totalDuration) * canvas.width);
        const endX = Math.floor((song.end / totalDuration) * canvas.width);
        const width = Math.max(endX - startX, 1);
        
        // Alternate colors for songs
        ctx.fillStyle = index % 2 === 0 ? 'rgba(70, 130, 180, 0.3)' : 'rgba(100, 149, 237, 0.3)';
        ctx.fillRect(startX, 25, width, 10);
      });
    }
    
    // Draw all patterns on the same level with gray color
    if (mixData.patterns) {
      mixData.patterns.forEach((pattern: Pattern) => {
        // All elements are gray regardless of type
        ctx.fillStyle = 'rgba(128, 128, 128, 0.7)'; // Gray with some transparency
        
        pattern.timestamps.forEach((ts: Timestamp) => {
          const startX = Math.floor((ts.start / totalDuration) * canvas.width);
          const endX = Math.floor((ts.end / totalDuration) * canvas.width);
          const width = Math.max(endX - startX, 1);
          
          // All elements positioned higher with thinner height
          ctx.fillRect(startX, 15, width, 8);
        });
      });
    }
    
    // Draw current time indicator
    if (currentTime > 0) {
      const x = (currentTime / totalDuration) * canvas.width;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.strokeStyle = '#42A5F5';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.lineWidth = 1;
      
      // Add current time label (smaller and more compact)
      ctx.fillStyle = 'black';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(formatTime(currentTime), x, canvas.height - 2);
    }
  }, [mixData, currentTime, getMaxTime]);

  // Initial setup and resize handler
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Update the timeline when data or time changes
  useEffect(() => {
    drawTimeline();
  }, [mixData, currentTime, drawTimeline]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !mixData) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalDuration = getMaxTime();
    
    // Calculate time based on position
    const clickedTime = (x / canvas.width) * totalDuration;
    
    // Call the parent handler with the clicked time
    onTimeClick(clickedTime);
  };

  const currentPattern = getCurrentPattern();
  const currentSong = getCurrentSong();

  return (
    <div className="w-full mb-8"> {/* Added margin-bottom for spacing */}
      {currentSong && (
        <div className="mb-2 p-2 bg-gray-800 rounded text-center">
          <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
            Now Playing: <span className="text-blue-400">{currentSong}</span>
          </p>
        </div>
      )}
      <div className="relative border border-gray-300 rounded overflow-hidden bg-white" style={{ height: '30px' }}>
        <canvas 
          ref={canvasRef} 
          className="w-full cursor-pointer" 
          height="30"
          onClick={handleCanvasClick}
        />
        {!mixData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-black">Loading timeline data...</p>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-600">
        <div>0:00</div>
        <div>{formatTime(getMaxTime())}</div>
      </div>

    </div>
  );
};

export default TimelineView;