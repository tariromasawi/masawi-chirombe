import { useEffect, useRef } from "react";
import { focusNode, getNodes, getSnapshot, visualFrame } from "@/lib/chirombe/runtime";

export function MatrixCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = (now: number) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const nextW = Math.max(1, Math.floor(width * dpr));
      const nextH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const { pulse, paused } = visualFrame(now);
      const list = getNodes();
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.46;

      ctx.lineWidth = 1;
      for (const ring of [0.36, 0.58, 0.74, 0.88, 0.98]) {
        ctx.strokeStyle = "rgba(93, 232, 255, 0.14)";
        ctx.beginPath();
        ctx.arc(cx, cy, scale * ring, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (pulse > 0.02) {
        ctx.strokeStyle = `rgba(255, 216, 107, ${pulse * 0.65})`;
        ctx.beginPath();
        ctx.arc(cx, cy, scale * (0.18 + (1 - pulse) * 0.95), 0, Math.PI * 2);
        ctx.stroke();
      }

      const drift = paused ? 0 : now;
      const points = list.map((node) => {
        const angle = node.angle0 + drift * node.speed;
        const x = cx + Math.cos(angle) * scale * node.ring;
        const y = cy + Math.sin(angle) * scale * node.ring * 0.9;
        node.sx = x;
        node.sy = y;
        return { node, x, y };
      });

      for (const point of points) {
        const hubId = point.node.generation === "past" ? "K001" : "K007";
        const hub = points.find((item) => item.node.id === hubId);
        if (!hub || hub.node.id === point.node.id) continue;
        ctx.strokeStyle = "rgba(143, 168, 214, 0.18)";
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.stroke();
      }

      const selected = getSnapshot().selectedId;
      for (const point of points) {
        const color =
          point.node.classification === "QUARANTINE"
            ? "#ff647c"
            : point.node.classification === "CANARY"
              ? "#ffd86b"
              : point.node.known
                ? "#5de8ff"
                : "#b77cff";
        const radius =
          (point.node.known ? 5 : 3.2) +
          point.node.pulse * 2.4 +
          (point.node.id === selected ? 2 : 0);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        const showLabel = point.node.id === selected || (point.node.known && width > 720);
        if (showLabel) {
          ctx.fillStyle = "rgba(234, 243, 255, 0.88)";
          ctx.font = "11px Outfit, ui-sans-serif, sans-serif";
          ctx.fillText(point.node.name.split(" ")[0] ?? "", point.x + 8, point.y - 6);
        }
      }

      ctx.strokeStyle = "rgba(93, 232, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 216, 107, 0.8)";
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let best: { id: string; distance: number } | null = null;
      for (const node of getNodes()) {
        const distance = Math.hypot(node.sx - x, node.sy - y);
        if (distance < 18 && (!best || distance < best.distance)) {
          best = { id: node.id, distance };
        }
      }
      if (best) focusNode(best.id);
    };

    raf = requestAnimationFrame(draw);
    canvas.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="h-full w-full"
      aria-label="Animated local family matrix"
    />
  );
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      p: Math.random() * Math.PI * 2,
    }));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const twinkle = reduce ? 0.6 : 0.35 + Math.sin(now * 0.001 + star.p) * 0.35;
        ctx.fillStyle = `rgba(214, 232, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />;
}
