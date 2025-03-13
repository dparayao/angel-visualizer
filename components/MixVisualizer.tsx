import React, { useEffect, useRef, useCallback } from 'react';
import { Pattern } from '../lib/types';

interface MixVisualizerProps {
  activeElements: Pattern[];
  isPlaying: boolean;
}

const MixVisualizer = ({ activeElements, isPlaying }: MixVisualizerProps) => {
  // Properly type the useRef to accept an HTMLCanvasElement
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Fix the animationRef type to number for requestAnimationFrame
  const animationRef = useRef<number | null>(null);

  // Define drawElement as a memoized callback to prevent unnecessary rerenders
  const drawElement = useCallback(
    (
      ctx: CanvasRenderingContext2D, 
      element: Pattern, 
      index: number, 
      time: number, 
      width: number, 
      height: number
    ) => {
      const elementType = element.type || 'unknown';
      
      // Calculate position based on index
      const startY = (index * (height / (activeElements.length || 1))) + 20;
      const elementHeight = (height / (activeElements.length || 1)) - 40;
      
      // Different visualization patterns based on element type
      if (elementType === 'jungle') {
        drawJungleElement(ctx, element, time, width, startY, elementHeight);
      } else if (elementType === 'dnb') {
        drawDnbElement(ctx, element, time, width, startY, elementHeight);
      } else {
        drawDefaultElement(ctx, element, time, width, startY, elementHeight);
      }
      
      // Draw element name label
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(element.name, 10, startY - 5);
    },
    [activeElements.length]
  );

  // Jungle style visualization (e.g., amen breaks, reggae bass)
  const drawJungleElement = (
    ctx: CanvasRenderingContext2D, 
    element: Pattern, 
    time: number, 
    width: number, 
    startY: number, 
    height: number
  ) => {
    ctx.fillStyle = 'rgba(255, 165, 0, 0.7)'; // Orange color for jungle
    
    // Create a pulsing effect
    const numBars = 16;
    const barWidth = (width - 20) / numBars;
    
    for (let i = 0; i < numBars; i++) {
      const barHeight = Math.abs(Math.sin((time + i * 0.3) % Math.PI)) * height;
      ctx.fillRect(
        10 + i * barWidth, 
        startY + (height - barHeight), 
        barWidth - 2, 
        barHeight
      );
    }
  };

  // DNB style visualization (e.g., fast drums, bass)
  const drawDnbElement = (
    ctx: CanvasRenderingContext2D, 
    element: Pattern, 
    time: number, 
    width: number, 
    startY: number, 
    height: number
  ) => {
    ctx.fillStyle = 'rgba(75, 0, 130, 0.7)'; // Indigo color for DnB
    
    // Create a waveform-like pattern
    ctx.beginPath();
    ctx.moveTo(0, startY + height/2);
    
    for (let x = 0; x < width; x += 5) {
      const y = startY + height/2 + Math.sin((x * 0.05) + time * 2) * (height/2 - 10);
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, startY + height/2);
    ctx.stroke();
    
    // Draw bass pulses
    const centerX = width / 2;
    const centerY = startY + height / 2;
    const pulseSize = Math.sin(time * 3) * 20 + 30;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
    ctx.fill();
  };

  // Default visualization for unknown element types
  const drawDefaultElement = (
    ctx: CanvasRenderingContext2D, 
    element: Pattern, 
    time: number, 
    width: number, 
    startY: number, 
    height: number
  ) => {
    ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
    ctx.fillRect(10, startY, width - 20, height);
    
    // Add some movement
    const circleY = startY + height/2;
    const circleX = (Math.sin(time) * (width/2 - 40)) + width/2;
    
    ctx.beginPath();
    ctx.arc(circleX, circleY, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear previous animations if any
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Only animate if playing and we have elements
    if (isPlaying && activeElements.length > 0) {
      let time = 0;
      const animate = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw each active element
        activeElements.forEach((element, index) => {
          drawElement(ctx, element, index, time, canvas.width, canvas.height);
        });
        
        // Increase time for animations
        time += 0.05;
        
        // Continue animation loop
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    } else {
      // If paused, just render the current elements without animation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      activeElements.forEach((element, index) => {
        drawElement(ctx, element, index, 0, canvas.width, canvas.height);
      });
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeElements, isPlaying, drawElement]); // Added drawElement to dependency array

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2">Currently Playing Elements</h2>
      {activeElements.length === 0 ? (
        <p className="text-gray-600">No elements currently active</p>
      ) : (
        <canvas 
          ref={canvasRef} 
          className="w-full h-64 bg-gray-200 rounded"
          style={{ fontFamily: 'var(--font-nintendo-ds)' }}
        />
      )}
    </div>
  );
};

export default MixVisualizer;