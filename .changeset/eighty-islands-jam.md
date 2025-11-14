---
'layerchart': patch
---

fix: Improve memory leak caused by detached DOM increase when using Canvas rendering due to sometimes still rendering Svg components (ex. `<g>` vs `<Group>`) (#490)
