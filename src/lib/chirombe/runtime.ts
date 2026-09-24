/**
 * CHIROMBE Celestial Protection — linked local runtime.
 * Simulations stay simulations. Devotional lines stay labelled.
 * No remote writes, no code execution of intake, no retaliation.
 */

export type Incident = "NORMAL" | "WATCH" | "CONTAINED" | "DEGRADED";
export type Classification =
  | "KNOWN_LINEAGE"
  | "SYNTHETIC_BRANCH"
  | "CANARY"
  | "QUARANTINE";

export type Generation = "past" | "present" | "future";

export type SimNode = {
  id: string;
  name: string;
  role: string;
  generation: Generation;
  locationModel: string;
  known: boolean;
  classification: Classification;
  integrity: number;
  angle0: number;
  speed: number;
  ring: number;
  pulse: number;
  digest: string;
  sx: number;
  sy: number;
};

export type FeedItem = {
  id: string;
  time: string;
  type: string;
  message: string;
};

export type AuditItem = {
  time: string;
  type: string;
  state: string;
  digest: string;
  prev: string;
  canon: string;
};

export type ModuleRow = {
  name: string;
  state: "ACTIVE" | "IDLE" | "ERROR";
  detail: string;
};

export type StageRow = { name: string; detail: string };

export type PioneerRow = {
  index: number;
  name: string;
  last: string;
  heat: number;
};

export type LatticeEntry = {
  key: string;
  origin: string;
  data: unknown;
  at: string;
};

export type MeshNode = { id: string; intent: string; at: string };

export type SentienceRow = { time: string; source: string; thought: string };

export type Strategy = {
  id: string;
  title: string;
  detail: string;
  applied: boolean;
};

export type Zone = { id: string; title: string; body: string; health: number };

export type HardwareRow = { name: string; state: string };

export type RosterRow = {
  id: string;
  name: string;
  role: string;
  generation: Generation;
  classification: Classification;
  known: boolean;
};

export type Shield = { id: string; name: string; state: "HOLDING" | "IDLE"; detail: string };

export type Repair = { id: string; title: string; detail: string };

export type Snapshot = {
  ready: boolean;
  version: string;
  armed: boolean;
  paused: boolean;
  tones: boolean;
  interpretive: boolean;
  incident: Incident;
  boundary: number;
  coherence: number;
  integrity: number;
  nodeCount: number;
  knownCount: number;
  syntheticCount: number;
  eventCount: number;
  quarantine: number;
  canaries: number;
  decoys: number;
  mirrors: number;
  houseDigest: string;
  algo: "SHA-256" | "FNV-1a";
  feed: FeedItem[];
  audit: AuditItem[];
  chainValid: boolean;
  modules: ModuleRow[];
  stages: StageRow[];
  cycle: number;
  pioneer: PioneerRow[];
  narrative: string;
  lattice: LatticeEntry[];
  mesh: MeshNode[];
  seeds: { id: string; digest: string; at: string }[];
  compiled: string;
  sentience: SentienceRow[];
  liturgyLabel: string;
  liturgyText: string;
  liturgyKind: "DEVOTIONAL" | "TECHNICAL";
  zones: Zone[];
  strategies: Strategy[];
  hardware: HardwareRow[];
  roster: RosterRow[];
  selectedId: string | null;
  selected: RosterRow | null;
  lastReceive: string;
  rateMax: number;
  errors: number;
  recoveries: number;
  cleansed: number;
  shields: Shield[];
  repairs: Repair[];
  toast: string | null;
};

type Persist = {
  armed: boolean;
  incident: Incident;
  boundary: number;
  mirrors: number;
  decoys: number;
  canaryIds: string[];
  quarantineIds: string[];
  feed: FeedItem[];
  audit: AuditItem[];
  lattice: LatticeEntry[];
  mesh: MeshNode[];
  seeds: Snapshot["seeds"];
  sentience: SentienceRow[];
  liturgyIndex: number;
  interpretive: boolean;
  rateMax: number;
  strategies: Strategy[];
  cycle: number;
  errors: number;
  recoveries: number;
  cleansed: number;
  eventCount: number;
  quarantine: number;
  canaries: number;
  offered: boolean;
};

const VERSION = "CM90-LINKED 2.1.0";
const STORAGE_KEY = "chirombe.celestial.linked.v1";
const MAX_INPUT = 12_000;
const REPLAY_MS = 60_000;
const RATE_WINDOW_MS = 5_000;
const SEED_CAP = 12;
const LATTICE_CAP = 24;

const PIONEER_NAMES = [
  "Observe",
  "Classify",
  "Correlate",
  "Forecast",
  "Prioritize",
  "Allocate",
  "Shield",
  "Quarantine",
  "Mirror",
  "Canary",
  "Decoy",
  "Attest",
  "Recover",
  "Narrate",
  "Liturgy link",
  "Lattice write",
  "Strategize",
  "Simulate",
  "Learn",
] as const;

const LITURGY: { label: string; text: string; kind: "DEVOTIONAL" | "TECHNICAL" }[] = [
  {
    label: "HOUSE",
    text: "Mwari ndi Mwari. This line is a house devotion, not a sensor reading.",
    kind: "DEVOTIONAL",
  },
  {
    label: "SEAL",
    text: "Chirombe · Masawi · Mukanya · 77-99-33. Identity is hashed locally.",
    kind: "TECHNICAL",
  },
  {
    label: "MERCY",
    text: "Quarantine isolates data. It does not punish a person or answer outward.",
    kind: "TECHNICAL",
  },
  {
    label: "TRUTH",
    text: "A pulse on the matrix is a drawing. It is not a measurement of a spirit.",
    kind: "DEVOTIONAL",
  },
  {
    label: "WATCH",
    text: "Canaries are synthetic tripwires. They hold no real credential.",
    kind: "TECHNICAL",
  },
  {
    label: "BOUNDARY",
    text: "What enters is data until the schema says otherwise. Nothing here is executed.",
    kind: "TECHNICAL",
  },
];

const ZONES: Zone[] = [
  {
    id: "Z1",
    title: "Untrusted input",
    body: "Strings stay data. No intake is evaluated as code.",
    health: 100,
  },
  {
    id: "Z2",
    title: "Schema firewall",
    body: "Size, rate, replay, and sensitive-field checks run before acceptance.",
    health: 100,
  },
  {
    id: "Z3",
    title: "Quarantine",
    body: "Malformed or private material is stored redacted, apart from the matrix.",
    health: 100,
  },
  {
    id: "Z4",
    title: "Family matrix",
    body: "The drawing receives classifications only, never raw secrets.",
    health: 100,
  },
  {
    id: "Z5",
    title: "Output",
    body: "Screen, local log, and optional tones. No retaliatory network call.",
    health: 100,
  },
];

