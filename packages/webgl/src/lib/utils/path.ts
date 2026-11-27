/** One subpath of SVG path data as points: from a move to the next (or its close) */
export type Subpath = { points: [number, number][]; closed: boolean };

/**
 * SVG path data (ex. a `Path`'s `pathData`, or a core link's) as its subpaths' points: lines as
 * they are, and curves and arcs in pieces (`steps` per curve, more around a wide arc).  Every
 * command, absolute or relative.  No DOM, so it works on the server and in workers too.
 */
export function parsePath(d: string, steps = 16): Subpath[] {
  const subpaths: Subpath[] = [];
  let current: Subpath | null = null;
  let x = 0;
  let y = 0;
  /** Where the subpath started, to return to on a close */
  let startX = 0;
  let startY = 0;
  /** The last curve's second control point, for a smooth curve's reflection */
  let control: [number, number] | null = null;
  let quadratic: [number, number] | null = null;

  const scanner = new Scanner(d);
  let command = '';
  const add = (px: number, py: number) => {
    if (!current) {
      current = { points: [[x, y]], closed: false };
      subpaths.push(current);
    }
    current.points.push([px, py]);
    x = px;
    y = py;
  };

  while (scanner.more()) {
    const next = scanner.command();
    if (next) command = next;
    else if (!command) break;
    const relative = command === command.toLowerCase();
    const ox = relative ? x : 0;
    const oy = relative ? y : 0;
    const upper = command.toUpperCase();
    let smoothCubic: [number, number] | null = null;
    let smoothQuadratic: [number, number] | null = null;

    switch (upper) {
      case 'M': {
        x = ox + scanner.number();
        y = oy + scanner.number();
        startX = x;
        startY = y;
        current = { points: [[x, y]], closed: false };
        subpaths.push(current);
        // Pairs after a move are lines
        command = relative ? 'l' : 'L';
        break;
      }
      case 'L':
        add(ox + scanner.number(), oy + scanner.number());
        break;
      case 'H':
        add(ox + scanner.number(), y);
        break;
      case 'V':
        add(x, oy + scanner.number());
        break;
      case 'C':
      case 'S': {
        const [x1, y1]: [number, number] =
          upper === 'C'
            ? [ox + scanner.number(), oy + scanner.number()]
            : control
              ? [2 * x - control[0], 2 * y - control[1]]
              : [x, y];
        const x2 = ox + scanner.number();
        const y2 = oy + scanner.number();
        const x3 = ox + scanner.number();
        const y3 = oy + scanner.number();
        const [x0, y0] = [x, y];
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const u = 1 - t;
          add(
            u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
            u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3
          );
        }
        smoothCubic = [x2, y2];
        break;
      }
      case 'Q':
      case 'T': {
        let x1: number = x;
        let y1: number = y;
        if (upper === 'Q') {
          x1 = ox + scanner.number();
          y1 = oy + scanner.number();
        } else if (quadratic) {
          x1 = 2 * x - quadratic[0];
          y1 = 2 * y - quadratic[1];
        }
        const x2 = ox + scanner.number();
        const y2 = oy + scanner.number();
        const [x0, y0] = [x, y];
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const u = 1 - t;
          add(u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2);
        }
        smoothQuadratic = [x1, y1];
        break;
      }
      case 'A': {
        const rx = scanner.number();
        const ry = scanner.number();
        const rotation = scanner.number();
        const large = scanner.flag();
        const sweep = scanner.flag();
        const ex = ox + scanner.number();
        const ey = oy + scanner.number();
        for (const [px, py] of arcPoints(x, y, rx, ry, rotation, large, sweep, ex, ey, steps)) {
          add(px, py);
        }
        break;
      }
      case 'Z': {
        if (current) {
          current.closed = true;
          const [fx, fy] = current.points[0];
          const [lx, ly] = current.points[current.points.length - 1];
          // Its end back on its start, to draw the closing side
          if (fx !== lx || fy !== ly) current.points.push([fx, fy]);
        }
        x = startX;
        y = startY;
        current = null;
        // A close takes no numbers: the next command is its own
        command = '';
        break;
      }
      default:
        return subpaths;
    }
    control = smoothCubic;
    quadratic = smoothQuadratic;
    if (scanner.failed) break;
  }
  return subpaths.filter((subpath) => subpath.points.length >= 2);
}

