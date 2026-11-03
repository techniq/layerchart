import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';
import { isScaleOrdinal, type ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';

const SIZE = 256;

/**
 * Colors for values from `min` to `max`, as LayerChart's `Raster` picks them: through the chart's
 * continuous color scale (`cScale` / `cRange`), else yellow-green-blue.  Read off a table of
 * `SIZE` steps, so CSS colors like `var(--color-primary)` resolve once each, not once per vertex.
 */
export class ColorRamp {
  readonly min: number;
  readonly max: number;
  /** RGBA, `0`–`1`, sRGB-decoded to three.js's working color space (for vertex colors) */
  readonly table = new Float32Array(SIZE * 4);
  /** RGBA bytes as sRGB (for textures) */
  readonly bytes = new Uint8Array(SIZE * 4);

  constructor(ctx: ChartState<any>, scene: SceneState, [min, max]: [number, number]) {
    this.min = min;
    this.max = max;
    let scale: (value: number) => unknown;
    if (ctx.cScale && !isScaleOrdinal(ctx.cScale)) {
      const copy = (ctx.cScale as any).copy();
      scale = ctx.props.cDomain ? copy : copy.domain([min, max]);
    } else {
      scale = scaleSequential([min, max], interpolateYlGnBu);
    }
    for (let i = 0; i < SIZE; i++) {
      const resolved = scene.color(String(scale(min + ((max - min) * i) / (SIZE - 1))));
      this.table[i * 4] = resolved?.color.r ?? 0.5;
      this.table[i * 4 + 1] = resolved?.color.g ?? 0.5;
      this.table[i * 4 + 2] = resolved?.color.b ?? 0.5;
      this.table[i * 4 + 3] = resolved?.opacity ?? 1;
      const srgb = resolved?.color.clone().convertLinearToSRGB();
      this.bytes[i * 4] = Math.round((srgb?.r ?? 0.5) * 255);
      this.bytes[i * 4 + 1] = Math.round((srgb?.g ?? 0.5) * 255);
      this.bytes[i * 4 + 2] = Math.round((srgb?.b ?? 0.5) * 255);
      this.bytes[i * 4 + 3] = Math.round((resolved?.opacity ?? 1) * 255);
    }
  }

  /** The table entry (an offset into `table`) for `value` */
  offset(value: number) {
    const t = this.max > this.min ? (value - this.min) / (this.max - this.min) : 0;
    return Math.round(Math.min(1, Math.max(0, t)) * (SIZE - 1)) * 4;
  }
}