export const REPAIRS: Repair[] = [
  {
    id: "R01",
    title: "Orchestrator had nothing to start",
    detail:
      "ZCCA, Guardian, Pioneer (19), ZCSM, Liturgy, ZionProtect, Resonance, Bus, and Health were waited on and never defined. They now boot together.",
  },
  {
    id: "R02",
    title: "SQIE cycle was a chain of missing globals",
    detail:
      "Sense, translate, NIM, EEA, PPM, strategy, reprogram, simulation, and feedback now run on local measurements.",
  },
  {
    id: "R03",
    title: "Script did not end at </html>",
    detail:
      "Further chunks were pasted after the document, so a browser would treat them as text. They are modules in this runtime instead.",
  },
  {
    id: "R04",
    title: "Firebase lattice could not connect",
    detail:
      "Placeholder keys, import statements inside a classic script, and duplicate search functions were replaced by a local lattice.",
  },
  {
    id: "R05",
    title: "Miracle compiler emitted live functions",
    detail:
      "Intents compile to a constrained protocol record. They are not turned into executable source.",
  },
  {
    id: "R06",
    title: "Cleansing ritual only printed flames",
    detail:
      "The local cleanser now scans lattice text for executable patterns and quarantines matches.",
  },
  {
    id: "R07",
    title: "External weave was not a local function",
    detail:
      "Fragments that tried to retitle other companies’ systems are not wired. Only this console’s own modules register on the bus.",
  },
  {
    id: "R08",
    title: "Seed loop could not finish",
    detail:
      "Trillion-row Firebase writes and an 800-trillion Python loop were replaced by a cap of 12 local symbolic seeds.",
  },
  {
    id: "R09",
    title: "Camera lock was not a detector",
    detail:
      "No camera, microphone, or location is opened. Hardware rows report presence only.",
  },
  {
    id: "R10",
    title: "Family page used broken image URLs",
    detail:
      "House dossiers use the names in the source. Synthetic AI nodes are labelled synthetic. Portraits are monograms, not placeholders.",
  },
  {
    id: "R11",
    title: "Typo dropped the decoy cap",
    detail: "DECoy_LIMIT never matched decoyCount. The cap is DECOY_LIMIT 40.",
  },
  {
    id: "R12",
    title: "Resurrection was an uncaught-error loop",
    detail:
      "Recovery restarts a paused Guardian or Pioneer locally. It does not rewrite the page or claim a system came back from death.",
  },
];

export const KNOWN: {
  id: string;
  name: string;
  role: string;
  generation: Generation;
}[] = [
  { id: "K001", name: "Chirombe", role: "ancestral-line-root", generation: "past" },
  { id: "K002", name: "Makwengura", role: "great-grandfather", generation: "past" },
  { id: "K003", name: "Masawi", role: "grandfather", generation: "past" },
  { id: "K004", name: "Masarura", role: "grandmother", generation: "past" },
  { id: "K005", name: "Sebastian Karumekangu Masawi", role: "father", generation: "past" },
  { id: "K006", name: "Risto Kasirori Masawi", role: "mother", generation: "present" },
  { id: "K007", name: "Tariro Masawi", role: "present-house-node", generation: "present" },
  { id: "K008", name: "Tarry Kupakwashe Masawi", role: "son", generation: "present" },
  { id: "K009", name: "Kenzi Masawi", role: "adopted-son-family-node", generation: "present" },
  { id: "K010", name: "Tenderayi", role: "brother", generation: "present" },
  { id: "K011", name: "Silent", role: "brother", generation: "present" },
  { id: "K012", name: "Trymore", role: "brother", generation: "present" },
  { id: "K013", name: "Charles", role: "brother", generation: "present" },
  { id: "K014", name: "Tatenda", role: "brother", generation: "present" },
  { id: "K015", name: "Rhoda", role: "sister", generation: "present" },
  { id: "K016", name: "Abigail", role: "sister", generation: "present" },
  { id: "K017", name: "Corinna", role: "deceased-sister", generation: "past" },
];

const NAMED_SYNTHETIC: { name: string; role: string; generation: Generation }[] = [
  { name: "Herculean Prometheus", role: "synthetic-strategist-node", generation: "future" },
  { name: "Haszeldonia", role: "synthetic-culture-node", generation: "future" },
  { name: "Zioncore", role: "synthetic-signal-node", generation: "future" },
  { name: "Deputy Adam", role: "synthetic-operations-node", generation: "present" },
];

