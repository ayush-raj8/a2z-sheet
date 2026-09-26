# A2Z Visualization Engine

```
GENERIC ENGINE (ExecutionTimeline / ExecutionStep)
        │
 ┌──────┼──────────────┐
 ↓      ↓              ↓
viewers/  (array, stack, heap, graph, dp, …)
        │
 runners/  (per-topic / per-family)
        │
 coverage/registry.json  (all 455 topics classified)
```

## Line-by-line PC

Each `ExecutionStep` has a single `line` (1-indexed). Do **not** highlight ranges for the program counter — emit one step per logical source line.

## Adding a topic

1. Add `runners/<name>.ts` that returns `ExecutionTimeline`.
2. Register topic id(s) in `runners/index.ts`.
3. Run `npm run viz:coverage`.

Legacy kits under `kits/` still work via `engine/legacyAdapter.ts` until migrated.
