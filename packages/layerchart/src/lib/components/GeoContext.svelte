<script lang="ts" module>
  import { type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
  import { getTransformContext } from './TransformContext.svelte';
  import { Context } from 'runed';
  import { getChartContext } from './Chart-Next.svelte';
  import type { Snippet } from 'svelte';

  /**
   * Access or set the current GeoContext.
   */
  const GeoContext = new Context<GeoProjection | undefined>('GeoContext');

  export function getGeoContext() {
    return GeoContext.get();
  }

  export function setGeoContext(geo: GeoProjection | undefined) {
    return GeoContext.set(geo);
  }

  export type GeoContextProps = {
    /**
     * A d3 projection function. Pass this in as an uncalled function, e.g.
     * `projection={geoAlbersUsa}`.
     */
    projection?: () => GeoProjection;
    fitGeojson?: GeoPermissibleObjects;
    /**
     * By default, the map fills to fit the $width and $height. If instead you want a
     * fixed-aspect ratio, like for a server-side rendered map, set that here.
     */
    fixedAspectRatio?: number;
    clipAngle?: number;
    clipExtent?: [[number, number], [number, number]];
    rotate?: {
      /** Lambda (Center Meridian) */
      yaw: number;
      /** Phi */
      pitch: number;
      /** Gamma */
      roll: number;
    };
    scale?: number;
    translate?: [number, number];
    center?: [number, number];
    /**
     * Apply TransformContext to the selected properties.  Typically `translate` or `rotate` are
     * mutually selected
     */
    applyTransform?: ('scale' | 'translate' | 'rotate')[];
    reflectX?: boolean;
    reflectY?: boolean;
    /**
     * Exposed to allow binding in Chart
     *
     * @bindable
     */
    geo?: GeoProjection;

    children: Snippet<[{ projection: GeoProjection | undefined }]>;
  };
</script>

<script lang="ts">
  let {
    projection,
    fitGeojson,
    fixedAspectRatio,
    clipAngle,
    clipExtent,
    rotate,
    scale,
    translate,
    center,
    applyTransform = [],
    reflectX,
    reflectY,
    geo = $bindable(),
    children,
  }: GeoContextProps = $props();

  const ctx = getChartContext();
  const transformCtx = getTransformContext();

  setGeoContext(geo);

  const fitSizeRange = $derived(
    fixedAspectRatio ? [100, 100 / fixedAspectRatio] : [ctx.width, ctx.height]
  ) as [number, number];

  $effect(() => {
    if (!projection) return;
    const _projection = projection();

    if (fitGeojson && 'fitSize' in _projection) {
      _projection.fitSize(fitSizeRange, fitGeojson);
    }

    if ('scale' in _projection) {
      if (scale) {
        _projection.scale(scale);
      }

      if (applyTransform.includes('scale')) {
        _projection.scale(transformCtx.scale);
      }
    }

    if ('rotate' in _projection) {
      if (rotate) {
        _projection.rotate([rotate.yaw, rotate.pitch, rotate.roll]);
      }

      if (applyTransform.includes('rotate')) {
        _projection.rotate([
          transformCtx.translate.x, // yaw
          transformCtx.translate.y, // pitch
          // TODO: `roll` from `transformContext`?
        ]);
      }
    }

    if ('translate' in _projection) {
      if (translate) {
        _projection.translate(translate);
      }

      if (applyTransform.includes('translate')) {
        _projection.translate([transformCtx.translate.x, transformCtx.translate.y]);
      }
    }

    if (center && 'center' in _projection) {
      _projection.center(center);
    }

    if (reflectX) {
      _projection.reflectX(reflectX);
    }

    if (reflectY) {
      _projection.reflectY(reflectY);
    }

    if (clipAngle && 'clipAngle' in _projection) {
      _projection.clipAngle(clipAngle);
    }

    if (clipExtent && 'clipExtent' in _projection) {
      _projection.clipExtent(clipExtent);
    }

    geo = _projection;
  });
</script>

{@render children({
  get projection() {
    return geo;
  },
})}
