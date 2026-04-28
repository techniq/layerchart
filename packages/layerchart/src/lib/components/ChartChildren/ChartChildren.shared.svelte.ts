import type { ComponentProps, Snippet } from 'svelte';

import type { ChartState } from '$lib/contexts/chart.js';
import type { AnyScale } from '$lib/utils/scales.svelte.js';

import type Axis from '../Axis/Axis.svelte';
import type Area from '../Area.svelte';
import type Arc from '../Arc.svelte';
import type Bars from '../Bars.svelte';
import type BrushContext from '../BrushContext.svelte';
import type Canvas from '../layers/Canvas.svelte';
import type Grid from '../Grid/Grid.svelte';
import type Group from '../Group/Group.svelte';
import type Highlight from '../Highlight.svelte';
import type Labels from '../Labels.svelte';
import type Legend from '../Legend.svelte';
import type Line from '../Line/Line.svelte';
import type Pie from '../Pie.svelte';
import type Points from '../Points.svelte';
import type Rule from '../Rule/Rule.svelte';
import type Spline from '../Spline.svelte';
import type Svg from '../layers/Svg.svelte';
import type TooltipContext from '../tooltip/TooltipContext.svelte';
import type Tooltip from '../tooltip/Tooltip.svelte';
import type TooltipHeader from '../tooltip/TooltipHeader.svelte';
import type TooltipList from '../tooltip/TooltipList.svelte';
import type TooltipItem from '../tooltip/TooltipItem.svelte';
import type TooltipSeparator from '../tooltip/TooltipSeparator.svelte';
import type { ChartAnnotations as ChartAnnotationsType } from '../charts/types.js';

// BaseChartProps
export type ChartChildrenProps<
  TData,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
  ChartSnippet = Snippet<[{ context: ChartState<TData, XScale, YScale> }]>,
> = {
  /**
   * The axis to be used for the chart.
   *
   * @default true
   */
  axis?: ComponentProps<typeof Axis> | 'x' | 'y' | boolean | ChartSnippet;

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
   * The tooltip snippet to be used for the chart.
   */
  tooltip?: ChartSnippet;

  /**
   * Tooltip context to be used for the chart.
   */
  tooltipContext?: Partial<ComponentProps<typeof TooltipContext>> | boolean;

  highlight?: boolean | Partial<ComponentProps<typeof Highlight>> | ChartSnippet;

  /** Annotations to show on chart */
  annotations?: ChartAnnotationsType;

  /**
   * Callback when tooltip data is clicked.
   */
  onTooltipClick?: (e: MouseEvent, details: { data: any }) => void;

  /**
   * Additional props to be passed to the components rendered internally by Chart components.
   * This is useful for customizing the behavior of individual components, without having
   * to fully override them via snippets.
   */
  props?: Partial<{
    area: Partial<ComponentProps<typeof Area>>;
    arc: Partial<ComponentProps<typeof Arc>>;
    bars: Partial<ComponentProps<typeof Bars>>;
    brush: Partial<ComponentProps<typeof BrushContext>>;
    canvas: Partial<ComponentProps<typeof Canvas>>;
    grid: Partial<ComponentProps<typeof Grid>>;
    group: Partial<ComponentProps<typeof Group>>;
    highlight: Partial<ComponentProps<typeof Highlight>>;
    labels: Partial<ComponentProps<Labels<TData>>>;
    legend: Partial<ComponentProps<typeof Legend>>;
    line: Partial<ComponentProps<typeof Line>>;
    pie: Partial<ComponentProps<typeof Pie>>;
    spline: Partial<ComponentProps<typeof Spline>>;
    points: Partial<ComponentProps<typeof Points>>;
    rule: Partial<ComponentProps<typeof Rule>>;
    svg: Partial<ComponentProps<typeof Svg>>;
    tooltip: {
      context?: Partial<ComponentProps<typeof TooltipContext>>;
      root?: Omit<Partial<ComponentProps<typeof Tooltip>>, 'context'>;
      header?: Partial<ComponentProps<typeof TooltipHeader>>;
      list?: Partial<ComponentProps<typeof TooltipList>>;
      item?: Partial<ComponentProps<typeof TooltipItem>>;
      separator?: Partial<ComponentProps<typeof TooltipSeparator>>;
      hideTotal?: boolean;
    };
    xAxis: Partial<ComponentProps<typeof Axis>>;
    yAxis: Partial<ComponentProps<typeof Axis>>;
  }>;

  // Snippets
  children?: ChartSnippet;
  belowContext?: ChartSnippet;
  belowMarks?: ChartSnippet;
  marks?: ChartSnippet;
  aboveMarks?: ChartSnippet;
  aboveContext?: ChartSnippet;
};
