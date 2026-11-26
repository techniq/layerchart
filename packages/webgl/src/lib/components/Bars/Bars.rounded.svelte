<!-- Bars or rects with rounded corners, flat on the floor: each a shape, as the core `Bar`'s and `Rect`'s rounded paths -->
<script lang="ts">
  import { ShapeGeometry } from 'three';
  import type { Instance } from '../../utils/instances.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { roundedRect } from '../../utils/rounded.js';

  let {
    bars,
    corners,
    height,
    stroke,
    strokeWidth,
    opacity,
    tooltip,
    filled = true,
    lineOpacity,
  }: {
    /** The bars where they are now (their `y` and `depth` down the plot) */
    bars: Instance[];
    /** Each bar's corner radii */
    corners: (bar: Instance) => [number, number, number, number];
    /** How far above the floor they lie */
    height: number;
    /** Each bar's outline color, or `null` for none */
    stroke: (d: any) => string | null;
    strokeWidth: number;
    opacity: number;
    tooltip: boolean;
    /** Filled in each one's color, or only outlined (ex. `fill="none"`) */
    filled?: boolean;
    /** The outlines' opacity, when not `opacity` (ex. a rect's `fillOpacity` is the fill's) */
    lineOpacity?: number;
  } = $props();

  /** A little above its fill, so its outline draws over it, as `Area`'s */
  const LINE_LIFT = 0.3;

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      bars.map((bar) => {
        const shape = roundedRect(bar.x, bar.y, bar.width, bar.depth, corners(bar));
        // In the scene's axes: across, up off the floor, and down the plot
        const geometry = new ShapeGeometry(shape, 4).rotateX(Math.PI / 2).translate(0, height, 0);
        const color = stroke(bar.d);
        return {
          d: bar.d,
          geometry,
          fill: filled ? bar.color : null,
          lines: color ? [shape.getPoints(4).flatMap((p) => [p.x, height + LINE_LIFT, p.y])] : [],
          stroke: color,
        };
      }),
    opacity: () => opacity,
    lineOpacity: () => lineOpacity ?? opacity,
    strokeWidth: () => strokeWidth,
  });
</script>
