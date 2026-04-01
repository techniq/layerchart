---
'layerchart': patch
---

fix: Default chart padding now applied when using ChartChildren layout (marks snippet)

When `<Chart>` is used with `marks`/`grid`/`axis` snippets (no explicit `children` snippet), default padding is now applied to match the axes that ChartChildren renders by default. When `children` is provided directly (e.g. Treemap, Pack), no default padding is applied since the user controls layout. This can still be overridden with explicit `axis` or `padding` props.
