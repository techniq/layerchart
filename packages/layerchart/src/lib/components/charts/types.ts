import type { Accessor } from '$lib/utils/common.js';
import type { Component, ComponentProps } from 'svelte';
import type BrushContext from '../BrushContext.svelte';
import type {
  AnnotationPoint,
  AnnotationLine,
  AnnotationRange,
  Area,
  Axis,
  Group,
  Labels,
  Legend,
  Points,
  Rule,
  Spline,
} from '../index.js';
import type TooltipContext from '../tooltip/TooltipContext.svelte';
import type Highlight from '../Highlight.svelte';
import type Line from '../Line.svelte';
import type Svg from '../layers/Svg.svelte';
import type Tooltip from '../tooltip/Tooltip.svelte';
import type TooltipHeader from '../tooltip/TooltipHeader.svelte';
import type TooltipList from '../tooltip/TooltipList.svelte';
import type TooltipItem from '../tooltip/TooltipItem.svelte';
import type TooltipSeparator from '../tooltip/TooltipSeparator.svelte';
import type Grid from '../Grid.svelte';
import type Bars from '../Bars.svelte';
import type Pie from '../Pie.svelte';
import type Arc from '../Arc.svelte';
import type Canvas from '../layers/Canvas.svelte';

export type SeriesData<TData, TComponent extends Component> = {
  key: string;
  label?: string;
  value?: Accessor<TData>;
  /**
   * Maximum possible value. Useful when `data` is a single item
   */
  maxValue?: number;
  data?: TData[];
  color?: string;
  props?: Partial<ComponentProps<TComponent>>;
};

/**
 * Props object for configuring sub-components in simplified charts.
 * Each simplified chart picks the relevant props for its `props` bag.
 */
export type SimplifiedChartPropsObject<TData = any> = {
  area?: Partial<ComponentProps<typeof Area>>;
  arc?: Partial<ComponentProps<typeof Arc>>;
  bars?: Partial<ComponentProps<typeof Bars>>;
  brush?: Partial<ComponentProps<typeof BrushContext>>;
  canvas?: Partial<ComponentProps<typeof Canvas>>;
  grid?: Partial<ComponentProps<typeof Grid>>;
  group?: Partial<ComponentProps<typeof Group>>;
  highlight?: Partial<ComponentProps<typeof Highlight>>;
  labels?: Partial<ComponentProps<typeof Labels<TData>>>;
  legend?: Partial<ComponentProps<typeof Legend>>;
  line?: Partial<ComponentProps<typeof Line>>;
  pie?: Partial<ComponentProps<typeof Pie>>;
  spline?: Partial<ComponentProps<typeof Spline>>;
  points?: Partial<ComponentProps<typeof Points>>;
  rule?: Partial<ComponentProps<typeof Rule>>;
  svg?: Partial<ComponentProps<typeof Svg>>;
  tooltip?: {
    context?: Partial<ComponentProps<typeof TooltipContext>>;
    root?: Omit<Partial<ComponentProps<typeof Tooltip>>, 'context'>;
    header?: Partial<ComponentProps<typeof TooltipHeader>>;
    list?: Partial<ComponentProps<typeof TooltipList>>;
    item?: Partial<ComponentProps<typeof TooltipItem>>;
    separator?: Partial<ComponentProps<typeof TooltipSeparator>>;
    hideTotal?: boolean;
  };
  xAxis?: Partial<ComponentProps<typeof Axis>>;
  yAxis?: Partial<ComponentProps<typeof Axis>>;
};

export type ChartAnnotations = Array<
  | ({
      /** Create AnnotationPoint */
      type: 'point';

      /** Apply `above` or `below` marks
       * @default 'above'
       */
      layer?: 'above' | 'below';

      /** Related to specific series (if applicable).  Will hide if set and series not highlighted */
      seriesKey?: string;
    } & ComponentProps<typeof AnnotationPoint>)
  | ({
      /** Create AnnotationLine */
      type: 'line';

      /** Apply `above` or `below` marks
       * @default 'above'
       */
      layer?: 'above' | 'below';

      /** Related to specific series (if applicable).  Will hide if set and series not highlighted */
      seriesKey?: string;
    } & ComponentProps<typeof AnnotationLine>)
  | ({
      /** Create AnnotationRange */
      type: 'range';

      /** Apply `above` or `below` marks
       * @default 'above'
       */
      layer?: 'above' | 'below';

      /** Related to specific series (if applicable).  Will hide if set and series not highlighted */
      seriesKey?: string;
    } & ComponentProps<typeof AnnotationRange>)
>;
