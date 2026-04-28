import type { Component } from 'svelte';

import type { ChartProps } from '../../Chart/Chart.shared.svelte.js';
import type { PointsProps } from '../../Points/Points.shared.svelte.js';
import type { SeriesData } from '../types.js';

// Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
export type ScatterChartProps<TData> = {
  /**
   * The data for the chart
   */
  data?: TData[] | readonly TData[];
} & Omit<ChartProps<any>, 'data'> & {
    /**
     * The series data to be used for the chart.
     */
    series?: SeriesData<TData, Component<PointsProps>>[];

    /**
     * Enable profiling to measure render time.
     * @default false
     */
    profile?: boolean;
  };
