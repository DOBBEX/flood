"use client";

import { useEffect, useRef } from "react";
import { SystemState } from "@/lib/stateMachine";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export function CyberBackgroundCanvas({ state }: { state: SystemState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const getColors = () => {
      switch (state) {
        case "IDLE":
          return { r: 161, g: 161, b: 170 }; // Dark slate gray / silver
        case "MONITORING":
          return { r: 100, g: 116, b: 139 }; // Cool slate gray
        case "WARNING":
          return { r: 245, g: 158, b: 11 }; // Dark Amber
        case "SOS":
          return { r: 239, g: 68, b: 68 }; // Red
      }
    };

    const particleCount = 50;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 2 + Math.random() * 3.5,
        alpha: 0.15 + Math.random() * 0.35,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const color = getColors();

      // Soft Ambient Lighting Aura
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.05,
        10,
        width * 0.5,
        height * 0.05,
        width * 0.65
      );
      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.12)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Floating Ambient Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
}
