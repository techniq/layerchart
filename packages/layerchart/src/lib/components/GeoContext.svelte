<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import { type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
  import { chartContext } from './ChartContext.svelte';
  import { transformContext } from './TransformContext.svelte';
  import { Context } from 'runed';

  /**
   * Access or set the current GeoContext.
   */
  export const GeoContext = new Context<GeoProjection>('GeoContext');
</script>

<script lang="ts">
  const { width, height } = chartContext();

  /** @type {Function} projection - A d3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`. */
  export let projection: (() => GeoProjection) /* | GeoIdentityTransform*/ | undefined = undefined;

  export let fitGeojson: GeoPermissibleObjects | undefined = undefined;

  /** By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here. */
  export let fixedAspectRatio: number | undefined = undefined;

  export let clipAngle: number | undefined = undefined;
  export let clipExtent: [[number, number], [number, number]] | undefined = undefined;
  export let rotate:
    | {
        /** Lambda (Center Meridian) */
        yaw: number;
        /** Phi */
        pitch: number;
        /** Gamma */
        roll: number;
      }
    | undefined = undefined;
  export let scale: number | undefined = undefined;
  export let translate: [number, number] | undefined = undefined;
  export let center: [number, number] | undefined = undefined;

  /** Apply TransformContext to the selected properties.  Typically `translate` or `rotate` are mutually selected  */
  export let applyTransform: ('scale' | 'translate' | 'rotate')[] = [];

  export let reflectX: boolean | undefined = undefined;
  export let reflectY: boolean | undefined = undefined;

  /** Exposed to allow binding in Chart */
  export let geo = writable(projection?.());
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
