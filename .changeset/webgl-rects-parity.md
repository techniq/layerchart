---
'@layerchart/webgl': minor
---

feat: `Bars`, `Bar`, and `Rect` take `onclick` and the other pointer handlers (and `Bars` its `onBarClick`), as the core marks
feat: `Bin` takes `onclick`, `onpointerenter`, `onpointermove`, and `onpointerleave`, called with the cell, as the core `Bin`
feat: `Bars` and `Bar` take `seriesKey`, `stackPadding`, `x1` / `y1` sub-bands, and a fixed `width` / `height`, as the core marks
feat: `Bars`, `Bar`, and `Rect` take `initialX`, `initialY`, `initialWidth`, and `initialHeight` to ease in from with `motion`
feat: `Bars`, `Bar`, and `Bin` take `fillOpacity`, and they and `Rect` take `strokeOpacity`
feat: `Rect` takes `insets`, `dashArray`, and `shade`
feat: `Bin` takes `grid`, `class`, and `children` (handed the cells), as the core `Bin`
