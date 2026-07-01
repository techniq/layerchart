import type { ComponentProps, Snippet } from 'svelte';
import type { CurveFactory } from 'd3-shape';
import type Area from '../Area/Area.svelte';

export type ThresholdSnippetProps = {
  curve?: CurveFactory;
  defined?: ComponentProps<typeof Area>['defined'];
};

export type ThresholdProps = {
  /** The curve factory to use for the area. */
  curve?: CurveFactory;
  /** Function to determine if a point is defined. */
  defined?: ComponentProps<typeof Area>['defined'];
  /** Content to render above the threshold area. */
  above?: Snippet<[ThresholdSnippetProps]>;
  /** Content to render below the threshold area. */
  below?: Snippet<[ThresholdSnippetProps]>;
  children?: Snippet<[ThresholdSnippetProps]>;
};
