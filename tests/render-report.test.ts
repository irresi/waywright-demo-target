import { describe, expect, test } from "bun:test";
import { renderDiffAnnotations } from "../src/render-report";
import type { EngineeringMemoryRecord } from "../src/types";

const DECISION: EngineeringMemoryRecord = {
  id: "D-000",
  selectedDirection: "Render decision-linked diff annotations in PR/commit view",
  rationale: "Humans use shared memory to reconstruct why.",
  rejected: [{ id: "decision-record-cli", reason: "Weaker default UX for building trust." }],
  outcome: { status: "passed", summary: "Selected for implementation." },
};

const ONE_HUNK_DIFF = `diff --git a/foo.ts b/foo.ts
index 111..222 100644
--- a/foo.ts
+++ b/foo.ts
@@ -1,1 +1,2 @@
 const a = 1;
+const b = 2;
`;

describe("renderDiffAnnotations", () => {
  test("renders a rationale marker with direction title, rejected reason, and outcome status", () => {
    const html = renderDiffAnnotations(ONE_HUNK_DIFF, DECISION);

    expect(html).toContain(DECISION.selectedDirection);
    expect(html).toContain("Weaker default UX for building trust.");
    expect(html).toContain("passed");
  });

  test("renders an empty-state message without throwing when diff is undefined", () => {
    const html = renderDiffAnnotations(undefined, DECISION);
    expect(html).toContain("No diff annotations available yet.");
  });

  test("renders an empty-state message without throwing when decision is undefined", () => {
    const html = renderDiffAnnotations(ONE_HUNK_DIFF, undefined);
    expect(html).toContain("No diff annotations available yet.");
  });
});
