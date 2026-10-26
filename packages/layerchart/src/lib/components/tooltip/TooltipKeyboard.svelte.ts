import { format } from '@layerstack/utils';

import type { ChartState } from '$lib/states/chart.svelte.js';
import type { TooltipState } from '$lib/states/tooltip.svelte.js';
import type { TooltipMode } from './TooltipContext.svelte';
import { dataCoords, isSinglePointMode } from '$lib/utils/tooltip.js';
import { accessor } from '$lib/utils/common.js';
import {
  keyboardNav,
  keyboardNavStep,
  type KeyboardNavStep,
  type KeyboardNavTarget,
} from '$lib/utils/keyboard.js';

export type TooltipKeyboardOptions = {
  mode: TooltipMode;
  locked: () => boolean;
  onclick: () => ((e: MouseEvent, detail: { data: any }) => any) | undefined;
  show: (data: any, point: { x: number; y: number }) => void;
  hide: () => void;
};

/**
 * Keyboard navigation for `TooltipContext`, loaded the first time a keyboard accessible chart is
 * focused — so charts pay nothing for it until a keyboard user arrives.
 */
export class TooltipKeyboard {
  /** Description of the point the keyboard last moved to, announced to screen readers */
  announcement = $state('');

  /** The series navigation is on — `null` for the shared positions (or a lone series) */
  #seriesKey: string | null = null;

  /** Whether the keyboard (rather than the pointer) drove the current tooltip */
  #active = false;

  #ctx: ChartState<any, any, any>;
  #tooltip: TooltipState;
  #options: TooltipKeyboardOptions;

  /** What the keyboard steps through — built on the first key, and cached until the data changes */
  #nav = $derived.by(() =>
    keyboardNav(this.#ctx, { singlePoint: isSinglePointMode(this.#options.mode) })
  );

  constructor(
    ctx: ChartState<any, any, any>,
    tooltip: TooltipState,
    options: TooltipKeyboardOptions
  ) {
    this.#ctx = ctx;
    this.#tooltip = tooltip;
    this.#options = options;
  }

