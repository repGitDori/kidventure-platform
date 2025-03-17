import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinningAddButtonProps {
  onClick: () => void;
  className?: string;
}

export function SpinningAddButton({ onClick, className }: SpinningAddButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    let animationFrame: number;
    let rotationSpeed = 2; // Degrees per frame
    
    const animate = () => {
      if (isHovered) {
        setRotation(prev => (prev + rotationSpeed) % 360);
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    if (isHovered) {
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isHovered]);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center",
        "shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
        className
      )}
      aria-label="Add new user"
    >
      <div
        className="flex items-center justify-center"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isHovered ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <Plus className="h-8 w-8" />
      </div>
    </button>
  );
}