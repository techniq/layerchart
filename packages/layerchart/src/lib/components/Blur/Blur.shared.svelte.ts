import type { Snippet } from 'svelte';

export type BlurPropsWithoutHTML = {
  /**
   * A unique id for the filter.
   */
  id?: string;

  /**
   * The standard deviation for the blur effect.
   *
   * @default 5
   */
  stdDeviation?: number;

  /**
   * The default children snippet which provides
   * the id for the filter.
   */
  children?: Snippet;
};

export type BlurProps = BlurPropsWithoutHTML;
