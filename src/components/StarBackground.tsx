import React, { useEffect, useState } from "react";

export function StarBackground() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [starsData, setStarsData] = useState<any[]>([]);

  useEffect(() => {
    function updateSize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Gera as propriedades das estrelas só uma vez
  useEffect(() => {
    const arr = Array.from({ length: 120 }).map((_, i) => {
      const size = Math.random() * 2 + 1.5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = Math.random() * 2 + 2.5;
      const delay = Math.random() * 3;
      const moveDuration = Math.random() * 8 + 8; // 8-16s
      const moveDelay = Math.random() * 8;
      const moveX = (Math.random() - 0.5) * 10; // -5% a 5% horizontal
      const moveY = (Math.random() - 0.5) * 10; // -5% a 5% vertical
      const opacity = Math.random() * 0.5 + 0.5;
      return {
        size, left, top, duration, delay, moveDuration, moveDelay, moveX, moveY, opacity
      };
    });
    setStarsData(arr);
  }, []);

  const stars = starsData.map((star, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: `${star.left}%`,
        top: `${star.top}%`,
        width: star.size,
        height: star.size,
        borderRadius: "50%",
        background: "#fff",
        opacity: star.opacity,
        boxShadow: `0 0 ${star.size * 6}px #fff8` ,
        animation: `star-twinkle ${star.duration}s infinite, star-move-${i} ${star.moveDuration}s linear infinite` ,
        animationDelay: `${star.delay}s, ${star.moveDelay}s`,
        pointerEvents: "none",
      }}
    />
  ));

  // Adiciona estrelas fixas nos cantos para garantir cobertura
  const cornerStars = [
    { left: '1%', top: '1%' }, // canto superior esquerdo
    { left: '99%', top: '1%' }, // canto superior direito
    { left: '1%', top: '99%' }, // canto inferior esquerdo
    { left: '99%', top: '99%' }, // canto inferior direito
    { left: '50%', top: '99%' }, // centro inferior
    { left: '99%', top: '50%' }, // centro direito
  ].map((pos, i) => (
    <div
      key={`corner-${i}`}
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "#fff",
        opacity: 0.8,
        boxShadow: `0 0 12px #fff8` ,
        animation: `star-twinkle 3s infinite`,
        animationDelay: `${i * 0.7}s`,
        pointerEvents: "none",
      }}
    />
  ));

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}>
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.2; }
        }
        ${starsData.map((star, i) => `
          @keyframes star-move-${i} {
            0% { transform: translate(0, 0); }
            50% { transform: translate(${star.moveX}%, ${star.moveY}%); }
            100% { transform: translate(0, 0); }
          }
        `).join('')}
      `}</style>
      {stars}
      {cornerStars}
    </div>
  );
} 