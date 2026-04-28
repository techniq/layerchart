<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoSplineProps } from './GeoSpline.shared.svelte.js';

  export type GeoSplineBaseLayerComponents = {
    Path: Component<any>;
  };

  export type GeoSplineBaseProps = GeoSplineProps & GeoSplineBaseLayerComponents;
</script>

<script lang="ts">
  import { geoOrthographic, geoInterpolate } from 'd3-geo';
  import { line as d3Line, curveNatural } from 'd3-shape';

  import { getGeoContext } from '$lib/contexts/geo.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let { Path, link, loft = 1.0, curve = curveNatural, ...restProps }: GeoSplineBaseProps = $props();

  const geo = getGeoContext();

  const loftedProjection = $derived(
    geo.projection
      ? geoOrthographic()
          .translate(geo.projection.translate())
          .rotate(geo.projection.rotate())
          .scale(geo.projection.scale() * loft)
      : undefined
  );

  const source = $derived(geo.projection ? geo.projection(link.source) : [0, 0]) as [
    number,
    number,
  ];
  const target = $derived(geo.projection ? geo.projection(link.target) : [0, 0]) as [
    number,
    number,
  ];
  const middle = $derived(
    geo.projection ? loftedProjection!(geoInterpolate(link.source, link.target)(0.5)) : [0, 0]
  ) as [number, number];

  const d = $derived(
    d3Line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curve)([source, middle, target]) ?? ''
  );
</script>

<Path pathData={d} {...extractLayerProps(restProps, 'lc-geo-spline')} />
