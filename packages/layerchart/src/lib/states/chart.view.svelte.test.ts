import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';

import { ChartState } from './chart.svelte.js';
import { Settings } from './settings.svelte.js';
import { isometric } from '$lib/views/isometric.js';
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
