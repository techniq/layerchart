import type { Component } from 'svelte';

import type { ChartProps } from '../../Chart/Chart.shared.svelte.js';
import type { BarsProps } from '../../Bars/Bars.shared.svelte.js';
import type { SeriesData } from '../types.js';

// Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
export type BarChartProps<TData> = {
  /**
   * The data for the chart
   */
  data?: TData[] | readonly TData[];
} & Omit<ChartProps<any>, 'data'> & {
    /**
     * The orientation of the chart.  Sets which axis is the value axis.
     *
     * @default 'vertical'
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * The series data to be used for the chart.
     * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
     */
    series?: SeriesData<TData, Component<BarsProps>>[];

    /**
     * The layout of the series.
     *
     * @default 'overlap'
     */
    seriesLayout?: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging' | 'group';

    /**
     * Padding between primary x or y bands/bars, applied to scaleBand().padding()
     *
     * @default 0.4
     */
    bandPadding?: number;

    /**
     * Padding between group/series items when using 'seriesLayout="group"', applied to scaleBand().padding()
     *
     * @default 0
     */
    groupPadding?: number;

    /**
     * Padding between series items within bars when using 'seriesLayout="stack"'
     *
     * @default 0
     */
    stackPadding?: number;

    /**
     * A callback function that is called when a bar is clicked.
     * @param e - The original event that triggered the callback
     * @param detail - An object containing the bar's data and series information
     */
    onBarClick?: (
      event: MouseEvent,
      detail: { data: any; series: SeriesData<TData, Component<BarsProps>> }
    ) => void;

    /**
     * Enable profiling to measure render time.
     * @default false
     */
    profile?: boolean;
  };
