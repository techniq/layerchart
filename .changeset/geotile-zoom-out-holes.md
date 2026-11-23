---
'@layerchart/webgl': patch
---

fix(GeoTile): Zooming out no longer leaves holes while tiles load: new tiles draw at once from a loaded ancestor behind the sharper tiles left behind, over a coarse backdrop shown only where tiles have yet to arrive
