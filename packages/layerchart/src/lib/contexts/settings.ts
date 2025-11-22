import { Context } from 'runed';
import { Settings, defaultSettings, type SettingsOptions } from '$lib/states/settings.svelte.js';

const _SettingsContext = new Context<Settings>('Settings');

/** Get the current settings context, or default if not set */
export function getSettings(): Settings {
  return _SettingsContext.getOr(defaultSettings);
}

export function setSettings(settings: SettingsOptions): Settings {
  return _SettingsContext.set(new Settings(settings));
}
