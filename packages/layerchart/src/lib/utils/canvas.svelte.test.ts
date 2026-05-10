import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clearCanvasContext,
  scaleCanvas,
  getPixelColor,
  renderPathData,
  renderText,
  renderRect,
  renderCircle,
  renderEllipse,
  _createLinearGradient,
  createLinearGradient,
  _getComputedStyles,
  DEFAULT_FILL,
} from './canvas.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createCanvas(width = 200, height = 200) {
  const canvas = document.createElement('canvas');
  canvas.id = `test-canvas-${Math.random().toString(36).slice(2)}`;
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

/** Basic style options that avoid CSS-variable resolution path */
function plainFill(fill: string, opacity = '1') {
  return { styles: { fill, fillOpacity: opacity, opacity, stroke: 'none' } };
}

function plainStroke(stroke: string, strokeWidth = '1') {
  return {
    styles: {
      fill: 'none',
      stroke,
      strokeWidth,
      strokeOpacity: '1',
      opacity: '1',
    },
  };
}

// ---------------------------------------------------------------------------
// DEFAULT_FILL (deprecated export)
// ---------------------------------------------------------------------------

describe('DEFAULT_FILL', () => {
  it('is rgb(0, 0, 0)', () => {
    expect(DEFAULT_FILL).toBe('rgb(0, 0, 0)');
  });
});

// ---------------------------------------------------------------------------
// clearCanvasContext
// ---------------------------------------------------------------------------

describe('clearCanvasContext', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('clears with negative offsets matching the padding', () => {
    const clearRectSpy = vi.spyOn(ctx, 'clearRect');

    clearCanvasContext(ctx, {
      containerWidth: 400,
      containerHeight: 300,
      padding: { top: 10, bottom: 20, left: 30, right: 40 },
    });

    expect(clearRectSpy).toHaveBeenCalledWith(-30, -10, 400, 300);
  });

  it('clears with zero padding (no offset)', () => {
    const clearRectSpy = vi.spyOn(ctx, 'clearRect');

    clearCanvasContext(ctx, {
      containerWidth: 200,
      containerHeight: 200,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    // -0 padding produces -0 args (negation of 0), which is numerically equal to 0
    const call = clearRectSpy.mock.calls[0];
    expect(call[0]).toBe(-0);
    expect(call[1]).toBe(-0);
    expect(call[2]).toBe(200);
    expect(call[3]).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// scaleCanvas
// ---------------------------------------------------------------------------

describe('scaleCanvas', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('scales canvas dimensions by devicePixelRatio', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

    scaleCanvas(ctx, 100, 50);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
  });

  it('sets CSS style dimensions to logical pixels', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

    scaleCanvas(ctx, 100, 50);

    expect(canvas.style.width).toBe('100px');
    expect(canvas.style.height).toBe('50px');
  });

  it('returns scaled pixel dimensions', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true });

    const result = scaleCanvas(ctx, 100, 50);

    expect(result).toEqual({ width: 300, height: 150 });
  });

  it('falls back to ratio 1 when devicePixelRatio is not available', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 0, configurable: true });

    scaleCanvas(ctx, 100, 50);

    // ratio defaults to window.devicePixelRatio || 1  → when 0 → 1
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// getPixelColor
// ---------------------------------------------------------------------------

describe('getPixelColor', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
  });

  afterEach(() => {
    canvas.remove();
  });

  it('returns rgba values for a filled pixel', () => {
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(10, 10, 1, 1);

    const color = getPixelColor(ctx, 10, 10);

    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(255);
  });

  it('returns transparent pixel for empty canvas', () => {
    const color = getPixelColor(ctx, 5, 5);

    expect(color.a).toBe(0);
  });

  it('scales lookup coordinates by devicePixelRatio', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
    const getImageDataSpy = vi.spyOn(ctx, 'getImageData');

    getPixelColor(ctx, 10, 20);

    expect(getImageDataSpy).toHaveBeenCalledWith(20, 40, 1, 1);
  });
});

// ---------------------------------------------------------------------------
// renderPathData
// ---------------------------------------------------------------------------

