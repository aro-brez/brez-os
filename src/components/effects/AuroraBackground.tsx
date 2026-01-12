"use client";

import { useEffect, useRef } from "react";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Subtle mouse tracking for interactivity
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Simplex-like noise function for organic movement
    const noise = (x: number, y: number, t: number): number => {
      const sin1 = Math.sin(x * 0.5 + t);
      const sin2 = Math.sin(y * 0.4 + t * 0.7);
      const sin3 = Math.sin((x + y) * 0.3 + t * 0.5);
      const sin4 = Math.sin(Math.sqrt(x * x + y * y) * 0.2 + t * 0.3);
      return (sin1 + sin2 + sin3 + sin4) / 4;
    };

    // Fractal brownian motion for complex organic patterns
    const fbm = (x: number, y: number, t: number): number => {
      let value = 0;
      let amplitude = 0.5;
      let frequency = 1;
      for (let i = 0; i < 4; i++) {
        value += amplitude * noise(x * frequency, y * frequency, t);
        amplitude *= 0.5;
        frequency *= 2;
      }
      return value;
    };

    // Color palette - opal/aurora iridescence
    const hslToRgb = (h: number, s: number, l: number) => {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; }
      else if (h < 120) { r = x; g = c; }
      else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; }
      else if (h < 300) { r = x; b = c; }
      else { r = c; b = x; }
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    };

    const width = () => window.innerWidth;
    const height = () => window.innerHeight;

    const animate = () => {
      time += 0.004;

      // Create gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height());
      bgGradient.addColorStop(0, "#0a0a1f");
      bgGradient.addColorStop(0.5, "#0D0D2A");
      bgGradient.addColorStop(1, "#0f0f2d");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width(), height());

      // Layer 1: Deep background mesh distortion
      const meshSize = 80;
      const cols = Math.ceil(width() / meshSize) + 2;
      const rows = Math.ceil(height() / meshSize) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * meshSize;
          const y = j * meshSize;

          // Organic distortion
          const distortX = fbm(x * 0.003, y * 0.003, time) * 40;
          const distortY = fbm(x * 0.003 + 100, y * 0.003, time * 0.8) * 40;

          // Mouse influence (subtle)
          const dx = (x / width()) - mouseX;
          const dy = (y / height()) - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseInfluence = Math.max(0, 1 - dist * 2) * 20;

          const finalX = x + distortX + dx * mouseInfluence;
          const finalY = y + distortY + dy * mouseInfluence;

          // Color based on position and time - iridescent shift
          const hue = (fbm(x * 0.002, y * 0.002, time * 0.5) + 1) * 180;
          const saturation = 0.6 + fbm(x * 0.001, y * 0.001, time * 0.3) * 0.3;
          const lightness = 0.5 + fbm(x * 0.002, y * 0.002, time * 0.4) * 0.2;

          // Map to our brand palette range (greens, teals, purples, pinks)
          const brandHue = 80 + hue * 0.8; // Range from lime (80) through teal, purple, to pink (280)
          const color = hslToRgb(brandHue % 360, saturation, lightness);

          const alpha = 0.03 + Math.abs(fbm(x * 0.004, y * 0.004, time)) * 0.04;

          ctx.beginPath();
          ctx.arc(finalX, finalY, meshSize * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fill();
        }
      }

      // Layer 2: Flowing aurora streams
      const streamCount = 6;
      for (let s = 0; s < streamCount; s++) {
        ctx.beginPath();

        const streamY = height() * (0.1 + s * 0.15);
        const streamPhase = s * 0.8;

        // Create flowing path
        ctx.moveTo(-50, streamY);
        for (let x = -50; x <= width() + 50; x += 10) {
          const noiseVal = fbm(x * 0.002 + streamPhase, time + s, time * 0.5);
          const y = streamY + noiseVal * height() * 0.15;
          ctx.lineTo(x, y);
        }

        // Complete the shape
        ctx.lineTo(width() + 50, height());
        ctx.lineTo(-50, height());
        ctx.closePath();

        // Iridescent gradient for each stream
        const gradient = ctx.createLinearGradient(0, streamY - 100, width(), streamY + 200);
        const hueOffset = (time * 20 + s * 40) % 360;

        const c1 = hslToRgb((80 + hueOffset) % 360, 0.7, 0.6);
        const c2 = hslToRgb((160 + hueOffset) % 360, 0.6, 0.5);
        const c3 = hslToRgb((260 + hueOffset) % 360, 0.7, 0.55);

        gradient.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.06)`);
        gradient.addColorStop(0.5, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.08)`);
        gradient.addColorStop(1, `rgba(${c3.r}, ${c3.g}, ${c3.b}, 0.04)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Layer 3: Floating light orbs with trails
      const orbCount = 12;
      for (let i = 0; i < orbCount; i++) {
        const seed = i * 1337;
        const orbSpeed = 0.3 + (seed % 100) / 200;
        const orbSize = 30 + (seed % 50);

        // Organic movement path
        const pathX = width() * (0.2 + 0.6 * ((seed * 7) % 100) / 100);
        const pathY = height() * (0.1 + 0.8 * ((seed * 13) % 100) / 100);

        const orbX = pathX + Math.sin(time * orbSpeed + seed) * 150 + Math.cos(time * orbSpeed * 0.7) * 80;
        const orbY = pathY + Math.cos(time * orbSpeed * 0.8 + seed) * 100 + Math.sin(time * orbSpeed * 0.5) * 60;

        // Pulsing glow
        const pulse = 0.5 + Math.sin(time * 2 + seed) * 0.3;
        const hue = (80 + (seed % 200) + time * 10) % 360;
        const color = hslToRgb(hue, 0.8, 0.6);

        // Soft glow gradient
        const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * pulse);
        orbGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`);
        orbGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.06)`);
        orbGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize * pulse, 0, Math.PI * 2);
        ctx.fillStyle = orbGradient;
        ctx.fill();
      }

      // Layer 4: Sparkle particles
      const sparkleCount = 40;
      for (let i = 0; i < sparkleCount; i++) {
        const seed = i * 997;
        const sparkleX = (seed * 7.3) % width();
        const sparkleY = (seed * 11.7) % height();

        // Drifting motion
        const driftX = Math.sin(time + seed) * 30;
        const driftY = Math.cos(time * 0.7 + seed) * 20 - time * 10;

        const finalSparkleY = (sparkleY + driftY) % height();

        const twinkle = Math.pow(Math.sin(time * 4 + seed) * 0.5 + 0.5, 2);
        const size = 1 + twinkle * 2;

        const hue = (80 + (seed % 200)) % 360;
        const color = hslToRgb(hue, 0.9, 0.7);

        ctx.beginPath();
        ctx.arc(sparkleX + driftX, finalSparkleY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${twinkle * 0.6})`;
        ctx.fill();
      }

      // Final: Subtle vignette
      const vignette = ctx.createRadialGradient(
        width() / 2, height() / 2, height() * 0.3,
        width() / 2, height() / 2, height()
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(10, 10, 30, 0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width(), height());

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

export function AuroraGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-1/2 -left-1/4 w-full h-full opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, rgba(227, 249, 138, 0.3) 0%, transparent 50%)`,
          filter: "blur(60px)",
          animation: "aurora-pulse 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}
