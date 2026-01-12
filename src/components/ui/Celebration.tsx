"use client";

import { useEffect, useRef } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

const COLORS = ["#e3f98a", "#65cdd8", "#8533fc", "#6BCB77", "#ffce33", "#ff6b6b"];

export function Confetti({ active, duration = 2000 }: { active: boolean; duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const particleCount = 100;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.rotation += particle.rotationSpeed;
        particle.life = 1 - elapsed / duration;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[400]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

// Sparkle burst effect for smaller celebrations
export function SparkleEffect({ active, x, y }: { active: boolean; x: number; y: number }) {
  if (!active) return null;

  return (
    <div
      className="fixed pointer-events-none z-[400]"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360;
        const delay = i * 30;
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor: COLORS[i % COLORS.length],
              transform: `rotate(${angle}deg) translateX(20px)`,
              animationDelay: `${delay}ms`,
              animationDuration: "600ms",
            }}
          />
        );
      })}
    </div>
  );
}

// Success checkmark animation
export function SuccessCheckmark({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[400] flex items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-[#6BCB77]/20 flex items-center justify-center animate-in zoom-in-50 duration-300">
        <svg
          className="w-12 h-12 text-[#6BCB77]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M5 13l4 4L19 7"
            className="animate-[draw_0.4s_ease-in-out_0.2s_forwards]"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
            }}
          />
        </svg>
      </div>
      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
