---
'layerchart': patch
---

fix(AreaChart|BarChar|LineChart): Use value axis (typically y) property name/accessor for tooltip label if defined as string (ex. `<AreaChart x="date" y="visitors">` will use `visitors` instead of `value`)
