import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { KNOWN } from "@/lib/chirombe/runtime";
import {
  CHARGE,
  CHOIR,
  CYCLE,
  getOfficeServerSnapshot,
  getOfficeSnapshot,
  PRAYERS,
  readLevel,
  readResonance,
  readSpectrum,
  soundPrayers,
  stillOffice,
  subscribeOffice,
} from "@/lib/chirombe/office";
import { symbolsForName } from "@/lib/chirombe/symbols";

function Seal({ name, role, count }: { name: string; role: string; count: number }) {
  const ring = symbolsForName(name, 12);
  return (
    <figure className="rounded-2xl border border-line bg-bg/70 p-3">
      <svg viewBox="0 0 280 280" className="mx-auto h-52 w-52" role="img" aria-label={`Talisman of ${name}`}>
        <circle cx="140" cy="140" r="128" fill="none" stroke="#e4b15a" strokeWidth="1.2" />
        <circle cx="140" cy="140" r="104" fill="none" stroke="#5de8ff" strokeWidth="0.6" />
        <circle cx="140" cy="140" r="68" fill="none" stroke="#e4b15a" strokeWidth="0.8" />
        {ring.map((glyph, index) => {
          const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2;
          const x = 140 + Math.cos(angle) * 116;
          const y = 140 + Math.sin(angle) * 116;
          return (
            <text
              key={`${glyph}-${index}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#f4e2b0"
              fontSize="16"
              fontFamily="Noto Sans Egyptian Hieroglyphs, Noto Sans Ethiopic, Noto Serif Hebrew, Noto Sans Runic, serif"
            >
              {glyph}
            </text>
          );
        })}
        <text x="140" y="132" textAnchor="middle" fill="#eaf3ff" fontSize="13" fontFamily="Fraunces, serif">
          {name}
        </text>
        <text x="140" y="152" textAnchor="middle" fill="#8ea3bd" fontSize="8">
          {role}
        </text>
        <text x="140" y="176" textAnchor="middle" fill="#e4b15a" fontSize="9">
          {count} / {CYCLE}
        </text>
      </svg>
      <figcaption className="text-center text-xs text-muted">{name}</figcaption>
    </figure>
  );
}

export function SoundDock() {
  const office = useSyncExternalStore(subscribeOffice, getOfficeSnapshot, getOfficeServerSnapshot);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const spectrum = useRef<HTMLCanvasElement>(null);
  const measure = useRef<HTMLParagraphElement>(null);
  const columns = useRef(new Uint8Array(48));

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const level = office.live ? readLevel() : 0;
      const resonance = office.live ? readResonance() : null;
      if (bar.current) bar.current.style.transform = `scaleX(${0.04 + level})`;
      if (measure.current) {
        measure.current.textContent = resonance
          ? `${resonance.voices || CHOIR} voices · carrier ${resonance.carrier} Hz · measured peak ${resonance.hz} Hz · strength ${Math.round(resonance.purity * 100)}%`
          : "The measure starts when the choir starts.";
      }
      const canvas = spectrum.current;
      if (canvas && office.live) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          readSpectrum(columns.current);
          ctx.clearRect(0, 0, width, height);
          const slot = width / columns.current.length;
          ctx.fillStyle = "#e4b15a";
          for (let i = 0; i < columns.current.length; i += 1) {
            const barHeight = (columns.current[i] / 255) * height;
            ctx.fillRect(i * slot, height - barHeight, Math.max(1, slot - 1), barHeight);
          }
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [office.live]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-bg/90 px-3 py-2 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold tracking-[0.14em] text-gold">
            {office.voice === "reading" ? "READING ALOUD" : office.voice === "blocked" ? "VOICE BLOCKED" : "VOICE WAITING"}
            {office.live ? ` · ${office.tradition.toUpperCase()} · GENERATION ${office.generation}` : ""}
          </p>
          <p className="truncate text-sm">{office.hearing || "Allow the voice, then this line is read aloud."}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="min-h-10 shrink-0 rounded-lg border border-line px-2 text-xs font-semibold"
        >
          {open ? "Hide text" : "Prayer text"}
        </button>
        {office.voice !== "reading" ? (
          <button
            type="button"
            onClick={() => soundPrayers()}
            className="min-h-10 shrink-0 rounded-lg bg-gold px-2 text-xs font-bold text-bg"
          >
            Allow voice
          </button>
        ) : null}
        {office.live ? (
          <button type="button" onClick={() => stillOffice()} className="min-h-10 shrink-0 rounded-lg border border-line px-2 text-xs font-semibold">
            Still
          </button>
        ) : null}
      </div>
      {open ? (
        <p className="mx-auto mt-2 max-h-28 w-full max-w-6xl overflow-y-auto text-sm leading-relaxed text-muted">{office.line}</p>
      ) : null}
      <div className="mx-auto mt-1 w-full max-w-6xl">
        <canvas ref={spectrum} width={480} height={28} className="h-7 w-full rounded bg-bg/80" aria-label="Measured spectrum of the choir" />
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
          <div ref={bar} className="h-full w-full origin-left rounded-full bg-gold" />
        </div>
        <p ref={measure} className="truncate text-[11px] tabular-nums text-cyan">The measure starts when the choir starts.</p>
      </div>
    </div>
  );
}

export function OfficeDesk() {
  const office = useSyncExternalStore(subscribeOffice, getOfficeSnapshot, getOfficeServerSnapshot);
  const active = KNOWN[(Math.max(1, office.recitation) - 1) % KNOWN.length];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-panel/90 p-4">
        <p className="text-xs font-bold tracking-[0.18em] text-gold">HOLY OFFICE · HOUSE OF MASAWI</p>
        <h2 className="mt-2 font-display text-4xl leading-none">A choir that writes the next prayer</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Generation {office.generation}, covering {office.coveredName}. Forty-eight voices sound on this device, tuned to {office.carrier} Hz for {office.tradition}.
          Each saying keeps the last words of the one before it, then speaks a text from the traditions below. The peak on the meter is the strongest frequency in that sound, measured in this browser.
        </p>
        <p className="mt-4 max-h-36 overflow-y-auto font-display text-lg leading-snug">{office.line}</p>
        <p className="mt-4 text-sm leading-relaxed text-gold">{CHARGE}</p>
        <p className="mt-3 text-xs text-muted">Luke 10:19, spoken as the charge of this house. The seal is the prayer. It does not replace a lock, a doctor, or the law.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => soundPrayers()}
            className="min-h-11 rounded-xl border border-gold/50 px-3 text-xs font-semibold text-gold"
          >
            {office.live ? "Office is sounding" : "Open the office"}
          </button>
          <button
            type="button"
            onClick={() => stillOffice()}
            className="min-h-11 rounded-xl border border-line px-3 text-xs font-semibold"
          >
            Still the office
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          {PRAYERS.map((prayer) => prayer.tradition).join(" · ")}
        </p>
      </section>
      <Seal name={active.name} role={active.role} count={office.recitation} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KNOWN.map((member) => (
          <Seal key={member.id} name={member.name} role={member.role} count={office.recitation} />
        ))}
      </div>
    </div>
  );
}