describe('renderPathData', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
  });

  afterEach(() => {
    canvas.remove();
  });

  it('sets fillStyle and calls fill for a non-transparent fill', () => {
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', plainFill('red'));

    expect(ctx.fillStyle).toBe('#ff0000'); // browsers normalize 'red' → '#ff0000'
    expect(fillSpy).toHaveBeenCalled();
  });

  it('does not call fill when fill is "none"', () => {
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', { styles: { fill: 'none', stroke: 'none' } });

    expect(fillSpy).not.toHaveBeenCalled();
  });

  it('does not call fill when fill is "transparent"', () => {
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderPathData(ctx, 'M0,0 L10,0 Z', {
      styles: { fill: 'transparent', fillOpacity: '1', opacity: '1', stroke: 'none' },
    });

    expect(fillSpy).not.toHaveBeenCalled();
  });

  it('does not call fill when fill is rgba with alpha=0', () => {
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderPathData(ctx, 'M0,0 L10,0 Z', {
      styles: { fill: 'rgba(0, 0, 0, 0)', fillOpacity: '1', opacity: '1', stroke: 'none' },
    });

    expect(fillSpy).not.toHaveBeenCalled();
  });

  it('sets strokeStyle and calls stroke for a non-none stroke', () => {
    const strokeSpy = vi.spyOn(ctx, 'stroke');

    renderPathData(ctx, 'M0,0 L100,0', plainStroke('blue'));

    expect(ctx.strokeStyle).toBe('#0000ff');
    expect(strokeSpy).toHaveBeenCalled();
  });

  it('does not call stroke when stroke is "none"', () => {
    const strokeSpy = vi.spyOn(ctx, 'stroke');

    renderPathData(ctx, 'M0,0 L100,0', { styles: { fill: 'none', stroke: 'none' } });

    expect(strokeSpy).not.toHaveBeenCalled();
  });

  it('applies numeric strokeWidth', () => {
    renderPathData(ctx, 'M0,0 L100,0', {
      styles: { fill: 'none', stroke: 'black', strokeWidth: 3, strokeOpacity: '1', opacity: '1' },
    });

    expect(ctx.lineWidth).toBe(3);
  });

  it('applies string strokeWidth with px suffix', () => {
    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: '4px',
        strokeOpacity: '1',
        opacity: '1',
      },
    });

    expect(ctx.lineWidth).toBe(4);
  });

  it('defaults strokeWidth to 1 when not specified', () => {
    renderPathData(ctx, 'M0,0 L100,0', {
      styles: { fill: 'none', stroke: 'black', strokeOpacity: '1', opacity: '1' },
    });

    expect(ctx.lineWidth).toBe(1);
  });

  it('applies strokeDasharray with space separator', () => {
    const setLineDashSpy = vi.spyOn(ctx, 'setLineDash');

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'black',
        strokeDasharray: '6 4',
        strokeOpacity: '1',
        opacity: '1',
      },
    });

    expect(setLineDashSpy).toHaveBeenCalledWith([6, 4]);
  });

  it('applies strokeDasharray with comma separator', () => {
    const setLineDashSpy = vi.spyOn(ctx, 'setLineDash');

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'black',
        strokeDasharray: '2,2',
        strokeOpacity: '1',
        opacity: '1',
      },
    });

    expect(setLineDashSpy).toHaveBeenCalledWith([2, 2]);
  });

  it('does not apply strokeDasharray when value is "none"', () => {
    const setLineDashSpy = vi.spyOn(ctx, 'setLineDash');

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'black',
        strokeDasharray: 'none',
        strokeOpacity: '1',
        opacity: '1',
      },
    });

    expect(setLineDashSpy).not.toHaveBeenCalled();
  });

  it('applies opacity to globalAlpha for fill', () => {
    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', {
      styles: { fill: 'red', fillOpacity: '0.5', opacity: '1', stroke: 'none' },
    });

    // After the fill call, globalAlpha is restored to pre-call value
    // During the fill call it should have been 0.5 * 1 = 0.5
    // We verify indirectly by checking the canvas rendered at reduced opacity
    // The canvas context restores globalAlpha after fill, so checking current value is tricky.
    // Instead, verify the pixel alpha is reduced
    const color = getPixelColor(ctx, 50, 50);
    // fillOpacity 0.5 on red should result in semi-transparent red
    expect(color.a).toBeGreaterThan(0);
    expect(color.a).toBeLessThan(255);
  });

  it('applies strokeOpacity less than 1', () => {
    const globalAlphaValues: number[] = [];
    const originalStroke = ctx.stroke.bind(ctx);
    vi.spyOn(ctx, 'stroke').mockImplementation(function (this: CanvasRenderingContext2D) {
      globalAlphaValues.push(ctx.globalAlpha);
      originalStroke();
    });

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'black',
        strokeOpacity: '0.4',
        opacity: '1',
        strokeWidth: '2',
      },
    });

    // During stroke, globalAlpha should be 0.4 * 1 = 0.4
    expect(globalAlphaValues[0]).toBeCloseTo(0.4);
  });

  it('composes fill opacity with inherited globalAlpha (Group opacity)', () => {
    // Simulate a parent Group setting globalAlpha to 0.5
    ctx.globalAlpha = 0.5;

    const globalAlphaValues: number[] = [];
    const originalFill = ctx.fill.bind(ctx);
    vi.spyOn(ctx, 'fill').mockImplementation(function (
      this: CanvasRenderingContext2D,
      ...args: any
    ) {
      globalAlphaValues.push(ctx.globalAlpha);
      originalFill(...args);
    });

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', {
      styles: { fill: 'red', fillOpacity: '1', opacity: '1', stroke: 'none' },
    });

    // Should be 0.5 (inherited) * 1 * 1 = 0.5, not overwritten to 1
    expect(globalAlphaValues[0]).toBeCloseTo(0.5);
  });

  it('composes stroke opacity with inherited globalAlpha (Group opacity)', () => {
    ctx.globalAlpha = 0.5;

    const globalAlphaValues: number[] = [];
    const originalStroke = ctx.stroke.bind(ctx);
    vi.spyOn(ctx, 'stroke').mockImplementation(function (this: CanvasRenderingContext2D) {
      globalAlphaValues.push(ctx.globalAlpha);
      originalStroke();
    });

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'black',
        strokeOpacity: '0.4',
        opacity: '1',
        strokeWidth: '2',
      },
    });

    // Should be 0.5 (inherited) * 0.4 = 0.2
    expect(globalAlphaValues[0]).toBeCloseTo(0.2);
  });

  it('composes element opacity with inherited globalAlpha (Group opacity)', () => {
    ctx.globalAlpha = 0.5;

    const globalAlphaValues: number[] = [];
    const originalFill = ctx.fill.bind(ctx);
    vi.spyOn(ctx, 'fill').mockImplementation(function (
      this: CanvasRenderingContext2D,
      ...args: any
    ) {
      globalAlphaValues.push(ctx.globalAlpha);
      originalFill(...args);
    });

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', {
      styles: { fill: 'red', fillOpacity: '1', opacity: '0.6', stroke: 'none' },
    });

    // Should be 0.5 (inherited) * 0.6 (element opacity) * 1 (fillOpacity) = 0.3
    expect(globalAlphaValues[0]).toBeCloseTo(0.3);
  });

  it('restores globalAlpha after rendering with inherited alpha', () => {
    ctx.globalAlpha = 0.5;

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', plainFill('red'));

    // globalAlpha should be restored to inherited value after rendering
    expect(ctx.globalAlpha).toBeCloseTo(0.5);
  });

  it('respects paintOrder stroke (stroke before fill)', () => {
    const callOrder: string[] = [];
    vi.spyOn(ctx, 'fill').mockImplementation(() => {
      callOrder.push('fill');
    });
    vi.spyOn(ctx, 'stroke').mockImplementation(() => {
      callOrder.push('stroke');
    });

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', {
      styles: {
        fill: 'red',
        fillOpacity: '1',
        stroke: 'blue',
        strokeOpacity: '1',
        opacity: '1',
        paintOrder: 'stroke',
      },
    });

    expect(callOrder).toEqual(['stroke', 'fill']);
  });

  it('default paint order is fill then stroke', () => {
    const callOrder: string[] = [];
    vi.spyOn(ctx, 'fill').mockImplementation(() => {
      callOrder.push('fill');
    });
    vi.spyOn(ctx, 'stroke').mockImplementation(() => {
      callOrder.push('stroke');
    });

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', {
      styles: {
        fill: 'red',
        fillOpacity: '1',
        stroke: 'blue',
        strokeOpacity: '1',
        opacity: '1',
      },
    });

    expect(callOrder).toEqual(['fill', 'stroke']);
  });

  it('handles null/undefined pathData gracefully', () => {
    expect(() => renderPathData(ctx, null, plainFill('red'))).not.toThrow();
    expect(() => renderPathData(ctx, undefined, plainFill('red'))).not.toThrow();
  });

  it('merges inline style string with styles object', () => {
    const strokeSpy = vi.spyOn(ctx, 'stroke');

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: { fill: 'none', strokeOpacity: '1', opacity: '1' },
      style: 'stroke: green; stroke-width: 3px',
    });

    expect(strokeSpy).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('#008000');
    expect(ctx.lineWidth).toBe(3);
  });

  it('inline style provides stroke when styles.stroke is unset', () => {
    const strokeSpy = vi.spyOn(ctx, 'stroke');

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: { fill: 'none', strokeOpacity: '1', opacity: '1' },
      style: 'stroke: green',
    });

    expect(strokeSpy).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('#008000');
  });

  it('resolves currentColor stroke through the SVG helper', () => {
    const parent = canvas.parentElement!;
    const previousColor = parent.style.color;
    parent.style.color = 'rgb(255, 165, 0)';

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: {
        fill: 'none',
        stroke: 'currentColor',
        strokeOpacity: '1',
        opacity: '1',
        strokeWidth: '2',
      },
    });

    // Canvas normalizes rgb(255, 165, 0) → '#ffa500'
    expect(ctx.strokeStyle).toBe('#ffa500');

    parent.style.color = previousColor;
  });

  it('resolves currentColor fill through the SVG helper', () => {
    const parent = canvas.parentElement!;
    const previousColor = parent.style.color;
    parent.style.color = 'rgb(128, 0, 128)';

    renderPathData(ctx, 'M0,0 L100,0 L100,100 Z', {
      styles: { fill: 'currentColor', fillOpacity: '1', opacity: '1', stroke: 'none' },
    });

    expect(ctx.fillStyle).toBe('#800080');

    parent.style.color = previousColor;
  });
});

