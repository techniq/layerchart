---
'layerchart': major
---

breaking(GeoContext): Rename `GeoContext` component to `GeoProjection`

The `GeoContext` component has been renamed to `GeoProjection` to better describe its purpose. Update your imports and template usage:

```diff
- import { GeoContext } from 'layerchart'
+ import { GeoProjection } from 'layerchart'
```

```diff
- <GeoContext projection={geoAlbersUsa}>
+ <GeoProjection projection={geoAlbersUsa}>
```
