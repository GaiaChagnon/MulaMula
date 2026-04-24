"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  targetRadius: number;
  opacity: number;
  color: string;
}

const COLORS = ["#06b6d4", "#0ea5e9", "#22d3ee", "#38bdf8", "#0891b2"];
const NODE_COUNT = 72;
const CONNECTION_DISTANCE = 140;
const REPEL_DISTANCE = 130;
const HIGHLIGHT_DISTANCE = 180;

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      if (!canvas) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particlesRef.current = Array.from({ length: NODE_COUNT }, () => {
        const r = Math.random() * 1.8 + 1.4;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          baseRadius: r,
          radius: r,
          targetRadius: r,
          opacity: Math.random() * 0.4 + 0.45,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        // Smoother mouse repel — soft gradient, no jittery spikes
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          if (dist < REPEL_DISTANCE && dist > 0) {
            const t = 1 - dist / REPEL_DISTANCE;
            // smooth ease-out (t^2)
            const force = t * t * 0.55;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.targetRadius = p.baseRadius * (1 + t * 0.9);
          } else {
            p.targetRadius = p.baseRadius;
          }
        } else {
          p.targetRadius = p.baseRadius;
        }

        // Ease radius toward target
        p.radius += (p.targetRadius - p.radius) * 0.12;

        // Gentle drag so particles return to drift
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Minimum drift speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.12) {
          const angle = Math.random() * Math.PI * 2;
          p.vx += Math.cos(angle) * 0.02;
          p.vy += Math.sin(angle) * 0.02;
        }

        // Clamp max speed
        const maxSpeed = 1.4;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges softly
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Draw connections — brighter near the mouse
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
            const dist = Math.sqrt(distSq);
            const proximity = 1 - dist / CONNECTION_DISTANCE;

            // Proximity to mouse brightens the line
            let mouseBoost = 0;
            if (mouse.active) {
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const mdx = mx - mouse.x;
              const mdy = my - mouse.y;
              const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mdist < HIGHLIGHT_DISTANCE) {
                mouseBoost = (1 - mdist / HIGHLIGHT_DISTANCE) * 0.5;
              }
            }
            const alpha = proximity * (0.55 + mouseBoost);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
            ctx.lineWidth = 0.9 + mouseBoost * 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw nodes with subtle glow
      for (const p of particles) {
        const hex = p.color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.35})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, p.opacity + 0.3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    const ro = new ResizeObserver(() => {
      resize();
      initParticles();
    });
    ro.observe(canvas);

    resize();
    initParticles();
    draw();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
