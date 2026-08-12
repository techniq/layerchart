import type { TooltipMode } from '$lib/components/tooltip/TooltipContext.svelte';
import type { SeriesData } from '$lib/components/charts/types.js';

export type TooltipSeries = {
  key: string;
  label: string;
  value: any;
  color?: string;
  visible: boolean;
  config: SeriesData<any, any>;
};

export type TooltipShowOptions<T = any> = {
  /**
   * Container-relative pixel position of the tooltip.  Defaults to the position of the resolved
   * data point, derived from the chart's own scales.
   */
  point?: { x: number; y: number };

  /**
   * Domain value(s) (ex. `{ x: new Date('2024-01-01') }`) used to resolve the nearest data point
   * from this chart's own data.
   *
   * Since it resolves by value rather than pixel position, it works regardless of the chart's
   * size, padding, or data — use it to drive tooltips programmatically, from the keyboard, or
   * from another chart.
   */
  value?: { x?: any; y?: any };

  /** An explicit data point, skipping resolution */
  data?: T;
};

export interface TooltipShow<T = any> {
  /**
   * Show the tooltip for an explicit position, domain value, and/or data point.
   *
   * *What* is shown resolves in order: `data`, then `value`, then whatever is found at `point`
   * using the configured `mode`.  *Where* it is shown is `point` when given, otherwise the
   * position of the resolved data point.
   */
  (options: TooltipShowOptions<T>): void;

  /**
   * Show the tooltip for a pointer event, resolving data using the configured `mode`.
   * Pass `data` to show a specific data point at the pointer position (ex. annotations).
   */
  (e: PointerEvent | MouseEvent | TouchEvent, data?: T): void;
}

export class TooltipState<T = any> {
  x = $state(0);
  y = $state(0);
  data = $state<T | null>(null);
  series = $state<TooltipSeries[]>([]);
  isHoveringTooltipArea = $state(false);
  isHoveringTooltipContent = $state(false);

  mode: TooltipMode;

  /**
   * Show the tooltip, either for a pointer event or for an explicit position, domain value,
   * and/or data point.
   *
   * ```ts
   * tooltip.show(e);                              // pointer event (resolves via `mode`)
   * tooltip.show(e, datum);                       // data point at the pointer (ex. annotations)
   * tooltip.show({ value: { x: someDate } });     // nearest data point to a domain value
   * tooltip.show({ data: datum });                // known data point
   * tooltip.show({ point: { x: 10, y: 20 } });    // container-relative pixel position
   * ```
   */
  show: TooltipShow<T>;

  /** Hide the tooltip (after `hideDelay`) */
  hide: (e?: PointerEvent) => void;

  constructor(mode: TooltipMode, show: TooltipShow<T>, hide: (e?: PointerEvent) => void) {
    this.mode = mode;
    this.show = show;
    this.hide = hide;
  }
}
