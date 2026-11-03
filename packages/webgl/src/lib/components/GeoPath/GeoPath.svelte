<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';
  import type { Feature, FeatureCollection, Geometry, GeometryCollection } from 'geojson';
  import type { GeoSphere } from 'd3-geo';
  import type { ValueProp } from '../../utils/values.js';
  import type { MotionOptions } from 'layerchart/utils/motion.svelte';

  /** A light gray that reads on either theme */
  const defaultFill =
    'color-mix(in oklab, var(--color-surface-content, currentColor) 15%, var(--color-surface-100, white))';

  export type GeoPathProps = {
    /**
     * A feature, a collection of them (drawn as one mark), or a geometry.  On a `globe`, their
     * lines and outlines draw over it (filled shapes on a globe aren't drawn yet), and
     * `{ type: 'Sphere' }` fills the globe itself (ex. the ocean beneath an image still loading).
     */
    geojson:
      | Feature
      | FeatureCollection
      | Geometry
      | GeometryCollection
      | GeoSphere
      | null
      | undefined;
    /**
     * How tall each feature stands: a property key or function of the feature (through the chart's
     * `z` scale), or a number of pixels.  Flat on the floor without one.
     */
    z?: DataProp<Feature>;
    /**
     * A CSS color, or a function of the feature returning one (or a value for the chart's color
     * scale).  Lines have no fill.
     *
     * @default 'color-mix(in oklab, var(--color-surface-content) 15%, var(--color-surface-100))'
     */
    fill?: ColorProp<Feature> | null;
    /** The outlines' CSS color, or a function of the feature.  No outlines without one. */
    stroke?: ValueProp<string | null | undefined>;
    /**
     * Outline width in pixels, the same at any depth.
     *
     * @default 1
     */
    strokeWidth?: number;
    /**
     * CSS classes to style it by, as LayerChart's marks take them (ex. `fill-red-500 opacity-50`):
     * the fill, stroke, stroke width, and opacity they set, where its props don't say
     */
    class?: string;
    /** @default 1 */
    opacity?: number;
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
    /**
     * Ease each feature's height and fill to new values rather than jumping, ex. `'tween'` or
     * `{ type: 'tween', duration: 800 }`.
     */
    motion?: MotionOptions;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { geoPath } from 'd3-geo';
  import { BufferGeometry, Float32BufferAttribute, SphereGeometry } from 'three';
  import { getChartContext } from 'layerchart';
  import { createControlledMotion } from 'layerchart/utils/motion.svelte';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getSphere, sphereLines } from '../../utils/globe.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';
  import { valueOf } from '../../utils/values.js';
  import { rowColor } from '../../utils/marks.js';

  let {
    geojson,
    z,
    fill: fillProp,
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    tooltip = false,
    motion,
  }: GeoPathProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const fill = $derived(
    fillProp !== undefined ? fillProp : look?.fill === 'none' ? null : (look?.fill ?? defaultFill)
  );
  const stroke = $derived(strokeProp ?? look?.stroke);
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  /** On a `globe`, features draw over it as lines */
  const sphere = $derived(getSphere(ctx));

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
    const projection = ctx.geo.projection;
    return features.map((feature) => {
      if (sphere) return { positions: null, normals: null, lines: [] as [number, number][][] };
      const context = new ShapeContext();
      geoPath(projection ?? null, context as any)(feature);
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

  // The motion is fixed when the mark mounts, as LayerChart's marks' is
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

  createMerged({
    tooltip: () => tooltip,
    items: () => {
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
            lines: sphereLines(sphere, feature.geometry),
            stroke:
              valueOf(stroke, feature) ??
              (fill ? rowColor(ctx, fill, feature, defaultFill) : null) ??
              'var(--color-surface-content, currentColor)',
          };
        }
        const shape = shapes[i];
        const [z0, z1, r, g, b, a] = values.slice(i * 6, i * 6 + 6);
        const top = Math.max(z0, z1) + 0.5;
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
          lines: (shape?.lines ?? []).map((line) => line.flatMap(([x, y]) => [x, top, y])),
          stroke:
            valueOf(stroke, feature) ??
            (isLine(feature) ? 'var(--color-surface-content, currentColor)' : null),
        };
      });
    },
    opacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>
