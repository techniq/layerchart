import type { LayerContext } from '$lib/contexts/layer.js';
import type { ChartViewProp } from '$lib/views/view.js';

export type SettingsOptions = {
  layer?: LayerContext;
  debug?: boolean;
  /** The `view` of every chart that doesn't set its own (ex. `isometric`) */
  view?: ChartViewProp | null;
};

/** Global settings context for charts */
export class Settings {
  layer: LayerContext;
  debug: boolean;
  view: ChartViewProp | null;

  constructor(options: SettingsOptions = {}) {
    this.layer = $state(options.layer ?? 'svg');
    this.debug = $state(options.debug ?? false);
    // Raw: a view carries functions and components, which needn't be proxied
    this.view = $state.raw(options.view ?? null);
  }
}

export const defaultSettings = new Settings();
