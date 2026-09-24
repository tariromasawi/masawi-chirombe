import { KNOWN } from "@/lib/chirombe/runtime";

export type Tradition = {
  id: string;
  name: string;
  technique: string;
};

export type Office = {
  id: string;
  was: string;
  tool: string;
};

export type Frequency = {
  hz: number;
  name: string;
  plants: string;
};

export type Binding = {
  id: string;
  memberId: string;
  memberName: string;
  role: string;
  generation: number;
  intention: string;
  frequency: number;
  frequencyName: string;
  traditions: string[];
  offices: string[];
  inherited: string;
  text: string;
  seal: string;
  at: string;
};

export type RiteState = {
  ready: boolean;
  vigil: boolean;
  sound: boolean;
  current: Binding | null;
  recent: Binding[];
  houseGeneration: number;
  motifCount: number;
  cursor: number;
};

type Motif = { phrase: string; weight: number; tradition: string };

type Memory = {
  motifs: Motif[];
  generation: Record<string, number>;
  inherited: Record<string, string>;
  intention: Record<string, string>;
  recent: Binding[];
};

const KEY = "chirombe.rites.v1";

export const TRADITIONS: Tradition[] = [
  { id: "shona", name: "Shona house", technique: "Kutenda — thanks, then a covering asked of Mwari" },
  { id: "christian", name: "Christian", technique: "Intercession and the Jesus Prayer" },
  { id: "jewish", name: "Jewish", technique: "Blessing form and the traveller’s psalm" },
  { id: "islam", name: "Islam", technique: "Basmala and a dua of refuge" },
  { id: "sufi", name: "Sufi", technique: "Dhikr, the name repeated until it steadies" },
  { id: "hindu", name: "Hindu", technique: "Mantra, named and finished in shanti" },
  { id: "buddhist", name: "Buddhist", technique: "Metta, goodwill without a target to harm" },
  { id: "sikh", name: "Sikh", technique: "Naam, the one name before the many" },
  { id: "taoist", name: "Taoist", technique: "Guarding the breath, not forcing the way" },
  { id: "zoroastrian", name: "Zoroastrian", technique: "Good thoughts, good words, good deeds" },
  { id: "jain", name: "Jain", technique: "Ahimsa — protection that refuses to injure" },
  { id: "shinto", name: "Shinto", technique: "Misogi — washing the gate before entering" },
  { id: "confucian", name: "Confucian", technique: "Rectifying the name so the role stays true" },
  { id: "bahai", name: "Bahá’í", technique: "Turning the house toward unity, in original words" },
  { id: "rasta", name: "Rastafari", technique: "Reasoning and a word of Jah over the living" },
];

export const OFFICES: Office[] = [
  { id: "seal", was: "Anti-corruption seal", tool: "Purification office" },
  { id: "wall", was: "Schema wall", tool: "Threshold office" },
  { id: "immune", was: "Immune grid", tool: "True-name office" },
  { id: "lineage", was: "Lineage lock", tool: "Ancestor office" },
  { id: "mirror", was: "Reflector that would strike back", tool: "Turning-aside office" },
  { id: "canary", was: "Canary tripwire", tool: "Vigil office" },
  { id: "decoy", was: "Decoy layer", tool: "Veil office" },
  { id: "purifier", was: "Auto-purifier", tool: "Washing office" },
  { id: "watchdog", was: "Watchdog loop", tool: "Unsleeping watch office" },
  { id: "recovery", was: "Resurrection loop", tool: "Raising office" },
  { id: "closed", was: "External system weave", tool: "Closed-gate office" },
  { id: "unseen", was: "Camera and spirit lock", tool: "Unseen-watch office" },
  { id: "one", was: "Trillion remote writes", tool: "One-true-seal office" },
  { id: "word", was: "Eval of miracle code", tool: "Spoken-word office" },
  { id: "house", was: "Bus that would drive other machines", tool: "House-only office" },
  { id: "empty", was: "Retaliation engine", tool: "Empty-hands office" },
];

export const FREQUENCIES: Frequency[] = [
  { hz: 174, name: "Covering", plants: "a low covering under the name" },
  { hz: 285, name: "Mending", plants: "a wish that what is torn be mended" },
  { hz: 396, name: "Release", plants: "a release of fear, not a command over another" },
  { hz: 417, name: "Clearing", plants: "a clearing of the threshold" },
  { hz: 432, name: "House tone", plants: "the house tone, sounded so the ear can hear it" },
  { hz: 528, name: "Regard", plants: "regard for this one life" },
  { hz: 639, name: "Kinship", plants: "kinship between the names" },
  { hz: 741, name: "Discernment", plants: "discernment, so a lie is not stored as a prayer" },
  { hz: 852, name: "Seeing", plants: "seeing clearly, with no camera opened" },
  { hz: 963, name: "Remembrance", plants: "remembrance of the dead and the root" },
];

