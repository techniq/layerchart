---
'layerchart': patch
---

fix(Pattern): Restore canvas layer support by registering as a `group` node so snippet children (e.g. `<Rect fill={pattern}>`) render correctly
