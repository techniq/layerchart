<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { VoronoiProps } from './Voronoi.shared.svelte.js';

  export type VoronoiBaseLayerComponents = {
    Group: Component<any>;
    Path: Component<any>;
    CircleClipPath: Component<any>;
  };

  export type VoronoiBaseProps = VoronoiProps & VoronoiBaseLayerComponents;
</script>

<script lang="ts">
  import { extent, greatest, max, sum } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  import { geoArea, geoCentroid, geoPath } from 'd3-geo';
  // @ts-expect-error
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { polygonArea, polygonCentroid } from 'd3-polygon';
  import { pointRadial } from 'd3-shape';
  import { clsx } from 'clsx';

  // GeoPath lives in geo/ subpath; agnostic import (only used in geo charts).
  import GeoPath from '../geo/GeoPath/GeoPath.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getFacetPanel } from '$lib/contexts/facet.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { getLayerIsometric } from '$lib/contexts/isometric.js';
  import { accessor } from '$lib/utils/common.js';
  import { applyMatrix, invertMatrix } from '$lib/utils/isometric.js';
  import {
    clipToConvex,
    geoPolygons as screenPolygons,
    ringsToPath,
    spreadApart,
  } from '$lib/utils/polygon.js';
  import { clipToCircle, type VoronoiCell } from './Voronoi.shared.svelte.js';

  let {
    Group,
    Path,
    CircleClipPath,
    data,
    x: xProp,
    y: yProp,
    r,
    clip,
    classes = {},
    onclick,
    onpointerenter,
    onpointerdown,
    onpointermove,
    class: className,
    children,
    ...restProps
  }: VoronoiBaseProps = $props();

  const ctx = getChartContext();
  // `flatData` rather than the chart's `data`, so marks with their own rows are included
  const facetPanel = getFacetPanel();
  const geo = getGeoContext();
  const layerIsometric = getLayerIsometric();

  /**
   * On an isometric chart, the view the layer draws through.  Cells are then measured on screen,
   * where the points are seen (raised by their height), and mapped back onto the flat plot to draw.
   */
  const view = $derived(!geo.projection && layerIsometric() ? ctx.layerMatrix() : null);
  const toPlot = $derived(view ? invertMatrix(view) : null);
  const lift = $derived(view && ctx.config.z != null ? ctx.isometricLift : null);

  /**
   * `clip`'s rings on screen, cutting every cell (which are then measured on screen, even in a geo
   * chart).  Not on an isometric chart, whose cells are already measured on screen.
   */
  const clipRings = $derived.by<[number, number][][] | null>(() => {
    if (clip == null || view) return null;
    const rings = Array.isArray(clip)
      ? [clip as [number, number][]]
      : geo.projection
        ? screenPolygons(geo.projection, clip).map((p) => p[0])
        : null;
    // None when `clip` has no area on screen (ex. a feature the projection drops, or a point),
    // leaving every cell empty
    return rings?.filter((ring) => ring.length > 2) ?? null;
  });

  const xAccessorOverride = $derived(xProp != null ? accessor(xProp) : undefined);
  const yAccessorOverride = $derived(yProp != null ? accessor(yProp) : undefined);

  const points = $derived(
    (data ?? facetPanel?.().data ?? ctx.flatData)
      .map((d: any) => {
        const xValue = xAccessorOverride
          ? geo.projection
            ? xAccessorOverride(d)
            : ctx.xScale(xAccessorOverride(d))
          : geo.projection
            ? ctx.x(d)
            : ctx.xGet(d);
        const yValue = yAccessorOverride
          ? geo.projection
            ? yAccessorOverride(d)
            : ctx.yScale(yAccessorOverride(d))
          : geo.projection
            ? ctx.y(d)
            : ctx.yGet(d);

        const x = Array.isArray(xValue) ? max(xValue) : xValue;
        const y = Array.isArray(yValue) ? max(yValue) : yValue;

        let point: [number, number];
        if (ctx.radial) {
          const radialPoint = pointRadial(x, y);
          point = [radialPoint[0] + ctx.width / 2, radialPoint[1] + ctx.height / 2];
        } else {
          point = [x, y];
        }
        if (view) {
          const height = lift ? ctx.heightOf(d)[1] : 0;
          const seen = applyMatrix(view, {
            x: point[0] + (lift?.x ?? 0) * height,
            y: point[1] + (lift?.y ?? 0) * height,
          });
          point = [seen.x, seen.y];
        }
        if (geo.projection && clipRings) {
          // Measured on screen, so projected (dropped if off the projection, ex. outside its insets)
          const projected = geo.projection(point);
          if (!projected) return null;
          point = [projected[0], projected[1]];
        }
        // @ts-expect-error
        point.data = d;
        return point;
      })
      .filter((point: [number, number] | null) => point != null)
  );

  const boundWidth = $derived(Math.max(ctx.width, 0));
  const boundHeight = $derived(Math.max(ctx.height, 0));

  const disableClip = $derived(r === 0 || r == null || r === Infinity);

  // Compute once and share between cell rendering and the `children` cell payload
  const voronoi = $derived.by(() => {
    if (clipRings) {
      if (!clipRings.length) return null;
      // Within `clip`'s bounds, with points sharing a location (ex. two teams' stadium) spread
      // apart to share its cell rather than one of them getting none
      const [x0, x1] = extent(clipRings.flat(), (p) => p[0]) as [number, number];
      const [y0, y1] = extent(clipRings.flat(), (p) => p[1]) as [number, number];
      return Delaunay.from(spreadApart(points)).voronoi([x0 - 1, y0 - 1, x1 + 1, y1 + 1]);
    }
    return geo.projection
      ? null
      : Delaunay.from(points).voronoi(
          // On screen, the whole plot area rather than the floor
          view ? [0, 0, ctx.box.width, ctx.box.height] : [0, 0, boundWidth, boundHeight]
        );
  });

  /** With `clip`, each cell cut to it (its pieces, ex. a state's islands) */
  const clippedCells = $derived(
    clipRings
      ? points.map((_: any, i: number) => {
          const cell = voronoi?.cellPolygon(i) as [number, number][] | null | undefined;
          // Without the zero-width slivers left where the cell's edge runs along `clip`'s
          return cell
            ? clipRings
                .map((ring) => clipToConvex(ring, cell))
                .filter((ring) => ring.length > 2 && Math.abs(polygonArea(ring)) > 1e-6)
            : [];
        })
      : null
  );

  /** On an isometric chart, cell `i` cut to `r` on screen and mapped back onto the flat plot */
  function plotPolygon(i: number): [number, number][] | null {
    let polygon = voronoi?.cellPolygon(i) as [number, number][] | null;
    if (!polygon || !toPlot) return polygon;
    if (!disableClip) polygon = clipToCircle(polygon, points[i], r!);
    if (polygon.length < 3) return null;
    return polygon.map(([x, y]) => {
      const p = applyMatrix(toPlot, { x, y });
      return [p.x, p.y];
    });
  }

  const geoPolygons = $derived(geo.projection && !clipRings ? geoVoronoi().polygons(points) : null);

  /** A cell from its pieces on screen */
  function planarCell(
    data: any,
    index: number,
    point: [number, number],
    pieces: [number, number][][]
  ): VoronoiCell {
    const largest = greatest(pieces, (piece) => Math.abs(polygonArea(piece))) ?? null;
    return {
      data,
      index,
      point,
      polygon: largest,
      polygons: pieces.map((piece) => [piece]),
      path: pieces.length ? ringsToPath(pieces) : null,
      centroid: largest ? polygonCentroid(largest) : null,
      area: sum(pieces, (piece) => Math.abs(polygonArea(piece))),
    };
  }

  // Cell geometry exposed to the `children` snippet for custom rendering (e.g. labels).
  // Only computed when a `children` snippet is provided.
  const cells = $derived.by<VoronoiCell[]>(() => {
    if (!children) return [];

    if (clippedCells) {
      return points.map((point: any, index: number) =>
        planarCell(point.data, index, [point[0], point[1]], clippedCells[index])
      );
    }

    if (geo.projection && geoPolygons) {
      const path = geoPath(geo.projection);
      return geoPolygons.features.map((feature: any, index: number): VoronoiCell => {
        const projectedPoint = geo.projection?.(feature.properties.sitecoordinates) ?? null;
        const ring: [number, number][] = (feature.geometry?.coordinates?.[0] ?? [])
          .map((coord: [number, number]) => geo.projection?.(coord))
          .filter((p: any): p is [number, number] => p != null);
        const polygon = ring.length ? ring : null;
        // Use spherical centroid/area (projected) rather than the projected ring, which
        // tears across the antimeridian and yields a garbage centroid for large cells.
        const projectedCentroid = geo.projection?.(geoCentroid(feature)) ?? null;
        return {
          data: feature.properties.site?.data,
          index,
          point: (projectedPoint ?? [NaN, NaN]) as [number, number],
          polygon,
          polygons: polygon ? [[polygon]] : [],
          path: path(feature),
          centroid:
            projectedCentroid && Number.isFinite(projectedCentroid[0])
              ? (projectedCentroid as [number, number])
              : null,
          // Spherical area (steradians) — see `VoronoiCell.area`
          area: geoArea(feature),
        };
      });
    }

    if (voronoi) {
      return points.map((point: any, index: number): VoronoiCell => {
        const polygon = toPlot ? plotPolygon(index) : (voronoi.cellPolygon(index) as any);
        const site = toPlot ? applyMatrix(toPlot, { x: point[0], y: point[1] }) : null;
        return planarCell(
          point.data,
          index,
          site ? [site.x, site.y] : [point[0], point[1]],
          polygon ? [polygon] : []
        );
      });
    }

    return [];
  });
