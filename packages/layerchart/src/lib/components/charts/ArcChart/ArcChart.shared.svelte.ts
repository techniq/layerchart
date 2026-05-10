import type { Component, Snippet } from 'svelte';

import type { ChartProps } from '../../Chart/Chart.shared.svelte.js';
import type { ChartState } from '$lib/contexts/chart.js';
import type { ArcProps, ArcPropsWithoutHTML } from '../../Arc/Arc.shared.svelte.js';
import type { ArcLabelConfig } from '../../ArcLabel/ArcLabel.shared.svelte.js';
import type { GroupProps } from '../../Group/Group.shared.svelte.js';
import type { Accessor } from '$lib/utils/common.js';
import type { SeriesData } from '../types.js';

export type ArcChartExtraSnippetProps<TData> = {
  key: Accessor<TData>;
  label: Accessor<TData>;
  value: Accessor<TData>;
  visibleData: TData[];
  getGroupProps: () => GroupProps;
  getArcProps: (s: SeriesData<TData, Component<ArcProps>>, i: number) => ArcProps;
};

// Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
export type ArcChartProps<TData> = {
  /**
   * The data for the chart
   */
  data?: TData[] | readonly TData[];
} & Omit<
  ChartProps<any>,
  // Props that don't apply to ArcChart
  'data' | 'axis' | 'brush' | 'grid' | 'highlight' | 'labels' | 'points' | 'rule'
> & {
    /**
     * Render text labels on each arc.
     *
     * Pass `true` to enable with default placement (`centroid`), or an object
     * to customize via `ArcLabel` props (placement, format, value accessor, etc).
     */
    labels?: boolean | (ArcLabelConfig & { value?: Accessor });
  } & Pick<
    ArcPropsWithoutHTML,
    | 'cornerRadius'
    | 'trackCornerRadius'
    | 'padAngle'
    | 'trackPadAngle'
    | 'trackStartAngle'
    | 'trackEndAngle'
    | 'trackInnerRadius'
    | 'trackOuterRadius'
    | 'innerRadius'
    | 'outerRadius'
    | 'range'
  > & {
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
     * Placement of the ArcChart
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
     * A callback function triggered when the arc is clicked.
     */
    onArcClick?: (
      e: MouseEvent,
      detail: { data: any; series: SeriesData<TData, Component<ArcProps>> }
    ) => void;

    arc?: Snippet<
      [
        { context: ChartState<TData> } & ArcChartExtraSnippetProps<TData> & {
            props: ArcProps;
            /**
             * The index of the series currently being iterated over.
             */
            seriesIndex: number;
          },
      ]
    >;

    /**
     * Enable profiling to measure render time.
     * @default false
     */
    profile?: boolean;
  };
