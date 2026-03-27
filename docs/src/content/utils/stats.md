---
description: Statistical utility functions for computing box plot statistics and kernel density estimation (KDE).
category: tools
layers: []
related: [BoxPlot, Violin]
---

## computeBoxStats

Computes the five-number summary (min, Q1, median, Q3, max) and outliers from raw numeric values using the Tukey method.

:example{name="compute-box-stats" noResize }

## kde

Computes kernel density estimation using the Epanechnikov kernel. Returns `[value, density]` pairs suitable for rendering violin plots or density curves.

:example{name="kde" noResize }
