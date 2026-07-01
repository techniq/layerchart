import { describe, it, expect } from 'vitest';
import { BrushState, expandBandBrushDomain } from './brush.svelte.js';
import type { BrushChartContext } from './brush.svelte.js';

/** Create a mock chart context with a simple linear scale over [0, 100] */
function createMockCtx(options?: {
  xDomain?: [number, number];
  yDomain?: [number, number];
  width?: number;
  height?: number;
}): BrushChartContext {
  const xDomain = options?.xDomain ?? [0, 100];
  const yDomain = options?.yDomain ?? [0, 100];
  const width = options?.width ?? 500;
  const height = options?.height ?? 300;

  const xScale = (v: any) => ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * width;
  const yScale = (v: any) => height - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * height;

  return {
    xScale,
    yScale,
    baseXScale: { domain: () => xDomain },
    baseYScale: { domain: () => yDomain },
    width,
    height,
  };
}

describe('BrushState', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const brush = new BrushState(null);
      expect(brush.x).toEqual([null, null]);
      expect(brush.y).toEqual([null, null]);
      expect(brush.active).toBeUndefined();
      expect(brush.axis).toBe('x');
    });

    it('should initialize with provided options', () => {
      const ctx = createMockCtx();
      const brush = new BrushState(ctx, {
        x: [10, 50],
        y: [20, 80],
        axis: 'both',
        active: true,
      });
      expect(brush.x).toEqual([10, 50]);
      expect(brush.y).toEqual([20, 80]);
      expect(brush.axis).toBe('both');
      expect(brush.active).toBe(true);
    });
  });

  describe('domain bounds', () => {
    it('should return domain min/max from base scales', () => {
      const ctx = createMockCtx({ xDomain: [0, 200], yDomain: [10, 90] });
      const brush = new BrushState(ctx);
      expect(brush.xDomainMin).toBe(0);
      expect(brush.xDomainMax).toBe(200);
      expect(brush.yDomainMin).toBe(10);
      expect(brush.yDomainMax).toBe(90);
    });

    it('should return undefined when no ctx', () => {
      const brush = new BrushState(null);
      expect(brush.xDomainMin).toBeUndefined();
      expect(brush.xDomainMax).toBeUndefined();
    });
  });

  describe('range', () => {
    it('should return zero range when no ctx', () => {
      const brush = new BrushState(null);
      expect(brush.range).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should compute pixel range from domain values (x-axis)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], width: 500, height: 300 });
      const brush = new BrushState(ctx, { x: [20, 80], axis: 'x' });

      expect(brush.range.x).toBe(100); // 20/100 * 500
      expect(brush.range.width).toBe(300); // (80-20)/100 * 500
      // y-axis not active, should span full height
      expect(brush.range.y).toBe(0);
      expect(brush.range.height).toBe(300);
    });

    it('should compute pixel range for both axes', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100], width: 500, height: 300 });
      const brush = new BrushState(ctx, { x: [20, 80], y: [25, 75], axis: 'both' });

      expect(brush.range.x).toBe(100); // 20/100 * 500
      expect(brush.range.width).toBe(300); // (80-20)/100 * 500
    });
  });

  describe('reset', () => {
    it('should clear x, y, and active state', () => {
      const ctx = createMockCtx();
      const brush = new BrushState(ctx, { x: [10, 50], y: [20, 80], active: true });

      brush.reset();

      expect(brush.x).toEqual([null, null]);
      expect(brush.y).toEqual([null, null]);
      expect(brush.active).toBe(false);
    });
  });

  describe('selectAll', () => {
    it('should set x and y to full domain extent', () => {
      const ctx = createMockCtx({ xDomain: [0, 200], yDomain: [10, 90] });
      const brush = new BrushState(ctx);

      brush.selectAll();

      expect(brush.x).toEqual([0, 200]);
      expect(brush.y).toEqual([10, 90]);
    });
  });

  describe('move', () => {
    it('should set x domain and activate', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x' });

      brush.move({ x: [20, 80] });

      expect(brush.x).toEqual([20, 80]);
      expect(brush.active).toBe(true);
    });

    it('should set y domain only', () => {
      const ctx = createMockCtx({ yDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'y', x: [10, 50] });

      brush.move({ y: [30, 70] });

      expect(brush.x).toEqual([10, 50]); // unchanged
      expect(brush.y).toEqual([30, 70]);
      expect(brush.active).toBe(true);
    });

    it('should set both axes', () => {
      const ctx = createMockCtx();
      const brush = new BrushState(ctx, { axis: 'both' });

      brush.move({ x: [10, 90], y: [20, 80] });

      expect(brush.x).toEqual([10, 90]);
      expect(brush.y).toEqual([20, 80]);
      expect(brush.active).toBe(true);
    });

    it('should clear with null', () => {
      const ctx = createMockCtx();
      const brush = new BrushState(ctx, { axis: 'x', x: [20, 80], active: true });

      brush.move({ x: null });

      expect(brush.x).toEqual([null, null]);
      expect(brush.active).toBe(false);
    });

    it('should be inactive when only non-active axis has values', () => {
      const ctx = createMockCtx();
      const brush = new BrushState(ctx, { axis: 'x' });

      brush.move({ y: [20, 80] }); // axis is 'x', so y doesn't count

      expect(brush.active).toBe(false);
    });
  });

  describe('setRange', () => {
    it('should set brush to new range with clamping', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx);

      brush.setRange({ x: 20, y: 30 }, { x: 60, y: 70 });

      expect(brush.active).toBe(true);
      expect(brush.x).toEqual([20, 60]);
      expect(brush.y).toEqual([30, 70]);
    });

    it('should handle reversed values (drag right-to-left)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx);

      brush.setRange({ x: 60, y: 70 }, { x: 20, y: 30 });

      expect(brush.x).toEqual([20, 60]);
      expect(brush.y).toEqual([30, 70]);
    });

    it('should clamp to domain bounds', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx);

      brush.setRange({ x: -10, y: -10 }, { x: 150, y: 150 });

      expect(brush.x).toEqual([0, 100]);
      expect(brush.y).toEqual([0, 100]);
    });
  });

  describe('moveRange', () => {
    it('should move the range by delta', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx, { x: [20, 40], y: [20, 40] });

      brush.moveRange({ x: [20, 40], y: [20, 40], value: { x: 30, y: 30 } }, { x: 40, y: 50 });

      // Delta: x=+10, y=+20
      expect(brush.x).toEqual([30, 50]);
      expect(brush.y).toEqual([40, 60]);
    });

    it('should clamp movement to domain bounds', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx);

      brush.moveRange({ x: [80, 100], y: [80, 100], value: { x: 90, y: 90 } }, { x: 110, y: 110 });

      // Should not exceed domain max
      expect(brush.x).toEqual([80, 100]);
      expect(brush.y).toEqual([80, 100]);
    });
  });

  describe('adjustEdge', () => {
    it('should adjust the right edge', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { x: [20, 60] });

      brush.adjustEdge('right', { x: [20, 60], y: [0, 100] }, { x: 80, y: 50 });

      expect(brush.x).toEqual([20, 80]);
    });

    it('should adjust the left edge', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { x: [20, 60] });

      brush.adjustEdge('left', { x: [20, 60], y: [0, 100] }, { x: 10, y: 50 });

      expect(brush.x).toEqual([10, 60]);
    });

    it('should invert edges when dragged past the opposite edge', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { x: [20, 60] });

      // Drag left handle past right edge
      brush.adjustEdge('left', { x: [20, 60], y: [0, 100] }, { x: 80, y: 50 });

      expect(brush.x).toEqual([60, 80]);
    });

    it('should adjust the top edge', () => {
      const ctx = createMockCtx({ yDomain: [0, 100] });
      const brush = new BrushState(ctx, { y: [20, 60] });

      // Top edge pivots around start.y[0] (bottom of range)
      brush.adjustEdge('top', { x: [0, 100], y: [20, 60] }, { x: 50, y: 10 });

      expect(brush.y).toEqual([10, 20]);
    });

    it('should adjust the bottom edge', () => {
      const ctx = createMockCtx({ yDomain: [0, 100] });
      const brush = new BrushState(ctx, { y: [20, 60] });

      // Bottom edge pivots around start.y[1] (top of range)
      brush.adjustEdge('bottom', { x: [0, 100], y: [20, 60] }, { x: 50, y: 80 });

      expect(brush.y).toEqual([60, 80]);
    });

    it('should clamp to domain bounds', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { x: [20, 60] });

      brush.adjustEdge('right', { x: [20, 60], y: [0, 100] }, { x: 150, y: 50 });

      expect(brush.x).toEqual([20, 100]);
    });
  });

  describe('syncFromExternal', () => {
    it('should sync x/y values and set active when different from domain', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x' });

      brush.syncFromExternal([20, 80], null);

      expect(brush.x).toEqual([20, 80]);
      expect(brush.y).toEqual([null, null]);
      expect(brush.active).toBe(true);
    });

    it('should set inactive when x matches full domain', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x' });

      brush.syncFromExternal([0, 100], null);

      expect(brush.active).toBe(false);
    });

    it('should set inactive when x is null (reset)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', active: true, x: [20, 80] });

      brush.syncFromExternal(null, null);

      expect(brush.x).toEqual([null, null]);
      expect(brush.active).toBe(false);
    });

    it('should set inactive when x is [null, null] (reset via onChange)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', active: true, x: [20, 80] });

      brush.syncFromExternal([null, null], null);

      expect(brush.x).toEqual([null, null]);
      expect(brush.active).toBe(false);
    });

    it('should handle both axis mode', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'both' });

      brush.syncFromExternal([20, 80], [30, 70]);

      expect(brush.active).toBe(true);
    });

    it('should be inactive in both mode when only y differs but axis is x', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x' });

      brush.syncFromExternal([0, 100], [20, 80]);

      expect(brush.active).toBe(false);
    });

    it('should handle Date domains', () => {
      const d1 = new Date('2024-01-01');
      const d2 = new Date('2024-12-31');
      const d3 = new Date('2024-03-01');
      const d4 = new Date('2024-09-01');

      const ctx = createMockCtx();
      // Override baseXScale to use dates
      ctx.baseXScale = { domain: () => [d1, d2] };

      const brush = new BrushState(ctx, { axis: 'x' });

      brush.syncFromExternal([d3, d4], null);

      expect(brush.x).toEqual([d3, d4]);
      expect(brush.active).toBe(true);
    });

    it('should be inactive when Date domain matches full extent', () => {
      const d1 = new Date('2024-01-01');
      const d2 = new Date('2024-12-31');

      const ctx = createMockCtx();
      ctx.baseXScale = { domain: () => [d1, d2] };

      const brush = new BrushState(ctx, { axis: 'x' });

      // Same date values but different object references — should compare by valueOf
      brush.syncFromExternal([new Date('2024-01-01'), new Date('2024-12-31')], null);

      expect(brush.active).toBe(false);
    });

    it('should not write when values have not changed', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', x: [20, 80] });

      const originalX = brush.x;
      brush.syncFromExternal([20, 80], null);

      // Should be the same reference (no write)
      expect(brush.x).toBe(originalX);
    });
  });

  describe('band scale support', () => {
    const categories = ['A', 'B', 'C', 'D', 'E'];
    const bandwidth = 80; // 500 / 5 = 100 step, with padding ~80 band

    function createBandMockCtx(): BrushChartContext {
      const width = 500;
      const height = 300;
      const step = width / categories.length;
      const bw = bandwidth;

      const xScale = Object.assign(
        (v: any) => {
          const idx = categories.indexOf(v);
          return idx * step + (step - bw) / 2;
        },
        { bandwidth: () => bw }
      );
      const yScale = (v: any) => height - ((v as number) / 100) * height;

      return {
        xScale,
        yScale,
        baseXScale: { domain: () => categories },
        baseYScale: { domain: () => [0, 100] },
        width,
        height,
      };
    }

    it('should return correct domain min/max for band scales', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx);

      expect(brush.xDomainMin).toBe('A');
      expect(brush.xDomainMax).toBe('E');
    });

    it('should selectAll with first and last categories', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx);

      brush.selectAll();

      expect(brush.x).toEqual(['A', 'E']);
    });

    it('should setRange with categorical values', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx);

      brush.setRange({ x: 'B', y: 30 }, { x: 'D', y: 70 });

      expect(brush.active).toBe(true);
      expect(brush.x).toEqual(['B', 'D']);
    });

    it('should setRange with reversed categorical values', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx);

      brush.setRange({ x: 'D', y: 30 }, { x: 'B', y: 70 });

      expect(brush.x).toEqual(['B', 'D']);
    });

    it('should clamp setRange to domain bounds', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx);

      // 'A' is the min, 'E' is the max
      brush.setRange({ x: 'A', y: 0 }, { x: 'E', y: 100 });

      expect(brush.x).toEqual(['A', 'E']);
    });

    it('should compute range with bandwidth for band scales', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx, { x: ['B', 'D'], axis: 'x' });

      const range = brush.range;
      // Right edge should include bandwidth of last category
      const leftPx = ctx.xScale('B');
      const rightPx = ctx.xScale('D') + bandwidth;
      expect(range.x).toBe(leftPx);
      expect(range.width).toBe(rightPx - leftPx);
    });

    it('should moveRange by category offset', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx, { x: ['B', 'C'], y: [20, 40] });

      brush.moveRange({ x: ['B', 'C'], y: [20, 40], value: { x: 'B', y: 30 } }, { x: 'C', y: 40 });

      // Delta of 1 category to the right
      expect(brush.x).toEqual(['C', 'D']);
    });

    it('should clamp moveRange to domain bounds', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx, { x: ['D', 'E'] });

      brush.moveRange(
        { x: ['D', 'E'], y: [0, 100], value: { x: 'D', y: 50 } },
        { x: 'E', y: 50 } // try to move right by 1
      );

      // Should stay at domain boundary
      expect(brush.x).toEqual(['D', 'E']);
    });

    it('should adjustEdge right for categorical', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx, { x: ['B', 'D'] });

      brush.adjustEdge('right', { x: ['B', 'D'], y: [0, 100] }, { x: 'E', y: 50 });

      expect(brush.x).toEqual(['B', 'E']);
    });

    it('should adjustEdge left for categorical', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx, { x: ['B', 'D'] });

      brush.adjustEdge('left', { x: ['B', 'D'], y: [0, 100] }, { x: 'A', y: 50 });

      expect(brush.x).toEqual(['A', 'D']);
    });

    it('should invert edges when dragged past opposite edge (categorical)', () => {
      const ctx = createBandMockCtx();
      const brush = new BrushState(ctx, { x: ['B', 'D'] });

      // Drag left handle past right edge
      brush.adjustEdge('left', { x: ['B', 'D'], y: [0, 100] }, { x: 'E', y: 50 });

      expect(brush.x).toEqual(['D', 'E']);
    });
  });

  describe('constraints (min/maxExtent + constrain)', () => {
    const categories = ['A', 'B', 'C', 'D', 'E'];
    function createBandCtx(): BrushChartContext {
      return {
        xScale: Object.assign((v: any) => categories.indexOf(v) * 100, { bandwidth: () => 80 }),
        yScale: (v: any) => v,
        baseXScale: { domain: () => categories },
        baseYScale: { domain: () => [0, 100] },
        width: 500,
        height: 300,
      };
    }

    it('leaves the selection untouched when no constraints are set', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x' });
      brush.setRange({ x: 10, y: 0 }, { x: 90, y: 0 });
      expect(brush.x).toEqual([10, 90]);
    });

    it('caps a fresh draw to maxExtent, anchored to the drag origin', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 } });
      brush.setRange({ x: 10, y: 0 }, { x: 90, y: 0 });
      expect(brush.x).toEqual([10, 40]);
    });

    it('caps a right-edge resize to maxExtent, holding the left edge fixed', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 }, x: [20, 40] });
      brush.adjustEdge('right', { x: [20, 40], y: [0, 100] }, { x: 90, y: 50 });
      expect(brush.x).toEqual([20, 50]);
    });

    it('caps a left-edge resize to maxExtent, holding the right edge fixed', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 }, x: [50, 80] });
      brush.adjustEdge('left', { x: [50, 80], y: [0, 100] }, { x: 10, y: 50 });
      expect(brush.x).toEqual([50, 80]);
    });

    it('grows a too-small resize to minExtent, holding the dragged-from edge fixed', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', minExtent: { x: 20 }, x: [20, 60] });
      brush.adjustEdge('right', { x: [20, 60], y: [0, 100] }, { x: 25, y: 50 });
      expect(brush.x).toEqual([20, 40]);
    });

    it('shifts a minExtent selection back inside the domain when growth overruns the edge', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', minExtent: { x: 30 }, x: [90, 95] });
      brush.adjustEdge('right', { x: [90, 95], y: [0, 100] }, { x: 96, y: 50 });
      expect(brush.x).toEqual([70, 100]);
    });

    it('does not shrink the window while panning (extent is a no-op for moveRange)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 }, x: [20, 40] });
      brush.moveRange({ x: [20, 40], y: [0, 100], value: { x: 30, y: 50 } }, { x: 50, y: 50 });
      expect(brush.x).toEqual([40, 60]);
    });

    it('caps selectAll to maxExtent from the domain start', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 } });
      brush.selectAll();
      expect(brush.x).toEqual([0, 30]);
    });

    it('applies a custom constrain function (e.g. snapping)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const snap10 = (sel: { x: any[]; y: any[] }) => ({
        x: [Math.round(sel.x[0] / 10) * 10, Math.round(sel.x[1] / 10) * 10],
        y: sel.y,
      });
      const brush = new BrushState(ctx, { axis: 'x', constrain: snap10 });
      brush.setRange({ x: 12, y: 0 }, { x: 47, y: 0 });
      expect(brush.x).toEqual([10, 50]);
    });

    it('runs constrain after maxExtent', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const snap10 = (sel: { x: any[]; y: any[] }) => ({
        x: [Math.round(sel.x[0] / 10) * 10, Math.round(sel.x[1] / 10) * 10],
        y: sel.y,
      });
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 }, constrain: snap10 });
      brush.setRange({ x: 11, y: 0 }, { x: 88, y: 0 });
      // capped to [11, 41] by maxExtent, then snapped to [10, 40]
      expect(brush.x).toEqual([10, 40]);
    });

    it('clamps constrain output back into the domain by default (constrainToDomain)', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      // constrain pushes the end past the domain max
      const overshoot = (sel: { x: any[]; y: any[] }) => ({ x: [sel.x[0], 130], y: sel.y });
      const brush = new BrushState(ctx, { axis: 'x', constrain: overshoot });
      brush.setRange({ x: 20, y: 0 }, { x: 60, y: 0 });
      expect(brush.x).toEqual([20, 100]);
    });

    it('allows out-of-domain constrain output when constrainToDomain is false', () => {
      const ctx = createMockCtx({ xDomain: [0, 100] });
      const overshoot = (sel: { x: any[]; y: any[] }) => ({ x: [sel.x[0], 130], y: sel.y });
      const brush = new BrushState(ctx, {
        axis: 'x',
        constrain: overshoot,
        constrainToDomain: false,
      });
      brush.setRange({ x: 20, y: 0 }, { x: 60, y: 0 });
      expect(brush.x).toEqual([20, 130]);
    });

    it('measures maxExtent as a category count for band scales', () => {
      const brush = new BrushState(createBandCtx(), { axis: 'x', maxExtent: { x: 2 } });
      brush.setRange({ x: 'A', y: 0 }, { x: 'E', y: 0 });
      expect(brush.x).toEqual(['A', 'B']);
    });

    it('constrains a Date-domain time brush to a max window', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');
      const ctx = createMockCtx();
      ctx.baseXScale = { domain: () => [start, end] };
      const day = 24 * 60 * 60 * 1000;
      const brush = new BrushState(ctx, { axis: 'x', maxExtent: { x: 30 * day } });

      const origin = new Date('2024-06-01');
      brush.setRange({ x: origin, y: 0 }, { x: new Date('2024-10-01'), y: 0 });

      expect(brush.x[0]).toEqual(origin);
      expect((brush.x[1] as Date).getTime() - origin.getTime()).toBe(30 * day);
    });
  });
});

describe('expandBandBrushDomain', () => {
  const baseDomain = ['A', 'B', 'C', 'D', 'E'];

  it('should expand [first, last] to full category subarray', () => {
    expect(expandBandBrushDomain(['B', 'D'], baseDomain)).toEqual(['B', 'C', 'D']);
  });

  it('should return full domain for [first, last] matching full extent', () => {
    expect(expandBandBrushDomain(['A', 'E'], baseDomain)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('should return single category when first equals last', () => {
    expect(expandBandBrushDomain(['C', 'C'], baseDomain)).toEqual(['C']);
  });

  it('should pass through numeric domains unchanged', () => {
    expect(expandBandBrushDomain([10, 50], [0, 100])).toEqual([10, 50]);
  });

  it('should pass through null domains unchanged', () => {
    expect(expandBandBrushDomain([null, null], baseDomain)).toEqual([null, null]);
  });

  it('should pass through Date domains unchanged', () => {
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-06-01');
    expect(expandBandBrushDomain([d1, d2], [d1, d2])).toEqual([d1, d2]);
  });

  it('should return unchanged if category not found in domain', () => {
    expect(expandBandBrushDomain(['X', 'Y'], baseDomain)).toEqual(['X', 'Y']);
  });
});
