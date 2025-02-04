/** Generator to create a new color on each call */
export function* rgbColorGenerator(step = 500) {
  let nextColor = 0;

  while (nextColor < 16777216) {
    const r = nextColor & 0xff;
    const g = (nextColor & 0xff00) >> 8;
    const b = (nextColor & 0xff0000) >> 16;

    nextColor += step;
    yield { r, g, b, a: 255 };
  }

  return { r: 0, g: 0, b: 0, a: 255 };
}

type RGBColor = { r: number; g: number; b: number; a?: number };

export function getColorStr(color: RGBColor) {
  if (color.a !== undefined) {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
  } else {
    return `rgb(${color.r},${color.g},${color.b})`;
  }
}
