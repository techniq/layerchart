import type { Accessor } from '$lib/utils/common.js';
import type { Component, ComponentProps, Snippet } from 'svelte';
import type BrushContext from '../BrushContext.svelte';
import type { AnyScale } from '$lib/utils/scales.svelte.js';
import type { Area, Axis, Group, Labels, Legend, Points, Rule, Spline } from '../index.js';
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
import type { BrushContextValue } from '../BrushContext.svelte';
import type { ChartContext } from '../Chart-Next.svelte';
import type { GeoContextValue } from '../GeoContext.svelte';
import type { TransformContextValue } from '../TransformContext.svelte';
import type Grid from '../Grid.svelte';
import type Bars from '../Bars.svelte';
import type Pie from '../Pie.svelte';
import type Arc from '../Arc.svelte';
import type Canvas from '../layout/Canvas.svelte';

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
   * The tooltip context associated with the chart.
   */
  tooltipContext: TooltipContextValue;

  /**
   * The brush context associated with the chart.
   */
  brushContext: BrushContextValue;

  /**
   * The chart context
   */
  context: ChartContext<TData>;

  /**
   * The geo context associated with the chart.
   */
  geoContext: GeoContextValue;

  /**
   * The transform context associated with the chart.
   */
  transformContext: TransformContextValue;

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
} & TSnippetProps;

export type SimplifiedChartSnippet<TData, TComponent extends Component, TSnippetProps> = Snippet<
  [SimplifiedChartSnippetProps<TData, TComponent, TSnippetProps>]
>;

export type SimplifiedChartPropsObject = {
  area?: Partial<ComponentProps<typeof Area>>;
  arc?: Partial<ComponentProps<typeof Arc>>;
  bars?: Partial<ComponentProps<typeof Bars>>;
  brush?: Partial<ComponentProps<typeof BrushContext>>;
  canvas?: Partial<ComponentProps<typeof Canvas>>;
  grid?: Partial<ComponentProps<typeof Grid>>;
  group?: Partial<ComponentProps<typeof Group>>;
  highlight?: Partial<ComponentProps<typeof Highlight>>;
  labels?: Partial<ComponentProps<typeof Labels>>;
  legend?: Partial<ComponentProps<typeof Legend>>;
  line?: Partial<ComponentProps<typeof Line>>;
  pie?: Partial<ComponentProps<typeof Pie>>;
  spline?: Partial<ComponentProps<typeof Spline>>;
  points?: Partial<ComponentProps<typeof Points>>;
  rule?: Partial<ComponentProps<typeof Rule>>;
  svg?: Partial<ComponentProps<typeof Svg>>;
  tooltip?: {
    context?: Partial<ComponentProps<typeof TooltipContext>>;
    root?: Partial<ComponentProps<typeof Tooltip>>;
    header?: Partial<ComponentProps<typeof TooltipHeader>>;
    list?: Partial<ComponentProps<typeof TooltipList>>;
    item?: Partial<ComponentProps<typeof TooltipItem>>;
    separator?: Partial<ComponentProps<typeof TooltipSeparator>>;
    hideTotal?: boolean;
  };
  xAxis?: Partial<ComponentProps<typeof Axis>>;
  yAxis?: Partial<ComponentProps<typeof Axis>>;
};

export type SimplifiedChartProps<
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
  grid?:
    | ComponentProps<typeof Grid>
    | boolean
    | SimplifiedChartSnippet<TData, TComponent, TSnippetProps>;
  /**
   * The labels to be used for the chart.
   *
   * @default false
   */
  labels?: ComponentProps<typeof Labels> | boolean;
  /**
   * The legend to be used for the chart.
   *
   * @default false
   */
  legend?:
    | ComponentProps<typeof Legend>
    | boolean
    | SimplifiedChartSnippet<TData, TComponent, TSnippetProps>;
  /**
   * The points to be used for the chart.
   *
   * @default false
   */
  points?:
    | ComponentProps<typeof Points>
    | boolean
    | SimplifiedChartSnippet<TData, TComponent, TSnippetProps>;

  /**
   * The rule to be used for the chart.
   *
   * @default true
   */
  rule?:
    | ComponentProps<typeof Rule>
    | boolean
    | SimplifiedChartSnippet<TData, TComponent, TSnippetProps>;

  /**
   * The tooltip to be used for the chart.
   */
  tooltip?:
    | ComponentProps<typeof TooltipContext>
    | boolean
    | SimplifiedChartSnippet<TData, TComponent, TSnippetProps>;

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

  children?: ChartSnippet;
  aboveContext?: ChartSnippet;
  belowContext?: ChartSnippet;
  belowMarks?: ChartSnippet;
  aboveMarks?: ChartSnippet;
  marks?: ChartSnippet;
  highlight?: ChartSnippet;
};
