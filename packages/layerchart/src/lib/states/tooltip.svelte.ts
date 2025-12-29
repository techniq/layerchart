import type { FormatType, FormatConfig } from '@layerstack/utils';

import type { TooltipMode } from '$lib/components/tooltip/TooltipContext.svelte';
import type { Accessor } from '$lib/utils/common.js';
import type { SeriesData } from '$lib/components/charts/types.js';

/**
 * Payload item for tooltip display, containing processed data for a single series or data point.
 */
export type TooltipPayload = {
  /** Color for this payload item (e.g., series color) */
  color?: string;
  /** Display name for this payload item (e.g., series label) */
  name?: string;
  /** Unique key identifier for this payload item */
  key: string;
  /** Label value (e.g., x-axis value or data label) */
  label?: string;
  /** The primary value to display */
  value?: any;
  /** Accessor function for key */
  keyAccessor?: Accessor<any>;
  /** Accessor function for value */
  valueAccessor?: Accessor<any>;
  /** Accessor function for label */
  labelAccessor?: Accessor<any>;
  /** Accessor function for color */
  colorAccessor?: Accessor<any>;
  /** The original raw data point */
  payload: any;
  /** Reference to the raw series data (if applicable) */
  rawSeriesData?: SeriesData<any, any>;
  /** Formatter for the value */
  formatter?: FormatType | FormatConfig;
};

/**
 * Configuration for generating tooltip payloads.
 * Set by simplified charts to configure payload generation behavior.
 */
export type TooltipPayloadConfig = {
  /**
   * Whether the series data is stacked (affects display order - stacked series are reversed).
   * @default false
   */
  stackedSeries?: boolean;

  /**
   * Whether this is a pie/arc chart (single item payload instead of series iteration).
   * When true, uses the accessor properties below instead of iterating over series.
   * @default false
   */
  singleItemPayload?: boolean;

  /**
   * For pie/arc charts: accessor for the key property
   */
  keyAccessor?: Accessor<any>;

  /**
   * For pie/arc charts: accessor for the label property
   */
  labelAccessor?: Accessor<any>;

  /**
   * For pie/arc charts: accessor for the value property
   */
  valueAccessor?: Accessor<any>;

  /**
   * For pie/arc charts: accessor for the color property
   */
  colorAccessor?: Accessor<any>;
};

export class TooltipState<T = any> {
  x = $state(0);
  y = $state(0);
  data = $state<T | null>(null);
  payload = $state<TooltipPayload[]>([]);
  isHoveringTooltipArea = $state(false);
  isHoveringTooltipContent = $state(false);

  /**
   * Configuration for generating tooltip payloads.
   * Set by simplified charts to provide chart-specific behavior.
   */
  payloadConfig = $state<TooltipPayloadConfig>({});

  mode: TooltipMode;
  show: (
    e: PointerEvent | MouseEvent | TouchEvent,
    tooltipData?: any,
    payload?: TooltipPayload
  ) => void;
  hide: (e?: PointerEvent) => void;

  constructor(
    mode: TooltipMode,
    show: (
      e: PointerEvent | MouseEvent | TouchEvent,
      tooltipData?: any,
      payload?: TooltipPayload
    ) => void,
    hide: (e?: PointerEvent) => void
  ) {
    this.mode = mode;
    this.show = show;
    this.hide = hide;
  }
}
