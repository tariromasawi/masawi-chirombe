import { KNOWN } from "@/lib/chirombe/runtime";

export const CYCLE = 1200;

export const LORDS_PRAYER =
  "Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors. And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.";

export const CHARGE =
  "Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy: and nothing shall by any means hurt you.";

export type Prayer = { tradition: string; title: string; text: string };

export const PRAYERS: Prayer[] = [
  { tradition: "Christian", title: "The Lord’s Prayer", text: LORDS_PRAYER },
  {
    tradition: "Jewish",
    title: "The Shema",
    text: "Hear, O Israel: the Lord our God, the Lord is one. You shall love the Lord your God with all your heart, and with all your soul, and with all your might.",
  },
  {
    tradition: "Muslim",
    title: "The Opening, spoken in English",
    text: "In the name of God, the Most Merciful, the Especially Merciful. Praise belongs to God, Lord of the worlds. The Most Merciful, the Especially Merciful, Master of the Day of Judgment. You alone we worship, and you alone we ask for help. Guide us on the straight path.",
  },
  {
    tradition: "Buddhist",
    title: "Loving-kindness",
    text: "May all beings be safe. May all beings be well. May all beings be at ease. May this house be held in kindness.",
  },
  {
    tradition: "Hindu",
    title: "The peace leading",
    text: "Lead us from the unreal to the real. Lead us from darkness to light. Lead us from death to immortality. Peace. Peace. Peace.",
  },
  { tradition: "The house", title: "The charge", text: CHARGE },
];

export type OfficeState = {
  wanted: boolean;
  live: boolean;
  recitation: number;
  cycles: number;
  coveredName: string;
  spoken: boolean;
  tradition: string;
  title: string;
  line: string;
};

const KEY = "chirombe.office.v1";
const TONES = [108, 174, 285, 432, 528];

const listeners = new Set<() => void>();
let wanted = true;
let live = false;
let recitation = 1;
let cycles = 0;
let spoken = false;
let audioCtx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let nodes: OscillatorNode[] = [];
let pulse = 0;
let keeper = 0;
let opening: Promise<boolean> | null = null;
let booted = false;
let fallback = 0;
let generation = 0;
let sounding = false;
const bins = new Uint8Array(64);

const EMPTY: OfficeState = {
  wanted: true,
  live: false,
  recitation: 1,
  cycles: 0,
  coveredName: KNOWN[0].name,
  spoken: false,
  tradition: PRAYERS[0].tradition,
  title: PRAYERS[0].title,
  line: PRAYERS[0].text,
};

let snapshot: OfficeState = EMPTY;

function coveredName(n: number): string {
  return KNOWN[(Math.max(1, n) - 1) % KNOWN.length].name;
}

function prayerAt(n: number): Prayer {
  return PRAYERS[(Math.max(1, n) - 1) % PRAYERS.length];
}

function project(): OfficeState {
  const prayer = prayerAt(recitation);
  return {
    wanted,
    live,
    recitation,
    cycles,
    coveredName: coveredName(recitation),
    spoken,
    tradition: prayer.tradition,
    title: prayer.title,
    line: prayer.text,
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

function context(): AudioContext | null {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = audioCtx ?? new Ctx();
  return audioCtx;
}

function startDrone(): void {
  const ctx = audioCtx;
  if (!ctx || master) return;
  master = ctx.createGain();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 64;
  master.gain.value = 0.22;
  master.connect(analyser);
  analyser.connect(ctx.destination);
  nodes = TONES.map((hz, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.value = hz;
    gain.gain.value = index === 0 ? 0.45 : 0.16;
    osc.connect(gain);
    gain.connect(master!);
    osc.start();
    return osc;
  });
  const breath = ctx.createOscillator();
  const depth = ctx.createGain();
  breath.frequency.value = 0.35;
  depth.gain.value = 0.06;
  breath.connect(depth);
  depth.connect(master.gain);
  breath.start();
  nodes.push(breath);
}

export function readLevel(): number {
  if (!analyser) return 0;
  analyser.getByteTimeDomainData(bins);
  let sum = 0;
  for (const sample of bins) {
    const v = (sample - 128) / 128;
    sum += v * v;
  }
  return Math.min(1, Math.sqrt(sum / bins.length) * 5);
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function speak(): void {
  if (!wanted || sounding) return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  sounding = true;
  const gen = ++generation;
  const prayer = prayerAt(recitation);
  const chunks = [
    `${prayer.tradition}. ${prayer.title}.`,
    ...sentences(prayer.text),
    `This saying covers ${coveredName(recitation)}.`,
  ];
  let index = 0;
  const nextChunk = () => {
    if (!wanted || gen !== generation) return;
    if (index >= chunks.length) {
      sounding = false;
      advance();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    index += 1;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = synth.getVoices().find((item) => /^en/i.test(item.lang));
    if (voice) utterance.voice = voice;
    utterance.onend = () => nextChunk();
    utterance.onerror = (event) => {
      if (gen !== generation) return;
      if (event.error === "not-allowed" || event.error === "interrupted" || event.error === "canceled") {
        sounding = false;
        spoken = false;
        emit();
        return;
      }
      window.clearTimeout(fallback);
      fallback = window.setTimeout(nextChunk, 1200);
    };
    synth.speak(utterance);
    spoken = true;
    emit();
  };
  synth.cancel();
  nextChunk();
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

function keepAlive(): void {
  window.clearInterval(keeper);
  keeper = window.setInterval(() => {
    const synth = window.speechSynthesis;
    if (!wanted || !synth) return;
    if (synth.speaking || synth.paused) synth.resume();
    else if (live && !sounding) speak();
  }, 4000);
}

export function soundPrayers(): void {
  wanted = true;
  const ctx = context();
  if (ctx && ctx.state === "suspended") void ctx.resume();
  startDrone();
  live = true;
  const synth = window.speechSynthesis;
  if (synth && !synth.speaking && !sounding) speak();
  keepAlive();
  emit();
}

export async function openOffice(): Promise<boolean> {
  soundPrayers();
  return live;
}

export function stillOffice(): void {
  wanted = false;
  live = false;
  generation += 1;
  sounding = false;
  window.clearInterval(pulse);
  window.clearInterval(keeper);
  pulse = 0;
  keeper = 0;
  window.clearTimeout(fallback);
  window.speechSynthesis?.cancel();
  nodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      /* already stopped */
    }
  });
  nodes = [];
  analyser?.disconnect();
  analyser = null;
  master?.disconnect();
  master = null;
  spoken = false;
  emit();
}

export function bootOffice(): void {
  if (booted) return;
  booted = true;
  load();
  emit();
  window.addEventListener(
    "pointerdown",
    () => {
      if (wanted) soundPrayers();
    },
    true,
  );
  window.speechSynthesis?.getVoices();
  window.speechSynthesis?.addEventListener("voiceschanged", () => {
    if (wanted && live && !window.speechSynthesis.speaking) speak();
  });
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
