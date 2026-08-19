---
description: Streamlined visualization of data points connected by lines to visualize trends or changes over time.
category: charts
layers: [svg, canvas]
related: [Chart, Spline]
---

## Usage

:example{ name="basic" showCode }

### Long data

`c` names the categories the rows already carry, so one line is drawn per category and colored from the `c` scale — no `series`, and nothing pivoted into a column per fruit first. See the [Data guide](/docs/guides/data#long-format) for how the split is resolved.

```svelte
<LineChart {data} x="year" y="value" c="fruit" legend />
```

:example{ name="long-data" }
