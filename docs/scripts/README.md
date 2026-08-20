# Visual regression tracking

`visual-snapshot.mjs` captures what every docs example actually draws and compares it against a
committed baseline.

It stores a **geometry fingerprint** rather than a screenshot — the drawing attributes of each
mark (`d`, `x`/`y`/`width`/`height`, `cx`/`cy`/`r`, fill, stroke, transform), rounded and hashed,
plus a pixel hash for canvas layers and the text of HTML layers. That keeps the baseline to one
readable JSON file instead of ~1000 images, and avoids the anti-aliasing noise that makes pixel
baselines flap between machines.

## Running it

Start the docs dev server, then:

```sh
pnpm dev                    # in one terminal

pnpm test:visual:update     # record a baseline (snapshots/baseline.json)
pnpm test:visual            # capture again and report what changed
```

`test:visual` exits non-zero when anything changed, so it can gate a build.

To see _what_ changed rather than just which examples:

```sh
node scripts/visual-snapshot.mjs diff BarChart/stack-series --base <baseline-url> --head <url>
```

To review changes visually, point `--shots` at an output directory. Pass `--base-url` as well —
"before" images need the old code actually running (see below) — and open the `index.html` it
writes for a side-by-side of every changed example:

```sh
node scripts/visual-snapshot.mjs compare snapshots/baseline.json snapshots/current.json \
  --shots /tmp/visual-report --base-url http://localhost:3011 --head-url http://localhost:3002
```

Useful flags: `--filter BarChart` scopes a run to matching examples, `--concurrency` (default 8)
trades CPU for wall clock, `--repeat 2` captures twice to detect unstable examples.

## Serving an old revision for comparison

```sh
git worktree add /tmp/lc-base <ref>
cd /tmp/lc-base && pnpm install --frozen-lockfile && pnpm --filter layerchart package
cd docs && pnpm exec vite dev --port 3011
```

The docs import `layerchart` from `dist`, so the package has to be built in that worktree, and
generated files (`static/stackblitz-files.json`, `generated/`) copied in or regenerated.

## Determinism

Many examples build their data from `Math.random()` and the clock, so both are stubbed with a
seeded generator before any page script runs. What that cannot reach is measured rather than
assumed: `--repeat` captures each example twice and flags the ones that still disagree, and
`compare` skips those instead of reporting them as regressions. Animated examples
(`ForceSimulation/*`, `GeoPath/interpolating-projections`) land in that bucket.

Fingerprints depend on the rendering environment — a baseline recorded on macOS will not match one
captured on CI's Linux. Record and compare in the same place.
