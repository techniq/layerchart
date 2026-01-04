---
title: "layerchart@0.42.0"
tag: "layerchart@0.42.0"
date: "2024-06-26T12:45:01Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.42.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   [ForceSimulation] Refactor to allow for more dynamic and efficient simulations ([#210](https://github.com/techniq/layerchart/pull/210))

-   [ForceSimulation] Export `cloneData` as `const`, rather than `let` (resolves #203) ([#210](https://github.com/techniq/layerchart/pull/210))

-   [ForceSimulation] Automatically evict dropped forces (resolves #206) ([#210](https://github.com/techniq/layerchart/pull/210))

-   [ForceSimulation] Add export of `start`, `tick` and `end` events (resolves #198) ([#210](https://github.com/techniq/layerchart/pull/210))

-   [ForceSimulation] Have `alpha` prop reflect the internal d3 simulation's alpha state ([#210](https://github.com/techniq/layerchart/pull/210))

### Patch Changes

-   [ForceSimulation] No longer re-initialize all forces if any of them changes (resolves #201) ([#210](https://github.com/techniq/layerchart/pull/210))

-   [Chart] Only apply `fitGeojson` when using `<Chart geo={{ applyTransform: ['translate'] }}>`. Fixes globe initial rotation ([`8132ea968c1cc5a986fc883eced8399f014433b3`](https://github.com/techniq/layerchart/commit/8132ea968c1cc5a986fc883eced8399f014433b3))

-   [ForceSimulation] No longer re-initialize forces on unrelated prop-changes (resolves #204) ([#210](https://github.com/techniq/layerchart/pull/210))
