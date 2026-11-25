# @layerchart/webgl

## 2.13.0

### Patch Changes

- fix(GeoTile): Raise detailed tiles from elevation two zooms up, so turning a 3D view doesn't keep reloading it ([#1024](https://github.com/techniq/layerchart/pull/1024))

- fix(GeoTile): Keep coarser tiles from showing through sharper ones in low ground (ex. a canyon) while tiles load ([#1024](https://github.com/techniq/layerchart/pull/1024))

- fix(GeoTile): Stop zooming out from leaving holes while tiles load ([#1024](https://github.com/techniq/layerchart/pull/1024))

- fix(WebGL): Pan a perspective view by dragging the ground under the pointer, rather than by a fixed amount that lags behind farther terrain ([#1024](https://github.com/techniq/layerchart/pull/1024))

- fix(WebGL): Turn a zoomed-in perspective view about where it last zoomed towards, rather than about a point that drifts off beside the camera ([#1024](https://github.com/techniq/layerchart/pull/1024))

- fix(WebGL): Zoom a perspective view towards what's under the pointer, rather than towards a fixed point that can be inside the terrain ([#1024](https://github.com/techniq/layerchart/pull/1024))

- Updated dependencies [[`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d), [`3597609`](https://github.com/techniq/layerchart/commit/359760946f9ac06e3a820c31925436aa6c1c85e6), [`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d), [`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d), [`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d), [`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d), [`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d), [`396a23d`](https://github.com/techniq/layerchart/commit/396a23dbd9d8b071b4ef9f897b23aa5778fa021d)]:
  - layerchart@2.13.0

## 2.12.0

### Patch Changes

- Updated dependencies [[`445c5d0`](https://github.com/techniq/layerchart/commit/445c5d0cdfffea4d7ee93213b0c87011c8924323), [`445c5d0`](https://github.com/techniq/layerchart/commit/445c5d0cdfffea4d7ee93213b0c87011c8924323), [`445c5d0`](https://github.com/techniq/layerchart/commit/445c5d0cdfffea4d7ee93213b0c87011c8924323), [`4c1825b`](https://github.com/techniq/layerchart/commit/4c1825be77cf1a907a8ab63d109f8e87c80e0907), [`2f09661`](https://github.com/techniq/layerchart/commit/2f0966179859d0ced7cf3d0815685959c201ce18)]:
  - layerchart@2.12.0

## 2.11.0

### Minor Changes

- feat: New `@layerchart/webgl` package, drawing data-dense 2D charts and 3D views (perspective, lights and shadows, surfaces, globes, map terrain) with WebGL ([#985](https://github.com/techniq/layerchart/pull/985))
