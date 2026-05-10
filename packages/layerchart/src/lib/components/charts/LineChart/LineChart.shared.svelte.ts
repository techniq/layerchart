import type { Component } from 'svelte';

import type { ChartProps } from '../../Chart/Chart.shared.svelte.js';
import type { HighlightPointData } from '../../Highlight/Highlight.shared.svelte.js';
import type { SplineProps } from '../../Spline/Spline.shared.svelte.js';
import type { SeriesData } from '../types.js';

// Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
export type LineChartProps<TData> = {
  /**
   * The data for the chart
   */
  data?: TData[] | readonly TData[];
} & Omit<ChartProps<any>, 'data'> & {
    /**
     * The orientation of the chart.  Sets which axis is the value axis.
     *
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * The series data to be used for the chart.
     * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
     */
    series?: SeriesData<TData, Component<SplineProps>>[];

    /**
     * The event to be dispatched when the point is clicked.
     */
    onPointClick?: (
      e: MouseEvent,
      details: { data: HighlightPointData; series: SeriesData<TData, Component<SplineProps>> }
    ) => void;

    /**
     * Enable profiling to measure render time.
     * @default false
     */
    profile?: boolean;
  };
