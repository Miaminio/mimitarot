import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface GoldStream {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const stars: { x: number; y: number; size: number; opacity: number }[] = [];
    const goldStreams: GoldStream[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    for (let i = 0; i < 250; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    // Create gold particles (more of them)
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.7 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Create gold streaming lines
    for (let i = 0; i < 12; i++) {
      goldStreams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.15 + 0.05,
        width: Math.random() * 1.5 + 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars with twinkle
      for (const star of stars) {
        const twinkle = 0.5 + Math.sin(Date.now() * 0.001 + star.x * 0.1) * 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 210, ${star.opacity * twinkle})`;
        ctx.fill();
      }

      // Draw gold streaming lines
      for (const s of goldStreams) {
        s.y -= s.speed;
        s.x += Math.sin(Date.now() * 0.001 + s.x * 0.01) * 0.3;
        if (s.y + s.length < 0) {
          s.y = canvas.height;
          s.x = Math.random() * canvas.width;
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length);
        grad.addColorStop(0, `rgba(212, 168, 83, ${s.opacity})`);
        grad.addColorStop(0.5, `rgba(212, 168, 83, ${s.opacity * 0.5})`);
        grad.addColorStop(1, 'rgba(212, 168, 83, 0)');

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.stroke();
      }

      // Draw gold particles with glow
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        const currentOpacity = p.opacity * (0.5 + Math.sin(p.pulse) * 0.5);

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        gradient.addColorStop(0, `rgba(212, 168, 83, ${currentOpacity})`);
        gradient.addColorStop(0.4, `rgba(212, 168, 83, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(212, 168, 83, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 195, 110, ${currentOpacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default StarryBackground;
