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
  // sweep: 0 (inside), 1 (outside)
  const { cx, cy, r, sweep = 'outside' } = dimensions;
  return `
    M ${cx - r} ${cy}
    a ${r},${r} 0 1,${sweep} ${r * 2},0
    a ${r},${r} 0 1,${sweep} -${r * 2},0
  `;
}
