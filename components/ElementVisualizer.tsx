import React, { useEffect, useRef } from 'react';
import { Pattern } from '../lib/types';

interface ElementVisualizerProps {
  element: Pattern | null;
  isPlaying: boolean;
}

const ElementVisualizer: React.FC<ElementVisualizerProps> = ({ element, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !element) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const width = canvas.width;
    const height = canvas.height;

    // Clear previous animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Log element to help with debugging
    console.log("Current element:", element);

    // Determine element type and visualization style
    const elementType = element.type || '';
    // Support both 'dnb' and 'bass' as type names
    const isJungle = elementType === 'break';
    const isDnb = elementType === 'bass' || elementType === 'dnb';

    // Set base color based on element type
    const baseColor = isJungle ? 'rgb(168, 202, 242)' : // Orange for jungle/breaks
                     isDnb ? 'rgb(168, 202, 242)' :     // Purple for dnb/bass
                     'rgb(0, 128, 128)';              // Teal for ambient

    // Try to find visualization data - access directly from element
    const rhythmPattern = element.rhythm_pattern;
    const pitchHistogram = element.pitch_histogram;
    const noteDensity = element.note_density_over_time;

    // Choose visualization based on available data
    const useRhythmPattern = rhythmPattern && rhythmPattern.length > 0;
    const usePitchHistogram = pitchHistogram && pitchHistogram.length > 0; 
    const useNoteDensity = noteDensity && noteDensity.length > 0;

    if (isPlaying) {
      let time = 0;
      
      const animate = () => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(17, 24, 39, 0.2)'; // Dark background
        ctx.fillRect(0, 0, width, height);
        
        // Draw visualization based on available data
        if (useRhythmPattern) {
          drawRhythmPattern(ctx, rhythmPattern, baseColor, time, width, height);
        } else if (usePitchHistogram) {
          drawPitchHistogram(ctx, pitchHistogram, baseColor, time, width, height);
        } else if (useNoteDensity) {
          drawNoteDensity(ctx, noteDensity, baseColor, time, width, height);
        } else {
          // Fallback to simple visualization
          drawDefaultVisualization(ctx, elementType, baseColor, time, width, height);
        }
        
        // Advance animation time
        time += 0.05;
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    } else {
      // Static render when paused
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)'; // Dark background
      ctx.fillRect(0, 0, width, height);
      
      // Draw static visualization based on available data
      if (useRhythmPattern) {
        drawRhythmPattern(ctx, rhythmPattern, baseColor, 0, width, height);
      } else if (usePitchHistogram) {
        drawPitchHistogram(ctx, pitchHistogram, baseColor, 0, width, height);
      } else if (useNoteDensity) {
        drawNoteDensity(ctx, noteDensity, baseColor, 0, width, height);
      } else {
        // Fallback to simple visualization
        drawDefaultVisualization(ctx, elementType, baseColor, 0, width, height);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [element, isPlaying]);

  // Default visualization (enhanced from your original code)
  const drawDefaultVisualization = (
    ctx: CanvasRenderingContext2D,
    type: string,
    color: string,
    time: number,
    width: number,
    height: number
  ) => {
    if (type === 'jungle' || type === 'break') {
      // Orange bars for jungle elements
      const numBars = 8;
      const barWidth = (width - 20) / numBars;
      
      ctx.fillStyle = 'rgb(168, 202, 242)';
      
      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.abs(Math.sin((time + i * 0.3) % Math.PI)) * (height - 20);
        ctx.fillRect(
          10 + i * barWidth, 
          (height - barHeight - 10), 
          barWidth - 2, 
          barHeight
        );
      }
    } else if (type === 'dnb' || type === 'bass') {
      // Enhanced purple wave for dnb/bass elements
      ctx.strokeStyle = 'rgb(168, 202, 242)';
      ctx.lineWidth = 3;
      
      // Create a gradient for the line
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgb(168, 202, 242)');
      gradient.addColorStop(1, 'rgba(56, 54, 109, 0.19)');
      
      // First draw a filled area
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let x = 0; x < width; x += 5) {
        const y = height/2 + Math.sin((x * 0.05) + time * 2) * (height/3);
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Then draw the line on top
      ctx.beginPath();
      ctx.moveTo(0, height/2);
      
      for (let x = 0; x < width; x += 5) {
        const y = height/2 + Math.sin((x * 0.05) + time * 2) * (height/3);
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = 'rgba(139, 183, 229, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add some "bass bump" circles at wave peaks
      const numPoints = 5;
      for (let i = 0; i < numPoints; i++) {
        const x = width * (i + 0.5) / numPoints;
        const wavePos = Math.sin((x * 0.05) + time * 2);
        const y = height/2 + wavePos * (height/3);
        
        if (wavePos > 0.7) { // Only add circles near peaks
          ctx.beginPath();
          ctx.fillStyle = 'rgba(190, 230, 255, 0.6)';
          ctx.arc(x, y, 5 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Teal circles for ambient elements
      ctx.fillStyle = 'rgba(0, 128, 128, 0.7)';
      
      const numCircles = 5;
      for (let i = 0; i < numCircles; i++) {
        const radius = 10 + Math.sin(time * 2 + i) * 10;
        const x = width * (i + 1) / (numCircles + 1);
        const y = height/2 + Math.cos(time + i * 0.7) * (height/4);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Rhythm pattern visualization
  const drawRhythmPattern = (
    ctx: CanvasRenderingContext2D,
    pattern: number[],
    color: string,
    time: number,
    width: number,
    height: number
  ) => {
    const segmentWidth = width / pattern.length;
    
    // Determine active segment for animation
    const currentSegment = Math.floor(time * 2) % pattern.length;
    
    // Draw bars
    for (let i = 0; i < pattern.length; i++) {
      const value = pattern[i];
      const barHeight = value * (height * 0.8);
      
      // More opacity for active segment
      const alpha = i === currentSegment ? 0.9 : 0.6;
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      
      // Animated height for active segment
      const animatedHeight = i === currentSegment 
        ? barHeight * (0.8 + 0.2 * Math.sin(time * 10))
        : barHeight;
      
      ctx.fillRect(
        i * segmentWidth, 
        height - animatedHeight, 
        segmentWidth - 2, 
        animatedHeight
      );
      
      // Add glow to active segment
      if (i === currentSegment) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillRect(
          i * segmentWidth, 
          height - animatedHeight, 
          segmentWidth - 2, 
          animatedHeight
        );
        ctx.shadowBlur = 0;
      }
    }
  };

  // Pitch histogram visualization
  const drawPitchHistogram = (
    ctx: CanvasRenderingContext2D,
    histogram: number[],
    color: string,
    time: number,
    width: number,
    height: number
  ) => {
    // Find max value for scaling
    const maxValue = Math.max(...histogram, 0.1); // Avoid division by zero
    const scaleFactor = 1 / maxValue;
    
    // Draw circular visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Draw connecting lines
    ctx.beginPath();
    ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', ', 0.3)');
    ctx.lineWidth = 2;
    
    for (let i = 0; i < histogram.length; i++) {
      const angle = (i / histogram.length) * Math.PI * 2;
      const value = histogram[i] * scaleFactor;
      
      // Add pulsating effect
      const pulseEffect = 0.1 * Math.sin(time * 3 + i);
      const effectiveRadius = radius * (0.2 + value * 0.8 + pulseEffect);
      
      const x = centerX + Math.cos(angle) * effectiveRadius;
      const y = centerY + Math.sin(angle) * effectiveRadius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    // Close the path if we have enough points
    if (histogram.length > 2) {
      ctx.closePath();
    }
    
    ctx.stroke();
    
    // Draw points at each node
    for (let i = 0; i < histogram.length; i++) {
      const angle = (i / histogram.length) * Math.PI * 2;
      const value = histogram[i] * scaleFactor;
      
      // Add pulsating effect
      const pulseEffect = 0.1 * Math.sin(time * 3 + i);
      const effectiveRadius = radius * (0.2 + value * 0.8 + pulseEffect);
      
      const x = centerX + Math.cos(angle) * effectiveRadius;
      const y = centerY + Math.sin(angle) * effectiveRadius;
      
      ctx.beginPath();
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${0.7 + 0.3 * value})`);
      ctx.arc(x, y, 3 + value * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Note density visualization
  const drawNoteDensity = (
    ctx: CanvasRenderingContext2D,
    densityData: number[],
    color: string,
    time: number,
    width: number,
    height: number
  ) => {
    // Find max value for scaling
    const maxValue = Math.max(...densityData, 1); // Avoid division by zero
    const scaleFactor = 1 / maxValue;
    
    // Draw flowing wave visualization
    const pointWidth = width / (densityData.length - 1);
    
    // Create gradient for fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ', 0.7)'));
    gradient.addColorStop(1, color.replace('rgb', 'rgba').replace(')', ', 0.1)'));
    
    // Draw the filled area
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    for (let i = 0; i < densityData.length; i++) {
      const value = densityData[i] * scaleFactor;
      const x = i * pointWidth;
      
      // Add wave animation
      const waveY = Math.sin(time * 2 + i * 0.3) * 10;
      const y = height - (value * height * 0.7 + waveY);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw the line on top
    ctx.beginPath();
    
    for (let i = 0; i < densityData.length; i++) {
      const value = densityData[i] * scaleFactor;
      const x = i * pointWidth;
      
      // Add wave animation
      const waveY = Math.sin(time * 2 + i * 0.3) * 10;
      const y = height - (value * height * 0.7 + waveY);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', ', 0.9)');
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points at data points
    for (let i = 0; i < densityData.length; i++) {
      const value = densityData[i] * scaleFactor;
      if (value < 0.1) continue; // Skip very small values
      
      const x = i * pointWidth;
      
      // Add wave animation
      const waveY = Math.sin(time * 2 + i * 0.3) * 10;
      const y = height - (value * height * 0.7 + waveY);
      
      ctx.beginPath();
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ', 0.9)');
      ctx.arc(x, y, 2 + value * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-gray-900 rounded"
      style={{ display: element ? 'block' : 'none' }}
    />
  );
};

export default ElementVisualizer;