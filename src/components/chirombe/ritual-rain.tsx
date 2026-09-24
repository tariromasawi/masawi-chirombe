import { useEffect, useRef } from "react";
import { RITUAL_SYMBOLS } from "@/lib/chirombe/symbols";

const FONT =
  '"Noto Sans Egyptian Hieroglyphs","Noto Sans Ethiopic","Noto Serif Hebrew","Noto Sans Coptic","Noto Sans Runic","Noto Sans Symbols 2",serif';

export function RitualRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let columns: { y: number; speed: number; glyph: number }[] = [];
    const born = performance.now();

    const fit = () => {
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      if (nextW === width && nextH === height && columns.length) return;
      width = nextW;
      height = nextH;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(16, Math.min(56, Math.floor(width / 22)));
      columns = Array.from({ length: count }, (_, index) => ({
        y: Math.random() * height,
        speed: 28 + (index % 7) * 9,
        glyph: (index * 53) % RITUAL_SYMBOLS.length,
      }));
    };

    const draw = (now: number) => {
      fit();
      const burst = !reduce && now - born < 1600;
      ctx.fillStyle = "rgba(3, 5, 10, 0.28)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `18px ${FONT}`;
      ctx.textAlign = "center";
      const step = Math.max(1, (now - born) / 16);

      if (burst) {
        const spread = ((now - born) / 1600) * Math.max(width, height) * 0.55;
        RITUAL_SYMBOLS.slice(0, 180).forEach((glyph, index) => {
          const angle = (index / 180) * Math.PI * 2;
          ctx.globalAlpha = 0.35 + (index % 5) * 0.08;
          ctx.fillStyle = index % 2 === 0 ? "#e4b15a" : "#5de8ff";
          ctx.fillText(glyph, width / 2 + Math.cos(angle) * spread, height / 2 + Math.sin(angle) * spread * 0.72);
        });
        ctx.globalAlpha = 1;
      }

      columns.forEach((column, index) => {
        const x = ((index + 0.5) * width) / columns.length;
        if (!reduce) column.y += column.speed * 0.016 * (burst ? 0.35 : 1);
        if (column.y > height + 20) {
          column.y = -20;
          column.glyph = (column.glyph + 17 + Math.floor(step)) % RITUAL_SYMBOLS.length;
        }
        for (let trail = 0; trail < 18; trail += 1) {
          const glyph = RITUAL_SYMBOLS[(column.glyph + trail * 13) % RITUAL_SYMBOLS.length];
          const y = column.y - trail * 22;
          ctx.globalAlpha = trail === 0 ? 0.9 : Math.max(0.05, 0.45 - trail * 0.025);
          ctx.fillStyle = trail === 0 ? "#f4e2b0" : index % 3 === 0 ? "#5de8ff" : "#e4b15a";
          ctx.fillText(glyph, x, y);
        }
      });
      ctx.globalAlpha = 1;
      if (!reduce) raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />;
}