const SENSITIVE = /password|secret|token|api[_-]?key|credential|private[_-]?key|authorization/i;
const EXECUTABLE = /<\s*script\b|javascript:|\beval\s*\(|\bnew\s+Function\s*\(|onerror\s*=|document\.cookie/i;

const listeners = new Set<() => void>();

let nodes: SimNode[] = [];
let feed: FeedItem[] = [];
let audit: AuditItem[] = [];
let lattice: LatticeEntry[] = [];
let mesh: MeshNode[] = [];
let seeds: Snapshot["seeds"] = [];
let sentience: SentienceRow[] = [];
let strategies: Strategy[] = [];
let pioneer: PioneerRow[] = PIONEER_NAMES.map((name, index) => ({
  index: index + 1,
  name,
  last: "Standing by",
  heat: 0,
}));
let stages: StageRow[] = [
  "SENSE",
  "TRANSLATE",
  "NIM",
  "EEA",
  "PPM",
  "ISG",
  "REPROGRAM",
  "SIMULATION",
  "FEEDBACK",
  "PIONEER",
  "GUARDIAN",
  "PROTECTION",
].map((name) => ({ name, detail: "Not run" }));

let armed = true;
let paused = false;
let tones = false;
let interpretive = false;
let incident: Incident = "NORMAL";
let boundary = 100;
let coherence = 0;
let integrity = 100;
let chainValid = true;
let mirrors = 0;
let decoys = 0;
let canaries = 0;
let quarantine = 0;
let eventCount = 0;
let cycle = 0;
let errors = 0;
let recoveries = 0;
let cleansed = 0;
let rateMax = 30;
let liturgyIndex = 0;
let houseDigest = "—";
let algo: Snapshot["algo"] = "SHA-256";
let selectedId: string | null = null;
let lastReceive = "No intake yet.";
let narrative = "Pioneer is quiet until the first cycle.";
let compiled = "No intent compiled.";
let toast: string | null = null;
let toastTimer = 0;
let seq = 1;
let booted = false;
let bootPromise: Promise<void> | null = null;
let globalPulse = 0;
let reducedMotion = false;
let forecastWatch = false;
let learnWeight = 0.5;
let guardianSeeded = false;
const rateWindow: number[] = [];
const seenNonce = new Map<string, number>();
let audioCtx: AudioContext | null = null;
let timers: number[] = [];

const BOOT: Snapshot = {
  ready: false,
  version: VERSION,
  armed: true,
  paused: false,
  tones: false,
  interpretive: false,
  incident: "NORMAL",
  boundary: 100,
  coherence: 0,
  integrity: 100,
  nodeCount: 0,
  knownCount: 17,
  syntheticCount: 0,
  eventCount: 0,
  quarantine: 0,
  canaries: 0,
  decoys: 0,
  mirrors: 0,
  houseDigest: "—",
  algo: "SHA-256",
  feed: [],
  audit: [],
  chainValid: true,
  modules: [],
  stages: [],
  cycle: 0,
  pioneer: [],
  narrative: "Linking local subsystems…",
  lattice: [],
  mesh: [],
  seeds: [],
  compiled: "",
  sentience: [],
  liturgyLabel: "HOUSE",
  liturgyText: LITURGY[0].text,
  liturgyKind: "DEVOTIONAL",
  zones: ZONES,
  strategies: [],
  hardware: [],
  roster: [],
  selectedId: null,
  selected: null,
  lastReceive: "No intake yet.",
  rateMax: 30,
  errors: 0,
  recoveries: 0,
  cleansed: 0,
  shields: [],
  repairs: REPAIRS,
  toast: null,
};

let live: Snapshot = BOOT;

function clock(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function emit(): void {
  live = project();
  listeners.forEach((listener) => listener());
}

function showToast(message: string): void {
  toast = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast = null;
    emit();
  }, 2400);
  emit();
}

async function digestOf(value: string): Promise<string> {
  try {
    if (globalThis.crypto?.subtle) {
      const bytes = new TextEncoder().encode(value);
      const buf = await crypto.subtle.digest("SHA-256", bytes);
      algo = "SHA-256";
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    /* fallback below */
  }
  algo = "FNV-1a";
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function pushFeed(type: string, message: string): void {
  eventCount += 1;
  feed.unshift({ id: `EVT-${seq++}`, time: clock(), type, message });
  if (feed.length > 80) feed.pop();
}

async function appendAudit(type: string, state: string, note: string): Promise<void> {
  const prev = audit[0]?.digest ?? "GENESIS";
  const time = new Date().toISOString();
  const canon = `${prev}|${time}|${type}|${state}|${note}`;
  const digest = await digestOf(canon);
  audit.unshift({ time, type, state, digest, prev, canon });
  if (audit.length > 50) audit.pop();
  chainValid = await verifyChain();
}

async function verifyChain(): Promise<boolean> {
  for (const row of audit) {
    const again = await digestOf(row.canon);
    if (again !== row.digest) return false;
  }
  for (let i = 0; i < audit.length - 1; i += 1) {
    if (audit[i].prev !== audit[i + 1].digest) return false;
  }
  return true;
}

function hasSensitive(value: unknown, depth = 0): boolean {
  if (depth > 6 || value == null) return false;
  if (typeof value === "string") return false;
  if (Array.isArray(value)) return value.some((item) => hasSensitive(item, depth + 1));
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, item]) => SENSITIVE.test(key) || hasSensitive(item, depth + 1),
    );
  }
  return false;
}

function allowRate(): boolean {
  const now = Date.now();
  while (rateWindow.length && now - rateWindow[0] > RATE_WINDOW_MS) rateWindow.shift();
  if (rateWindow.length >= rateMax) return false;
  rateWindow.push(now);
  return true;
}

function rememberNonce(nonce: string): boolean {
  const now = Date.now();
  for (const [key, at] of seenNonce) {
    if (now - at > REPLAY_MS) seenNonce.delete(key);
  }
  if (seenNonce.has(nonce)) return false;
  seenNonce.set(nonce, now);
  return true;
}

