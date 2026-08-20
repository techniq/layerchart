import { describe, expect, it } from 'vitest';
import { scaleBand, scaleLinear } from 'd3-scale';

import { bisectData, dataCoords, findDatumByValue, pickNearest } from './tooltip.js';

const data = [
  { x: 0, y: 10 },
  { x: 10, y: 20 },
  { x: 20, y: 30 },
  { x: 30, y: 40 },
];

const xScale = scaleLinear().domain([0, 30]).range([0, 300]);
const yScale = scaleLinear().domain([0, 40]).range([200, 0]);

const ctx = {
  flatData: data,
  x: (d: any) => d.x,
  y: (d: any) => d.y,
  xScale,
  yScale,
} as any;

describe('pickNearest', () => {
  const acc = (d: any) => d.x;

  it('returns the nearer of the two values', () => {
    expect(pickNearest(data[0], data[1], 2, acc)).toEqual(data[0]);
    expect(pickNearest(data[0], data[1], 8, acc)).toEqual(data[1]);
  });

  it('returns the defined value when one side is missing', () => {
    expect(pickNearest(data[3], undefined, 100, acc)).toEqual(data[3]);
    expect(pickNearest(undefined, data[0], -100, acc)).toEqual(data[0]);
  });

  it('respects `left` and `right`', () => {
    expect(pickNearest(data[0], data[1], 9, acc, 'left')).toEqual(data[0]);
    expect(pickNearest(data[0], data[1], 1, acc, 'right')).toEqual(data[1]);
  });
});

describe('bisectData', () => {
  const acc = (d: any) => d.x;

  it('finds the closest data point', () => {
    expect(bisectData(data, acc, 12)).toEqual(data[1]);
    expect(bisectData(data, acc, 18)).toEqual(data[2]);
  });

  it('finds an exact match', () => {
    expect(bisectData(data, acc, 20)).toEqual(data[2]);
  });

  it('clamps to the first/last data point when outside the domain', () => {
    expect(bisectData(data, acc, -100)).toEqual(data[0]);
    expect(bisectData(data, acc, 100)).toEqual(data[3]);
  });

  it('bisects on the first value of a multi-value accessor', () => {
    const ranges = [{ span: [0, 5] }, { span: [10, 15] }, { span: [20, 25] }];
    const span = (d: any) => d.span;

    // `11` sits after the span starting at `10` and before the one starting at `20`
    expect(bisectData(ranges, span, 11, 'left')).toEqual(ranges[1]);
    expect(bisectData(ranges, span, 11, 'right')).toEqual(ranges[2]);
  });

  it('returns undefined for empty data', () => {
    expect(bisectData([], acc, 10)).toBeUndefined();
  });
});

describe('findDatumByValue', () => {
  it('bisects on `x` for x-oriented modes', () => {
    expect(findDatumByValue(ctx, { x: 21 }, { mode: 'bisect-x' })).toEqual(data[2]);
    expect(findDatumByValue(ctx, { x: 21 }, { mode: 'quadtree-x' })).toEqual(data[2]);
  });

  it('bisects on `y` for y-oriented modes', () => {
    expect(findDatumByValue(ctx, { y: 31 }, { mode: 'bisect-y' })).toEqual(data[2]);
    expect(findDatumByValue(ctx, { y: 31 }, { mode: 'quadtree-y' })).toEqual(data[2]);
  });

  it('falls back to the axis the value was supplied for', () => {
    // `quadtree` / `voronoi` / `manual` resolve by pixel proximity and have no value-based
    // equivalent, so `show({ value: { x } })` still works on charts using them
    expect(findDatumByValue(ctx, { x: 21 }, { mode: 'quadtree' })).toEqual(data[2]);
    expect(findDatumByValue(ctx, { y: 31 }, { mode: 'voronoi' })).toEqual(data[2]);
    expect(findDatumByValue(ctx, { x: 21 }, { mode: 'manual' })).toEqual(data[2]);
    expect(findDatumByValue(ctx, { x: 21 })).toEqual(data[2]);
  });

  it('respects `findTooltipData`', () => {
    expect(findDatumByValue(ctx, { x: 19 }, { mode: 'bisect-x', findTooltipData: 'left' })).toEqual(
      data[1]
    );
    expect(
      findDatumByValue(ctx, { x: 11 }, { mode: 'bisect-x', findTooltipData: 'right' })
    ).toEqual(data[2]);
  });

  describe('bisect-band', () => {
    const bandData = [
      { cat: 'a', v: 1 },
      { cat: 'a', v: 5 },
      { cat: 'b', v: 2 },
      { cat: 'b', v: 8 },
    ];

    it('finds the closest point within an x band', () => {
      const bandCtx = {
        flatData: bandData,
        x: (d: any) => d.cat,
        y: (d: any) => d.v,
        xScale: scaleBand().domain(['a', 'b']).range([0, 200]),
        yScale: scaleLinear().domain([0, 10]).range([100, 0]),
      } as any;

      expect(findDatumByValue(bandCtx, { x: 'a', y: 4 }, { mode: 'bisect-band' })).toEqual(
        bandData[1]
      );
      expect(findDatumByValue(bandCtx, { x: 'b', y: 3 }, { mode: 'bisect-band' })).toEqual(
        bandData[2]
      );
    });

    it('finds the closest point within a y band', () => {
      const bandCtx = {
        flatData: bandData,
        x: (d: any) => d.v,
        y: (d: any) => d.cat,
        xScale: scaleLinear().domain([0, 10]).range([0, 100]),
        yScale: scaleBand().domain(['a', 'b']).range([0, 200]),
      } as any;

      expect(findDatumByValue(bandCtx, { x: 4, y: 'a' }, { mode: 'bisect-band' })).toEqual(
        bandData[1]
      );
    });

    it('returns undefined without a band scale', () => {
      expect(findDatumByValue(ctx, { x: 10, y: 20 }, { mode: 'bisect-band' })).toBeUndefined();
    });
  });
});

describe('dataCoords', () => {
  it('positions a data point using the chart scales and padding', () => {
    const coordCtx = {
      xGet: (d: any) => xScale(d.x),
      yGet: (d: any) => yScale(d.y),
      xScale,
      yScale,
      padding: { top: 5, right: 0, bottom: 0, left: 20 },
    };

    expect(dataCoords(coordCtx, data[1])).toEqual({ x: 120, y: 105 });
  });

  it('positions to the center of a band', () => {
    const bandScale = scaleBand().domain(['a', 'b']).range([0, 200]);
    const coordCtx = {
      xGet: (d: any) => bandScale(d.cat),
      yGet: (d: any) => yScale(d.y),
      xScale: bandScale,
      yScale,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    } as any;

    // band 'a' starts at 0, and `step() / 2` centers it
    expect(dataCoords(coordCtx, { cat: 'a', y: 40 })).toEqual({ x: 50, y: 0 });
    expect(dataCoords(coordCtx, { cat: 'b', y: 40 })).toEqual({ x: 150, y: 0 });
  });

  it('positions to the midpoint of a multi-value accessor', () => {
    const coordCtx = {
      xGet: () => [100, 200],
      yGet: () => 50,
      xScale,
      yScale,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    } as any;

    expect(dataCoords(coordCtx, {})).toEqual({ x: 150, y: 50 });
  });
});