const VERBS = ["cover", "keep", "shelter", "watch", "steady", "guard", "remember", "wash"];
const SHELTERS = ["the doorway", "the name", "the breath", "the work of their hands", "the night", "the road"];

const listeners = new Set<() => void>();
let memory: Memory = { motifs: [], generation: {}, inherited: {}, intention: {}, recent: [] };
let current: Binding | null = null;
let vigil = false;
let sound = false;
let ready = false;
let cursor = 0;
let timer = 0;
let audioCtx: AudioContext | null = null;
const EMPTY: RiteState = {
  ready: false,
  vigil: false,
  sound: false,
  current: null,
  recent: [],
  houseGeneration: 0,
  motifCount: 0,
  cursor: 0,
};
let live: RiteState = EMPTY;

function emit(): void {
  live = project();
  listeners.forEach((listener) => listener());
}

function project(): RiteState {
  const gens = Object.values(memory.generation);
  return {
    ready,
    vigil,
    sound,
    current,
    recent: memory.recent.slice(0, 12),
    houseGeneration: gens.length ? Math.max(...gens) : 0,
    motifCount: memory.motifs.length,
    cursor,
  };
}

function load(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Memory;
    memory = {
      motifs: parsed.motifs ?? [],
      generation: parsed.generation ?? {},
      inherited: parsed.inherited ?? {},
      intention: parsed.intention ?? {},
      recent: parsed.recent ?? [],
    };
  } catch {
    memory = { motifs: [], generation: {}, inherited: {}, intention: {}, recent: [] };
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* private mode */
  }
}