  /**
   * Moving along the position axis steps between points, and across it between series — so a
   * horizontal chart (`valueAxis="x"`) swaps the arrow keys.
   */
  #stepFor(key: string): KeyboardNavStep | undefined {
    const horizontal = this.#ctx.valueAxis === 'x';
    switch (key) {
      case 'ArrowRight':
        return horizontal ? 'nextSeries' : 'next';
      case 'ArrowLeft':
        return horizontal ? 'previousSeries' : 'previous';
      case 'ArrowDown':
        return horizontal ? 'next' : 'nextSeries';
      case 'ArrowUp':
        return horizontal ? 'previous' : 'previousSeries';
      case 'PageDown':
        return 'nextSeries';
      case 'PageUp':
        return 'previousSeries';
      case 'Home':
        return 'first';
      case 'End':
        return 'last';
    }
  }

  /** Act on a key pressed on the plot area */
  handle(key: string) {
    const step = this.#stepFor(key);
    if (step) {
      this.navigate(step);
      return;
    }

    const data = this.#tooltip.data;
    switch (key) {
      case 'Enter':
      case ' ':
        if (data != null) {
          // Like a native button, activating from the keyboard is a click
          this.#options.onclick()?.(new MouseEvent('click'), { data });
        }
        break;

      case 'Escape':
        if (data != null) {
          this.release();
          this.#options.hide();
        }
        break;
    }
  }

  navigate(step: KeyboardNavStep) {
    // A locked tooltip keeps its point, so there is nowhere to move
    if (this.#options.locked()) return;

    const data = this.#tooltip.data;
    const current = data != null ? { data, seriesKey: this.#seriesKey } : null;
    const target = keyboardNavStep(this.#ctx, this.#nav, current, step);
    if (!target) return;

    this.#active = true;
    if (target.seriesKey !== this.#seriesKey) {
      this.#seriesKey = target.seriesKey;
      // The same highlight hovering a legend item or a tooltip row applies, fading the others
      this.#ctx.series.highlightKey = target.seriesKey;
    }

    this.#options.show(target.data, this.#pointFor(target));
    this.announcement = this.#describe(target);
  }

  /** Hand the chart back to the pointer — dropping the series focus the keyboard highlighted */
  release() {
    if (!this.#active) return;
    this.#active = false;
    this.announcement = '';
    if (this.#seriesKey != null) {
      this.#seriesKey = null;
      this.#ctx.series.highlightKey = null;
    }
  }

  /** Focus left the chart — hide a tooltip the keyboard opened */
  blur() {
    if (!this.#active) return;
    this.release();
    this.#options.hide();
  }

  /**
   * Where to show the tooltip — on the point the keyboard is on, as the pointer would be when
   * resting on it.
   *
   * That's the row's own position, except for a series of wide data: there the row carries every
   * series, and its position is the middle of their values, so the value axis is moved to the
   * focused series' value (its top, when stacked).
   */
  #pointFor({ data, seriesKey }: KeyboardNavTarget) {
    const ctx = this.#ctx;
    const coords = dataCoords(ctx, data);
    if (seriesKey == null) return coords;

    // Rows of a series with its own data, or of a `c` category, are already that series' point
    const series = ctx.series.series.find((s) => s.key === seriesKey);
    if (!series || series.data) return coords;

    let value: any;
    if (ctx.isStacked) {
      const stack = ctx.series.getStackValue(seriesKey, data);
      value = stack && (ctx.series.stackLayout === 'stackDiverging' && stack[1] <= 0 ? stack[0] : stack[1]); // prettier-ignore
    } else {
      value = accessor(series.value ?? series.key)(data);
    }
    // A height (`z`) is already where `dataCoords` raises the row to
    if (value == null || Array.isArray(value) || ctx.valueAxis === 'z') return coords;

    // The row placed as `dataCoords` places any row — panel, `isometric` lift, pan / zoom — with
    // its value read as the focused series'
    const valueAxis = ctx.valueAxis;
    return dataCoords(
      {
        xScale: ctx.xScale,
        yScale: ctx.yScale,
        xInterval: ctx.xInterval,
        yInterval: ctx.yInterval,
        padding: ctx.padding,
        facet: ctx.facet,
        config: ctx.config,
        isometricLift: ctx.isometricLift,
        layerMatrix: () => ctx.layerMatrix(),
        heightOf: (d) => ctx.heightOf(d),
        x: valueAxis === 'x' ? () => value : ctx.x,
        y: valueAxis === 'y' ? () => value : ctx.y,
        xGet: valueAxis === 'x' ? () => ctx.xScale(value) : ctx.xGet,
        yGet: valueAxis === 'y' ? () => ctx.yScale(value) : ctx.yGet,
      },
      data
    );
  }

  /** Read a point the way the tooltip shows it, ex. `Apples, Jan 5, 10. 5 of 30` */
  #describe({ data, seriesKey }: KeyboardNavTarget) {
    const ctx = this.#ctx;
    const parts: any[] = [];

    if (ctx.facet.enabled) {
      parts.push(ctx.facet.tooltipLabel(data));
    }

    const series = seriesKey != null ? this.#tooltip.series.find((s) => s.key === seriesKey) : null;
    const seriesLabel = seriesKey != null ? (series?.label ?? seriesKey) : null;

    if (isSinglePointMode(this.#options.mode)) {
      const axisLabel = (axis: 'x' | 'y') =>
        typeof ctx.config[axis] === 'string' ? ctx.config[axis] : axis;
      parts.push(
        seriesLabel,
        `${axisLabel('x')} ${formatValue(ctx.x(data))}`,
        `${axisLabel('y')} ${formatValue(ctx.y(data))}`
      );
    } else {
      parts.push(formatValue(ctx.valueAxis === 'x' ? ctx.y(data) : ctx.x(data)));

      if (seriesKey != null) {
        // A `c` category isn't one of the tooltip's series, so its value is read off the row
        const value = series?.value ?? ctx[ctx.valueAxis](data);
        parts.unshift(seriesLabel);
        parts.push(formatValue(value));
      } else {
        for (const s of this.#tooltip.series) {
          if (!s.visible || s.value == null) continue;
          parts.push(
            s.key === 'default' ? formatValue(s.value) : `${s.label} ${formatValue(s.value)}`
          );
        }
      }
    }

    const nav = this.#nav;
    const group =
      (seriesKey != null ? nav.series.find((g) => g.key === seriesKey) : null) ??
      nav.positions ??
      nav.series[0];
    const index = group?.rows.indexOf(data) ?? -1;

    const description = parts.filter((p) => p != null && p !== '').join(', ');
    return index === -1 ? description : `${description}. ${index + 1} of ${group.rows.length}`;
  }
}

function formatValue(value: any) {
  return Array.isArray(value) ? value.map((v) => format(v)).join(' – ') : format(value);
}
