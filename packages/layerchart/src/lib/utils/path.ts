/**
 * Convert easing into path data with number of points
 * see: https://svelte.dev/examples#easing
 */
export function getEasingPath(easing: (t: number) => number, count = 1000) {
  let pathData = `M0 ${count}`;
  for (let i = 1; i <= count; i++) {
    pathData += `
			L${(i / count) * count}
			${count - easing(i / count) * count}
		`;
  }

  return pathData;
}

/** Create circle using path data.  Useful for labels.  See also d3-shape's arc */
export function circlePath(dimensions: {
  cx: number;
  cy: number;
  r: number;
  sweep?: 'inside' | 'outside';
}) {
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#arcs
  const { cx, cy, r, sweep = 'outside' } = dimensions;
  // sweep: 0 (inside), 1 (outside)
  const _sweep = sweep === 'outside' ? 1 : 0;

  return `
    M ${cx - r} ${cy}
    a ${r},${r} 0 1,${_sweep} ${r * 2},0
    a ${r},${r} 0 1,${_sweep} -${r * 2},0
  `;
}

/** Create spike (triangle) using path data  */
export function spikePath({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const startPoint = { x: x - width / 2, y };
  const midPoint = { x, y: y - height };
  const endPoint = { x: x + width / 2, y };

  const pathData = `
    M ${startPoint.x},${startPoint.y}
    L ${midPoint.x},${midPoint.y}
    L ${endPoint.x},${endPoint.y}
  `;

  return pathData;
}

/** Create rounded polygon path
 *
 * @param coords - Array of points (x, y)
 * @param radius - Radius of the curve
 * @param close - Whether to close the path
 * @returns String of path data
 */
export function roundedPolygonPath(
  coords: { x: number; y: number }[],
  radius: number,
  close: boolean
) {
  // See: https://stackoverflow.com/questions/10177985/svg-rounded-corner

  let path = '';
  const length = coords.length + (close ? 1 : -1);
  for (let i = 0; i < length; i++) {
    const a = coords[i % coords.length];
    const b = coords[(i + 1) % coords.length];
    const t = Math.min(radius / Math.hypot(b.x - a.x, b.y - a.y), 0.5);

    if (i > 0) path += `Q${a.x},${a.y} ${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`;

    if (!close && i == 0) path += `M${a.x},${a.y}`;
    else if (i == 0) path += `M${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`;

    if (!close && i == length - 1) path += `L${b.x},${b.y}`;
    else if (i < length - 1) path += `L${a.x * t + b.x * (1 - t)},${a.y * t + b.y * (1 - t)}`;
  }
  if (close) path += 'Z';
  return path;
}

/** Flatten all `y` coordinates to `0` */
export function flattenPathData(pathData: string, yOverride = 0) {
  let result = pathData;

  // Match commands with y-coordinates, and replace `y` coordinate with `0` (or override such as `yScale(0)`)
  result = result.replace(/([MLTQCSAZ])(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (match, command, x, y) => {
    return `${command}${x},${yOverride}`;
  });

  // Replace all vertical line commands (ex. `v123`) with `0` height
  result = result.replace(/([v])(-?\d*\.?\d+)/g, (match, command, l) => {
    return `${command}${0}`;
  });

  // TODO: Flatten all elliptical arc commands (ex. `a4,4 0 0 1 4,4`) with `0` height
  // result = result.replace(
  //   /a(\d+),(\d+) (\d+) (\d+) (\d+) (\d+),(\d+)/g,
  //   (match, rx, ry, rot, large, sweep, x, y) => {
  //     return `a${rx},0 ${rot} ${large} ${sweep} ${x},0`;
  //   }
  // );

  return result;
}
