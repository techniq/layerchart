import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BinChart from './__fixtures__/BinChart.svelte';

// Two rows in the top-left 20px square, one in the bottom-right
const data = [
  { x: 2, y: 98 },
  { x: 4, y: 96 },
  { x: 98, y: 2 },
];

function cells(container: HTMLElement) {
  return [...container.querySelectorAll<SVGPathElement>('path.lc-bin-cell')];
}

describe('Bin', () => {
  it('draws one cell per occupied bin, colored by count', async () => {
    const { container } = render(BinChart, { props: { data, shape: 'square' } } as any);

    await vi.waitFor(() => expect(cells(container)).toHaveLength(2));
    const [crowded, single] = cells(container);
    expect(crowded.getAttribute('d')).toBe('M0,0L20,0L20,20L0,20Z');
    expect(single.getAttribute('d')).toBe('M180,180L200,180L200,200L180,200Z');
    // The ends of the default ramp
    expect(crowded.getAttribute('fill')).toBe('rgb(8, 29, 88)');
    expect(single.getAttribute('fill')).toBe('rgb(255, 255, 217)');
  });

  it('keeps a literal fill', async () => {
    const { container } = render(BinChart, {
      props: { data, shape: 'square', fill: 'red' },
    } as any);

    await vi.waitFor(() => expect(cells(container)).toHaveLength(2));
    expect(cells(container).every((cell) => cell.getAttribute('fill') === 'red')).toBe(true);
  });

  it('passes each cell to a fill function', async () => {
    const fill = vi.fn((cell) => (cell.count > 1 ? 'blue' : 'green'));
    const { container } = render(BinChart, { props: { data, shape: 'square', fill } } as any);

    await vi.waitFor(() => expect(cells(container)).toHaveLength(2));
    expect(cells(container).map((cell) => cell.getAttribute('fill'))).toEqual(['blue', 'green']);
    expect(fill).toHaveBeenCalledWith(
      expect.objectContaining({ x: 10, y: 10, count: 2, data: [data[0], data[1]] })
    );
  });

  it('sizes cells by `r`, the largest filling its cell', async () => {
    const { container } = render(BinChart, { props: { data, shape: 'square', r: 'count' } } as any);

    await vi.waitFor(() => expect(cells(container)).toHaveLength(2));
    const [crowded, single] = cells(container).map((cell) => cell.getBBox());
    expect(crowded.width).toBeCloseTo(20);
    // Half the count, half the area
    expect(single.width).toBeCloseTo(20 / Math.SQRT2);
  });

  it('with `empty`, tiles the plot', async () => {
    const { container } = render(BinChart, {
      props: { data: [], shape: 'square', empty: true, fill: 'none' },
    } as any);

    await vi.waitFor(() => expect(cells(container)).toHaveLength(100));
  });
});
