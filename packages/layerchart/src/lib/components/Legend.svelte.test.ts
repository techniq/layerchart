import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

import BarChart from './charts/BarChart/BarChart.svelte';
import LineChart from './charts/LineChart/LineChart.svelte';
import ChartWithMarkSeries from '$lib/tests/ChartWithMarkSeries.svelte';

const longData = [
  { year: 2019, fruit: 'apples', value: 30 },
  { year: 2019, fruit: 'bananas', value: 20 },
  { year: 2020, fruit: 'apples', value: 40 },
  { year: 2020, fruit: 'bananas', value: 10 },
];

describe('Legend variant', () => {
  it('should show labelled swatches for an ordinal color scale without series', async () => {
    // `c` carries the categories when the series are implicit — a ramp would be a strip of
    // unlabelled blocks naming none of them
    const { container } = render(BarChart, {
      props: {
        data: longData,
        x: 'year',
        x1: 'fruit',
        y: 'value',
        seriesLayout: 'group',
        c: 'fruit',
        cRange: ['red', 'yellow'],
        legend: true,
        width: 400,
        height: 300,
      },
    } as any);

    // `ChartChildren` imports `Legend` lazily
    await vi.waitFor(() => {
      const labels = [...container.querySelectorAll('.lc-legend-swatch-label')].map((el) =>
        el.textContent?.trim()
      );
      expect(labels).toEqual(['apples', 'bananas']);
    });
  });

  it('should keep the ramp for a sequential color scale', async () => {
    const { container } = render(LineChart, {
      props: {
        data: longData,
        x: 'year',
        y: 'value',
        c: 'value',
        cScale: scaleSequential(interpolateTurbo),
        legend: true,
        width: 400,
        height: 300,
      },
    } as any);

    await vi.waitFor(() => {
      expect(container.querySelector('.lc-legend-ramp-svg')).not.toBeNull();
    });
    expect(container.querySelectorAll('.lc-legend-swatch-label').length).toBe(0);
  });

  it('should let an ordinal `c` name the items over series inferred from marks', async () => {
    // A mark carrying its own data registers as a series named after its accessor — which names
    // the mark, not the chart's groups, so the colour scale wins
    const { container } = render(ChartWithMarkSeries, {} as any);

    await vi.waitFor(() => {
      const labels = [...container.querySelectorAll('.lc-legend-swatch-label')].map((el) =>
        el.textContent?.trim()
      );
      expect(labels).toEqual(['apples', 'bananas']);
    });
  });
});
