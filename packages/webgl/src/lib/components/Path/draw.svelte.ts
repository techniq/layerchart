import { untrack } from 'svelte';
import { cubicInOut, linear } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import type { PathProps } from './Path.shared.svelte.js';

/** A path's `draw`, as the core `Path` takes it */
export type DrawOption = PathProps['draw'];

/**
 * Drawing paths from their starts, as the core `Path`'s `draw` (an SVG `draw` transition): again
 * whenever the lengths read in `lengths` change (ex. new path data).  Each path takes as long as
 * `draw` gives one of its length (`duration`, or its length over `speed`), so the paths of one
 * mark keep their own pace, as each SVG path's transition does.  Call during component setup, and
 * only with a `draw`.
 */
export function createDraw(draw: () => DrawOption, lengths: () => number[]) {
  const options = () => {
    const value = draw();
    return typeof value === 'object' ? value : {};
  };
  /** How long a path of `length` pixels takes, as the SVG `draw` transition works it out */
  const durationOf = (length: number) => {
    const { duration, speed } = options();
    if (typeof duration === 'function') return duration(length);
    return duration ?? (speed ? length / speed : 800);
  };

  /** Milliseconds since it started, up to the longest path's duration */
  const elapsed = new Tween(0, { easing: linear });
  let end = $state(0);

  $effect(() => {
    const all = lengths();
    untrack(() => {
      const longest = all.reduce((max, length) => Math.max(max, durationOf(length)), 0);
      end = longest;
      elapsed.set(0, { duration: 0 });
      elapsed.set(longest, { duration: longest, delay: options().delay ?? 0 });
    });
  });

  return {
    /** Whether every path is drawn */
    get done() {
      return elapsed.current >= end;
    },
    /** How much of a path of `length` pixels is drawn so far (0 to 1) */
    progress(length: number) {
      if (elapsed.current >= end) return 1;
      const duration = durationOf(length);
      if (!(duration > 0)) return 1;
      return (options().easing ?? cubicInOut)(Math.min(1, elapsed.current / duration));
    },
  };
}

/** A line's length, its points `[x, height, y]` each in a flat array, in pixels */
export function lengthOf(points: ArrayLike<number>) {
  let length = 0;
  for (let i = 3; i + 2 < points.length; i += 3) {
    length += Math.hypot(
      points[i] - points[i - 3],
      points[i + 1] - points[i - 2],
      points[i + 2] - points[i - 1]
    );
  }
  return length;
}

/**
 * A line's first `length` pixels (points `[x, height, y]` each): its points up to there, and one
 * part way to the next.  Its `i`th point is the line's own, but the last, which heads to it.
 */
export function truncate(points: ArrayLike<number>, length: number): number[] {
  const out: number[] = [];
  if (points.length < 3) return out;
  out.push(points[0], points[1], points[2]);
  let left = length;
  for (let i = 3; i + 2 < points.length && left > 0; i += 3) {
    const [ax, ah, ay] = [points[i - 3], points[i - 2], points[i - 1]];
    const [bx, bh, by] = [points[i], points[i + 1], points[i + 2]];
    const step = Math.hypot(bx - ax, bh - ah, by - ay);
    if (step <= left) out.push(bx, bh, by);
    else {
      const t = left / step;
      out.push(ax + (bx - ax) * t, ah + (bh - ah) * t, ay + (by - ay) * t);
    }
    left -= step;
  }
  return out;
}

/**
 * Each of a path's subpaths as far as `draw` has drawn it (`progress` of their total length): from
 * its own start, as SVG dashes each subpath
 */
export function drawnSubpaths(subpaths: number[][], progress: number): number[][] {
  if (progress >= 1) return subpaths;
  const length = progress * subpaths.reduce((sum, s) => sum + lengthOf(s), 0);
  return subpaths.map((s) => truncate(s, length));
}

/**
 * Where a path's `startContent` / `endContent` go, as the core `Path` places them: its first
 * point, and the point `progress` of the way along it (its last, once drawn), `[x, height, y]`
 */
export function pathEnds(
  subpaths: ArrayLike<number>[],
  progress = 1
): { start: number[]; end: number[] } | null {
  const first = subpaths.find((s) => s.length >= 3);
  if (!first) return null;
  const start = [first[0], first[1], first[2]];
  let rest =
    progress >= 1 ? Infinity : progress * subpaths.reduce((sum, s) => sum + lengthOf(s), 0);
  let end = start;
  for (const s of subpaths) {
    if (s.length < 3) continue;
    const length = lengthOf(s);
    const reached = rest < length ? truncate(s, rest) : s;
    end = [reached[reached.length - 3], reached[reached.length - 2], reached[reached.length - 1]];
    if (rest < length) break;
    rest -= length;
  }
  return { start, end };
}