// ---------------------------------------------------------------------------
// renderText
// ---------------------------------------------------------------------------

describe('renderText', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('calls fillText with correct coordinates', () => {
    const fillTextSpy = vi.spyOn(ctx, 'fillText');

    renderText(ctx, 'Hello', { x: 10, y: 20 }, plainFill('black'));

    expect(fillTextSpy).toHaveBeenCalledWith('Hello', 10, 20);
  });

  it('converts number text to string', () => {
    const fillTextSpy = vi.spyOn(ctx, 'fillText');

    renderText(ctx, 42, { x: 5, y: 5 }, plainFill('black'));

    expect(fillTextSpy).toHaveBeenCalledWith('42', 5, 5);
  });

  it('does not call fillText for null text', () => {
    const fillTextSpy = vi.spyOn(ctx, 'fillText');

    renderText(ctx, null, { x: 10, y: 20 }, plainFill('black'));

    expect(fillTextSpy).not.toHaveBeenCalled();
  });

  it('does not call fillText for undefined text', () => {
    const fillTextSpy = vi.spyOn(ctx, 'fillText');

    renderText(ctx, undefined, { x: 10, y: 20 }, plainFill('black'));

    expect(fillTextSpy).not.toHaveBeenCalled();
  });

  it('sets textAlign to "center" for textAnchor="middle"', () => {
    renderText(
      ctx,
      'Text',
      { x: 0, y: 0 },
      { styles: { fill: 'black', fillOpacity: '1', opacity: '1', textAnchor: 'middle' } }
    );

    expect(ctx.textAlign).toBe('center');
  });

  it('sets textAlign to "right" for textAnchor="end"', () => {
    renderText(
      ctx,
      'Text',
      { x: 0, y: 0 },
      { styles: { fill: 'black', fillOpacity: '1', opacity: '1', textAnchor: 'end' } }
    );

    expect(ctx.textAlign).toBe('right');
  });

  it('sets textAlign to "left" for textAnchor="start"', () => {
    renderText(
      ctx,
      'Text',
      { x: 0, y: 0 },
      { styles: { fill: 'black', fillOpacity: '1', opacity: '1', textAnchor: 'start' } }
    );

    expect(ctx.textAlign).toBe('left');
  });

  it('sets textAlign from textAlign style when textAnchor is absent', () => {
    renderText(
      ctx,
      'Text',
      { x: 0, y: 0 },
      { styles: { fill: 'black', fillOpacity: '1', opacity: '1', textAlign: 'right' } }
    );

    expect(ctx.textAlign).toBe('right');
  });

  it('calls strokeText when stroke is provided', () => {
    const strokeTextSpy = vi.spyOn(ctx, 'strokeText');

    renderText(
      ctx,
      'Hi',
      { x: 0, y: 0 },
      {
        styles: {
          fill: 'none',
          stroke: 'red',
          strokeOpacity: '1',
          opacity: '1',
        },
      }
    );

    expect(strokeTextSpy).toHaveBeenCalledWith('Hi', 0, 0);
  });
});

