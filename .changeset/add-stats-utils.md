---
'layerchart': minor
---

feat: Add statistical utility functions `computeBoxStats()` and `kde()`

- `computeBoxStats(values, k?)` computes the five-number summary and outliers using the Tukey IQR method
- `kde(values, options?)` computes kernel density estimation using the Epanechnikov kernel with Silverman's rule-of-thumb bandwidth
