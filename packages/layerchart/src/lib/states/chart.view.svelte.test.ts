import { describe, expect, it } from 'vitest';
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
});