/**
 * The points along SVG path data, for drawing it as a polyline: every subpath's, one after
 * another (ex. a core link's path, which is one)
 */
export function flattenPath(d: string, steps = 16): [number, number][] {
  return parsePath(d, steps).flatMap((subpath) => subpath.points);
}

/** Reads path data's commands and numbers in turn, however they're separated */
class Scanner {
  #d: string;
  #at = 0;
  failed = false;

  constructor(d: string) {
    this.#d = d;
  }

  #skip() {
    while (this.#at < this.#d.length && /[\s,]/.test(this.#d[this.#at])) this.#at++;
  }

  more() {
    this.#skip();
    return !this.failed && this.#at < this.#d.length;
  }

  /** The next command letter, or `''` when numbers come next (the last command again) */
  command() {
    this.#skip();
    const c = this.#d[this.#at];
    if (c && /[a-z]/i.test(c) && c !== 'e' && c !== 'E') {
      this.#at++;
      return c;
    }
    return '';
  }

  number() {
    this.#skip();
    const match = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(this.#d.slice(this.#at));
    if (!match) {
      this.failed = true;
      return 0;
    }
    this.#at += match[0].length;
    return Number(match[0]);
  }

  /** An arc's flag: one digit, which may run into what follows (ex. `a1 1 0 00 1 1`) */
  flag() {
    this.#skip();
    const c = this.#d[this.#at];
    if (c !== '0' && c !== '1') {
      this.failed = true;
      return false;
    }
    this.#at++;
    return c === '1';
  }
}

/**
 * Points along an SVG elliptical arc from `(x0, y0)` to `(x, y)`, after its start: its center
 * found as the SVG spec does, then pieces of no more than a sixteenth of a turn
 */
function arcPoints(
  x0: number,
  y0: number,
  rxIn: number,
  ryIn: number,
  degrees: number,
  large: boolean,
  sweep: boolean,
  x: number,
  y: number,
  steps: number
): [number, number][] {
  if (x0 === x && y0 === y) return [];
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  // No radius: a straight line
  if (!rx || !ry) return [[x, y]];
  const phi = (degrees * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x0 - x) / 2;
  const dy = (y0 - y) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  // Radii too small to reach are scaled up until they do
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));
  const cx1 = (k * rx * y1) / ry;
  const cy1 = (-k * ry * x1) / rx;
  const cx = cos * cx1 - sin * cy1 + (x0 + x) / 2;
  const cy = sin * cx1 + cos * cy1 + (y0 + y) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const theta = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
  let delta = angle((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  else if (sweep && delta < 0) delta += 2 * Math.PI;
  const count = Math.max(2, Math.ceil((Math.abs(delta) / (Math.PI * 2)) * steps * 4));
  const points: [number, number][] = [];
  for (let i = 1; i <= count; i++) {
    const t = theta + (delta * i) / count;
    const px = rx * Math.cos(t);
    const py = ry * Math.sin(t);
    points.push(i === count ? [x, y] : [cos * px - sin * py + cx, sin * px + cos * py + cy]);
  }
  return points;
}

/**
 * The point `offset` along SVG path data (a length in pixels, or a percentage of its length, as
 * an SVG `textPath`'s `startOffset`), and the direction it runs there in degrees (clockwise, as
 * SVG's `rotate`), or `null` for an empty path
 */
export function pointAlong(
  d: string,
  offset: string | number = 0
): { x: number; y: number; angle: number } | null {
  const points = flattenPath(d);
  if (points.length < 2) return null;
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[lengths.length - 1];
  const target =
    typeof offset === 'string' && offset.trim().endsWith('%')
      ? (parseFloat(offset) / 100) * total
      : Number(offset) || 0;
  const at = Math.min(Math.max(target, 0), total);
  let i = 1;
  while (i < points.length - 1 && lengths[i] < at) i++;
  const [ax, ay] = points[i - 1];
  const [bx, by] = points[i];
  const span = lengths[i] - lengths[i - 1];
  const t = span > 0 ? (at - lengths[i - 1]) / span : 0;
  return {
    x: ax + (bx - ax) * t,
    y: ay + (by - ay) * t,
    angle: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI,
  };
}
