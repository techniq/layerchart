# Bundle Analyzer

Measures bundle sizes for layerchart across different use-case scenarios, helping track the cost of common chart configurations and detect regressions over time.

## Quick start

```bash
# Build layerchart first (required)
pnpm --filter layerchart package

# Run analysis on all scenarios
pnpm bundle:analyze

# Compare two reports
pnpm bundle:compare -- path/to/new.json path/to/old.json
```

## How it works

For each scenario, the analyzer:

1. Creates a temporary entry file that imports the specified components from `layerchart`
2. Builds it with Vite + esbuild (minified, tree-shaken, Svelte externalized)
3. Measures the resulting bundle size (raw + gzipped)
4. Saves results to `bundle-reports/latest.json`

Svelte runtime is excluded from measurements since it's shared across all components. The reported sizes reflect layerchart code + its dependencies (d3, dagre, etc.).

## Scenarios

Scenarios are defined in [`define-scenarios.ts`](./define-scenarios.ts) and represent real-world usage patterns:

| Scenario | Description |
|----------|-------------|
| `core` | Bare minimum: `Chart` + `Svg` |
| `line-chart` | Line chart with axes and grid |
| `line-chart-interactive` | Line chart with tooltip and highlight |
| `area-chart` | Area chart with axes |
| `bar-chart` | Bar chart with axes |
| `scatter-chart` | Scatter plot with points |
| `pie-chart` | Pie/donut chart with arcs |
| `high-level-charts` | All high-level chart components |
| `geo` | Geographic map with paths |
| `geo-tiles` | Geographic map with tile layer |
| `geo-full` | All geo components |
| `force` | Force-directed graph |
| `hierarchy-tree` | Tree layout |
| `hierarchy-treemap` | Treemap layout |
| `hierarchy-pack` | Circle packing |
| `dagre` | Dagre directed graph |
| `sankey` | Sankey flow diagram |
| `chord` | Chord diagram |
| `canvas` | Canvas-based rendering |
| `all` | Everything from layerchart |

## CLI options

```bash
# Analyze all use-case scenarios (default)
pnpm bundle:analyze

# Also measure individual components
pnpm bundle:analyze -- --components

# Analyze specific scenarios or components by name
pnpm bundle:analyze -- geo dagre

# Compare two report files
pnpm bundle:compare -- report-new.json report-old.json
```

## CI integration

Two GitHub Actions workflows automate bundle tracking:

- **`bundle-analysis.yml`** - Runs on PRs that touch `packages/layerchart/` or `bundle-analyzer/`. Posts a comment comparing bundle sizes against the baseline.
- **`update-bundle-baseline.yml`** - Runs on pushes to `next`. If sizes changed, opens a PR to update `bundle-reports/latest.json`.

## Adding scenarios

Edit [`define-scenarios.ts`](./define-scenarios.ts) to add new scenarios to the `scenarios` array:

```ts
{
  name: "my-scenario",
  description: "What this scenario represents",
  imports: ["Chart", "Svg", "MyComponent"],
}
```

## Output

Reports are saved to `bundle-reports/`:
- `latest.json` - Current baseline (committed to git)
- `bundle-report-{timestamp}.json` - Timestamped snapshots (gitignored)
