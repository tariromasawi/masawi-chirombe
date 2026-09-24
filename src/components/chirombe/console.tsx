import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Activity,
  BookOpen,
  Cross,
  Cpu,
  Download,
  Flame,
  Fingerprint,
  Network,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ScrollText,
  Shield,
  Users,
  Volume2,
  Waypoints,
} from "lucide-react";
import { DOSSIERS } from "@/lib/chirombe/dossiers";
import {
  advanceLiturgy,
  applyStrategy,
  boot,
  boundaryTest,
  cleanseLocal,
  compileIntent,
  createCanary,
  createDecoy,
  defensiveMirror,
  entangle,
  exportDocument,
  focusNode,
  getServerSnapshot,
  getSnapshot,
  integrityCheck,
  mintSeed,
  privacyTest,
  pulseMatrix,
  quarantineTest,
  receive,
  recoverProtection,
  replayTest,
  resetSystem,
  runCycle,
  searchLattice,
  setArmed,
  setInterpretive,
  setPaused,
  subscribe,
  summonNode,
  type Snapshot,
} from "@/lib/chirombe/runtime";
import { MatrixCanvas, Starfield } from "@/components/chirombe/matrix-canvas";
import { RiteDesk } from "@/components/chirombe/rite-desk";
import { OfficeDesk, SoundDock } from "@/components/chirombe/office-desk";
import { RitualRain } from "@/components/chirombe/ritual-rain";
import { bootOffice, getOfficeServerSnapshot, getOfficeSnapshot, soundPrayers, stillOffice, subscribeOffice } from "@/lib/chirombe/office";

type View =
  | "command"
  | "matrix"
  | "house"
  | "orchestrator"
  | "pioneer"
  | "lattice"
  | "liturgy"
  | "rite"
  | "office"
  | "audit";

const NAV: { id: View; label: string; icon: typeof Shield }[] = [
  { id: "command", label: "Command", icon: Shield },
  { id: "matrix", label: "Matrix", icon: Network },
  { id: "house", label: "House", icon: Users },
  { id: "orchestrator", label: "Orchestrator", icon: Cpu },
  { id: "pioneer", label: "Pioneer", icon: Waypoints },
  { id: "lattice", label: "Lattice", icon: Fingerprint },
  { id: "liturgy", label: "Liturgy", icon: BookOpen },
  { id: "rite", label: "Rite", icon: Flame },
  { id: "office", label: "Office", icon: Cross },
  { id: "audit", label: "Audit", icon: ScrollText },
];

