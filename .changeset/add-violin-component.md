---
'layerchart': minor
---

feat: Add Violin component for violin plots

New composite mark that renders a symmetric density curve (mirrored area) from raw data using kernel density estimation (Epanechnikov kernel). Supports pre-computed density data via `density` prop or automatic KDE from raw values via `values` prop. Optional `box` and `median` overlays. Configurable `bandwidth`, `thresholds`, and `curve`.
