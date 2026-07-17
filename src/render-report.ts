import { parseDiff } from "./diff";
import type { EngineeringMemoryRecord } from "./types";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDiffAnnotations(
  diff: string | undefined,
  decision: EngineeringMemoryRecord | undefined,
): string {
  if (!diff || !decision) {
    return `<div class="diff-annotations empty">No diff annotations available yet.</div>`;
  }

  const hunks = parseDiff(diff);
  const rejected = decision.rejected[0];

  const markers = hunks
    .map(
      (h) => `
    <div class="diff-annotation" data-file="${escapeHtml(h.file)}">
      <div class="annotation-header">${escapeHtml(h.file)} @ line ${h.startLine}</div>
      <div class="annotation-body">
        <span class="direction-title">${escapeHtml(decision.selectedDirection)}</span>
        ${rejected ? `<span class="rejected-reason">rejected: ${escapeHtml(rejected.id)} — ${escapeHtml(rejected.reason)}</span>` : ""}
        <span class="outcome-status">${escapeHtml(decision.outcome.status)}</span>
      </div>
    </div>`,
    )
    .join("\n");

  return `<div class="diff-annotations">${markers}</div>`;
}
