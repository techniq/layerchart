import type { Accessor } from '$lib/utils/common.js';
import type { Component, ComponentProps } from 'svelte';
import type { AnnotationPoint, AnnotationLine, AnnotationRange } from '../index.js';

export type SeriesData<TData, TComponent extends Component> = {
  key: string;
  label?: string;
  value?: Accessor<TData>;
  /**
   * Maximum possible value. Useful when `data` is a single item
   */
  maxValue?: number;
  data?: TData[];
  color?: string;
  props?: Partial<ComponentProps<TComponent>>;
};

export type ChartAnnotations = Array<
  | ({
      /** Create AnnotationPoint */
      type: 'point';

      /** Apply `above` or `below` marks
       * @default 'above'
       */
      layer?: 'above' | 'below';

      /** Related to specific series (if applicable).  Will hide if set and series not highlighted */
      seriesKey?: string;
    } & ComponentProps<typeof AnnotationPoint>)
  | ({
      /** Create AnnotationLine */
      type: 'line';

      /** Apply `above` or `below` marks
       * @default 'above'
       */
      layer?: 'above' | 'below';

      /** Related to specific series (if applicable).  Will hide if set and series not highlighted */
      seriesKey?: string;
    } & ComponentProps<typeof AnnotationLine>)
  | ({
      /** Create AnnotationRange */
      type: 'range';

      /** Apply `above` or `below` marks
       * @default 'above'
       */
      layer?: 'above' | 'below';

      /** Related to specific series (if applicable).  Will hide if set and series not highlighted */
      seriesKey?: string;
    } & ComponentProps<typeof AnnotationRange>)
>;
