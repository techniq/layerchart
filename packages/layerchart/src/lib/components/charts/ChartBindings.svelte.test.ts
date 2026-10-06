import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Component } from 'svelte';

import ChartBindings from './__fixtures__/ChartBindings.svelte';

import ArcChart from './ArcChart/ArcChart.svelte';
import ArcChartSvg from './ArcChart/ArcChart.svg.svelte';
import ArcChartCanvas from './ArcChart/ArcChart.canvas.svelte';
import AreaChart from './AreaChart/AreaChart.svelte';
import AreaChartSvg from './AreaChart/AreaChart.svg.svelte';
import AreaChartCanvas from './AreaChart/AreaChart.canvas.svelte';
import BarChart from './BarChart/BarChart.svelte';
import BarChartSvg from './BarChart/BarChart.svg.svelte';
import BarChartCanvas from './BarChart/BarChart.canvas.svelte';
import LineChart from './LineChart/LineChart.svelte';
import LineChartSvg from './LineChart/LineChart.svg.svelte';
import LineChartCanvas from './LineChart/LineChart.canvas.svelte';
import PieChart from './PieChart/PieChart.svelte';
import PieChartSvg from './PieChart/PieChart.svg.svelte';
import PieChartCanvas from './PieChart/PieChart.canvas.svelte';
import ScatterChart from './ScatterChart/ScatterChart.svelte';
import ScatterChartSvg from './ScatterChart/ScatterChart.svg.svelte';
import ScatterChartCanvas from './ScatterChart/ScatterChart.canvas.svelte';

const data = [
  { date: 0, value: 10 },
  { date: 1, value: 30 },
  { date: 2, value: 20 },
];

const cartesian = { data, x: 'date', y: 'value' };
const polar = { data, key: 'date', value: 'value' };

const charts: [string, Component<any>, Record<string, any>][] = [
  ['ArcChart', ArcChart, polar],
  ['ArcChart.svg', ArcChartSvg, polar],
  ['ArcChart.canvas', ArcChartCanvas, polar],
  ['AreaChart', AreaChart, cartesian],
  ['AreaChart.svg', AreaChartSvg, cartesian],
  ['AreaChart.canvas', AreaChartCanvas, cartesian],
  ['BarChart', BarChart, cartesian],
  ['BarChart.svg', BarChartSvg, cartesian],
  ['BarChart.canvas', BarChartCanvas, cartesian],
  ['LineChart', LineChart, cartesian],
  ['LineChart.svg', LineChartSvg, cartesian],
  ['LineChart.canvas', LineChartCanvas, cartesian],
  ['PieChart', PieChart, polar],
  ['PieChart.svg', PieChartSvg, polar],
  ['PieChart.canvas', PieChartCanvas, polar],
  ['ScatterChart', ScatterChart, cartesian],
  ['ScatterChart.svg', ScatterChartSvg, cartesian],
  ['ScatterChart.canvas', ScatterChartCanvas, cartesian],
];

describe('simplified chart bindings', () => {
  it.each(charts)('%s binds ref and context', async (_name, component, props) => {
    let bound: { ref: any; context: any } = { ref: undefined, context: undefined };

    const { container } = render(ChartBindings, {
      component,
      ...props,
      width: 400,
      height: 300,
      onbind: (b: typeof bound) => (bound = b),
    });

    const root = container.querySelector<HTMLElement>('.lc-root-container');
    await expect.element(root).toBeInTheDocument();

    await expect.poll(() => bound.ref).toBe(root);
    await expect.poll(() => bound.context?.width).toBeGreaterThan(0);
  });
});
