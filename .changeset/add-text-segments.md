---
'layerchart': minor
---

feat(Text): Add `segments` prop for inline mixed-style text

New `segments` prop accepts an array of `{ value, class }` objects to render text with different styles (font size, weight, color) inline. Works across SVG (via tspans), Canvas (via sequential measureText/fillText), and HTML layers. Useful for labels that combine a bold name with a lighter value, such as treemap headers.
