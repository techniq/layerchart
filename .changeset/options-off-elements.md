---
'layerchart': patch
---

fix: Keep options off rendered elements: a data-mode `Circle`, `Ellipse`, `Line`, `Polygon`, or `Rect` no longer writes its `data` onto every element it draws, the chart root no longer receives the chart's options (`data`, `x`, `yDomain`, `padding`, ...), and `Text` no longer receives its layout options (`value`, `textAnchor`, `capHeight`, ...)
