import { Spring, Tween } from 'svelte/motion';
import {
  extractTweenConfig,
  parseMotionProp,
  type MotionProp,
} from 'layerchart/utils/motion.svelte';

type State = Spring<number> | Tween<number>;

/**
 * Each row's numeric props eased to where they're asked to be, as core's marks drawn a row at a
 * time ease (ex. a `Bar` each): each prop by its own config (ex. `motion={{ y: { type: 'tween',
 * delay: 300 } }}`, or one for them all), and a new row from its `initial` values (ex. a bar
 * growing up from the baseline as it mounts).  `null` without `motion`, so marks without it cost
 * nothing more.
 */
export function createRowMotion<P extends string>(
  motion: MotionProp<P> | undefined,
  props: readonly P[]
) {
  if (motion === undefined) return null;
  const configs = new Map(props.map((prop) => [prop, parseMotionProp(motion, prop)]));
  if ([...configs.values()].every((config) => config.type === 'none')) return null;

  /** A prop's state, starting at `from` (none eases, and so is wherever it's set at once) */
  function create(prop: P, from: number): State {
    const config = configs.get(prop)!;
    return config.type === 'spring'
      ? new Spring(from, config.options)
      : new Tween(from, config.type === 'tween' ? config.options : { duration: 0 });
  }

  const rows = new Map<unknown, Map<P, State>>();
  /**
   * Bumped as rows come and go, so what reads them draws again: a row's first easing starts after
   * the mark has drawn it where it's asked to be
   */
  let version = $state(0);

  return {
    /** Ease `key`'s row to `values`, a new row from `initial` (where it has them) */
    update(key: unknown, values: Record<P, number>, initial?: Partial<Record<P, number>>) {
      let row = rows.get(key);
      const fresh = !row;
      if (!row) {
        rows.set(key, (row = new Map()));
        version++;
      }
      for (const prop of props) {
        const value = values[prop];
        let state = row.get(prop);
        if (!state) {
          const from = fresh ? (initial?.[prop] ?? value) : value;
          row.set(prop, (state = create(prop, Number.isFinite(from) ? from : value)));
        }
        if (state.target !== value) state.set(value);
      }
    },
    /** `key`'s row where it is now, or `null` before it's updated */
    get(key: unknown): Record<P, number> | null {
      void version;
      const row = rows.get(key);
      if (!row) return null;
      const now = {} as Record<P, number>;
      for (const [prop, state] of row) now[prop] = state.current;
      return now;
    },
    /** Forget the rows no longer drawn, so they ease in again should they return */
    cleanup(active: Set<unknown>) {
      for (const key of rows.keys()) {
        if (!active.has(key)) {
          rows.delete(key);
          version++;
        }
      }
    },
  };
}

/**
 * Each path's points (a flat array of numbers, ex. `[x, height, y, ...]`) tweened to where
 * they're asked to be, as core's paths tween (ex. a `Spline` with `motion="tween"`): a spring
 * leaves them unanimated, as core's, which can't spring a path.  A new path tweens from its
 * `initial` points (ex. flat on the baseline); one whose number of points changes is resampled
 * to the new count first.  `null` without a tween, so marks without one cost nothing more.
 */
export function createPathMotion(
  motion: MotionProp | undefined,
  /** How many numbers each point is (ex. `3` for `[x, height, y]`) */
  stride = 3
) {
  const tween = motion === undefined ? undefined : extractTweenConfig(motion);
  if (!tween) return null;

  const paths = new Map<unknown, Tween<number[]>>();
  /** Bumped as paths come and go, so what reads them draws again */
  let version = $state(0);

  return {
    /** Tween `key`'s path to `points`, a new one from `initial` */
    update(key: unknown, points: number[], initial?: number[]) {
      let path = paths.get(key);
      if (!path) {
        const from = initial?.length === points.length ? initial : points;
        paths.set(key, (path = new Tween(from, tween.options)));
        version++;
      } else if (path.current.length !== points.length) {
        path.set(resample(path.current, points.length, stride), { duration: 0 });
      }
      // The same points again (ex. the mark drawn again for its color) don't start it over
      if (!same(path.target, points)) path.set(points);
    },
    /** `key`'s points where they are now, or `null` before it's updated */
    get(key: unknown): number[] | null {
      void version;
      return paths.get(key)?.current ?? null;
    },
    /** Forget the paths no longer drawn, so they tween in again should they return */
    cleanup(active: Set<unknown>) {
      for (const key of paths.keys()) {
        if (!active.has(key)) {
          paths.delete(key);
          version++;
        }
      }
    },
  };
}

function same(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * `points` (a flat array, in steps of `stride` numbers) resampled to `length` numbers, evenly
 * along their order, so a path can tween to one with more or fewer points
 */
function resample(points: number[], length: number, stride = 3): number[] {
  const from = points.length / stride;
  const to = length / stride;
  if (from < 1 || !Number.isInteger(to)) return new Array(length).fill(0);
  const out: number[] = [];
  for (let i = 0; i < to; i++) {
    const at = to > 1 ? (i * (from - 1)) / (to - 1) : 0;
    const k = Math.min(Math.floor(at), from - 1);
    const t = at - k;
    for (let c = 0; c < stride; c++) {
      const a = points[k * stride + c];
      const b = k + 1 < from ? points[(k + 1) * stride + c] : a;
      out.push(a + (b - a) * t);
    }
  }
  return out;
}
