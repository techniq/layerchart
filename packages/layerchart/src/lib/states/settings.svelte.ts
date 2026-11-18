import type { LayerContext } from '$lib/contexts/layer.js';
import type { ChartViewProp } from '$lib/views/view.js';
import type { ChartLazyProp } from '$lib/components/Chart/Chart.shared.svelte.js';

export type SettingsOptions = {
  layer?: LayerContext;
  debug?: boolean;
  /** The `view` of every chart that doesn't set its own (ex. `isometric`) */
  view?: ChartViewProp | null;
  /** The `lazy` of every chart that doesn't set its own (ex. `true` for a page of many charts) */
  lazy?: ChartLazyProp;
};

/** Global settings context for charts */
export class Settings {
  layer: LayerContext;
  debug: boolean;
  view: ChartViewProp | null;
  lazy: ChartLazyProp;

  constructor(options: SettingsOptions = {}) {
    this.layer = $state(options.layer ?? 'svg');
    this.debug = $state(options.debug ?? false);
    // Raw: a view carries functions and components, which needn't be proxied
    this.view = $state.raw(options.view ?? null);
    this.lazy = $state.raw(options.lazy ?? false);
  }
}

export const defaultSettings = new Settings();
