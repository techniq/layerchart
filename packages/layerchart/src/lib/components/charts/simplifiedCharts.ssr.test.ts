import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';

import AreaChart from './AreaChart/AreaChart.svelte';
import BarChart from './BarChart/BarChart.svelte';
import LineChart from './LineChart/LineChart.svelte';
import ScatterChart from './ScatterChart/ScatterChart.svelte';
import PieChart from './PieChart/PieChart.svelte';
import ArcChart from './ArcChart/ArcChart.svelte';
import CustomMarksChart from './__fixtures__/CustomMarksChart.svelte';

const data = [
  { month: 'Jan', value: 1 },
  { month: 'Feb', value: 3 },
  { month: 'Mar', value: 2 },
];

const cartesian = { x: 'month', y: 'value' };
const radial = { key: 'month', value: 'value' };

const cases = [
  ['AreaChart', AreaChart, cartesian],
  ['BarChart', BarChart, cartesian],
  ['LineChart', LineChart, cartesian],
  ['ScatterChart', ScatterChart, cartesian],
  ['PieChart', PieChart, radial],
  ['ArcChart', ArcChart, radial],
] as const;

// The `marks` prop shares its name with the `{#snippet marks}` each chart passes to `Chart`.
// The server compiler resolves the name inside the snippet to the snippet itself, so it recursed
// until the stack overflowed (#940)
describe('simplified charts with `ssr`', () => {
  for (const [name, component, props] of cases) {
    it(`${name} renders default marks`, () => {
      const { body } = render(component as any, {
        props: { ssr: true, data, width: 400, height: 200, ...props },
      });
      expect(body).toContain('<svg');
    });

    it(`${name} renders a custom \`marks\` snippet`, () => {
      const { body } = render(CustomMarksChart, {
        props: { component: component as any, ssr: true, data, width: 400, height: 200, ...props },
      });
      expect(body).toContain('class="custom-marks"');
    });
  }
});
