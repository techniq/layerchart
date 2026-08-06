---
'layerchart': patch
---

fix(Text|Labels): Anchor `verticalAnchor` by cap-height so text sits a consistent distance from marks and aligns across the Svg, Canvas, and Html layers. `placement="smart"` labels now clear the point marker on all sides.
