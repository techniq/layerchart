import { createContext } from 'svelte';
import type { GeoState, GeoStateProps } from '$lib/states/geo.svelte.js';

/**
 * Access or set the current GeoContext.
 */
const [_getGeo, _setGeo, _hasGeo] = createContext<GeoState>();

export function getGeoContext() {
  return _hasGeo() ? _getGeo() : ({ projection: undefined } as GeoState);
}

export function setGeoContext(geo: GeoState) {
  return _setGeo(geo);
}
