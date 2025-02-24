import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VortexProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}

export function Vortex({
  children,
  className = "",
  containerClassName = "",
  particleCount = 700,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "#000000"
}: VortexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const animationFrame = useRef<number | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    handleResize();

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: baseRadius + Math.random() * rangeRadius,
        speed: baseSpeed + Math.random() * rangeSpeed,
        angle: Math.random() * Math.PI * 2,
        hue: baseHue + Math.random() * 30
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = backgroundColor + "10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach(particle => {
        // Update particle position
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, 0.8)`;
        ctx.fill();

        // Update angle based on mouse position
        const dx = mousePosition.current.x - particle.x;
        const dy = mousePosition.current.y - particle.y;
        const targetAngle = Math.atan2(dy, dx);
        const angleDiff = targetAngle - particle.angle;
        
        // Normalize angle difference
        if (angleDiff > Math.PI) particle.angle += Math.PI * 2;
        if (angleDiff < -Math.PI) particle.angle -= Math.PI * 2;
        
        // Smoothly rotate towards mouse
        particle.angle += Math.sin(angleDiff) * 0.1;
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [particleCount, rangeY, baseHue, baseSpeed, rangeSpeed, baseRadius, rangeRadius, backgroundColor]);

  return (
    <div className={cn("relative", containerClassName)}>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 w-full h-full", className)}
      />
      {children && (
        <div className={cn("relative z-10", className)}>
          {children}
        </div>
      )}
    </div>
  );
} 