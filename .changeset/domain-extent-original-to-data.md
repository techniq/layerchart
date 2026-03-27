---
'layerchart': major
---

breaking(TransformContext): Rename `domainExtent: 'original'` to `domainExtent: 'data'`

The `'original'` value for `domainExtent` has been renamed to `'data'` to better describe that it constrains pan/zoom to the data's domain bounds:

```diff
- <Chart transform={{ domainExtent: 'original' }}>
+ <Chart transform={{ domainExtent: 'data' }}>
```
