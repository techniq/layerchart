import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';

export type ClipPathPropsWithoutHTML = {
  /** A unique id for the clipPath. */
  id?: string;

  /** Use existing path or shape (by id) for clipPath */
  useId?: string;

  /** Whether to disable clipping (show all). @default false */
  disabled?: boolean;

  /**
   * Invert the clip — content renders *outside* the shape instead of inside.
   * @default false
   */
  invert?: boolean;

  /**
   * SVG path `d` string describing the clip shape. Drives all three layers.
   */
  path?: string;

  /** A snippet to insert custom SVG content into the `<clipPath>`. */
  clip?: Snippet<[{ id: string }]>;

  /** Children to render. */
  children?: Snippet<[{ id: string; url: string; useId?: string }]>;
};

export type ClipPathProps = ClipPathPropsWithoutHTML &
  Without<SVGAttributes<SVGClipPathElement>, ClipPathPropsWithoutHTML>;

/**
 * Reactive state shared by every per-layer ClipPath variant.
 */
export class ClipPathState {
  #getProps: () => ClipPathProps = () => ({}) as ClipPathProps;

  chartCtx: ChartState = getChartContext();

  // Outer rect covering the chart bounds — combined with the clip shape under
  // even-odd fill rule to invert the clip.
  outerRect = $derived(`M0,0 H${this.chartCtx.width} V${this.chartCtx.height} H0 Z`);

  /** Effective path used for canvas + html layers when inverting. */
  effectivePath = $derived.by(() => {
    const props = this.#getProps();
    return props.invert && props.path ? `${this.outerRect} ${props.path}` : props.path;
  });

  constructor(getProps: () => ClipPathProps) {
    this.#getProps = getProps;
  }
}
