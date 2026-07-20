import React, { useEffect, useRef } from "react";

// Token warna yang diambil dari CSS variable Chakra yang sudah ada
// (brand.*/accent.*) — jadi warna titik-titik otomatis ikut tema project,
// tanpa hex baru yang di-hardcode.
const COLOR_TOKENS = [
  "--chakra-colors-brand-300",
  "--chakra-colors-brand-400",
  "--chakra-colors-brand-500",
  "--chakra-colors-brand-600",
  "--chakra-colors-accent-300",
  "--chakra-colors-accent-400",
  "--chakra-colors-accent-500",
];

// Fallback jika CSS variable belum ter-resolve (mis. saat SSR/first paint)
const FALLBACK_COLORS = [
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
];

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
}

interface ParticleFieldProps {
  /** Jarak antar titik (px) — makin kecil makin padat */
  spacing?: number;
  /** Radius pengaruh mouse (px) */
  mouseRadius?: number;
  /** Kekuatan dorongan menjauh dari mouse */
  strength?: number;
  className?: string;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  spacing = 46,
  mouseRadius = 110,
  strength = 26,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = 0;

    // Ambil warna asli dari tema (CSS variable Chakra) di runtime
    const resolveColors = (): string[] => {
      const styles = getComputedStyle(document.documentElement);
      const colors = COLOR_TOKENS.map((token) =>
        styles.getPropertyValue(token).trim(),
      ).filter(Boolean);
      return colors.length > 0 ? colors : FALLBACK_COLORS;
    };

    const buildParticles = (colors: string[]) => {
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const next: Particle[] = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const jitterX = (Math.random() - 0.5) * spacing * 0.7;
          const jitterY = (Math.random() - 0.5) * spacing * 0.7;
          const x = i * spacing + jitterX;
          const y = j * spacing + jitterY;
          next.push({
            baseX: x,
            baseY: y,
            x,
            y,
            r: 1 + Math.random() * 1.8,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.35 + Math.random() * 0.45,
          });
        }
      }
      particles = next;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(resolveColors());
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.baseX, p.baseY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * (strength * 0.08);
          p.y += Math.sin(angle) * force * (strength * 0.08);
        }

        // Kembali perlahan ke posisi asal (efek pegas)
        p.x += (p.baseX - p.x) * 0.06;
        p.y += (p.baseY - p.y) * 0.06;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouse = { x: -9999, y: -9999 };
    };

    resize();

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
      rafId = requestAnimationFrame(animate);
    }
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [spacing, mouseRadius, strength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
