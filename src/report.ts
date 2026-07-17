import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { renderDiffAnnotations } from "./render-report";
import type { EngineeringMemoryRecord } from "./types";

function loadJson(path: string): any | undefined {
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function toMemoryRecord(navigation: any): EngineeringMemoryRecord | undefined {
  const record = navigation?.memory?.[0];
  const decision = navigation?.decision;
  const selected = navigation?.selected;
  if (!decision || !selected) return undefined;

  return {
    id: record?.id ?? decision.selectedId,
    selectedDirection: selected.title,
    rationale: decision.rationale ?? "",
    rejected: (decision.rejected ?? []).map((r: any) => ({ id: r.id, reason: r.reason })),
    outcome: record?.outcome ?? { status: "unknown", summary: "" },
  };
}

export function buildReport(dir = ".waywright"): string {
  const navigation = loadJson(`${dir}/navigation.json`);
  const actuation = loadJson(`${dir}/actuation.json`);
  const memory = toMemoryRecord(navigation);
  const annotations = renderDiffAnnotations(actuation?.diff, memory);

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Waywright Report</title></head>
<body>
<h1>Waywright Report</h1>
${annotations}
</body>
</html>`;
}

if (import.meta.main) {
  const html = buildReport();
  writeFileSync(".waywright/report.html", html);
}
