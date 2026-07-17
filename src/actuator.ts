import type { ActuatorResult } from "./types";

export interface ActuatorDeps {
  implement(plan: string): Promise<{ branch: string }>;
  build(branch: string): Promise<{ passed: boolean }>;
  diff(branch: string): Promise<string>;
}

export async function actuate(plan: string, deps: ActuatorDeps): Promise<ActuatorResult> {
  const { branch } = await deps.implement(plan);
  const build = await deps.build(branch);
  if (!build.passed) {
    return { branch };
  }

  const diff = await deps.diff(branch);
  return { branch, diff };
}
