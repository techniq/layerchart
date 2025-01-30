/** Generator to create a new color on each call */
export function* rgbColorGenerator(step = 500) {
  let nextColor = 1;

  while (nextColor < 16777216) {
    const r = nextColor & 0xff;
    const g = (nextColor & 0xff00) >> 8;
    const b = (nextColor & 0xff0000) >> 16;

    nextColor += step;
    yield { r, g, b };
  }

  return { r: 0, g: 0, b: 0 };
}

export function getColorStr(color: { r: number; g: number; b: number }) {
  return `rgb(${color.r},${color.g},${color.b})`;
}
