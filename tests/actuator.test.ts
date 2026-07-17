import { describe, expect, test, mock } from "bun:test";
import { actuate } from "../src/actuator";

describe("actuate", () => {
  test("calls deps.diff(branch) once after a successful build and stores the result", async () => {
    const diff = mock(async (_branch: string) => "diff --git a/foo.ts b/foo.ts\n@@ -1 +1 @@\n+x\n");
    const deps = {
      implement: async () => ({ branch: "waywright/test" }),
      build: async () => ({ passed: true }),
      diff,
    };

    const result = await actuate("some plan", deps);

    expect(diff).toHaveBeenCalledTimes(1);
    expect(diff).toHaveBeenCalledWith("waywright/test");
    expect(result.branch).toBe("waywright/test");
    expect(result.diff).toContain("+x");
  });

  test("does not call deps.diff when the build fails", async () => {
    const diff = mock(async (_branch: string) => "unused");
    const deps = {
      implement: async () => ({ branch: "waywright/test" }),
      build: async () => ({ passed: false }),
      diff,
    };

    const result = await actuate("some plan", deps);

    expect(diff).not.toHaveBeenCalled();
    expect(result.diff).toBeUndefined();
  });
});