</script>

<Group {...restProps} class={clsx('lc-voronoi-g', classes.root, className)}>
  {#if clippedCells}
    {#each points as point, i}
      {@const pieces = clippedCells[i]}
      {#if pieces.length}
        <CircleClipPath cx={point[0]} cy={point[1]} r={r ?? 0} disabled={disableClip}>
          <Path
            pathData={ringsToPath(pieces)}
            class={['lc-voronoi-path', classes.path]}
            onclick={(e: MouseEvent) => onclick?.(e, { data: (point as any).data, point })}
            onpointerenter={(e: PointerEvent) =>
              onpointerenter?.(e, { data: (point as any).data, point })}
            onpointermove={(e: PointerEvent) =>
              onpointermove?.(e, { data: (point as any).data, point })}
            onpointerdown={(e: PointerEvent) =>
              onpointerdown?.(e, { data: (point as any).data, point })}
            ontouchmove={(e: TouchEvent) => {
              e.preventDefault();
            }}
          />
        </CircleClipPath>
      {/if}
    {/each}
  {:else if geo.projection}
    {#if geoPolygons}
      {#each geoPolygons.features as feature}
        {@const point = r ? geo.projection?.(feature.properties.sitecoordinates) : null}
        <CircleClipPath
          cx={point?.[0]}
          cy={point?.[1]}
          r={r ?? 0}
          disabled={point == null || disableClip}
        >
          <GeoPath
            geojson={feature}
            class={['lc-voronoi-geo-path', classes.path]}
            onclick={(e: MouseEvent) =>
              onclick?.(e, { data: feature.properties.site.data, feature })}
            onpointerenter={(e: PointerEvent) =>
              onpointerenter?.(e, { data: feature.properties.site.data, feature })}
            onpointermove={(e: PointerEvent) =>
              onpointermove?.(e, { data: feature.properties.site.data, feature })}
            onpointerdown={(e: PointerEvent) =>
              onpointerdown?.(e, { data: feature.properties.site.data, feature })}
            ontouchmove={(e: TouchEvent) => {
              e.preventDefault();
            }}
          />
        </CircleClipPath>
      {/each}
    {/if}
  {:else if voronoi}
    {#each points as point, i}
      {@const plotted = toPlot ? plotPolygon(i) : null}
      {@const pathData = toPlot ? plotted && `M${plotted.join('L')}Z` : voronoi.renderCell(i)}
      {#if pathData}
        <!-- On an isometric chart, already cut to `r` on screen -->
        <CircleClipPath cx={point[0]} cy={point[1]} r={r ?? 0} disabled={disableClip || !!toPlot}>
          <Path
            {pathData}
            class={['lc-voronoi-path', classes.path]}
            onclick={(e: MouseEvent) => onclick?.(e, { data: (point as any).data, point })}
            onpointerenter={(e: PointerEvent) =>
              onpointerenter?.(e, { data: (point as any).data, point })}
            onpointermove={(e: PointerEvent) =>
              onpointermove?.(e, { data: (point as any).data, point })}
            onpointerdown={(e: PointerEvent) =>
              onpointerdown?.(e, { data: (point as any).data, point })}
            ontouchmove={(e: TouchEvent) => {
              e.preventDefault();
            }}
          />
        </CircleClipPath>
      {/if}
    {/each}
  {/if}

  {@render children?.({ cells })}
</Group>

<style>
  @layer components {
    :global(:where(.lc-voronoi-path, .lc-voronoi-geo-path)) {
      fill: transparent;
      stroke: transparent;
    }
  }
</style>
