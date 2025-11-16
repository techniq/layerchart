import { Context } from 'runed';
import type { GeoState } from '$lib/states/geo.svelte.js';

export type { GeoState };

/**
 * Access or set the current GeoContext.
 */
const _GeoContext = new Context<GeoState>('GeoContext');

export function getGeoContext() {
  return _GeoContext.getOr({ projection: undefined } as GeoState);
}

export function setGeoContext(geo: GeoState) {
  return _GeoContext.set(geo);
}
