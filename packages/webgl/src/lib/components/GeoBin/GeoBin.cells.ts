import { getContext, setContext } from 'svelte';

/** One of a `GeoBin`'s paths (a cell, a column's side, its grid), with how it's painted */
export type BinPath = {
  readonly pathData: string | undefined;
  readonly z: number;
  readonly fill: string | undefined;
  readonly fillOpacity: number;
  readonly stroke: string | undefined;
  readonly strokeOpacity: number;
  readonly strokeWidth: number | undefined;
  readonly opacity: number;
  readonly class: string | undefined;
  readonly onclick: ((e: MouseEvent) => void) | undefined;
  readonly onpointerenter: ((e: PointerEvent) => void) | undefined;
  readonly onpointermove: ((e: PointerEvent) => void) | undefined;
  readonly onpointerleave: ((e: PointerEvent) => void) | undefined;
};

/** The paths a `GeoBin` draws, in order, and a count bumped (`bump`) as they come and go */
export type BinPaths = { list: BinPath[]; readonly version: number; bump: () => void };

const KEY = Symbol('LayerChartWebGLBinPaths');

export function setBinPaths(paths: BinPaths) {
  setContext(KEY, paths);
}

export function getBinPaths(): BinPaths {
  return getContext<BinPaths>(KEY);
}
