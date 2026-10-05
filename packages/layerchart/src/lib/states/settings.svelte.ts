import type { LayerContext } from '$lib/contexts/layer.js';
import type { IsometricOptions } from '$lib/utils/isometric.js';

export type SettingsOptions = {
  layer?: LayerContext;
  debug?: boolean;
  /** Draw every chart that doesn't set its own `isometric` as an isometric floor */
  isometric?: boolean | IsometricOptions;
};

/** Global settings context for charts */
export class Settings {
  layer: LayerContext;
  debug: boolean;
  isometric: boolean | IsometricOptions;

  constructor(options: SettingsOptions = {}) {
    this.layer = $state(options.layer ?? 'svg');
    this.debug = $state(options.debug ?? false);
    this.isometric = $state(options.isometric ?? false);
  }
}

export const defaultSettings = new Settings();
