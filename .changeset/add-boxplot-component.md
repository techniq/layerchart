---
'layerchart': minor
---

feat: Add BoxPlot component for box-and-whisker plots

New composite mark that renders whiskers, caps, IQR box, median line, and outlier dots. Supports both pre-computed statistics (`min`, `q1`, `median`, `q3`, `max`, `outliers` accessors) and automatic computation from raw values via the `values` prop. Orientation-aware via `valueAxis` context.
