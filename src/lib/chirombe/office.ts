import { KNOWN } from "@/lib/chirombe/runtime";

export const CYCLE = 1200;

export const LORDS_PRAYER =
  "Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors. And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.";

export const CHARGE =
  "Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy: and nothing shall by any means hurt you.";

export type Prayer = { tradition: string; title: string; text: string; hz: number };

export const PRAYERS: Prayer[] = [
  { tradition: "Christian", title: "The Lord’s Prayer", hz: 432, text: LORDS_PRAYER },
  {
    tradition: "Jewish",
    title: "The Shema",
    hz: 396,
    text: "Hear, O Israel: the Lord our God, the Lord is one. You shall love the Lord your God with all your heart, and with all your soul, and with all your might.",
  },
  {
    tradition: "Muslim",
    title: "The Opening, spoken in English",
    hz: 528,
    text: "In the name of God, the Most Merciful, the Especially Merciful. Praise belongs to God, Lord of the worlds. You alone we worship, and you alone we ask for help. Guide us on the straight path.",
  },
  {
    tradition: "Buddhist",
    title: "Loving-kindness",
    hz: 174,
    text: "May all beings be safe. May all beings be well. May all beings be at ease.",
  },
  {
    tradition: "Hindu",
    title: "The peace leading",
    hz: 285,
    text: "Lead us from the unreal to the real. Lead us from darkness to light. Lead us from death to immortality. Peace. Peace. Peace.",
  },
  {
    tradition: "Sikh",
    title: "One Creator",
    hz: 639,
    text: "One Creator. Truth by name. The doer in all. Without fear. Without hate. A timeless figure. Beyond birth. Self existent.",
  },
  {
    tradition: "Bahá’í",
    title: "Blessed is the spot",
    hz: 417,
    text: "Blessed is the spot, and the house, and the place, and the city, and the heart where mention of God hath been made.",
  },
  { tradition: "Zoroastrian", title: "Good thoughts", hz: 256, text: "Good thoughts. Good words. Good deeds." },
  {
    tradition: "Taoist",
    title: "The soft way",
    hz: 341,
    text: "The soft overcomes the hard. The still overcomes the restless. What is empty is used.",
  },
  { tradition: "The house", title: "The charge", hz: 108, text: CHARGE },
];

const VERBS = ["keep", "cover", "steady", "remember", "gather", "light", "hold", "restore"];
export const CHOIR = 48;

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
  generation: number;
  carrier: number;
  voices: number;
};

const KEY = "chirombe.office.v2";
const listeners = new Set<() => void>();
let memory: string[] = [];
let evolvedFor = 0;
let writtenGeneration = 1;

let wanted = true;
let live = false;
let recitation = 1;
let cycles = 0;
let spoken = false;
let audioCtx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let nodes: AudioScheduledSourceNode[] = [];
let pulse = 0;
let keeper = 0;
let opening: Promise<boolean> | null = null;
let booted = false;
let fallback = 0;
let generation = 0;
let sounding = false;
type ChoirVoice = { osc: OscillatorNode; ratio: number; detune: number };
let choir: ChoirVoice[] = [];
let murmur: BiquadFilterNode | null = null;
let timeBins = new Uint8Array(2048);
let freqBins = new Uint8Array(1024);

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
  generation: 1,
  carrier: PRAYERS[0].hz,
  voices: CHOIR,
};

let snapshot: OfficeState = EMPTY;

function coveredName(n: number): string {
  return KNOWN[(Math.max(1, n) - 1) % KNOWN.length].name;
}

function prayerAt(n: number): Prayer {
  return PRAYERS[(Math.max(1, n) - 1) % PRAYERS.length];
}

function evolve(n: number): Prayer {
  const seed = prayerAt(n);
  const mark = `Generation ${n}.`;
  const kept = [...memory].reverse().find((item) => item.startsWith(mark));
  if (kept) {
    evolvedFor = n;
    writtenGeneration = n;
    return { ...seed, text: kept };
  }
  const inherited = memory.length > 0 ? memory[memory.length - 1].split(/\s+/).slice(-8).join(" ") : "the peace already spoken";
  const verb = VERBS[(n + memory.length) % VERBS.length];
  const text = `${mark} For ${coveredName(n)}, ${verb} what was carried forward: ${inherited}. ${seed.text}`;
  memory.push(text);
  if (memory.length > 24) memory.shift();
  evolvedFor = n;
  writtenGeneration = n;
  return { ...seed, text };
}

