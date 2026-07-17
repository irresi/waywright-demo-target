```markdown
# Plan: Decision-Linked Diff Annotations (annotated-diff-rationale)

## Scope

Attach the run's decision record (selected direction, rejection reasons, evidence, outcome) to every changed hunk in the actuator's diff, and render it inline in `report.html` next to the diff — not just in the existing "MEMORY WRITTEN" drawer, which today summarizes the whole run but never touches the actual code.

Ouroboros currently produces one `DirectionDecision` per run (`src/types.ts:39`), not one per hunk — the actuator (`src/actuator.ts`) implements a single plan on a single branch. This plan does **not** invent per-hunk sub-decisions; every hunk in a given run gets the same decision payload. If a future run starts splitting a plan into independently-decided steps, per-hunk decisions become a real need — not now.

## Files

- `src/diff.ts` **(new)** — parse `git diff` output into hunks (`{ file, startLine, header, lines }`). Pure function, no git calls itself.
- `src/actuator.ts` — after `deps.implement(plan)` returns a branch, capture `git diff <base>...<branch>` via a new `ActuatorDeps.diff(branch): Promise<string>` dependency; thread the raw diff text into `ActuatorResult` as `diff: string`.
- `src/types.ts` — add `diff?: string` to `ActuatorResult`.
- `src/render-report.ts` — add `renderDiffAnnotations(actuation, decision, memory)`: for each parsed hunk, render a marker showing selected direction title, first rejected alternative + reason, and outcome status, linking to the matching memory record (reuse existing `memoryMatches`/highlight wiring already built for evidence rows).
- `src/report.ts` — pass `actuation?.diff` through to the render call (already assembles `WaywrightReportModel` inputs from `.waywright/*.json`; no new artifact file needed since diff now lives in `actuation.json`).
- `tests/diff.test.ts` **(new)** — RED/GREEN for the parser.
- `tests/render-report.test.ts` — extend existing suite (or add if absent) for the new annotation block.
- `tests/actuator.test.ts` — extend for the new `diff` dependency call and result field.

## Non-goals

- No per-hunk distinct decisions/sub-rationale — out of scope until the actuator itself plans in multiple independently-decided steps.
- No new closed-set error/status enum modeled on Sourcify's `VerificationErrorCode` — Ouroboros already has a closed `outcome.status` enum (`passed | failed | denied | unknown` in `types.ts:17`); reuse it, don't add a parallel one.
- No GitHub PR inline-comment posting (i.e., not writing annotations onto the actual GitHub diff via API) — this plan renders inside the existing self-hosted `report.html`, which is the artifact the demo already drives users to. Posting real PR review comments is a separate, higher-privilege integration and not needed to hit the acceptance criteria.
- No new storage layer — decision data already lives in `NavigationResult`/`EngineeringMemoryRecord` (`src/types.ts`) and is already piped into `report.ts`; this plan only adds a diff string and a rendering function, reusing `EngineeringMemory`/gbrain as-is.
- No diff-viewer library (no `diff2html`, no Monaco) — the existing hunk header + line list renders fine as plain HTML given the report's current dark-mode design system; adding a dependency for this is against the ladder (rung 5 fails, rung 7 — minimum code — wins).

## RED tests (write first, must fail)

1. `tests/diff.test.ts`
   - `parseDiff` on a two-file unified diff returns hunks with correct `file`, `startLine`, and `lines` for each file — fails because `src/diff.ts` doesn't exist.
   - `parseDiff("")` returns `[]` (empty diff → no hunks, not a crash).
2. `tests/actuator.test.ts`
   - `actuate()` calls `deps.diff(branch)` exactly once after a successful build and stores the result on `ActuatorResult.diff` — fails because `ActuatorDeps` has no `diff` method and `actuate` never calls it.
3. `tests/render-report.test.ts` (new or extended)
   - Given a navigation with one candidate decision and an actuation with a 1-hunk diff, `renderWaywrightReport` output contains a rationale marker whose text includes the selected direction's title, the first rejected reason, and the outcome status string — fails because no such markup exists yet.
   - Given `actuation.diff` is `undefined` (build not yet run), the report still renders without throwing and shows an empty-state message for diff annotations (mirrors existing `empty()` pattern) — fails because the new render function doesn't exist.

## GREEN implementation

- `src/diff.ts`: minimal unified-diff parser — split on `diff --git`/`@@` markers, no external diff library (rung 3/5 fail: no diff-parsing dep is already installed and stdlib doesn't parse unified diff format, so this is the one place custom code is justified — but keep it to string splitting, not a full patch AST).
- `src/actuator.ts`: add `diff(branch: string): Promise<string>` to `ActuatorDeps`, call once right after the green build is confirmed (not per iteration — only the final merged/denied state needs annotating), store on result.
- `src/render-report.ts`: `renderDiffAnnotations` reuses `escapeHtml`, `memoryMatches`, and the existing `.evidence-copy`/`data-memory-ids` click-to-highlight wiring so the new markers participate in the existing memory-highlight interaction instead of building a parallel one.
- Wire the new section into the `written-grid`/execution area of the existing template in `render-report.ts`, keeping the current CSS variables/classes rather than introducing new design tokens.

## Acceptance criteria

- [ ] `report.html` renders one rationale marker per changed hunk (RED test 3, part 1).
- [ ] Each marker shows: selected direction title, ≥1 rejected alternative + its reason, and outcome status (RED test 3, part 1).
- [ ] Manual check: for 3 sample runs (`.waywright/navigation.json` + `actuation.json` fixtures, reuse or extend fixtures already in `tests/report.test.ts`), a reviewer can state why a specific hunk changed by reading the annotation alone, without opening `.waywright/navigation.json` directly.
- [ ] No regression: report still renders when `actuation.diff` is absent (pre-build state) or `actuation` itself is `undefined` (nav-only state), matching current `renderExecution`'s pending-state handling.
- [ ] `bun test` green across `diff.test.ts`, `actuator.test.ts`, `render-report`/`report.test.ts`.

## Adopted prior-art decisions (from DECISION.evidence)

- Sourcify's per-result `transformations`/structured `message` list → adopted as the *shape* of the per-hunk payload (direction title + rejected reason + status), not as new code — Ouroboros's `EngineeringMemoryRecord` (`types.ts:8`) already carries this shape, so no new type is introduced, only a rendering path.
- Sourcify's decoupling of the structured result object from its presentation layer (`lib-sourcify` vs. server `FIELDS_TO_STORED_PROPERTIES`) → adopted by keeping `diff.ts` (parsing) and `render-report.ts` (presentation) as separate modules, so the same decision data can later feed a different view (e.g. a future PR-comment poster) without re-deriving rationale.
- Sourcify's closed `VerificationErrorCode` enum → explicitly **not** re-implemented; Ouroboros's existing `outcome.status` enum already satisfies the "consistent, filterable badge" need this pattern was cited for, per the non-goals above.
```