// ---------------------------------------------------------------------------
// renderRect
// ---------------------------------------------------------------------------

describe('renderRect', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('calls fillRect for plain rect (no rounding)', () => {
    const fillRectSpy = vi.spyOn(ctx, 'fillRect');

    renderRect(ctx, { x: 10, y: 20, width: 50, height: 30 }, plainFill('red'));

    expect(fillRectSpy).toHaveBeenCalledWith(10, 20, 50, 30);
  });

  it('calls strokeRect for plain rect stroke', () => {
    const strokeRectSpy = vi.spyOn(ctx, 'strokeRect');

    renderRect(ctx, { x: 10, y: 20, width: 50, height: 30 }, plainStroke('blue'));

    expect(strokeRectSpy).toHaveBeenCalledWith(10, 20, 50, 30);
  });

  it('uses roundRect for rounded rect when available', () => {
    const roundRectSpy = vi.spyOn(ctx, 'roundRect');

    renderRect(ctx, { x: 0, y: 0, width: 100, height: 50, rx: 5 }, plainFill('red'));

    expect(roundRectSpy).toHaveBeenCalledWith(0, 0, 100, 50, [5, 5]);
  });

  it('defaults ry to rx when only rx is specified', () => {
    const roundRectSpy = vi.spyOn(ctx, 'roundRect');

    renderRect(ctx, { x: 0, y: 0, width: 100, height: 50, rx: 8 }, plainFill('red'));

    expect(roundRectSpy).toHaveBeenCalledWith(0, 0, 100, 50, [8, 8]);
  });

  it('falls back to path rendering when roundRect is unavailable', () => {
    // Temporarily remove roundRect from the context
    const originalRoundRect = ctx.roundRect;
    (ctx as any).roundRect = undefined;

    const fillSpy = vi.spyOn(ctx, 'fill');

    renderRect(ctx, { x: 10, y: 10, width: 80, height: 40, rx: 5 }, plainFill('green'));

    expect(fillSpy).toHaveBeenCalled();

    // Restore
    ctx.roundRect = originalRoundRect;
  });

  it('clamps rx to half of width', () => {
    // rx=100 on a 60-wide rect → should clamp to 30
    // With roundRect unavailable, we check path rendering was used
    const originalRoundRect = ctx.roundRect;
    (ctx as any).roundRect = undefined;

    const fillSpy = vi.spyOn(ctx, 'fill');

    // Should not throw even with large rx
    expect(() =>
      renderRect(ctx, { x: 0, y: 0, width: 60, height: 40, rx: 100 }, plainFill('red'))
    ).not.toThrow();
    expect(fillSpy).toHaveBeenCalled();

    ctx.roundRect = originalRoundRect;
  });
});

