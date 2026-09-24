const LEAD = ["✝", "☦", "☧", "☨", "☩", "✡", "ॐ", "☸", "☯", "☥", "✦", "✧", "✶", "✵", "❂", "✤", "♔", "♱", "♰", "⍟"];

function span(start: number, end: number): string[] {
  const out: string[] = [];
  for (let code = start; code <= end; code += 1) out.push(String.fromCodePoint(code));
  return out;
}

function buildSymbols(): string[] {
  const letters = [
    ...LEAD,
    ...span(0x05d0, 0x05ea),
    ...span(0x0391, 0x03a1),
    ...span(0x03a3, 0x03a9),
    ...span(0x03b1, 0x03c9),
    ...span(0x2c80, 0x2cb1),
    ...span(0x16a0, 0x16ea),
    ...span(0x1200, 0x124d),
    ...span(0x2c00, 0x2c2e),
  ];
  const glyphs = span(0x13000, 0x1342e);
  const out: string[] = [];
  const seen = new Set<string>();
  let letter = 0;
  let glyph = 0;
  while (out.length < 1200) {
    let next: string | undefined;
    if (out.length % 6 === 0 && letter < letters.length) next = letters[letter++];
    else if (glyph < glyphs.length) next = glyphs[glyph++];
    else if (letter < letters.length) next = letters[letter++];
    else break;
    if (!next || seen.has(next)) continue;
    seen.add(next);
    out.push(next);
  }
  return out;
}

export const RITUAL_SYMBOLS = buildSymbols();

export function symbolsForName(name: string, count: number): string[] {
  let salt = 0;
  for (let index = 0; index < name.length; index += 1) salt = (salt + name.charCodeAt(index) * (index + 3)) % RITUAL_SYMBOLS.length;
  const picked: string[] = [];
  for (let step = 0; step < count; step += 1) {
    picked.push(RITUAL_SYMBOLS[(salt + step * 47) % RITUAL_SYMBOLS.length]);
  }
  return picked;
}
