/** Generator to create a new color on each call */
export function* rgbColorGenerator(step = 200) {
  let nextColor = 0;

  while (nextColor < 1 << 21) {
    const r = nextColor & 0x7f;
    const g = (nextColor >> 7) & 0x7f;
    const b = (nextColor >> 14) & 0x7f;

    nextColor += step;
    yield { r: r * 2, g: g * 2, b: b * 2, a: 255 };
  }

  return { r: 0, g: 0, b: 0, a: 255 };
}

type RGBColor = { r: number; g: number; b: number; a?: number };

export function getColorStr(color: RGBColor) {
  const r = color.r & 0xfe;
  const g = color.g & 0xfe;
  const b = color.b & 0xfe;
  if (color.a !== undefined) {
    return `rgba(${r},${g},${b},${color.a})`;
  } else {
    return `rgb(${r},${g},${b})`;
  }
}
