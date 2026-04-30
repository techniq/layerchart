import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import type { Without } from '$lib/utils/types.js';
import type { DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import {
  resolveDataProp,
  resolveGeoDataPair,
} from '$lib/utils/dataProp.js';
import { chartDataArray } from '$lib/utils/common.js';
import { createMotion, createDataMotionMap, type MotionProp } from '$lib/utils/motion.svelte.js';
import { get } from '@layerstack/utils';
import { format as formatValue, type FormatType, type FormatConfig } from '@layerstack/utils';
import { getStringWidth, truncateText, type TruncateTextOptions } from '$lib/utils/string.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';

/**
 * Check if a string looks like a CSS/SVG value (percentage, em, px, etc.)
 * rather than a data property accessor.
 */
function isCSSValue(value: string): boolean {
  return /^-?[\d.]+(%|em|rem|px|pt|cm|mm|in)?$/.test(value);
}

/**
 * Check if a Text prop value is a data-space prop.
 * Functions are always data props.
 * Strings are data props unless they look like CSS values (e.g. "50%", "1em").
 */
export function isTextDataProp(value: any): boolean {
  if (typeof value === 'function') return true;
  if (typeof value === 'string' && !isCSSValue(value)) return true;
  return false;
}

export type TextSegment = {
  value: string | number;
  class?: string;
};

export type TextPropsWithoutHTML = {
  /**
   * Text value to render.
   * - `number`: direct value
   * - `string`: in data mode, treated as a data property name (e.g. `"label"` → `d.label`);
   *   in pixel mode, used as literal text
   * - `function(d)`: accessor called per data item to get the text value
   *
   * @default 0
   */
  value?: string | number | ((d: any) => string | number);

  /**
   * Array of styled text segments for inline mixed styling.
   * Each segment has its own value and optional class.
   * Mutually exclusive with `value`.
   */
  segments?: TextSegment[];

  /**
   * Maximum width to occupy (approximate as words are not split)
   */
  width?: number;

  /**
   * x position of the text.
   * - `number`: pixel value (direct)
   * - `string` (CSS value like "50%"): SVG position value
   * - `string` (property name like "date"): data property, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @default 0
   */
  x?: string | number | ((d: any) => any);

  /**
   * Initial x position of the text (pixel mode only).
   *
   * @default x
   */
  initialX?: string | number;

  /**
   * y position of the text.
   * - `number`: pixel value (direct)
   * - `string` (CSS value like "50%"): SVG position value
   * - `string` (property name like "value"): data property, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default 0
   */
  y?: string | number | ((d: any) => any);

  /**
   * Initial y position of the text (pixel mode only).
   *
   * @default y
   */
  initialY?: string | number;

  /**
   * dx offset of the text
   *
   * @default 0
   */
  dx?: string | number;

  /**
   * dy offset of the text
   *
   * @default 0
   */
  dy?: string | number;

  /**
   * Desired "line height" of the text, implemented as y offsets
   *
   * @default "1em"
   */
  lineHeight?: string;

  /**
   * Cap height of the text
   * @default '0.71em'
   */
  capHeight?: string;

  /**
   * Whether to scale the fontSize to accommodate the specified width
   *
   * @default false
   */
  scaleToFit?: boolean;

  /**
   * Horizontal text anchor
   *
   * @default 'start'
   */
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';

  /**
   * Vertical text anchor
   *
   * @default 'end'
   */
  verticalAnchor?: 'start' | 'middle' | 'end' | 'inherit';

  /**
   * The dominant baseline of the text.  Useful for aligning text to the baseline of the axis.
   *
   * @default 'auto'
   */
  dominantBaseline?:
    | 'auto'
    | 'text-before-edge'
    | 'text-after-edge'
    | 'middle'
    | 'hanging'
    | 'ideographic'
    | 'mathematical';

  /**
   * Rotational angle of the text
   */
  rotate?: number;

  /**
   * A bindable reference to the wrapping `<svg>` element.
   *
   * @bindable
   */
  svgRef?: SVGElement;

  /**
   * Props to pass to the wrapping `<svg>` element.
   */
  svgProps?: Omit<SVGAttributes<SVGElement>, 'children'>;

  /**
   * A bindable reference to the inner `<text>` element
   *
   * @bindable
   */
  ref?: SVGTextElement;

  /**
   * Format the displayed value. When set with `motion` and a numeric `value`,
   * the number will tween smoothly and be formatted for display.
   */
  format?: FormatType | FormatConfig;

  /** Motion configuration (pixel mode only). */
  motion?: MotionProp;

  /**
   * Whether to enable text truncation
   */
  truncate?: boolean | TruncateTextOptions;

  /**
   * A unique identifier for the SVG path element.
   * One is generated by default if not provided.
   *
   */
  pathId?: string;

  /**
   * The path to render the text along.
   */
  path?: string | null;

  /**
   * Specify the offset for the start of the text along the path.
   * Can be a percentage ('50%') or a length value.
   *
   * @default '0%'
   */
  startOffset?: string | number;

  /**
   * Data array to iterate over in data mode.
   * Falls back to chart context data when not provided.
   */
  data?: any[];

  /**
   * Key function for keyed {#each} rendering in data mode.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => any;
} & DataDrivenStyleProps;

export type TextProps = TextPropsWithoutHTML &
  Without<SVGAttributes<SVGTextElement>, TextPropsWithoutHTML>;

const defaultKey = (_: any, i: number) => i;

export function getPathLength(pathRef: SVGPathElement | undefined) {
  if (pathRef && typeof pathRef.getTotalLength === 'function') {
    try {
      return pathRef.getTotalLength();
    } catch (e) {
      console.error('Error getting path length:', e);
      return 0;
    }
  }
  return 0;
}

/**
 * Convert css value to pixel value (ex. 0.71em => 11.36)
 */
export function getPixelValue(cssValue: number | string) {
  // TODO: Properly measure pixel values using DOM (handle inherited font size, zoom, etc)
  if (typeof cssValue === 'number') return cssValue;
  const result = cssValue.match(/([\d.]+)(\D+)/);
  const number = Number(result?.[1]);
  switch (result?.[2]) {
    case 'px':
      return number;
    case 'em':
    case 'rem':
      return number * 16;
    default:
      return 0;
  }
}

export function isValidXOrY(xOrY: string | number | undefined) {
  return (
    (typeof xOrY === 'number' && Number.isFinite(xOrY)) ||
    typeof xOrY === 'string'
  );
}

/** Build the standard `markInfo` payload used by every Text variant. */
export function textMarkInfo(props: TextProps, dataMode: boolean) {
  if (!dataMode) return {};
  return {
    data: props.data,
    x: typeof props.x === 'string' ? props.x : undefined,
    y: typeof props.y === 'string' ? props.y : undefined,
    color: typeof props.fill === 'string' ? props.fill : undefined,
  };
}

/**
 * Reactive state shared by every per-layer Text variant. Instantiate from
 * each `Text.svg.svelte` / `Text.canvas.svelte` / `Text.html.svelte`
 * component setup, passing a getter for the props.
 *
 * Per-layer specific bits (SVG `bind:this` refs, canvas's `render` function,
 * canvas-specific style measurement) stay in their respective `.svelte` files.
 */
export class TextState {
  #getProps: () => TextProps = () => ({}) as TextProps;

  // Contexts
  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  // Path measurement (only meaningful for SVG layer where the textPath element exists)
  pathRef = $state<SVGPathElement>();

  // Data mode detection
  dataMode = $derived(isTextDataProp(this.#getProps().x) || isTextDataProp(this.#getProps().y));

  // Data resolution
  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = this.resolveTextPosition(d);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
      };
    });
  });

  resolveTextPosition(d: any): { x: number; y: number } {
    const props = this.#getProps();
    if (this.geo.projection) {
      const [projX, projY] = resolveGeoDataPair(
        props.x as any,
        props.y as any,
        d,
        this.geo.projection
      );
      return { x: projX, y: projY };
    }
    return {
      x: resolveDataProp(props.x as any, d, this.chartCtx.xScale, 0),
      y: resolveDataProp(props.y as any, d, this.chartCtx.yScale, 0),
    };
  }

  resolveTextValue(d: any): string {
    const value = this.#getProps().value;
    if (typeof value === 'function') {
      const v = value(d);
      return v != null ? String(v) : '';
    }
    if (typeof value === 'string') {
      const v = get(d, value);
      return v != null ? String(v) : '';
    }
    return value != null ? String(value) : '';
  }

  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;

  // Pixel-mode motion sources. Only allocated when the user opts into
  // animation via the `motion` prop; otherwise the getters read directly
  // from props.
  #motionX: ReturnType<typeof createMotion<number | string>> | null = null;
  #motionY: ReturnType<typeof createMotion<number | string>> | null = null;
  #motionValue: ReturnType<typeof createMotion<number>> | null = null;

  get motionX() {
    if (this.#motionX) return this.#motionX.current;
    const x = this.#getProps().x;
    return typeof x === 'number' || typeof x === 'string' ? x : 0;
  }
  get motionY() {
    if (this.#motionY) return this.#motionY.current;
    const y = this.#getProps().y;
    return typeof y === 'number' || typeof y === 'string' ? y : 0;
  }

  // Resolved width: for path text, defer to the (SVG-bound) pathRef length
  resolvedWidth = $derived(this.#getProps().path ? getPathLength(this.pathRef) : this.#getProps().width);

  #defaultTruncateOptions: TruncateTextOptions = $derived({
    maxChars: undefined,
    position: 'end',
    maxWidth: this.resolvedWidth,
  });

  truncateConfig: TruncateTextOptions | boolean = $derived.by(() => {
    const truncate = this.#getProps().truncate;
    if (typeof truncate === 'boolean') {
      if (truncate) return this.#defaultTruncateOptions;
      return false;
    }
    return { ...this.#defaultTruncateOptions, ...(truncate ?? {}) };
  });

  // Numeric value tweening
  rawText = $derived.by(() => {
    const value = this.#getProps().value;
    const motion = this.#getProps().motion;
    const format = this.#getProps().format;
    if (typeof value === 'function' || value == null) return '';
    if (typeof value === 'number' && motion && this.#motionValue) {
      const v = this.#motionValue.current;
      // @ts-expect-error - improve format types
      return format ? formatValue(v, format) : String(v);
    }
    // @ts-expect-error - improve format types
    const text = format ? formatValue(value, format) : value.toString();
    return text.replace(/\\n/g, '\n');
  });

  textValue = $derived.by(() => {
    const cfg = this.truncateConfig;
    if (!cfg || cfg === true) return this.rawText;
    return truncateText(this.rawText, cfg);
  });

  // Word-wrapping (depends on style measurement; SVG/canvas-only)
  // Note: `style` is a placeholder — never assigned in the original component
  // either, so spaceWidth always falls back to 0. Preserved for behavior parity.
  #spaceWidth = $derived(getStringWidth(' ', undefined as any) || 0);

  wordsByLines = $derived.by(() => {
    const props = this.#getProps();
    const width = props.width;
    const scaleToFit = props.scaleToFit ?? false;
    const lines = this.textValue.split('\n');

    return lines.flatMap((line) => {
      const words = line.split(/(?:(?! +)\s+)/);
      if (width == null) {
        return [{ words }];
      }
      return words.reduce((result: { words: string[]; width?: number }[], item) => {
        const currentLine = result[result.length - 1];
        const itemWidth = getStringWidth(item, undefined as any) || 0;

        if (
          currentLine &&
          (width == null ||
            scaleToFit ||
            (currentLine.width || 0) + itemWidth + this.#spaceWidth < width)
        ) {
          currentLine.words.push(item);
          currentLine.width = currentLine.width || 0;
          currentLine.width += itemWidth + this.#spaceWidth;
        } else {
          const newLine = { words: [item], width: itemWidth };
          result.push(newLine);
        }
        return result;
      }, []);
    });
  });

  lineCount = $derived(this.wordsByLines.length);

  // Vertical positioning
  startDy = $derived.by(() => {
    const props = this.#getProps();
    const verticalAnchor = props.verticalAnchor ?? 'end';
    const lineHeight = props.lineHeight ?? '1em';
    const capHeight = props.capHeight ?? '0.71em';
    if (verticalAnchor === 'start') {
      return getPixelValue(lineHeight);
    } else if (verticalAnchor === 'middle') {
      return ((this.lineCount - 1) / 2) * -getPixelValue(lineHeight) + getPixelValue(capHeight) / 2;
    }
    return (this.lineCount - 1) * -getPixelValue(lineHeight) - getPixelValue(capHeight) / 2;
  });

  dataModeStartDy = $derived.by(() => {
    const props = this.#getProps();
    const verticalAnchor = props.verticalAnchor ?? 'end';
    const lineHeight = props.lineHeight ?? '1em';
    const capHeight = props.capHeight ?? '0.71em';
    if (verticalAnchor === 'start') return getPixelValue(lineHeight);
    if (verticalAnchor === 'middle') return getPixelValue(capHeight) / 2;
    return -getPixelValue(capHeight) / 2;
  });

  scaleTransform = $derived.by(() => {
    const props = this.#getProps();
    const x = props.x;
    const y = props.y;
    const width = props.width;
    const scaleToFit = props.scaleToFit ?? false;
    if (
      scaleToFit &&
      this.lineCount > 0 &&
      typeof x === 'number' &&
      typeof y === 'number' &&
      typeof width === 'number'
    ) {
      const lineWidth = this.wordsByLines[0].width || 1;
      const sx = width / lineWidth;
      const sy = sx;
      const originX = x - sx * x;
      const originY = y - sy * y;
      return `matrix(${sx}, 0, 0, ${sy}, ${originX}, ${originY})`;
    }
    return '';
  });

  rotateTransform = $derived.by(() => {
    const props = this.#getProps();
    return props.rotate ? `rotate(${props.rotate}, ${props.x}, ${props.y})` : '';
  });

  transform = $derived(
    (this.#getProps().transform as string | undefined) ??
      `${this.scaleTransform} ${this.rotateTransform}`
  );

  // Static (non-data-driven) values
  staticFill = $derived(
    typeof this.#getProps().fill === 'string' ? (this.#getProps().fill as string) : undefined
  );
  staticFillOpacity = $derived(
    typeof this.#getProps().fillOpacity === 'number'
      ? (this.#getProps().fillOpacity as number)
      : undefined
  );
  staticStroke = $derived(
    typeof this.#getProps().stroke === 'string' ? (this.#getProps().stroke as string) : undefined
  );
  staticStrokeWidth = $derived(
    typeof this.#getProps().strokeWidth === 'number'
      ? (this.#getProps().strokeWidth as number)
      : undefined
  );
  staticOpacity = $derived(
    typeof this.#getProps().opacity === 'number' ? (this.#getProps().opacity as number) : undefined
  );
  staticClassName = $derived(
    typeof this.#getProps().class === 'string' ? (this.#getProps().class as string) : undefined
  );

  constructor(getProps: () => TextProps) {
    this.#getProps = getProps;

    const initial = getProps();

    if (initial.motion !== undefined) {
      const _initialX: string | number =
        initial.initialX ?? (typeof initial.x === 'function' ? 0 : (initial.x ?? 0));
      const _initialY: string | number =
        initial.initialY ?? (typeof initial.y === 'function' ? 0 : (initial.y ?? 0));

      this.#motionX = createMotion(
        _initialX,
        () => {
          const x = getProps().x;
          return typeof x === 'number' || typeof x === 'string' ? x : 0;
        },
        initial.motion
      );
      this.#motionY = createMotion(
        _initialY,
        () => {
          const y = getProps().y;
          return typeof y === 'number' || typeof y === 'string' ? y : 0;
        },
        initial.motion
      );

      // Tween numeric values when motion is configured
      this.#motionValue = createMotion(
        typeof initial.value === 'number' ? initial.value : 0,
        () => (typeof getProps().value === 'number' ? (getProps().value as number) : 0),
        typeof initial.value === 'number' &&
          typeof initial.motion === 'object' &&
          'type' in initial.motion
          ? initial.motion
          : undefined
      );
    }

    this.#dataMotionMap = createDataMotionMap(initial.motion);
    if (this.#dataMotionMap) {
      const motionMap = this.#dataMotionMap;
      $effect(() => {
        if (!this.dataMode) return;
        const props = getProps();
        const keyFn = props.key ?? defaultKey;
        const activeKeys = new Set<any>();
        for (let i = 0; i < this.#resolvedData.length; i++) {
          const d = this.#resolvedData[i];
          const key = keyFn(d, i);
          activeKeys.add(key);
          const resolved = this.resolveTextPosition(d);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}

// Re-export for per-layer files that need it
export type { TruncateTextOptions } from '$lib/utils/string.js';
