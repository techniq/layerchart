<script lang="ts" module>
  import type { ValueProp } from '../../utils/values.js';

  /** A point in pixels: across, down the plot, and (optionally) up off the floor */
  export type LinkPoint = [x: number, y: number, z?: number];

  export type LinkProps = {
    /** Rows to draw a link each for */
    data: any[];
    /** Where each link starts, in pixels, or a function of the row */
    source: ValueProp<LinkPoint>;
    /** Where each link ends, in pixels, or a function of the row */
    target: ValueProp<LinkPoint>;
    /**
     * How high each link arches above the straight line between its ends, in pixels (ex. flight
     * paths over a map), or a function of the row.
     *
     * @default 0 (straight)
     */
    arc?: ValueProp<number>;
    /**
     * A CSS color, or a function of the row.
     *
     * @default 'var(--color-surface-content)'
     */
    stroke?: ValueProp<string>;
    /** @default 1 */
    strokeWidth?: number;
  };
</script>

<script lang="ts">
  import { createMerged } from '../../utils/merged.svelte.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    source,
    target,
    arc = 0,
    stroke = 'var(--color-surface-content, currentColor)',
    strokeWidth = 1,
  }: LinkProps = $props();

  createMerged({
    items: () =>
      data.map((d) => {
        const [x0, y0, z0 = 0] = valueOf(source, d);
        const [x1, y1, z1 = 0] = valueOf(target, d);
        const lift = valueOf(arc, d);
        const steps = lift ? 24 : 1;
        const line: number[] = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          // A parabola over the straight line, peaking `lift` above its middle
          const up = 4 * lift * t * (1 - t);
          line.push(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t + up, y0 + (y1 - y0) * t);
        }
        return { d, geometry: null, fill: null, lines: [line], stroke: valueOf(stroke, d) };
      }),
    opacity: () => 1,
    strokeWidth: () => strokeWidth,
  });
</script>
