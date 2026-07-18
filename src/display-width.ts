const bunStringWidth = typeof Bun !== "undefined" ? Bun.stringWidth : undefined;

function isAsciiOnly(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 126 || c < 32) return false;
  }
  return true;
}

export function displayWidth(input: string): number {
  if (input === "") return 0;
  if (isAsciiOnly(input)) return input.length;

  if (bunStringWidth) {
    return bunStringWidth(input, { ambiguousIsNarrow: true, ambiguousAsWide: false });
  }

  let width = 0;
  for (const ch of input) {
    const cp = ch.codePointAt(0)!;
    if ((cp >= 0x0300 && cp <= 0x036f) || cp === 0x200d) continue;
    width += cp >= 0x4e00 && cp <= 0x9fff ? 2 : 1;
  }
  return width;
}
