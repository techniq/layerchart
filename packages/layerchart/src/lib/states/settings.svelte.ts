import type { LayerContext } from '$lib/contexts/layer.js';

export type SettingsOptions = {
  layer?: LayerContext;
  debug?: boolean;
};

/** Global settings context for charts */
export class Settings {
  layer: LayerContext;
  debug: boolean;

  constructor(options: SettingsOptions = {}) {
    this.layer = $state(options.layer ?? 'svg');
    this.debug = $state(options.debug ?? false);
  }
}

export const defaultSettings = new Settings();
