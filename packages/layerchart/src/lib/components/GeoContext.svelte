<script lang="ts" context="module">
  import { type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
  import { chartContext } from './ChartContext.svelte';
  import { transformContext } from './TransformContext.svelte';
  import { Context } from 'runed';

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
  }: GeoContextProps = $props();

  $effect.pre(() => {
    geo = projection?.();
  });

  const { width, height } = chartContext();

  setGeoContext(geo);

  const { scale: transformScale, translate: transformTranslate } = transformContext();

  $: fitSizeRange = (fixedAspectRatio ? [100, 100 / fixedAspectRatio] : [$width, $height]) as [
    number,
    number,
  ];

  $: if (projection) {
    const _projection = projection();

    if (fitGeojson && 'fitSize' in _projection) {
      _projection.fitSize(fitSizeRange, fitGeojson);
    }

    if ('scale' in _projection) {
      if (scale) {
        _projection.scale(scale);
      }

      if (applyTransform.includes('scale')) {
        _projection.scale($transformScale);
      }
    }

    if ('rotate' in _projection) {
      if (rotate) {
        _projection.rotate([rotate.yaw, rotate.pitch, rotate.roll]);
      }

      if (applyTransform.includes('rotate')) {
        _projection.rotate([
          $transformTranslate.x, // yaw
          $transformTranslate.y, // pitch
          // TODO: `roll` from `transformContext`?
        ]);
      }
    }

    if ('translate' in _projection) {
      if (translate) {
        _projection.translate(translate);
      }

      if (applyTransform.includes('translate')) {
        _projection.translate([$transformTranslate.x, $transformTranslate.y]);
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

    geo.set(_projection);
  }
</script>

<slot projection={$geo} />
