<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import {
    geoMercator,
    type GeoIdentityTransform,
    type GeoPermissibleObjects,
    type GeoProjection
  } from 'd3-geo';

  export const geoContextKey = {};

  export type GeoContext = Writable<GeoProjection | GeoIdentityTransform>;

  export function geoContext() {
    return getContext<GeoContext>(geoContextKey);
  }

  function setGeoContext(geo: GeoContext) {
    setContext(geoContextKey, geo);
  }
</script>

<script lang="ts">
  const { width, height } = getContext('LayerCake');

  /** @type {Function} projection - A d3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`. */
  export let projection: () => GeoProjection | GeoIdentityTransform = geoMercator;

  export let fitGeojson: GeoPermissibleObjects;

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

  const geo = writable(projection());
  setGeoContext(geo);

  $: fitSizeRange = (fixedAspectRatio ? [100, 100 / fixedAspectRatio] : [$width, $height]) as [
    number,
    number
  ];

  $: {
    const _projection = projection();

    if (fitGeojson && 'fitSize' in _projection) {
      _projection.fitSize(fitSizeRange, fitGeojson);
    }

    if (scale && 'scale' in _projection) {
      _projection.scale(scale);
    }

    if (rotate && 'rotate' in _projection) {
      _projection.rotate([rotate.yaw, rotate.pitch, rotate.roll]);
    }

    if (translate && 'translate' in _projection) {
      _projection.translate(translate);
    }

    if (center && 'center' in _projection) {
      _projection.center(center);
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
