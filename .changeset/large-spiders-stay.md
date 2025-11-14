---
'layerchart': minor
---

feat(Rule): Support using as data-driven mark (ex. candlestick, lollipop) by default (`<Rule>` using Chart accessors) or passing explicit `x`/`y` accessors (ex. `<Rule y={["high", "low"]} />`). Resolves #64
