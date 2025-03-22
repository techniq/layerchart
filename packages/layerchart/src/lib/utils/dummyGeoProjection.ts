import { geoProjection as d3GeoProjection, type GeoProjection } from 'd3-geo';

export function dummyGeoProjection(): GeoProjection {
  const projection = (lambda: number, phi: number): [number, number] => {
    const lon = (lambda * 180) / Math.PI;
    const lat = (phi * 180) / Math.PI;

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return [NaN, NaN];
    }

    return [lon, lat];
  };

  // Create the projection using d3.geoProjection
  const geoProjection = d3GeoProjection(projection);

  // @ts-expect-error
  geoProjection.scale = function () {
    return this;
  };

  // @ts-expect-error
  geoProjection.translate = function () {
    return this;
  };

  // @ts-expect-error
  geoProjection.precision = function () {
    return this;
  };

  return geoProjection;
}

export const defaultGeoProjection = dummyGeoProjection();
