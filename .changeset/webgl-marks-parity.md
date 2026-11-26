---
'@layerchart/webgl': minor
---

feat: `Arc` takes `fillOpacity` and `strokeOpacity`
feat: `Area` takes `seriesKey`, `stroke` (an outline around each area), and `pathData`
feat: `Spline` and `Points` take `seriesKey`, drawing the series' rows in its color and fading while another is highlighted
feat: `Rule` takes `seriesKey`, fading while another series is highlighted and hidden with its series
feat: `Circle` takes `initialCx`, `initialCy`, and `initialR` to ease in from, `strokeOpacity`, `viewport`, and `motion` per prop
feat: `Points` take `motion`, `key`, `initialCx`, `initialCy`, `initialR`, and `viewport`
feat: `Text` takes `motion` (with a numeric `value` tweening), `key`, `initialX`, `initialY`, `capHeight`, and `segments`
fix: `Arc`'s and `Rule`'s `opacity` dim their lines