// ---------------------------------------------------------------------------
// renderCircle
// ---------------------------------------------------------------------------

describe('renderCircle', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('calls arc with correct params', () => {
    const arcSpy = vi.spyOn(ctx, 'arc');

    renderCircle(ctx, { cx: 50, cy: 60, r: 10 }, plainFill('red'));

    expect(arcSpy).toHaveBeenCalledWith(50, 60, 10, 0, 2 * Math.PI);
  });

  it('calls beginPath and closePath', () => {
    const beginSpy = vi.spyOn(ctx, 'beginPath');
    const closeSpy = vi.spyOn(ctx, 'closePath');

    renderCircle(ctx, { cx: 50, cy: 50, r: 10 }, plainFill('red'));

    expect(beginSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('calls fill for filled circle', () => {
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderCircle(ctx, { cx: 50, cy: 50, r: 10 }, plainFill('blue'));

    expect(fillSpy).toHaveBeenCalled();
  });

  it('calls stroke for stroked circle', () => {
    const strokeSpy = vi.spyOn(ctx, 'stroke');

    renderCircle(ctx, { cx: 50, cy: 50, r: 10 }, plainStroke('green'));

    expect(strokeSpy).toHaveBeenCalled();
  });

  it('renders a pixel at the circle center', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });

    renderCircle(ctx, { cx: 100, cy: 100, r: 30 }, plainFill('rgb(255, 0, 0)'));

    const color = getPixelColor(ctx, 100, 100);
    expect(color.r).toBe(255);
    expect(color.a).toBe(255);
  });
});

