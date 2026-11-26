/**
 * The points along SVG path data (absolute `M`, `L`, `C`, and `A` commands, as the core link
 * paths are made of), for drawing it as a polyline: lines as they are, curves in `steps`
 * pieces.  Arcs are measured by the browser, so only drawn there.
 */
export function flattenPath(d: string, steps = 16): [number, number][] {
  if (/A/.test(d)) return measured(d, steps);
  const points: [number, number][] = [];
  let at: [number, number] = [0, 0];
  for (const [, command, args] of d.matchAll(/([MLC])([^MLC]*)/g)) {
    const n = (args.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    if (command === 'M' || command === 'L') {
      for (let i = 0; i + 1 < n.length; i += 2) {
        at = [n[i], n[i + 1]];
        points.push(at);
      }
    } else {
      for (let i = 0; i + 5 < n.length; i += 6) {
        const [x0, y0] = at;
        const [x1, y1, x2, y2, x3, y3] = n.slice(i, i + 6);
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const u = 1 - t;
          points.push([
            u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
            u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
          ]);
        }
        at = [x3, y3];
      }
    }
  }
  return points;
}

let probe: SVGPathElement | null = null;

/** Points along path data, measured by an SVG path element (for its arcs) */
function measured(d: string, steps: number): [number, number][] {
  if (typeof document === 'undefined') return [];
  probe ??= document.createElementNS('http://www.w3.org/2000/svg', 'path');
  probe.setAttribute('d', d);
  const length = probe.getTotalLength();
  const count = Math.max(2, steps * 2);
  return Array.from({ length: count + 1 }, (_, i) => {
    const p = probe!.getPointAtLength((length * i) / count);
    return [p.x, p.y] as [number, number];
  });
}
