/**
 * Return the point on Earth's surface that is diametrically opposite to another point
 * @see: https://en.wikipedia.org/wiki/Antipodes
 */
export function antipode([longitude, latitude]: [number, number]): [number, number] {
  return [longitude + 180, -latitude];
}
