import type { Component } from 'svelte';

import type { ChartProps } from '../../Chart/Chart.shared.svelte.js';
import type { HighlightPoint } from '../../Highlight/Highlight.shared.svelte.js';
import type { AreaProps } from '../../Area/Area.shared.svelte.js';
import type { SeriesData } from '../types.js';

// Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
export type AreaChartProps<TData> = {
  /**
   * The data for the chart
   */
  data?: TData[] | readonly TData[];
} & Omit<ChartProps<any>, 'data'> & {
    /**
     * The series data to be used for the chart.
     * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
     */
    series?: SeriesData<TData, Component<AreaProps>>[];

    /**
     * The layout of the series.
     * @default 'overlap'
     */
    seriesLayout?: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging';

    /**
     * A callback function called when a point in the chart is clicked.
     *
     * @param e - the original event that triggered the `onPointClick`
     * @param details - an object containing the highlighted point and data
     */
    onPointClick?: (e: MouseEvent, details: { point: HighlightPoint; data: any }) => void;

    /**
     * Enable profiling to measure render time.
     * @default false
     */
    profile?: boolean;
  };
