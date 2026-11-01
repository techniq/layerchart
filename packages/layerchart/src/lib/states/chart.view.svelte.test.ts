import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';

import { ChartState } from './chart.svelte.js';
import { Settings } from './settings.svelte.js';
import { isometric } from '$lib/views/isometric.js';
import { orthographic, perspective } from '$lib/views/camera.js';
import { drawsFlatLayers } from '$lib/views/view.js';
import { applyMatrix, invertMatrix } from '$lib/utils/isometric.js';
import type { ChartPropsWithoutHTML } from '$lib/components/Chart/Chart.svelte';

function chartState(props: Partial<ChartPropsWithoutHTML<any>>, settings?: Settings) {
  let state: ChartState<any>;
  const cleanup = $effect.root(() => {
    state = new ChartState<any>(props as ChartPropsWithoutHTML<any>, settings);
  });
  flushSync();
  return { state: state!, cleanup };
}

describe('ChartState `view`', () => {
  it('is flat without one', () => {
    const { state, cleanup } = chartState({});
    expect(state.view).toBeNull();
    expect(state.isometric).toBeNull();
    cleanup();
  });

  it('takes a view function for its defaults, or called with options', () => {
    const plain = chartState({ view: isometric });
    expect(plain.state.view?.type).toBe('isometric');
    expect(plain.state.isometric).not.toBeNull();
    expect(plain.state.isometricAngles).toEqual({ rotate: -45, tilt: expect.closeTo(54.7356, 3) });
    plain.cleanup();

    const turned = chartState({ view: isometric({ rotate: 30, tilt: 60 }) });
    expect(turned.state.isometricAngles).toEqual({ rotate: 30, tilt: 60 });
    turned.cleanup();
  });

  it('falls back to the `view` setting, which `null` opts out of', () => {
    const settings = new Settings({ view: isometric });
    const inherited = chartState({}, settings);
    expect(inherited.state.view?.type).toBe('isometric');
    inherited.cleanup();

    const optedOut = chartState({ view: null }, settings);
    expect(optedOut.state.view).toBeNull();
    optedOut.cleanup();
  });

  it('takes a 3D view, with its own default angles and no isometric floor', () => {
    const plain = chartState({ view: perspective });
    expect(plain.state.view?.type).toBe('perspective');
    expect(plain.state.isometric).toBeNull();
    expect(plain.state.isometricFloor).toBeNull();
    expect(plain.state.viewAngles).toEqual({ rotate: -45, tilt: 60 });
    expect(plain.state.viewRotation).toEqual({ rotate: -45, tilt: 60 });
    plain.cleanup();

    const turned = chartState({ view: orthographic({ rotate: 10, tilt: 30 }) });
    expect(turned.state.viewAngles).toEqual({ rotate: 10, tilt: 30 });
    turned.cleanup();
  });

  it('turns an `isometric` view about what has been panned to the middle', () => {
    const { state, cleanup } = chartState({
      view: isometric,
      width: 400,
      height: 300,
      padding: 0,
    });
    const from = { x: -45, y: 50 };
    const to = { x: 10, y: 30 };
    // Unpanned, the middle of the floor stays in the middle
    const still = state.isometricPivot(from, to, { x: 0, y: 0 }, 1);
    expect(still.x).toBeCloseTo(0);
    expect(still.y).toBeCloseTo(0);
    // Turning there and back again comes back to the same pan
    const panned = { x: 60, y: -25 };
    const there = state.isometricPivot(from, to, panned, 2);
    expect(there).not.toEqual(panned);
    const back = state.isometricPivot(to, from, there, 2);
    expect(back.x).toBeCloseTo(panned.x);
    expect(back.y).toBeCloseTo(panned.y);
    cleanup();
  });

  it('keeps the same point of the floor in the middle as it turns', () => {
    const size = { width: 400, height: 300, padding: 0 };
    const before = chartState({ view: isometric({ rotate: -45, tilt: 50 }), ...size });
    const after = chartState({ view: isometric({ rotate: 10, tilt: 30 }), ...size });
    const scale = 2;
    const panned = { x: -150, y: 40 };
    const translate = before.state.isometricPivot(
      { x: -45, y: 50 },
      { x: 10, y: 30 },
      panned,
      scale
    );

    // The share of the floor across and down under the middle of the plot, in a view
    const middleOf = (state: ChartState<any>, t: { x: number; y: number }) => {
      const m = invertMatrix(state.isometricMatrix!)!;
      const p = applyMatrix(m, { x: (200 - t.x) / scale, y: (150 - t.y) / scale });
      return { x: p.x / state.plot.width, y: p.y / state.plot.height };
    };
    const a = middleOf(before.state, panned);
    const b = middleOf(after.state, translate);
    expect(b.x).toBeCloseTo(a.x, 4);
    expect(b.y).toBeCloseTo(a.y, 4);
    before.cleanup();
    after.cleanup();
  });

  it('lets flat layers draw under no view or `isometric`, not a 3D one', () => {
    expect(drawsFlatLayers(null)).toBe(true);
    expect(drawsFlatLayers(isometric())).toBe(true);
    expect(drawsFlatLayers(perspective())).toBe(false);
    expect(drawsFlatLayers(orthographic())).toBe(false);
  });

  describe('`motion`', () => {
    const motion = { type: 'tween' as const, duration: 100 };

    /** Change the props, then the angles as they are just after (before any easing) */
    function next(state: ChartState<any>, change: () => void) {
      change();
      flushSync();
      return { ...state.isometricAngles };
    }

    it('eases to new angles', async () => {
      const props = $state<Partial<ChartPropsWithoutHTML<any>>>({
        view: isometric({ rotate: 30, tilt: 60, motion }),
      });
      const { state, cleanup } = chartState(props);
      expect(state.isometricAngles).toEqual({ rotate: 30, tilt: 60 });

      const angles = next(state, () => (props.view = isometric({ rotate: 90, tilt: 60, motion })));
      expect(angles.rotate).toBeLessThan(90);
      await vi.waitFor(() => expect(state.isometricAngles).toEqual({ rotate: 90, tilt: 60 }));
      cleanup();
    });

    it('eases a view given after the chart was made, starting at its own angles', async () => {
      const props = $state<Partial<ChartPropsWithoutHTML<any>>>({ view: null });
      const { state, cleanup } = chartState(props);

      // Not from the default angles
      const start = next(state, () => (props.view = isometric({ rotate: 30, tilt: 60, motion })));
      expect(start).toEqual({ rotate: 30, tilt: 60 });

      const angles = next(state, () => (props.view = isometric({ rotate: 90, tilt: 60, motion })));
      expect(angles.rotate).toBeLessThan(90);
      await vi.waitFor(() => expect(state.isometricAngles).toEqual({ rotate: 90, tilt: 60 }));
      cleanup();
    });

    it('reads `motion` once, from the first view that has one', async () => {
      const props = $state<Partial<ChartPropsWithoutHTML<any>>>({
        view: isometric({ rotate: 30, tilt: 60 }),
      });
      const { state, cleanup } = chartState(props);

      // Starting where it's given, like a mark's `motion`
      const start = next(state, () => (props.view = isometric({ rotate: 90, tilt: 60, motion })));
      expect(start).toEqual({ rotate: 90, tilt: 60 });

      // Then easing, even once the view no longer gives it
      const angles = next(state, () => (props.view = isometric({ rotate: 0, tilt: 60 })));
      expect(angles.rotate).toBeGreaterThan(0);
      await vi.waitFor(() => expect(state.isometricAngles).toEqual({ rotate: 0, tilt: 60 }));
      cleanup();
    });

    it('starts a view that comes back at its own angles', async () => {
      const props = $state<Partial<ChartPropsWithoutHTML<any>>>({
        view: isometric({ rotate: 30, tilt: 60, motion }),
      });
      const { state, cleanup } = chartState(props);

      next(state, () => (props.view = null));
      const angles = next(state, () => (props.view = isometric({ rotate: 90, tilt: 30, motion })));
      expect(angles).toEqual({ rotate: 90, tilt: 30 });
      cleanup();
    });
  });
});
