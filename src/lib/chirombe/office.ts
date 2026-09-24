import { KNOWN } from "@/lib/chirombe/runtime";

export const CYCLE = 1200;

export const LORDS_PRAYER =
  "Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors. And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.";

export const CHARGE =
  "Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy: and nothing shall by any means hurt you.";

export type OfficeState = {
  wanted: boolean;
  live: boolean;
  recitation: number;
  cycles: number;
  coveredName: string;
  spoken: boolean;
};

const KEY = "chirombe.office.v1";
const TONES = [174, 285, 432, 528, 639];

const listeners = new Set<() => void>();
let wanted = true;
let live = false;
let recitation = 1;
let cycles = 0;
let spoken = false;
let audioCtx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: OscillatorNode[] = [];
let pulse = 0;
let utterance: SpeechSynthesisUtterance | null = null;
let opening: Promise<boolean> | null = null;
let booted = false;
let fallback = 0;

const EMPTY: OfficeState = {
  wanted: true,
  live: false,
  recitation: 1,
  cycles: 0,
  coveredName: KNOWN[0].name,
  spoken: false,
};

let snapshot: OfficeState = EMPTY;

function coveredName(n: number): string {
  return KNOWN[(Math.max(1, n) - 1) % KNOWN.length].name;
}

function project(): OfficeState {
  return {
    wanted,
    live,
    recitation,
    cycles,
    coveredName: coveredName(recitation),
    spoken,
  };
}

function emit(): void {
  snapshot = project();
  listeners.forEach((listener) => listener());
}

function load(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { recitation?: number; cycles?: number };
    recitation = Math.min(CYCLE, Math.max(1, parsed.recitation ?? 1));
    cycles = Math.max(0, parsed.cycles ?? 0);
  } catch {
    recitation = 1;
    cycles = 0;
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ recitation, cycles }));
  } catch {
    /* private mode */
  }
}

function advance(): void {
  if (recitation >= CYCLE) {
    recitation = 1;
    cycles += 1;
  } else {
    recitation += 1;
  }
  save();
  emit();
  if (wanted) speak();
}

function speak(): void {
  if (!wanted) return;
  const synth = window.speechSynthesis;
  if (!synth) {
    spoken = false;
    window.clearTimeout(fallback);
    fallback = window.setTimeout(advance, 18000);
    emit();
    return;
  }
  synth.cancel();
  const next = new SpeechSynthesisUtterance(`${LORDS_PRAYER} This recitation covers ${coveredName(recitation)}.`);
  next.rate = 0.92;
  next.pitch = 1;
  next.volume = 1;
  next.onend = () => {
    spoken = true;
    advance();
  };
  next.onerror = () => {
    spoken = false;
    window.clearTimeout(fallback);
    fallback = window.setTimeout(advance, 18000);
  };
  utterance = next;
  spoken = true;
  synth.speak(next);
  emit();
}

async function ensureAudio(): Promise<boolean> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return false;
  audioCtx = audioCtx ?? new Ctx();
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {
      return false;
    }
  }
  return audioCtx.state === "running";
}

function startDrone(): void {
  if (!audioCtx || master) return;
  master = audioCtx.createGain();
  master.gain.value = 0.0001;
  master.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  master.gain.exponentialRampToValueAtTime(0.035, now + 1.2);
  nodes = TONES.map((hz, index) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = hz;
    gain.gain.value = index === 2 ? 0.55 : 0.18;
    osc.connect(gain);
    gain.connect(master!);
    osc.start();
    return osc;
  });
  window.clearInterval(pulse);
  pulse = window.setInterval(() => {
    if (!audioCtx || !master || !wanted) return;
    const at = audioCtx.currentTime;
    master.gain.cancelScheduledValues(at);
    master.gain.setValueAtTime(Math.max(0.02, master.gain.value), at);
    master.gain.linearRampToValueAtTime(0.045, at + 2.5);
    master.gain.linearRampToValueAtTime(0.028, at + 5);
  }, 5000);
}

function stopSound(): void {
  window.clearInterval(pulse);
  pulse = 0;
  window.clearTimeout(fallback);
  fallback = 0;
  window.speechSynthesis?.cancel();
  utterance = null;
  nodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      /* already stopped */
    }
  });
  nodes = [];
  master?.disconnect();
  master = null;
  spoken = false;
}

export async function openOffice(): Promise<boolean> {
  if (live && wanted) return true;
  if (opening) return opening;
  opening = unlock().finally(() => {
    opening = null;
  });
  return opening;
}

async function unlock(): Promise<boolean> {
  wanted = true;
  const unlocked = await ensureAudio();
  if (!unlocked) {
    live = false;
    emit();
    return false;
  }
  if (!live) {
    live = true;
    startDrone();
    speak();
  }
  emit();
  return true;
}

export function stillOffice(): void {
  wanted = false;
  live = false;
  stopSound();
  emit();
}

export function bootOffice(): void {
  if (booted) return;
  booted = true;
  load();
  emit();
  const unlockTap = () => {
    if (wanted && !live) void openOffice();
  };
  window.addEventListener("pointerdown", unlockTap);
  void openOffice();
}

export function subscribeOffice(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficeSnapshot(): OfficeState {
  return snapshot;
}

export function getOfficeServerSnapshot(): OfficeState {
  return EMPTY;
}