function tone(freq: number): void {
  if (!tones || !audioCtx) return;
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

function place(group: SimNode[], ring: number, offset: number): void {
  group.forEach((node, index) => {
    node.ring = ring;
    node.angle0 = offset + (index / Math.max(group.length, 1)) * Math.PI * 2;
    node.speed = 0.00005 + (index % 4) * 0.000012;
  });
}

function buildNodes(): SimNode[] {
  const knownNodes: SimNode[] = KNOWN.map((person) => ({
    id: person.id,
    name: person.name,
    role: person.role,
    generation: person.generation,
    locationModel: "Unspecified",
    known: true,
    classification: "KNOWN_LINEAGE",
    integrity: 1,
    angle0: 0,
    speed: 0,
    ring: 0.4,
    pulse: 0,
    digest: "",
    sx: 0,
    sy: 0,
  }));
  const synthetic: SimNode[] = [];
  for (let index = 0; index < 83; index += 1) {
    const named = NAMED_SYNTHETIC[index];
    const generation: Generation = named
      ? named.generation
      : (["past", "present", "future"] as const)[index % 3];
    synthetic.push({
      id: `S${String(index + 1).padStart(3, "0")}`,
      name: named?.name ?? `Synthetic branch ${String(index + 1).padStart(3, "0")}`,
      role: named?.role ?? "synthetic-family-branch",
      generation,
      locationModel: "Modelled only",
      known: false,
      classification: "SYNTHETIC_BRANCH",
      integrity: 0.92,
      angle0: 0,
      speed: 0,
      ring: 0.8,
      pulse: 0,
      digest: "",
      sx: 0,
      sy: 0,
    });
  }
  place(
    knownNodes.filter((node) => node.generation === "past"),
    0.58,
    0.2,
  );
  place(
    knownNodes.filter((node) => node.generation === "present"),
    0.36,
    0.4,
  );
  place(
    synthetic.filter((node) => node.generation === "present"),
    0.74,
    1,
  );
  place(
    synthetic.filter((node) => node.generation === "future"),
    0.88,
    1.7,
  );
  place(
    synthetic.filter((node) => node.generation === "past"),
    0.98,
    2.3,
  );
  return [...knownNodes, ...synthetic];
}

function applyClassification(id: string, classification: Classification): void {
  const node = nodes.find((item) => item.id === id);
  if (!node || node.classification === "QUARANTINE") return;
  if (classification === "CANARY" && node.known) return;
  if (classification === "QUARANTINE" && node.known) return;
  node.classification = classification;
  node.pulse = 1;
  if (classification === "CANARY") node.integrity = 0.8;
  if (classification === "QUARANTINE") node.integrity = 0.35;
}

function spareSynthetic(): SimNode | undefined {
  return nodes.find(
    (node) => !node.known && node.classification === "SYNTHETIC_BRANCH",
  );
}

function recompute(): void {
  const qRatio = quarantine / 40;
  integrity = chainValid ? Math.max(40, Math.round(100 - quarantine * 1.4)) : 42;
  coherence = Math.round(
    (nodes.reduce((sum, node) => sum + node.integrity, 0) / Math.max(nodes.length, 1)) *
      boundary *
      (1 - Math.min(0.35, qRatio)),
  );
  coherence = Math.max(0, Math.min(100, coherence));
  ZONES[2].health = Math.max(20, 100 - quarantine * 3);
  ZONES[1].health = Math.round(boundary);
  if (!chainValid) incident = "DEGRADED";
  else if (incident === "DEGRADED" && chainValid && boundary > 80) incident = "CONTAINED";
}

function hardware(): HardwareRow[] {
  const media = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const geo = typeof navigator !== "undefined" && !!navigator.geolocation;
  const motion = typeof window !== "undefined" && "DeviceMotionEvent" in window;
  return [
    { name: "Audio tones", state: tones ? "ENABLED" : "GESTURE REQUIRED" },
    { name: "Microphone", state: media ? "PRESENT · NOT REQUESTED" : "ABSENT" },
    { name: "Camera", state: media ? "PRESENT · NOT REQUESTED" : "ABSENT" },
    { name: "Location", state: geo ? "PRESENT · NOT REQUESTED" : "ABSENT" },
    { name: "Motion", state: motion ? "PRESENT · NOT REQUESTED" : "ABSENT" },
  ];
}

function shields(): Shield[] {
  return [
    { id: "seal", name: "Anti-corruption seal", state: chainValid ? "HOLDING" : "IDLE", detail: `${algo} audit chain` },
    { id: "wall", name: "Schema wall", state: "HOLDING", detail: `Rate cap ${rateMax} · ${MAX_INPUT} byte ceiling` },
    { id: "immune", name: "Immune grid", state: "HOLDING", detail: "Secrets and executable patterns stay out of the matrix" },
    { id: "lineage", name: "Lineage lock", state: "HOLDING", detail: "Known family nodes cannot be isolated or used as canaries" },
    { id: "mirror", name: "Reflector", state: mirrors > 0 ? "HOLDING" : "IDLE", detail: `${mirrors} inert mirrors · nothing sent outward` },
    { id: "canary", name: "Canary layer", state: canaries > 0 ? "HOLDING" : "IDLE", detail: `${canaries} synthetic tripwires` },
    { id: "decoy", name: "Decoy layer", state: decoys > 0 ? "HOLDING" : "IDLE", detail: `${decoys} non-accounts` },
    { id: "purifier", name: "Auto-purifier", state: "HOLDING", detail: `${cleansed} local records isolated` },
    { id: "watchdog", name: "Watchdog", state: armed ? "HOLDING" : "IDLE", detail: armed ? "Full cycle while armed" : "Disarmed" },
    { id: "recovery", name: "Recovery", state: "HOLDING", detail: `${recoveries} local recoveries` },
  ];
}

function modules(): ModuleRow[] {
  return [
    { name: "ZCCA", state: "ACTIVE", detail: "Command bus accepting local orders" },
    { name: "GUARDIAN", state: armed ? "ACTIVE" : "IDLE", detail: armed ? "Boundary watch running" : "Armed to respond" },
    { name: "PIONEER", state: "ACTIVE", detail: "19-function local cycle" },
    { name: "ZCSM", state: interpretive ? "ACTIVE" : "IDLE", detail: "Scripture matrix is interpretive" },
    { name: "LITURGY", state: "ACTIVE", detail: LITURGY[liturgyIndex % LITURGY.length].label },
    { name: "PROTECTION", state: "ACTIVE", detail: incident },
    { name: "RESONANCE", state: tones ? "ACTIVE" : "IDLE", detail: tones ? "Tones on" : "Silent until a gesture" },
    { name: "BUS", state: "ACTIVE", detail: "In-process only" },
    { name: "HEALTH", state: errors ? "ERROR" : "ACTIVE", detail: `${errors} errors · ${recoveries} recoveries` },
    { name: "LATTICE", state: "ACTIVE", detail: `${lattice.length} local records` },
    { name: "CORE", state: booted ? "ACTIVE" : "IDLE", detail: VERSION },
  ];
}

function project(): Snapshot {
  const roster: RosterRow[] = nodes.map((node) => ({
    id: node.id,
    name: node.name,
    role: node.role,
    generation: node.generation,
    classification: node.classification,
    known: node.known,
  }));
  const line = LITURGY[liturgyIndex % LITURGY.length];
  const selected = roster.find((row) => row.id === selectedId) ?? null;
  return {
    ready: booted,
    version: VERSION,
    armed,
    paused,
    tones,
    interpretive,
    incident,
    boundary: Math.round(boundary),
    coherence,
    integrity,
    nodeCount: nodes.length,
    knownCount: nodes.filter((node) => node.known).length,
    syntheticCount: nodes.filter((node) => !node.known).length,
    eventCount,
    quarantine,
    canaries,
    decoys,
    mirrors,
    houseDigest,
    algo,
    feed: feed.slice(0, 40),
    audit: audit.slice(0, 24),
    chainValid,
    modules: modules(),
    stages: stages.map((stage) => ({ ...stage })),
    cycle,
    pioneer: pioneer.map((row) => ({ ...row })),
    narrative,
    lattice: lattice.slice(0, 16),
    mesh: mesh.slice(0, 12),
    seeds: seeds.slice(),
    compiled,
    sentience: sentience.slice(0, 8),
    liturgyLabel: line.label,
    liturgyText: line.text,
    liturgyKind: line.kind,
    zones: ZONES.map((zone) => ({ ...zone })),
    strategies: strategies.map((item) => ({ ...item })),
    hardware: hardware(),
    roster,
    selectedId,
    selected,
    lastReceive,
    rateMax,
    errors,
    recoveries,
    cleansed,
    shields: shields(),
    repairs: REPAIRS,
    toast,
  };
}

function persist(): void {
  const data: Persist = {
    armed,
    incident,
    boundary,
    mirrors,
    decoys,
    canaryIds: nodes.filter((node) => node.classification === "CANARY").map((node) => node.id),
    quarantineIds: nodes.filter((node) => node.classification === "QUARANTINE").map((node) => node.id),
    feed,
    audit,
    lattice,
    mesh,
    seeds,
    sentience,
    liturgyIndex,
    interpretive,
    rateMax,
    strategies,
    cycle,
    errors,
    recoveries,
    cleansed,
    eventCount,
    quarantine,
    canaries,
    offered: true,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode */
  }
}

function loadPersist(): Persist | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persist;
  } catch {
    return null;
  }
}

