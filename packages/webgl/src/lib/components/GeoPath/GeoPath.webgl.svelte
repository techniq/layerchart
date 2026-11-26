<script lang="ts" module>
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  import type { GeoPathProps } from './GeoPath.shared.svelte.js';

  /** A light gray that reads on either theme */
  const defaultFill =
    'color-mix(in oklab, var(--color-surface-content, currentColor) 15%, var(--color-surface-100, white))';

  /** Segments each curve is drawn in, so outlines follow it as the fill does */
  const CURVE_STEPS = 8;

  /**
   * A path context drawing into `target`, its curves (ex. a `curve`'s) as runs of short lines, so
   * an outline follows a curve (a `ShapeContext` outlines only to its end)
   */
  function sampling(target: ShapeContext) {
    let x0 = 0;
    let y0 = 0;
    let startX = 0;
    let startY = 0;
    const lineTo = (x: number, y: number) => {
      target.lineTo(x, y);
      x0 = x;
      y0 = y;
    };
    return {
      moveTo(x: number, y: number) {
        target.moveTo(x, y);
        x0 = startX = x;
        y0 = startY = y;
      },
      lineTo,
      closePath() {
        target.closePath();
        x0 = startX;
        y0 = startY;
      },
      quadraticCurveTo(cx: number, cy: number, x: number, y: number) {
        const [ax, ay] = [x0, y0];
        for (let i = 1; i <= CURVE_STEPS; i++) {
          const t = i / CURVE_STEPS;
          const u = 1 - t;
          lineTo(u * u * ax + 2 * u * t * cx + t * t * x, u * u * ay + 2 * u * t * cy + t * t * y);
        }
      },
      bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
        const [ax, ay] = [x0, y0];
        for (let i = 1; i <= CURVE_STEPS; i++) {
          const t = i / CURVE_STEPS;
          const u = 1 - t;
          const [a, b, c, d] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
          lineTo(a * ax + b * c1x + c * c2x + d * x, a * ay + b * c1y + c * c2y + d * y);
        }
      },
      arc(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean) {
        target.arc(x, y, r, a0, a1, ccw);
        x0 = x + r * Math.cos(a1);
        y0 = y + r * Math.sin(a1);
      },
      rect(x: number, y: number, w: number, h: number) {
        target.rect(x, y, w, h);
        x0 = startX = x;
        y0 = startY = y;
      },
    };
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { geoPath, geoTransform as d3GeoTransform } from 'd3-geo';
  import { curveLinearClosed } from 'd3-shape';
  import { BufferGeometry, Float32BufferAttribute, SphereGeometry } from 'three';
  import { geoCurvePath, getChartContext, resolveColorProp } from 'layerchart';
  import { createControlledMotion } from 'layerchart/utils/motion.svelte';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getSphere, sphereLines } from '../../utils/globe.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';
  import { rowColor } from '../../utils/marks.js';
  import LineMarkers from '../Line/Line.markers.svelte';
  import PathEnds from '../Path/Path.ends.svelte';
  import { createDraw, lengthOf, pathEnds, truncate } from '../Path/draw.svelte.js';

  let {
    z,
    geojson,
    tooltip = false,
    onclick,
    curve = curveLinearClosed,
    geoTransform,
    children,
    fill: fillProp,
    fillOpacity = 1,
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
    strokeOpacity = 1,
    opacity = 1,
    draw,
    marker,
    markerMid,
    markerStart,
    markerEnd,
    startContent,
    endContent,
    class: className,
    motion,
  }: GeoPathProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  // As the core `GeoPath`: no fill and a `surface-content` outline, unless its props or `class`
  // say otherwise (`null` for none)
  const fill = $derived(
    fillProp !== undefined ? fillProp : look?.fill === 'none' ? null : (look?.fill ?? null)
  );
  const stroke = $derived(
    strokeProp !== undefined
      ? strokeProp
      : look?.stroke === 'none'
        ? null
        : (look?.stroke ?? 'var(--color-surface-content, currentColor)')
  );
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** On a `globe`, features draw over it as lines */
  const sphere = $derived(getSphere(ctx));

  /** The chart's projection, through `geoTransform` when given one (as the core `GeoPath`) */
  const projection = $derived(
    geoTransform && ctx.geo.projection
      ? d3GeoTransform(geoTransform(ctx.geo.projection))
      : ctx.geo.projection
  );
  /** Its path generator, through `curve` (as the core `GeoPath`'s, for `onclick` and `children`) */
  const pathGenerator = $derived.by(() => {
    if (!projection) return undefined;
    return curve === curveLinearClosed
      ? geoPath(projection as any)
      : geoCurvePath(projection as any, curve);
  });

  const features = $derived.by((): Feature[] => {
    if (!geojson) return [];
    if (geojson.type === 'FeatureCollection') return geojson.features;
    if (geojson.type === 'Feature') return [geojson];
    return [{ type: 'Feature', geometry: geojson as Geometry, properties: {} }];
  });

  const isLine = (feature: Feature) => /LineString/.test(feature.geometry?.type ?? '');
  const isSphere = (feature: Feature) => (feature.geometry?.type as string) === 'Sphere';
  const filled = (feature: Feature) => !sphere && !isLine(feature) && fill != null;

  /**
   * Each feature's shape through the projection, extruded a pixel tall (or laid flat without
   * `z`) — stretched to its height as it's drawn, so a new height (or each step easing to one)
   * doesn't extrude it again
   */
  const shapes = $derived.by(() => {
    return features.map((feature) => {
      if (sphere) return { positions: null, normals: null, lines: [] as [number, number][][] };
      const context = new ShapeContext();
      if (curve === curveLinearClosed)
        geoPath((projection ?? null) as any, context as any)(feature);
      else geoCurvePath((projection ?? null) as any, curve, sampling(context) as any)(feature);
      let positions: ArrayLike<number> | null = null;
      let normals: ArrayLike<number> | null = null;
      if (filled(feature)) {
        const unit = extrude(context, 0, z == null ? 0 : 1);
        const flat = unit?.index ? unit.toNonIndexed() : unit;
        positions = flat?.getAttribute('position').array ?? null;
        normals = flat?.getAttribute('normal').array ?? null;
        if (flat !== unit) unit?.dispose();
      }
      return { positions, normals, lines: context.lines };
    });
  });

  /** Each feature's `[base, top, r, g, b, a]`: its heights, and its fill resolved */
  const targets = $derived(
    features.flatMap((feature) => {
      // On the floor, lifted a little so nothing beneath shows through
      const [z0, z1] = z == null ? [0.3, 0.3] : ctx.heightOf(feature, z);
      const color = filled(feature)
        ? scene.color(rowColor(ctx, fill!, feature, defaultFill))
        : null;
      return [
        z0,
        z1,
        color?.color.r ?? 0,
        color?.color.g ?? 0,
        color?.color.b ?? 0,
        color?.opacity ?? 0,
      ];
    })
  );

  // The motion is fixed when the mark mounts, as the core marks' is
  const eased = untrack(() => (motion ? createControlledMotion<number[]>(targets, motion) : null));
  $effect.pre(() => {
    const next = targets;
    if (!eased) return;
    untrack(() => {
      // New features have nothing to ease from
      if (eased.current.length !== next.length) {
        eased.set(next, eased.type === 'tween' ? { duration: 0 } : ({ instant: true } as any));
      } else {
        eased.set(next);
      }
    });
  });
  const shown = $derived(eased ? eased.current : targets);

  /** Each feature's outlines (its rings, or its lines) where they are now, in the scene's axes */
  const outlines = $derived.by(() => {
    const values = shown;
    return features.map((feature, i) => {
      if (sphere) return isSphere(feature) ? [] : sphereLines(sphere, feature.geometry);
      const [z0, z1] = values.slice(i * 6, i * 6 + 2);
      const top = Math.max(z0, z1) + 0.5;
      return (shapes[i]?.lines ?? []).map((line) => line.flatMap(([x, y]) => [x, top, y]));
    });
  });

  /** A feature's outline color, or `null` for none */
  function strokeOf(feature: Feature) {
    const own = stroke != null ? resolveColorProp(stroke, feature, ctx.cScale) : null;
    if (sphere) {
      return (
        own ??
        (fill ? rowColor(ctx, fill, feature, defaultFill) : null) ??
        'var(--color-surface-content, currentColor)'
      );
    }
    return own ?? (isLine(feature) ? 'var(--color-surface-content, currentColor)' : null);
  }

  // Drawing its outlines from their start, as the core `GeoPath`'s path's `draw` (one path for all
  // its features): again whenever its shapes change
  const drawing = untrack(() => draw)
    ? createDraw(
        () => draw,
        () => [
          features.reduce(
            (sum, feature, i) =>
              sum +
              (sphere
                ? sphereLines(sphere, feature.geometry)
                : (shapes[i]?.lines ?? []).map((line) => line.flatMap(([x, y]) => [x, 0, y]))
              ).reduce((total, line) => total + lengthOf(line), 0),
            0
          ),
        ]
      )
    : null;
  /** How much of its outlines `draw` has drawn, and how far that is (all of them without `draw`) */
  const drawn = $derived.by(() => {
    if (!drawing || drawing.done) return { progress: 1, length: Infinity };
    const total = outlines.flat().reduce((sum, line) => sum + lengthOf(line), 0);
    const progress = drawing.progress(total);
    return { progress, length: progress * total };
  });
  /** Each outline as far as it's drawn: from its own start, as SVG dashes each subpath */
  function cut(lines: number[][]) {
    const { length } = drawn;
    return length === Infinity ? lines : lines.map((line) => truncate(line, length));
  }

  createMerged({
    tooltip: () => tooltip,
    events: () =>
      onclick
        ? { onclick: (e, { data }) => onclick(e, pathGenerator, data as Feature) }
        : undefined,
    items: () => {
      // `children` draw in its place
      if (children) return [];
      const values = shown;
      return features.map((feature, i) => {
        if (sphere && isSphere(feature)) {
          // The globe itself, a little under anything laid over it
          const [x, y, z] = sphere.center;
          return {
            d: feature,
            geometry:
              fill == null
                ? null
                : new SphereGeometry(Math.max(0, sphere.radius - 0.5), 96, 48).translate(x, y, z),
            fill: fill == null ? null : rowColor(ctx, fill, feature, defaultFill),
            lines: [],
            stroke: null,
          };
        }
        if (sphere) {
          return {
            d: feature,
            geometry: null,
            fill: null,
            lines: cut(outlines[i]),
            stroke: strokeOf(feature),
          };
        }
        const shape = shapes[i];
        const [z0, z1, r, g, b, a] = values.slice(i * 6, i * 6 + 6);
        let geometry: BufferGeometry | null = null;
        if (shape?.positions && shape.normals) {
          // The unit shape stretched from the base up to the top
          const positions = Float32Array.from(shape.positions);
          const base = Math.min(z0, z1);
          const height = Math.abs(z1 - z0);
          for (let k = 1; k < positions.length; k += 3) positions[k] = base + positions[k] * height;
          geometry = new BufferGeometry();
          geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
          geometry.setAttribute(
            'normal',
            new Float32BufferAttribute(Float32Array.from(shape.normals), 3)
          );
        }
        return {
          d: feature,
          geometry,
          fill: null,
          fillColor: geometry ? ([r, g, b, a] as [number, number, number, number]) : undefined,
          lines: cut(outlines[i]),
          stroke: strokeOf(feature),
        };
      });
    },
    opacity: () => opacity * fillOpacity * (look?.opacity ?? 1),
    lineOpacity: () => opacity * strokeOpacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>

{#if children}
  {@render children({ geoPath: pathGenerator })}
{:else}
  {#if marker || markerStart || markerMid || markerEnd}
    <!-- On one path through its features' outlines, as the core `GeoPath`'s, in its first's stroke -->
    <LineMarkers
      {marker}
      {markerStart}
      {markerMid}
      {markerEnd}
      lines={() => {
        const color = features.length ? strokeOf(features[0]) : null;
        const points = outlines.flat(2);
        return color
          ? [
              {
                points,
                color,
                // Each vertex between its ends: its rings' and lines' every point
                get mids() {
                  return Array.from(
                    { length: Math.max(0, points.length / 3 - 2) },
                    (_, k) => k + 1
                  );
                },
              },
            ]
          : [];
      }}
      {strokeWidth}
      opacity={opacity * (look?.opacity ?? 1)}
    />
  {/if}
  {#if startContent || endContent}
    {@const ends = pathEnds(outlines.flat(), drawn.progress)}
    {#if ends}
      <PathEnds start={ends.start} end={ends.end} {startContent} {endContent} />
    {/if}
  {/if}
{/if}