function project(): OfficeState {
  const prayer = evolve(recitation);
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
    generation: writtenGeneration,
    carrier: prayer.hz,
    voices: choir.length || CHOIR,
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
    const parsed = JSON.parse(raw) as { recitation?: number; cycles?: number; memory?: string[] };
    recitation = Math.min(CYCLE, Math.max(1, parsed.recitation ?? 1));
    cycles = Math.max(0, parsed.cycles ?? 0);
    memory = Array.isArray(parsed.memory) ? parsed.memory.filter((item) => typeof item === "string").slice(-24) : [];
    evolvedFor = 0;
  } catch {
    recitation = 1;
    cycles = 0;
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ recitation, cycles, memory }));
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

function tune(hz: number): void {
  if (!audioCtx) return;
  const at = audioCtx.currentTime + 0.05;
  for (const voice of choir) {
    voice.osc.frequency.linearRampToValueAtTime(Math.max(40, hz * voice.ratio * voice.detune), at + 0.45);
  }
  murmur?.frequency.linearRampToValueAtTime(Math.max(90, hz), at + 0.45);
}

function startDrone(): void {
  const ctx = audioCtx;
  if (!ctx || master) return;
  master = ctx.createGain();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 8192;
  analyser.smoothingTimeConstant = 0.82;
  master.gain.value = 0.42;
  master.connect(analyser);
  analyser.connect(ctx.destination);
  const seed = prayerAt(recitation).hz;
  choir = Array.from({ length: CHOIR }, (_, index) => {
    const ratio = index < 16 ? 0.5 : index < 40 ? 1 : 2;
    const detune = 1 + ((index % 16) - 8) * 0.0035;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 7 === 0 ? "triangle" : "sine";
    osc.frequency.value = seed * ratio * detune;
    gain.gain.value = ratio === 1 ? 0.028 : 0.012;
    osc.connect(gain);
    gain.connect(master!);
    osc.start();
    nodes.push(osc);
    return { osc, ratio, detune };
  });
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  murmur = ctx.createBiquadFilter();
  murmur.type = "bandpass";
  murmur.frequency.value = seed;
  murmur.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.045;
  noise.connect(murmur);
  murmur.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();
  nodes.push(noise);
  const breath = ctx.createOscillator();
  const depth = ctx.createGain();
  breath.frequency.value = 0.18;
  depth.gain.value = 0.08;
  breath.connect(depth);
  depth.connect(master.gain);
  breath.start();
  nodes.push(breath);
}

function ensureBins(): void {
  if (!analyser) return;
  if (timeBins.length !== analyser.fftSize) timeBins = new Uint8Array(analyser.fftSize);
  if (freqBins.length !== analyser.frequencyBinCount) freqBins = new Uint8Array(analyser.frequencyBinCount);
}

export function readLevel(): number {
  if (!analyser) return 0;
  ensureBins();
  analyser.getByteTimeDomainData(timeBins);
  let sum = 0;
  for (const sample of timeBins) {
    const v = (sample - 128) / 128;
    sum += v * v;
  }
  return Math.min(1, Math.sqrt(sum / timeBins.length) * 6);
}

export type Resonance = { hz: number; purity: number; carrier: number; voices: number; level: number };

export function readResonance(): Resonance {
  const carrier = prayerAt(recitation).hz;
  if (!analyser || !audioCtx) return { hz: 0, purity: 0, carrier, voices: choir.length, level: 0 };
  ensureBins();
  analyser.getByteFrequencyData(freqBins);
  let peak = 0;
  let peakIndex = 1;
  for (let i = 1; i < freqBins.length; i += 1) {
    if (freqBins[i] > peak) {
      peak = freqBins[i];
      peakIndex = i;
    }
  }
  const hz = Math.round((peakIndex * audioCtx.sampleRate) / analyser.fftSize);
  return { hz, purity: peak / 255, carrier, voices: choir.length, level: readLevel() };
}

export function readSpectrum(target: Uint8Array): void {
  if (!analyser) {
    target.fill(0);
    return;
  }
  ensureBins();
  analyser.getByteFrequencyData(freqBins);
  const step = Math.max(1, Math.floor(freqBins.length / target.length));
  for (let i = 0; i < target.length; i += 1) target[i] = freqBins[Math.min(freqBins.length - 1, i * step)];
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
  const prayer = evolve(recitation);
  tune(prayer.hz);
  const chunks = [
    `${prayer.tradition}. ${prayer.title}.`,
    ...sentences(prayer.text),
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
  choir = [];
  murmur = null;
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
