import type { Accessor } from '$lib/utils/common.js';
import type { Component, ComponentProps, Snippet } from 'svelte';
import type BrushContext from '../BrushContext.svelte';
import type { AnyScale } from '$lib/utils/scales.svelte.js';
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
import type { TooltipContextValue } from '../tooltip/TooltipContext.svelte';
import type Highlight from '../Highlight.svelte';
import type Line from '../Line.svelte';
import type Svg from '../layout/Svg.svelte';
import type Tooltip from '../tooltip/Tooltip.svelte';
import type TooltipHeader from '../tooltip/TooltipHeader.svelte';
import type TooltipList from '../tooltip/TooltipList.svelte';
import type TooltipItem from '../tooltip/TooltipItem.svelte';
import type TooltipSeparator from '../tooltip/TooltipSeparator.svelte';
import type { ChartContextValue, ChartPropsWithoutHTML } from '../Chart.svelte';
import type Grid from '../Grid.svelte';
import type Bars from '../Bars.svelte';
import type Pie from '../Pie.svelte';
import type Arc from '../Arc.svelte';
import type Canvas from '../layout/Canvas.svelte';
import type { Without } from '$lib/utils/types.js';

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

export type SimplifiedChartSnippetProps<TData, TComponent extends Component, TSnippetProps> = {
  /**
   * The chart context
   */
  context: ChartContextValue<TData>;

  /**
   * The series of data for the chart.
   */
  series: SeriesData<TData, TComponent>[];

  /**
   * The visible series of data for the chart.
   */
  visibleSeries: SeriesData<TData, TComponent>[];

  /**
   * The current highlight series key for the chart.
   */
  highlightKey: SeriesData<TData, TComponent>['key'] | null;

  /**
   * A function to set the highlight series key for the chart.
   */
  setHighlightKey: (seriesKey: SeriesData<TData, TComponent>['key'] | null) => void;

  /**
   * Get the default props for the legend component.
   */
  getLegendProps: () => ComponentProps<typeof Legend>;
} & TSnippetProps;

export type SimplifiedChartSnippet<TData, TComponent extends Component, TSnippetProps> = Snippet<
  [SimplifiedChartSnippetProps<TData, TComponent, TSnippetProps>]
>;

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

export type BaseChartProps<
  TData,
  TComponent extends Component,
  TSnippetProps = {},
  ChartSnippet = SimplifiedChartSnippet<TData, TComponent, TSnippetProps>,
> = {
  /**
   * The data to be rendered in the chart.
   *
   * @default []
   */
  data?: TData[];

  /**
   * The x accessor function to be used for the chart.
   *
   */
  x?: Accessor<TData>;

  /**
   * The y accessor function to be used for the chart.
   *
   */
  y?: Accessor<TData>;

  xScale?: AnyScale;
  /**
   * The x domain to be used for the chart.
   *
   */
  xDomain?: ComponentProps<typeof BrushContext>['xDomain'];
  /**
   * Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to
   * radial.  Radial lines are positioned relative to the origin, use transform
   * (ex. `<Group center>`) to change the origin
   *
   * @default false
   */
  radial?: boolean;
  /**
   * The series data to be used for the chart.
   *
   * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
   */
  series?: SeriesData<TData, TComponent>[];
  /**
   * The layout of the series.
   *
   * @default 'overlap'
   */
  seriesLayout?: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging';
  /**
   * The axis to be used for the chart.
   *
   * @default true
   */
  axis?:
    | ComponentProps<typeof Axis>
    | 'x'
    | 'y'
    | boolean
    | SimplifiedChartSnippet<TData, TComponent, TSnippetProps>;
  /**
   * The brush to be used for the chart.
   *
   * @default false
   */
  brush?: ComponentProps<typeof BrushContext> | boolean;

  /**
   * The grid to be used for the chart.
   *
   * @default true
   */
  grid?: ComponentProps<typeof Grid> | boolean | ChartSnippet;

  /**
   * The labels to be used for the chart.
   *
   * @default false
   */
  labels?: ComponentProps<typeof Labels<TData>> | boolean | ChartSnippet;
  /**
   * The legend to be used for the chart.
   *
   * @default false
   */
  legend?: ComponentProps<typeof Legend> | boolean | ChartSnippet;

  /**
   * The points to be used for the chart.
   *
   * @default false
   */
  points?: ComponentProps<typeof Points> | boolean | ChartSnippet;

  /**
   * The rule to be used for the chart.
   *
   * @default true
   */
  rule?: ComponentProps<typeof Rule> | boolean | ChartSnippet;

  /**
   * The tooltip to be used for the chart.
   */
  tooltip?: ComponentProps<typeof TooltipContext> | boolean | ChartSnippet;

  highlight?: boolean | ChartSnippet;

  /** Annotations to show on chart */
  annotations?: ChartAnnotations;

  /**
   * The tooltip context to be used for the chart.
   */
  tooltipContext?: TooltipContextValue;

  /**
   * The event to be dispatched when the tooltip is clicked.
   *
   */
  onTooltipClick?: (e: MouseEvent, details: { data: any }) => void;

  /**
   * The render context to be used for the chart.
   *
   * @default 'svg'
   */
  renderContext?: 'svg' | 'canvas';

  /**
   * Whether to log the initial render performance using `console.time`.
   *
   * @default false
   */
  profile?: boolean;

  /**
   * Whether to enable debug mode.
   *
   * @default false
   */
  debug?: boolean;

  /**
   * A bindable reference to the chart context.
   */
  context?: ChartContextValue<TData>;

  children?: ChartSnippet;
  aboveContext?: ChartSnippet;
  belowContext?: ChartSnippet;
  belowMarks?: ChartSnippet;
  aboveMarks?: ChartSnippet;
  marks?: ChartSnippet;
};

export type SimplifiedChartProps<
  TData,
  TComponent extends Component,
  TSnippetProps = {},
  ChartSnippet = SimplifiedChartSnippet<TData, TComponent, TSnippetProps>,
> = BaseChartProps<TData, TComponent, TSnippetProps, ChartSnippet> &
  Without<
    ChartPropsWithoutHTML<TData>,
    BaseChartProps<TData, TComponent, TSnippetProps, ChartSnippet>
  >;

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
