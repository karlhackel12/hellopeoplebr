
import React, { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
  color?: string;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ 
  audioLevel, 
  isActive, 
  className = '',
  color = 'orange'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bars = 40; // Number of bars in the waveform
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / (bars * 1.5);
    const spacing = barWidth / 2;
    
    // Choose color based on props
    let fillColor;
    switch (color) {
      case 'orange':
        fillColor = isActive ? 'rgba(249, 115, 22, 0.8)' : 'rgba(249, 115, 22, 0.3)';
        break;
      case 'blue':
        fillColor = isActive ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.3)';
        break;
      case 'green':
        fillColor = isActive ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.3)';
        break;
      default:
        fillColor = isActive ? 'rgba(249, 115, 22, 0.8)' : 'rgba(249, 115, 22, 0.3)';
    }
    
    ctx.fillStyle = fillColor;
    
    if (!isActive) {
      // If not active, draw a flat line with small variations
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + spacing);
        const barHeight = (Math.sin(i * 0.4) + 1) * height * 0.1 + height * 0.1;
        const y = (height - barHeight) / 2;
        
        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2]);
        ctx.fill();
      }
    } else {
      // If active, create a dynamic waveform based on audio level
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + spacing);
        
        // Create a more interesting pattern using multiple sine waves and audio level
        const normalizedI = i / bars;
        const fast = Math.sin(Date.now() * 0.01 + i * 0.2) * 0.5 + 0.5;
        const slow = Math.sin(Date.now() * 0.002 + i * 0.1) * 0.5 + 0.5;
        const combined = (fast * 0.3 + slow * 0.7);
        
        // Apply audio level to center bars more than edge bars
        const centerEffect = 1 - Math.abs(normalizedI - 0.5) * 2;
        const levelEffect = audioLevel * centerEffect;
        
        const barHeight = combined * height * 0.5 * (0.2 + levelEffect * 0.8) + height * 0.05;
        const y = (height - barHeight) / 2;
        
        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2]);
        ctx.fill();
      }
    }
  }, [audioLevel, isActive, bars, color]);
  
  // Set up animation loop
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      // Force a re-render for animation
      canvasRef.current?.getContext('2d')?.clearRect(0, 0, 0, 0);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    if (isActive) {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={50} 
      className={`w-full ${className}`}
    />
  );
};

export default VoiceWaveform;