// ---------------------------------------------------------------------------
// renderEllipse
// ---------------------------------------------------------------------------

describe('renderEllipse', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('calls ellipse with correct params', () => {
    const ellipseSpy = vi.spyOn(ctx, 'ellipse');

    renderEllipse(ctx, { cx: 50, cy: 60, rx: 20, ry: 10 }, plainFill('red'));

    expect(ellipseSpy).toHaveBeenCalledWith(50, 60, 20, 10, 0, 0, 2 * Math.PI);
  });

  it('calls beginPath and closePath', () => {
    const beginSpy = vi.spyOn(ctx, 'beginPath');
    const closeSpy = vi.spyOn(ctx, 'closePath');

    renderEllipse(ctx, { cx: 50, cy: 50, rx: 20, ry: 10 }, plainFill('red'));

    expect(beginSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('calls fill for filled ellipse', () => {
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderEllipse(ctx, { cx: 50, cy: 50, rx: 20, ry: 10 }, plainFill('blue'));

    expect(fillSpy).toHaveBeenCalled();
  });

  it('calls stroke for stroked ellipse', () => {
    const strokeSpy = vi.spyOn(ctx, 'stroke');

    renderEllipse(ctx, { cx: 50, cy: 50, rx: 20, ry: 10 }, plainStroke('green'));

    expect(strokeSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// _createLinearGradient / createLinearGradient
// ---------------------------------------------------------------------------

describe('_createLinearGradient', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('returns a CanvasGradient', () => {
    const gradient = _createLinearGradient(ctx, 0, 0, 100, 0, [
      { offset: 0, color: 'red' },
      { offset: 1, color: 'blue' },
    ]);

    expect(gradient).toBeInstanceOf(CanvasGradient);
  });

  it('calls addColorStop for each provided stop', () => {
    const addColorStopSpy = vi.fn();
    const mockGradient = { addColorStop: addColorStopSpy };
    vi.spyOn(ctx, 'createLinearGradient').mockReturnValue(mockGradient as any);

    _createLinearGradient(ctx, 0, 0, 100, 0, [
      { offset: 0, color: 'red' },
      { offset: 0.5, color: 'green' },
      { offset: 1, color: 'blue' },
    ]);

    expect(addColorStopSpy).toHaveBeenCalledTimes(3);
    expect(addColorStopSpy).toHaveBeenNthCalledWith(1, 0, 'red');
    expect(addColorStopSpy).toHaveBeenNthCalledWith(2, 0.5, 'green');
    expect(addColorStopSpy).toHaveBeenNthCalledWith(3, 1, 'blue');
  });

  it('passes gradient coordinates to createLinearGradient', () => {
    const createGradientSpy = vi.spyOn(ctx, 'createLinearGradient');

    _createLinearGradient(ctx, 10, 20, 30, 40, []);

    expect(createGradientSpy).toHaveBeenCalledWith(10, 20, 30, 40);
  });
});

describe('createLinearGradient (memoized)', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('returns same instance for identical args (cache hit)', () => {
    const stops = [
      { offset: 0, color: 'red' },
      { offset: 1, color: 'blue' },
    ];

    const g1 = createLinearGradient(ctx, 0, 0, 100, 0, stops);
    const g2 = createLinearGradient(ctx, 0, 0, 100, 0, stops);

    expect(g1).toBe(g2);
  });

  it('returns different instances for different args', () => {
    const stops = [{ offset: 0, color: 'red' }];

    const g1 = createLinearGradient(ctx, 0, 0, 100, 0, stops);
    const g2 = createLinearGradient(ctx, 0, 0, 200, 0, stops);

    expect(g1).not.toBe(g2);
  });
});

// ---------------------------------------------------------------------------
// _getComputedStyles
// ---------------------------------------------------------------------------

describe('_getComputedStyles', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    ({ canvas } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
    // Remove any injected SVG element
    document.getElementById('__layerchart_canvas_styles_id')?.remove();
  });

  it('returns an object with the supported style keys', () => {
    const result = _getComputedStyles(canvas, {
      styles: { fill: 'red' },
    });

    expect(result).toHaveProperty('fill');
    expect(result).toHaveProperty('stroke');
    expect(result).toHaveProperty('opacity');
    expect(result).toHaveProperty('strokeWidth');
    expect(result).toHaveProperty('strokeDasharray');
    expect(result).toHaveProperty('fillOpacity');
    expect(result).toHaveProperty('strokeOpacity');
    expect(result).toHaveProperty('fontWeight');
    expect(result).toHaveProperty('fontSize');
    expect(result).toHaveProperty('fontFamily');
  });

  it('creates an SVG element in the DOM as a sibling of the canvas', () => {
    _getComputedStyles(canvas, { styles: { fill: 'red' } });

    const svg = document.getElementById('__layerchart_canvas_styles_id');
    expect(svg).not.toBeNull();
  });

  it('reuses the existing SVG element on subsequent calls', () => {
    _getComputedStyles(canvas, { styles: { fill: 'red' } });
    _getComputedStyles(canvas, { styles: { fill: 'blue' } });

    const svgs = document.querySelectorAll('#__layerchart_canvas_styles_id');
    expect(svgs.length).toBe(1);
  });

  it('resolves a plain fill color', () => {
    const result = _getComputedStyles(canvas, { styles: { fill: 'red' } });
    // 'red' resolves to 'rgb(255, 0, 0)' in the browser
    expect(result.fill).toMatch(/rgb\(255,\s*0,\s*0\)/);
  });

  it('resolves currentColor for fill via inherited color', () => {
    // Set color on the canvas's parent so the helper SVG (sibling of canvas) inherits it
    const parent = canvas.parentElement!;
    const previousColor = parent.style.color;
    parent.style.color = 'rgb(0, 128, 0)';

    const result = _getComputedStyles(canvas, { styles: { fill: 'currentColor' } });
    expect(result.fill).toMatch(/rgb\(0,\s*128,\s*0\)/);

    parent.style.color = previousColor;
  });

  it('resolves currentColor for stroke via inherited color', () => {
    const parent = canvas.parentElement!;
    const previousColor = parent.style.color;
    parent.style.color = 'rgb(0, 0, 255)';

    const result = _getComputedStyles(canvas, { styles: { stroke: 'currentColor' } });
    expect(result.stroke).toMatch(/rgb\(0,\s*0,\s*255\)/);

    parent.style.color = previousColor;
  });

  it('returns empty object when DOM throws (graceful error handling)', () => {
    // Simulate error by breaking canvas.after
    const originalAfter = canvas.after.bind(canvas);
    (canvas as any).after = () => {
      throw new Error('simulated DOM error');
    };

    // First, remove any cached SVG so we hit the creation path
    document.getElementById('__layerchart_canvas_styles_id')?.remove();

    const result = _getComputedStyles(canvas, { styles: { fill: 'red' } });
    expect(result).toEqual({});

    canvas.after = originalAfter;
  });
});

// ---------------------------------------------------------------------------
// parseStyleString (tested indirectly via renderPathData `style` option)
// ---------------------------------------------------------------------------

describe('parseStyleString (via renderPathData style option)', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ({ canvas, ctx } = createCanvas());
  });

  afterEach(() => {
    canvas.remove();
  });

  it('parses kebab-case properties to camelCase', () => {
    const setLineDashSpy = vi.spyOn(ctx, 'setLineDash');

    renderPathData(ctx, 'M0,0 L100,0', {
      styles: { fill: 'none', stroke: 'black', strokeOpacity: '1', opacity: '1' },
      style: 'stroke-dasharray: 5 3',
    });

    expect(setLineDashSpy).toHaveBeenCalledWith([5, 3]);
  });

  it('handles null style gracefully', () => {
    expect(() =>
      renderPathData(ctx, 'M0,0 L10,0', {
        styles: { fill: 'none', stroke: 'black', strokeOpacity: '1', opacity: '1' },
        style: null,
      })
    ).not.toThrow();
  });

  it('handles empty style string', () => {
    expect(() =>
      renderPathData(ctx, 'M0,0 L10,0', {
        styles: { fill: 'none', stroke: 'black', strokeOpacity: '1', opacity: '1' },
        style: '',
      })
    ).not.toThrow();
  });

  it('handles malformed declarations without colon', () => {
    expect(() =>
      renderPathData(ctx, 'M0,0 L10,0', {
        styles: { fill: 'none', stroke: 'black', strokeOpacity: '1', opacity: '1' },
        style: 'invalid-declaration',
      })
    ).not.toThrow();
  });
});