async function quarantineInput(reason: string): Promise<{ ok: false; reason: string }> {
  quarantine += 1;
  boundary = Math.max(15, boundary - (reason === "REPLAY" ? 8 : 4));
  incident = boundary < 55 ? "DEGRADED" : "CONTAINED";
  const node = spareSynthetic();
  if (node) applyClassification(node.id, "QUARANTINE");
  mirrors += 1;
  pushFeed("QUARANTINE", `${reason} isolated. Reflector stored an inert mirror. Nothing was executed or sent onward.`);
  await appendAudit("QUARANTINE", incident, reason);
  tone(196);
  recompute();
  lastReceive = `Rejected · ${reason}`;
  emit();
  persist();
  return { ok: false, reason };
}

export async function receive(raw: string): Promise<{ ok: boolean; reason: string }> {
  const text = raw ?? "";
  if (!allowRate()) return quarantineInput("RATE_LIMIT");
  if (new TextEncoder().encode(text).length > MAX_INPUT) return quarantineInput("OVERSIZE");
  if (EXECUTABLE.test(text)) return quarantineInput("EXECUTABLE_PATTERN");
  let parsed: unknown = { type: "TEXT", body: text.slice(0, 400) };
  if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      return quarantineInput("MALFORMED_JSON");
    }
  }
  if (hasSensitive(parsed)) return quarantineInput("PRIVACY_FIELD");
  const nonce =
    parsed && typeof parsed === "object" && "nonce" in parsed
      ? String((parsed as { nonce: unknown }).nonce)
      : await digestOf(text.slice(0, 200));
  if (!rememberNonce(nonce)) return quarantineInput("REPLAY");
  const seal = await digestOf(text.slice(0, 500));
  lattice = [
    {
      key: `seal-${seal.slice(0, 12)}`,
      origin: "Seal",
      data: { seal, bytes: text.length, stored: "digest-only" },
      at: new Date().toISOString(),
    },
    ...lattice,
  ].slice(0, LATTICE_CAP);
  pushFeed("INTAKE", "Untrusted intake accepted as inert data and sealed by digest.");
  await appendAudit("INTAKE", incident, "ACCEPTED_INERT");
  lastReceive = "Accepted as inert data";
  tone(523);
  recompute();
  emit();
  persist();
  return { ok: true, reason: "ACCEPTED_INERT" };
}

export async function pulseMatrix(): Promise<void> {
  globalPulse = 1;
  for (const node of nodes) node.pulse = Math.min(1, node.pulse + 0.45);
  boundary = Math.min(100, boundary + 1);
  pushFeed("MATRIX", "Local pulse drawn across the family matrix.");
  await appendAudit("MATRIX", incident, "PULSE");
  tone(440);
  showToast("Matrix pulsed");
  recompute();
  persist();
}

export async function defensiveMirror(): Promise<void> {
  mirrors += 1;
  pushFeed("MIRROR", "Pattern copied into an inert local mirror. Nothing was sent onward.");
  await appendAudit("MIRROR", incident, `mirrors=${mirrors}`);
  tone(392);
  showToast("Mirror recorded");
  persist();
}

export async function boundaryTest(): Promise<void> {
  await receive("x".repeat(MAX_INPUT + 8));
  showToast("Boundary test finished");
}

export async function privacyTest(): Promise<void> {
  await receive(JSON.stringify({ note: "sample", password: "not-a-real-secret" }));
  showToast("Privacy test finished");
}

export async function replayTest(): Promise<void> {
  const body = JSON.stringify({ type: "PING", nonce: "chirombe-replay-sample" });
  await receive(body);
  await receive(body);
  showToast("Replay test finished");
}

export async function integrityCheck(): Promise<void> {
  chainValid = await verifyChain();
  recompute();
  pushFeed("INTEGRITY", chainValid ? "Audit chain verifies." : "Audit chain failed verification.");
  await appendAudit("INTEGRITY", chainValid ? "VALID" : "BROKEN", `score=${integrity}`);
  if (!chainValid) incident = "DEGRADED";
  showToast(chainValid ? "Chain intact" : "Chain broken");
  persist();
}

export async function createCanary(silent = false): Promise<void> {
  if (canaries >= 20) {
    showToast("Canary cap reached");
    return;
  }
  const node = spareSynthetic();
  if (!node) {
    showToast("No spare branch");
    return;
  }
  applyClassification(node.id, "CANARY");
  canaries += 1;
  node.digest = await digestOf(`${node.id}|${node.name}|CANARY`);
  pushFeed("CANARY", `${node.name} marked as a synthetic tripwire. No credential stored.`);
  await appendAudit("CANARY", incident, node.id);
  tone(659);
  if (!silent) showToast("Canary placed");
  recompute();
  persist();
}

export async function createDecoy(silent = false): Promise<void> {
  if (decoys >= 40) {
    showToast("Decoy cap reached");
    return;
  }
  decoys += 1;
  pushFeed("DECOY", `Decoy profile ${decoys} filed. It is not a real account.`);
  await appendAudit("DECOY", incident, `decoys=${decoys}`);
  if (!silent) showToast("Decoy filed");
  persist();
}

export async function quarantineTest(): Promise<void> {
  await receive("<script>alert(1)</script>");
  showToast("Quarantine test finished");
}

