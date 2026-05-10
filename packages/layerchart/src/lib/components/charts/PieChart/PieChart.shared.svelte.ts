import type { Component, Snippet } from 'svelte';

import type { ChartProps } from '../../Chart/Chart.shared.svelte.js';
import type { ChartState } from '$lib/contexts/chart.js';
import type { Accessor } from '$lib/utils/common.js';
import type { ArcProps } from '../../Arc/Arc.shared.svelte.js';
import type { ArcLabelConfig } from '../../ArcLabel/ArcLabel.shared.svelte.js';
import type { GroupProps } from '../../Group/Group.shared.svelte.js';
import type { PieProps } from '../../Pie/Pie.shared.svelte.js';
import type { SeriesData } from '../types.js';

export type PieChartExtraSnippetProps<TData> = {
  key: Accessor<TData>;
  label: Accessor<TData>;
  value: Accessor<TData>;
  visibleData: TData[];
  getGroupProps: () => GroupProps;
};

// Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
export type PieChartProps<TData> = {
  /**
   * The data for the chart
   */
  data?: TData[] | readonly TData[];
} & Omit<
  ChartProps<any>,
  // Props that don't apply to PieChart
  'data' | 'axis' | 'brush' | 'grid' | 'highlight' | 'labels' | 'points' | 'rule'
> & {
    /**
     * Render text labels on each arc.
     *
     * Pass `true` to enable with default placement (`centroid`), or an object
     * to customize via `ArcLabel` props (placement, format, value accessor, etc).
     */
    labels?: boolean | (ArcLabelConfig & { value?: Accessor });
    /**
     * The series data to be used for the chart.
     */
    series?: SeriesData<TData, Component<ArcProps>>[];

    /**
     * Key accessor
     *
     * @default 'key'
     */
    key?: Accessor<TData>;

    /**
     * Label accessor
     *
     * @default 'label'
     */
    label?: Accessor<TData>;

    /**
     * Value accessor
     *
     * @default 'value'
     */
    value?: Accessor<TData>;

    /**
     * Color accessor
     *
     * @default key
     */
    c?: Accessor<TData>;

    /**
     * Maximum possible value, useful when `data` is single item
     */
    maxValue?: number;

    /**
     * Range [min, max] in degrees.
     *
     * See also `startAngle`/`endAngle`
     *
     * @default [0, 360]
     */
    range?: [number, number];

    /**
     * Inner radius of the arc.
     *   value >= 1: discrete value
     *   value >  0: percent of `outerRadius`
     *   value <  0: offset of `outerRadius`
     */
    innerRadius?: number;

    /**
     * Outer radius of the arc.
     */
    outerRadius?: number;

    /**
     * Corner radius of the arc
     *
     * @default 0
     */
    cornerRadius?: number;

    /**
     * Angle between the arcs
     *
     * @default 0
     */
    padAngle?: number;

    /**
     * Placement of the PieChart
     *
     * @default 'center'
     */
    placement?: 'left' | 'center' | 'right';

    /**
     * Center the chart.
     *
     * Override and use `props.group` for more control.
     *
     * @default placement === 'center'
     */
    center?: boolean;

    /**
     * Replace the default rendering of the `<Pie>` component internally with your own.
     *
     * Use the `props` snippet prop to access the default props.
     */
    pie?: Snippet<
      [
        { context: ChartState<TData> } & PieChartExtraSnippetProps<TData> & {
            /**
             * Default props to apply to the Pie component.
             */
            props: PieProps;
            /**
             * The index of the pie series currently being iterated over.
             */
            index: number;
          },
      ]
    >;

    /**
     * Replace the default rendering of the `<Arc>` component internally with your own.
     *
     * Use the `props` snippet prop to access the default props.
     */
    arc?: Snippet<
      [
        { context: ChartState<TData> } & PieChartExtraSnippetProps<TData> & {
            props: ArcProps;
            /**
             * The index of the arc currently being iterated over
             */
            index: number;

            /**
             * The index of the series currently being iterated over.
             */
            seriesIndex: number;
          },
      ]
    >;

    /**
     * A callback function triggered when the arc is clicked.
     */
    onArcClick?: (
      e: MouseEvent,
      detail: { data: any; series: SeriesData<TData, Component<ArcProps>> }
    ) => void;

    /**
     * Enable profiling to measure render time.
     * @default false
     */
    profile?: boolean;
  };
