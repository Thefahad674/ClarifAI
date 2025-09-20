"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from '../../components/ui/moving-border'

const Navbar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      const { offsetWidth, offsetHeight } = canvas;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = offsetWidth * dpr;
      canvas.height = offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
    }));

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#9ca3af";
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(156,163,175,${1 - dist / 120})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <nav className="w-full absolute h-20 bg-black backdrop-blur-md shadow-lg text-white overflow-hidden rounded-2xl">
      {/* Particle network canvas */}
      <canvas
        ref={canvasRef}
        className="hidden lg:block absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto px-6 flex items-center h-full justify-between relative z-10">
        {/* Logo */}
        <div className="flex items-center space-x-3 z-10">
          <Image
            src="/clarifai-logo.svg"  
            alt="ClarifAI Logo"
            width={160}
            height={50}
            priority
            className="cursor-pointer"
          />
        </div>

        {/* CTA Button */}
        <div>
          <Button
          suppressHydrationWarning
          className="bg-black" >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
