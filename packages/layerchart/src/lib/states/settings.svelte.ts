import type { LayerContext } from '$lib/contexts/layer.js';
import type { ChartViewProp } from '$lib/views/view.js';

/**
 * The layer a `Layer` with no `type` draws in.  `webgl` is drawn by `@layerchart/webgl`'s
 * `Layer`; LayerChart's draws it as `svg`.
 */
export type SettingsLayer = LayerContext | 'webgl';

export type SettingsOptions = {
  layer?: SettingsLayer;
  debug?: boolean;
  /** The `view` of every chart that doesn't set its own (ex. `isometric`) */
  view?: ChartViewProp | null;
};

/** Global settings context for charts */
export class Settings {
  layer: SettingsLayer;
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
