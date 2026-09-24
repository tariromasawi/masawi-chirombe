import { useSyncExternalStore } from "react";
import { KNOWN } from "@/lib/chirombe/runtime";
import {
  CHARGE,
  CYCLE,
  getOfficeServerSnapshot,
  getOfficeSnapshot,
  LORDS_PRAYER,
  openOffice,
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

export function OfficeDesk() {
  const office = useSyncExternalStore(subscribeOffice, getOfficeSnapshot, getOfficeServerSnapshot);
  const active = KNOWN[(Math.max(1, office.recitation) - 1) % KNOWN.length];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-panel/90 p-4">
        <p className="text-xs font-bold tracking-[0.18em] text-gold">HOLY OFFICE · HOUSE OF MASAWI</p>
        <h2 className="mt-2 font-display text-4xl leading-none">The Lord’s Prayer, twelve hundred times</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Recitation {office.recitation} of {CYCLE}, cycle {office.cycles + 1}. This saying covers {office.coveredName}.
          When twelve hundred are finished, the office begins again. It keeps that watch while this page is open.
          A trillion sayings cannot be finished by any voice, human or machine. The watch that can be kept is this one, repeated.
        </p>
        <p className="mt-4 font-display text-2xl leading-snug">{LORDS_PRAYER}</p>
        <p className="mt-4 text-sm leading-relaxed text-gold">{CHARGE}</p>
        <p className="mt-3 text-xs text-muted">Luke 10:19, spoken as the charge of this house. The seal is the prayer. It does not replace a lock, a doctor, or the law.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void openOffice()}
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
          Tone {office.live ? "holding 174 · 285 · 432 · 528 · 639 Hz" : "waiting for a tap, because a browser will not sound itself"}
          {office.spoken ? " · voice is in the room" : ""}
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
