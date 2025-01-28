/** Generator to create a new color on each call */
export function* rgbColorGenerator(step = 500) {
  let nextColor = 1;

  while (nextColor < 16777216) {
    const rgb = [
      nextColor & 0xff, // red
      (nextColor & 0xff00) >> 8, // green
      (nextColor & 0xff0000) >> 16, // blue
    ];

    nextColor += step;
    yield `rgb(${rgb.join(',')})`;
  }

  return 'rgb(0,0,0)';
}
