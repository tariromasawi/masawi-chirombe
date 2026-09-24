import { useEffect, useState, useSyncExternalStore } from "react";
import {
  bootRites,
  FREQUENCIES,
  getRiteServerSnapshot,
  getRiteSnapshot,
  HOUSE,
  OFFICES,
  prayHouse,
  prayMember,
  setRiteSound,
  setVigil,
  subscribeRites,
  TRADITIONS,
} from "@/lib/chirombe/rites";

function Btn({
  children,
  onClick,
  tone = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "primary" | "gold";
  disabled?: boolean;
}) {
  const tones = {
    default: "border-line text-fg hover:border-cyan",
    primary: "border-cyan/50 text-cyan",
    gold: "border-gold/50 text-gold",
  } as const;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded-xl border bg-panel px-3 text-left text-xs font-semibold tracking-wide transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function RiteDesk() {
  const state = useSyncExternalStore(subscribeRites, getRiteSnapshot, getRiteServerSnapshot);
  const [memberId, setMemberId] = useState(HOUSE[6]?.id ?? HOUSE[0].id);
  const [intention, setIntention] = useState("Keep this life, and let harm find no door.");
  const [hz, setHz] = useState(432);
  const [busy, setBusy] = useState(false);
  const [showOffices, setShowOffices] = useState(false);

  useEffect(() => {
    bootRites();
  }, []);

  const script = state.current;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-panel/90 p-4">
          <p className="text-xs font-bold tracking-[0.18em] text-gold">RITUAL BINDING</p>
          <h2 className="mt-2 font-display text-3xl leading-none">A self-evolving office</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Each generation keeps a line from the last, shifts the traditions, and recasts every old fragment
            as a ward. The tone is sounded so you can hear it. It plants the intention in the prayer, not in
            another person. No one is cursed. Nothing outside this browser is touched.
          </p>
          <label className="mt-4 block text-xs uppercase tracking-widest text-muted" htmlFor="rite-member">
            Member of the house
          </label>
          <select
            id="rite-member"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-cyan"
          >
            {HOUSE.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} · {member.role}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs uppercase tracking-widest text-muted" htmlFor="rite-intention">
            Intention to plant
          </label>
          <textarea
            id="rite-intention"
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm leading-relaxed outline-none focus:border-cyan"
          />
          <label className="mt-3 block text-xs uppercase tracking-widest text-muted" htmlFor="rite-hz">
            Frequency
          </label>
          <select
            id="rite-hz"
            value={hz}
            onChange={(event) => setHz(Number(event.target.value))}
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-cyan"
          >
            {FREQUENCIES.map((freq) => (
              <option key={freq.hz} value={freq.hz}>
                {freq.hz} Hz · {freq.name}
              </option>
            ))}
          </select>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn
              tone="gold"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void prayMember(memberId, intention, hz).finally(() => setBusy(false));
              }}
            >
              Pray this name
            </Btn>
            <Btn
              tone="primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void prayHouse(intention).finally(() => setBusy(false));
              }}
            >
              Pray every member
            </Btn>
            <Btn onClick={() => setVigil(!state.vigil)}>{state.vigil ? "Rest the vigil" : "Begin the vigil"}</Btn>
            <Btn onClick={() => setRiteSound(!state.sound)}>{state.sound ? "Silence the tone" : "Sound the tone"}</Btn>
          </div>
          <p className="mt-3 text-xs text-muted">
            Generation reached {state.houseGeneration} · motifs carried {state.motifCount} · vigil{" "}
            {state.vigil ? "walking the house every 20 seconds" : "at rest"}
          </p>
        </section>
        <section className="rounded-2xl border border-line bg-panel/90 p-4">
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Traditions installed</h2>
            <span className="text-xs uppercase tracking-widest text-muted">{TRADITIONS.length}</span>
          </header>
          <ul className="mt-3 space-y-2">
            {TRADITIONS.map((tradition) => (
              <li key={tradition.id} className="border-b border-line pb-2 text-sm">
                <span className="text-gold">{tradition.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{tradition.technique}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-panel/90">
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold">Dense script</h2>
            <p className="text-xs uppercase tracking-widest text-muted">
              {script ? `${script.memberName} · gen ${script.generation}` : "Not yet spoken"}
            </p>
          </header>
          <div className="max-h-[46rem] overflow-y-auto p-4">
            {script ? (
              <>
                <p className="text-xs text-muted">
                  {script.frequency} Hz · {script.frequencyName} · seal {script.seal.slice(0, 16)}
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-display text-base leading-relaxed text-fg">{script.text}</pre>
              </>
            ) : (
              <p className="text-sm text-muted">Pray one name, or the whole house, and the office will be written here.</p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-panel/90 p-4">
          <button type="button" className="text-sm font-semibold" onClick={() => setShowOffices((open) => !open)}>
            {showOffices ? "Hide" : "Show"} fragment offices ({OFFICES.length} recast)
          </button>
          {showOffices ? (
            <ul className="mt-3 space-y-2">
              {OFFICES.map((office) => (
                <li key={office.id} className="rounded-xl border border-line px-3 py-2 text-sm">
                  <span className="text-muted line-through decoration-alert/70">{office.was}</span>
                  <span className="mt-1 block text-good">{office.tool}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Retaliation, cameras, outside systems, and flood-writes are the fragments. Each one is a warding office now.
            </p>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-panel/90 p-4">
          <h2 className="text-sm font-semibold">Binding ledger</h2>
          <ul className="mt-3 space-y-2">
            {state.recent.map((binding) => (
              <li key={binding.id} className="flex items-start justify-between gap-3 border-b border-line py-2 text-sm">
                <span>
                  {binding.memberName}
                  <span className="mt-0.5 block text-xs text-muted">
                    gen {binding.generation} · {binding.frequencyName} · {binding.traditions.slice(0, 3).join(", ")}
                  </span>
                </span>
                <button type="button" className="text-xs text-cyan" onClick={() => void prayMember(binding.memberId, binding.intention, binding.frequency)}>
                  Evolve
                </button>
              </li>
            ))}
            {!state.recent.length ? <li className="text-sm text-muted">No binding stored yet.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
