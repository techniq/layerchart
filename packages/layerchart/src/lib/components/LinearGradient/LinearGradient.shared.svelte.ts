import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';

export type LinearGradientPropsWithoutHTML = {
  /** Unique id for linearGradient */
  id?: string;

  /**
   * Array of strings (colors) distributed equally from 0-100%, or
   * `[offset, color]` tuples.
   *
   * @default `['var(--tw-gradient-from)', 'var(--tw-gradient-to)']`
   */
  stops?: string[] | [string | number, string][];

  /** Apply color stops top-to-bottom (true) or left-to-right (false). @default false */
  vertical?: boolean;

  /** @default '0%' */
  x1?: string;

  /** @default '0%' */
  y1?: string;

  /** @default vertical ? '0%' : '100%' */
  x2?: string;

  /** @default vertical ? '100%' : '0%' */
  y2?: string;

  /** Rotate the gradient by a given angle in degrees */
  rotate?: number;

  /**
   * Define the coordinate system for attributes (i.e. gradientUnits)
   *
   * @default 'objectBoundingBox'
   */
  units?: 'objectBoundingBox' | 'userSpaceOnUse';

  /**
   * A bindable reference to the underlying `<linearGradient>` element
   *
   * @bindable
   */
  ref?: SVGLinearGradientElement;

  /** Render as a child of the gradient and will opt out of the default stops being rendered. */
  stopsContent?: Snippet;

  children?: Snippet<[{ id: string; gradient: string }]>;
};

export type LinearGradientProps = LinearGradientPropsWithoutHTML &
  Without<SVGAttributes<SVGLinearGradientElement>, LinearGradientPropsWithoutHTML>;
