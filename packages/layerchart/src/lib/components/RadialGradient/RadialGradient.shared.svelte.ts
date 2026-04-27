import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';

export type RadialGradientPropsWithoutHTML = {
  /** Unique id for radialGradient */
  id?: string;

  /**
   * Array of strings (colors), distributed equally from 0-100%.
   * If array of tuples, will use first value as the offset, and second as color.
   *
   * @default ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']
   */
  stops?: string[] | [string | number, string][];

  /** The x coordinate of the center of the gradient @default '50%' */
  cx?: string;

  /** The y coordinate of the center of the gradient @default '50%' */
  cy?: string;

  /** The x coordinate of the focal point of the gradient @default cx */
  fx?: string;

  /** The y coordinate of the focal point of the gradient @default cy */
  fy?: string;

  /** The radius of the gradient */
  r?: string;

  /**
   * Indicates how the gradient behaves if it starts or ends inside the bounds
   * of the shape containing the gradient
   *
   * @default 'pad'
   */
  spreadMethod?: 'pad' | 'reflect' | 'repeat';

  /** Transform attribute for the gradient */
  transform?: string | null;

  /**
   * Define the coordinate system for attributes (i.e. gradientUnits)
   *
   * @default 'objectBoundingBox'
   */
  units?: 'objectBoundingBox' | 'userSpaceOnUse';

  children?: Snippet<[{ id: string; gradient: string }]>;

  /** Render as a child of the gradient and will opt out of the default stops being rendered. */
  stopsContent?: Snippet;
};

export type RadialGradientProps = RadialGradientPropsWithoutHTML &
  Without<SVGAttributes<SVGRadialGradientElement>, RadialGradientPropsWithoutHTML>;
