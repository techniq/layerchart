import { describe, expect, it } from 'vitest';

import { fieldOrValueOf, isUrl, valueOf } from './values.js';

describe('valueOf', () => {
  const row = { tilt: 23.4, planet: { spin: 10 } };

  it('reads a value as is, a function of the row, or the field a string names', () => {
    expect(valueOf(5, row)).toBe(5);
    expect(valueOf((d: typeof row) => d.tilt * 2, row)).toBeCloseTo(46.8);
    expect(valueOf('tilt', row)).toBe(23.4);
    // A path, as LayerChart's accessors read one
    expect(valueOf('planet.spin', row)).toBe(10);
  });
});

describe('fieldOrValueOf', () => {
  it('reads the field a string names when the row has one, else takes a value-like string as is', () => {
    const row = { image: 'earth.jpg' };
    expect(fieldOrValueOf('image', row, isUrl)).toBe('earth.jpg');
    expect(fieldOrValueOf('mars.jpg', row, isUrl)).toBe('mars.jpg');
    expect(fieldOrValueOf('/planets/mars.jpg', row, isUrl)).toBe('/planets/mars.jpg');
    expect(fieldOrValueOf((d: typeof row) => d.image, row, isUrl)).toBe('earth.jpg');
    expect(fieldOrValueOf(null, row, isUrl)).toBe(null);
  });

  it('reads nothing for a field name a row lacks, rather than taking the name as a URL', () => {
    expect(fieldOrValueOf('image', { name: 'Pluto' }, isUrl)).toBeUndefined();
    expect(fieldOrValueOf('planet.image', { name: 'Pluto' }, isUrl)).toBeUndefined();
  });
});
