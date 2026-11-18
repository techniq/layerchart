/*
 * Buckminster Fuller’s spherical triangle transformation procedure
 *
 * Based on Robert W. Gray’s formulae published in “Exact Transformation Equations
 * For Fuller's World Map,” _Cartographica_, 32(3): 17-25 (1995).
 *
 * Implemented for D3.js by Philippe Rivière, 2018 (https://visionscarto.net/), as
 * `geoGrayFullerRaw` in d3-geo-polygon.
 *
 * To the extent possible under law, Philippe Rivière has waived all copyright
 * and related or neighboring rights to this implementation. (Public Domain.)
 */
import { geoGnomonicRaw, type GeoRawProjection } from 'd3-geo';

const epsilon = 1e-6;

// `geoGnomonicRaw` is the raw projection itself, though `@types/d3-geo` types it as a factory
const gnomonicRaw = geoGnomonicRaw as unknown as GeoRawProjection;

/** Maps one spherical icosahedron face onto a flat triangle with equal areas */
export function geoGrayFullerRaw(): GeoRawProjection {
  const SQRT_3 = Math.sqrt(3);

  // Gray’s constants
  const Z = Math.sqrt(5 + 2 * Math.sqrt(5)) / Math.sqrt(15);
  const el = Math.sqrt(8) / Math.sqrt(5 + Math.sqrt(5));
  const dve = Math.sqrt(3 + Math.sqrt(5)) / Math.sqrt(5 + Math.sqrt(5));

  const grayFuller: GeoRawProjection = (lambda, phi) => {
    const cosPhi = Math.cos(phi);
    const s = Z / (cosPhi * Math.cos(lambda));
    const x = cosPhi * Math.sin(lambda) * s;
    const y = Math.sin(phi) * s;
    const a1p = Math.atan2((2 * y) / SQRT_3 + el / 3 - el / 2, dve);
    const a2p = Math.atan2(x - y / SQRT_3 + el / 3 - el / 2, dve);
    const a3p = Math.atan2(el / 3 - x - y / SQRT_3 - el / 2, dve);

    return [SQRT_3 * (a2p - a3p), 2 * a1p - a2p - a3p];
  };

  // Inverse approximation
  grayFuller.invert = (x, y) => {
    // A point outside the triangle returns something meaningless, but far enough away
    if (x * x + y * y > 5) return [0, 3];

    const R = 2.9309936378128416;
    const p = gnomonicRaw.invert!(x / R, y / R);

    let j = 0;
    let dx: number;
    let dy: number;
    do {
      const f = grayFuller(p[0], p[1]);
      dx = x - f[0];
      dy = y - f[1];
      p[0] += 0.2 * dx;
      p[1] += 0.2 * dy;
    } while (j++ < 30 && Math.abs(dx) + Math.abs(dy) > epsilon);

    return p;
  };

  return grayFuller;
}
