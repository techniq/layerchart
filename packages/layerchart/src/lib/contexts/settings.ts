import { createContext } from 'svelte';
import { Settings, defaultSettings, type SettingsOptions } from '$lib/states/settings.svelte.js';

const [_getSettings, _setSettings, _hasSettings] = createContext<Settings>();

/** Get the current settings context, or default if not set */
export function getSettings(): Settings {
  return _hasSettings() ? _getSettings() : defaultSettings;
}

export function setSettings(settings: SettingsOptions): Settings {
  return _setSettings(new Settings(settings));
}