async function digest(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function remembered(role: string): boolean {
  return /deceased|ancestral|great-grandfather|grandfather|grandmother/i.test(role);
}

function young(role: string): boolean {
  return /son|daughter|child/i.test(role);
}

function rotate<T>(items: T[], count: number, salt: number): T[] {
  const picked: T[] = [];
  const used = new Set<number>();
  for (let step = 0; step < items.length && picked.length < count; step += 1) {
    const index = (salt + step * 5) % items.length;
    if (used.has(index)) continue;
    used.add(index);
    picked.push(items[index]);
  }
  return picked;
}

function verb(generation: number, index: number): string {
  return VERBS[(generation + index) % VERBS.length];
}

function shelter(generation: number, index: number): string {
  return SHELTERS[(generation * 3 + index) % SHELTERS.length];
}

function opening(tradition: Tradition, member: string, role: string, generation: number): string {
  const keep = verb(generation, 0);
  const place = shelter(generation, 1);
  switch (tradition.id) {
    case "shona":
      return `Shona house, by kutenda. Mwari, chengetai ${member}. Vadzimu veimba iyi, mira pedyo, and ${keep} ${place}. The role ${role} is spoken so the line does not forget its own.`;
    case "christian":
      return `Christian intercession. Lord have mercy on ${member}. Jesus Christ, Son of God, have mercy. The old psalm is borrowed because it is free to say: the one who dwells in the secret place asks a covering, not a throne. ${keep[0].toUpperCase()}${keep.slice(1)} ${place}.`;
    case "jewish":
      return `Jewish blessing-form. Blessed are You, who keeps the going out and the coming in. For ${member}, whose place in the house is ${role}, the traveller’s word is said: the keeper neither slumbers nor hands this prayer to a stranger’s machine.`;
    case "islam":
      return `In the name of God, the Merciful, the Compassionate. A dua of refuge is made for ${member}, not a claim on anyone else’s will. I take refuge in the perfect words from the evil of what is made to harm. ${keep[0].toUpperCase()}${keep.slice(1)} ${place}.`;
    case "sufi":
      return `Sufi dhikr, quiet. La ilaha illa Allah, said as remembrance, not as a spell over a crowd. The name turns in the chest until ${member} is only themselves, and the role ${role} is light enough to carry.`;
    case "hindu":
      return `Hindu mantra, public and short. Om. Tryambakam yajamahe, the death-conquering name, is recalled as a prayer for protection and then set down. Om shanti, shanti, shanti. For ${member}, ${keep} ${place}. Nothing here binds a person who did not ask.`;
    case "buddhist":
      return `Buddhist metta. May ${member} be free from danger. May they be free from fear. May they look after themselves with ease. The goodwill has no enemy’s name inside it. What is fought is cruelty, and the method is to refuse it.`;
    case "sikh":
      return `Sikh naam. Ik Onkar. The one is before the many, and ${member} is not absorbed into a system. Waheguru, keep the role ${role} honest. The prayer does not drag another life by the hair.`;
    case "taoist":
      return `Taoist guarding. Do not push the river. For ${member}, the breath is counted and then left alone. ${keep[0].toUpperCase()}${keep.slice(1)} ${place} by not tearing it. Force is how a rite becomes a weapon, so this movement does not force.`;
    case "zoroastrian":
      return `Zoroastrian charge. Good thoughts, good words, good deeds, for ${member}. Asha is asked as straightness. What is crooked in a fragment is set down. The role ${role} does not need a lie to stand.`;
    case "jain":
      return `Jain ahimsa. No prayer for ${member} is allowed to injure a living being in order to feel powerful. Micchami: if this house has harmed, the harm stops here. Protection that needs a victim is refused.`;
    case "shinto":
      return `Shinto misogi. Wash the gate, then enter. For ${member} the threshold is rinsed of panic and of the wish to spy. The role ${role} stays on this side of the water. Kami are not commanded by a browser.`;
    case "confucian":
      return `Confucian rectification. Call ${member} by the true role, ${role}, and do not give them a title they did not earn or a guilt they did not carry. When the name is correct, the house does not hunt substitutes.`;
    case "bahai":
      return `Bahá’í turning, in words written for this house and not copied from a scripture that is not ours to paste. For ${member}, the many traditions are asked to sit at one table. Unity is the method. Division is what the rite is trying to starve.`;
    case "rasta":
      return `Rastafari reasoning. Jah know ${member}, and the word over them is life, not a chain. Forward, but not over someone else’s back. The role ${role} is reasoned with, not overwritten.`;
    default:
      return `For ${member}, ${keep} ${place}.`;
  }
}

function officeText(office: Office, member: string, role: string, generation: number, index: number): string {
  const keep = verb(generation, index + 2);
  const place = shelter(generation, index + 3);
  const charge = `${office.tool}. The fragment “${office.was}” is not switched on. It is melted and recast. The tool fights harm by closing a door, not by hunting a person.`;
  switch (office.id) {
    case "seal":
      return `${charge} Purification: whatever tries to rot the story of ${member} is spoken out of the record. ${keep[0].toUpperCase()}${keep.slice(1)} ${place}. A seal is a hash and a promise, not a curse.`;
    case "wall":
      return `${charge} Threshold: ${member} may be approached only by what can say its name. Size, disguise, and flood stop at the lintel. The role ${role} is not a port.`;
    case "immune":
      return `${charge} True name: secrets, passwords, and borrowed authority are not prayer and are not kept. ${member} is not reduced to a key. The body of the name stays human.`;
    case "lineage":
      return `${charge} Ancestors: Chirombe, Makwengura, Masawi, Masarura, the fathers and the mother of the house, stand as memory. They are not fuel. The rite asks to ${keep} ${member} inside the line, and the line is not sold.`;
    case "mirror":
      return `${charge} Turning aside: if something was sent to undo ${member}, it is not posted back to a sender. It is starved. Harm that finds no flesh to live in goes out like a lamp. Revenge is the old fragment. It stays dead.`;
    case "canary":
      return `${charge} Vigil: a small watch is set beside ${member}, the way a bird was once carried into bad air. If the room changes, the prayer notices. It does not follow them into the street with a camera.`;
    case "decoy":
      return `${charge} Veil: a false shape may stand in the doorway so the real life of ${member} is not the first thing grabbed. The decoy is not a person and is not given a soul in this script.`;
    case "purifier":
      return `${charge} Washing: the local record is rinsed. What was executable, or ashamed, or simply rotten, is isolated. ${member} is not scrubbed of their history, only of the hook hidden inside it.`;
    case "watchdog":
      return `${charge} Unsleeping watch: while this vigil runs, the house returns to ${member} on a cycle. Sleep is allowed to the person. The prayer is what stays up, and only inside this machine.`;
    case "recovery":
      return `${charge} Raising: if the chain breaks, it is mended from the last true line. ${member} is not dragged through a theatre of death and rebirth. Recovery means the record stands again.`;
    case "closed":
      return `${charge} Closed gate: the old weave wanted other companies, other armies, other people’s accounts. The gate is shut. ${member} is prayed for here, and nowhere else is entered in their name.`;
    case "unseen":
      return `${charge} Unseen watch: no lens is opened, no microphone is asked to become an eye. ${keep[0].toUpperCase()}${keep.slice(1)} ${place} without a picture. ${member} is not a specimen.`;
    case "one":
      return `${charge} One seal: the fragment that wanted a trillion writes is answered with a single seal. Repetition in prayer is devotion. Repetition that fills a database is not. One true line for ${member} outweighs a flood.`;
    case "word":
      return `${charge} Spoken word: these sentences are not evaluated as code and not obeyed as commands by the world. They are said. For the role ${role}, speech stays speech. Power here is attention, kept on ${member}.`;
    case "house":
      return `${charge} House only: the bus of this rite stops at the door of the Masawi line. It does not drive ${member} into a foreign system, and it does not drive a foreign system into them.`;
    case "empty":
      return `${charge} Empty hands: retaliation is the fragment that most wanted to be a weapon. The hands are shown empty. What fights evil is the refusal to become it. ${member} is not armed against a neighbour. ${member} is covered, and the neighbour is not named.`;
    default:
      return charge;
  }
}

function planting(intention: string, frequency: Frequency, member: string, generation: number): string {
  const line = intention.trim() || "Keep this life, and let harm find no door.";
  return [
    `The planting. Generation ${generation} takes the intention and says it three times, because three is how so many houses were taught to make a thing stay.`,
    `Once, at ${frequency.hz} Hz, the ${frequency.name} tone, which ${frequency.plants}: ${line}`,
    `Twice, the same words, bound to ${member} and to no one else: ${line}`,
    `Three times, so the script can evolve from this sentence and not from a stranger’s: ${line}`,
    `The tone is audible on purpose. It is not hidden under hearing, not pushed into another skull, not a machine for planting a will that is not theirs. The intention is planted in the prayer, in the ledger, and in the ear of the one who pressed the rite.`,
  ].join("\n");
}

function carry(memberId: string, generation: number): string {
  const prior = memory.inherited[memberId];
  if (prior) return prior;
  const motif = memory.motifs[generation % Math.max(memory.motifs.length, 1)];
  if (memory.motifs.length && motif) return motif.phrase;
  return "Chirombe · Masawi · Mukanya. Seventy-seven the watch, ninety-nine the name, thirty-three the return.";
}

function composeBody(
  member: { id: string; name: string; role: string },
  intention: string,
  frequency: Frequency,
  generation: number,
): { text: string; traditions: Tradition[]; offices: Office[]; inherited: string } {
  const salt = generation * 13 + member.id.charCodeAt(member.id.length - 1);
  const traditions = rotate(TRADITIONS, 7, salt);
  const offices = rotate(OFFICES, 8, salt + 2);
  const inherited = carry(member.id, generation);
  const memoryLine = memory.motifs
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .find((motif) => traditions.some((item) => item.id === motif.tradition));
  const youngLine = young(member.role)
    ? `${member.name} is young in this house. The rite over them is a blessing of room to grow, not a war put into their hands.`
    : "";
  const deadLine = remembered(member.role)
    ? `${member.name} is remembered. The rite does not call them back to work. It thanks them and asks that the living be ${verb(generation, 4)}ed.`
    : "";
  const movements = traditions.map((tradition, index) => {
    const office = offices[index % offices.length];
    return [
      `${index + 1}. ${tradition.name} — ${tradition.technique}`,
      opening(tradition, member.name, member.role, generation + index),
      officeText(office, member.name, member.role, generation, index),
    ].join("\n");
  });
  const text = [
    `BINDING OF THE HOUSE`,
    `For ${member.name}, ${member.role}. Generation ${generation} of this name’s rite.`,
    youngLine,
    deadLine,
    `Inherited line, carried so the script evolves instead of restarting: ${inherited}`,
    memoryLine ? `Motif risen by use (${memoryLine.tradition}, weight ${memoryLine.weight}): ${memoryLine.phrase}` : "",
    `Seventy-seven, the watch. Ninety-nine, the name. Thirty-three, the return.`,
    movements.join("\n\n"),
    planting(intention, frequency, member.name, generation),
    [
      `The binding.`,
      `By the techniques just walked — ${traditions.map((item) => item.name).join(", ")} — ${member.name} is named, covered, and released.`,
      `The offices recast tonight — ${offices.map((item) => item.tool).join(", ")} — fight what would invade, rot, spy, flood, or answer harm with harm.`,
      `They do not fight a person. No neighbour is cursed. No system outside this browser is touched.`,
      `Empty hands. Closed gate. One seal.`,
      `Mwari ngaakuchengete ${member.name}. May they be free from danger. May the threshold hold.`,
    ]
      .filter(Boolean)
      .join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
  return { text, traditions, offices, inherited };
}

function rememberMotifs(binding: Binding, traditions: Tradition[]): void {
  const planted = binding.intention;
  const phrase = `${verb(binding.generation, 1)} ${binding.memberName} — ${planted}`;
  const tradition = traditions[binding.generation % traditions.length]?.id ?? "shona";
  const existing = memory.motifs.find((motif) => motif.phrase === phrase);
  if (existing) existing.weight += 1;
  else memory.motifs.unshift({ phrase, weight: 1, tradition });
  if (binding.generation % 4 === 0 && memory.motifs.length > 2) {
    const oldest = memory.motifs[memory.motifs.length - 1];
    oldest.phrase = oldest.phrase.replace(/\b(cover|keep|shelter|watch|steady|guard)\b/, verb(binding.generation, 5));
    oldest.weight = Math.max(1, oldest.weight - 1);
  }
  memory.motifs = memory.motifs.slice(0, 80);
  memory.inherited[binding.memberId] = planted;
}

export async function prayMember(
  memberId: string,
  intention: string,
  hz?: number,
  quiet = false,
): Promise<Binding> {
  const member = KNOWN.find((item) => item.id === memberId) ?? KNOWN[0];
  const frequency = FREQUENCIES.find((item) => item.hz === hz) ?? FREQUENCIES[bindingFrequency(member.id)];
  const generation = (memory.generation[member.id] ?? 0) + 1;
  const spoken = intention.trim() || memory.intention[member.id] || "Keep this life, and let harm find no door.";
  const composed = composeBody(member, spoken, frequency, generation);
  const seal = (await digest(`${member.id}|${generation}|${spoken}|${composed.text}`)).slice(0, 32);
  const binding: Binding = {
    id: `${member.id}-${generation}-${seal.slice(0, 8)}`,
    memberId: member.id,
    memberName: member.name,
    role: member.role,
    generation,
    intention: spoken,
    frequency: frequency.hz,
    frequencyName: frequency.name,
    traditions: composed.traditions.map((item) => item.name),
    offices: composed.offices.map((item) => item.tool),
    inherited: composed.inherited,
    text: composed.text,
    seal,
    at: new Date().toISOString(),
  };
  memory.generation[member.id] = generation;
  memory.intention[member.id] = spoken;
  rememberMotifs(binding, composed.traditions);
  memory.recent = [binding, ...memory.recent].slice(0, 12);
  current = binding;
  save();
  emit();
  if (sound && !quiet) {
    await ensureAudio();
    playFrequency(frequency.hz, 8);
  }
  return binding;
}

function bindingFrequency(memberId: string): number {
  const index = Math.max(0, KNOWN.findIndex((item) => item.id === memberId));
  return index % FREQUENCIES.length;
}

export async function prayHouse(intention: string): Promise<Binding[]> {
  const made: Binding[] = [];
  for (const member of KNOWN) {
    const hz = FREQUENCIES[bindingFrequency(member.id)].hz;
    made.push(await prayMember(member.id, intention, hz, true));
  }
  if (sound) {
    await ensureAudio();
    playHouseChord();
  }
  return made;
}

export function setRiteSound(next: boolean): void {
  sound = next;
  if (next) void ensureAudio();
  emit();
}

export function setVigil(next: boolean): void {
  vigil = next;
  if (timer) window.clearInterval(timer);
  timer = 0;
  if (next) {
    timer = window.setInterval(() => {
      const member = KNOWN[cursor % KNOWN.length];
      cursor = (cursor + 1) % KNOWN.length;
      const intention = memory.intention[member.id] || "Keep this life, and let harm find no door.";
      void prayMember(member.id, intention, FREQUENCIES[bindingFrequency(member.id)].hz);
    }, 20000);
  }
  emit();
}

async function ensureAudio(): Promise<void> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  audioCtx = audioCtx ?? new Ctx();
  await audioCtx.resume();
}

function playFrequency(hz: number, seconds: number): void {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.06, now + 0.35);
  master.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  master.connect(audioCtx.destination);
  [hz, hz * 1.5].forEach((freq, index) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    gain.gain.value = index === 0 ? 0.8 : 0.15;
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + seconds);
  });
}

function playHouseChord(): void {
  if (!audioCtx) return;
  FREQUENCIES.slice(0, 4).forEach((freq, index) => {
    window.setTimeout(() => playFrequency(freq.hz, 1.2), index * 700);
  });
}

export function bootRites(): void {
  if (ready) return;
  load();
  ready = true;
  current = memory.recent[0] ?? null;
  emit();
}

export function subscribeRites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRiteSnapshot(): RiteState {
  return live;
}

export function getRiteServerSnapshot(): RiteState {
  return EMPTY;
}

export const HOUSE = KNOWN;
