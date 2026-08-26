---
'layerchart': patch
---

feat(Chart): Take the colour channel from a mark's own `fill` / `stroke` (`<Circle fill="island">`) when no `c` is declared, so the colour domain and legend hold the categories rather than the rows — hiding one still needs `c`
