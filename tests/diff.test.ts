import { describe, expect, test } from "bun:test";
import { parseDiff } from "../src/diff";

const TWO_FILE_DIFF = `diff --git a/foo.ts b/foo.ts
index 111..222 100644
--- a/foo.ts
+++ b/foo.ts
@@ -1,2 +1,3 @@
 const a = 1;
+const b = 2;
 const c = 3;
diff --git a/bar.ts b/bar.ts
index 333..444 100644
--- a/bar.ts
+++ b/bar.ts
@@ -10,2 +10,3 @@
 const x = 1;
+const y = 2;
`;

describe("parseDiff", () => {
  test("parses hunks for each file with correct file, startLine, and lines", () => {
    const hunks = parseDiff(TWO_FILE_DIFF);

    expect(hunks).toHaveLength(2);

    expect(hunks[0]!.file).toBe("foo.ts");
    expect(hunks[0]!.startLine).toBe(1);
    expect(hunks[0]!.lines).toContain("+const b = 2;");

    expect(hunks[1]!.file).toBe("bar.ts");
    expect(hunks[1]!.startLine).toBe(10);
    expect(hunks[1]!.lines).toContain("+const y = 2;");
  });

  test("returns empty array for an empty diff", () => {
    expect(parseDiff("")).toEqual([]);
  });
});