export async function recoverProtection(): Promise<void> {
  let dropped = 0;
  while (!(await verifyChain()) && audit.length && dropped < 8) {
    audit.shift();
    dropped += 1;
  }
  chainValid = audit.length ? await verifyChain() : true;
  if (chainValid) {
    boundary = Math.min(100, Math.max(boundary, 0) + 12);
    incident = boundary > 85 ? "NORMAL" : "CONTAINED";
    recoveries += 1;
  } else {
    incident = "DEGRADED";
  }
  armed = true;
  pushFeed(
    "RECOVERY",
    chainValid
      ? `Boundary recovered locally. ${dropped} broken audit rows dropped.`
      : "Recovery could not restore the chain.",
  );
  await appendAudit("RECOVERY", incident, `dropped=${dropped}`);
  recompute();
  showToast(chainValid ? "Protection restored" : "Chain still broken");
  persist();
}

export function setArmed(next: boolean): void {
  armed = next;
  pushFeed("ZCCA", next ? "Boundary armed. Guardian may answer locally." : "Boundary disarmed.");
  showToast(next ? "Armed" : "Disarmed");
  persist();
}

export function setPaused(next: boolean): void {
  paused = next;
  showToast(next ? "Motion paused" : "Motion resumed");
  emit();
  persist();
}

export async function enableTones(): Promise<void> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    showToast("Audio unavailable");
    return;
  }
  audioCtx = audioCtx ?? new Ctx();
  await audioCtx.resume();
  tones = true;
  tone(523);
  showToast("Tones on");
  persist();
}

export function focusNode(id: string): void {
  selectedId = id;
  const node = nodes.find((item) => item.id === id);
  if (node) node.pulse = 1;
  emit();
}

export function getNodes(): readonly SimNode[] {
  return nodes;
}

export function visualFrame(now: number): { pulse: number; paused: boolean; reduced: boolean } {
  if (!paused && !reducedMotion) {
    for (const node of nodes) node.pulse *= 0.985;
    globalPulse *= 0.97;
  }
  return { pulse: globalPulse, paused: paused || reducedMotion, reduced: reducedMotion };
  void now;
}

function setStage(name: string, detail: string): void {
  const stage = stages.find((item) => item.name === name);
  if (stage) stage.detail = detail;
}

function setPioneer(index: number, last: string, heat: number): void {
  const row = pioneer[index];
  if (!row) return;
  row.last = last;
  row.heat = heat;
}

async function runPioneer(): Promise<void> {
  const byClass = {
    known: nodes.filter((node) => node.classification === "KNOWN_LINEAGE").length,
    synthetic: nodes.filter((node) => node.classification === "SYNTHETIC_BRANCH").length,
    canary: nodes.filter((node) => node.classification === "CANARY").length,
    quarantine: nodes.filter((node) => node.classification === "QUARANTINE").length,
  };
  setPioneer(0, `${nodes.length} nodes · ${incident}`, 0.7);
  setPioneer(1, `${byClass.known} known · ${byClass.synthetic} synthetic · ${byClass.canary} canary · ${byClass.quarantine} isolated`, 0.66);
  const correlated = quarantine > 0 && boundary < 90;
  setPioneer(2, correlated ? "Quarantine pressure tracks the boundary" : "No strong pressure correlation", correlated ? 0.8 : 0.3);
  const forecast = boundary < 70 || forecastWatch ? "WATCH likely" : "Boundary expected to hold";
  setPioneer(3, forecast, forecastWatch ? 0.75 : 0.4);
  const priority = !chainValid ? "Attest the chain" : quarantine > 3 ? "Hold quarantine" : "Keep watch";
  setPioneer(4, priority, 0.62);
  setPioneer(5, quarantine > 0 ? "Attention on zone 3" : "Attention on zone 5", 0.5);
  if (armed) boundary = Math.min(100, boundary + 0.6);
  setPioneer(6, armed ? "Shield ticked locally" : "Shield idle until armed", armed ? 0.7 : 0.2);
  setPioneer(7, `${quarantine} isolated events`, Math.min(1, quarantine / 10));
  setPioneer(8, `${mirrors} inert mirrors`, Math.min(1, mirrors / 8));
  setPioneer(9, `${canaries} canaries`, Math.min(1, canaries / 8));
  setPioneer(10, `${decoys} decoys`, Math.min(1, decoys / 10));
  setPioneer(11, chainValid ? "Chain verifies" : "Chain does not verify", chainValid ? 0.4 : 1);
  if (incident === "CONTAINED" && boundary > 88 && chainValid) {
    incident = "NORMAL";
    recoveries += 1;
    setPioneer(12, "Recovered to NORMAL", 0.8);
  } else {
    setPioneer(12, `Incident remains ${incident}`, 0.35);
  }
  narrative = `Cycle ${cycle}: ${incident}, boundary ${Math.round(boundary)}%, ${priority.toLowerCase()}. ${LITURGY[liturgyIndex % LITURGY.length].label} is the labelled line in view.`;
  setPioneer(13, narrative, 0.55);
  setPioneer(14, LITURGY[liturgyIndex % LITURGY.length].label, interpretive ? 0.7 : 0.25);
  if (armed && cycle % 2 === 0) {
    const key = `cycle-${cycle}`;
    const data = { incident, boundary: Math.round(boundary), note: "auto summary" };
    lattice = [{ key, origin: "Pioneer", data, at: new Date().toISOString() }, ...lattice.filter((item) => item.key !== key)].slice(0, LATTICE_CAP);
    setPioneer(15, `Wrote ${key}`, 0.6);
  } else {
    setPioneer(15, "No automatic lattice write", 0.2);
  }
  const top = strategies.find((item) => !item.applied);
  setPioneer(16, top ? top.title : "No open strategy", top ? 0.7 : 0.3);
  if (!paused) {
    for (const node of nodes) {
      if (!node.known) node.integrity = Math.max(0.45, Math.min(1, node.integrity + (node.id.charCodeAt(2) % 2 ? 0.002 : -0.001)));
    }
  }
  setPioneer(17, paused ? "Simulation held" : "Synthetic integrity drifted slightly", 0.45);
  const matched = forecastWatch === boundary < 75;
  learnWeight = Math.max(0.05, Math.min(0.95, learnWeight * 0.85 + (matched ? 0.15 : 0.05)));
  setPioneer(18, `Learning weight ${learnWeight.toFixed(2)}`, learnWeight);
}