function Btn({
  children,
  onClick,
  tone = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "primary" | "danger" | "good" | "gold";
  disabled?: boolean;
}) {
  const tones = {
    default: "border-line text-fg hover:border-cyan",
    primary: "border-cyan/50 text-cyan",
    danger: "border-alert/50 text-alert",
    good: "border-good/50 text-good",
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

function Card({
  title,
  meta,
  children,
  className = "",
}: {
  title?: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-panel/90 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ${className}`}>
      {title ? (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
          {meta ? <p className="text-xs uppercase tracking-widest text-muted">{meta}</p> : null}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line px-3 py-2">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums text-fg">{value}</p>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{value}%</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function incidentTone(incident: Snapshot["incident"]): string {
  if (incident === "NORMAL") return "border-good/40 text-good";
  if (incident === "WATCH") return "border-gold/50 text-gold";
  if (incident === "CONTAINED") return "border-cyan/50 text-cyan";
  return "border-alert/50 text-alert";
}

export function Console() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [view, setView] = useState<View>("command");
  const [intake, setIntake] = useState('{"type":"PING","nonce":"house-1","body":"hello"}');
  const [filter, setFilter] = useState<"ALL" | "KNOWN_LINEAGE" | "SYNTHETIC_BRANCH" | "CANARY" | "QUARANTINE">("ALL");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportText, setExportText] = useState("");
  const [latticeKey, setLatticeKey] = useState("house-seal");
  const [latticeValue, setLatticeValue] = useState("Chirombe local record");
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState("Keep the boundary local and inert");
  const [meshIntent, setMeshIntent] = useState("Family matrix observer");
  const [passphrase, setPassphrase] = useState("");
  const [linkNote, setLinkNote] = useState("");

  const office = useSyncExternalStore(subscribeOffice, getOfficeSnapshot, getOfficeServerSnapshot);

  useEffect(() => {
    void boot();
    bootOffice();
  }, []);

  const roster = useMemo(() => {
    return snap.roster.filter((row) => (filter === "ALL" ? true : row.classification === filter));
  }, [snap.roster, filter]);

  const found = useMemo(() => searchLattice(query), [query, snap.lattice]);

  const openExport = () => {
    setExportText(exportDocument());
    setExportOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80">
        <RitualRain />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <Starfield />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.55)_100%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-full border border-cyan/60">
                <span className="absolute inset-1.5 rotate-45 rounded-full border border-gold/50" />
                <Shield className="relative h-4 w-4 text-cyan" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.18em]">CHIROMBE CELESTIAL PROTECTION</p>
                <p className="text-xs tracking-widest text-muted">HOUSE OF MASAWI · {office.live ? `OFFICE ${office.recitation}/1200` : "OFFICE WAITING"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn tone={snap.armed ? "good" : "primary"} onClick={() => setArmed(!snap.armed)} disabled={!snap.ready}>
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                  {snap.armed ? "ARMED" : "ARM"}
                </span>
              </Btn>
              <Btn onClick={() => setPaused(!snap.paused)} disabled={!snap.ready}>
                <span className="inline-flex items-center gap-1.5">
                  {snap.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  {snap.paused ? "RESUME" : "PAUSE"}
                </span>
              </Btn>
              <Btn tone="gold" onClick={() => (office.live ? stillOffice() : soundPrayers())}>
                <span className="inline-flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {office.live ? "STILL" : "OFFICE"}
                </span>
              </Btn>
              <Btn onClick={openExport} disabled={!snap.ready}>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  EXPORT
                </span>
              </Btn>
              <Btn
                tone="danger"
                disabled={!snap.ready}
                onClick={() => {
                  if (window.confirm("Reset the local CHIROMBE simulation?")) void resetSystem();
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  RESET
                </span>
              </Btn>
            </div>
          </div>
          <nav className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-3" aria-label="Sections">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold tracking-wide ${
                    active ? "border-cyan text-cyan" : "border-line text-muted"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28">
          {!snap.ready ? (
            <p className="text-sm text-muted">Linking local subsystems…</p>
          ) : null}

          {view === "command" ? (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-4">
                <Card>
                  <p className="text-xs font-bold tracking-[0.2em] text-cyan">HOUSE OF MASAWI · CHIROMBE SYSTEM</p>
                  <h1 className="mt-2 font-display text-4xl leading-none tracking-tight sm:text-6xl">
                    Celestial
                    <br />
                    Protection
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                    Protection is on for this browser. Intake is checked for size, replay, secrets, and
                    executable patterns, then sealed as a digest. Known family nodes stay locked. Nothing
                    is executed and nothing is sent outward.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {["PROTECTION ON", "ZERO-TRUST INPUT", "OFFLINE-FIRST", "77-99-33"].map((badge) => (
                      <span
                        key={badge}
                        className={`rounded-full border px-2 py-1 ${badge === "PROTECTION ON" && snap.armed ? "border-good/40 text-good" : "border-line text-muted"}`}
                      >
                        {badge === "PROTECTION ON" && !snap.armed ? "PROTECTION STANDBY" : badge}
                      </span>
                    ))}
                    <span className={`rounded-full border px-2 py-1 ${incidentTone(snap.incident)}`}>{snap.incident}</span>
                  </div>
                </Card>
                <Card title="Celestial family matrix" meta="Live local simulation">
                  <div className="relative h-canvas overflow-hidden rounded-xl border border-line bg-bg lg:h-canvas-lg">
                    <MatrixCanvas />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                    <span className="text-cyan">Known lineage</span>
                    <span className="text-violet">Synthetic branch</span>
                    <span className="text-gold">Canary</span>
                    <span className="text-alert">Quarantine</span>
                  </div>
                  {snap.selected ? (
                    <p className="mt-2 text-sm">
                      {snap.selected.name} · {snap.selected.role} · {snap.selected.classification}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">Select a node on the matrix.</p>
                  )}
                </Card>
              </div>
              <div className="space-y-4">
                <Card title="Boundary state" meta={snap.incident}>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat label="Nodes" value={snap.nodeCount} />
                    <Stat label="Events" value={snap.eventCount} />
                    <Stat label="Quarantine" value={snap.quarantine} />
                    <Stat label="Integrity" value={`${snap.integrity}%`} />
                  </div>
                  <Meter label="Boundary confidence" value={snap.boundary} />
                  <Meter label="Matrix coherence" value={snap.coherence} />
                  <p className="mt-3 break-all text-xs text-muted">
                    House digest · {snap.algo}
                    <br />
                    {snap.houseDigest}
                  </p>
                </Card>
                <Card title="Protection offering" meta={snap.armed ? "HOLDING" : "STANDBY"}>
                  <ul className="space-y-2">
                    {snap.shields.map((shield) => (
                      <li key={shield.id} className="flex items-start justify-between gap-3 rounded-xl border border-line px-3 py-2">
                        <span>
                          <span className="block text-sm">{shield.name}</span>
                          <span className="block text-xs text-muted">{shield.detail}</span>
                        </span>
                        <span className={shield.state === "HOLDING" ? "text-xs text-good" : "text-xs text-gold"}>{shield.state}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Btn tone="good" onClick={() => void recoverProtection()}>Recover boundary</Btn>
                  </div>
                </Card>
                <Card title="Command nexus" meta="ZCCA">
                  <div className="grid grid-cols-2 gap-2">
                    <Btn tone="primary" onClick={() => void pulseMatrix()}>Pulse matrix</Btn>
                    <Btn onClick={() => void defensiveMirror()}>Defensive mirror</Btn>
                    <Btn tone="good" onClick={() => void boundaryTest()}>Test boundary</Btn>
                    <Btn tone="gold" onClick={() => void createCanary()}>Create canary</Btn>
                    <Btn onClick={() => void createDecoy()}>Create decoy</Btn>
                    <Btn tone="danger" onClick={() => void quarantineTest()}>Quarantine test</Btn>
                    <Btn onClick={() => void integrityCheck()}>Integrity check</Btn>
                    <Btn onClick={() => void privacyTest()}>Privacy test</Btn>
                    <Btn onClick={() => void replayTest()}>Replay test</Btn>
                    <Btn tone="primary" onClick={() => void runCycle()}>Run SQIE cycle</Btn>
                  </div>
                </Card>
                <Card title="Untrusted intake" meta="Never executed">
                  <textarea
                    value={intake}
                    onChange={(event) => setIntake(event.target.value)}
                    className="min-h-24 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-cyan"
                    aria-label="Untrusted intake"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Btn tone="primary" onClick={() => void receive(intake)}>Receive</Btn>
                    <p className="text-xs text-muted">{snap.lastReceive}</p>
                  </div>
                </Card>
                <Card title="Defensive event feed" meta="Local only">
                  <div className="max-h-72 space-y-2 overflow-auto" aria-live="polite">
                    {snap.feed.length === 0 ? <p className="text-sm text-muted">Boundary quiet.</p> : null}
                    {snap.feed.map((item) => (
                      <p key={item.id} className="text-xs leading-relaxed text-muted">
                        <span className="text-cyan">{item.time}</span> {item.type} — {item.message}
                      </p>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {view === "matrix" ? (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card title="Node field" meta={`${snap.knownCount} known · ${snap.syntheticCount} synthetic`}>
                <div className="relative h-canvas overflow-hidden rounded-xl border border-line bg-bg lg:h-canvas-lg">
                  <MatrixCanvas />
                </div>
              </Card>
              <Card title="Family node matrix" meta="Known + synthetic">
                <div className="mb-3 flex flex-wrap gap-2">
                  {(["ALL", "KNOWN_LINEAGE", "SYNTHETIC_BRANCH", "CANARY", "QUARANTINE"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={`min-h-11 rounded-full border px-3 text-xs ${filter === key ? "border-cyan text-cyan" : "border-line text-muted"}`}
                    >
                      {key === "ALL" ? "All" : key.replaceAll("_", " ").toLowerCase()}
                    </button>
                  ))}
                </div>
                <div className="max-h-[32rem] space-y-2 overflow-auto">
                  {roster.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => focusNode(row.id)}
                      className={`flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left ${
                        snap.selectedId === row.id ? "border-cyan" : "border-line"
                      }`}
                    >
                      <span>
                        <span className="block text-sm">{row.name}</span>
                        <span className="block text-xs text-muted">{row.role}</span>
                      </span>
                      <span className="text-xs uppercase tracking-wide text-muted">{row.classification.replaceAll("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {view === "house" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {DOSSIERS.map((dossier) => (
                <article key={dossier.id} className="rounded-2xl border border-line bg-panel p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border font-display text-lg ${
                        dossier.kind === "SYNTHETIC" ? "border-violet text-violet" : "border-cyan text-cyan"
                      }`}
                      aria-hidden="true"
                    >
                      {dossier.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-display text-xl leading-tight">{dossier.name}</h2>
                      <p className="text-sm text-cyan">{dossier.role}</p>
                      <p className="text-xs uppercase tracking-widest text-muted">{dossier.kind} · {dossier.meta}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{dossier.body}</p>
                  <div className="mt-3">
                    <Btn
                      onClick={() => {
                        focusNode(dossier.id);
                        setView("matrix");
                      }}
                    >
                      Show on matrix
                    </Btn>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {view === "orchestrator" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Master autostart" meta={`Cycle ${snap.cycle}`}>
                <p className="text-sm text-muted">
                  Every module the old orchestrator waited for is present. The cycle reads this browser only.
                </p>
                <div className="mt-3 space-y-2">
                  {snap.modules.map((mod) => (
                    <div key={mod.name} className="flex items-start justify-between gap-3 rounded-xl border border-line px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold">{mod.name}</p>
                        <p className="text-xs text-muted">{mod.detail}</p>
                      </div>
                      <span className={mod.state === "ACTIVE" ? "text-xs text-good" : mod.state === "ERROR" ? "text-xs text-alert" : "text-xs text-gold"}>
                        {mod.state}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Btn tone="primary" onClick={() => void runCycle()}>Run a full cycle</Btn>
                </div>
              </Card>
              <div className="space-y-4">
                <Card title="SQIE rail" meta="Sense to feedback">
                  <ol className="space-y-2">
                    {snap.stages.map((stage) => (
                      <li key={stage.name} className="rounded-xl border border-line px-3 py-2">
                        <p className="text-xs font-bold tracking-widest text-cyan">{stage.name}</p>
                        <p className="text-sm text-muted">{stage.detail}</p>
                      </li>
                    ))}
                  </ol>
                </Card>
                <Card title="Link repairs" meta={`${snap.repairs.length} corrected`}>
                  <div className="max-h-80 space-y-3 overflow-auto">
                    {snap.repairs.map((repair) => (
                      <div key={repair.id}>
                        <p className="text-sm font-semibold">{repair.id} · {repair.title}</p>
                        <p className="text-xs leading-relaxed text-muted">{repair.detail}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {view === "pioneer" ? (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <Card title="Narrative" meta="19 functions">
                <p className="text-sm leading-relaxed">{snap.narrative}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Stat label="Recoveries" value={snap.recoveries} />
                  <Stat label="Errors" value={snap.errors} />
                </div>
                <div className="mt-4">
                  <Btn tone="primary" onClick={() => void runCycle()}>Cycle the brain</Btn>
                </div>
                <h3 className="mt-5 text-sm font-semibold">Strategies</h3>
                <div className="mt-2 space-y-2">
                  {snap.strategies.map((strategy) => (
                    <div key={strategy.id} className="rounded-xl border border-line p-3">
                      <p className="text-sm">{strategy.title}</p>
                      <p className="text-xs text-muted">{strategy.detail}</p>
                      <div className="mt-2">
                        <Btn disabled={strategy.applied} onClick={() => void applyStrategy(strategy.id)}>
                          {strategy.applied ? "Applied" : "Apply locally"}
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Pioneer functions" meta="Local cognition">
                <ol className="space-y-2">
                  {snap.pioneer.map((row) => (
                    <li key={row.index} className="rounded-xl border border-line px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{row.index.toString().padStart(2, "0")} · {row.name}</p>
                        <span className="text-xs tabular-nums text-muted">{Math.round(row.heat * 100)}</span>
                      </div>
                      <div className="meter mt-2">
                        <span style={{ width: `${Math.round(row.heat * 100)}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted">{row.last}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          ) : null}

          {view === "lattice" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Local Zion lattice" meta="Replaces placeholder Firebase">
                <p className="text-sm text-muted">
                  Records stay in this browser. The old file pointed at dummy keys and mixed HTML into the module.
                </p>
                <label className="mt-3 block text-xs text-muted" htmlFor="lattice-key">Key</label>
                <input
                  id="lattice-key"
                  value={latticeKey}
                  onChange={(event) => setLatticeKey(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-cyan"
                />
                <label className="mt-3 block text-xs text-muted" htmlFor="lattice-value">Value</label>
                <textarea
                  id="lattice-value"
                  value={latticeValue}
                  onChange={(event) => setLatticeValue(event.target.value)}
                  className="mt-1 min-h-20 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-cyan"
                />
                <div className="mt-2">
                  <Btn tone="primary" onClick={() => void entangle(latticeKey, latticeValue)}>Entangle locally</Btn>
                </div>
                <label className="mt-4 block text-xs text-muted" htmlFor="lattice-search">Search</label>
                <input
                  id="lattice-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search keys and values"
                  className="mt-1 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-cyan"
                />
                <div className="mt-3 max-h-64 space-y-2 overflow-auto">
                  {found.length === 0 ? <p className="text-sm text-muted">No matching records.</p> : null}
                  {found.map((item) => (
                    <pre key={`${item.key}-${item.at}`} className="overflow-auto rounded-xl border border-line p-3 text-xs text-muted">
                      {item.key} · {item.origin}
                      {"\n"}
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  ))}
                </div>
              </Card>
              <div className="space-y-4">
                <Card title="Intent compiler" meta="Not executed">
                  <textarea
                    value={intent}
                    onChange={(event) => setIntent(event.target.value)}
                    className="min-h-20 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-cyan"
                    aria-label="Intent"
                  />
                  <div className="mt-2">
                    <Btn tone="primary" onClick={() => void compileIntent(intent)}>Compile protocol</Btn>
                  </div>
                  <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl border border-line p-3 text-xs text-muted">{snap.compiled}</pre>
                </Card>
                <Card title="Mesh and seeds" meta={`Seeds ${snap.seeds.length}/12`}>
                  <input
                    value={meshIntent}
                    onChange={(event) => setMeshIntent(event.target.value)}
                    aria-label="Mesh intent"
                    className="min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-cyan"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Btn onClick={() => summonNode(meshIntent)}>File mesh node</Btn>
                    <Btn tone="gold" onClick={() => void mintSeed()}>Mint one seed</Btn>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-muted">
                    {snap.mesh.map((node) => (
                      <li key={node.id}>{node.id} · {node.intent}</li>
                    ))}
                    {snap.seeds.map((seed) => (
                      <li key={seed.id} className="break-all">{seed.id} · {seed.digest.slice(0, 24)}…</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          ) : null}

          {view === "office" ? <OfficeDesk /> : null}

          {view === "rite" ? <RiteDesk /> : null}

          {view === "liturgy" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Living liturgy" meta={snap.liturgyKind}>
                <p className="text-xs font-bold tracking-[0.18em] text-gold">{snap.liturgyLabel}</p>
                <p className="mt-3 font-display text-2xl leading-snug">{snap.liturgyText}</p>
                <p className="mt-3 text-sm text-muted">
                  Devotional lines are house language. They are not evidence of a detection, and the technical
                  boundary does not depend on them.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Btn onClick={() => void advanceLiturgy()}>Next line</Btn>
                  <Btn tone="danger" onClick={() => void cleanseLocal()}>Scan local lattice</Btn>
                </div>
                <p className="mt-3 text-xs text-muted">Isolated by the local scan: {snap.cleansed}</p>
              </Card>
              <div className="space-y-4">
                <Card title="Interpretive link" meta={snap.interpretive ? "On" : "Off"}>
                  <p className="text-sm text-muted">
                    The source gated commands on a faith passphrase. That coupling is removed. The passphrase
                    only labels devotion. Protection still runs without it.
                  </p>
                  <input
                    value={passphrase}
                    onChange={(event) => setPassphrase(event.target.value)}
                    aria-label="Interpretive passphrase"
                    className="mt-3 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-cyan"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Btn
                      tone="gold"
                      onClick={() => {
                        if (passphrase.trim() === "I-BELIEVE-MWARI-NDI-MWARI") {
                          setInterpretive(true);
                          setLinkNote("Interpretive link on. Still not a detection.");
                        } else {
                          setLinkNote("Passphrase does not match the house line in the source.");
                        }
                      }}
                    >
                      Set interpretive link
                    </Btn>
                    <Btn onClick={() => setInterpretive(false)}>Clear</Btn>
                  </div>
                  {linkNote ? <p className="mt-2 text-xs text-muted">{linkNote}</p> : null}
                </Card>
                <Card title="Five zones" meta="Zero trust">
                  <div className="space-y-3">
                    {snap.zones.map((zone) => (
                      <div key={zone.id}>
                        <div className="flex justify-between text-sm">
                          <span>{zone.id} · {zone.title}</span>
                          <span className="tabular-nums text-muted">{zone.health}%</span>
                        </div>
                        <p className="text-xs text-muted">{zone.body}</p>
                        <div className="meter mt-1">
                          <span style={{ width: `${zone.health}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="Hardware" meta="Permissions not requested">
                  <ul className="space-y-2 text-sm">
                    {snap.hardware.map((row) => (
                      <li key={row.name} className="flex justify-between gap-3 border-b border-line py-2">
                        <span>{row.name}</span>
                        <span className="text-right text-xs text-muted">{row.state}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          ) : null}

          {view === "audit" ? (
            <Card title="Local audit chain" meta={snap.chainValid ? `${snap.algo} verified` : "Verification failed"}>
              <div className="overflow-auto">
                <table className="w-full min-w-[36rem] text-left text-xs">
                  <thead className="text-muted">
                    <tr>
                      <th className="px-2 py-2 font-medium">Time</th>
                      <th className="px-2 py-2 font-medium">Type</th>
                      <th className="px-2 py-2 font-medium">State</th>
                      <th className="px-2 py-2 font-medium">Digest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.audit.map((row) => (
                      <tr key={row.digest} className="border-t border-line">
                        <td className="px-2 py-2 whitespace-nowrap">{row.time.slice(11, 19)}</td>
                        <td className="px-2 py-2">{row.type}</td>
                        <td className="px-2 py-2">{row.state}</td>
                        <td className="px-2 py-2 font-mono">{row.digest.slice(0, 24)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn onClick={() => void integrityCheck()}>Verify chain</Btn>
                <span className="inline-flex items-center gap-2 text-xs text-muted">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  {snap.chainValid ? "Each retained row still hashes to its digest." : "A retained row no longer matches."}
                </span>
              </div>
            </Card>
          ) : null}

          <footer className="mt-8 text-xs leading-relaxed text-muted">
            CHIROMBE · House of Masawi. Mwari ndi Mwari is kept as a labelled devotion.
            This console does not detect spirits, predict people, open the camera, or act against any outside system.
          </footer>
        </main>
      </div>
      <SoundDock />

      {snap.toast ? (
        <p className="pointer-events-none fixed bottom-36 left-1/2 z-30 -translate-x-1/2 rounded-full border border-cyan/40 bg-panel px-4 py-2 text-sm text-fg">
          {snap.toast}
        </p>
      ) : null}

      {exportOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/80 p-4" role="dialog" aria-modal="true" aria-labelledby="export-title">
          <div className="w-full max-w-2xl rounded-2xl border border-line bg-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="export-title" className="text-sm font-semibold">Local state export</h2>
              <Btn onClick={() => setExportOpen(false)}>Close</Btn>
            </div>
            <textarea readOnly value={exportText} className="mt-3 h-72 w-full rounded-xl border border-line bg-bg p-3 text-xs text-muted" />
            <div className="mt-2">
              <Btn
                tone="primary"
                onClick={() => {
                  void navigator.clipboard?.writeText(exportText);
                }}
              >
                Copy JSON
              </Btn>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
