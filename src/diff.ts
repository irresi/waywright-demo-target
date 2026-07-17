export interface DiffHunk {
  file: string;
  startLine: number;
  header: string;
  lines: string[];
}

export function parseDiff(diffText: string): DiffHunk[] {
  if (!diffText.trim()) return [];

  const hunks: DiffHunk[] = [];
  const fileBlocks = diffText.split(/^diff --git /m).slice(1);

  for (const block of fileBlocks) {
    const fileMatch = block.match(/a\/(\S+) b\/(\S+)/);
    const file = fileMatch?.[2] ?? "unknown";

    const hunkSections = block.split(/^@@ /m).slice(1);
    for (const section of hunkSections) {
      const firstLineEnd = section.indexOf("\n");
      const headerRest = firstLineEnd === -1 ? section : section.slice(0, firstLineEnd);
      const header = `@@ ${headerRest}`;
      const startMatch = headerRest.match(/\+(\d+)/);
      const startLine = startMatch ? parseInt(startMatch[1]!, 10) : 0;
      const body = firstLineEnd === -1 ? "" : section.slice(firstLineEnd + 1);
      const lines = body.length ? body.split("\n") : [];
      hunks.push({ file, startLine, header, lines });
    }
  }

  return hunks;
}
