import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { pointRadial } from 'd3-shape';
import type { Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import AxisGrid from './__fixtures__/AxisGrid.svelte';

type Props = Omit<Parameters<typeof render<typeof AxisGrid>>[1], 'onScene'>;

let chart: ChartState<any> | undefined;

/** Render, and wait for the marks to add their objects to the scene */
async function renderAxes(props: Props) {
  let scene: SceneState | undefined;
  render(AxisGrid, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

/** Everything in the scene that `is` */
function all(scene: SceneState, is: (o: any) => boolean) {
  const found: any[] = [];
  scene.root.traverse((o: Object3D) => {
    if (is(o)) found.push(o);
  });
  return found;
}
const visibleLines = (scene: SceneState) =>
  all(scene, (o) => o.isLineSegments2 && o.visible && o.geometry.attributes.instanceStart);

/** A line set's segments, as `[x, y]` pairs across and down the plot */
const segmentsOf = (lines: any): [number, number][][] => {
  const start = lines.geometry.attributes.instanceStart;
  const end = lines.geometry.attributes.instanceEnd;
  return Array.from({ length: start.count }, (_, i) => [
    [start.getX(i), start.getZ(i)],
    [end.getX(i), end.getZ(i)],
  ]);
};

/** A `tickLabel` (or `label`) snippet noting the props it's given, by `data-*` attributes */
const noted = createRawSnippet((args: () => { props: any }) => ({
  render: () => {
    const { value, x, y, dx, dy, textAnchor, verticalAnchor, rotate } = args().props;
    return `<i data-parity-label="${value}" data-x="${x}" data-y="${y}" data-dx="${dx}" data-dy="${dy}" data-anchor="${textAnchor}" data-vanchor="${verticalAnchor}" data-rotate="${rotate}"></i>`;
  },
}));
/** The props each noted label was given, by its text */
function notedLabels() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-parity-label]')].map((e) => [
      e.dataset.parityLabel,
      {
        x: Number(e.dataset.x),
        y: Number(e.dataset.y),
        dx: Number(e.dataset.dx),
        dy: Number(e.dataset.dy),
        textAnchor: e.dataset.anchor,
        verticalAnchor: e.dataset.vanchor,
        rotate: Number(e.dataset.rotate),
      },
    ])
  );
}

const flat = { xDomain: [0, 10], yDomain: [0, 10], padding: 20 };

describe('Axis tick labels, as the core `Axis` places them', () => {
  it("hangs `bottom`'s below the tick by their cap height, a tick and 2px down", async () => {
    await renderAxes({
      chart: flat,
      axes: [{ placement: 'bottom', ticks: [0, 5], tickLabel: noted }],
    });
    await expect.poll(() => Object.keys(notedLabels())).toEqual(['0', '5']);
    const five = notedLabels()['5'];
    expect(five.y).toBeCloseTo(chart!.height);
    expect(five.verticalAnchor).toBe('start');
    expect(five.dy).toBeCloseTo(6);
  });

  it('takes `dx` / `dy` from `tickLabelProps` in place of its own offset', async () => {
    await renderAxes({
      chart: flat,
      axes: [
        {
          placement: 'bottom',
          ticks: [5],
          tickLabelProps: { textAnchor: 'start', dx: 8, dy: 4 },
          tickLabel: noted,
        },
      ],
    });
    await expect.poll(() => notedLabels()['5']?.dy).toBeCloseTo(4);
    expect(notedLabels()['5']).toMatchObject({ dx: 8, textAnchor: 'start' });
  });

  it("turns a side's title to read up it, against the padding's edge", async () => {
    await renderAxes({
      chart: flat,
      axes: [{ placement: 'right', ticks: [], label: noted }],
    });
    await expect.poll(() => notedLabels()['']?.rotate).toBe(-90);
    const title = notedLabels()[''];
    expect(title.x).toBeCloseTo(chart!.width + 20);
    expect(title.y).toBeCloseTo(chart!.height / 2);
    expect(title.verticalAnchor).toBe('end');
  });
});

describe('Axis and Grid in a `radial` chart', () => {
  const radial = { xDomain: [0, 100], yDomain: [0, 100], radial: true };

  it("places `angle`'s labels around the rim, and `radius`' out from the center", async () => {
    await renderAxes({
      chart: radial,
      center: true,
      axes: [
        { placement: 'angle', ticks: [25], tickLabel: noted },
        { placement: 'radius', ticks: [50], tickLabel: noted },
      ],
    });
    await expect.poll(() => Object.keys(notedLabels()).sort()).toEqual(['25', '50']);
    const outer = chart!.height / 2;
    const [x, y] = pointRadial(Math.PI / 2, outer);
    expect(notedLabels()['25']).toMatchObject({ textAnchor: 'start', verticalAnchor: 'middle' });
    expect(notedLabels()['25'].x).toBeCloseTo(x);
    expect(notedLabels()['25'].y).toBeCloseTo(y);
    expect(notedLabels()['50'].x).toBeCloseTo(0);
    expect(notedLabels()['50'].y).toBeCloseTo(outer / 2);
  });

  it('draws spokes at the `x` ticks and circles at the `y` ticks', async () => {
    const scene = await renderAxes({
      chart: radial,
      center: true,
      grid: { x: true, xTicks: [0, 25, 50, 75], y: true, yTicks: [50, 100] },
    });
    await expect.poll(() => visibleLines(scene).length).toBe(2);
    const outer = chart!.height / 2;
    const distances = visibleLines(scene).map((lines) =>
      segmentsOf(lines).flatMap((segment) => segment.map(([x, y]) => Math.hypot(x, y)))
    );
    // The spokes: from the center out to the rim
    const spokes = distances.find((d) => d.length === 8)!;
    expect(Math.min(...spokes)).toBeCloseTo(0);
    expect(Math.max(...spokes)).toBeCloseTo(outer);
    // The circles: every point at one of the two radii
    const circles = distances.find((d) => d.length > 8)!;
    expect(circles.every((r) => Math.abs(r - outer / 2) < 0.01 || Math.abs(r - outer) < 0.01)).toBe(
      true
    );
  });
});

describe('Grid', () => {
  it('draws only the lines asked for, as the core `Grid`', async () => {
    const scene = await renderAxes({ chart: flat, grid: { x: true } });
    await expect.poll(() => visibleLines(scene).length).toBe(1);
    // Up and down the plot
    const [[a, b]] = segmentsOf(visibleLines(scene)[0]);
    expect(a[0]).toBeCloseTo(b[0]);
  });
});
