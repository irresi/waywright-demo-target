export interface RejectedAlternative {
  id: string;
  reason: string;
}

export type OutcomeStatus = "passed" | "failed" | "denied" | "unknown";

export interface Outcome {
  status: OutcomeStatus;
  summary: string;
}

export interface EngineeringMemoryRecord {
  id: string;
  selectedDirection: string;
  rationale: string;
  rejected: RejectedAlternative[];
  outcome: Outcome;
}

export interface ActuatorResult {
  branch: string;
  diff?: string;
}
