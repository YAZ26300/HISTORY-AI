"use client";

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface SpotlightButtonProps {
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function SpotlightButton({
  text,
  icon,
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button'
}: SpotlightButtonProps) {
  const divRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <button
      ref={divRef}
      type={type}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 px-4 py-2 transition-all duration-300 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-indigo-500/25'}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        <span className="font-medium text-white">{text}</span>
      </div>
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        animate={{
          WebkitMaskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
          opacity
        }}
        transition={{ type: 'spring', bounce: 0 }}
      />
    </button>
  );
} 