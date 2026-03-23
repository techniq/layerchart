import { describe, it, expect } from 'vitest';
import { BrushState } from './brush.svelte.js';
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

      brush.moveRange(
        { x: [20, 40], y: [20, 40], value: { x: 30, y: 30 } },
        { x: 40, y: 50 }
      );

      // Delta: x=+10, y=+20
      expect(brush.x).toEqual([30, 50]);
      expect(brush.y).toEqual([40, 60]);
    });

    it('should clamp movement to domain bounds', () => {
      const ctx = createMockCtx({ xDomain: [0, 100], yDomain: [0, 100] });
      const brush = new BrushState(ctx);

      brush.moveRange(
        { x: [80, 100], y: [80, 100], value: { x: 90, y: 90 } },
        { x: 110, y: 110 }
      );

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
      brush.syncFromExternal(
        [new Date('2024-01-01'), new Date('2024-12-31')],
        null
      );

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
});