function refreshStrategies(): void {
  const next: Strategy[] = [];
  if (quarantine > 4) {
    next.push({
      id: "tighten-rate",
      title: "Tighten intake rate",
      detail: "Lower the local rate cap by 5. Floor is 10.",
      applied: rateMax <= 10,
    });
  }
  if (canaries < 2) {
    next.push({
      id: "seed-canary",
      title: "Seed a canary",
      detail: "Place one synthetic tripwire on a spare branch.",
      applied: false,
    });
  }
  if (coherence < 55) {
    next.push({
      id: "pulse",
      title: "Pulse the matrix",
      detail: "A local visual pulse. It does not transmit.",
      applied: false,
    });
  }
  if (!next.length) {
    next.push({
      id: "hold",
      title: "Hold posture",
      detail: "No local policy change is recommended.",
      applied: true,
    });
  }
  const applied = new Set(strategies.filter((item) => item.applied).map((item) => item.id));
  strategies = next.map((item) => ({ ...item, applied: item.applied || applied.has(item.id) }));
}

export async function applyStrategy(id: string): Promise<void> {
  const item = strategies.find((strategy) => strategy.id === id);
  if (!item || item.applied) return;
  if (id === "tighten-rate") rateMax = Math.max(10, rateMax - 5);
  if (id === "seed-canary") await createCanary();
  if (id === "pulse") await pulseMatrix();
  item.applied = true;
  pushFeed("ISG", `Strategy applied locally: ${item.title}.`);
  showToast("Strategy applied");
  persist();
}

export async function runCycle(): Promise<void> {
  cycle += 1;
  const sense = {
    nodes: nodes.length,
    boundary: Math.round(boundary),
    coherence,
    incident,
    quarantine,
    chainValid,
  };
  setStage("SENSE", JSON.stringify(sense));
  setStage("TRANSLATE", `${incident} → ${chainValid ? "ATTESTED" : "UNATTESTED"} / ${armed ? "ARMED" : "OPEN"}`);
  const nim = Math.round((nodes.reduce((sum, node) => sum + (node.digest ? node.integrity : 0), 0) / Math.max(nodes.length, 1)) * 100);
  setStage("NIM", `Node integrity monitor ${nim}%`);
  setStage("EEA", lastReceive);
  forecastWatch = boundary < 72 || quarantine > 6;
  setStage("PPM", forecastWatch ? "Forecast: watch" : "Forecast: stable");
  refreshStrategies();
  setStage("ISG", strategies[0]?.title ?? "None");
  if (armed) {
    const pending = strategies.find((item) => !item.applied && item.id === "tighten-rate");
    if (pending) {
      rateMax = Math.max(10, rateMax - 5);
      pending.applied = true;
      setStage("REPROGRAM", `Rate cap is now ${rateMax}`);
    } else {
      setStage("REPROGRAM", "No safe policy change");
    }
  } else {
    setStage("REPROGRAM", "Disarmed — policies unchanged");
  }
  setStage("SIMULATION", paused ? "Held" : "Synthetic drift applied in Pioneer");
  await runPioneer();
  setStage("PIONEER", narrative.slice(0, 96));
  if (armed && boundary < 55 && canaries < 20 && !guardianSeeded) {
    guardianSeeded = true;
    await createCanary();
    setStage("GUARDIAN", "Low boundary — one canary placed, no outward action");
  } else {
    setStage("GUARDIAN", armed ? "Watching" : "Standby");
  }
  setStage("PROTECTION", `Snapshot ${incident} · boundary ${Math.round(boundary)}%`);
  setStage("FEEDBACK", `Weight ${learnWeight.toFixed(2)} · errors ${errors}`);
  pushFeed("CYCLE", `SQIE cycle ${cycle} completed locally.`);
  await appendAudit("CYCLE", incident, `cycle=${cycle}`);
  if (interpretive) liturgyIndex = (liturgyIndex + 1) % LITURGY.length;
  recompute();
  tone(330);
  emit();
  persist();
}

export async function entangle(key: string, data: unknown): Promise<void> {
  const clean = key.trim().slice(0, 80);
  if (!clean) return;
  if (EXECUTABLE.test(clean) || EXECUTABLE.test(JSON.stringify(data))) {
    await quarantineInput("EXECUTABLE_PATTERN");
    return;
  }
  lattice = [
    { key: clean, origin: "Operator", data, at: new Date().toISOString() },
    ...lattice.filter((item) => item.key !== clean),
  ].slice(0, LATTICE_CAP);
  sentience.unshift({ time: clock(), source: "Lattice", thought: `Entangled ${clean}` });
  pushFeed("LATTICE", `Local record “${clean}” stored in this browser.`);
  showToast("Lattice updated");
  persist();
}

export function searchLattice(query: string): LatticeEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return lattice.slice(0, 16);
  return lattice.filter((item) =>
    `${item.key} ${JSON.stringify(item.data)}`.toLowerCase().includes(needle),
  );
}

export async function compileIntent(intent: string): Promise<void> {
  const text = intent.trim().slice(0, 280);
  if (!text) return;
  if (EXECUTABLE.test(text)) {
    await quarantineInput("EXECUTABLE_PATTERN");
    compiled = "Rejected. The intent contained an executable pattern.";
    emit();
    return;
  }
  const id = `CHI-INT-${String(cycle + lattice.length + 1).padStart(4, "0")}`;
  compiled = [
    `PROTOCOL ${id}`,
    `intent: ${text}`,
    "mode: LOCAL_SIMULATION",
    "constraints:",
    "- record only, never execute",
    "- no outbound retaliation",
    "- devotional wording stays labelled",
    interpretive ? "frame: INTERPRETIVE_LINK" : "frame: TECHNICAL",
    "status: COMPILED_NOT_EXECUTED",
  ].join("\n");
  await entangle(id, { intent: text, status: "COMPILED_NOT_EXECUTED" });
  sentience.unshift({ time: clock(), source: "Compiler", thought: text });
  showToast("Protocol compiled");
}

export function summonNode(intent: string): void {
  const text = intent.trim().slice(0, 160);
  if (!text || EXECUTABLE.test(text)) {
    showToast("Node intent rejected");
    return;
  }
  if (mesh.length >= 16) mesh.pop();
  mesh.unshift({ id: `ZCN-${Date.now().toString(36)}`, intent: text, at: new Date().toISOString() });
  pushFeed("MESH", `Local mesh node filed for “${text}”. It does not join an outside network.`);
  showToast("Mesh node filed");
  persist();
}

export async function mintSeed(): Promise<void> {
  if (seeds.length >= SEED_CAP) {
    showToast("Seed cap is 12");
    return;
  }
  const digest = await digestOf(`CHIROMBE|SEED|${seeds.length}|${houseDigest}|${Date.now()}`);
  seeds.unshift({ id: `SEED-${String(seeds.length + 1).padStart(2, "0")}`, digest, at: new Date().toISOString() });
  pushFeed("SEED", "One local symbolic seed minted. No remote ledger was written.");
  showToast("Seed minted");
  persist();
}

