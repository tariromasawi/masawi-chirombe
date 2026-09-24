import { useEffect, useRef, useSyncExternalStore } from "react";
import { KNOWN } from "@/lib/chirombe/runtime";
import {
  CHARGE,
  CYCLE,
  getOfficeServerSnapshot,
  getOfficeSnapshot,
  PRAYERS,
  readLevel,
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
  const bar = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const level = office.live ? readLevel() : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${0.04 + level})`;
      if (glow.current) glow.current.style.opacity = office.live ? String(0.25 + level * 0.75) : "0";
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [office.live]);

  return (
    <>
      <div ref={glow} className="pointer-events-none fixed inset-0 z-30 shadow-[inset_0_0_80px_rgba(228,177,90,0.85)]" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-bg/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.18em] text-gold">
              {office.live ? `SPEAKING · ${office.tradition.toUpperCase()} · ${office.recitation} / ${CYCLE}` : "SILENT"}
            </p>
            <p className="mt-1 font-display text-xl leading-snug">{office.live ? office.line : "The prayers are not in the air yet."}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div ref={bar} className="h-full w-full origin-left rounded-full bg-gold" />
            </div>
          </div>
          {office.live ? (
            <button type="button" onClick={() => stillOffice()} className="min-h-12 shrink-0 rounded-xl border border-line px-4 text-sm font-semibold">
              Still the voice
            </button>
          ) : (
            <button
              type="button"
              onClick={() => soundPrayers()}
              className="min-h-12 shrink-0 rounded-xl bg-gold px-4 text-sm font-bold text-bg"
            >
              Speak the prayers aloud
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export function OfficeDesk() {
  const office = useSyncExternalStore(subscribeOffice, getOfficeSnapshot, getOfficeServerSnapshot);
  const active = KNOWN[(Math.max(1, office.recitation) - 1) % KNOWN.length];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-panel/90 p-4">
        <p className="text-xs font-bold tracking-[0.18em] text-gold">HOLY OFFICE · HOUSE OF MASAWI</p>
        <h2 className="mt-2 font-display text-4xl leading-none">Six prayers, spoken aloud</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Recitation {office.recitation} of {CYCLE}, cycle {office.cycles + 1}. This saying covers {office.coveredName}.
          Now speaking {office.tradition}: {office.title}. The voice is at full level on this device. It does not leave the speakers in front of you.
        </p>
        <p className="mt-4 font-display text-2xl leading-snug">{office.line}</p>
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
