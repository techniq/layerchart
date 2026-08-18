---
'layerchart': patch
---

fix(Legend): Draw labelled swatches rather than a color ramp for an ordinal `c` scale, whose unrelated categories a gradient between two ends can't name. Sequential and threshold scales keep their ramp, and `variant` still overrides.
