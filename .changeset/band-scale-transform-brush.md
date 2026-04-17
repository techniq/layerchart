---
'layerchart': minor
---

feat(Chart, BrushState): Add band scale (categorical) support for transform pan/zoom and brush selection. Uses range-rescaling pattern to smoothly zoom and pan categorical bar charts. Automatically constrains panning to data boundaries and prevents zooming out past initial view.