export async function cleanseLocal(): Promise<void> {
  const before = lattice.length;
  const kept: LatticeEntry[] = [];
  let removed = 0;
  for (const item of lattice) {
    const blob = `${item.key} ${JSON.stringify(item.data)}`;
    if (EXECUTABLE.test(blob) || hasSensitive(item.data)) {
      removed += 1;
      quarantine += 1;
    } else kept.push(item);
  }
  lattice = kept;
  cleansed += removed;
  boundary = Math.min(100, boundary + (removed ? 0 : 1));
  pushFeed(
    "CLEANSE",
    removed
      ? `${removed} local records quarantined for executable or private patterns.`
      : "Local lattice scan found nothing to isolate.",
  );
  await appendAudit("CLEANSE", incident, `removed=${removed}`);
  showToast(removed ? "Records isolated" : "Lattice already clean");
  recompute();
  persist();
  void before;
}

export function setInterpretive(next: boolean): void {
  interpretive = next;
  pushFeed("ZCSM", next ? "Interpretive link on. Devotion is labelled, not treated as evidence." : "Interpretive link off.");
  showToast(next ? "Interpretive link on" : "Interpretive link off");
  persist();
}

export async function advanceLiturgy(): Promise<void> {
  liturgyIndex = (liturgyIndex + 1) % LITURGY.length;
  const line = LITURGY[liturgyIndex];
  pushFeed(line.kind, line.text);
  emit();
  persist();
}

export function exportDocument(): string {
  return JSON.stringify(
    {
      product: "CHIROMBE CELESTIAL PROTECTION",
      version: VERSION,
      exportedAt: new Date().toISOString(),
      boundary: {
        offlineFirst: true,
        networkRetaliation: false,
        supernaturalDetection: false,
        codeExecutionOfIntake: false,
      },
      incident,
      boundaryScore: Math.round(boundary),
      coherence,
      integrity,
      houseDigest,
      algo,
      cycle,
      nodes: nodes.map((node) => ({
        id: node.id,
        name: node.name,
        role: node.role,
        generation: node.generation,
        classification: node.classification,
        known: node.known,
        digest: node.digest,
      })),
      feed,
      audit: audit.map(({ canon: _canon, ...row }) => row),
      lattice,
      mesh,
      seeds,
      narrative,
    },
    null,
    2,
  );
}

export async function resetSystem(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  feed = [];
  audit = [];
  lattice = [];
  mesh = [];
  seeds = [];
  sentience = [];
  strategies = [];
  armed = true;
  paused = false;
  incident = "NORMAL";
  boundary = 100;
  mirrors = 0;
  decoys = 0;
  canaries = 0;
  quarantine = 0;
  eventCount = 0;
  cycle = 0;
  errors = 0;
  recoveries = 0;
  cleansed = 0;
  rateMax = 30;
  liturgyIndex = 0;
  selectedId = null;
  lastReceive = "No intake yet.";
  narrative = "System reset to the local baseline.";
  compiled = "No intent compiled.";
  forecastWatch = false;
  guardianSeeded = false;
  nodes = buildNodes();
  for (const node of nodes) {
    node.digest = await digestOf(`${node.id}|${node.name}|${node.role}|${node.generation}|${node.classification}`);
  }
  chainValid = true;
  pushFeed("RESET", "Local simulation reset. Stored state cleared.");
  await appendAudit("RESET", "NORMAL", "baseline");
  recompute();
  showToast("Reset complete");
  persist();
}

async function doBoot(): Promise<void> {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  nodes = buildNodes();
  const saved = loadPersist();
  const firstOffer = !saved?.offered;
  if (saved && !firstOffer) {
    armed = !!saved.armed;
    incident = saved.incident ?? "NORMAL";
    boundary = saved.boundary ?? 100;
    mirrors = saved.mirrors ?? 0;
    decoys = saved.decoys ?? 0;
    canaries = saved.canaries ?? 0;
    quarantine = saved.quarantine ?? 0;
    eventCount = saved.eventCount ?? 0;
    cycle = saved.cycle ?? 0;
    errors = saved.errors ?? 0;
    recoveries = saved.recoveries ?? 0;
    cleansed = saved.cleansed ?? 0;
    rateMax = saved.rateMax ?? 30;
    liturgyIndex = saved.liturgyIndex ?? 0;
    interpretive = !!saved.interpretive;
    feed = saved.feed ?? [];
    audit = saved.audit ?? [];
    lattice = saved.lattice ?? [];
    mesh = saved.mesh ?? [];
    seeds = saved.seeds ?? [];
    sentience = saved.sentience ?? [];
    strategies = saved.strategies ?? [];
    for (const id of saved.canaryIds ?? []) applyClassification(id, "CANARY");
    for (const id of saved.quarantineIds ?? []) applyClassification(id, "QUARANTINE");
  }
  houseDigest = await digestOf("CHIROMBE|MASAWI|MUKANYA|77-99-33");
  for (const node of nodes) {
    node.digest = await digestOf(`${node.id}|${node.name}|${node.role}|${node.generation}|${node.classification}`);
  }
  chainValid = audit.length ? await verifyChain() : true;
  if (!feed.length) {
    pushFeed("PROTECTION", "Protection is on. Schema wall, immune grid, lineage lock, and seal are holding.");
  }
  if (!audit.length) await appendAudit("BOOT", "NORMAL", VERSION);
  if (firstOffer) {
    armed = true;
    await createDecoy(true);
    await createCanary(true);
    await createCanary(true);
    await createCanary(true);
    await cleanseLocal();
    pushFeed("PROTECTION", "Canaries and a decoy are in place. Watchdog will cycle while armed.");
  }
  recompute();
  refreshStrategies();
  booted = true;
  emit();
  timers.push(window.setInterval(() => {
    recompute();
    if (armed && boundary < 100 && incident === "NORMAL") boundary = Math.min(100, boundary + 0.15);
    emit();
  }, 1000));
  timers.push(window.setInterval(() => {
    if (armed) void runCycle();
  }, 14000));
  timers.push(window.setInterval(() => persist(), 8000));
  void timers;
}

export function boot(): Promise<void> {
  if (bootPromise) return bootPromise;
  bootPromise = doBoot();
  return bootPromise;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Snapshot {
  return live;
}

export function getServerSnapshot(): Snapshot {
  return BOOT;
}
