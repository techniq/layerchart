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

/**
 * @deprecated Use `vectorSpikePath` or the `Vector` component with `shape="spike"` instead.
 * Create spike (triangle) using path data
 */
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
  return transformVectorPath(vectorSpikePath({ length: height, anchor: 'start', width }), x, y, 0);
}

/** Create rounded polygon path
 *
 * @param coords - Array of points (x, y)
 * @param radius - Radius of the curve
 * @returns String of path data
 */
export function roundedPolygonPath(coords: { x: number; y: number }[], radius: number) {
  if (radius === 0) {
    // Simple polygon with straight lines
    return `M${coords[0].x},${coords[0].y}${coords
      .slice(1)
      .map((p) => `L${p.x},${p.y}`)
      .join('')}Z`;
  }

  let path = '';
  const length = coords.length + 1;
  for (let i = 0; i < length; i++) {
    const a = coords[i % coords.length];
    const b = coords[(i + 1) % coords.length];
    const t = Math.min(radius / Math.hypot(b.x - a.x, b.y - a.y), 0.5);

    if (i == 0) path += `M${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`;
    if (i > 0) path += `Q${a.x},${a.y} ${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`;
    if (i < length - 1) path += `L${a.x * t + b.x * (1 - t)},${a.y * t + b.y * (1 - t)}`;
  }
  path += 'Z';
  return path;
}

/** Vector anchor position */
export type VectorAnchor = 'start' | 'middle' | 'end';

/**
 * Create arrow vector path data (pointing up by default).
 * The path is centered on the anchor point at origin — use SVG `transform` to position and rotate.
 *
 * The arrow consists of a stem line with a V-shaped arrowhead at the tip.
 */
export function vectorArrowPath({
  length,
  anchor = 'middle',
  width = 5,
}: {
  length: number;
  anchor?: VectorAnchor;
  /** Total width of the arrowhead (wing tip to wing tip). */
  width?: number;
}) {
  const halfWidth = width / 2;

  // Compute y-offsets for base and tip relative to anchor point at origin
  let baseY: number, tipY: number;
  switch (anchor) {
    case 'start':
      baseY = 0;
      tipY = -length;
      break;
    case 'end':
      baseY = length;
      tipY = 0;
      break;
    case 'middle':
    default:
      baseY = length / 2;
      tipY = -length / 2;
      break;
  }

  // Stem from base to tip, then arrowhead wings at the tip
  return `M0,${baseY}L0,${tipY}M${-halfWidth},${tipY + width}L0,${tipY}L${halfWidth},${tipY + width}`;
}

/**
 * Create spike (filled triangle) vector path data (pointing up by default).
 * The path is centered on the anchor point at origin — use SVG `transform` to position and rotate.
 */
export function vectorSpikePath({
  length,
  anchor = 'start',
  width = 3,
}: {
  length: number;
  anchor?: VectorAnchor;
  width?: number;
}) {
  const halfWidth = width / 2;

  let baseY: number, tipY: number;
  switch (anchor) {
    case 'start':
      baseY = 0;
      tipY = -length;
      break;
    case 'end':
      baseY = length;
      tipY = 0;
      break;
    case 'middle':
    default:
      baseY = length / 2;
      tipY = -length / 2;
      break;
  }

  return `M${-halfWidth},${baseY}L0,${tipY}L${halfWidth},${baseY}`;
}

/**
 * Apply rotation (degrees) and translation to a path string containing only M and L commands
 * with absolute coordinates. Converts local vector path data to absolute positioned coordinates.
 */
export function transformVectorPath(
  pathData: string,
  cx: number,
  cy: number,
  rotateDeg: number
) {
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return pathData.replace(
    /([ML])(-?\d*\.?\d+),(-?\d*\.?\d+)/g,
    (_match, cmd, xStr, yStr) => {
      const lx = Number(xStr);
      const ly = Number(yStr);
      const ax = cx + lx * cos - ly * sin;
      const ay = cy + lx * sin + ly * cos;
      return `${cmd}${ax},${ay}`;
    }
  );
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
