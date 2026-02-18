import { Context } from 'runed';
import { type GeoProjection } from 'd3-geo';

export type GeoContextValue = {
  projection: GeoProjection | undefined;
};

/**
 * Access or set the current GeoContext.
 */
const _GeoContext = new Context<GeoContextValue>('GeoContext');

export function getGeoContext() {
  return _GeoContext.getOr({ projection: undefined } as GeoContextValue);
}

export function setGeoContext(geo: GeoContextValue) {
  return _GeoContext.set(geo);
}
